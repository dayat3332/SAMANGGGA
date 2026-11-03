import type { Metadata } from "next";
import ProfilRole from "@/components/profil/ProfilRole";

export const metadata: Metadata = {
  title: "Profil & Workspace Konsumen & Ritel | SAMANGGA",
  description:
    "Kelola riwayat pesanan mangga segar dan produk olahan UMKM, alamat pengiriman utama, serta langganan grosir.",
};

export default function ProfilKonsumenPage() {
  return <ProfilRole fixedRole="konsumen" />;
}
