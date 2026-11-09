"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, JSX } from "react";
import { Navbar } from "@/components/layout/SiteNavbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { TopAlertBanner } from "@/components/ui/TopAlertBanner";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  FactoryIcon,
  RecycleIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SproutIcon,
  XMarkIcon,
} from "@/components/ui/Icons";
import { DEFAULT_PROFILES, type RoleSlug } from "@/data/profil";
import { saveRegisteredUser, setActiveRole } from "@/lib/auth";
import { sendEmailNotification } from "@/lib/emailNotification";

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
  email: string;
  nomorWhatsapp: string;
  kataSandi: string;
  ulangiKataSandi: string;
  persetujuan: boolean;
  fotoPersyaratanUrl: string;
  fotoPersyaratanName: string;

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
  email: "",
  nomorWhatsapp: "",
  kataSandi: "",
  ulangiKataSandi: "",
  persetujuan: false,
  fotoPersyaratanUrl: "",
  fotoPersyaratanName: "",

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

function DaftarMitraContent(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlEmail = searchParams.get("email") || "";
  const urlName = searchParams.get("name") || "";
  const urlRole = searchParams.get("role") as RoleType | null;
  const isFromGoogle = searchParams.get("from") === "google";
  const isUnregisteredError = searchParams.get("error") === "unregistered";

  const [selectedRole, setSelectedRole] = useState<RoleType>(() => {
    if (urlRole && ["petani", "umkm", "mitra", "konsumen"].includes(urlRole)) {
      return urlRole;
    }
    return "petani";
  });

  const [formData, setFormData] = useState<FormDataState>(() => ({
    ...INITIAL_FORM_STATE,
    email: urlEmail,
    namaLengkap: urlName,
  }));

  const [passwordMismatch, setPasswordMismatch] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Banner states
  const [showUnregisteredAlert, setShowUnregisteredAlert] = useState<boolean>(isUnregisteredError);
  const [verificationPending, setVerificationPending] = useState<boolean>(false);

  // Multi-step modal khusus Mitra
  type MitraModalStep = "persyaratan" | "upload_foto" | "selesai" | null;
  const [mitraModalStep, setMitraModalStep] = useState<MitraModalStep>(null);
  const [reqValiditas, setReqValiditas] = useState<boolean>(false);
  const [reqKomitmen, setReqKomitmen] = useState<boolean>(false);
  const [reqKepatuhan, setReqKepatuhan] = useState<boolean>(false);
  const [reqSanksi, setReqSanksi] = useState<boolean>(false);

  const allRequirementsChecked = reqValiditas && reqKomitmen && reqKepatuhan && reqSanksi;

  const handleToggleAllRequirements = (): void => {
    const nextVal = !allRequirementsChecked;
    setReqValiditas(nextVal);
    setReqKomitmen(nextVal);
    setReqKepatuhan(nextVal);
    setReqSanksi(nextVal);
  };

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

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Harap unggah file berupa gambar (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Ukuran foto maksimal 5 MB.");
      return;
    }

    setPhotoError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        fotoPersyaratanUrl: result,
        fotoPersyaratanName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (): void => {
    setFormData((prev) => ({
      ...prev,
      fotoPersyaratanUrl: "",
      fotoPersyaratanName: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (formData.kataSandi !== formData.ulangiKataSandi) {
      setPasswordMismatch(true);
      return;
    }

    const isMitraRole = selectedRole === "mitra";

    if (isMitraRole) {
      // Khusus Mitra: saat klik Simpan Data di form register, buka tahap persyaratan 4 klausul
      setMitraModalStep("persyaratan");
      return;
    }

    // Untuk peran selain Mitra (Petani, UMKM, Konsumen):
    if (!formData.persetujuan) {
      alert("Harap setujui Syarat & Ketentuan Kemitraan Adil untuk melanjutkan pendaftaran.");
      return;
    }

    // Role mapping
    const roleMeta = ROLES.find((r) => r.id === selectedRole) ?? ROLES[0];
    const defaultProfile = DEFAULT_PROFILES[selectedRole];

    // Simpan data pendaftaran ke sistem (Petani, UMKM, Konsumen langsung Terverifikasi)
    saveRegisteredUser({
      email: formData.email.trim(),
      namaLengkap: formData.namaLengkap.trim(),
      nomorWhatsapp: formData.nomorWhatsapp.trim(),
      role: selectedRole,
      roleTitle: roleMeta.title,
      peranErd: defaultProfile.peranErd,
      statusVerifikasi: "Terverifikasi",
      fromGoogle: isFromGoogle,
      extraData: {
        luasLahan: formData.luasLahan,
        komoditasUtama: formData.komoditasUtama,
        namaUsaha: formData.namaUsaha,
        nib: formData.nib,
        kapasitasProduksi: formData.kapasitasProduksi,
        kategoriKonsumen: formData.kategoriKonsumen,
        alamatPengiriman: formData.alamatPengiriman,
      },
    });

    // Kirim konfirmasi ke email pribadi pendaftar
    sendEmailNotification({
      to: formData.email.trim(),
      recipientName: formData.namaLengkap.trim(),
      type: "REGISTRASI_BERHASIL",
      role: selectedRole,
    });

    setActiveRole(selectedRole);
    router.push(`/profil/${selectedRole}`);
  };

  const handleFinalSubmitMitra = (): void => {
    if (!formData.fotoPersyaratanUrl) {
      setPhotoError("Harap unggah foto bukti dokumen kerja sama atau foto fisik fasilitas/lahan.");
      return;
    }

    const roleMeta = ROLES.find((r) => r.id === "mitra") ?? ROLES[2];
    const defaultProfile = DEFAULT_PROFILES["mitra"];

    saveRegisteredUser({
      email: formData.email.trim(),
      namaLengkap: formData.namaLengkap.trim(),
      nomorWhatsapp: formData.nomorWhatsapp.trim(),
      role: "mitra",
      roleTitle: roleMeta.title,
      peranErd: defaultProfile.peranErd,
      statusVerifikasi: "Menunggu",
      fotoPersyaratanUrl: formData.fotoPersyaratanUrl,
      fotoPersyaratanName: formData.fotoPersyaratanName || "dokumen-persyaratan-mitra.jpg",
      fromGoogle: isFromGoogle,
      extraData: {
        namaInstansi: formData.namaInstansi,
        kapasitasTampung: formData.kapasitasTampung,
        jangkauanArea: formData.jangkauanArea,
        validitasDataApproved: true,
        komitmenSirkularApproved: true,
        kepatuhanTransaksiApproved: true,
        sanksiKeamananApproved: true,
      },
    });

    // Kirim notifikasi pendaftaran mitra ke email pribadi
    sendEmailNotification({
      to: formData.email.trim(),
      recipientName: formData.namaLengkap.trim(),
      type: "REGISTRASI_BERHASIL",
      role: "mitra",
      extraInfo: "Pengajuan kemitraan Bio-Refinery Anda sedang dalam proses peninjauan berkas foto oleh Admin SAMANGGA. Segala pembaruan verifikasi (termasuk jika foto tidak jelas) akan dikirimkan langsung ke email ini.",
    });

    setActiveRole("mitra");
    setVerificationPending(true);
    setShowUnregisteredAlert(false);
    setMitraModalStep("selesai");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedRoleMeta = ROLES.find((r) => r.id === selectedRole) ?? ROLES[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#273419]">
      <Navbar />

      {showUnregisteredAlert && (
        <TopAlertBanner
          variant="danger"
          title="Akun Belum Terdaftar"
          message={
            urlEmail
              ? `Email Google (${urlEmail}) belum terdaftar pada sistem SAMANGGA. Silakan lengkapi formulir di bawah ini dan klik "Simpan Data" untuk mengaktifkan akun Anda.`
              : "Anda belum memiliki akun terdaftar di SAMANGGA. Silakan pilih peran dan simpan data formulir di bawah ini untuk memulai kemitraan."
          }
          onClose={() => setShowUnregisteredAlert(false)}
          secondaryAction={{
            label: "Sudah Punya Akun? Masuk",
            href: "/login",
          }}
        />
      )}

      {verificationPending && (
        <TopAlertBanner
          variant="warning"
          title="Menunggu Verifikasi Admin"
          message="Mohon menunggu ACC dari admin dan kami akan infokan ACC di email bagian spam."
          onClose={() => setVerificationPending(false)}
        />
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {isFromGoogle && urlEmail && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-blue-900 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs">
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </span>
              <div>
                <p className="font-bold text-blue-950">Terhubung dengan Akun Google</p>
                <p className="mt-0.5 text-blue-800">
                  Email: <strong>{urlEmail}</strong>. Lengkapi formulir pendaftaran kemitraan di bawah ini.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-800">
              Registrasi Akun Baru
            </span>
          </div>
        )}

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
            Pendaftaran &amp; Aktivasi Kemitraan
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-700">
            Pilih peran Anda dalam ekosistem mangga di kolom kiri, lalu lengkapi informasi profil Anda di kolom kanan
            untuk menyimpan data dan memulai proses verifikasi akun oleh admin.
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
                  <label htmlFor="email" className="block text-xs font-bold text-[#273419]">
                    Alamat Email Aktif <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="nama.anda@gmail.com atau usaha@samangga.id"
                    className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Digunakan untuk masuk sistem, autentikasi Google, dan notifikasi status verifikasi admin.
                  </p>
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
                    Digunakan untuk konfirmasi pesanan, jadwal jemput limbah, dan kode verifikasi.
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

                {selectedRole === "mitra" ? (
                  <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/60 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="h-4 w-4 text-[#166534]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#166534]">
                        Alur Persyaratan &amp; Verifikasi Mitra
                      </h3>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Setelah melengkapi data akun di atas, klik tombol <strong>&ldquo;Simpan Data&rdquo;</strong>. Anda akan diarahkan untuk menyetujui <strong>4 Klausul Persyaratan Kemitraan Resmi</strong> dan mengunggah <strong>Foto Dokumen / Fasilitas Lahan</strong> di tahap akhir sebelum akun diajukan ke Admin.
                    </p>
                  </div>
                ) : (
                  <div className="pt-1">
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
                        Saya menyetujui seluruh{" "}
                        <span className="font-semibold text-[#166534] underline">
                          Syarat &amp; Ketentuan Kemitraan Adil
                        </span>{" "}
                        serta Kebijakan Platform SAMANGGA.
                      </span>
                    </label>
                  </div>
                )}

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#3D5126] px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#273419] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126] focus-visible:ring-offset-2"
                  >
                    Simpan Data
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

      {mitraModalStep && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setMitraModalStep(null);
            }
          }}
        >
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-200">
            {mitraModalStep === "persyaratan" && (
              <div className="space-y-5">
                <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3D5126]/10 px-3 py-1 text-xs font-bold text-[#3D5126]">
                      <ShieldCheckIcon className="h-3.5 w-3.5" />
                      Langkah 1 dari 2: Persetujuan Persyaratan Kemitraan
                    </span>
                    <h2 className="mt-2 text-lg sm:text-xl font-extrabold text-[#273419]">
                      Persyaratan Kemitraan Sirkular
                    </h2>
                    <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                      Khusus pendaftaran Mitra Pengolah Limbah Bio-Refinery, silakan baca dan centang seluruh 4 klausul komitmen berikut sebelum melanjutkan ke pengunggahan berkas:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMitraModalStep(null)}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Tutup"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-xs">
                  <span className="text-gray-600 font-medium">
                    {allRequirementsChecked
                      ? "✓ Seluruh 4 klausul telah disetujui"
                      : "Centang masing-masing poin atau centang sekaligus:"}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleAllRequirements}
                    className="rounded-lg bg-white border border-gray-300 px-3 py-1 text-xs font-bold text-[#3D5126] hover:bg-emerald-50 active:scale-95 transition-all shadow-xs"
                  >
                    {allRequirementsChecked ? "Hapus Centang" : "✓ Centang Semua"}
                  </button>
                </div>

                <div className="space-y-3">
                  <div
                    onClick={() => setReqValiditas((prev) => !prev)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      reqValiditas
                        ? "border-[#3D5126] bg-[#95A87A]/10 ring-1 ring-[#3D5126]"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reqValiditas}
                        onChange={(e) => setReqValiditas(e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#3D5126] focus:ring-[#3D5126]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-800">
                            Poin 1
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-[#273419]">
                            Validitas Data
                          </h3>
                        </div>
                        <p className="mt-1.5 text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                          &ldquo;Saya menjamin bahwa seluruh identitas diri, kelompok tani, atau badan usaha yang didaftarkan adalah asli dan sah.&rdquo;
                        </p>
                      </div>
                    </label>
                  </div>

                  <div
                    onClick={() => setReqKomitmen((prev) => !prev)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      reqKomitmen
                        ? "border-[#3D5126] bg-[#95A87A]/10 ring-1 ring-[#3D5126]"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reqKomitmen}
                        onChange={(e) => setReqKomitmen(e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#3D5126] focus:ring-[#3D5126]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                            Poin 2
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-[#273419]">
                            Komitmen Sirkular
                          </h3>
                        </div>
                        <p className="mt-1.5 text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                          &ldquo;Saya bersedia menjaga kualitas buah, kebersihan produk olahan, atau kelancaran proses penjemputan limbah organik.&rdquo;
                        </p>
                      </div>
                    </label>
                  </div>

                  <div
                    onClick={() => setReqKepatuhan((prev) => !prev)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      reqKepatuhan
                        ? "border-[#3D5126] bg-[#95A87A]/10 ring-1 ring-[#3D5126]"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reqKepatuhan}
                        onChange={(e) => setReqKepatuhan(e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#3D5126] focus:ring-[#3D5126]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                            Poin 3
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-[#273419]">
                            Kepatuhan Transaksi
                          </h3>
                        </div>
                        <p className="mt-1.5 text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                          &ldquo;Saya tunduk pada sistem pembayaran platform dan batas waktu konfirmasi pesanan yang telah ditetapkan.&rdquo;
                        </p>
                      </div>
                    </label>
                  </div>

                  <div
                    onClick={() => setReqSanksi((prev) => !prev)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      reqSanksi
                        ? "border-[#3D5126] bg-[#95A87A]/10 ring-1 ring-[#3D5126]"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reqSanksi}
                        onChange={(e) => setReqSanksi(e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#3D5126] focus:ring-[#3D5126]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-800">
                            Poin 4
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-[#273419]">
                            Sanksi Keamanan
                          </h3>
                        </div>
                        <p className="mt-1.5 text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                          &ldquo;Saya setuju akun dibekukan permanen jika terbukti melakukan manipulasi data, pesanan fiktif, atau penipuan operasional.&rdquo;
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setMitraModalStep(null)}
                    className="w-full sm:w-auto rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    Batal
                  </button>

                  <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                    {!allRequirementsChecked && (
                      <span className="text-[11px] text-amber-700 font-medium text-center sm:text-right">
                        Centang ke-4 persyaratan untuk lanjut
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={!allRequirementsChecked}
                      onClick={() => setMitraModalStep("upload_foto")}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#3D5126] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#273419] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                    >
                      Lanjut: Upload Foto Berkas
                      <ArrowRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mitraModalStep === "upload_foto" && (
              <div className="space-y-5">
                <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3D5126]/10 px-3 py-1 text-xs font-bold text-[#3D5126]">
                      <ShieldCheckIcon className="h-3.5 w-3.5" />
                      Langkah 2 dari 2: Upload Foto di Akhir Persyaratan
                    </span>
                    <h2 className="mt-2 text-lg sm:text-xl font-extrabold text-[#273419]">
                      Unggah Bukti Foto Dokumen / Lahan Fasilitas
                    </h2>
                    <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                      Lampirkan foto fisik fasilitas pengolahan limbah, lahan, atau dokumen perjanjian kerja sama (MoU) untuk diperiksa dan disetujui (ACC) oleh Admin SAMANGGA.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMitraModalStep(null)}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Tutup"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#273419]">
                      Pilih File Foto Berkas (JPG, PNG, atau WEBP): <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="mt-1.5 block w-full text-xs text-gray-500 file:mr-3 file:rounded-xl file:border-0 file:bg-[#3D5126] file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-white hover:file:bg-[#273419] cursor-pointer"
                    />
                  </div>

                  {formData.fotoPersyaratanUrl ? (
                    <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-3.5 flex items-center justify-between gap-3 animate-in fade-in">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={formData.fotoPersyaratanUrl}
                          alt="Pratinjau foto terpilih"
                          className="h-14 w-14 object-cover rounded-xl border border-emerald-300 shadow-xs shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#273419] truncate">
                            {formData.fotoPersyaratanName || "foto-persyaratan.jpg"}
                          </p>
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-[#166534] mt-1">
                            <CheckIcon className="h-3 w-3" /> Foto Siap Diverifikasi Admin
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 shrink-0"
                      >
                        Ganti / Hapus
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-700 font-medium">
                      ⚠️ Foto berkas wajib dipilih sebelum pendaftaran mitra dapat diselesaikan.
                    </p>
                  )}

                  {photoError && (
                    <p className="text-xs font-semibold text-red-600">{photoError}</p>
                  )}

                  <div className="pt-2 border-t border-gray-100">
                    <div className="mb-2.5 flex items-center justify-between">
                      <p className="text-xs font-bold text-[#273419]">
                        Panduan Kualitas Foto Dokumen &amp; Lahan:
                      </p>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500">
                        Wajib jelas &amp; tidak buram
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-emerald-300 bg-emerald-50/50 p-3 sm:p-3.5 flex flex-col justify-between shadow-xs">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-extrabold text-[#166534]">
                              <CheckIcon className="h-3 w-3" /> Foto Bagus (Diterima)
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700">✓ Standar ACC</span>
                          </div>

                          <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-black/5 aspect-16/10 mb-2.5">
                            <img
                              src="/images/limbah/pupuk_kompos.jpg"
                              alt="Contoh foto jernih dan fokus - Diterima"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/30 to-transparent p-2 text-white">
                              <p className="text-[11px] font-bold flex items-center gap-1 text-emerald-300">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                                Jernih, Tajam &amp; Terbaca
                              </p>
                            </div>
                          </div>

                          <ul className="space-y-1.5 text-[11px] text-gray-700">
                            <li className="flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold shrink-0">✓</span>
                              <span>Fokus tajam, objek lahan / tulisan MoU terlihat jelas</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold shrink-0">✓</span>
                              <span>Pencahayaan terang merata &amp; tidak silau</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold shrink-0">✓</span>
                              <span>Seluruh area fisik / dokumen masuk dalam bingkai</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-rose-300 bg-rose-50/50 p-3 sm:p-3.5 flex flex-col justify-between shadow-xs">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 border border-rose-300 px-2.5 py-0.5 text-[10px] font-extrabold text-[#991b1b]">
                              <XMarkIcon className="h-3 w-3" /> Foto Buram (Ditolak)
                            </span>
                            <span className="text-[10px] font-bold text-rose-700">✕ Otomatis Ditolak</span>
                          </div>

                          <div className="relative overflow-hidden rounded-xl border border-rose-200 bg-black/5 aspect-16/10 mb-2.5">
                            <img
                              src="/images/limbah/pupuk_kompos.jpg"
                              alt="Contoh foto buram dan goyang - Ditolak"
                              className="h-full w-full object-cover filter blur-[3.5px] brightness-75 contrast-75"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/30 to-transparent p-2 text-white">
                              <p className="text-[11px] font-bold flex items-center gap-1 text-rose-300">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                                Buram / Goyang / Gelap
                              </p>
                            </div>
                          </div>

                          <ul className="space-y-1.5 text-[11px] text-gray-700">
                            <li className="flex items-start gap-1.5">
                              <span className="text-rose-600 font-bold shrink-0">✕</span>
                              <span>Foto buram (blur), goyang, atau tidak fokus</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <span className="text-rose-600 font-bold shrink-0">✕</span>
                              <span>Terlalu gelap, berbayang, atau terkena kilau pantulan</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <span className="text-rose-600 font-bold shrink-0">✕</span>
                              <span>Dokumen terpotong atau tulisan tidak terbaca</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setMitraModalStep("persyaratan")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    <ArrowLeftIcon className="h-3.5 w-3.5" />
                    Kembali ke Persyaratan
                  </button>

                  <button
                    type="button"
                    disabled={!formData.fotoPersyaratanUrl}
                    onClick={handleFinalSubmitMitra}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#3D5126] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#273419] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                  >
                    Selesai &amp; Ajukan Verifikasi
                    <CheckIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {mitraModalStep === "selesai" && (
              <div className="py-4 text-center space-y-4 animate-in zoom-in-95">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-700 text-3xl shadow-sm ring-4 ring-amber-50">
                  ⏳
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">
                    Menunggu Verifikasi Admin
                  </span>
                  <h2 className="mt-2 text-xl font-extrabold text-[#273419]">
                    Pendaftaran Mitra Berhasil Disimpan!
                  </h2>
                  <p className="mt-3 text-xs sm:text-sm text-gray-700 max-w-md mx-auto leading-relaxed font-medium">
                    Mohon menunggu ACC dari admin dan kami akan infokan ACC di email bagian spam.
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950 text-left space-y-1.5 max-w-lg mx-auto">
                  <p className="font-bold">Informasi Akun Anda:</p>
                  <p>• Instansi: <strong>{formData.namaInstansi || formData.namaLengkap}</strong></p>
                  <p>• Penanggung Jawab: <strong>{formData.namaLengkap}</strong></p>
                  <p>• Email: <strong>{formData.email}</strong></p>
                  <p>• Status: <strong className="text-amber-800">Menunggu Verifikasi</strong></p>
                </div>

                <div className="flex items-center justify-center pt-3">
                  <button
                    type="button"
                    onClick={() => setMitraModalStep(null)}
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[#3D5126] px-8 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#273419] active:scale-95 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}

export default function DaftarMitra(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3D5126] border-t-transparent mx-auto" />
            <p className="mt-3 text-xs font-semibold text-gray-600">Memuat formulir pendaftaran...</p>
          </div>
        </div>
      }
    >
      <DaftarMitraContent />
    </Suspense>
  );
}
