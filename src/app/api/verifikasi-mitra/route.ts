import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { StatusVerifikasi } from "@/types/samangga";


/**
 * POST /api/verifikasi-mitra
 * Memperbarui status verifikasi mitra (Terverifikasi / Ditolak / Menunggu) di database Supabase
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      email,
      statusVerifikasi,
      alasanPenolakan,
      fotoPersyaratanUrl,
      fotoPersyaratanName,
    } = body;

    if (!id && !email) {
      return NextResponse.json(
        { success: false, message: "ID pengguna atau email wajib disertakan." },
        { status: 400 }
      );
    }

    let targetUserId: number | null = null;

    if (id) {
      const parsedId = parseInt(String(id).replace(/\D/g, ""), 10);
      if (!isNaN(parsedId)) {
        targetUserId = parsedId;
      }
    }

    if (!targetUserId && email) {
      const user = await prisma.pengguna.findUnique({
        where: { email: String(email).trim().toLowerCase() },
      });
      if (user) {
        targetUserId = user.id_user;
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan di database." },
        { status: 404 }
      );
    }

    const updated = await prisma.pengguna.update({
      where: { id_user: targetUserId },
      data: {
        status_verifikasi: (statusVerifikasi as StatusVerifikasi) || "Terverifikasi",
        alasan_penolakan:
          statusVerifikasi === "Ditolak"
            ? (alasanPenolakan || "Foto atau dokumen kemitraan tidak memenuhi syarat")
            : null,
        ...(fotoPersyaratanUrl ? { foto_persyaratan_url: fotoPersyaratanUrl } : {}),
        ...(fotoPersyaratanName ? { foto_persyaratan_name: fotoPersyaratanName } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Status verifikasi pengguna ${updated.nama_lengkap} berhasil diperbarui menjadi '${updated.status_verifikasi}'.`,
      user: {
        id: `usr_${updated.id_user}`,
        email: updated.email,
        namaLengkap: updated.nama_lengkap,
        statusVerifikasi: updated.status_verifikasi,
        alasanPenolakan: updated.alasan_penolakan,
        fotoPersyaratanUrl: updated.foto_persyaratan_url,
        fotoPersyaratanName: updated.foto_persyaratan_name,
      },
    });
  } catch (error) {
    console.error("Gagal memperbarui status verifikasi mitra:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal saat memperbarui verifikasi." },
      { status: 500 }
    );
  }
}
