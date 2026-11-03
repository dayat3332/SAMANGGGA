/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { JSX } from "react";
import { MenuIcon } from "@/components/ui/Icons";

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

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

/** Logo: ikon mangga sederhana + wordmark. */
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
  const [open, setOpen] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    if (href === "/katalog") return pathname.startsWith("/katalog") || pathname.startsWith("/pesan");
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav aria-label="Navigasi utama" className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        {/* Tautan tengah (desktop) */}
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

        {/* Kanan */}
        <div className="flex items-center gap-2">
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

      {/* Menu mobile */}
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
          </ul>
        </div>
      ) : null}
    </header>
  );
}
