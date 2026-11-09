import { notFound } from "next/navigation";
import HalamanFungsiRole from "@/components/fungsi/HalamanFungsiRole";
import type { RoleSlug } from "@/data/profil";

const FUNGSI_ROLE_MAP: Record<string, RoleSlug> = {
  supplier: "petani",
  petani: "petani",
  umkm: "umkm",
  mitra: "mitra",
  konsumen: "konsumen",
  admin: "admin",
};

export function generateStaticParams() {
  return [
    { role: "supplier" },
    { role: "petani" },
    { role: "umkm" },
    { role: "mitra" },
    { role: "konsumen" },
    { role: "admin" },
  ];
}

export default async function FungsiRoleDynamicPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  const mapped = FUNGSI_ROLE_MAP[role.toLowerCase()];
  if (!mapped) {
    notFound();
  }
  return <HalamanFungsiRole fixedRole={mapped} />;
}
