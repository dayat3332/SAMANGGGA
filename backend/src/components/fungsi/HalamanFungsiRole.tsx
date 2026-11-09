"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent, JSX } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Navbar } from "@/components/layout/SiteNavbar";
import {
  ArrowRightIcon,
  CheckBadgeIcon,
  CheckIcon,
  FactoryIcon,
  MapPinIcon,
  RecycleIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SproutIcon,
  TruckIcon,
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
  type RoleSlug,
} from "@/data/profil";
import { formatRupiah } from "@/lib/format";
import type {
  DetailTransaksi,
  JenisKompensasi,
  JenisLimbahErd,
  LevelLog,
  Limbah,
  LogSistem,
  MetodePembayaran,
  Pembayaran,
  PencatatanKeuangan,
  Pengguna,
  Produk,
  RiwayatPengiriman,
  StatusJemput,
  StatusPengiriman,
  StatusVerifikasi,
  TingkatAkses,
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

interface HalamanFungsiRoleProps {
  fixedRole: RoleSlug;
}

export default function HalamanFungsiRole({ fixedRole }: HalamanFungsiRoleProps): JSX.Element {
  const currentRole = fixedRole;
  const profile = DEFAULT_PROFILES[currentRole];

  const [banner, setBanner] = useState<string | null>(null);

  // Shared relational states for functional workflows
  const [penggunaList, setPenggunaList] = useState<Pengguna[]>(() => [...INITIAL_PENGGUNA_LIST]);
  const [produkList, setProdukList] = useState<Produk[]>(() => [...INITIAL_PRODUK_LIST]);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>(() => [...INITIAL_TRANSAKSI_LIST]);
  const [detailList, setDetailList] = useState<DetailTransaksi[]>(() => [
    ...INITIAL_DETAIL_TRANSAKSI_LIST,
  ]);
  const [pembayaranList, setPembayaranList] = useState<Pembayaran[]>(() => [...INITIAL_PEMBAYARAN_LIST]);
  const [limbahList, setLimbahList] = useState<Limbah[]>(() => [...INITIAL_LIMBAH_LIST]);
  const [pengirimanList, setPengirimanList] = useState<RiwayatPengiriman[]>(() => [
    ...INITIAL_RIWAYAT_PENGIRIMAN_LIST,
  ]);
  const [keuanganList, setKeuanganList] = useState<PencatatanKeuangan[]>(() => [...INITIAL_KEUANGAN_LIST]);
  const [logList, setLogList] = useState<LogSistem[]>(() => [...INITIAL_LOG_SISTEM_LIST]);

  // Supplier Functional State: Pasang Panen Baru
  const [panenNama, setPanenNama] = useState<string>("");
  const [panenHarga, setPanenHarga] = useState<number>(1350000);
  const [panenStok, setPanenStok] = useState<number>(35);
  const [panenSatuan, setPanenSatuan] = useState<string>("Kwintal");
  const [panenDeskripsi, setPanenDeskripsi] = useState<string>("");

  // UMKM Functional State: Setor Limbah & Beli Bahan Baku
  const [setorJenis, setSetorJenis] = useState<JenisLimbahErd>("Kulit");
  const [setorBerat, setSetorBerat] = useState<number>(150);
  const [setorKompensasi, setSetorKompensasi] = useState<JenisKompensasi>("Jual Beli");
  const [setorEstimasi, setSetorEstimasi] = useState<number>(150000);
  const [setorLokasi, setSetorLokasi] = useState<string>(
    "Dapur Produksi UMKM Bu Ning, Jl. Raya Sindang No. 45, Indramayu",
  );
  const [setorKoordinat, setSetorKoordinat] = useState<string>("-6.327510, 108.324900");

  // Konsumen Functional State: Checkout Belanja Produk
  const [selectedProdukId, setSelectedProdukId] = useState<number>(1001);
  const [orderQty, setOrderQty] = useState<number>(2);
  const [orderMetode, setOrderMetode] = useState<MetodePembayaran>("QRIS");
  const [orderBukti, setOrderBukti] = useState<string>("bukti_transfer_konsumen.jpg");

  // Admin Functional State: Tingkat Akses
  const [tingkatAkses, setTingkatAkses] = useState<TingkatAkses>("Super Admin");
  const [filterLog, setFilterLog] = useState<"Semua" | LevelLog>("Semua");

  const notify = (msg: string): void => {
    setBanner(msg);
    setTimeout(() => {
      setBanner((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const getUserName = (idUser: number): string => {
    const found = penggunaList.find((u) => u.id_user === idUser);
    return found ? found.nama_lengkap : `Pengguna #${idUser}`;
  };

  const handleSupplierPasangPanen = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!panenNama.trim()) return;
    const nextId = produkList.reduce((max, p) => Math.max(max, p.id_produk), 2000) + 1;
    const created: Produk = {
      id_produk: nextId,
      id_user: 101,
      nama_produk: panenNama.trim(),
      kategori: "Buah",
      harga: panenHarga,
      stok: panenStok,
      satuan: panenSatuan,
      deskripsi:
        panenDeskripsi.trim() || "Hasil panen kebun mangga Indramayu siap kirim ke UMKM & Konsumen.",
      gambar: "/images/mangga/mangga_gincu.jpg",
      status_verifikasi: "Menunggu",
    };
    setProdukList((prev) => [created, ...prev]);
    setPanenNama("");
    setPanenDeskripsi("");
    notify(`✓ Hasil panen "${created.nama_produk}" berhasil diajukan ke Katalog (Status: Menunggu Verifikasi Admin).`);
  };

  // Konfirmasi transfer manual
  const handleKonfirmasiTransferManual = (idTransaksi: number): void => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const trx = transaksiList.find((t) => t.id_transaksi === idTransaksi);
    if (!trx) return;

    setPembayaranList((prev) =>
      prev.map((p) =>
        p.id_transaksi === idTransaksi
          ? { ...p, status_pembayaran: "Berhasil", tgl_bayar: p.tgl_bayar ?? now }
          : p,
      ),
    );
    setTransaksiList((prev) =>
      prev.map((t) => (t.id_transaksi === idTransaksi ? { ...t, status: "Diproses" } : t)),
    );
    setKeuanganList((prev) => [
      {
        id_keuangan: prev.reduce((m, k) => Math.max(m, k.id_keuangan), 6000) + 1,
        id_user: trx.id_penjual,
        id_transaksi: idTransaksi,
        id_limbah: null,
        tgl_pencatatan: now,
        jenis_transaksi: "Pemasukan",
        jumlah_uang: trx.total_harga,
        keterangan: `Penerimaan pembayaran Transfer Manual pesanan #${idTransaksi}`,
      },
      ...prev,
    ]);
    notify(`✓ Bukti Transfer Manual pesanan #${idTransaksi} telah dikonfirmasi! Pesanan kini Diproses & tercatat di Buku Kas.`);
  };

  // Setor limbah UMKM
  const handleUmkmSetorLimbah = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const nextId = limbahList.reduce((max, l) => Math.max(max, l.id_limbah), 3000) + 1;
    const created: Limbah = {
      id_limbah: nextId,
      id_umkm: 12,
      id_mitra: null,
      jenis_limbah: setorJenis,
      berat_kg: setorBerat,
      estimasi_harga: setorKompensasi === "Gratis" ? 0 : setorEstimasi,
      jenis_kompensasi: setorKompensasi,
      harga_kesepakatan: setorKompensasi === "Gratis" ? 0 : null,
      lokasi_penjemputan: setorLokasi,
      titik_koordinat: setorKoordinat,
      foto_limbah: `limbah_${setorJenis.toLowerCase()}_${nextId}.jpg`,
      status_jemput: "Tersedia",
      tgl_jemput: null,
      status_verifikasi: "Menunggu",
      tgl_input: now,
    };
    setLimbahList((prev) => [created, ...prev]);
    notify(`✓ Batch Limbah #${nextId} (${setorJenis} · ${setorBerat} kg · ${setorKompensasi}) berhasil didaftarkan ke Pasar Sirkular!`);
  };

  // Pengadaan bahan baku
  const handleUmkmBeliBahanBaku = (prod: Produk, qty: number): void => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const nextTrxId = transaksiList.reduce((max, t) => Math.max(max, t.id_transaksi), 5000) + 1;
    const total = prod.harga * qty;

    setTransaksiList((prev) => [
      {
        id_transaksi: nextTrxId,
        id_pembeli: 202,
        id_penjual: prod.id_user,
        tgl_transaksi: now,
        total_harga: total,
        status: "Diproses",
      },
      ...prev,
    ]);
    setDetailList((prev) => [
      {
        id_detail_transaksi: prev.reduce((m, d) => Math.max(m, d.id_detail_transaksi), 9000) + 1,
        id_transaksi: nextTrxId,
        id_produk: prod.id_produk,
        jumlah_produk: qty,
        harga_satuan: prod.harga,
        subtotal_harga: total,
      },
      ...prev,
    ]);
    setPembayaranList((prev) => [
      {
        id_pembayaran: prev.reduce((m, p) => Math.max(m, p.id_pembayaran), 7000) + 1,
        id_transaksi: nextTrxId,
        metode_pembayaran: "Virtual Account",
        jumlah_bayar: total,
        status_pembayaran: "Berhasil",
        id_referensi_gateway: `GW-VA-${nextTrxId}`,
        kode_pembayaran: `88012026${nextTrxId}`,
        bukti_transfer: null,
        batas_waktu_bayar: "2026-11-06 23:59:00",
        tgl_bayar: now,
      },
      ...prev,
    ]);
    notify(`✓ Pengadaan bahan baku ${qty} ${prod.satuan} "${prod.nama_produk}" (Transaksi #${nextTrxId}) berhasil dibuat!`);
  };

  // 4b. Fungsi Supplier: Beli Pupuk Kompos & Bibit Pohon dari Mitra (Ekonomi Sirkular)
  const handleSupplierBeliSirkular = (prod: Produk, qty: number): void => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const nextTrxId = transaksiList.reduce((max, t) => Math.max(max, t.id_transaksi), 5000) + 1;
    const total = prod.harga * qty;

    setTransaksiList((prev) => [
      {
        id_transaksi: nextTrxId,
        id_pembeli: 101,
        id_penjual: prod.id_user,
        tgl_transaksi: now,
        total_harga: total,
        status: "Selesai",
      },
      ...prev,
    ]);
    setDetailList((prev) => [
      {
        id_detail_transaksi: prev.reduce((m, d) => Math.max(m, d.id_detail_transaksi), 9000) + 1,
        id_transaksi: nextTrxId,
        id_produk: prod.id_produk,
        jumlah_produk: qty,
        harga_satuan: prod.harga,
        subtotal_harga: total,
      },
      ...prev,
    ]);
    setPembayaranList((prev) => [
      {
        id_pembayaran: prev.reduce((m, p) => Math.max(m, p.id_pembayaran), 7000) + 1,
        id_transaksi: nextTrxId,
        metode_pembayaran: "QRIS",
        jumlah_bayar: total,
        status_pembayaran: "Berhasil",
        id_referensi_gateway: `GW-QRIS-SIRKULAR-${nextTrxId}`,
        kode_pembayaran: `QRIS-PUPUK-${nextTrxId}`,
        bukti_transfer: null,
        batas_waktu_bayar: "2026-11-06 23:59:00",
        tgl_bayar: now,
      },
      ...prev,
    ]);
    notify(
      `✓ Pembelian sirkular ${qty} ${prod.satuan} "${prod.nama_produk}" dari Mitra (Transaksi #${nextTrxId}) berhasil!`,
    );
  };

  // Penjemputan limbah
  const handleMitraTahapJemput = (idLimbah: number, nextStatus: StatusJemput): void => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const target = limbahList.find((l) => l.id_limbah === idLimbah);
    if (!target) return;

    setLimbahList((prev) =>
      prev.map((l) =>
        l.id_limbah === idLimbah
          ? {
              ...l,
              id_mitra: 3,
              harga_kesepakatan: l.harga_kesepakatan ?? l.estimasi_harga,
              status_jemput: nextStatus,
              tgl_jemput: nextStatus === "Proses" || nextStatus === "Selesai" ? now : l.tgl_jemput,
            }
          : l,
      ),
    );

    if (nextStatus === "Selesai" && target.jenis_kompensasi !== "Gratis") {
      const nominal = target.harga_kesepakatan ?? target.estimasi_harga;
      setKeuanganList((prev) => [
        {
          id_keuangan: prev.reduce((m, k) => Math.max(m, k.id_keuangan), 6000) + 1,
          id_user: 303,
          id_transaksi: null,
          id_limbah: idLimbah,
          tgl_pencatatan: now,
          jenis_transaksi: target.jenis_kompensasi === "Jual Beli" ? "Pengeluaran" : "Pemasukan",
          jumlah_uang: nominal,
          keterangan: `Penyelesaian penjemputan Limbah #${idLimbah} (${target.jenis_limbah} ${target.berat_kg} kg - ${target.jenis_kompensasi})`,
        },
        ...prev,
      ]);
    }
    notify(`✓ Status penjemputan Limbah #${idLimbah} diperbarui menjadi "${nextStatus}".`);
  };

  const handleUpdateTahapPengiriman = (idPengiriman: number, nextStatus: StatusPengiriman): void => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const ship = pengirimanList.find((s) => s.id_pengiriman === idPengiriman);
    if (!ship) return;

    setPengirimanList((prev) =>
      prev.map((s) =>
        s.id_pengiriman === idPengiriman
          ? {
              ...s,
              id_mitra: 3,
              status_pengiriman: nextStatus,
              tgl_diterima: nextStatus === "Tiba di Lokasi" ? now : s.tgl_diterima,
            }
          : s,
      ),
    );
    if (nextStatus === "Tiba di Lokasi") {
      setTransaksiList((prev) =>
        prev.map((t) => (t.id_transaksi === ship.id_transaksi ? { ...t, status: "Selesai" } : t)),
      );
    }
    notify(`✓ Status Pengiriman Resi ${ship.no_resi_lacak} diperbarui ke "${nextStatus}".`);
  };

  // Checkout pesanan konsumen
  const handleKonsumenCheckout = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const prod = produkList.find((p) => p.id_produk === selectedProdukId) ?? produkList[0];
    if (!prod) {
      notify("Belum ada produk yang tersedia untuk dipesan.");
      return;
    }
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const nextTrxId = transaksiList.reduce((max, t) => Math.max(max, t.id_transaksi), 5000) + 1;
    const subtotal = prod.harga * orderQty;
    const isManual = orderMetode === "Transfer Manual";

    setTransaksiList((prev) => [
      {
        id_transaksi: nextTrxId,
        id_pembeli: 404,
        id_penjual: prod.id_user,
        tgl_transaksi: now,
        total_harga: subtotal,
        status: isManual ? "Pending" : "Diproses",
      },
      ...prev,
    ]);
    setDetailList((prev) => [
      {
        id_detail_transaksi: prev.reduce((m, d) => Math.max(m, d.id_detail_transaksi), 9000) + 1,
        id_transaksi: nextTrxId,
        id_produk: prod.id_produk,
        jumlah_produk: orderQty,
        harga_satuan: prod.harga,
        subtotal_harga: subtotal,
      },
      ...prev,
    ]);
    setPembayaranList((prev) => [
      {
        id_pembayaran: prev.reduce((m, p) => Math.max(m, p.id_pembayaran), 7000) + 1,
        id_transaksi: nextTrxId,
        metode_pembayaran: orderMetode,
        jumlah_bayar: subtotal,
        status_pembayaran: isManual ? "Menunggu" : "Berhasil",
        id_referensi_gateway: isManual ? null : `GW-${orderMetode.replace(" ", "")}-${nextTrxId}`,
        kode_pembayaran: isManual ? null : `PAY-${nextTrxId}-2026`,
        bukti_transfer: isManual ? orderBukti : null,
        batas_waktu_bayar: "2026-11-06 23:59:00",
        tgl_bayar: now,
      },
      ...prev,
    ]);
    setPengirimanList((prev) => [
      {
        id_pengiriman: prev.reduce((m, s) => Math.max(m, s.id_pengiriman), 8000) + 1,
        id_transaksi: nextTrxId,
        id_mitra: 3,
        tgl_pengiriman: now,
        no_resi_lacak: `RESI-SMG-2026-${nextTrxId}`,
        status_pengiriman: "Diproses",
        tgl_diterima: null,
      },
      ...prev,
    ]);
    notify(
      `✓ Pesanan #${nextTrxId} (${orderQty} ${prod.satuan} ${prod.nama_produk}) berhasil dibuat dengan metode ${orderMetode}!`,
    );
  };

  // Moderasi admin
  const handleVerifikasi = (
    tipe: "pengguna" | "produk" | "limbah",
    id: number,
    status: StatusVerifikasi,
  ): void => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    if (tipe === "pengguna") {
      setPenggunaList((prev) =>
        prev.map((u) => (u.id_user === id ? { ...u, status_verifikasi: status } : u)),
      );
    } else if (tipe === "produk") {
      setProdukList((prev) =>
        prev.map((p) => (p.id_produk === id ? { ...p, status_verifikasi: status } : p)),
      );
    } else {
      setLimbahList((prev) =>
        prev.map((l) => (l.id_limbah === id ? { ...l, status_verifikasi: status } : l)),
      );
    }
    setLogList((prev) => [
      {
        id_log: prev.reduce((m, l) => Math.max(m, l.id_log), 9900) + 1,
        id_user: 505,
        level: status === "Ditolak" ? "Warning" : "Info",
        aksi: `MODERASI_${tipe.toUpperCase()}_${status.toUpperCase()}`,
        endpoint_api: `PATCH /api/admin/${tipe}/${id}`,
        kode_status: 200,
        pesan: `Admin (${tingkatAkses}) mengubah status verifikasi ${tipe} #${id} menjadi ${status}.`,
        detail_error: null,
        waktu: now,
      },
      ...prev,
    ]);
    notify(`✓ Status verifikasi ${tipe} #${id} berhasil diubah menjadi "${status}".`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#273419]">
      <Navbar />

      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3D5126] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-2xs">
              {getRoleIcon(currentRole, "h-3.5 w-3.5")}
              <span>Akun 1 Role: {profile.peranErd}</span>
            </span>
            <Link
              href={`/katalog?role=${currentRole}`}
              className="rounded-full border border-gray-200 bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#273419] hover:border-[#3D5126]"
            >
              🛒 Katalog Belanja
            </Link>
            <Link
              href={`/pasar-sirkular?role=${currentRole}`}
              className="rounded-full border border-gray-200 bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#273419] hover:border-[#3D5126]"
            >
              🌱 Pasar Sirkular (Pupuk, Bibit & Limbah)
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/profil/${currentRole}`}
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#3D5126] bg-white px-4 py-1.5 text-xs font-extrabold text-[#3D5126] transition-colors hover:bg-[#3D5126] hover:text-white"
            >
              <span>Buka Dashboard & CRUD (Navbar Kiri)</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
            >
              Keluar
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="mb-8 rounded-3xl bg-gradient-to-br from-[#384A23] via-[#2D3B1C] to-[#1E2813] p-6 text-white shadow-md sm:p-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-[#95A87A] backdrop-blur-sm">
                {getRoleIcon(currentRole, "h-4 w-4 text-white")}
                <span className="text-white">
                  Halaman Fungsi Operasional · Role: {profile.peranErd} (Navbar di Atas)
                </span>
              </div>
              <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Layanan & Alur Kerja {profile.roleTitle}
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm text-white/85">
                Halaman ini menampilkan antarmuka fungsional bagi <strong>{profile.nama_lengkap}</strong> sesuai alur proses bisnis pada ERD SAMANGGA. Untuk manajemen tabel data mentah, gunakan tombol{" "}
                <strong>Mode Tabel CRUD (Navbar Kiri)</strong>.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-xs backdrop-blur-sm">
              <p className="font-bold uppercase tracking-wider text-[#95A87A]">Akun Aktif</p>
              <p className="mt-1 text-sm font-extrabold text-white">{profile.nama_lengkap}</p>
              <p className="text-white/80">{profile.email}</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-200">
                <CheckBadgeIcon className="h-3.5 w-3.5" />
                {profile.status_verifikasi}
              </span>
            </div>
          </div>
        </section>

        {banner && (
          <div
            role="status"
            className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-700 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-950"
          >
            <span>{banner}</span>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="ml-4 rounded px-2 py-0.5 font-extrabold hover:bg-emerald-200/60"
            >
              ✕
            </button>
          </div>
        )}

        {currentRole === "petani" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D5126]">
                  Fungsi 1 · Menawarkan Produk (Kategori: Buah)
                </span>
                <h2 className="mt-1 text-lg font-extrabold text-[#273419]">
                  Pasang Hasil Panen Kebun ke Katalog
                </h2>
                <p className="mt-1 text-xs text-gray-600">
                  Tayangkan stok panen mangga segar Anda agar dapat dibeli langsung oleh UMKM Pengolah maupun Konsumen Grosir/Ritel.
                </p>

                <form onSubmit={handleSupplierPasangPanen} className="mt-4 space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-[#273419]">Nama Komoditas Mangga *</label>
                    <input
                      type="text"
                      required
                      value={panenNama}
                      onChange={(e) => setPanenNama(e.target.value)}
                      placeholder="Contoh: Mangga Gedong Gincu Petik Tua"
                      className="mt-1 h-10 w-full rounded-xl border border-gray-300 px-3"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#273419]">Harga Satuan (Rp) *</label>
                      <input
                        type="number"
                        required
                        min={1000}
                        value={panenHarga}
                        onChange={(e) => setPanenHarga(Number(e.target.value))}
                        className="mt-1 h-10 w-full rounded-xl border border-gray-300 px-3"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#273419]">Stok & Satuan *</label>
                      <div className="mt-1 flex gap-1.5">
                        <input
                          type="number"
                          required
                          min={1}
                          value={panenStok}
                          onChange={(e) => setPanenStok(Number(e.target.value))}
                          className="h-10 w-20 rounded-xl border border-gray-300 px-2.5"
                        />
                        <select
                          value={panenSatuan}
                          onChange={(e) => setPanenSatuan(e.target.value)}
                          className="h-10 flex-1 rounded-xl border border-gray-300 bg-white px-2"
                        >
                          <option value="Kwintal">Kwintal</option>
                          <option value="Kg">Kg</option>
                          <option value="Keranjang">Keranjang</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-[#273419]">Deskripsi Kualitas Panen</label>
                    <textarea
                      rows={3}
                      value={panenDeskripsi}
                      onChange={(e) => setPanenDeskripsi(e.target.value)}
                      placeholder="Jelaskan tingkat kematangan, grade buah, dan lokasi kebun..."
                      className="mt-1 w-full rounded-xl border border-gray-300 p-3"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#3D5126] py-3 text-xs font-bold text-white hover:bg-[#273419]"
                  >
                    + Tayangkan Komoditas Buah ke Katalog
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D5126]">
                  Fungsi 2 · Verifikasi Pembayaran Transfer Manual oleh Penjual
                </span>
                <h2 className="mt-1 text-lg font-extrabold text-[#273419]">
                  Pesanan Masuk & Konfirmasi Bukti Transfer
                </h2>
                <p className="mt-1 text-xs text-gray-600">
                  Sesuai alur ERD, pembayaran dengan metode <strong>Transfer Manual</strong> wajib dikonfirmasi oleh penjual setelah memeriksa `bukti_transfer`.
                </p>

                <div className="mt-4 space-y-3">
                  {transaksiList
                    .filter((t) => t.id_penjual === 101)
                    .map((trx) => {
                      const pay = pembayaranList.find((p) => p.id_transaksi === trx.id_transaksi);
                      const ship = pengirimanList.find((s) => s.id_transaksi === trx.id_transaksi);
                      return (
                        <div
                          key={trx.id_transaksi}
                          className="rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono font-extrabold text-[#3D5126]">
                              Pesanan #{trx.id_transaksi} · Status: {trx.status}
                            </span>
                            <span className="text-sm font-extrabold text-[#273419]">
                              {formatRupiah(trx.total_harga)}
                            </span>
                          </div>
                          <p className="mt-1 font-semibold text-[#273419]">
                            Pembeli: {getUserName(trx.id_pembeli)}
                          </p>
                          {pay && (
                            <div className="mt-2 flex flex-col justify-between gap-2 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center">
                              <div>
                                <p>
                                  Metode: <strong>{pay.metode_pembayaran}</strong> · Status Bayar:{" "}
                                  <strong className="text-[#3D5126]">{pay.status_pembayaran}</strong>
                                </p>
                                {pay.bukti_transfer && (
                                  <p className="font-mono text-[11px] text-gray-500">
                                    File Bukti: {pay.bukti_transfer}
                                  </p>
                                )}
                              </div>
                              {pay.metode_pembayaran === "Transfer Manual" &&
                                pay.status_pembayaran === "Menunggu" && (
                                  <button
                                    type="button"
                                    onClick={() => handleKonfirmasiTransferManual(trx.id_transaksi)}
                                    className="rounded-xl bg-[#3D5126] px-4 py-2 font-bold text-white hover:bg-[#273419]"
                                  >
                                    ✓ Konfirmasi Bukti Transfer
                                  </button>
                                )}
                            </div>
                          )}
                          {ship && (
                            <p className="mt-2 text-[11px] text-gray-600">
                              Resi Pengiriman: <strong className="font-mono">{ship.no_resi_lacak}</strong> (
                              {ship.status_pengiriman})
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D5126]">
                      Fungsi 3 · Etalase Kebun Supplier
                    </span>
                    <h2 className="text-lg font-extrabold text-[#273419]">
                      Komoditas Buah yang Anda Tawarkan
                    </h2>
                  </div>
                  <Link
                    href="/katalog"
                    className="rounded-xl border border-[#3D5126] px-3.5 py-2 text-xs font-bold text-[#3D5126] hover:bg-[#95A87A]/20"
                  >
                    Lihat di Katalog Umum ➔
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {produkList
                    .filter((p) => p.id_user === 101)
                    .map((p) => (
                      <div key={p.id_produk} className="rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-[#3D5126]">#{p.id_produk}</span>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-900">
                            {p.status_verifikasi}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm font-extrabold text-[#273419]">{p.nama_produk}</p>
                        <p className="mt-1 text-xs font-bold text-[#3D5126]">
                          {formatRupiah(p.harga)} / {p.satuan} · Stok: {p.stok}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D5126]">
                      Fungsi 4 · Ekonomi Sirkular (Supplier sebagai `id_pembeli`)
                    </span>
                    <h2 className="text-lg font-extrabold text-[#273419]">
                      Beli Pupuk Kompos & Bibit Pohon dari Mitra
                    </h2>
                    <p className="text-xs text-gray-600">
                      Beli kembali hasil olahan limbah kulit & biji mangga dari Mitra untuk memupuk dan meremajakan kebun Anda.
                    </p>
                  </div>
                  <Link
                    href="/pasar-sirkular?role=petani"
                    className="rounded-xl bg-[#FFB81C] px-3.5 py-2 text-xs font-extrabold text-[#273419] hover:bg-[#FFE39A]"
                  >
                    Buka Pasar Sirkular ➔
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {produkList
                    .filter((p) => p.id_user === 303)
                    .map((p) => (
                      <div
                        key={p.id_produk}
                        className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4 text-xs"
                      >
                        <div>
                          <span className="rounded bg-[#3D5126]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#3D5126]">
                            Produk Mitra #303
                          </span>
                          <p className="mt-1.5 font-extrabold text-[#273419]">{p.nama_produk}</p>
                          <p className="mt-1 text-[11px] text-gray-500">{p.deskripsi}</p>
                          <p className="mt-2 font-extrabold text-[#3D5126]">
                            {formatRupiah(p.harga)} / {p.satuan} · Stok: {p.stok}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSupplierBeliSirkular(p, 5)}
                          className="mt-3 w-full rounded-xl bg-[#3D5126] py-2 font-bold text-white hover:bg-[#273419]"
                        >
                          🛒 Beli 5 {p.satuan} ({formatRupiah(p.harga * 5)})
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentRole === "umkm" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D5126]">
                  Pencatatan Limbah Produksi
                </span>
                <h2 className="mt-1 text-lg font-extrabold text-[#273419]">
                  Setor Limbah Dapur Produksi ke Pasar Sirkular
                </h2>
                <p className="mt-1 text-xs text-gray-600">
                  Catat residu kupasan mangga (`Kulit`, `Biji`, `Buah Afkir`) dan tentukan skema kompensasi penjemputan bersama Mitra Sirkular.
                </p>

                <form onSubmit={handleUmkmSetorLimbah} className="mt-4 space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#273419]">Jenis Limbah *</label>
                      <select
                        value={setorJenis}
                        onChange={(e) => setSetorJenis(e.target.value as JenisLimbahErd)}
                        className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3"
                      >
                        <option value="Kulit">Kulit Mangga</option>
                        <option value="Biji">Biji Mangga</option>
                        <option value="Buah Afkir">Buah Afkir Sortir</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-[#273419]">Berat Batch (Kg) *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={setorBerat}
                        onChange={(e) => setSetorBerat(Number(e.target.value))}
                        className="mt-1 h-10 w-full rounded-xl border border-gray-300 px-3"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#273419]">Skema Kompensasi *</label>
                      <select
                        value={setorKompensasi}
                        onChange={(e) => setSetorKompensasi(e.target.value as JenisKompensasi)}
                        className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3"
                      >
                        <option value="Jual Beli">Jual Beli (Mitra Membeli)</option>
                        <option value="Jasa Berbayar">Jasa Berbayar (UMKM Membayar)</option>
                        <option value="Gratis">Gratis (Jemput Sirkular)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-[#273419]">Estimasi Nilai (Rp)</label>
                      <input
                        type="number"
                        min={0}
                        value={setorEstimasi}
                        onChange={(e) => setSetorEstimasi(Number(e.target.value))}
                        className="mt-1 h-10 w-full rounded-xl border border-gray-300 px-3"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#273419]">Lokasi Penjemputan *</label>
                    <input
                      type="text"
                      required
                      value={setorLokasi}
                      onChange={(e) => setSetorLokasi(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-gray-300 px-3"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#273419]">Titik Koordinat GPS</label>
                    <input
                      type="text"
                      value={setorKoordinat}
                      onChange={(e) => setSetorKoordinat(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-gray-300 px-3 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#3D5126] py-3 text-xs font-bold text-white hover:bg-[#273419]"
                  >
                    + Daftarkan Batch Limbah ke Pasar Sirkular
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D5126]">
                  Fungsi Rantai Pasok · UMKM sebagai Pembeli Bahan Baku (`id_pembeli`)
                </span>
                <h2 className="mt-1 text-lg font-extrabold text-[#273419]">
                  Pesan Bahan Baku Mangga Segar dari Supplier Hulu
                </h2>

                <div className="mt-4 space-y-3">
                  {produkList
                    .filter((p) => p.kategori === "Buah")
                    .map((buah) => (
                      <div
                        key={buah.id_produk}
                        className="flex flex-col justify-between gap-3 rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center gap-3">
                          {buah.gambar && (
                            <img
                              src={buah.gambar}
                              alt={buah.nama_produk}
                              className="h-14 w-14 shrink-0 rounded-xl object-cover border border-gray-200 shadow-2xs"
                            />
                          )}
                          <div>
                            <p className="text-sm font-bold text-[#273419]">{buah.nama_produk}</p>
                            <p className="text-xs text-gray-600">
                              Harga: <strong>{formatRupiah(buah.harga)} / {buah.satuan}</strong> · Stok:{" "}
                              {buah.stok} {buah.satuan}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUmkmBeliBahanBaku(buah, 2)}
                          className="shrink-0 rounded-xl bg-[#3D5126] px-4 py-2 text-xs font-bold text-white hover:bg-[#273419]"
                        >
                          Pesan 2 {buah.satuan} Sekarang
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D5126]">
                  Monitoring Penjemputan Limbah UMKM
                </span>
                <h2 className="mt-1 text-lg font-extrabold text-[#273419]">
                  Status Batch Limbah yang Anda Catat
                </h2>

                <div className="mt-4 space-y-3">
                  {limbahList.map((l) => (
                    <div
                      key={l.id_limbah}
                      className="flex flex-col justify-between gap-3 rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4 text-xs sm:flex-row sm:items-center"
                    >
                      <div>
                        <span className="font-mono font-bold text-[#3D5126]">
                          Limbah #{l.id_limbah} · {l.status_jemput}
                        </span>
                        <p className="mt-0.5 text-sm font-bold text-[#273419]">
                          {l.jenis_limbah} ({l.berat_kg} kg) — {l.jenis_kompensasi}
                        </p>
                        <p className="text-gray-600">
                          Harga Kesepakatan:{" "}
                          <strong>
                            {l.harga_kesepakatan !== null
                              ? formatRupiah(l.harga_kesepakatan)
                              : "Menunggu Penawaran Mitra"}
                          </strong>
                        </p>
                      </div>
                      {l.status_jemput === "Diajukan" && (
                        <button
                          type="button"
                          onClick={() => handleMitraTahapJemput(l.id_limbah, "Proses")}
                          className="rounded-xl bg-[#3D5126] px-4 py-2 font-bold text-white hover:bg-[#273419]"
                        >
                          ✓ Setujui Penjemputan Mitra
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentRole === "mitra" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D5126]">
                      Penjemputan Limbah UMKM
                    </span>
                    <h2 className="mt-1 text-lg font-extrabold text-[#273419]">
                      Antrean & Jadwal Penjemputan Limbah UMKM
                    </h2>
                  </div>
                  <Link
                    href="/pasar-sirkular"
                    className="rounded-xl border border-[#3D5126] px-3.5 py-2 text-xs font-bold text-[#3D5126] hover:bg-[#95A87A]/20"
                  >
                    Bursa Sirkular ➔
                  </Link>
                </div>

                <div className="mt-4 space-y-3">
                  {limbahList.map((l) => (
                    <div
                      key={l.id_limbah}
                      className="rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4 text-xs space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono font-extrabold text-[#3D5126]">
                          Batch Limbah #{l.id_limbah} · Jenis: {l.jenis_limbah} ({l.berat_kg} kg)
                        </span>
                        <span className="rounded-full bg-[#3D5126] px-3 py-0.5 text-[10px] font-bold text-white">
                          Status Jemput: {l.status_jemput}
                        </span>
                      </div>
                      <p className="flex items-center gap-1.5 text-gray-700">
                        <MapPinIcon className="h-4 w-4 shrink-0 text-[#3D5126]" />
                        <span>
                          {l.lokasi_penjemputan} ({l.titik_koordinat ?? "-"})
                        </span>
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-2.5">
                        <div>
                          <span className="text-gray-600">
                            Kompensasi: <strong>{l.jenis_kompensasi}</strong> · Kesepakatan:{" "}
                            <strong className="text-[#3D5126]">
                              {formatRupiah(l.harga_kesepakatan ?? l.estimasi_harga)}
                            </strong>
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {l.status_jemput === "Tersedia" && (
                            <button
                              type="button"
                              onClick={() => handleMitraTahapJemput(l.id_limbah, "Diajukan")}
                              className="rounded-xl bg-[#3D5126] px-3.5 py-1.5 font-bold text-white hover:bg-[#273419]"
                            >
                              1. Ajukan Jemput
                            </button>
                          )}
                          {l.status_jemput === "Diajukan" && (
                            <button
                              type="button"
                              onClick={() => handleMitraTahapJemput(l.id_limbah, "Proses")}
                              className="rounded-xl bg-blue-700 px-3.5 py-1.5 font-bold text-white hover:bg-blue-800"
                            >
                              2. Berangkat Jemput (Proses)
                            </button>
                          )}
                          {l.status_jemput === "Proses" && (
                            <button
                              type="button"
                              onClick={() => handleMitraTahapJemput(l.id_limbah, "Selesai")}
                              className="rounded-xl bg-emerald-700 px-3.5 py-1.5 font-bold text-white hover:bg-emerald-800"
                            >
                              3. Selesai Jemput & Catat Kas
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D5126]">
                  Fungsi 2 · Mitra Menangani Pengiriman (`Riwayat Pengiriman`)
                </span>
                <h2 className="mt-1 text-lg font-extrabold text-[#273419]">
                  Update Status Pengiriman Logistik
                </h2>
                <p className="mt-1 text-xs text-gray-600">
                  Perbarui tahapan pengiriman pesanan produk (`Diproses` ➔ `Dalam Perjalanan` ➔ `Tiba di Lokasi`).
                </p>

                <div className="mt-4 space-y-3">
                  {pengirimanList.map((ship) => (
                    <div
                      key={ship.id_pengiriman}
                      className="rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-extrabold text-[#273419]">
                          {ship.no_resi_lacak}
                        </span>
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-900">
                          {ship.status_pengiriman}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        Transaksi #{ship.id_transaksi} · Tgl Kirim: {ship.tgl_pengiriman}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(["Diproses", "Dalam Perjalanan", "Tiba di Lokasi"] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleUpdateTahapPengiriman(ship.id_pengiriman, st)}
                            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                              ship.status_pengiriman === st
                                ? "bg-[#3D5126] text-white"
                                : "border border-gray-300 bg-white text-[#273419] hover:bg-gray-100"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentRole === "konsumen" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D5126]">
                  Fungsi 1 · Checkout Pesanan & Pembayaran Konsumen
                </span>
                <h2 className="mt-1 text-lg font-extrabold text-[#273419]">
                  Pesan Buah Segar & Produk Olahan UMKM
                </h2>

                <form onSubmit={handleKonsumenCheckout} className="mt-4 space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-[#273419]">Pilih Produk Terverifikasi *</label>
                    <select
                      value={selectedProdukId}
                      onChange={(e) => setSelectedProdukId(Number(e.target.value))}
                      className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3"
                    >
                      {produkList
                        .filter((p) => p.status_verifikasi === "Terverifikasi")
                        .map((p) => (
                          <option key={p.id_produk} value={p.id_produk}>
                            [{p.kategori}] {p.nama_produk} — {formatRupiah(p.harga)}/{p.satuan}
                          </option>
                        ))}
                    </select>

                    {(() => {
                      const selectedProd = produkList.find((p) => p.id_produk === selectedProdukId);
                      if (!selectedProd) return null;
                      return (
                        <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-gray-200 bg-[#F8FAFC] p-2.5">
                          {selectedProd.gambar && (
                            <img
                              src={selectedProd.gambar}
                              alt={selectedProd.nama_produk}
                              className="h-12 w-12 shrink-0 rounded-lg object-cover border border-gray-200 shadow-2xs"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold uppercase text-[#3D5126]">{selectedProd.kategori}</span>
                            <p className="font-bold text-[#273419] truncate">{selectedProd.nama_produk}</p>
                            <p className="text-[11px] text-gray-600">
                              {formatRupiah(selectedProd.harga)} / {selectedProd.satuan} · Stok: {selectedProd.stok} {selectedProd.satuan}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#273419]">Jumlah Pesanan *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={orderQty}
                        onChange={(e) => setOrderQty(Number(e.target.value) || 1)}
                        className="mt-1 h-10 w-full rounded-xl border border-gray-300 px-3"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#273419]">Metode Pembayaran *</label>
                      <select
                        value={orderMetode}
                        onChange={(e) => setOrderMetode(e.target.value as MetodePembayaran)}
                        className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3"
                      >
                        <option value="QRIS">QRIS (Otomatis)</option>
                        <option value="Virtual Account">Virtual Account</option>
                        <option value="Transfer Manual">Transfer Manual</option>
                      </select>
                    </div>
                  </div>

                  {orderMetode === "Transfer Manual" && (
                    <div>
                      <label className="block font-bold text-[#273419]">
                        Nama File Bukti Transfer (`bukti_transfer`) *
                      </label>
                      <input
                        type="text"
                        required
                        value={orderBukti}
                        onChange={(e) => setOrderBukti(e.target.value)}
                        className="mt-1 h-10 w-full rounded-xl border border-gray-300 px-3 font-mono"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#3D5126] py-3 text-xs font-bold text-white hover:bg-[#273419]"
                  >
                    Buat Pesanan & Proses Pembayaran
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D5126]">
                  Fungsi 2 · Pelacakan Pesanan & Penerimaan Barang
                </span>
                <h2 className="mt-1 text-lg font-extrabold text-[#273419]">
                  Status Pesanan, Pembayaran & Lacak Resi Anda
                </h2>

                <div className="mt-4 space-y-3">
                  {transaksiList
                    .filter((t) => t.id_pembeli === 404)
                    .map((ord) => {
                      const pay = pembayaranList.find((p) => p.id_transaksi === ord.id_transaksi);
                      const ship = pengirimanList.find((s) => s.id_transaksi === ord.id_transaksi);
                      const details = detailList.filter((d) => d.id_transaksi === ord.id_transaksi);
                      return (
                        <div
                          key={ord.id_transaksi}
                          className="rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4 text-xs space-y-2.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono font-extrabold text-[#3D5126]">
                              Transaksi #{ord.id_transaksi} · {ord.tgl_transaksi}
                            </span>
                            <span className="text-sm font-extrabold text-[#273419]">
                              {formatRupiah(ord.total_harga)}
                            </span>
                          </div>
                          {details.map((d) => {
                            const pr = produkList.find((p) => p.id_produk === d.id_produk);
                            return (
                              <div key={d.id_detail_transaksi} className="flex items-center gap-2.5">
                                {pr?.gambar && (
                                  <img
                                    src={pr.gambar}
                                    alt={pr.nama_produk}
                                    className="h-10 w-10 shrink-0 rounded-lg object-cover border border-gray-200 shadow-2xs"
                                  />
                                )}
                                <div>
                                  <p className="font-bold text-[#273419]">
                                    {pr?.nama_produk} ({d.jumlah_produk} × {formatRupiah(d.harga_satuan)})
                                  </p>
                                  <p className="text-[11px] text-gray-500">
                                    Subtotal item: {formatRupiah(d.subtotal_harga)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-2">
                            <span>
                              Pembayaran: <strong>{pay?.metode_pembayaran}</strong> (
                              <strong className="text-[#3D5126]">{pay?.status_pembayaran}</strong>)
                            </span>
                            {ship && (
                              <span className="inline-flex items-center gap-1 font-mono font-bold text-[#273419]">
                                <TruckIcon className="h-3.5 w-3.5 text-[#3D5126]" />
                                {ship.no_resi_lacak} ({ship.status_pengiriman})
                              </span>
                            )}
                          </div>
                          {ship && ship.status_pengiriman !== "Tiba di Lokasi" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateTahapPengiriman(ship.id_pengiriman, "Tiba di Lokasi")
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-1.5 font-bold text-white hover:bg-emerald-800"
                            >
                              <CheckIcon className="h-3.5 w-3.5" />
                              Konfirmasi Pesanan Tiba di Lokasi
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentRole === "admin" && (
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-3 rounded-3xl border border-gray-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D5126]">
                  Otoritas Tingkat Akses Admin
                </span>
                <h2 className="text-base font-extrabold text-[#273419]">
                  Mode Aktif: {tingkatAkses}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["Super Admin", "Admin Transaksi", "Admin Limbah"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setTingkatAkses(lvl)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      tingkatAkses === lvl
                        ? "bg-[#3D5126] text-white"
                        : "border border-gray-300 bg-[#F8FAFC] text-[#273419]"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {(tingkatAkses === "Super Admin" || tingkatAkses === "Admin Transaksi") && (
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
                  <h3 className="text-base font-extrabold text-[#273419]">
                    Antrean Verifikasi Pengguna & Produk (`Menunggu`)
                  </h3>
                  <div className="space-y-2.5">
                    {penggunaList
                      .filter((u) => u.status_verifikasi === "Menunggu")
                      .map((u) => (
                        <div
                          key={u.id_user}
                          className="flex items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#3D5126]">[Pengguna · {u.peran}]</span>
                            <p className="font-bold text-[#273419]">{u.nama_lengkap}</p>
                            <p className="text-gray-600">{u.email}</p>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleVerifikasi("pengguna", u.id_user, "Terverifikasi")}
                              className="rounded-lg bg-emerald-700 px-3 py-1.5 font-bold text-white"
                            >
                              Setujui
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVerifikasi("pengguna", u.id_user, "Ditolak")}
                              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 font-bold text-red-700"
                            >
                              Tolak
                            </button>
                          </div>
                        </div>
                      ))}

                    {produkList
                      .filter((p) => p.status_verifikasi === "Menunggu")
                      .map((p) => (
                        <div
                          key={p.id_produk}
                          className="flex items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#3D5126]">[Produk · {p.kategori}]</span>
                            <p className="font-bold text-[#273419]">{p.nama_produk}</p>
                            <p className="text-gray-600">
                              {formatRupiah(p.harga)} / {p.satuan}
                            </p>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleVerifikasi("produk", p.id_produk, "Terverifikasi")}
                              className="rounded-lg bg-emerald-700 px-3 py-1.5 font-bold text-white"
                            >
                              Setujui
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVerifikasi("produk", p.id_produk, "Ditolak")}
                              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 font-bold text-red-700"
                            >
                              Tolak
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-[#273419]">
                    Monitor Log Sistem & Verifikasi Limbah
                  </h3>
                  <div className="flex gap-1">
                    {(["Semua", "Info", "Warning", "Error"] as const).map((lv) => (
                      <button
                        key={lv}
                        type="button"
                        onClick={() => setFilterLog(lv)}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                          filterLog === lv ? "bg-[#3D5126] text-white" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {lv}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {limbahList
                    .filter((l) => l.status_verifikasi === "Menunggu")
                    .map((l) => (
                      <div
                        key={l.id_limbah}
                        className="flex items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#3D5126]">
                            [Limbah #{l.id_limbah} · {l.jenis_limbah}]
                          </span>
                          <p className="font-bold text-[#273419]">
                            {l.berat_kg} kg — Kompensasi: {l.jenis_kompensasi}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleVerifikasi("limbah", l.id_limbah, "Terverifikasi")}
                          className="rounded-lg bg-emerald-700 px-3 py-1.5 font-bold text-white"
                        >
                          Verifikasi Limbah
                        </button>
                      </div>
                    ))}

                  {(filterLog === "Semua"
                    ? logList
                    : logList.filter((x) => x.level === filterLog)
                  )
                    .slice(0, 4)
                    .map((log) => (
                      <div
                        key={log.id_log}
                        className="rounded-2xl border border-gray-200 bg-[#F8FAFC] p-3 text-xs"
                      >
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-bold text-[#3D5126]">
                            [{log.level} · {log.kode_status}] {log.aksi}
                          </span>
                          <span className="text-gray-400">{log.waktu}</span>
                        </div>
                        <p className="mt-1 text-gray-700">{log.pesan}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentRole !== "admin" && (
          <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D5126]">
                  Integrasi Otomatis · Tabel Pencatatan Keuangan
                </span>
                <h2 className="text-base font-extrabold text-[#273419]">
                  Riwayat Arus Kas Terbaru ({profile.peranErd})
                </h2>
              </div>
              <Link
                href={`/profil/${currentRole}`}
                className="text-xs font-bold text-[#3D5126] underline-offset-2 hover:underline"
              >
                Kelola di Tabel CRUD Keuangan ➔
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {keuanganList
                .filter((k) => k.id_user === profile.id_user)
                .map((k) => (
                  <div
                    key={k.id_keuangan}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-[#F8FAFC] p-3.5 text-xs"
                  >
                    <div>
                      <p className="font-mono text-[11px] font-bold text-[#3D5126]">
                        #{k.id_keuangan} ·{" "}
                        {k.id_transaksi !== null
                          ? `Ref Transaksi #${k.id_transaksi}`
                          : `Ref Limbah #${k.id_limbah}`}
                      </p>
                      <p className="mt-0.5 font-medium text-[#273419]">{k.keterangan}</p>
                    </div>
                    <span
                      className={`shrink-0 font-extrabold ${
                        k.jenis_transaksi === "Pemasukan" ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {k.jenis_transaksi === "Pemasukan" ? "+" : "-"}
                      {formatRupiah(k.jumlah_uang)}
                    </span>
                  </div>
                ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
