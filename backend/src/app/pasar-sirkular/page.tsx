import type { Metadata } from "next";
import PasarSirkular from "@/components/pasar-sirkular/PasarSirkular";

export const metadata: Metadata = {
  title: "Pasar Sirkular | SAMANGGA",
  description: "Pasar limbah mangga Indramayu: kulit, biji, daun, dan buah afkir untuk diolah mitra pengolah.",
};

export default function PasarSirkularPage() {
  return <PasarSirkular />;
}
