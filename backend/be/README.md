# SAMANGGA Backend (REST API)

Backend service untuk platform **SAMANGGA** (Rantai Pasok dan Pasar Limbah Sirkular Mangga Indramayu), dibangun menggunakan **TypeScript (TSX) dengan `tsx` runner**, **Express.js**, **Prisma ORM**, dan database relasional **PostgreSQL** (*"Postgrid"*), berpedoman 1:1 pada skema ERD 14 tabel SAMANGGA.

---

## 🗄️ Skema Database PostgreSQL & Prisma ORM (14 Tabel ERD)

Prisma Client merefleksikan 14 model tabel relasional secara langsung dari PostgreSQL:

1. **`pengguna`**: Tabel induk akun (Admin, Supplier, UMKM, Mitra, Konsumen).
2. **`admin`**: Profil administrator platform & command center.
3. **`supplier`**: Profil petani & pengepul buah mangga segar.
4. **`umkm`**: Profil unit usaha pengolah buah mangga (puree, dodol, sirup, keripik).
5. **`mitra`**: Profil mitra pengolah limbah bio-refinery & logistik rantai pasok.
6. **`konsumen`**: Profil pembeli ritel, grosir, dan horeka.
7. **`produk`**: Katalog komoditas buah mangga segar dan produk olahan UMKM.
8. **`limbah`**: Bursa residu mangga (kulit, biji, afkir, daun) di pasar sirkular.
9. **`transaksi`**: Transaksi pemesanan rantai pasok.
10. **`detail_transaksi`**: Rincian item produk dalam setiap transaksi.
11. **`pembayaran`**: Metode & status gateway pembayaran (VA, QRIS, Transfer).
12. **`riwayat_pengiriman`**: Pelacakan logistik & kurir pengiriman barang.
13. **`pencatatan_keuangan`**: Buku kas arus keuangan pemasukan & pengeluaran.
14. **`log_sistem`**: Audit trail aktivitas sistem dan operasional role.

---

## 📁 Struktur Berkas Backend (TypeScript / TSX & Prisma)

```text
be/
├── prisma/
│   └── schema.prisma                  # Skema Prisma ORM 14 tabel PostgreSQL
├── db/                                # Skrip Database & Migrasi (TSX)
│   ├── index.tsx                      # Database client (TypeScript)
│   ├── migrate.tsx                    # Skrip migrasi DDL skema database
│   ├── seed.tsx                       # Skrip pengisian data awal ERD
│   ├── schema.sql                     # Skema DDL 14 tabel PostgreSQL
│   └── seeds/                         # Data bibit akun & transaksi (TSX)
├── scripts/
│   ├── test-api.tsx                   # Skrip uji 26 skenario API (TSX)
│   └── test-prisma.tsx                # Skrip verifikasi query Prisma ORM (TSX)
├── src/
│   ├── config/
│   │   ├── prisma.tsx                 # Prisma Client Singleton (PostgreSQL)
│   │   ├── db.tsx                     # Koneksi database & pooling
│   │   └── index.tsx                  # Konfigurasi environment
│   ├── controllers/                   # Controller HTTP handler Prisma (TSX)
│   │   ├── umkmController.tsx
│   │   ├── mitraController.tsx
│   │   ├── adminController.tsx
│   │   ├── produkController.tsx
│   │   ├── limbahController.tsx
│   │   ├── transaksiController.tsx
│   │   ├── authController.tsx
│   │   └── penggunaController.tsx
│   ├── services/                      # Logika bisnis ORM Prisma (TSX)
│   │   ├── umkmService.tsx
│   │   ├── mitraService.tsx
│   │   └── adminService.tsx
│   ├── routes/                        # Router Express (TSX)
│   ├── middlewares/                   # Middleware Express (TSX)
│   ├── types/                         # Definisi antarmuka TypeScript
│   ├── app.tsx                        # Konfigurasi aplikasi Express
│   └── server.tsx                     # Entrypoint server backend
├── tsconfig.json                      # Konfigurasi TypeScript backend
└── package.json                       # Dependensi Prisma, pg, tsx, express
```

---

## 🚀 Perintah Operasional

```bash
# 1. Generate Prisma Client
npm run prisma:generate

# 2. Uji Coba Query Prisma ORM
npm run test:prisma

# 3. Jalankan Pengujian Otomatis REST API (26 Uji Coba)
npm test

# 4. Jalankan Server Pengembangan (Hot Reload dengan tsx)
npm run dev
```
│   │   ├── produkController.tsx
│   │   ├── limbahController.tsx
│   │   ├── transaksiController.tsx
│   │   ├── penggunaController.tsx
│   │   └── authController.tsx
│   ├── services/                      # Service layer query database (TSX)
│   │   ├── umkmService.tsx
│   │   ├── mitraService.tsx
│   │   └── adminService.tsx
│   ├── routes/                        # Routing Express (TSX)
│   │   ├── umkmRoutes.tsx
│   │   ├── mitraRoutes.tsx
│   │   ├── adminRoutes.tsx
│   │   ├── produkRoutes.tsx
│   │   ├── limbahRoutes.tsx
│   │   ├── transaksiRoutes.tsx
│   │   ├── penggunaRoutes.tsx
│   │   ├── authRoutes.tsx
│   │   └── index.tsx
│   ├── types/
│   │   └── samangga.tsx               # Interface & Type Definition 14 Tabel ERD
│   ├── middlewares/
│   │   └── errorHandler.tsx
│   ├── app.tsx                        # Setup Express.js
│   └── server.tsx                     # Entrypoint server listener
├── tsconfig.json                      # Konfigurasi TypeScript NodeNext
├── .env
├── .env.example
└── package.json                       # Scripts tsx & devDependencies
```

---

## 🚀 Menjalankan Backend

### 1. Migrasi & Seeding Database
```bash
cd be
npm run db:setup
```
*(Menjalankan `tsx db/migrate.tsx && tsx db/seed.tsx`)*.

### 2. Jalankan Server API
```bash
npm run dev
# Menjalankan tsx watch src/server.tsx di http://localhost:5000
```

### 3. Pengujian Otomatis (Test Suite)
```bash
npm test
# Menjalankan tsx scripts/test-api.tsx (26 skenario pengujian Admin, Mitra, & UMKM)
```

---

## 📡 Daftar Endpoint REST API UMKM (`/api/umkm`)

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/umkm` | Mengambil seluruh daftar UMKM terdaftar & status verifikasinya |
| `GET` | `/api/umkm/profil/:id` | Mengambil profil lengkap UMKM berdasarkan `id_user` atau `id_umkm` (`?by_umkm_id=true`) |
| `PUT` | `/api/umkm/profil/:id` | Memperbarui profil UMKM (nama usaha, NIB, kapasitas bulanan, rekening bank, alamat) |
| `GET` | `/api/umkm/dashboard/:id` | Dashboard metrik komprehensif UMKM (katalog, omzet penjualan, belanja bahan baku, limbah disetor, kas keuangan) |
| `GET` | `/api/umkm/produk/:id_user` | Mengambil daftar produk olahan milik UMKM dengan filter kategori & pencarian |
| `POST` | `/api/umkm/produk` | Menerbitkan produk olahan baru ke katalog SAMANGGA |
| `PUT` | `/api/umkm/produk/:id` | Memperbarui informasi produk olahan (harga, stok, deskripsi, gambar) |
| `DELETE` | `/api/umkm/produk/:id` | Menghapus produk olahan dari katalog |
| `GET` | `/api/umkm/limbah/:id_umkm` | Mengambil riwayat residu/limbah dapur olahan yang disetor ke pasar sirkular |
| `POST` | `/api/umkm/limbah` | Menyetorkan batch residu sirkular baru (kulit, biji, afkir) ke bursa mitra |
| `GET` | `/api/umkm/transaksi/penjualan/:id_user` | Mengambil daftar pesanan masuk dari pembeli (UMKM sebagai Penjual) |
| `GET` | `/api/umkm/transaksi/pembelian/:id_user` | Mengambil daftar belanja bahan baku buah mangga (UMKM sebagai Pembeli) |
| `PUT` | `/api/umkm/transaksi/:id/status` | Memperbarui status transaksi pesanan (`Diproses`, `Selesai`, `Batal`) & auto-catat kas |
| `GET` | `/api/umkm/keuangan/:id_user` | Mengambil buku kas keuangan & ringkasan saldo kas UMKM |
| `POST` | `/api/umkm/keuangan` | Menambahkan pencatatan kas pemasukan/pengeluaran baru |
| `POST` | `/api/umkm/:id/resubmit` | Mengirimkan ulang berkas dokumen verifikasi UMKM |

---

## 🛡️ Daftar Endpoint Admin & Mitra

- **Admin**: `/api/admin/dashboard`, `/api/admin/verifikasi`, `/api/admin/verifikasi/:id/setujui`, `/api/admin/verifikasi/:id/tolak`, `/api/admin/logs`.
- **Mitra**: `/api/mitra`, `/api/mitra/profil/:id`, `/api/mitra/dashboard/:id`, `/api/mitra/limbah/bursa`, `/api/mitra/limbah/klaim`, `/api/mitra/limbah/:id/status`, `/api/mitra/pengiriman/:id`.

---

## 🧑‍🌾 Endpoint Supplier / Petani (`/api/supplier`)

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` / `PUT` | `/api/supplier/profil/:id_user` | Profil & data kebun/rekening supplier |
| `GET` | `/api/supplier/dashboard/:id_user` | Ringkasan katalog, omzet, pesanan aktif, dan kas |
| `GET` / `POST` | `/api/supplier/produk/:id_user`, `/api/supplier/produk` | Daftar & tambah komoditas mangga |
| `PUT` / `DELETE` | `/api/supplier/produk/:id_produk` | Ubah & hapus komoditas (body: `id_user`) |
| `GET` | `/api/supplier/pesanan/:id_user` | Pesanan masuk sebagai penjual |
| `PUT` | `/api/supplier/pesanan/:id_transaksi/status` | Ubah status (`Diproses`, `Selesai`, `Batal`) |
| `GET` / `POST` | `/api/supplier/keuangan/:id_user`, `/api/supplier/keuangan` | Buku kas |
| `PUT` / `DELETE` | `/api/supplier/keuangan/:id_keuangan` | Ubah & hapus catatan kas |
| `POST` | `/api/supplier/:id_user/resubmit` | Kirim ulang dokumen verifikasi |

## 🛒 Endpoint Konsumen / Ritel (`/api/konsumen`)

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` / `PUT` | `/api/konsumen/profil/:id_user` | Profil & alamat pengiriman |
| `GET` | `/api/konsumen/dashboard/:id_user` | Ringkasan belanja dan kas |
| `GET` | `/api/konsumen/katalog?kategori=&search=` | Katalog produk yang bisa dipesan |
| `GET` | `/api/konsumen/pesanan/:id_user` | Riwayat pesanan |
| `GET` | `/api/konsumen/pesanan/detail/:id_transaksi?id_user=` | Detail satu pesanan |
| `POST` | `/api/konsumen/pesanan` | Checkout keranjang (`items`, `metode_pembayaran`), dipisah per penjual |
| `PUT` | `/api/konsumen/pesanan/:id_transaksi/bayar` | Konfirmasi pembayaran |
| `PUT` | `/api/konsumen/pesanan/:id_transaksi/status` | Batalkan (`Batal`) atau terima barang (`Selesai`) |
| `GET` / `POST` | `/api/konsumen/keuangan/:id_user`, `/api/konsumen/keuangan` | Buku kas |
| `PUT` / `DELETE` | `/api/konsumen/keuangan/:id_keuangan` | Ubah & hapus catatan kas |

## ✅ Uji Otomatis Supplier & Konsumen

```bash
npm run test:e2e
```

Membutuhkan server berjalan di port 4000 dan database yang sudah di-seed.

## 🔑 Akun Demo

Semua akun seed memakai kata sandi `samangga2026` (diatur oleh `DEMO_PASSWORD`). Login bisa memakai email atau nomor WhatsApp. Contoh: `agus.sumberrejeki@samangga.id` (Supplier), `purchasing@segarbuah.co.id` (Konsumen).
