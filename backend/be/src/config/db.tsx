import pg from "pg";
import { config } from "./index.tsx";

const { Pool } = pg;

pg.types.setTypeParser(1700, (value: string) => parseFloat(value));
pg.types.setTypeParser(20, (value: string) => parseInt(value, 10));

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
  console.error("Unexpected error on idle PostgreSQL client:", err);
});

export async function query<T = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function withTx<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const res = await pool.query("SELECT current_database() AS db, current_user AS usr");
    console.log(`PostgreSQL terhubung: db=${res.rows[0].db}, user=${res.rows[0].usr}`);
    return true;
  } catch (err) {
    console.error("Gagal terhubung ke PostgreSQL:", err);
    return false;
  }
}
