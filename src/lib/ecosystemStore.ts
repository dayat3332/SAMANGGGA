import type {
  DetailTransaksi,
  JenisKeuangan,
  JenisKompensasi,
  JenisLimbah,
  JenisLimbahErd,
  KategoriProduk,
  LevelLog,
  Limbah,
  LogSistem,
  MetodePembayaran,
  Pembayaran,
  PencatatanKeuangan,
  Pengguna,
  Produk,
  RiwayatPengiriman,
  StatusJemput,
  StatusPembayaran,
  StatusPengiriman,
  StatusTransaksi,
  StatusVerifikasi,
  Transaksi,
} from "@/types/samangga";
import type { Product, ProductCategory } from "@/data/katalog";
import type { WasteListing } from "@/data/pasar-sirkular";
import { getActiveUserEmail, getRegisteredUsers } from "@/lib/auth";

// STORAGE KEYS
const STORAGE_PRODUCTS_KEY = "samangga_ecosystem_products";
const STORAGE_WASTE_KEY = "samangga_ecosystem_waste";
const STORAGE_TRANSACTIONS_KEY = "samangga_ecosystem_transactions";
const STORAGE_TRANSACTION_DETAILS_KEY = "samangga_ecosystem_transaction_details";
const STORAGE_PAYMENTS_KEY = "samangga_ecosystem_payments";
const STORAGE_SHIPMENTS_KEY = "samangga_ecosystem_shipments";
const STORAGE_FINANCES_KEY = "samangga_ecosystem_finances";
const STORAGE_LOGS_KEY = "samangga_ecosystem_logs";
const STORAGE_VERSION_TAG_KEY = "samangga_ecosystem_version_tag";
const CURRENT_ECOSYSTEM_VERSION = "samangga_v5_clean_2prod";

export const ECOSYSTEM_EVENT = "samangga_ecosystem_change";

// SEED DATA: 2 Mango Products with Real Photos for Main Landing Page & Catalog
export const SEED_PRODUK: Produk[] = [
  {
    id_produk: 1,
    id_user: 101,
    nama_produk: "Mangga Gedong Gincu Super Ekspor",
    kategori: "Buah",
    harga: 1450000,
    stok: 50,
    satuan: "Kwintal",
    deskripsi: "Kulit merah-jingga menyala, aroma harum pekat alami, brix kemanisan 16-18. Dipetik saat matang pohon 85%.",
    gambar: "/images/mangga/mangga_gincu.jpg",
    status_verifikasi: "Terverifikasi",
  },
  {
    id_produk: 2,
    id_user: 101,
    nama_produk: "Mangga Arumanis 143 Pilihan",
    kategori: "Buah",
    harga: 1200000,
    stok: 80,
    satuan: "Kwintal",
    deskripsi: "Daging buah tebal oranye kekuningan, tekstur lembut juicy tanpa serat kasar. Standar sortir 3-4 buah per kg.",
    gambar: "/images/mangga/mangga_harusmanis.jpg",
    status_verifikasi: "Terverifikasi",
  },
];

// 2 Public Waste Batches for Circular Market (Available to be picked up)
export const SEED_LIMBAH: Limbah[] = [
  {
    id_limbah: 1,
    id_umkm: 999,
    id_mitra: null,
    jenis_limbah: "Biji",
    berat_kg: 350,
    estimasi_harga: 525000,
    jenis_kompensasi: "Jual Beli",
    harga_kesepakatan: 525000,
    lokasi_penjemputan: "Sentra Olahan Sindang, Indramayu",
    titik_koordinat: "-6.3241, 108.3189",
    foto_limbah: "/images/limbah/limbah_biji_mangga.jpg",
    status_jemput: "Tersedia",
    tgl_jemput: null,
    status_verifikasi: "Terverifikasi",
    tgl_input: "2026-11-01 09:30:00",
  },
  {
    id_limbah: 2,
    id_umkm: 999,
    id_mitra: null,
    jenis_limbah: "Kulit",
    berat_kg: 120,
    estimasi_harga: 120000,
    jenis_kompensasi: "Jual Beli",
    harga_kesepakatan: 120000,
    lokasi_penjemputan: "Sentra Pengupasan Mangga Lohbener, Indramayu",
    titik_koordinat: "-6.3892, 108.2815",
    foto_limbah: "/images/limbah/limbah_kulit_mangga.jpg",
    status_jemput: "Tersedia",
    tgl_jemput: null,
    status_verifikasi: "Terverifikasi",
    tgl_input: "2026-11-02 11:00:00",
  },
];

export const SEED_TRANSAKSI: Transaksi[] = [];
export const SEED_DETAIL_TRANSAKSI: DetailTransaksi[] = [];
export const SEED_PEMBAYARAN: Pembayaran[] = [];
export const SEED_RIWAYAT_PENGIRIMAN: RiwayatPengiriman[] = [];
export const SEED_KEUANGAN: PencatatanKeuangan[] = [];

export const SEED_LOG_SISTEM: LogSistem[] = [
  {
    id_log: 1,
    id_user: 505,
    level: "Info",
    aksi: "SISTEM_BOOT",
    endpoint_api: "/api/health",
    kode_status: 200,
    pesan: "Backend SAMANGGA Service Online & Ekosistem Terhubung",
    detail_error: null,
    waktu: "2026-11-06 00:00:00",
  },
  {
    id_log: 2,
    id_user: 505,
    level: "Info",
    aksi: "DATABASE_READY",
    endpoint_api: "/api/db/status",
    kode_status: 200,
    pesan: "PostgreSQL 5432 aktif dan tersinkronisasi.",
    detail_error: null,
    waktu: "2026-11-06 00:00:05",
  },
];

// Auto-reset / migration logic to clear dummy data
export function ensureEcosystemClean(): void {
  if (typeof window === "undefined") return;
  try {
    const current = window.localStorage.getItem(STORAGE_VERSION_TAG_KEY);
    if (current !== CURRENT_ECOSYSTEM_VERSION) {
      window.localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(SEED_PRODUK));
      window.localStorage.setItem(STORAGE_WASTE_KEY, JSON.stringify(SEED_LIMBAH));
      window.localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(SEED_TRANSAKSI));
      window.localStorage.setItem(STORAGE_TRANSACTION_DETAILS_KEY, JSON.stringify(SEED_DETAIL_TRANSAKSI));
      window.localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(SEED_PEMBAYARAN));
      window.localStorage.setItem(STORAGE_SHIPMENTS_KEY, JSON.stringify(SEED_RIWAYAT_PENGIRIMAN));
      window.localStorage.setItem(STORAGE_FINANCES_KEY, JSON.stringify(SEED_KEUANGAN));
      window.localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(SEED_LOG_SISTEM));
      window.localStorage.setItem(STORAGE_VERSION_TAG_KEY, CURRENT_ECOSYSTEM_VERSION);
    }
  } catch {
    // Ignore storage errors
  }
}

// USER LABELS HELPER
export const USER_INFO_MAP: Record<number, { nama: string; lokasi: string }> = {
  101: { nama: "H. Agus Supriyadi (KT Sumber Rejeki)", lokasi: "Lohbener, Indramayu" },
  102: { nama: "H. Kartono (UD Pengepul Mangga)", lokasi: "Jatibarang, Indramayu" },
  202: { nama: "Hj. Ningsih (UMKM Dapur Mangga Bu Ning)", lokasi: "Sindang, Indramayu" },
  203: { nama: "Siti Masitoh (Camilan Keripik Barokah)", lokasi: "Losarang, Indramayu" },
  303: { nama: "Ir. Hendra (CV Bio Tani Lestari)", lokasi: "Sliyeg, Indramayu" },
  404: { nama: "Budi Santoso (PT Segar Buah)", lokasi: "Cirebon / Jakarta" },
  505: { nama: "Dr. Raka Pratama (Admin Command Center)", lokasi: "Indramayu Kota" },
};

export function notifyEcosystemChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ECOSYSTEM_EVENT));
  }
}

export function subscribeEcosystem(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(ECOSYSTEM_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(ECOSYSTEM_EVENT, callback);
  };
}

// ---------------- PRODUK ----------------
export function getEcosystemProducts(): Produk[] {
  if (typeof window === "undefined") return SEED_PRODUK;
  ensureEcosystemClean();
  try {
    const raw = window.localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(SEED_PRODUK));
      return SEED_PRODUK;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_PRODUK;
  } catch {
    return SEED_PRODUK;
  }
}

export function saveEcosystemProduct(
  p: Partial<Produk> & {
    nama_produk: string;
    harga: number;
    stok: number;
    satuan: string;
    gambar: string;
    kategori?: KategoriProduk;
  }
): Produk {
  const current = getEcosystemProducts();
  const nextId = p.id_produk ?? current.reduce((m, x) => Math.max(m, x.id_produk), 2000) + 1;
  const newRow: Produk = {
    id_produk: nextId,
    id_user: p.id_user ?? 101,
    nama_produk: p.nama_produk,
    kategori: p.kategori ?? "Buah",
    harga: Number(p.harga),
    stok: Number(p.stok),
    satuan: p.satuan,
    deskripsi: p.deskripsi || "",
    gambar: p.gambar,
    status_verifikasi: p.status_verifikasi || "Terverifikasi",
  };

  const updated = p.id_produk
    ? current.map((item) => (item.id_produk === p.id_produk ? newRow : item))
    : [newRow, ...current];

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
  }

  addSystemLog(
    p.id_produk ? "UPDATE_PRODUK" : "UPLOAD_PRODUK",
    p.id_produk ? `PUT /api/produk/${p.id_produk}` : "POST /api/produk",
    `Produk #${nextId} (${newRow.nama_produk}) berhasil disimpan.`,
    "Info",
    newRow.id_user
  );

  notifyEcosystemChange();
  return newRow;
}

export function deleteEcosystemProduct(id_produk: number): void {
  const current = getEcosystemProducts();
  const filtered = current.filter((p) => p.id_produk !== id_produk);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(filtered));
  }
  addSystemLog("DELETE_PRODUK", `DELETE /api/produk/${id_produk}`, `Produk #${id_produk} dihapus.`, "Warning");
  notifyEcosystemChange();
}

// Map ERD Produk to Catalog Product
export function getEcosystemCatalogProducts(): Product[] {
  const list = getEcosystemProducts();
  return list.map((p) => {
    let category: ProductCategory = "Mangga Segar";
    if (p.kategori === "Olahan") {
      category = "Olahan Mangga";
    } else if (p.nama_produk.toLowerCase().includes("bibit")) {
      category = "Bibit Pohon";
    }

    const sellerInfo = USER_INFO_MAP[p.id_user] ?? {
      nama: `Mitra #${p.id_user}`,
      lokasi: "Indramayu",
    };

    return {
      id: String(p.id_produk),
      name: p.nama_produk,
      category,
      seller: sellerInfo.nama,
      location: sellerInfo.lokasi,
      stock: p.stok,
      stockUnit: p.satuan,
      price: p.harga,
      priceUnit: p.satuan,
      tags: [p.kategori, "Indramayu", p.status_verifikasi],
      description: p.deskripsi,
      image: p.gambar,
    };
  });
}

// ---------------- LIMBAH ----------------
export function getEcosystemWaste(): Limbah[] {
  if (typeof window === "undefined") return SEED_LIMBAH;
  try {
    const raw = window.localStorage.getItem(STORAGE_WASTE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_WASTE_KEY, JSON.stringify(SEED_LIMBAH));
      return SEED_LIMBAH;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_LIMBAH;
  } catch {
    return SEED_LIMBAH;
  }
}

export function saveEcosystemWaste(
  w: Partial<Limbah> & {
    jenis_limbah: any;
    berat_kg: number;
    foto_limbah: string;
  }
): Limbah {
  const current = getEcosystemWaste();
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const nextId = w.id_limbah ?? current.reduce((m, x) => Math.max(m, x.id_limbah), 100) + 1;
  const newRow: Limbah = {
    id_limbah: nextId,
    id_umkm: w.id_umkm ?? 1,
    id_mitra: w.id_mitra ?? null,
    jenis_limbah: w.jenis_limbah,
    berat_kg: Number(w.berat_kg),
    estimasi_harga: Number(w.estimasi_harga || (w.berat_kg ? w.berat_kg * 1000 : 0)),
    jenis_kompensasi: w.jenis_kompensasi ?? "Jual Beli",
    harga_kesepakatan: w.harga_kesepakatan ? Number(w.harga_kesepakatan) : null,
    lokasi_penjemputan: w.lokasi_penjemputan || "Indramayu",
    titik_koordinat: w.titik_koordinat ?? null,
    foto_limbah: w.foto_limbah,
    status_jemput: w.status_jemput ?? "Tersedia",
    tgl_jemput: w.tgl_jemput ?? null,
    status_verifikasi: w.status_verifikasi ?? "Terverifikasi",
    tgl_input: w.tgl_input ?? now,
  };

  const updated = w.id_limbah
    ? current.map((item) => (item.id_limbah === w.id_limbah ? newRow : item))
    : [newRow, ...current];

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_WASTE_KEY, JSON.stringify(updated));
  }

  addSystemLog(
    w.id_limbah ? "UPDATE_LIMBAH" : "SETOR_LIMBAH",
    w.id_limbah ? `PUT /api/limbah/${w.id_limbah}` : "POST /api/limbah",
    `Limbah #${nextId} (${newRow.jenis_limbah} ${newRow.berat_kg}kg) berhasil dicatat.`,
    "Info",
    newRow.id_umkm
  );

  notifyEcosystemChange();
  return newRow;
}

export function updateWasteStatus(
  id_limbah: number,
  status_jemput: StatusJemput,
  id_mitra: number | null = null,
  tgl_jemput: string | null = null
): void {
  const current = getEcosystemWaste();
  const updated = current.map((item) => {
    if (item.id_limbah === id_limbah) {
      return {
        ...item,
        status_jemput,
        id_mitra: id_mitra ?? item.id_mitra,
        tgl_jemput: tgl_jemput ?? item.tgl_jemput ?? new Date().toISOString().replace("T", " ").slice(0, 19),
      };
    }
    return item;
  });

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_WASTE_KEY, JSON.stringify(updated));
  }

  addSystemLog(
    "UPDATE_STATUS_LIMBAH",
    `PATCH /api/limbah/${id_limbah}`,
    `Status penjemputan limbah #${id_limbah} diperbarui menjadi '${status_jemput}'.`,
    "Info",
    id_mitra ?? 303
  );

  notifyEcosystemChange();
}

export function deleteEcosystemWaste(id_limbah: number): void {
  const current = getEcosystemWaste();
  const filtered = current.filter((l) => l.id_limbah !== id_limbah);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_WASTE_KEY, JSON.stringify(filtered));
  }
  addSystemLog("DELETE_LIMBAH", `DELETE /api/limbah/${id_limbah}`, `Limbah #${id_limbah} dihapus.`, "Warning");
  notifyEcosystemChange();
}

// Map ERD Limbah to Pasar Sirkular WasteListing
export function getEcosystemWasteListings(): WasteListing[] {
  const list = getEcosystemWaste();
  return list.map((l) => {
    let usage = "Kompos organik, pupuk cair, dan pakan ternak ramah lingkungan";
    if (l.jenis_limbah === "Kulit") {
      usage = "Kompos organik, pakan maggot BSF, dan ekstraksi pektin alami";
    } else if (l.jenis_limbah === "Biji") {
      usage = "Tepung pati biji mangga, bibit batang bawah, dan pakan ternak";
    } else if (l.jenis_limbah === "Buah Afkir") {
      usage = "Cuka mangga, eco-enzyme bio-refinery, dan fermentasi pupuk";
    }

    const ownerName = USER_INFO_MAP[l.id_umkm]?.nama ?? `UMKM / Kelompok Tani #${l.id_umkm}`;

    return {
      id: l.id_limbah,
      jenis: l.jenis_limbah as JenisLimbah,
      owner: ownerName,
      location: l.lokasi_penjemputan,
      weightKg: l.berat_kg,
      estimatedPrice: l.estimasi_harga,
      condition: "Segar < 24 jam, terpisah dari plastik dan sampah anorganik",
      verification: l.status_verifikasi,
      status: l.status_jemput === "Tersedia" ? "Tersedia" : "Dipesan",
      usage,
      image: l.foto_limbah,
    };
  });
}

// ---------------- TRANSAKSI & DETAIL ----------------
export function getEcosystemTransactions(): Transaksi[] {
  if (typeof window === "undefined") return SEED_TRANSAKSI;
  try {
    const raw = window.localStorage.getItem(STORAGE_TRANSACTIONS_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(SEED_TRANSAKSI));
      return SEED_TRANSAKSI;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_TRANSAKSI;
  } catch {
    return SEED_TRANSAKSI;
  }
}

export function getEcosystemDetailTransaksi(): DetailTransaksi[] {
  if (typeof window === "undefined") return SEED_DETAIL_TRANSAKSI;
  try {
    const raw = window.localStorage.getItem(STORAGE_TRANSACTION_DETAILS_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_TRANSACTION_DETAILS_KEY, JSON.stringify(SEED_DETAIL_TRANSAKSI));
      return SEED_DETAIL_TRANSAKSI;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_DETAIL_TRANSAKSI;
  } catch {
    return SEED_DETAIL_TRANSAKSI;
  }
}

// ---------------- PEMBAYARAN ----------------
export function getEcosystemPayments(): Pembayaran[] {
  if (typeof window === "undefined") return SEED_PEMBAYARAN;
  try {
    const raw = window.localStorage.getItem(STORAGE_PAYMENTS_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(SEED_PEMBAYARAN));
      return SEED_PEMBAYARAN;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_PEMBAYARAN;
  } catch {
    return SEED_PEMBAYARAN;
  }
}

// ---------------- RIWAYAT PENGIRIMAN ----------------
export function getEcosystemShipments(): RiwayatPengiriman[] {
  if (typeof window === "undefined") return SEED_RIWAYAT_PENGIRIMAN;
  try {
    const raw = window.localStorage.getItem(STORAGE_SHIPMENTS_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_SHIPMENTS_KEY, JSON.stringify(SEED_RIWAYAT_PENGIRIMAN));
      return SEED_RIWAYAT_PENGIRIMAN;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_RIWAYAT_PENGIRIMAN;
  } catch {
    return SEED_RIWAYAT_PENGIRIMAN;
  }
}

export function updateShipmentStatus(id_pengiriman: number, status: StatusPengiriman): void {
  const current = getEcosystemShipments();
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const updated = current.map((s) => {
    if (s.id_pengiriman === id_pengiriman) {
      return {
        ...s,
        status_pengiriman: status,
        tgl_diterima: status === "Tiba di Lokasi" ? now : s.tgl_diterima,
      };
    }
    return s;
  });

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_SHIPMENTS_KEY, JSON.stringify(updated));
  }

  addSystemLog(
    "UPDATE_PENGIRIMAN",
    `PATCH /api/pengiriman/${id_pengiriman}`,
    `Status pengiriman #${id_pengiriman} diperbarui menjadi '${status}'.`,
    "Info"
  );

  notifyEcosystemChange();
}

// ---------------- KEUANGAN ----------------
export function getEcosystemFinances(): PencatatanKeuangan[] {
  if (typeof window === "undefined") return SEED_KEUANGAN;
  try {
    const raw = window.localStorage.getItem(STORAGE_FINANCES_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_FINANCES_KEY, JSON.stringify(SEED_KEUANGAN));
      return SEED_KEUANGAN;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_KEUANGAN;
  } catch {
    return SEED_KEUANGAN;
  }
}

// ---------------- LOG SISTEM ----------------
export function getEcosystemLogs(): LogSistem[] {
  if (typeof window === "undefined") return SEED_LOG_SISTEM;
  try {
    const raw = window.localStorage.getItem(STORAGE_LOGS_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(SEED_LOG_SISTEM));
      return SEED_LOG_SISTEM;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_LOG_SISTEM;
  } catch {
    return SEED_LOG_SISTEM;
  }
}

export function addSystemLog(
  aksi: string,
  endpoint_api: string,
  pesan: string,
  level: LevelLog = "Info",
  id_user = 505
): void {
  if (typeof window === "undefined") return;
  const current = getEcosystemLogs();
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const nextId = current.reduce((m, x) => Math.max(m, x.id_log), 10) + 1;

  const newLog: LogSistem = {
    id_log: nextId,
    id_user,
    level,
    aksi,
    endpoint_api,
    kode_status: level === "Error" ? 500 : 200,
    pesan,
    detail_error: null,
    waktu: now,
  };

  const updated = [newLog, ...current];
  try {
    window.localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(updated.slice(0, 100)));
  } catch {
    // ignore
  }
}

// ---------------- FULL END-TO-END TRANSAKSI CHECKOUT ----------------
export interface CreateOrderParams {
  buyerId?: number;
  sellerId?: number;
  items: Array<{
    id_produk: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: MetodePembayaran;
  courierName?: string;
  recipientName?: string;
  recipientAddress?: string;
}

export function createFullOrder(params: CreateOrderParams): {
  id_transaksi: number;
  resi: string;
  pembayaranId: number;
} {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const buyerId = params.buyerId ?? 404;
  const sellerId = params.sellerId ?? 101;

  // 1. Buat Transaksi
  const currentTrx = getEcosystemTransactions();
  const nextTrxId = currentTrx.reduce((m, x) => Math.max(m, x.id_transaksi), 1000) + 1;
  const newTrx: Transaksi = {
    id_transaksi: nextTrxId,
    id_pembeli: buyerId,
    id_penjual: sellerId,
    tgl_transaksi: now,
    total_harga: params.totalAmount,
    status: "Diproses",
  };
  const updatedTrx = [newTrx, ...currentTrx];

  // 2. Buat Detail Transaksi
  const currentDetails = getEcosystemDetailTransaksi();
  let nextDetailId = currentDetails.reduce((m, x) => Math.max(m, x.id_detail_transaksi), 0);
  const newDetails: DetailTransaksi[] = params.items.map((it) => {
    nextDetailId += 1;
    return {
      id_detail_transaksi: nextDetailId,
      id_transaksi: nextTrxId,
      id_produk: it.id_produk,
      jumlah_produk: it.quantity,
      harga_satuan: it.price,
      subtotal_harga: it.quantity * it.price,
    };
  });
  const updatedDetails = [...newDetails, ...currentDetails];

  // 3. Buat Pembayaran
  const currentPay = getEcosystemPayments();
  const nextPayId = currentPay.reduce((m, x) => Math.max(m, x.id_pembayaran), 0) + 1;
  const isAutoPaid = params.paymentMethod === "QRIS" || params.paymentMethod === "Virtual Account";
  const newPay: Pembayaran = {
    id_pembayaran: nextPayId,
    id_transaksi: nextTrxId,
    metode_pembayaran: params.paymentMethod,
    jumlah_bayar: params.totalAmount,
    status_pembayaran: isAutoPaid ? "Berhasil" : "Menunggu",
    id_referensi_gateway: `PG-SMG-${nextTrxId}-${Date.now().toString().slice(-4)}`,
    kode_pembayaran: `8801${Math.floor(10000000 + Math.random() * 90000000)}`,
    bukti_transfer: null,
    batas_waktu_bayar: now,
    tgl_bayar: isAutoPaid ? now : null,
  };
  const updatedPay = [newPay, ...currentPay];

  // 4. Buat Riwayat Pengiriman
  const currentShip = getEcosystemShipments();
  const nextShipId = currentShip.reduce((m, x) => Math.max(m, x.id_pengiriman), 0) + 1;
  const resi = `SMG-EXP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(nextTrxId).padStart(4, "0")}`;
  const newShip: RiwayatPengiriman = {
    id_pengiriman: nextShipId,
    id_transaksi: nextTrxId,
    id_mitra: 1,
    tgl_pengiriman: now,
    no_resi_lacak: resi,
    status_pengiriman: "Dalam Perjalanan",
    tgl_diterima: null,
  };
  const updatedShip = [newShip, ...currentShip];

  // 5. Buat Pencatatan Keuangan (Pemasukan Penjual & Pengeluaran Pembeli)
  const currentFin = getEcosystemFinances();
  let nextFinId = currentFin.reduce((m, x) => Math.max(m, x.id_keuangan), 0);
  const finSeller: PencatatanKeuangan = {
    id_keuangan: ++nextFinId,
    id_user: sellerId,
    id_transaksi: nextTrxId,
    id_limbah: null,
    tgl_pencatatan: now,
    jenis_transaksi: "Pemasukan",
    jumlah_uang: params.totalAmount,
    keterangan: `Penjualan #${nextTrxId} (${params.items.map((i) => i.name).join(", ")})`,
  };
  const finBuyer: PencatatanKeuangan = {
    id_keuangan: ++nextFinId,
    id_user: buyerId,
    id_transaksi: nextTrxId,
    id_limbah: null,
    tgl_pencatatan: now,
    jenis_transaksi: "Pengeluaran",
    jumlah_uang: params.totalAmount,
    keterangan: `Pembelian produk #${nextTrxId} (${params.items.map((i) => i.name).join(", ")})`,
  };
  const updatedFin = [finSeller, finBuyer, ...currentFin];

  // 6. Kurangi Stok Produk
  const currentProducts = getEcosystemProducts();
  const updatedProducts = currentProducts.map((p) => {
    const matched = params.items.find((it) => it.id_produk === p.id_produk);
    if (matched) {
      return {
        ...p,
        stok: Math.max(0, p.stok - matched.quantity),
      };
    }
    return p;
  });

  // Simpan semuanya ke LocalStorage
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(updatedTrx));
    window.localStorage.setItem(STORAGE_TRANSACTION_DETAILS_KEY, JSON.stringify(updatedDetails));
    window.localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(updatedPay));
    window.localStorage.setItem(STORAGE_SHIPMENTS_KEY, JSON.stringify(updatedShip));
    window.localStorage.setItem(STORAGE_FINANCES_KEY, JSON.stringify(updatedFin));
    window.localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updatedProducts));
  }

  // Log sistem
  addSystemLog(
    "ORDER_CHECKOUT",
    "/api/transaksi/checkout",
    `Pesanan #${nextTrxId} senilai Rp ${params.totalAmount.toLocaleString("id-ID")} dibuat. Resi: ${resi}`,
    "Info",
    buyerId
  );

  notifyEcosystemChange();

  return {
    id_transaksi: nextTrxId,
    resi,
    pembayaranId: nextPayId,
  };
}

// ---------------- FULL END-TO-END PENJEMPUTAN LIMBAH ----------------
export interface CreatePickupParams {
  id_limbah: number;
  mitraId?: number;
  namaMitra?: string;
  jadwalJemput?: string;
  biayaTebus?: number;
  ongkirArmada?: number;
}

export function createWastePickup(params: CreatePickupParams): {
  tiketJemput: string;
} {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const mitraId = params.mitraId ?? 303;
  const wasteList = getEcosystemWaste();
  const targetWaste = wasteList.find((w) => w.id_limbah === params.id_limbah);

  // 1. Update status limbah
  updateWasteStatus(params.id_limbah, "Proses", mitraId, params.jadwalJemput || now);

  // 2. Buat Pengiriman Limbah (Logistik Sirkular)
  const currentShip = getEcosystemShipments();
  const nextShipId = currentShip.reduce((m, x) => Math.max(m, x.id_pengiriman), 0) + 1;
  const tiketJemput = `JMP-SMG-${String(params.id_limbah).padStart(3, "0")}-${Date.now().toString().slice(-4)}`;
  const newShip: RiwayatPengiriman = {
    id_pengiriman: nextShipId,
    id_transaksi: 0, // 0 = Pengiriman limbah non-transaksi retail
    id_mitra: mitraId,
    tgl_pengiriman: params.jadwalJemput || now,
    no_resi_lacak: tiketJemput,
    status_pengiriman: "Dalam Perjalanan",
    tgl_diterima: null,
  };
  const updatedShip = [newShip, ...currentShip];

  // 3. Buat Catatan Keuangan jika kompensasi jual-beli
  const biayaTebus = params.biayaTebus ?? targetWaste?.estimasi_harga ?? 0;
  if (biayaTebus > 0 && targetWaste) {
    const currentFin = getEcosystemFinances();
    let nextFinId = currentFin.reduce((m, x) => Math.max(m, x.id_keuangan), 0);
    const finMitra: PencatatanKeuangan = {
      id_keuangan: ++nextFinId,
      id_user: mitraId,
      id_transaksi: null,
      id_limbah: params.id_limbah,
      tgl_pencatatan: now,
      jenis_transaksi: "Pengeluaran",
      jumlah_uang: biayaTebus,
      keterangan: `Tebus penjemputan limbah #${params.id_limbah} (${targetWaste.jenis_limbah} ${targetWaste.berat_kg}kg)`,
    };
    const finUmkm: PencatatanKeuangan = {
      id_keuangan: ++nextFinId,
      id_user: targetWaste.id_umkm,
      id_transaksi: null,
      id_limbah: params.id_limbah,
      tgl_pencatatan: now,
      jenis_transaksi: "Pemasukan",
      jumlah_uang: biayaTebus,
      keterangan: `Penerimaan setor limbah #${params.id_limbah} (${targetWaste.jenis_limbah} ${targetWaste.berat_kg}kg)`,
    };
    const updatedFin = [finMitra, finUmkm, ...currentFin];
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_FINANCES_KEY, JSON.stringify(updatedFin));
    }
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_SHIPMENTS_KEY, JSON.stringify(updatedShip));
  }

  addSystemLog(
    "PENJEMPUTAN_LIMBAH",
    `/api/limbah/${params.id_limbah}/jemput`,
    `Mitra #${mitraId} menjadwalkan penjemputan limbah #${params.id_limbah}. Tiket: ${tiketJemput}`,
    "Info",
    mitraId
  );

  notifyEcosystemChange();
  return { tiketJemput };
}
