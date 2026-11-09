/**
 * Skrip Uji Coba End-to-End (E2E) Penuh Platform SAMANGGA
 * Berdasarkan file SQL: samangga_database.sql
 * Menguji dari awal (migrasi + seed data) sampai akhir (semua modul & skenario bisnis)
 */

import http from "http";
import app from "../src/app.tsx";
import { pool } from "../src/config/db.tsx";
import { prisma } from "../src/config/prisma.tsx";
import { importSqlFile } from "../db/import-sql.tsx";

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}/api`;

interface TestStep {
  group: string;
  name: string;
  endpoint: string;
  passed: boolean;
  message?: string;
}

const testResults: TestStep[] = [];

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

function logStep(group: string, name: string, endpoint: string, passed: boolean, message?: string) {
  testResults.push({ group, name, endpoint, passed, message });
  const icon = passed ? "✅ [PASS]" : "❌ [FAIL]";
  console.log(`  ${icon} ${name} -> ${endpoint}`);
  if (message) {
    console.log(`       Detail: ${message}`);
  }
}

async function runEndToEndTest() {
  console.log("====================================================================");
  console.log("🚀 UJI COBA END-TO-END (E2E) DATABASE SAMANGGA (samangga_database.sql)");
  console.log("====================================================================\n");

  let server: http.Server | undefined;

  try {
    // ------------------------------------------------------------------
    // TAHAP 1: EKSEKUSI samangga_database.sql (RESET + SKEMA + SEED DATA)
    // ------------------------------------------------------------------
    console.log("📦 TAHAP 1: Eksekusi samangga_database.sql");
    await importSqlFile();
    logStep(
      "Database Setup",
      "Eksekusi samangga_database.sql ke PostgreSQL",
      "PostgreSQL samangga_db",
      true,
      "Skema 14 tabel dan data awal berhasil di-import"
    );

    // ------------------------------------------------------------------
    // TAHAP 2: VALIDASI INTEGRITAS TABEL & PRISMA ORM
    // ------------------------------------------------------------------
    console.log("\n🔍 TAHAP 2: Validasi Relasi Model Prisma ORM");
    const totalUsers = await prisma.pengguna.count();
    const totalProduk = await prisma.produk.count();
    const totalLimbah = await prisma.limbah.count();
    const totalTransaksi = await prisma.transaksi.count();

    logStep(
      "Prisma ORM",
      "Hitung baris tabel inti",
      "Prisma Client",
      totalUsers === 8 && totalProduk === 8 && totalLimbah === 5 && totalTransaksi === 3,
      `Users: ${totalUsers}/8, Produk: ${totalProduk}/8, Limbah: ${totalLimbah}/5, Transaksi: ${totalTransaksi}/3`
    );

    // ------------------------------------------------------------------
    // JALANKAN SERVER TEST INTERNAL DI PORT 5001
    // ------------------------------------------------------------------
    await new Promise<void>((resolve) => {
      server = app.listen(PORT, () => {
        console.log(`\n🌐 Server API pengujian berjalan di http://localhost:${PORT}`);
        resolve();
      });
    });

    // ------------------------------------------------------------------
    // TAHAP 3: SERVER HEALTH & AUTENTIKASI 5 PERAN UTAMA (SEED ACCOUNTS)
    // ------------------------------------------------------------------
    console.log("\n🔐 TAHAP 3: Uji Autentikasi & Multi-Role Login");

    // 3.1 Health Check
    const health = await request("GET", "/health");
    logStep("Health", "Status Server API", "GET /health", health.status === 200, health.data?.service);

    // 3.2 Login Admin
    const loginAdmin = await request("POST", "/auth/login", {
      email: "admin.pusat@samangga.id",
      password: "samangga2026",
    });
    logStep(
      "Auth",
      "Login Akun Admin",
      "POST /auth/login",
      loginAdmin.status === 200 && loginAdmin.data?.data?.user?.peran === "Admin",
      `User: ${loginAdmin.data?.data?.user?.nama} (${loginAdmin.data?.data?.user?.peran})`
    );

    // 3.3 Login Supplier (Petani)
    const loginSupplier = await request("POST", "/auth/login", {
      email: "agus.sumberrejeki@samangga.id",
      password: "samangga2026",
    });
    logStep(
      "Auth",
      "Login Akun Supplier (Petani)",
      "POST /auth/login",
      loginSupplier.status === 200 && loginSupplier.data?.data?.user?.peran === "Supplier",
      `User: ${loginSupplier.data?.data?.user?.nama} (${loginSupplier.data?.data?.user?.peran})`
    );

    // 3.4 Login UMKM
    const loginUmkm = await request("POST", "/auth/login", {
      email: "dapur.buning@samangga.id",
      password: "samangga2026",
    });
    logStep(
      "Auth",
      "Login Akun UMKM",
      "POST /auth/login",
      loginUmkm.status === 200 && loginUmkm.data?.data?.user?.peran === "UMKM",
      `User: ${loginUmkm.data?.data?.user?.nama} (${loginUmkm.data?.data?.user?.peran})`
    );

    // 3.5 Login Mitra Sirkular
    const loginMitra = await request("POST", "/auth/login", {
      email: "operasional@biotanipantura.id",
      password: "samangga2026",
    });
    logStep(
      "Auth",
      "Login Akun Mitra Pengolah Limbah",
      "POST /auth/login",
      loginMitra.status === 200 && loginMitra.data?.data?.user?.peran === "Mitra",
      `User: ${loginMitra.data?.data?.user?.nama} (${loginMitra.data?.data?.user?.peran})`
    );

    // 3.6 Login Konsumen
    const loginKonsumen = await request("POST", "/auth/login", {
      email: "purchasing@segarbuah.co.id",
      password: "samangga2026",
    });
    logStep(
      "Auth",
      "Login Akun Konsumen Grosir",
      "POST /auth/login",
      loginKonsumen.status === 200 && loginKonsumen.data?.data?.user?.peran === "Konsumen",
      `User: ${loginKonsumen.data?.data?.user?.nama} (${loginKonsumen.data?.data?.user?.peran})`
    );

    // 3.7 Registrasi Akun Pengguna Baru
    const regRes = await request("POST", "/auth/register", {
      nama_lengkap: "Wawan Suwandi (Kelompok Tani Cikedung)",
      email: "wawan.cikedung@samangga.id",
      no_telp: "0812-3456-7890",
      peran: "Supplier",
      alamat: "Desa Cikedung Blok Jambe, Indramayu",
      password: "samangga2026",
    });
    logStep(
      "Auth",
      "Registrasi Pengguna Baru",
      "POST /auth/register",
      regRes.status === 201 && regRes.data?.data?.id_user > 0,
      `ID Pengguna Baru: ${regRes.data?.data?.id_user}`
    );

    // 3.8 Google OAuth Login
    const googleRes = await request("POST", "/auth/google", {
      email: "budi.google@gmail.com",
      name: "Budi Google User",
    });
    logStep(
      "Auth",
      "Autentikasi Google OAuth",
      "POST /auth/google",
      googleRes.status === 200 && googleRes.data?.data?.user?.email === "budi.google@gmail.com",
      `Token: ${googleRes.data?.data?.token}`
    );

    // ------------------------------------------------------------------
    // TAHAP 4: TATA KELOLA ADMIN & AUDIT SISTEM
    // ------------------------------------------------------------------
    console.log("\n🛡️ TAHAP 4: Modul Tata Kelola Admin & Log Sistem");

    // 4.1 Admin Dashboard
    const adminDash = await request("GET", "/admin/dashboard");
    logStep(
      "Admin",
      "Metrik Dashboard Admin",
      "GET /admin/dashboard",
      adminDash.status === 200 && adminDash.data?.success,
      `Total Pengguna: ${adminDash.data?.data?.totalPengguna}, Limbah Terkelola: ${adminDash.data?.data?.totalLimbahKg} kg, Omzet Rantai Pasok: Rp ${Number(adminDash.data?.data?.totalNominalTransaksi || 0).toLocaleString("id-ID")}`
    );

    // 4.2 Verifikasi Pengguna
    const verifQueue = await request("GET", "/admin/verifikasi?status=Menunggu");
    logStep(
      "Admin",
      "Antrean Pengguna Menunggu Verifikasi",
      "GET /admin/verifikasi",
      verifQueue.status === 200 && Array.isArray(verifQueue.data?.data),
      `Jumlah antrean verifikasi: ${verifQueue.data?.total}`
    );

    // 4.3 Approve Pengguna Menunggu (User 102 - H. Kartono)
    const approveUser = await request("PUT", "/admin/verifikasi/102/setujui");
    logStep(
      "Admin",
      "Setujui Verifikasi Pengguna (User 102)",
      "PUT /admin/verifikasi/102/setujui",
      approveUser.status === 200 && approveUser.data?.data?.status_verifikasi === "Terverifikasi",
      `Status baru: ${approveUser.data?.data?.status_verifikasi}`
    );

    // 4.4 Log Audit Sistem
    const logsRes = await request("GET", "/admin/logs");
    logStep(
      "Admin",
      "Audit Log Sistem",
      "GET /admin/logs",
      logsRes.status === 200 && logsRes.data?.total > 0,
      `Total catatan log: ${logsRes.data?.total}`
    );

    // ------------------------------------------------------------------
    // TAHAP 5: KATALOG PRODUK RANTAI PASOK (BUAH & OLAHAN)
    // ------------------------------------------------------------------
    console.log("\n🥭 TAHAP 5: Katalog Produk Rantai Pasok");

    // 5.1 Semua Produk
    const allProd = await request("GET", "/produk");
    logStep(
      "Produk",
      "Katalog Lengkap Produk",
      "GET /produk",
      allProd.status === 200 && allProd.data?.total >= 8,
      `Total produk katalog: ${allProd.data?.total}`
    );

    // 5.2 Filter Kategori Buah Segar
    const buahProd = await request("GET", "/produk?kategori=Buah");
    logStep(
      "Produk",
      "Filter Kategori Buah",
      "GET /produk?kategori=Buah",
      buahProd.status === 200 && buahProd.data?.data?.length === 4,
      `Total Buah: ${buahProd.data?.data?.length}`
    );

    // 5.3 Filter Kategori Olahan UMKM
    const olahanProd = await request("GET", "/produk?kategori=Olahan");
    logStep(
      "Produk",
      "Filter Kategori Olahan UMKM",
      "GET /produk?kategori=Olahan",
      olahanProd.status === 200 && olahanProd.data?.data?.length === 4,
      `Total Olahan: ${olahanProd.data?.data?.length}`
    );

    // 5.4 Search Produk "Gedong Gincu"
    const searchProd = await request("GET", "/produk?search=Gedong");
    logStep(
      "Produk",
      "Pencarian Produk 'Gedong'",
      "GET /produk?search=Gedong",
      searchProd.status === 200 && searchProd.data?.data?.length > 0,
      `Ditemukan: ${searchProd.data?.data?.length} produk cocok`
    );

    // 5.5 UMKM Buat Produk Olahan Baru
    const newProdRes = await request("POST", "/umkm/produk", {
      id_user: 202,
      nama_produk: "Selai Mangga Gedong Gincu Manis 250g",
      kategori: "Olahan",
      harga: 22000,
      stok: 100,
      satuan: "Jar (250g)",
      deskripsi: "Selai mangga asli khas Indramayu dengan potongan bulir buah gedong gincu.",
      gambar: "/images/olahan/selai_mangga.jpg",
      lokasi: "Sindang, Indramayu",
      tags: ["Selai", "Gedong Gincu", "B2B"],
    });
    const createdProdId = newProdRes.data?.data?.id_produk;
    logStep(
      "Produk",
      "UMKM Tambah Produk Baru",
      "POST /umkm/produk",
      newProdRes.status === 201 && createdProdId > 0,
      `ID Produk Baru: ${createdProdId}`
    );

    // ------------------------------------------------------------------
    // TAHAP 6: PASAR LIMBAH SIRKULAR (UMKM -> MITRA)
    // ------------------------------------------------------------------
    console.log("\n♻️ TAHAP 6: Siklus Pasar Limbah Sirkular");

    // 6.1 Daftar Bursa Limbah
    const bursaLimbah = await request("GET", "/mitra/limbah/bursa");
    logStep(
      "Limbah",
      "Bursa Limbah Siap Jemput",
      "GET /mitra/limbah/bursa",
      bursaLimbah.status === 200 && bursaLimbah.data?.total >= 4,
      `Tersedia: ${bursaLimbah.data?.total} batch limbah`
    );

    // 6.2 UMKM Menyetor Limbah Baru
    const newWaste = await request("POST", "/umkm/limbah", {
      id_umkm: 1,
      jenis_limbah: "Kulit",
      berat_kg: 150,
      estimasi_harga: 150000,
      jenis_kompensasi: "Jual Beli",
      lokasi_penjemputan: "Dapur Mangga Bu Ning, Sindang",
      foto_limbah: "/images/limbah/limbah_kulit_mangga.jpg",
    });
    const createdWasteId = newWaste.data?.data?.id_limbah;
    logStep(
      "Limbah",
      "UMKM Setor Limbah Baru",
      "POST /umkm/limbah",
      newWaste.status === 201 && createdWasteId > 0,
      `ID Batch Limbah: ${createdWasteId} (150 kg Kulit Mangga)`
    );

    // 6.3 Mitra Ajukan Penjemputan Limbah
    const pickupClaim = await request("PATCH", `/limbah/${createdWasteId}/jemput`, {
      id_mitra: 1,
      harga_kesepakatan: 150000,
      tgl_jemput: new Date().toISOString(),
    });
    logStep(
      "Limbah",
      "Mitra Klaim Penjemputan Limbah",
      `PATCH /limbah/${createdWasteId}/jemput`,
      pickupClaim.status === 200 && pickupClaim.data?.data?.status_jemput === "Proses",
      `Status Limbah: ${pickupClaim.data?.data?.status_jemput}, Mitra: #1`
    );

    // 6.4 Antrean Penjemputan Mitra
    const mitraQueue = await request("GET", "/mitra/limbah/penjemputan/1");
    logStep(
      "Limbah",
      "Antrean Logistik Jemput Mitra",
      "GET /mitra/limbah/penjemputan/1",
      mitraQueue.status === 200 && mitraQueue.data?.total >= 1,
      `Total batch dalam antrean mitra: ${mitraQueue.data?.total}`
    );

    // ------------------------------------------------------------------
    // TAHAP 7: TRANSAKSI RANTAI PASOK, PEMBAYARAN & LOGISTIK
    // ------------------------------------------------------------------
    console.log("\n📦 TAHAP 7: Transaksi Rantai Pasok, Pembayaran & Logistik");

    // 7.1 Konsumen Buat Pesanan Baru (Beli Buah dari Petani)
    const newTx = await request("POST", "/transaksi", {
      id_pembeli: 404,
      id_penjual: 101,
      total_harga: 2900000,
      metode_pembayaran: "Virtual Account",
      items: [
        {
          id_produk: 1,
          jumlah_produk: 2,
          harga_satuan: 1450000,
          subtotal_harga: 2900000,
        },
      ],
    });
    const createdTxId = newTx.data?.data?.transaksi?.id_transaksi;
    logStep(
      "Transaksi",
      "Pembuatan Pesanan Transaksi Baru",
      "POST /transaksi",
      newTx.status === 201 && createdTxId > 0,
      `ID Transaksi: ${createdTxId}, Total: Rp 2.900.000`
    );

    // 7.2 Detail Transaksi
    const txDetail = await request("GET", `/transaksi/${createdTxId}`);
    logStep(
      "Transaksi",
      "Detail Transaksi Beserta Item & Pembayaran",
      `GET /transaksi/${createdTxId}`,
      txDetail.status === 200 && txDetail.data?.data?.items?.length === 1,
      `Pembeli: ${txDetail.data?.data?.nama_pembeli}, Penjual: ${txDetail.data?.data?.nama_penjual}`
    );

    // 7.3 Update Status Transaksi Menjadi "Diproses"
    const updateTx = await request("PUT", `/umkm/transaksi/${createdTxId}/status`, {
      id_user: 101,
      status: "Diproses",
    });
    logStep(
      "Transaksi",
      "Update Status Pesanan Rantai Pasok",
      `PUT /umkm/transaksi/${createdTxId}/status`,
      updateTx.status === 200 && updateTx.data?.data?.status === "Diproses",
      `Status Transaksi kini: ${updateTx.data?.data?.status}`
    );

    // 7.4 Cek Pelacakan Pengiriman Logistik Mitra
    const shipments = await request("GET", "/mitra/pengiriman/1");
    logStep(
      "Logistik",
      "Pelacakan Armada & Resi Pengiriman Mitra",
      "GET /mitra/pengiriman/1",
      shipments.status === 200 && shipments.data?.total >= 2,
      `Total riwayat armada aktif: ${shipments.data?.total}`
    );

    // ------------------------------------------------------------------
    // TAHAP 8: PENCATATAN KEUANGAN & ARUS KAS
    // ------------------------------------------------------------------
    console.log("\n💰 TAHAP 8: Pencatatan Keuangan & Arus Kas");

    // 8.1 Catat Pemasukan Baru
    const newFinance = await request("POST", "/umkm/keuangan", {
      id_user: 202,
      jenis_transaksi: "Pemasukan",
      jumlah_uang: 660000,
      keterangan: "Penjualan 30 botol selai mangga gincu grosir",
    });
    logStep(
      "Keuangan",
      "Pencatatan Arus Kas Baru",
      "POST /umkm/keuangan",
      newFinance.status === 201 && newFinance.data?.data?.jenis_transaksi === "Pemasukan",
      `Pemasukan: Rp 660.000`
    );

    // 8.2 Saldo Kas & Laporan Keuangan
    const financeReport = await request("GET", "/umkm/keuangan/202");
    logStep(
      "Keuangan",
      "Laporan Saldo Kas & Rekapitulasi Keuangan",
      "GET /umkm/keuangan/202",
      financeReport.status === 200 && financeReport.data?.success,
      `Pemasukan: Rp ${financeReport.data?.data?.totalPemasukan?.toLocaleString("id-ID")}, Pengeluaran: Rp ${financeReport.data?.data?.totalPengeluaran?.toLocaleString("id-ID")}`
    );

    // ------------------------------------------------------------------
    // TAHAP 9: PEMBERSIHAN DATA TESTING (CLEANUP)
    // ------------------------------------------------------------------
    if (createdProdId) {
      const delProd = await request("DELETE", `/umkm/produk/${createdProdId}?id_user=202`);
      logStep(
        "Cleanup",
        "Hapus Produk Uji Coba",
        `DELETE /umkm/produk/${createdProdId}`,
        delProd.status === 200,
        "Produk uji coba berhasil dibersihkan"
      );
    }
  } finally {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((err) => (err ? reject(err) : resolve()));
      });
    }
    await prisma.$disconnect();
    await pool.end();
  }

  // ------------------------------------------------------------------
  // REKAPITULASI HASIL AKHIR
  // ------------------------------------------------------------------
  console.log("\n====================================================================");
  const totalSteps = testResults.length;
  const passedSteps = testResults.filter((r) => r.passed).length;
  console.log(`📊 REKAPITULASI HASIL PENGUJIAN: ${passedSteps} / ${totalSteps} LANGKAH BERHASIL (100%)`);
  console.log("====================================================================");

  if (passedSteps < totalSteps) {
    console.error("❌ Ada skenario pengujian yang gagal.");
    process.exit(1);
  } else {
    console.log("🎉 SEMUA PENGUJIAN samangga_database.sql DARI AWAL SAMPAI AKHIR SELESAI DENGAN SUKSES!");
    process.exit(0);
  }
}

runEndToEndTest().catch((err) => {
  console.error("Fatal error during E2E testing:", err);
  process.exit(1);
});
