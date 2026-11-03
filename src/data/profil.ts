import type {
  Admin,
  DetailTransaksi,
  KategoriKonsumenErd,
  Konsumen,
  Limbah,
  LogSistem,
  Mitra,
  Pembayaran,
  PencatatanKeuangan,
  Pengguna,
  PeranPengguna,
  Produk,
  RiwayatPengiriman,
  StatusVerifikasi,
  Supplier,
  TingkatAkses,
  TipeSupplier,
  Transaksi,
  UMKM,
} from "@/types/samangga";

export type RoleSlug = "petani" | "umkm" | "mitra" | "konsumen" | "admin";

export const ROLE_STORAGE_KEY = "samangga_active_role";

// Profil 5 Peran Ekosistem

export interface BaseUserProfile {
  id_user: number;
  slug: RoleSlug;
  peranErd: PeranPengguna;
  roleTitle: string;
  roleBadge: string;
  nama_lengkap: string;
  email: string;
  no_telp: string;
  alamat: string;
  password: string;
  status_verifikasi: StatusVerifikasi;
  tgl_daftar: string;
  kodeMitra: string;
}

export interface SupplierProfile extends BaseUserProfile, Omit<Supplier, "id_user" | "no_telp"> {
  slug: "petani";
  peranErd: "Supplier";
  tipe_supplier: TipeSupplier;
  luas_lahan_m2: number;
  jenis_komoditas_utama: string;
  nama_bank: string;
  no_rekening: string;
}

export interface UmkmProfile extends BaseUserProfile, Omit<UMKM, "id_user" | "no_telp"> {
  slug: "umkm";
  peranErd: "UMKM";
  id_umkm: number;
  nama_usaha: string;
  nib: string;
  kategori_produk_olahan: string;
  kapasitas_produksi_bulanan: number;
  nama_bank: string;
  no_rekening: string;
}

export interface MitraProfile extends BaseUserProfile, Omit<Mitra, "id_user" | "no_telp"> {
  slug: "mitra";
  peranErd: "Mitra";
  id_mitra: number;
  nama_mitra_instansi: string;
  jenis_pengolahan_limbah: string;
  kapasitas_tampung_limbah_kg: number;
  jangkauan_area: string;
  nama_bank: string;
  no_rekening: string;
}

export interface KonsumenProfile extends BaseUserProfile, Omit<Konsumen, "id_user" | "no_telp"> {
  slug: "konsumen";
  peranErd: "Konsumen";
  id_konsumen: number;
  kategori_konsumen: KategoriKonsumenErd;
  alamat_pengiriman_utama: string;
  titik_koordinat: string;
}

export interface AdminProfile extends BaseUserProfile, Omit<Admin, "id_user" | "no_telp"> {
  slug: "admin";
  peranErd: "Admin";
  id_admin: number;
  nip_id_pegawai: string;
  tingkat_akses: TingkatAkses;
  divisi: string;
}

export type AnyRoleProfile =
  | SupplierProfile
  | UmkmProfile
  | MitraProfile
  | KonsumenProfile
  | AdminProfile;

export const ROLE_NAVIGATION_LIST: readonly {
  slug: RoleSlug;
  peranErd: PeranPengguna;
  label: string;
  shortLabel: string;
  href: string;
  tableErd: string;
  summary: string;
}[] = [
  {
    slug: "petani",
    peranErd: "Supplier",
    label: "Supplier (Petani & Pengepul)",
    shortLabel: "Supplier",
    href: "/profil/petani",
    tableErd: "Pengguna + Supplier",
    summary: "Menawarkan Produk (Buah), menjual ke UMKM/Konsumen, konfirmasi Transfer Manual & catat keuangan.",
  },
  {
    slug: "umkm",
    peranErd: "UMKM",
    label: "UMKM Pengolah Mangga",
    shortLabel: "UMKM",
    href: "/profil/umkm",
    tableErd: "Pengguna + UMKM",
    summary: "Membeli bahan baku Buah, menawarkan Produk (Olahan), mencatat Limbah produksi & buku keuangan.",
  },
  {
    slug: "mitra",
    peranErd: "Mitra",
    label: "Mitra Pengolah Limbah & Logistik",
    shortLabel: "Mitra",
    href: "/profil/mitra",
    tableErd: "Pengguna + Mitra",
    summary: "Menjemput Limbah UMKM (Jual Beli/Jasa Berbayar/Gratis), menangani Riwayat Pengiriman & keuangan.",
  },
  {
    slug: "konsumen",
    peranErd: "Konsumen",
    label: "Konsumen (Ritel & Grosir)",
    shortLabel: "Konsumen",
    href: "/profil/konsumen",
    tableErd: "Pengguna + Konsumen",
    summary: "Membeli Produk Buah/Olahan, melakukan Pembayaran (Transfer/VA/QRIS) & melacak Riwayat Pengiriman.",
  },
  {
    slug: "admin",
    peranErd: "Admin",
    label: "Admin Sistem SAMANGGA",
    shortLabel: "Admin",
    href: "/profil/admin",
    tableErd: "Pengguna + Admin",
    summary: "Super Admin, Admin Transaksi & Admin Limbah: verifikasi Pengguna/Produk/Limbah & audit Log Sistem.",
  },
];

export const DEFAULT_PROFILES: Record<RoleSlug, AnyRoleProfile> = {
  petani: {
    id_user: 101,
    slug: "petani",
    peranErd: "Supplier",
    roleTitle: "Supplier Hulu (Petani & Pengepul)",
    roleBadge: "Tabel: Supplier",
    nama_lengkap: "H. Agus Supriyadi (KT Sumber Rejeki)",
    email: "agus.sumberrejeki@samangga.id",
    no_telp: "0812-2345-6789",
    alamat: "Desa Lohbener Blok Kebun Mangga RT 04/02, Kec. Lohbener, Indramayu",
    password: "$2b$10$hash_supplier_101_samangga",
    status_verifikasi: "Terverifikasi",
    tgl_daftar: "2026-01-12 08:15:00",
    kodeMitra: "SUP-IMY-0101",
    id_supplier: 1,
    tipe_supplier: "Petani",
    luas_lahan_m2: 45000,
    jenis_komoditas_utama: "Mangga Gedong Gincu & Arumanis Super",
    nama_bank: "BRI Unit Lohbener",
    no_rekening: "0029-01-088219-53-2",
  },
  umkm: {
    id_user: 202,
    slug: "umkm",
    peranErd: "UMKM",
    roleTitle: "UMKM Pengolah Produk Mangga",
    roleBadge: "Tabel: UMKM",
    nama_lengkap: "Hj. Ningsih Rahmawati",
    email: "dapur.buning@samangga.id",
    no_telp: "0813-9876-5432",
    alamat: "Jl. Raya Sindang No. 45, Kec. Indramayu Kota, Kabupaten Indramayu",
    password: "$2b$10$hash_umkm_202_samangga",
    status_verifikasi: "Terverifikasi",
    tgl_daftar: "2026-02-04 10:30:00",
    kodeMitra: "UMKM-IMY-0202",
    id_umkm: 12,
    nama_usaha: "UMKM Dapur Mangga Bu Ning",
    nib: "9120301847261",
    kategori_produk_olahan: "Dodol Mangga, Sirup Gedong, & Puree Beku",
    kapasitas_produksi_bulanan: 1200,
    nama_bank: "Bank BJB Cabang Indramayu",
    no_rekening: "0114-02-009812-10-8",
  },
  mitra: {
    id_user: 303,
    slug: "mitra",
    peranErd: "Mitra",
    roleTitle: "Mitra Pengolah Limbah & Logistik Sirkular",
    roleBadge: "Tabel: Mitra",
    nama_lengkap: "Ir. Hendra Kusuma",
    email: "operasional@biotanipantura.id",
    no_telp: "0821-1122-3344",
    alamat: "Kawasan Agribisnis Terpadu Sliyeg KM 3, Kec. Sliyeg, Indramayu",
    password: "$2b$10$hash_mitra_303_samangga",
    status_verifikasi: "Terverifikasi",
    tgl_daftar: "2026-01-19 14:20:00",
    kodeMitra: "MTR-IMY-0303",
    id_mitra: 3,
    nama_mitra_instansi: "CV Bio Tani Lestari (Bio-Refinery & Logistik)",
    jenis_pengolahan_limbah: "Kompos Organik, Maggot BSF & Ekstraksi Pektin Kulit/Biji",
    kapasitas_tampung_limbah_kg: 1500,
    jangkauan_area: "Kec. Lohbener, Indramayu Kota, Sliyeg, Jatibarang, Gantar",
    nama_bank: "Bank Mandiri Indramayu",
    no_rekening: "134-00-0992817-4",
  },
  konsumen: {
    id_user: 404,
    slug: "konsumen",
    peranErd: "Konsumen",
    roleTitle: "Konsumen Ritel & Mitra Grosir",
    roleBadge: "Tabel: Konsumen",
    nama_lengkap: "Budi Santoso (Segar Buah Nusantara)",
    email: "purchasing@segarbuah.co.id",
    no_telp: "0811-2233-4455",
    alamat: "Jl. Tuparev No. 88, Kedawung, Cirebon / Gudang Distribusi Pantura",
    password: "$2b$10$hash_konsumen_404_samangga",
    status_verifikasi: "Terverifikasi",
    tgl_daftar: "2026-03-01 09:05:00",
    kodeMitra: "KON-IMY-0404",
    id_konsumen: 45,
    kategori_konsumen: "Grosir",
    alamat_pengiriman_utama:
      "Gudang Segar Buah Nusantara, Jl. Tuparev No. 88, Cirebon (Akses Truk Cold-Box)",
    titik_koordinat: "-6.712840, 108.532910",
  },
  admin: {
    id_user: 505,
    slug: "admin",
    peranErd: "Admin",
    roleTitle: "Administrator Platform SAMANGGA",
    roleBadge: "Tabel: Admin",
    nama_lengkap: "Dr. Raka Pratama, M.Kom.",
    email: "admin.pusat@samangga.id",
    no_telp: "0815-8800-9900",
    alamat: "Gedung Command Center Agribisnis Mangga, Kec. Indramayu, Kab. Indramayu",
    password: "$2b$10$hash_admin_505_samangga",
    status_verifikasi: "Terverifikasi",
    tgl_daftar: "2026-01-01 07:00:00",
    kodeMitra: "ADM-IMY-0505",
    id_admin: 1,
    nip_id_pegawai: "NIP-19910415-202601-1-001",
    tingkat_akses: "Super Admin",
    divisi: "Tata Kelola Rantai Pasok & Pasar Sirkular",
  },
};

// Data Awal Relasional ERD Platform

export const INITIAL_PENGGUNA_LIST: readonly Pengguna[] = [
  {
    id_user: 101,
    nama_lengkap: "H. Agus Supriyadi (KT Sumber Rejeki)",
    peran: "Supplier",
    no_telp: "0812-2345-6789",
    alamat: "Desa Lohbener Blok Kebun Mangga RT 04/02, Kec. Lohbener, Indramayu",
    email: "agus.sumberrejeki@samangga.id",
    password: "$2b$10$hash_supplier_101",
    status_verifikasi: "Terverifikasi",
    tgl_daftar: "2026-01-12 08:15:00",
  },
  {
    id_user: 102,
    nama_lengkap: "H. Карtono (UD Pengepul Mangga Jatibarang)",
    peran: "Supplier",
    no_telp: "0812-8899-0011",
    alamat: "Pasar Daerah Jatibarang Blok B-12, Kec. Jatibarang, Indramayu",
    email: "kartono.pengepul@samangga.id",
    password: "$2b$10$hash_supplier_102",
    status_verifikasi: "Menunggu",
    tgl_daftar: "2026-10-30 15:40:00",
  },
  {
    id_user: 202,
    nama_lengkap: "Hj. Ningsih Rahmawati (UMKM Dapur Mangga Bu Ning)",
    peran: "UMKM",
    no_telp: "0813-9876-5432",
    alamat: "Jl. Raya Sindang No. 45, Kec. Indramayu Kota, Kabupaten Indramayu",
    email: "dapur.buning@samangga.id",
    password: "$2b$10$hash_umkm_202",
    status_verifikasi: "Terverifikasi",
    tgl_daftar: "2026-02-04 10:30:00",
  },
  {
    id_user: 203,
    nama_lengkap: "Rina Marlina (UMKM Keripik & Manisan Gedong)",
    peran: "UMKM",
    no_telp: "0813-7766-5544",
    alamat: "Desa Krasak RT 02/01, Kec. Jatibarang, Kabupaten Indramayu",
    email: "rina.manisan@samangga.id",
    password: "$2b$10$hash_umkm_203",
    status_verifikasi: "Menunggu",
    tgl_daftar: "2026-11-01 11:20:00",
  },
  {
    id_user: 303,
    nama_lengkap: "Ir. Hendra Kusuma (CV Bio Tani Lestari)",
    peran: "Mitra",
    no_telp: "0821-1122-3344",
    alamat: "Kawasan Agribisnis Terpadu Sliyeg KM 3, Kec. Sliyeg, Indramayu",
    email: "operasional@biotanipantura.id",
    password: "$2b$10$hash_mitra_303",
    status_verifikasi: "Terverifikasi",
    tgl_daftar: "2026-01-19 14:20:00",
  },
  {
    id_user: 404,
    nama_lengkap: "Budi Santoso (Segar Buah Nusantara)",
    peran: "Konsumen",
    no_telp: "0811-2233-4455",
    alamat: "Jl. Tuparev No. 88, Kedawung, Cirebon",
    email: "purchasing@segarbuah.co.id",
    password: "$2b$10$hash_konsumen_404",
    status_verifikasi: "Terverifikasi",
    tgl_daftar: "2026-03-01 09:05:00",
  },
  {
    id_user: 505,
    nama_lengkap: "Dr. Raka Pratama, M.Kom.",
    peran: "Admin",
    no_telp: "0815-8800-9900",
    alamat: "Command Center Agribisnis Mangga Indramayu",
    email: "admin.pusat@samangga.id",
    password: "$2b$10$hash_admin_505",
    status_verifikasi: "Terverifikasi",
    tgl_daftar: "2026-01-01 07:00:00",
  },
];

export const INITIAL_PRODUK_LIST: readonly Produk[] = [
  // Produk ditawarkan oleh Supplier (id_user = 101, kategori = "Buah")
  {
    id_produk: 1001,
    id_user: 101,
    nama_produk: "Mangga Gedong Gincu Grade A (Sortir Ekspor)",
    kategori: "Buah",
    harga: 1450000,
    stok: 50,
    satuan: "Kwintal",
    deskripsi: "Mangga Gedong Gincu petik tua pohon dari kebun Lohbener, kulit merah oranye merata.",
    gambar: "/images/mangga/mangga_gincu.jpg",
    status_verifikasi: "Terverifikasi",
  },
  {
    id_produk: 1002,
    id_user: 101,
    nama_produk: "Mangga Arumanis Super Matang Pohon",
    kategori: "Buah",
    harga: 1200000,
    stok: 80,
    satuan: "Kwintal",
    deskripsi: "Daging tebal, manis legit, cocok untuk ritel buah segar maupun bahan baku puree.",
    gambar: "/images/mangga/mangga_harusmanis.jpg",
    status_verifikasi: "Terverifikasi",
  },
  {
    id_produk: 1003,
    id_user: 101,
    nama_produk: "Mangga Gedong Grade B/C (Khusus Bahan Baku UMKM)",
    kategori: "Buah",
    harga: 650000,
    stok: 40,
    satuan: "Kwintal",
    deskripsi: "Kulit bercak alami namun daging buah 100% segar manis untuk olahan dodol & sirup.",
    gambar: "/images/mangga/mangga_afkir.jpg",
    status_verifikasi: "Menunggu",
  },
  // Produk ditawarkan oleh UMKM (id_user = 202, kategori = "Olahan")
  {
    id_produk: 2001,
    id_user: 202,
    nama_produk: "Dodol Mangga Gedong Gincu Original (250g · PIRT)",
    kategori: "Olahan",
    harga: 22000,
    stok: 300,
    satuan: "Pak",
    deskripsi: "Dodol mangga asli tanpa pengawet buatan, diproduksi dari daging mangga Gedong pilihan.",
    gambar: "/images/olahan/dodol_mangga.jpg",
    status_verifikasi: "Terverifikasi",
  },
  {
    id_produk: 2002,
    id_user: 202,
    nama_produk: "Sirup Konsentrat Mangga Gedong (Botol 600 ml)",
    kategori: "Olahan",
    harga: 28000,
    stok: 160,
    satuan: "Botol",
    deskripsi: "Sirup sari buah mangga Indramayu harum khas Gedong Gincu dengan gula tebu murni.",
    gambar: "/images/olahan/sirup_mangga.jpg",
    status_verifikasi: "Terverifikasi",
  },
  {
    id_produk: 2003,
    id_user: 202,
    nama_produk: "Puree / Pulp Mangga Beku Pasteurisasi (Kemasan 1 Kg)",
    kategori: "Olahan",
    harga: 32000,
    stok: 95,
    satuan: "Kg",
    deskripsi: "Bubur daging mangga murni beku untuk bahan baku kafe, bakery, dan industri minuman.",
    gambar: "/images/olahan/pulp_mangga.jpg",
    status_verifikasi: "Menunggu",
  },
  // Produk Sirkular ditawarkan oleh Mitra (id_user = 303, hasil olahan limbah kulit & biji mangga)
  {
    id_produk: 3001,
    id_user: 303,
    nama_produk: "Pupuk Kompos Organik Fermentasi Kulit Mangga (Karung 25 Kg)",
    kategori: "Olahan",
    harga: 65000,
    stok: 140,
    satuan: "Karung",
    deskripsi: "Pupuk kompos organik hasil olahan limbah kulit & buah afkir mangga untuk menyuburkan kebun petani.",
    gambar: "/images/limbah/pupuk_kompos.jpg",
    status_verifikasi: "Terverifikasi",
  },
  {
    id_produk: 3002,
    id_user: 303,
    nama_produk: "Bibit Pohon Mangga Gedong Gincu Semaian Biji Unggul (Siap Tanam)",
    kategori: "Buah",
    harga: 45000,
    stok: 220,
    satuan: "Pohon",
    deskripsi: "Bibit pohon mangga hasil semaian biji pilihan UMKM yang telah diokulasi dan siap tanam di kebun.",
    gambar: "/images/bibit/bibit_gedonggincu.jpg",
    status_verifikasi: "Terverifikasi",
  },
];

export const INITIAL_TRANSAKSI_LIST: readonly Transaksi[] = [
  // Transaksi 5001: Konsumen (404) membeli Buah dari Supplier (101) — Transfer Manual (Menunggu konfirmasi penjual)
  {
    id_transaksi: 5001,
    id_pembeli: 404,
    id_penjual: 101,
    tgl_transaksi: "2026-11-01 09:30:00",
    total_harga: 7250000,
    status: "Pending",
  },
  // Transaksi 5002: UMKM (202) membeli bahan baku Buah dari Supplier (101) — Virtual Account (Berhasil)
  {
    id_transaksi: 5002,
    id_pembeli: 202,
    id_penjual: 101,
    tgl_transaksi: "2026-10-28 14:15:00",
    total_harga: 9600000,
    status: "Selesai",
  },
  // Transaksi 5003: Konsumen (404) membeli Produk Olahan dari UMKM (202) — QRIS (Berhasil, sedang dikirim)
  {
    id_transaksi: 5003,
    id_pembeli: 404,
    id_penjual: 202,
    tgl_transaksi: "2026-10-31 16:00:00",
    total_harga: 1660000,
    status: "Diproses",
  },
  // Transaksi 5004: Konsumen (404) membeli Produk Olahan dari UMKM (202) — Transfer Manual (Menunggu konfirmasi penjual UMKM)
  {
    id_transaksi: 5004,
    id_pembeli: 404,
    id_penjual: 202,
    tgl_transaksi: "2026-11-02 11:10:00",
    total_harga: 840000,
    status: "Pending",
  },
  // Transaksi 5005: Supplier/Petani (101) membeli Pupuk Kompos & Bibit Pohon dari Mitra (303) — QRIS (Selesai)
  {
    id_transaksi: 5005,
    id_pembeli: 101,
    id_penjual: 303,
    tgl_transaksi: "2026-11-02 15:20:00",
    total_harga: 1550000,
    status: "Selesai",
  },
];

export const INITIAL_DETAIL_TRANSAKSI_LIST: readonly DetailTransaksi[] = [
  {
    id_detail_transaksi: 9001,
    id_transaksi: 5001,
    id_produk: 1001,
    jumlah_produk: 5,
    harga_satuan: 1450000,
    subtotal_harga: 7250000,
  },
  {
    id_detail_transaksi: 9002,
    id_transaksi: 5002,
    id_produk: 1002,
    jumlah_produk: 8,
    harga_satuan: 1200000,
    subtotal_harga: 9600000,
  },
  {
    id_detail_transaksi: 9003,
    id_transaksi: 5003,
    id_produk: 2001,
    jumlah_produk: 50,
    harga_satuan: 22000,
    subtotal_harga: 1100000,
  },
  {
    id_detail_transaksi: 9004,
    id_transaksi: 5003,
    id_produk: 2002,
    jumlah_produk: 20,
    harga_satuan: 28000,
    subtotal_harga: 560000,
  },
  {
    id_detail_transaksi: 9005,
    id_transaksi: 5004,
    id_produk: 2002,
    jumlah_produk: 30,
    harga_satuan: 28000,
    subtotal_harga: 840000,
  },
  {
    id_detail_transaksi: 9006,
    id_transaksi: 5005,
    id_produk: 3001,
    jumlah_produk: 10,
    harga_satuan: 65000,
    subtotal_harga: 650000,
  },
  {
    id_detail_transaksi: 9007,
    id_transaksi: 5005,
    id_produk: 3002,
    jumlah_produk: 20,
    harga_satuan: 45000,
    subtotal_harga: 900000,
  },
];

export const INITIAL_PEMBAYARAN_LIST: readonly Pembayaran[] = [
  {
    id_pembayaran: 7001,
    id_transaksi: 5001,
    metode_pembayaran: "Transfer Manual",
    jumlah_bayar: 7250000,
    status_pembayaran: "Menunggu",
    id_referensi_gateway: null,
    kode_pembayaran: null,
    bukti_transfer: "bukti_tf_bri_5001_segarbuah.jpg",
    batas_waktu_bayar: "2026-11-02 09:30:00",
    tgl_bayar: "2026-11-01 10:05:00",
  },
  {
    id_pembayaran: 7002,
    id_transaksi: 5002,
    metode_pembayaran: "Virtual Account",
    jumlah_bayar: 9600000,
    status_pembayaran: "Berhasil",
    id_referensi_gateway: "GW-VA-20261028-99812",
    kode_pembayaran: "880120265002991",
    bukti_transfer: null,
    batas_waktu_bayar: "2026-10-29 14:15:00",
    tgl_bayar: "2026-10-28 14:22:10",
  },
  {
    id_pembayaran: 7003,
    id_transaksi: 5003,
    metode_pembayaran: "QRIS",
    jumlah_bayar: 1660000,
    status_pembayaran: "Berhasil",
    id_referensi_gateway: "GW-QRIS-20261031-44120",
    kode_pembayaran: "QRIS-SMG-5003-IMY",
    bukti_transfer: null,
    batas_waktu_bayar: "2026-10-31 17:00:00",
    tgl_bayar: "2026-10-31 16:04:55",
  },
  {
    id_pembayaran: 7004,
    id_transaksi: 5004,
    metode_pembayaran: "Transfer Manual",
    jumlah_bayar: 840000,
    status_pembayaran: "Menunggu",
    id_referensi_gateway: null,
    kode_pembayaran: null,
    bukti_transfer: "bukti_tf_bjb_5004_grosir.jpg",
    batas_waktu_bayar: "2026-11-03 11:10:00",
    tgl_bayar: "2026-11-02 11:30:00",
  },
  {
    id_pembayaran: 7005,
    id_transaksi: 5005,
    metode_pembayaran: "QRIS",
    jumlah_bayar: 1550000,
    status_pembayaran: "Berhasil",
    id_referensi_gateway: "GW-QRIS-20261102-88310",
    kode_pembayaran: "QRIS-SMG-5005-PUPUK",
    bukti_transfer: null,
    batas_waktu_bayar: "2026-11-02 16:20:00",
    tgl_bayar: "2026-11-02 15:24:12",
  },
];

export const INITIAL_LIMBAH_LIST: readonly Limbah[] = [
  {
    id_limbah: 3001,
    id_umkm: 12,
    id_mitra: 3,
    jenis_limbah: "Kulit",
    berat_kg: 180,
    estimasi_harga: 180000,
    jenis_kompensasi: "Jual Beli",
    harga_kesepakatan: 195000,
    lokasi_penjemputan: "Dapur Produksi UMKM Bu Ning, Jl. Raya Sindang No. 45, Indramayu",
    titik_koordinat: "-6.327510, 108.324900",
    foto_limbah: "/images/limbah/limbah_kulit_mangga.jpg",
    status_jemput: "Selesai",
    tgl_jemput: "2026-10-27 08:30:00",
    status_verifikasi: "Terverifikasi",
    tgl_input: "2026-10-26 16:10:00",
  },
  {
    id_limbah: 3002,
    id_umkm: 12,
    id_mitra: 3,
    jenis_limbah: "Biji",
    berat_kg: 220,
    estimasi_harga: 330000,
    jenis_kompensasi: "Jual Beli",
    harga_kesepakatan: 330000,
    lokasi_penjemputan: "Dapur Produksi UMKM Bu Ning, Jl. Raya Sindang No. 45, Indramayu",
    titik_koordinat: "-6.327510, 108.324900",
    foto_limbah: "/images/limbah/limbah_biji_mangga.jpg",
    status_jemput: "Diajukan",
    tgl_jemput: "2026-11-04 09:00:00",
    status_verifikasi: "Terverifikasi",
    tgl_input: "2026-11-01 17:00:00",
  },
  {
    id_limbah: 3003,
    id_umkm: 12,
    id_mitra: null,
    jenis_limbah: "Buah Afkir",
    berat_kg: 150,
    estimasi_harga: 225000,
    jenis_kompensasi: "Jasa Berbayar",
    harga_kesepakatan: null,
    lokasi_penjemputan: "Gudang Sortir UMKM Bu Ning, Kec. Indramayu Kota",
    titik_koordinat: "-6.328100, 108.325400",
    foto_limbah: "/images/mangga/mangga_afkir.jpg",
    status_jemput: "Tersedia",
    tgl_jemput: null,
    status_verifikasi: "Terverifikasi",
    tgl_input: "2026-11-02 13:45:00",
  },
  {
    id_limbah: 3004,
    id_umkm: 12,
    id_mitra: null,
    jenis_limbah: "Kulit",
    berat_kg: 95,
    estimasi_harga: 95000,
    jenis_kompensasi: "Gratis",
    harga_kesepakatan: 0,
    lokasi_penjemputan: "Dapur Produksi UMKM Bu Ning, Jl. Raya Sindang No. 45, Indramayu",
    titik_koordinat: "-6.327510, 108.324900",
    foto_limbah: "limbah_kulit_harian_3004.jpg",
    status_jemput: "Tersedia",
    tgl_jemput: null,
    status_verifikasi: "Menunggu",
    tgl_input: "2026-11-03 08:20:00",
  },
];

export const INITIAL_RIWAYAT_PENGIRIMAN_LIST: readonly RiwayatPengiriman[] = [
  {
    id_pengiriman: 8001,
    id_transaksi: 5002,
    id_mitra: 3,
    tgl_pengiriman: "2026-10-28 16:00:00",
    no_resi_lacak: "RESI-SMG-2026-5002",
    status_pengiriman: "Tiba di Lokasi",
    tgl_diterima: "2026-10-29 09:15:00",
  },
  {
    id_pengiriman: 8002,
    id_transaksi: 5003,
    id_mitra: 3,
    tgl_pengiriman: "2026-11-01 07:30:00",
    no_resi_lacak: "RESI-SMG-2026-5003",
    status_pengiriman: "Dalam Perjalanan",
    tgl_diterima: null,
  },
  {
    id_pengiriman: 8003,
    id_transaksi: 5001,
    id_mitra: null,
    tgl_pengiriman: "2026-11-02 08:00:00",
    no_resi_lacak: "RESI-SMG-2026-5001",
    status_pengiriman: "Diproses",
    tgl_diterima: null,
  },
];

/**
 * Tabel `Pencatatan Keuangan`
 * Sesuai aturan ERD: "Aturan: salah satu dari id_transaksi atau id_limbah wajib terisi."
 */
export const INITIAL_KEUANGAN_LIST: readonly PencatatanKeuangan[] = [
  // Catatan Keuangan Supplier (id_user = 101)
  {
    id_keuangan: 6001,
    id_user: 101,
    id_transaksi: 5002,
    id_limbah: null,
    tgl_pencatatan: "2026-10-28 14:25:00",
    jenis_transaksi: "Pemasukan",
    jumlah_uang: 9600000,
    keterangan: "Penerimaan penjualan 8 Kwintal Mangga Arumanis Super ke UMKM Dapur Mangga Bu Ning",
  },
  // Catatan Keuangan UMKM (id_user = 202)
  {
    id_keuangan: 6002,
    id_user: 202,
    id_transaksi: 5002,
    id_limbah: null,
    tgl_pencatatan: "2026-10-28 14:25:00",
    jenis_transaksi: "Pengeluaran",
    jumlah_uang: 9600000,
    keterangan: "Pembelian bahan baku 8 Kwintal Mangga Arumanis dari Supplier KT Sumber Rejeki",
  },
  {
    id_keuangan: 6003,
    id_user: 202,
    id_transaksi: null,
    id_limbah: 3001,
    tgl_pencatatan: "2026-10-27 10:00:00",
    jenis_transaksi: "Pemasukan",
    jumlah_uang: 195000,
    keterangan: "Kompensasi Jual Beli 180 kg Limbah Kulit Mangga dari Mitra CV Bio Tani Lestari",
  },
  {
    id_keuangan: 6004,
    id_user: 202,
    id_transaksi: 5003,
    id_limbah: null,
    tgl_pencatatan: "2026-10-31 16:05:00",
    jenis_transaksi: "Pemasukan",
    jumlah_uang: 1660000,
    keterangan: "Penjualan 50 Pak Dodol & 20 Botol Sirup Mangga ke Konsumen Segar Buah Nusantara",
  },
  // Catatan Keuangan Mitra (id_user = 303)
  {
    id_keuangan: 6005,
    id_user: 303,
    id_transaksi: null,
    id_limbah: 3001,
    tgl_pencatatan: "2026-10-27 10:00:00",
    jenis_transaksi: "Pengeluaran",
    jumlah_uang: 195000,
    keterangan: "Pembelian (Jual Beli) 180 kg Limbah Kulit Mangga dari UMKM Dapur Mangga Bu Ning",
  },
  {
    id_keuangan: 6006,
    id_user: 303,
    id_transaksi: 5002,
    id_limbah: null,
    tgl_pencatatan: "2026-10-29 09:30:00",
    jenis_transaksi: "Pemasukan",
    jumlah_uang: 350000,
    keterangan: "Pendapatan jasa penanganan pengiriman logistik rantai pasok #RESI-SMG-2026-5002",
  },
  // Catatan Keuangan Konsumen (id_user = 404)
  {
    id_keuangan: 6007,
    id_user: 404,
    id_transaksi: 5003,
    id_limbah: null,
    tgl_pencatatan: "2026-10-31 16:05:00",
    jenis_transaksi: "Pengeluaran",
    jumlah_uang: 1660000,
    keterangan: "Pembayaran QRIS pesanan produk olahan mangga #5003",
  },
];

export const INITIAL_LOG_SISTEM_LIST: readonly LogSistem[] = [
  {
    id_log: 9901,
    id_user: 404,
    level: "Info",
    aksi: "CREATE_TRANSAKSI_DAN_UPLOAD_BUKTI",
    endpoint_api: "POST /api/transaksi/5001/pembayaran",
    kode_status: 201,
    pesan: "Konsumen #404 mengunggah bukti_transfer manual untuk Transaksi #5001 (menunggu konfirmasi penjual #101).",
    detail_error: null,
    waktu: "2026-11-01 10:05:12",
  },
  {
    id_log: 9902,
    id_user: 202,
    level: "Info",
    aksi: "INSERT_LIMBAH_UMKM",
    endpoint_api: "POST /api/pasar-sirkular/limbah",
    kode_status: 201,
    pesan: "UMKM #12 (id_user=202) mencatat batch Limbah #3004 (Kulit, 95 kg, kompensasi: Gratis).",
    detail_error: null,
    waktu: "2026-11-03 08:20:04",
  },
  {
    id_log: 9903,
    id_user: 303,
    level: "Info",
    aksi: "AJUKAN_JEMPUT_LIMBAH",
    endpoint_api: "PATCH /api/pasar-sirkular/limbah/3002/jemput",
    kode_status: 200,
    pesan: "Mitra #3 (id_user=303) mengajukan penjemputan Limbah #3002 dengan harga_kesepakatan Rp330.000.",
    detail_error: null,
    waktu: "2026-11-02 14:10:33",
  },
  {
    id_log: 9904,
    id_user: null,
    level: "Warning",
    aksi: "PAYMENT_GATEWAY_CALLBACK_LATENCY",
    endpoint_api: "POST /api/webhook/payment-gateway/qris",
    kode_status: 202,
    pesan: "Callback QRIS id_referensi_gateway=GW-QRIS-20261031-44120 diterima dengan jeda 4.2 detik.",
    detail_error: "Gateway response time 4210ms > threshold 3000ms (tetap berhasil diproses).",
    waktu: "2026-10-31 16:04:55",
  },
  {
    id_log: 9905,
    id_user: 202,
    level: "Error",
    aksi: "VALIDASI_PENCATATAN_KEUANGAN",
    endpoint_api: "POST /api/keuangan",
    kode_status: 422,
    pesan: "Gagal menyimpan Pencatatan Keuangan: id_transaksi dan id_limbah keduanya kosong (NULL).",
    detail_error: "CheckConstraintViolation: Aturan ERD mewajibkan salah satu dari id_transaksi atau id_limbah terisi.",
    waktu: "2026-10-30 19:12:08",
  },
];
