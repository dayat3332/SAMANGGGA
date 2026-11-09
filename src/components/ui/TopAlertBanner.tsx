"use client";

import Link from "next/link";
import type { JSX } from "react";
import { ArrowRightIcon } from "@/components/ui/Icons";

export type BannerVariant = "warning" | "danger" | "info" | "success";

export interface TopAlertBannerProps {
  variant: BannerVariant;
  title: string;
  message: string;
  onClose?: () => void;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function TopAlertBanner({
  variant,
  title,
  message,
  onClose,
  primaryAction,
  secondaryAction,
  className = "",
}: TopAlertBannerProps): JSX.Element {
  const isWarning = variant === "warning";
  const isDanger = variant === "danger";

  const colorStyles = isWarning
    ? "border-amber-400 bg-gradient-to-r from-amber-50 via-amber-100/90 to-yellow-50 text-amber-950 shadow-md ring-1 ring-amber-400/30"
    : isDanger
    ? "border-red-400 bg-gradient-to-r from-red-50 via-rose-100/90 to-red-50 text-red-950 shadow-md ring-1 ring-red-400/30"
    : "border-emerald-400 bg-emerald-50 text-emerald-950 shadow-md ring-1 ring-emerald-400/30";

  const badgeStyles = isWarning
    ? "bg-amber-500 text-white"
    : isDanger
    ? "bg-red-600 text-white"
    : "bg-emerald-600 text-white";

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`sticky top-14 z-40 mx-auto w-full max-w-6xl px-4 py-2 sm:px-6 transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${className}`}
    >
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border p-3.5 sm:p-4 ${colorStyles}`}
      >
        <div className="flex items-start gap-3 min-w-0">
          <span
            className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-bold shadow-xs ${badgeStyles}`}
          >
            {isWarning ? "⚠️" : isDanger ? "🚨" : "✓"}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${badgeStyles}`}>
                {isWarning ? "Peringatan Verifikasi" : isDanger ? "Akses Dibatasi" : "Informasi"}
              </span>
              <h2 className="text-sm font-extrabold tracking-tight">{title}</h2>
            </div>
            <p className="mt-1 text-xs leading-relaxed opacity-90 sm:text-sm">{message}</p>
          </div>
        </div>

        <div className="flex w-full sm:w-auto items-center justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t border-black/5 sm:border-t-0">
          {secondaryAction && (
            secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-bold transition-all hover:bg-white active:scale-95"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-bold transition-all hover:bg-white active:scale-95"
              >
                {secondaryAction.label}
              </button>
            )
          )}

          {primaryAction && (
            primaryAction.href ? (
              <Link
                href={primaryAction.href}
                className={`inline-flex items-center gap-1.5 justify-center rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-xs transition-all active:scale-95 ${
                  isWarning
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : isDanger
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <span>{primaryAction.label}</span>
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className={`inline-flex items-center gap-1.5 justify-center rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-xs transition-all active:scale-95 ${
                  isWarning
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : isDanger
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <span>{primaryAction.label}</span>
                <ArrowRightIcon className="h-3 w-3" />
              </button>
            )
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup notifikasi"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-black/50 hover:bg-black/10 hover:text-black transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
