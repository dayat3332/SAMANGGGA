import type { Metadata } from "next";
import KatalogRantaiPasok from "@/components/katalog/KatalogRantaiPasok";

export const metadata: Metadata = {
  title: "Katalog Rantai Pasok | SAMANGGA",
  description: "Katalog mangga segar, olahan mangga, dan bibit pohon dari petani dan UMKM Indramayu.",
};

export default function KatalogPage() {
  return <KatalogRantaiPasok />;
}
