/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent, JSX } from "react";
import { Navbar } from "@/components/layout/SiteNavbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WasteIcon } from "@/components/ui/Illustrations";
import { JENIS_LIMBAH_OPTIONS } from "@/data/pasar-sirkular";
import { formatRupiah } from "@/lib/format";
import type { JenisLimbah } from "@/types/samangga";

const JENIS_IMAGE_MAP: Record<JenisLimbah, string> = {
  Kulit: "/images/limbah/limbah_kulit_mangga.jpg",
  Biji: "/images/limbah/limbah_biji_mangga.jpg",
  Daun: "/images/limbah/limbah_daun_mangga.jpg",
  "Buah Afkir": "/images/mangga/mangga_afkir.jpg",
};

export default function SetorLimbah(): JSX.Element {
  const [jenis, setJenis] = useState<JenisLimbah>("Kulit");
  const [pemilik, setPemilik] = useState<string>("");
  const [lokasi, setLokasi] = useState<string>("Lohbener, Indramayu");
  const [beratKg, setBeratKg] = useState<number>(100);
  const [kondisi, setKondisi] = useState<string>("Segar, < 24 jam, terpisah dari sampah plastik");
  const [noWhatsapp, setNoWhatsapp] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const selectedMeta = JENIS_LIMBAH_OPTIONS.find((j) => j.jenis === jenis) ?? JENIS_LIMBAH_OPTIONS[0];
  const estimasiHarga = beratKg * selectedMeta.ratePerKg;

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#273419]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <Link
            href="/pasar-sirkular"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3D5126] hover:text-[#273419]"
          >
            ← Kembali ke Pasar Sirkular
          </Link>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#273419] sm:text-3xl">
            Setor Limbah Mangga ke Pasar Sirkular
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            Catatkan kulit, biji, daun, atau buah afkir dari kebun maupun dapur UMKM Anda agar dapat diverifikasi dan
            dijemput oleh Mitra Pengolah.
          </p>
        </div>

        {submitted ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-[#3D5126] bg-white p-8 text-center shadow-md">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#273419] p-3">
              <WasteIcon jenis={jenis} />
            </div>
            <span className="mt-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
              Status Verifikasi: Menunggu · Status Limbah: Tersedia
            </span>
            <h2 className="mt-3 text-xl font-extrabold text-[#273419]">
              Data Setoran Limbah Berhasil Dicatat!
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              Batch <strong>Limbah {jenis} ({beratKg} kg)</strong> milik <strong>{pemilik}</strong> di{" "}
              <strong>{lokasi}</strong> dengan nilai estimasi <strong>{formatRupiah(estimasiHarga)}</strong> sedang
              diverifikasi oleh Admin Limbah SAMANGGA. Setelah terverifikasi, Mitra Pengolah dapat langsung menekan
              tombol <strong>Jemput</strong>.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/pasar-sirkular"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3D5126] px-6 text-sm font-bold text-white hover:bg-[#273419]"
              >
                Lihat Pasar Sirkular
              </Link>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Setor Batch Lain
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
            {/* Kiri: Preview Kartu di Pasar Sirkular */}
            <aside className="lg:col-span-5">
              <div className="sticky top-20 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-md">
                <div className="relative flex h-48 w-full items-center justify-center bg-gray-100 overflow-hidden">
                  <img
                    src={JENIS_IMAGE_MAP[jenis]}
                    alt={`Limbah ${jenis} Mangga`}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-3.5 left-3.5 rounded-full bg-[#3D5126]/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    Pratinjau Listing
                  </span>
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-extrabold text-[#273419]">Limbah {jenis} Mangga</h2>
                  <p className="mt-1 text-xs text-gray-600">
                    Oleh <strong>{pemilik || "Nama Petani / UMKM Anda"}</strong> · {lokasi}
                  </p>
                  <p className="mt-2 text-xs text-gray-600">{selectedMeta.desc}</p>
                  <div className="mt-3 rounded-xl border border-[#95A87A]/60 bg-[#95A87A]/15 p-3 text-xs">
                    <span className="font-bold text-[#273419]">Potensi Hilirisasi: </span>
                    {selectedMeta.usage}
                  </div>
                  <div className="mt-4 flex items-baseline justify-between border-t border-gray-200 pt-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Estimasi Nilai ({beratKg} kg)
                    </span>
                    <span className="text-xl font-extrabold text-[#3D5126]">
                      {formatRupiah(estimasiHarga)}
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Kanan: Form Setor */}
            <section className="lg:col-span-7">
              <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <h2 className="text-lg font-extrabold text-[#273419]">
                  Formulir Pencatatan Limbah (Tabel Limbah)
                </h2>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                    Pilih Jenis Limbah <span className="text-red-600">*</span>
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {JENIS_LIMBAH_OPTIONS.map((opt) => {
                      const active = jenis === opt.jenis;
                      return (
                        <button
                          key={opt.jenis}
                          type="button"
                          onClick={() => setJenis(opt.jenis)}
                          className={`rounded-xl border p-3 text-left transition-all ${
                            active
                              ? "border-2 border-[#3D5126] bg-[#95A87A]/20 shadow-xs"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <p className="text-xs font-bold text-[#273419]">{opt.jenis}</p>
                          <p className="mt-0.5 text-[11px] text-gray-600">
                            ±{formatRupiah(opt.ratePerKg)}/kg
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="pemilik" className="block text-xs font-bold text-[#273419]">
                      Nama Kelompok Tani / UMKM Pemilik <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="pemilik"
                      type="text"
                      required
                      value={pemilik}
                      onChange={(e) => setPemilik(e.target.value)}
                      placeholder="Contoh: KT Sido Makmur / UMKM Bu Ning"
                      className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-[#273419] focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
                    />
                  </div>
                  <div>
                    <label htmlFor="noWa" className="block text-xs font-bold text-[#273419]">
                      Nomor WhatsApp Titik Jemput <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="noWa"
                      type="tel"
                      required
                      value={noWhatsapp}
                      onChange={(e) => setNoWhatsapp(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-[#273419] focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="beratKg" className="block text-xs font-bold text-[#273419]">
                      Estimasi Berat Limbah (kg) <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="beratKg"
                      type="number"
                      min={10}
                      required
                      value={beratKg}
                      onChange={(e) => setBeratKg(Math.max(10, Number(e.target.value) || 10))}
                      className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-[#273419] focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
                    />
                  </div>
                  <div>
                    <label htmlFor="lokasi" className="block text-xs font-bold text-[#273419]">
                      Kecamatan / Lokasi Penjemputan <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="lokasi"
                      type="text"
                      required
                      value={lokasi}
                      onChange={(e) => setLokasi(e.target.value)}
                      placeholder="Contoh: Lohbener, Indramayu"
                      className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-[#273419] focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="kondisi" className="block text-xs font-bold text-[#273419]">
                    Kondisi Fisik Limbah <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="kondisi"
                    type="text"
                    required
                    value={kondisi}
                    onChange={(e) => setKondisi(e.target.value)}
                    placeholder="Contoh: Kering bersih / Segar < 24 jam terpisah dari plastik"
                    className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-[#273419] focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#3D5126] px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-[#273419]"
                >
                  Tayangkan ke Pasar Sirkular ({formatRupiah(estimasiHarga)})
                </button>
              </form>
            </section>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
