/**
 * Skrip Uji Coba Otomatis REST API SAMANGGA (Admin & Mitra) - JavaScript
 * Menjalankan skenario pengujian menyeluruh terhadap database PostgreSQL
 */

const BASE_URL = "http://localhost:5000/api";

const results = [];

async function request(method, path, body) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

function record(name, endpoint, passed, message) {
  results.push({ name, endpoint, passed, message });
  const icon = passed ? "✅ [PASS]" : "❌ [FAIL]";
  console.log(`${icon} ${name} (${endpoint})`);
  if (!passed && message) console.log(`    Detail: ${message}`);
}

async function runTests() {
  console.log("==========================================================");
  console.log("🧪 MEMULAI PENGUJIAN ENDPOINT ADMIN & MITRA SAMANGGA (JS)");
  console.log(`📡 Base URL: ${BASE_URL}`);
  console.log("==========================================================\n");

  // 1. Health Check
  try {
    const res = await request("GET", "/health");
    record("1. Server Health Check", "GET /health", res.status === 200 && res.data?.status === "ok");
  } catch (err) {
    record("1. Server Health Check", "GET /health", false, err.message);
  }

  // 2. Admin: Dashboard Metrik Ekosistem
  try {
    const res = await request("GET", "/admin/dashboard");
    const ok = res.status === 200 && res.data?.success && res.data?.data?.totalPengguna > 0;
    record(
      "2. Admin Dashboard Metrics",
      "GET /admin/dashboard",
      ok,
      `Total Pengguna: ${res.data?.data?.totalPengguna}, Limbah: ${res.data?.data?.totalLimbahKg} kg`
    );
  } catch (err) {
    record("2. Admin Dashboard Metrics", "GET /admin/dashboard", false, err.message);
  }

  // 3. Admin: Antrean Verifikasi Pengguna
  try {
    const res = await request("GET", "/admin/verifikasi");
    record("3. Admin Verifikasi Queue", "GET /admin/verifikasi", res.status === 200 && res.data?.success);
  } catch (err) {
    record("3. Admin Verifikasi Queue", "GET /admin/verifikasi", false, err.message);
  }

  // 4. Admin: Verifikasi Setujui Akun (Petani ID 101)
  try {
    const res = await request("PUT", "/admin/verifikasi/101/setujui", { admin_id: 505 });
    record(
      "4. Admin Approve User",
      "PUT /admin/verifikasi/101/setujui",
      res.status === 200 && res.data?.data?.status_verifikasi === "Terverifikasi"
    );
  } catch (err) {
    record("4. Admin Approve User", "PUT /admin/verifikasi/101/setujui", false, err.message);
  }

  // 5. Admin: Log Sistem & Audit Trail
  try {
    const res = await request("GET", "/admin/logs");
    record(
      "5. Admin Audit Logs",
      "GET /admin/logs",
      res.status === 200 && Array.isArray(res.data?.data) && res.data?.data.length > 0,
      `Total Log: ${res.data?.total}`
    );
  } catch (err) {
    record("5. Admin Audit Logs", "GET /admin/logs", false, err.message);
  }

  // 6. Mitra: Daftar Seluruh Mitra
  try {
    const res = await request("GET", "/mitra");
    record("6. Mitra Public List", "GET /mitra", res.status === 200 && res.data?.success);
  } catch (err) {
    record("6. Mitra Public List", "GET /mitra", false, err.message);
  }

  // 7. Mitra: Profil Mitra Lengkap (CV Bio Tani Lestari - user 303)
  try {
    const res = await request("GET", "/mitra/profil/303");
    record(
      "7. Mitra Profile Detail",
      "GET /mitra/profil/303",
      res.status === 200 && res.data?.data?.id_mitra === 1,
      `Instansi: ${res.data?.data?.nama_mitra_instansi}`
    );
  } catch (err) {
    record("7. Mitra Profile Detail", "GET /mitra/profil/303", false, err.message);
  }

  // 8. Mitra: Dashboard Operasional & Kapasitas
  try {
    const res = await request("GET", "/mitra/dashboard/1");
    record(
      "8. Mitra Operational Dashboard",
      "GET /mitra/dashboard/1",
      res.status === 200 && res.data?.data?.kapasitasTampungKg > 0,
      `Kapasitas: ${res.data?.data?.kapasitasTampungKg} kg, Terpakai: ${res.data?.data?.persentaseKapasitasTerpakai}%`
    );
  } catch (err) {
    record("8. Mitra Operational Dashboard", "GET /mitra/dashboard/1", false, err.message);
  }

  // 9. Mitra: Bursa Limbah Sirkular
  try {
    const res = await request("GET", "/mitra/limbah/bursa");
    record(
      "9. Mitra Waste Market Bursa",
      "GET /mitra/limbah/bursa",
      res.status === 200 && res.data?.success,
      `Tersedia: ${res.data?.total} batch limbah`
    );
  } catch (err) {
    record("9. Mitra Waste Market Bursa", "GET /mitra/limbah/bursa", false, err.message);
  }

  // 10. Mitra: Antrean Penjemputan Milik Mitra
  try {
    const res = await request("GET", "/mitra/limbah/penjemputan/1");
    record(
      "10. Mitra Pickup Queue",
      "GET /mitra/limbah/penjemputan/1",
      res.status === 200 && res.data?.success,
      `Total batch: ${res.data?.total}`
    );
  } catch (err) {
    record("10. Mitra Pickup Queue", "GET /mitra/limbah/penjemputan/1", false, err.message);
  }

  // 11. Mitra: Update Status Penjemputan Limbah (Batch 1 ke Selesai)
  try {
    const res = await request("PUT", "/mitra/limbah/1/status", {
      id_mitra: 1,
      status_jemput: "Selesai",
    });
    record(
      "11. Mitra Complete Waste Pickup",
      "PUT /mitra/limbah/1/status",
      res.status === 200 && res.data?.data?.status_jemput === "Selesai",
      `Batch #1 berstatus Selesai, Kas Keuangan terbit otomatis`
    );
  } catch (err) {
    record("11. Mitra Complete Waste Pickup", "PUT /mitra/limbah/1/status", false, err.message);
  }

  // 12. Mitra: Riwayat Logistik Pengiriman Pesanan
  try {
    const res = await request("GET", "/mitra/pengiriman/1");
    record(
      "12. Mitra Logistics Shipments",
      "GET /mitra/pengiriman/1",
      res.status === 200 && res.data?.success,
      `Total pengiriman: ${res.data?.total}`
    );
  } catch (err) {
    record("12. Mitra Logistics Shipments", "GET /mitra/pengiriman/1", false, err.message);
  }

  console.log("\n==========================================================");
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`📊 HASIL PENGUJIAN: ${passedCount} / ${results.length} BERHASIL`);
  console.log("==========================================================");
}

runTests();
