"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { JSX } from "react";
import {
  ArrowRightIcon,
  BasketIcon,
  HouseIcon,
  MenuIcon,
  UserGearIcon,
} from "@/components/ui/Icons";
import { DEFAULT_PROFILES, ROLE_STORAGE_KEY, type RoleSlug } from "@/data/profil";
import { getCartItems, subscribeCart } from "@/lib/cart";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Katalog Bahan Baku", href: "/katalog" },
  { label: "Pasar Sirkular", href: "/pasar-sirkular" },
  { label: "Tentang Kami", href: "/tentang" },
];

const REGISTER_HREF = "/daftar";
const AUTH_EVENT = "samangga_auth_change";

export function notifyAuthChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
}

function subscribeAuth(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_EVENT, callback);
  };
}

function getAuthSnapshot(): RoleSlug | null {
  if (typeof window === "undefined") return null;
  const savedRole = window.localStorage.getItem(ROLE_STORAGE_KEY) as RoleSlug | null;
  return savedRole && DEFAULT_PROFILES[savedRole] ? savedRole : null;
}

function getServerAuthSnapshot(): RoleSlug | null {
  return null;
}

function getCartCountSnapshot(): number {
  return getCartItems().reduce((acc, it) => acc + it.quantity, 0);
}

function getServerCartCountSnapshot(): number {
  return 0;
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export function Logo(): JSX.Element {
  return (
    <Link
      href="/"
      aria-label="SAMANGGA — beranda"
      className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#95A87A]"
    >
      <img src="/images/logo_web.png" alt="Logo SAMANGGA" className="h-7 w-7 object-contain" />
      <span className="text-base font-extrabold tracking-tight text-[#273419]">SAMANGGA</span>
    </Link>
  );
}

export function Navbar(): JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const userRole = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
  const cartItemCount = useSyncExternalStore(
    subscribeCart,
    getCartCountSnapshot,
    getServerCartCountSnapshot,
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent): void => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [profileMenuOpen]);

  const handleLogout = (): void => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ROLE_STORAGE_KEY);
      notifyAuthChange();
    }
    setProfileMenuOpen(false);
    router.push("/login");
  };

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    if (href === "/katalog") return pathname.startsWith("/katalog") || pathname.startsWith("/pesan");
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const currentProfile = userRole ? DEFAULT_PROFILES[userRole] : null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav aria-label="Navigasi utama" className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-sm font-semibold text-[#273419] transition-colors hover:bg-[#95A87A]/30 ${FOCUS_RING} ${
                  isActive(item.href) ? "bg-[#95A87A]/35" : ""
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/keranjang"
            aria-label={`Keranjang belanja, ${cartItemCount} item`}
            className="relative inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-[#273419] shadow-xs hover:border-[#3D5126] hover:bg-[#95A87A]/15 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126]"
          >
            <BasketIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[#FFB81C] text-[10px] sm:text-xs font-black text-[#273419] shadow-xs ring-2 ring-white">
                {cartItemCount}
              </span>
            )}
          </Link>

          {currentProfile ? (
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
                aria-label="Menu profil pengguna"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1 pr-3 text-[#273419] shadow-xs transition-colors hover:border-[#3D5126] hover:bg-[#95A87A]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3D5126] text-xs font-bold text-white shadow-xs">
                  {currentProfile.nama_lengkap
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="max-w-[110px] truncate text-xs font-bold text-[#273419]">
                    {currentProfile.nama_lengkap.split(" ")[0]}
                  </p>
                  <p className="text-[10px] font-semibold text-[#166534]">
                    {currentProfile.peranErd}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400">▼</span>
              </button>

              {profileMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50"
                >
                  <div className="border-b border-gray-100 px-3 py-2.5">
                    <p className="text-xs font-bold text-[#273419] truncate">{currentProfile.nama_lengkap}</p>
                    <p className="text-[11px] text-gray-500 truncate">{currentProfile.email}</p>
                    <span className="mt-1 inline-block rounded-md bg-[#95A87A]/20 px-2 py-0.5 text-[10px] font-bold text-[#166534]">
                      {currentProfile.peranErd}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href={`/dashboard/${currentProfile.slug}`}
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#273419] transition-colors hover:bg-[#95A87A]/20"
                    >
                      <HouseIcon className="h-4 w-4 text-[#3D5126]" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href={`/profil/${currentProfile.slug}`}
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#273419] transition-colors hover:bg-[#95A87A]/20"
                    >
                      <UserGearIcon className="h-4 w-4 text-[#3D5126]" />
                      <span>Profil Akun</span>
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`hidden min-h-10 items-center rounded-full border border-gray-300 px-4 text-sm font-semibold text-[#273419] transition-colors hover:border-[#3D5126] hover:bg-[#95A87A]/20 sm:inline-flex ${FOCUS_RING}`}
              >
                Masuk
              </Link>
              <Link
                href={REGISTER_HREF}
                className={`hidden min-h-10 items-center rounded-full bg-[#3D5126] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#273419] sm:inline-flex ${FOCUS_RING}`}
              >
                Daftar Mitra
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-[#273419] hover:bg-[#95A87A]/30 lg:hidden ${FOCUS_RING}`}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </nav>

      {open ? (
        <div id="menu-mobile" className="border-t border-gray-200 bg-white lg:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block rounded-lg px-3 py-3 text-base font-semibold text-[#273419] hover:bg-[#95A87A]/30 ${FOCUS_RING} ${
                    isActive(item.href) ? "bg-[#95A87A]/35" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {currentProfile ? (
              <li className="pt-2 border-t border-gray-100 sm:hidden">
                <div className="rounded-xl bg-[#95A87A]/15 p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3D5126] text-xs font-bold text-white">
                      {currentProfile.nama_lengkap
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-[#273419]">
                        {currentProfile.nama_lengkap}
                      </p>
                      <p className="text-[11px] font-semibold text-[#166534]">
                        {currentProfile.peranErd}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      href={`/dashboard/${currentProfile.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex min-h-10 items-center justify-center rounded-lg bg-[#3D5126] text-xs font-semibold text-white shadow-xs"
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                      className="flex min-h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              </li>
            ) : (
              <li className="grid grid-cols-2 gap-2 pt-2 sm:hidden">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className={`flex min-h-11 items-center justify-center rounded-full border border-gray-300 text-base font-semibold text-[#273419] hover:bg-gray-50 ${FOCUS_RING}`}
                >
                  Masuk
                </Link>
                <Link
                  href={REGISTER_HREF}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-11 items-center justify-center rounded-full bg-[#3D5126] text-base font-semibold text-white hover:bg-[#273419] ${FOCUS_RING}`}
                >
                  Daftar Mitra
                </Link>
              </li>
            )}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
