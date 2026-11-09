import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { PeranPengguna, StatusVerifikasi } from "@/types/samangga";
import type { RoleSlug } from "@/data/profil";
import type { RegisteredUser } from "@/lib/auth";


/**
 * GET /api/daftar
 * Mengambil seluruh daftar pengguna terdaftar dari database Supabase PostgreSQL
 */
export async function GET() {
  try {
    const dbPengguna = await prisma.pengguna.findMany({
      orderBy: {
        id_user: "desc",
      },
      include: {
        mitra: true,
        supplier: true,
        umkm: true,
        konsumen: true,
        admin: true,
      },
    });

    const users: RegisteredUser[] = dbPengguna.map((u) => {
      let roleSlug: RoleSlug = "konsumen";
      const peranLower = u.peran.toLowerCase();
      if (peranLower === "supplier" || peranLower === "petani") {
        roleSlug = "petani";
      } else if (peranLower === "umkm") {
        roleSlug = "umkm";
      } else if (peranLower === "mitra") {
        roleSlug = "mitra";
      } else if (peranLower === "admin") {
        roleSlug = "admin";
      }

      return {
        id: `usr_${u.id_user}`,
        email: u.email,
        namaLengkap: u.nama_lengkap,
        nomorWhatsapp: u.no_telp || "",
        role: roleSlug,
        roleTitle: u.peran,
        peranErd: u.peran as PeranPengguna,
        statusVerifikasi: (u.status_verifikasi as StatusVerifikasi) || "Menunggu",
        fotoPersyaratanUrl: u.foto_persyaratan_url || undefined,
        fotoPersyaratanName: u.foto_persyaratan_name || undefined,
        alasanPenolakan: u.alasan_penolakan || undefined,
        registeredAt: u.tgl_daftar
          ? u.tgl_daftar.toISOString().replace("T", " ").substring(0, 19)
          : new Date().toISOString().replace("T", " ").substring(0, 19),
        fromGoogle: false,
        extraData: {
          namaInstansi: u.mitra?.nama_mitra_instansi || "",
          kapasitasTampung: u.mitra?.kapasitas_tampung_limbah_kg ?? 0,
          jangkauanArea: u.mitra?.jangkauan_area || "",
          luasLahan: u.supplier?.luas_lahan_m2 ?? 0,
          komoditasUtama: u.supplier?.jenis_komoditas_utama || "",
          namaUsaha: u.umkm?.nama_usaha || "",
          nib: u.umkm?.nib || "",
          kapasitasProduksi: u.umkm?.kapasitas_produksi_bulanan ?? 0,
          alamatPengiriman: u.konsumen?.alamat_pengiriman_utama || u.alamat || "",
        },
      };
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Gagal mengambil daftar pengguna dari database:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat pengguna dari database",
        users: [],
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/daftar
 * Menyimpan pendaftaran pengguna baru ke dalam database Supabase PostgreSQL
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      namaLengkap,
      nomorWhatsapp,
      role,
      peranErd,
      statusVerifikasi,
      fotoPersyaratanUrl,
      fotoPersyaratanName,
      alasanPenolakan,
      password,
      alamat,
      extraData,
    } = body;

    if (!email || !namaLengkap) {
      return NextResponse.json(
        { success: false, message: "Email dan nama lengkap wajib diisi." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Tentukan Peran ERD
    let resolvedPeran: PeranPengguna = "Konsumen";
    if (peranErd) {
      resolvedPeran = peranErd;
    } else if (role === "petani" || role === "supplier") {
      resolvedPeran = "Supplier";
    } else if (role === "umkm") {
      resolvedPeran = "UMKM";
    } else if (role === "mitra") {
      resolvedPeran = "Mitra";
    } else if (role === "admin") {
      resolvedPeran = "Admin";
    }

    // Status Verifikasi: Khusus mitra default 'Menunggu' verifikasi Admin, selain itu langsung 'Terverifikasi'
    const resolvedStatus: StatusVerifikasi =
      statusVerifikasi || (resolvedPeran === "Mitra" ? "Menunggu" : "Terverifikasi");

    const plainPassword = password || "Samangga2026!";
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);

    // Cek apakah email sudah terdaftar
    const existing = await prisma.pengguna.findUnique({
      where: { email: normalizedEmail },
      include: {
        mitra: true,
        supplier: true,
        umkm: true,
        konsumen: true,
      },
    });

    let savedUser;

    if (existing) {
      // Perbarui profil jika sudah ada
      savedUser = await prisma.pengguna.update({
        where: { id_user: existing.id_user },
        data: {
          nama_lengkap: namaLengkap.trim(),
          peran: resolvedPeran,
          no_telp: nomorWhatsapp || existing.no_telp,
          alamat: alamat || (extraData?.alamatPengiriman as string) || existing.alamat,
          status_verifikasi: resolvedStatus,
          foto_persyaratan_url: fotoPersyaratanUrl ?? existing.foto_persyaratan_url,
          foto_persyaratan_name: fotoPersyaratanName ?? existing.foto_persyaratan_name,
          alasan_penolakan: alasanPenolakan ?? existing.alasan_penolakan,
        },
      });

      // Update tabel peran spesifik
      if (resolvedPeran === "Mitra") {
        await prisma.mitra.upsert({
          where: { id_user: savedUser.id_user },
          create: {
            id_user: savedUser.id_user,
            nama_mitra_instansi: (extraData?.namaInstansi as string) || namaLengkap,
            no_telp: nomorWhatsapp,
            jenis_pengolahan_limbah: "Bio-Refinery Pupuk Organik & Energi",
            kapasitas_tampung_limbah_kg: Number(extraData?.kapasitasTampung) || 500,
            jangkauan_area: (extraData?.jangkauanArea as string) || "Indramayu & Cirebon",
          },
          update: {
            nama_mitra_instansi: (extraData?.namaInstansi as string) || namaLengkap,
            no_telp: nomorWhatsapp || undefined,
            kapasitas_tampung_limbah_kg: Number(extraData?.kapasitasTampung) || undefined,
            jangkauan_area: (extraData?.jangkauanArea as string) || undefined,
          },
        });
      }
    } else {
      // Buat akun baru di tabel pengguna
      savedUser = await prisma.pengguna.create({
        data: {
          nama_lengkap: namaLengkap.trim(),
          peran: resolvedPeran,
          no_telp: nomorWhatsapp || "",
          alamat: alamat || (extraData?.alamatPengiriman as string) || "Indramayu, Jawa Barat",
          email: normalizedEmail,
          password: hashedPassword,
          status_verifikasi: resolvedStatus,
          foto_persyaratan_url: fotoPersyaratanUrl || null,
          foto_persyaratan_name: fotoPersyaratanName || null,
          alasan_penolakan: alasanPenolakan || null,
        },
      });

      // Buat data pada sub-tabel yang sesuai
      if (resolvedPeran === "Mitra") {
        await prisma.mitra.create({
          data: {
            id_user: savedUser.id_user,
            nama_mitra_instansi: (extraData?.namaInstansi as string) || namaLengkap,
            no_telp: nomorWhatsapp || null,
            jenis_pengolahan_limbah: "Bio-Refinery Pupuk Organik & Energi",
            kapasitas_tampung_limbah_kg: Number(extraData?.kapasitasTampung) || 500,
            jangkauan_area: (extraData?.jangkauanArea as string) || "Indramayu & Cirebon",
          },
        });
      } else if (resolvedPeran === "Supplier") {
        await prisma.supplier.create({
          data: {
            id_user: savedUser.id_user,
            tipe_supplier: "Petani",
            no_telp: nomorWhatsapp || null,
            luas_lahan_m2: Number(extraData?.luasLahan) || 1000,
            jenis_komoditas_utama: (extraData?.komoditasUtama as string) || "Mangga Gedong Gincu",
          },
        });
      } else if (resolvedPeran === "UMKM") {
        await prisma.umkm.create({
          data: {
            id_user: savedUser.id_user,
            nama_usaha: (extraData?.namaUsaha as string) || namaLengkap,
            nib: (extraData?.nib as string) || "",
            no_telp: nomorWhatsapp || null,
            kategori_produk_olahan: "Olahan Mangga",
            kapasitas_produksi_bulanan: Number(extraData?.kapasitasProduksi) || 100,
          },
        });
      } else if (resolvedPeran === "Konsumen") {
        await prisma.konsumen.create({
          data: {
            id_user: savedUser.id_user,
            kategori_konsumen: "Ritel",
            no_telp: nomorWhatsapp || null,
            alamat_pengiriman_utama: (extraData?.alamatPengiriman as string) || alamat || "Indramayu",
          },
        });
      }
    }

    const formattedUser: RegisteredUser = {
      id: `usr_${savedUser.id_user}`,
      email: savedUser.email,
      namaLengkap: savedUser.nama_lengkap,
      nomorWhatsapp: savedUser.no_telp || "",
      role: (savedUser.peran.toLowerCase() === "supplier" ? "petani" : savedUser.peran.toLowerCase()) as RoleSlug,
      roleTitle: savedUser.peran,
      peranErd: savedUser.peran as PeranPengguna,
      statusVerifikasi: savedUser.status_verifikasi as StatusVerifikasi,
      fotoPersyaratanUrl: savedUser.foto_persyaratan_url || undefined,
      fotoPersyaratanName: savedUser.foto_persyaratan_name || undefined,
      alasanPenolakan: savedUser.alasan_penolakan || undefined,
      registeredAt: savedUser.tgl_daftar
        ? savedUser.tgl_daftar.toISOString().replace("T", " ").substring(0, 19)
        : new Date().toISOString().replace("T", " ").substring(0, 19),
      fromGoogle: !!body.fromGoogle,
      extraData,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Pendaftaran berhasil disimpan ke database.",
        user: formattedUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gagal memproses pendaftaran pengguna:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server saat menyimpan data pendaftaran.",
      },
      { status: 500 }
    );
  }
}
