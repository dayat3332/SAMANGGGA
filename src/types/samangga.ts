

export type PeranPengguna = "Supplier" | "UMKM" | "Mitra" | "Konsumen" | "Admin";
export type StatusVerifikasi = "Menunggu" | "Terverifikasi" | "Ditolak";

export interface Pengguna {
  id_user: number;
  nama_lengkap: string;
  peran: PeranPengguna;
  no_telp: string;
  alamat: string;
  email: string;
  password: string;
  status_verifikasi: StatusVerifikasi;
  tgl_daftar: string;
}

export type TipeSupplier = "Petani" | "Pengepul";

export interface Supplier {
  id_supplier: number;
  id_user: number;
  tipe_supplier: TipeSupplier;
  no_telp: string;
  luas_lahan_m2: number;
  jenis_komoditas_utama: string;
  nama_bank: string;
  no_rekening: string;
}

export type KategoriKonsumenErd = "Ritel" | "Grosir";
export type KategoriKonsumen = KategoriKonsumenErd | "Individu";

export interface Konsumen {
  id_konsumen: number;
  id_user: number;
  kategori_konsumen: KategoriKonsumenErd;
  no_telp: string;
  alamat_pengiriman_utama: string;
  titik_koordinat: string;
}

export type TingkatAkses = "Super Admin" | "Admin Transaksi" | "Admin Limbah";

export interface Admin {
  id_admin: number;
  id_user: number;
  nip_id_pegawai: string;
  tingkat_akses: TingkatAkses;
  no_telp: string;
  divisi: string;
}

export interface Mitra {
  id_mitra: number;
  id_user: number;
  nama_mitra_instansi: string;
  no_telp: string;
  jenis_pengolahan_limbah: string;
  kapasitas_tampung_limbah_kg: number;
  jangkauan_area: string;
  nama_bank: string;
  no_rekening: string;
}

export interface UMKM {
  id_umkm: number;
  id_user: number;
  nama_usaha: string;
  nib: string;
  no_telp: string;
  kategori_produk_olahan: string;
  kapasitas_produksi_bulanan: number;
  nama_bank: string;
  no_rekening: string;
}

export type KategoriProduk = "Buah" | "Olahan";

export interface Produk {
  id_produk: number;
  id_user: number;
  nama_produk: string;
  kategori: KategoriProduk;
  harga: number;
  stok: number;
  satuan: string;
  deskripsi: string;
  gambar: string;
  status_verifikasi: StatusVerifikasi;
}

export type StatusTransaksi = "Pending" | "Diproses" | "Selesai" | "Batal";

export interface Transaksi {
  id_transaksi: number;
  id_pembeli: number;
  id_penjual: number;
  tgl_transaksi: string;
  total_harga: number;
  status: StatusTransaksi;
}

export interface DetailTransaksi {
  id_detail_transaksi: number;
  id_transaksi: number;
  id_produk: number;
  jumlah_produk: number;
  harga_satuan: number;
  subtotal_harga: number;
}

export type MetodePembayaran = "Transfer Manual" | "Virtual Account" | "QRIS";
export type StatusPembayaran = "Menunggu" | "Berhasil" | "Gagal" | "Kedaluwarsa";

export interface Pembayaran {
  id_pembayaran: number;
  id_transaksi: number;
  metode_pembayaran: MetodePembayaran;
  jumlah_bayar: number;
  status_pembayaran: StatusPembayaran;
  id_referensi_gateway: string | null;
  kode_pembayaran: string | null;
  bukti_transfer: string | null;
  batas_waktu_bayar: string | null;
  tgl_bayar: string | null;
}

export type JenisLimbahErd = "Kulit" | "Biji" | "Buah Afkir";
export type JenisLimbah = JenisLimbahErd | "Daun";

export type JenisKompensasi = "Jual Beli" | "Jasa Berbayar" | "Gratis";
export type StatusJemput = "Tersedia" | "Diajukan" | "Proses" | "Selesai";

export type StatusLimbah = StatusJemput | "Dipesan" | "Diproses";

export interface Limbah {
  id_limbah: number;
  id_umkm: number;
  id_mitra: number | null;
  jenis_limbah: JenisLimbahErd;
  berat_kg: number;
  estimasi_harga: number;
  jenis_kompensasi: JenisKompensasi | null;
  harga_kesepakatan: number | null;
  lokasi_penjemputan: string;
  titik_koordinat: string | null;
  foto_limbah: string;
  status_jemput: StatusJemput;
  tgl_jemput: string | null;
  status_verifikasi: StatusVerifikasi;
  tgl_input: string;
}

export type StatusPengiriman = "Diproses" | "Dalam Perjalanan" | "Tiba di Lokasi";

export interface RiwayatPengiriman {
  id_pengiriman: number;
  id_transaksi: number;
  id_mitra: number | null;
  tgl_pengiriman: string;
  no_resi_lacak: string;
  status_pengiriman: StatusPengiriman;
  tgl_diterima: string | null;
}

export type JenisKeuangan = "Pemasukan" | "Pengeluaran";

export interface PencatatanKeuangan {
  id_keuangan: number;
  id_user: number;
  id_transaksi: number | null;
  id_limbah: number | null;
  tgl_pencatatan: string;
  jenis_transaksi: JenisKeuangan;
  jumlah_uang: number;
  keterangan: string;
}

export type LevelLog = "Info" | "Warning" | "Error";

export interface LogSistem {
  id_log: number;
  id_user: number | null;
  level: LevelLog;
  aksi: string;
  endpoint_api: string;
  kode_status: number;
  pesan: string;
  detail_error: string | null;
  waktu: string;
}

export type PeranPendaftaran = Exclude<PeranPengguna, "Admin">;

export interface PendaftaranPayload {
  nama_lengkap: string;
  email: string;
  no_telp: string;
  peran: PeranPendaftaran;
  alamat: string;
  password: string;
}
