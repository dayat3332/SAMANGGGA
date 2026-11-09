import type { Metadata } from "next";
import KeranjangBelanja from "@/components/katalog/KeranjangBelanja";

export const metadata: Metadata = {
  title: "Keranjang Belanja | SAMANGGA",
  description: "Daftar keranjang belanja komoditas mangga segar, olahan, dan bibit pohon SAMANGGA.",
};

export default function KeranjangPage() {
  return <KeranjangBelanja />;
}
