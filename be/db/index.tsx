import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env dari root be/
dotenv.config({ path: path.join(__dirname, "../.env") });

const { Pool } = pg;

const isRemoteDb =
  (process.env.DB_HOST && process.env.DB_HOST !== "localhost") ||
  Boolean(process.env.DATABASE_URL?.includes("supabase"));

export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  user: process.env.DB_USER || "samangga_user",
  password: process.env.DB_PASSWORD || "samangga123",
  database: process.env.DB_NAME || "samangga_db",
  max: 10,
  idleTimeoutMillis: 30000,
  ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle PostgreSQL client:", err);
});

export async function query<T = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}
