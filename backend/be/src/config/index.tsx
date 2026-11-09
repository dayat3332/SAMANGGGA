import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    user: process.env.DB_USER || "samangga_user",
    password: process.env.DB_PASSWORD || "samangga123",
    database: process.env.DB_NAME || "samangga_db",
  },
  jwtSecret: process.env.JWT_SECRET || "samangga-jwt-secret-key-2026",
  demoPassword: process.env.DEMO_PASSWORD || "samangga2026",
};

export default config;
