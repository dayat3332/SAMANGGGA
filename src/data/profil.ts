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

// Data Relasional ERD Platform Terpadu
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
    nama_lengkap: "H. Kartono (UD Pengepul Mangga)",
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
    nama_lengkap: "Siti Masitoh (Camilan Keripik Mangga Barokah)",
    peran: "UMKM",
    no_telp: "0813-2233-4455",
    alamat: "Sentra Oleh-oleh Losarang No. 18, Kec. Losarang, Indramayu",
    email: "keripik.barokah@samangga.id",
    password: "$2b$10$hash_umkm_203",
    status_verifikasi: "Terverifikasi",
    tgl_daftar: "2026-02-18 11:20:00",
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
    nama_lengkap: "Budi Santoso (PT Segar Buah Nusantara)",
    peran: "Konsumen",
    no_telp: "0811-2233-4455",
    alamat: "Gudang Distribusi Ritel Modern Jabodetabek, Cakung, Jakarta Timur",
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
    alamat: "Gedung Command Center Agribisnis Mangga, Kec. Indramayu, Kab. Indramayu",
    email: "admin.pusat@samangga.id",
    password: "$2b$10$hash_admin_505",
    status_verifikasi: "Terverifikasi",
    tgl_daftar: "2026-01-01 07:00:00",
  },
];

export const INITIAL_PRODUK_LIST: readonly Produk[] = [
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
  {
    id_produk: 3,
    id_user: 102,
    nama_produk: "Mangga Golek Manis",
    kategori: "Buah",
    harga: 950000,
    stok: 35,
    satuan: "Kwintal",
    deskripsi: "Bentuk lonjong panjang, rasa manis segar kaya serat halus. Sangat disukai untuk konsumsi langsung maupun meja prasmanan.",
    gambar: "/images/mangga/mangga_golek.jpg",
    status_verifikasi: "Terverifikasi",
  },
  {
    id_produk: 4,
    id_user: 102,
    nama_produk: "Mangga Manalagi Khas Indramayu",
    kategori: "Buah",
    harga: 1100000,
    stok: 40,
    satuan: "Kwintal",
    deskripsi: "Tetap manis renyah meski kulit luar masih hijau. Daging padat gurih manis, tahan simpan hingga 10 hari pengiriman.",
    gambar: "/images/mangga/mangga_manalagi.jpg",
    status_verifikasi: "Terverifikasi",
  },
  {
    id_produk: 5,
    id_user: 202,
    nama_produk: "Puree / Pulp Mangga Gedong Gincu (Frozen)",
    kategori: "Olahan",
    harga: 28000,
    stok: 300,
    satuan: "Pack (1 Kg)",
    deskripsi: "Pulp murni 100% buah gedong gincu tanpa tambahan air, tanpa perisa sintetis, dan tanpa pengawet kimia.",
    gambar: "/images/olahan/pulp_mangga.jpg",
    status_verifikasi: "Terverifikasi",
  },
  {
    id_produk: 6,
    id_user: 202,
    nama_produk: "Dodol Mangga Asli Indramayu",
    kategori: "Olahan",
    harga: 18000,
    stok: 500,
    satuan: "Kotak (250 gr)",
    deskripsi: "Tekstur kenyal lembut legit dengan cita rasa mangga yang kuat. Kemasan higienis vakum food-grade.",
    gambar: "/images/olahan/dodol_mangga.jpg",
    status_verifikasi: "Terverifikasi",
  },
  {
    id_produk: 7,
    id_user: 203,
    nama_produk: "Keripik Mangga Vacuum Frying",
    kategori: "Olahan",
    harga: 16000,
    stok: 450,
    satuan: "Pouch (100 gr)",
    deskripsi: "Diproses dengan teknologi penggorengan hampa suhu rendah (vacuum fry) menjaga aroma dan warna alami mangga.",
    gambar: "/images/olahan/keripik_mangga.jpg",
    status_verifikasi: "Terverifikasi",
  },
  {
    id_produk: 8,
    id_user: 202,
    nama_produk: "Sirup Mangga Gedong Gincu Konsentrat",
    kategori: "Olahan",
    harga: 32000,
    stok: 250,
    satuan: "Botol (600 ml)",
    deskripsi: "Konsentrat sirup sari buah mangga asli beraroma harum pekat, cocok untuk bahan baku mocktail, cafe, dan hotel.",
    gambar: "/images/olahan/sirup_mangga.jpg",
    status_verifikasi: "Terverifikasi",
  },
];

export const INITIAL_TRANSAKSI_LIST: readonly Transaksi[] = [
  {
    id_transaksi: 1001,
    id_pembeli: 404,
    id_penjual: 101,
    tgl_transaksi: "2026-11-01 08:30:00",
    total_harga: 14500000,
    status: "Selesai",
  },
  {
    id_transaksi: 1002,
    id_pembeli: 202,
    id_penjual: 101,
    tgl_transaksi: "2026-11-02 10:15:00",
    total_harga: 3625000,
    status: "Diproses",
  },
  {
    id_transaksi: 1003,
    id_pembeli: 404,
    id_penjual: 202,
    tgl_transaksi: "2026-11-03 14:00:00",
    total_harga: 5400000,
    status: "Pending",
  },
];

export const INITIAL_DETAIL_TRANSAKSI_LIST: readonly DetailTransaksi[] = [
  {
    id_detail_transaksi: 1,
    id_transaksi: 1001,
    id_produk: 1,
    jumlah_produk: 10,
    harga_satuan: 1450000,
    subtotal_harga: 14500000,
  },
  {
    id_detail_transaksi: 2,
    id_transaksi: 1002,
    id_produk: 1,
    jumlah_produk: 25,
    harga_satuan: 145000,
    subtotal_harga: 3625000,
  },
  {
    id_detail_transaksi: 3,
    id_transaksi: 1003,
    id_produk: 6,
    jumlah_produk: 300,
    harga_satuan: 18000,
    subtotal_harga: 5400000,
  },
];

export const INITIAL_PEMBAYARAN_LIST: readonly Pembayaran[] = [
  {
    id_pembayaran: 1,
    id_transaksi: 1001,
    metode_pembayaran: "Virtual Account",
    jumlah_bayar: 14500000,
    status_pembayaran: "Berhasil",
    id_referensi_gateway: "MID-SAMANGGA-1001-VA",
    kode_pembayaran: "8808123456789012",
    bukti_transfer: null,
    batas_waktu_bayar: "2026-11-02 08:30:00",
    tgl_bayar: "2026-11-01 08:45:00",
  },
  {
    id_pembayaran: 2,
    id_transaksi: 1002,
    metode_pembayaran: "QRIS",
    jumlah_bayar: 3625000,
    status_pembayaran: "Berhasil",
    id_referensi_gateway: "QRIS-SMG-1002-OK",
    kode_pembayaran: "00020101021226...ID.CO.QRIS",
    bukti_transfer: null,
    batas_waktu_bayar: "2026-11-02 11:15:00",
    tgl_bayar: "2026-11-02 10:20:00",
  },
  {
    id_pembayaran: 3,
    id_transaksi: 1003,
    metode_pembayaran: "Transfer Manual",
    jumlah_bayar: 5400000,
    status_pembayaran: "Menunggu",
    id_referensi_gateway: null,
    kode_pembayaran: "MANDIRI-1310012345678",
    bukti_transfer: null,
    batas_waktu_bayar: "2026-11-04 14:00:00",
    tgl_bayar: null,
  },
];

export const INITIAL_LIMBAH_LIST: readonly Limbah[] = [
  {
    id_limbah: 1,
    id_umkm: 1,
    id_mitra: 1,
    jenis_limbah: "Biji",
    berat_kg: 350,
    estimasi_harga: 525000,
    jenis_kompensasi: "Jual Beli",
    harga_kesepakatan: 525000,
    lokasi_penjemputan: "Sentra Olahan Dapur Bu Ning, Sindang, Indramayu",
    titik_koordinat: "-6.3241, 108.3189",
    foto_limbah: "/images/limbah/limbah_biji_mangga.jpg",
    status_jemput: "Tersedia",
    tgl_jemput: null,
    status_verifikasi: "Terverifikasi",
    tgl_input: "2026-11-01 09:30:00",
  },
  {
    id_limbah: 2,
    id_umkm: 1,
    id_mitra: 1,
    jenis_limbah: "Kulit",
    berat_kg: 120,
    estimasi_harga: 120000,
    jenis_kompensasi: "Jual Beli",
    harga_kesepakatan: 120000,
    lokasi_penjemputan: "Sentra Olahan Dapur Bu Ning, Sindang, Indramayu",
    titik_koordinat: "-6.3241, 108.3189",
    foto_limbah: "/images/limbah/limbah_kulit_mangga.jpg",
    status_jemput: "Tersedia",
    tgl_jemput: null,
    status_verifikasi: "Terverifikasi",
    tgl_input: "2026-11-02 11:00:00",
  },
  {
    id_limbah: 3,
    id_umkm: 2,
    id_mitra: 1,
    jenis_limbah: "Kulit",
    berat_kg: 80,
    estimasi_harga: 72000,
    jenis_kompensasi: "Jual Beli",
    harga_kesepakatan: 72000,
    lokasi_penjemputan: "Sentra Keripik Losarang, Losarang, Indramayu",
    titik_koordinat: "-6.4021, 108.1524",
    foto_limbah: "/images/limbah/limbah_kulit_mangga.jpg",
    status_jemput: "Proses",
    tgl_jemput: "2026-11-04 14:00:00",
    status_verifikasi: "Terverifikasi",
    tgl_input: "2026-11-03 13:15:00",
  },
  {
    id_limbah: 4,
    id_umkm: 1,
    id_mitra: null,
    jenis_limbah: "Buah Afkir",
    berat_kg: 500,
    estimasi_harga: 1250000,
    jenis_kompensasi: "Jual Beli",
    harga_kesepakatan: null,
    lokasi_penjemputan: "Gudang Sortir KT Sumber Rejeki, Lohbener, Indramayu",
    titik_koordinat: "-6.3892, 108.2815",
    foto_limbah: "/images/mangga/mangga_afkir.jpg",
    status_jemput: "Tersedia",
    tgl_jemput: null,
    status_verifikasi: "Terverifikasi",
    tgl_input: "2026-11-04 08:00:00",
  },
  {
    id_limbah: 5,
    id_umkm: 2,
    id_mitra: null,
    jenis_limbah: "Daun" as unknown as any,
    berat_kg: 300,
    estimasi_harga: 150000,
    jenis_kompensasi: "Gratis",
    harga_kesepakatan: 0,
    lokasi_penjemputan: "Kebun Mangga Gapoktan Mekar Tani, Jatibarang, Indramayu",
    titik_koordinat: "-6.4718, 108.3129",
    foto_limbah: "/images/limbah/limbah_daun_mangga.jpg",
    status_jemput: "Tersedia",
    tgl_jemput: null,
    status_verifikasi: "Terverifikasi",
    tgl_input: "2026-11-04 16:45:00",
  },
];

export const INITIAL_RIWAYAT_PENGIRIMAN_LIST: readonly RiwayatPengiriman[] = [
  {
    id_pengiriman: 1,
    id_transaksi: 1001,
    id_mitra: 1,
    tgl_pengiriman: "2026-11-01 10:00:00",
    no_resi_lacak: "SMG-EXP-20261101-001",
    status_pengiriman: "Tiba di Lokasi",
    tgl_diterima: "2026-11-01 18:30:00",
  },
  {
    id_pengiriman: 2,
    id_transaksi: 1002,
    id_mitra: 1,
    tgl_pengiriman: "2026-11-02 13:00:00",
    no_resi_lacak: "SMG-EXP-20261102-002",
    status_pengiriman: "Dalam Perjalanan",
    tgl_diterima: null,
  },
];

export const INITIAL_KEUANGAN_LIST: readonly PencatatanKeuangan[] = [
  {
    id_keuangan: 1,
    id_user: 101,
    id_transaksi: 1001,
    id_limbah: null,
    tgl_pencatatan: "2026-11-01 08:45:00",
    jenis_transaksi: "Pemasukan",
    jumlah_uang: 14500000,
    keterangan: "Penjualan 10 kwintal Gedong Gincu Super ke PT Segar Buah",
  },
  {
    id_keuangan: 2,
    id_user: 202,
    id_transaksi: 1002,
    id_limbah: null,
    tgl_pencatatan: "2026-11-02 10:20:00",
    jenis_transaksi: "Pengeluaran",
    jumlah_uang: 3625000,
    keterangan: "Pembelian bahan baku mangga segar dari KT Sumber Rejeki",
  },
  {
    id_keuangan: 3,
    id_user: 202,
    id_transaksi: null,
    id_limbah: 1,
    tgl_pencatatan: "2026-11-01 14:00:00",
    jenis_transaksi: "Pemasukan",
    jumlah_uang: 525000,
    keterangan: "Penerimaan kompensasi setor 350 kg biji mangga ke CV Bio Tani",
  },
];

export const INITIAL_LOG_SISTEM_LIST: readonly LogSistem[] = [
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
];
