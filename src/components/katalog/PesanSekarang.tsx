"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useId, useMemo, useState, useSyncExternalStore } from "react";
import type { FormEvent, JSX } from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  LockIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  StoreIcon,
  TruckIcon,
} from "@/components/ui/Icons";
import {
  COURIER_OPTIONS,
  PAYMENT_OPTIONS,
  PRODUCTS,
  type CourierOption,
} from "@/data/katalog";
import { DEFAULT_PROFILES, ROLE_STORAGE_KEY, type RoleSlug } from "@/data/profil";
import {
  clearCart,
  getCartItems,
  getServerCartItems,
  removeFromCart,
  subscribeCart,
  updateCartQuantity,
} from "@/lib/cart";
import { formatRupiah } from "@/lib/format";
import { createFullOrder } from "@/lib/ecosystemStore";
import type { MetodePembayaran } from "@/types/samangga";

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
  if (PRODUCTS.length === 0) return "";
  if (!param) return PRODUCTS[0]?.id ?? "";
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

  return PRODUCTS[0]?.id ?? "";
}

function getAuthSnapshot(): RoleSlug | null {
  if (typeof window === "undefined") return null;
  const savedRole = window.localStorage.getItem(ROLE_STORAGE_KEY) as RoleSlug | null;
  return savedRole && DEFAULT_PROFILES[savedRole] ? savedRole : null;
}
function getServerAuthSnapshot(): RoleSlug | null {
  return null;
}

function subscribeAuth(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("samangga_auth_change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("samangga_auth_change", callback);
  };
}

export interface CheckoutItem {
  id: string;
  name: string;
  category: string;
  price: number;
  priceUnit: string;
  quantity: number;
  seller: string;
  location: string;
  image?: string;
}

type OrderType = "cod" | "paket";

function PesanSekarangContent(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = useId();

  const queryProd = searchParams.get("produk") ?? searchParams.get("id");
  const queryQtyRaw = searchParams.get("qty");
  const queryQty = queryQtyRaw ? Math.max(1, parseInt(queryQtyRaw, 10) || 1) : 1;

  // Profil pengguna yang sedang login
  const activeRole = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
  const userProfile = activeRole ? DEFAULT_PROFILES[activeRole] : null;

  // Baca keranjang jika ada
  const cartItems = useSyncExternalStore(subscribeCart, getCartItems, getServerCartItems);

  // Tentukan item apa yang sedang di-checkout
  const checkoutItems = useMemo<CheckoutItem[]>(() => {
    if (queryProd && PRODUCTS.length > 0) {
      const prodId = resolveProductId(queryProd);
      const p = PRODUCTS.find((it) => it.id === prodId) ?? PRODUCTS[0];
      if (p) {
        return [
          {
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            priceUnit: p.priceUnit,
            quantity: Math.min(queryQty, p.stock),
            seller: p.seller,
            location: p.location,
            image: p.image,
          },
        ];
      }
    }
    if (cartItems.length > 0) {
      return cartItems.map((c) => ({
        id: c.id,
        name: c.name,
        category: "Katalog Mangga",
        price: c.price,
        priceUnit: c.priceUnit,
        quantity: c.quantity,
        seller: c.seller,
        location: c.location,
        image: c.image,
      }));
    }
    // Fallback ke produk pertama jika tersedia
    if (PRODUCTS.length > 0) {
      const p = PRODUCTS[0];
      return [
        {
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          priceUnit: p.priceUnit,
          quantity: 1,
          seller: p.seller,
          location: p.location,
          image: p.image,
        },
      ];
    }
    return [];
  }, [queryProd, queryQty, cartItems]);

  // Alur Pemesanan Sesuai Permintaan User:
  // Tahap 1: Pilih menu mau COD atau PAKET
  // - Jika COD: Langsung ke Pembayaran -> Selesai / Tunjukkan & Scan Nota ke Kasir
  // - Jika PAKET: Tahap 2 isi alamat -> Tahap 3 Pembayaran -> Tahap 4 Selesai / Resi
  const [orderType, setOrderType] = useState<OrderType>("cod");
  const [step, setStep] = useState<number>(1);

  // Address details state
  const [firstName, setFirstName] = useState<string>(() =>
    userProfile?.nama_lengkap ? userProfile.nama_lengkap.split(" ")[0] : "Mateusz",
  );
  const [secondName, setSecondName] = useState<string>(() =>
    userProfile?.nama_lengkap
      ? userProfile.nama_lengkap.split(" ").slice(1).join(" ") || "Rahmawati"
      : "Wierzbicki",
  );
  const [streetAddress, setStreetAddress] = useState<string>(
    () => userProfile?.alamat ?? "Jl. Raya Lohbener No. 42 Blok Mangga",
  );
  const [city, setCity] = useState<string>("Indramayu");
  const [zipCode, setZipCode] = useState<string>("45214");
  const [country, setCountry] = useState<string>("Indonesia");
  const [phoneNumber, setPhoneNumber] = useState<string>(() =>
    userProfile?.no_telp ? userProfile.no_telp.replace(/\D/g, "") : "123456789",
  );
  const [useDeliveryAsBilling, setUseDeliveryAsBilling] = useState<boolean>(true);

  // Delivery method pilihan (untuk paket)
  const [selectedCourierId, setSelectedCourierId] = useState<string>("ekspedisi-kargo");
  const selectedCourier: CourierOption = useMemo(() => {
    if (orderType === "cod") {
      return (
        COURIER_OPTIONS.find((c) => c.id === "ambil-sendiri") ?? {
          id: "ambil-sendiri",
          name: "Ambil di Kasir Mitra (Self-Pickup COD)",
          badge: "Bebas Ongkir",
          eta: "Hari ini / Siap Ambil",
          cost: 0,
          description: "Tunjukkan atau scan nota pesanan Anda di kasir mitra saat pengambilan.",
        }
      );
    }
    return COURIER_OPTIONS.find((c) => c.id === selectedCourierId) ?? COURIER_OPTIONS[1];
  }, [orderType, selectedCourierId]);

  // Payment method pilihan
  const [metodePembayaran, setMetodePembayaran] = useState<MetodePembayaran | "Kasir COD">("Kasir COD");
  const [buktiTransferName, setBuktiTransferName] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [orderNumber] = useState<string>("SMG-892145");

  // Kalkulasi Harga
  const subtotal = useMemo(
    () => checkoutItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [checkoutItems],
  );
  const totalItemCount = useMemo(
    () => checkoutItems.reduce((acc, item) => acc + item.quantity, 0),
    [checkoutItems],
  );
  const shippingCost = orderType === "cod" ? 0 : selectedCourier.cost;
  const grandTotal = subtotal + shippingCost;

  // Navigasi Langkah
  const handleNextFromMenu = (): void => {
    if (orderType === "cod") {
      // COD: Langsung ke tahap Pembayaran / Konfirmasi Kasir
      setMetodePembayaran("Kasir COD");
      setStep(2);
    } else {
      // PAKET: Ke tahap 2 isi alamat
      setMetodePembayaran("QRIS");
      setStep(2);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextFromAddress = (e: FormEvent): void => {
    e.preventDefault();
    setStep(3); // Masuk ke pembayaran untuk mode PAKET
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmOrder = (): void => {
    try {
      const orderItems = checkoutItems.map((ci) => ({
        id_produk: Number(ci.id) || 1,
        name: ci.name,
        quantity: ci.quantity,
        price: ci.price,
      }));

      createFullOrder({
        buyerId: userProfile?.id_user ?? 404,
        sellerId: 101,
        items: orderItems,
        totalAmount: grandTotal,
        paymentMethod: metodePembayaran === "Kasir COD" ? "Transfer Manual" : (metodePembayaran as MetodePembayaran),
        courierName: selectedCourier.name,
        recipientName: `${firstName} ${secondName}`.trim(),
        recipientAddress: `${streetAddress}, ${city} ${zipCode}`.trim(),
      });
    } catch (err) {
      console.error("Gagal mencatat transaksi ekosistem:", err);
    }

    if (cartItems.length > 0 && !queryProd) {
      clearCart();
    }
    if (orderType === "cod") {
      setStep(3); // Selesai / Nota Kasir COD
    } else {
      setStep(4); // Selesai / Resi Paket
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopy = (text: string): void => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#273419]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            aria-label="Kembali ke Beranda SAMANGGA"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <img src="/images/logo_web.png" alt="Logo SAMANGGA" className="h-8 w-8 object-contain" />
            <span className="text-lg font-black tracking-tight text-[#273419]">SAMANGGA</span>
          </Link>

          <Link
            href="/keranjang"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-gray-700 hover:text-[#3D5126] transition-colors"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>BACK TO SHOPPING CART</span>
          </Link>
        </div>
      </header>

      <nav aria-label="Alur Checkout" className="border-b border-gray-200/80 bg-white/70 backdrop-blur-xs py-5 sm:py-6">
        <div className="mx-auto max-w-3xl px-4">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 z-0" />

            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all ${
                  step === 1
                    ? "bg-white border-4 border-[#3D5126] ring-4 ring-[#95A87A]/25 text-[#3D5126]"
                    : "bg-[#3D5126] text-white"
                }`}
              >
                {step > 1 ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-[#3D5126]" />
                )}
              </div>
              <span className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#3D5126]">
                1. Tipe Pesanan
              </span>
            </div>

            {orderType === "paket" && (
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all ${
                    step === 2
                      ? "bg-white border-4 border-[#3D5126] ring-4 ring-[#95A87A]/25 text-[#3D5126]"
                      : step > 2
                        ? "bg-[#3D5126] text-white"
                        : "bg-white border-2 border-gray-300 text-gray-400"
                  }`}
                >
                  {step > 2 ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <div className={step === 2 ? "h-2 w-2 rounded-full bg-[#3D5126]" : "h-2 w-2 rounded-full bg-gray-300"} />
                  )}
                </div>
                <span
                  className={`mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                    step === 2 ? "text-[#3D5126]" : step > 2 ? "text-[#3D5126]" : "text-gray-400"
                  }`}
                >
                  2. Isi Alamat
                </span>
              </div>
            )}

            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all ${
                  (orderType === "cod" && step === 2) || (orderType === "paket" && step === 3)
                    ? "bg-white border-4 border-[#3D5126] ring-4 ring-[#95A87A]/25 text-[#3D5126]"
                    : (orderType === "cod" && step > 2) || (orderType === "paket" && step > 3)
                      ? "bg-[#3D5126] text-white"
                      : "bg-white border-2 border-gray-300 text-gray-400"
                }`}
              >
                {(orderType === "cod" && step > 2) || (orderType === "paket" && step > 3) ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <div
                    className={
                      (orderType === "cod" && step === 2) || (orderType === "paket" && step === 3)
                        ? "h-2 w-2 rounded-full bg-[#3D5126]"
                        : "h-2 w-2 rounded-full bg-gray-300"
                    }
                  />
                )}
              </div>
              <span
                className={`mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                  (orderType === "cod" && step === 2) || (orderType === "paket" && step === 3)
                    ? "text-[#3D5126]"
                    : (orderType === "cod" && step > 2) || (orderType === "paket" && step > 3)
                      ? "text-[#3D5126]"
                      : "text-gray-400"
                }`}
              >
                {orderType === "cod" ? "2. Pembayaran" : "3. Pembayaran"}
              </span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all ${
                  (orderType === "cod" && step === 3) || (orderType === "paket" && step === 4)
                    ? "bg-[#3D5126] text-white shadow-xs"
                    : "bg-white border-2 border-gray-300 text-gray-400"
                }`}
              >
                {(orderType === "cod" && step === 3) || (orderType === "paket" && step === 4) ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-gray-300" />
                )}
              </div>
              <span
                className={`mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                  (orderType === "cod" && step === 3) || (orderType === "paket" && step === 4)
                    ? "text-[#3D5126]"
                    : "text-gray-400"
                }`}
              >
                {orderType === "cod" ? "3. Nota Kasir" : "4. Selesai & Resi"}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {checkoutItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white py-16 text-center shadow-xs">
            <span className="text-4xl">🥭</span>
            <h2 className="mt-3 text-base font-bold text-gray-800">Tidak Ada Produk yang Dipilih</h2>
            <p className="mt-1 max-w-md text-xs text-gray-500">
              Belum ada produk mangga atau olahan yang dipilih untuk dipesan. Silakan pilih produk terlebih dahulu melalui katalog rantai pasok.
            </p>
            <Link
              href="/katalog"
              className="mt-5 rounded-xl bg-[#3D5126] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#273419] transition-all"
            >
              Jelajahi Katalog Mangga
            </Link>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            {step === 1 && (
              <div className="rounded-2xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-sm">
                <header>
                  <span className="rounded-full bg-[#3D5126]/10 px-3 py-1 text-xs font-bold text-[#3D5126]">
                    Tahap 1
                  </span>
                  <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                    Pilih Metode Pemesanan
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Pilih apakah Anda ingin mengambil langsung (COD di Kasir Mitra) atau dikirimkan sebagai Paket via kurir ekspedisi.
                  </p>
                </header>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setOrderType("cod")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setOrderType("cod");
                    }}
                    className={`flex flex-col justify-between rounded-2xl border-2 p-5 transition-all cursor-pointer ${
                      orderType === "cod"
                        ? "border-[#3D5126] bg-[#95A87A]/10 shadow-md ring-2 ring-[#3D5126]/20"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3D5126] text-white">
                          <StoreIcon className="h-6 w-6" />
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                          Bebas Ongkir (Rp 0)
                        </span>
                      </div>

                      <h2 className="mt-4 text-base font-extrabold text-gray-900">
                        COD (Ambil di Kasir Mitra)
                      </h2>
                      <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                        Langsung ke pembayaran &amp; cetak nota. Pas datang ke kebun/gudang mitra, tinggal tunjukkan nota atau scan QR nota ke kasir.
                      </p>
                    </div>

                    <div className="mt-5 border-t border-gray-200/80 pt-3 flex items-center justify-between text-xs">
                      <span className="text-gray-400">Estimasi Pengambilan:</span>
                      <strong className="font-bold text-gray-800">Hari ini / Siap Ambil</strong>
                    </div>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setOrderType("paket")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setOrderType("paket");
                    }}
                    className={`flex flex-col justify-between rounded-2xl border-2 p-5 transition-all cursor-pointer ${
                      orderType === "paket"
                        ? "border-[#3D5126] bg-[#95A87A]/10 shadow-md ring-2 ring-[#3D5126]/20"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                          <TruckIcon className="h-6 w-6" />
                        </div>
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-800">
                          Kirim ke Alamat
                        </span>
                      </div>

                      <h2 className="mt-4 text-base font-extrabold text-gray-900">
                        Paket (Kirim via Ekspedisi)
                      </h2>
                      <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                        Lanjut ke tahap isi alamat pengiriman, opsi armada kurir khusus komoditas (SAMANGGA Fleet / JNE Kargo), dan resi pelacakan.
                      </p>
                    </div>

                    <div className="mt-5 border-t border-gray-200/80 pt-3 flex items-center justify-between text-xs">
                      <span className="text-gray-400">Estimasi Pengiriman:</span>
                      <strong className="font-bold text-gray-800">1–3 Hari Kerja</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => router.push("/katalog")}
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    BACK
                  </button>

                  <button
                    type="button"
                    onClick={handleNextFromMenu}
                    className="inline-flex items-center justify-center rounded-md bg-[#3D5126] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#273419] active:scale-95 transition-all"
                  >
                    {orderType === "cod" ? "NEXT STEP (PEMBAYARAN) >" : "NEXT STEP (ISI ALAMAT) >"}
                  </button>
                </div>
              </div>
            )}

            {orderType === "paket" && step === 2 && (
              <div className="rounded-2xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-sm">
                <header>
                  <span className="rounded-full bg-[#3D5126]/10 px-3 py-1 text-xs font-bold text-[#3D5126]">
                    Tahap 2 (Paket)
                  </span>
                  <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                    Address details
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Lengkapi alamat pengiriman hasil panen mangga segar Indramayu langsung dari kebun mitra.
                  </p>
                </header>

                <form id={formId} onSubmit={handleNextFromAddress} className="mt-6 space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Delivery address</h2>

                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="firstName"
                            className="block text-[10px] font-bold uppercase tracking-wider text-gray-500"
                          >
                            First Name
                          </label>
                          <input
                            id="firstName"
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Mateusz"
                            className="mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#3D5126] focus:outline-none focus:ring-1 focus:ring-[#3D5126]"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="secondName"
                            className="block text-[10px] font-bold uppercase tracking-wider text-gray-500"
                          >
                            Second Name
                          </label>
                          <input
                            id="secondName"
                            type="text"
                            required
                            value={secondName}
                            onChange={(e) => setSecondName(e.target.value)}
                            placeholder="Wierzbicki"
                            className="mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#3D5126] focus:outline-none focus:ring-1 focus:ring-[#3D5126]"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="streetAddress"
                          className="block text-[10px] font-bold uppercase tracking-wider text-gray-500"
                        >
                          Street Address
                        </label>
                        <input
                          id="streetAddress"
                          type="text"
                          required
                          value={streetAddress}
                          onChange={(e) => setStreetAddress(e.target.value)}
                          placeholder="Street and number"
                          className="mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#3D5126] focus:outline-none focus:ring-1 focus:ring-[#3D5126]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="city"
                            className="block text-[10px] font-bold uppercase tracking-wider text-gray-500"
                          >
                            City
                          </label>
                          <input
                            id="city"
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                            className="mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#3D5126] focus:outline-none focus:ring-1 focus:ring-[#3D5126]"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="zipCode"
                            className="block text-[10px] font-bold uppercase tracking-wider text-gray-500"
                          >
                            Zip Code
                          </label>
                          <input
                            id="zipCode"
                            type="text"
                            required
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            placeholder="00-000"
                            className="mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#3D5126] focus:outline-none focus:ring-1 focus:ring-[#3D5126]"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="country"
                          className="block text-[10px] font-bold uppercase tracking-wider text-gray-500"
                        >
                          Country
                        </label>
                        <select
                          id="country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-[#3D5126] focus:outline-none focus:ring-1 focus:ring-[#3D5126]"
                        >
                          <option value="Indonesia">Indonesia</option>
                          <option value="Malaysia">Malaysia</option>
                          <option value="Singapura">Singapura</option>
                          <option value="Poland">Poland</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="phoneNumber"
                          className="block text-[10px] font-bold uppercase tracking-wider text-gray-500"
                        >
                          Phone Number
                        </label>
                        <input
                          id="phoneNumber"
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="123456789"
                          className="mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#3D5126] focus:outline-none focus:ring-1 focus:ring-[#3D5126]"
                        />
                        <p className="mt-1 text-[11px] text-gray-500">
                          Format 9-13 digit tanpa spasi atau tanda hubung.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">Billing address</h2>
                    <label className="mt-3 flex items-center gap-2.5 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={useDeliveryAsBilling}
                        onChange={(e) => setUseDeliveryAsBilling(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-[#3D5126] focus:ring-[#3D5126]"
                      />
                      <span>Use delivery address as billing address</span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">Delivery method</h2>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedCourierId("samangga-logistik")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setSelectedCourierId("samangga-logistik");
                        }}
                        className={`flex flex-col justify-between rounded-md p-3.5 border transition-all cursor-pointer text-left ${
                          selectedCourierId === "samangga-logistik"
                            ? "border-2 border-[#3D5126] bg-[#95A87A]/10 shadow-xs ring-1 ring-[#3D5126]"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-900">
                              SAMANGGA FLEET
                            </p>
                            <p className="mt-1 text-sm font-black text-gray-900">
                              {formatRupiah(35000)}
                            </p>
                          </div>
                          <div
                            className={`flex h-4 w-4 rounded-full border items-center justify-center ${
                              selectedCourierId === "samangga-logistik"
                                ? "border-[#3D5126] bg-[#3D5126]"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {selectedCourierId === "samangga-logistik" && (
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-[10px] text-gray-400">Package arrives:</p>
                          <p className="text-xs font-bold text-gray-800">Tomorrow</p>
                        </div>
                      </div>

                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedCourierId("ekspedisi-kargo")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setSelectedCourierId("ekspedisi-kargo");
                        }}
                        className={`flex flex-col justify-between rounded-md p-3.5 border transition-all cursor-pointer text-left ${
                          selectedCourierId === "ekspedisi-kargo"
                            ? "border-2 border-[#3D5126] bg-[#95A87A]/10 shadow-xs ring-1 ring-[#3D5126]"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-900">
                              FEDEX / JNE
                            </p>
                            <p className="mt-1 text-sm font-black text-gray-900">
                              {formatRupiah(22000)}
                            </p>
                          </div>
                          <div
                            className={`flex h-4 w-4 rounded-full border items-center justify-center ${
                              selectedCourierId === "ekspedisi-kargo"
                                ? "border-[#3D5126] bg-[#3D5126]"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {selectedCourierId === "ekspedisi-kargo" && (
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-[10px] text-gray-400">Package arrives:</p>
                          <p className="text-xs font-bold text-gray-800">Friday, 06.11.2026</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
                    >
                      BACK
                    </button>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-md bg-[#3D5126] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#273419] active:scale-95 transition-all"
                    >
                      NEXT STEP &gt;
                    </button>
                  </div>
                </form>
              </div>
            )}

            {((orderType === "cod" && step === 2) || (orderType === "paket" && step === 3)) && (
              <div className="rounded-2xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-sm">
                <header>
                  <span className="rounded-full bg-[#3D5126]/10 px-3 py-1 text-xs font-bold text-[#3D5126]">
                    {orderType === "cod" ? "Tahap 2 (COD)" : "Tahap 3 (Paket)"}
                  </span>
                  <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                    {orderType === "cod" ? "Metode Pembayaran COD" : "Payment method"}
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    {orderType === "cod"
                      ? "Pilih bayar langsung di kasir mitra saat mengambil buah, atau bayar di muka via QRIS / VA."
                      : "Pilih kanal pembayaran terenkripsi yang aman untuk menyelesaikan pesanan Anda."}
                  </p>
                </header>

                <div className="mt-6 space-y-4">
                  {orderType === "cod" && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setMetodePembayaran("Kasir COD")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setMetodePembayaran("Kasir COD");
                      }}
                      className={`rounded-xl border p-4 transition-all cursor-pointer ${
                        metodePembayaran === "Kasir COD"
                          ? "border-2 border-[#3D5126] bg-[#95A87A]/10 shadow-xs"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-4 w-4 rounded-full border items-center justify-center ${
                              metodePembayaran === "Kasir COD" ? "border-[#3D5126] bg-[#3D5126]" : "border-gray-300"
                            }`}
                          >
                            {metodePembayaran === "Kasir COD" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-gray-900">
                              Bayar di Kasir (Saat Mengambil Buah)
                            </span>
                            <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              Paling Praktis
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-1.5 pl-7 text-xs text-gray-500 leading-relaxed">
                        Anda tidak perlu bayar sekarang. Cukup selesaikan pesanan untuk mendapatkan nota digital. Saat tiba di lokasi, tunjukkan nota atau scan ke kasir untuk bayar &amp; ambil buah.
                      </p>
                    </div>
                  )}

                  {PAYMENT_OPTIONS.map((pay) => {
                    const active = metodePembayaran === pay.method;
                    return (
                      <div
                        key={pay.method}
                        role="button"
                        tabIndex={0}
                        onClick={() => setMetodePembayaran(pay.method)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setMetodePembayaran(pay.method);
                        }}
                        className={`rounded-xl border p-4 transition-all cursor-pointer ${
                          active
                            ? "border-2 border-[#3D5126] bg-[#95A87A]/10 shadow-xs"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-4 w-4 rounded-full border items-center justify-center ${
                                active ? "border-[#3D5126] bg-[#3D5126]" : "border-gray-300"
                              }`}
                            >
                              {active && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </div>
                            <span className="text-sm font-bold text-gray-900">{pay.title}</span>
                          </div>
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                            {pay.badge}
                          </span>
                        </div>
                        <p className="mt-1.5 pl-7 text-xs text-gray-500 leading-relaxed">
                          {pay.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-xl border border-gray-200 bg-[#F8FAFC] p-4 text-xs">
                  {metodePembayaran === "Kasir COD" && (
                    <div className="p-3 text-center sm:text-left space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <StoreIcon className="h-5 w-5" />
                        <span>Instruksi Pembayaran Kasir COD:</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        Total yang harus disiapkan saat pengambilan di kasir:{" "}
                        <strong className="text-base text-gray-900 font-black">{formatRupiah(grandTotal)}</strong>.
                        Kasir menerima pembayaran tunai maupun scan QRIS di meja kasir mitra.
                      </p>
                    </div>
                  )}

                  {metodePembayaran === "QRIS" && (
                    <div className="flex flex-col items-center text-center p-3">
                      <span className="rounded bg-[#273419] px-2.5 py-0.5 text-[9px] font-bold tracking-widest text-white">
                        QRIS TERPADU · SCAN &amp; BAYAR
                      </span>
                      <div className="my-3 flex h-36 w-36 items-center justify-center rounded-xl border-2 border-[#273419] bg-white p-2 shadow-inner">
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
                      <p className="font-bold text-gray-800">
                        Scan QR ini melalui GoPay, OVO, Dana, ShopeePay, atau BCA Mobile
                      </p>
                      <p className="mt-1 text-gray-500">
                        Total yang harus dibayar: <strong className="text-gray-900">{formatRupiah(grandTotal)}</strong>
                      </p>
                    </div>
                  )}

                  {metodePembayaran === "Virtual Account" && (
                    <div className="space-y-2">
                      <p className="text-gray-500">Nomor Virtual Account Pembayaran:</p>
                      <div className="flex items-center justify-between rounded-lg bg-white border border-gray-200 p-2.5">
                        <span className="font-mono text-base font-bold text-gray-900">
                          880192837465
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy("880192837465")}
                          className="inline-flex items-center gap-1 rounded-md border border-[#3D5126] px-2.5 py-1 text-[11px] font-bold text-[#3D5126] hover:bg-[#95A87A]/20"
                        >
                          <CopyIcon className="h-3 w-3" />
                          <span>{copiedCode ? "Tersalin!" : "Salin VA"}</span>
                        </button>
                      </div>
                      <p className="text-gray-500">
                        Transfer tepat sesuai nominal: <strong>{formatRupiah(grandTotal)}</strong>
                      </p>
                    </div>
                  )}

                  {metodePembayaran === "Transfer Manual" && (
                    <div className="space-y-2.5">
                      <p className="text-gray-500">Rekening Bersama Koperasi Mitra SAMANGGA:</p>
                      <div className="rounded-lg bg-white border border-gray-200 p-2.5">
                        <p className="font-mono font-bold text-gray-900">BRI 0029-01-029384-530 a.n. SAMANGGA INDRAMAYU</p>
                      </div>
                      <div>
                        <label htmlFor="bukti-transfer" className="block font-semibold text-gray-700">
                          Unggah Bukti Transfer (Opsional):
                        </label>
                        <input
                          id="bukti-transfer"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setBuktiTransferName(file.name);
                          }}
                          className="mt-1 block w-full text-[11px] text-gray-500 file:mr-2 file:rounded-md file:border-0 file:bg-[#3D5126] file:px-2.5 file:py-1 file:text-xs file:font-bold file:text-white"
                        />
                        {buktiTransferName && (
                          <p className="mt-1 font-semibold text-emerald-700">
                            ✓ Terpilih: {buktiTransferName}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(orderType === "cod" ? 1 : 2)}
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    BACK
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    className="inline-flex items-center justify-center rounded-md bg-[#3D5126] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#273419] active:scale-95 transition-all"
                  >
                    {orderType === "cod" ? "SELESAIKAN & DAPATKAN NOTA KASIR >" : "CONFIRM ORDER >"}
                  </button>
                </div>
              </div>
            )}

            {orderType === "cod" && step === 3 && (
              <div className="rounded-2xl border-2 border-[#3D5126] bg-white p-6 sm:p-8 shadow-lg">
                <div className="border-b-2 border-dashed border-gray-200 pb-5 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-[#3D5126]">
                    <ReceiptIcon className="h-7 w-7" />
                  </div>
                  <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800">
                    Pesanan COD Berhasil Dibuat!
                  </span>
                  <h1 className="mt-2 text-2xl font-black text-gray-900 tracking-tight">
                    NOTA DIGITAL PENGAMBILAN KASIR
                  </h1>
                  <p className="mt-1 text-xs text-gray-500">
                    Tunjukkan nota atau scan barcode / QR di bawah ini ke kasir mitra saat pengambilan.
                  </p>
                </div>

                <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
                  <p className="text-xs font-extrabold text-amber-900">
                    💡 PAS DATANG KE KASIR MITRA:
                  </p>
                  <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                    Tunjukkan nota ini kepada kasir kebun/gudang mitra atau scan QR Code di bawah. Kasir akan memverifikasi nota dan menyerahkan buah mangga pesanan Anda.
                  </p>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row items-center justify-around gap-6 rounded-2xl border border-gray-200 bg-[#F8FAFC] p-6">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      SCAN QR NOTA KASIR
                    </span>
                    <div className="flex h-32 w-32 items-center justify-center rounded-xl border-2 border-gray-800 bg-white p-2 shadow-xs">
                      <svg viewBox="0 0 120 120" className="h-full w-full text-gray-900">
                        <rect x="8" y="8" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="6" />
                        <rect x="18" y="18" width="12" height="12" fill="currentColor" />
                        <rect x="80" y="8" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="6" />
                        <rect x="90" y="18" width="12" height="12" fill="currentColor" />
                        <rect x="8" y="80" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="6" />
                        <rect x="18" y="90" width="12" height="12" fill="currentColor" />
                        <rect x="52" y="16" width="8" height="12" fill="currentColor" />
                        <rect x="64" y="24" width="8" height="16" fill="currentColor" />
                        <rect x="48" y="48" width="24" height="24" rx="2" fill="#3D5126" />
                        <rect x="16" y="52" width="20" height="8" fill="currentColor" />
                        <rect x="82" y="52" width="24" height="8" fill="currentColor" />
                        <rect x="52" y="82" width="12" height="20" fill="currentColor" />
                        <rect x="74" y="78" width="14" height="14" fill="currentColor" />
                        <rect x="92" y="92" width="16" height="16" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="mt-2 font-mono text-xs font-extrabold text-gray-900">
                      #{orderNumber}
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      BARCODE SCANNER KASIR
                    </span>
                    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-xs">
                      <svg viewBox="0 0 160 50" className="h-12 w-44 text-gray-900">
                        <rect x="4" y="0" width="4" height="50" fill="currentColor" />
                        <rect x="12" y="0" width="2" height="50" fill="currentColor" />
                        <rect x="18" y="0" width="6" height="50" fill="currentColor" />
                        <rect x="28" y="0" width="2" height="50" fill="currentColor" />
                        <rect x="34" y="0" width="4" height="50" fill="currentColor" />
                        <rect x="42" y="0" width="6" height="50" fill="currentColor" />
                        <rect x="52" y="0" width="2" height="50" fill="currentColor" />
                        <rect x="58" y="0" width="6" height="50" fill="currentColor" />
                        <rect x="68" y="0" width="4" height="50" fill="currentColor" />
                        <rect x="76" y="0" width="2" height="50" fill="currentColor" />
                        <rect x="82" y="0" width="6" height="50" fill="currentColor" />
                        <rect x="92" y="0" width="4" height="50" fill="currentColor" />
                        <rect x="100" y="0" width="2" height="50" fill="currentColor" />
                        <rect x="106" y="0" width="6" height="50" fill="currentColor" />
                        <rect x="116" y="0" width="4" height="50" fill="currentColor" />
                        <rect x="124" y="0" width="2" height="50" fill="currentColor" />
                        <rect x="130" y="0" width="6" height="50" fill="currentColor" />
                        <rect x="140" y="0" width="2" height="50" fill="currentColor" />
                        <rect x="146" y="0" width="4" height="50" fill="currentColor" />
                        <rect x="154" y="0" width="2" height="50" fill="currentColor" />
                      </svg>
                      <span className="mt-1 font-mono text-[11px] font-bold text-gray-700 tracking-widest">
                        SMG-COD-892145-IMY
                      </span>
                    </div>
                    <span className="mt-2 text-[10px] text-gray-400">
                      Kompatibel dengan semua scanner POS mitra
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-2 border-t border-gray-200 pt-4 text-xs">
                  <div className="flex justify-between border-b border-gray-100 pb-1.5">
                    <span className="font-bold text-gray-500 uppercase">Lokasi Pengambilan</span>
                    <span className="font-semibold text-gray-900 text-right">
                      {checkoutItems[0].seller} ({checkoutItems[0].location})
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1.5">
                    <span className="font-bold text-gray-500 uppercase">Metode Pembayaran</span>
                    <span className="font-semibold text-emerald-800">
                      {metodePembayaran === "Kasir COD" ? "Bayar di Kasir (Tunai / QRIS)" : metodePembayaran}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1.5">
                    <span className="font-bold text-gray-500 uppercase">Total Tagihan Nota</span>
                    <span className="font-extrabold text-base text-[#3D5126]">
                      {formatRupiah(grandTotal)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cetak / Simpan Nota
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="rounded-md border-2 border-[#3D5126] bg-[#95A87A]/20 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#3D5126] hover:bg-[#95A87A]/35 transition-colors"
                  >
                    🔄 Uji Coba Lagi / Pesan Baru
                  </button>
                  <Link
                    href="/katalog"
                    className="rounded-md bg-[#3D5126] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#273419] transition-colors"
                  >
                    Belanja Produk Lain &gt;
                  </Link>
                </div>
              </div>
            )}

            {orderType === "paket" && step === 4 && (
              <div className="rounded-2xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col items-center text-center py-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-[#3D5126]">
                    <CheckIcon className="h-8 w-8" />
                  </div>
                  <h1 className="mt-4 text-2xl font-black text-gray-900">
                    Order successfully confirmed!
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 max-w-md">
                    Terima kasih telah memesan komoditas mangga Indramayu melalui ekosistem rantai pasok SAMANGGA.
                  </p>

                  <div className="mt-6 rounded-xl border border-gray-200 bg-[#F8FAFC] p-4 text-left w-full max-w-lg space-y-2 text-xs">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="font-bold text-gray-500 uppercase">Order ID</span>
                      <span className="font-mono font-black text-gray-900">#{orderNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="font-bold text-gray-500 uppercase">Penerima</span>
                      <span className="font-semibold text-gray-900">{firstName} {secondName}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="font-bold text-gray-500 uppercase">Alamat Kirim</span>
                      <span className="font-semibold text-gray-900 text-right truncate max-w-[240px]">
                        {streetAddress}, {city}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="font-bold text-gray-500 uppercase">Ekspedisi Kurir</span>
                      <span className="font-semibold text-gray-900">{selectedCourier.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="font-bold text-gray-500 uppercase">Metode Pembayaran</span>
                      <span className="font-semibold text-gray-900">{metodePembayaran}</span>
                    </div>
                    <div className="flex justify-between pt-1 text-sm font-bold">
                      <span className="text-gray-900">Total Pembayaran</span>
                      <span className="text-[#3D5126]">{formatRupiah(grandTotal)}</span>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cetak Invoice
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="rounded-md border-2 border-[#3D5126] bg-[#95A87A]/20 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#3D5126] hover:bg-[#95A87A]/35 transition-colors"
                    >
                      🔄 Uji Coba Lagi / Pesan Baru
                    </button>
                    <Link
                      href="/katalog"
                      className="rounded-md bg-[#3D5126] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#273419] transition-colors"
                    >
                      Belanja Produk Lain &gt;
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="lg:col-span-5 xl:col-span-4 space-y-6">
            <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-gray-900">Order summary</h2>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-gray-600">
                  {orderType === "cod" ? "COD Kasir" : "Paket Kurir"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-b border-gray-200 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <span className="flex-1">PRODUCT</span>
                <span className="w-12 text-center">QTY</span>
                <span className="w-20 text-right">PRICE</span>
              </div>

              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {checkoutItems.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-500">
                    <p>Semua barang telah dihapus dari pesanan.</p>
                    <Link
                      href="/katalog"
                      className="mt-2 inline-block font-bold text-[#3D5126] underline"
                    >
                      Kembali Belanja di Katalog &rarr;
                    </Link>
                  </div>
                ) : (
                  checkoutItems.map((item) => (
                    <div key={item.id} className="py-3 flex items-center gap-2.5">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100 border border-gray-200">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400 text-[10px]">
                            Mangga
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="inline-block rounded bg-[#95A87A]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#166534]">
                          {item.category}
                        </span>
                        <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {formatRupiah(item.price)}/{item.priceUnit}
                        </p>
                      </div>

                      <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="h-6 w-6 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-l-lg"
                          title="Kurangi"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="h-6 w-6 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-r-lg"
                          title="Tambah"
                        >
                          +
                        </button>
                      </div>

                      <span className="w-16 text-right text-xs font-bold text-gray-900 truncate">
                        {formatRupiah(item.price * item.quantity)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600 text-xs font-bold p-1"
                        title="Hapus barang ini"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 space-y-2 border-t border-gray-200 pt-3 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal ({totalItemCount} items)</span>
                  <span className="font-bold text-gray-900">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>
                    {orderType === "cod" ? "Biaya Ambil (COD Kasir)" : "Shipping cost"}
                  </span>
                  <span className="font-bold text-gray-900">
                    {shippingCost === 0 ? "Gratis (Rp 0)" : formatRupiah(shippingCost)}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between border-t border-gray-200 pt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-900">Total</span>
                <span className="text-xl font-extrabold text-gray-900">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Need help? Contact us!
              </h3>
              <p className="mt-2 text-[11px] text-gray-500">Please call:</p>
              <p className="text-lg font-black text-gray-900 tracking-tight">
                +62 812 321 123
              </p>
              <div className="mt-2 space-y-0.5 text-[11px] text-gray-500">
                <p>Monday - Friday: 8:00 - 20:00</p>
                <p>Saturday: 8:00 - 16:00</p>
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                Delivery methods
              </span>
              <div className="flex items-center gap-2">
                <div className="flex h-9 items-center rounded-md border border-gray-200 bg-white px-3 shadow-2xs">
                  <span className="text-xs font-black tracking-tighter text-amber-600">SAMANGGA</span>
                </div>
                <div className="flex h-9 items-center rounded-md border border-gray-200 bg-white px-3 shadow-2xs">
                  <span className="text-xs font-black tracking-tight text-blue-700">FedEx.</span>
                </div>
                <div className="flex h-9 items-center rounded-md border border-gray-200 bg-white px-3 shadow-2xs">
                  <span className="text-xs font-black tracking-tight text-yellow-600">JNE</span>
                </div>
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                Payment methods
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex h-9 items-center rounded-md border border-gray-200 bg-white px-2.5 shadow-2xs">
                  <span className="text-[11px] font-black tracking-wider text-red-600">QRIS</span>
                </div>
                <div className="flex h-9 items-center rounded-md border border-gray-200 bg-white px-2.5 shadow-2xs">
                  <span className="text-[11px] font-black italic tracking-wider text-blue-900">VISA</span>
                </div>
                <div className="flex h-9 items-center rounded-md border border-gray-200 bg-white px-2.5 shadow-2xs">
                  <span className="text-[11px] font-black tracking-tight text-blue-600">BCA</span>
                </div>
                <div className="flex h-9 items-center rounded-md border border-gray-200 bg-white px-2.5 shadow-2xs">
                  <span className="text-[11px] font-black tracking-tight text-yellow-600">MANDIRI</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
        )}

        <section aria-label="Jaminan Belanja" className="mt-14 border-t border-gray-200 pt-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <LockIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Secure shopping</h4>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  Enkripsi SSL 256-bit dan nota transaksi terverifikasi menjamin keamanan transaksi Anda.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <TruckIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Free and easy returns</h4>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  Garansi panen segar 100%. Ganti buah baru jika terjadi cacat saat pengambilan atau pengiriman.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <ShieldCheckIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Direct from Farmers</h4>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  100% dipasok langsung dari kelompok tani binaan dan kebun bersertifikat Indramayu tanpa tengkulak.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-12 text-center text-xs text-gray-400">
          © SAMANGGA - Sistem Agribisnis Mangga Terpadu 2026
        </footer>
      </main>
    </div>
  );
}

export default function PesanSekarang(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F6F9] text-[#273419] flex items-center justify-center">
          <p className="text-sm font-bold text-gray-600">Memuat formulir checkout SAMANGGA...</p>
        </div>
      }
    >
      <PesanSekarangContent />
    </Suspense>
  );
}
