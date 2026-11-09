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
export const AUTH_CHANGE_EVENT = "samangga_auth_change";

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
      // Pastikan akun dummy lama tidak pernah dimuat
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
          !u.email.includes("segarbuah.co.id")
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
  const users = getRegisteredUsers();
  return users.find((u) => u.email.trim().toLowerCase() === normalized) ?? null;
}

export function saveRegisteredUser(userData: Omit<RegisteredUser, "id" | "registeredAt">): RegisteredUser {
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
      notifyAuthChange();
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
    } catch (err) {
      console.error("Gagal mengirim ulang dokumen mitra:", err);
    }
  }

  return updated;
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

export function getAuthSnapshot(): RoleSlug | null {
  return getActiveRole();
}

export function getServerAuthSnapshot(): RoleSlug | null {
  return null;
}
