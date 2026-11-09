"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import type { ChangeEvent, JSX } from "react";
import { Navbar } from "@/components/layout/SiteNavbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  ArrowRightIcon,
  BasketIcon,
  CheckBadgeIcon,
  HeartIcon,
  MapPinIcon,
  SearchIcon,
  TruckIcon,
} from "@/components/ui/Icons";
import { ImagePlaceholderIcon } from "@/components/ui/Illustrations";
import {
  CATEGORIES,
  PRODUCTS,
  getProductSpecs,
  type Product,
  type ProductCategory,
} from "@/data/katalog";
import { addToCart, getCartItems, subscribeCart } from "@/lib/cart";
import { formatNumber, formatRupiah } from "@/lib/format";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC]";

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenDetail: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}

function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onOpenDetail,
  onAddToCart,
}: ProductCardProps): JSX.Element {
  const { id, name, category, seller, location, stock, stockUnit, price, priceUnit, tags, description } = product;

  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-md hover:shadow-xl transition-all duration-300 ring-1 ring-black/5">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpenDetail(product)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenDetail(product);
          }
        }}
        className="relative h-44 sm:h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
        aria-label={`Lihat detail spesifikasi ${name}`}
      >
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

        <span className="absolute top-3 left-3 rounded-full bg-black/45 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
          {category}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(id);
          }}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Hapus ${name} dari favorit` : `Simpan ${name} ke favorit`}
          className="absolute top-3 right-3 inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <HeartIcon filled={isFavorite} className="h-4 w-4" />
        </button>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[11px] font-medium text-white/95">
            🔍 Klik untuk lihat spesifikasi lengkap
          </span>
        </div>
      </div>

      <div className="relative -mt-4 flex flex-1 flex-col rounded-t-2xl sm:rounded-t-3xl bg-white p-4 sm:p-5 shadow-sm">
        <h3
          role="button"
          tabIndex={0}
          onClick={() => onOpenDetail(product)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenDetail(product);
            }
          }}
          className="text-base sm:text-lg font-bold tracking-tight text-[#273419] line-clamp-1 hover:text-[#3D5126] cursor-pointer transition-colors"
        >
          {name}
        </h3>

        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 truncate">
          <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-[#6E8053]" />
          <span className="truncate">
            Oleh <span className="font-semibold text-gray-700">{seller}</span> · {location}
          </span>
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-700">
            Stok: {formatNumber(stock)} {stockUnit}
          </span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#166534]"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-2.5 text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {description}
        </p>

        <button
          type="button"
          onClick={() => onOpenDetail(product)}
          className="mt-3 flex items-center justify-between rounded-xl bg-[#F8FAFC] border border-gray-200 px-3 py-1.5 text-xs font-semibold text-[#3D5126] hover:bg-[#95A87A]/15 hover:border-[#3D5126]/30 transition-all text-left"
        >
          <span>Lihat Spesifikasi &amp; Detail Pesan</span>
          <ArrowRightIcon className="h-3 w-3 text-[#3D5126]" />
        </button>

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

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => onAddToCart(product, e)}
              aria-label={`Tambah ${name} ke keranjang`}
              title="Tambah ke Keranjang"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-[#3D5126] hover:bg-[#95A87A]/15 hover:text-[#273419] transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126]"
            >
              <BasketIcon className="h-4 w-4" />
            </button>

            <Link
              href={`/pesan?produk=${id}`}
              aria-label={`Pesan sekarang: ${name}`}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#3D5126] px-3.5 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#273419] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126] focus-visible:ring-offset-2"
            >
              Pesan
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

function getCartSnapshot(): number {
  return getCartItems().reduce((acc, it) => acc + it.quantity, 0);
}
function getServerCartSnapshot(): number {
  return 0;
}

function KatalogRantaiPasokContent(): JSX.Element {
  const searchParams = useSearchParams();
  const detailParam = searchParams.get("detail");

  const [activeCategory, setActiveCategory] = useState<ProductCategory>("Mangga Segar");
  const [query, setQuery] = useState<string>("");
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(() => new Set());
  const searchId = useId();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    if (!detailParam) return null;
    return PRODUCTS.find((p) => p.id === detailParam) ?? null;
  });
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const cartTotalItems = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );

  useEffect(() => {
    if (!selectedProduct) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setSelectedProduct(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedProduct]);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const toggleFavorite = (id: string): void =>
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleOpenDetail = (product: Product): void => {
    setSelectedProduct(product);
    setModalQuantity(1);
  };

  const handleAddToCart = (product: Product, e?: React.MouseEvent): void => {
    if (e) e.stopPropagation();
    addToCart(product, 1);
    setToastMessage(`✓ ${product.name} (1 ${product.priceUnit}) berhasil ditambahkan ke keranjang!`);
  };

  const handleAddFromModal = (): void => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, modalQuantity);
    setToastMessage(
      `✓ ${selectedProduct.name} (${modalQuantity} ${selectedProduct.priceUnit}) berhasil ditambahkan ke keranjang!`,
    );
    setSelectedProduct(null);
  };

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

  const selectedSpecs = selectedProduct ? getProductSpecs(selectedProduct) : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#273419]">
      <Navbar />

      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#273419] px-5 py-3.5 text-sm font-semibold text-white shadow-2xl transition-all border border-[#95A87A]/40 animate-in fade-in slide-in-from-bottom-4"
        >
          <BasketIcon className="h-5 w-5 text-[#FFB81C]" />
          <span>{toastMessage}</span>
          <Link
            href="/keranjang"
            className="ml-2 rounded-lg bg-[#FFB81C] px-2.5 py-1 text-xs font-bold text-[#273419] hover:bg-yellow-400"
          >
            Lihat Keranjang &rarr;
          </Link>
        </aside>
      )}

      {cartTotalItems > 0 && !selectedProduct && (
        <div className="fixed bottom-6 left-6 z-40">
          <Link
            href="/keranjang"
            aria-label={`Keranjang Belanja: ${cartTotalItems} item`}
            className="group flex items-center gap-3 rounded-full bg-[#3D5126] px-4 py-3 text-white shadow-xl hover:bg-[#273419] transition-all hover:scale-105 active:scale-95 border-2 border-white"
          >
            <div className="relative">
              <BasketIcon className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFB81C] text-[11px] font-extrabold text-[#273419]">
                {cartTotalItems}
              </span>
            </div>
            <span className="hidden sm:inline text-xs font-bold tracking-wide">
              Keranjang ({cartTotalItems})
            </span>
          </Link>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <header>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#273419]">
            Katalog Rantai Pasok Mangga
          </h1>
          <p className="mt-1 text-sm text-gray-700">
            Mangga segar, produk olahan, dan bibit pohon langsung dari petani dan UMKM Indramayu.
          </p>
        </header>

        <div role="search" className="mx-auto mt-4 max-w-xl">
          <label htmlFor={searchId} className="sr-only">
            Cari produk, penjual, atau lokasi
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6E8053]" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={handleSearch}
              placeholder="Cari produk, penjual, varietas, atau lokasi…"
              autoComplete="off"
              className="h-11 w-full rounded-full border border-[#95A87A] bg-white pl-10 pr-4 text-base text-[#273419] placeholder:text-gray-500 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
            />
          </div>
        </div>

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
                    : "border-[#95A87A] bg-white text-[#273419] hover:bg-[#95A87A]/25"
                }`}
              >
                {cat}
                <span className={`font-normal ${active ? "text-white" : "text-gray-600"}`}>({countByCategory[cat]})</span>
              </button>
            );
          })}
        </div>

        <p role="status" aria-live="polite" className="mt-5 text-sm text-gray-700">
          Menampilkan <strong className="font-semibold text-[#273419]">{visibleProducts.length}</strong> produk di{" "}
          <strong className="font-semibold text-[#273419]">{activeCategory}</strong>
          {query.trim() !== "" ? <> untuk “{query.trim()}”</> : null}
        </p>

        {visibleProducts.length > 0 ? (
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favorites.has(product.id)}
                onToggleFavorite={toggleFavorite}
                onOpenDetail={handleOpenDetail}
                onAddToCart={handleAddToCart}
              />
            ))}
          </ul>
        ) : (
          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-dashed border-[#95A87A] bg-white p-6 text-center">
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

      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-product-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative flex flex-col max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              aria-label="Tutup jendela spesifikasi"
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-md transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              ✕
            </button>

            <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="relative h-44 w-full sm:h-48 sm:w-48 shrink-0 overflow-hidden rounded-2xl bg-gray-100 border border-gray-200">
                  {selectedProduct.image ? (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#384A23] via-[#2D3B1C] to-[#1E2813]">
                      <ImagePlaceholderIcon category={selectedProduct.category} />
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">
                    {selectedProduct.category}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      Tersedia: {formatNumber(selectedProduct.stock)} {selectedProduct.stockUnit}
                    </span>
                    {selectedProduct.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-[#95A87A]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#273419]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <h2 id="modal-product-title" className="mt-2 text-xl sm:text-2xl font-extrabold text-[#273419]">
                    {selectedProduct.name}
                  </h2>

                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <MapPinIcon className="h-3.5 w-3.5 text-[#6E8053]" />
                    <span>
                      {selectedProduct.seller} · <strong className="text-gray-700">{selectedProduct.location}</strong>
                    </span>
                  </p>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-[#273419]">
                      {formatRupiah(selectedProduct.price)}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                      /{selectedProduct.priceUnit}
                    </span>
                  </div>

                  <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <CheckBadgeIcon className="h-4 w-4 text-[#3D5126]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#273419]">
                    Spesifikasi &amp; Standar Mutu Komoditas
                  </h3>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedSpecs.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col justify-center rounded-xl border border-gray-100 bg-[#F8FAFC] p-2.5 hover:border-[#95A87A]/50 transition-colors"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {item.label}
                      </span>
                      <span className="mt-0.5 text-xs font-semibold text-gray-800">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 p-3 text-xs text-amber-900">
                <TruckIcon className="h-5 w-5 shrink-0 text-amber-700" />
                <p>
                  <strong className="font-bold">Jaminan Segar Dari Petani:</strong> Buah dipetik langsung dari kebun binaan Indramayu pada saat kematangan optimal dan dikemas dengan standar perlindungan khusus.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-gray-50 p-3.5 border border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-700">Jumlah Pesanan:</span>
                  <div className="inline-flex items-center rounded-xl border border-gray-300 bg-white shadow-xs">
                    <button
                      type="button"
                      disabled={modalQuantity <= 1}
                      onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Kurangi kuantitas"
                      className="flex h-8 w-8 items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-l-xl"
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-sm font-extrabold text-[#273419]">
                      {modalQuantity}
                    </span>
                    <button
                      type="button"
                      disabled={modalQuantity >= selectedProduct.stock}
                      onClick={() => setModalQuantity((q) => Math.min(selectedProduct.stock, q + 1))}
                      aria-label="Tambah kuantitas"
                      className="flex h-8 w-8 items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-r-xl"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">
                    {selectedProduct.priceUnit}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Subtotal Produk
                  </span>
                  <span className="text-lg font-black text-[#273419]">
                    {formatRupiah(selectedProduct.price * modalQuantity)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 bg-white p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleAddFromModal}
                className="w-full sm:flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-[#3D5126] bg-white px-5 text-sm font-bold text-[#3D5126] hover:bg-[#95A87A]/15 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126]"
              >
                <BasketIcon className="h-4 w-4" />
                <span>Tambah ke Keranjang</span>
              </button>

              <Link
                href={`/pesan?produk=${selectedProduct.id}&qty=${modalQuantity}`}
                className="w-full sm:flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#3D5126] px-5 text-sm font-bold text-white shadow-md hover:bg-[#273419] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126]"
              >
                <span>Pesan Sekarang</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}

export default function KatalogRantaiPasok(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] text-[#273419] flex items-center justify-center">
          <p className="text-sm font-bold text-gray-500">Memuat Katalog Rantai Pasok SAMANGGA...</p>
        </div>
      }
    >
      <KatalogRantaiPasokContent />
    </Suspense>
  );
}
