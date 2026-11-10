"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, JSX } from "react";
import {
  ArrowRightIcon,
  BellIcon,
  BoxesIcon,
  ChartLineIcon,
  CheckBadgeIcon,
  CheckIcon,
  ClockRotateLeftIcon,
  CreditCardIcon,
  EditIcon,
  FactoryIcon,
  HouseIcon,
  ReceiptIcon,
  SearchIcon,
  RecycleIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SignalIcon,
  SproutIcon,
  TruckIcon,
  UserGearIcon,
  UsersIcon,
  WhatsAppIcon,
  XMarkIcon,
} from "@/components/ui/Icons";
import {
  DEFAULT_PROFILES,
  INITIAL_DETAIL_TRANSAKSI_LIST,
  INITIAL_KEUANGAN_LIST,
  INITIAL_LIMBAH_LIST,
  INITIAL_LOG_SISTEM_LIST,
  INITIAL_PEMBAYARAN_LIST,
  INITIAL_PENGGUNA_LIST,
  INITIAL_PRODUK_LIST,
  INITIAL_RIWAYAT_PENGIRIMAN_LIST,
  INITIAL_TRANSAKSI_LIST,
  ROLE_STORAGE_KEY,
  type AnyRoleProfile,
  type MitraProfile,
  type RoleSlug,
  type UmkmProfile,
} from "@/data/profil";
import { formatNumber, formatRupiah, maskEmail, maskPhone } from "@/lib/format";
import { notifyAuthChange } from "@/components/layout/SiteNavbar";
import {
  findUserByEmail,
  getActiveUserEmail,
  getActiveRole,
  getRegisteredUsers,
  updateUserVerification,
  resubmitMitraPhoto,
  deleteRegisteredUser,
  clearActiveRole,
  clearActiveUserEmail,
  subscribeAuth,
  syncRegisteredUsersFromDatabase,
  type RegisteredUser,
} from "@/lib/auth";
import { sendEmailNotification } from "@/lib/emailNotification";
import KotakEmailModal from "@/components/notification/KotakEmailModal";
import {
  getEcosystemProducts,
  saveEcosystemProduct,
  deleteEcosystemProduct,
  getEcosystemWaste,
  saveEcosystemWaste,
  deleteEcosystemWaste,
  getEcosystemTransactions,
  getEcosystemDetailTransaksi,
  getEcosystemPayments,
  getEcosystemShipments,
  updateShipmentStatus,
  getEcosystemFinances,
  getEcosystemLogs,
  addSystemLog,
  subscribeEcosystem,
} from "@/lib/ecosystemStore";
import type {
  DetailTransaksi,
  JenisKeuangan,
  JenisKompensasi,
  JenisLimbahErd,
  KategoriKonsumenErd,
  KategoriProduk,
  LevelLog,
  Limbah,
  LogSistem,
  MetodePembayaran,
  Pembayaran,
  PencatatanKeuangan,
  Pengguna,
  PeranPengguna,
  Produk,
  RiwayatPengiriman,
  StatusJemput,
  StatusPembayaran,
  StatusPengiriman,
  StatusTransaksi,
  StatusVerifikasi,
  TingkatAkses,
  TipeSupplier,
  Transaksi,
} from "@/types/samangga";

function getRoleIcon(slug: RoleSlug, className = "h-5 w-5"): JSX.Element {
  switch (slug) {
    case "petani":
      return <SproutIcon className={className} />;
    case "umkm":
      return <FactoryIcon className={className} />;
    case "mitra":
      return <RecycleIcon className={className} />;
    case "konsumen":
      return <ShoppingBagIcon className={className} />;
    case "admin":
      return <ShieldCheckIcon className={className} />;
  }
}

function getTabSidebarIcon(tabId: CrudTabId, className = "h-4 w-4"): JSX.Element {
  switch (tabId) {
    case "verifikasi-mitra":
      return <ShieldCheckIcon className={className} />;
    case "produk":
      return <BoxesIcon className={className} />;
    case "limbah":
      return <RecycleIcon className={className} />;
    case "transaksi":
      return <ReceiptIcon className={className} />;
    case "pembayaran":
      return <CreditCardIcon className={className} />;
    case "pengiriman":
      return <TruckIcon className={className} />;
    case "keuangan":
      return <ChartLineIcon className={className} />;
    case "pengguna":
      return <UsersIcon className={className} />;
    case "log":
      return <ClockRotateLeftIcon className={className} />;
    case "profil":
      return <UserGearIcon className={className} />;
  }
}

interface RoleTaskItem {
  id: number;
  title: string;
  time: string;
  done: boolean;
}

interface HalamanBeliLink {
  label: string;
  sublabel: string;
  href: string;
}

const ROLE_HALAMAN_BELI_LINKS: Record<RoleSlug, readonly HalamanBeliLink[]> = {
  petani: [
    {
      label: "Beli Pupuk & Bibit Pohon",
      sublabel: "Fungsi Operasional · Pupuk & Bibit Mitra",
      href: "/fungsi/supplier",
    },
    {
      label: "Pasar Limbah Sirkular",
      sublabel: "Bursa & Salurkan Limbah Panen",
      href: "/pasar-sirkular?role=petani",
    },
    {
      label: "Lihat Katalog Komoditas",
      sublabel: "Navbar Atas · Etalase Buah",
      href: "/katalog?role=petani",
    },
  ],
  umkm: [
    {
      label: "Beli Mangga Bahan Baku",
      sublabel: "Halaman Biasa · Katalog Supplier",
      href: "/katalog?role=umkm",
    },
    {
      label: "Halaman Beli & Setor Limbah",
      sublabel: "Navbar Atas · Operasional UMKM",
      href: "/fungsi/umkm",
    },
    {
      label: "Pasar Limbah Sirkular",
      sublabel: "Navbar Atas · Kompensasi Mitra",
      href: "/pasar-sirkular?role=umkm",
    },
  ],
  mitra: [
    {
      label: "Beli / Ambil Limbah UMKM",
      sublabel: "Halaman Biasa · Pasar Sirkular",
      href: "/pasar-sirkular?role=mitra",
    },
    {
      label: "Halaman Jemput Limbah & Resi",
      sublabel: "Navbar Atas · Operasional Mitra",
      href: "/fungsi/mitra",
    },
    {
      label: "Etalase Pupuk & Bibit Pohon",
      sublabel: "Navbar Atas · Katalog Komoditas",
      href: "/katalog?role=mitra",
    },
  ],
  konsumen: [
    {
      label: "Beli Mangga & Produk Olahan",
      sublabel: "Halaman Biasa · Katalog Utama",
      href: "/katalog?role=konsumen",
    },
    {
      label: "Halaman Checkout & Pembayaran",
      sublabel: "Navbar Atas · Belanja Cepat",
      href: "/fungsi/konsumen",
    },
    {
      label: "Beli Bibit Pohon & Pupuk",
      sublabel: "Navbar Atas · Pasar Sirkular",
      href: "/pasar-sirkular?role=konsumen",
    },
  ],
  admin: [
    {
      label: "Panel Moderasi & Verifikasi",
      sublabel: "Navbar Atas · Fungsi Admin",
      href: "/fungsi/admin",
    },
    {
      label: "Pantau Katalog Publik",
      sublabel: "Navbar Atas · Katalog Produk",
      href: "/katalog",
    },
  ],
};

const ROLE_INITIAL_TASKS: Record<RoleSlug, RoleTaskItem[]> = {
  petani: [
    { id: 1, title: "Proses pesanan 5 Kwintal Mangga dari Konsumen #404", time: "08:00-10:00 AM", done: false },
    { id: 2, title: "Kirim 8 Kwintal Mangga bahan baku ke UMKM #202", time: "11:00-12:00 AM", done: true },
    { id: 3, title: "Terima 10 Karung Pupuk & 20 Bibit Pohon dari Mitra #303", time: "13:00-16:00 PM", done: true },
  ],
  umkm: [
    { id: 1, title: "Kirim pesanan 50 Pak Dodol & 20 Sirup ke Konsumen #404", time: "08:00-10:00 AM", done: false },
    { id: 2, title: "Restock 8 Kwintal Mangga Arumanis dari Supplier #101", time: "11:00-12:00 AM", done: true },
    { id: 3, title: "Serahkan 180 Kg Limbah Kulit ke Mitra #303", time: "13:00-16:00 PM", done: false },
  ],
  mitra: [
    { id: 1, title: "Jemput & beli 180 Kg Limbah Kulit dari UMKM #202", time: "08:00-10:00 AM", done: false },
    { id: 2, title: "Kirim 10 Karung Pupuk & 20 Bibit Pohon ke Petani #101", time: "11:00-12:00 AM", done: true },
    { id: 3, title: "Update Resi Pengiriman Pesanan Konsumen #404", time: "13:00-16:00 PM", done: false },
  ],
  konsumen: [
    { id: 1, title: "Konfirmasi transfer pembelian 5 Kwintal Mangga (Supplier #101)", time: "08:00-10:00 AM", done: false },
    { id: 2, title: "Lacak pengiriman 50 Pak Dodol & Sirup (UMKM #202)", time: "11:00-12:00 AM", done: true },
    { id: 3, title: "Beli tambahan produk olahan & bibit mangga di Katalog", time: "13:00-16:00 PM", done: false },
  ],
  admin: [
    { id: 1, title: "Verifikasi produk baru Supplier #101 & UMKM #202", time: "08:00-10:00 AM", done: false },
    { id: 2, title: "Audit transaksi jual-beli Konsumen, UMKM, Supplier & Mitra", time: "11:00-12:00 AM", done: true },
    { id: 3, title: "Monitoring Log Sistem & Callback Payment Gateway", time: "13:00-16:00 PM", done: false },
  ],
};

const ROLE_NOTIFICATIONS: Record<
  RoleSlug,
  { title: string; time: string; buttonLabel: string; targetTab: CrudTabId }
> = {
  petani: {
    title: "Konsumen Budi & UMKM Bu Ning membeli hasil panen mangga Anda",
    time: "Transaksi Penjualan & Pembelian Pupuk Siap Diproses",
    buttonLabel: "Cek Transaksi",
    targetTab: "transaksi",
  },
  umkm: {
    title: "Konsumen Budi memesan Dodol & Sirup; stok mangga dibeli dari Supplier",
    time: "Penjualan ke Konsumen & Pembelian Bahan Baku",
    buttonLabel: "Kelola Pesanan",
    targetTab: "transaksi",
  },
  mitra: {
    title: "Petani H. Agus membeli Pupuk & Bibit Pohon; 310 Kg limbah UMKM siap dijemput",
    time: "Penjualan Sirkular & Penjemputan Limbah",
    buttonLabel: "Kelola Limbah",
    targetTab: "limbah",
  },
  konsumen: {
    title: "3 Pesanan Mangga Segar & Olahan tercatat pada akun Anda",
    time: "Riwayat Belanja Mangga & Produk Olahan",
    buttonLabel: "Lihat Pesanan",
    targetTab: "transaksi",
  },
  admin: {
    title: "Pendaftaran mitra sirkular & moderasi data ekosistem SAMANGGA",
    time: "Verifikasi Berkas Mitra & Monitoring Platform",
    buttonLabel: "Verifikasi Mitra",
    targetTab: "verifikasi-mitra",
  },
};

function getStatusBadge(status: string): string {
  switch (status) {
    case "Terverifikasi":
    case "Berhasil":
    case "Selesai":
    case "Tiba di Lokasi":
    case "Pemasukan":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "Menunggu":
    case "Pending":
    case "Diajukan":
    case "Tersedia":
    case "Warning":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "Diproses":
    case "Proses":
    case "Dalam Perjalanan":
    case "Info":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "Ditolak":
    case "Gagal":
    case "Batal":
    case "Kedaluwarsa":
    case "Error":
    case "Pengeluaran":
      return "bg-red-50 text-red-600 border-red-100";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

type CrudTabId =
  | "verifikasi-mitra"
  | "produk"
  | "transaksi"
  | "pembayaran"
  | "limbah"
  | "pengiriman"
  | "keuangan"
  | "pengguna"
  | "log"
  | "profil";

export type ActiveViewId = "home" | CrudTabId;

interface TabOption {
  id: CrudTabId;
  label: string;
  tableName: string;
}

const ROLE_TABS: Record<RoleSlug, readonly TabOption[]> = {
  petani: [
    { id: "produk", label: "Produk", tableName: "Produk" },
    { id: "transaksi", label: "Transaksi", tableName: "Transaksi" },
    { id: "pembayaran", label: "Pembayaran", tableName: "Pembayaran" },
    { id: "pengiriman", label: "Pengiriman", tableName: "Pengiriman" },
    { id: "keuangan", label: "Keuangan", tableName: "Keuangan" },
    { id: "profil", label: "Profil", tableName: "Profil" },
  ],
  umkm: [
    { id: "produk", label: "Produk", tableName: "Produk" },
    { id: "limbah", label: "Limbah", tableName: "Limbah" },
    { id: "transaksi", label: "Transaksi", tableName: "Transaksi" },
    { id: "pembayaran", label: "Pembayaran", tableName: "Pembayaran" },
    { id: "keuangan", label: "Keuangan", tableName: "Keuangan" },
    { id: "profil", label: "Profil", tableName: "Profil" },
  ],
  mitra: [
    { id: "limbah", label: "Limbah", tableName: "Limbah" },
    { id: "pengiriman", label: "Pengiriman", tableName: "Pengiriman" },
    { id: "keuangan", label: "Keuangan", tableName: "Keuangan" },
    { id: "profil", label: "Profil", tableName: "Profil" },
  ],
  konsumen: [
    { id: "transaksi", label: "Pesanan", tableName: "Pesanan" },
    { id: "pembayaran", label: "Pembayaran", tableName: "Pembayaran" },
    { id: "pengiriman", label: "Pengiriman", tableName: "Pengiriman" },
    { id: "keuangan", label: "Keuangan", tableName: "Keuangan" },
    { id: "profil", label: "Profil", tableName: "Profil" },
  ],
  admin: [
    { id: "verifikasi-mitra", label: "Verifikasi Mitra", tableName: "Verifikasi Mitra" },
    { id: "pengguna", label: "Pengguna", tableName: "Pengguna" },
    { id: "produk", label: "Produk", tableName: "Produk" },
    { id: "limbah", label: "Limbah", tableName: "Limbah" },
    { id: "transaksi", label: "Transaksi", tableName: "Transaksi" },
    { id: "pengiriman", label: "Pengiriman", tableName: "Pengiriman" },
    { id: "keuangan", label: "Keuangan", tableName: "Keuangan" },
    { id: "log", label: "Log", tableName: "Log" },
    { id: "profil", label: "Profil", tableName: "Profil" },
  ],
};

function mapRegisteredUserToPengguna(ru: RegisteredUser, idx: number): Pengguna {
  const numericId = parseInt(ru.id.replace(/\D/g, "").slice(-4), 10) || 101 + idx;
  const alamat =
    (ru.extraData?.alamatPengiriman as string) ||
    (ru.extraData?.alamat as string) ||
    (ru.extraData?.jangkauanArea as string) ||
    "Indramayu, Jawa Barat";

  return {
    id_user: numericId,
    nama_lengkap: ru.namaLengkap,
    peran: ru.peranErd,
    no_telp: ru.nomorWhatsapp || "-",
    alamat,
    email: ru.email,
    password: "••••••••",
    status_verifikasi: ru.statusVerifikasi,
    tgl_daftar: ru.registeredAt,
  };
}

interface ProfilRoleProps {
  fixedRole: RoleSlug;
}

export default function ProfilRole({ fixedRole }: ProfilRoleProps): JSX.Element {
  const currentRole: RoleSlug = fixedRole;
  const availableTabs = ROLE_TABS[currentRole];

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveViewId>("home");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auth Guard State: Dashboard terlindungi dan mewajibkan autentikasi login
  const [authGuardChecked, setAuthGuardChecked] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [sessionRole, setSessionRole] = useState<RoleSlug | null>(null);

  // Privasi Data Pribadi Pengguna (UU PDP): Sensor default email & nomor telepon
  const [isPrivacyMasked, setIsPrivacyMasked] = useState<boolean>(true);

  // Validasi Sesi Autentikasi dan Otorisasi Hak Akses Peran
  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = getActiveRole();
    const email = getActiveUserEmail();
    const hasSession = Boolean(role && email);

    setSessionRole(role);
    setIsAuthenticated(hasSession);

    if (!hasSession) {
      setAuthGuardChecked(true);
      setIsAuthorized(false);
      return;
    }

    if (currentRole === "admin") {
      setIsAuthorized(role === "admin");
    } else {
      setIsAuthorized(role === currentRole || role === "admin");
    }
    setAuthGuardChecked(true);
  }, [currentRole]);

  // Sesi Guard: Jika akun pengguna telah dihapus oleh Admin, keluarkan dari sesi dashboard
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentRole === "admin") return;

    const activeEmail = getActiveUserEmail();
    if (activeEmail && !findUserByEmail(activeEmail)) {
      clearActiveRole();
      clearActiveUserEmail();
      alert("Akun Anda telah dihapus oleh Administrator platform SAMANGGA. Sesi dashboard telah diakhiri.");
      router.push("/login?error=account_deleted");
    }
  }, [currentRole, router]);

  // State data
  const [profiles, setProfiles] = useState<Record<RoleSlug, AnyRoleProfile>>(DEFAULT_PROFILES);
  const [penggunaList, setPenggunaList] = useState<Pengguna[]>(() => {
    const fromStorage = getRegisteredUsers().map(mapRegisteredUserToPengguna);
    const storageEmails = new Set(fromStorage.map((u) => u.email.toLowerCase()));
    const initialRemaining = INITIAL_PENGGUNA_LIST.filter(
      (p) => !storageEmails.has(p.email.toLowerCase()),
    );
    return [...fromStorage, ...initialRemaining];
  });
  const [produkList, setProdukList] = useState<Produk[]>(() => getEcosystemProducts());
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>(() => getEcosystemTransactions());
  const [detailTransaksiList, setDetailTransaksiList] = useState<DetailTransaksi[]>(() =>
    getEcosystemDetailTransaksi(),
  );
  const [pembayaranList, setPembayaranList] = useState<Pembayaran[]>(() => getEcosystemPayments());
  const [limbahList, setLimbahList] = useState<Limbah[]>(() => getEcosystemWaste());
  const [pengirimanList, setPengirimanList] = useState<RiwayatPengiriman[]>(() =>
    getEcosystemShipments(),
  );
  const [keuanganList, setKeuanganList] = useState<PencatatanKeuangan[]>(() => getEcosystemFinances());
  const [logList, setLogList] = useState<LogSistem[]>(() => getEcosystemLogs());

  // Sinkronisasi data realtime ekosistem SAMANGGA lintas peran
  useEffect(() => {
    const syncEcosystemData = (): void => {
      setProdukList(getEcosystemProducts());
      setTransaksiList(getEcosystemTransactions());
      setDetailTransaksiList(getEcosystemDetailTransaksi());
      setPembayaranList(getEcosystemPayments());
      setLimbahList(getEcosystemWaste());
      setPengirimanList(getEcosystemShipments());
      setKeuanganList(getEcosystemFinances());
      setLogList(getEcosystemLogs());
    };
    const unsub = subscribeEcosystem(syncEcosystemData);
    return unsub;
  }, []);

  const profile = profiles[currentRole];

  const showToast = (msg: string): void => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const addLog = (aksi: string, endpoint: string, pesan: string, level: LevelLog = "Info"): void => {
    addSystemLog(aksi, endpoint, pesan, level, profile.id_user);
    setLogList(getEcosystemLogs());
  };

  const getUserName = (idUser: number): string => {
    const u = penggunaList.find((x) => x.id_user === idUser);
    return u ? u.nama_lengkap : `User #${idUser}`;
  };

  // Data Pengguna Terdaftar & Verifikasi Kemitraan
  const [registeredUsersList, setRegisteredUsersList] = useState<RegisteredUser[]>(() =>
    getRegisteredUsers(),
  );
  const [isSyncingUsers, setIsSyncingUsers] = useState<boolean>(false);

  useEffect(() => {
    // Sinkronisasi data pendaftar & mitra dari database Supabase PostgreSQL
    syncRegisteredUsersFromDatabase();

    const unsub = subscribeAuth(() => {
      setRegisteredUsersList(getRegisteredUsers());
    });
    return unsub;
  }, []);

  // Sinkronkan registeredUsersList ke penggunaList secara real-time
  useEffect(() => {
    const fromStorage = registeredUsersList.map(mapRegisteredUserToPengguna);
    setPenggunaList((prev) => {
      const storageEmails = new Set(fromStorage.map((u) => u.email.toLowerCase()));
      const customAdded = prev.filter((p) => !storageEmails.has(p.email.toLowerCase()));
      return [...fromStorage, ...customAdded];
    });
  }, [registeredUsersList]);

  // Sinkronkan data pengguna yang login ke state profil agar data asli muncul (bukan dummy)
  useEffect(() => {
    const activeEmail = getActiveUserEmail();
    const activeUser = activeEmail ? findUserByEmail(activeEmail) : null;
    const targetUser =
      activeUser?.role === currentRole
        ? activeUser
        : registeredUsersList.find((u) => u.role === currentRole);

    if (targetUser) {
      setProfiles((prev) => {
        const cur = prev[currentRole];
        const numericId = parseInt(targetUser.id.replace(/\D/g, "").slice(-4), 10) || cur.id_user;
        const updated = {
          ...cur,
          id_user: numericId,
          nama_lengkap: targetUser.namaLengkap,
          email: targetUser.email,
          no_telp: targetUser.nomorWhatsapp || cur.no_telp,
          alamat:
            (targetUser.extraData?.alamat as string) ||
            (targetUser.extraData?.alamatPengiriman as string) ||
            (targetUser.extraData?.jangkauanArea as string) ||
            cur.alamat,
          status_verifikasi: targetUser.statusVerifikasi || cur.status_verifikasi,
        };

        if (currentRole === "umkm") {
          if (targetUser.extraData?.namaUsaha) {
            (updated as UmkmProfile).nama_usaha = targetUser.extraData.namaUsaha as string;
          }
          if (targetUser.extraData?.nib) {
            (updated as UmkmProfile).nib = targetUser.extraData.nib as string;
          }
          if (targetUser.extraData?.kapasitasProduksi) {
            (updated as UmkmProfile).kapasitas_produksi_bulanan = Number(targetUser.extraData.kapasitasProduksi) || 0;
          }
        } else if (currentRole === "mitra") {
          if (targetUser.extraData?.namaInstansi) {
            (updated as MitraProfile).nama_mitra_instansi = targetUser.extraData.namaInstansi as string;
          }
          if (targetUser.extraData?.kapasitasPengolahan) {
            (updated as MitraProfile).kapasitas_tampung_limbah_kg = Number(targetUser.extraData.kapasitasPengolahan) || 0;
          }
          if (targetUser.extraData?.jangkauanArea) {
            (updated as MitraProfile).jangkauan_area = targetUser.extraData.jangkauanArea as string;
          }
        }

        return {
          ...prev,
          [currentRole]: updated as AnyRoleProfile,
        };
      });
    }
  }, [currentRole, registeredUsersList]);

  // State Verifikasi Mitra untuk Admin
  const [inspectPhoto, setInspectPhoto] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);
  const [rejectModalTarget, setRejectModalTarget] = useState<RegisteredUser | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [mitraFilterStatus, setMitraFilterStatus] = useState<string>("Semua");
  const [mitraSearchQuery, setMitraSearchQuery] = useState<string>("");

  // State untuk Mitra saat kirim ulang foto berkas
  const [activeMitraTestId, setActiveMitraTestId] = useState<string | null>(null);
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState<boolean>(false);
  const [resubmitPreview, setResubmitPreview] = useState<string | null>(null);
  const [resubmitChosenName, setResubmitChosenName] = useState<string>("");
  const [isKotakEmailOpen, setIsKotakEmailOpen] = useState<boolean>(false);

  const allMitraUsers = useMemo(() => {
    return registeredUsersList.filter((u) => u.role === "mitra");
  }, [registeredUsersList]);

  const pendingMitraCount = useMemo(() => {
    return allMitraUsers.filter((u) => u.statusVerifikasi === "Menunggu").length;
  }, [allMitraUsers]);

  const verifiedMitraCount = useMemo(() => {
    return allMitraUsers.filter((u) => u.statusVerifikasi === "Terverifikasi").length;
  }, [allMitraUsers]);

  const rejectedMitraCount = useMemo(() => {
    return allMitraUsers.filter((u) => u.statusVerifikasi === "Ditolak").length;
  }, [allMitraUsers]);

  const filteredMitraUsers = useMemo(() => {
    return allMitraUsers.filter((m) => {
      const matchesFilter =
        mitraFilterStatus === "Semua" || m.statusVerifikasi === mitraFilterStatus;
      if (!matchesFilter) return false;
      if (!mitraSearchQuery.trim()) return true;
      const q = mitraSearchQuery.toLowerCase();
      const instansi = (m.extraData?.namaInstansi as string) || "";
      return (
        m.namaLengkap.toLowerCase().includes(q) ||
        instansi.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.nomorWhatsapp.includes(q)
      );
    });
  }, [allMitraUsers, mitraFilterStatus, mitraSearchQuery]);

  const currentMitraUser = useMemo(() => {
    if (currentRole !== "mitra") return null;
    if (allMitraUsers.length === 0) return null;
    if (activeMitraTestId) {
      const found = allMitraUsers.find((m) => m.id === activeMitraTestId);
      if (found) return found;
    }
    const pendingOrRejected = allMitraUsers.find(
      (m) => m.statusVerifikasi === "Menunggu" || m.statusVerifikasi === "Ditolak",
    );
    if (pendingOrRejected) return pendingOrRejected;

    return (
      allMitraUsers.find((m) => m.email.toLowerCase() === profile.email.toLowerCase()) ??
      allMitraUsers[0]
    );
  }, [currentRole, allMitraUsers, profile.email, activeMitraTestId]);

  const handleAccMitra = (mitra: RegisteredUser): void => {
    const updated = updateUserVerification(mitra.id, "Terverifikasi");
    if (updated) {
      setRegisteredUsersList(getRegisteredUsers());
      // Kirim email persetujuan ke email pribadi mitra
      sendEmailNotification({
        to: mitra.email,
        recipientName: mitra.namaLengkap,
        type: "VERIFIKASI_DISETUJUI",
        role: mitra.role,
      });
      showToast(
        `✓ Kemitraan ${(mitra.extraData?.namaInstansi as string) || mitra.namaLengkap} disetujui (ACC)! Email notifikasi dikirim ke ${mitra.email}`,
      );
      addLog(
        "VERIFIKASI_MITRA_ACC",
        "/api/admin/mitra/acc",
        `Admin menyetujui kemitraan ${mitra.namaLengkap} (${mitra.id}) - Email terkirim ke ${mitra.email}`,
        "Info",
      );
    }
  };

  const openRejectModal = (mitra: RegisteredUser): void => {
    setRejectModalTarget(mitra);
    setRejectReason(
      mitra.alasanPenolakan ||
        "Foto dokumen atau lahan fasilitas tidak jelas / buram. Mohon unggah ulang foto yang jelas dan terbaca.",
    );
  };

  const closeRejectModal = (): void => {
    setRejectModalTarget(null);
    setRejectReason("");
  };

  const handleConfirmRejectMitra = (): void => {
    if (!rejectModalTarget) return;
    const reason =
      rejectReason.trim() ||
      "Foto dokumen atau fasilitas tidak memenuhi syarat / tidak terbaca jelas";
    const updated = updateUserVerification(rejectModalTarget.id, "Ditolak", reason);
    if (updated) {
      setRegisteredUsersList(getRegisteredUsers());
      // Kirim email penolakan & panduan foto ke email pribadi mitra
      sendEmailNotification({
        to: rejectModalTarget.email,
        recipientName: rejectModalTarget.namaLengkap,
        type: "VERIFIKASI_DITOLAK_FOTO",
        role: rejectModalTarget.role,
        reason,
      });
      showToast(
        `✕ Kemitraan ${rejectModalTarget.namaLengkap} ditolak. Surat email instruksi perbaikan foto telah otomatis dikirimkan ke ${rejectModalTarget.email}`,
      );
      addLog(
        "VERIFIKASI_MITRA_TOLAK",
        "/api/admin/mitra/reject",
        `Admin menolak dokumen kemitraan ${rejectModalTarget.namaLengkap} (${rejectModalTarget.id}): ${reason} - Notifikasi email dikirim ke ${rejectModalTarget.email}`,
        "Warning",
      );
      closeRejectModal();
    }
  };


  const handleResubmitFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setResubmitPreview(reader.result as string);
        setResubmitChosenName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmResubmitMitra = (): void => {
    if (!currentMitraUser || !resubmitPreview) return;
    const photoName = resubmitChosenName || "berkas-persyaratan-mitra.jpg";
    const updated = resubmitMitraPhoto(currentMitraUser.id, resubmitPreview, photoName);
    if (updated) {
      setRegisteredUsersList(getRegisteredUsers());
      setIsResubmitModalOpen(false);
      setResubmitPreview(null);
      setResubmitChosenName("");
      showToast("✓ Berkas perbaikan berhasil dikirimkan ulang! Menunggu verifikasi admin.");
      addLog(
        "MITRA_KIRIM_ULANG_DOKUMEN",
        "/api/mitra/resubmit",
        `Mitra ${currentMitraUser.namaLengkap} mengirim ulang berkas verifikasi: ${photoName}`,
        "Info",
      );
    }
  };

  // Produk
  const [isProdukFormOpen, setIsProdukFormOpen] = useState<boolean>(false);
  const [editingProdukId, setEditingProdukId] = useState<number | null>(null);
  const [formProduk, setFormProduk] = useState<{
    nama_produk: string;
    kategori: KategoriProduk;
    harga: number;
    stok: number;
    satuan: string;
    deskripsi: string;
    gambar: string;
    status_verifikasi: StatusVerifikasi;
  }>({
    nama_produk: "",
    kategori: currentRole === "petani" ? "Buah" : "Olahan",
    harga: 25000,
    stok: 50,
    satuan: currentRole === "petani" ? "Kwintal" : "Pak",
    deskripsi: "",
    gambar: "/images/mangga/mangga_gincu.jpg",
    status_verifikasi: "Menunggu",
  });

  const openCreateProduk = (): void => {
    setEditingProdukId(null);
    setFormProduk({
      nama_produk: "",
      kategori: currentRole === "petani" ? "Buah" : "Olahan",
      harga: currentRole === "petani" ? 1200000 : 25000,
      stok: 50,
      satuan: currentRole === "petani" ? "Kwintal" : "Pak",
      deskripsi: "",
      gambar: "",
      status_verifikasi: currentRole === "admin" ? "Terverifikasi" : "Menunggu",
    });
    setIsProdukFormOpen(true);
  };

  const openEditProduk = (p: Produk): void => {
    setEditingProdukId(p.id_produk);
    setFormProduk({
      nama_produk: p.nama_produk,
      kategori: p.kategori,
      harga: p.harga,
      stok: p.stok,
      satuan: p.satuan,
      deskripsi: p.deskripsi,
      gambar: p.gambar,
      status_verifikasi: p.status_verifikasi,
    });
    setIsProdukFormOpen(true);
  };

  const handleSaveProduk = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!formProduk.gambar || formProduk.gambar.trim() === "") {
      showToast("⚠️ Foto produk wajib diunggah! Silakan pilih foto produk.");
      return;
    }
    const saved = saveEcosystemProduct({
      id_produk: editingProdukId ?? undefined,
      id_user: profile.id_user,
      ...formProduk,
    });
    setProdukList(getEcosystemProducts());
    if (editingProdukId !== null) {
      showToast(`✓ Produk #${editingProdukId} (${formProduk.nama_produk}) berhasil diperbarui.`);
    } else {
      showToast(`✓ Produk baru #${saved.id_produk} (${formProduk.nama_produk}) berhasil ditambahkan.`);
    }
    setIsProdukFormOpen(false);
    setEditingProdukId(null);
  };

  const handleDeleteProduk = (idProduk: number): void => {
    deleteEcosystemProduct(idProduk);
    setProdukList(getEcosystemProducts());
    showToast(`✓ Produk #${idProduk} berhasil dihapus.`);
  };

  // Limbah
  const [isLimbahFormOpen, setIsLimbahFormOpen] = useState<boolean>(false);
  const [editingLimbahId, setEditingLimbahId] = useState<number | null>(null);
  const [formLimbah, setFormLimbah] = useState<{
    jenis_limbah: JenisLimbahErd;
    berat_kg: number;
    estimasi_harga: number;
    jenis_kompensasi: JenisKompensasi;
    harga_kesepakatan: number;
    lokasi_penjemputan: string;
    titik_koordinat: string;
    foto_limbah: string;
    status_jemput: StatusJemput;
    status_verifikasi: StatusVerifikasi;
    id_mitra: number | null;
  }>({
    jenis_limbah: "Kulit",
    berat_kg: 120,
    estimasi_harga: 120000,
    jenis_kompensasi: "Jual Beli",
    harga_kesepakatan: 120000,
    lokasi_penjemputan: "Jl. Raya Sindang No. 45, Indramayu Kota",
    titik_koordinat: "-6.327510, 108.324900",
    foto_limbah: "limbah_mangga.jpg",
    status_jemput: "Tersedia",
    status_verifikasi: "Menunggu",
    id_mitra: null,
  });

  const openCreateLimbah = (): void => {
    setEditingLimbahId(null);
    setFormLimbah({
      jenis_limbah: "Kulit",
      berat_kg: 100,
      estimasi_harga: 120000,
      jenis_kompensasi: "Jual Beli",
      harga_kesepakatan: 120000,
      lokasi_penjemputan: profile.alamat || "Dapur Produksi UMKM Bu Ning, Indramayu",
      titik_koordinat: "-6.327510, 108.324900",
      foto_limbah: "",
      status_jemput: "Tersedia",
      status_verifikasi: currentRole === "admin" ? "Terverifikasi" : "Menunggu",
      id_mitra: currentRole === "mitra" ? 3 : null,
    });
    setIsLimbahFormOpen(true);
  };

  const openEditLimbah = (l: Limbah): void => {
    setEditingLimbahId(l.id_limbah);
    setFormLimbah({
      jenis_limbah: l.jenis_limbah,
      berat_kg: l.berat_kg,
      estimasi_harga: l.estimasi_harga,
      jenis_kompensasi: l.jenis_kompensasi ?? "Jual Beli",
      harga_kesepakatan: l.harga_kesepakatan ?? l.estimasi_harga,
      lokasi_penjemputan: l.lokasi_penjemputan,
      titik_koordinat: l.titik_koordinat ?? "",
      foto_limbah: l.foto_limbah,
      status_jemput: l.status_jemput,
      status_verifikasi: l.status_verifikasi,
      id_mitra: l.id_mitra ?? (currentRole === "mitra" ? 3 : null),
    });
    setIsLimbahFormOpen(true);
  };

  const handleSaveLimbah = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!formLimbah.foto_limbah || formLimbah.foto_limbah.trim() === "") {
      showToast("⚠️ Foto limbah wajib diunggah! Silakan pilih berkas foto.");
      return;
    }
    const saved = saveEcosystemWaste({
      id_limbah: editingLimbahId ?? undefined,
      id_umkm: profile.id_user,
      id_mitra: formLimbah.id_mitra,
      jenis_limbah: formLimbah.jenis_limbah,
      berat_kg: formLimbah.berat_kg,
      estimasi_harga: formLimbah.estimasi_harga,
      jenis_kompensasi: formLimbah.jenis_kompensasi,
      harga_kesepakatan: formLimbah.harga_kesepakatan,
      lokasi_penjemputan: formLimbah.lokasi_penjemputan,
      titik_koordinat: formLimbah.titik_koordinat || null,
      foto_limbah: formLimbah.foto_limbah,
      status_jemput: formLimbah.status_jemput,
      status_verifikasi: formLimbah.status_verifikasi,
    });
    setLimbahList(getEcosystemWaste());
    if (editingLimbahId !== null) {
      showToast(`✓ Data Limbah #${editingLimbahId} berhasil diperbarui.`);
    } else {
      showToast(`✓ Data Limbah baru #${saved.id_limbah} berhasil ditambahkan.`);
    }
    setIsLimbahFormOpen(false);
    setEditingLimbahId(null);
  };

  const handleDeleteLimbah = (idLimbah: number): void => {
    deleteEcosystemWaste(idLimbah);
    setLimbahList(getEcosystemWaste());
    showToast(`✓ Data Limbah #${idLimbah} berhasil dihapus.`);
  };

  // Transaksi & Pembayaran
  const [isTransaksiFormOpen, setIsTransaksiFormOpen] = useState<boolean>(false);
  const [editingTransaksiId, setEditingTransaksiId] = useState<number | null>(null);
  const [formTransaksi, setFormTransaksi] = useState<{
    id_produk: number;
    jumlah_produk: number;
    status: StatusTransaksi;
    metode_pembayaran: MetodePembayaran;
    status_pembayaran: StatusPembayaran;
    bukti_transfer: string;
  }>({
    id_produk: 1001,
    jumlah_produk: 2,
    status: "Pending",
    metode_pembayaran: "QRIS",
    status_pembayaran: "Menunggu",
    bukti_transfer: "",
  });

  const openCreateTransaksi = (): void => {
    setEditingTransaksiId(null);
    setFormTransaksi({
      id_produk: currentRole === "umkm" ? 1001 : 2001,
      jumlah_produk: 2,
      status: "Pending",
      metode_pembayaran: "QRIS",
      status_pembayaran: "Menunggu",
      bukti_transfer: "",
    });
    setIsTransaksiFormOpen(true);
  };

  const openEditTransaksi = (t: Transaksi): void => {
    const det = detailTransaksiList.find((d) => d.id_transaksi === t.id_transaksi);
    const pay = pembayaranList.find((p) => p.id_transaksi === t.id_transaksi);
    setEditingTransaksiId(t.id_transaksi);
    setFormTransaksi({
      id_produk: det?.id_produk ?? 1001,
      jumlah_produk: det?.jumlah_produk ?? 1,
      status: t.status,
      metode_pembayaran: pay?.metode_pembayaran ?? "QRIS",
      status_pembayaran: pay?.status_pembayaran ?? "Menunggu",
      bukti_transfer: pay?.bukti_transfer ?? "",
    });
    setIsTransaksiFormOpen(true);
  };

  const handleSaveTransaksi = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const selectedProd = produkList.find((p) => p.id_produk === formTransaksi.id_produk) ?? produkList[0];
    if (!selectedProd) {
      showToast("Belum ada data produk tersedia untuk transaksi.");
      return;
    }
    const total = selectedProd.harga * formTransaksi.jumlah_produk;

    if (editingTransaksiId !== null) {
      setTransaksiList((prev) =>
        prev.map((t) =>
          t.id_transaksi === editingTransaksiId
            ? { ...t, total_harga: total, status: formTransaksi.status }
            : t,
        ),
      );
      setDetailTransaksiList((prev) =>
        prev.map((d) =>
          d.id_transaksi === editingTransaksiId
            ? {
                ...d,
                id_produk: selectedProd.id_produk,
                jumlah_produk: formTransaksi.jumlah_produk,
                harga_satuan: selectedProd.harga,
                subtotal_harga: total,
              }
            : d,
        ),
      );
      setPembayaranList((prev) =>
        prev.map((p) =>
          p.id_transaksi === editingTransaksiId
            ? {
                ...p,
                metode_pembayaran: formTransaksi.metode_pembayaran,
                jumlah_bayar: total,
                status_pembayaran: formTransaksi.status_pembayaran,
                bukti_transfer: formTransaksi.bukti_transfer || p.bukti_transfer,
                tgl_bayar:
                  formTransaksi.status_pembayaran === "Berhasil" ? p.tgl_bayar ?? now : p.tgl_bayar,
              }
            : p,
        ),
      );
      addLog("UPDATE_TRANSAKSI", `PUT /api/transaksi/${editingTransaksiId}`, `Memperbarui Transaksi #${editingTransaksiId} (status: ${formTransaksi.status}, pembayaran: ${formTransaksi.status_pembayaran}).`);
      showToast(`✓ Data Transaksi #${editingTransaksiId} & Pembayaran berhasil diperbarui.`);
    } else {
      const nextTrxId = transaksiList.reduce((max, t) => Math.max(max, t.id_transaksi), 5000) + 1;
      const nextDetId =
        detailTransaksiList.reduce((max, d) => Math.max(max, d.id_detail_transaksi), 9000) + 1;
      const nextPayId = pembayaranList.reduce((max, p) => Math.max(max, p.id_pembayaran), 7000) + 1;
      const nextShipId = pengirimanList.reduce((max, s) => Math.max(max, s.id_pengiriman), 8000) + 1;

      const pembeliId = currentRole === "konsumen" || currentRole === "umkm" ? profile.id_user : 404;

      setTransaksiList((prev) => [
        {
          id_transaksi: nextTrxId,
          id_pembeli: pembeliId,
          id_penjual: selectedProd.id_user,
          tgl_transaksi: now,
          total_harga: total,
          status: formTransaksi.status,
        },
        ...prev,
      ]);
      setDetailTransaksiList((prev) => [
        {
          id_detail_transaksi: nextDetId,
          id_transaksi: nextTrxId,
          id_produk: selectedProd.id_produk,
          jumlah_produk: formTransaksi.jumlah_produk,
          harga_satuan: selectedProd.harga,
          subtotal_harga: total,
        },
        ...prev,
      ]);
      setPembayaranList((prev) => [
        {
          id_pembayaran: nextPayId,
          id_transaksi: nextTrxId,
          metode_pembayaran: formTransaksi.metode_pembayaran,
          jumlah_bayar: total,
          status_pembayaran: formTransaksi.status_pembayaran,
          id_referensi_gateway:
            formTransaksi.metode_pembayaran === "Transfer Manual" ? null : `GW-${nextTrxId}`,
          kode_pembayaran:
            formTransaksi.metode_pembayaran === "Transfer Manual" ? null : `PAY-${nextTrxId}`,
          bukti_transfer:
            formTransaksi.metode_pembayaran === "Transfer Manual"
              ? formTransaksi.bukti_transfer || `bukti_tf_${nextTrxId}.jpg`
              : null,
          batas_waktu_bayar: "2026-11-06 23:59:00",
          tgl_bayar: formTransaksi.status_pembayaran === "Berhasil" ? now : null,
        },
        ...prev,
      ]);
      setPengirimanList((prev) => [
        {
          id_pengiriman: nextShipId,
          id_transaksi: nextTrxId,
          id_mitra: 3,
          tgl_pengiriman: now,
          no_resi_lacak: `RESI-SMG-2026-${nextTrxId}`,
          status_pengiriman: "Diproses",
          tgl_diterima: null,
        },
        ...prev,
      ]);
      addLog("CREATE_TRANSAKSI", "POST /api/transaksi", `Membuat Transaksi baru #${nextTrxId} (${selectedProd.nama_produk}).`);
      showToast(`✓ Transaksi baru #${nextTrxId} berhasil ditambahkan.`);
    }
    setIsTransaksiFormOpen(false);
    setEditingTransaksiId(null);
  };

  const handleDeleteTransaksi = (idTransaksi: number): void => {
    setTransaksiList((prev) => prev.filter((t) => t.id_transaksi !== idTransaksi));
    setDetailTransaksiList((prev) => prev.filter((d) => d.id_transaksi !== idTransaksi));
    setPembayaranList((prev) => prev.filter((p) => p.id_transaksi !== idTransaksi));
    addLog("DELETE_TRANSAKSI", `DELETE /api/transaksi/${idTransaksi}`, `Menghapus Transaksi #${idTransaksi}.`, "Warning");
    showToast(`✓ Transaksi #${idTransaksi} berhasil dihapus.`);
  };

  // Pengiriman
  const [isPengirimanFormOpen, setIsPengirimanFormOpen] = useState<boolean>(false);
  const [editingPengirimanId, setEditingPengirimanId] = useState<number | null>(null);
  const [formPengiriman, setFormPengiriman] = useState<{
    id_transaksi: number;
    id_mitra: number | null;
    no_resi_lacak: string;
    status_pengiriman: StatusPengiriman;
    tgl_pengiriman: string;
  }>({
    id_transaksi: 5001,
    id_mitra: 3,
    no_resi_lacak: "",
    status_pengiriman: "Diproses",
    tgl_pengiriman: "2026-11-03 10:00:00",
  });

  const openCreatePengiriman = (): void => {
    const nextResi = `RESI-SMG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setEditingPengirimanId(null);
    setFormPengiriman({
      id_transaksi: transaksiList[0]?.id_transaksi ?? 5001,
      id_mitra: 3,
      no_resi_lacak: nextResi,
      status_pengiriman: "Diproses",
      tgl_pengiriman: new Date().toISOString().replace("T", " ").slice(0, 19),
    });
    setIsPengirimanFormOpen(true);
  };

  const openEditPengiriman = (s: RiwayatPengiriman): void => {
    setEditingPengirimanId(s.id_pengiriman);
    setFormPengiriman({
      id_transaksi: s.id_transaksi,
      id_mitra: s.id_mitra,
      no_resi_lacak: s.no_resi_lacak,
      status_pengiriman: s.status_pengiriman,
      tgl_pengiriman: s.tgl_pengiriman,
    });
    setIsPengirimanFormOpen(true);
  };

  const handleSavePengiriman = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    if (editingPengirimanId !== null) {
      setPengirimanList((prev) =>
        prev.map((s) =>
          s.id_pengiriman === editingPengirimanId
            ? {
                ...s,
                ...formPengiriman,
                tgl_diterima:
                  formPengiriman.status_pengiriman === "Tiba di Lokasi" ? s.tgl_diterima ?? now : null,
              }
            : s,
        ),
      );
      showToast(`✓ Data Pengiriman #${editingPengirimanId} berhasil diperbarui.`);
    } else {
      const nextId = pengirimanList.reduce((max, s) => Math.max(max, s.id_pengiriman), 8000) + 1;
      setPengirimanList((prev) => [
        {
          id_pengiriman: nextId,
          ...formPengiriman,
          tgl_diterima: formPengiriman.status_pengiriman === "Tiba di Lokasi" ? now : null,
        },
        ...prev,
      ]);
      showToast(`✓ Data Pengiriman #${nextId} berhasil ditambahkan.`);
    }
    setIsPengirimanFormOpen(false);
    setEditingPengirimanId(null);
  };

  const handleDeletePengiriman = (idPengiriman: number): void => {
    setPengirimanList((prev) => prev.filter((s) => s.id_pengiriman !== idPengiriman));
    showToast(`✓ Data Pengiriman #${idPengiriman} berhasil dihapus.`);
  };

  // Keuangan
  const [isKeuanganFormOpen, setIsKeuanganFormOpen] = useState<boolean>(false);
  const [editingKeuanganId, setEditingKeuanganId] = useState<number | null>(null);
  const [formKeuangan, setFormKeuangan] = useState<{
    refType: "transaksi" | "limbah";
    refId: number;
    jenis_transaksi: JenisKeuangan;
    jumlah_uang: number;
    keterangan: string;
  }>({
    refType: "transaksi",
    refId: 5001,
    jenis_transaksi: "Pemasukan",
    jumlah_uang: 500000,
    keterangan: "",
  });

  const openCreateKeuangan = (): void => {
    setEditingKeuanganId(null);
    setFormKeuangan({
      refType: "transaksi",
      refId: transaksiList[0]?.id_transaksi ?? 5001,
      jenis_transaksi: currentRole === "konsumen" ? "Pengeluaran" : "Pemasukan",
      jumlah_uang: 500000,
      keterangan: "",
    });
    setIsKeuanganFormOpen(true);
  };

  const openEditKeuangan = (k: PencatatanKeuangan): void => {
    setEditingKeuanganId(k.id_keuangan);
    setFormKeuangan({
      refType: k.id_transaksi !== null ? "transaksi" : "limbah",
      refId: k.id_transaksi ?? k.id_limbah ?? 5001,
      jenis_transaksi: k.jenis_transaksi,
      jumlah_uang: k.jumlah_uang,
      keterangan: k.keterangan,
    });
    setIsKeuanganFormOpen(true);
  };

  const handleSaveKeuangan = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const id_transaksi = formKeuangan.refType === "transaksi" ? formKeuangan.refId : null;
    const id_limbah = formKeuangan.refType === "limbah" ? formKeuangan.refId : null;

    if (editingKeuanganId !== null) {
      setKeuanganList((prev) =>
        prev.map((k) =>
          k.id_keuangan === editingKeuanganId
            ? {
                ...k,
                id_transaksi,
                id_limbah,
                jenis_transaksi: formKeuangan.jenis_transaksi,
                jumlah_uang: formKeuangan.jumlah_uang,
                keterangan: formKeuangan.keterangan,
              }
            : k,
        ),
      );
      showToast(`✓ Catatan Keuangan #${editingKeuanganId} berhasil diperbarui.`);
    } else {
      const nextId = keuanganList.reduce((max, k) => Math.max(max, k.id_keuangan), 6000) + 1;
      setKeuanganList((prev) => [
        {
          id_keuangan: nextId,
          id_user: profile.id_user,
          id_transaksi,
          id_limbah,
          tgl_pencatatan: now,
          jenis_transaksi: formKeuangan.jenis_transaksi,
          jumlah_uang: formKeuangan.jumlah_uang,
          keterangan:
            formKeuangan.keterangan.trim() ||
            `Catatan ${formKeuangan.jenis_transaksi} (${formKeuangan.refType} #${formKeuangan.refId})`,
        },
        ...prev,
      ]);
      showToast(`✓ Catatan Keuangan #${nextId} berhasil ditambahkan.`);
    }
    setIsKeuanganFormOpen(false);
    setEditingKeuanganId(null);
  };

  const handleDeleteKeuangan = (idKeuangan: number): void => {
    setKeuanganList((prev) => prev.filter((k) => k.id_keuangan !== idKeuangan));
    showToast(`✓ Catatan Keuangan #${idKeuangan} berhasil dihapus.`);
  };

  // Pengguna & Log
  const [isPenggunaFormOpen, setIsPenggunaFormOpen] = useState<boolean>(false);
  const [editingPenggunaId, setEditingPenggunaId] = useState<number | null>(null);
  const [formPengguna, setFormPengguna] = useState<{
    nama_lengkap: string;
    peran: PeranPengguna;
    email: string;
    no_telp: string;
    alamat: string;
    status_verifikasi: StatusVerifikasi;
  }>({
    nama_lengkap: "",
    peran: "Supplier",
    email: "",
    no_telp: "",
    alamat: "",
    status_verifikasi: "Menunggu",
  });

  const openCreatePengguna = (): void => {
    setEditingPenggunaId(null);
    setFormPengguna({
      nama_lengkap: "",
      peran: "Supplier",
      email: "",
      no_telp: "",
      alamat: "",
      status_verifikasi: "Terverifikasi",
    });
    setIsPenggunaFormOpen(true);
  };

  const openEditPengguna = (u: Pengguna): void => {
    setEditingPenggunaId(u.id_user);
    setFormPengguna({
      nama_lengkap: u.nama_lengkap,
      peran: u.peran,
      email: u.email,
      no_telp: u.no_telp,
      alamat: u.alamat,
      status_verifikasi: u.status_verifikasi,
    });
    setIsPenggunaFormOpen(true);
  };

  const handleSavePengguna = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    if (editingPenggunaId !== null) {
      setPenggunaList((prev) =>
        prev.map((u) => (u.id_user === editingPenggunaId ? { ...u, ...formPengguna } : u)),
      );
      showToast(`✓ Data Pengguna #${editingPenggunaId} berhasil diperbarui.`);
    } else {
      const nextId = penggunaList.reduce((max, u) => Math.max(max, u.id_user), 505) + 1;
      setPenggunaList((prev) => [
        {
          id_user: nextId,
          ...formPengguna,
          password: `$2b$10$hash_${nextId}`,
          tgl_daftar: now,
        },
        ...prev,
      ]);
      showToast(`✓ Pengguna baru #${nextId} berhasil ditambahkan.`);
    }
    setIsPenggunaFormOpen(false);
    setEditingPenggunaId(null);
  };

  const handleDeletePengguna = (idUser: number, targetEmail?: string, targetName?: string): void => {
    const user = penggunaList.find((u) => u.id_user === idUser);
    const emailToDelete = targetEmail || user?.email;
    const nameToDelete = targetName || user?.nama_lengkap || `Pengguna #${idUser}`;

    if (emailToDelete) {
      deleteRegisteredUser(emailToDelete);
    } else {
      deleteRegisteredUser(idUser);
    }

    setPenggunaList((prev) =>
      prev.filter(
        (u) =>
          u.id_user !== idUser &&
          (emailToDelete ? u.email.toLowerCase() !== emailToDelete.toLowerCase() : true),
      ),
    );
    setRegisteredUsersList((prev) =>
      prev.filter((u) =>
        emailToDelete ? u.email.toLowerCase() !== emailToDelete.toLowerCase() : true,
      ),
    );

    addLog(
      "DELETE_PENGGUNA",
      `/api/pengguna/${idUser}`,
      `Menghapus permanen akun pengguna ${nameToDelete} (${emailToDelete || "-"}).`,
      "Warning",
    );
    showToast(`✓ Akun ${nameToDelete} berhasil dihapus secara permanen.`);
  };

  const handleDeleteMitraAccount = (m: RegisteredUser): void => {
    if (
      !window.confirm(
        `Yakin ingin menghapus permanen akun "${(m.extraData?.namaInstansi as string) || m.namaLengkap}" (${m.email})?\n\nSetelah dihapus, pengguna tidak akan bisa login lagi ke sistem.`,
      )
    ) {
      return;
    }
    deleteRegisteredUser(m.email);
    setRegisteredUsersList((prev) =>
      prev.filter((u) => u.id !== m.id && u.email.toLowerCase() !== m.email.toLowerCase()),
    );
    setPenggunaList((prev) =>
      prev.filter((u) => u.email.toLowerCase() !== m.email.toLowerCase()),
    );

    addLog(
      "DELETE_PENGGUNA",
      `/api/mitra/${m.id}`,
      `Menghapus permanen akun pendaftar ${m.namaLengkap} (${m.email}).`,
      "Warning",
    );
    showToast(`✓ Akun ${m.namaLengkap} (${m.email}) berhasil dihapus.`);
  };

  const handleDeleteLog = (idLog: number): void => {
    setLogList((prev) => prev.filter((l) => l.id_log !== idLog));
    showToast(`✓ Log #${idLog} berhasil dihapus.`);
  };

  const updateCurrentProfileField = (field: string, value: string | number): void => {
    setProfiles((prev) => ({
      ...prev,
      [currentRole]: {
        ...prev[currentRole],
        [field]: value,
      } as AnyRoleProfile,
    }));
  };

  // Filter list
  const q = searchQuery.toLowerCase().trim();

  const displayedProduk = useMemo(() => {
    const base =
      currentRole === "admin"
        ? produkList
        : produkList.filter((p) => p.id_user === profile.id_user);
    if (!q) return base;
    return base.filter(
      (p) =>
        p.nama_produk.toLowerCase().includes(q) ||
        p.kategori.toLowerCase().includes(q) ||
        String(p.id_produk).includes(q),
    );
  }, [produkList, currentRole, profile.id_user, q]);

  const displayedLimbah = useMemo(() => {
    if (!q) return limbahList;
    return limbahList.filter(
      (l) =>
        l.jenis_limbah.toLowerCase().includes(q) ||
        l.lokasi_penjemputan.toLowerCase().includes(q) ||
        l.status_jemput.toLowerCase().includes(q),
    );
  }, [limbahList, q]);

  const displayedTransaksi = useMemo(() => {
    const base =
      currentRole === "admin"
        ? transaksiList
        : currentRole === "petani"
          ? transaksiList.filter((t) => t.id_penjual === profile.id_user)
          : currentRole === "konsumen"
            ? transaksiList.filter((t) => t.id_pembeli === profile.id_user)
            : transaksiList.filter(
                (t) => t.id_pembeli === profile.id_user || t.id_penjual === profile.id_user,
              );
    if (!q) return base;
    return base.filter(
      (t) =>
        String(t.id_transaksi).includes(q) ||
        t.status.toLowerCase().includes(q),
    );
  }, [transaksiList, currentRole, profile.id_user, q]);

  const displayedKeuangan = useMemo(() => {
    const base =
      currentRole === "admin"
        ? keuanganList
        : keuanganList.filter((k) => k.id_user === profile.id_user);
    if (!q) return base;
    return base.filter(
      (k) =>
        k.keterangan.toLowerCase().includes(q) ||
        k.jenis_transaksi.toLowerCase().includes(q),
    );
  }, [keuanganList, currentRole, profile.id_user, q]);

  // Ringkasan jual-beli
  const [tasksByRole, setTasksByRole] = useState<Record<RoleSlug, RoleTaskItem[]>>(ROLE_INITIAL_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskTime, setNewTaskTime] = useState<string>("16:00-17:30 PM");
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [activityFilter, setActivityFilter] = useState<"semua" | "jual" | "beli">("semua");

  const roleTasks = tasksByRole[currentRole] ?? [];
  const roleNotif = ROLE_NOTIFICATIONS[currentRole];
  const halamanBeliLinks = ROLE_HALAMAN_BELI_LINKS[currentRole];

  // Transaksi di mana role ini bertindak sebagai PENJUAL (id_penjual) vs PEMBELI (id_pembeli)
  const penjualanRole = useMemo(
    () =>
      currentRole === "admin"
        ? transaksiList
        : transaksiList.filter((t) => t.id_penjual === profile.id_user),
    [transaksiList, currentRole, profile.id_user],
  );

  const pembelianRole = useMemo(
    () =>
      currentRole === "admin"
        ? transaksiList
        : transaksiList.filter((t) => t.id_pembeli === profile.id_user),
    [transaksiList, currentRole, profile.id_user],
  );

  const totalNominalJual = useMemo(
    () => penjualanRole.reduce((acc, t) => acc + t.total_harga, 0),
    [penjualanRole],
  );

  const totalNominalBeli = useMemo(
    () => pembelianRole.reduce((acc, t) => acc + t.total_harga, 0),
    [pembelianRole],
  );

  const totalBeratLimbahKg = useMemo(
    () => limbahList.reduce((acc, l) => acc + l.berat_kg, 0),
    [limbahList],
  );

  const filteredHomeTransactions = useMemo(() => {
    if (currentRole === "admin") return transaksiList;
    if (activityFilter === "jual") return penjualanRole;
    if (activityFilter === "beli") return pembelianRole;
    return transaksiList.filter(
      (t) => t.id_penjual === profile.id_user || t.id_pembeli === profile.id_user,
    );
  }, [currentRole, activityFilter, transaksiList, penjualanRole, pembelianRole, profile.id_user]);

  const handleToggleTask = (taskId: number): void => {
    setTasksByRole((prev) => ({
      ...prev,
      [currentRole]: prev[currentRole].map((t) =>
        t.id === taskId ? { ...t, done: !t.done } : t,
      ),
    }));
  };

  const handleAddRoleTask = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasksByRole((prev) => ({
      ...prev,
      [currentRole]: [
        ...prev[currentRole],
        {
          id: Date.now(),
          title: newTaskTitle.trim(),
          time: newTaskTime.trim() || "16:00-17:30 PM",
          done: false,
        },
      ],
    }));
    setNewTaskTitle("");
    setNewTaskTime("16:00-17:30 PM");
    setIsAddingTask(false);
    showToast("✓ Agenda baru berhasil ditambahkan ke Today Task.");
  };

  const fungsiRoleHref = `/fungsi/${currentRole === "petani" ? "supplier" : currentRole}`;
  const primaryBeliHref = halamanBeliLinks[0]?.href ?? fungsiRoleHref;
  const activeTabMeta = availableTabs.find((t) => t.id === activeTab) ?? availableTabs[0];

  // Tampilan loading verifikasi sesi
  if (!authGuardChecked) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3D5126] border-t-transparent" />
          <p className="text-xs font-semibold text-gray-500">Memverifikasi sesi keamanan SAMANGGA...</p>
        </div>
      </div>
    );
  }

  // Guard 1: Belum login sama sekali (Sesi Tidak Ada)
  if (!isAuthenticated) {
    const roleMeta = DEFAULT_PROFILES[currentRole];
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-[#273419]">
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2">
              <img src="/images/logo_web.png" alt="SAMANGGA" className="h-7 w-7 object-contain" />
              <span className="text-base font-extrabold tracking-tight text-[#273419]">SAMANGGA</span>
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-[#3D5126] px-4 py-2 text-xs font-bold text-white hover:bg-[#273419] transition-all"
            >
              Masuk / Login
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-lg px-4 py-16 text-center">
          <div className="rounded-3xl border border-amber-200 bg-white p-7 sm:p-9 shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-8 ring-amber-50/50">
              <ShieldCheckIcon className="h-7 w-7" />
            </div>
            <span className="mt-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              Sesi Login Diperlukan
            </span>
            <h1 className="mt-3 text-xl sm:text-2xl font-black text-gray-900">
              Dashboard Terproteksi
            </h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600">
              Halaman dashboard <strong>{roleMeta.peranErd} ({roleMeta.nama_lengkap})</strong> dilindungi sistem keamanan SAMANGGA untuk menjaga privasi data pengguna dan integritas transaksi. Silakan masuk terlebih dahulu dengan akun resmi atau akun demo terdaftar.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Link
                href={`/login?role=${currentRole}&redirect=/profil/${currentRole}`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3D5126] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#273419] transition-all"
              >
                Masuk ke Akun
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Kembali ke Portal Peran
              </Link>
            </div>
          </div>
        </main>

        <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500">
          © 2026 SAMANGGA Inc. Keamanan &amp; Privasi Data Pengguna Terlindungi.
        </footer>
      </div>
    );
  }

  // Guard 2: Sudah login tetapi peran tidak berwenang (misal bukan Admin saat buka /profil/admin)
  if (!isAuthorized) {
    const roleMeta = DEFAULT_PROFILES[currentRole];
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-[#273419]">
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2">
              <img src="/images/logo_web.png" alt="SAMANGGA" className="h-7 w-7 object-contain" />
              <span className="text-base font-extrabold tracking-tight text-[#273419]">SAMANGGA</span>
            </Link>
            {sessionRole && (
              <Link
                href={`/profil/${sessionRole}`}
                className="rounded-full bg-[#3D5126] px-4 py-2 text-xs font-bold text-white hover:bg-[#273419] transition-all"
              >
                Dashboard Saya ({sessionRole})
              </Link>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-lg px-4 py-16 text-center">
          <div className="rounded-3xl border border-red-200 bg-white p-7 sm:p-9 shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-8 ring-red-50/50">
              <ShieldCheckIcon className="h-7 w-7" />
            </div>
            <span className="mt-4 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
              Akses Ditolak (403 Forbidden)
            </span>
            <h1 className="mt-3 text-xl sm:text-2xl font-black text-gray-900">
              Hak Akses Peran Terbatas
            </h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600">
              {currentRole === "admin"
                ? "Halaman ini khusus untuk Administrator Sistem SAMANGGA. Akun Anda saat ini masuk dengan peran non-admin."
                : `Anda saat ini sedang login sebagai peran "${sessionRole?.toUpperCase()}". Halaman ini diperuntukkan khusus bagi peran "${roleMeta.peranErd}".`}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
              {sessionRole && (
                <Link
                  href={`/profil/${sessionRole}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3D5126] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#273419] transition-all"
                >
                  Buka Dashboard Saya ({sessionRole})
                </Link>
              )}
              <Link
                href={`/login?role=${currentRole}&redirect=/profil/${currentRole}`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Ganti Akun Masuk
              </Link>
            </div>
          </div>
        </main>

        <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500">
          © 2026 SAMANGGA Inc. Keamanan &amp; Privasi Data Pengguna Terlindungi.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900">
      <div className="mx-auto flex min-h-screen w-full flex-col lg:flex-row">
        <aside
          aria-label="Navbar Kiri Dashboard CRUD"
          className="flex w-full shrink-0 flex-col justify-between border-b border-gray-200 bg-white px-4 py-5 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:overflow-y-auto lg:border-b-0 lg:border-r"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <Link href="/" className="group inline-flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#95A87A]/20 p-1.5 ring-1 ring-[#95A87A]/30">
                  <img src="/images/logo_web.png" alt="SAMANGGA" className="h-full w-full object-contain" />
                </span>
                <span className="leading-tight">
                  <span className="block text-base font-bold tracking-tight text-gray-900">SAMANGGA</span>
                  <span className="block text-[10px] font-medium text-gray-500">Mangga Naik Kelas</span>
                </span>
              </Link>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#95A87A]/20 px-2 py-0.5 text-[10px] font-bold text-[#273419] ring-1 ring-[#95A87A]/30">
                {getRoleIcon(currentRole, "h-3 w-3")}
                <span>{profile.peranErd}</span>
              </span>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
              <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500">
                <span>{profile.peranErd.toUpperCase()}</span>
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <CheckBadgeIcon className="h-3 w-3" />
                  {profile.status_verifikasi}
                </span>
              </div>
              <p className="mt-1 truncate text-xs font-semibold text-gray-900">
                {profile.nama_lengkap}
              </p>
              <p className="truncate text-[10px] text-gray-500">
                {profile.email}
              </p>
            </div>

            <div>
              <p className="px-3 text-[11px] font-medium text-gray-400">
                Menu Dashboard
              </p>
              <nav aria-label="Menu Dashboard" className="mt-2 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("home");
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    activeTab === "home"
                      ? "bg-[#95A87A]/25 text-[#273419] font-bold shadow-xs"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[#273419]"
                  }`}
                >
                  <HouseIcon
                    className={`h-4 w-4 shrink-0 ${activeTab === "home" ? "text-[#3D5126]" : "text-gray-400"}`}
                  />
                  <span>Dashboard</span>
                </button>

                {availableTabs.map((tab) => {
                  const isAct = activeTab === tab.id;
                  const isVerifTab = tab.id === "verifikasi-mitra";
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSearchQuery("");
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                        isAct
                          ? "bg-[#95A87A]/25 text-[#273419] font-bold shadow-xs"
                          : "text-gray-600 hover:bg-gray-50 hover:text-[#273419]"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className={isAct ? "text-[#3D5126]" : "text-gray-400"}>
                          {getTabSidebarIcon(tab.id, "h-4 w-4 shrink-0")}
                        </span>
                        <span className="truncate">{tab.label}</span>
                      </div>
                      {isVerifTab && pendingMitraCount > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-extrabold text-white shadow-xs">
                          {pendingMitraCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="px-3 text-[11px] font-medium text-gray-400">Tools</p>
              <nav aria-label="Pintasan Halaman Beli" className="mt-2 space-y-0.5">
                {halamanBeliLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  >
                    <span className="inline-flex items-center gap-3 truncate">
                      <ShoppingBagIcon className="h-4 w-4 shrink-0 text-gray-500" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <ArrowRightIcon className="h-3 w-3 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#3D5126]" />
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#95A87A]/20 via-[#F8FAFC] to-[#95A87A]/25 p-4 ring-1 ring-[#95A87A]/30">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#95A87A]/30 blur-xl"
              />
              <p className="relative text-sm font-bold text-gray-900">
                {currentRole === "admin" ? "Moderasi Cepat" : "Belanja & Transaksi"}
              </p>
              <p className="relative mt-1 text-[11px] leading-relaxed text-gray-600">
                {currentRole === "petani" &&
                  "Beli pupuk kompos & bibit pohon mangga dari Mitra di halaman biasa."}
                {currentRole === "umkm" &&
                  "Beli mangga bahan baku dari Supplier & setor limbah ke Mitra."}
                {currentRole === "mitra" &&
                  "Ambil/beli limbah UMKM & jual pupuk/bibit pohon ke Petani."}
                {currentRole === "konsumen" &&
                  "Beli mangga segar, produk olahan UMKM & bibit pohon di katalog."}
                {currentRole === "admin" &&
                  "Buka halaman fungsi verifikasi visual & pantau transaksi."}
              </p>
              <Link
                href={primaryBeliHref}
                className="relative mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#3D5126] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#273419]"
              >
                <span>{currentRole === "admin" ? "Buka Moderasi" : "Ke Halaman Beli"}</span>
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>

            <div className="flex items-center gap-3 border-t border-gray-100 px-1 pt-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#95A87A]/30 text-xs font-bold text-[#273419] ring-1 ring-[#95A87A]/40">
                {profile.nama_lengkap
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-gray-900">{profile.nama_lengkap}</p>
                <p className="truncate text-[10px] text-gray-500">{profile.peranErd} · 1 Role Locked</p>
              </div>
            </div>
            <Link
              href="/login"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.localStorage.removeItem(ROLE_STORAGE_KEY);
                  notifyAuthChange();
                }
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              ← Keluar (Logout Akun)
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-6 px-4 pb-10 sm:px-6 lg:px-8">
          <header className="sticky top-0 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="inline-flex min-w-0 items-center gap-2.5 rounded-lg bg-gray-50 px-3.5 py-2 ring-1 ring-gray-200">
              <SignalIcon className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="truncate text-sm text-gray-600">
                Welcome, <span className="font-semibold text-gray-900">{profile.nama_lengkap.split(" ").slice(0, 2).join(" ")}</span>!
              </span>
              <span className="rounded-md bg-[#95A87A]/20 px-2 py-0.5 text-[10px] font-bold text-[#273419] ring-1 ring-[#95A87A]/30">
                {profile.peranErd}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {currentRole !== "admin" && (
                <Link
                  href={primaryBeliHref}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#3D5126] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#273419]"
                >
                  <ShoppingBagIcon className="h-4 w-4 shrink-0 text-white" />
                  <span>Beli Produk</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveTab(roleNotif.targetTab);
                }}
                aria-label="Notifikasi"
                className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#FFB81C] ring-2 ring-white" />
              </button>

              <div className="flex items-center gap-2.5 border-l border-gray-200 pl-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#95A87A]/30 text-xs font-bold text-[#273419] ring-1 ring-[#95A87A]/40">
                  {profile.nama_lengkap
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </div>
                <span className="hidden text-xs font-medium text-gray-600 sm:inline">
                  {profile.email}
                </span>
              </div>
            </div>
          </header>

          {toastMessage && (
            <div
              role="status"
              className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 shadow-sm"
            >
              <span>{toastMessage}</span>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="ml-4 rounded px-2 py-0.5 text-xs font-semibold hover:bg-emerald-100"
              >
                ✕
              </button>
            </div>
          )}

          {currentRole === "mitra" && currentMitraUser && (
            <div className="space-y-3">
              {currentMitraUser.statusVerifikasi === "Menunggu" && (
                <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-yellow-100/70 to-amber-50 p-4 sm:p-5 shadow-sm text-amber-950">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-bold text-sm shadow-xs">
                        ⏳
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                            Menunggu Verifikasi Admin
                          </span>
                          <h2 className="text-sm font-extrabold text-amber-950">
                            Berkas Pendaftaran Kemitraan Sedang Ditinjau
                          </h2>
                        </div>
                        <p className="mt-1 text-xs text-amber-900 leading-relaxed">
                          Foto bukti lahan/fasilitas dan berkas kemitraan <strong>{(currentMitraUser.extraData?.namaInstansi as string) || currentMitraUser.namaLengkap}</strong> sedang dalam antrean verifikasi oleh Admin SAMANGGA. Akses penuh operasional logistik sirkular akan otomatis aktif setelah disetujui.
                        </p>
                        {currentMitraUser.fotoPersyaratanName && (
                          <p className="mt-1 text-[11px] font-mono text-amber-800">
                            📎 Berkas terlampir: {currentMitraUser.fotoPersyaratanName}
                          </p>
                        )}
                      </div>
                    </div>
                    {currentMitraUser.fotoPersyaratanUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setInspectPhoto({
                            url: currentMitraUser.fotoPersyaratanUrl!,
                            title: (currentMitraUser.extraData?.namaInstansi as string) || currentMitraUser.namaLengkap,
                            subtitle: currentMitraUser.fotoPersyaratanName || "Berkas Foto Terlampir",
                          })
                        }
                        className="shrink-0 rounded-xl border border-amber-400 bg-white px-3.5 py-2 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-50 active:scale-95 transition-all"
                      >
                        🔍 Lihat Foto Saya
                      </button>
                    )}
                  </div>
                </div>
              )}

              {currentMitraUser.statusVerifikasi === "Ditolak" && (
                <div className="rounded-2xl border border-red-300 bg-gradient-to-r from-red-50 via-rose-100/90 to-red-50 p-4 sm:p-5 shadow-sm text-red-950 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white font-bold text-sm shadow-xs">
                        🚨
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                            Verifikasi Ditolak / Kirim Ulang
                          </span>
                          <h2 className="text-sm font-extrabold text-red-950">
                            Dokumen / Foto Kemitraan Perlu Dikirim Ulang
                          </h2>
                        </div>
                        <p className="mt-1 text-xs text-red-800 leading-relaxed">
                          Admin telah memeriksa berkas pendaftaran Anda dan meminta untuk melakukan unggah ulang foto dokumen atau fasilitas lahan yang lebih jelas.
                        </p>
                        <div className="mt-2.5 rounded-xl border border-red-200 bg-white/95 p-3 text-xs text-red-900 shadow-2xs">
                          <p className="font-extrabold text-red-950 flex items-center gap-1.5">
                            <span>💬 Catatan & Instruksi Admin:</span>
                          </p>
                          <p className="mt-1 font-medium italic">
                            &ldquo;{currentMitraUser.alasanPenolakan || "Foto atau dokumen kemitraan tidak terbaca jelas. Mohon kirimkan ulang foto dengan resolusi tinggi."}&rdquo;
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-2 flex-wrap text-[11px] text-red-800">
                          <span>📧 Notifikasi resmi penolakan foto telah dikirim ke: <strong>{currentMitraUser.email}</strong></span>
                          <button
                            type="button"
                            onClick={() => setIsKotakEmailOpen(true)}
                            className="font-bold underline text-red-900 hover:text-red-950 cursor-pointer"
                          >
                            Buka Surat Email Notifikasi →
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setResubmitPreview(null);
                        setResubmitChosenName("");
                        setIsResubmitModalOpen(true);
                      }}
                      className="shrink-0 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700 active:scale-95 transition-all"
                    >
                      📷 Kirim Ulang Foto Berkas
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentRole === "admin" && pendingMitraCount > 0 && activeTab !== "verifikasi-mitra" && (
            <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-yellow-100/70 to-amber-50 p-4 shadow-sm text-amber-950">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-bold text-xs shadow-xs">
                    ⏳
                  </span>
                  <div>
                    <h2 className="text-xs font-bold text-amber-900">
                      Terdapat {pendingMitraCount} calon mitra baru menunggu verifikasi dokumen & foto lahan!
                    </h2>
                    <p className="text-[11px] text-amber-800">
                      Buka menu Verifikasi Mitra untuk memeriksa kelayakan berkas foto, menyetujui (ACC), atau meminta kirim ulang.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("verifikasi-mitra")}
                  className="shrink-0 rounded-xl bg-[#3D5126] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#273419] active:scale-95 transition-all"
                >
                  Buka Verifikasi Mitra →
                </button>
              </div>
            </div>
          )}

          
          {activeTab === "home" && (
            <section aria-label="Ringkasan Dashboard Ekosistem" className="space-y-6">
              {/* ========================================================= */}
              {/* 1. KHUSUS PETANI (SUPPLIER KEBUN MANGGA) */}
              {/* ========================================================= */}
              {currentRole === "petani" && (
                <div className="space-y-6">
                  {/* Hero Banner Petani */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#243516] via-[#35481F] to-[#4F6733] p-6 text-white shadow-md">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white backdrop-blur-xs">
                            🌿 Dashboard Kebun Petani
                          </span>
                          <span className="rounded-full bg-emerald-400/25 px-2.5 py-0.5 text-xs font-semibold text-emerald-100">
                            Status: {profile.status_verifikasi}
                          </span>
                        </div>
                        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                          Kebun Mangga: {profile.nama_lengkap}
                        </h1>
                        <p className="max-w-2xl text-xs sm:text-sm text-white/85 leading-relaxed">
                          Kelola hasil panen komoditas mangga Indramayu, pantau pesanan borongan masuk dari UMKM &amp; Konsumen, dan salurkan sisa afkir atau daun ke bursa limbah sirkular.
                        </p>
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-white/90">
                          <span>📍 {profile.alamat}</span>
                          <span>•</span>
                          <span>🌳 Luas Lahan: {(profile as any).luas_lahan_m2 ? `${((profile as any).luas_lahan_m2 / 10000).toFixed(1)} Ha` : "4.5 Ha"}</span>
                          <span>•</span>
                          <span>🥭 Komoditas: {(profile as any).jenis_komoditas_utama || "Gedong Gincu & Arumanis Super"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={openCreateProduk}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#273419] shadow-sm hover:bg-[#E9EFE0] transition-all cursor-pointer"
                        >
                          <span>+ Upload Panen (Wajib Foto)</span>
                        </button>
                        <button
                          type="button"
                          onClick={openCreateLimbah}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
                        >
                          <span>Setor Afkir / Daun</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 4 Kartu Metrik Petani */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <BoxesIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Stok Panen Siap Jual</span>
                        </div>
                        <button type="button" onClick={openCreateProduk} className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer">+ Tambah</button>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">
                        {displayedProduk.reduce((acc, p) => acc + p.stok, 0)} <span className="text-sm font-normal text-gray-500">Kwintal</span>
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Dari {displayedProduk.length} varietas mangga yang Anda daftarkan
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#95A87A]/20 text-[#3D5126]">
                            <ReceiptIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Hasil Penjualan</span>
                        </div>
                        <button type="button" onClick={() => setActiveTab("transaksi")} className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer">Rincian</button>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">{formatRupiah(totalNominalJual)}</p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        {penjualanRole.length} transaksi mangga dari UMKM &amp; Konsumen
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                            <TruckIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Pesanan Masuk</span>
                        </div>
                        <button type="button" onClick={() => setActiveTab("pengiriman")} className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer">Logistik</button>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">
                        {penjualanRole.filter(t => t.status === "Diproses" || t.status === "Pending").length} <span className="text-sm font-normal text-gray-500">Menunggu Kirim</span>
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Penjemputan armada logistik SAMANGGA ke kebun
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                            <RecycleIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Limbah Sirkular Kebun</span>
                        </div>
                        <button type="button" onClick={openCreateLimbah} className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer">+ Setor</button>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">
                        {limbahList.filter(l => l.jenis_limbah === "Buah Afkir" || (l.jenis_limbah as string) === "Daun").reduce((acc, l) => acc + l.berat_kg, 0)} <span className="text-sm font-normal text-gray-500">Kg</span>
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Mangga afkir sortir &amp; daun pangkasan kebun
                      </p>
                    </div>
                  </div>

                  {/* 2 Kolom Layout Petani */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Kiri: Komoditas Mangga Kebun Saya */}
                    <div className="space-y-4 lg:col-span-7">
                      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div>
                            <h2 className="text-sm font-bold text-gray-900">Komoditas Panen Kebun Saya ({displayedProduk.length})</h2>
                            <p className="text-[11px] text-gray-500">Mangga segar yang tayang di katalog dan halaman utama web</p>
                          </div>
                          <button
                            type="button"
                            onClick={openCreateProduk}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#3D5126] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#273419] transition-all cursor-pointer"
                          >
                            <span>+ Tambah Panen</span>
                          </button>
                        </div>

                        {displayedProduk.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
                            <p className="text-xs font-semibold text-gray-600">Belum ada hasil panen yang diunggah.</p>
                            <p className="mt-1 text-[11px] text-gray-500">Unggah hasil panen mangga Anda dengan foto asli agar langsung tampil di halaman utama dan katalog.</p>
                            <button
                              type="button"
                              onClick={openCreateProduk}
                              className="mt-3 inline-flex items-center gap-1 rounded-xl bg-[#3D5126] px-4 py-2 text-xs font-bold text-white hover:bg-[#273419]"
                            >
                              + Upload Panen Sekarang
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {displayedProduk.map((p) => (
                              <div key={p.id_produk} className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50 p-3 hover:bg-white hover:shadow-md transition-all">
                                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-200">
                                  <img
                                    src={p.gambar || "/images/mangga/mangga_gincu.jpg"}
                                    alt={p.nama_produk}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                  <span className="absolute top-2 left-2 rounded-full bg-[#3D5126]/90 px-2 py-0.5 text-[10px] font-bold text-white">
                                    {p.kategori}
                                  </span>
                                  <span className="absolute bottom-2 right-2 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold text-gray-800 shadow-xs">
                                    Stok: {p.stok} {p.satuan}
                                  </span>
                                </div>
                                <div className="mt-2.5 flex-1">
                                  <h3 className="text-xs font-bold text-gray-900 line-clamp-1">{p.nama_produk}</h3>
                                  <p className="mt-1 text-xs font-extrabold text-[#3D5126]">{formatRupiah(p.harga)} <span className="text-[10px] font-normal text-gray-500">/{p.satuan}</span></p>
                                </div>
                                <div className="mt-3 pt-2.5 border-t border-gray-200 flex items-center justify-between">
                                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${getStatusBadge(p.status_verifikasi)}`}>
                                    {p.status_verifikasi}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => openEditProduk(p)}
                                    className="text-[11px] font-bold text-[#3D5126] hover:underline cursor-pointer"
                                  >
                                    Ubah Stok
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Kanan: Pesanan Masuk & Logistik Tani */}
                    <div className="space-y-4 lg:col-span-5">
                      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div>
                            <h2 className="text-sm font-bold text-gray-900">Pesanan Masuk dari Pembeli ({penjualanRole.length})</h2>
                            <p className="text-[11px] text-gray-500">Permintaan mangga dari UMKM &amp; Konsumen</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab("transaksi")}
                            className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer"
                          >
                            Semua
                          </button>
                        </div>

                        <div className="space-y-3">
                          {penjualanRole.length === 0 ? (
                            <p className="text-center py-6 text-xs text-gray-400">Belum ada pesanan masuk.</p>
                          ) : (
                            penjualanRole.slice(0, 4).map((trx) => (
                              <div key={trx.id_transaksi} className="rounded-lg border border-gray-100 bg-gray-50/60 p-3 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-xs font-bold text-gray-900">#{trx.id_transaksi}</span>
                                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${getStatusBadge(trx.status)}`}>
                                    {trx.status}
                                  </span>
                                </div>
                                <p className="text-xs font-semibold text-gray-800">
                                  Pembeli: {getUserName(trx.id_pembeli)}
                                </p>
                                <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/60">
                                  <span className="text-[11px] text-gray-400">{trx.tgl_transaksi}</span>
                                  <span className="font-bold text-[#3D5126]">{formatRupiah(trx.total_harga)}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Banner Sirkular Afkir */}
                        <div className="rounded-xl border border-[#95A87A]/50 bg-[#95A87A]/15 p-4 text-xs text-[#273419] space-y-2">
                          <p className="font-bold flex items-center gap-1.5">
                            <span>♻️ Hilirisasi Mangga Afkir &amp; Daun</span>
                          </p>
                          <p className="text-[11px] text-gray-700 leading-relaxed">
                            Punya mangga jatuh angin atau afkir sortir? Jangan dibuang! Daftarkan ke bursa sirkular untuk ditebus oleh mitra pengolah pakan &amp; pupuk.
                          </p>
                          <button
                            type="button"
                            onClick={openCreateLimbah}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#3D5126] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#273419] transition-all cursor-pointer"
                          >
                            <span>+ Setor Limbah Kebun</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 2. KHUSUS UMKM PENGOLAH MANGGA */}
              {/* ========================================================= */}
              {currentRole === "umkm" && (
                <div className="space-y-6">
                  {/* Header Dashboard UMKM Clean */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#3D5126]/10 px-2.5 py-0.5 text-xs font-bold text-[#3D5126]">
                          🏭 UMKM Olahan Mangga
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                          {profile.status_verifikasi}
                        </span>
                      </div>
                      <h1 className="mt-1 text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                        {(profile as any).nama_usaha || profile.nama_lengkap}
                      </h1>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Hilirisasi olahan mangga Indramayu &amp; penyaluran limbah kulit dan biji ke mitra bio-refinery sirkular.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={openCreateProduk}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#3D5126] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#273419] shadow-xs cursor-pointer transition-all"
                      >
                        <span>+ Upload Olahan (Wajib Foto)</span>
                      </button>
                      <button
                        type="button"
                        onClick={openCreateLimbah}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs cursor-pointer transition-all"
                      >
                        <span>+ Setor Kulit/Biji</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Kartu Metrik UMKM */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <ReceiptIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Omzet Produk Olahan</span>
                        </div>
                        <button type="button" onClick={() => setActiveTab("transaksi")} className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer">Rincian</button>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">{formatRupiah(penjualanRole.reduce((acc, t) => acc + t.total_harga, 0))}</p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        {penjualanRole.length} pesanan olahan berhasil terjual
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <ShoppingBagIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Belanja Bahan Baku</span>
                        </div>
                        <Link href="/katalog" className="text-xs font-bold text-[#3D5126] hover:underline">Beli Buah</Link>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">{formatRupiah(pembelianRole.reduce((acc, t) => acc + t.total_harga, 0))}</p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        {pembelianRole.length} transaksi mangga dari Petani
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                            <RecycleIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Limbah Kupasan Disetor</span>
                        </div>
                        <button type="button" onClick={openCreateLimbah} className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer">+ Catat</button>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">
                        {limbahList.filter(l => l.id_umkm === profile.id_user).reduce((acc, l) => acc + l.berat_kg, 0)} <span className="text-sm font-normal text-gray-500">Kg</span>
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Kulit &amp; biji diserap mitra bio-refinery
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                            <CreditCardIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Pendapatan Sirkular</span>
                        </div>
                        <button type="button" onClick={() => setActiveTab("keuangan")} className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer">Buku Kas</button>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">
                        {formatRupiah(limbahList.filter(l => l.id_umkm === profile.id_user).reduce((acc, l) => acc + (l.harga_kesepakatan || l.estimasi_harga), 0))}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Pemasukan tambahan tebus limbah dari Mitra
                      </p>
                    </div>
                  </div>

                  {/* 2 Kolom Layout UMKM */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Kiri: Produk Olahan Siap Kirim */}
                    <div className="space-y-4 lg:col-span-7">
                      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div>
                            <h2 className="text-sm font-bold text-gray-900">Produk Olahan Mangga Saya ({displayedProduk.length})</h2>
                            <p className="text-[11px] text-gray-500">Tayang di etalase katalog olahan &amp; halaman utama SAMANGGA</p>
                          </div>
                          <button
                            type="button"
                            onClick={openCreateProduk}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#3D5126] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#273419] transition-all cursor-pointer"
                          >
                            <span>+ Tambah Olahan</span>
                          </button>
                        </div>

                        {displayedProduk.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
                            <p className="text-xs font-semibold text-gray-600">Belum ada produk olahan yang diunggah.</p>
                            <p className="mt-1 text-[11px] text-gray-500">Tambahkan produk dodol, keripik, puree, atau sirup mangga Anda lengkap dengan foto asli.</p>
                            <button
                              type="button"
                              onClick={openCreateProduk}
                              className="mt-3 inline-flex items-center gap-1 rounded-xl bg-[#3D5126] px-4 py-2 text-xs font-bold text-white hover:bg-[#273419]"
                            >
                              + Upload Produk Olahan
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {displayedProduk.map((p) => (
                              <div key={p.id_produk} className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50 p-3 hover:bg-white hover:shadow-md transition-all">
                                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-200">
                                  <img
                                    src={p.gambar || "/images/olahan/dodol_mangga.jpg"}
                                    alt={p.nama_produk}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                  <span className="absolute top-2 left-2 rounded-full bg-[#3D5126]/90 px-2 py-0.5 text-[10px] font-bold text-white">
                                    {p.kategori}
                                  </span>
                                  <span className="absolute bottom-2 right-2 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold text-gray-800 shadow-xs">
                                    Stok: {p.stok} {p.satuan}
                                  </span>
                                </div>
                                <div className="mt-2.5 flex-1">
                                  <h3 className="text-xs font-bold text-gray-900 line-clamp-1">{p.nama_produk}</h3>
                                  <p className="mt-1 text-xs font-extrabold text-[#3D5126]">{formatRupiah(p.harga)} <span className="text-[10px] font-normal text-gray-500">/{p.satuan}</span></p>
                                </div>
                                <div className="mt-3 pt-2.5 border-t border-gray-200 flex items-center justify-between">
                                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${getStatusBadge(p.status_verifikasi)}`}>
                                    {p.status_verifikasi}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => openEditProduk(p)}
                                    className="text-[11px] font-bold text-[#3D5126] hover:underline cursor-pointer"
                                  >
                                    Ubah Stok
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Kanan: Limbah Kupasan & Bahan Baku */}
                    <div className="space-y-4 lg:col-span-5">
                      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div>
                            <h2 className="text-sm font-bold text-gray-900">Limbah Kupasan Disetor ke Mitra ({limbahList.filter(l => l.id_umkm === profile.id_user).length})</h2>
                            <p className="text-[11px] text-gray-500">Kulit &amp; biji yang menunggu penjemputan mitra</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab("limbah")}
                            className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer"
                          >
                            Kelola
                          </button>
                        </div>

                        {limbahList.filter(l => l.id_umkm === profile.id_user).length === 0 ? (
                          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500 space-y-1">
                            <p className="text-xs font-semibold text-gray-600">Belum ada limbah kupasan yang disetor.</p>
                            <p className="text-[11px] text-gray-400">Daftarkan sisa kulit &amp; biji produksi olahan Anda untuk ditebus oleh mitra sirkular.</p>
                            <button
                              type="button"
                              onClick={openCreateLimbah}
                              className="mt-2 text-xs font-bold text-[#3D5126] hover:underline cursor-pointer"
                            >
                              + Catat &amp; Setor Limbah
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {limbahList.filter(l => l.id_umkm === profile.id_user).slice(0, 3).map((l) => (
                              <div key={l.id_limbah} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/70 p-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={l.foto_limbah || "/images/limbah/limbah_kulit_mangga.jpg"}
                                    alt={l.jenis_limbah}
                                    className="h-11 w-11 rounded-lg object-cover border border-gray-200"
                                  />
                                  <div>
                                    <p className="text-xs font-bold text-gray-900">Limbah {l.jenis_limbah} ({l.berat_kg} kg)</p>
                                    <p className="text-[11px] text-emerald-700 font-bold">{formatRupiah(l.estimasi_harga)}</p>
                                  </div>
                                </div>
                                <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${l.status_jemput === "Tersedia" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                  {l.status_jemput}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Banner Beli Bahan Baku */}
                        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 space-y-2">
                          <p className="font-bold flex items-center gap-1.5">
                            <span>🥭 Butuh Pasokan Mangga Segar Tambahan?</span>
                          </p>
                          <p className="text-[11px] text-blue-800 leading-relaxed">
                            Pesan langsung mangga Gedong Gincu, Arumanis, atau Golek dari petani terverifikasi Indramayu dengan jaminan pasokan rutin.
                          </p>
                          <Link
                            href="/katalog"
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800 transition-all"
                          >
                            <span>Beli Bahan Baku di Katalog →</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 3. KHUSUS MITRA PENGOLAH & LOGISTIK */}
              {/* ========================================================= */}
              {currentRole === "mitra" && (
                <div className="space-y-6">
                  {/* Header Dashboard Mitra Clean */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                          ♻️ Bio-Refinery &amp; Logistik Sirkular
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                          {profile.status_verifikasi}
                        </span>
                      </div>
                      <h1 className="mt-1 text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                        {(profile as any).nama_mitra_instansi || profile.nama_lengkap}
                      </h1>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Pengolahan limbah organik mangga Indramayu &amp; pengoperasian armada logistik rantai pasok agribisnis.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href="/pasar-sirkular"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#3D5126] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#273419] shadow-xs transition-all"
                      >
                        <span>Buka Bursa Limbah Siap Jemput</span>
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setActiveTab("pengiriman")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs cursor-pointer transition-all"
                      >
                        <span>Kelola Armada Resi</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Kartu Metrik Mitra */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <RecycleIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Limbah Siap Jemput</span>
                        </div>
                        <Link href="/pasar-sirkular" className="text-xs font-bold text-[#3D5126] hover:underline">Bursa</Link>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">
                        {limbahList.filter(l => l.status_jemput === "Tersedia").length} <span className="text-sm font-normal text-gray-500">Batch</span>
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        {limbahList.filter(l => l.status_jemput === "Tersedia").reduce((acc, l) => acc + l.berat_kg, 0)} Kg kulit, biji, &amp; afkir
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#95A87A]/20 text-[#3D5126]">
                            <BoxesIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Total Limbah Ditebus</span>
                        </div>
                        <button type="button" onClick={() => setActiveTab("limbah")} className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer">Rincian</button>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">
                        {limbahList.filter(l => l.id_mitra === profile.id_user).reduce((acc, l) => acc + l.berat_kg, 0)} <span className="text-sm font-normal text-gray-500">Kg</span>
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Total limbah yang telah Anda tebus &amp; olah
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <TruckIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Pengiriman Logistik Aktif</span>
                        </div>
                        <button type="button" onClick={() => setActiveTab("pengiriman")} className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer">Armada</button>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">
                        {pengirimanList.filter(s => s.id_mitra === profile.id_user).length} <span className="text-sm font-normal text-gray-500">Resi</span>
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        {pengirimanList.filter(s => s.id_mitra === profile.id_user && s.status_pengiriman === "Dalam Perjalanan").length} penjemputan dalam perjalanan
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                            <CreditCardIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Investasi Tebus Limbah</span>
                        </div>
                        <button type="button" onClick={() => setActiveTab("keuangan")} className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer">Keuangan</button>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">
                        {formatRupiah(limbahList.filter(l => l.id_mitra === profile.id_user).reduce((acc, l) => acc + (l.harga_kesepakatan || l.estimasi_harga), 0))}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Total kompensasi tebus limbah Anda
                      </p>
                    </div>
                  </div>

                  {/* 2 Kolom Layout Mitra */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Kiri: Radar Limbah Siap Jemput */}
                    <div className="space-y-4 lg:col-span-7">
                      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div>
                            <h2 className="text-sm font-bold text-gray-900">Radar Limbah Siap Jemput di Indramayu</h2>
                            <p className="text-[11px] text-gray-500">Batch limbah aktif dari UMKM &amp; Petani yang siap diambil armada</p>
                          </div>
                          <Link
                            href="/pasar-sirkular"
                            className="inline-flex items-center gap-1 rounded-lg bg-[#3D5126] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#273419] transition-all"
                          >
                            <span>Bursa Lengkap →</span>
                          </Link>
                        </div>

                        <div className="space-y-3">
                          {limbahList.filter(l => l.status_jemput === "Tersedia").slice(0, 4).map((l) => (
                            <div key={l.id_limbah} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/60 p-3.5 hover:bg-white hover:shadow-xs transition-all">
                              <div className="flex items-center gap-3">
                                <img
                                  src={l.foto_limbah || "/images/limbah/limbah_biji_mangga.jpg"}
                                  alt={l.jenis_limbah}
                                  className="h-14 w-14 shrink-0 rounded-lg object-cover border border-gray-200"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="rounded bg-[#3D5126]/10 px-2 py-0.5 text-[10px] font-bold text-[#3D5126]">
                                      {l.jenis_limbah}
                                    </span>
                                    <span className="text-xs font-bold text-gray-900">{l.berat_kg} Kg</span>
                                  </div>
                                  <p className="mt-1 text-xs text-gray-600 line-clamp-1">{l.lokasi_penjemputan}</p>
                                  <p className="text-xs font-bold text-[#3D5126]">Kompensasi: {formatRupiah(l.estimasi_harga)}</p>
                                </div>
                              </div>
                              <Link
                                href={`/pasar-sirkular/jemput?limbah=${l.id_limbah}`}
                                className="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg bg-[#3D5126] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#273419] transition-all"
                              >
                                <span>Jemput Batch</span>
                                <ArrowRightIcon className="h-3 w-3" />
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Kanan: Jadwal Armada Logistik */}
                    <div className="space-y-4 lg:col-span-5">
                      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div>
                            <h2 className="text-sm font-bold text-gray-900">Armada &amp; Resi Penjemputan ({pengirimanList.filter(s => s.id_mitra === profile.id_user).length})</h2>
                            <p className="text-[11px] text-gray-500">Penjemputan limbah &amp; pengiriman sirkular Anda</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab("pengiriman")}
                            className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer"
                          >
                            Kelola Resi
                          </button>
                        </div>

                        {pengirimanList.filter(s => s.id_mitra === profile.id_user).length === 0 ? (
                          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500 space-y-1">
                            <p className="text-xs font-semibold text-gray-600">Belum ada armada penjemputan aktif.</p>
                            <p className="text-[11px] text-gray-400">Pilih batch limbah di radar samping dan klik &apos;Jemput Batch&apos; untuk menerbitkan resi logistik.</p>
                            <Link
                              href="/pasar-sirkular"
                              className="mt-2 inline-flex text-xs font-bold text-[#3D5126] hover:underline"
                            >
                              Buka Bursa Limbah →
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {pengirimanList.filter(s => s.id_mitra === profile.id_user).slice(0, 4).map((s) => (
                              <div key={s.id_pengiriman} className="rounded-lg border border-gray-100 bg-gray-50/70 p-3 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-xs font-bold text-gray-900">{s.no_resi_lacak}</span>
                                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${s.status_pengiriman === "Tiba di Lokasi" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                                    {s.status_pengiriman}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-600">
                                  {s.id_transaksi > 0 ? `Transaksi Rantai Pasok #${s.id_transaksi}` : "Penjemputan Limbah Sirkular"}
                                </p>
                                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200/60">
                                  <span>Tanggal: {s.tgl_pengiriman}</span>
                                  <button
                                    type="button"
                                    onClick={() => setActiveTab("pengiriman")}
                                    className="font-bold text-[#3D5126] hover:underline cursor-pointer"
                                  >
                                    Update Status
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 4. KHUSUS KONSUMEN / PEMBELI */}
              {/* ========================================================= */}
              {currentRole === "konsumen" && (
                <div className="space-y-6">
                  {/* Hero Banner Konsumen */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E3A2F] via-[#2B5441] to-[#3D5126] p-6 text-white shadow-md">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white backdrop-blur-xs">
                            🛒 Dashboard Pembeli &amp; Pelanggan
                          </span>
                          <span className="rounded-full bg-emerald-400/25 px-2.5 py-0.5 text-xs font-semibold text-emerald-100">
                            Member Terverifikasi
                          </span>
                        </div>
                        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                          Halo, {profile.nama_lengkap}!
                        </h1>
                        <p className="max-w-2xl text-xs sm:text-sm text-white/85 leading-relaxed">
                          Pantau pesanan mangga segar Indramayu langsung dari petani kebun, lacak nomor resi pengiriman logistik Cold-Box secara real-time, dan jelajahi aneka camilan olahan mangga.
                        </p>
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-white/90">
                          <span>📍 Alamat Kirim: {(profile as any).alamat_pengiriman_utama || profile.alamat}</span>
                          <span>•</span>
                          <span>📦 Kategori: {(profile as any).kategori_konsumen || "Ritel & Grosir"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        <Link
                          href="/katalog"
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#273419] shadow-sm hover:bg-[#E9EFE0] transition-all"
                        >
                          <span>Belanja Mangga di Katalog</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setActiveTab("pengiriman")}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
                        >
                          <span>Lacak Paket</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 4 Kartu Metrik Konsumen */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <ReceiptIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Total Belanja Saya</span>
                        </div>
                        <button type="button" onClick={() => setActiveTab("transaksi")} className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer">Riwayat</button>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">{formatRupiah(totalNominalBeli)}</p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        {pembelianRole.length} pesanan mangga &amp; olahan
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                            <BoxesIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Pesanan Diproses</span>
                        </div>
                        <button type="button" onClick={() => setActiveTab("transaksi")} className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer">Lihat</button>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">
                        {pembelianRole.filter(t => t.status === "Diproses" || t.status === "Pending").length} <span className="text-sm font-normal text-gray-500">Pesanan</span>
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Sedang disiapkan petani/UMKM asal
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <CreditCardIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Status Pembayaran</span>
                        </div>
                        <button type="button" onClick={() => setActiveTab("pembayaran")} className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer">Bayar</button>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">
                        {pembayaranList.filter(p => p.status_pembayaran === "Berhasil").length} <span className="text-sm font-normal text-gray-500">Lunas</span>
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        QRIS, Virtual Account, &amp; Transfer Escrow
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                            <TruckIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Paket Dalam Perjalanan</span>
                        </div>
                        <button type="button" onClick={() => setActiveTab("pengiriman")} className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer">Lacak</button>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">
                        {pengirimanList.filter(s => s.status_pengiriman === "Dalam Perjalanan").length} <span className="text-sm font-normal text-gray-500">Paket</span>
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Menuju alamat pengiriman Anda
                      </p>
                    </div>
                  </div>

                  {/* 2 Kolom Layout Konsumen */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Kiri: Live Tracking Pengiriman Paket */}
                    <div className="space-y-4 lg:col-span-7">
                      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div>
                            <h2 className="text-sm font-bold text-gray-900">Lacak Pengiriman Paket Saya ({pengirimanList.length})</h2>
                            <p className="text-[11px] text-gray-500">Status real-time paket buah &amp; olahan yang Anda pesan</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab("pengiriman")}
                            className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer"
                          >
                            Semua Resi
                          </button>
                        </div>

                        <div className="space-y-3">
                          {pengirimanList.slice(0, 3).map((s) => (
                            <div key={s.id_pengiriman} className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <span className="font-mono text-xs font-bold text-gray-900">Resi: {s.no_resi_lacak}</span>
                                  <p className="text-[11px] text-gray-500">Tanggal Kirim: {s.tgl_pengiriman}</p>
                                </div>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${s.status_pengiriman === "Tiba di Lokasi" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                                  {s.status_pengiriman}
                                </span>
                              </div>

                              {/* Progress bar pengiriman */}
                              <div className="flex items-center justify-between gap-2 pt-2 text-[10px] font-semibold text-gray-600">
                                <span className="flex items-center gap-1 text-[#3D5126]">✓ Dikemas Petani</span>
                                <span className="h-0.5 flex-1 bg-[#3D5126]"></span>
                                <span className={`flex items-center gap-1 ${s.status_pengiriman === "Dalam Perjalanan" || s.status_pengiriman === "Tiba di Lokasi" ? "text-[#3D5126]" : "text-gray-400"}`}>
                                  🚚 Di Jalan
                                </span>
                                <span className={`h-0.5 flex-1 ${s.status_pengiriman === "Tiba di Lokasi" ? "bg-[#3D5126]" : "bg-gray-200"}`}></span>
                                <span className={`flex items-center gap-1 ${s.status_pengiriman === "Tiba di Lokasi" ? "text-emerald-700 font-bold" : "text-gray-400"}`}>
                                  📍 Tiba
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Kanan: Riwayat Pembelian & Rekomendasi */}
                    <div className="space-y-4 lg:col-span-5">
                      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div>
                            <h2 className="text-sm font-bold text-gray-900">Pesanan Terakhir Saya</h2>
                            <p className="text-[11px] text-gray-500">Daftar transaksi belanja buah &amp; olahan</p>
                          </div>
                          <Link href="/katalog" className="text-xs font-bold text-[#3D5126] hover:underline">
                            Katalog →
                          </Link>
                        </div>

                        <div className="space-y-2.5">
                          {pembelianRole.slice(0, 3).map((trx) => (
                            <div key={trx.id_transaksi} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/60 p-3">
                              <div>
                                <p className="font-mono text-xs font-bold text-gray-900">Pesanan #{trx.id_transaksi}</p>
                                <p className="text-[11px] text-gray-500">{trx.tgl_transaksi}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-[#3D5126]">{formatRupiah(trx.total_harga)}</p>
                                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${getStatusBadge(trx.status)}`}>
                                  {trx.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-900 space-y-2">
                          <p className="font-bold flex items-center gap-1.5">
                            <span>🥭 Rekomendasi Mangga Gedong Gincu Segar</span>
                          </p>
                          <p className="text-[11px] text-emerald-800 leading-relaxed">
                            Panen raya minggu ini di Lohbener Indramayu! Manis brix 17-18 matang pohon siap kirim ke rumah Anda.
                          </p>
                          <Link
                            href="/katalog"
                            className="inline-flex items-center gap-1 rounded-lg bg-[#3D5126] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#273419] transition-all"
                          >
                            <span>Beli di Katalog Sekarang →</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 5. KHUSUS ADMIN SISTEM & COMMAND CENTER */}
              {/* ========================================================= */}
              {currentRole === "admin" && (
                <div className="space-y-6">
                  {/* Header Dashboard Admin Clean */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                          🛡️ Command Center Admin
                        </span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                          Super Administrator
                        </span>
                      </div>
                      <h1 className="mt-1 text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                        Tata Kelola Ekosistem SAMANGGA Indramayu
                      </h1>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Verifikasi kemitraan 5 peran, pengawasan transaksi rantai pasok mangga, dan audit sistem database real-time.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("pengguna")}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#3D5126] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#273419] shadow-xs cursor-pointer transition-all"
                      >
                        <span>Data Pengguna ({penggunaList.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("log")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs cursor-pointer transition-all"
                      >
                        <span>Audit Log Sistem</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Kartu Metrik Admin (Sama persis tata letak UMKM & Mitra) */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <UsersIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Total Pengguna Terdaftar</span>
                        </div>
                        <button type="button" onClick={() => setActiveTab("pengguna")} className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer">Kelola</button>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">{registeredUsersList.length} <span className="text-sm font-normal text-gray-500">Akun</span></p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Petani, UMKM, Mitra, &amp; Konsumen terdaftar
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                            <ShieldCheckIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Verifikasi Menunggu</span>
                        </div>
                        <button type="button" onClick={() => setActiveTab("verifikasi-mitra")} className="text-xs font-bold text-amber-700 hover:underline cursor-pointer">Tinjau</button>
                      </div>
                      <p className={`mt-3 text-2xl font-bold ${pendingMitraCount > 0 ? "text-amber-600" : "text-gray-900"}`}>{pendingMitraCount} <span className="text-sm font-normal text-gray-500">Mitra</span></p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        {pendingMitraCount > 0 ? "Perlu tinjauan berkas MoU / fasilitas" : "Semua berkas mitra telah terverifikasi"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <ReceiptIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Volume Transaksi (GMV)</span>
                        </div>
                        <button type="button" onClick={() => setActiveTab("transaksi")} className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer">Rincian</button>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">{formatRupiah(transaksiList.reduce((acc, t) => acc + t.total_harga, 0))}</p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        {transaksiList.length} transaksi perdagangan rantai pasok
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                            <RecycleIcon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium text-gray-500">Sirkulasi Limbah &amp; Resi</span>
                        </div>
                        <button type="button" onClick={() => setActiveTab("limbah")} className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer">Bursa</button>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-900">{formatNumber(totalBeratLimbahKg)} <span className="text-sm font-normal text-gray-500">Kg</span></p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        {pengirimanList.length} nomor resi pengiriman aktif
                      </p>
                    </div>
                  </div>

                  {/* 2 Kolom Layout Admin (Persis UMKM & Mitra) */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Kiri: Verifikasi Mitra & Pengguna Terdaftar */}
                    <div className="space-y-4 lg:col-span-7">
                      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div>
                            <h2 className="text-sm font-bold text-gray-900">Verifikasi Mitra &amp; Pengguna Terdaftar ({registeredUsersList.length})</h2>
                            <p className="text-[11px] text-gray-500">Pendaftar baru via formulir web atau Akun Google secara real-time</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (isPrivacyMasked) {
                                  if (window.confirm("Peringatan Privasi (UU PDP):\nBuka sensor data pribadi pengguna (Email & Nomor HP)? Pastikan Anda memiliki wewenang operasional.")) {
                                    setIsPrivacyMasked(false);
                                    addLog("AUDIT_PRIVACY", "GET /api/admin/pengguna/unmask", "Admin membuka sensor data pribadi pengguna.", "Warning");
                                  }
                                } else {
                                  setIsPrivacyMasked(true);
                                }
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                              title="Sensor privasi data sesuai UU PDP No. 27/2022"
                            >
                              <span>{isPrivacyMasked ? "🔒 Sensor Aktif" : "🔓 Sensor Dibuka"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                setIsSyncingUsers(true);
                                await syncRegisteredUsersFromDatabase();
                                setIsSyncingUsers(false);
                                showToast("✓ Data pendaftar & mitra berhasil disinkronkan dari database!");
                              }}
                              disabled={isSyncingUsers}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-60"
                              title="Tarik pendaftar baru dari database Supabase"
                            >
                              <ClockRotateLeftIcon className={`h-3.5 w-3.5 ${isSyncingUsers ? "animate-spin text-emerald-600" : ""}`} />
                              <span>{isSyncingUsers ? "Menyinkronkan..." : "Sinkronkan DB"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTab("verifikasi-mitra")}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#3D5126] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#273419] transition-all cursor-pointer"
                            >
                              <span>Moderasikan ({pendingMitraCount})</span>
                            </button>
                          </div>
                        </div>

                        {registeredUsersList.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-500 space-y-1">
                            <p className="text-xs font-semibold text-gray-600">Belum ada pengguna baru yang mendaftar.</p>
                            <p className="text-[11px] text-gray-400">Setiap registrasi Google atau formulir web akan langsung muncul di sini.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {registeredUsersList.slice(0, 4).map((u) => (
                              <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/60 p-3.5 hover:bg-white hover:shadow-xs transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-black text-emerald-800">
                                    {u.namaLengkap ? u.namaLengkap.charAt(0).toUpperCase() : "U"}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold text-gray-900">{u.namaLengkap}</p>
                                      <span className="rounded bg-[#3D5126]/10 px-2 py-0.5 text-[10px] font-bold text-[#3D5126]">
                                        {u.peranErd}
                                      </span>
                                    </div>
                                    <p className="mt-0.5 text-[11px] text-gray-500">{isPrivacyMasked ? maskEmail(u.email) : u.email} • {isPrivacyMasked ? maskPhone(u.nomorWhatsapp) : (u.nomorWhatsapp || "-")}</p>
                                    <p className="text-[10px] text-gray-400">Daftar: {u.registeredAt || "-"}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(u.statusVerifikasi)}`}>
                                    {u.statusVerifikasi}
                                  </span>
                                  {u.role === "mitra" && (
                                    <button
                                      type="button"
                                      onClick={() => setActiveTab("verifikasi-mitra")}
                                      className="rounded-lg bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-800 transition-all cursor-pointer"
                                    >
                                      Tinjau
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMitraAccount(u)}
                                    title="Hapus akun ini dari sistem"
                                    className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 hover:text-red-700 transition-all cursor-pointer"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Kanan: Audit Log Sistem & Aktivitas */}
                    <div className="space-y-4 lg:col-span-5">
                      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div>
                            <h2 className="text-sm font-bold text-gray-900">Audit Log Sistem Realtime ({logList.length})</h2>
                            <p className="text-[11px] text-gray-500">Aktivitas API, CRUD produk, &amp; verifikasi</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab("log")}
                            className="text-xs font-bold text-[#3D5126] hover:underline cursor-pointer"
                          >
                            Semua Log
                          </button>
                        </div>

                        <div className="space-y-2.5 font-mono text-[11px]">
                          {logList.slice(0, 4).map((log) => (
                            <div key={log.id_log} className="rounded-lg border border-gray-100 bg-gray-50/80 p-2.5 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-800">{log.aksi}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${log.level === "Error" ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}>
                                  {log.level}
                                </span>
                              </div>
                              <p className="text-gray-600 text-[10px] font-sans line-clamp-1">{log.pesan}</p>
                              <p className="text-[9px] text-gray-400">{log.waktu}</p>
                            </div>
                          ))}
                        </div>

                        {/* Banner Status Operasional Platform */}
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-900 space-y-2">
                          <p className="font-bold flex items-center gap-1.5">
                            <span>🟢 Status Operasional Sistem Online</span>
                          </p>
                          <p className="text-[11px] text-emerald-800 leading-relaxed">
                            Semua modul layanan platform dan sinkronisasi data ekosistem 5 peran berjalan normal tanpa kendala.
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveTab("log")}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#3D5126] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#273419] transition-all cursor-pointer"
                          >
                            <span>Lihat Detail Audit Log →</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          
          {isAddingTask && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm animate-in fade-in"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsAddingTask(false);
              }}
            >
              <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Tambah Agenda / Tugas
                    </h3>
                    <p className="text-xs text-gray-500">
                      Catat tugas operasional spesifik role {profile.peranErd}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Tutup"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddRoleTask} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-gray-700">
                      Judul Tugas / Agenda *
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Misal: Proses 5 Kwintal Mangga dari Konsumen #404"
                      className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">
                      Estimasi Jam Operasional
                    </label>
                    <input
                      type="text"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      placeholder="Misal: 08:00-10:00 AM"
                      className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                    />
                  </div>
                  <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingTask(false)}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-[#3D5126] px-5 py-2 font-semibold text-white shadow-sm hover:bg-[#273419]"
                    >
                      Simpan Agenda
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          
          {activeTab !== "home" && (
            <main id="crud-table-workspace" className="space-y-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("home")}
                    className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-[#3D5126]"
                  >
                    <span>← Home</span>
                  </button>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    {activeTabMeta.label}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Kelola data {activeTabMeta.tableName.toLowerCase()} akun {profile.peranErd} Anda.
                  </p>
                </div>

                {activeTab !== "profil" && (
                  <div className="flex items-center gap-2">
                    {activeTab === "produk" && (
                      <button
                        type="button"
                        onClick={openCreateProduk}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#3D5126] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#273419]"
                      >
                        + Tambah Produk
                      </button>
                    )}
                    {activeTab === "limbah" && (
                      <button
                        type="button"
                        onClick={openCreateLimbah}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#3D5126] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#273419]"
                      >
                        + Tambah Limbah
                      </button>
                    )}
                    {activeTab === "transaksi" && (
                      <button
                        type="button"
                        onClick={openCreateTransaksi}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#3D5126] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#273419]"
                      >
                        + Tambah Transaksi
                      </button>
                    )}
                    {activeTab === "pengiriman" && (
                      <button
                        type="button"
                        onClick={openCreatePengiriman}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#3D5126] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#273419]"
                      >
                        + Tambah Pengiriman
                      </button>
                    )}
                    {activeTab === "keuangan" && (
                      <button
                        type="button"
                        onClick={openCreateKeuangan}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#3D5126] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#273419]"
                      >
                        + Catat Keuangan
                      </button>
                    )}
                    {activeTab === "pengguna" && (
                      <button
                        type="button"
                        onClick={openCreatePengguna}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#3D5126] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#273419]"
                      >
                        + Tambah Pengguna
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                <div className="flex flex-wrap gap-2">
                  {availableTabs.map((tab) => {
                    const isAct = activeTab === tab.id;
                    const isVerifTab = tab.id === "verifikasi-mitra";
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSearchQuery("");
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                          isAct
                            ? "border-[#3D5126] bg-[#3D5126] text-white shadow-xs"
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span>{tab.label}</span>
                        {isVerifTab && pendingMitraCount > 0 && (
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                              isAct ? "bg-amber-400 text-amber-950" : "bg-amber-500 text-white"
                            }`}
                          >
                            {pendingMitraCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {activeTab !== "profil" && activeTab !== "verifikasi-mitra" && (
                  <div className="relative w-full lg:max-w-xs">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari data pada tabel ini..."
                      className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                    />
                  </div>
                )}
              </div>

            {activeTab === "verifikasi-mitra" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-[#3D5126]/10 px-3 py-1 text-xs font-bold text-[#3D5126]">
                        <ShieldCheckIcon className="h-4 w-4" />
                        Pusat Moderasi Berkas & Kemitraan Sirkular
                      </div>
                      <h2 className="mt-2 text-lg font-extrabold text-gray-900">
                        Verifikasi Mitra Bio-Refinery & Pengolah Limbah
                      </h2>
                      <p className="mt-0.5 text-xs text-gray-500 max-w-2xl">
                        Sesuai standar operasional SAMANGGA, pendaftaran Mitra mewajibkan upload foto lahan/fasilitas atau dokumen MoU. Calon mitra Supplier, UMKM, dan Konsumen langsung aktif tanpa upload dokumen. Admin memvalidasi kejelasan foto sebelum memberikan persetujuan (ACC).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setIsSyncingUsers(true);
                        await syncRegisteredUsersFromDatabase();
                        setIsSyncingUsers(false);
                        showToast("✓ Data mitra terdaftar berhasil diperbarui dari database Supabase!");
                      }}
                      disabled={isSyncingUsers}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-60"
                      title="Perbarui daftar pendaftar mitra langsung dari server Supabase"
                    >
                      <ClockRotateLeftIcon className={`h-4 w-4 ${isSyncingUsers ? "animate-spin text-emerald-600" : "text-[#3D5126]"}`} />
                      <span>{isSyncingUsers ? "Menyinkronkan..." : "Perbarui Data DB"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                      <p className="text-[11px] font-medium text-gray-500">Total Mitra Terdaftar</p>
                      <p className="mt-1 text-xl font-extrabold text-gray-900">{allMitraUsers.length}</p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
                      <p className="text-[11px] font-bold text-amber-700">⏳ Menunggu Verifikasi</p>
                      <p className="mt-1 text-xl font-extrabold text-amber-900">{pendingMitraCount}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
                      <p className="text-[11px] font-bold text-emerald-700">✓ Terverifikasi (ACC)</p>
                      <p className="mt-1 text-xl font-extrabold text-emerald-900">{verifiedMitraCount}</p>
                    </div>
                    <div className="rounded-xl border border-red-200 bg-red-50/70 p-3.5">
                      <p className="text-[11px] font-bold text-red-700">✕ Ditolak / Perlu Kirim Ulang</p>
                      <p className="mt-1 text-xl font-extrabold text-red-900">{rejectedMitraCount}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(["Semua", "Menunggu", "Terverifikasi", "Ditolak"] as const).map((filter) => {
                        const count =
                          filter === "Semua"
                            ? allMitraUsers.length
                            : filter === "Menunggu"
                            ? pendingMitraCount
                            : filter === "Terverifikasi"
                            ? verifiedMitraCount
                            : rejectedMitraCount;
                        const isSelected = mitraFilterStatus === filter;
                        return (
                          <button
                            key={filter}
                            type="button"
                            onClick={() => setMitraFilterStatus(filter)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                              isSelected
                                ? filter === "Menunggu"
                                  ? "bg-amber-500 text-white shadow-xs"
                                  : filter === "Ditolak"
                                  ? "bg-red-600 text-white shadow-xs"
                                  : filter === "Terverifikasi"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-[#3D5126] text-white shadow-xs"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {filter} ({count})
                          </button>
                        );
                      })}
                    </div>

                    <div className="relative w-full sm:w-64">
                      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="search"
                        value={mitraSearchQuery}
                        onChange={(e) => setMitraSearchQuery(e.target.value)}
                        placeholder="Cari instansi, PIC, kontak..."
                        className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-3 text-xs placeholder:text-gray-400 focus:border-[#3D5126] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredMitraUsers.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                      <p className="text-3xl">📭</p>
                      <h3 className="mt-2 text-sm font-bold text-gray-900">Tidak ada pendaftar mitra</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Tidak ada calon mitra dengan status filter &ldquo;{mitraFilterStatus}&rdquo;.
                      </p>
                    </div>
                  ) : (
                    filteredMitraUsers.map((m) => (
                      <div
                        key={m.id}
                        className={`rounded-2xl border bg-white p-5 shadow-sm transition-all ${
                          m.statusVerifikasi === "Menunggu"
                            ? "border-amber-300 ring-2 ring-amber-100"
                            : m.statusVerifikasi === "Ditolak"
                            ? "border-red-200"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#3D5126]/10 text-[#3D5126]">
                                <RecycleIcon className="h-6 w-6" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-[10px] font-bold text-gray-400">
                                    #{m.id}
                                  </span>
                                  <span
                                    className={`rounded-md border px-2.5 py-0.5 text-[10px] font-extrabold ${
                                      m.statusVerifikasi === "Terverifikasi"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : m.statusVerifikasi === "Ditolak"
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : "bg-amber-50 text-amber-800 border-amber-300"
                                    }`}
                                  >
                                    {m.statusVerifikasi === "Menunggu"
                                      ? "⏳ Menunggu Verifikasi"
                                      : m.statusVerifikasi}
                                  </span>
                                  {m.fromGoogle && (
                                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                                      Google Account
                                    </span>
                                  )}
                                  <span className="text-[11px] text-gray-400">
                                    Daftar: {m.registeredAt}
                                  </span>
                                </div>
                                <h3 className="mt-1 text-base font-extrabold text-gray-900">
                                  {(m.extraData?.namaInstansi as string) || m.namaLengkap}
                                </h3>
                                <p className="text-xs text-gray-600">
                                  Penanggung Jawab: <span className="font-bold text-gray-800">{m.namaLengkap}</span>
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-gray-400">✉️</span>
                                <a
                                  href={isPrivacyMasked ? undefined : `mailto:${m.email}`}
                                  className="text-[#3D5126] hover:underline font-medium truncate"
                                >
                                  {isPrivacyMasked ? maskEmail(m.email) : m.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-600" />
                                {isPrivacyMasked ? (
                                  <span className="text-gray-600 font-mono font-medium">
                                    {maskPhone(m.nomorWhatsapp)}
                                  </span>
                                ) : (
                                  <a
                                    href={`https://wa.me/${m.nomorWhatsapp.replace(/^0/, "62")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-700 hover:underline font-bold"
                                  >
                                    {m.nomorWhatsapp} (Hubungi PIC)
                                  </a>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-gray-400">⚖️</span>
                                <span>
                                  Kapasitas:{" "}
                                  <strong>
                                    {m.extraData?.kapasitasTampung
                                      ? `${formatNumber(Number(m.extraData.kapasitasTampung))} Kg/bulan`
                                      : "1.500 Kg/bulan"}
                                  </strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-gray-400">📍</span>
                                <span className="truncate">
                                  Area:{" "}
                                  <strong>
                                    {(m.extraData?.jangkauanArea as string) || "Kabupaten Indramayu"}
                                  </strong>
                                </span>
                              </div>
                            </div>

                            {m.statusVerifikasi === "Ditolak" && m.alasanPenolakan && (
                              <div className="rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-950">
                                <p className="font-bold flex items-center gap-1.5 text-red-900">
                                  <span>⚠️ Catatan Penolakan Admin:</span>
                                </p>
                                <p className="mt-1 font-medium italic text-red-900">
                                  &ldquo;{m.alasanPenolakan}&rdquo;
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-5 shrink-0">
                            <div className="w-full sm:w-auto">
                              <p className="text-[11px] font-bold text-gray-500 mb-1.5">
                                Bukti Foto Fasilitas / Lahan / MoU:
                              </p>
                              {m.fotoPersyaratanUrl ? (
                                <div className="flex items-center gap-3">
                                  <div
                                    onClick={() =>
                                      setInspectPhoto({
                                        url: m.fotoPersyaratanUrl!,
                                        title: (m.extraData?.namaInstansi as string) || m.namaLengkap,
                                        subtitle: m.fotoPersyaratanName || "Berkas Foto Persyaratan Mitra",
                                      })
                                    }
                                    className="group relative h-20 w-28 cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-xs transition-transform hover:scale-105"
                                  >
                                    <img
                                      src={m.fotoPersyaratanUrl}
                                      alt="Bukti foto persyaratan"
                                      className="h-full w-full object-cover transition-all group-hover:brightness-95"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold">
                                      🔍 Periksa
                                    </div>
                                  </div>
                                  <div className="text-xs">
                                    <p className="font-mono text-[11px] font-semibold text-gray-700 truncate max-w-[160px]">
                                      {m.fotoPersyaratanName || "foto-persyaratan.jpg"}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setInspectPhoto({
                                          url: m.fotoPersyaratanUrl!,
                                          title: (m.extraData?.namaInstansi as string) || m.namaLengkap,
                                          subtitle: m.fotoPersyaratanName || "Berkas Foto Persyaratan Mitra",
                                        })
                                      }
                                      className="mt-1 text-[11px] font-bold text-[#3D5126] hover:underline"
                                    >
                                      Periksa Resolusi Penuh →
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 text-center text-xs text-gray-400">
                                  Tidak ada berkas terlampir
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                              {m.statusVerifikasi !== "Terverifikasi" && (
                                <button
                                  type="button"
                                  onClick={() => handleAccMitra(m)}
                                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
                                >
                                  ✓ ACC / Setujui
                                </button>
                              )}

                              {m.statusVerifikasi !== "Ditolak" && (
                                <button
                                  type="button"
                                  onClick={() => openRejectModal(m)}
                                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 active:scale-95 transition-all"
                                >
                                  ✕ Tolak (Kirim Ulang)
                                </button>
                              )}

                              {m.statusVerifikasi === "Terverifikasi" && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                                <CheckBadgeIcon className="h-4 w-4" /> Kemitraan Aktif
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteMitraAccount(m)}
                                title="Hapus permanen akun pendaftar ini dari sistem"
                                className="inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 hover:text-red-700 active:scale-95 transition-all cursor-pointer"
                              >
                                🗑️ Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            
            {activeTab === "produk" && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Data Produk ({currentRole === "petani" ? "Buah" : currentRole === "umkm" ? "Olahan" : "Semua Produk"})
                  </h2>
                  <p className="text-xs text-gray-500">
                    Kelola data komoditas produk: tambah produk baru, ubah harga/stok, atau hapus produk.
                  </p>
                </div>

                {isProdukFormOpen && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4 backdrop-blur-sm animate-in fade-in"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setIsProdukFormOpen(false);
                    }}
                  >
                    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            {editingProdukId !== null
                              ? `Edit Produk #${editingProdukId}`
                              : "Tambah Produk Baru"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Formulir komoditas produk ({currentRole === "petani" ? "Buah" : "Olahan"})
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsProdukFormOpen(false)}
                          className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          aria-label="Tutup"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSaveProduk} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="sm:col-span-2">
                            <label className="block font-medium text-gray-700">Nama Produk *</label>
                            <input
                              type="text"
                              required
                              value={formProduk.nama_produk}
                              onChange={(e) =>
                                setFormProduk((prev) => ({ ...prev, nama_produk: e.target.value }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Kategori (`Buah` / `Olahan`)</label>
                            <select
                              value={formProduk.kategori}
                              onChange={(e) =>
                                setFormProduk((prev) => ({
                                  ...prev,
                                  kategori: e.target.value as KategoriProduk,
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            >
                              <option value="Buah">Buah</option>
                              <option value="Olahan">Olahan</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Harga (Rp) *</label>
                            <input
                              type="number"
                              required
                              min={1000}
                              value={formProduk.harga}
                              onChange={(e) =>
                                setFormProduk((prev) => ({ ...prev, harga: Number(e.target.value) }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Stok *</label>
                            <input
                              type="number"
                              required
                              min={0}
                              value={formProduk.stok}
                              onChange={(e) =>
                                setFormProduk((prev) => ({ ...prev, stok: Number(e.target.value) }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Satuan *</label>
                            <input
                              type="text"
                              required
                              value={formProduk.satuan}
                              onChange={(e) =>
                                setFormProduk((prev) => ({ ...prev, satuan: e.target.value }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block font-medium text-gray-700">Deskripsi</label>
                            <input
                              type="text"
                              value={formProduk.deskripsi}
                              onChange={(e) =>
                                setFormProduk((prev) => ({ ...prev, deskripsi: e.target.value }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Status Verifikasi</label>
                            <select
                              value={formProduk.status_verifikasi}
                              onChange={(e) =>
                                setFormProduk((prev) => ({
                                  ...prev,
                                  status_verifikasi: e.target.value as StatusVerifikasi,
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            >
                              <option value="Menunggu">Menunggu</option>
                              <option value="Terverifikasi">Terverifikasi</option>
                              <option value="Ditolak">Ditolak</option>
                            </select>
                          </div>

                          <div className="sm:col-span-3 rounded-xl border border-gray-200 bg-gray-50/70 p-3">
                            <label className="block font-semibold text-gray-800">
                              Foto Produk <span className="text-red-600">* (Wajib Diunggah)</span>
                            </label>
                            <p className="mt-0.5 text-[11px] text-gray-500">
                              Unggah foto produk asli (maks. 2MB) atau pilih salah satu preset foto komoditas di bawah.
                            </p>
                            <div className="mt-2.5 flex flex-col gap-3 sm:flex-row sm:items-center">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 2 * 1024 * 1024) {
                                      showToast("⚠️ Ukuran foto maksimal 2MB");
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      setFormProduk((prev) => ({
                                        ...prev,
                                        gambar: ev.target?.result as string,
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#3D5126] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#273419] file:cursor-pointer"
                              />
                              {formProduk.gambar && (
                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="relative h-14 w-14 overflow-hidden rounded-lg border-2 border-emerald-500 shadow-xs">
                                    <img
                                      src={formProduk.gambar}
                                      alt="Pratinjau Foto Produk"
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <span className="text-[11px] font-bold text-emerald-700">✓ Terpilih</span>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-200">
                              <span className="text-[10px] font-semibold text-gray-500">Preset Cepat:</span>
                              {[
                                { label: "Gedong Gincu", url: "/images/mangga/mangga_gincu.jpg" },
                                { label: "Arumanis", url: "/images/mangga/mangga_harusmanis.jpg" },
                                { label: "Manalagi", url: "/images/mangga/mangga_manalagi.jpg" },
                                { label: "Dodol Mangga", url: "/images/olahan/dodol_mangga.jpg" },
                                { label: "Keripik Mangga", url: "/images/olahan/keripik_mangga.jpg" },
                                { label: "Pulp Mangga", url: "/images/olahan/pulp_mangga.jpg" },
                              ].map((preset) => (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => setFormProduk((prev) => ({ ...prev, gambar: preset.url }))}
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-all ${
                                    formProduk.gambar === preset.url
                                      ? "bg-[#3D5126] text-white"
                                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                          <button
                            type="button"
                            onClick={() => setIsProdukFormOpen(false)}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="rounded-lg bg-[#3D5126] px-5 py-2 font-semibold text-white shadow-sm hover:bg-[#273419]"
                          >
                            Simpan Data Produk
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-semibold text-gray-600">
                        <th className="p-3">ID</th>
                        <th className="p-3">Nama Produk</th>
                        <th className="p-3">Kategori</th>
                        <th className="p-3">Harga</th>
                        <th className="p-3">Stok</th>
                        <th className="p-3">Verifikasi</th>
                        <th className="p-3 text-right">Aksi CRUD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {displayedProduk.map((p) => (
                        <tr key={p.id_produk} className="transition-colors hover:bg-[#95A87A]/10">
                          <td className="p-3 font-mono font-medium text-gray-500">#{p.id_produk}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {p.gambar && (
                                <img
                                  src={p.gambar}
                                  alt={p.nama_produk}
                                  className="h-10 w-10 shrink-0 rounded-lg object-cover border border-gray-200"
                                />
                              )}
                              <div>
                                <p className="font-bold text-gray-900">{p.nama_produk}</p>
                                <p className="text-[11px] text-gray-500 line-clamp-1">{p.deskripsi}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-semibold">{p.kategori}</td>
                          <td className="p-3 font-bold text-gray-900">
                            {formatRupiah(p.harga)} / {p.satuan}
                          </td>
                          <td className="p-3 font-semibold">
                            {p.stok} {p.satuan}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-block rounded-md border px-2.5 py-1 text-[10px] font-semibold ${getStatusBadge(
                                p.status_verifikasi,
                              )}`}
                            >
                              {p.status_verifikasi}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditProduk(p)}
                                className="rounded-md border border-gray-200 bg-white px-2.5 py-1 font-medium text-gray-700 hover:border-[#3D5126] hover:bg-[#95A87A]/20 hover:text-[#273419]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduk(p.id_produk)}
                                className="rounded-md border border-red-100 bg-red-50 px-2.5 py-1 font-medium text-red-600 hover:bg-red-100"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            
            {activeTab === "limbah" && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Data Limbah Sirkular
                  </h2>
                  <p className="text-xs text-gray-500">
                    Kelola pencatatan limbah UMKM (kulit, biji, buah afkir), kompensasi, dan status penjemputan Mitra.
                  </p>
                </div>

                {isLimbahFormOpen && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4 backdrop-blur-sm animate-in fade-in"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setIsLimbahFormOpen(false);
                    }}
                  >
                    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            {editingLimbahId !== null
                              ? `Edit Data Limbah #${editingLimbahId}`
                              : "Tambah Data Limbah Baru"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Pencatatan limbah sirkular UMKM & status penjemputan Mitra
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsLimbahFormOpen(false)}
                          className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          aria-label="Tutup"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSaveLimbah} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div>
                            <label className="block font-medium text-gray-700">Jenis Limbah *</label>
                            <select
                              value={formLimbah.jenis_limbah}
                              onChange={(e) =>
                                setFormLimbah((prev) => ({
                                  ...prev,
                                  jenis_limbah: e.target.value as JenisLimbahErd,
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            >
                              <option value="Kulit">Kulit</option>
                              <option value="Biji">Biji</option>
                              <option value="Buah Afkir">Buah Afkir</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Berat (Kg) *</label>
                            <input
                              type="number"
                              required
                              min={1}
                              value={formLimbah.berat_kg}
                              onChange={(e) =>
                                setFormLimbah((prev) => ({ ...prev, berat_kg: Number(e.target.value) }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Jenis Kompensasi</label>
                            <select
                              value={formLimbah.jenis_kompensasi}
                              onChange={(e) =>
                                setFormLimbah((prev) => ({
                                  ...prev,
                                  jenis_kompensasi: e.target.value as JenisKompensasi,
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            >
                              <option value="Jual Beli">Jual Beli</option>
                              <option value="Jasa Berbayar">Jasa Berbayar</option>
                              <option value="Gratis">Gratis</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Estimasi Harga (Rp)</label>
                            <input
                              type="number"
                              min={0}
                              value={formLimbah.estimasi_harga}
                              onChange={(e) =>
                                setFormLimbah((prev) => ({
                                  ...prev,
                                  estimasi_harga: Number(e.target.value),
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Harga Kesepakatan (Rp)</label>
                            <input
                              type="number"
                              min={0}
                              value={formLimbah.harga_kesepakatan}
                              onChange={(e) =>
                                setFormLimbah((prev) => ({
                                  ...prev,
                                  harga_kesepakatan: Number(e.target.value),
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Status Jemput</label>
                            <select
                              value={formLimbah.status_jemput}
                              onChange={(e) =>
                                setFormLimbah((prev) => ({
                                  ...prev,
                                  status_jemput: e.target.value as StatusJemput,
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            >
                              <option value="Tersedia">Tersedia</option>
                              <option value="Diajukan">Diajukan</option>
                              <option value="Proses">Proses</option>
                              <option value="Selesai">Selesai</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block font-medium text-gray-700">Lokasi Penjemputan *</label>
                            <input
                              type="text"
                              required
                              value={formLimbah.lokasi_penjemputan}
                              onChange={(e) =>
                                setFormLimbah((prev) => ({
                                  ...prev,
                                  lokasi_penjemputan: e.target.value,
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Status Verifikasi</label>
                            <select
                              value={formLimbah.status_verifikasi}
                              onChange={(e) =>
                                setFormLimbah((prev) => ({
                                  ...prev,
                                  status_verifikasi: e.target.value as StatusVerifikasi,
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            >
                              <option value="Menunggu">Menunggu</option>
                              <option value="Terverifikasi">Terverifikasi</option>
                              <option value="Ditolak">Ditolak</option>
                            </select>
                          </div>

                          <div className="sm:col-span-3 rounded-xl border border-gray-200 bg-gray-50/70 p-3">
                            <label className="block font-semibold text-gray-800">
                              Foto Limbah <span className="text-red-600">* (Wajib Diunggah)</span>
                            </label>
                            <p className="mt-0.5 text-[11px] text-gray-500">
                              Unggah dokumentasi foto limbah (maks. 2MB) atau pilih salah satu preset foto limbah di bawah.
                            </p>
                            <div className="mt-2.5 flex flex-col gap-3 sm:flex-row sm:items-center">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 2 * 1024 * 1024) {
                                      showToast("⚠️ Ukuran foto maksimal 2MB");
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      setFormLimbah((prev) => ({
                                        ...prev,
                                        foto_limbah: ev.target?.result as string,
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#3D5126] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#273419] file:cursor-pointer"
                              />
                              {formLimbah.foto_limbah && (
                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="relative h-14 w-14 overflow-hidden rounded-lg border-2 border-emerald-500 shadow-xs">
                                    <img
                                      src={formLimbah.foto_limbah}
                                      alt="Pratinjau Foto Limbah"
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <span className="text-[11px] font-bold text-emerald-700">✓ Terpilih</span>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-200">
                              <span className="text-[10px] font-semibold text-gray-500">Preset Cepat:</span>
                              {[
                                { label: "Kulit Mangga", url: "/images/limbah/limbah_kulit_mangga.jpg" },
                                { label: "Biji Mangga", url: "/images/limbah/limbah_biji_mangga.jpg" },
                                { label: "Buah Afkir", url: "/images/mangga/mangga_afkir.jpg" },
                                { label: "Daun Mangga", url: "/images/limbah/limbah_daun_mangga.jpg" },
                                { label: "Pupuk Kompos", url: "/images/limbah/pupuk_kompos.jpg" },
                              ].map((preset) => (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => setFormLimbah((prev) => ({ ...prev, foto_limbah: preset.url }))}
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-all ${
                                    formLimbah.foto_limbah === preset.url
                                      ? "bg-[#3D5126] text-white"
                                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                          <button
                            type="button"
                            onClick={() => setIsLimbahFormOpen(false)}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="rounded-lg bg-[#3D5126] px-5 py-2 font-semibold text-white shadow-sm hover:bg-[#273419]"
                          >
                            Simpan Data Limbah
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-semibold text-gray-600">
                        <th className="p-3">ID</th>
                        <th className="p-3">Jenis & Berat</th>
                        <th className="p-3">Kompensasi & Harga</th>
                        <th className="p-3">Lokasi Jemput</th>
                        <th className="p-3">Status Jemput</th>
                        <th className="p-3">Verifikasi</th>
                        <th className="p-3 text-right">Aksi CRUD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {displayedLimbah.map((l) => (
                        <tr key={l.id_limbah} className="transition-colors hover:bg-[#95A87A]/10">
                          <td className="p-3 font-mono font-medium text-gray-500">#{l.id_limbah}</td>
                          <td className="p-3">
                            <p className="font-bold text-gray-900">{l.jenis_limbah}</p>
                            <p className="text-[11px] text-gray-500">{formatNumber(l.berat_kg)} kg</p>
                          </td>
                          <td className="p-3">
                            <p className="font-semibold text-gray-900">{l.jenis_kompensasi ?? "-"}</p>
                            <p className="text-[11px] text-gray-600">
                              Sepakat:{" "}
                              {l.harga_kesepakatan !== null
                                ? formatRupiah(l.harga_kesepakatan)
                                : formatRupiah(l.estimasi_harga)}
                            </p>
                          </td>
                          <td className="p-3 max-w-52">
                            <p className="truncate font-medium">{l.lokasi_penjemputan}</p>
                            <p className="font-mono text-[10px] text-gray-400">
                              {l.titik_koordinat ?? "-"}
                            </p>
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-block rounded-md border px-2.5 py-1 text-[10px] font-semibold ${getStatusBadge(
                                l.status_jemput,
                              )}`}
                            >
                              {l.status_jemput}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-block rounded-md border px-2.5 py-1 text-[10px] font-semibold ${getStatusBadge(
                                l.status_verifikasi,
                              )}`}
                            >
                              {l.status_verifikasi}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditLimbah(l)}
                                className="rounded-md border border-gray-200 bg-white px-2.5 py-1 font-medium text-gray-700 hover:border-[#3D5126] hover:bg-[#95A87A]/20 hover:text-[#273419]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLimbah(l.id_limbah)}
                                className="rounded-md border border-red-100 bg-red-50 px-2.5 py-1 font-medium text-red-600 hover:bg-red-100"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            
            {(activeTab === "transaksi" || activeTab === "pembayaran") && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Data Transaksi & Pembayaran
                  </h2>
                  <p className="text-xs text-gray-500">
                    Kelola pesanan pembelian/penjualan, konfirmasi bukti transfer manual, atau perbarui status pembayaran.
                  </p>
                </div>

                {isTransaksiFormOpen && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4 backdrop-blur-sm animate-in fade-in"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setIsTransaksiFormOpen(false);
                    }}
                  >
                    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            {editingTransaksiId !== null
                              ? `Edit Transaksi #${editingTransaksiId}`
                              : "Tambah Transaksi Baru"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Formulir pesanan transaksi & status pembayaran
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsTransaksiFormOpen(false)}
                          className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          aria-label="Tutup"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSaveTransaksi} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="sm:col-span-2">
                            <label className="block font-medium text-gray-700">Pilih Produk *</label>
                            <select
                              value={formTransaksi.id_produk}
                              onChange={(e) =>
                                setFormTransaksi((prev) => ({
                                  ...prev,
                                  id_produk: Number(e.target.value),
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            >
                              {produkList.map((p) => (
                                <option key={p.id_produk} value={p.id_produk}>
                                  #{p.id_produk} - {p.nama_produk} ({formatRupiah(p.harga)}/{p.satuan})
                                </option>
                              ))}
                            </select>

                            {(() => {
                              const selectedProd = produkList.find(
                                (p) => p.id_produk === formTransaksi.id_produk,
                              );
                              if (!selectedProd) return null;
                              return (
                                <div className="mt-2 flex items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 p-2">
                                  {selectedProd.gambar && (
                                    <img
                                      src={selectedProd.gambar}
                                      alt={selectedProd.nama_produk}
                                      className="h-10 w-10 shrink-0 rounded-md object-cover border border-gray-200 shadow-sm"
                                    />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-gray-900 truncate">{selectedProd.nama_produk}</p>
                                    <p className="text-[10px] text-gray-500">
                                      {formatRupiah(selectedProd.harga)}/{selectedProd.satuan} · Stok: {selectedProd.stok} {selectedProd.satuan}
                                    </p>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Jumlah Produk *</label>
                            <input
                              type="number"
                              required
                              min={1}
                              value={formTransaksi.jumlah_produk}
                              onChange={(e) =>
                                setFormTransaksi((prev) => ({
                                  ...prev,
                                  jumlah_produk: Number(e.target.value) || 1,
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Status Transaksi</label>
                            <select
                              value={formTransaksi.status}
                              onChange={(e) =>
                                setFormTransaksi((prev) => ({
                                  ...prev,
                                  status: e.target.value as StatusTransaksi,
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Diproses">Diproses</option>
                              <option value="Selesai">Selesai</option>
                              <option value="Batal">Batal</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Metode Pembayaran</label>
                            <select
                              value={formTransaksi.metode_pembayaran}
                              onChange={(e) =>
                                setFormTransaksi((prev) => ({
                                  ...prev,
                                  metode_pembayaran: e.target.value as MetodePembayaran,
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            >
                              <option value="Transfer Manual">Transfer Manual</option>
                              <option value="Virtual Account">Virtual Account</option>
                              <option value="QRIS">QRIS</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Status Pembayaran</label>
                            <select
                              value={formTransaksi.status_pembayaran}
                              onChange={(e) =>
                                setFormTransaksi((prev) => ({
                                  ...prev,
                                  status_pembayaran: e.target.value as StatusPembayaran,
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            >
                              <option value="Menunggu">Menunggu</option>
                              <option value="Berhasil">Berhasil</option>
                              <option value="Gagal">Gagal</option>
                              <option value="Kedaluwarsa">Kedaluwarsa</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                          <button
                            type="button"
                            onClick={() => setIsTransaksiFormOpen(false)}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="rounded-lg bg-[#3D5126] px-5 py-2 font-semibold text-white shadow-sm hover:bg-[#273419]"
                          >
                            Simpan Transaksi
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-semibold text-gray-600">
                        <th className="p-3">ID Transaksi</th>
                        <th className="p-3">Pembeli & Penjual</th>
                        <th className="p-3">Detail Item</th>
                        <th className="p-3">Total Harga</th>
                        <th className="p-3">Pembayaran</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Aksi CRUD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {displayedTransaksi.map((t) => {
                        const details = detailTransaksiList.filter(
                          (d) => d.id_transaksi === t.id_transaksi,
                        );
                        const pay = pembayaranList.find((p) => p.id_transaksi === t.id_transaksi);
                        return (
                          <tr key={t.id_transaksi} className="transition-colors hover:bg-[#95A87A]/10">
                            <td className="p-3 font-mono font-medium text-gray-500">
                              #{t.id_transaksi}
                              <span className="block text-[10px] font-normal text-gray-400">
                                {t.tgl_transaksi}
                              </span>
                            </td>
                            <td className="p-3">
                              <p className="font-semibold text-gray-900">
                                Pembeli: #{t.id_pembeli} ({getUserName(t.id_pembeli).split(" ")[0]})
                              </p>
                              <p className="text-[11px] text-gray-500">
                                Penjual: #{t.id_penjual} ({getUserName(t.id_penjual).split(" ")[0]})
                              </p>
                            </td>
                            <td className="p-3">
                              {details.map((d) => {
                                const pr = produkList.find((x) => x.id_produk === d.id_produk);
                                return (
                                  <div key={d.id_detail_transaksi} className="flex items-center gap-2 py-0.5">
                                    {pr?.gambar && (
                                      <img
                                        src={pr.gambar}
                                        alt={pr.nama_produk}
                                        className="h-8 w-8 shrink-0 rounded-md object-cover border border-gray-200 shadow-sm"
                                      />
                                    )}
                                    <span className="text-[11px]">
                                      {pr?.nama_produk ?? `Produk #${d.id_produk}`} ({d.jumlah_produk}x)
                                    </span>
                                  </div>
                                );
                              })}
                            </td>
                            <td className="p-3 font-bold text-gray-900">
                              {formatRupiah(t.total_harga)}
                            </td>
                            <td className="p-3">
                              {pay ? (
                                <div>
                                  <span className="font-semibold">{pay.metode_pembayaran}</span>
                                  <span
                                    className={`ml-1.5 inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadge(
                                      pay.status_pembayaran,
                                    )}`}
                                  >
                                    {pay.status_pembayaran}
                                  </span>
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-block rounded-md border px-2.5 py-1 text-[10px] font-semibold ${getStatusBadge(
                                  t.status,
                                )}`}
                              >
                                {t.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditTransaksi(t)}
                                  className="rounded-md border border-gray-200 bg-white px-2.5 py-1 font-medium text-gray-700 hover:border-[#3D5126] hover:bg-[#95A87A]/20 hover:text-[#273419]"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTransaksi(t.id_transaksi)}
                                  className="rounded-md border border-red-100 bg-red-50 px-2.5 py-1 font-medium text-red-600 hover:bg-red-100"
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            
            {activeTab === "pengiriman" && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Data Pengiriman
                  </h2>
                  <p className="text-xs text-gray-500">
                    Kelola nomor resi pelacakan kurir Mitra dan status pengiriman pesanan.
                  </p>
                </div>

                {isPengirimanFormOpen && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4 backdrop-blur-sm animate-in fade-in"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setIsPengirimanFormOpen(false);
                    }}
                  >
                    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            {editingPengirimanId !== null
                              ? `Edit Pengiriman #${editingPengirimanId}`
                              : "Tambah Pengiriman Baru"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Pencatatan resi pelacakan & status pengiriman kurir Mitra
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsPengirimanFormOpen(false)}
                          className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          aria-label="Tutup"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSavePengiriman} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div>
                            <label className="block font-medium text-gray-700">Nomor Transaksi *</label>
                            <select
                              value={formPengiriman.id_transaksi}
                              onChange={(e) =>
                                setFormPengiriman((prev) => ({
                                  ...prev,
                                  id_transaksi: Number(e.target.value),
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            >
                              {transaksiList.map((t) => (
                                <option key={t.id_transaksi} value={t.id_transaksi}>
                                  Transaksi #{t.id_transaksi} ({formatRupiah(t.total_harga)})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">No. Resi Lacak *</label>
                            <input
                              type="text"
                              required
                              value={formPengiriman.no_resi_lacak}
                              onChange={(e) =>
                                setFormPengiriman((prev) => ({
                                  ...prev,
                                  no_resi_lacak: e.target.value,
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Status Pengiriman</label>
                            <select
                              value={formPengiriman.status_pengiriman}
                              onChange={(e) =>
                                setFormPengiriman((prev) => ({
                                  ...prev,
                                  status_pengiriman: e.target.value as StatusPengiriman,
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            >
                              <option value="Diproses">Diproses</option>
                              <option value="Dalam Perjalanan">Dalam Perjalanan</option>
                              <option value="Tiba di Lokasi">Tiba di Lokasi</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                          <button
                            type="button"
                            onClick={() => setIsPengirimanFormOpen(false)}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="rounded-lg bg-[#3D5126] px-5 py-2 font-semibold text-white shadow-sm hover:bg-[#273419]"
                          >
                            Simpan Pengiriman
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-semibold text-gray-600">
                        <th className="p-3">ID Pengiriman</th>
                        <th className="p-3">ID Transaksi</th>
                        <th className="p-3">No. Resi Lacak</th>
                        <th className="p-3">Mitra Kurir</th>
                        <th className="p-3">Status Pengiriman</th>
                        <th className="p-3">Tgl Diterima</th>
                        <th className="p-3 text-right">Aksi CRUD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {pengirimanList.map((s) => (
                        <tr key={s.id_pengiriman} className="transition-colors hover:bg-[#95A87A]/10">
                          <td className="p-3 font-mono font-medium text-gray-500">
                            #{s.id_pengiriman}
                          </td>
                          <td className="p-3 font-mono font-semibold">#{s.id_transaksi}</td>
                          <td className="p-3 font-mono font-bold text-gray-900">
                            {s.no_resi_lacak}
                          </td>
                          <td className="p-3">
                            {s.id_mitra ? `Mitra #${s.id_mitra}` : "Belum ditentukan"}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-block rounded-md border px-2.5 py-1 text-[10px] font-semibold ${getStatusBadge(
                                s.status_pengiriman,
                              )}`}
                            >
                              {s.status_pengiriman}
                            </span>
                          </td>
                          <td className="p-3 text-gray-500">{s.tgl_diterima ?? "-"}</td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditPengiriman(s)}
                                className="rounded-md border border-gray-200 bg-white px-2.5 py-1 font-medium text-gray-700 hover:border-[#3D5126] hover:bg-[#95A87A]/20 hover:text-[#273419]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePengiriman(s.id_pengiriman)}
                                className="rounded-md border border-red-100 bg-red-50 px-2.5 py-1 font-medium text-red-600 hover:bg-red-100"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            
            {activeTab === "keuangan" && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Pencatatan Keuangan
                  </h2>
                  <p className="text-xs text-gray-500">
                    Kelola arus kas Pemasukan dan Pengeluaran operasional secara transparan.
                  </p>
                </div>

                {isKeuanganFormOpen && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4 backdrop-blur-sm animate-in fade-in"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setIsKeuanganFormOpen(false);
                    }}
                  >
                    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            {editingKeuanganId !== null
                              ? `Edit Catatan Keuangan #${editingKeuanganId}`
                              : "Tambah Catatan Keuangan Baru"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Pencatatan arus kas Pemasukan & Pengeluaran berdasarkan Transaksi atau Limbah
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsKeuanganFormOpen(false)}
                          className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          aria-label="Tutup"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSaveKeuangan} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                          <div>
                            <label className="block font-medium text-gray-700">Acuan Wajib *</label>
                            <select
                              value={formKeuangan.refType}
                              onChange={(e) => {
                                const nextType = e.target.value as "transaksi" | "limbah";
                                setFormKeuangan((prev) => ({
                                  ...prev,
                                  refType: nextType,
                                  refId:
                                    nextType === "transaksi"
                                      ? transaksiList[0]?.id_transaksi ?? 5001
                                      : limbahList[0]?.id_limbah ?? 3001,
                                }));
                              }}
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            >
                              <option value="transaksi">ID Transaksi</option>
                              <option value="limbah">ID Limbah</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Pilih Referensi *</label>
                            <select
                              value={formKeuangan.refId}
                              onChange={(e) =>
                                setFormKeuangan((prev) => ({
                                  ...prev,
                                  refId: Number(e.target.value),
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            >
                              {formKeuangan.refType === "transaksi"
                                ? transaksiList.map((t) => (
                                    <option key={t.id_transaksi} value={t.id_transaksi}>
                                      Transaksi #{t.id_transaksi} ({formatRupiah(t.total_harga)})
                                    </option>
                                  ))
                                : limbahList.map((l) => (
                                    <option key={l.id_limbah} value={l.id_limbah}>
                                      Limbah #{l.id_limbah} ({l.jenis_limbah})
                                    </option>
                                  ))}
                            </select>
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Jenis Transaksi *</label>
                            <select
                              value={formKeuangan.jenis_transaksi}
                              onChange={(e) =>
                                setFormKeuangan((prev) => ({
                                  ...prev,
                                  jenis_transaksi: e.target.value as JenisKeuangan,
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            >
                              <option value="Pemasukan">Pemasukan</option>
                              <option value="Pengeluaran">Pengeluaran</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Jumlah Uang (Rp) *</label>
                            <input
                              type="number"
                              required
                              min={1000}
                              value={formKeuangan.jumlah_uang}
                              onChange={(e) =>
                                setFormKeuangan((prev) => ({
                                  ...prev,
                                  jumlah_uang: Number(e.target.value),
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-medium text-gray-700">Keterangan *</label>
                          <input
                            type="text"
                            required
                            value={formKeuangan.keterangan}
                            onChange={(e) =>
                              setFormKeuangan((prev) => ({ ...prev, keterangan: e.target.value }))
                            }
                            className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                          <button
                            type="button"
                            onClick={() => setIsKeuanganFormOpen(false)}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="rounded-lg bg-[#3D5126] px-5 py-2 font-semibold text-white shadow-sm hover:bg-[#273419]"
                          >
                            Simpan Catatan Keuangan
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-semibold text-gray-600">
                        <th className="p-3">ID</th>
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">Acuan (Transaksi / Limbah)</th>
                        <th className="p-3">Jenis</th>
                        <th className="p-3">Jumlah Uang</th>
                        <th className="p-3">Keterangan</th>
                        <th className="p-3 text-right">Aksi CRUD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {displayedKeuangan.map((k) => (
                        <tr key={k.id_keuangan} className="transition-colors hover:bg-[#95A87A]/10">
                          <td className="p-3 font-mono font-medium text-gray-500">
                            #{k.id_keuangan}
                          </td>
                          <td className="p-3 text-gray-500">{k.tgl_pencatatan}</td>
                          <td className="p-3 font-mono text-[11px]">
                            {k.id_transaksi !== null
                              ? `id_transaksi: #${k.id_transaksi}`
                              : `id_limbah: #${k.id_limbah}`}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-block rounded-md border px-2.5 py-1 text-[10px] font-semibold ${getStatusBadge(
                                k.jenis_transaksi,
                              )}`}
                            >
                              {k.jenis_transaksi}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-gray-900">
                            {formatRupiah(k.jumlah_uang)}
                          </td>
                          <td className="p-3 text-gray-600">{k.keterangan}</td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditKeuangan(k)}
                                className="rounded-md border border-gray-200 bg-white px-2.5 py-1 font-medium text-gray-700 hover:border-[#3D5126] hover:bg-[#95A87A]/20 hover:text-[#273419]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteKeuangan(k.id_keuangan)}
                                className="rounded-md border border-red-100 bg-red-50 px-2.5 py-1 font-medium text-red-600 hover:bg-red-100"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            
            {activeTab === "pengguna" && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      Data Pengguna
                    </h2>
                    <p className="text-xs text-gray-500">
                      Kelola seluruh akun pengguna platform: tambah pengguna, ubah peran/status verifikasi, atau hapus akun.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isPrivacyMasked) {
                          if (window.confirm("Peringatan Privasi (UU PDP):\nBuka sensor data pribadi pengguna (Email & Nomor HP)? Pastikan Anda memiliki wewenang operasional.")) {
                            setIsPrivacyMasked(false);
                            addLog("AUDIT_PRIVACY", "GET /api/admin/pengguna/unmask", "Admin membuka sensor data pribadi pengguna.", "Warning");
                          }
                        } else {
                          setIsPrivacyMasked(true);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs cursor-pointer transition-all"
                      title="Sensor privasi data sesuai UU PDP No. 27/2022"
                    >
                      <span>{isPrivacyMasked ? "🔒 Sensor Data Aktif" : "🔓 Sensor Dibuka"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={openCreatePengguna}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#3D5126] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#273419] shadow-xs cursor-pointer transition-all"
                    >
                      <span>+ Tambah Pengguna</span>
                    </button>
                  </div>
                </div>

                {isPenggunaFormOpen && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4 backdrop-blur-sm animate-in fade-in"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setIsPenggunaFormOpen(false);
                    }}
                  >
                    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            {editingPenggunaId !== null
                              ? `Edit Pengguna #${editingPenggunaId}`
                              : "Tambah Pengguna Baru"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Manajemen akun pengguna dan hak akses tabel ERD Pengguna
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsPenggunaFormOpen(false)}
                          className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          aria-label="Tutup"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSavePengguna} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div>
                            <label className="block font-medium text-gray-700">Nama Lengkap *</label>
                            <input
                              type="text"
                              required
                              value={formPengguna.nama_lengkap}
                              onChange={(e) =>
                                setFormPengguna((prev) => ({
                                  ...prev,
                                  nama_lengkap: e.target.value,
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Peran (`ENUM`) *</label>
                            <select
                              value={formPengguna.peran}
                              onChange={(e) =>
                                setFormPengguna((prev) => ({
                                  ...prev,
                                  peran: e.target.value as PeranPengguna,
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            >
                              <option value="Supplier">Supplier</option>
                              <option value="UMKM">UMKM</option>
                              <option value="Mitra">Mitra</option>
                              <option value="Konsumen">Konsumen</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Status Verifikasi *</label>
                            <select
                              value={formPengguna.status_verifikasi}
                              onChange={(e) =>
                                setFormPengguna((prev) => ({
                                  ...prev,
                                  status_verifikasi: e.target.value as StatusVerifikasi,
                                }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            >
                              <option value="Menunggu">Menunggu</option>
                              <option value="Terverifikasi">Terverifikasi</option>
                              <option value="Ditolak">Ditolak</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Email *</label>
                            <input
                              type="email"
                              required
                              value={formPengguna.email}
                              onChange={(e) =>
                                setFormPengguna((prev) => ({ ...prev, email: e.target.value }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">No. Telp *</label>
                            <input
                              type="text"
                              required
                              value={formPengguna.no_telp}
                              onChange={(e) =>
                                setFormPengguna((prev) => ({ ...prev, no_telp: e.target.value }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700">Alamat *</label>
                            <input
                              type="text"
                              required
                              value={formPengguna.alamat}
                              onChange={(e) =>
                                setFormPengguna((prev) => ({ ...prev, alamat: e.target.value }))
                              }
                              className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                          <button
                            type="button"
                            onClick={() => setIsPenggunaFormOpen(false)}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="rounded-lg bg-[#3D5126] px-5 py-2 font-semibold text-white shadow-sm hover:bg-[#273419]"
                          >
                            Simpan Pengguna
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-semibold text-gray-600">
                        <th className="p-3">ID User</th>
                        <th className="p-3">Nama Lengkap</th>
                        <th className="p-3">Peran</th>
                        <th className="p-3">Kontak</th>
                        <th className="p-3">Status Verifikasi</th>
                        <th className="p-3 text-right">Aksi CRUD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {penggunaList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-400">
                            <p className="text-sm font-semibold text-gray-700">Belum ada data pengguna terdaftar.</p>
                            <p className="mt-1 text-xs text-gray-500">
                              Pengguna yang mendaftar melalui formulir registrasi atau Akun Google akan otomatis muncul dan tercatat di sini.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        penggunaList.map((u) => (
                          <tr key={u.id_user} className="transition-colors hover:bg-[#95A87A]/10">
                            <td className="p-3 font-mono font-medium text-gray-500">#{u.id_user}</td>
                            <td className="p-3">
                              <p className="font-bold text-gray-900">{u.nama_lengkap}</p>
                              <p className="text-[11px] text-gray-500">{u.alamat}</p>
                            </td>
                            <td className="p-3 font-bold">{u.peran}</td>
                            <td className="p-3">
                              <p>{isPrivacyMasked ? maskEmail(u.email) : u.email}</p>
                              <p className="text-[11px] text-gray-500">{isPrivacyMasked ? maskPhone(u.no_telp) : u.no_telp}</p>
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-block rounded-md border px-2.5 py-1 text-[10px] font-semibold ${getStatusBadge(
                                  u.status_verifikasi,
                                )}`}
                              >
                                {u.status_verifikasi}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditPengguna(u)}
                                  className="rounded-md border border-gray-200 bg-white px-2.5 py-1 font-medium text-gray-700 hover:border-[#3D5126] hover:bg-[#95A87A]/20 hover:text-[#273419]"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `Hapus permanen akun "${u.nama_lengkap}" (${u.email})?\n\nPengguna ini tidak akan bisa login lagi ke sistem.`,
                                      )
                                    ) {
                                      handleDeletePengguna(u.id_user, u.email, u.nama_lengkap);
                                    }
                                  }}
                                  className="rounded-md border border-red-100 bg-red-50 px-2.5 py-1 font-medium text-red-600 hover:bg-red-100 cursor-pointer"
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            
            {activeTab === "log" && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Log Sistem Platform</h2>
                  <p className="text-xs text-gray-500">
                    Riwayat aktivitas sistem (`Info`, `Warning`, `Error`), endpoint API, dan kode status HTTP.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-semibold text-gray-600">
                        <th className="p-3">ID Log</th>
                        <th className="p-3">Waktu & User</th>
                        <th className="p-3">Level</th>
                        <th className="p-3">Aksi & Endpoint</th>
                        <th className="p-3">Pesan</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {logList.map((l) => (
                        <tr key={l.id_log} className="transition-colors hover:bg-[#95A87A]/10">
                          <td className="p-3 font-mono font-medium text-gray-500">#{l.id_log}</td>
                          <td className="p-3">
                            <p className="font-mono text-[11px]">{l.waktu}</p>
                            <p className="text-[11px] text-gray-500">
                              User: {l.id_user ? `#${l.id_user}` : "System"}
                            </p>
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadge(
                                l.level,
                              )}`}
                            >
                              {l.level} ({l.kode_status})
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px]">
                            <p className="font-bold text-gray-900">{l.aksi}</p>
                            <p className="text-gray-500">{l.endpoint_api}</p>
                          </td>
                          <td className="p-3">
                            <p>{l.pesan}</p>
                            {l.detail_error && (
                              <p className="mt-0.5 font-mono text-[10px] text-red-600">
                                {l.detail_error}
                              </p>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteLog(l.id_log)}
                              className="rounded-md border border-red-100 bg-red-50 px-2.5 py-1 font-medium text-red-600 hover:bg-red-100"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            
            {activeTab === "profil" && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900">
                  Pengaturan & Update Profil {profile.peranErd}
                </h2>
                <p className="text-xs text-gray-500">
                  Perbarui informasi kontak dan profil akun {profile.peranErd}.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addLog(
                      `UPDATE_PROFIL_${profile.peranErd.toUpperCase()}`,
                      `PUT /api/profil/${profile.slug}`,
                      `Memperbarui data profil ${profile.peranErd}.`,
                    );
                    showToast(`✓ Profil ${profile.peranErd} berhasil disimpan.`);
                  }}
                  className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2"
                >
                  <div>
                    <label className="block font-medium text-gray-700">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={profile.nama_lengkap}
                      onChange={(e) => updateCurrentProfileField("nama_lengkap", e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      required
                      value={profile.email}
                      onChange={(e) => updateCurrentProfileField("email", e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">No. Telepon / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={profile.no_telp}
                      onChange={(e) => updateCurrentProfileField("no_telp", e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Alamat *</label>
                    <input
                      type="text"
                      required
                      value={profile.alamat}
                      onChange={(e) => updateCurrentProfileField("alamat", e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                    />
                  </div>

                  {profile.slug === "petani" && (
                    <>
                      <div>
                        <label className="block font-medium text-gray-700">Tipe Supplier (`Petani` / `Pengepul`)</label>
                        <select
                          value={profile.tipe_supplier}
                          onChange={(e) =>
                            updateCurrentProfileField("tipe_supplier", e.target.value as TipeSupplier)
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        >
                          <option value="Petani">Petani</option>
                          <option value="Pengepul">Pengepul</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700">Luas Lahan (m²)</label>
                        <input
                          type="number"
                          value={profile.luas_lahan_m2}
                          onChange={(e) =>
                            updateCurrentProfileField("luas_lahan_m2", Number(e.target.value))
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700">Jenis Komoditas Utama</label>
                        <input
                          type="text"
                          value={profile.jenis_komoditas_utama}
                          onChange={(e) =>
                            updateCurrentProfileField("jenis_komoditas_utama", e.target.value)
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700">Nama Bank & No. Rekening</label>
                        <input
                          type="text"
                          value={profile.no_rekening}
                          onChange={(e) => updateCurrentProfileField("no_rekening", e.target.value)}
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        />
                      </div>
                    </>
                  )}

                  {profile.slug === "umkm" && (
                    <>
                      <div>
                        <label className="block font-medium text-gray-700">Nama Usaha UMKM</label>
                        <input
                          type="text"
                          value={profile.nama_usaha}
                          onChange={(e) => updateCurrentProfileField("nama_usaha", e.target.value)}
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700">NIB</label>
                        <input
                          type="text"
                          value={profile.nib}
                          onChange={(e) => updateCurrentProfileField("nib", e.target.value)}
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700">Kategori Produk Olahan</label>
                        <input
                          type="text"
                          value={profile.kategori_produk_olahan}
                          onChange={(e) =>
                            updateCurrentProfileField("kategori_produk_olahan", e.target.value)
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700">Kapasitas Produksi Bulanan (Kg)</label>
                        <input
                          type="number"
                          value={profile.kapasitas_produksi_bulanan}
                          onChange={(e) =>
                            updateCurrentProfileField(
                              "kapasitas_produksi_bulanan",
                              Number(e.target.value),
                            )
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        />
                      </div>
                    </>
                  )}

                  {profile.slug === "mitra" && (
                    <>
                      <div>
                        <label className="block font-medium text-gray-700">Nama Mitra Instansi</label>
                        <input
                          type="text"
                          value={profile.nama_mitra_instansi}
                          onChange={(e) =>
                            updateCurrentProfileField("nama_mitra_instansi", e.target.value)
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700">Jenis Pengolahan Limbah</label>
                        <input
                          type="text"
                          value={profile.jenis_pengolahan_limbah}
                          onChange={(e) =>
                            updateCurrentProfileField("jenis_pengolahan_limbah", e.target.value)
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700">Kapasitas Tampung Limbah (Kg)</label>
                        <input
                          type="number"
                          value={profile.kapasitas_tampung_limbah_kg}
                          onChange={(e) =>
                            updateCurrentProfileField(
                              "kapasitas_tampung_limbah_kg",
                              Number(e.target.value),
                            )
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700">Jangkauan Area</label>
                        <input
                          type="text"
                          value={profile.jangkauan_area}
                          onChange={(e) => updateCurrentProfileField("jangkauan_area", e.target.value)}
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        />
                      </div>
                    </>
                  )}

                  {profile.slug === "konsumen" && (
                    <>
                      <div>
                        <label className="block font-medium text-gray-700">Kategori Konsumen (`Ritel` / `Grosir`)</label>
                        <select
                          value={profile.kategori_konsumen}
                          onChange={(e) =>
                            updateCurrentProfileField(
                              "kategori_konsumen",
                              e.target.value as KategoriKonsumenErd,
                            )
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        >
                          <option value="Ritel">Ritel</option>
                          <option value="Grosir">Grosir</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700">Titik Koordinat</label>
                        <input
                          type="text"
                          value={profile.titik_koordinat}
                          onChange={(e) =>
                            updateCurrentProfileField("titik_koordinat", e.target.value)
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-medium text-gray-700">Alamat Pengiriman Utama</label>
                        <input
                          type="text"
                          value={profile.alamat_pengiriman_utama}
                          onChange={(e) =>
                            updateCurrentProfileField("alamat_pengiriman_utama", e.target.value)
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        />
                      </div>
                    </>
                  )}

                  {profile.slug === "admin" && (
                    <>
                      <div>
                        <label className="block font-medium text-gray-700">NIP / ID Pegawai</label>
                        <input
                          type="text"
                          value={profile.nip_id_pegawai}
                          onChange={(e) =>
                            updateCurrentProfileField("nip_id_pegawai", e.target.value)
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700">Tingkat Akses Admin</label>
                        <select
                          value={profile.tingkat_akses}
                          onChange={(e) =>
                            updateCurrentProfileField("tingkat_akses", e.target.value as TingkatAkses)
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        >
                          <option value="Super Admin">Super Admin</option>
                          <option value="Admin Transaksi">Admin Transaksi</option>
                          <option value="Admin Limbah">Admin Limbah</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-medium text-gray-700">Divisi</label>
                        <input
                          type="text"
                          value={profile.divisi}
                          onChange={(e) => updateCurrentProfileField("divisi", e.target.value)}
                          className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#95A87A]/30"
                        />
                      </div>
                    </>
                  )}

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#3D5126] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#273419]"
                    >
                      <EditIcon className="h-4 w-4" />
                      Simpan Perubahan Profil
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        )}

        {inspectPhoto && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in"
            onClick={() => setInspectPhoto(null)}
          >
            <div
              className="relative max-h-[90vh] max-w-3xl w-full overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3.5">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">{inspectPhoto.title}</h3>
                  {inspectPhoto.subtitle && (
                    <p className="text-xs font-mono text-gray-500">{inspectPhoto.subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setInspectPhoto(null)}
                  className="rounded-full p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                  aria-label="Tutup Pratinjau Foto"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[70vh] overflow-auto p-4 bg-gray-900/5 flex items-center justify-center">
                <img
                  src={inspectPhoto.url}
                  alt={inspectPhoto.title}
                  className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-lg border border-gray-200"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-5 py-3 text-xs text-gray-600">
                <span className="text-[11px] text-gray-500">
                  Periksa kejernihan foto lahan/fasilitas dan keterbacaan teks berkas MoU kemitraan.
                </span>
                <button
                  type="button"
                  onClick={() => setInspectPhoto(null)}
                  className="rounded-xl bg-[#3D5126] px-4 py-2 font-bold text-white hover:bg-[#273419] transition-all"
                >
                  Tutup Tampilan
                </button>
              </div>
            </div>
          </div>
        )}

        {rejectModalTarget && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs animate-in fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeRejectModal();
            }}
          >
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-200 space-y-4">
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-extrabold text-red-700">
                    ✕ Tolak & Minta Berkas Ulang
                  </span>
                  <h3 className="mt-1.5 text-base font-extrabold text-gray-900">
                    Keterangan Penolakan Dokumen Mitra
                  </h3>
                  <p className="text-xs text-gray-500">
                    Mitra: <strong>{(rejectModalTarget.extraData?.namaInstansi as string) || rejectModalTarget.namaLengkap}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeRejectModal}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-700">
                  Pilih Alasan Cepat (Template):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Foto buram / tidak terbaca dengan jelas",
                    "Foto fasilitas / lahan tidak sesuai kriteria bio-refinery",
                    "Dokumen MoU kemitraan belum dibubuhi tanda tangan/stempel",
                    "Kapasitas atau jangkauan operasional belum memenuhi standar",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectReason(preset)}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all text-left ${
                        rejectReason === preset
                          ? "border-red-500 bg-red-50 text-red-700 font-bold ring-1 ring-red-400"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Keterangan Lengkap untuk Mitra: *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Contoh: Foto dokumen kerja sama buram pada bagian pasal kesepakatan. Mohon unggah ulang foto yang jelas dengan pencahayaan terang..."
                    className="w-full rounded-xl border border-gray-200 p-3 text-xs placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Catatan ini akan otomatis muncul pada dashboard akun mitra bersangkutan beserta formulir untuk mengirim ulang berkas perbaikan.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={closeRejectModal}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRejectMitra}
                  disabled={!rejectReason.trim()}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 active:scale-95 transition-all"
                >
                  Simpan & Kirim Penolakan
                </button>
              </div>
            </div>
          </div>
        )}

        {isResubmitModalOpen && currentMitraUser && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs animate-in fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsResubmitModalOpen(false);
            }}
          >
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-200 space-y-4">
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-extrabold text-red-700">
                    Perbaikan Dokumen Kemitraan
                  </span>
                  <h3 className="mt-1.5 text-base font-extrabold text-gray-900">
                    Kirim Ulang Foto Berkas Verifikasi
                  </h3>
                  <p className="text-xs text-gray-500">
                    Unggah foto dokumen MoU atau fasilitas lahan yang jelas dan terbaca.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResubmitModalOpen(false)}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {currentMitraUser.alasanPenolakan && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-950">
                  <p className="font-bold text-red-900">Catatan Perbaikan dari Admin:</p>
                  <p className="mt-1 italic text-red-900">&ldquo;{currentMitraUser.alasanPenolakan}&rdquo;</p>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-700">
                  Pilih File Foto Baru (JPG, PNG): *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleResubmitFileChange}
                  className="block w-full text-xs text-gray-500 file:mr-3 file:rounded-xl file:border-0 file:bg-[#3D5126] file:px-3.5 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-[#273419] cursor-pointer"
                />

                {resubmitPreview ? (
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-3 flex items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={resubmitPreview}
                        alt="Pratinjau Berkas Baru"
                        className="h-12 w-12 object-cover rounded-lg border border-emerald-300 shadow-xs shrink-0"
                      />
                      <div className="text-xs min-w-0">
                        <p className="font-bold text-emerald-900 truncate">✓ Foto Siap Dikirim Ulang</p>
                        <p className="text-[11px] text-emerald-700 font-mono truncate max-w-[200px]">
                          {resubmitChosenName || "berkas-baru.jpg"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setResubmitPreview(null);
                        setResubmitChosenName("");
                      }}
                      className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 shrink-0"
                    >
                      Ganti
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-700 font-medium">
                    ⚠️ Silakan pilih file foto dokumen / lahan pengganti yang jelas.
                  </p>
                )}

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-800 mb-2">
                    Panduan Foto: Perbedaan Foto Bagus vs Foto Buram (Ditolak)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50/50 p-2.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[9px] font-extrabold text-[#166534]">
                            <CheckIcon className="h-2.5 w-2.5" /> Bagus (Diterima)
                          </span>
                        </div>
                        <div className="relative overflow-hidden rounded-lg border border-emerald-200 bg-white aspect-16/10 mb-1.5">
                          <img
                            src="/images/limbah/pupuk_kompos.jpg"
                            alt="Foto jernih diterima"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className="text-[10px] text-emerald-900 font-medium leading-tight">
                          ✓ Jernih, fokus tajam &amp; tulisan terbaca jelas.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-rose-300 bg-rose-50/50 p-2.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 border border-rose-300 px-2 py-0.5 text-[9px] font-extrabold text-[#991b1b]">
                            <XMarkIcon className="h-2.5 w-2.5" /> Buram (Ditolak)
                          </span>
                        </div>
                        <div className="relative overflow-hidden rounded-lg border border-rose-200 bg-white aspect-16/10 mb-1.5">
                          <img
                            src="/images/limbah/pupuk_kompos.jpg"
                            alt="Foto buram ditolak"
                            className="h-full w-full object-cover filter blur-[3px] brightness-75 contrast-75"
                          />
                        </div>
                        <p className="text-[10px] text-rose-900 font-medium leading-tight">
                          ✕ Buram, gelap, goyang atau dokumen terpotong.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsResubmitModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!resubmitPreview}
                  onClick={handleConfirmResubmitMitra}
                  className="rounded-xl bg-[#3D5126] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#273419] disabled:opacity-50 active:scale-95 transition-all"
                >
                  Kirim Ulang Dokumen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Pratinjau Kotak Notifikasi Email Pengguna */}
        <KotakEmailModal
          isOpen={isKotakEmailOpen}
          onClose={() => setIsKotakEmailOpen(false)}
          targetEmail={profile.email}
        />
        </div>
      </div>
    </div>
  );
}
