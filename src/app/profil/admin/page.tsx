import type { Metadata } from "next";
import ProfilRole from "@/components/profil/ProfilRole";

export const metadata: Metadata = {
  title: "Dashboard & Profil Admin (Super Admin / Transaksi / Limbah) | SAMANGGA",
  description:
    "Halaman kerja Administrator SAMANGGA sesuai ERD: verifikasi akun Pengguna, Produk, Limbah, serta audit Log Sistem.",
};

export default function ProfilAdminPage() {
  return <ProfilRole fixedRole="admin" />;
}
