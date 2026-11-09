import { HttpError } from "../utils/httpError.tsx";

export type Db = { query: (text: string, params?: any[]) => Promise<any> };

export async function assertRole(db: Db, id_user: number, peran: string): Promise<any> {
  const { rows } = await db.query(
    `SELECT id_user, nama_lengkap, peran, status_verifikasi FROM pengguna WHERE id_user = $1`,
    [id_user],
  );
  const user = rows[0];
  if (!user) throw new HttpError(404, "Pengguna tidak ditemukan.");
  if (user.peran !== peran) throw new HttpError(403, `Akun ini tidak berperan sebagai ${peran}.`);
  return user;
}

export async function ensureSupplier(db: Db, id_user: number): Promise<void> {
  await db.query(`INSERT INTO supplier (id_user) VALUES ($1) ON CONFLICT (id_user) DO NOTHING`, [id_user]);
}

export async function ensureKonsumen(db: Db, id_user: number): Promise<void> {
  await db.query(`INSERT INTO konsumen (id_user) VALUES ($1) ON CONFLICT (id_user) DO NOTHING`, [id_user]);
}

export async function logAktivitas(
  db: Db,
  id_user: number,
  aksi: string,
  endpoint: string,
  pesan: string,
  level: "Info" | "Warning" | "Error" = "Info",
  kode_status = 200,
): Promise<void> {
  await db.query(
    `INSERT INTO log_sistem (id_user, level, aksi, endpoint_api, kode_status, pesan) VALUES ($1, $2, $3, $4, $5, $6)`,
    [id_user, level, aksi, endpoint, kode_status, pesan],
  );
}
