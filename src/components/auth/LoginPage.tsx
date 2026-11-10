"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import type { ChangeEvent, FormEvent, JSX } from "react";
import type { GoogleTokenResponse } from "@/types/google";
import { Navbar } from "@/components/layout/SiteNavbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { TopAlertBanner } from "@/components/ui/TopAlertBanner";
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  FactoryIcon,
  LockIcon,
  RecycleIcon,
  ShieldCheckIcon,
  SproutIcon,
  UserMailIcon,
  UsersIcon,
} from "@/components/ui/Icons";
import { type RoleSlug } from "@/data/profil";
import { findUserByEmail, findUserByIdentifier, isEmailDeleted, setActiveRole, setActiveUserEmail } from "@/lib/auth";

type RoleFilter = "Petani" | "UMKM Kuliner" | "Pengolah Residu" | "Pembeli & Ritel" | "Admin Sistem";

interface RoleOptionData {
  id: RoleFilter;
  slug: RoleSlug;
  title: string;
  shortTitle: string;
  badge: string;
  description: string;
}

const LOGIN_ROLES: readonly RoleOptionData[] = [
  {
    id: "Petani",
    slug: "petani",
    title: "Supplier (Petani & Pengepul)",
    shortTitle: "Supplier",
    badge: "Tabel: Supplier",
    description: "Pemasok buah mangga segar (Produk Buah), kelola transaksi penjualan & keuangan.",
  },
  {
    id: "UMKM Kuliner",
    slug: "umkm",
    title: "UMKM Pengolah Mangga",
    shortTitle: "UMKM",
    badge: "Tabel: UMKM",
    description: "Produsen olahan mangga (Produk Olahan) dan pencatat limbah produksi ke Pasar Sirkular.",
  },
  {
    id: "Pengolah Residu",
    slug: "mitra",
    title: "Mitra Limbah & Logistik",
    shortTitle: "Mitra",
    badge: "Tabel: Mitra",
    description: "Instansi penjemput limbah UMKM (Jual Beli/Jasa/Gratis) dan penangan pengiriman.",
  },
  {
    id: "Pembeli & Ritel",
    slug: "konsumen",
    title: "Konsumen (Ritel & Grosir)",
    shortTitle: "Konsumen",
    badge: "Tabel: Konsumen",
    description: "Pembeli ritel atau grosir buah/olahan dengan pembayaran Transfer Manual, VA, atau QRIS.",
  },
  {
    id: "Admin Sistem",
    slug: "admin",
    title: "Admin (Super / Transaksi / Limbah)",
    shortTitle: "Admin",
    badge: "Tabel: Admin",
    description: "Verifikasi Pengguna, Produk, Limbah, serta audit Log Sistem sesuai tingkat_akses.",
  },
];

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "744974006867-m6h3tdsmoagrd9hl22kvsh1v33m908n1.apps.googleusercontent.com";

interface GoogleAccountItem {
  name: string;
  email: string;
  avatarText: string;
  avatarBg: string;
  roleHint?: string;
}

interface DemoAccountInfo {
  roleId: RoleFilter;
  roleBadge: string;
  nama: string;
  email: string;
  phone: string;
  password: string;
  desc: string;
}

const OFFICIAL_DEMO_ACCOUNTS: readonly DemoAccountInfo[] = [
  {
    roleId: "UMKM Kuliner",
    roleBadge: "UMKM #203",
    nama: "Siti Masitoh (Camilan Keripik Mangga Barokah)",
    email: "keripik.barokah@samangga.id",
    phone: "0813-2233-4455",
    password: "samangga2026",
    desc: "Produsen olahan keripik mangga Losarang, pencatat limbah kulit & biji.",
  },
  {
    roleId: "UMKM Kuliner",
    roleBadge: "UMKM #202",
    nama: "Hj. Ningsih Rahmawati (UMKM Dapur Mangga Bu Ning)",
    email: "dapur.buning@samangga.id",
    phone: "0813-9876-5432",
    password: "samangga2026",
    desc: "Produsen dodol & sirup gedong gincu Sindang, Indramayu.",
  },
  {
    roleId: "Petani",
    roleBadge: "Supplier #101",
    nama: "H. Agus Supriyadi (KT Sumber Rejeki)",
    email: "agus.sumberrejeki@samangga.id",
    phone: "0812-2345-6789",
    password: "samangga2026",
    desc: "Kelompok tani mangga gedong gincu & arumanis Lohbener.",
  },
  {
    roleId: "Pengolah Residu",
    roleBadge: "Mitra #303",
    nama: "Ir. Hendra Kusuma (CV Bio Tani Lestari)",
    email: "operasional@biotanipantura.id",
    phone: "0821-1122-3344",
    password: "samangga2026",
    desc: "Mitra sirkular bio-refinery, pengolah pupuk kompos & pakan ternak.",
  },
  {
    roleId: "Pembeli & Ritel",
    roleBadge: "Konsumen #404",
    nama: "Budi Santoso (PT Segar Buah Nusantara)",
    email: "purchasing@segarbuah.co.id",
    phone: "0811-2233-4455",
    password: "samangga2026",
    desc: "Pembeli grosir ritel modern Jabodetabek & Pantura.",
  },
  {
    roleId: "Admin Sistem",
    roleBadge: "Admin #505",
    nama: "Dr. Raka Pratama, M.Kom.",
    email: "admin.pusat@samangga.id",
    phone: "0815-8800-9900",
    password: "admin123",
    desc: "Super Admin Command Center Agribisnis & Pasar Sirkular SAMANGGA.",
  },
];

function getLoginRoleIcon(role: RoleFilter): JSX.Element {
  switch (role) {
    case "Petani":
      return <SproutIcon className="h-4 w-4" />;
    case "UMKM Kuliner":
      return <FactoryIcon className="h-4 w-4" />;
    case "Pengolah Residu":
      return <RecycleIcon className="h-4 w-4" />;
    case "Admin Sistem":
      return <ShieldCheckIcon className="h-4 w-4" />;
    case "Pembeli & Ritel":
    default:
      return <UsersIcon className="h-4 w-4" />;
  }
}

function LoginPageContent(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramError = searchParams.get("error");
  const paramGoogle = searchParams.get("google") === "1";

  const [selectedRole, setSelectedRole] = useState<RoleFilter>("Petani");
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Google & Demo State
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(paramGoogle);
  const [modalTab, setModalTab] = useState<"demo" | "google">("demo");
  const [customGoogleEmail, setCustomGoogleEmail] = useState<string>("");
  const [customGoogleName, setCustomGoogleName] = useState<string>("");

  // Top Alert State
  const [topAlert, setTopAlert] = useState<{
    variant: "danger" | "warning" | "success";
    title: string;
    message: string;
  } | null>(() => {
    if (paramError === "unregistered") {
      return {
        variant: "danger",
        title: "Akun Belum Terdaftar",
        message: "Akun yang Anda gunakan belum terdaftar di SAMANGGA. Silakan daftar terlebih dahulu.",
      };
    }
    if (paramError === "account_deleted") {
      return {
        variant: "danger",
        title: "Akun Telah Dihapus",
        message: "Akun Anda telah dihapus oleh Admin Platform SAMANGGA. Silakan daftar kembali jika ingin bergabung.",
      };
    }
    return null;
  });

  const selectedRoleData = LOGIN_ROLES.find((r) => r.id === selectedRole) ?? LOGIN_ROLES[0];

  const handleRoleSelect = (roleId: RoleFilter): void => {
    setSelectedRole(roleId);
    if (roleId === "Admin Sistem") {
      setIdentifier("admin.pusat@samangga.id");
      setPassword("admin123");
    } else if (identifier === "admin.pusat@samangga.id") {
      setIdentifier("");
      setPassword("");
    }
  };

  const handleManualLogin = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!identifier || !password) return;

    // 1. Cek Login Admin Sistem
    const isLoginAdmin =
      selectedRole === "Admin Sistem" ||
      identifier.trim().toLowerCase() === "admin" ||
      identifier.trim().toLowerCase() === "admin.pusat@samangga.id" ||
      identifier.trim().toLowerCase() === "admin@samangga.id";

    if (isLoginAdmin) {
      setActiveRole("admin");
      setActiveUserEmail("admin.pusat@samangga.id");
      setTopAlert({
        variant: "success",
        title: "Login Admin Berhasil",
        message:
          "Selamat datang kembali, Administrator Platform SAMANGGA. Mengarahkan ke Command Center...",
      });
      setTimeout(() => {
        router.push("/profil/admin");
      }, 500);
      return;
    }

    // 2. Cek apakah identifier adalah email, nomor WhatsApp, atau ID akun yang terdaftar
    const userFound = findUserByIdentifier(identifier) || findUserByEmail(identifier);
    if (userFound) {
      if (isEmailDeleted(userFound.email)) {
        setTopAlert({
          variant: "danger",
          title: "Akun Telah Dihapus",
          message: `Akun "${identifier}" telah dihapus oleh Admin Platform SAMANGGA. Silakan daftar kembali jika ingin bergabung.`,
        });
        return;
      }

      setActiveRole(userFound.role);
      setActiveUserEmail(userFound.email);
      setTopAlert({
        variant: "success",
        title: "Login Berhasil",
        message: `Selamat datang kembali, ${userFound.namaLengkap}! Mengarahkan ke dashboard...`,
      });
      setTimeout(() => {
        router.push(`/profil/${userFound.role}`);
      }, 700);
      return;
    }

    // 3. Jika akun tidak ditemukan atau telah dihapus oleh Admin
    if (isEmailDeleted(identifier)) {
      setTopAlert({
        variant: "danger",
        title: "Akun Telah Dihapus",
        message: `Akun "${identifier}" telah dihapus oleh Admin Platform SAMANGGA. Silakan daftar kembali jika ingin bergabung.`,
      });
      return;
    }

    setTopAlert({
      variant: "danger",
      title: "Akun Belum Terdaftar",
      message: `Akun "${identifier}" belum terdaftar di platform SAMANGGA. Silakan daftar terlebih dahulu.`,
    });
  };

  const handlePickDemo = (demo: DemoAccountInfo): void => {
    setSelectedRole(demo.roleId);
    setIdentifier(demo.email);
    setPassword(demo.password);
    setShowGoogleModal(false);
    setTopAlert({
      variant: "success",
      title: "Akun Demo Dipilih",
      message: `Akun "${demo.nama}" (${demo.email}) siap digunakan. Silakan klik tombol "Masuk sebagai ${demo.roleBadge.split(" ")[0]}" untuk melanjutkan.`,
    });
  };

  const handleSelectGoogleAccount = (acc: GoogleAccountItem): void => {
    setShowGoogleModal(false);

    // Cek apakah email Google terdaftar di sistem
    const existingUser = findUserByEmail(acc.email);

    if (existingUser) {
      // Kasus A: Sudah pernah terdaftar dengan role di SAMANGGA
      setActiveRole(existingUser.role);
      setActiveUserEmail(existingUser.email);
      setTopAlert({
        variant: "success",
        title: "Autentikasi Google Berhasil",
        message: `Selamat datang kembali, ${existingUser.namaLengkap}! Mengarahkan ke dashboard ${existingUser.roleTitle}...`,
      });
      setTimeout(() => {
        router.push(`/profil/${existingUser.role}`);
      }, 500);
    } else {
      // Kasus B: Belum pernah terdaftar -> LANGSUNG masuk ke halaman registrasi (/daftar)
      // membawa email dan nama dari Google agar pengguna bisa memilih peran
      const queryParams = new URLSearchParams({
        email: acc.email,
        name: acc.name,
        from: "google",
      });
      router.push(`/daftar?${queryParams.toString()}`);
    }
  };

  const handleCustomGoogleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (!customGoogleEmail) return;

    handleSelectGoogleAccount({
      name: customGoogleName || customGoogleEmail.split("@")[0],
      email: customGoogleEmail.trim(),
      avatarText: (customGoogleName || customGoogleEmail)[0].toUpperCase(),
      avatarBg: "bg-blue-600",
    });
  };

  const handleGoogleSignIn = (): void => {
    if (typeof window === "undefined") return;

    if (!window.google?.accounts?.oauth2) {
      setTopAlert({
        variant: "warning",
        title: "Layanan Google Sedang Disiapkan",
        message:
          "Sedang menghubungkan ke Google Identity Services. Jika Anda menggunakan ekstensi AdBlocker atau offline, silakan coba lagi atau gunakan Simulasi Akun Demo.",
      });
      setShowGoogleModal(true);
      return;
    }

    setIsGoogleLoading(true);

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "email profile openid",
        prompt: "select_account",
        callback: async (response: GoogleTokenResponse) => {
          setIsGoogleLoading(false);

          if (response.error) {
            if (response.error === "popup_closed_by_user") {
              return;
            }
            console.error("Google OAuth error:", response);
            setTopAlert({
              variant: "danger",
              title: "Otorisasi Google Dibatalkan/Gagal",
              message: `Pesan dari Google: ${response.error_description || response.error}. Pastikan origin 'http://localhost:3000' sudah didaftarkan pada Google Cloud Console.`,
            });
            return;
          }

          if (!response.access_token) {
            setTopAlert({
              variant: "danger",
              title: "Gagal Autentikasi Google",
              message: "Tidak berhasil mendapatkan token otorisasi dari Google.",
            });
            return;
          }

          try {
            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: {
                Authorization: `Bearer ${response.access_token}`,
              },
            });

            if (!res.ok) {
              throw new Error(`Google API mengembalikan status ${res.status}`);
            }

            const userInfo = (await res.json()) as {
              email?: string;
              name?: string;
              picture?: string;
              given_name?: string;
            };

            if (!userInfo.email) {
              throw new Error("Alamat email tidak dapat diperoleh dari akun Google.");
            }

            const displayName =
              userInfo.name || userInfo.given_name || userInfo.email.split("@")[0];

            handleSelectGoogleAccount({
              name: displayName,
              email: userInfo.email,
              avatarText: (displayName[0] || "G").toUpperCase(),
              avatarBg: "bg-blue-600",
            });
          } catch (fetchErr) {
            console.error("Gagal mengambil profil akun Google:", fetchErr);
            setTopAlert({
              variant: "danger",
              title: "Gagal Mengambil Data Profil",
              message:
                "Koneksi ke endpoint Google gagal. Anda dapat mencoba lagi atau menggunakan Simulasi Akun Demo.",
            });
          }
        },
        error_callback: (err: unknown) => {
          setIsGoogleLoading(false);
          console.warn("Google OAuth error_callback:", err);
          setTopAlert({
            variant: "warning",
            title: "Pengaturan Domain Google Cloud",
            message:
              "Pop-up Google tidak dapat dibuka. Pastikan URL 'http://localhost:3000' sudah ditambahkan pada 'Authorized JavaScript origins' di Google Cloud Console.",
          });
        },
      });

      client.requestAccessToken();
    } catch (err) {
      setIsGoogleLoading(false);
      console.error("Gagal menginisialisasi Google Token Client:", err);
      setShowGoogleModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#273419]">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <Navbar />

      {topAlert && (
        <TopAlertBanner
          variant={topAlert.variant}
          title={topAlert.title}
          message={topAlert.message}
          onClose={() => setTopAlert(null)}
          secondaryAction={
            topAlert.variant === "danger"
              ? {
                  label: "Daftar Akun Baru",
                  href: "/daftar",
                }
              : undefined
          }
        />
      )}

      {showGoogleModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="google-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 id="google-modal-title" className="text-base font-bold text-gray-900">
                  {modalTab === "demo" ? "Pilih Akun Demo SAMANGGA" : "Simulasi Masuk dengan Akun Google"}
                </h3>
                <p className="text-xs text-gray-500">
                  {modalTab === "demo"
                    ? "Gunakan salah satu akun resmi dari 5 peran untuk langsung mencoba sistem"
                    : "Simulasikan otentikasi menggunakan akun Google Anda"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                aria-label="Tutup jendela modal"
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalTab("demo")}
                className={`flex-1 rounded-lg py-2 transition-all ${
                  modalTab === "demo" ? "bg-white text-green-800 shadow-2xs font-bold" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ⚡ Akun Demo Resmi
              </button>
              <button
                type="button"
                onClick={() => setModalTab("google")}
                className={`flex-1 rounded-lg py-2 transition-all ${
                  modalTab === "google" ? "bg-white text-blue-700 shadow-2xs font-bold" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                G Simulasi Google OAuth
              </button>
            </div>

            {modalTab === "demo" ? (
              <div className="mt-4 space-y-2.5">
                <p className="text-[11px] text-gray-500 font-medium">
                  Klik salah satu akun untuk langsung mengisi peran, email/no HP, dan kata sandi:
                </p>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {OFFICIAL_DEMO_ACCOUNTS.map((d) => (
                    <button
                      key={d.email}
                      type="button"
                      onClick={() => handlePickDemo(d)}
                      className="w-full text-left rounded-2xl border border-gray-200 bg-white p-3 hover:border-green-600 hover:bg-green-50/40 transition-all flex items-start justify-between group shadow-2xs cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900 group-hover:text-green-800">
                            {d.nama}
                          </span>
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                            {d.roleBadge}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 font-mono">{d.email}</p>
                        <p className="text-[11px] text-gray-500 leading-tight">{d.desc}</p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-green-700 px-2.5 py-1 text-[11px] font-bold text-white group-hover:bg-green-800 transition-colors">
                        Pilih ➔
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <form onSubmit={handleCustomGoogleSubmit} className="space-y-3 rounded-2xl bg-gray-50/80 p-4 border border-gray-200">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Nama Lengkap Akun Google:
                    </label>
                    <input
                      type="text"
                      required
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-[#166534] focus:outline-none shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Alamat Email Google:
                    </label>
                    <input
                      type="email"
                      required
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="nama@gmail.com"
                      className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-[#166534] focus:outline-none shadow-2xs"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-[#3D5126] py-2.5 text-xs font-bold text-white hover:bg-[#273419] shadow-sm transition-all active:scale-98"
                    >
                      Lanjutkan Masuk dengan Google
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGoogleModal(false)}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl lg:grid-cols-12">
          <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-green-700 via-green-800 to-green-950 p-8 text-white sm:p-10 lg:col-span-5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl"
            />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Gerakan Mangga Naik Kelas
              </div>

              <div className="mt-6 flex items-center gap-2.5">
                <img src="/images/logo_web.png" alt="Logo SAMANGGA" className="h-9 w-9 object-contain" />
                <span className="text-2xl font-black tracking-tight text-white">SAMANGGA</span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-emerald-100/90">
                Platform B2B Rantai Pasok Terpadu &amp; Pasar Sirkular Mangga Indramayu.
              </p>
            </div>

            <div className="relative z-10 my-8 space-y-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                      Rantai Pasok Langsung
                    </h2>
                    <p className="mt-0.5 text-xs leading-relaxed text-emerald-100/80">
                      Bahan baku mangga segar terverifikasi langsung dari kelompok tani tanpa perantara spekulan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                      Pasar Sirkular Zero-Waste
                    </h2>
                    <p className="mt-0.5 text-xs leading-relaxed text-emerald-100/80">
                      Monetisasi limbah kulit, biji, dan mangga afkir untuk pakan, pupuk, dan bio-industri.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 border-t border-white/15 pt-4 text-xs text-emerald-100/80">
              <p className="italic">
                &ldquo;Transparansi harga dan kepastian pasokan membuat produksi UMKM kami stabil sepanjang tahun.&rdquo;
              </p>
              <p className="mt-2 font-bold text-white">— Kelompok Mitra Tani Indramayu</p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-7">
            <div>
              <div className="mb-5 inline-flex items-center rounded-full border border-gray-200 bg-white p-1 shadow-xs">
                <span className="rounded-full bg-green-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs">
                  Masuk Akun
                </span>
                <Link
                  href="/daftar"
                  className="rounded-full px-4 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:text-[#273419]"
                >
                  Belum Punya Akun? Daftar ➔
                </Link>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
                  <LockIcon className="h-3.5 w-3.5" />
                  Masuk Akun Mitra
                </div>
                <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                  Selamat Datang Kembali
                </h1>
                <p className="mt-1.5 text-sm text-gray-500">
                  Masukkan nomor WhatsApp atau alamat email yang telah terdaftar pada platform SAMANGGA.
                </p>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    PILIH PROFIL KEMITRAAN ANDA:
                  </label>
                  <span className="hidden sm:inline text-[11px] font-medium text-green-800">
                    Profil aktif: <strong>{selectedRoleData.title}</strong>
                  </span>
                </div>

                <div className="mt-2.5 block sm:hidden">
                  <div
                    role="group"
                    aria-label="Profil Kemitraan (Mobile)"
                    className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none -mx-1 px-1"
                  >
                    {LOGIN_ROLES.map((role) => {
                      const isActive = selectedRole === role.id;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => handleRoleSelect(role.id)}
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all active:scale-95 ${
                            isActive
                              ? "border-green-700 bg-green-700 text-white shadow-xs ring-2 ring-green-700/20"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-xs"
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full ${
                              isActive ? "text-white" : "text-green-700"
                            }`}
                          >
                            {getLoginRoleIcon(role.id)}
                          </span>
                          <span>{role.shortTitle}</span>
                          {isActive && (
                            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-green-800 text-[9px] font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50/70 p-2.5 text-xs text-[#273419]">
                    <div className="flex items-center justify-between font-bold text-green-800">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-700" />
                        {selectedRoleData.title}
                      </span>
                      <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-green-800 shadow-2xs font-semibold">
                        {selectedRoleData.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-gray-600">
                      {selectedRoleData.description}
                    </p>
                  </div>
                </div>

                <div
                  role="group"
                  aria-label="Profil Kemitraan (Desktop)"
                  className="mt-2.5 hidden sm:grid sm:grid-cols-2 gap-2.5"
                >
                  {LOGIN_ROLES.map((role) => {
                    const isActive = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => handleRoleSelect(role.id)}
                        className={`group flex flex-col justify-between rounded-xl p-3 text-left transition-all ${
                          isActive
                            ? "border-2 border-green-700 bg-emerald-50/30 shadow-xs ring-2 ring-green-700/15"
                            : "border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                              isActive
                                ? "bg-green-700 text-white"
                                : "bg-gray-100 text-gray-600 group-hover:bg-green-50 group-hover:text-green-700"
                            }`}
                          >
                            {getLoginRoleIcon(role.id)}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              isActive
                                ? "bg-green-700 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {role.badge}
                          </span>
                        </div>

                        <div className="mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900">{role.title}</span>
                            {isActive && (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-700 text-white">
                                <CheckIcon className="h-2.5 w-2.5" />
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500 line-clamp-2">
                            {role.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleManualLogin} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="identifier" className="block text-xs font-bold text-gray-800">
                    Nomor WhatsApp atau Alamat Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <UserMailIcon className="h-4 w-4" />
                    </span>
                    <input
                      id="identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setIdentifier(e.target.value)}
                      placeholder="Contoh: 08123456789 atau admin@dapurmitra.id"
                      autoComplete="username"
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-[#273419] placeholder:text-gray-400 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/20"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-xs font-bold text-gray-800">
                      Kata Sandi <span className="text-red-500">*</span>
                    </label>
                    <a
                      href="#lupa-sandi"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(
                          "Untuk reset kata sandi, silakan hubungi tim verifikasi SAMANGGA via WhatsApp resmi.",
                        );
                      }}
                      className="text-xs font-semibold text-green-700 hover:text-green-800 hover:underline"
                    >
                      Lupa Kata Sandi?
                    </a>
                  </div>
                  <div className="relative mt-1">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi akun Anda"
                      autoComplete="current-password"
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-4 pr-11 text-sm text-[#273419] placeholder:text-gray-400 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Akses Cepat Akun Demo Resmi */}
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-green-900">⚡ Coba Akun Demo Resmi:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setModalTab("demo");
                        setShowGoogleModal(true);
                      }}
                      className="text-[11px] font-semibold text-green-700 hover:underline cursor-pointer"
                    >
                      Bantuan Demo ➔
                    </button>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {OFFICIAL_DEMO_ACCOUNTS.map((d) => {
                      const isSelected = identifier.toLowerCase() === d.email.toLowerCase();
                      return (
                        <button
                          key={d.email}
                          type="button"
                          onClick={() => handlePickDemo(d)}
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "border-green-700 bg-green-700 text-white font-bold shadow-2xs"
                              : "border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-100"
                          }`}
                          title={`${d.nama} (${d.email})`}
                        >
                          {d.roleBadge}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 accent-green-700 focus:ring-green-700"
                    />
                    <span>Ingat sesi saya selama 30 hari</span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#3D5126] px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#273419] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126] focus-visible:ring-offset-2"
                  >
                    Masuk sebagai {selectedRoleData.title} ➔
                  </button>
                </div>
              </form>

              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 font-semibold uppercase tracking-wider text-gray-400">
                    ATAU MASUK LEWAT GOOGLE
                  </span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold text-gray-700 shadow-2xs transition-all hover:bg-gray-50 hover:border-gray-400 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5126] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGoogleLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-[#3D5126]" />
                  ) : (
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
                  )}
                  <span>
                    {isGoogleLoading ? "Menghubungkan ke Google..." : "Masuk dengan Akun Google"}
                  </span>
                </button>

                <div className="mt-2.5 text-center">
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(true)}
                    className="text-xs text-gray-500 hover:text-emerald-800 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Atau gunakan simulasi akun uji coba / demo
                  </button>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-4 text-center">
                <p className="text-xs text-gray-600">
                  Belum terdaftar sebagai mitra rantai pasok atau sirkular?{" "}
                  <Link
                    href="/daftar"
                    className="font-bold text-green-700 underline-offset-2 hover:text-green-800 hover:underline"
                  >
                    Daftar Akun Kemitraan Baru
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function LoginPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3D5126] border-t-transparent mx-auto" />
            <p className="mt-3 text-xs font-semibold text-gray-600">Memuat halaman masuk...</p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
