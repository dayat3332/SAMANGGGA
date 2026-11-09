import { NextResponse } from "next/server";

const RESEND_DEFAULT_OWNER = "2505032@student.polindra.ac.id";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, recipientName, subject, bodyHtml, previewText, type, reason } = body;

    if (!to || !subject) {
      return NextResponse.json(
        { success: false, message: "Field 'to' dan 'subject' wajib diisi." },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const apiKey = process.env.RESEND_API_KEY || "";
    const senderFrom = process.env.RESEND_FROM_EMAIL || "SAMANGGA Indramayu <onboarding@resend.dev>";

    let resendResult: { id?: string } | null = null;
    let resendError: Record<string, unknown> | null = null;
    let effectiveDeliveredTo = to;
    let wasForwardedToSandboxOwner = false;

    if (apiKey) {
      try {
        // Percobaan 1: Kirim langsung ke alamat 'to'
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: senderFrom,
            to: [to],
            subject: subject,
            html: bodyHtml || `<p>${previewText || subject}</p>`,
          }),
        });

        const resendJson = await resendRes.json();
        if (resendRes.ok) {
          resendResult = resendJson;
          effectiveDeliveredTo = to;
        } else {
          resendError = resendJson;
          console.warn("Resend API warning / note:", resendJson);

          // Cek apakah Resend menolak karena akun sandbox hanya boleh kirim ke email pemilik akun
          const isTestingRestriction =
            resendRes.status === 403 ||
            (typeof resendJson?.message === "string" &&
              resendJson.message.toLowerCase().includes("only send testing emails to your own email address"));

          if (isTestingRestriction) {
            // Ambil email pemilik dari pesan error Resend atau default ke email polindra pemilik API key
            const match = resendJson?.message?.match(/\(([^)]+@student\.polindra\.ac\.id|[^)]+@[^)]+)\)/);
            const ownerEmail = match ? match[1] : RESEND_DEFAULT_OWNER;

            console.log(`[Resend Sandbox Fallback] Meneruskan email ke pemilik akun: ${ownerEmail}`);

            const sandboxBanner = `
              <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #92400E; line-height: 1.5;">
                <strong style="display: block; margin-bottom: 4px; font-size: 14px;">📬 [Tembusan Uji Coba Resend Sandbox]</strong>
                Email ini dikirimkan oleh sistem SAMANGGA untuk target: <strong>${to}</strong> (${recipientName || "Pengguna"}).<br/>
                <em>Catatan: Karena domain Resend saat ini masih menggunakan domain uji coba bawaan (<code>onboarding@resend.dev</code>), Resend mewajibkan pengiriman uji coba diteruskan ke inbox pemilik akun (<code>${ownerEmail}</code>).</em>
              </div>
            `;

            const fallbackRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey.trim()}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: senderFrom,
                to: [ownerEmail],
                subject: `[Uji Coba - ${to}] ${subject}`,
                html: sandboxBanner + (bodyHtml || `<p>${previewText || subject}</p>`),
              }),
            });

            const fallbackJson = await fallbackRes.json();
            if (fallbackRes.ok) {
              resendResult = fallbackJson;
              effectiveDeliveredTo = ownerEmail;
              wasForwardedToSandboxOwner = true;
            } else {
              console.error("Resend fallback gagal:", fallbackJson);
            }
          }
        }
      } catch (err: unknown) {
        console.error("Gagal menghubungi server Resend:", err);
      }
    }

    // Log pengiriman email otomatis di server console
    console.log(`\n==================================================`);
    console.log(`📧 [SAMANGGA EMAIL DISPATCHER] ${timestamp}`);
    console.log(`Target Asli   : ${to} (${recipientName || "Pengguna"})`);
    console.log(`Terkirim Ke   : ${effectiveDeliveredTo}${wasForwardedToSandboxOwner ? " (Sandbox Owner Inbox)" : ""}`);
    console.log(`Subject       : ${subject}`);
    console.log(`Type          : ${type || "GENERAL"}`);
    if (reason) {
      console.log(`Reason/Catatan: ${reason}`);
    }
    console.log(
      `Resend Status : ${
        resendResult
          ? `TERKIRIM KE INBOX (Resend ID: ${resendResult.id})`
          : resendError
          ? `LOGGED ERROR (${JSON.stringify(resendError)})`
          : "LOCAL ONLY"
      }`
    );
    console.log(`==================================================\n`);

    return NextResponse.json({
      success: !!resendResult,
      deliveredTo: effectiveDeliveredTo,
      originalRecipient: to,
      wasForwardedToSandboxOwner,
      recipientName,
      subject,
      timestamp,
      resendId: resendResult?.id,
      resendDetails: resendResult || resendError,
      message: wasForwardedToSandboxOwner
        ? `Email berhasil dikirimkan ke inbox pengujian (${effectiveDeliveredTo}) sesuai aturan Sandbox Resend.`
        : `Email notifikasi '${subject}' berhasil diproses dan dikirimkan ke alamat ${effectiveDeliveredTo}.`,
    });
  } catch (error) {
    console.error("Gagal memproses pengiriman email:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal saat mengirim email." },
      { status: 500 }
    );
  }
}
