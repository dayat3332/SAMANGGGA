import type { Metadata } from "next";
import DaftarMitra from "@/components/auth/DaftarMitra";

export const metadata: Metadata = {
  title: "Pendaftaran Kemitraan | SAMANGGA",
  description:
    "Daftar sebagai mitra Petani, UMKM, Pengolah Limbah Sirkular, atau Konsumen dalam ekosistem mangga Indramayu SAMANGGA.",
};

export default function DaftarPage() {
  return <DaftarMitra />;
}
