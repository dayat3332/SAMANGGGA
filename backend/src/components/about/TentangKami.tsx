"use client";

import Link from "next/link";
import type { JSX } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Navbar } from "@/components/layout/SiteNavbar";
import { ArrowRightIcon, CheckIcon, SproutIcon } from "@/components/ui/Icons";

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

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC]";

export default function TentangKami(): JSX.Element {
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
            transparan, dan tanpa limbah terbuang.
          </p>
        </header>

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

        <section aria-labelledby="latar-belakang-title" className="mt-8">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div>
                <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-red-800">
                  Tantangan Lapangan
                </span>
                <h2 id="latar-belakang-title" className="mt-3 text-lg font-bold text-[#273419]">
                  Limbah Panen & Rantai Pasar Terfragmentasi
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
                  Pasar Sirkular & Akses Pasok Terpadu
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  SAMANGGA menghubungkan hulu ke hilir: buah grade konsumsi disalurkan ke pasar dan UMKM secara langsung,
                  sedangkan mangga afkir, kulit, dan biji dicatat dalam <strong>Pasar Sirkular</strong> untuk diserap
                  mitra pengolah menjadi kompos bermutu, pakan maggot, pektin, maupun bahan bakar bio-pelet.
                </p>
              </div>
              <p className="mt-4 text-xs font-semibold text-[#3D5126]">
                Petani untung, UMKM berdaya, limbah kembali menjadi nilai rupiah.
              </p>
            </article>
          </div>
        </section>

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

        <section aria-labelledby="nilai-prinsip-title" className="mt-10 border-t border-gray-200 pt-8">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3D5126]">Prinsip Operasional</span>
            <h2 id="nilai-prinsip-title" className="mt-1 text-xl font-bold tracking-tight text-[#273419]">
              Nilai yang Kami Pegang Teguh
            </h2>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((val) => (
              <div key={val.title} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <span className="rounded border border-gray-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                  {val.badge}
                </span>
                <h3 className="mt-2.5 text-sm font-bold text-[#273419]">{val.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-600">{val.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="cta-title" className="mt-10 mb-12">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-[#3D5126] p-6 text-white shadow-md sm:flex-row sm:p-8">
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
                <ArrowRightIcon />
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
