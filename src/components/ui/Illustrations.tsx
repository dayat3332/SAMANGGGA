import type { JSX } from "react";
import type { ProductCategory } from "@/data/katalog";
import type { JenisLimbah } from "@/types/samangga";

/** Ikon placeholder gambar produk katalog dengan visual 3D floating & bayangan. */
export function ImagePlaceholderIcon({ category }: { category: ProductCategory }): JSX.Element {
  if (category === "Bibit Pohon") {
    return (
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="h-24 w-24 sm:h-28 sm:w-28 drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#86EFAC" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
            <linearGradient id="potGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
          </defs>
          <path d="M50 75 Q48 50 50 30" stroke="#78350F" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M50 45 C35 35 30 20 48 22 C52 28 50 38 50 45 Z" fill="url(#leafGrad)" />
          <path d="M50 35 C65 25 70 10 52 12 C48 18 50 28 50 35 Z" fill="url(#leafGrad)" />
          <path d="M50 25 C45 10 55 5 60 15 C58 20 54 22 50 25 Z" fill="#4ADE80" />
          <polygon points="36,70 64,70 60,92 40,92" fill="url(#potGrad)" />
          <rect x="34" y="66" width="32" height="6" rx="2" fill="#B45309" />
        </svg>
      </div>
    );
  }

  if (category === "Olahan Mangga") {
    return (
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="h-24 w-24 sm:h-28 sm:w-28 drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="jarGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <rect x="30" y="32" width="40" height="52" rx="10" fill="url(#jarGrad)" />
          <rect x="34" y="24" width="32" height="10" rx="3" fill="#D97706" />
          <rect x="32" y="22" width="36" height="4" rx="2" fill="#B45309" />
          <rect x="34" y="44" width="32" height="28" rx="4" fill="#FFFFFF" opacity="0.92" />
          <circle cx="50" cy="56" r="6" fill="#EA580C" />
          <line x1="40" y1="66" x2="60" y2="66" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Mangga Segar — visual mangga berdimensi 3D miring dengan drop shadow elegan
  return (
    <div className="relative flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="h-24 w-24 sm:h-28 sm:w-28 drop-shadow-2xl transform -rotate-12 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="mangoSkin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EAB308" />
          </linearGradient>
          <linearGradient id="leafGreen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
        </defs>
        <path
          d="M48 20 C68 20 84 35 80 60 C76 80 58 90 42 86 C26 82 20 66 22 46 C24 28 36 20 48 20 Z"
          fill="url(#mangoSkin)"
        />
        <path
          d="M32 36 C35 30 44 26 52 26"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.45"
          fill="none"
        />
        <path d="M48 20 Q48 10 52 6" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M52 14 C64 8 72 14 70 20 C62 22 56 18 52 14 Z" fill="url(#leafGreen)" />
      </svg>
    </div>
  );
}

/** Ikon visual 3D floating untuk tiap jenis limbah mangga. */
export function WasteIcon({ jenis }: { jenis: JenisLimbah }): JSX.Element {
  if (jenis === "Kulit") {
    return (
      <svg
        viewBox="0 0 100 100"
        className="h-24 w-24 sm:h-28 sm:w-28 drop-shadow-2xl transform -rotate-12 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="peelSkin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EAB308" />
          </linearGradient>
          <linearGradient id="peelInner" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#FDE047" />
          </linearGradient>
        </defs>
        <path
          d="M20 70 C15 45 35 25 60 22 C78 20 85 35 80 50 C75 65 55 60 45 45 C38 35 48 28 58 32 C48 38 45 52 55 65 C62 74 40 82 20 70 Z"
          fill="url(#peelSkin)"
        />
        <path
          d="M26 66 C22 48 38 32 58 28 C52 35 48 48 55 62 C45 68 32 70 26 66 Z"
          fill="url(#peelInner)"
          opacity="0.85"
        />
      </svg>
    );
  }

  if (jenis === "Biji") {
    return (
      <svg
        viewBox="0 0 100 100"
        className="h-24 w-24 sm:h-28 sm:w-28 drop-shadow-2xl transform -rotate-12 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="seedGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="60%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        <path
          d="M32 25 C48 15 72 22 75 42 C78 62 65 82 45 84 C28 85 20 70 22 50 C24 35 28 28 32 25 Z"
          fill="url(#seedGrad)"
        />
        <path d="M35 32 Q50 45 42 72" stroke="#B45309" strokeWidth="2" strokeLinecap="round" opacity="0.35" fill="none" />
        <path d="M46 28 Q62 48 55 76" stroke="#B45309" strokeWidth="2" strokeLinecap="round" opacity="0.35" fill="none" />
        <path d="M58 36 Q68 55 64 68" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" fill="none" />
      </svg>
    );
  }

  if (jenis === "Daun") {
    return (
      <svg
        viewBox="0 0 100 100"
        className="h-24 w-24 sm:h-28 sm:w-28 drop-shadow-2xl transform -rotate-6 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="leafGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
          <linearGradient id="leafGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
        </defs>
        <path d="M35 75 C30 50 45 25 75 18 C70 45 55 68 35 75 Z" fill="url(#leafGrad2)" opacity="0.9" />
        <path d="M28 82 C22 55 35 30 68 20 C64 50 48 75 28 82 Z" fill="url(#leafGrad1)" />
        <path d="M28 82 Q45 55 68 20" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" opacity="0.5" fill="none" />
      </svg>
    );
  }

  // Buah Afkir
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-24 w-24 sm:h-28 sm:w-28 drop-shadow-2xl transform -rotate-12 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="afkirGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="40%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#65A30D" />
        </linearGradient>
      </defs>
      <path
        d="M48 20 C68 20 84 35 80 60 C76 80 58 90 42 86 C26 82 20 66 22 46 C24 28 36 20 48 20 Z"
        fill="url(#afkirGrad)"
      />
      <circle cx="38" cy="54" r="5" fill="#78350F" opacity="0.25" />
      <circle cx="58" cy="62" r="4" fill="#78350F" opacity="0.2" />
      <path d="M48 20 Q48 10 52 6" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}
