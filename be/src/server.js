import app from "./app.js";
import { config } from "./config/index.js";
import { testConnection } from "./config/db.js";
const PORT = config.port;
app.listen(PORT, async () => {
    console.log(`🚀 SAMANGGA Backend API aktif berjalan di http://localhost:${PORT}`);
    console.log(`🌱 Status Health: http://localhost:${PORT}/api/health`);
    console.log(`🛡️  Admin API Endpoint: http://localhost:${PORT}/api/admin/dashboard`);
    await testConnection();
});
