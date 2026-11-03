/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import type { ChangeEvent, JSX } from "react";
import { Navbar } from "@/components/layout/SiteNavbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeartIcon, MapPinIcon, SearchIcon } from "@/components/ui/Icons";
import { ImagePlaceholderIcon } from "@/components/ui/Illustrations";
import { CATEGORIES, PRODUCTS, type Product, type ProductCategory } from "@/data/katalog";
import { formatNumber, formatRupiah } from "@/lib/format";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC]";

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

function ProductCard({ product, isFavorite, onToggleFavorite }: ProductCardProps): JSX.Element {
  const { id, name, category, seller, location, stock, stockUnit, price, priceUnit, tags, description } = product;

  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-md hover:shadow-xl transition-all duration-300 ring-1 ring-black/5">
      {/* Area Gambar / Visual Produk Floating */}
      <div className="relative h-44 sm:h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#384A23] via-[#2D3B1C] to-[#1E2813] p-4">
            <ImagePlaceholderIcon category={category} />
          </div>
        )}

        {/* Tombol Favorit Melayang di Sudut Kanan Atas */}
        <button
          type="button"
          onClick={() => onToggleFavorite(id)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Hapus ${name} dari favorit` : `Simpan ${name} ke favorit`}
          className="absolute top-3.5 right-3.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/35 hover:bg-black/50 text-white backdrop-blur-md transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <HeartIcon filled={isFavorite} className="h-4 w-4" />
        </button>
      </div>

      {/* Badan Kartu Putih Melengkung Menumpuk */}
      <div className="relative -mt-4 flex flex-1 flex-col rounded-t-2xl sm:rounded-t-3xl bg-white p-4 sm:p-5 shadow-sm">
        {/* Judul Produk */}
        <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#273419] line-clamp-1">
          {name}
        </h3>

        {/* Info Penjual & Lokasi */}
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 truncate">
          <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-[#6E8053]" />
          <span className="truncate">
            Oleh <span className="font-semibold text-gray-700">{seller}</span> · {location}
          </span>
        </p>

        {/* Tags / Badges Berbingkai */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded border border-gray-300 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-700">
            Stok: {formatNumber(stock)} {stockUnit}
          </span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-gray-300 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Deskripsi Singkat */}
        <p className="mt-2.5 text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3 leading-relaxed">
          {description}
        </p>

        {/* Footer: Harga (Kiri) & Tombol Pesan (Kanan) */}
        <div className="mt-auto pt-4 flex items-end justify-between border-t border-gray-100 gap-2">
          <div className="min-w-0">
            <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Harga
            </span>
            <p className="text-base sm:text-lg font-extrabold text-[#273419] leading-tight">
              {formatRupiah(price)}
              <span className="text-[11px] sm:text-xs font-normal text-gray-500"> /{priceUnit}</span>
            </p>
          </div>

          <Link
            href={`/pesan?produk=${id}`}
            aria-label={`Pesan sekarang: ${name}`}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#3D5126] px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#273419] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126] focus-visible:ring-offset-2"
          >
            Pesan
          </Link>
        </div>
      </div>
    </li>
  );
}

export default function KatalogRantaiPasok(): JSX.Element {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("Mangga Segar");
  const [query, setQuery] = useState<string>("");
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(() => new Set());
  const searchId = useId();

  const toggleFavorite = (id: string): void =>
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const countByCategory = useMemo(() => {
    const counts: Record<ProductCategory, number> = {
      "Mangga Segar": 0,
      "Olahan Mangga": 0,
      "Bibit Pohon": 0,
    };
    for (const p of PRODUCTS) counts[p.category] += 1;
    return counts;
  }, []);

  const visibleProducts = useMemo<Product[]>(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        p.category === activeCategory &&
        (q === "" ||
          p.name.toLowerCase().includes(q) ||
          p.seller.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))),
    );
  }, [activeCategory, query]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>): void => setQuery(e.target.value);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#273419]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Header */}
        <header>
          <h1 className="text-xl font-bold tracking-tight text-[#273419]">Katalog Rantai Pasok</h1>
          <p className="mt-1 text-sm text-gray-700">
            Mangga segar, produk olahan, dan bibit pohon langsung dari petani dan UMKM Indramayu.
          </p>
        </header>

        {/* Pencarian */}
        <div role="search" className="mx-auto mt-4 max-w-xl">
          <label htmlFor={searchId} className="sr-only">
            Cari produk, penjual, atau lokasi
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6E8053]" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={handleSearch}
              placeholder="Cari produk, penjual, atau lokasi…"
              autoComplete="off"
              className="h-11 w-full rounded-full border border-[#95A87A] bg-white pl-10 pr-4 text-base text-[#273419] placeholder:text-gray-600 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
            />
          </div>
        </div>

        {/* Filter kategori */}
        <div role="group" aria-label="Kategori produk" className="mt-4 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors ${FOCUS_RING} ${
                  active
                    ? "border-[#3D5126] bg-[#3D5126] text-white"
                    : "border-[#95A87A] bg-transparent text-[#273419] hover:bg-[#95A87A]/25"
                }`}
              >
                {cat}
                <span className={`font-normal ${active ? "text-white" : "text-gray-700"}`}>({countByCategory[cat]})</span>
              </button>
            );
          })}
        </div>

        {/* Hasil */}
        <p role="status" aria-live="polite" className="mt-5 text-sm text-gray-700">
          Menampilkan <strong className="font-semibold text-[#273419]">{visibleProducts.length}</strong> produk di{" "}
          <strong className="font-semibold text-[#273419]">{activeCategory}</strong>
          {query.trim() !== "" ? <> untuk “{query.trim()}”</> : null}
        </p>

        {visibleProducts.length > 0 ? (
          <ul className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favorites.has(product.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </ul>
        ) : (
          <div className="mx-auto mt-3 max-w-md rounded-lg border border-dashed border-[#95A87A] bg-white p-6 text-center">
            <p className="text-base font-semibold text-[#273419]">Produk tidak ditemukan</p>
            <p className="mt-1 text-sm text-gray-700">Coba kata kunci lain atau pilih kategori yang berbeda.</p>
            {query !== "" ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className={`mt-3 inline-flex min-h-10 items-center rounded-full bg-[#3D5126] px-4 text-sm font-semibold text-white hover:bg-[#273419] ${FOCUS_RING}`}
              >
                Hapus pencarian
              </button>
            ) : null}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
