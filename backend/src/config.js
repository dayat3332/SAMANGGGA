import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/samangga",
  jwtSecret: process.env.JWT_SECRET || "ganti-ini-di-produksi",
  jwtExpires: process.env.JWT_EXPIRES || "7d",
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:3000").split(",").map((s) => s.trim()),
  callbackToken: process.env.PAYMENT_CALLBACK_TOKEN || "dev-callback-token",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 5),
  googleClientId: (process.env.GOOGLE_CLIENT_ID || "").trim(),
  isProd: process.env.NODE_ENV === "production",
};

if (config.isProd && config.jwtSecret === "ganti-ini-di-produksi") {
  throw new Error("JWT_SECRET wajib diisi di production.");
}
