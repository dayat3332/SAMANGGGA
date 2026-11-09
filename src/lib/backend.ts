import type { DetailTransaksi, Pembayaran, RiwayatPengiriman, Transaksi } from "@/types/samangga";

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export const SESSION_KEY = "samangga_session";

export interface SessionUser {
  id: number;
  nama: string;
  email: string;
  peran: string;
  statusVerifikasi: string;
}

export function readSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function writeSession(user: SessionUser): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
}

export async function apiCall<T = any>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api${path}`, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(`Tidak dapat terhubung ke server SAMANGGA (${API_BASE_URL}). Pastikan backend sudah berjalan.`);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json || json.success !== true) {
    throw new Error(json?.message || `Permintaan gagal (status ${res.status}).`);
  }
  return json as T;
}

export function pesananToState(rows: any[]): {
  transaksi: Transaksi[];
  detail: DetailTransaksi[];
  pembayaran: Pembayaran[];
  pengiriman: RiwayatPengiriman[];
} {
  const transaksi: Transaksi[] = [];
  const detail: DetailTransaksi[] = [];
  const pembayaran: Pembayaran[] = [];
  const pengiriman: RiwayatPengiriman[] = [];
  for (const r of rows) {
    transaksi.push({
      id_transaksi: r.id_transaksi,
      id_pembeli: r.id_pembeli,
      id_penjual: r.id_penjual,
      tgl_transaksi: r.tgl_transaksi,
      total_harga: Number(r.total_harga),
      status: r.status,
    });
    for (const it of r.items ?? []) {
      detail.push({
        id_detail_transaksi: it.id_detail_transaksi,
        id_transaksi: r.id_transaksi,
        id_produk: it.id_produk,
        jumlah_produk: Number(it.jumlah_produk),
        harga_satuan: Number(it.harga_satuan),
        subtotal_harga: Number(it.subtotal_harga),
      });
    }
    if (r.pembayaran) pembayaran.push(r.pembayaran as Pembayaran);
    if (r.pengiriman) pengiriman.push(r.pengiriman as RiwayatPengiriman);
  }
  return { transaksi, detail, pembayaran, pengiriman };
}
