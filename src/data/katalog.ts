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

// Data Produk Rantai Pasok Terpadu
export const INITIAL_PRODUCTS: readonly Product[] = [
  {
    id: "1",
    name: "Mangga Gedong Gincu Super Ekspor",
    category: "Mangga Segar",
    seller: "H. Agus Supriyadi (KT Sumber Rejeki)",
    location: "Lohbener, Indramayu",
    stock: 50,
    stockUnit: "Kwintal",
    price: 1450000,
    priceUnit: "Kwintal",
    tags: ["Grade A", "Ekspor", "Lohbener"],
    description: "Kulit merah-jingga menyala, aroma harum pekat alami, brix kemanisan 16-18. Dipetik saat matang pohon 85%.",
    image: "/images/mangga/mangga_gincu.jpg",
  },
  {
    id: "2",
    name: "Mangga Arumanis 143 Pilihan",
    category: "Mangga Segar",
    seller: "H. Agus Supriyadi (KT Sumber Rejeki)",
    location: "Jatibarang, Indramayu",
    stock: 80,
    stockUnit: "Kwintal",
    price: 1200000,
    priceUnit: "Kwintal",
    tags: ["Super", "Sortir", "Jatibarang"],
    description: "Daging buah tebal oranye kekuningan, tekstur lembut juicy tanpa serat kasar. Standar sortir 3-4 buah per kg.",
    image: "/images/mangga/mangga_harusmanis.jpg",
  },
  {
    id: "3",
    name: "Mangga Golek Manis",
    category: "Mangga Segar",
    seller: "H. Kartono (UD Pengepul Mangga)",
    location: "Sliyeg, Indramayu",
    stock: 35,
    stockUnit: "Kwintal",
    price: 950000,
    priceUnit: "Kwintal",
    tags: ["Matang pohon", "Sliyeg"],
    description: "Bentuk lonjong panjang, rasa manis segar kaya serat halus. Sangat disukai untuk konsumsi langsung maupun meja prasmanan.",
    image: "/images/mangga/mangga_golek.jpg",
  },
  {
    id: "4",
    name: "Mangga Manalagi Khas Indramayu",
    category: "Mangga Segar",
    seller: "H. Kartono (UD Pengepul Mangga)",
    location: "Cikedung, Indramayu",
    stock: 40,
    stockUnit: "Kwintal",
    price: 1100000,
    priceUnit: "Kwintal",
    tags: ["Renyah", "Tahan Simpan"],
    description: "Tetap manis renyah meski kulit luar masih hijau. Daging padat gurih manis, tahan simpan hingga 10 hari pengiriman.",
    image: "/images/mangga/mangga_manalagi.jpg",
  },
  {
    id: "5",
    name: "Puree / Pulp Mangga Gedong Gincu (Frozen)",
    category: "Olahan Mangga",
    seller: "Hj. Ningsih (UMKM Dapur Mangga Bu Ning)",
    location: "Sindang, Indramayu",
    stock: 300,
    stockUnit: "Pack (1 Kg)",
    price: 28000,
    priceUnit: "Pack (1 Kg)",
    tags: ["100% Murni", "Bahan Baku B2B"],
    description: "Pulp murni 100% buah gedong gincu tanpa tambahan air, tanpa perisa sintetis, dan tanpa pengawet kimia.",
    image: "/images/olahan/pulp_mangga.jpg",
  },
  {
    id: "6",
    name: "Dodol Mangga Asli Indramayu",
    category: "Olahan Mangga",
    seller: "Hj. Ningsih (UMKM Dapur Mangga Bu Ning)",
    location: "Indramayu Kota",
    stock: 500,
    stockUnit: "Kotak (250 gr)",
    price: 18000,
    priceUnit: "Kotak (250 gr)",
    tags: ["Oleh-oleh", "Tradisional"],
    description: "Tekstur kenyal lembut legit dengan cita rasa mangga yang kuat. Kemasan higienis vakum food-grade.",
    image: "/images/olahan/dodol_mangga.jpg",
  },
  {
    id: "7",
    name: "Keripik Mangga Vacuum Frying",
    category: "Olahan Mangga",
    seller: "Siti Masitoh (Camilan Keripik Barokah)",
    location: "Losarang, Indramayu",
    stock: 450,
    stockUnit: "Pouch (100 gr)",
    price: 16000,
    priceUnit: "Pouch (100 gr)",
    tags: ["Renyah", "Vacuum Fry"],
    description: "Diproses dengan teknologi penggorengan hampa suhu rendah (vacuum fry) menjaga aroma dan warna alami mangga.",
    image: "/images/olahan/keripik_mangga.jpg",
  },
  {
    id: "8",
    name: "Sirup Mangga Gedong Gincu Konsentrat",
    category: "Olahan Mangga",
    seller: "Hj. Ningsih (UMKM Dapur Mangga Bu Ning)",
    location: "Indramayu Kota",
    stock: 250,
    stockUnit: "Botol (600 ml)",
    price: 32000,
    priceUnit: "Botol (600 ml)",
    tags: ["Horeka", "Konsentrat"],
    description: "Konsentrat sirup sari buah mangga asli beraroma harum pekat, cocok untuk bahan baku mocktail, cafe, dan hotel.",
    image: "/images/olahan/sirup_mangga.jpg",
  },
];

export const PRODUCTS: readonly Product[] = INITIAL_PRODUCTS;

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
