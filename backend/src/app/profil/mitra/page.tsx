import type { Metadata } from "next";
import ProfilRole from "@/components/profil/ProfilRole";

export const metadata: Metadata = {
  title: "Profil & Workspace Mitra Sirkular (Bio-Refinery) | SAMANGGA",
  description:
    "Kelola jadwal penjemputan limbah mangga, kapasitas olah harian, konversi kompos/maggot/pektin, dan metrik emisi.",
};

export default function ProfilMitraPage() {
  return <ProfilRole fixedRole="mitra" />;
}
