# Laporan uji SAMANGGA v2
Target: https://samanggga.vercel.app | Submit: dry-run | 2026-11-10T11:28:31.619Z

PASS 70 | WARN 5 | FAIL 1 | SKIP 0

| Status | Langkah | Catatan |
|---|---|---|
| PASS | Smoke / | 0 field, 0 tombol |
| PASS | Smoke /katalog | 1 field, 9 tombol |
| PASS | Smoke /pasar-sirkular | 1 field, 5 tombol |
| PASS | Smoke /tentang | 1 field, 10 tombol |
| PASS | Smoke /keranjang | 0 field, 0 tombol |
| PASS | Smoke /login | 3 field, 20 tombol |
| PASS | Smoke /daftar | 8 field, 9 tombol |
| PASS | Smoke /dashboard | 0 field, 0 tombol |
| PASS | Smoke /pesan?produk=1 | 0 field, 7 tombol |
| PASS | Smoke /pesan?produk=2 | 0 field, 7 tombol |
| PASS | Smoke /pasar-sirkular/jemput?limbah=1 | 8 field, 12 tombol |
| PASS | Smoke /pasar-sirkular/jemput?limbah=2 | 8 field, 12 tombol |
| PASS | Smoke /pasar-sirkular/setor | 6 field, 5 tombol |
| PASS | Smoke /profil/petani | 0 field, 0 tombol |
| PASS | Smoke /profil/umkm | 0 field, 0 tombol |
| PASS | Smoke /profil/mitra | 0 field, 0 tombol |
| PASS | Smoke /profil/konsumen | 0 field, 0 tombol |
| PASS | Smoke /profil/admin | 0 field, 0 tombol |
| PASS | Smoke /fungsi/supplier | 0 field, 0 tombol |
| PASS | Smoke /fungsi/umkm | 0 field, 0 tombol |
| PASS | Smoke /fungsi/mitra | 0 field, 0 tombol |
| PASS | Smoke /fungsi/konsumen | 0 field, 0 tombol |
| PASS | Smoke /fungsi/admin | 0 field, 0 tombol |
| PASS | HTML mentah tanpa login: /profil/admin |  |
| PASS | HTML mentah tanpa login: /profil/konsumen |  |
| PASS | HTML mentah tanpa login: /profil/mitra |  |
| PASS | HTML mentah tanpa login: /fungsi/admin |  |
| PASS | Navbar: label link keranjang |  |
| PASS | Tentang: anchor footer ada dan berisi |  |
| PASS | Katalog: kartu produk tampil | 2 kartu (beranda menyebut 2) |
| PASS | Katalog: pencarian |  |
| PASS | Katalog: tab kategori | Olahan Mangga: 0 / Bibit Pohon: 0 / Mangga Segar: 2 |
| PASS | Katalog: detail produk -> pesan | Modal detail meminta login untuk memesan |
| PASS | Login: kredensial salah ditolak | Pesan: 🚨 / AKSES DIBATASI |
| PASS | Login: chip peran tidak cocok dengan akun | Chip "Konsumen" + akun Supplier -> /profil/petani |
| PASS | Daftar: validasi form kosong |  |
| FAIL | Daftar: isi semua field (dry-run) / submit | locator.click: Timeout 30000ms exceeded. |
| PASS | Login Admin |  |
| PASS | Halaman fungsi Admin | 0 field, 10 tombol |
| PASS | Admin: angka ringkasan konsisten | 8 akun |
| PASS | Admin: antrean verifikasi memuat calon mitra (Bambang) |  |
| PASS | Logout Admin |  |
| PASS | Login Supplier Agus (terverifikasi) |  |
| PASS | Halaman fungsi Supplier Agus (terverifikasi) | 5 field, 2 tombol |
| PASS | Isolasi peran: Supplier Agus (terverifikasi) buka halaman Admin |  |
| PASS | Logout Supplier Agus (terverifikasi) |  |
| WARN | Login Supplier Kartono (menunggu) | Akun Menunggu bisa membuka dashboard tanpa banner/pembatasan |
| PASS | Login UMKM Ningsih (terverifikasi) |  |
| PASS | Halaman fungsi UMKM Ningsih (terverifikasi) | 6 field, 6 tombol |
| PASS | Isolasi peran: UMKM Ningsih (terverifikasi) buka halaman Admin |  |
| PASS | Setor: isi lengkap (dry-run) / submit | Dry-run: semua field terisi, submit dilewati |
| WARN | Setor: berat negatif ditolak (atribut min) | Input berat menerima -5 di level atribut (tidak ada min); pastikan ada validasi JS/server |
| PASS | Logout UMKM Ningsih (terverifikasi) |  |
| PASS | Login UMKM Siti (terverifikasi) |  |
| PASS | Halaman fungsi UMKM Siti (terverifikasi) | 6 field, 6 tombol |
| PASS | Isolasi peran: UMKM Siti (terverifikasi) buka halaman Admin |  |
| PASS | Logout UMKM Siti (terverifikasi) |  |
| PASS | Login Mitra Hendra (terverifikasi) |  |
| PASS | Halaman fungsi Mitra Hendra (terverifikasi) | 0 field, 12 tombol |
| PASS | Isolasi peran: Mitra Hendra (terverifikasi) buka halaman Admin |  |
| PASS | Jemput: "Ambil Semua" mengisi 350 kg |  |
| PASS | Jemput: berat melebihi stok (400 > 350) | Nilai dikoreksi otomatis ke 350 |
| WARN | Jemput: tanggal lampau (atribut min) | Tanggal kemarin diterima di level atribut (tidak ada min=hari ini) |
| PASS | Jemput: isi lengkap (dry-run) / submit | Dry-run: semua field terisi, submit dilewati |
| PASS | Jemput: id limbah tidak valid | Heading: Ajukan Penjemputan Limbah Sirkular / ALUR KERJA PASAR SIRKULAR SAAT KLIK “JEMPUT” |
| PASS | Logout Mitra Hendra (terverifikasi) |  |
| PASS | Login Mitra Bambang (menunggu) |  |
| PASS | Login Konsumen Budi (terverifikasi) |  |
| PASS | Halaman fungsi Konsumen Budi (terverifikasi) | 3 field, 2 tombol |
| PASS | Isolasi peran: Konsumen Budi (terverifikasi) buka halaman Admin |  |
| PASS | Katalog (login): modal detail punya jalan ke pesan | tombol: Tambah ke Keranjang / link: Pesan / Pesan / Pesan Sekarang / Pesan Mangga & Olahan |
| WARN | Pesan: form alamat (lokalisasi + tanggal estimasi) | Estimasi tiba "06.11.2026" sudah lewat (hard-coded?); Masih berbahasa Inggris: FIRST NAME, STREET ADDRESS, ZIP CODE, Delivery address, Package arrives |
| PASS | Pesan: wizard COD -> langkah berikutnya | 0 field; tombol: Bayar di Kasir (Saat Mengambil Buah)Paling Praktis Anda tidak perlu bayar sekar / QRIS Terpadu SAMANGGA Verifikasi Otomatis Scan dari aplikasi m-Banking atau dom / Virtual Account Ban |
| PASS | Pesan: wizard Paket -> langkah berikutnya | 8 field; tombol: SAMANGGA FLEET Rp 35.000 Package arrives: Tomorrow / FEDEX / JNE Rp 22.000 Package arrives: Friday, 06.11.2026 / BACK / NEXT STEP > / − |
| WARN | Pesan: tombol + mengubah ringkasan harga | Ringkasan harga tidak berubah setelah klik + (Rp: Rp 0,Rp 1.450.000,Rp 1.450.000,Rp 1.450.000,Rp 0,Rp 1.450.000) |
| PASS | Logout Konsumen Budi (terverifikasi) |  |