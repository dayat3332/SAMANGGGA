import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./index.tsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function importSqlFile(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log("============================================================");
    console.log("🐘 IMPORT DATABASE POSTGRESQL SAMANGGA (samangga_database.sql)");
    console.log("============================================================");

    // Cari file SQL di direktori be/db/ atau root direktori
    const candidatePaths = [
      path.join(__dirname, "samangga_database.sql"),
      path.join(__dirname, "../../samangga_database.sql"),
      path.join(process.cwd(), "samangga_database.sql"),
      path.join(process.cwd(), "be/db/samangga_database.sql"),
    ];

    let sqlPath = "";
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        sqlPath = p;
        break;
      }
    }

    if (!sqlPath) {
      throw new Error("File samangga_database.sql tidak ditemukan di direktori be/db maupun root.");
    }

    console.log(`📂 Membaca file SQL: ${sqlPath}`);
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");

    console.log("⚡ Mengeksekusi DDL Skema, Tabel, Indeks, dan Data Awal...");
    await client.query("BEGIN;");
    await client.query(sqlContent);
    await client.query("COMMIT;");
    console.log("✅ Eksekusi SQL berhasil tanpa kendala!");

    console.log("\n📊 Ringkasan Jumlah Baris Data per Tabel:");
    const tables = [
      "pengguna",
      "admin",
      "supplier",
      "umkm",
      "mitra",
      "konsumen",
      "produk",
      "limbah",
      "transaksi",
      "detail_transaksi",
      "pembayaran",
      "riwayat_pengiriman",
      "pencatatan_keuangan",
      "log_sistem",
    ];

    for (const table of tables) {
      const res = await client.query(`SELECT COUNT(*)::int AS total FROM ${table};`);
      const total = res.rows[0]?.total ?? 0;
      console.log(`  - ${table.padEnd(22)}: ${total} baris`);
    }

    console.log("============================================================");
    console.log("🎉 DATABASE SAMANGGA BERHASIL DISIAPKAN DARI samangga_database.sql");
    console.log("============================================================\n");
  } catch (error) {
    try {
      await client.query("ROLLBACK;");
    } catch {}
    console.error("❌ Gagal mengimpor samangga_database.sql:", error);
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  importSqlFile()
    .then(() => pool.end())
    .catch(() => process.exit(1));
}
