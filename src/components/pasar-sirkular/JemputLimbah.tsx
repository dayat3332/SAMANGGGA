"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, JSX } from "react";
import { Navbar } from "@/components/layout/SiteNavbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  ArrowLeftIcon,
  CheckIcon,
  MapPinIcon,
  RecycleIcon,
  TruckIcon,
} from "@/components/ui/Icons";
import { WasteIcon } from "@/components/ui/Illustrations";
import {
  FLEET_OPTIONS,
  LISTINGS,
  PROCESSING_PLANS,
  type CompensationScheme,
  type WasteListing,
} from "@/data/pasar-sirkular";
import {
  createWastePickup,
  getEcosystemWasteListings,
  subscribeEcosystem,
} from "@/lib/ecosystemStore";
import { formatNumber, formatRupiah } from "@/lib/format";
import type { StatusLimbah } from "@/types/samangga";

const FALLBACK_LISTING: WasteListing = {
  id: 0,
  jenis: "Kulit",
  owner: "-",
  location: "-",
  weightKg: 0,
  estimatedPrice: 0,
  condition: "-",
  verification: "Terverifikasi",
  status: "Tersedia",
  usage: "-",
};

function JemputLimbahContent(): JSX.Element {
  const searchParams = useSearchParams();
  const initialId = Number(searchParams.get("limbah") ?? "1");

  const [availableListings, setAvailableListings] = useState<WasteListing[]>(() => getEcosystemWasteListings());

  useEffect(() => {
    const update = () => setAvailableListings(getEcosystemWasteListings());
    const unsub = subscribeEcosystem(update);
    return unsub;
  }, []);

  const [selectedWasteId, setSelectedWasteId] = useState<number>(() => {
    const found = availableListings.find((l) => l.id === initialId);
    return found ? found.id : (availableListings[0]?.id ?? 0);
  });

  const listing: WasteListing = useMemo(
    () => availableListings.find((l) => l.id === selectedWasteId) ?? (availableListings[0] ?? FALLBACK_LISTING),
    [availableListings, selectedWasteId],
  );

  // Berat yang diajukan untuk dijemput (default: seluruh batch)
  const [pickupWeightKg, setPickupWeightKg] = useState<number>(() => {
    const found = availableListings.find((l) => l.id === initialId) ?? availableListings[0];
    return found?.weightKg ?? 0;
  });

  const handleWasteChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const nextId = Number(e.target.value);
    setSelectedWasteId(nextId);
    const nextListing = availableListings.find((l) => l.id === nextId) ?? availableListings[0];
    setPickupWeightKg(nextListing?.weightKg ?? 0);
  };

  // Form Data Mitra Pengolah
  const [namaInstansi, setNamaInstansi] = useState<string>("");
  const [penanggungJawab, setPenanggungJawab] = useState<string>("");
  const [noWhatsapp, setNoWhatsapp] = useState<string>("");
  const [tanggalJemput, setTanggalJemput] = useState<string>("2026-11-01");
  const [sesiJemput, setSesiJemput] = useState<string>("Pagi (08.00 – 11.00 WIB)");
  const [selectedPlanId, setSelectedPlanId] = useState<string>(PROCESSING_PLANS[0].id);
  const [selectedFleetId, setSelectedFleetId] = useState<string>(FLEET_OPTIONS[0].id);
  const [skemaKompensasi, setSkemaKompensasi] = useState<CompensationScheme>("Tebus Tunai / Transfer");
  const [catatanLapangan, setCatatanLapangan] = useState<string>("");

  // State setelah klik "Ajukan Penjemputan"
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [statusLimbah, setStatusLimbah] = useState<StatusLimbah>("Tersedia");

  const selectedPlan = useMemo(
    () => PROCESSING_PLANS.find((p) => p.id === selectedPlanId) ?? PROCESSING_PLANS[0],
    [selectedPlanId],
  );

  const selectedFleet = useMemo(
    () => FLEET_OPTIONS.find((f) => f.id === selectedFleetId) ?? FLEET_OPTIONS[0],
    [selectedFleetId],
  );

  const pricePerKg = Math.round(listing.estimatedPrice / listing.weightKg);
  const estimatedCompensation = pricePerKg * pickupWeightKg;
  const totalCost = estimatedCompensation + selectedFleet.cost;

  // Estimasi dampak lingkungan: 1 kg limbah organik mencegah ~0.85 kg CO2e metana TPA
  const co2SavedKg = Math.round(pickupWeightKg * 0.85);

  const kodeTiketJemput = `JMP-SMG-00${listing.id}-2026`;

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split("T")[0];
    if (tanggalJemput < todayStr) {
      alert("Tanggal penjemputan tidak boleh tanggal lampau. Silakan pilih hari ini atau tanggal setelahnya.");
      return;
    }
    createWastePickup({
      id_limbah: listing.id,
      mitraId: 303,
      namaMitra: namaInstansi || penanggungJawab || "CV Bio Tani Lestari",
      jadwalJemput: `${tanggalJemput} ${sesiJemput.slice(0, 5)}:00`,
      biayaTebus: estimatedCompensation,
      ongkirArmada: selectedFleet.cost,
    });
    setIsSubmitted(true);
    setStatusLimbah("Dipesan");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#273419]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/pasar-sirkular"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3D5126] hover:text-[#273419]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Kembali ke Pasar Sirkular
            </Link>
            <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#273419] sm:text-3xl">
              Ajukan Penjemputan Limbah Sirkular
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-700">
              Pesan slot penjemputan limbah mangga langsung dari lokasi petani atau UMKM Indramayu untuk diolah menjadi
              kompos, pakan maggot, pektin, atau produk bernilai tambah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#95A87A] bg-white px-3 py-1 text-xs font-semibold text-[#273419]">
              Tiket: <strong className="font-mono font-bold">#{kodeTiketJemput}</strong>
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                statusLimbah === "Selesai"
                  ? "bg-green-700 text-white"
                  : statusLimbah === "Diproses"
                    ? "bg-amber-600 text-white"
                    : statusLimbah === "Dipesan"
                      ? "bg-[#3D5126] text-white"
                      : "border border-[#3D5126] bg-[#95A87A]/25 text-[#273419]"
              }`}
            >
              Status Limbah: {statusLimbah}
            </span>
          </div>
        </div>

        <section
          aria-labelledby="alur-jemput-title"
          className="mb-8 rounded-2xl border border-[#95A87A] bg-white p-4 shadow-xs sm:p-5"
        >
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3D5126] text-white">
                <RecycleIcon className="h-4 w-4" />
              </span>
              <h2 id="alur-jemput-title" className="text-sm font-extrabold uppercase tracking-wide text-[#273419]">
                Alur Kerja Pasar Sirkular Saat Klik &ldquo;Jemput&rdquo;
              </h2>
            </div>
            <span className="text-xs font-medium text-gray-600">
              Terintegrasi tabel <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px]">Limbah</code>,{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px]">RiwayatPengiriman</code>, &{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px]">PencatatanKeuangan</code>
            </span>
          </div>

          <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                stepNo: 1,
                badge: "Status: Tersedia",
                title: "Pilih & Klaim Batch Limbah",
                desc: "Mitra memilih limbah terverifikasi (Kulit, Biji, Daun, atau Buah Afkir) beserta volume berat (kg) yang akan diangkut.",
                active: !isSubmitted,
              },
              {
                stepNo: 2,
                badge: "Status: Dipesan",
                title: "Kunci Slot & Terbitkan Surat Jalan",
                desc: "Mitra mengisi jadwal jemput & armada. Status limbah dikunci menjadi 'Dipesan' agar tidak diambil pihak lain.",
                active: isSubmitted && statusLimbah === "Dipesan",
              },
              {
                stepNo: 3,
                badge: "Status: Diproses",
                title: "Penjemputan & Timbang Aktual",
                desc: "Armada tiba di lokasi petani/UMKM, menimbang berat aktual limbah, dan mengangkut ke fasilitas pengolahan.",
                active: isSubmitted && statusLimbah === "Diproses",
              },
              {
                stepNo: 4,
                badge: "Status: Selesai",
                title: "Serah Terima & Catat Keuangan",
                desc: "Limbah tiba di tempat olah. Dana kompensasi otomatis tercatat sebagai Pemasukan bagi petani/UMKM.",
                active: isSubmitted && statusLimbah === "Selesai",
              },
            ].map((s) => (
              <li
                key={s.stepNo}
                className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                  s.active
                    ? "border-2 border-[#3D5126] bg-[#95A87A]/15 shadow-xs"
                    : "border-gray-200 bg-[#F8FAFC]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3D5126] text-xs font-bold text-white">
                      {s.stepNo}
                    </span>
                    <span className="rounded border border-[#95A87A] bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#273419]">
                      {s.badge}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-xs sm:text-sm font-bold text-[#273419]">{s.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {availableListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <span className="text-4xl">♻️</span>
            <h2 className="mt-3 text-base font-bold text-gray-800">Belum Ada Listing Limbah Tersedia</h2>
            <p className="mt-1 max-w-md text-xs text-gray-500">
              Saat ini belum ada data limbah aktif untuk dijemput. Anda dapat menyetor limbah baru atau menunggu listing dari UMKM/Petani.
            </p>
            <div className="mt-5 flex gap-3">
              <Link
                href="/pasar-sirkular"
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Kembali ke Pasar Sirkular
              </Link>
              <Link
                href="/pasar-sirkular/setor"
                className="rounded-xl bg-[#3D5126] px-4 py-2 text-xs font-bold text-white hover:bg-[#273419]"
              >
                + Setor Limbah Baru
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <aside aria-label="Rincian batch limbah terpilih" className="lg:col-span-5">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
                <label
                  htmlFor="pilih-limbah"
                  className="block text-[11px] font-bold uppercase tracking-wider text-gray-500"
                >
                  Pilih Batch Limbah Pasar Sirkular
                </label>
                <select
                  id="pilih-limbah"
                  value={selectedWasteId}
                  disabled={isSubmitted}
                  onChange={handleWasteChange}
                  className="mt-1.5 h-10 w-full rounded-xl border border-gray-300 bg-[#F8FAFC] px-3 text-sm font-semibold text-[#273419] focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126] disabled:opacity-60"
                >
                  {availableListings.map((item) => (
                    <option key={item.id} value={item.id}>
                      #{item.id} Limbah {item.jenis} ({item.weightKg} kg) — {item.owner} [{item.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-md">
                <div className="relative flex h-48 w-full items-center justify-center bg-gray-100 overflow-hidden">
                  {listing.image ? (
                    <img
                      src={listing.image}
                      alt={`Limbah ${listing.jenis} Mangga`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#384A23] via-[#2D3B1C] to-[#1E2813] p-4">
                      <WasteIcon jenis={listing.jenis} />
                    </div>
                  )}
                  <span className="absolute top-3.5 left-3.5 rounded-full bg-[#3D5126]/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    {statusLimbah}
                  </span>
                  <span className="absolute top-3.5 right-3.5 rounded-full bg-black/40 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                    {listing.verification}
                  </span>
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-extrabold text-[#273419]">
                    Limbah {listing.jenis} Mangga
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                    <MapPinIcon className="h-4 w-4 shrink-0 text-[#6E8053]" />
                    <span>
                      Titik Jemput: <strong className="font-semibold text-[#273419]">{listing.owner}</strong> ·{" "}
                      {listing.location}
                    </span>
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded border border-gray-300 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-700">
                      Total Batch: {formatNumber(listing.weightKg)} kg
                    </span>
                    <span className="rounded border border-gray-300 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-700">
                      Kondisi: {listing.condition}
                    </span>
                  </div>

                  <div className="mt-3 rounded-xl border border-[#95A87A]/60 bg-[#95A87A]/15 p-3 text-xs">
                    <p className="font-bold text-[#273419]">Rekomendasi Pemanfaatan:</p>
                    <p className="mt-0.5 text-gray-700">{listing.usage}</p>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm">
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Harga Estimasi per Kg</span>
                      <span className="font-semibold text-[#273419]">±{formatRupiah(pricePerKg)} / kg</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Volume Dijemput</span>
                      <span className="font-semibold text-[#273419]">
                        {formatNumber(pickupWeightKg)} kg
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Kompensasi ke Pemilik Limbah</span>
                      <span className="font-semibold text-[#273419]">
                        {formatRupiah(estimatedCompensation)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Biaya Armada Jemput</span>
                      <span className="font-semibold text-[#273419]">
                        {selectedFleet.cost === 0 ? "Rp 0 (Armada Sendiri)" : formatRupiah(selectedFleet.cost)}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-gray-200 pt-3">
                      <span className="text-sm font-extrabold uppercase tracking-wide text-[#273419]">
                        Total Estimasi
                      </span>
                      <span className="text-xl font-extrabold text-[#3D5126]">
                        {formatRupiah(totalCost)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-green-700/30 bg-green-50/70 p-3 text-xs text-[#273419]">
                    <p className="font-bold text-green-900">🌱 Dampak Ekonomi Sirkular Batch Ini:</p>
                    <p className="mt-0.5 text-gray-700">
                      Menyelamatkan <strong>{formatNumber(pickupWeightKg)} kg</strong> residu organik dari TPA dan
                      mencegah sekitar <strong>{formatNumber(co2SavedKg)} kg CO₂e</strong> emisi gas metana.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section aria-label="Formulir penjemputan limbah" className="lg:col-span-7">
            {!isSubmitted ? (
              <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="border-b border-gray-100 pb-4">
                  <span className="rounded-full bg-[#3D5126]/10 px-3 py-1 text-xs font-bold text-[#3D5126]">
                    Formulir Mitra Pengolah Sirkular
                  </span>
                  <h2 className="mt-2 text-lg font-extrabold text-[#273419]">
                    Atur Jadwal, Armada & Rencana Pengolahan
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-600">
                    Data ini akan dikirimkan ke <strong>{listing.owner}</strong> ({listing.location}) untuk menyiapkan
                    karung/wadah limbah sebelum armada tiba.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <label htmlFor="berat-jemput" className="block text-sm font-bold text-[#273419]">
                        Volume Limbah yang Akan Dijemput (kg) <span className="text-red-600">*</span>
                      </label>
                      <p className="text-xs text-gray-600">
                        Tersedia di lokasi: <strong>{formatNumber(listing.weightKg)} kg</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="berat-jemput"
                        type="number"
                        min={10}
                        max={listing.weightKg}
                        required
                        value={pickupWeightKg}
                        onChange={(e) =>
                          setPickupWeightKg(
                            Math.max(10, Math.min(listing.weightKg, Number(e.target.value) || 10)),
                          )
                        }
                        className="h-10 w-28 rounded-xl border border-gray-300 bg-white px-3 text-center text-sm font-bold text-[#273419] focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
                      />
                      <button
                        type="button"
                        onClick={() => setPickupWeightKg(listing.weightKg)}
                        className="rounded-xl bg-[#3D5126] px-3 py-2 text-xs font-semibold text-white hover:bg-[#273419]"
                      >
                        Ambil Semua ({listing.weightKg} kg)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="namaInstansi" className="block text-xs font-bold text-[#273419]">
                      Nama Instansi / Unit Pengolah Limbah (Mitra) <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="namaInstansi"
                      type="text"
                      required
                      value={namaInstansi}
                      onChange={(e) => setNamaInstansi(e.target.value)}
                      placeholder="Contoh: CV Bio Tani Makmur / Rumah Kompos Indramayu"
                      className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
                    />
                  </div>

                  <div>
                    <label htmlFor="penanggungJawab" className="block text-xs font-bold text-[#273419]">
                      Nama Koordinator / Sopir Jemput <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="penanggungJawab"
                      type="text"
                      required
                      value={penanggungJawab}
                      onChange={(e) => setPenanggungJawab(e.target.value)}
                      placeholder="Contoh: Kang Hendra"
                      className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
                    />
                  </div>

                  <div>
                    <label htmlFor="noWhatsapp" className="block text-xs font-bold text-[#273419]">
                      Nomor WhatsApp Aktif <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="noWhatsapp"
                      type="tel"
                      required
                      value={noWhatsapp}
                      onChange={(e) => setNoWhatsapp(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                    Rencana Hilirisasi / Pengolahan Sirkular
                  </label>
                  <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {PROCESSING_PLANS.map((plan) => {
                      const active = selectedPlanId === plan.id;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`flex flex-col justify-between rounded-xl border p-3 text-left transition-all ${
                            active
                              ? "border-2 border-[#3D5126] bg-[#95A87A]/15 shadow-xs"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div>
                            <span className="rounded bg-[#3D5126]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#3D5126]">
                              {plan.badge}
                            </span>
                            <p className="mt-1.5 text-xs font-bold text-[#273419]">{plan.title}</p>
                            <p className="mt-1 text-[11px] leading-relaxed text-gray-600">
                              {plan.outputExample}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="tanggalJemput" className="block text-xs font-bold text-[#273419]">
                      Tanggal Penjemputan <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="tanggalJemput"
                      name="tanggalJemput"
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={tanggalJemput}
                      onChange={(e) => {
                        const val = e.target.value;
                        const todayStr = new Date().toISOString().split("T")[0];
                        if (val && val < todayStr) {
                          setTanggalJemput(todayStr);
                        } else {
                          setTanggalJemput(val);
                        }
                      }}
                      className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-[#273419] focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
                    />
                  </div>

                  <div>
                    <label htmlFor="sesiJemput" className="block text-xs font-bold text-[#273419]">
                      Sesi Waktu Kedatangan Armada <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="sesiJemput"
                      value={sesiJemput}
                      onChange={(e) => setSesiJemput(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-[#273419] focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
                    >
                      <option value="Pagi (08.00 – 11.00 WIB)">Pagi (08.00 – 11.00 WIB) — Disarankan</option>
                      <option value="Siang (13.00 – 15.30 WIB)">Siang (13.00 – 15.30 WIB)</option>
                      <option value="Sore (15.30 – 17.30 WIB)">Sore (15.30 – 17.30 WIB)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-600">
                    <TruckIcon className="h-4 w-4 text-[#3D5126]" />
                    Pilih Armada Pengangkut Limbah
                  </label>
                  <div className="mt-2 space-y-2">
                    {FLEET_OPTIONS.map((fleet) => {
                      const active = selectedFleetId === fleet.id;
                      return (
                        <button
                          key={fleet.id}
                          type="button"
                          onClick={() => setSelectedFleetId(fleet.id)}
                          className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                            active
                              ? "border-2 border-[#3D5126] bg-[#95A87A]/15 shadow-xs"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-bold text-[#273419]">{fleet.name}</span>
                            <span className="shrink-0 rounded-full bg-[#3D5126] px-2.5 py-0.5 text-xs font-bold text-white">
                              {fleet.cost === 0 ? "Rp 0" : formatRupiah(fleet.cost)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-600">{fleet.note}</p>
                          <p className="mt-0.5 text-[11px] font-semibold text-[#3D5126]">
                            Kapasitas Angkut: {fleet.capacity}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                    Skema Pembayaran / Kompensasi ke Pemilik Limbah
                  </label>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {(
                      [
                        "Tebus Tunai / Transfer",
                        "COD Timbang di Lokasi",
                        "Barter Kompos / Bibit",
                      ] as const
                    ).map((scheme) => {
                      const active = skemaKompensasi === scheme;
                      return (
                        <button
                          key={scheme}
                          type="button"
                          onClick={() => setSkemaKompensasi(scheme)}
                          className={`rounded-xl border p-3 text-left text-xs font-bold transition-all ${
                            active
                              ? "border-2 border-[#3D5126] bg-[#3D5126] text-white"
                              : "border-gray-200 bg-white text-[#273419] hover:border-gray-300"
                          }`}
                        >
                          {scheme}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="catatanLapangan" className="block text-xs font-bold text-[#273419]">
                    Catatan Teknis Penjemputan (Opsional)
                  </label>
                  <input
                    id="catatanLapangan"
                    type="text"
                    value={catatanLapangan}
                    onChange={(e) => setCatatanLapangan(e.target.value)}
                    placeholder="Contoh: Kami membawa 15 karung goni sendiri & timbangan gantung digital"
                    className="mt-1 h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-[#273419] placeholder:text-gray-400 focus:border-[#3D5126] focus:outline-none focus:ring-2 focus:ring-[#3D5126]"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <button
                    type="submit"
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3D5126] px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-[#273419] active:scale-[0.99]"
                  >
                    Ajukan Penjemputan & Kunci Batch Limbah ({formatNumber(pickupWeightKg)} kg)
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 rounded-3xl border border-[#3D5126] bg-white p-6 shadow-md sm:p-8">
                <div className="flex flex-col items-start justify-between gap-3 rounded-2xl bg-[#3D5126] p-5 text-white sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#3D5126]">
                      <CheckIcon className="h-6 w-6" />
                    </span>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#95A87A]">
                        Surat Jalan Sirkular Diterbitkan · #{kodeTiketJemput}
                      </span>
                      <h2 className="text-lg font-extrabold">
                        Jadwal Penjemputan Limbah {listing.jenis} Terkonfirmasi!
                      </h2>
                      <p className="mt-0.5 text-xs text-white/90">
                        Batch limbah milik <strong>{listing.owner}</strong> kini berstatus{" "}
                        <strong>{statusLimbah}</strong> dan siap dijemput sesuai jadwal.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4 text-xs sm:grid-cols-2">
                  <div>
                    <p className="font-bold uppercase tracking-wider text-gray-500">Mitra Pengolah (Penjemput)</p>
                    <p className="mt-1 text-sm font-bold text-[#273419]">{namaInstansi}</p>
                    <p className="text-gray-700">
                      Koordinator: {penanggungJawab} ({noWhatsapp})
                    </p>
                    <p className="mt-1 text-[#3D5126] font-semibold">
                      Hilirisasi: {selectedPlan.title}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold uppercase tracking-wider text-gray-500">Jadwal & Titik Lokasi</p>
                    <p className="mt-1 text-sm font-bold text-[#273419]">
                      {tanggalJemput} · {sesiJemput}
                    </p>
                    <p className="text-gray-700">
                      Lokasi: {listing.owner} — {listing.location}
                    </p>
                    <p className="mt-1 text-gray-700">
                      Armada: <strong>{selectedFleet.name}</strong> ({skemaKompensasi})
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/pasar-sirkular"
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#3D5126] px-5 text-sm font-bold text-white transition-colors hover:bg-[#273419]"
                  >
                    Lihat Batch Limbah Lain di Pasar Sirkular
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setStatusLimbah("Tersedia");
                    }}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Ubah Jadwal Penjemputan
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

export default function JemputLimbah(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] text-[#273419]">
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-12 text-center text-sm font-semibold text-gray-600">
            Memuat halaman penjemputan limbah Pasar Sirkular...
          </main>
        </div>
      }
    >
      <JemputLimbahContent />
    </Suspense>
  );
}
