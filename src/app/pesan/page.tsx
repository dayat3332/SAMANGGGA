import type { Metadata } from "next";
import PesanSekarang from "@/components/katalog/PesanSekarang";

export const metadata: Metadata = {
  title: "Pesan Sekarang | Katalog Rantai Pasok SAMANGGA",
  description:
    "Pesan mangga segar, produk olahan UMKM, dan bibit pohon langsung dari petani dan produsen Indramayu.",
};

export default function PesanPage() {
  return <PesanSekarang />;
}
