"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import type { JSX } from "react";
import { Navbar } from "@/components/layout/SiteNavbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BasketIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@/components/ui/Icons";
import { ImagePlaceholderIcon } from "@/components/ui/Illustrations";
import type { ProductCategory } from "@/data/katalog";
import {
  clearCart,
  getCartItems,
  getServerCartItems,
  removeFromCart,
  subscribeCart,
  updateCartQuantity,
  type CartItem,
} from "@/lib/cart";
import { formatNumber, formatRupiah } from "@/lib/format";

export default function KeranjangBelanja(): JSX.Element {
  const cartItems: CartItem[] = useSyncExternalStore(
    subscribeCart,
    getCartItems,
    getServerCartItems,
  );

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems],
  );

  const totalQuantity = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems],
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#273419] flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <Link
                href="/katalog"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3D5126] hover:text-[#273419]"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                <span>Lanjut Belanja di Katalog</span>
              </Link>
              <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-[#273419]">
                Keranjang Belanja Anda
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">
                Periksa daftar belanjaan Anda, ubah kuantitas, atau hapus barang sebelum melakukan checkout.
              </p>
            </div>

            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors self-start sm:self-auto"
              >
                <span>Kosongkan Semua</span>
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="mx-auto my-12 max-w-md rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-[#3D5126]">
                <BasketIcon className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-lg font-extrabold text-[#273419]">
                Keranjang Belanja Masih Kosong
              </h2>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                Anda belum menambahkan mangga atau produk olahan ke dalam keranjang. Silakan jelajahi katalog kami.
              </p>
              <Link
                href="/katalog"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#3D5126] px-6 text-sm font-bold text-white shadow-md hover:bg-[#273419] transition-all"
              >
                <span>Mulai Belanja di Katalog</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 rounded-3xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100 border border-gray-200">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#3D5126] p-2 text-white">
                              <ImagePlaceholderIcon category={(item.category as ProductCategory) || "Mangga Segar"} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="inline-block rounded-md bg-[#95A87A]/20 px-2 py-0.5 text-[10px] font-bold text-[#166534]">
                            {item.category || "Mangga Segar"}
                          </span>

                          <h3 className="mt-1 text-sm sm:text-base font-extrabold text-[#273419] truncate">
                            {item.name}
                          </h3>

                          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                            <MapPinIcon className="h-3.5 w-3.5 text-[#6E8053]" />
                            <span>{item.seller} · {item.location}</span>
                          </p>

                          <p className="mt-1 text-xs font-extrabold text-[#3D5126]">
                            {formatRupiah(item.price)}
                            <span className="font-normal text-gray-500"> /{item.priceUnit}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                        <div className="inline-flex items-center rounded-xl border border-gray-300 bg-[#F8FAFC] shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            aria-label={`Kurangi kuantitas ${item.name}`}
                            className="flex h-8 w-8 items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-l-xl transition-colors"
                          >
                            −
                          </button>
                          <span className="w-10 text-center text-xs font-black text-[#273419]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            aria-label={`Tambah kuantitas ${item.name}`}
                            className="flex h-8 w-8 items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-r-xl transition-colors disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right min-w-[90px]">
                          <span className="block text-[10px] uppercase font-bold text-gray-400">
                            Subtotal
                          </span>
                          <span className="text-sm font-black text-gray-900">
                            {formatRupiah(item.price * item.quantity)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Hapus ${item.name} dari keranjang`}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Hapus barang"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
                <h2 className="text-base font-extrabold text-[#273419]">
                  Ringkasan Belanja
                </h2>

                <div className="space-y-2.5 text-xs text-gray-600 border-b border-gray-100 pb-4">
                  <div className="flex justify-between">
                    <span>Total Item Produk</span>
                    <strong className="text-gray-900">{formatNumber(totalQuantity)} barang</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal Harga</span>
                    <strong className="text-gray-900">{formatRupiah(subtotal)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Pilihan Pengiriman</span>
                    <span className="text-gray-500">Pilih COD / Paket di checkout</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    Total Sementara
                  </span>
                  <span className="text-2xl font-black text-[#3D5126]">
                    {formatRupiah(subtotal)}
                  </span>
                </div>

                <Link
                  href="/pesan"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#3D5126] px-5 text-sm font-bold text-white shadow-md hover:bg-[#273419] active:scale-95 transition-all"
                >
                  <span>Langsung Checkout &gt;</span>
                </Link>

                <div className="flex items-start gap-2.5 rounded-2xl bg-[#95A87A]/15 p-3 text-xs text-[#273419]">
                  <ShieldCheckIcon className="h-5 w-5 shrink-0 text-[#3D5126] mt-0.5" />
                  <p>
                    <strong>Belanja Aman:</strong> Pembayaran diproteksi escrow dan panen mangga segar bergaransi langsung dari kebun Indramayu.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
