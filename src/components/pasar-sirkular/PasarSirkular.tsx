/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import type { ChangeEvent, JSX } from "react";
import { Navbar } from "@/components/layout/SiteNavbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  CheckBadgeIcon,
  HeartIcon,
  MapPinIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/ui/Icons";
import { WasteIcon } from "@/components/ui/Illustrations";
import {
  CIRCULAR_STEPS,
  LISTINGS,
  WASTE_FILTERS,
  type FilterJenis,
  type WasteListing,
} from "@/data/pasar-sirkular";
import { formatNumber, formatRupiah } from "@/lib/format";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC]";

interface WasteCardProps {
  item: WasteListing;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

function WasteCard({ item, isFavorite, onToggleFavorite }: WasteCardProps): JSX.Element {
  const { id, jenis, owner, location, weightKg, estimatedPrice, condition, verification, status, usage } = item;
  const title = `Limbah ${jenis} Mangga`;
  const isBooked = status === "Dipesan";
  const isVerified = verification === "Terverifikasi";
  const pricePerKg = Math.round(estimatedPrice / weightKg);

  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-md hover:shadow-xl transition-all duration-300 ring-1 ring-black/5">
      {/* Area Gambar / Visual Limbah Floating */}
      <div className="relative h-44 sm:h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#384A23] via-[#2D3B1C] to-[#1E2813] p-4">
            <WasteIcon jenis={jenis} />
          </div>
        )}

        {/* Badge Status di Kiri Atas */}
        <span
          className={`absolute top-3.5 left-3.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
            isBooked ? "bg-gray-200/90 text-gray-800" : "bg-[#3D5126]/90 text-white"
          }`}
        >
          {status}
        </span>

        {/* Tombol Favorit Melayang di Kanan Atas */}
        <button
          type="button"
          onClick={() => onToggleFavorite(id)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Hapus ${title} dari favorit` : `Simpan ${title} ke favorit`}
          className="absolute top-3.5 right-3.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/35 hover:bg-black/50 text-white backdrop-blur-md transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <HeartIcon filled={isFavorite} className="h-4 w-4" />
        </button>
      </div>

      {/* Badan Kartu Putih Melengkung Menumpuk */}
      <div className="relative -mt-4 flex flex-1 flex-col rounded-t-2xl sm:rounded-t-3xl bg-white p-4 sm:p-5 shadow-sm">
        {/* Judul Limbah */}
        <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#273419] line-clamp-1">
          {title}
        </h3>

        {/* Info Pemilik & Lokasi */}
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 truncate">
          <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-[#6E8053]" />
          <span className="truncate">
            Oleh <span className="font-semibold text-gray-700">{owner}</span> · {location}
          </span>
        </p>

        {/* Tags / Badges Berbingkai */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded border border-gray-300 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-700">
            {formatNumber(weightKg)} kg
          </span>
          <span className="rounded border border-gray-300 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-700 truncate max-w-[140px]">
            {condition}
          </span>
          {isVerified && (
            <span className="inline-flex items-center gap-1 rounded border border-[#95A87A] bg-[#95A87A]/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#273419]">
              <CheckBadgeIcon className="h-3 w-3 text-[#3D5126]" />
              Terverifikasi
            </span>
          )}
        </div>

        {/* Deskripsi Potensi Pemanfaatan */}
        <p className="mt-2.5 text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3 leading-relaxed">
          <span className="font-semibold text-[#273419]">Potensi: </span>
          {usage}
        </p>

        {/* Footer: Harga Estimasi & Aksi */}
        <div className="mt-auto pt-4 flex items-end justify-between border-t border-gray-100 gap-2">
          <div className="min-w-0">
            <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Estimasi
            </span>
            <p className="text-base sm:text-lg font-extrabold text-[#273419] leading-tight">
              {formatRupiah(estimatedPrice)}
              <span className="text-[11px] sm:text-xs font-normal text-gray-500"> (±{formatRupiah(pricePerKg)}/kg)</span>
            </p>
          </div>

          {isBooked ? (
            <button
              type="button"
              disabled
              className="inline-flex shrink-0 cursor-not-allowed items-center justify-center rounded-xl bg-gray-200 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-500"
            >
              Dipesan
            </button>
          ) : (
            <Link
              href={`/pasar-sirkular/jemput?limbah=${id}`}
              aria-label={`Ajukan penjemputan: ${title} dari ${owner}`}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#3D5126] px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#273419] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126] focus-visible:ring-offset-2"
            >
              Jemput
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}

export default function PasarSirkular(): JSX.Element {
  const [activeFilter, setActiveFilter] = useState<FilterJenis>("Semua");
  const [query, setQuery] = useState<string>("");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<ReadonlySet<number>>(() => new Set());

  const toggleFavorite = (id: number): void => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const searchId = useId();
  const availableId = useId();

  const countByFilter = useMemo(() => {
    const counts: Record<FilterJenis, number> = { Semua: LISTINGS.length, Kulit: 0, Biji: 0, Daun: 0, "Buah Afkir": 0 };
    for (const l of LISTINGS) counts[l.jenis] += 1;
    return counts;
  }, []);

  const visible = useMemo<WasteListing[]>(() => {
    const q = query.trim().toLowerCase();
    return LISTINGS.filter(
      (l) =>
        (activeFilter === "Semua" || l.jenis === activeFilter) &&
        (!onlyAvailable || l.status === "Tersedia") &&
        (q === "" ||
          l.jenis.toLowerCase().includes(q) ||
          l.owner.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.usage.toLowerCase().includes(q)),
    );
  }, [activeFilter, onlyAvailable, query]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>): void => setQuery(e.target.value);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#273419]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#273419]">Pasar Sirkular</h1>
            <p className="mt-1 max-w-xl text-sm text-gray-700">
              Kulit, biji, daun, dan buah afkir mangga punya nilai. Temukan limbah dari petani dan UMKM Indramayu, lalu
              ajukan penjemputan untuk diolah.
            </p>
          </div>
          <Link
            href="/pasar-sirkular/setor"
            className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border-2 border-[#3D5126] bg-white px-4 text-sm font-semibold text-[#273419] transition-colors hover:bg-[#95A87A]/25 ${FOCUS_RING}`}
          >
            <PlusIcon />
            Setor Limbah Saya
          </Link>
        </header>

        {/* Alur singkat */}
        <ol className="mt-4 grid gap-2 sm:grid-cols-3">
          {CIRCULAR_STEPS.map((step, i) => (
            <li key={step.title} className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-3">
              <span
                aria-hidden="true"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3D5126] text-xs font-bold text-white"
              >
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-[#273419]">
                  <span className="sr-only">Langkah {i + 1}: </span>
                  {step.title}
                </p>
                <p className="text-sm text-gray-700">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Pencarian */}
        <div role="search" className="mx-auto mt-5 max-w-xl">
          <label htmlFor={searchId} className="sr-only">
            Cari jenis limbah, pemilik, lokasi, atau pemanfaatan
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6E8053]" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={handleSearch}
              placeholder="Cari limbah, pemilik, lokasi, atau kegunaan…"
              autoComplete="off"
              className="h-11 w-full rounded-full border border-[#95A87A] bg-white pl-10 pr-4 text-base text-[#273419] placeholder:text-gray-600 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
            />
          </div>
        </div>

        {/* Filter jenis limbah */}
        <div role="group" aria-label="Jenis limbah" className="mt-4 flex flex-wrap justify-center gap-2">
          {WASTE_FILTERS.map((f) => {
            const active = f === activeFilter;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveFilter(f)}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors ${FOCUS_RING} ${
                  active
                    ? "border-[#3D5126] bg-[#3D5126] text-white"
                    : "border-[#95A87A] bg-transparent text-[#273419] hover:bg-[#95A87A]/25"
                }`}
              >
                {f}
                <span className={`font-normal ${active ? "text-white" : "text-gray-700"}`}>({countByFilter[f]})</span>
              </button>
            );
          })}
        </div>

        {/* Ringkasan hasil + toggle tersedia */}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p role="status" aria-live="polite" className="text-sm text-gray-700">
            Menampilkan <strong className="font-semibold text-[#273419]">{visible.length}</strong> limbah
            {activeFilter !== "Semua" ? (
              <>
                {" "}
                jenis <strong className="font-semibold text-[#273419]">{activeFilter}</strong>
              </>
            ) : null}
            {query.trim() !== "" ? <> untuk “{query.trim()}”</> : null}
          </p>
          <label htmlFor={availableId} className="inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm font-medium text-[#273419]">
            <input
              id={availableId}
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="h-4 w-4 rounded border-[#95A87A] accent-[#3D5126]"
            />
            Hanya yang tersedia
          </label>
        </div>

        {visible.length > 0 ? (
          <ul className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((item) => (
              <WasteCard
                key={item.id}
                item={item}
                isFavorite={favorites.has(item.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </ul>
        ) : (
          <div className="mx-auto mt-3 max-w-md rounded-lg border border-dashed border-[#95A87A] bg-white p-6 text-center">
            <p className="text-base font-semibold text-[#273419]">Limbah tidak ditemukan</p>
            <p className="mt-1 text-sm text-gray-700">Coba kata kunci lain atau pilih jenis limbah yang berbeda.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveFilter("Semua");
                setOnlyAvailable(false);
              }}
              className={`mt-3 inline-flex min-h-10 items-center rounded-full bg-[#3D5126] px-4 text-sm font-semibold text-white hover:bg-[#273419] ${FOCUS_RING}`}
            >
              Reset filter
            </button>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
