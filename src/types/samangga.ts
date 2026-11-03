/**
 * Model data SAMANGGA — diterjemahkan 1:1 dari gambar ERD:
 * "ERD SAMANGGA: Platform Web Rantai Pasok dan Pasar Limbah Sirkular untuk UMKM Mangga Indramayu".
 *
 * Penamaan field mengikuti diagram (snake_case) agar sesuai persis dengan tabel database.
 * Notasi: PK = primary key, FK = foreign key, `| null` = nullable.
 */

// Akun dan Profil

export type PeranPengguna = "Supplier" | "UMKM" | "Mitra" | "Konsumen" | "Admin";
export type StatusVerifikasi = "Menunggu" | "Terverifikasi" | "Ditolak";

/** Tabel `Pengguna` — induk seluruh akun. Setiap profil peran mereferensi `id_user`. */
export interface Pengguna {
  id_user: number; // INT <PK>
  nama_lengkap: string; // VARCHAR
  peran: PeranPengguna; // ENUM(Supplier, UMKM, Mitra, Konsumen, Admin)
  no_telp: string; // VARCHAR
  alamat: string; // TEXT
  email: string; // VARCHAR
  password: string; // VARCHAR(255) <hash>
  status_verifikasi: StatusVerifikasi; // ENUM(Menunggu, Terverifikasi, Ditolak)
  tgl_daftar: string; // TIMESTAMP
}

export type TipeSupplier = "Petani" | "Pengepul";

/** Tabel `Supplier` — memiliki profil dari `Pengguna` (1:0..1). */
export interface Supplier {
  id_supplier: number; // INT <PK>
  id_user: number; // INT <FK>
  tipe_supplier: TipeSupplier; // ENUM(Petani, Pengepul)
  no_telp: string; // VARCHAR
  luas_lahan_m2: number; // DECIMAL
  jenis_komoditas_utama: string; // VARCHAR
  nama_bank: string; // VARCHAR
  no_rekening: string; // VARCHAR
}

/** Di ERD: ENUM(Ritel, Grosir). Nilai "Individu" disertakan untuk kompatibilitas form lama. */
export type KategoriKonsumenErd = "Ritel" | "Grosir";
export type KategoriKonsumen = KategoriKonsumenErd | "Individu";

/** Tabel `Konsumen` — memiliki profil dari `Pengguna` (1:0..1). */
export interface Konsumen {
  id_konsumen: number; // INT <PK>
  id_user: number; // INT <FK>
  kategori_konsumen: KategoriKonsumenErd; // ENUM(Ritel, Grosir)
  no_telp: string; // VARCHAR
  alamat_pengiriman_utama: string; // TEXT
  titik_koordinat: string; // VARCHAR
}

export type TingkatAkses = "Super Admin" | "Admin Transaksi" | "Admin Limbah";

/** Tabel `Admin` — memiliki profil dari `Pengguna` (1:0..1). */
export interface Admin {
  id_admin: number; // INT <PK>
  id_user: number; // INT <FK>
  nip_id_pegawai: string; // VARCHAR
  tingkat_akses: TingkatAkses; // ENUM(Super Admin, Admin Transaksi, Admin Limbah)
  no_telp: string; // VARCHAR
  divisi: string; // VARCHAR
}

/** Tabel `Mitra` — memiliki profil dari `Pengguna` (1:0..1). */
export interface Mitra {
  id_mitra: number; // INT <PK>
  id_user: number; // INT <FK>
  nama_mitra_instansi: string; // VARCHAR
  no_telp: string; // VARCHAR
  jenis_pengolahan_limbah: string; // VARCHAR
  kapasitas_tampung_limbah_kg: number; // DECIMAL
  jangkauan_area: string; // TEXT
  nama_bank: string; // VARCHAR
  no_rekening: string; // VARCHAR
}

/** Tabel `UMKM` — memiliki profil dari `Pengguna` (1:0..1). */
export interface UMKM {
  id_umkm: number; // INT <PK>
  id_user: number; // INT <FK>
  nama_usaha: string; // VARCHAR
  nib: string; // VARCHAR
  no_telp: string; // VARCHAR
  kategori_produk_olahan: string; // VARCHAR
  kapasitas_produksi_bulanan: number; // DECIMAL
  nama_bank: string; // VARCHAR
  no_rekening: string; // VARCHAR
}

// Produk dan Transaksi

export type KategoriProduk = "Buah" | "Olahan";

/** Tabel `Produk` — ditawarkan oleh `Pengguna` (`id_user`). */
export interface Produk {
  id_produk: number; // INT <PK>
  id_user: number; // INT <FK>
  nama_produk: string; // VARCHAR
  kategori: KategoriProduk; // ENUM(Buah, Olahan)
  harga: number; // DECIMAL
  stok: number; // INT
  satuan: string; // VARCHAR
  deskripsi: string; // TEXT
  gambar: string; // VARCHAR
  status_verifikasi: StatusVerifikasi; // ENUM(Menunggu, Terverifikasi, Ditolak)
}

export type StatusTransaksi = "Pending" | "Diproses" | "Selesai" | "Batal";

/** Tabel `Transaksi` — menghubungkan `id_pembeli` dan `id_penjual` (keduanya FK ke `Pengguna`). */
export interface Transaksi {
  id_transaksi: number; // INT <PK>
  id_pembeli: number; // INT <FK ke Pengguna>
  id_penjual: number; // INT <FK ke Pengguna>
  tgl_transaksi: string; // DATETIME
  total_harga: number; // DECIMAL
  status: StatusTransaksi; // ENUM(Pending, Diproses, Selesai, Batal)
}

/** Tabel `Detail Transaksi` — rincian item `Produk` pada suatu `Transaksi`. */
export interface DetailTransaksi {
  id_detail_transaksi: number; // INT <PK>
  id_transaksi: number; // INT <FK>
  id_produk: number; // INT <FK>
  jumlah_produk: number; // INT
  harga_satuan: number; // DECIMAL
  subtotal_harga: number; // DECIMAL
}

export type MetodePembayaran = "Transfer Manual" | "Virtual Account" | "QRIS";
export type StatusPembayaran = "Menunggu" | "Berhasil" | "Gagal" | "Kedaluwarsa";

/**
 * Tabel `Pembayaran`
 * Catatan ERD:
 * - Transfer Manual: `bukti_transfer` diisi, dikonfirmasi penjual.
 * - Virtual Account / QRIS: `kode_pembayaran` dan `id_referensi_gateway` diisi payment gateway,
 *   status diperbarui lewat callback.
 */
export interface Pembayaran {
  id_pembayaran: number; // INT <PK>
  id_transaksi: number; // INT <FK>
  metode_pembayaran: MetodePembayaran; // ENUM(Transfer Manual, Virtual Account, QRIS)
  jumlah_bayar: number; // DECIMAL
  status_pembayaran: StatusPembayaran; // ENUM(Menunggu, Berhasil, Gagal, Kedaluwarsa)
  id_referensi_gateway: string | null; // VARCHAR <nullable>
  kode_pembayaran: string | null; // VARCHAR <nullable>
  bukti_transfer: string | null; // VARCHAR <nullable>
  batas_waktu_bayar: string | null; // DATETIME <nullable>
  tgl_bayar: string | null; // DATETIME <nullable>
}

// Limbah, Pengiriman, dan Keuangan

/** Di ERD: ENUM(Kulit, Biji, Buah Afkir). Nilai "Daun" disertakan untuk kompatibilitas halaman katalog sirkular. */
export type JenisLimbahErd = "Kulit" | "Biji" | "Buah Afkir";
export type JenisLimbah = JenisLimbahErd | "Daun";

export type JenisKompensasi = "Jual Beli" | "Jasa Berbayar" | "Gratis";
export type StatusJemput = "Tersedia" | "Diajukan" | "Proses" | "Selesai";

/** Alias kompatibilitas untuk komponen pasar sirkular publik. */
export type StatusLimbah = StatusJemput | "Dipesan" | "Diproses";

/** Tabel `Limbah` — dicatat oleh `UMKM` (`id_umkm`) dan dijemput oleh `Mitra` (`id_mitra`). */
export interface Limbah {
  id_limbah: number; // INT <PK>
  id_umkm: number; // INT <FK>
  id_mitra: number | null; // INT <FK, nullable>
  jenis_limbah: JenisLimbahErd; // ENUM(Kulit, Biji, Buah Afkir)
  berat_kg: number; // DECIMAL
  estimasi_harga: number; // DECIMAL
  jenis_kompensasi: JenisKompensasi | null; // ENUM(Jual Beli, Jasa Berbayar, Gratis) <nullable>
  harga_kesepakatan: number | null; // DECIMAL <nullable>
  lokasi_penjemputan: string; // TEXT
  titik_koordinat: string | null; // VARCHAR <nullable>
  foto_limbah: string; // VARCHAR
  status_jemput: StatusJemput; // ENUM(Tersedia, Diajukan, Proses, Selesai)
  tgl_jemput: string | null; // DATETIME <nullable>
  status_verifikasi: StatusVerifikasi; // ENUM(Menunggu, Terverifikasi, Ditolak)
  tgl_input: string; // TIMESTAMP
}

export type StatusPengiriman = "Diproses" | "Dalam Perjalanan" | "Tiba di Lokasi";

/** Tabel `Riwayat Pengiriman` — memiliki catatan pengiriman dari `Transaksi` & ditangani oleh `Mitra` (`id_mitra`). */
export interface RiwayatPengiriman {
  id_pengiriman: number; // INT <PK>
  id_transaksi: number; // INT <FK>
  id_mitra: number | null; // INT <FK, nullable>
  tgl_pengiriman: string; // DATETIME
  no_resi_lacak: string; // VARCHAR
  status_pengiriman: StatusPengiriman; // ENUM(Diproses, Dalam Perjalanan, Tiba di Lokasi)
  tgl_diterima: string | null; // DATETIME
}

export type JenisKeuangan = "Pemasukan" | "Pengeluaran";

/**
 * Tabel `Pencatatan Keuangan`
 * Catatan ERD: "Aturan: salah satu dari id_transaksi atau id_limbah wajib terisi."
 */
export interface PencatatanKeuangan {
  id_keuangan: number; // INT <PK>
  id_user: number; // INT <FK>
  id_transaksi: number | null; // INT <FK, nullable>
  id_limbah: number | null; // INT <FK, nullable>
  tgl_pencatatan: string; // DATETIME
  jenis_transaksi: JenisKeuangan; // ENUM(Pemasukan, Pengeluaran)
  jumlah_uang: number; // DECIMAL
  keterangan: string; // TEXT
}

// Log Sistem

export type LevelLog = "Info" | "Warning" | "Error";

/** Tabel `Log Sistem` — dipicu oleh aktivitas `Pengguna` (`id_user` nullable). */
export interface LogSistem {
  id_log: number; // INT <PK>
  id_user: number | null; // INT <FK, nullable>
  level: LevelLog; // ENUM(Info, Warning, Error)
  aksi: string; // VARCHAR
  endpoint_api: string; // VARCHAR
  kode_status: number; // INT
  pesan: string; // TEXT
  detail_error: string | null; // TEXT <nullable>
  waktu: string; // TIMESTAMP
}

// Payload Form

/** Peran yang boleh mendaftar sendiri lewat form publik (Admin dibuat internal). */
export type PeranPendaftaran = Exclude<PeranPengguna, "Admin">;

export interface PendaftaranPayload {
  nama_lengkap: string;
  email: string;
  no_telp: string;
  peran: PeranPendaftaran;
  alamat: string;
  password: string;
}
