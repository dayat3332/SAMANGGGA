import type { Metadata } from "next";
import SetorLimbah from "@/components/pasar-sirkular/SetorLimbah";

export const metadata: Metadata = {
  title: "Setor Limbah Saya | Pasar Sirkular SAMANGGA",
  description:
    "Catatkan limbah kulit, biji, daun, dan buah afkir mangga dari kebun atau UMKM Anda untuk dijemput mitra pengolah.",
};

export default function SetorLimbahPage() {
  return <SetorLimbah />;
}
