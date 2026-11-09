import type { MetodePembayaran } from "@/types/samangga";

export type ProductCategory = "Mangga Segar" | "Olahan Mangga" | "Bibit Pohon";

export interface ProductSpecItem {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  seller: string;
  location: string;
  stock: number;
  stockUnit: string;
  price: number;
  priceUnit: string;
  tags: readonly string[];
  description: string;
  image?: string;
  spesifikasi?: readonly ProductSpecItem[];
}

export const CATEGORIES: readonly ProductCategory[] = [
  "Mangga Segar",
  "Olahan Mangga",
  "Bibit Pohon",
];

// Data Produk Rantai Pasok (Telah dipindahkan ke Backend 'be/src/seeds/products.seed.ts')
export const PRODUCTS: readonly Product[] = [];

export interface CourierOption {
  id: string;
  name: string;
  badge: string;
  eta: string;
  cost: number;
  description: string;
}

export const COURIER_OPTIONS: readonly CourierOption[] = [
  {
    id: "samangga-logistik",
    name: "Logistik Tani SAMANGGA (Pickup Segar)",
    badge: "Rekomendasi Kebun",
    eta: "Hari yang sama / H+1",
    cost: 35000,
    description: "Armada khusus komoditas pertanian Indramayu dengan ventilasi terjaga.",
  },
  {
    id: "ekspedisi-kargo",
    name: "Kargo Ekspedisi (JNE Trucking / Indah Cargo)",
    badge: "Antarkota",
    eta: "1–3 Hari Kerja",
    cost: 22000,
    description: "Pengiriman hemat untuk produk olahan UMKM, bibit, atau pembelian grosir.",
  },
  {
    id: "ambil-sendiri",
    name: "Ambil Langsung di Lokasi Mitra (Self-Pickup)",
    badge: "Bebas Ongkir",
    eta: "Sesuai Jadwal",
    cost: 0,
    description: "Ambil langsung ke gudang petani/UMKM di kecamatan asal setelah pembayaran.",
  },
];

export interface PaymentOption {
  method: MetodePembayaran;
  title: string;
  badge: string;
  description: string;
  codePrefix: string;
}

export const PAYMENT_OPTIONS: readonly PaymentOption[] = [
  {
    method: "QRIS",
    title: "QRIS Terpadu SAMANGGA",
    badge: "Verifikasi Otomatis",
    description: "Scan dari aplikasi m-Banking atau dompet digital (GoPay, OVO, DANA, ShopeePay, LinkAja).",
    codePrefix: "QRIS-SMG-9841",
  },
  {
    method: "Virtual Account",
    title: "Virtual Account Bank (BRI / Mandiri / BNI)",
    badge: "Callback Otomatis",
    description: "Nomor Virtual Account unik, status pembayaran terverifikasi otomatis oleh payment gateway.",
    codePrefix: "880192837465",
  },
  {
    method: "Transfer Manual",
    title: "Transfer Rekening Bersama (Escrow)",
    badge: "Unggah Bukti",
    description: "Transfer manual ke rekening Koperasi Mitra SAMANGGA dan unggah foto bukti transfer.",
    codePrefix: "BRI 0029-01-029384-530 a.n. SAMANGGA INDRAMAYU",
  },
];

export function getProductSpecs(product: Product): readonly ProductSpecItem[] {
  if (product.spesifikasi && product.spesifikasi.length > 0) {
    return product.spesifikasi;
  }
  return [
    { label: "Kategori Produk", value: product.category },
    { label: "Petani / Produsen", value: product.seller },
    { label: "Asal Komoditas", value: product.location },
    { label: "Satuan Penjualan", value: product.priceUnit },
    { label: "Stok Tersedia", value: `${product.stock} ${product.stockUnit}` },
    { label: "Standar Mutu", value: "Terkurasi Mitra Tani Indramayu" },
  ];
}
