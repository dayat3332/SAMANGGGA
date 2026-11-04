/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FormEvent, JSX } from "react";
import {
  ArrowRightIcon,
  BellIcon,
  BoxesIcon,
  ChartLineIcon,
  CheckBadgeIcon,
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
  type RoleSlug,
} from "@/data/profil";
import { formatNumber, formatRupiah } from "@/lib/format";
import { notifyAuthChange } from "@/components/layout/SiteNavbar";
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
      sublabel: "Halaman Biasa · Pasar Sirkular",
      href: "/pasar-sirkular?role=petani",
    },
    {
      label: "Halaman Fungsi & Beli Sirkular",
      sublabel: "Navbar Atas · Operasional Supplier",
      href: "/fungsi/supplier",
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
    title: "5 Transaksi Jual-Beli lintas role & 3 Limbah Sirkular aktif di platform",
    time: "Monitoring Aktivitas Sistem Platform SAMANGGA",
    buttonLabel: "Kelola Semua Data",
    targetTab: "transaksi",
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

interface ProfilRoleProps {
  fixedRole: RoleSlug;
}

export default function ProfilRole({ fixedRole }: ProfilRoleProps): JSX.Element {
  const currentRole: RoleSlug = fixedRole;
  const availableTabs = ROLE_TABS[currentRole];

  const [activeTab, setActiveTab] = useState<ActiveViewId>("home");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State data
  const [profiles, setProfiles] = useState<Record<RoleSlug, AnyRoleProfile>>(DEFAULT_PROFILES);
  const [penggunaList, setPenggunaList] = useState<Pengguna[]>(() => [...INITIAL_PENGGUNA_LIST]);
  const [produkList, setProdukList] = useState<Produk[]>(() => [...INITIAL_PRODUK_LIST]);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>(() => [...INITIAL_TRANSAKSI_LIST]);
  const [detailTransaksiList, setDetailTransaksiList] = useState<DetailTransaksi[]>(() => [
    ...INITIAL_DETAIL_TRANSAKSI_LIST,
  ]);
  const [pembayaranList, setPembayaranList] = useState<Pembayaran[]>(() => [...INITIAL_PEMBAYARAN_LIST]);
  const [limbahList, setLimbahList] = useState<Limbah[]>(() => [...INITIAL_LIMBAH_LIST]);
  const [pengirimanList, setPengirimanList] = useState<RiwayatPengiriman[]>(() => [
    ...INITIAL_RIWAYAT_PENGIRIMAN_LIST,
  ]);
  const [keuanganList, setKeuanganList] = useState<PencatatanKeuangan[]>(() => [...INITIAL_KEUANGAN_LIST]);
  const [logList, setLogList] = useState<LogSistem[]>(() => [...INITIAL_LOG_SISTEM_LIST]);

  const profile = profiles[currentRole];

  const showToast = (msg: string): void => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const addLog = (aksi: string, endpoint: string, pesan: string, level: LevelLog = "Info"): void => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    setLogList((prev) => [
      {
        id_log: prev.reduce((m, x) => Math.max(m, x.id_log), 9900) + 1,
        id_user: profile.id_user,
        level,
        aksi,
        endpoint_api: endpoint,
        kode_status: 200,
        pesan,
        detail_error: null,
        waktu: now,
      },
      ...prev,
    ]);
  };

  const getUserName = (idUser: number): string => {
    const u = penggunaList.find((x) => x.id_user === idUser);
    return u ? u.nama_lengkap : `User #${idUser}`;
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
      gambar: "/images/mangga/mangga_gincu.jpg",
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
    if (editingProdukId !== null) {
      setProdukList((prev) =>
        prev.map((p) => (p.id_produk === editingProdukId ? { ...p, ...formProduk } : p)),
      );
      addLog("UPDATE_PRODUK", `PUT /api/produk/${editingProdukId}`, `Memperbarui produk #${editingProdukId} (${formProduk.nama_produk}).`);
      showToast(`✓ Produk #${editingProdukId} (${formProduk.nama_produk}) berhasil diperbarui.`);
    } else {
      const nextId = produkList.reduce((max, p) => Math.max(max, p.id_produk), 2000) + 1;
      const newRow: Produk = {
        id_produk: nextId,
        id_user: profile.id_user,
        ...formProduk,
      };
      setProdukList((prev) => [newRow, ...prev]);
      addLog("CREATE_PRODUK", "POST /api/produk", `Menambahkan produk baru #${nextId} (${formProduk.nama_produk}).`);
      showToast(`✓ Produk baru #${nextId} (${formProduk.nama_produk}) berhasil ditambahkan.`);
    }
    setIsProdukFormOpen(false);
    setEditingProdukId(null);
  };

  const handleDeleteProduk = (idProduk: number): void => {
    const target = produkList.find((p) => p.id_produk === idProduk);
    setProdukList((prev) => prev.filter((p) => p.id_produk !== idProduk));
    addLog("DELETE_PRODUK", `DELETE /api/produk/${idProduk}`, `Menghapus produk #${idProduk} (${target?.nama_produk ?? ""}).`, "Warning");
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
      lokasi_penjemputan: "Dapur Produksi UMKM Bu Ning, Indramayu",
      titik_koordinat: "-6.327510, 108.324900",
      foto_limbah: "limbah_kulit_baru.jpg",
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
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    if (editingLimbahId !== null) {
      setLimbahList((prev) =>
        prev.map((l) =>
          l.id_limbah === editingLimbahId
            ? {
                ...l,
                ...formLimbah,
                tgl_jemput:
                  formLimbah.status_jemput === "Proses" || formLimbah.status_jemput === "Selesai"
                    ? l.tgl_jemput ?? now
                    : l.tgl_jemput,
              }
            : l,
        ),
      );
      addLog("UPDATE_LIMBAH", `PUT /api/limbah/${editingLimbahId}`, `Memperbarui data Limbah #${editingLimbahId} (${formLimbah.jenis_limbah}, status: ${formLimbah.status_jemput}).`);
      showToast(`✓ Data Limbah #${editingLimbahId} berhasil diperbarui.`);
    } else {
      const nextId = limbahList.reduce((max, l) => Math.max(max, l.id_limbah), 3000) + 1;
      const newRow: Limbah = {
        id_limbah: nextId,
        id_umkm: 12,
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
        tgl_jemput: null,
        status_verifikasi: formLimbah.status_verifikasi,
        tgl_input: now,
      };
      setLimbahList((prev) => [newRow, ...prev]);
      addLog("CREATE_LIMBAH", "POST /api/limbah", `Menambahkan data Limbah #${nextId} (${formLimbah.jenis_limbah}, ${formLimbah.berat_kg} kg).`);
      showToast(`✓ Data Limbah baru #${nextId} berhasil ditambahkan.`);
    }
    setIsLimbahFormOpen(false);
    setEditingLimbahId(null);
  };

  const handleDeleteLimbah = (idLimbah: number): void => {
    setLimbahList((prev) => prev.filter((l) => l.id_limbah !== idLimbah));
    addLog("DELETE_LIMBAH", `DELETE /api/limbah/${idLimbah}`, `Menghapus data Limbah #${idLimbah}.`, "Warning");
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

  const handleDeletePengguna = (idUser: number): void => {
    setPenggunaList((prev) => prev.filter((u) => u.id_user !== idUser));
    showToast(`✓ Pengguna #${idUser} berhasil dihapus.`);
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900">
      <div className="mx-auto flex min-h-screen w-full flex-col lg:flex-row">
        {/* Sidebar Kiri (gaya panel admin putih) */}
        <aside
          aria-label="Navbar Kiri Dashboard CRUD"
          className="flex w-full shrink-0 flex-col justify-between border-b border-gray-200 bg-white px-4 py-5 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:overflow-y-auto lg:border-b-0 lg:border-r"
        >
          <div className="space-y-6">
            {/* Brand */}
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

            {/* Info Akun Pengguna */}
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
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSearchQuery("");
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                        isAct
                          ? "bg-[#95A87A]/25 text-[#273419] font-bold shadow-xs"
                          : "text-gray-600 hover:bg-gray-50 hover:text-[#273419]"
                      }`}
                    >
                      <span className={isAct ? "text-[#3D5126]" : "text-gray-400"}>
                        {getTabSidebarIcon(tab.id, "h-4 w-4 shrink-0")}
                      </span>
                      <span className="truncate">{tab.label}</span>
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
            {/* Kartu promo (gaya "Upgrade to Pro") */}
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

            {/* Profil singkat & logout */}
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

        {/* Area Konten Utama */}
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

          
          {activeTab === "home" && (
            <section aria-label="Ringkasan Dashboard Ekosistem" className="space-y-6">
              {/* Judul Halaman */}
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Dashboard</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Kelola aktivitas, transaksi, dan data operasional akun {profile.peranErd} Anda.
                  </p>
                </div>
              </div>

              {/* Baris Kartu Ringkasan Penjualan & Pembelian Akun */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#95A87A]/20 text-[#3D5126]">
                        <ReceiptIcon className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-medium text-gray-500">
                        {currentRole === "konsumen"
                          ? "Pesanan Saya"
                          : "Hasil Penjualan"}
                      </span>
                    </div>
                    <span className="text-gray-300">•••</span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-gray-900">
                    {currentRole === "konsumen"
                      ? formatRupiah(totalNominalBeli)
                      : formatRupiah(totalNominalJual)}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {currentRole === "petani" &&
                      `${penjualanRole.length} pesanan mangga dari UMKM & Konsumen`}
                    {currentRole === "umkm" &&
                      `${penjualanRole.length} pesanan olahan dari Konsumen`}
                    {currentRole === "mitra" &&
                      `${penjualanRole.length} pesanan pupuk & bibit dari Petani`}
                    {currentRole === "konsumen" &&
                      `${pembelianRole.length} transaksi belanja buah & olahan`}
                    {currentRole === "admin" &&
                      `${transaksiList.length} total transaksi platform`}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <CreditCardIcon className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-medium text-gray-500">
                        {currentRole === "konsumen"
                          ? "Metode Bayar Aktif"
                          : "Pembelian"}
                      </span>
                    </div>
                    <span className="text-gray-300">•••</span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-gray-900">
                    {currentRole === "konsumen"
                      ? `${pembayaranList.filter((p) => p.status_pembayaran === "Berhasil").length} Lunas`
                      : formatRupiah(totalNominalBeli)}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {currentRole === "petani" &&
                      `${pembelianRole.length} pembelian pupuk & bibit dari Mitra`}
                    {currentRole === "umkm" &&
                      `${pembelianRole.length} pembelian mangga segar dari Supplier`}
                    {currentRole === "mitra" &&
                      `${limbahList.filter((l) => l.id_mitra === 3).length} batch limbah dibeli dari UMKM`}
                    {currentRole === "konsumen" &&
                      "Pembayaran via QRIS, Virtual Account & Transfer"}
                    {currentRole === "admin" &&
                      `${pembayaranList.length} riwayat Pembayaran`}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        {currentRole === "umkm" || currentRole === "mitra" ? (
                          <RecycleIcon className="h-5 w-5" />
                        ) : (
                          <BoxesIcon className="h-5 w-5" />
                        )}
                      </span>
                      <span className="text-xs font-medium text-gray-500">
                        {currentRole === "umkm" || currentRole === "mitra"
                          ? "Volume Limbah Sirkular"
                          : "Stok & Pengiriman"}
                      </span>
                    </div>
                    <span className="text-gray-300">•••</span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-gray-900">
                    {currentRole === "umkm" || currentRole === "mitra"
                      ? `${formatNumber(totalBeratLimbahKg)} Kg`
                      : `${displayedProduk.length} Komoditas`}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {currentRole === "petani" && "Komoditas buah mangga siap jual"}
                    {currentRole === "umkm" && "Kulit, biji & buah afkir tercatat"}
                    {currentRole === "mitra" && "Total limbah siap olah jadi pupuk/bibit"}
                    {currentRole === "konsumen" &&
                      `${pengirimanList.length} resi pengiriman tercatat`}
                    {currentRole === "admin" &&
                      `${produkList.length} produk & ${limbahList.length} batch limbah`}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <ShoppingBagIcon className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-medium text-gray-500">Belanja Produk</span>
                    </div>
                    <span className="text-gray-300">•••</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-snug text-gray-900">
                    {halamanBeliLinks[0]?.label}
                  </p>
                  <Link
                    href={primaryBeliHref}
                    className="mt-2 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    <span>Buka Halaman</span>
                    <ArrowRightIcon className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              
              <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
                
                <div className="space-y-6 lg:col-span-5">
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">
                          Today Task ({roleTasks.length})
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          Agenda operasional pesanan role {profile.peranErd}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddingTask(true)}
                        title="Tambah Tugas Baru"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#3D5126] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#273419] transition-colors"
                      >
                        <span>+</span>
                        <span>Tambah</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {roleTasks.map((task) => (
                        <label
                          key={task.id}
                          className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 transition-colors hover:bg-[#95A87A]/10"
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={task.done}
                              onChange={() => handleToggleTask(task.id)}
                              className="h-4 w-4 rounded border-gray-300 accent-[#3D5126]"
                            />
                            <span
                              className={`text-xs font-semibold ${
                                task.done ? "line-through text-gray-400" : "text-gray-900"
                              }`}
                            >
                              {task.title}
                            </span>
                          </span>
                          <span className="shrink-0 text-[10px] font-medium text-gray-400">
                            {task.time}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                
                <div className="space-y-6 lg:col-span-7">
                  {/* Notification Card (Dengan Tombol Kuning & Lingkaran Konsentris di Kanan Bawah) */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900">Notification</h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab(roleNotif.targetTab)}
                        className="text-xs font-semibold text-[#3D5126] hover:underline"
                      >
                        View all
                      </button>
                    </div>

                    <div className="relative mt-3 overflow-hidden rounded-xl bg-gradient-to-r from-[#3D5126] to-[#273419] p-5 text-white shadow-md">
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-8 -bottom-10 h-32 w-32 rounded-full border border-white/15"
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-4 -bottom-6 h-24 w-24 rounded-full border border-white/20"
                      />

                      <div className="relative z-10 flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                          <EditIcon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold leading-snug">{roleNotif.title}</p>
                          <p className="text-[11px] text-white/75">{roleNotif.time}</p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setActiveTab(roleNotif.targetTab)}
                              className="rounded-lg bg-[#FFB81C] px-4 py-1.5 text-[11px] font-bold text-[#273419] shadow-sm transition-colors hover:bg-[#FFE39A]"
                            >
                              {roleNotif.buttonLabel}
                            </button>
                            {currentRole !== "admin" && (
                              <Link
                                href={primaryBeliHref}
                                className="rounded-xl border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-white/20"
                              >
                                {halamanBeliLinks[0]?.label} →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Data Spesifik Hasil Konsumen / Aktivitas Jual & Beli Role */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">
                          Aktivitas Transaksi ({profile.peranErd})
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          Rincian transaksi riil penjualan dan pembelian akun Anda
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActivityFilter("semua")}
                          className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
                            activityFilter === "semua"
                              ? "border-[#3D5126] bg-[#3D5126] text-white shadow-xs"
                              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          Semua
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivityFilter("jual")}
                          className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
                            activityFilter === "jual"
                              ? "border-[#3D5126] bg-[#3D5126] text-white shadow-xs"
                              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          Penjualan ({penjualanRole.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivityFilter("beli")}
                          className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
                            activityFilter === "beli"
                              ? "border-[#3D5126] bg-[#3D5126] text-white shadow-xs"
                              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          Pembelian ({pembelianRole.length})
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2.5">
                      <div className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
                        {filteredHomeTransactions.map((trx) => {
                          const isSeller = trx.id_penjual === profile.id_user;
                          const items = detailTransaksiList.filter(
                            (d) => d.id_transaksi === trx.id_transaksi,
                          );
                          const pay = pembayaranList.find(
                            (p) => p.id_transaksi === trx.id_transaksi,
                          );
                          return (
                            <div
                              key={trx.id_transaksi}
                              className="flex flex-col justify-between gap-2 rounded-lg border border-gray-100 bg-white p-3.5 transition-colors hover:bg-[#95A87A]/10 sm:flex-row sm:items-center"
                            >
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span
                                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                      isSeller
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-[#FFB81C]/25 text-[#273419]"
                                    }`}
                                  >
                                    {isSeller ? "PENJUALAN (Masuk)" : "PEMBELIAN (Keluar)"}
                                  </span>
                                  <span className="font-mono text-xs font-bold text-gray-900">
                                    #{trx.id_transaksi}
                                  </span>
                                  <span className="text-[11px] text-gray-400">
                                    {trx.tgl_transaksi}
                                  </span>
                                </div>

                                <p className="text-xs font-bold text-gray-900">
                                  {items
                                    .map((d) => {
                                      const pr = produkList.find((p) => p.id_produk === d.id_produk);
                                      return `${pr?.nama_produk ?? `Produk #${d.id_produk}`} (${d.jumlah_produk} ${pr?.satuan ?? "unit"})`;
                                    })
                                    .join(", ")}
                                </p>

                                <p className="text-[11px] text-gray-600">
                                  Pembeli: <strong>{getUserName(trx.id_pembeli)}</strong> · Penjual:{" "}
                                  <strong>{getUserName(trx.id_penjual)}</strong>
                                </p>
                              </div>

                              <div className="flex shrink-0 flex-row items-center justify-between gap-2 sm:flex-col sm:items-end">
                                <p className="text-xs font-bold text-gray-900">
                                  {formatRupiah(trx.total_harga)}
                                </p>
                                <div className="flex items-center gap-1.5">
                                  {pay && (
                                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700">
                                      {pay.metode_pembayaran}
                                    </span>
                                  )}
                                  <span
                                    className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadge(
                                      trx.status,
                                    )}`}
                                  >
                                    {trx.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pintasan Bawah ke Halaman Biasa Buat Beli */}
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-2.5">
                        <span className="text-xs font-semibold text-gray-900">
                          Ingin melakukan transaksi pembelian baru di halaman biasa?
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {halamanBeliLinks.slice(0, 2).map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              className="inline-flex items-center gap-1 rounded-xl bg-[#3D5126] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#273419]"
                            >
                              <span>{link.label}</span>
                              <ArrowRightIcon className="h-3 w-3" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
              {/* Header Tabel & Breadcrumb */}
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

                {/* Tombol Aksi Utama */}
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

              {/* Pill Tab Switcher & Pencarian */}
              <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                <div className="flex flex-wrap gap-2">
                  {availableTabs.map((tab) => {
                    const isAct = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSearchQuery("");
                        }}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                          isAct
                            ? "border-[#3D5126] bg-[#3D5126] text-white shadow-xs"
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {activeTab !== "profil" && (
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

                            {/* Preview Produk Terpilih */}
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
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Data Pengguna
                  </h2>
                  <p className="text-xs text-gray-500">
                    Kelola seluruh akun pengguna platform: tambah pengguna, ubah peran/status verifikasi, atau hapus akun.
                  </p>
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
                      {penggunaList.map((u) => (
                        <tr key={u.id_user} className="transition-colors hover:bg-[#95A87A]/10">
                          <td className="p-3 font-mono font-medium text-gray-500">#{u.id_user}</td>
                          <td className="p-3">
                            <p className="font-bold text-gray-900">{u.nama_lengkap}</p>
                            <p className="text-[11px] text-gray-500">{u.alamat}</p>
                          </td>
                          <td className="p-3 font-bold">{u.peran}</td>
                          <td className="p-3">
                            <p>{u.email}</p>
                            <p className="text-[11px] text-gray-500">{u.no_telp}</p>
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
                                onClick={() => handleDeletePengguna(u.id_user)}
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
        </div>
      </div>
    </div>
  );
}
