import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


/**
 * POST /api/hapus-pengguna
 * Menghapus akun pengguna dari database Supabase PostgreSQL
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, email } = body;

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
        { success: false, message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.pengguna.delete({
      where: { id_user: targetUserId },
    });

    return NextResponse.json({
      success: true,
      message: `Pengguna #${targetUserId} berhasil dihapus dari database.`,
    });
  } catch (error) {
    console.error("Gagal menghapus pengguna dari database:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat menghapus pengguna." },
      { status: 500 }
    );
  }
}
