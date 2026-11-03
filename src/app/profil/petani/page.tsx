import type { Metadata } from "next";
import ProfilRole from "@/components/profil/ProfilRole";

export const metadata: Metadata = {
  title: "Profil & Workspace Petani (Supplier Hulu) | SAMANGGA",
  description:
    "Kelola pasokan mangga segar, bibit kebun, setoran limbah panen, dan buku keuangan kelompok tani Indramayu.",
};

export default function ProfilPetaniPage() {
  return <ProfilRole fixedRole="petani" />;
}
