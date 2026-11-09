-- ============================================================
-- SAMANGGA - Database PostgreSQL (skema + data awal)
-- Database: samangga_db | User: samangga_user
-- Jalankan seluruh file ini di DBeaver (Execute Script / Alt+X).
-- Password demo semua akun: samangga2026
-- ============================================================

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

-- ---------- DATA AWAL ----------
TRUNCATE TABLE log_sistem, pencatatan_keuangan, riwayat_pengiriman, pembayaran, detail_transaksi, transaksi, limbah, produk, konsumen, mitra, umkm, supplier, admin, pengguna RESTART IDENTITY CASCADE;

-- pengguna (8 baris)
INSERT INTO pengguna (id_user, nama_lengkap, peran, no_telp, alamat, email, password, status_verifikasi, foto_persyaratan_url, foto_persyaratan_name, alasan_penolakan, tgl_daftar) VALUES (101, 'H. Agus Supriyadi (KT Sumber Rejeki)', 'Supplier', '0812-2345-6789', 'Desa Lohbener Blok Kebun Mangga RT 04/02, Kec. Lohbener, Indramayu', 'agus.sumberrejeki@samangga.id', '$2b$10$wKGu3tU7xeekJ10pIQCHRO.nUOrwl15N.UDo/pUn2d1T2HwYZaawG', 'Terverifikasi', NULL, NULL, NULL, '2026-01-12 08:15:00.000');
INSERT INTO pengguna (id_user, nama_lengkap, peran, no_telp, alamat, email, password, status_verifikasi, foto_persyaratan_url, foto_persyaratan_name, alasan_penolakan, tgl_daftar) VALUES (102, 'H. Kartono (UD Pengepul Mangga Jatibarang)', 'Supplier', '0812-8899-0011', 'Pasar Daerah Jatibarang Blok B-12, Kec. Jatibarang, Indramayu', 'kartono.pengepul@samangga.id', '$2b$10$wKGu3tU7xeekJ10pIQCHRO.nUOrwl15N.UDo/pUn2d1T2HwYZaawG', 'Menunggu', NULL, NULL, NULL, '2026-10-30 15:40:00.000');
INSERT INTO pengguna (id_user, nama_lengkap, peran, no_telp, alamat, email, password, status_verifikasi, foto_persyaratan_url, foto_persyaratan_name, alasan_penolakan, tgl_daftar) VALUES (202, 'Hj. Ningsih Rahmawati (UMKM Dapur Mangga Bu Ning)', 'UMKM', '0813-9876-5432', 'Jl. Raya Sindang No. 45, Kec. Indramayu Kota, Kabupaten Indramayu', 'dapur.buning@samangga.id', '$2b$10$wKGu3tU7xeekJ10pIQCHRO.nUOrwl15N.UDo/pUn2d1T2HwYZaawG', 'Terverifikasi', NULL, NULL, NULL, '2026-02-04 10:30:00.000');
INSERT INTO pengguna (id_user, nama_lengkap, peran, no_telp, alamat, email, password, status_verifikasi, foto_persyaratan_url, foto_persyaratan_name, alasan_penolakan, tgl_daftar) VALUES (203, 'Siti Masitoh (Camilan Keripik Mangga Barokah)', 'UMKM', '0813-2233-4455', 'Sentra Oleh-oleh Losarang No. 18, Kec. Losarang, Indramayu', 'keripik.barokah@samangga.id', '$2b$10$wKGu3tU7xeekJ10pIQCHRO.nUOrwl15N.UDo/pUn2d1T2HwYZaawG', 'Terverifikasi', NULL, NULL, NULL, '2026-02-18 11:20:00.000');
INSERT INTO pengguna (id_user, nama_lengkap, peran, no_telp, alamat, email, password, status_verifikasi, foto_persyaratan_url, foto_persyaratan_name, alasan_penolakan, tgl_daftar) VALUES (303, 'Ir. Hendra Kusuma (CV Bio Tani Lestari)', 'Mitra', '0821-1122-3344', 'Kawasan Agribisnis Terpadu Sliyeg KM 3, Kec. Sliyeg, Indramayu', 'operasional@biotanipantura.id', '$2b$10$wKGu3tU7xeekJ10pIQCHRO.nUOrwl15N.UDo/pUn2d1T2HwYZaawG', 'Terverifikasi', '/images/limbah/pupuk_kompos.jpg', 'mou-kerjasama-bio-tani-lestari.jpg', NULL, '2026-01-19 14:20:00.000');
INSERT INTO pengguna (id_user, nama_lengkap, peran, no_telp, alamat, email, password, status_verifikasi, foto_persyaratan_url, foto_persyaratan_name, alasan_penolakan, tgl_daftar) VALUES (304, 'Bambang Sudirja (CV Pantura Bio Organik)', 'Mitra', '0822-3344-5566', 'Jalan Pantura Bypass Cantigi No. 88, Kec. Cantigi, Indramayu', 'pantura.bio@samangga.id', '$2b$10$wKGu3tU7xeekJ10pIQCHRO.nUOrwl15N.UDo/pUn2d1T2HwYZaawG', 'Menunggu', '/images/limbah/limbah_kulit_mangga.jpg', 'dokumen-lahan-dan-fasilitas-pantura.jpg', NULL, '2026-11-04 10:30:00.000');
INSERT INTO pengguna (id_user, nama_lengkap, peran, no_telp, alamat, email, password, status_verifikasi, foto_persyaratan_url, foto_persyaratan_name, alasan_penolakan, tgl_daftar) VALUES (404, 'Budi Santoso (PT Segar Buah Nusantara)', 'Konsumen', '0811-2233-4455', 'Gudang Distribusi Ritel Modern Jabodetabek, Cakung, Jakarta Timur', 'purchasing@segarbuah.co.id', '$2b$10$wKGu3tU7xeekJ10pIQCHRO.nUOrwl15N.UDo/pUn2d1T2HwYZaawG', 'Terverifikasi', NULL, NULL, NULL, '2026-03-01 09:05:00.000');
INSERT INTO pengguna (id_user, nama_lengkap, peran, no_telp, alamat, email, password, status_verifikasi, foto_persyaratan_url, foto_persyaratan_name, alasan_penolakan, tgl_daftar) VALUES (505, 'Dr. Raka Pratama, M.Kom.', 'Admin', '0815-8800-9900', 'Gedung Command Center Agribisnis Mangga, Kec. Indramayu, Kab. Indramayu', 'admin.pusat@samangga.id', '$2b$10$wKGu3tU7xeekJ10pIQCHRO.nUOrwl15N.UDo/pUn2d1T2HwYZaawG', 'Terverifikasi', NULL, NULL, NULL, '2026-01-01 07:00:00.000');

-- admin (1 baris)
INSERT INTO admin (id_admin, id_user, nip_id_pegawai, tingkat_akses, no_telp, divisi) VALUES (1, 505, 'NIP-19910415-202601-1-001', 'Super Admin', '0815-8800-9900', 'Tata Kelola Rantai Pasok & Pasar Sirkular');

-- supplier (2 baris)
INSERT INTO supplier (id_supplier, id_user, tipe_supplier, no_telp, luas_lahan_m2, jenis_komoditas_utama, nama_bank, no_rekening) VALUES (1, 101, 'Petani', '0812-2345-6789', 25000, 'Mangga Gedong Gincu & Arumanis', 'Bank BRI', '0123-01-004567-53-8');
INSERT INTO supplier (id_supplier, id_user, tipe_supplier, no_telp, luas_lahan_m2, jenis_komoditas_utama, nama_bank, no_rekening) VALUES (2, 102, 'Pengepul', '0812-8899-0011', 8000, 'Mangga Cengkir & Golek', 'Bank BJB', '0012-3456-7890-1');

-- umkm (2 baris)
INSERT INTO umkm (id_umkm, id_user, nama_usaha, nib, no_telp, kategori_produk_olahan, kapasitas_produksi_bulanan, nama_bank, no_rekening) VALUES (1, 202, 'Dapur Mangga Bu Ning', '9120001234567', '0813-9876-5432', 'Puree, Sirup, dan Dodol Mangga', 1200, 'Bank Mandiri', '131-00-1234567-8');
INSERT INTO umkm (id_umkm, id_user, nama_usaha, nib, no_telp, kategori_produk_olahan, kapasitas_produksi_bulanan, nama_bank, no_rekening) VALUES (2, 203, 'Camilan Keripik Mangga Barokah', '9120007654321', '0813-2233-4455', 'Keripik & Dodol Mangga', 800, 'Bank BRI', '0123-01-000456-50-8');

-- mitra (1 baris)
INSERT INTO mitra (id_mitra, id_user, nama_mitra_instansi, no_telp, jenis_pengolahan_limbah, kapasitas_tampung_limbah_kg, jangkauan_area, nama_bank, no_rekening) VALUES (1, 303, 'CV Bio Tani Lestari', '0821-1122-3344', 'Kompos Organik & Bio-Pektin Industri', 1500, 'Kec. Sliyeg, Lohbener, Jatibarang, Indramayu', 'Bank BNI', '0987-654-321');

-- konsumen (1 baris)
INSERT INTO konsumen (id_konsumen, id_user, kategori_konsumen, no_telp, alamat_pengiriman_utama, titik_koordinat) VALUES (1, 404, 'Grosir', '0811-2233-4455', 'Gudang Distribusi Buah Nusantara, Cakung, Jakarta Timur', '-6.1852, 106.9463');

-- produk (8 baris)
INSERT INTO produk (id_produk, id_user, nama_produk, kategori, harga, stok, satuan, deskripsi, gambar, status_verifikasi, lokasi, tags, tgl_dibuat) VALUES (1, 101, 'Mangga Gedong Gincu Super Ekspor', 'Buah', '1450000.00', 50, 'Kwintal', 'Kulit merah-jingga menyala, aroma harum pekat alami, brix kemanisan 16-18. Dipetik saat matang pohon 85%.', '/images/mangga/mangga_gincu.jpg', 'Terverifikasi', 'Lohbener, Indramayu', ARRAY['Grade A', 'Ekspor', 'Lohbener']::text[], '2026-11-09 03:30:47.426');
INSERT INTO produk (id_produk, id_user, nama_produk, kategori, harga, stok, satuan, deskripsi, gambar, status_verifikasi, lokasi, tags, tgl_dibuat) VALUES (2, 101, 'Mangga Arumanis 143 Pilihan', 'Buah', '1200000.00', 80, 'Kwintal', 'Daging buah tebal oranye kekuningan, tekstur lembut juicy tanpa serat kasar. Standar sortir 3-4 buah per kg.', '/images/mangga/mangga_harusmanis.jpg', 'Terverifikasi', 'Jatibarang, Indramayu', ARRAY['Super', 'Sortir', 'Jatibarang']::text[], '2026-11-09 03:30:47.426');
INSERT INTO produk (id_produk, id_user, nama_produk, kategori, harga, stok, satuan, deskripsi, gambar, status_verifikasi, lokasi, tags, tgl_dibuat) VALUES (3, 102, 'Mangga Golek Manis', 'Buah', '950000.00', 35, 'Kwintal', 'Bentuk lonjong panjang, rasa manis segar kaya serat halus. Sangat disukai untuk konsumsi langsung maupun meja prasmanan.', '/images/mangga/mangga_golek.jpg', 'Terverifikasi', 'Sliyeg, Indramayu', ARRAY['Matang pohon', 'Sliyeg']::text[], '2026-11-09 03:30:47.426');
INSERT INTO produk (id_produk, id_user, nama_produk, kategori, harga, stok, satuan, deskripsi, gambar, status_verifikasi, lokasi, tags, tgl_dibuat) VALUES (4, 102, 'Mangga Manalagi Khas Indramayu', 'Buah', '1100000.00', 40, 'Kwintal', 'Tetap manis renyah meski kulit luar masih hijau. Daging padat gurih manis, tahan simpan hingga 10 hari pengiriman.', '/images/mangga/mangga_manalagi.jpg', 'Terverifikasi', 'Cikedung, Indramayu', ARRAY['Renyah', 'Tahan Simpan']::text[], '2026-11-09 03:30:47.426');
INSERT INTO produk (id_produk, id_user, nama_produk, kategori, harga, stok, satuan, deskripsi, gambar, status_verifikasi, lokasi, tags, tgl_dibuat) VALUES (5, 202, 'Puree / Pulp Mangga Gedong Gincu (Frozen)', 'Olahan', '28000.00', 300, 'Pack (1 Kg)', 'Pulp murni 100% buah gedong gincu tanpa tambahan air, tanpa perisa sintetis, dan tanpa pengawet kimia.', '/images/olahan/pulp_mangga.jpg', 'Terverifikasi', 'Sindang, Indramayu', ARRAY['100% Murni', 'Bahan Baku B2B']::text[], '2026-11-09 03:30:47.426');
INSERT INTO produk (id_produk, id_user, nama_produk, kategori, harga, stok, satuan, deskripsi, gambar, status_verifikasi, lokasi, tags, tgl_dibuat) VALUES (6, 202, 'Dodol Mangga Asli Indramayu', 'Olahan', '18000.00', 500, 'Kotak (250 gr)', 'Tekstur kenyal lembut legit dengan cita rasa mangga yang kuat. Kemasan higienis vakum food-grade.', '/images/olahan/dodol_mangga.jpg', 'Terverifikasi', 'Indramayu Kota', ARRAY['Oleh-oleh', 'Tradisional']::text[], '2026-11-09 03:30:47.426');
INSERT INTO produk (id_produk, id_user, nama_produk, kategori, harga, stok, satuan, deskripsi, gambar, status_verifikasi, lokasi, tags, tgl_dibuat) VALUES (7, 203, 'Keripik Mangga Vacuum Frying', 'Olahan', '16000.00', 450, 'Pouch (100 gr)', 'Diproses dengan teknologi penggorengan hampa suhu rendah (vacuum fry) menjaga aroma dan warna alami mangga.', '/images/olahan/keripik_mangga.jpg', 'Terverifikasi', 'Losarang, Indramayu', ARRAY['Renyah', 'Vacuum Fry']::text[], '2026-11-09 03:30:47.426');
INSERT INTO produk (id_produk, id_user, nama_produk, kategori, harga, stok, satuan, deskripsi, gambar, status_verifikasi, lokasi, tags, tgl_dibuat) VALUES (8, 202, 'Sirup Mangga Gedong Gincu Konsentrat', 'Olahan', '32000.00', 250, 'Botol (600 ml)', 'Konsentrat sirup sari buah mangga asli beraroma harum pekat, cocok untuk bahan baku mocktail, cafe, dan hotel.', '/images/olahan/sirup_mangga.jpg', 'Terverifikasi', 'Indramayu Kota', ARRAY['Horeka', 'Konsentrat']::text[], '2026-11-09 03:30:47.426');

-- limbah (5 baris)
INSERT INTO limbah (id_limbah, id_umkm, id_mitra, jenis_limbah, berat_kg, estimasi_harga, jenis_kompensasi, harga_kesepakatan, lokasi_penjemputan, titik_koordinat, foto_limbah, status_jemput, status_verifikasi, tgl_jemput, tgl_input) VALUES (1, 1, 1, 'Biji', '350.00', '525000.00', 'Jual Beli', '525000.00', 'Sentra Olahan Dapur Bu Ning, Sindang, Indramayu', '-6.3241, 108.3189', '/images/limbah/limbah_biji_mangga.jpg', 'Tersedia', 'Terverifikasi', NULL, '2026-11-01 09:30:00.000');
INSERT INTO limbah (id_limbah, id_umkm, id_mitra, jenis_limbah, berat_kg, estimasi_harga, jenis_kompensasi, harga_kesepakatan, lokasi_penjemputan, titik_koordinat, foto_limbah, status_jemput, status_verifikasi, tgl_jemput, tgl_input) VALUES (2, 1, 1, 'Kulit', '120.00', '120000.00', 'Jual Beli', '120000.00', 'Sentra Olahan Dapur Bu Ning, Sindang, Indramayu', '-6.3241, 108.3189', '/images/limbah/limbah_kulit_mangga.jpg', 'Tersedia', 'Terverifikasi', NULL, '2026-11-02 11:00:00.000');
INSERT INTO limbah (id_limbah, id_umkm, id_mitra, jenis_limbah, berat_kg, estimasi_harga, jenis_kompensasi, harga_kesepakatan, lokasi_penjemputan, titik_koordinat, foto_limbah, status_jemput, status_verifikasi, tgl_jemput, tgl_input) VALUES (3, 2, 1, 'Kulit', '80.00', '72000.00', 'Jual Beli', '72000.00', 'Sentra Keripik Losarang, Losarang, Indramayu', '-6.4021, 108.1524', '/images/limbah/limbah_kulit_mangga.jpg', 'Proses', 'Terverifikasi', NULL, '2026-11-03 13:15:00.000');
INSERT INTO limbah (id_limbah, id_umkm, id_mitra, jenis_limbah, berat_kg, estimasi_harga, jenis_kompensasi, harga_kesepakatan, lokasi_penjemputan, titik_koordinat, foto_limbah, status_jemput, status_verifikasi, tgl_jemput, tgl_input) VALUES (4, 1, NULL, 'Buah Afkir', '500.00', '1250000.00', 'Jual Beli', NULL, 'Gudang Sortir KT Sumber Rejeki, Lohbener, Indramayu', '-6.3892, 108.2815', '/images/mangga/mangga_afkir.jpg', 'Tersedia', 'Terverifikasi', NULL, '2026-11-04 08:00:00.000');
INSERT INTO limbah (id_limbah, id_umkm, id_mitra, jenis_limbah, berat_kg, estimasi_harga, jenis_kompensasi, harga_kesepakatan, lokasi_penjemputan, titik_koordinat, foto_limbah, status_jemput, status_verifikasi, tgl_jemput, tgl_input) VALUES (5, 2, NULL, 'Daun', '300.00', '150000.00', 'Gratis', '0.00', 'Kebun Mangga Gapoktan Mekar Tani, Jatibarang, Indramayu', '-6.4718, 108.3129', '/images/limbah/limbah_daun_mangga.jpg', 'Tersedia', 'Terverifikasi', NULL, '2026-11-04 16:45:00.000');

-- transaksi (3 baris)
INSERT INTO transaksi (id_transaksi, id_pembeli, id_penjual, total_harga, status, tgl_transaksi) VALUES (1001, 404, 101, '14500000.00', 'Selesai', '2026-11-01 08:30:00.000');
INSERT INTO transaksi (id_transaksi, id_pembeli, id_penjual, total_harga, status, tgl_transaksi) VALUES (1002, 202, 101, '3625000.00', 'Diproses', '2026-11-02 10:15:00.000');
INSERT INTO transaksi (id_transaksi, id_pembeli, id_penjual, total_harga, status, tgl_transaksi) VALUES (1003, 404, 202, '5400000.00', 'Pending', '2026-11-03 14:00:00.000');

-- detail_transaksi (3 baris)
INSERT INTO detail_transaksi (id_detail_transaksi, id_transaksi, id_produk, jumlah_produk, harga_satuan, subtotal_harga) VALUES (1, 1001, 1, 10, '1450000.00', '14500000.00');
INSERT INTO detail_transaksi (id_detail_transaksi, id_transaksi, id_produk, jumlah_produk, harga_satuan, subtotal_harga) VALUES (2, 1002, 1, 25, '145000.00', '3625000.00');
INSERT INTO detail_transaksi (id_detail_transaksi, id_transaksi, id_produk, jumlah_produk, harga_satuan, subtotal_harga) VALUES (3, 1003, 6, 300, '18000.00', '5400000.00');

-- pembayaran (3 baris)
INSERT INTO pembayaran (id_pembayaran, id_transaksi, metode_pembayaran, jumlah_bayar, status_pembayaran, id_referensi_gateway, kode_pembayaran, bukti_transfer, batas_waktu_bayar, tgl_bayar) VALUES (1, 1001, 'Virtual Account', '14500000.00', 'Berhasil', 'MID-SAMANGGA-1001-VA', '8808123456789012', NULL, '2026-11-02 08:30:00.000', '2026-11-01 08:45:00.000');
INSERT INTO pembayaran (id_pembayaran, id_transaksi, metode_pembayaran, jumlah_bayar, status_pembayaran, id_referensi_gateway, kode_pembayaran, bukti_transfer, batas_waktu_bayar, tgl_bayar) VALUES (2, 1002, 'QRIS', '3625000.00', 'Berhasil', 'QRIS-SMG-1002-OK', '00020101021226...ID.CO.QRIS', NULL, '2026-11-02 11:15:00.000', '2026-11-02 10:20:00.000');
INSERT INTO pembayaran (id_pembayaran, id_transaksi, metode_pembayaran, jumlah_bayar, status_pembayaran, id_referensi_gateway, kode_pembayaran, bukti_transfer, batas_waktu_bayar, tgl_bayar) VALUES (3, 1003, 'Transfer Manual', '5400000.00', 'Menunggu', NULL, 'MANDIRI-1310012345678', NULL, '2026-11-04 14:00:00.000', NULL);

-- riwayat_pengiriman (2 baris)
INSERT INTO riwayat_pengiriman (id_pengiriman, id_transaksi, id_mitra, tgl_pengiriman, no_resi_lacak, status_pengiriman, tgl_diterima) VALUES (1, 1001, 1, '2026-11-01 10:00:00.000', 'SMG-EXP-20261101-001', 'Tiba di Lokasi', '2026-11-01 18:30:00.000');
INSERT INTO riwayat_pengiriman (id_pengiriman, id_transaksi, id_mitra, tgl_pengiriman, no_resi_lacak, status_pengiriman, tgl_diterima) VALUES (2, 1002, 1, '2026-11-02 13:00:00.000', 'SMG-EXP-20261102-002', 'Dalam Perjalanan', NULL);

-- pencatatan_keuangan (3 baris)
INSERT INTO pencatatan_keuangan (id_keuangan, id_user, id_transaksi, id_limbah, jenis_transaksi, jumlah_uang, keterangan, tgl_pencatatan) VALUES (1, 101, 1001, NULL, 'Pemasukan', '14500000.00', 'Penjualan 10 kwintal Gedong Gincu Super ke PT Segar Buah', '2026-11-01 08:45:00.000');
INSERT INTO pencatatan_keuangan (id_keuangan, id_user, id_transaksi, id_limbah, jenis_transaksi, jumlah_uang, keterangan, tgl_pencatatan) VALUES (2, 202, 1002, NULL, 'Pengeluaran', '3625000.00', 'Pembelian bahan baku mangga segar dari KT Sumber Rejeki', '2026-11-02 10:20:00.000');
INSERT INTO pencatatan_keuangan (id_keuangan, id_user, id_transaksi, id_limbah, jenis_transaksi, jumlah_uang, keterangan, tgl_pencatatan) VALUES (3, 202, NULL, 1, 'Pemasukan', '525000.00', 'Penerimaan kompensasi setor 350 kg biji mangga ke CV Bio Tani', '2026-11-01 14:00:00.000');

-- log_sistem (1 baris)
INSERT INTO log_sistem (id_log, id_user, level, aksi, endpoint_api, kode_status, pesan, detail_error, waktu) VALUES (1, 505, 'Info', 'SISTEM_BOOT', '/api/health', 200, 'Backend SAMANGGA Service Online', NULL, '2026-11-06 00:00:00.000');

-- ---------- SINKRONISASI SEQUENCE (ID otomatis) ----------
SELECT setval(pg_get_serial_sequence('pengguna', 'id_user'), COALESCE((SELECT MAX(id_user) FROM pengguna), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('admin', 'id_admin'), COALESCE((SELECT MAX(id_admin) FROM admin), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('supplier', 'id_supplier'), COALESCE((SELECT MAX(id_supplier) FROM supplier), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('umkm', 'id_umkm'), COALESCE((SELECT MAX(id_umkm) FROM umkm), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('mitra', 'id_mitra'), COALESCE((SELECT MAX(id_mitra) FROM mitra), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('konsumen', 'id_konsumen'), COALESCE((SELECT MAX(id_konsumen) FROM konsumen), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('produk', 'id_produk'), COALESCE((SELECT MAX(id_produk) FROM produk), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('limbah', 'id_limbah'), COALESCE((SELECT MAX(id_limbah) FROM limbah), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('transaksi', 'id_transaksi'), COALESCE((SELECT MAX(id_transaksi) FROM transaksi), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('detail_transaksi', 'id_detail_transaksi'), COALESCE((SELECT MAX(id_detail_transaksi) FROM detail_transaksi), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('pembayaran', 'id_pembayaran'), COALESCE((SELECT MAX(id_pembayaran) FROM pembayaran), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('riwayat_pengiriman', 'id_pengiriman'), COALESCE((SELECT MAX(id_pengiriman) FROM riwayat_pengiriman), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('pencatatan_keuangan', 'id_keuangan'), COALESCE((SELECT MAX(id_keuangan) FROM pencatatan_keuangan), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('log_sistem', 'id_log'), COALESCE((SELECT MAX(id_log) FROM log_sistem), 0) + 1, false);
