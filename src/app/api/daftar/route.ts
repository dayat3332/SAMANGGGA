import { NextResponse } from "next/server";
import { validatePendaftaran } from "@/lib/validation";

/**
 * Endpoint pendaftaran Pengguna (demo, tanpa database).
 * Akun baru selalu berstatus `Menunggu` verifikasi admin, sesuai ERD.
 * Untuk produksi: hash password, simpan ke tabel Pengguna, dan catat ke Log Sistem.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Body tidak valid." }, { status: 400 });
  }

  const { ok, errors } = validatePendaftaran((body ?? {}) as Record<string, unknown>);
  if (!ok) {
    return NextResponse.json({ message: "Data belum lengkap.", errors }, { status: 422 });
  }

  return NextResponse.json(
    {
      message: "Pendaftaran diterima. Akun Anda menunggu verifikasi admin.",
      status_verifikasi: "Menunggu",
    },
    { status: 201 },
  );
}
