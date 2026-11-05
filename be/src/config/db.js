import pg from "pg";
import { config } from "./index.js";
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
export async function query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (config.nodeEnv === "development") {
        // Optional debug log
        // console.log("executed query", { text: text.slice(0, 50), duration, rows: res.rowCount });
    }
    return res;
}
export async function testConnection() {
    try {
        const res = await pool.query("SELECT current_database(), current_user, version();");
        console.log(`✅ PostgreSQL Connected: db=${res.rows[0].current_database}, user=${res.rows[0].current_user}`);
        return true;
    }
    catch (err) {
        console.error("❌ Failed to connect to PostgreSQL:", err);
        return false;
    }
}
