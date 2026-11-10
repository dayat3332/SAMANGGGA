import { DEFAULT_PROFILES, ROLE_STORAGE_KEY, type RoleSlug } from "@/data/profil";
import type { PeranPengguna, StatusVerifikasi } from "@/types/samangga";

export interface RegisteredUser {
  id: string;
  email: string;
  namaLengkap: string;
  nomorWhatsapp: string;
  role: RoleSlug;
  roleTitle: string;
  peranErd: PeranPengguna;
  statusVerifikasi: StatusVerifikasi;
  fotoPersyaratanUrl?: string;
  fotoPersyaratanName?: string;
  alasanPenolakan?: string;
  registeredAt: string;
  fromGoogle?: boolean;
  extraData?: Record<string, string | number | boolean>;
}

export const USERS_STORAGE_KEY = "samangga_registered_users_v2";
export const DELETED_EMAILS_STORAGE_KEY = "samangga_deleted_emails_v1";
export const AUTH_CHANGE_EVENT = "samangga_auth_change";

/**
 * Daftar pengguna resmi default ekosistem SAMANGGA (sesuai ERD & tabel Admin #101 - #505)
 */
export const INITIAL_REGISTERED_USERS: RegisteredUser[] = [
  {
    id: "usr_petani_101",
    email: "agus.sumberrejeki@samangga.id",
    namaLengkap: "H. Agus Supriyadi (KT Sumber Rejeki)",
    nomorWhatsapp: "0812-2345-6789",
    role: "petani",
    roleTitle: "Supplier (Petani & Pengepul)",
    peranErd: "Supplier",
    statusVerifikasi: "Terverifikasi",
    registeredAt: "2026-01-12 08:15:00",
    extraData: {
      alamat: "Desa Lohbener Blok Kebun Mangga RT 04/02, Kec. Lohbener, Indramayu",
      alamatPengiriman: "Desa Lohbener Blok Kebun Mangga RT 04/02, Kec. Lohbener, Indramayu",
      luasLahan: 45000,
      komoditasUtama: "Mangga Gedong Gincu & Arumanis Super",
    },
  },
  {
    id: "usr_petani_102",
    email: "kartono.pengepul@samangga.id",
    namaLengkap: "H. Kartono (UD Pengepul Mangga)",
    nomorWhatsapp: "0812-8899-0011",
    role: "petani",
    roleTitle: "Supplier (Petani & Pengepul)",
    peranErd: "Supplier",
    statusVerifikasi: "Menunggu",
    registeredAt: "2026-10-30 15:40:00",
    extraData: {
      alamat: "Pasar Daerah Jatibarang Blok B-12, Kec. Jatibarang, Indramayu",
      alamatPengiriman: "Pasar Daerah Jatibarang Blok B-12, Kec. Jatibarang, Indramayu",
      luasLahan: 12000,
      komoditasUtama: "Mangga Gedong Gincu, Cengkir & Arumanis",
    },
  },
  {
    id: "usr_umkm_202",
    email: "dapur.buning@samangga.id",
    namaLengkap: "Hj. Ningsih Rahmawati (UMKM Dapur Mangga Bu Ning)",
    nomorWhatsapp: "0813-9876-5432",
    role: "umkm",
    roleTitle: "UMKM Pengolah Mangga",
    peranErd: "UMKM",
    statusVerifikasi: "Terverifikasi",
    registeredAt: "2026-02-04 10:30:00",
    extraData: {
      namaUsaha: "UMKM Dapur Mangga Bu Ning",
      nib: "9120301847261",
      kapasitasProduksi: 1200,
      alamat: "Jl. Raya Sindang No. 45, Kec. Indramayu Kota, Kabupaten Indramayu",
      alamatPengiriman: "Jl. Raya Sindang No. 45, Kec. Indramayu Kota, Kabupaten Indramayu",
    },
  },
  {
    id: "usr_umkm_203",
    email: "keripik.barokah@samangga.id",
    namaLengkap: "Siti Masitoh (Camilan Keripik Mangga Barokah)",
    nomorWhatsapp: "0813-2233-4455",
    role: "umkm",
    roleTitle: "UMKM Pengolah Mangga",
    peranErd: "UMKM",
    statusVerifikasi: "Terverifikasi",
    registeredAt: "2026-02-18 11:20:00",
    extraData: {
      namaUsaha: "Camilan Keripik Mangga Barokah",
      nib: "9120301849921",
      kapasitasProduksi: 800,
      alamat: "Sentra Oleh-oleh Losarang No. 18, Kec. Losarang, Indramayu",
      alamatPengiriman: "Sentra Oleh-oleh Losarang No. 18, Kec. Losarang, Indramayu",
    },
  },
  {
    id: "usr_mitra_303",
    email: "operasional@biotanipantura.id",
    namaLengkap: "Ir. Hendra Kusuma (CV Bio Tani Lestari)",
    nomorWhatsapp: "0821-1122-3344",
    role: "mitra",
    roleTitle: "Mitra Limbah & Logistik",
    peranErd: "Mitra",
    statusVerifikasi: "Terverifikasi",
    fotoPersyaratanUrl: "/images/limbah/pupuk_kompos.jpg",
    fotoPersyaratanName: "mou-kerjasama-bio-tani-lestari.jpg",
    registeredAt: "2026-01-19 14:20:00",
    extraData: {
      namaInstansi: "CV Bio Tani Lestari (Bio-Refinery & Logistik)",
      kapasitasPengolahan: 1500,
      jangkauanArea: "Kec. Lohbener, Indramayu Kota, Sliyeg, Jatibarang, Gantar",
      alamat: "Kawasan Agribisnis Terpadu Sliyeg KM 3, Kec. Sliyeg, Indramayu",
      alamatPengiriman: "Kawasan Agribisnis Terpadu Sliyeg KM 3, Kec. Sliyeg, Indramayu",
    },
  },
  {
    id: "usr_mitra_304",
    email: "pantura.bio@samangga.id",
    namaLengkap: "Bambang Sudirja (CV Pantura Bio Organik)",
    nomorWhatsapp: "0822-3344-5566",
    role: "mitra",
    roleTitle: "Mitra Limbah & Logistik",
    peranErd: "Mitra",
    statusVerifikasi: "Menunggu",
    fotoPersyaratanUrl: "/images/limbah/limbah_kulit_mangga.jpg",
    fotoPersyaratanName: "dokumen-lahan-dan-fasilitas-pantura.jpg",
    registeredAt: "2026-11-04 10:30:00",
    extraData: {
      namaInstansi: "CV Pantura Bio Organik",
      kapasitasPengolahan: 1000,
      jangkauanArea: "Jalan Pantura Bypass Cantigi No. 88, Kec. Cantigi, Indramayu",
      alamat: "Jalan Pantura Bypass Cantigi No. 88, Kec. Cantigi, Indramayu",
      alamatPengiriman: "Jalan Pantura Bypass Cantigi No. 88, Kec. Cantigi, Indramayu",
    },
  },
  {
    id: "usr_konsumen_404",
    email: "purchasing@segarbuah.co.id",
    namaLengkap: "Budi Santoso (PT Segar Buah Nusantara)",
    nomorWhatsapp: "0811-2233-4455",
    role: "konsumen",
    roleTitle: "Konsumen (Ritel & Grosir)",
    peranErd: "Konsumen",
    statusVerifikasi: "Terverifikasi",
    registeredAt: "2026-03-01 09:05:00",
    extraData: {
      alamat: "Gudang Distribusi Ritel Modern Jabodetabek, Cakung, Jakarta Timur",
      alamatPengiriman: "Gudang Distribusi Ritel Modern Jabodetabek, Cakung, Jakarta Timur",
    },
  },
  {
    id: "usr_admin_505",
    email: "admin.pusat@samangga.id",
    namaLengkap: "Dr. Raka Pratama, M.Kom.",
    nomorWhatsapp: "0815-8800-9900",
    role: "admin",
    roleTitle: "Admin (Super / Transaksi / Limbah)",
    peranErd: "Admin",
    statusVerifikasi: "Terverifikasi",
    registeredAt: "2026-01-01 07:00:00",
    extraData: {
      divisi: "Tata Kelola Rantai Pasok & Pasar Sirkular",
      nip: "NIP-19910415-202601-1-001",
      alamat: "Gedung Command Center Agribisnis Mangga, Kec. Indramayu, Kab. Indramayu",
    },
  },
];

export function getDeletedEmails(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(DELETED_EMAILS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((e: string) => String(e).trim().toLowerCase()) : [];
  } catch {
    return [];
  }
}

export function isEmailDeleted(email: string): boolean {
  const deleted = getDeletedEmails();
  return deleted.includes(email.trim().toLowerCase());
}

export function getRegisteredUsers(): RegisteredUser[] {
  if (typeof window === "undefined") {
    return [...INITIAL_REGISTERED_USERS];
  }
  try {
    // Bersihkan storage key lama dari browser
    if (window.localStorage.getItem("samangga_registered_users")) {
      window.localStorage.removeItem("samangga_registered_users");
    }

    const deletedEmailsSet = new Set(getDeletedEmails());
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    const storedUsers: RegisteredUser[] = raw ? JSON.parse(raw) : [];

    // Filter pengguna tersimpan yang tidak dihapus
    const validStored = Array.isArray(storedUsers)
      ? storedUsers.filter((u) => !deletedEmailsSet.has(u.email.trim().toLowerCase()))
      : [];

    const storedEmails = new Set(validStored.map((u) => u.email.trim().toLowerCase()));

    // Sertakan akun resmi default SAMANGGA jika belum dihapus dan belum di-override
    const activeInitial = INITIAL_REGISTERED_USERS.filter(
      (u) =>
        !deletedEmailsSet.has(u.email.trim().toLowerCase()) &&
        !storedEmails.has(u.email.trim().toLowerCase())
    );

    return [...validStored, ...activeInitial];
  } catch (err) {
    console.error("Gagal membaca daftar pengguna terdaftar:", err);
    return [...INITIAL_REGISTERED_USERS];
  }
}

export function findUserByEmail(email: string): RegisteredUser | null {
  const normalized = email.trim().toLowerCase();
  if (isEmailDeleted(normalized)) {
    return null;
  }
  const users = getRegisteredUsers();
  return users.find((u) => u.email.trim().toLowerCase() === normalized) ?? null;
}

/**
 * Mencari akun berdasarkan email, nomor WhatsApp, atau ID pengguna
 * Memungkinkan login menggunakan nomor WhatsApp atau email sesuai form login
 */
export function findUserByIdentifier(identifier: string): RegisteredUser | null {
  const query = identifier.trim().toLowerCase();
  if (!query || isEmailDeleted(query)) {
    return null;
  }
  const cleanPhone = query.replace(/\D/g, "");
  const users = getRegisteredUsers();

  return (
    users.find((u) => {
      if (isEmailDeleted(u.email)) return false;
      const uEmail = u.email.trim().toLowerCase();
      if (uEmail === query) return true;
      if (u.id.trim().toLowerCase() === query) return true;

      const numericId = parseInt(u.id.replace(/\D/g, "").slice(-4), 10);
      if (!isNaN(numericId) && (String(numericId) === query || `#${numericId}` === query)) {
        return true;
      }

      if (cleanPhone.length >= 7) {
        const uPhone = (u.nomorWhatsapp || "").replace(/\D/g, "");
        if (uPhone && (uPhone.endsWith(cleanPhone) || cleanPhone.endsWith(uPhone))) {
          return true;
        }
      }
      return false;
    }) ?? null
  );
}

export function deleteRegisteredUser(emailOrId: string | number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const query = String(emailOrId).trim().toLowerCase();
    const allUsers = getRegisteredUsers();

    const target = allUsers.find((u) => {
      const emailMatch = u.email.trim().toLowerCase() === query;
      const idMatch = u.id.trim().toLowerCase() === query;
      const numericId = parseInt(u.id.replace(/\D/g, "").slice(-4), 10);
      const numMatch = !isNaN(numericId) && String(numericId) === query;
      return emailMatch || idMatch || numMatch;
    });

    const targetEmail = target ? target.email.trim().toLowerCase() : (query.includes("@") ? query : "");

    // Simpan ke daftar email yang dihapus agar tidak bisa re-login
    if (targetEmail) {
      const currentDeleted = getDeletedEmails();
      if (!currentDeleted.includes(targetEmail)) {
        window.localStorage.setItem(
          DELETED_EMAILS_STORAGE_KEY,
          JSON.stringify([...currentDeleted, targetEmail]),
        );
      }
    }

    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    const storedUsers: RegisteredUser[] = raw ? JSON.parse(raw) : [];
    const nextUsers = storedUsers.filter((u) => {
      const emailDiff = targetEmail ? u.email.trim().toLowerCase() !== targetEmail : true;
      const idDiff = target ? u.id.trim().toLowerCase() !== target.id.trim().toLowerCase() : true;
      return emailDiff && idDiff;
    });

    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));

    // Kirim sinkronisasi hapus ke database Supabase PostgreSQL
    fetch("/api/hapus-pengguna", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: target?.id || query, email: targetEmail }),
    }).catch((err) => console.error("Gagal sinkronisasi hapus ke database:", err));

    // Jika akun yang dihapus sedang aktif / login di sesi ini, putus sesinya segera
    const activeEmail = getActiveUserEmail();
    if (targetEmail && activeEmail && activeEmail.trim().toLowerCase() === targetEmail) {
      clearActiveRole();
      clearActiveUserEmail();
    }

    notifyAuthChange();
    return true;
  } catch (err) {
    console.error("Gagal menghapus pengguna:", err);
    return false;
  }
}

export function saveRegisteredUser(userData: Omit<RegisteredUser, "id" | "registeredAt">): RegisteredUser {
  // Jika email ini didaftarkan kembali secara bersih via formulir pendaftaran, pulihkan dari daftar deleted emails
  if (typeof window !== "undefined") {
    try {
      const normalizedEmail = userData.email.trim().toLowerCase();
      const currentDeleted = getDeletedEmails().filter((e) => e !== normalizedEmail);
      window.localStorage.setItem(DELETED_EMAILS_STORAGE_KEY, JSON.stringify(currentDeleted));
    } catch {}
  }

  const raw = typeof window !== "undefined" ? window.localStorage.getItem(USERS_STORAGE_KEY) : null;
  const storedUsers: RegisteredUser[] = raw ? JSON.parse(raw) : [];
  const existingIdx = storedUsers.findIndex(
    (u) => u.email.trim().toLowerCase() === userData.email.trim().toLowerCase(),
  );
  const initialUser = INITIAL_REGISTERED_USERS.find(
    (u) => u.email.trim().toLowerCase() === userData.email.trim().toLowerCase(),
  );

  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  const userToSave: RegisteredUser = {
    ...userData,
    id:
      existingIdx >= 0
        ? storedUsers[existingIdx].id
        : initialUser
        ? initialUser.id
        : `usr_${userData.role}_${Date.now()}`,
    registeredAt:
      existingIdx >= 0
        ? storedUsers[existingIdx].registeredAt
        : initialUser
        ? initialUser.registeredAt
        : now,
  };

  let nextUsers: RegisteredUser[];
  if (existingIdx >= 0) {
    nextUsers = [...storedUsers];
    nextUsers[existingIdx] = userToSave;
  } else {
    nextUsers = [userToSave, ...storedUsers];
  }

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
      window.localStorage.setItem(ACTIVE_USER_EMAIL_KEY, userToSave.email.trim().toLowerCase());
      notifyAuthChange();

      // Sinkronisasi data pendaftaran baru ke database Supabase PostgreSQL secara real-time
      fetch("/api/daftar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userToSave),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.user?.id) {
            // Perbarui ID pengguna di local storage dengan ID database resmi
            const updatedUsers = getRegisteredUsers().map((u) =>
              u.email.toLowerCase() === userToSave.email.toLowerCase()
                ? { ...u, id: data.user.id }
                : u
            );
            window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
            notifyAuthChange();
          }
        })
        .catch((err) => console.error("Gagal sinkronisasi pendaftaran ke database:", err));
    } catch (err) {
      console.error("Gagal menyimpan pengguna baru ke localStorage:", err);
    }
  }

  return userToSave;
}

export function updateUserVerification(
  emailOrId: string,
  status: StatusVerifikasi,
  alasanPenolakan?: string,
): RegisteredUser | null {
  const users = getRegisteredUsers();
  const normalized = emailOrId.trim().toLowerCase();
  const idx = users.findIndex(
    (u) => u.email.trim().toLowerCase() === normalized || u.id.trim().toLowerCase() === normalized,
  );
  if (idx < 0) return null;

  const updated: RegisteredUser = {
    ...users[idx],
    statusVerifikasi: status,
    alasanPenolakan: status === "Ditolak" ? (alasanPenolakan || "Foto atau dokumen kemitraan tidak memenuhi syarat") : undefined,
  };

  const nextUsers = [...users];
  nextUsers[idx] = updated;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
      notifyAuthChange();

      // Sinkronisasi status verifikasi ke database Supabase PostgreSQL
      fetch("/api/verifikasi-mitra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updated.id,
          email: updated.email,
          statusVerifikasi: status,
          alasanPenolakan,
        }),
      }).catch((err) => console.error("Gagal sinkronisasi verifikasi ke database:", err));
    } catch (err) {
      console.error("Gagal memperbarui status verifikasi:", err);
    }
  }

  return updated;
}

export function resubmitMitraPhoto(
  emailOrId: string,
  photoUrl: string,
  photoName: string,
): RegisteredUser | null {
  const users = getRegisteredUsers();
  const normalized = emailOrId.trim().toLowerCase();
  const idx = users.findIndex(
    (u) => u.email.trim().toLowerCase() === normalized || u.id.trim().toLowerCase() === normalized,
  );
  if (idx < 0) return null;

  const updated: RegisteredUser = {
    ...users[idx],
    fotoPersyaratanUrl: photoUrl,
    fotoPersyaratanName: photoName,
    statusVerifikasi: "Menunggu",
    alasanPenolakan: undefined,
  };

  const nextUsers = [...users];
  nextUsers[idx] = updated;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
      notifyAuthChange();

      // Sinkronisasi unggah ulang berkas foto ke database Supabase PostgreSQL
      fetch("/api/verifikasi-mitra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updated.id,
          email: updated.email,
          statusVerifikasi: "Menunggu",
          fotoPersyaratanUrl: photoUrl,
          fotoPersyaratanName: photoName,
        }),
      }).catch((err) => console.error("Gagal sinkronisasi resubmit berkas ke database:", err));
    } catch (err) {
      console.error("Gagal mengirim ulang dokumen mitra:", err);
    }
  }

  return updated;
}

export const ACTIVE_USER_EMAIL_KEY = "samangga_active_user_email";

export function getActiveUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_USER_EMAIL_KEY);
}

export function setActiveUserEmail(email: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_USER_EMAIL_KEY, email.trim().toLowerCase());
  notifyAuthChange();
}

export function clearActiveUserEmail(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_USER_EMAIL_KEY);
  notifyAuthChange();
}

export function getActiveRole(): RoleSlug | null {
  if (typeof window === "undefined") return null;
  const savedRole = window.localStorage.getItem(ROLE_STORAGE_KEY) as RoleSlug | null;
  return savedRole && DEFAULT_PROFILES[savedRole] ? savedRole : null;
}

export function setActiveRole(role: RoleSlug): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROLE_STORAGE_KEY, role);
  notifyAuthChange();
}

export function clearActiveRole(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ROLE_STORAGE_KEY);
  window.localStorage.removeItem(ACTIVE_USER_EMAIL_KEY);
  notifyAuthChange();
}

export function notifyAuthChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export function subscribeAuth(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
  };
}

/**
 * Sinkronisasi data pendaftar & mitra dari database server Supabase PostgreSQL ke local state
 * Memungkinkan Admin melihat pendaftar dari HP atau perangkat lain secara global
 */
export async function syncRegisteredUsersFromDatabase(): Promise<RegisteredUser[]> {
  if (typeof window === "undefined") return [];
  try {
    const res = await fetch("/api/daftar", { cache: "no-store" });
    if (!res.ok) return getRegisteredUsers();
    const data = await res.json();

    if (Array.isArray(data?.users)) {
      const dbUsers: RegisteredUser[] = data.users;
      const localUsers = getRegisteredUsers();
      const dbEmails = new Set(dbUsers.map((u) => u.email.trim().toLowerCase()));

      // Pengguna lokal yang belum ada di server (misal dibuat saat koneksi lambat)
      const unsyncedLocal = localUsers.filter((u) => !dbEmails.has(u.email.trim().toLowerCase()));

      // Kirim pendaftar lokal yang belum ada ke server
      if (unsyncedLocal.length > 0) {
        for (const localUser of unsyncedLocal) {
          fetch("/api/daftar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(localUser),
          }).catch(() => {});
        }
      }

      const merged = [...dbUsers, ...unsyncedLocal];
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
      notifyAuthChange();
      return merged;
    }
  } catch (err) {
    console.error("Gagal sinkronisasi pengguna dari database:", err);
  }
  return getRegisteredUsers();
}

export function getAuthSnapshot(): RoleSlug | null {
  return getActiveRole();
}

export function getServerAuthSnapshot(): RoleSlug | null {
  return null;
}
