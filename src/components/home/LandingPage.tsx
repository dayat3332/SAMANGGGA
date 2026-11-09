"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { JSX, ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Navbar } from "@/components/layout/SiteNavbar";
import {
  ArrowRightIcon,
  BasketIcon,
  BoxesIcon,
  RecycleIcon,
  SproutIcon,
  StoreIcon,
} from "@/components/ui/Icons";
import {
  getEcosystemCatalogProducts,
  getEcosystemWasteListings,
  subscribeEcosystem,
} from "@/lib/ecosystemStore";
import type { Product } from "@/data/katalog";
import type { WasteListing } from "@/data/pasar-sirkular";
import { formatNumber, formatRupiah } from "@/lib/format";

interface Stakeholder {
  title: string;
  description: string;
  icon: () => JSX.Element;
}

interface Step {
  title: string;
  description: string;
}

const STEPS: readonly Step[] = [
  {
    title: "Daftar sebagai mitra",
    description:
      "Petani, UMKM, atau pengolah mengisi data singkat. Tanpa biaya awal dan bisa dibantu lewat WhatsApp.",
  },
  {
    title: "Pasang atau cari produk",
    description:
      "Tawarkan mangga dan limbah hasil panen, atau cari bahan baku yang Anda butuhkan.",
  },
  {
    title: "Sepakati dan kirim",
    description:
      "Harga, jumlah, dan pengiriman disepakati langsung dengan pembeli atau mitra pengolah.",
  },
  {
    title: "Limbah jadi nilai",
    description:
      "Kulit, biji, dan mangga afkir diolah menjadi pakan, pupuk, atau produk pangan baru.",
  },
];

const STAKEHOLDERS: readonly Stakeholder[] = [
  {
    title: "Petani",
    description: "Jual hasil panen dan limbah kebun langsung ke pembeli, tanpa rantai perantara yang panjang.",
    icon: () => <SproutIcon />,
  },
  {
    title: "UMKM",
    description: "Dapatkan bahan baku mangga yang jelas asal, harga, dan jumlahnya untuk produk Anda.",
    icon: () => <StoreIcon />,
  },
  {
    title: "Mitra Pengolah",
    description: "Ubah kulit, biji, dan mangga afkir menjadi pakan, pupuk, atau produk bernilai tambah.",
    icon: () => <RecycleIcon />,
  },
  {
    title: "Konsumen",
    description: "Beli mangga Indramayu segar dan produk olahannya dari sumber yang bisa dipercaya.",
    icon: () => <BasketIcon />,
  },
];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#95A87A] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

function PrimaryButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#3D5126] px-5 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#273419] ${FOCUS_RING} ${className}`}
    >
      {children}
    </Link>
  );
}

function SectionHeading({
  id,
  eyebrow,
  title,
  subtitle,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <div className="max-w-xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#3D5126]">{eyebrow}</p>
      <h2 id={id} className="mt-1 text-xl font-bold tracking-tight text-[#273419] sm:text-2xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-2 text-base text-gray-700">{subtitle}</p> : null}
    </div>
  );
}

function Hero(): JSX.Element {
  return (
    <section aria-labelledby="hero-title" className="border-b border-gray-200 bg-[#F8FAFC]">
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-8 sm:px-6 md:grid-cols-2 md:gap-10 lg:py-12">
        <div>
          <p className="inline-block rounded-full bg-[#95A87A]/35 px-3 py-1 text-sm font-semibold text-[#273419]">
            Ekosistem Sirkular Mangga Indramayu
          </p>

          <h1 id="hero-title" className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#273419]">
            MANGGA NAIK KELAS.
          </h1>

          <p className="mt-3 max-w-md text-base leading-relaxed text-gray-700">
            Dari kebun ke pasar, dari limbah jadi nilai. SAMANGGA menghubungkan petani, UMKM, mitra pengolah, dan
            konsumen mangga Indramayu dalam satu ekosistem sirkular.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton href="/katalog" className="w-full sm:w-auto">
              Lihat Katalog
              <ArrowRightIcon />
            </PrimaryButton>
            <Link
              href="#cara-kerja"
              className={`inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-[#3D5126] bg-[#95A87A]/30 px-5 text-base font-semibold text-[#273419] transition-colors hover:bg-[#95A87A]/60 sm:w-auto ${FOCUS_RING}`}
            >
              Cara Kerja
            </Link>
          </div>
        </div>

        <figure className="w-full max-w-md md:justify-self-end">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#95A87A] shadow-lg group">
            <img
              src="/images/mangga/petani_pegang_mangga.jpg"
              alt="Petani mangga Indramayu tersenyum memegang mangga hasil panen berkualitas ekspor"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/90 p-2.5 backdrop-blur-md">
              <p className="text-xs font-bold text-[#273419]">Pak Warta & Petani Mangga Indramayu</p>
              <p className="text-[11px] text-gray-600">Mitra Koperasi Mangga Gedong Gincu Lohbener</p>
            </div>
          </div>
          <figcaption className="sr-only">Petani mangga Indramayu memegang hasil panen</figcaption>
        </figure>
      </div>
    </section>
  );
}

function About(): JSX.Element {
  return (
    <section id="tentang" aria-labelledby="tentang-title" className="scroll-mt-16 bg-white py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="tentang-title"
          eyebrow="Tentang Kami"
          title="Satu ekosistem untuk semua pelaku mangga"
          subtitle="SAMANGGA mempertemukan setiap pihak agar tidak ada hasil kebun yang terbuang percuma."
        />
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STAKEHOLDERS.map((s) => (
            <li
              key={s.title}
              className="flex w-full max-w-sm items-start gap-3 rounded-xl border border-gray-200 bg-[#F8FAFC] p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#95A87A] text-[#273419]">
                {s.icon()}
              </span>
              <div>
                <h3 className="text-base font-bold text-[#273419]">{s.title}</h3>
                <p className="mt-0.5 text-sm text-gray-700">{s.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function LiveProductShowcase(): JSX.Element {
  const [products, setProducts] = useState<Product[]>(() => getEcosystemCatalogProducts());

  useEffect(() => {
    const update = () => setProducts(getEcosystemCatalogProducts());
    const unsub = subscribeEcosystem(update);
    return unsub;
  }, []);

  const showcaseProducts = products.slice(0, 4);

  return (
    <section aria-labelledby="produk-unggulan-title" className="bg-white py-10 border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <SectionHeading
            id="produk-unggulan-title"
            eyebrow="Komoditas & Olahan Unggulan"
            title="Produk Mangga Terbaru dari Petani & UMKM"
            subtitle="Tersedia langsung dari kebun dan sentra olahan Indramayu dengan jaminan mutu dan transparansi harga."
          />
          <Link
            href="/katalog"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#3D5126] hover:text-[#273419] shrink-0"
          >
            Lihat Semua Katalog ({products.length})
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {showcaseProducts.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-[#F8FAFC] shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                <img
                  src={p.image || "/images/mangga/mangga_gincu.jpg"}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2.5 left-2.5 rounded-full bg-[#3D5126]/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                  {p.category}
                </span>
                <span className="absolute bottom-2.5 right-2.5 rounded-md bg-white/95 px-2 py-0.5 text-[11px] font-bold text-gray-800 shadow-xs">
                  Stok: {p.stock} {p.stockUnit}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-base font-bold text-[#273419] line-clamp-1 group-hover:text-[#3D5126]">
                  {p.name}
                </h3>
                <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                  Oleh <span className="font-semibold text-gray-700">{p.seller}</span> · {p.location}
                </p>
                <div className="mt-4 pt-3 border-t border-gray-200/80 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Harga</span>
                    <p className="text-base font-extrabold text-[#3D5126]">
                      {formatRupiah(p.price)}
                      <span className="text-xs font-normal text-gray-500"> /{p.priceUnit}</span>
                    </p>
                  </div>
                  <Link
                    href={`/pesan?produk=${p.id}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#3D5126] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#273419] transition-all"
                  >
                    Pesan
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveWasteShowcase(): JSX.Element {
  const [wasteListings, setWasteListings] = useState<WasteListing[]>(() => getEcosystemWasteListings());

  useEffect(() => {
    const update = () => setWasteListings(getEcosystemWasteListings());
    const unsub = subscribeEcosystem(update);
    return unsub;
  }, []);

  const showcaseWaste = wasteListings.slice(0, 4);

  return (
    <section aria-labelledby="limbah-sirkular-title" className="bg-[#F8FAFC] py-10 border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <SectionHeading
            id="limbah-sirkular-title"
            eyebrow="Bursa Limbah Sirkular Terkini"
            title="Limbah Siap Jemput & Diolah"
            subtitle="Petani dan UMKM menyetorkan limbah kulit, biji, daun, dan mangga afkir untuk diolah mitra menjadi bio-produk."
          />
          <Link
            href="/pasar-sirkular"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#3D5126] hover:text-[#273419] shrink-0"
          >
            Masuk Pasar Sirkular ({wasteListings.length})
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {showcaseWaste.map((w) => (
            <div
              key={w.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#95A87A]/40 bg-white shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                <img
                  src={w.image || "/images/limbah/limbah_kulit_mangga.jpg"}
                  alt={`Limbah ${w.jenis}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2.5 left-2.5 rounded-full bg-[#3D5126]/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                  {w.jenis}
                </span>
                <span
                  className={`absolute bottom-2.5 right-2.5 rounded-md px-2 py-0.5 text-[11px] font-bold shadow-xs ${
                    w.status === "Tersedia"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {w.status}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-base font-bold text-[#273419] line-clamp-1">
                  Limbah {w.jenis} ({formatNumber(w.weightKg)} kg)
                </h3>
                <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                  Oleh <span className="font-semibold text-gray-700">{w.owner}</span> · {w.location}
                </p>
                <p className="mt-2 text-xs text-gray-600 line-clamp-2">
                  {w.usage}
                </p>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Kompensasi</span>
                    <p className="text-base font-extrabold text-[#3D5126]">
                      {formatRupiah(w.estimatedPrice)}
                    </p>
                  </div>
                  <Link
                    href={`/pasar-sirkular/jemput?limbah=${w.id}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-[#3D5126] bg-[#95A87A]/20 px-3.5 py-1.5 text-xs font-bold text-[#273419] hover:bg-[#3D5126] hover:text-white transition-all"
                  >
                    Jemput
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Markets(): JSX.Element {
  return (
    <section aria-label="Katalog dan Pasar Sirkular" className="border-y border-gray-200 bg-[#F8FAFC] py-8 sm:py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 px-4 sm:px-6 md:flex-row md:items-stretch">
        <article
          id="katalog"
          className="flex w-full max-w-md scroll-mt-16 flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-md"
        >
          <h2 className="text-xl font-bold text-[#273419]">Katalog Bahan Baku</h2>
          <p className="mt-1 text-sm text-gray-700">
            Cari mangga segar dan bahan baku olahan dari petani Indramayu, lengkap dengan harga dan jumlah tersedia.
          </p>
          <PrimaryButton href="/katalog" className="mt-4 w-full sm:w-auto">
            Jelajahi Katalog
            <ArrowRightIcon />
          </PrimaryButton>
        </article>

        <article
          id="pasar-sirkular"
          className="flex w-full max-w-md scroll-mt-16 flex-col items-center rounded-xl border border-[#95A87A] bg-[#95A87A]/30 p-4 text-center shadow-md"
        >
          <h2 className="text-xl font-bold text-[#273419]">Pasar Sirkular</h2>
          <p className="mt-1 text-sm text-gray-800">
            Kulit, biji, dan mangga afkir punya pembeli. Tawarkan limbah Anda ke mitra pengolah dan ubah jadi
            pendapatan tambahan.
          </p>
          <Link
            href="/pasar-sirkular"
            className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-[#3D5126] bg-white px-5 text-base font-semibold text-[#273419] transition-colors hover:bg-[#F8FAFC] sm:w-auto ${FOCUS_RING}`}
          >
            Masuk Pasar Sirkular
            <ArrowRightIcon />
          </Link>
        </article>
      </div>
    </section>
  );
}

function HowItWorks(): JSX.Element {
  return (
    <section id="cara-kerja" aria-labelledby="cara-kerja-title" className="scroll-mt-16 bg-white py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="cara-kerja-title" eyebrow="Cara Kerja" title="Mudah dalam empat langkah" />
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="flex w-full max-w-sm items-start gap-3 rounded-xl border border-gray-200 bg-[#F8FAFC] p-4"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3D5126] text-base font-bold text-white"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="text-base font-bold text-[#273419]">
                  <span className="sr-only">Langkah {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-0.5 text-sm text-gray-700">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function CallToAction(): JSX.Element {
  return (
    <section id="daftar" aria-labelledby="daftar-title" className="scroll-mt-16 bg-[#F8FAFC] py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-xl bg-[#3D5126] p-5 text-center shadow-md">
          <div>
            <h2 id="daftar-title" className="text-xl font-bold text-white">
              Siap naik kelas bersama SAMANGGA?
            </h2>
            <p className="mt-1 text-sm text-white">Bergabung sebagai mitra dan hubungkan hasil kebun dengan pembeli.</p>
          </div>
          <Link
            href="/daftar"
            className="mt-1 inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-white px-5 text-base font-semibold text-[#273419] transition-colors hover:bg-[#E9EFE0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#3D5126]"
          >
            Daftar Mitra
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-base text-[#273419] antialiased">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[#3D5126] focus:px-5 focus:py-2 focus:font-semibold focus:text-white"
      >
        Lewati ke konten utama
      </a>
      <Navbar />
      <main id="konten">
        <Hero />
        <About />
        <LiveProductShowcase />
        <LiveWasteShowcase />
        <Markets />
        <HowItWorks />
        <CallToAction />
      </main>
      <SiteFooter />
    </div>
  );
}
