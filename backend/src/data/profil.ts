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

// Data Relasional ERD Platform (Telah dipindahkan ke Backend 'be/src/seeds/')
export const INITIAL_PENGGUNA_LIST: readonly Pengguna[] = [];
export const INITIAL_PRODUK_LIST: readonly Produk[] = [];
export const INITIAL_TRANSAKSI_LIST: readonly Transaksi[] = [];
export const INITIAL_DETAIL_TRANSAKSI_LIST: readonly DetailTransaksi[] = [];
export const INITIAL_PEMBAYARAN_LIST: readonly Pembayaran[] = [];
export const INITIAL_LIMBAH_LIST: readonly Limbah[] = [];
export const INITIAL_RIWAYAT_PENGIRIMAN_LIST: readonly RiwayatPengiriman[] = [];
export const INITIAL_KEUANGAN_LIST: readonly PencatatanKeuangan[] = [];
export const INITIAL_LOG_SISTEM_LIST: readonly LogSistem[] = [];
