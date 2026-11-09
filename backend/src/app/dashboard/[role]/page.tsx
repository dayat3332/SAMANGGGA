import { notFound } from "next/navigation";
import ProfilRole from "@/components/profil/ProfilRole";
import type { RoleSlug } from "@/data/profil";

const ROLE_PARAM_MAP: Record<string, RoleSlug> = {
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

export default async function DashboardRolePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  const mapped = ROLE_PARAM_MAP[role.toLowerCase()];
  if (!mapped) {
    notFound();
  }
  return <ProfilRole fixedRole={mapped} />;
}
