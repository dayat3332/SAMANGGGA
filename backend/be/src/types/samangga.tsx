
export type PeranPengguna = "Supplier" | "UMKM" | "Mitra" | "Konsumen" | "Admin";
export type StatusVerifikasi = "Menunggu" | "Terverifikasi" | "Ditolak";
export type KategoriProduk = "Buah" | "Olahan";
export type JenisLimbah = "Kulit" | "Biji" | "Buah Afkir" | "Daun";
export type StatusJemput = "Tersedia" | "Diajukan" | "Proses" | "Selesai";
export type JenisKompensasi = "Jual Beli" | "Jasa Berbayar" | "Gratis";
export type StatusTransaksi = "Pending" | "Diproses" | "Selesai" | "Batal";
export type MetodePembayaran = "Transfer Manual" | "Virtual Account" | "QRIS";
export type StatusPembayaran = "Menunggu" | "Berhasil" | "Gagal" | "Kedaluwarsa";
export type StatusPengiriman = "Diproses" | "Dalam Perjalanan" | "Tiba di Lokasi";
export type JenisTransaksiKeuangan = "Pemasukan" | "Pengeluaran";
export type LevelLog = "Info" | "Warning" | "Error";

export interface Pengguna {
  id_user: number;
  nama_lengkap: string;
  peran: PeranPengguna;
  no_telp?: string | null;
  alamat?: string | null;
  email: string;
  password?: string;
  status_verifikasi: StatusVerifikasi;
  foto_persyaratan_url?: string | null;
  foto_persyaratan_name?: string | null;
  alasan_penolakan?: string | null;
  tgl_daftar?: string | Date;
}

export interface Admin {
  id_admin: number;
  id_user: number;
  nip_id_pegawai: string;
  tingkat_akses: string;
  no_telp?: string | null;
  divisi?: string | null;
}

export interface Supplier {
  id_supplier: number;
  id_user: number;
  tipe_supplier: "Petani" | "Pengepul";
  no_telp?: string | null;
  luas_lahan_m2?: number;
  jenis_komoditas_utama?: string | null;
  nama_bank?: string | null;
  no_rekening?: string | null;
}

export interface UMKM {
  id_umkm: number;
  id_user: number;
  nama_usaha: string;
  nib?: string | null;
  no_telp?: string | null;
  kategori_produk_olahan?: string | null;
  kapasitas_produksi_bulanan?: number;
  nama_bank?: string | null;
  no_rekening?: string | null;
}

export interface Mitra {
  id_mitra: number;
  id_user: number;
  nama_mitra_instansi: string;
  no_telp?: string | null;
  jenis_pengolahan_limbah?: string | null;
  kapasitas_tampung_limbah_kg?: number;
  jangkauan_area?: string | null;
  nama_bank?: string | null;
  no_rekening?: string | null;
}

export interface Konsumen {
  id_konsumen: number;
  id_user: number;
  kategori_konsumen: "Ritel" | "Grosir" | "Individu";
  no_telp?: string | null;
  alamat_pengiriman_utama?: string | null;
  titik_koordinat?: string | null;
}

export interface Produk {
  id_produk: number;
  id_user: number;
  nama_produk: string;
  kategori: KategoriProduk;
  harga: number;
  stok: number;
  satuan: string;
  deskripsi?: string | null;
  gambar?: string | null;
  status_verifikasi: StatusVerifikasi;
  lokasi?: string | null;
  tags?: string[] | null;
  tgl_dibuat?: string | Date;
}

export interface Limbah {
  id_limbah: number;
  id_umkm?: number | null;
  id_mitra?: number | null;
  jenis_limbah: JenisLimbah;
  berat_kg: number;
  estimasi_harga: number;
  jenis_kompensasi: JenisKompensasi;
  harga_kesepakatan?: number | null;
  lokasi_penjemputan: string;
  titik_koordinat?: string | null;
  foto_limbah?: string | null;
  status_jemput: StatusJemput;
  status_verifikasi: StatusVerifikasi;
  tgl_jemput?: string | Date | null;
  tgl_input?: string | Date;
}

export interface Transaksi {
  id_transaksi: number;
  id_pembeli: number;
  id_penjual: number;
  total_harga: number;
  status: StatusTransaksi;
  tgl_transaksi?: string | Date;
}

export interface DetailTransaksi {
  id_detail_transaksi: number;
  id_transaksi: number;
  id_produk: number;
  jumlah_produk: number;
  harga_satuan: number;
  subtotal_harga: number;
}

export interface Pembayaran {
  id_pembayaran: number;
  id_transaksi: number;
  metode_pembayaran: MetodePembayaran;
  jumlah_bayar: number;
  status_pembayaran: StatusPembayaran;
  id_referensi_gateway?: string | null;
  kode_pembayaran?: string | null;
  bukti_transfer?: string | null;
  batas_waktu_bayar?: string | Date | null;
  tgl_bayar?: string | Date | null;
}

export interface RiwayatPengiriman {
  id_pengiriman: number;
  id_transaksi: number;
  id_mitra?: number | null;
  tgl_pengiriman?: string | Date;
  no_resi_lacak: string;
  status_pengiriman: StatusPengiriman;
  tgl_diterima?: string | Date | null;
}

export interface PencatatanKeuangan {
  id_keuangan: number;
  id_user: number;
  id_transaksi?: number | null;
  id_limbah?: number | null;
  jenis_transaksi: JenisTransaksiKeuangan;
  jumlah_uang: number;
  keterangan: string;
  tgl_pencatatan?: string | Date;
}

export interface LogSistem {
  id_log: number;
  id_user?: number | null;
  level: LevelLog;
  aksi: string;
  endpoint_api?: string | null;
  kode_status?: number;
  pesan: string;
  detail_error?: string | null;
  waktu?: string | Date;
}

export interface UMKMProfile extends UMKM {
  nama_lengkap: string;
  email: string;
  no_telp_user?: string | null;
  no_telp_usaha?: string | null;
  alamat?: string | null;
  peran: PeranPengguna;
  status_verifikasi: StatusVerifikasi;
  foto_persyaratan_url?: string | null;
  foto_persyaratan_name?: string | null;
  alasan_penolakan?: string | null;
  tgl_daftar?: string | Date;
}

export interface UMKMDashboardMetrics {
  umkm: {
    id_umkm: number;
    id_user: number;
    nama_usaha: string;
    nama_pemilik: string;
    kategori_produk_olahan?: string | null;
    kapasitas_produksi_bulanan: number;
    status_verifikasi: StatusVerifikasi;
  };
  katalog: {
    totalProduk: number;
    totalStokUnit: number;
    persentaseKapasitasTerpakai: number;
  };
  penjualan: {
    omzetSelesai: number;
    omzetPending: number;
    pesananAktifCount: number;
    totalTransaksiPenjualan: number;
  };
  pembelianBahanBaku: {
    totalBelanjaSelesai: number;
    belanjaPending: number;
    pembelianAktifCount: number;
    totalTransaksiPembelian: number;
  };
  limbahSirkular: {
    totalSetoranCount: number;
    totalLimbahKg: number;
    limbahTerangkutKg: number;
    limbahAktifKg: number;
    setoranAktifCount: number;
    totalKompensasiDiterima: number;
  };
  keuangan: {
    totalPemasukan: number;
    totalPengeluaran: number;
    saldoKas: number;
  };
}
