import type { Metadata } from "next";
import ProfilRole from "@/components/profil/ProfilRole";

export const metadata: Metadata = {
  title: "Profil & Workspace UMKM Pengolah | SAMANGGA",
  description:
    "Kelola etalase produk olahan mangga, suplai bahan baku dari petani, dan setoran residu kulit/biji dapur produksi.",
};

export default function ProfilUmkmPage() {
  return <ProfilRole fixedRole="umkm" />;
}
