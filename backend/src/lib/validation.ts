import type { PendaftaranPayload, PeranPendaftaran } from "@/types/samangga";

const PERAN_VALID: readonly PeranPendaftaran[] = ["Supplier", "UMKM", "Mitra", "Konsumen"];

export type PendaftaranErrors = Partial<Record<keyof PendaftaranPayload, string>>;

export function validatePendaftaran(data: Partial<Record<keyof PendaftaranPayload, unknown>>): {
  ok: boolean;
  errors: PendaftaranErrors;
} {
  const errors: PendaftaranErrors = {};
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  if (str(data.nama_lengkap).length < 3) errors.nama_lengkap = "Nama minimal 3 karakter.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(data.email))) errors.email = "Email tidak valid.";
  if (!/^(\+62|62|0)8[0-9]{7,12}$/.test(str(data.no_telp).replace(/[\s-]/g, "")))
    errors.no_telp = "Gunakan nomor HP Indonesia, contoh 0812xxxxxxx.";
  if (!PERAN_VALID.includes(str(data.peran) as PeranPendaftaran)) errors.peran = "Pilih peran Anda.";
  if (str(data.alamat).length < 8) errors.alamat = "Alamat minimal 8 karakter.";
  if (str(data.password).length < 8) errors.password = "Password minimal 8 karakter.";

  return { ok: Object.keys(errors).length === 0, errors };
}
