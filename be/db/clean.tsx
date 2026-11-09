import { pool } from "./index.tsx";
import { fileURLToPath } from "url";

export async function runClean(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log("🧹 Membersihkan seluruh data tabel PostgreSQL SAMANGGA...");

    await client.query("BEGIN;");

    await client.query(`
      TRUNCATE TABLE
        log_sistem,
        pencatatan_keuangan,
        riwayat_pengiriman,
        pembayaran,
        detail_transaksi,
        transaksi,
        limbah,
        produk,
        konsumen,
        mitra,
        umkm,
        supplier,
        admin,
        pengguna
      RESTART IDENTITY CASCADE;
    `);

    await client.query("COMMIT;");
    console.log("✨ Seluruh 14 tabel database berhasil dikosongkan (data dummy bersih)!");
  } catch (error) {
    await client.query("ROLLBACK;");
    console.error("❌ Gagal membersihkan database:", error);
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runClean()
    .then(() => pool.end())
    .catch(() => process.exit(1));
}
