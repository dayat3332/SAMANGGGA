import app from "./app.tsx";
import { config } from "./config/index.tsx";
import { testConnection } from "./config/db.tsx";

const PORT = config.port;

app.listen(PORT, async () => {
  console.log(`🚀 SAMANGGA Backend API (TypeScript / TSX) aktif berjalan di http://localhost:${PORT}`);
  console.log(`🌱 Status Health: http://localhost:${PORT}/api/health`);
  console.log(`🛡️  Admin API Endpoint: http://localhost:${PORT}/api/admin/dashboard`);
  console.log(`🏪 UMKM API Endpoint: http://localhost:${PORT}/api/umkm/dashboard/1`);
  await testConnection();
});
