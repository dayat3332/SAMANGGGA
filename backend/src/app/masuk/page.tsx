import type { Metadata } from "next";
import LoginPage from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Masuk Akun Kemitraan | SAMANGGA",
  description: "Masuk ke platform kemitraan B2B dan pasar sirkular mangga Indramayu SAMANGGA.",
};

export default function Page() {
  return <LoginPage />;
}
