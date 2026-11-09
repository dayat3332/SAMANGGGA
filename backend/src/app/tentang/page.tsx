import type { Metadata } from "next";
import TentangKami from "@/components/about/TentangKami";

export const metadata: Metadata = {
  title: "Tentang Kami | SAMANGGA",
  description:
    "Mengenal inisiatif SAMANGGA: Platform B2B rantai pasok dan ekonomi sirkular mangga Indramayu yang menghubungkan petani, UMKM, dan mitra pengolah limbah.",
};

export default function TentangPage() {
  return <TentangKami />;
}
