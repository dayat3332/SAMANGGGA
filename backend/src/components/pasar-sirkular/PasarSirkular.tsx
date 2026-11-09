"use client";

import Link from "next/link";
import { useId, useMemo, useState, useSyncExternalStore } from "react";
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
import { type RoleSlug } from "@/data/profil";
import {
  getAuthSnapshot,
  getServerAuthSnapshot,
  subscribeAuth,
} from "@/lib/auth";
import { formatNumber, formatRupiah } from "@/lib/format";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC]";

interface WasteCardProps {
  item: WasteListing;
  isFavorite: boolean;
  isLoggedIn: boolean;
  userRole: RoleSlug | null;
  onToggleFavorite: (id: number) => void;
}

function WasteCard({
  item,
  isFavorite,
  isLoggedIn,
  userRole,
  onToggleFavorite,
}: WasteCardProps): JSX.Element {
  const { id, jenis, owner, location, weightKg, estimatedPrice, condition, verification, status, usage } = item;
  const title = `Limbah ${jenis} Mangga`;
  const isBooked = status === "Dipesan";
  const isVerified = verification === "Terverifikasi";
  const pricePerKg = Math.round(estimatedPrice / weightKg);

  const canPickUp = isLoggedIn && (userRole === "mitra" || userRole === "admin");

  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-md hover:shadow-xl transition-all duration-300 ring-1 ring-black/5">
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

        {isLoggedIn && (
          <span
            className={`absolute top-3.5 left-3.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
              isBooked ? "bg-gray-200/90 text-gray-800" : "bg-[#3D5126]/90 text-white"
            }`}
          >
            {status}
          </span>
        )}

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

      <div className="relative -mt-4 flex flex-1 flex-col rounded-t-2xl sm:rounded-t-3xl bg-white p-4 sm:p-5 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#273419] line-clamp-1">
          {title}
        </h3>

        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 truncate">
          <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-[#6E8053]" />
          <span className="truncate">
            Oleh <span className="font-semibold text-gray-700">{owner}</span> · {location}
          </span>
        </p>

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

        <p className="mt-2.5 text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3 leading-relaxed">
          <span className="font-semibold text-[#273419]">Potensi: </span>
          {usage}
        </p>

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

          {isLoggedIn && canPickUp && (
            isBooked ? (
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
            )
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

  // Auth State
  const userRole = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
  const isLoggedIn = Boolean(userRole);
  const canSetorLimbah = isLoggedIn && (userRole === "umkm" || userRole === "petani" || userRole === "admin");

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
        (!(isLoggedIn && onlyAvailable) || l.status === "Tersedia") &&
        (q === "" ||
          l.jenis.toLowerCase().includes(q) ||
          l.owner.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.usage.toLowerCase().includes(q)),
    );
  }, [activeFilter, onlyAvailable, query, isLoggedIn]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>): void => setQuery(e.target.value);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#273419]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#273419]">
              Pasar Sirkular Mangga Indramayu
            </h1>
            <p className="mt-1 max-w-xl text-xs sm:text-sm text-gray-700">
              Kulit, biji, daun, dan buah afkir mangga punya nilai ekonomi. Temukan limbah dari petani dan UMKM Indramayu, lalu
              ajukan penjemputan untuk diolah menjadi pakan ternak, pupuk, atau ekstrak pektin.
            </p>
          </div>

          {canSetorLimbah && (
            <Link
              href="/pasar-sirkular/setor"
              className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border-2 border-[#3D5126] bg-white px-4 text-xs sm:text-sm font-semibold text-[#273419] transition-colors hover:bg-[#95A87A]/25 ${FOCUS_RING}`}
            >
              <PlusIcon />
              Setor Limbah Saya
            </Link>
          )}
        </header>

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
                <p className="text-xs sm:text-sm text-gray-700">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div role="search" className="mx-auto mt-5 max-w-xl">
          <label htmlFor={searchId} className="sr-only">
            Cari jenis limbah, pemilik, lokasi, atau pemanfaatan
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={handleSearch}
              placeholder="Cari jenis limbah, pemilik, lokasi, atau pemanfaatan..."
              className={`h-11 w-full rounded-full border border-gray-300 bg-white pl-9 pr-3 text-xs sm:text-sm text-[#273419] placeholder:text-gray-500 ${FOCUS_RING}`}
            />
          </div>
        </div>

        <nav aria-label="Filter jenis limbah" className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          {WASTE_FILTERS.map((f) => {
            const count = countByFilter[f];
            const active = activeFilter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                aria-pressed={active}
                className={`inline-flex min-h-8 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active ? "bg-[#3D5126] text-white" : "border border-gray-300 bg-white text-[#273419] hover:bg-gray-100"
                } ${FOCUS_RING}`}
              >
                <span>{f}</span>
                <span className={`text-[10px] ${active ? "text-emerald-100" : "text-gray-500"}`}>({count})</span>
              </button>
            );
          })}
        </nav>

        {isLoggedIn && (
          <div className="mt-2 flex items-center justify-center">
            <label htmlFor={availableId} className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
              <input
                id={availableId}
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-[#3D5126]"
              />
              Hanya tampilkan yang masih tersedia
            </label>
          </div>
        )}

        <section aria-label="Daftar limbah mangga" className="mt-6">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center">
              <span className="text-3xl">♻️</span>
              <p className="mt-2 text-sm font-semibold text-gray-700">Tidak ada limbah yang cocok</p>
              <p className="text-xs text-gray-500">Coba ubah kata kunci pencarian atau pilih filter lain.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((item) => (
                <WasteCard
                  key={item.id}
                  item={item}
                  isFavorite={favorites.has(item.id)}
                  isLoggedIn={isLoggedIn}
                  userRole={userRole}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </ul>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
