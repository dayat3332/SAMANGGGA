import { pool, withTx } from "../config/db.tsx";
import { buildUpdate, optionalOneOf, optionalText, requireOneOf, requireText } from "../utils/parse.tsx";
import { assertRole, ensureKonsumen, logAktivitas } from "./akunService.tsx";
import { pesananService } from "./pesananService.tsx";
import { keuanganService } from "./keuanganService.tsx";

const PERAN = "Konsumen";
const KATEGORI = ["Ritel", "Grosir", "Individu"] as const;

async function guard(id_user: number) {
  await assertRole(pool, id_user, PERAN);
  await ensureKonsumen(pool, id_user);
}

export const konsumenService = {
  async getProfile(id_user: number) {
    await guard(id_user);
    const { rows } = await pool.query(
      `SELECT p.id_user, p.nama_lengkap, p.email, p.peran, p.status_verifikasi, p.tgl_daftar,
              p.alamat, p.no_telp AS no_telp_user,
              k.id_konsumen, k.kategori_konsumen, k.no_telp, k.alamat_pengiriman_utama, k.titik_koordinat
         FROM pengguna p
         JOIN konsumen k ON k.id_user = p.id_user
        WHERE p.id_user = $1`,
      [id_user],
    );
    return rows[0];
  },

  async updateProfile(id_user: number, body: any) {
    await guard(id_user);
    await withTx(async (client) => {
      const penggunaData: Record<string, unknown> = {};
      if (body?.nama_lengkap !== undefined) penggunaData.nama_lengkap = requireText(body.nama_lengkap, "Nama lengkap", 3);
      if (body?.alamat !== undefined) penggunaData.alamat = optionalText(body.alamat);
      const noTelp = body?.no_telp !== undefined ? optionalText(body.no_telp) : undefined;
      if (noTelp !== undefined) penggunaData.no_telp = noTelp;
      const penggunaUpd = buildUpdate("pengguna", "id_user", id_user, penggunaData, ["nama_lengkap", "alamat", "no_telp"]);
      if (penggunaUpd) await client.query(penggunaUpd.sql, penggunaUpd.params);

      const konsumenData: Record<string, unknown> = {};
      const kategori = optionalOneOf(body?.kategori_konsumen, KATEGORI, "Kategori konsumen");
      if (kategori !== undefined) konsumenData.kategori_konsumen = kategori;
      if (body?.alamat_pengiriman_utama !== undefined) konsumenData.alamat_pengiriman_utama = optionalText(body.alamat_pengiriman_utama);
      if (body?.titik_koordinat !== undefined) konsumenData.titik_koordinat = optionalText(body.titik_koordinat);
      if (noTelp !== undefined) konsumenData.no_telp = noTelp;
      const konsumenUpd = buildUpdate("konsumen", "id_user", id_user, konsumenData, [
        "kategori_konsumen",
        "alamat_pengiriman_utama",
        "titik_koordinat",
        "no_telp",
      ]);
      if (konsumenUpd) await client.query(konsumenUpd.sql, konsumenUpd.params);

      await logAktivitas(client, id_user, "UPDATE_PROFIL_KONSUMEN", `/api/konsumen/profil/${id_user}`, "Profil konsumen diperbarui.");
    });
    return this.getProfile(id_user);
  },

  async getDashboard(id_user: number) {
    const profil = await this.getProfile(id_user);
    const [belanja, keuangan] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(total_harga) FILTER (WHERE status = 'Selesai'), 0) AS belanja_selesai,
                COALESCE(SUM(total_harga) FILTER (WHERE status IN ('Pending', 'Diproses')), 0) AS belanja_aktif,
                COUNT(*) FILTER (WHERE status IN ('Pending', 'Diproses'))::int AS pesanan_aktif,
                COUNT(*)::int AS total_pesanan
           FROM transaksi WHERE id_pembeli = $1`,
        [id_user],
      ),
      pool.query(
        `SELECT COALESCE(SUM(jumlah_uang) FILTER (WHERE jenis_transaksi = 'Pemasukan'), 0) AS pemasukan,
                COALESCE(SUM(jumlah_uang) FILTER (WHERE jenis_transaksi = 'Pengeluaran'), 0) AS pengeluaran
           FROM pencatatan_keuangan WHERE id_user = $1`,
        [id_user],
      ),
    ]);
    const b = belanja.rows[0];
    const u = keuangan.rows[0];
    return {
      konsumen: {
        id_konsumen: profil.id_konsumen,
        id_user,
        nama_lengkap: profil.nama_lengkap,
        kategori_konsumen: profil.kategori_konsumen,
        alamat_pengiriman_utama: profil.alamat_pengiriman_utama,
        status_verifikasi: profil.status_verifikasi,
      },
      pembelian: {
        totalBelanjaSelesai: Number(b.belanja_selesai),
        belanjaAktif: Number(b.belanja_aktif),
        pesananAktifCount: b.pesanan_aktif,
        totalPesanan: b.total_pesanan,
      },
      keuangan: {
        totalPemasukan: Number(u.pemasukan),
        totalPengeluaran: Number(u.pengeluaran),
        saldoKas: Number(u.pemasukan) - Number(u.pengeluaran),
      },
    };
  },

  async katalog(filter: { kategori?: string; search?: string } = {}) {
    const params: unknown[] = [];
    let sql = `SELECT p.*, pg.nama_lengkap AS nama_penjual
                 FROM produk p
                 JOIN pengguna pg ON pg.id_user = p.id_user
                WHERE p.status_verifikasi = 'Terverifikasi' AND p.stok > 0`;
    if (filter.kategori && filter.kategori !== "Semua") {
      params.push(filter.kategori);
      sql += ` AND p.kategori = $${params.length}`;
    }
    if (filter.search) {
      params.push(`%${filter.search}%`);
      sql += ` AND (p.nama_produk ILIKE $${params.length} OR p.deskripsi ILIKE $${params.length})`;
    }
    sql += ` ORDER BY p.tgl_dibuat DESC NULLS LAST, p.id_produk DESC`;
    const { rows } = await pool.query(sql, params);
    return rows;
  },

  async listPesanan(id_user: number) {
    await guard(id_user);
    return pesananService.listByPeran("pembeli", id_user);
  },

  async detailPesanan(id_user: number, id_transaksi: number) {
    await guard(id_user);
    return pesananService.detail(id_transaksi, id_user);
  },

  async buatPesanan(id_user: number, body: any) {
    await guard(id_user);
    return pesananService.create(id_user, body?.items, body?.metode_pembayaran);
  },

  async konfirmasiBayar(id_user: number, id_transaksi: number) {
    await guard(id_user);
    return pesananService.konfirmasiBayar(id_transaksi, id_user);
  },

  async ubahStatusPesanan(id_user: number, id_transaksi: number, status: any) {
    await guard(id_user);
    const statusFinal = requireOneOf(status, ["Selesai", "Batal"] as const, "Status");
    return pesananService.ubahStatus(id_transaksi, id_user, statusFinal);
  },

  keuangan: {
    list: (id_user: number, jenis?: string) => keuanganService.list(id_user, jenis),
    create: (id_user: number, body: any) => keuanganService.create(id_user, body),
    update: (id_user: number, id: number, body: any) => keuanganService.update(id_user, id, body),
    remove: (id_user: number, id: number) => keuanganService.remove(id_user, id),
  },
};

