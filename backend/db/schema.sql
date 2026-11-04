-- Skema SAMANGGA (PostgreSQL), diterjemahkan dari ERD pada types/samangga.ts
-- Aman dijalankan berulang kali (menggunakan pengecekan keberadaan tipe & tabel)

-- 1. Pembuatan Enum Aman (PostgreSQL DO Block)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'peran_pengguna') THEN
        CREATE TYPE peran_pengguna AS ENUM ('Supplier','UMKM','Mitra','Konsumen','Admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_verifikasi') THEN
        CREATE TYPE status_verifikasi AS ENUM ('Menunggu','Terverifikasi','Ditolak');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipe_supplier') THEN
        CREATE TYPE tipe_supplier AS ENUM ('Petani','Pengepul');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kategori_konsumen') THEN
        CREATE TYPE kategori_konsumen AS ENUM ('Ritel','Grosir');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tingkat_akses') THEN
        CREATE TYPE tingkat_akses AS ENUM ('Super Admin','Admin Transaksi','Admin Limbah');
    END IF;
    -- 'Bibit' ditambahkan karena katalog FE memiliki kategori Bibit Pohon
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kategori_produk') THEN
        CREATE TYPE kategori_produk AS ENUM ('Buah','Olahan','Bibit');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_transaksi') THEN
        CREATE TYPE status_transaksi AS ENUM ('Pending','Diproses','Selesai','Batal');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'metode_pembayaran') THEN
        CREATE TYPE metode_pembayaran AS ENUM ('Transfer Manual','Virtual Account','QRIS');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_pembayaran') THEN
        CREATE TYPE status_pembayaran AS ENUM ('Menunggu','Berhasil','Gagal','Kedaluwarsa');
    END IF;
    -- 'Daun' ditambahkan karena halaman Pasar Sirkular FE memiliki limbah daun
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jenis_limbah') THEN
        CREATE TYPE jenis_limbah AS ENUM ('Kulit','Biji','Buah Afkir','Daun');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jenis_kompensasi') THEN
        CREATE TYPE jenis_kompensasi AS ENUM ('Jual Beli','Jasa Berbayar','Gratis');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_jemput') THEN
        CREATE TYPE status_jemput AS ENUM ('Tersedia','Diajukan','Proses','Selesai');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_pengiriman') THEN
        CREATE TYPE status_pengiriman AS ENUM ('Diproses','Dalam Perjalanan','Tiba di Lokasi');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jenis_keuangan') THEN
        CREATE TYPE jenis_keuangan AS ENUM ('Pemasukan','Pengeluaran');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'level_log') THEN
        CREATE TYPE level_log AS ENUM ('Info','Warning','Error');
    END IF;
END $$;

-- 2. Pembuatan Tabel-tabel Utama

CREATE TABLE IF NOT EXISTS pengguna (
  id_user             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama_lengkap        VARCHAR(150) NOT NULL,
  peran               peran_pengguna NOT NULL,
  no_telp             VARCHAR(20)  NOT NULL,
  alamat              TEXT         NOT NULL,
  email               VARCHAR(190) NOT NULL,
  password            VARCHAR(255) NOT NULL,
  status_verifikasi   status_verifikasi NOT NULL DEFAULT 'Menunggu',
  tgl_daftar          TIMESTAMP NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS pengguna_email_uq ON pengguna (lower(email));

CREATE TABLE IF NOT EXISTS supplier (
  id_supplier           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_user               INT NOT NULL UNIQUE REFERENCES pengguna(id_user) ON DELETE CASCADE,
  tipe_supplier         tipe_supplier NOT NULL DEFAULT 'Petani',
  no_telp               VARCHAR(20)   NOT NULL,
  luas_lahan_m2         DECIMAL(12,2) NOT NULL DEFAULT 0,
  jenis_komoditas_utama VARCHAR(150)  NOT NULL DEFAULT '',
  nama_bank             VARCHAR(80)   NOT NULL DEFAULT '',
  no_rekening           VARCHAR(40)   NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS konsumen (
  id_konsumen             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_user                 INT NOT NULL UNIQUE REFERENCES pengguna(id_user) ON DELETE CASCADE,
  kategori_konsumen       kategori_konsumen NOT NULL DEFAULT 'Ritel',
  no_telp                 VARCHAR(20) NOT NULL,
  alamat_pengiriman_utama TEXT        NOT NULL DEFAULT '',
  titik_koordinat         VARCHAR(80) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS admin (
  id_admin       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_user        INT NOT NULL UNIQUE REFERENCES pengguna(id_user) ON DELETE CASCADE,
  nip_id_pegawai VARCHAR(40) NOT NULL,
  tingkat_akses  tingkat_akses NOT NULL DEFAULT 'Admin Transaksi',
  no_telp        VARCHAR(20) NOT NULL,
  divisi         VARCHAR(80) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS mitra (
  id_mitra                    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_user                     INT NOT NULL UNIQUE REFERENCES pengguna(id_user) ON DELETE CASCADE,
  nama_mitra_instansi         VARCHAR(150) NOT NULL,
  no_telp                     VARCHAR(20)  NOT NULL,
  jenis_pengolahan_limbah     VARCHAR(150) NOT NULL DEFAULT '',
  kapasitas_tampung_limbah_kg DECIMAL(12,2) NOT NULL DEFAULT 0,
  jangkauan_area              TEXT         NOT NULL DEFAULT '',
  nama_bank                   VARCHAR(80)  NOT NULL DEFAULT '',
  no_rekening                 VARCHAR(40)  NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS umkm (
  id_umkm                    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_user                    INT NOT NULL UNIQUE REFERENCES pengguna(id_user) ON DELETE CASCADE,
  nama_usaha                 VARCHAR(150) NOT NULL,
  nib                        VARCHAR(40)  NOT NULL DEFAULT '',
  no_telp                    VARCHAR(20)  NOT NULL,
  kategori_produk_olahan     VARCHAR(150) NOT NULL DEFAULT '',
  kapasitas_produksi_bulanan DECIMAL(12,2) NOT NULL DEFAULT 0,
  nama_bank                  VARCHAR(80)  NOT NULL DEFAULT '',
  no_rekening                VARCHAR(40)  NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS produk (
  id_produk         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_user           INT NOT NULL REFERENCES pengguna(id_user) ON DELETE CASCADE,
  nama_produk       VARCHAR(150) NOT NULL,
  kategori          kategori_produk NOT NULL,
  harga             DECIMAL(14,2) NOT NULL CHECK (harga >= 0),
  stok              INT NOT NULL DEFAULT 0 CHECK (stok >= 0),
  satuan            VARCHAR(30) NOT NULL,
  deskripsi         TEXT NOT NULL DEFAULT '',
  gambar            VARCHAR(255) NOT NULL DEFAULT '',
  status_verifikasi status_verifikasi NOT NULL DEFAULT 'Menunggu'
);
CREATE INDEX IF NOT EXISTS produk_user_idx ON produk (id_user);
CREATE INDEX IF NOT EXISTS produk_kategori_idx ON produk (kategori, status_verifikasi);

CREATE TABLE IF NOT EXISTS transaksi (
  id_transaksi   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_pembeli     INT NOT NULL REFERENCES pengguna(id_user),
  id_penjual     INT NOT NULL REFERENCES pengguna(id_user),
  tgl_transaksi  TIMESTAMP NOT NULL DEFAULT now(),
  total_harga    DECIMAL(14,2) NOT NULL CHECK (total_harga >= 0),
  status         status_transaksi NOT NULL DEFAULT 'Pending',
  CHECK (id_pembeli <> id_penjual)
);
CREATE INDEX IF NOT EXISTS transaksi_pembeli_idx ON transaksi (id_pembeli);
CREATE INDEX IF NOT EXISTS transaksi_penjual_idx ON transaksi (id_penjual);

CREATE TABLE IF NOT EXISTS detail_transaksi (
  id_detail_transaksi INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_transaksi        INT NOT NULL REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
  id_produk           INT NOT NULL REFERENCES produk(id_produk),
  jumlah_produk       INT NOT NULL CHECK (jumlah_produk > 0),
  harga_satuan        DECIMAL(14,2) NOT NULL,
  subtotal_harga      DECIMAL(14,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS detail_transaksi_trx_idx ON detail_transaksi (id_transaksi);

CREATE TABLE IF NOT EXISTS pembayaran (
  id_pembayaran        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_transaksi         INT NOT NULL UNIQUE REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
  metode_pembayaran    metode_pembayaran NOT NULL,
  jumlah_bayar         DECIMAL(14,2) NOT NULL,
  status_pembayaran    status_pembayaran NOT NULL DEFAULT 'Menunggu',
  id_referensi_gateway VARCHAR(100),
  kode_pembayaran      VARCHAR(100),
  bukti_transfer       VARCHAR(255),
  batas_waktu_bayar    TIMESTAMP,
  tgl_bayar            TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS pembayaran_gateway_uq ON pembayaran (id_referensi_gateway) WHERE id_referensi_gateway IS NOT NULL;

CREATE TABLE IF NOT EXISTS limbah (
  id_limbah           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_umkm             INT NOT NULL REFERENCES umkm(id_umkm) ON DELETE CASCADE,
  id_mitra            INT REFERENCES mitra(id_mitra) ON DELETE SET NULL,
  jenis_limbah        jenis_limbah NOT NULL,
  berat_kg            DECIMAL(12,2) NOT NULL CHECK (berat_kg > 0),
  estimasi_harga      DECIMAL(14,2) NOT NULL DEFAULT 0,
  jenis_kompensasi    jenis_kompensasi,
  harga_kesepakatan   DECIMAL(14,2),
  lokasi_penjemputan  TEXT NOT NULL,
  titik_koordinat     VARCHAR(80),
  foto_limbah         VARCHAR(255) NOT NULL DEFAULT '',
  kondisi             VARCHAR(200) NOT NULL DEFAULT '',
  status_jemput       status_jemput NOT NULL DEFAULT 'Tersedia',
  tgl_jemput          TIMESTAMP,
  status_verifikasi   status_verifikasi NOT NULL DEFAULT 'Menunggu',
  tgl_input           TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS limbah_umkm_idx  ON limbah (id_umkm);
CREATE INDEX IF NOT EXISTS limbah_mitra_idx ON limbah (id_mitra);

CREATE TABLE IF NOT EXISTS riwayat_pengiriman (
  id_pengiriman     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_transaksi      INT NOT NULL REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
  id_mitra          INT REFERENCES mitra(id_mitra) ON DELETE SET NULL,
  tgl_pengiriman    TIMESTAMP NOT NULL DEFAULT now(),
  no_resi_lacak     VARCHAR(80) NOT NULL,
  status_pengiriman status_pengiriman NOT NULL DEFAULT 'Diproses',
  tgl_diterima      TIMESTAMP
);
CREATE INDEX IF NOT EXISTS pengiriman_trx_idx ON riwayat_pengiriman (id_transaksi);

CREATE TABLE IF NOT EXISTS pencatatan_keuangan (
  id_keuangan     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_user         INT NOT NULL REFERENCES pengguna(id_user) ON DELETE CASCADE,
  id_transaksi    INT REFERENCES transaksi(id_transaksi) ON DELETE SET NULL,
  id_limbah       INT REFERENCES limbah(id_limbah) ON DELETE SET NULL,
  tgl_pencatatan  TIMESTAMP NOT NULL DEFAULT now(),
  jenis_transaksi jenis_keuangan NOT NULL,
  jumlah_uang     DECIMAL(14,2) NOT NULL CHECK (jumlah_uang >= 0),
  keterangan      TEXT NOT NULL DEFAULT '',
  CONSTRAINT keuangan_sumber_ck CHECK (id_transaksi IS NOT NULL OR id_limbah IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS keuangan_user_idx ON pencatatan_keuangan (id_user, tgl_pencatatan DESC);

CREATE TABLE IF NOT EXISTS log_sistem (
  id_log       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_user      INT REFERENCES pengguna(id_user) ON DELETE SET NULL,
  level        level_log NOT NULL DEFAULT 'Info',
  aksi         VARCHAR(150) NOT NULL,
  endpoint_api VARCHAR(255) NOT NULL,
  kode_status  INT NOT NULL,
  pesan        TEXT NOT NULL DEFAULT '',
  detail_error TEXT,
  waktu        TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS log_waktu_idx ON log_sistem (waktu DESC);