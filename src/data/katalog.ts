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

export const PRODUCTS: readonly Product[] = [
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
    spesifikasi: [
      { label: "Varietas", value: "Gedong Gincu Asli Indramayu" },
      { label: "Grade Kualitas", value: "Super Ekspor (Grade A+)" },
      { label: "Tingkat Kemanisan", value: "15 – 18° Brix (Manis Pekat Alami)" },
      { label: "Tingkat Kematangan", value: "80% – 85% Matang Pohon (Siap Kirim)" },
      { label: "Bobot per Buah", value: "300 – 400 gram (3–4 buah/kg)" },
      { label: "Karakter Daging", value: "Daging tebal oranye kemerahan, serat sangat halus" },
      { label: "Standar Budidaya", value: "Good Agricultural Practices (GAP) Indramayu" },
      { label: "Masa Simpan", value: "5–7 hari (suhu ruang), 14 hari (cold storage 12°C)" },
    ],
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
    spesifikasi: [
      { label: "Varietas", value: "Arumanis 143 Indramayu" },
      { label: "Grade Kualitas", value: "Super Pilihan Pasar Induk & Modern" },
      { label: "Tingkat Kemanisan", value: "14 – 16° Brix" },
      { label: "Tingkat Kematangan", value: "85% Siap Konsumsi / Matang Pohon" },
      { label: "Bobot per Buah", value: "350 – 500 gram / buah" },
      { label: "Karakter Daging", value: "Aroma harum khas, daging lembut juicy tanpa serat kasar" },
      { label: "Masa Simpan", value: "5–6 hari di suhu ruang berventilasi" },
    ],
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
    spesifikasi: [
      { label: "Varietas", value: "Mangga Golek Lokal Pantura" },
      { label: "Grade Kualitas", value: "Grade A Jumbo" },
      { label: "Tingkat Kemanisan", value: "13 – 15° Brix (Segar Manis)" },
      { label: "Bobot per Buah", value: "500 – 750 gram / buah (Ukuran Besar)" },
      { label: "Bentuk & Tekstur", value: "Lonjong panjang, daging padat pulen" },
      { label: "Kondisi Panen", value: "Petik tua matang pohon alami" },
    ],
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
    spesifikasi: [
      { label: "Varietas", value: "Manalagi Segar" },
      { label: "Grade Kualitas", value: "Grade Pilihan Ritel" },
      { label: "Tingkat Kemanisan", value: "14 – 16° Brix (Manis Legit Walau Mengkal)" },
      { label: "Bobot per Buah", value: "250 – 350 gram / buah" },
      { label: "Kemasan", value: "Karton jinjing berpelindung net buah" },
    ],
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
    spesifikasi: [
      { label: "Kategori", value: "Bahan Baku Industri Olahan UMKM" },
      { label: "Grade Kualitas", value: "Grade C (Cacat Fisik Kulit Ringan, Daging Prima)" },
      { label: "Kandungan Daging", value: "Tingkat kematangan optimal untuk fermentasi/ekstraksi" },
      { label: "Rekomendasi Olah", value: "Sari buah, pulp frozen, dodol mangga, cuka buah" },
    ],
  },

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
    spesifikasi: [
      { label: "Komposisi", value: "Mangga Gedong Gincu Asli, Gula Kelapa, Tepung Ketan" },
      { label: "Berat Bersih", value: "250 gram / kemasan box higienis" },
      { label: "Masa Kedaluwarsa", value: "3 Bulan di suhu ruang (Tanpa Pengawet Sintetis)" },
      { label: "Legalitas", value: "P-IRT & Sertifikasi Halal Kemenag" },
    ],
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
    spesifikasi: [
      { label: "Teknologi Olah", value: "Vacuum Frying suhu rendah (nutrisi buah terjaga)" },
      { label: "Bahan", value: "100% Buah Mangga Indramayu & Minyak Nabati Kelapa" },
      { label: "Berat Bersih", value: "100 gram (Aluminium Foil Seal Kedap Udara)" },
      { label: "Masa Kedaluwarsa", value: "8 Bulan" },
    ],
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
    spesifikasi: [
      { label: "Bahan Baku", value: "100% Daging Mangga Gedong & Harum Manis Murni" },
      { label: "Kondisi Pengiriman", value: "Frozen (-18°C) dalam vacuum pouch 1 kg" },
      { label: "Aplikasi Industri", value: "Horeka, Es Krim Artisan, Bakery, Jus Kafe" },
    ],
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
    spesifikasi: [
      { label: "Isi Bersih", value: "600 ml botol kaca segel" },
      { label: "Konsentrasi", value: "Ekstrak Buah Mangga Asli Indramayu + Gula Tebu Alami" },
      { label: "Rasio Larutan", value: "1 bagian sirup : 4 bagian air dingin/soda" },
    ],
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
    spesifikasi: [
      { label: "Jenis Produk", value: "Kompos Organik Fermentasi Sirkular" },
      { label: "Bahan Utama", value: "Kulit & Serat Mangga Limbah Pengolahan + Bio-Aktivator" },
      { label: "Kemasan", value: "Karung 25 kg berpori" },
      { label: "Kandungan Unsur", value: "Kaya Kalium, Fosfor Organik, dan Bahan Humat" },
    ],
  },

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
    spesifikasi: [
      { label: "Metode Perbanyakan", value: "Okulasi Mata Tempel Induk Bersertifikat" },
      { label: "Tinggi Bibit", value: "70 – 90 cm dalam polybag" },
      { label: "Masa Awal Berbuah", value: "2 – 3 tahun setelah tanam" },
      { label: "Ketahanan Hama", value: "Batang bawah tahan cekaman tanah pesisir" },
    ],
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
    spesifikasi: [
      { label: "Metode Perbanyakan", value: "Okulasi Batang Unggul" },
      { label: "Tinggi Bibit", value: "60 – 75 cm" },
      { label: "Media Tanam", value: "Tanah humus + kompos organik matang" },
    ],
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
    spesifikasi: [
      { label: "Metode Perbanyakan", value: "Cangkok Akar Serabut Lebat" },
      { label: "Tinggi Bibit", value: "50 – 65 cm" },
      { label: "Karakteristik", value: "Cepat berbuah, tajuk rimbun ideal untuk lahan sempit" },
    ],
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
