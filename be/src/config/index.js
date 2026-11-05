import dotenv from "dotenv";
dotenv.config();
export const config = {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
    db: {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
        user: process.env.DB_USER || "samangga_user",
        password: process.env.DB_PASSWORD || "samangga123",
        database: process.env.DB_NAME || "samangga_db",
        connectionString: process.env.DATABASE_URL ||
            "postgresql://samangga_user:samangga123@localhost:5432/samangga_db",
    },
};
