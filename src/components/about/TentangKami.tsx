"use client";

import Link from "next/link";
import { useState } from "react";
import type { JSX } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Navbar } from "@/components/layout/SiteNavbar";
import {
  ArrowRightIcon,
  BoxesIcon,
  CheckBadgeIcon,
  CheckIcon,
  ClockRotateLeftIcon,
  FactoryIcon,
  RecycleIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SproutIcon,
  TruckIcon,
} from "@/components/ui/Icons";
import { formatNumber, formatRupiah } from "@/lib/format";

interface EcosystemRole {
  role: string;
  title: string;
  description: string;
  benefits: readonly string[];
}

interface ValueItem {
  title: string;
  description: string;
  badge: string;
}

interface MetricItem {
  value: string;
  label: string;
  note: string;
}

const ROLES: readonly EcosystemRole[] = [
  {
    role: "Petani & Supplier",
    title: "Produsen Hulu",
    description: "Memasok mangga segar hasil panen kebun dan menyalurkan limbah organik tanpa perantara tengkulak.",
    benefits: ["Kepastian harga pasar", "Penjualan limbah jadi pendapatan tambahan", "Pencatatan hasil panen teratur"],
  },
  {
    role: "UMKM Olahan",
    title: "Pengolah Pangan",
    description: "Mendapatkan kepastian suplai mangga segar dengan grade yang konsisten untuk aneka produk olahan.",
    benefits: ["Bahan baku terverifikasi asal kebun", "Pilihan grade sesuai kebutuhan olahan", "Akses jaringan pasar terpadu"],
  },
  {
    role: "Mitra Sirkular",
    title: "Pengolah Limbah",
    description: "Mengumpulkan kulit, biji, daun, dan buah afkir secara berkala untuk diolah jadi pakan, kompos, atau pektin.",
    benefits: ["Pasokan limbah organik kontinu", "Penjemputan terjadwal berbasis lokasi", "Mendukung ekonomi hijau lokal"],
  },
  {
    role: "Konsumen & Grosir",
    title: "Pembeli Akhir",
    description: "Membeli mangga khas Indramayu dan aneka olahan UMKM langsung dari sumbernya dengan transparansi penuh.",
    benefits: ["Jaminan kesegaran dan keaslian", "Harga transparan tanpa perantara", "Pilihan grosir maupun ritel"],
  },
];

const VALUES: readonly ValueItem[] = [
  {
    title: "Keadilan Rantai Pasok",
    badge: "Fair Supply",
    description: "Memperpendek rantai niaga agar margin keuntungan terdistribusi adil kepada petani kebun dan perajin olahan.",
  },
  {
    title: "Ekonomi Sirkular Nyata",
    badge: "Zero Waste",
    description: "Tidak ada bagian mangga yang sia-sia; kulit, biji, dan buah afkir dialihkan dari tempat sampah menjadi bahan bernilai guna.",
  },
  {
    title: "Keterlacakan Asal (Traceability)",
    badge: "Transparan",
    description: "Setiap pasokan tercatat jelas dari kelompok tani, kecamatan asal di Indramayu, hingga tanggal panen.",
  },
  {
    title: "Ramah Aksesibilitas",
    badge: "Inklusif",
    description: "Dirancang sederhana dan kontras tinggi agar nyaman dipakai oleh petani senior dan perajin UMKM langsung di lapangan.",
  },
];

const METRICS: readonly MetricItem[] = [
  { value: "100%", label: "Keterlacakan Petani", note: "Terdata dari sentra kebun Indramayu" },
  { value: "0%", label: "Limbah Organik Terbuang", note: "Target sirkularitas rantai panen" },
  { value: "+30%", label: "Potensi Tambahan Nilai", note: "Dari komersialisasi limbah kebun" },
  { value: "4 Varietas", label: "Komoditas Unggulan", note: "Gedong Gincu, Arumanis, Golek, Manalagi" },
];

interface WasteTypeConfig {
  id: string;
  name: string;
  pricePerKg: number;
  productResult: string;
  yieldRatio: number;
  co2Factor: number;
  description: string;
}

const WASTE_TYPES: readonly WasteTypeConfig[] = [
  {
    id: "kulit",
    name: "Kulit Mangga",
    pricePerKg: 1000,
    productResult: "Pupuk Kompos & Ekstrak Pektin Alami",
    yieldRatio: 0.45,
    co2Factor: 0.82,
    description: "Kaya akan serat dan pektin alami, sangat ideal untuk bahan baku pakan maggot BSF dan pupuk organik padat.",
  },
  {
    id: "biji",
    name: "Biji Mangga (Pelok)",
    pricePerKg: 1500,
    productResult: "Tepung Pati Biji & Bibit Batang Bawah",
    yieldRatio: 0.35,
    co2Factor: 0.95,
    description: "Bagian embrio biji mengandung pati tinggi untuk industri bio-plastik dan perbanyakan okulasi bibit unggul.",
  },
  {
    id: "buah_afkir",
    name: "Buah Mangga Afkir",
    pricePerKg: 2000,
    productResult: "Cuka Mangga, Eco-Enzyme & Pupuk Cair",
    yieldRatio: 0.5,
    co2Factor: 1.15,
    description: "Buah cacat sortir yang masih segar difermentasi menjadi asam cuka organik dan cairan bio-fertilizer kaya nutrisi.",
  },
  {
    id: "daun",
    name: "Daun Pangkasan Ranting",
    pricePerKg: 500,
    productResult: "Kompos Daun & Mulsa Organik",
    yieldRatio: 0.3,
    co2Factor: 0.65,
    description: "Hasil pemangkasan berkala pohon mangga diolah menjadi mulsa penutup tanah untuk menjaga kelembapan kebun.",
  },
];

const PRESET_WEIGHTS = [25, 50, 100, 250, 500, 1000] as const;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC]";

export default function TentangKami(): JSX.Element {
  // State Kalkulator Nilai Sirkular
  const [calcWasteId, setCalcWasteId] = useState<string>("kulit");
  const [calcWeight, setCalcWeight] = useState<number>(100);

  const selectedWaste = WASTE_TYPES.find((w) => w.id === calcWasteId) ?? WASTE_TYPES[0];
  const estimasiNilaiRupiah = calcWeight * selectedWaste.pricePerKg;
  const estimasiHasilOlahan = Math.round(calcWeight * selectedWaste.yieldRatio);
  const estimasiReduksiKarbon = (calcWeight * selectedWaste.co2Factor).toFixed(1);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#273419]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="border-b border-gray-200 pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#95A87A] bg-[#95A87A]/20 px-3 py-1 text-xs font-semibold text-[#273419]">
            <SproutIcon className="h-4 w-4 text-[#3D5126]" />
            Inisiatif Sirkular Indramayu
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#273419] sm:text-3xl">
            Tentang SAMANGGA
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-gray-700">
            SAMANGGA adalah platform B2B dan ekonomi sirkular yang mengintegrasikan rantai pasok mangga Indramayu—dari
            perkebunan, UMKM pengolah makanan, hingga mitra pemanfaat limbah organik—dalam satu ekosistem yang adil,
            transparan, dan tanpa limbah terbuang (<em>zero-waste</em>).
          </p>
        </header>

        {/* Metrik Platform */}
        <section aria-label="Metrik platform" className="mt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {METRICS.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xl font-extrabold text-[#3D5126] sm:text-2xl">{item.value}</p>
                <p className="mt-1 text-sm font-bold text-[#273419]">{item.label}</p>
                <p className="mt-0.5 text-xs text-gray-500">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Latar Belakang & Solusi */}
        <section aria-labelledby="latar-belakang-title" className="mt-8">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div>
                <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-red-800">
                  Tantangan Lapangan
                </span>
                <h2 id="latar-belakang-title" className="mt-3 text-lg font-bold text-[#273419]">
                  Limbah Panen &amp; Rantai Pasar Terfragmentasi
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  Setiap musim panen raya di Kabupaten Indramayu, ribuan ton mangga mengalami fluktuasi harga drastis.
                  Diperkirakan 20–30% buah tergolong afkir atau menjadi limbah (kulit dan biji dari produksi UMKM) yang
                  hanya berakhir mencemari lingkungan dan menjadi beban tempat pembuangan.
                </p>
              </div>
              <p className="mt-4 text-xs font-medium text-gray-500">
                Kondisi ini merugikan petani dan membuat UMKM kesulitan menjaga stabilitas harga bahan baku.
              </p>
            </article>

            <article className="flex flex-col justify-between rounded-2xl border border-[#95A87A] bg-[#95A87A]/15 p-5 shadow-sm">
              <div>
                <span className="rounded border border-[#3D5126] bg-[#3D5126] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                  Solusi SAMANGGA
                </span>
                <h2 className="mt-3 text-lg font-bold text-[#273419]">
                  Pasar Sirkular &amp; Akses Pasok Terpadu
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  SAMANGGA menghubungkan hulu ke hilir: buah grade konsumsi disalurkan ke pasar dan UMKM secara langsung,
                  sedangkan mangga afkir, kulit, dan biji dicatat dalam <strong>Pasar Sirkular</strong> untuk diserap
                  mitra pengolah menjadi kompos bermutu, pakan maggot, pektin, maupun bibit pohon baru.
                </p>
              </div>
              <p className="mt-4 text-xs font-semibold text-[#3D5126]">
                Petani untung, UMKM berdaya, limbah kembali menjadi nilai rupiah.
              </p>
            </article>
          </div>
        </section>

        {/* Peran Ekosistem */}
        <section aria-labelledby="peran-ekosistem-title" className="mt-10">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3D5126]">Kolaborasi Ekosistem</span>
            <h2 id="peran-ekosistem-title" className="mt-1 text-xl font-bold tracking-tight text-[#273419]">
              Saling Terhubung dalam Satu Ekosistem
            </h2>
            <p className="mt-1 text-sm text-gray-700">
              Setiap pemangku kepentingan memiliki peran krusial dalam rantai nilai sirkular mangga.
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((role) => (
              <div
                key={role.role}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="border-b border-gray-100 pb-3">
                  <span className="rounded border border-gray-300 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-700">
                    {role.role}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-[#273419]">{role.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">{role.description}</p>
                </div>

                <div className="mt-3 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Manfaat Utama:</p>
                  <ul className="mt-1.5 space-y-1 text-xs text-gray-700">
                    {role.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-1.5">
                        <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3D5126]" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 1: #alur - Alur Rantai Pasok Hijau */}
        <section id="alur" className="scroll-mt-20 mt-12 border-t border-gray-200 pt-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#166534]/10 px-3 py-1 text-xs font-bold text-[#166534]">
              <RecycleIcon className="h-3.5 w-3.5" />
              Rantai Pasok Hijau
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-[#273419]">
              Alur Rantai Pasok Hijau &amp; Sirkularitas
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Model rantai nilai tertutup (<em>closed-loop circular supply chain</em>) memastikan seluruh bagian buah termanfaatkan optimal tanpa mencemari lingkungan.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-sm mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-[#273419]">Kebun Petani (Hulu)</h3>
              <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                Petani memanen mangga matang pohon. Buah disortir menjadi <strong>Grade A/B</strong> untuk konsumsi dan <strong>buah afkir</strong> yang langsung dicatat ke bursa limbah.
              </p>
              <div className="mt-3 rounded-lg bg-emerald-50/60 p-2 text-[11px] font-semibold text-emerald-800">
                🌱 Output: Buah Segar &amp; Afkir Panen
              </div>
            </div>

            <div className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 font-extrabold text-sm mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-[#273419]">Dapur UMKM (Midstream)</h3>
              <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                UMKM mengolah daging mangga menjadi puree, sirup, dodol, dan keripik. Kulit dan biji dipisahkan bersih dalam kurun waktu kurang dari 24 jam.
              </p>
              <div className="mt-3 rounded-lg bg-amber-50/60 p-2 text-[11px] font-semibold text-amber-800">
                🏭 Output: Olahan Pangan, Kulit &amp; Biji
              </div>
            </div>

            <div className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-extrabold text-sm mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-[#273419]">Mitra Bio-Refinery</h3>
              <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                Mitra penjemput mengambil limbah terdaftar. Di fasilitas bio-refinery, limbah diproses menjadi pupuk kompos, pakan ternak maggot, dan bibit pohon baru.
              </p>
              <div className="mt-3 rounded-lg bg-blue-50/60 p-2 text-[11px] font-semibold text-blue-800">
                🔄 Output: Pupuk Kompos &amp; Bibit Unggul
              </div>
            </div>

            <div className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 font-extrabold text-sm mb-3">
                4
              </span>
              <h3 className="text-sm font-bold text-[#273419]">Hilir &amp; Sirkular Balik</h3>
              <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                Konsumen membeli produk olahan. Petani membeli kembali pupuk kompos &amp; bibit dari mitra untuk menyuburkan lahan kebun—menutup siklus ekonomi sirkular.
              </p>
              <div className="mt-3 rounded-lg bg-purple-50/60 p-2 text-[11px] font-semibold text-purple-800">
                🌳 Siklus Tertutup: Tanah Subur &amp; Berkelanjutan
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: #standar - Standarisasi Mutu Komoditas */}
        <section id="standar" className="scroll-mt-20 mt-12 border-t border-gray-200 pt-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#166534]/10 px-3 py-1 text-xs font-bold text-[#166534]">
              <CheckBadgeIcon className="h-3.5 w-3.5" />
              Kualitas Terverifikasi
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-[#273419]">
              Standarisasi Mutu Komoditas &amp; Bahan Baku
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Seluruh komoditas yang diperdagangkan di platform SAMANGGA mematuhi standar kurasi mutu yang terstandarisasi.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-[#166534]">
                  <SproutIcon className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold text-[#273419]">Mangga Segar Konsumsi</h3>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-gray-600">
                <li className="flex items-start gap-1.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span><strong>Grade A (Super/Ekspor):</strong> Brix kemanisan &ge; 16, bobot 350–450 gram, kulit mulus bebas getah &amp; lalat buah.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span><strong>Grade B (Standar UMKM):</strong> Kematangan 80–90%, serat halus seragam, sangat cocok untuk puree dan dodol.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span><strong>Traceability:</strong> Tercatat nomor blok kebun, nama kelompok tani, dan tanggal panen.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                  <RecycleIcon className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold text-[#273419]">Limbah Sirkular Organik</h3>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-gray-600">
                <li className="flex items-start gap-1.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span><strong>Kulit Mangga Segar:</strong> Waktu penyimpanan &lt; 24 jam setelah pengupasan, higienis, terbebas dari plastik/karet.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span><strong>Biji Mangga Utuh:</strong> Bebas jamur busuk hitam, cangkang luar tidak pecah remuk, siap semai/ekstraksi.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span><strong>Buah Afkir:</strong> Tidak mengalami pembusukan bakteri anaerob, masih mempertahankan kadar gula alami.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
                  <FactoryIcon className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold text-[#273419]">Produk Olahan UMKM</h3>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-gray-600">
                <li className="flex items-start gap-1.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                  <span><strong>Legalitas Pangan:</strong> Memiliki nomor izin edar P-IRT atau sertifikat BPOM resmi.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                  <span><strong>Higienitas Kemasan:</strong> Dikemas menggunakan plastik vakum <em>food-grade</em> atau botol bersegel rapat.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                  <span><strong>Jaminan Keaslian:</strong> Menggunakan 100% daging mangga asli Indramayu tanpa pemanis buatan berlebih.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 3: #sirkular - Kalkulator Nilai Sirkular */}
        <section id="sirkular" className="scroll-mt-20 mt-12 border-t border-gray-200 pt-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFB81C]/25 px-3 py-1 text-xs font-bold text-[#273419]">
              🧮 Simulasi Nilai Tambah
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-[#273419]">
              Kalkulator Nilai Sirkular Limbah Mangga
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Hitung estimasi pendapatan tambahan, produksi pupuk/produk turunan, dan dampak pengurangan emisi karbon dari limbah mangga Anda.
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-[#95A87A]/40 bg-gradient-to-br from-white via-[#F8FAFC] to-[#95A87A]/10 p-6 shadow-sm sm:p-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Sisi Kiri: Input Formulir */}
              <div className="space-y-5 lg:col-span-7">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    1. Pilih Jenis Limbah Organik:
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {WASTE_TYPES.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setCalcWasteId(w.id)}
                        className={`rounded-xl border p-2.5 text-left transition-all ${
                          calcWasteId === w.id
                            ? "border-[#3D5126] bg-[#3D5126] text-white shadow-sm"
                            : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        <p className="text-xs font-bold">{w.name}</p>
                        <p className={`mt-0.5 text-[10px] ${calcWasteId === w.id ? "text-emerald-100" : "text-gray-500"}`}>
                          {formatRupiah(w.pricePerKg)}/Kg
                        </p>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500 italic">
                    {selectedWaste.description}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      2. Berat Limbah (Kg):
                    </label>
                    <span className="font-mono text-sm font-black text-[#3D5126]">
                      {formatNumber(calcWeight)} Kg
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="2000"
                    step="10"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Number(e.target.value))}
                    className="mt-2 w-full accent-[#3D5126]"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-gray-500 font-medium mr-1">Preset cepat:</span>
                    {PRESET_WEIGHTS.map((wt) => (
                      <button
                        key={wt}
                        type="button"
                        onClick={() => setCalcWeight(wt)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                          calcWeight === wt
                            ? "bg-[#3D5126] text-white"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {wt} Kg
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sisi Kanan: Hasil Kalkulasi */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#3D5126]/30 bg-white p-5 shadow-xs lg:col-span-5">
                <div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                    Hasil Simulasi Sirkular
                  </span>
                  <div className="mt-3 space-y-3.5">
                    <div>
                      <p className="text-[11px] text-gray-500 font-medium">Estimasi Nilai Rupiah Kompensasi:</p>
                      <p className="text-2xl font-black text-[#166534]">
                        {formatRupiah(estimasiNilaiRupiah)}
                      </p>
                    </div>

                    <div className="border-t border-gray-100 pt-2.5">
                      <p className="text-[11px] text-gray-500 font-medium">Potensi Output Olahan Sirkular:</p>
                      <p className="text-sm font-bold text-gray-900">
                        &plusmn; {formatNumber(estimasiHasilOlahan)} Kg
                      </p>
                      <p className="text-[10px] text-gray-500">{selectedWaste.productResult}</p>
                    </div>

                    <div className="border-t border-gray-100 pt-2.5">
                      <p className="text-[11px] text-gray-500 font-medium">Pengurangan Jejak Emisi Metana (CO₂e):</p>
                      <p className="text-sm font-bold text-emerald-700">
                        🌱 &plusmn; {estimasiReduksiKarbon} Kg CO₂e
                      </p>
                      <p className="text-[10px] text-gray-500">Mencegah pelepasan gas rumah kaca dari TPA</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-gray-100 pt-3">
                  <Link
                    href="/pasar-sirkular/setor"
                    className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[#3D5126] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#273419] transition-all"
                  >
                    <span>Salurkan Limbah ke Pasar Sirkular</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: #panduan - Panduan Sirkular */}
        <section id="panduan" className="scroll-mt-20 mt-12 border-t border-gray-200 pt-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#166534]/10 px-3 py-1 text-xs font-bold text-[#166534]">
              📖 Langkah Praktis
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-[#273419]">
              Panduan Sirkular bagi Pemula
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Panduan praktis berpartisipasi dalam ekosistem hijau SAMANGGA sesuai peran Anda.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <span className="rounded bg-[#3D5126]/10 px-2 py-0.5 text-[10px] font-bold text-[#3D5126] uppercase">
                Petani &amp; Pengepul
              </span>
              <h3 className="mt-2 text-sm font-bold text-gray-900">1. Salurkan Panen &amp; Beli Pupuk</h3>
              <ol className="mt-2.5 list-decimal list-inside space-y-1.5 text-xs text-gray-600 leading-relaxed">
                <li>Daftarkan luas kebun dan jenis varietas mangga.</li>
                <li>Pasang listing mangga segar Grade A/B dan buah afkir.</li>
                <li>Beli kembali pupuk kompos mitra untuk menekan biaya pupuk sintetis hingga 40%.</li>
              </ol>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <span className="rounded bg-[#3D5126]/10 px-2 py-0.5 text-[10px] font-bold text-[#3D5126] uppercase">
                Pelaku UMKM Olahan
              </span>
              <h3 className="mt-2 text-sm font-bold text-gray-900">2. Setor Limbah Kupasan</h3>
              <ol className="mt-2.5 list-decimal list-inside space-y-1.5 text-xs text-gray-600 leading-relaxed">
                <li>Pisahkan kulit dan biji secara higienis saat produksi olahan.</li>
                <li>Buka menu <strong>Setor Limbah UMKM</strong> dan masukkan berat serta foto limbah.</li>
                <li>Terima penjemputan mitra dan dapatkan pembayaran kompensasi langsung.</li>
              </ol>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <span className="rounded bg-[#3D5126]/10 px-2 py-0.5 text-[10px] font-bold text-[#3D5126] uppercase">
                Mitra Bio-Refinery
              </span>
              <h3 className="mt-2 text-sm font-bold text-gray-900">3. Penjemputan &amp; Pengolahan</h3>
              <ol className="mt-2.5 list-decimal list-inside space-y-1.5 text-xs text-gray-600 leading-relaxed">
                <li>Lakukan verifikasi akun mitra dengan mengunggah foto fasilitas/MoU.</li>
                <li>Pilih listing limbah di Pasar Sirkular dan jadwalkan armada jemput.</li>
                <li>Olah menjadi pupuk organik terverifikasi dan pasarkan kembali di katalog.</li>
              </ol>
            </div>
          </div>
        </section>

        {/* SECTION 5: #privasi - Kebijakan Privasi */}
        <section id="privasi" className="scroll-mt-20 mt-12 border-t border-gray-200 pt-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              🔒 Kepatuhan UU No. 27/2022 (UU PDP)
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-[#273419]">
              Kebijakan Privasi &amp; Perlindungan Data Pribadi
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 leading-relaxed">
              SAMANGGA berkomitmen melindungi seluruh data pribadi mitra petani, pelaku UMKM, mitra sirkular, dan konsumen sesuai hukum yang berlaku di Republik Indonesia.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4 text-xs text-gray-700 leading-relaxed">
            <div>
              <h3 className="text-sm font-bold text-gray-900">1. Data yang Kami Kumpulkan</h3>
              <p className="mt-1">
                Kami mengumpulkan informasi yang Anda berikan saat pendaftaran, meliputi: nama lengkap, alamat email, nomor WhatsApp/telepon, alamat usaha/kebun di Kabupaten Indramayu, serta berkas foto verifikasi izin usaha (khusus Mitra Pengolah Limbah).
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">2. Sensor Data Sensitif (Masking)</h3>
              <p className="mt-1">
                Demi mencegah kebocoran informasi dan spam, alamat email dan nomor kontak pengguna disensor secara otomatis (<em>masked</em>) pada antarmuka publik dan hanya dapat dibuka oleh Administrator terotorisasi dengan pencatatan audit log keamanan.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">3. Penggunaan Data Transaksi &amp; Logistik</h3>
              <p className="mt-1">
                Informasi alamat dan titik koordinat penjemputan limbah hanya dibagikan secara terbatas kepada Mitra Pengolah Limbah yang telah terverifikasi untuk kepentingan navigasi armada kurir penjemputan.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">4. Hak Pengguna &amp; Penghapusan Akun</h3>
              <p className="mt-1">
                Pengguna memiliki hak penuh untuk memperbarui profil, meminta salinan data, atau meminta penonaktifan dan penghapusan akun permanen melalui Pusat Layanan Pengguna SAMANGGA di <a href="mailto:halo@samangga.id" className="text-[#3D5126] font-bold underline">halo@samangga.id</a>.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 6: #syarat - Syarat & Ketentuan */}
        <section id="syarat" className="scroll-mt-20 mt-12 border-t border-gray-200 pt-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
              📋 Ketentuan Layanan
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-[#273419]">
              Syarat &amp; Ketentuan Layanan Platform
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Aturan main penggunaan ekosistem SAMANGGA guna menjamin transaksi yang aman, jujur, dan berkeadilan.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4 text-xs text-gray-700 leading-relaxed">
            <div>
              <h3 className="text-sm font-bold text-gray-900">1. Keanggotaan &amp; Integritas Akun</h3>
              <p className="mt-1">
                Setiap pengguna bertanggung jawab atas kebenaran data identitas yang didaftarkan. Satu entitas usaha hanya diperkenankan memiliki satu akun aktif per peran utama (`Supplier`, `UMKM`, `Mitra`, atau `Konsumen`).
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">2. Komitmen Mutu Komoditas</h3>
              <p className="mt-1">
                Penjual buah mangga dan penyedia limbah wajib menyediakan komoditas sesuai dengan foto dan spesifikasi yang dicantumkan. Pelanggaran mutu yang disengaja dapat dikenakan sanksi penurunan skor reputasi hingga penangguhan akun.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">3. Ketentuan Kompensasi Limbah Sirkular</h3>
              <p className="mt-1">
                Kompensasi penjemputan limbah (Jual Beli Tunai atau Barter Pupuk) wajib diselesaikan selambat-lambatnya 1x24 jam setelah timbang berat limbah di lokasi dan nomor resi diterbitkan.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 7: #keamanan - Keamanan Data ERD */}
        <section id="keamanan" className="scroll-mt-20 mt-12 border-t border-gray-200 pt-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
              🛡️ Integritas Arsitektur
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-[#273419]">
              Keamanan Data ERD &amp; Hak Akses Berbasis Peran
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Penerapan prinsip <em>Role-Based Access Control (RBAC)</em> pada 14 tabel database relasional ekosistem SAMANGGA.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <ShieldCheckIcon className="h-6 w-6 text-purple-700 mb-2" />
              <h3 className="text-sm font-bold text-gray-900">Isolasi Hak Akses (RBAC)</h3>
              <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                Setiap pengguna hanya dapat membaca dan memodifikasi data sesuai perannya (`ENUM`). Sesi guard mencegah akses tidak sah ke dashboard administratif.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <ClockRotateLeftIcon className="h-6 w-6 text-blue-700 mb-2" />
              <h3 className="text-sm font-bold text-gray-900">Audit Log Real-Time</h3>
              <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                Seluruh mutasi status verifikasi mitra, penerbitan invoice transaksi, dan penghapusan data tercatat permanen pada tabel Log Sistem beserta endpoint dan waktu audit.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <BoxesIcon className="h-6 w-6 text-emerald-700 mb-2" />
              <h3 className="text-sm font-bold text-gray-900">Integritas Relasi Transaksi</h3>
              <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                Tabel Transaksi, Detail Transaksi, dan Pembayaran terikat aturan integritas referensial ketat untuk mencegah selisih nilai finansial atau transaksi tanpa produk.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Bawah */}
        <section aria-labelledby="cta-title" className="mt-12 mb-12">
          <div className="flex flex-col items-center justify-between gap-4 rounded-3xl bg-[#3D5126] p-6 text-white shadow-md sm:flex-row sm:p-8">
            <div className="text-center sm:text-left">
              <h2 id="cta-title" className="text-xl font-bold sm:text-2xl">
                Bergabung dalam Gerakan Mangga Naik Kelas
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/90">
                Daftarkan kelompok tani, usaha olahan, atau fasilitas pengolahan limbah Anda untuk mulai bertransaksi di
                platform SAMANGGA.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href="/katalog"
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#273419] shadow-sm transition-colors hover:bg-[#E9EFE0] ${FOCUS_RING}`}
              >
                Lihat Katalog
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/pasar-sirkular"
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 ${FOCUS_RING}`}
              >
                Pasar Sirkular
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
