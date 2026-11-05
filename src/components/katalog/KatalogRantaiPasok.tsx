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
  RecycleIcon,
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
import { type RoleSlug } from "@/data/profil";
import { addToCart, getCartItems, subscribeCart } from "@/lib/cart";
import {
  getAuthSnapshot,
  getServerAuthSnapshot,
  subscribeAuth,
} from "@/lib/auth";
import { formatNumber, formatRupiah } from "@/lib/format";

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  isLoggedIn: boolean;
  userRole: RoleSlug | null;
  onToggleFavorite: (id: string) => void;
  onOpenDetail: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}

function ProductCard({
  product,
  isFavorite,
  isLoggedIn,
  userRole,
  onToggleFavorite,
  onOpenDetail,
  onAddToCart,
}: ProductCardProps): JSX.Element {
  const { id, name, category, seller, location, stock, stockUnit, price, priceUnit, tags, description } = product;

  const isUmkm = userRole === "umkm";
  const isPetaniOrUmkm = userRole === "petani" || userRole === "umkm";
  const canOrder = isLoggedIn && (isPetaniOrUmkm || userRole === "konsumen" || userRole === "admin");

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
          <span>Lihat Spesifikasi &amp; Detail Komoditas</span>
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

          {isLoggedIn && (
            <div className="flex items-center gap-1.5">
              {isUmkm && (
                <Link
                  href="/pasar-sirkular/setor"
                  title="Setor Limbah Produksi ke Pasar Sirkular"
                  className="inline-flex shrink-0 items-center gap-1 justify-center rounded-xl border border-emerald-600 bg-emerald-50 px-2.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs active:scale-95"
                >
                  <RecycleIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Setor Limbah</span>
                </Link>
              )}

              {canOrder && (
                <button
                  type="button"
                  onClick={(e) => onAddToCart(product, e)}
                  aria-label={`Tambah ${name} ke keranjang`}
                  title="Tambah ke Keranjang"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-[#3D5126] hover:bg-[#95A87A]/15 hover:text-[#273419] transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126]"
                >
                  <BasketIcon className="h-4 w-4" />
                </button>
              )}

              {canOrder && (
                <Link
                  href={`/pesan?produk=${id}`}
                  aria-label={`Pesan sekarang: ${name}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#3D5126] px-3.5 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#273419] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126] focus-visible:ring-offset-2"
                >
                  Pesan
                </Link>
              )}
            </div>
          )}
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

  // Auth State
  const roleParam = searchParams.get("role") as RoleSlug | null;
  const userRole = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
  const effectiveRole = (roleParam && ["petani", "umkm", "mitra", "konsumen", "admin"].includes(roleParam)) ? roleParam : userRole;
  const isLoggedIn = Boolean(effectiveRole);
  const isUmkm = effectiveRole === "umkm";

  // State Modal Detail Spesifikasi
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

  // Esc listener untuk modal
  useEffect(() => {
    if (!selectedProduct) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setSelectedProduct(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedProduct]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const matchCat = p.category === activeCategory;
      const matchQ =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.seller.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [activeCategory, query]);

  const toggleFavorite = (id: string): void => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleQuickAddToCart = (product: Product, e: React.MouseEvent): void => {
    e.stopPropagation();
    addToCart(product, 1);
    setToastMessage(`✓ ${product.name} (1 ${product.priceUnit}) berhasil ditambahkan ke keranjang!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenDetail = (product: Product): void => {
    setSelectedProduct(product);
    setModalQuantity(1);
  };

  const handleAddFromModal = (): void => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, modalQuantity);
    setToastMessage(`✓ Berhasil menambahkan ${modalQuantity} ${selectedProduct.priceUnit} ${selectedProduct.name} ke keranjang!`);
    setSelectedProduct(null);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedSpecs = selectedProduct ? getProductSpecs(selectedProduct) : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#273419]">
      <Navbar />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#273419] px-4 py-3 text-xs sm:text-sm font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-3"
        >
          <span>{toastMessage}</span>
          <Link
            href="/keranjang"
            className="ml-2 rounded-lg bg-[#FFB81C] px-2.5 py-1 text-xs font-bold text-[#273419] hover:bg-[#ffc642]"
          >
            Lihat Keranjang
          </Link>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#166534]/10 px-3 py-1 text-xs font-bold text-[#166534]">
              <span>Rantai Pasok Mangga Indramayu Terverifikasi</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#273419]">
              Katalog Bahan Baku &amp; Produk Olahan
            </h1>
            <p className="mt-1 max-w-2xl text-xs sm:text-sm text-gray-600">
              Jelajahi mangga segar Grade A &amp; B langsung dari petani binaan, produk olahan UMKM, hingga bibit unggul siap tanam.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {isUmkm && (
              <Link
                href="/pasar-sirkular/setor"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#166534] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#273419] transition-all active:scale-95"
              >
                <RecycleIcon className="h-4 w-4" />
                <span>Setor Limbah UMKM</span>
              </Link>
            )}

            {isLoggedIn && (
              <Link
                href="/keranjang"
                aria-label={`Keranjang belanja: ${cartTotalItems} barang`}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#273419] shadow-xs hover:border-[#3D5126] hover:bg-[#95A87A]/10 transition-all active:scale-95"
              >
                <BasketIcon className="h-4 w-4 text-[#3D5126]" />
                <span>Keranjang Belanja</span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FFB81C] px-1.5 text-[11px] font-black text-[#273419]">
                  {cartTotalItems}
                </span>
              </Link>
            )}
          </div>
        </header>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="tablist"
            aria-label="Kategori Produk"
            className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
          >
            {CATEGORIES.map((cat) => {
              const active = cat === activeCategory;
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex shrink-0 items-center justify-center rounded-full px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
                    active
                      ? "bg-[#3D5126] text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div role="search" className="relative w-full sm:w-72">
            <label htmlFor={searchId} className="sr-only">
              Cari produk atau nama penjual
            </label>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              placeholder="Cari varietas, petani..."
              className="h-10 w-full rounded-2xl border border-gray-200 bg-white pl-9 pr-3 text-xs sm:text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]/20"
            />
          </div>
        </div>

        <section aria-label="Daftar Produk Mangga" className="mt-6">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white py-14 text-center">
              <span className="text-3xl">🥭</span>
              <p className="mt-2 text-sm font-bold text-gray-700">Tidak ada produk yang cocok</p>
              <p className="text-xs text-gray-500">Coba ubah kata kunci pencarian atau ganti kategori di atas.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isFavorite={favorites.has(p.id)}
                  isLoggedIn={isLoggedIn}
                  userRole={effectiveRole}
                  onToggleFavorite={toggleFavorite}
                  onOpenDetail={handleOpenDetail}
                  onAddToCart={handleQuickAddToCart}
                />
              ))}
            </ul>
          )}
        </section>
      </main>

      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-product-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
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

              {isLoggedIn && (
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
              )}
            </div>

            <div className="border-t border-gray-100 bg-white p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3">
              {isLoggedIn ? (
                <>
                  {isUmkm && (
                    <Link
                      href="/pasar-sirkular/setor"
                      className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-emerald-600 bg-emerald-50 px-4 text-xs sm:text-sm font-bold text-emerald-800 hover:bg-emerald-600 hover:text-white active:scale-95 transition-all"
                    >
                      <RecycleIcon className="h-4 w-4" />
                      <span>Setor Limbah UMKM</span>
                    </Link>
                  )}

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
                </>
              ) : (
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Tertarik memesan mangga ini?{" "}
                    <Link href="/login" className="font-bold text-[#166534] underline hover:text-[#273419]">
                      Masuk ke Akun
                    </Link>{" "}
                    atau{" "}
                    <Link href="/daftar" className="font-bold text-[#166534] underline hover:text-[#273419]">
                      Daftar Mitra
                    </Link>{" "}
                    untuk memesan langsung.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="w-full sm:w-auto shrink-0 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    Tutup
                  </button>
                </div>
              )}
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
