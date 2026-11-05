# SAMANGGA Backend (REST API)

Backend service untuk platform **SAMANGGA** (Rantai Pasok & Pasar Limbah Sirkular Mangga Indramayu), dibangun menggunakan **Express.js (Node.js JavaScript)** dan database **PostgreSQL**, berpedoman 1:1 pada skema ERD SAMANGGA.

## Fitur Utama

- **Database PostgreSQL**: 14 tabel lengkap sesuai ERD (Pengguna, Admin, Supplier, UMKM, Mitra, Konsumen, Produk, Limbah, Transaksi, Detail Transaksi, Pembayaran, Riwayat Pengiriman, Pencatatan Keuangan, Log Sistem).
- **Admin Management**: Metrik statistik ekosistem, antrean verifikasi mitra (ACC / Tolak dengan alasan), manajemen pengguna, dan audit log sistem.
- **Mitra Operasional**: Klaim penjemputan limbah, update status penjemputan (Selesai otomatis mencatat kas keuangan), update status resi pengiriman logistik, dan dashboard kapasitas tampung.
- **Pasar Limbah Sirkular**: Pencatatan limbah UMKM, estimasi harga kompensasi, bursa limbah untuk mitra bio-refinery.
- **Rantai Pasok & Transaksi**: Pemesanan buah mangga & olahan UMKM, detail pembayaran, dan pelacakan logistik pengiriman.

## Struktur Folder

```text
be/
├── db/                  # Database PostgreSQL (JavaScript)
│   ├── index.js         # Connection Pool pg
│   ├── migrate.js       # Skrip migrasi DDL tabel
│   ├── seed.js          # Skrip pengisian data awal
│   ├── schema.sql       # Skema DDL 14 tabel PostgreSQL
│   └── seeds/           # Data seed akun & transaksi (JS)
├── scripts/
│   └── test-api.js      # Skrip uji otomatis endpoint API
├── src/
│   ├── config/          # Konfigurasi database & environment
│   ├── controllers/     # Request handler (Admin, Mitra, Produk, dll)
│   ├── middlewares/     # Error handling & middleware
│   ├── routes/          # Definisi route REST API
│   ├── services/        # Logika bisnis database PostgreSQL
│   ├── app.js           # Konfigurasi Express.js
│   └── server.js        # Entrypoint server listener
├── .env
├── .env.example
└── package.json
```

## Menjalankan Backend

1. Masuk ke direktori `be`:
   ```bash
   cd be
   ```

2. Setup Database PostgreSQL (Migrasi + Seed):
   ```bash
   npm run db:setup
   # Atau langsung dengan node:
   # node db/migrate.js && node db/seed.js
   ```

3. Jalankan server (mode watch):
   ```bash
   npm run dev
   ```
   Server akan berjalan di `http://localhost:5000`.

4. Uji Coba Otomatis Seluruh Endpoint:
   ```bash
   npm test
   # Atau langsung dengan node:
   # node scripts/test-api.js
   ```

## Endpoint REST API Utama

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/health` | Health check server |
| `GET` | `/api/admin/dashboard` | Metrik ringkasan ekosistem admin |
| `GET` | `/api/admin/verifikasi` | Antrean verifikasi akun mitra / pengguna |
| `PUT` | `/api/admin/verifikasi/:id/setujui` | Admin menyetujui akun mitra |
| `PUT` | `/api/admin/verifikasi/:id/tolak` | Admin menolak akun dengan alasan |
| `GET` | `/api/admin/logs` | Riwayat audit log sistem |
| `GET` | `/api/mitra` | Daftar seluruh mitra terverifikasi |
| `GET` | `/api/mitra/profil/:id` | Profil lengkap mitra |
| `GET` | `/api/mitra/dashboard/:id` | Dashboard operasional & kapasitas mitra |
| `GET` | `/api/mitra/limbah/bursa` | Bursa limbah sirkular siap jemput |
| `POST` | `/api/mitra/limbah/klaim` | Ajukan penjemputan limbah |
| `PUT` | `/api/mitra/limbah/:id/status` | Update status jemput limbah (Selesai -> kas terbit) |
| `GET` | `/api/mitra/pengiriman/:id` | Riwayat pengiriman logistik pesanan |
| `PUT` | `/api/mitra/pengiriman/:id/status` | Update status resi (Diproses -> Dalam Perjalanan -> Tiba di Lokasi) |
