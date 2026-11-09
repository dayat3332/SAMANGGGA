"use client";

import Link from "next/link";
import type { JSX } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Navbar } from "@/components/layout/SiteNavbar";
import {
  ArrowRightIcon,
  FactoryIcon,
  RecycleIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SproutIcon,
} from "@/components/ui/Icons";
import { DEFAULT_PROFILES, ROLE_NAVIGATION_LIST, type RoleSlug } from "@/data/profil";

function getRoleIcon(slug: RoleSlug): JSX.Element {
  switch (slug) {
    case "petani":
      return <SproutIcon className="h-6 w-6" />;
    case "umkm":
      return <FactoryIcon className="h-6 w-6" />;
    case "mitra":
      return <RecycleIcon className="h-6 w-6" />;
    case "konsumen":
      return <ShoppingBagIcon className="h-6 w-6" />;
    case "admin":
      return <ShieldCheckIcon className="h-6 w-6" />;
  }
}

const ERD_CLUSTERS = [
  {
    cluster: "1. AKUN DAN PROFIL",
    tables: ["Pengguna", "Supplier", "UMKM", "Mitra", "Konsumen", "Admin"],
    desc: "Tabel induk Pengguna dengan ENUM(Supplier, UMKM, Mitra, Konsumen, Admin) yang berelasi 1:0..1 (memiliki profil) ke 5 tabel entitas peran.",
  },
  {
    cluster: "2. PRODUK DAN TRANSAKSI",
    tables: ["Produk", "Transaksi", "Detail Transaksi", "Pembayaran"],
    desc: "Pengguna menawarkan Produk (Buah/Olahan). Transaksi mencatat id_pembeli & id_penjual, Detail Transaksi, serta Pembayaran (Transfer Manual, VA, QRIS).",
  },
  {
    cluster: "3. LIMBAH, PENGIRIMAN, DAN KEUANGAN",
    tables: ["Limbah", "Riwayat Pengiriman", "Pencatatan Keuangan"],
    desc: "UMKM mencatat Limbah, Mitra menjemput Limbah & menangani Riwayat Pengiriman. Pencatatan Keuangan wajib beracuan pada id_transaksi atau id_limbah.",
  },
  {
    cluster: "4. LOG SISTEM",
    tables: ["Log Sistem"],
    desc: "Pengguna memicu log sistem (Info, Warning, Error) beserta endpoint_api, kode_status, pesan, dan detail_error.",
  },
] as const;

export default function PortalRoleErd(): JSX.Element {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#273419]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#3D5126]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#3D5126]">
            Arsitektur 14 Tabel & 5 Peran Pengguna
          </div>
          <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-[#273419] sm:text-3xl">
            Portal Dashboard Masing-Masing Role ERD SAMANGGA
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
            Pilih salah satu dari <strong>5 peran (`peran : ENUM(Supplier, UMKM, Mitra, Konsumen, Admin)`)</strong>{" "}
            di bawah ini untuk membuka halaman dashboard operasional yang menerapkan logika relasi, atribut, dan
            aturan bisnis sesuai diagram ERD SAMANGGA.
          </p>
        </header>

        <section aria-label="Daftar halaman role ERD" className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ROLE_NAVIGATION_LIST.map((role) => {
            const prof = DEFAULT_PROFILES[role.slug];
            return (
              <div
                key={role.slug}
                className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-xs transition-all hover:border-[#3D5126] hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3D5126] text-white">
                      {getRoleIcon(role.slug)}
                    </span>
                    <span className="rounded-full bg-[#95A87A]/25 px-3 py-1 font-mono text-[11px] font-bold text-[#273419]">
                      {role.tableErd}
                    </span>
                  </div>

                  <p className="mt-4 font-mono text-xs font-bold uppercase tracking-wider text-[#3D5126]">
                    ENUM peran = &apos;{role.peranErd}&apos;
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold text-[#273419]">{role.label}</h2>
                  <p className="mt-1 text-xs font-semibold text-gray-700">
                    Akun Demo: {prof.nama_lengkap} (`id_user = #{prof.id_user}`)
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-gray-600">{role.summary}</p>
                </div>

                <div className="mt-5 border-t border-gray-100 pt-4">
                  <Link
                    href={role.href}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#3D5126] px-4 text-xs font-bold text-white transition-colors hover:bg-[#273419]"
                  >
                    <span>Buka Halaman Dashboard {role.peranErd}</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </section>

        <section aria-label="Klaster tabel ERD" className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-xs sm:p-8">
          <h2 className="text-lg font-extrabold text-[#273419]">
            Struktur 4 Klaster Domain pada Gambar ERD SAMANGGA
          </h2>
          <p className="mt-1 text-xs text-gray-600">
            Seluruh 14 entitas pada gambar ERD saling terhubung melalui halaman operasional di atas:
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ERD_CLUSTERS.map((c) => (
              <div key={c.cluster} className="rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4">
                <p className="font-mono text-xs font-extrabold text-[#3D5126]">{c.cluster}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.tables.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg border border-gray-300 bg-white px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#273419]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
