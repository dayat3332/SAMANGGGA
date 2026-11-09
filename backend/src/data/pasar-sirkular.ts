import type { JenisLimbah, StatusLimbah, StatusVerifikasi } from "@/types/samangga";

export type FilterJenis = "Semua" | JenisLimbah;

export interface WasteListing {
  id: number;
  jenis: JenisLimbah;
  owner: string;
  location: string;
  weightKg: number;
  estimatedPrice: number;
  condition: string;
  verification: StatusVerifikasi;
  status: Extract<StatusLimbah, "Tersedia" | "Dipesan">;
  usage: string;
  image?: string;
}

export interface CircularStep {
  title: string;
  description: string;
}

export const WASTE_FILTERS: readonly FilterJenis[] = [
  "Semua",
  "Kulit",
  "Biji",
  "Daun",
  "Buah Afkir",
];

export const CIRCULAR_STEPS: readonly CircularStep[] = [
  { title: "Setor limbah", description: "Petani/UMKM mencatat jenis, berat, dan lokasi limbah." },
  { title: "Diverifikasi", description: "Admin memeriksa data dan foto limbah." },
  { title: "Dijemput mitra", description: "Mitra pengolah memesan dan menjemput ke lokasi." },
];

// Listing Pasar Sirkular (Telah dipindahkan ke Backend 'be/src/seeds/waste.seed.ts')
export const LISTINGS: readonly WasteListing[] = [];

export interface JenisLimbahOption {
  jenis: JenisLimbah;
  ratePerKg: number;
  desc: string;
  usage: string;
}

export const JENIS_LIMBAH_OPTIONS: readonly JenisLimbahOption[] = [
  {
    jenis: "Kulit",
    ratePerKg: 1000,
    desc: "Sisa pengupasan produksi dodol, sirup, keripik, atau jus mangga.",
    usage: "Kompos organik, pakan maggot BSF, ekstraksi pektin",
  },
  {
    jenis: "Biji",
    ratePerKg: 1500,
    desc: "Biji mangga utuh (basah maupun kering) dari pengolahan UMKM atau kebun.",
    usage: "Tepung pati biji mangga, pakan ternak, bibit batang bawah",
  },
  {
    jenis: "Buah Afkir",
    ratePerKg: 2500,
    desc: "Buah jatuh angin, memar sortir, atau grade C yang tidak masuk pasar segar.",
    usage: "Pulp olahan, cuka mangga, fermentasi eco-enzyme, pakan",
  },
  {
    jenis: "Daun",
    ratePerKg: 500,
    desc: "Daun dan ranting kecil hasil pemangkasan rutin pohon mangga kebun.",
    usage: "Kompos hijauan, mulsa organik, briket biomassa",
  },
];

export interface ProcessingPlan {
  id: string;
  title: string;
  badge: string;
  outputExample: string;
}

export const PROCESSING_PLANS: readonly ProcessingPlan[] = [
  {
    id: "kompos-mulsa",
    title: "Pupuk Kompos Organik & Mulsa Kebun",
    badge: "Bio-Kompos",
    outputExample: "Kompos padat 25 kg & pupuk cair organik untuk dikembalikan ke kebun mangga.",
  },
  {
    id: "pakan-maggot-ternak",
    title: "Budidaya Maggot BSF & Pakan Ternak",
    badge: "Bio-Konversi",
    outputExample: "Media pakan larva BSF berprotein tinggi & campuran konsentrat ternak ruminansia.",
  },
  {
    id: "pektin-tepung-biji",
    title: "Ekstraksi Pektin Kulit & Tepung Biji Mangga",
    badge: "Bio-Refinery",
    outputExample: "Bahan baku pengental pangan alami (pektin) dan tepung pati inti biji mangga.",
  },
  {
    id: "eco-enzyme-cuka",
    title: "Eco-Enzyme, Cuka Mangga & Fermentasi",
    badge: "Fermentasi",
    outputExample: "Cairan pembersih ramah lingkungan, biopestisida, atau olahan pangan grade C.",
  },
];

export interface FleetOption {
  id: string;
  name: string;
  capacity: string;
  cost: number;
  note: string;
}

export const FLEET_OPTIONS: readonly FleetOption[] = [
  {
    id: "armada-mitra",
    name: "Armada Jemput Mitra Sendiri (Pickup / Truk Bak)",
    capacity: "Hingga 2.000 kg",
    cost: 0,
    note: "Mitra mengirim kendaraan sendiri langsung ke titik kumpul petani/UMKM.",
  },
  {
    id: "logistik-sirkular-samangga",
    name: "Armada Logistik Sirkular SAMANGGA",
    capacity: "Hingga 1.000 kg",
    cost: 30000,
    note: "Dijemput kurir sirkular SAMANGGA dan diantar ke fasilitas pengolahan mitra.",
  },
  {
    id: "viar-gapoktan",
    name: "Motor Roda Tiga (VIAR) Desa / Gapoktan",
    capacity: "Hingga 350 kg",
    cost: 15000,
    note: "Cocok untuk akses jalan kebun sempit atau penjemputan jarak dekat satu kecamatan.",
  },
];

export type CompensationScheme =
  | "Tebus Tunai / Transfer"
  | "COD Timbang di Lokasi"
  | "Barter Kompos / Bibit";
