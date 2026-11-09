import { pool, withTx } from "../config/db.tsx";
import { HttpError } from "../utils/httpError.tsx";
import {
  buildUpdate,
  optionalOneOf,
  optionalText,
  requireOneOf,
  requireText,
  toNonNegative,
  toTags,
} from "../utils/parse.tsx";
import { assertRole, ensureSupplier, logAktivitas } from "./akunService.tsx";
import { pesananService } from "./pesananService.tsx";
import { keuanganService } from "./keuanganService.tsx";

const PERAN = "Supplier";
const TIPE = ["Petani", "Pengepul"] as const;
const SATUAN_DEFAULT = "Kwintal";
const GAMBAR_DEFAULT = "/images/mangga/mangga_gincu.jpg";

async function guard(id_user: number) {
  await assertRole(pool, id_user, PERAN);
  await ensureSupplier(pool, id_user);
}

export const supplierService = {
  async getProfile(id_user: number) {
    await guard(id_user);
    const { rows } = await pool.query(
      `SELECT p.id_user, p.nama_lengkap, p.email, p.peran, p.alamat, p.no_telp AS no_telp_user,
              p.status_verifikasi, p.foto_persyaratan_url, p.foto_persyaratan_name, p.alasan_penolakan, p.tgl_daftar,
              s.id_supplier, s.tipe_supplier, s.no_telp, s.luas_lahan_m2, s.jenis_komoditas_utama, s.nama_bank, s.no_rekening
         FROM pengguna p
         JOIN supplier s ON s.id_user = p.id_user
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
      const noTelp = body?.no_telp !== undefined ? optionalText(body.no_telp) : body?.no_telp_user !== undefined ? optionalText(body.no_telp_user) : undefined;
      if (noTelp !== undefined) penggunaData.no_telp = noTelp;
      const penggunaUpd = buildUpdate("pengguna", "id_user", id_user, penggunaData, ["nama_lengkap", "alamat", "no_telp"]);
      if (penggunaUpd) await client.query(penggunaUpd.sql, penggunaUpd.params);

      const supplierData: Record<string, unknown> = {};
      const tipe = optionalOneOf(body?.tipe_supplier, TIPE, "Tipe supplier");
      if (tipe !== undefined) supplierData.tipe_supplier = tipe;
      if (body?.luas_lahan_m2 !== undefined) supplierData.luas_lahan_m2 = toNonNegative(body.luas_lahan_m2, "Luas lahan");
      if (body?.jenis_komoditas_utama !== undefined) supplierData.jenis_komoditas_utama = optionalText(body.jenis_komoditas_utama);
      if (body?.nama_bank !== undefined) supplierData.nama_bank = optionalText(body.nama_bank);
      if (body?.no_rekening !== undefined) supplierData.no_rekening = optionalText(body.no_rekening);
      if (noTelp !== undefined) supplierData.no_telp = noTelp;
      const supplierUpd = buildUpdate("supplier", "id_user", id_user, supplierData, [
        "tipe_supplier",
        "luas_lahan_m2",
        "jenis_komoditas_utama",
        "nama_bank",
        "no_rekening",
        "no_telp",
      ]);
      if (supplierUpd) await client.query(supplierUpd.sql, supplierUpd.params);

      await logAktivitas(client, id_user, "UPDATE_PROFIL_SUPPLIER", `/api/supplier/profil/${id_user}`, "Profil supplier diperbarui.");
    });
    return this.getProfile(id_user);
  },

  async getDashboard(id_user: number) {
    const profil = await this.getProfile(id_user);
    const [katalog, penjualan, keuangan] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS total_produk, COALESCE(SUM(stok), 0)::int AS total_stok
           FROM produk WHERE id_user = $1`,
        [id_user],
      ),
      pool.query(
        `SELECT COALESCE(SUM(total_harga) FILTER (WHERE status = 'Selesai'), 0) AS omzet_selesai,
                COALESCE(SUM(total_harga) FILTER (WHERE status IN ('Pending', 'Diproses')), 0) AS omzet_pending,
                COUNT(*) FILTER (WHERE status IN ('Pending', 'Diproses'))::int AS pesanan_aktif,
                COUNT(*)::int AS total_pesanan
           FROM transaksi WHERE id_penjual = $1`,
        [id_user],
      ),
      pool.query(
        `SELECT COALESCE(SUM(jumlah_uang) FILTER (WHERE jenis_transaksi = 'Pemasukan'), 0) AS pemasukan,
                COALESCE(SUM(jumlah_uang) FILTER (WHERE jenis_transaksi = 'Pengeluaran'), 0) AS pengeluaran
           FROM pencatatan_keuangan WHERE id_user = $1`,
        [id_user],
      ),
    ]);
    const k = katalog.rows[0];
    const p = penjualan.rows[0];
    const u = keuangan.rows[0];
    const pemasukan = Number(u.pemasukan);
    const pengeluaran = Number(u.pengeluaran);
    return {
      supplier: {
        id_supplier: profil.id_supplier,
        id_user,
        nama_lengkap: profil.nama_lengkap,
        tipe_supplier: profil.tipe_supplier,
        jenis_komoditas_utama: profil.jenis_komoditas_utama,
        luas_lahan_m2: profil.luas_lahan_m2,
        status_verifikasi: profil.status_verifikasi,
      },
      katalog: {
        totalProduk: k.total_produk,
        totalStokUnit: k.total_stok,
      },
      penjualan: {
        omzetSelesai: Number(p.omzet_selesai),
        omzetPending: Number(p.omzet_pending),
        pesananAktifCount: p.pesanan_aktif,
        totalTransaksiPenjualan: p.total_pesanan,
      },
      keuangan: {
        totalPemasukan: pemasukan,
        totalPengeluaran: pengeluaran,
        saldoKas: pemasukan - pengeluaran,
      },
    };
  },

  async listProduk(id_user: number, filter: { search?: string; kategori?: string } = {}) {
    await guard(id_user);
    const params: unknown[] = [id_user];
    let sql = `SELECT * FROM produk WHERE id_user = $1`;
    if (filter.search) {
      params.push(`%${filter.search}%`);
      sql += ` AND (nama_produk ILIKE $${params.length} OR deskripsi ILIKE $${params.length})`;
    }
    if (filter.kategori) {
      params.push(filter.kategori);
      sql += ` AND kategori = $${params.length}`;
    }
    sql += ` ORDER BY tgl_dibuat DESC NULLS LAST, id_produk DESC`;
    const { rows } = await pool.query(sql, params);
    return rows;
  },

  async createProduk(id_user: number, body: any) {
    await guard(id_user);
    const nama = requireText(body?.nama_produk, "Nama produk", 3);
    const harga = toNonNegative(body?.harga, "Harga");
    const stok = toNonNegative(body?.stok, "Stok");
    const satuan = optionalText(body?.satuan) || SATUAN_DEFAULT;
    const { rows } = await pool.query(
      `INSERT INTO produk (id_user, nama_produk, kategori, harga, stok, satuan, deskripsi, gambar, status_verifikasi, lokasi, tags)
       VALUES ($1, $2, 'Buah', $3, $4, $5, $6, $7, 'Terverifikasi', $8, $9)
       RETURNING *`,
      [
        id_user,
        nama,
        harga,
        Math.floor(stok),
        satuan,
        optionalText(body?.deskripsi),
        optionalText(body?.gambar) || GAMBAR_DEFAULT,
        optionalText(body?.lokasi) || "Indramayu",
        toTags(body?.tags),
      ],
    );
    await logAktivitas(pool, id_user, "TAMBAH_PRODUK_SUPPLIER", "/api/supplier/produk", `Menambahkan komoditas #${rows[0].id_produk}: ${nama}.`);
    return rows[0];
  },

  async updateProduk(id_user: number, id_produk: number, body: any) {
    await guard(id_user);
    const existing = await pool.query(`SELECT * FROM produk WHERE id_produk = $1 AND id_user = $2`, [id_produk, id_user]);
    if (!existing.rows[0]) throw new HttpError(404, "Komoditas tidak ditemukan atau bukan milik Anda.");
    const data: Record<string, unknown> = {};
    if (body?.nama_produk !== undefined) data.nama_produk = requireText(body.nama_produk, "Nama produk", 3);
    if (body?.harga !== undefined) data.harga = toNonNegative(body.harga, "Harga");
    if (body?.stok !== undefined) data.stok = Math.floor(toNonNegative(body.stok, "Stok"));
    if (body?.satuan !== undefined) data.satuan = optionalText(body.satuan) || SATUAN_DEFAULT;
    if (body?.deskripsi !== undefined) data.deskripsi = optionalText(body.deskripsi);
    if (body?.gambar !== undefined) data.gambar = optionalText(body.gambar) || GAMBAR_DEFAULT;
    if (body?.lokasi !== undefined) data.lokasi = optionalText(body.lokasi) || "Indramayu";
    if (body?.tags !== undefined) data.tags = toTags(body.tags);
    const upd = buildUpdate("produk", "id_produk", id_produk, data, [
      "nama_produk",
      "harga",
      "stok",
      "satuan",
      "deskripsi",
      "gambar",
      "lokasi",
      "tags",
    ]);
    if (upd) await pool.query(upd.sql, upd.params);
    const { rows } = await pool.query(`SELECT * FROM produk WHERE id_produk = $1`, [id_produk]);
    await logAktivitas(pool, id_user, "UPDATE_PRODUK_SUPPLIER", `/api/supplier/produk/${id_produk}`, `Memperbarui komoditas #${id_produk}: ${rows[0].nama_produk}.`);
    return rows[0];
  },

  async removeProduk(id_user: number, id_produk: number) {
    await guard(id_user);
    const { rows } = await pool.query(`DELETE FROM produk WHERE id_produk = $1 AND id_user = $2 RETURNING *`, [id_produk, id_user]);
    if (!rows[0]) throw new HttpError(404, "Komoditas tidak ditemukan atau bukan milik Anda.");
    await logAktivitas(pool, id_user, "HAPUS_PRODUK_SUPPLIER", `/api/supplier/produk/${id_produk}`, `Menghapus komoditas #${id_produk}: ${rows[0].nama_produk}.`, "Warning");
    return rows[0];
  },

  async listPesanan(id_user: number) {
    await guard(id_user);
    return pesananService.listByPeran("penjual", id_user);
  },

  async ubahStatusPesanan(id_user: number, id_transaksi: number, status: any) {
    await guard(id_user);
    const statusFinal = requireOneOf(status, ["Diproses", "Selesai", "Batal"] as const, "Status");
    return pesananService.ubahStatus(id_transaksi, id_user, statusFinal);
  },

  async resubmitDokumen(id_user: number, url: unknown, nama: unknown) {
    await assertRole(pool, id_user, PERAN);
    const fileUrl = requireText(url, "File foto dokumen persyaratan");
    const { rows } = await pool.query(
      `UPDATE pengguna
          SET foto_persyaratan_url = $1,
              foto_persyaratan_name = COALESCE($2, foto_persyaratan_name),
              status_verifikasi = 'Menunggu',
              alasan_penolakan = NULL
        WHERE id_user = $3
        RETURNING id_user, nama_lengkap, email, status_verifikasi, foto_persyaratan_url, foto_persyaratan_name`,
      [fileUrl, optionalText(nama), id_user],
    );
    return rows[0];
  },

  keuangan: {
    list: (id_user: number, jenis?: string) => keuanganService.list(id_user, jenis),
    create: (id_user: number, body: any) => keuanganService.create(id_user, body),
    update: (id_user: number, id: number, body: any) => keuanganService.update(id_user, id, body),
    remove: (id_user: number, id: number) => keuanganService.remove(id_user, id),
  },
};

