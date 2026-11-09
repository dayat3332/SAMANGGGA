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
    return [];
  }
  try {
    // Bersihkan storage key lama dari browser
    if (window.localStorage.getItem("samangga_registered_users")) {
      window.localStorage.removeItem("samangga_registered_users");
    }

    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as RegisteredUser[];
    if (Array.isArray(parsed)) {
      const deletedEmailsSet = new Set(getDeletedEmails());
      // Pastikan akun dummy lama dan akun yang telah dihapus tidak dimuat
      const cleanUsers = parsed.filter(
        (u) =>
          u.id !== "usr_mitra_303" &&
          u.id !== "usr_mitra_304" &&
          u.id !== "usr_petani_101" &&
          u.id !== "usr_umkm_202" &&
          u.id !== "usr_konsumen_404" &&
          u.id !== "usr_admin_505" &&
          !u.email.includes("@samangga.id") &&
          !u.email.includes("biotanipantura.id") &&
          !u.email.includes("segarbuah.co.id") &&
          !deletedEmailsSet.has(u.email.trim().toLowerCase())
      );

      if (cleanUsers.length !== parsed.length) {
        window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(cleanUsers));
      }
      return cleanUsers;
    }
    return [];
  } catch (err) {
    console.error("Gagal membaca daftar pengguna terdaftar:", err);
    return [];
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

export function deleteRegisteredUser(emailOrId: string | number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    const users: RegisteredUser[] = raw ? JSON.parse(raw) : [];
    const query = String(emailOrId).trim().toLowerCase();

    const target = users.find((u) => {
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

    const nextUsers = target
      ? users.filter((u) => u.id !== target.id && u.email.trim().toLowerCase() !== targetEmail)
      : (targetEmail ? users.filter((u) => u.email.trim().toLowerCase() !== targetEmail) : users);

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

  const users = getRegisteredUsers();
  const existingIdx = users.findIndex(
    (u) => u.email.trim().toLowerCase() === userData.email.trim().toLowerCase(),
  );

  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  const userToSave: RegisteredUser = {
    ...userData,
    id: existingIdx >= 0 ? users[existingIdx].id : `usr_${userData.role}_${Date.now()}`,
    registeredAt: existingIdx >= 0 ? users[existingIdx].registeredAt : now,
  };

  let nextUsers: RegisteredUser[];
  if (existingIdx >= 0) {
    nextUsers = [...users];
    nextUsers[existingIdx] = userToSave;
  } else {
    nextUsers = [userToSave, ...users];
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
