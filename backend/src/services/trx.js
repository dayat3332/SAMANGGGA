import { catatKeuangan } from "./ledger.js";

/** Pembayaran berhasil: transaksi jadi Diproses + catat keuangan penjual (masuk) dan pembeli (keluar). */
export async function tandaiLunas(c, id_transaksi) {
  const { rows } = await c.query(`SELECT * FROM transaksi WHERE id_transaksi = $1 FOR UPDATE`, [id_transaksi]);
  const t = rows[0];
  if (!t) return null;
  const upd = await c.query(
    `UPDATE pembayaran SET status_pembayaran = 'Berhasil', tgl_bayar = now()
     WHERE id_transaksi = $1 AND status_pembayaran = 'Menunggu' RETURNING id_pembayaran`,
    [id_transaksi],
  );
  if (!upd.rowCount) return t; // idempoten: sudah diproses sebelumnya
  await c.query(`UPDATE transaksi SET status = 'Diproses' WHERE id_transaksi = $1 AND status = 'Pending'`, [id_transaksi]);
  const ket = `Pembayaran transaksi #${id_transaksi}`;
  await catatKeuangan(c, { id_user: t.id_penjual, id_transaksi, jenis: "Pemasukan", jumlah: t.total_harga, keterangan: ket });
  await catatKeuangan(c, { id_user: t.id_pembeli, id_transaksi, jenis: "Pengeluaran", jumlah: t.total_harga, keterangan: ket });
  return t;
}

/** Batalkan transaksi dan kembalikan stok. statusBayar: status pembayaran baru bila masih Menunggu. */
export async function batalkanTransaksi(c, id_transaksi, statusBayar = "Gagal") {
  await c.query(`UPDATE transaksi SET status = 'Batal' WHERE id_transaksi = $1`, [id_transaksi]);
  await c.query(
    `UPDATE pembayaran SET status_pembayaran = $2 WHERE id_transaksi = $1 AND status_pembayaran = 'Menunggu'`,
    [id_transaksi, statusBayar],
  );
  await c.query(
    `UPDATE produk p SET stok = p.stok + d.jumlah_produk
     FROM detail_transaksi d WHERE d.id_produk = p.id_produk AND d.id_transaksi = $1`,
    [id_transaksi],
  );
}
