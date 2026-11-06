import pg from "pg";
import { config } from "./index.tsx";
import { prisma } from "./prisma.tsx";

const { Pool } = pg;

export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle PostgreSQL client:", err);
});

export async function query<T = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  return res;
}

export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    const res = await pool.query("SELECT current_database(), current_user, version();");
    console.log(
      `✅ PostgreSQL ("Postgrid") & Prisma ORM Connected: db=${res.rows[0].current_database}, user=${res.rows[0].current_user}`
    );
    return true;
  } catch (err) {
    console.error("❌ Failed to connect to PostgreSQL / Prisma:", err);
    return false;
  }
}

export { prisma };
