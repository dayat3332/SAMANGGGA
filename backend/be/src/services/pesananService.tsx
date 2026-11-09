import { pool, withTx } from "../config/db.tsx";
import { HttpError } from "../utils/httpError.tsx";
import { toId } from "../utils/parse.tsx";
import { assertRole, ensureKonsumen, logAktivitas, Db } from "./akunService.tsx";

const METODE = ["Transfer Manual", "Virtual Account", "QRIS"] as const;

const ATURAN_STATUS: Record<string, { ke: string; peran: "penjual" | "siapa_saja" }> = {
  "Pending>Diproses": { ke: "Diproses", peran: "penjual" },
  "Pending>Batal": { ke: "Batal", peran: "siapa_saja" },
  "Diproses>Selesai": { ke: "Selesai", peran: "siapa_saja" },
  "Diproses>Batal": { ke: "Batal", peran: "penjual" },
};

function kodePembayaran(): string {
  return `8808${Math.floor(1000000000 + Math.random() * 9000000000)}`;
}

async function fetchPesanan(db: Db, where: string, params: unknown[]) {
  const head = await db.query(
    `SELECT t.id_transaksi, t.id_pembeli, t.id_penjual, t.total_harga, t.status, t.tgl_transaksi,
            pb.nama_lengkap AS nama_pembeli, pb.no_telp AS no_telp_pembeli, pb.alamat AS alamat_pembeli,
            pj.nama_lengkap AS nama_penjual, pj.no_telp AS no_telp_penjual, pj.alamat AS alamat_penjual
       FROM transaksi t
       JOIN pengguna pb ON pb.id_user = t.id_pembeli
       JOIN pengguna pj ON pj.id_user = t.id_penjual
      WHERE ${where}
      ORDER BY t.tgl_transaksi DESC NULLS LAST, t.id_transaksi DESC`,
    params,
  );
  const ids: number[] = head.rows.map((r: any) => r.id_transaksi);
  if (!ids.length) return [];

  const [items, pays, ships] = await Promise.all([
    db.query(
      `SELECT dt.id_detail_transaksi, dt.id_transaksi, dt.id_produk, dt.jumlah_produk, dt.harga_satuan, dt.subtotal_harga,
              p.nama_produk, p.kategori, p.satuan, p.gambar
         FROM detail_transaksi dt
         JOIN produk p ON p.id_produk = dt.id_produk
        WHERE dt.id_transaksi = ANY($1::int[])
        ORDER BY dt.id_detail_transaksi`,
      [ids],
    ),
    db.query(`SELECT * FROM pembayaran WHERE id_transaksi = ANY($1::int[]) ORDER BY id_pembayaran`, [ids]),
    db.query(
      `SELECT rp.*, m.nama_mitra_instansi
         FROM riwayat_pengiriman rp
         LEFT JOIN mitra m ON m.id_mitra = rp.id_mitra
        WHERE rp.id_transaksi = ANY($1::int[])
        ORDER BY rp.id_pengiriman`,
      [ids],
    ),
  ]);

  return head.rows.map((r: any) => ({
    id_transaksi: r.id_transaksi,
    id_pembeli: r.id_pembeli,
    id_penjual: r.id_penjual,
    total_harga: Number(r.total_harga),
    status: r.status,
    tgl_transaksi: r.tgl_transaksi,
    nama_pembeli: r.nama_pembeli,
    no_telp_pembeli: r.no_telp_pembeli,
    alamat_pembeli: r.alamat_pembeli,
    nama_penjual: r.nama_penjual,
    no_telp_penjual: r.no_telp_penjual,
    alamat_penjual: r.alamat_penjual,
    items: items.rows
      .filter((i: any) => i.id_transaksi === r.id_transaksi)
      .map((i: any) => ({
        id_detail_transaksi: i.id_detail_transaksi,
        id_produk: i.id_produk,
        nama_produk: i.nama_produk,
        kategori: i.kategori,
        satuan: i.satuan,
        gambar: i.gambar,
        jumlah_produk: Number(i.jumlah_produk),
        harga_satuan: Number(i.harga_satuan),
        subtotal_harga: Number(i.subtotal_harga),
      })),
    pembayaran: pays.rows.find((p: any) => p.id_transaksi === r.id_transaksi) || null,
    pengiriman: ships.rows.find((s: any) => s.id_transaksi === r.id_transaksi) || null,
  }));
}

async function lockTransaksi(client: any, id_transaksi: number) {
  const { rows } = await client.query(`SELECT * FROM transaksi WHERE id_transaksi = $1 FOR UPDATE`, [id_transaksi]);
  if (!rows[0]) throw new HttpError(404, "Transaksi tidak ditemukan.");
  return rows[0];
}

function peranDalamTransaksi(trx: any, id_user: number): "pembeli" | "penjual" {
  if (trx.id_pembeli === id_user) return "pembeli";
  if (trx.id_penjual === id_user) return "penjual";
  throw new HttpError(403, "Anda tidak memiliki akses ke transaksi ini.");
}

async function catatKeuangan(client: any, id_user: number, id_transaksi: number, jenis: "Pemasukan" | "Pengeluaran", jumlah: number, keterangan: string) {
  const sudah = await client.query(
    `SELECT 1 FROM pencatatan_keuangan WHERE id_user = $1 AND id_transaksi = $2 AND jenis_transaksi = $3`,
    [id_user, id_transaksi, jenis],
  );
  if (sudah.rows.length) return;
  await client.query(
    `INSERT INTO pencatatan_keuangan (id_user, id_transaksi, jenis_transaksi, jumlah_uang, keterangan) VALUES ($1, $2, $3, $4, $5)`,
    [id_user, id_transaksi, jenis, jumlah, keterangan],
  );
}

export const pesananService = {
  async listByPeran(peran: "pembeli" | "penjual", id_user: number) {
    const kolom = peran === "pembeli" ? "t.id_pembeli" : "t.id_penjual";
    return fetchPesanan(pool, `${kolom} = $1`, [id_user]);
  },

  async detail(id_transaksi: number, id_user: number) {
    const rows = await fetchPesanan(
      pool,
      `t.id_transaksi = $1 AND (t.id_pembeli = $2 OR t.id_penjual = $2)`,
      [id_transaksi, id_user],
    );
    if (!rows[0]) throw new HttpError(404, "Transaksi tidak ditemukan atau Anda tidak memiliki akses.");
    return rows[0];
  },

  async create(id_pembeli: number, rawItems: any, metode: any) {
    if (!Array.isArray(rawItems) || rawItems.length === 0)
      throw new HttpError(400, "Keranjang masih kosong. Tambahkan minimal satu produk.");
    const metodeFinal = (METODE as readonly string[]).includes(metode) ? metode : "Virtual Account";

    const jumlahPerProduk = new Map<number, number>();
    for (const it of rawItems) {
      const id = toId(it?.id_produk, "ID produk");
      const jml = toId(it?.jumlah_produk ?? it?.jumlah, "Jumlah produk");
      jumlahPerProduk.set(id, (jumlahPerProduk.get(id) ?? 0) + jml);
    }

    return withTx(async (client) => {
      await assertRole(client, id_pembeli, "Konsumen");
      await ensureKonsumen(client, id_pembeli);

      const ids = [...jumlahPerProduk.keys()];
      const { rows: produk } = await client.query(
        `SELECT id_produk, id_user, nama_produk, harga, stok, satuan, status_verifikasi
           FROM produk WHERE id_produk = ANY($1::int[]) FOR UPDATE`,
        [ids],
      );
      if (produk.length !== ids.length) throw new HttpError(404, "Ada produk di keranjang yang tidak ditemukan di katalog.");

      const perPenjual = new Map<number, { produk: any; jumlah: number }[]>();
      for (const p of produk) {
        const jumlah = jumlahPerProduk.get(p.id_produk) as number;
        if (p.status_verifikasi !== "Terverifikasi")
          throw new HttpError(400, `Produk ${p.nama_produk} belum tersedia untuk dipesan.`);
        if (p.id_user === id_pembeli) throw new HttpError(400, "Anda tidak dapat memesan produk milik sendiri.");
        if (Number(p.stok) < jumlah)
          throw new HttpError(400, `Stok ${p.nama_produk} tidak mencukupi (tersisa ${p.stok} ${p.satuan}).`);
        if (!perPenjual.has(p.id_user)) perPenjual.set(p.id_user, []);
        perPenjual.get(p.id_user)!.push({ produk: p, jumlah });
      }

      const idBaru: number[] = [];
      for (const [id_penjual, lines] of perPenjual) {
        const total = lines.reduce((s, l) => s + Number(l.produk.harga) * l.jumlah, 0);
        const { rows: [trx] } = await client.query(
          `INSERT INTO transaksi (id_pembeli, id_penjual, total_harga, status) VALUES ($1, $2, $3, 'Pending') RETURNING id_transaksi`,
          [id_pembeli, id_penjual, total],
        );
        for (const l of lines) {
          await client.query(
            `INSERT INTO detail_transaksi (id_transaksi, id_produk, jumlah_produk, harga_satuan, subtotal_harga) VALUES ($1, $2, $3, $4, $5)`,
            [trx.id_transaksi, l.produk.id_produk, l.jumlah, l.produk.harga, Number(l.produk.harga) * l.jumlah],
          );
          await client.query(`UPDATE produk SET stok = stok - $1 WHERE id_produk = $2`, [l.jumlah, l.produk.id_produk]);
        }
        await client.query(
          `INSERT INTO pembayaran (id_transaksi, metode_pembayaran, jumlah_bayar, status_pembayaran, id_referensi_gateway, kode_pembayaran, batas_waktu_bayar)
           VALUES ($1, $2, $3, 'Menunggu', $4, $5, NOW() + INTERVAL '24 hours')`,
          [trx.id_transaksi, metodeFinal, total, `MID-SMG-${trx.id_transaksi}-${Date.now()}`, kodePembayaran()],
        );
        await logAktivitas(client, id_pembeli, "BUAT_PESANAN", "/api/konsumen/pesanan", `Pesanan #${trx.id_transaksi} dibuat ke penjual #${id_penjual}.`);
        idBaru.push(trx.id_transaksi);
      }
      return fetchPesanan(client, `t.id_transaksi = ANY($1::int[])`, [idBaru]);
    });
  },

  async konfirmasiBayar(id_transaksi: number, id_user: number) {
    return withTx(async (client) => {
      const trx = await lockTransaksi(client, id_transaksi);
      if (trx.id_pembeli !== id_user) throw new HttpError(403, "Hanya pembeli yang dapat mengonfirmasi pembayaran.");
      if (trx.status === "Batal" || trx.status === "Selesai")
        throw new HttpError(400, `Transaksi sudah berstatus ${trx.status}.`);
      const hasil = await client.query(
        `UPDATE pembayaran SET status_pembayaran = 'Berhasil', tgl_bayar = NOW()
          WHERE id_transaksi = $1 AND status_pembayaran = 'Menunggu'`,
        [id_transaksi],
      );
      if (hasil.rowCount === 0) {
        const cek = await client.query(`SELECT status_pembayaran FROM pembayaran WHERE id_transaksi = $1`, [id_transaksi]);
        if (!cek.rows.some((r: any) => r.status_pembayaran === "Berhasil"))
          throw new HttpError(400, "Tidak ada tagihan yang menunggu pembayaran.");
      }
      await logAktivitas(client, id_user, "KONFIRMASI_BAYAR", `/api/konsumen/pesanan/${id_transaksi}/bayar`, `Pembayaran pesanan #${id_transaksi} dikonfirmasi pembeli.`);
      const [hasilAkhir] = await fetchPesanan(client, `t.id_transaksi = $1`, [id_transaksi]);
      return hasilAkhir;
    });
  },

  async ubahStatus(id_transaksi: number, id_user: number, statusBaru: string) {
    return withTx(async (client) => {
      const trx = await lockTransaksi(client, id_transaksi);
      const peran = peranDalamTransaksi(trx, id_user);
      const kunci = `${trx.status}>${statusBaru}`;
      const aturan = ATURAN_STATUS[kunci];
      if (!aturan) throw new HttpError(400, `Perubahan status dari ${trx.status} ke ${statusBaru} tidak diizinkan.`);
      if (aturan.peran === "penjual" && peran !== "penjual")
        throw new HttpError(403, "Perubahan status ini hanya dapat dilakukan oleh penjual.");

      const bayar = await client.query(`SELECT status_pembayaran FROM pembayaran WHERE id_transaksi = $1`, [id_transaksi]);
      const sudahBayar = bayar.rows.some((r: any) => r.status_pembayaran === "Berhasil");

      if (statusBaru === "Diproses" && !sudahBayar)
        throw new HttpError(400, "Pesanan belum dibayar. Pembeli perlu mengonfirmasi pembayaran terlebih dahulu.");
      if (statusBaru === "Selesai" && !sudahBayar)
        throw new HttpError(400, "Pesanan belum dibayar. Pembeli perlu mengonfirmasi pembayaran terlebih dahulu.");

      if (statusBaru === "Batal") {
        await client.query(
          `UPDATE produk p SET stok = p.stok + d.jumlah_produk
             FROM detail_transaksi d
            WHERE d.id_transaksi = $1 AND d.id_produk = p.id_produk`,
          [id_transaksi],
        );
        await client.query(
          `UPDATE pembayaran SET status_pembayaran = 'Gagal' WHERE id_transaksi = $1 AND status_pembayaran = 'Menunggu'`,
          [id_transaksi],
        );
      }

      if (statusBaru === "Selesai") {
        const keterangan = `dari transaksi #${id_transaksi}`;
        await catatKeuangan(client, trx.id_penjual, id_transaksi, "Pemasukan", Number(trx.total_harga), `Pemasukan penjualan ${keterangan}`);
        await catatKeuangan(client, trx.id_pembeli, id_transaksi, "Pengeluaran", Number(trx.total_harga), `Pengeluaran pembelian ${keterangan}`);
      }

      await client.query(`UPDATE transaksi SET status = $1 WHERE id_transaksi = $2`, [statusBaru, id_transaksi]);
      await logAktivitas(client, id_user, "UBAH_STATUS_TRANSAKSI", `/api/transaksi/${id_transaksi}/status`, `Status transaksi #${id_transaksi} diubah dari ${trx.status} menjadi ${statusBaru}.`);
      const [hasil] = await fetchPesanan(client, `t.id_transaksi = $1`, [id_transaksi]);
      return hasil;
    });
  },
};
