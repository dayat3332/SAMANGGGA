# SAMANGGA Backend

Backend REST API untuk SAMANGGA (Node.js + Express + PostgreSQL). Skema database mengikuti ERD di `SAMANGGGA-FE/src/types/samangga.ts` (14 tabel).

## Menjalankan

```bash
# 1. Postgres (pilih salah satu)
docker compose up -d                 # atau pakai Postgres lokal, buat database "samangga"

# 2. Backend
cp .env.example .env                 # sesuaikan DATABASE_URL dan JWT_SECRET
npm install
npm run migrate                      # buat tabel (npm run migrate:reset = hapus dan buat ulang)
npm run seed                         # akun demo + contoh produk/limbah
npm run dev                          # http://localhost:4000

# 3. Uji alur lengkap (server harus sedang jalan)
npm run smoke
```

Akun demo (password `Samangga123!`): `admin@samangga.id`, `agus.sumberrejeki@samangga.id` (Supplier), `bu.ning@samangga.id` (UMKM), `ciptarasa@samangga.id` (Mitra), `tokobuah@samangga.id` (Konsumen).

## Menyambungkan ke frontend

Frontend (`SAMANGGGA-FE`, dikirim terpisah) sudah tersambung ke backend ini. Cukup buat `.env.local` di folder FE (salin dari `.env.local.example`):

```
NEXT_PUBLIC_API_URL=http://localhost:4000
API_URL=http://localhost:4000
```

Lalu jalankan backend (`npm run dev`) dan frontend (`npm run dev` di folder FE, port 3000).

Catatan setelah pembaruan: tabel `limbah` mendapat kolom `kondisi`, jadi jalankan `npm run migrate:reset` lalu `npm run seed` sekali.

## Endpoint (prefix `/api`, header `Authorization: Bearer <token>`)

| Method | Path | Akses | Keterangan |
|---|---|---|---|
| POST | /auth/daftar | publik | Daftar akun (status Menunggu). Field profil peran boleh dikirim di `profil` |
| POST | /auth/masuk | publik | Login `{identifier, password}`; `identifier` = email ATAU nomor WhatsApp (08xx / +62xx). Mengembalikan `token` |
| POST | /auth/google | publik | Login Google `{access_token}` (token dari Google Identity Services). Email Google harus sudah terdaftar di SAMANGGA. Butuh `GOOGLE_CLIENT_ID` di `.env` |
| GET/PATCH | /auth/me | login | Data akun + profil peran |
| POST | /auth/ganti-password | login | |
| GET | /produk | publik | Katalog (Terverifikasi). Query: kategori, q, halaman |
| GET | /produk/:id, /produk/saya | publik / login | |
| POST/PUT/DELETE | /produk | Supplier, UMKM | Produk baru masuk antrean verifikasi |
| POST | /transaksi | terverifikasi | Checkout `{metode_pembayaran, items:[{id_produk,jumlah_produk}]}` (stok dikunci, 1 penjual per transaksi) |
| GET | /transaksi, /transaksi/:id | pihak terkait | |
| POST | /transaksi/:id/bukti | pembeli | Bukti Transfer Manual |
| POST | /transaksi/:id/konfirmasi | penjual/admin | `{diterima:true/false}` |
| PATCH | /transaksi/:id/status | pembeli/penjual | `Selesai` atau `Batal` (stok dikembalikan) |
| POST | /transaksi/:id/pengiriman | penjual | Buat resi |
| PATCH | /transaksi/pengiriman/:id | penjual/mitra | Ubah status pengiriman |
| POST | /pembayaran/simulasi/:idTransaksi | pembeli | HANYA mode pengembangan: meniru callback gateway "Berhasil" untuk VA/QRIS (404 di production) |
| POST | /pembayaran/callback | gateway | Header `x-callback-token` (VA/QRIS), idempoten |
| GET | /limbah | publik | Listing Terverifikasi. Query: jenis |
| POST | /limbah | UMKM | Setor limbah |
| POST | /limbah/:id/jemput | Mitra | Ajukan jemput (Jual Beli/Jasa Berbayar/Gratis) |
| PATCH | /limbah/:id/status | Mitra/admin | Proses lalu Selesai (otomatis catat keuangan) |
| PATCH | /limbah/:id/verifikasi | Admin Limbah | |
| POST | /upload/:tipe | terverifikasi | Unggah file mentah (`bukti`, `produk`, `limbah`). Header `Content-Type`: image/jpeg, image/png, image/webp (PDF khusus `bukti`). Maks `MAX_UPLOAD_MB` (5). Balasan `{ path }`, simpan ke `bukti_transfer` / `gambar` / `foto_limbah`. File dibuka di `/uploads/...` |
| GET/POST | /keuangan | login | Riwayat, ringkasan, catatan manual |
| GET | /admin/ringkasan, /admin/log | admin | |
| GET/PATCH | /admin/pengguna, /admin/pengguna/:id/verifikasi | Super Admin | |
| PATCH | /admin/produk/:id/verifikasi | Admin Transaksi | |

Setiap request dicatat ke tabel `log_sistem`. Error validasi berformat `{ message, errors: { field: pesan } }` seperti di FE.

## Catatan

- Tabel `limbah` ditambah kolom `kondisi` (kondisi fisik limbah, ada di form Setor Limbah FE). Enum `kategori_produk` ditambah `Bibit` dan `jenis_limbah` ditambah `Daun` karena dipakai halaman FE (tidak ada di ERD asli).
- Sesuai ERD, tabel `limbah` merujuk `id_umkm`, jadi hanya UMKM yang bisa setor limbah.
- Virtual Account/QRIS: kode pembayaran masih placeholder. Sambungkan ke Midtrans/Xendit di `routes/transaksi.js` dan arahkan webhook-nya ke `/api/pembayaran/callback`.
- `bukti_transfer`, `gambar`, `foto_limbah` berupa path teks. Upload lewat `POST /api/upload/:tipe`, file disimpan di folder `uploads/` (ganti dengan object storage bila deploy ke hosting yang disk-nya tidak permanen).
- Production: isi `JWT_SECRET` dan `PAYMENT_CALLBACK_TOKEN` yang kuat, ganti password akun seed.
