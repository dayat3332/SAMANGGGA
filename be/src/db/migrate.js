import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../config/db.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function runMigration() {
    const client = await pool.connect();
    try {
        console.log("🚀 Menjalankan migrasi skema PostgreSQL SAMANGGA...");
        let sqlPath = path.join(__dirname, "schema.sql");
        if (!fs.existsSync(sqlPath)) {
            sqlPath = path.join(__dirname, "../../src/db/schema.sql");
        }
        const sql = fs.readFileSync(sqlPath, "utf8");
        await client.query("BEGIN;");
        await client.query(sql);
        await client.query("COMMIT;");
        console.log("✅ Migrasi skema database berhasil dieksekusi!");
    }
    catch (error) {
        await client.query("ROLLBACK;");
        console.error("❌ Gagal menjalankan migrasi:", error);
        throw error;
    }
    finally {
        client.release();
    }
}
// Jalankan otomatis jika dipanggil langsung via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runMigration()
        .then(() => pool.end())
        .catch(() => process.exit(1));
}
