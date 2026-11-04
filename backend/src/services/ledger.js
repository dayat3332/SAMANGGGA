/** Tambah baris pencatatan keuangan (dipanggil di dalam transaksi DB). Jumlah 0 dilewati. */
export async function catatKeuangan(c, { id_user, id_transaksi = null, id_limbah = null, jenis, jumlah, keterangan }) {
  if (!jumlah || jumlah <= 0) return;
  await c.query(
    `INSERT INTO pencatatan_keuangan (id_user, id_transaksi, id_limbah, jenis_transaksi, jumlah_uang, keterangan)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [id_user, id_transaksi, id_limbah, jenis, jumlah, keterangan],
  );
}
