export type EmailNotificationType =
  | "REGISTRASI_BERHASIL"
  | "VERIFIKASI_DITOLAK_FOTO"
  | "VERIFIKASI_DISETUJUI"
  | "PESANAN_BARU"
  | "PENJEMPUTAN_LIMBAH";

export interface EmailNotification {
  id: string;
  to: string;
  recipientName: string;
  subject: string;
  sender: string;
  date: string;
  type: EmailNotificationType;
  title: string;
  previewText: string;
  bodyHtml: string;
  reason?: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
}

const STORAGE_KEY = "samangga_sent_emails";
export const EMAIL_EVENT = "samangga_email_sent";

export function getEmailNotifications(userEmail?: string): EmailNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: EmailNotification[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    if (!userEmail) return list;
    const norm = userEmail.trim().toLowerCase();
    return list.filter((e) => e.to.trim().toLowerCase() === norm);
  } catch {
    return [];
  }
}

export function markEmailAsRead(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getEmailNotifications();
    const updated = list.map((item) => (item.id === id ? { ...item, isRead: true } : item));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(EMAIL_EVENT));
  } catch {
    // Ignore storage errors
  }
}

export interface SendEmailPayload {
  to: string;
  recipientName: string;
  type: EmailNotificationType;
  role?: string;
  reason?: string;
  extraInfo?: string;
}

export function createEmailTemplate(payload: SendEmailPayload): {
  subject: string;
  title: string;
  previewText: string;
  bodyHtml: string;
  actionUrl?: string;
  actionLabel?: string;
} {
  const { recipientName, type, role, reason, extraInfo } = payload;

  switch (type) {
    case "VERIFIKASI_DITOLAK_FOTO":
      return {
        subject: "[SAMANGGA] Perhatian: Dokumen Foto Kemitraan Anda Perlu Diperbaiki",
        title: "Verifikasi Kemitraan Ditolak (Foto Dokumen Tidak Valid / Buram)",
        previewText: `Halo ${recipientName}, foto dokumen yang Anda unggah belum memenuhi syarat verifikasi: ${reason}`,
        actionUrl: `/profil/${role || "mitra"}`,
        actionLabel: "Unggah Ulang Foto Dokumen",
        bodyHtml: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #3D5126; padding-bottom: 16px; margin-bottom: 20px;">
              <h2 style="color: #273419; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">SAMANGGA Indramayu</h2>
              <p style="color: #6b7280; margin: 4px 0 0; font-size: 12px;">Sistem Rantai Pasok &amp; Bursa Limbah Sirkular Mangga</p>
            </div>
            
            <p style="font-size: 14px; margin-bottom: 12px;">Halo <strong>${recipientName}</strong>,</p>
            
            <p style="font-size: 13px; color: #4b5563; margin-bottom: 16px;">
              Terima kasih telah mendaftar sebagai mitra di platform SAMANGGA. Tim verifikator kami telah meninjau pengajuan akun Anda, namun dokumen foto yang diunggah <strong>belum dapat disetujui</strong>.
            </p>

            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px; border-radius: 6px; margin-bottom: 18px;">
              <h4 style="margin: 0 0 6px 0; color: #991b1b; font-size: 13px; font-weight: 700;">Alasan Penolakan oleh Verifikator:</h4>
              <p style="margin: 0; color: #b91c1c; font-size: 13px; font-weight: 600;">
                "${reason || "Foto dokumen atau fasilitas tidak jelas / buram / tidak terbaca."}"
              </p>
            </div>

            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 14px; border-radius: 8px; margin-bottom: 20px;">
              <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 12px; font-weight: 700;">Panduan Foto yang Memenuhi Syarat:</h4>
              <ul style="margin: 0; padding-left: 18px; color: #4b5563; font-size: 12px;">
                <li style="margin-bottom: 4px;">Pastikan tulisan pada dokumen (NIB / MoU / KTP) terbaca dengan tajam tanpa pantulan cahaya.</li>
                <li style="margin-bottom: 4px;">Jika foto fasilitas/lahan pengolahan limbah, ambil sudut pandang yang memperlihatkan area kerja dan akses jalan armada.</li>
                <li style="margin-bottom: 4px;">Format file: JPG atau PNG (maksimal 2MB).</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 24px 0;">
              <a href="/profil/${role || "mitra"}" style="display: inline-block; background-color: #3D5126; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Unggah Ulang Foto di Dashboard Anda →
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">
              Email otomatis ini dikirim oleh sistem SAMANGGA Indramayu. Jika Anda memiliki pertanyaan, hubungi tim dukungan kami di <a href="mailto:support@samangga.id" style="color: #3D5126;">support@samangga.id</a>.
            </p>
          </div>
        `,
      };

    case "VERIFIKASI_DISETUJUI":
      return {
        subject: "[SAMANGGA] Selamat! Akun Kemitraan Anda Telah Disetujui (Terverifikasi)",
        title: "Akun Mitra Anda Telah Terverifikasi",
        previewText: `Selamat ${recipientName}, akun Anda telah resmi diverifikasi oleh Admin SAMANGGA.`,
        actionUrl: `/profil/${role || "mitra"}`,
        actionLabel: "Masuk ke Dashboard",
        bodyHtml: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #3D5126; padding-bottom: 16px; margin-bottom: 20px;">
              <h2 style="color: #273419; margin: 0; font-size: 20px; font-weight: 800;">SAMANGGA Indramayu</h2>
              <p style="color: #6b7280; margin: 4px 0 0; font-size: 12px;">Sistem Rantai Pasok &amp; Bursa Limbah Sirkular Mangga</p>
            </div>
            
            <p style="font-size: 14px; margin-bottom: 12px;">Halo <strong>${recipientName}</strong>,</p>
            
            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 14px; border-radius: 6px; margin-bottom: 18px;">
              <h3 style="margin: 0 0 4px 0; color: #065f46; font-size: 14px; font-weight: 800;">✓ Pengajuan Kemitraan Anda Disetujui!</h3>
              <p style="margin: 0; color: #047857; font-size: 13px;">
                Dokumen dan profil operasional Anda telah divalidasi. Seluruh fitur platform kini telah aktif.
              </p>
            </div>

            <p style="font-size: 13px; color: #4b5563; margin-bottom: 16px;">
              Anda sekarang dapat mengakses bursa limbah mangga siap jemput, menerbitkan tiket pengiriman, dan bertransaksi langsung dengan UMKM &amp; Petani di Indramayu.
            </p>

            <div style="text-align: center; margin: 24px 0;">
              <a href="/profil/${role || "mitra"}" style="display: inline-block; background-color: #3D5126; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 8px;">
                Buka Dashboard Sekarang →
              </a>
            </div>
          </div>
        `,
      };

    case "REGISTRASI_BERHASIL":
    default:
      return {
        subject: `[SAMANGGA] Selamat Datang di Ekosistem Mangga Indramayu`,
        title: `Pendaftaran Akun ${role?.toUpperCase() || "Pengguna"} Berhasil`,
        previewText: `Halo ${recipientName}, akun Anda telah berhasil terdaftar di SAMANGGA.`,
        actionUrl: `/profil/${role || "petani"}`,
        actionLabel: "Lihat Profil Anda",
        bodyHtml: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #3D5126; padding-bottom: 16px; margin-bottom: 20px;">
              <h2 style="color: #273419; margin: 0; font-size: 20px; font-weight: 800;">SAMANGGA Indramayu</h2>
              <p style="color: #6b7280; margin: 4px 0 0; font-size: 12px;">Ekosistem Rantai Pasok &amp; Hilirisasi Sirkular</p>
            </div>
            
            <p style="font-size: 14px; margin-bottom: 12px;">Halo <strong>${recipientName}</strong>,</p>
            
            <p style="font-size: 13px; color: #4b5563; margin-bottom: 16px;">
              Selamat! Akun Anda telah berhasil terdaftar di platform SAMANGGA dengan peran <strong>${role?.toUpperCase() || "Mitra"}</strong>.
            </p>

            ${
              extraInfo
                ? `<div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 12px; color: #166534;">${extraInfo}</div>`
                : ""
            }

            <p style="font-size: 13px; color: #4b5563; margin-bottom: 20px;">
              Gunakan email ini untuk masuk ke dashboard pribadi dan mulai menikmati layanan rantai pasok agribisnis serta bursa limbah sirkular terpadu.
            </p>

            <div style="text-align: center; margin: 24px 0;">
              <a href="/profil/${role || "petani"}" style="display: inline-block; background-color: #3D5126; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 8px;">
                Masuk ke Dashboard Profil →
              </a>
            </div>
          </div>
        `,
      };
  }
}

export async function sendEmailNotification(payload: SendEmailPayload): Promise<EmailNotification> {
  const template = createEmailTemplate(payload);
  const now = new Date();
  const dateStr = now.toISOString().replace("T", " ").substring(0, 19);

  const newEmail: EmailNotification = {
    id: `eml_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    to: payload.to,
    recipientName: payload.recipientName,
    subject: template.subject,
    sender: "SAMANGGA Official <notifikasi@samangga.id>",
    date: dateStr,
    type: payload.type,
    title: template.title,
    previewText: template.previewText,
    bodyHtml: template.bodyHtml,
    reason: payload.reason,
    actionUrl: template.actionUrl,
    actionLabel: template.actionLabel,
    isRead: false,
  };

  // 1. Simpan ke local storage
  if (typeof window !== "undefined") {
    try {
      const current = getEmailNotifications();
      const updated = [newEmail, ...current];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(EMAIL_EVENT));
    } catch {
      // Ignore
    }
  }

  // 2. Kirim sinyal ke API route /api/send-email (jika ada SMTP aktif)
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: newEmail.to,
        recipientName: newEmail.recipientName,
        subject: newEmail.subject,
        bodyHtml: newEmail.bodyHtml,
        previewText: newEmail.previewText,
        type: newEmail.type,
        reason: newEmail.reason,
      }),
    });
  } catch {
    // Background async dispatch failure is gracefully handled
  }

  return newEmail;
}
