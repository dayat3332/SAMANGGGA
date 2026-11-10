const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID");

export function formatRupiah(value: number): string {
  return rupiahFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/**
 * Sensor (masking) alamat email untuk perlindungan privasi data pribadi (UU PDP)
 * Contoh: agus.sumberrejeki@samangga.id -> ag***i@samangga.id
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes("@")) return email || "-";
  const [user, domain] = email.split("@");
  if (user.length <= 2) {
    return `${user[0]}*@${domain}`;
  }
  const start = user.slice(0, 2);
  const end = user.length > 5 ? user.slice(-1) : "";
  return `${start}***${end}@${domain}`;
}

/**
 * Sensor (masking) nomor telepon / WhatsApp untuk perlindungan privasi data pribadi (UU PDP)
 * Contoh: 0812-2345-6789 -> 0812-****-6789
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone || phone === "-") return "-";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return phone;
  const start = phone.slice(0, 4);
  const end = phone.slice(-4);
  return `${start}-****-${end}`;
}
