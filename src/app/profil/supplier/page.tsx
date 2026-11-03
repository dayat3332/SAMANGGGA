import type { Metadata } from "next";
import ProfilRole from "@/components/profil/ProfilRole";

export const metadata: Metadata = {
  title: "Dashboard & Profil Supplier (Petani & Pengepul) | SAMANGGA",
  description:
    "Halaman kerja Supplier sesuai ERD: kelola Produk (Buah), Transaksi penjualan, konfirmasi Pembayaran Transfer Manual, dan Pencatatan Keuangan.",
};

export default function ProfilSupplierPage() {
  return <ProfilRole fixedRole="petani" />;
}
