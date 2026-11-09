"use client";

import React, { useEffect, useState, type JSX } from "react";
import {
  getEmailNotifications,
  markEmailAsRead,
  type EmailNotification,
  EMAIL_EVENT,
} from "@/lib/emailNotification";
import { getActiveUserEmail } from "@/lib/auth";

interface KotakEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmail?: string;
}

export default function KotakEmailModal({
  isOpen,
  onClose,
  targetEmail,
}: KotakEmailModalProps): JSX.Element | null {
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);

  const activeEmail = targetEmail || getActiveUserEmail() || "";

  useEffect(() => {
    const load = () => {
      const list = getEmailNotifications(activeEmail ? activeEmail : undefined);
      setEmails(list);
      if (list.length > 0 && !selectedEmail) {
        setSelectedEmail(list[0]);
      }
    };

    load();
    window.addEventListener(EMAIL_EVENT, load);
    return () => window.removeEventListener(EMAIL_EVENT, load);
  }, [activeEmail, selectedEmail]);

  if (!isOpen) return null;

  const handleSelectEmail = (em: EmailNotification) => {
    setSelectedEmail(em);
    if (!em.isRead) {
      markEmailAsRead(em.id);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 p-3 sm:p-5 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-[#273419] px-5 py-3.5 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-lg">
              📬
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
                Kotak Notifikasi Email Pengguna
              </h3>
              <p className="text-[11px] text-white/80">
                Pemberitahuan otomatis yang dikirimkan ke:{" "}
                <span className="font-mono font-bold text-amber-300">
                  {activeEmail || "Semua Email Terdaftar"}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content 2 Kolom: Daftar Email & Pratinjau Surat */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Kolom Kiri: List Pesan */}
          <div className="w-full md:w-80 border-r border-gray-200 bg-gray-50/70 overflow-y-auto shrink-0">
            <div className="p-3 border-b border-gray-200 bg-white flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">
                Surat Masuk ({emails.length})
              </span>
              <span className="text-[10px] text-gray-400">Real-time sync</span>
            </div>

            {emails.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <span className="text-3xl">📭</span>
                <p className="mt-2 text-xs font-semibold text-gray-600">
                  Belum ada email masuk.
                </p>
                <p className="text-[11px] text-gray-400">
                  Pemberitahuan pendaftaran, verifikasi, atau penolakan foto akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {emails.map((em) => {
                  const isSelected = selectedEmail?.id === em.id;
                  const isWarning = em.type === "VERIFIKASI_DITOLAK_FOTO";
                  return (
                    <button
                      key={em.id}
                      type="button"
                      onClick={() => handleSelectEmail(em)}
                      className={`w-full text-left p-3.5 transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? "bg-white border-l-4 border-l-[#3D5126] shadow-xs"
                          : "hover:bg-gray-100/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            isWarning
                              ? "bg-red-100 text-red-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isWarning ? "⚠️ Perhatian" : "✓ Informasi"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {em.date.split(" ")[1]}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-900 line-clamp-1">
                        {em.subject}
                      </p>
                      <p className="text-[11px] text-gray-500 line-clamp-2">
                        {em.previewText}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Kolom Kanan: Pratinjau Detail Surat Email */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
            {selectedEmail ? (
              <div className="space-y-4">
                {/* Meta Surat */}
                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/60 pb-2">
                    <span className="text-xs font-bold text-gray-800">
                      Pengirim: <span className="font-semibold text-gray-600">{selectedEmail.sender}</span>
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      Waktu Kirim: {selectedEmail.date}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-gray-800">Kepada: </span>
                    <span className="rounded bg-gray-200/70 px-2 py-0.5 font-mono text-[11px] text-gray-900">
                      {selectedEmail.to}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-gray-800">Perihal: </span>
                    <span className="font-bold text-[#273419]">{selectedEmail.subject}</span>
                  </div>
                </div>

                {/* Surat Rendered Body */}
                <div
                  className="rounded-xl border border-gray-100 bg-white p-2"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-gray-400">
                <div>
                  <span className="text-4xl">✉️</span>
                  <p className="mt-2 text-xs font-semibold text-gray-600">
                    Pilih salah satu surat di sebelah kiri untuk melihat isi pesan lengkap.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2.5 text-center text-[11px] text-gray-500 flex items-center justify-between">
          <span>
            💡 <strong>Email Otomatis:</strong> Di server produksi, email ini langsung diteruskan ke inbox Gmail/Yahoo pengguna menggunakan SMTP.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-3 py-1 font-bold text-gray-700 hover:bg-gray-300 transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
