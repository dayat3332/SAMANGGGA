import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "SAMANGGA | Rantai Pasok & Pasar Limbah Sirkular Mangga Indramayu",
  description:
    "Platform web yang menghubungkan petani, UMKM, mitra pengolah limbah, dan konsumen mangga Indramayu dalam satu ekosistem sirkular.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={cn("h-full", "antialiased", outfit.variable, "font-sans")}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
