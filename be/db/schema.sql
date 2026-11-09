-- ====================================================================
-- SKEMA DATABASE POSTGRESQL SAMANGGA
-- Platform Web Rantai Pasok dan Pasar Limbah Sirkular Mangga Indramayu
-- Sesuai Struktur ERD 1:1
-- ====================================================================

-- 1. TABEL PENGGUNA (Tabel Induk Akun)
CREATE TABLE IF NOT EXISTS pengguna (
  id_user SERIAL PRIMARY KEY,
  nama_lengkap VARCHAR(150) NOT NULL,
  peran VARCHAR(50) NOT NULL CHECK (peran IN ('Supplier', 'UMKM', 'Mitra', 'Konsumen', 'Admin')),
  no_telp VARCHAR(30),
  alamat TEXT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  status_verifikasi VARCHAR(30) NOT NULL DEFAULT 'Menunggu' CHECK (status_verifikasi IN ('Menunggu', 'Terverifikasi', 'Ditolak')),
  foto_persyaratan_url TEXT,
  foto_persyaratan_name VARCHAR(255),
  alasan_penolakan TEXT,
  tgl_daftar TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL ADMIN (Profil Pengguna Berperan Admin)
CREATE TABLE IF NOT EXISTS admin (
  id_admin SERIAL PRIMARY KEY,
  id_user INT NOT NULL UNIQUE REFERENCES pengguna(id_user) ON DELETE CASCADE,
  nip_id_pegawai VARCHAR(50) NOT NULL,
  tingkat_akses VARCHAR(50) NOT NULL DEFAULT 'Super Admin' CHECK (tingkat_akses IN ('Super Admin', 'Admin Verifikasi', 'Admin Transaksi', 'Admin Limbah')),
  no_telp VARCHAR(30),
  divisi VARCHAR(100) DEFAULT 'Tata Kelola Platform'
);

-- 3. TABEL SUPPLIER (Petani / Pengepul)
CREATE TABLE IF NOT EXISTS supplier (
  id_supplier SERIAL PRIMARY KEY,
  id_user INT NOT NULL UNIQUE REFERENCES pengguna(id_user) ON DELETE CASCADE,
  tipe_supplier VARCHAR(50) NOT NULL DEFAULT 'Petani' CHECK (tipe_supplier IN ('Petani', 'Pengepul')),
  no_telp VARCHAR(30),
  luas_lahan_m2 INT DEFAULT 0,
  jenis_komoditas_utama VARCHAR(100),
  nama_bank VARCHAR(50),
  no_rekening VARCHAR(50)
);

-- 4. TABEL UMKM (Produsen Olahan Mangga)
CREATE TABLE IF NOT EXISTS umkm (
  id_umkm SERIAL PRIMARY KEY,
  id_user INT NOT NULL UNIQUE REFERENCES pengguna(id_user) ON DELETE CASCADE,
  nama_usaha VARCHAR(150) NOT NULL,
  nib VARCHAR(100),
  no_telp VARCHAR(30),
  kategori_produk_olahan VARCHAR(100),
  kapasitas_produksi_bulanan INT DEFAULT 0,
  nama_bank VARCHAR(50),
  no_rekening VARCHAR(50)
);

-- 5. TABEL MITRA (Pengolah Limbah Sirkular)
CREATE TABLE IF NOT EXISTS mitra (
  id_mitra SERIAL PRIMARY KEY,
  id_user INT NOT NULL UNIQUE REFERENCES pengguna(id_user) ON DELETE CASCADE,
  nama_mitra_instansi VARCHAR(150) NOT NULL,
  no_telp VARCHAR(30),
  jenis_pengolahan_limbah VARCHAR(150),
  kapasitas_tampung_limbah_kg INT DEFAULT 0,
  jangkauan_area TEXT,
  nama_bank VARCHAR(50),
  no_rekening VARCHAR(50)
);

-- 6. TABEL KONSUMEN (Pembeli Grosir / Ritel)
CREATE TABLE IF NOT EXISTS konsumen (
  id_konsumen SERIAL PRIMARY KEY,
  id_user INT NOT NULL UNIQUE REFERENCES pengguna(id_user) ON DELETE CASCADE,
  kategori_konsumen VARCHAR(50) NOT NULL DEFAULT 'Ritel' CHECK (kategori_konsumen IN ('Ritel', 'Grosir', 'Individu')),
  no_telp VARCHAR(30),
  alamat_pengiriman_utama TEXT,
  titik_koordinat VARCHAR(100)
);

-- 7. TABEL PRODUK (Katalog Buah & Olahan)
CREATE TABLE IF NOT EXISTS produk (
  id_produk SERIAL PRIMARY KEY,
  id_user INT NOT NULL REFERENCES pengguna(id_user) ON DELETE CASCADE,
  nama_produk VARCHAR(150) NOT NULL,
  kategori VARCHAR(50) NOT NULL CHECK (kategori IN ('Buah', 'Olahan')),
  harga NUMERIC(14,2) NOT NULL DEFAULT 0,
  stok INT NOT NULL DEFAULT 0,
  satuan VARCHAR(20) NOT NULL DEFAULT 'kg',
  deskripsi TEXT,
  gambar TEXT,
  status_verifikasi VARCHAR(30) NOT NULL DEFAULT 'Terverifikasi' CHECK (status_verifikasi IN ('Menunggu', 'Terverifikasi', 'Ditolak')),
  lokasi VARCHAR(150),
  tags TEXT[],
  tgl_dibuat TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABEL LIMBAH (Pasar Limbah Sirkular)
CREATE TABLE IF NOT EXISTS limbah (
  id_limbah SERIAL PRIMARY KEY,
  id_umkm INT REFERENCES umkm(id_umkm) ON DELETE SET NULL,
  id_mitra INT REFERENCES mitra(id_mitra) ON DELETE SET NULL,
  jenis_limbah VARCHAR(50) NOT NULL CHECK (jenis_limbah IN ('Kulit', 'Biji', 'Buah Afkir', 'Daun')),
  berat_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
  estimasi_harga NUMERIC(14,2) NOT NULL DEFAULT 0,
  jenis_kompensasi VARCHAR(50) DEFAULT 'Jual Beli' CHECK (jenis_kompensasi IN ('Jual Beli', 'Jasa Berbayar', 'Gratis')),
  harga_kesepakatan NUMERIC(14,2),
  lokasi_penjemputan TEXT NOT NULL,
  titik_koordinat VARCHAR(100),
  foto_limbah TEXT,
  status_jemput VARCHAR(50) NOT NULL DEFAULT 'Tersedia' CHECK (status_jemput IN ('Tersedia', 'Diajukan', 'Proses', 'Selesai')),
  status_verifikasi VARCHAR(30) NOT NULL DEFAULT 'Terverifikasi' CHECK (status_verifikasi IN ('Menunggu', 'Terverifikasi', 'Ditolak')),
  tgl_jemput TIMESTAMP WITHOUT TIME ZONE,
  tgl_input TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABEL TRANSAKSI (Transaksi Rantai Pasok)
CREATE TABLE IF NOT EXISTS transaksi (
  id_transaksi SERIAL PRIMARY KEY,
  id_pembeli INT NOT NULL REFERENCES pengguna(id_user) ON DELETE RESTRICT,
  id_penjual INT NOT NULL REFERENCES pengguna(id_user) ON DELETE RESTRICT,
  total_harga NUMERIC(14,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Diproses', 'Selesai', 'Batal')),
  tgl_transaksi TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. TABEL DETAIL TRANSAKSI
CREATE TABLE IF NOT EXISTS detail_transaksi (
  id_detail_transaksi SERIAL PRIMARY KEY,
  id_transaksi INT NOT NULL REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
  id_produk INT NOT NULL REFERENCES produk(id_produk) ON DELETE RESTRICT,
  jumlah_produk INT NOT NULL DEFAULT 1,
  harga_satuan NUMERIC(14,2) NOT NULL DEFAULT 0,
  subtotal_harga NUMERIC(14,2) NOT NULL DEFAULT 0
);

-- 11. TABEL PEMBAYARAN (Transfer Manual, VA, QRIS)
CREATE TABLE IF NOT EXISTS pembayaran (
  id_pembayaran SERIAL PRIMARY KEY,
  id_transaksi INT NOT NULL REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
  metode_pembayaran VARCHAR(50) NOT NULL CHECK (metode_pembayaran IN ('Transfer Manual', 'Virtual Account', 'QRIS')),
  jumlah_bayar NUMERIC(14,2) NOT NULL DEFAULT 0,
  status_pembayaran VARCHAR(50) NOT NULL DEFAULT 'Menunggu' CHECK (status_pembayaran IN ('Menunggu', 'Berhasil', 'Gagal', 'Kedaluwarsa')),
  id_referensi_gateway VARCHAR(100),
  kode_pembayaran VARCHAR(100),
  bukti_transfer TEXT,
  batas_waktu_bayar TIMESTAMP WITHOUT TIME ZONE,
  tgl_bayar TIMESTAMP WITHOUT TIME ZONE
);

-- 12. TABEL RIWAYAT PENGIRIMAN (Logistik Rantai Pasok Ditangani Mitra)
CREATE TABLE IF NOT EXISTS riwayat_pengiriman (
  id_pengiriman SERIAL PRIMARY KEY,
  id_transaksi INT NOT NULL REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
  id_mitra INT REFERENCES mitra(id_mitra) ON DELETE SET NULL,
  tgl_pengiriman TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  no_resi_lacak VARCHAR(100) NOT NULL,
  status_pengiriman VARCHAR(50) NOT NULL DEFAULT 'Diproses' CHECK (status_pengiriman IN ('Diproses', 'Dalam Perjalanan', 'Tiba di Lokasi')),
  tgl_diterima TIMESTAMP WITHOUT TIME ZONE
);

-- 13. TABEL PENCATATAN KEUANGAN
CREATE TABLE IF NOT EXISTS pencatatan_keuangan (
  id_keuangan SERIAL PRIMARY KEY,
  id_user INT NOT NULL REFERENCES pengguna(id_user) ON DELETE CASCADE,
  id_transaksi INT REFERENCES transaksi(id_transaksi) ON DELETE SET NULL,
  id_limbah INT REFERENCES limbah(id_limbah) ON DELETE SET NULL,
  jenis_transaksi VARCHAR(30) NOT NULL CHECK (jenis_transaksi IN ('Pemasukan', 'Pengeluaran')),
  jumlah_uang NUMERIC(14,2) NOT NULL DEFAULT 0,
  keterangan TEXT,
  tgl_pencatatan TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. TABEL LOG SISTEM (Audit Aktivitas Admin & Sistem)
CREATE TABLE IF NOT EXISTS log_sistem (
  id_log SERIAL PRIMARY KEY,
  id_user INT REFERENCES pengguna(id_user) ON DELETE SET NULL,
  level VARCHAR(20) NOT NULL DEFAULT 'Info' CHECK (level IN ('Info', 'Warning', 'Error')),
  aksi VARCHAR(100) NOT NULL,
  endpoint_api VARCHAR(255),
  kode_status INT DEFAULT 200,
  pesan TEXT NOT NULL,
  detail_error TEXT,
  waktu TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEKS UNTUK PERFORMA QUERY ADMIN & SISTEM
CREATE INDEX IF NOT EXISTS idx_pengguna_peran ON pengguna(peran);
CREATE INDEX IF NOT EXISTS idx_pengguna_status ON pengguna(status_verifikasi);
CREATE INDEX IF NOT EXISTS idx_log_sistem_waktu ON log_sistem(waktu DESC);
CREATE INDEX IF NOT EXISTS idx_riwayat_pengiriman_mitra ON riwayat_pengiriman(id_mitra);
CREATE INDEX IF NOT EXISTS idx_limbah_mitra ON limbah(id_mitra);
CREATE INDEX IF NOT EXISTS idx_transaksi_status ON transaksi(status);
CREATE INDEX IF NOT EXISTS idx_limbah_status ON limbah(status_jemput);
