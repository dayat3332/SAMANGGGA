import type { MetodePembayaran } from "@/types/samangga";

export type ProductCategory = "Mangga Segar" | "Olahan Mangga" | "Bibit Pohon";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  seller: string;
  location: string;
  stock: number;
  stockUnit: string;
  /** Harga per satuan dalam Rupiah. */
  price: number;
  priceUnit: string;
  /** Label singkat, mis. grade / varietas / ukuran. */
  tags: readonly string[];
  /** Deskripsi singkat (1–2 kalimat). */
  description: string;
  /** Lokasi aset gambar produk */
  image?: string;
}

export const CATEGORIES: readonly ProductCategory[] = [
  "Mangga Segar",
  "Olahan Mangga",
  "Bibit Pohon",
];

export const PRODUCTS: readonly Product[] = [
  // Mangga Segar
  {
    id: "ms-01",
    name: "Mangga Gedong Gincu",
    category: "Mangga Segar",
    seller: "Kelompok Tani Sumber Rejeki",
    location: "Lohbener, Indramayu",
    stock: 50,
    stockUnit: "Kwintal",
    price: 1450000,
    priceUnit: "kwintal",
    tags: ["Grade A", "Ekspor"],
    description:
      "Kulit merah-jingga, aroma kuat, dipetik pada tingkat kematangan 80%. Cocok untuk ritel premium.",
    image: "/images/mangga/mangga_gincu.jpg",
  },
  {
    id: "ms-02",
    name: "Mangga Arumanis",
    category: "Mangga Segar",
    seller: "Gapoktan Mekar Tani",
    location: "Jatibarang, Indramayu",
    stock: 80,
    stockUnit: "Kwintal",
    price: 1200000,
    priceUnit: "kwintal",
    tags: ["Super", "Sortir"],
    description:
      "Daging tebal, manis, sedikit serat. Sudah disortir ukuran 3–4 buah per kg.",
    image: "/images/mangga/mangga_harusmanis.jpg",
  },
  {
    id: "ms-03",
    name: "Mangga Golek",
    category: "Mangga Segar",
    seller: "Pak Darsono",
    location: "Sliyeg, Indramayu",
    stock: 35,
    stockUnit: "Kwintal",
    price: 950000,
    priceUnit: "kwintal",
    tags: ["Matang pohon"],
    description:
      "Buah lonjong besar, manis segar. Panen bertahap, siap kirim mingguan.",
    image: "/images/mangga/mangga_golek.jpg",
  },
  {
    id: "ms-04",
    name: "Mangga Manalagi",
    category: "Mangga Segar",
    seller: "KT Harapan Jaya",
    location: "Kandanghaur, Indramayu",
    stock: 120,
    stockUnit: "Kg",
    price: 18000,
    priceUnit: "kg",
    tags: ["Pilihan", "Eceran"],
    description:
      "Rasa manis legit dengan tekstur lembut. Bisa dibeli dalam jumlah kecil.",
    image: "/images/mangga/mangga_manalagi.jpg",
  },
  {
    id: "ms-05",
    name: "Mangga Afkir untuk Olahan",
    category: "Mangga Segar",
    seller: "KT Sido Makmur",
    location: "Gabuswetan, Indramayu",
    stock: 200,
    stockUnit: "Kg",
    price: 6500,
    priceUnit: "kg",
    tags: ["Grade C", "Bahan olahan"],
    description:
      "Buah kecil atau sedikit cacat kulit, rasa tetap baik. Ideal untuk jus, pulp, dan dodol.",
    image: "/images/mangga/mangga_afkir.jpg",
  },

  // Olahan Mangga
  {
    id: "om-01",
    name: "Dodol Mangga Original",
    category: "Olahan Mangga",
    seller: "UMKM Dapur Mangga Bu Ning",
    location: "Indramayu Kota",
    stock: 300,
    stockUnit: "Pak",
    price: 22000,
    priceUnit: "pak",
    tags: ["250 g", "PIRT"],
    description:
      "Dodol legit dari mangga gedong asli tanpa pewarna. Tahan hingga 3 bulan.",
    image: "/images/olahan/dodol_mangga.jpg",
  },
  {
    id: "om-02",
    name: "Keripik Mangga Renyah",
    category: "Olahan Mangga",
    seller: "UMKM Camilan Pantura",
    location: "Losarang, Indramayu",
    stock: 450,
    stockUnit: "Pak",
    price: 15000,
    priceUnit: "pak",
    tags: ["100 g", "Halal"],
    description:
      "Keripik vacuum frying, renyah dan manis alami. Cocok untuk oleh-oleh.",
    image: "/images/olahan/keripik_mangga.jpg",
  },
  {
    id: "om-03",
    name: "Pulp (Bubur) Mangga",
    category: "Olahan Mangga",
    seller: "Mitra Olah Cipta Rasa",
    location: "Lohbener, Indramayu",
    stock: 90,
    stockUnit: "Kg",
    price: 32000,
    priceUnit: "kg",
    tags: ["1 kg", "Beku"],
    description:
      "Bubur mangga murni untuk bahan jus, es krim, dan kue. Dikirim beku.",
    image: "/images/olahan/pulp_mangga.jpg",
  },
  {
    id: "om-04",
    name: "Sirup Mangga Gedong",
    category: "Olahan Mangga",
    seller: "UMKM Segar Pantura",
    location: "Anjatan, Indramayu",
    stock: 160,
    stockUnit: "Botol",
    price: 28000,
    priceUnit: "botol",
    tags: ["600 ml", "PIRT"],
    description:
      "Sirup kental dari sari mangga gedong. Satu botol untuk sekitar 20 gelas.",
    image: "/images/olahan/sirup_mangga.jpg",
  },
  {
    id: "om-05",
    name: "Pupuk Kompos Kulit Mangga",
    category: "Olahan Mangga",
    seller: "Mitra Olah Tani Lestari",
    location: "Sliyeg, Indramayu",
    stock: 40,
    stockUnit: "Karung",
    price: 35000,
    priceUnit: "karung",
    tags: ["25 kg", "Sirkular"],
    description:
      "Kompos matang dari limbah kulit mangga. Menyuburkan tanah kebun dan sawah.",
    image: "/images/limbah/pupuk_kompos.jpg",
  },

  // Bibit Pohon
  {
    id: "bp-01",
    name: "Bibit Okulasi Gedong Gincu",
    category: "Bibit Pohon",
    seller: "Pembibitan Mangga Pantura",
    location: "Kandanghaur, Indramayu",
    stock: 250,
    stockUnit: "Batang",
    price: 45000,
    priceUnit: "batang",
    tags: ["80 cm", "Bersertifikat"],
    description:
      "Bibit okulasi sehat, siap tanam. Mulai berbuah sekitar 2–3 tahun.",
    image: "/images/bibit/bibit_gedonggincu.jpg",
  },
  {
    id: "bp-02",
    name: "Bibit Okulasi Arumanis",
    category: "Bibit Pohon",
    seller: "Pembibitan Berkah Tani",
    location: "Jatibarang, Indramayu",
    stock: 400,
    stockUnit: "Batang",
    price: 35000,
    priceUnit: "batang",
    tags: ["60 cm", "Polybag"],
    description:
      "Bibit dalam polybag dengan akar kuat. Cocok untuk lahan pekarangan maupun kebun.",
    image: "/images/bibit/bibit_arummanis.jpg",
  },
  {
    id: "bp-03",
    name: "Bibit Cangkok Golek",
    category: "Bibit Pohon",
    seller: "Kebun Bibit Pak Warta",
    location: "Bongas, Indramayu",
    stock: 120,
    stockUnit: "Batang",
    price: 30000,
    priceUnit: "batang",
    tags: ["Cangkok", "50 cm"],
    description:
      "Bibit cangkok dari pohon induk unggul. Pertumbuhan cepat dan sifat sama dengan induk.",
    image: "/images/bibit/bibit_golek.jpg",
  },
];

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
