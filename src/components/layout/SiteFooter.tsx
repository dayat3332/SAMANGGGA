/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { JSX } from "react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  MapPinIcon,
  PhoneIcon,
  TwitterIcon,
  UserMailIcon,
  WhatsAppIcon,
  YoutubeIcon,
} from "@/components/ui/Icons";

interface SocialLink {
  readonly name: string;
  readonly href: string;
  readonly ariaLabel: string;
  readonly icon: JSX.Element;
  readonly handle: string;
}

const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    name: "Instagram",
    href: "https://instagram.com",
    ariaLabel: "Ikuti SAMANGGA di Instagram",
    handle: "@samangga.id",
    icon: <InstagramIcon className="h-4 w-4" />,
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/6281234567890?text=Halo%20SAMANGGA%2C%20saya%20ingin%20bertanya%20seputar%20ekosistem%20mangga%20dan%20limbah%20sirkular",
    ariaLabel: "Hubungi Customer Service SAMANGGA melalui WhatsApp",
    handle: "+62 812-3456-7890",
    icon: <WhatsAppIcon className="h-4 w-4" />,
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    ariaLabel: "Kunjungi kanal YouTube SAMANGGA Official",
    handle: "SAMANGGA Official",
    icon: <YoutubeIcon className="h-4 w-4" />,
  },
  {
    name: "Facebook",
    href: "https://facebook.com",
    ariaLabel: "Halaman Facebook SAMANGGA Indramayu",
    handle: "SAMANGGA Indramayu",
    icon: <FacebookIcon className="h-4 w-4" />,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    ariaLabel: "Profil LinkedIn SAMANGGA Sirkular Indonesia",
    handle: "SAMANGGA Indonesia",
    icon: <LinkedinIcon className="h-4 w-4" />,
  },
  {
    name: "X (Twitter)",
    href: "https://x.com",
    ariaLabel: "Akun resmi X SAMANGGA",
    handle: "@samangga_id",
    icon: <TwitterIcon className="h-4 w-4" />,
  },
];

const NAV_KATEGORI = [
  {
    title: "Navigasi Halaman",
    links: [
      { label: "Beranda Utama", href: "/" },
      { label: "Katalog Bahan Baku & Olahan", href: "/katalog" },
      { label: "Pasar Limbah Sirkular", href: "/pasar-sirkular" },
      { label: "Tentang Ekosistem SAMANGGA", href: "/tentang" },
      { label: "Pendaftaran Akun Mitra", href: "/daftar" },
      { label: "Masuk ke Platform", href: "/login" },
    ],
  },
  {
    title: "Peran Ekosistem (ERD)",
    links: [
      { label: "Petani / Supplier Mangga", href: "/profil/petani" },
      { label: "UMKM Olahan Mangga", href: "/profil/umkm" },
      { label: "Mitra Pengolah Limbah", href: "/profil/mitra" },
      { label: "Konsumen & Pembeli", href: "/profil/konsumen" },
      { label: "Dasbor Admin Sistem", href: "/profil/admin" },
      { label: "Pintu Masuk Peran (Portal)", href: "/dashboard" },
    ],
  },
  {
    title: "Layanan Sirkular",
    links: [
      { label: "Setor Limbah UMKM", href: "/pasar-sirkular/setor" },
      { label: "Jemput Limbah Organik", href: "/pasar-sirkular/jemput" },
      { label: "Pesan Mangga & Olahan", href: "/pesan" },
      { label: "Alur Rantai Pasok Hijau", href: "/tentang#alur" },
      { label: "Standarisasi Mutu Komoditas", href: "/tentang#standar" },
      { label: "Kalkulator Nilai Sirkular", href: "/tentang#sirkular" },
    ],
  },
] as const;

export function SiteFooter(): JSX.Element {
  return (
    <footer className="relative border-t border-[#3D5126]/30 bg-gradient-to-b from-[#222E17] via-[#1D2713] to-[#151D0E] text-white">
      {/* Garis Aksen Emas Halus di Puncak Footer */}
      <div className="h-1 w-full bg-gradient-to-r from-[#3D5126] via-[#FFB81C] to-[#3D5126]" />

      <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:px-8 lg:pt-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8 pb-12 border-b border-white/10">
          {/* Kolom 1: Branding & Narasi Sirkular */}
          <div className="space-y-4 lg:col-span-4">
            <Link
              href="/"
              aria-label="SAMANGGA — Beranda Utama"
              className="group inline-flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB81C]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3D5126] p-2 ring-1 ring-white/20 transition-transform group-hover:scale-105 shadow-md">
                <img src="/images/logo_web.png" alt="Logo SAMANGGA" className="h-7 w-7 object-contain" />
              </div>
              <div>
                <span className="block text-xl font-black tracking-tight text-white group-hover:text-[#FFE39A] transition-colors">
                  SAMANGGA
                </span>
                <span className="block text-[11px] font-extrabold uppercase tracking-widest text-[#95A87A]">
                  Sirkular Mangga Indramayu
                </span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-white/75 sm:text-sm">
              Platform integrasi rantai pasok agribisnis dan pasar limbah sirkular mangga Kabupaten Indramayu.
              Menghubungkan petani, pelaku UMKM olahan, mitra pengolah pupuk &amp; bibit, serta konsumen dalam satu
              ekosistem ekonomi hijau <em>zero-waste</em>.
            </p>

            {/* Ikon Sosial Media Interaktif */}
            <div className="pt-2">
              <p className="text-xs font-extrabold uppercase tracking-wider text-white/90">
                Media Sosial &amp; Komunikasi
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SOCIAL_LINKS.map((socmed) => (
                  <a
                    key={socmed.name}
                    href={socmed.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={socmed.ariaLabel}
                    title={`${socmed.name} (${socmed.handle})`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-white/85 ring-1 ring-white/15 transition-all hover:scale-110 hover:bg-[#FFB81C] hover:text-[#273419] hover:shadow-md hover:ring-[#FFB81C]"
                  >
                    {socmed.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom 2, 3, 4: Navigasi Tautan (Navbar Footer) */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            {NAV_KATEGORI.map((col) => (
              <div key={col.title} className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#FFE39A]">
                  {col.title}
                </h3>
                <ul className="space-y-2 text-xs">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-white/70 transition-colors hover:text-[#FFE39A] hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Kolom 5: Kontak Resmi, Telepon, Email & Lokasi */}
          <div className="space-y-4 lg:col-span-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#FFE39A]">
              Pusat Informasi &amp; Kontak
            </h3>

            <div className="space-y-3.5 text-xs text-white/80">
              {/* Lokasi */}
              <div className="flex items-start gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/8 text-[#FFB81C] ring-1 ring-white/10">
                  <MapPinIcon className="h-4 w-4" />
                </span>
                <div>
                  <strong className="block font-bold text-white">Sentra Agribisnis SAMANGGA</strong>
                  <p className="mt-0.5 leading-relaxed text-white/70">
                    Jl. DI Panjaitan No. 45, Kel. Karanganyar, Kec. Indramayu, Kabupaten Indramayu, Jawa Barat 45213
                  </p>
                  <a
                    href="https://maps.google.com/?q=Indramayu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#FFB81C] hover:underline"
                  >
                    <span>Buka Google Maps</span>
                    <span>→</span>
                  </a>
                </div>
              </div>

              {/* Telepon */}
              <div className="flex items-start gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/8 text-[#FFB81C] ring-1 ring-white/10">
                  <PhoneIcon className="h-4 w-4" />
                </span>
                <div>
                  <strong className="block font-bold text-white">Hotline &amp; WhatsApp</strong>
                  <div className="mt-0.5 space-y-0.5">
                    <p className="text-white/70">
                      Kantor:{" "}
                      <a href="tel:02347123456" className="text-white hover:text-[#FFE39A] font-mono">
                        (0234) 712-3456
                      </a>
                    </p>
                    <p className="text-white/70">
                      WhatsApp:{" "}
                      <a
                        href="https://wa.me/6281234567890"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FFE39A] hover:underline font-mono font-bold"
                      >
                        +62 812-3456-7890
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/8 text-[#FFB81C] ring-1 ring-white/10">
                  <UserMailIcon className="h-4 w-4" />
                </span>
                <div>
                  <strong className="block font-bold text-white">Email Resmi</strong>
                  <div className="mt-0.5 space-y-0.5">
                    <p className="text-white/70">
                      Umum:{" "}
                      <a href="mailto:halo@samangga.id" className="text-[#FFE39A] hover:underline font-mono">
                        halo@samangga.id
                      </a>
                    </p>
                    <p className="text-white/70">
                      Kemitraan:{" "}
                      <a href="mailto:mitra@samangga.id" className="text-white hover:text-[#FFE39A] font-mono">
                        mitra@samangga.id
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Jam Operasional */}
              <div className="flex items-start gap-2.5 pt-1">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/8 text-[#FFB81C] ring-1 ring-white/10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
                <div>
                  <strong className="block font-bold text-white">Jam Operasional Layanan</strong>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/70">
                    Senin – Sabtu: 08.00 – 17.00 WIB
                    <br />
                    Layanan Penjemputan Limbah: 07.00 – 18.00 WIB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-white/85">
              © 2026 SAMANGGA Inc. Seluruh Hak Cipta Dilindungi Undang-Undang.
            </p>
            <p className="text-[11px] text-white/55">
              Menghidupkan Potensi Mangga Indramayu Dari Hulu Hingga Hilir Melalui Sirkularitas Agribisnis Berkelanjutan.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/60">
            <Link href="/tentang#privasi" className="hover:text-[#FFE39A] transition-colors">
              Kebijakan Privasi
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/tentang#syarat" className="hover:text-[#FFE39A] transition-colors">
              Syarat &amp; Ketentuan
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/tentang#keamanan" className="hover:text-[#FFE39A] transition-colors">
              Keamanan Data ERD
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/tentang#panduan" className="hover:text-[#FFE39A] transition-colors">
              Panduan Sirkular
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
