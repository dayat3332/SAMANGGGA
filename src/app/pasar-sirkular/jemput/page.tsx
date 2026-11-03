import type { Metadata } from "next";
import JemputLimbah from "@/components/pasar-sirkular/JemputLimbah";

export const metadata: Metadata = {
  title: "Ajukan Penjemputan Limbah | Pasar Sirkular SAMANGGA",
  description:
    "Jadwalkan penjemputan limbah kulit, biji, daun, dan buah afkir mangga dari petani dan UMKM Indramayu.",
};

export default function JemputLimbahPage() {
  return <JemputLimbah />;
}
