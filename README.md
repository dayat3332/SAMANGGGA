# SAMANGGA

Platform web B2B Rantai Pasok & Pasar Limbah Sirkular Mangga Indramayu yang menghubungkan **Petani**, **UMKM Pengolah**, **Mitra Sirkular (Bio-Refinery)**, dan **Konsumen/Ritel**.

Dibangun menggunakan **Next.js (App Router)**, **React 19**, **TypeScript**, dan **Tailwind CSS v4**.

## Menjalankan Proyek

```bash
npm install
npm run dev      # Menjalankan server development di http://localhost:3000
npm run build    # Build produksi
npm start        # Menjalankan hasil build produksi
```

## Struktur Folder (`src/`)

```text
src/
├── app/                        # Next.js App Router (Halaman & API)
│   ├── api/daftar/route.ts     # Endpoint pendaftaran kemitraan
│   ├── daftar/page.tsx         # Halaman pendaftaran kemitraan (/daftar)
│   ├── katalog/page.tsx        # Halaman Katalog Rantai Pasok (/katalog)
│   ├── login/page.tsx          # Halaman masuk akun (/login)
│   ├── masuk/page.tsx          # Alias halaman masuk akun (/masuk)
│   ├── pasar-sirkular/         # Halaman Pasar Sirkular & transaksi limbah
│   │   ├── page.tsx            # Etalase & alur Pasar Sirkular (/pasar-sirkular)
│   │   ├── setor/page.tsx      # Form setor limbah (/pasar-sirkular/setor)
│   │   └── jemput/page.tsx     # Form penjemputan limbah (/pasar-sirkular/jemput)
│   ├── pesan/page.tsx          # Halaman pemesanan komoditas (/pesan)
│   ├── profil/                 # Workspace berbasis peran (Role-based Workspace)
│   │   ├── petani/page.tsx     # Workspace Petani / Supplier Hulu (/profil/petani)
│   │   ├── umkm/page.tsx       # Workspace UMKM Pengolah (/profil/umkm)
│   │   ├── mitra/page.tsx      # Workspace Mitra Sirkular (/profil/mitra)
│   │   └── konsumen/page.tsx   # Workspace Konsumen & Ritel (/profil/konsumen)
│   ├── tentang/page.tsx        # Halaman Tentang Kami (/tentang)
│   ├── globals.css             # Konfigurasi tema & variabel Tailwind CSS
│   ├── layout.tsx              # Root layout & konfigurasi font
│   └── page.tsx                # Halaman Beranda (/)
├── components/                 # Komponen UI terorganisir per fitur/domain
│   ├── about/                  # Komponen halaman Tentang Kami
│   ├── auth/                   # Komponen autentikasi (LoginPage, DaftarMitra)
│   ├── home/                   # Komponen halaman utama (LandingPage)
│   ├── katalog/                # Komponen Katalog & Pemesanan (KatalogRantaiPasok, PesanSekarang)
│   ├── layout/                 # Navigasi & Footer global (SiteNavbar, SiteFooter)
│   ├── pasar-sirkular/         # Komponen Pasar Sirkular, Setor, & Jemput Limbah
│   ├── profil/                 # Komponen Workspace & Profil Pengguna (ProfilRole)
│   └── ui/                     # Komponen UI bersama (Icons, Illustrations, button)
├── data/                       # Data statis, konstanta, & konfigurasi fitur
│   ├── katalog.ts              # Data produk katalog, kategori, kurir, & metode bayar
│   ├── pasar-sirkular.ts       # Data listing limbah, langkah sirkular, & armada jemput
│   └── profil.ts               # Data profil default & workspace tiap peran
├── lib/                        # Utilitas & helper fungsi
│   ├── format.ts               # Formatter mata uang Rupiah & angka ribuan
│   ├── utils.ts                # Helper className (cn)
│   └── validation.ts           # Validasi form & sanitasi input pendaftaran
└── types/
    └── samangga.ts             # Definisi tipe data domain & skema ERD SAMANGGA
```
