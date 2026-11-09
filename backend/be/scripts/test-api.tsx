
import http from "http";
import app from "../src/app.tsx";
import { pool } from "../src/config/db.tsx";

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

interface TestResult {
  name: string;
  endpoint: string;
  passed: boolean;
  message?: string;
}

const results: TestResult[] = [];

async function request(method: string, path: string, body?: any): Promise<{ status: number; data: any }> {
  const url = `${BASE_URL}${path}`;
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

function record(name: string, endpoint: string, passed: boolean, message?: string) {
  results.push({ name, endpoint, passed, message });
  const icon = passed ? "✅ [PASS]" : "❌ [FAIL]";
  console.log(`${icon} ${name} (${endpoint})`);
  if (!passed && message) console.log(`    Detail: ${message}`);
  else if (message) console.log(`    Info: ${message}`);
}

async function runTests() {
  console.log("==========================================================");
  console.log("🧪 MEMULAI PENGUJIAN ENDPOINT ADMIN, MITRA & UMKM (TSX)");
  console.log(`📡 Base URL: ${BASE_URL}`);
  console.log("==========================================================\n");

  let server: http.Server | undefined;
  try {
    const check = await fetch(`${BASE_URL}/health`).catch(() => null);
    if (!check || !check.ok) {
      server = http.createServer(app);
      await new Promise<void>((resolve) => server!.listen(PORT, resolve));
      console.log(`🚀 Server pengujian internal aktif di port ${PORT}\n`);
    }
  } catch (e) {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server!.listen(PORT, resolve));
  }

  try {
    try {
      const res = await request("GET", "/health");
      record("1. Server Health Check", "GET /health", res.status === 200 && res.data?.status === "ok");
    } catch (err: any) {
      record("1. Server Health Check", "GET /health", false, err.message);
    }

    try {
      const res = await request("GET", "/admin/dashboard");
      const ok = res.status === 200 && res.data?.success && res.data?.data?.totalPengguna > 0;
      record(
        "2. Admin Dashboard Metrics",
        "GET /admin/dashboard",
        ok,
        `Total Pengguna: ${res.data?.data?.totalPengguna}, Limbah: ${res.data?.data?.totalLimbahKg} kg`
      );
    } catch (err: any) {
      record("2. Admin Dashboard Metrics", "GET /admin/dashboard", false, err.message);
    }

    try {
      const res = await request("GET", "/admin/verifikasi");
      record("3. Admin Verifikasi Queue", "GET /admin/verifikasi", res.status === 200 && res.data?.success);
    } catch (err: any) {
      record("3. Admin Verifikasi Queue", "GET /admin/verifikasi", false, err.message);
    }

    try {
      const res = await request("PUT", "/admin/verifikasi/101/setujui", { admin_id: 505 });
      record(
        "4. Admin Approve User",
        "PUT /admin/verifikasi/101/setujui",
        res.status === 200 && res.data?.data?.status_verifikasi === "Terverifikasi"
      );
    } catch (err: any) {
      record("4. Admin Approve User", "PUT /admin/verifikasi/101/setujui", false, err.message);
    }

    try {
      const res = await request("GET", "/admin/logs");
      record(
        "5. Admin Audit Logs",
        "GET /admin/logs",
        res.status === 200 && Array.isArray(res.data?.data) && res.data?.data.length > 0,
        `Total Log: ${res.data?.total}`
      );
    } catch (err: any) {
      record("5. Admin Audit Logs", "GET /admin/logs", false, err.message);
    }

    try {
      const res = await request("GET", "/mitra");
      record("6. Mitra Public List", "GET /mitra", res.status === 200 && res.data?.success);
    } catch (err: any) {
      record("6. Mitra Public List", "GET /mitra", false, err.message);
    }

    try {
      const res = await request("GET", "/mitra/profil/303");
      record(
        "7. Mitra Profile Detail",
        "GET /mitra/profil/303",
        res.status === 200 && res.data?.data?.id_mitra === 1,
        `Instansi: ${res.data?.data?.nama_mitra_instansi}`
      );
    } catch (err: any) {
      record("7. Mitra Profile Detail", "GET /mitra/profil/303", false, err.message);
    }

    try {
      const res = await request("GET", "/mitra/dashboard/1");
      record(
        "8. Mitra Operational Dashboard",
        "GET /mitra/dashboard/1",
        res.status === 200 && res.data?.data?.kapasitasTampungKg > 0,
        `Kapasitas: ${res.data?.data?.kapasitasTampungKg} kg, Terpakai: ${res.data?.data?.persentaseKapasitasTerpakai}%`
      );
    } catch (err: any) {
      record("8. Mitra Operational Dashboard", "GET /mitra/dashboard/1", false, err.message);
    }

    try {
      const res = await request("GET", "/mitra/limbah/bursa");
      record(
        "9. Mitra Waste Market Bursa",
        "GET /mitra/limbah/bursa",
        res.status === 200 && res.data?.success,
        `Tersedia: ${res.data?.total} batch limbah`
      );
    } catch (err: any) {
      record("9. Mitra Waste Market Bursa", "GET /mitra/limbah/bursa", false, err.message);
    }

    try {
      const res = await request("GET", "/mitra/limbah/penjemputan/1");
      record(
        "10. Mitra Pickup Queue",
        "GET /mitra/limbah/penjemputan/1",
        res.status === 200 && res.data?.success,
        `Total batch: ${res.data?.total}`
      );
    } catch (err: any) {
      record("10. Mitra Pickup Queue", "GET /mitra/limbah/penjemputan/1", false, err.message);
    }

    try {
      const res = await request("GET", "/mitra/pengiriman/1");
      record(
        "11. Mitra Logistics Shipments",
        "GET /mitra/pengiriman/1",
        res.status === 200 && res.data?.success,
        `Total pengiriman: ${res.data?.total}`
      );
    } catch (err: any) {
      record("11. Mitra Logistics Shipments", "GET /mitra/pengiriman/1", false, err.message);
    }

    console.log("\n----------------------------------------------------------");
    console.log("🏪 PENGUJIAN MODUL OPERASIONAL UMKM (DATABASE POSTGRESQL - TSX)");
    console.log("----------------------------------------------------------");

    try {
      const res = await request("GET", "/umkm");
      record(
        "12. UMKM Public List",
        "GET /umkm",
        res.status === 200 && res.data?.success && res.data?.data?.length >= 2,
        `Total UMKM terdaftar: ${res.data?.total}`
      );
    } catch (err: any) {
      record("12. UMKM Public List", "GET /umkm", false, err.message);
    }

    try {
      const res = await request("GET", "/umkm/profil/202");
      record(
        "13. UMKM Profile Detail",
        "GET /umkm/profil/202",
        res.status === 200 && res.data?.data?.id_umkm === 1,
        `Usaha: ${res.data?.data?.nama_usaha}, NIB: ${res.data?.data?.nib}, Kapasitas: ${res.data?.data?.kapasitas_produksi_bulanan} pcs/bln`
      );
    } catch (err: any) {
      record("13. UMKM Profile Detail", "GET /umkm/profil/202", false, err.message);
    }

    try {
      const res = await request("PUT", "/umkm/profil/202", {
        nama_usaha: "Dapur Mangga Bu Ning Prima",
        kapasitas_produksi_bulanan: 1500,
        nama_bank: "Bank Mandiri",
      });
      record(
        "14. UMKM Update Profile",
        "PUT /umkm/profil/202",
        res.status === 200 && res.data?.data?.nama_usaha === "Dapur Mangga Bu Ning Prima",
        `Nama baru: ${res.data?.data?.nama_usaha}, Kapasitas baru: ${res.data?.data?.kapasitas_produksi_bulanan}`
      );
    } catch (err: any) {
      record("14. UMKM Update Profile", "PUT /umkm/profil/202", false, err.message);
    }

    try {
      const res = await request("GET", "/umkm/dashboard/1?by_umkm_id=true");
      const d = res.data?.data;
      const ok = res.status === 200 && res.data?.success && d?.katalog?.totalProduk > 0;
      record(
        "15. UMKM Comprehensive Dashboard",
        "GET /umkm/dashboard/1",
        ok,
        `Produk: ${d?.katalog?.totalProduk}, Stok: ${d?.katalog?.totalStokUnit}, Omzet: Rp ${d?.penjualan?.omzetSelesai?.toLocaleString("id-ID")}, Belanja: Rp ${d?.pembelianBahanBaku?.totalBelanjaSelesai?.toLocaleString("id-ID")}`
      );
    } catch (err: any) {
      record("15. UMKM Comprehensive Dashboard", "GET /umkm/dashboard/1", false, err.message);
    }

    try {
      const res = await request("GET", "/umkm/produk/202");
      record(
        "16. UMKM Processed Products List",
        "GET /umkm/produk/202",
        res.status === 200 && res.data?.success && res.data?.data?.length > 0,
        `Total produk olahan: ${res.data?.total}`
      );
    } catch (err: any) {
      record("16. UMKM Processed Products List", "GET /umkm/produk/202", false, err.message);
    }

    let createdProductId: number | null = null;
    try {
      const res = await request("POST", "/umkm/produk", {
        id_user: 202,
        nama_produk: "Sambal Mangga Gedong Gincu Botol 200g",
        kategori: "Olahan",
        harga: 22000,
        stok: 120,
        satuan: "Botol",
        deskripsi: "Sambal terasi mangga muda asam manis pedas nikmat kemasan botol higienis.",
        lokasi: "Sindang, Indramayu",
        tags: ["Pedas", "Sambal", "Oleh-oleh"],
      });
      createdProductId = res.data?.data?.id_produk;
      record(
        "17. UMKM Create Processed Product",
        "POST /umkm/produk",
        res.status === 201 && createdProductId !== null,
        `Produk baru #${createdProductId}: ${res.data?.data?.nama_produk} (Rp ${res.data?.data?.harga}/${res.data?.data?.satuan})`
      );
    } catch (err: any) {
      record("17. UMKM Create Processed Product", "POST /umkm/produk", false, err.message);
    }

    if (createdProductId) {
      try {
        const res = await request("PUT", `/umkm/produk/${createdProductId}`, {
          id_user: 202,
          harga: 25000,
          stok: 150,
          deskripsi: "Formula disempurnakan dengan minyak kelapa asli dan potongan mangga lebih melimpah.",
        });
        record(
          "18. UMKM Update Processed Product",
          `PUT /umkm/produk/${createdProductId}`,
          res.status === 200 && res.data?.data?.harga == 25000 && res.data?.data?.stok === 150,
          `Harga terupdate: Rp ${res.data?.data?.harga}, Stok: ${res.data?.data?.stok}`
        );
      } catch (err: any) {
        record("18. UMKM Update Processed Product", `PUT /umkm/produk/${createdProductId}`, false, err.message);
      }
    }

    let createdLimbahId: number | null = null;
    try {
      const res = await request("POST", "/umkm/limbah", {
        id_umkm: 1,
        jenis_limbah: "Kulit",
        berat_kg: 95,
        estimasi_harga: 95000,
        jenis_kompensasi: "Jual Beli",
        lokasi_penjemputan: "Dapur Produksi Bu Ning, Jl. Raya Sindang No. 45, Indramayu",
        titik_koordinat: "-6.3241, 108.3189",
        foto_limbah: "/images/limbah/limbah_kulit_mangga.jpg",
      });
      createdLimbahId = res.data?.data?.id_limbah;
      record(
        "19. UMKM Deposit Mango Waste",
        "POST /umkm/limbah",
        res.status === 201 && createdLimbahId !== null,
        `Batch limbah baru #${createdLimbahId}: ${res.data?.data?.jenis_limbah} (${res.data?.data?.berat_kg} kg, Estimasi: Rp ${res.data?.data?.estimasi_harga})`
      );
    } catch (err: any) {
      record("19. UMKM Deposit Mango Waste", "POST /umkm/limbah", false, err.message);
    }

    try {
      const res = await request("GET", "/umkm/limbah/1");
      record(
        "20. UMKM My Waste History",
        "GET /umkm/limbah/1",
        res.status === 200 && res.data?.success && res.data?.data?.length > 0,
        `Total batch limbah disetor: ${res.data?.total}`
      );
    } catch (err: any) {
      record("20. UMKM My Waste History", "GET /umkm/limbah/1", false, err.message);
    }

    try {
      const res = await request("GET", "/umkm/transaksi/penjualan/202");
      record(
        "21. UMKM Sales Orders Incoming",
        "GET /umkm/transaksi/penjualan/202",
        res.status === 200 && res.data?.success && Array.isArray(res.data?.data),
        `Total transaksi penjualan olahan: ${res.data?.total}`
      );
    } catch (err: any) {
      record("21. UMKM Sales Orders Incoming", "GET /umkm/transaksi/penjualan/202", false, err.message);
    }

    try {
      const res = await request("GET", "/umkm/transaksi/pembelian/202");
      record(
        "22. UMKM Raw Material Purchase Orders",
        "GET /umkm/transaksi/pembelian/202",
        res.status === 200 && res.data?.success && Array.isArray(res.data?.data),
        `Total transaksi belanja buah mangga: ${res.data?.total}`
      );
    } catch (err: any) {
      record("22. UMKM Raw Material Purchase Orders", "GET /umkm/transaksi/pembelian/202", false, err.message);
    }

    try {
      const res = await request("PUT", "/umkm/transaksi/1003/status", {
        id_user: 202,
        status: "Diproses",
      });
      record(
        "23. UMKM Update Order Status",
        "PUT /umkm/transaksi/1003/status",
        res.status === 200 && res.data?.data?.status === "Diproses",
        `Status transaksi #1003 kini: ${res.data?.data?.status}`
      );
    } catch (err: any) {
      record("23. UMKM Update Order Status", "PUT /umkm/transaksi/1003/status", false, err.message);
    }

    try {
      const res = await request("GET", "/umkm/keuangan/202");
      const k = res.data?.data;
      record(
        "24. UMKM Financial Ledger & Cash Flow",
        "GET /umkm/keuangan/202",
        res.status === 200 && res.data?.success && k?.totalCatatan > 0,
        `Pemasukan: Rp ${k?.totalPemasukan?.toLocaleString("id-ID")}, Pengeluaran: Rp ${k?.totalPengeluaran?.toLocaleString("id-ID")}, Saldo Kas: Rp ${k?.saldoBersih?.toLocaleString("id-ID")}`
      );
    } catch (err: any) {
      record("24. UMKM Financial Ledger & Cash Flow", "GET /umkm/keuangan/202", false, err.message);
    }

    try {
      const res = await request("POST", "/umkm/keuangan", {
        id_user: 202,
        jenis_transaksi: "Pengeluaran",
        jumlah_uang: 250000,
        keterangan: "Pembelian botol kaca dan label kemasan sambal mangga 200g",
      });
      record(
        "25. UMKM Record Financial Entry",
        "POST /umkm/keuangan",
        res.status === 201 && res.data?.data?.jenis_transaksi === "Pengeluaran",
        `Kas tercatat: ${res.data?.data?.jenis_transaksi} Rp ${parseFloat(res.data?.data?.jumlah_uang).toLocaleString("id-ID")} (${res.data?.data?.keterangan})`
      );
    } catch (err: any) {
      record("25. UMKM Record Financial Entry", "POST /umkm/keuangan", false, err.message);
    }

    if (createdProductId) {
      try {
        const res = await request("DELETE", `/umkm/produk/${createdProductId}?id_user=202`);
        record(
          "26. UMKM Delete Product",
          `DELETE /umkm/produk/${createdProductId}`,
          res.status === 200 && res.data?.success,
          `Produk #${createdProductId} berhasil dibersihkan dari katalog.`
        );
      } catch (err: any) {
        record("26. UMKM Delete Product", `DELETE /umkm/produk/${createdProductId}`, false, err.message);
      }
    }
  } finally {
    if (server) {
      await new Promise<void>((resolve, reject) =>
        server!.close((err) => (err ? reject(err) : resolve()))
      );
    }
    await pool.end();
  }

  console.log("\n==========================================================");
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`📊 HASIL PENGUJIAN: ${passedCount} / ${results.length} BERHASIL (TSX)`);
  console.log("==========================================================");

  if (passedCount < results.length) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
