import { prisma } from "../src/config/prisma.tsx";

async function main() {
  console.log("==================================================");
  console.log("🐘 VERIFIKASI PRISMA ORM & POSTGRESQL (TSX)");
  console.log("==================================================");

  try {
    const totalPengguna = await prisma.pengguna.count();
    console.log(`✅ [PASS] Total Pengguna terdaftar: ${totalPengguna}`);

    const daftarUmkm = await prisma.umkm.findMany({
      include: {
        pengguna: {
          select: {
            nama_lengkap: true,
            email: true,
            peran: true,
            status_verifikasi: true,
          },
        },
      },
    });
    console.log(`✅ [PASS] Query UMKM dengan relasi Pengguna: ${daftarUmkm.length} UMKM`);
    daftarUmkm.forEach((u) => {
      console.log(`    - UMKM: ${u.nama_usaha} (Owner: ${u.pengguna.nama_lengkap}, Status: ${u.pengguna.status_verifikasi})`);
    });

    const produkOlahan = await prisma.produk.findMany({
      where: { kategori: "Olahan" },
      take: 3,
    });
    console.log(`✅ [PASS] Query Produk Olahan Mangga: ${produkOlahan.length} item`);
    produkOlahan.forEach((p) => {
      console.log(`    - Produk: ${p.nama_produk} (Harga: Rp ${p.harga}, Stok: ${p.stok})`);
    });

    const bursaLimbah = await prisma.limbah.findMany({
      where: { status_jemput: "Tersedia" },
    });
    console.log(`✅ [PASS] Query Bursa Limbah Tersedia: ${bursaLimbah.length} batch`);
    bursaLimbah.forEach((l) => {
      console.log(`    - Limbah: ${l.jenis_limbah} (${l.berat_kg} kg, Lokasi: ${l.lokasi_penjemputan})`);
    });

    const catatanKeuangan = await prisma.pencatatan_keuangan.findMany({
      take: 3,
    });
    console.log(`✅ [PASS] Query Pencatatan Keuangan: ${catatanKeuangan.length} transaksi`);

    console.log("==================================================");
    console.log("🎉 SEMUA QUERY PRISMA ORM BERHASIL DENGAN TIPE AMAN!");
    console.log("==================================================");
  } catch (error) {
    console.error("❌ Gagal menjalankan query Prisma:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
