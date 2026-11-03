/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, JSX } from "react";
import { Navbar } from "@/components/layout/SiteNavbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  CreditCardIcon,
  MapPinIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@/components/ui/Icons";
import { ImagePlaceholderIcon } from "@/components/ui/Illustrations";
import { COURIER_OPTIONS, PAYMENT_OPTIONS, PRODUCTS, type Product } from "@/data/katalog";
import { formatNumber, formatRupiah } from "@/lib/format";
import type {
  KategoriKonsumen,
  MetodePembayaran,
  StatusPembayaran,
  StatusTransaksi,
} from "@/types/samangga";

/** Alias pemetaan ID numeric atau alternatif ke ID katalog resmi */
const PRODUCT_ID_ALIAS_MAP: Record<string, string> = {
  "1001": "ms-01",
  "1002": "ms-02",
  "1003": "ms-05",
  "1004": "ms-03",
  "1005": "ms-04",
  "2001": "om-01",
  "2002": "om-04",
  "2003": "om-03",
  "2004": "om-02",
  "3001": "om-05",
  "3002": "bp-01",
  "3003": "bp-02",
  "3004": "bp-03",
};

function resolveProductId(param: string | null): string {
  if (!param) return PRODUCTS[0].id;
  const trimmed = param.trim().toLowerCase();
  const direct = PRODUCTS.find((p) => p.id.toLowerCase() === trimmed);
  if (direct) return direct.id;

  const aliased = PRODUCT_ID_ALIAS_MAP[param.trim()];
  if (aliased) {
    const matched = PRODUCTS.find((p) => p.id === aliased);
    if (matched) return matched.id;
  }

  const byName = PRODUCTS.find(
    (p) =>
      p.name.toLowerCase().includes(trimmed) ||
      p.category.toLowerCase().includes(trimmed),
  );
  if (byName) return byName.id;

  return PRODUCTS[0].id;
}

function PesanSekarangContent(): JSX.Element {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("produk") ?? searchParams.get("id");

  const [prevQuery, setPrevQuery] = useState<string | null>(queryParam);
  const [selectedProductId, setSelectedProductId] = useState<string>(() =>
    resolveProductId(queryParam),
  );

  // Sesuaikan state secara sinkron saat URL query berubah tanpa cascading effect
  if (queryParam !== prevQuery) {
    setPrevQuery(queryParam);
    setSelectedProductId(resolveProductId(queryParam));
  }

  const product: Product = useMemo(
    () => PRODUCTS.find((p) => p.id === selectedProductId) ?? PRODUCTS[0],
    [selectedProductId],
  );

  // Step state: 1 = Form Pesanan, 2 = Instruksi Pembayaran, 3 = Pelacakan & Resi
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // DetailTransaksi & Konsumen state
  const [quantity, setQuantity] = useState<number>(1);
  const [kategoriKonsumen, setKategoriKonsumen] = useState<KategoriKonsumen>("Individu");
  const [namaPenerima, setNamaPenerima] = useState<string>("");
  const [noTelp, setNoTelp] = useState<string>("");
  const [alamatPengiriman, setAlamatPengiriman] = useState<string>("");
  const [catatanPenjual, setCatatanPenjual] = useState<string>("");
  const [selectedCourierId, setSelectedCourierId] = useState<string>(COURIER_OPTIONS[0].id);
  const [metodePembayaran, setMetodePembayaran] = useState<MetodePembayaran>("QRIS");
  const [buktiTransferName, setBuktiTransferName] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Status transaksi & pembayaran saat pesanan dibuat
  const [statusTransaksi, setStatusTransaksi] = useState<StatusTransaksi>("Pending");
  const [statusPembayaran, setStatusPembayaran] = useState<StatusPembayaran>("Menunggu");

  const handleProductChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const nextId = e.target.value;
    setSelectedProductId(nextId);
    const nextProd = PRODUCTS.find((p) => p.id === nextId) ?? PRODUCTS[0];
    setQuantity((prev) => Math.min(Math.max(1, prev), nextProd.stock));
  };

  const selectedCourier = useMemo(
    () => COURIER_OPTIONS.find((c) => c.id === selectedCourierId) ?? COURIER_OPTIONS[0],
    [selectedCourierId],
  );

  const selectedPayment = useMemo(
    () => PAYMENT_OPTIONS.find((p) => p.method === metodePembayaran) ?? PAYMENT_OPTIONS[0],
    [metodePembayaran],
  );

  const subtotal = product.price * quantity;
  const ongkir = selectedCourier.cost;
  const totalHarga = subtotal + ongkir;

  const idTransaksi = useMemo(
    () => `TRX-SMG-${product.id.toUpperCase().replace("-", "")}-2026`,
    [product.id],
  );

  const handleQuantityChange = (next: number): void => {
    if (Number.isNaN(next)) return;
    const clamped = Math.max(1, Math.min(product.stock, Math.floor(next)));
    setQuantity(clamped);
  };

  const handleCreateOrder = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setStatusTransaksi("Pending");
    setStatusPembayaran("Menunggu");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmPayment = (): void => {
    if (metodePembayaran === "Transfer Manual" && !buktiTransferName) {
      setBuktiTransferName("bukti-transfer-samangga.jpg");
    }
    setStatusPembayaran("Berhasil");
    setStatusTransaksi("Diproses");
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopyCode = (text: string): void => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#273419]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Navigasi Balik & Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/katalog"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3D5126] hover:text-[#273419]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Kembali ke Katalog Bahan Baku
            </Link>
            <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#273419] sm:text-3xl">
              Pesan Komoditas Rantai Pasok
            </h1>
            <p className="mt-1 text-sm text-gray-700">
              Transaksi transparan langsung ke kelompok tani dan UMKM Indramayu dengan jaminan Rekening Bersama.
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#95A87A] bg-white px-3 py-1 text-xs font-semibold text-[#273419]">
              ID: <strong className="font-bold">#{idTransaksi}</strong>
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                statusTransaksi === "Selesai"
                  ? "bg-green-700 text-white"
                  : statusTransaksi === "Diproses"
                    ? "bg-[#3D5126] text-white"
                    : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}
            >
              Transaksi: {statusTransaksi}
            </span>
          </div>
        </div>

        {/* Stepper Alur Pemesanan */}
        <ol aria-label="Tahapan pemesanan" className="mb-8 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {[
            {
              num: 1,
              title: "1. Detail Pesanan & Pengiriman",
              desc: "Atur jumlah, alamat tujuan, & kurir logistik",
            },
            {
              num: 2,
              title: "2. Pembayaran Aman",
              desc: "QRIS, Virtual Account, atau Transfer Manual",
            },
            {
              num: 3,
              title: "3. Konfirmasi Pesanan",
              desc: "Bukti pemesanan & detail pengiriman ke penjual",
            },
          ].map((item) => {
            const isActive = step === item.num;
            const isDone = step > item.num;
            return (
              <li
                key={item.num}
                className={`flex items-start gap-3 rounded-xl border p-3.5 transition-all ${
                  isActive
                    ? "border-2 border-[#3D5126] bg-white shadow-sm"
                    : isDone
                      ? "border-[#95A87A] bg-[#95A87A]/15"
                      : "border-gray-200 bg-white/70 opacity-75"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isDone
                      ? "bg-green-700 text-white"
                      : isActive
                        ? "bg-[#3D5126] text-white"
                        : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {isDone ? <CheckIcon className="h-3.5 w-3.5" /> : item.num}
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#273419]">{item.title}</p>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Layout 2 Kolom: Kiri Ringkasan Produk & Tagihan, Kanan Formulir / Pembayaran / Resi */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <aside aria-label="Ringkasan produk dan harga" className="lg:col-span-5">
            <div className="sticky top-20 space-y-4">
              {/* Pilihan Ganti Produk Cepat */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
                <label
                  htmlFor="pilih-produk"
                  className="block text-[11px] font-bold uppercase tracking-wider text-gray-500"
                >
                  Komoditas Katalog yang Dipesan
                </label>
                <select
                  id="pilih-produk"
                  value={selectedProductId}
                  disabled={step > 1}
                  onChange={handleProductChange}
                  className="mt-1.5 h-10 w-full rounded-xl border border-gray-300 bg-[#F8FAFC] px-3 text-sm font-semibold text-[#273419] focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126] disabled:opacity-60"
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.category}] {p.name} — {formatRupiah(p.price)}/{p.priceUnit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kartu Showcase Produk */}
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-md">
                <div className="relative flex h-52 sm:h-60 w-full items-center justify-center bg-gray-100 overflow-hidden group">
                  {product.image ? (
                    <img
                      key={`showcase-${product.id}`}
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#384A23] via-[#2D3B1C] to-[#1E2813] p-4">
                      <ImagePlaceholderIcon category={product.category} />
                    </div>
                  )}
                  <span className="absolute top-3.5 left-3.5 rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                    {product.category}
                  </span>
                  <span className="absolute top-3.5 right-3.5 rounded-full bg-[#3D5126] px-3 py-1 text-[11px] font-bold text-white shadow-xs">
                    ✓ Foto Komoditas Asli
                  </span>
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-extrabold text-[#273419]">{product.name}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                    <MapPinIcon className="h-4 w-4 shrink-0 text-[#6E8053]" />
                    <span>
                      Oleh <strong className="font-semibold text-[#273419]">{product.seller}</strong> ·{" "}
                      {product.location}
                    </span>
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded border border-gray-300 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-700">
                      Stok Tersedia: {formatNumber(product.stock)} {product.stockUnit}
                    </span>
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-[#95A87A] bg-[#95A87A]/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#273419]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-gray-600">{product.description}</p>

                  {/* Rincian Perhitungan (DetailTransaksi) */}
                  <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm">
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Harga Satuan</span>
                      <span className="font-semibold text-[#273419]">
                        {formatRupiah(product.price)} / {product.priceUnit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Jumlah Pesanan</span>
                      <span className="font-semibold text-[#273419]">
                        {formatNumber(quantity)} {product.stockUnit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Subtotal Produk</span>
                      <span className="font-semibold text-[#273419]">{formatRupiah(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Biaya Pengiriman ({selectedCourier.badge})</span>
                      <span className="font-semibold text-[#273419]">
                        {ongkir === 0 ? "Gratis (Rp 0)" : formatRupiah(ongkir)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Biaya Layanan Kemitraan</span>
                      <span className="font-semibold text-green-800">Rp 0 (Bebas Admin)</span>
                    </div>

                    <div className="flex items-baseline justify-between border-t border-gray-200 pt-3">
                      <span className="text-sm font-extrabold uppercase tracking-wide text-[#273419]">
                        Total Bayar
                      </span>
                      <span className="text-xl font-extrabold text-[#3D5126]">
                        {formatRupiah(totalHarga)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Jaminan Escrow SAMANGGA */}
              <div className="rounded-2xl border border-[#95A87A] bg-[#95A87A]/15 p-4">
                <div className="flex items-start gap-2.5">
                  <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#3D5126]" />
                  <div className="text-xs leading-relaxed text-[#273419]">
                    <p className="font-bold">Proteksi Transaksi Rantai Pasok SAMANGGA</p>
                    <p className="mt-0.5 text-gray-700">
                      Dana Anda disimpan aman dan baru diteruskan ke rekening{" "}
                      <strong>{product.seller}</strong> setelah komoditas dikirim dan diverifikasi sesuai
                      grade.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section aria-label="Formulir dan status transaksi" className="lg:col-span-7">
            {step === 1 && (
              <form
                onSubmit={handleCreateOrder}
                className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="border-b border-gray-100 pb-4">
                  <span className="rounded-full bg-[#3D5126]/10 px-3 py-1 text-xs font-bold text-[#3D5126]">
                    Langkah 1 dari 3
                  </span>
                  <h2 className="mt-2 text-lg font-extrabold text-[#273419]">
                    Lengkapi Rincian Pesanan & Pengiriman
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-600">
                    Pastikan jumlah pesanan dan alamat pengiriman sesuai agar kurir logistik tepat waktu.
                  </p>
                </div>

                {/* Preview Produk Dipesan dengan Gambar Nyata */}
                <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border-2 border-[#95A87A]/40 bg-gradient-to-br from-[#95A87A]/15 via-white to-white p-4 shadow-2xs">
                  <div className="relative h-28 w-28 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-inner">
                    {product.image ? (
                      <img
                        key={`form-preview-${product.id}`}
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#384A23] p-2 text-white">
                        <ImagePlaceholderIcon category={product.category} />
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      {product.category}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                      <span className="rounded-full bg-[#3D5126] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Komoditas Terpilih
                      </span>
                      {product.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-[#95A87A] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#273419]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="mt-1 text-base font-extrabold text-[#273419]">{product.name}</h3>
                    <p className="mt-0.5 text-xs text-gray-600">
                      Penjual: <strong>{product.seller}</strong> · {product.location}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="text-base font-extrabold text-[#3D5126]">
                        {formatRupiah(product.price)}
                        <span className="text-xs font-normal text-gray-500"> /{product.priceUnit}</span>
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs font-semibold text-gray-700">
                        Stok: {formatNumber(product.stock)} {product.stockUnit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <label htmlFor="jumlah-produk" className="block text-sm font-bold text-[#273419]">
                        Jumlah Pesanan ({product.stockUnit}) <span className="text-red-600">*</span>
                      </label>
                      <p className="text-xs text-gray-600">
                        Maksimal tersedia: <strong>{formatNumber(product.stock)} {product.stockUnit}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        aria-label="Kurangi jumlah"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-base font-bold text-[#273419] hover:bg-gray-50 disabled:opacity-40"
                      >
                        −
                      </button>
                      <input
                        id="jumlah-produk"
                        type="number"
                        min={1}
                        max={product.stock}
                        required
                        value={quantity}
                        onChange={(e) => handleQuantityChange(Number(e.target.value))}
                        className="h-10 w-20 rounded-xl border border-gray-300 bg-white text-center text-sm font-bold text-[#273419] focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock}
                        aria-label="Tambah jumlah"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-base font-bold text-[#273419] hover:bg-gray-50 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Pintasan Jumlah Cepat */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-gray-200/80 pt-3">
                    <span className="text-[11px] font-semibold text-gray-500 mr-1">Pilih Cepat:</span>
                    {[1, 5, 10, 25].map((preset) =>
                      preset <= product.stock ? (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleQuantityChange(preset)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                            quantity === preset
                              ? "border-[#3D5126] bg-[#3D5126] text-white"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {preset} {product.stockUnit}
                        </button>
                      ) : null,
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                      Kategori Pembelian (Konsumen)
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {(["Individu", "Grosir"] as const).map((kat) => {
                        const active = kategoriKonsumen === kat;
                        return (
                          <button
                            key={kat}
                            type="button"
                            onClick={() => setKategoriKonsumen(kat)}
                            className={`flex flex-col rounded-xl border p-3 text-left transition-all ${
                              active
                                ? "border-2 border-[#3D5126] bg-[#95A87A]/15 shadow-xs"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <span className="text-xs font-bold text-[#273419]">
                              {kat === "Individu" ? "Individu / Ritel" : "Grosir / UMKM / Toko"}
                            </span>
                            <span className="mt-0.5 text-[11px] text-gray-600">
                              {kat === "Individu"
                                ? "Konsumsi rumah tangga atau oleh-oleh"
                                : "Suplai usaha kuliner, toko buah, atau katering"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="namaPenerima" className="block text-xs font-bold text-[#273419]">
                        Nama Penerima / Instansi <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="namaPenerima"
                        type="text"
                        required
                        value={namaPenerima}
                        onChange={(e) => setNamaPenerima(e.target.value)}
                        placeholder="Contoh: Budi Santoso / Toko Buah Segar"
                        className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
                      />
                    </div>

                    <div>
                      <label htmlFor="noTelp" className="block text-xs font-bold text-[#273419]">
                        Nomor WhatsApp Penerima <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="noTelp"
                        type="tel"
                        required
                        value={noTelp}
                        onChange={(e) => setNoTelp(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="alamatPengiriman" className="block text-xs font-bold text-[#273419]">
                      Alamat Pengiriman Lengkap <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="alamatPengiriman"
                      rows={2}
                      required
                      value={alamatPengiriman}
                      onChange={(e) => setAlamatPengiriman(e.target.value)}
                      placeholder="Jalan, RT/RW, Desa/Kelurahan, Kecamatan, Kabupaten/Kota, Kode Pos..."
                      className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
                    />
                  </div>

                  <div>
                    <label htmlFor="catatanPenjual" className="block text-xs font-bold text-[#273419]">
                      Catatan untuk Penjual / Petani (Opsional)
                    </label>
                    <input
                      id="catatanPenjual"
                      type="text"
                      value={catatanPenjual}
                      onChange={(e) => setCatatanPenjual(e.target.value)}
                      placeholder="Misal: Pilih tingkat kematangan 80% untuk dikirim ke luar kota"
                      className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-600">
                    <TruckIcon className="h-4 w-4 text-[#3D5126]" />
                    Pilih Kurir & Armada Pengiriman
                  </label>
                  <div className="mt-2 space-y-2.5">
                    {COURIER_OPTIONS.map((c) => {
                      const active = selectedCourierId === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCourierId(c.id)}
                          className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                            active
                              ? "border-2 border-[#3D5126] bg-[#95A87A]/15 shadow-xs"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-[#273419]">{c.name}</span>
                            <span className="shrink-0 rounded-full bg-[#3D5126] px-2.5 py-0.5 text-xs font-bold text-white">
                              {c.cost === 0 ? "Gratis" : formatRupiah(c.cost)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-600">{c.description}</p>
                          <p className="mt-1 text-[11px] font-semibold text-[#3D5126]">
                            Estimasi Tiba: {c.eta}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-600">
                    <CreditCardIcon className="h-4 w-4 text-[#3D5126]" />
                    Pilih Metode Pembayaran
                  </label>
                  <div className="mt-2 space-y-2.5">
                    {PAYMENT_OPTIONS.map((pay) => {
                      const active = metodePembayaran === pay.method;
                      return (
                        <button
                          key={pay.method}
                          type="button"
                          onClick={() => setMetodePembayaran(pay.method)}
                          className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                            active
                              ? "border-2 border-[#3D5126] bg-[#95A87A]/15 shadow-xs"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-[#273419]">{pay.title}</span>
                            <span className="rounded border border-[#95A87A] bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#273419]">
                              {pay.badge}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-600">{pay.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <div className="border-t border-gray-200 pt-4">
                  <button
                    type="submit"
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3D5126] px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-[#273419] active:scale-[0.99]"
                  >
                    Buat Pesanan & Lanjut ke Pembayaran ({formatRupiah(totalHarga)})
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
                  <div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                      Langkah 2 dari 3 · Status Pembayaran: {statusPembayaran}
                    </span>
                    <h2 className="mt-2 text-lg font-extrabold text-[#273419]">
                      Selesaikan Pembayaran Anda
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    ← Ubah Data Pesanan
                  </button>
                </div>

                {/* Card Preview Produk yang Sedang Dibayar */}
                <div className="flex items-center gap-3.5 rounded-2xl border border-gray-200 bg-[#F8FAFC] p-3.5 shadow-2xs">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                    {product.image ? (
                      <img
                        key={`pay-${product.id}`}
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#384A23] text-white">
                        <ImagePlaceholderIcon category={product.category} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#3D5126]">
                      Item Pembayaran ({product.category})
                    </span>
                    <p className="text-sm font-extrabold text-[#273419] truncate">{product.name}</p>
                    <p className="text-xs text-gray-600">
                      {quantity} {product.stockUnit} × {formatRupiah(product.price)} ={" "}
                      <strong className="text-[#273419]">{formatRupiah(subtotal)}</strong>
                    </p>
                  </div>
                </div>

                {/* Kartu Instruksi Sesuai Metode Pembayaran */}
                <div className="rounded-2xl border border-[#95A87A] bg-[#F8FAFC] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#3D5126]">
                        Metode Terpilih: {selectedPayment.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-600">
                        Batas waktu pembayaran: <strong>24 Jam (Otomatis batal jika kedaluwarsa)</strong>
                      </p>
                    </div>
                    <span className="text-lg font-extrabold text-[#273419]">
                      {formatRupiah(totalHarga)}
                    </span>
                  </div>

                  {metodePembayaran === "QRIS" && (
                    <div className="mt-4 flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-5 text-center">
                      <span className="rounded bg-[#273419] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                        QRIS NASIONAL · SAMANGGA ESCROW
                      </span>
                      <div
                        role="img"
                        aria-label="Kode QRIS Pembayaran SAMANGGA"
                        className="mt-3 flex h-44 w-44 items-center justify-center rounded-2xl border-2 border-[#273419] bg-white p-3 shadow-inner"
                      >
                        <svg viewBox="0 0 120 120" className="h-full w-full text-[#273419]">
                          <rect x="8" y="8" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="6" />
                          <rect x="18" y="18" width="12" height="12" fill="currentColor" />
                          <rect x="80" y="8" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="6" />
                          <rect x="90" y="18" width="12" height="12" fill="currentColor" />
                          <rect x="8" y="80" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="6" />
                          <rect x="18" y="90" width="12" height="12" fill="currentColor" />
                          <rect x="50" y="12" width="8" height="8" fill="currentColor" />
                          <rect x="62" y="20" width="8" height="16" fill="currentColor" />
                          <rect x="48" y="48" width="24" height="24" rx="4" fill="#3D5126" />
                          <rect x="14" y="52" width="20" height="8" fill="currentColor" />
                          <rect x="82" y="52" width="24" height="8" fill="currentColor" />
                          <rect x="50" y="82" width="12" height="24" fill="currentColor" />
                          <rect x="72" y="76" width="16" height="12" fill="currentColor" />
                          <rect x="92" y="92" width="16" height="16" fill="currentColor" />
                        </svg>
                      </div>
                      <p className="mt-3 text-xs font-bold text-[#273419]">
                        NMID: ID2026089912345 · {selectedPayment.codePrefix}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        Buka aplikasi m-Banking atau e-Wallet Anda, scan QR di atas, lalu konfirmasi nominal{" "}
                        <strong>{formatRupiah(totalHarga)}</strong>.
                      </p>
                    </div>
                  )}

                  {metodePembayaran === "Virtual Account" && (
                    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
                      <p className="text-xs text-gray-500">Nomor Virtual Account (BRI / Mandiri / BNI):</p>
                      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F8FAFC] p-3">
                        <span className="font-mono text-base font-extrabold tracking-wider text-[#273419]">
                          {selectedPayment.codePrefix}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(selectedPayment.codePrefix)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#3D5126] bg-white px-3 py-1.5 text-xs font-bold text-[#3D5126] hover:bg-[#95A87A]/20"
                        >
                          <CopyIcon className="h-3.5 w-3.5" />
                          {copiedCode ? "Tersalin!" : "Salin Nomor VA"}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-gray-600">
                        Pembayaran diverifikasi otomatis melalui callback gateway begitu transfer selesai.
                      </p>
                    </div>
                  )}

                  {metodePembayaran === "Transfer Manual" && (
                    <div className="mt-4 space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
                      <div>
                        <p className="text-xs text-gray-500">Rekening Bersama SAMANGGA:</p>
                        <p className="mt-1 font-mono text-sm font-extrabold text-[#273419]">
                          {selectedPayment.codePrefix}
                        </p>
                      </div>
                      <div>
                        <label htmlFor="bukti-transfer" className="block text-xs font-bold text-[#273419]">
                          Unggah Bukti Transfer (Tabel Pembayaran.bukti_transfer)
                        </label>
                        <input
                          id="bukti-transfer"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setBuktiTransferName(file.name);
                          }}
                          className="mt-1 block w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#3D5126] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#273419]"
                        />
                        {buktiTransferName && (
                          <p className="mt-1 text-xs font-semibold text-green-800">
                            ✓ File terpilih: {buktiTransferName}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Ringkasan Alamat & Penerima */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-xs space-y-1.5">
                  <p className="font-bold uppercase tracking-wider text-gray-500">Tujuan Pengiriman</p>
                  <p className="text-sm font-bold text-[#273419]">
                    {namaPenerima} ({kategoriKonsumen}) · {noTelp}
                  </p>
                  <p className="text-gray-700">{alamatPengiriman}</p>
                  <p className="text-gray-600">
                    Kurir: <strong>{selectedCourier.name}</strong>
                  </p>
                  {catatanPenjual && (
                    <p className="text-gray-600">
                      Catatan: <em>&ldquo;{catatanPenjual}&rdquo;</em>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3D5126] px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-[#273419]"
                >
                  <CheckIcon className="h-4 w-4" />
                  Konfirmasi Pembayaran Sekarang
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 rounded-3xl border border-[#3D5126] bg-white p-6 shadow-md sm:p-8">
                {/* Banner Sukses */}
                <div className="flex flex-col items-start justify-between gap-3 rounded-2xl bg-[#3D5126] p-5 text-white sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#3D5126]">
                      <CheckIcon className="h-6 w-6" />
                    </span>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#95A87A]">
                        Pembayaran {statusPembayaran} · {metodePembayaran}
                      </span>
                      <h2 className="text-lg font-extrabold">
                        Pesanan #{idTransaksi} Sedang {statusTransaksi}!
                      </h2>
                      <p className="mt-0.5 text-xs text-white/90">
                        Penjual ({product.seller}) telah menerima pesanan Anda dan sedang menyiapkan pengiriman.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Preview Produk Terkonfirmasi */}
                <div className="flex items-center gap-3.5 rounded-2xl border border-[#95A87A] bg-[#95A87A]/15 p-4 shadow-2xs">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#95A87A]/40 bg-gray-100">
                    {product.image ? (
                      <img
                        key={`confirm-${product.id}`}
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#384A23] text-white">
                        <ImagePlaceholderIcon category={product.category} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#3D5126]">
                      Komoditas Terverifikasi ({product.category})
                    </span>
                    <p className="text-sm font-extrabold text-[#273419] truncate">{product.name}</p>
                    <p className="text-xs text-gray-700">
                      Pesanan sebanyak <strong>{quantity} {product.stockUnit}</strong> ({formatRupiah(subtotal)}) dari{" "}
                      <strong>{product.seller}</strong> ({product.location})
                    </p>
                  </div>
                </div>

                {/* Ringkasan Pesanan Terkonfirmasi */}
                <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4 text-xs sm:grid-cols-2">
                  <div>
                    <p className="font-bold uppercase tracking-wider text-gray-500">Detail Penerima</p>
                    <p className="mt-1 text-sm font-bold text-[#273419]">
                      {namaPenerima} ({kategoriKonsumen})
                    </p>
                    <p className="text-gray-700">WhatsApp: {noTelp}</p>
                    <p className="mt-1 text-gray-700">{alamatPengiriman}</p>
                  </div>
                  <div>
                    <p className="font-bold uppercase tracking-wider text-gray-500">Pengiriman & Pembayaran</p>
                    <p className="mt-1 text-sm font-bold text-[#273419]">{selectedCourier.name}</p>
                    <p className="text-gray-700">Estimasi: {selectedCourier.eta}</p>
                    <p className="mt-1 text-gray-700">
                      Total Dibayar: <strong className="text-[#3D5126]">{formatRupiah(totalHarga)}</strong> ({metodePembayaran})
                    </p>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/katalog"
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#3D5126] px-5 text-sm font-bold text-white transition-colors hover:bg-[#273419]"
                  >
                    Belanja Komoditas Lain di Katalog
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setStatusTransaksi("Pending");
                      setStatusPembayaran("Menunggu");
                    }}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Buat Pesanan Baru
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function PesanSekarang(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] text-[#273419]">
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-12 text-center text-sm font-semibold text-gray-600">
            Memuat halaman pemesanan komoditas SAMANGGA...
          </main>
        </div>
      }
    >
      <PesanSekarangContent />
    </Suspense>
  );
}
