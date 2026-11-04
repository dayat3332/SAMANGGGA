"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ChangeEvent, FormEvent, JSX } from "react";
import { Navbar, notifyAuthChange } from "@/components/layout/SiteNavbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  ArrowRightIcon,
  CheckIcon,
  FactoryIcon,
  RecycleIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SproutIcon,
} from "@/components/ui/Icons";
import { ROLE_STORAGE_KEY, type RoleSlug } from "@/data/profil";

export type RoleType = RoleSlug;

interface RoleCardData {
  id: RoleType;
  title: string;
  shortTitle: string;
  badge: string;
  description: string;
  tag: string;
}

const ROLES: readonly RoleCardData[] = [
  {
    id: "petani",
    title: "Petani & Gapoktan",
    shortTitle: "Petani & Kebun",
    badge: "Produsen Hulu",
    description: "Pemilik kebun atau kelompok tani pemasok mangga segar dan limbah panen.",
    tag: "Akses Harga Pasar & Sirkular",
  },
  {
    id: "umkm",
    title: "UMKM & Pengolah",
    shortTitle: "UMKM Olahan",
    badge: "Industri Kuliner",
    description: "Produsen olahan dodol, keripik, puree, sirup, dan produk turunan mangga.",
    tag: "Kepastian Suplai Bahan Baku",
  },
  {
    id: "mitra",
    title: "Bio-Refinery & Residu",
    shortTitle: "Bio-Refinery",
    badge: "Mitra Daur Ulang",
    description: "Fasilitas pengolah kulit, biji, dan daun untuk pakan ternak, kompos, atau pektin.",
    tag: "Pasokan Limbah Terjadwal",
  },
  {
    id: "konsumen",
    title: "Pembeli & Ritel",
    shortTitle: "Pembeli / Ritel",
    badge: "Ritel & Konsumen",
    description: "Pembeli individu, pemilik toko, restoran, atau agen grosir mangga Indramayu.",
    tag: "Langsung dari Sumber Kebun",
  },
];

interface FormDataState {
  namaLengkap: string;
  nomorWhatsapp: string;
  kataSandi: string;
  ulangiKataSandi: string;
  persetujuan: boolean;

  luasLahan: string;
  komoditasUtama: string;

  namaUsaha: string;
  nib: string;
  kapasitasProduksi: string;

  namaInstansi: string;
  kapasitasTampung: string;
  jangkauanArea: string;

  kategoriKonsumen: string;
  alamatPengiriman: string;
}

const INITIAL_FORM_STATE: FormDataState = {
  namaLengkap: "",
  nomorWhatsapp: "",
  kataSandi: "",
  ulangiKataSandi: "",
  persetujuan: false,

  luasLahan: "",
  komoditasUtama: "Gedong Gincu",

  namaUsaha: "",
  nib: "",
  kapasitasProduksi: "",

  namaInstansi: "",
  kapasitasTampung: "",
  jangkauanArea: "",

  kategoriKonsumen: "Ritel",
  alamatPengiriman: "",
};

function getRoleIcon(role: RoleType): JSX.Element {
  switch (role) {
    case "petani":
      return <SproutIcon className="h-5 w-5" />;
    case "umkm":
      return <FactoryIcon className="h-5 w-5" />;
    case "mitra":
      return <RecycleIcon className="h-5 w-5" />;
    case "admin":
      return <ShieldCheckIcon className="h-5 w-5" />;
    case "konsumen":
    default:
      return <ShoppingBagIcon className="h-5 w-5" />;
  }
}

export default function DaftarMitra(): JSX.Element {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleType>("petani");
  const [formData, setFormData] = useState<FormDataState>(INITIAL_FORM_STATE);
  const [passwordMismatch, setPasswordMismatch] = useState<boolean>(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === "kataSandi" || name === "ulangiKataSandi") {
        setPasswordMismatch(false);
      }
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (formData.kataSandi !== formData.ulangiKataSandi) {
      setPasswordMismatch(true);
      return;
    }

    if (!formData.persetujuan) {
      alert("Harap setujui Syarat & Ketentuan Kemitraan Adil untuk melanjutkan pendaftaran.");
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
      notifyAuthChange();
    }

    router.push(`/profil/${selectedRole}`);
  };

  const selectedRoleMeta = ROLES.find((r) => r.id === selectedRole) ?? ROLES[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#273419]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header Pendaftaran */}
        <header className="mb-8">
          <div className="mb-4 inline-flex items-center rounded-full border border-gray-200 bg-white p-1 shadow-xs">
            <span className="rounded-full bg-[#166534] px-4 py-1.5 text-xs font-bold text-white shadow-xs">
              Daftar Mitra Baru
            </span>
            <Link
              href="/login"
              className="rounded-full px-4 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:text-[#273419]"
            >
              Sudah Punya Akun? Masuk ➔
            </Link>
          </div>

          <p className="text-xs font-bold uppercase tracking-wider text-[#166534]">
            Ekosistem Rantai Pasok Mangga Indramayu
          </p>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#273419] sm:text-3xl">
            Pendaftaran & Aktivasi Kemitraan
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-700">
            Pilih peran Anda dalam ekosistem mangga di kolom kiri, lalu lengkapi informasi profil Anda di kolom kanan
            untuk memulai verifikasi akun.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
            <section aria-labelledby="role-selection-title" className="lg:col-span-5">
              <div className="sticky top-20">
                <div className="flex items-center justify-between">
                  <h2 id="role-selection-title" className="text-base font-bold text-[#273419]">
                    1. Pilih Peran Kemitraan
                  </h2>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    Wajib dipilih
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Formulir di sebelah kanan akan otomatis menyesuaikan kebutuhan data sesuai peran yang Anda pilih.
                </p>

                <div className="mt-3 block sm:hidden">
                  <div
                    role="radiogroup"
                    aria-label="Pilihan Peran Kemitraan (Mobile)"
                    className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none -mx-1 px-1"
                  >
                    {ROLES.map((r) => {
                      const isSelected = selectedRole === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedRole(r.id)}
                          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all active:scale-95 ${
                            isSelected
                              ? "border-[#166534] bg-[#166534] text-white shadow-sm ring-2 ring-[#166534]/20"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-xs"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full ${
                              isSelected ? "bg-white/20 text-white" : "bg-emerald-50 text-[#166534]"
                            }`}
                          >
                            {getRoleIcon(r.id)}
                          </span>
                          <span>{r.shortTitle}</span>
                          {isSelected && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#166534]">
                              <CheckIcon className="h-2.5 w-2.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Keterangan Peran Aktif di Mobile */}
                  <div className="mt-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3 text-xs leading-relaxed text-[#273419]">
                    <div className="flex items-center justify-between font-bold text-[#166534]">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#166534]" />
                        {selectedRoleMeta.title}
                      </span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#166534] shadow-xs">
                        {selectedRoleMeta.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-600">{selectedRoleMeta.description}</p>
                    <p className="mt-1 text-[11px] font-semibold text-[#166534]">
                      ✨ {selectedRoleMeta.tag}
                    </p>
                  </div>
                </div>

                <div
                  role="radiogroup"
                  aria-label="Pilihan Peran Kemitraan (Desktop)"
                  className="mt-4 hidden sm:grid sm:grid-cols-2 gap-3"
                >
                  {ROLES.map((r) => {
                    const isSelected = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedRole(r.id)}
                        className={`group relative flex flex-col justify-between rounded-xl p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] ${
                          isSelected
                            ? "border-2 border-[#166534] bg-emerald-50/25 shadow-md ring-2 ring-[#166534]/15"
                            : "border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60 shadow-xs"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                              isSelected
                                ? "bg-[#166534] text-white"
                                : "bg-gray-100 text-gray-600 group-hover:bg-[#166534]/10 group-hover:text-[#166534]"
                            }`}
                          >
                            {getRoleIcon(r.id)}
                          </span>

                          {isSelected ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#166534] text-white">
                              <CheckIcon className="h-3 w-3" />
                            </span>
                          ) : (
                            <span className="h-5 w-5 rounded-full border border-gray-300" aria-hidden="true" />
                          )}
                        </div>

                        <div className="mt-3">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#166534]">
                            {r.badge}
                          </span>
                          <h3 className="text-sm font-bold leading-snug text-[#273419]">
                            {r.title}
                          </h3>
                          <p className="mt-1 text-xs leading-relaxed text-gray-600 line-clamp-3">
                            {r.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-gray-100">
                          <span className="text-[10px] font-medium text-gray-500">
                            {r.tag}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#166534]" />
                    <p className="text-xs leading-relaxed text-gray-600">
                      Seluruh mitra produsen dan pengolah akan diverifikasi secara langsung guna memastikan keaslian asal
                      komoditas mangga Indramayu dan kepatuhan standar lingkungan.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Kolom Formulir Pendaftaran */}
            <section aria-labelledby="form-section-title" className="lg:col-span-7">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
                <div className="border-b border-gray-100 pb-4">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#166534]/10 px-3 py-1 text-xs font-semibold text-[#166534]">
                    Peran Terpilih: {selectedRoleMeta.title}
                  </div>
                  <h2 id="form-section-title" className="mt-2 text-lg font-bold text-[#273419]">
                    2. Lengkapi Data Kemitraan
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-600">
                    Kolom bertanda <span className="text-red-500 font-bold">*</span> wajib diisi.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="namaLengkap" className="block text-xs font-bold text-[#273419]">
                      Nama Lengkap Penanggung Jawab <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="namaLengkap"
                      name="namaLengkap"
                      type="text"
                      required
                      value={formData.namaLengkap}
                      onChange={handleInputChange}
                      placeholder="Contoh: H. Agus Supriyadi"
                      className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]"
                    />
                  </div>

                  <div>
                    <label htmlFor="nomorWhatsapp" className="block text-xs font-bold text-[#273419]">
                      Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-semibold text-gray-500">
                        +62
                      </span>
                      <input
                        id="nomorWhatsapp"
                        name="nomorWhatsapp"
                        type="tel"
                        required
                        value={formData.nomorWhatsapp}
                        onChange={handleInputChange}
                        placeholder="81234567890"
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-12 pr-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-gray-500">
                      Digunakan untuk konfirmasi pesanan, jadwal jemput limbah, dan kode aktivasi.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] p-4 space-y-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#166534]">
                      Informasi Tambahan Khusus: {selectedRoleMeta.badge}
                    </p>

                    {selectedRole === "petani" && (
                      <>
                        <div>
                          <label htmlFor="luasLahan" className="block text-xs font-bold text-[#273419]">
                            Luas Lahan Kebun (m²) <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="luasLahan"
                            name="luasLahan"
                            type="number"
                            min="1"
                            required
                            value={formData.luasLahan}
                            onChange={handleInputChange}
                            placeholder="Contoh: 5000"
                            className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]"
                          />
                        </div>

                        <div>
                          <label htmlFor="komoditasUtama" className="block text-xs font-bold text-[#273419]">
                            Jenis Komoditas Utama <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="komoditasUtama"
                            name="komoditasUtama"
                            required
                            value={formData.komoditasUtama}
                            onChange={handleInputChange}
                            className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#273419] focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]"
                          >
                            <option value="Gedong Gincu">Gedong Gincu (Unggulan Indramayu)</option>
                            <option value="Harumanis">Harumanis / Arumanis</option>
                            <option value="Golek">Mangga Golek</option>
                            <option value="Manalagi">Mangga Manalagi</option>
                            <option value="Campuran">Campuran / Aneka Varietas</option>
                          </select>
                        </div>
                      </>
                    )}

                    {selectedRole === "umkm" && (
                      <>
                        <div>
                          <label htmlFor="namaUsaha" className="block text-xs font-bold text-[#273419]">
                            Nama Usaha / Bisnis <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="namaUsaha"
                            name="namaUsaha"
                            type="text"
                            required
                            value={formData.namaUsaha}
                            onChange={handleInputChange}
                            placeholder="Contoh: Dapur Mangga Bu Ning"
                            className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]"
                          />
                        </div>

                        <div>
                          <label htmlFor="nib" className="block text-xs font-bold text-[#273419]">
                            NIB (Nomor Induk Berusaha) <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="nib"
                            name="nib"
                            type="text"
                            required
                            value={formData.nib}
                            onChange={handleInputChange}
                            placeholder="13 digit NIB usaha Anda"
                            className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]"
                          />
                        </div>

                        <div>
                          <label htmlFor="kapasitasProduksi" className="block text-xs font-bold text-[#273419]">
                            Kapasitas Produksi Bulanan (kg) <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="kapasitasProduksi"
                            name="kapasitasProduksi"
                            type="number"
                            min="1"
                            required
                            value={formData.kapasitasProduksi}
                            onChange={handleInputChange}
                            placeholder="Contoh: 800"
                            className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]"
                          />
                        </div>
                      </>
                    )}

                    {selectedRole === "mitra" && (
                      <>
                        <div>
                          <label htmlFor="namaInstansi" className="block text-xs font-bold text-[#273419]">
                            Nama Instansi Pengolah <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="namaInstansi"
                            name="namaInstansi"
                            type="text"
                            required
                            value={formData.namaInstansi}
                            onChange={handleInputChange}
                            placeholder="Contoh: CV Bio Tani Makmur"
                            className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]"
                          />
                        </div>

                        <div>
                          <label htmlFor="kapasitasTampung" className="block text-xs font-bold text-[#273419]">
                            Kapasitas Tampung Limbah (kg/hari) <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="kapasitasTampung"
                            name="kapasitasTampung"
                            type="number"
                            min="1"
                            required
                            value={formData.kapasitasTampung}
                            onChange={handleInputChange}
                            placeholder="Contoh: 1500"
                            className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]"
                          />
                        </div>

                        <div>
                          <label htmlFor="jangkauanArea" className="block text-xs font-bold text-[#273419]">
                            Jangkauan Area Penjemputan <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="jangkauanArea"
                            name="jangkauanArea"
                            type="text"
                            required
                            value={formData.jangkauanArea}
                            onChange={handleInputChange}
                            placeholder="Contoh: Kec. Lohbener, Jatibarang, Sliyeg"
                            className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]"
                          />
                        </div>
                      </>
                    )}

                    {selectedRole === "konsumen" && (
                      <>
                        <div>
                          <label htmlFor="kategoriKonsumen" className="block text-xs font-bold text-[#273419]">
                            Kategori Konsumen <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="kategoriKonsumen"
                            name="kategoriKonsumen"
                            required
                            value={formData.kategoriKonsumen}
                            onChange={handleInputChange}
                            className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#273419] focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]"
                          >
                            <option value="Ritel">Ritel (Konsumen Langsung / Keluarga)</option>
                            <option value="Grosir">Grosir (Toko Buah / Restoran / Agen)</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="alamatPengiriman" className="block text-xs font-bold text-[#273419]">
                            Alamat Pengiriman Utama <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id="alamatPengiriman"
                            name="alamatPengiriman"
                            rows={2}
                            required
                            value={formData.alamatPengiriman}
                            onChange={handleInputChange}
                            placeholder="Tuliskan alamat lengkap beserta kecamatan dan kode pos..."
                            className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="kataSandi" className="block text-xs font-bold text-[#273419]">
                        Kata Sandi <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="kataSandi"
                        name="kataSandi"
                        type="password"
                        required
                        minLength={6}
                        value={formData.kataSandi}
                        onChange={handleInputChange}
                        placeholder="Minimal 6 karakter"
                        className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]"
                      />
                    </div>

                    <div>
                      <label htmlFor="ulangiKataSandi" className="block text-xs font-bold text-[#273419]">
                        Ulangi Kata Sandi <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="ulangiKataSandi"
                        name="ulangiKataSandi"
                        type="password"
                        required
                        minLength={6}
                        value={formData.ulangiKataSandi}
                        onChange={handleInputChange}
                        placeholder="Ulangi kata sandi"
                        className={`mt-1 h-10 w-full rounded-lg border bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                          passwordMismatch
                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-[#166534] focus:ring-[#166534]"
                        }`}
                      />
                    </div>
                  </div>

                  {passwordMismatch && (
                    <p role="alert" className="text-xs font-semibold text-red-600">
                      Kata sandi dan konfirmasi kata sandi tidak cocok. Silakan periksa kembali.
                    </p>
                  )}

                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs leading-relaxed text-gray-700">
                      <input
                        type="checkbox"
                        name="persetujuan"
                        required
                        checked={formData.persetujuan}
                        onChange={handleInputChange}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#166534] focus:ring-[#166534]"
                      />
                      <span>
                        Saya menyetujui{" "}
                        <span className="font-semibold text-[#166534] underline">
                          Syarat & Ketentuan Kemitraan Adil
                        </span>{" "}
                        serta Kebijakan Sirkularitas SAMANGGA.
                      </span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#3D5126] px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#273419] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126] focus-visible:ring-offset-2"
                    >
                      Daftar & Aktivasi Akun Kemitraan
                      <ArrowRightIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="pt-2 text-center">
                    <p className="text-xs text-gray-600">
                      Sudah terdaftar sebagai mitra SAMANGGA?{" "}
                      <Link
                        href="/login"
                        className="font-bold text-[#166534] underline-offset-2 hover:text-[#273419] hover:underline"
                      >
                        Masuk ke Akun Anda
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </section>
          </div>
      </main>

      <SiteFooter />
    </div>
  );
}
