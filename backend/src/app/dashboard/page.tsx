import type { Metadata } from "next";
import PortalRoleErd from "@/components/profil/PortalRoleErd";

export const metadata: Metadata = {
  title: "Dashboard Role ERD | SAMANGGA",
  description:
    "Portal halaman dashboard untuk masing-masing role ERD SAMANGGA: Supplier, UMKM, Mitra, Konsumen, dan Admin.",
};

export default function DashboardIndexPage() {
  return <PortalRoleErd />;
}
