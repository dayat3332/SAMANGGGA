import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../src/db.js";

const dir = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(dir, "../db/schema.sql"), "utf8");
const reset = process.argv.includes("--reset");

const client = await pool.connect();
try {
  if (reset) {
    console.log("Reset: menghapus semua tabel dan tipe...");
    await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  }
  const { rows } = await client.query("SELECT to_regclass('public.pengguna') AS t");
  if (rows[0].t) {
    console.log("Schema sudah ada. Pakai `npm run migrate:reset` untuk membuat ulang (data hilang).");
  } else {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("Schema berhasil dibuat.");
  }
} catch (e) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("Migrasi gagal:", e.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
