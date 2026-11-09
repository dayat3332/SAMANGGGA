import { pool } from "../config/db.tsx";
import { HttpError } from "../utils/httpError.tsx";
import { requireOneOf, optionalText, toPositive, buildUpdate } from "../utils/parse.tsx";

const JENIS = ["Pemasukan", "Pengeluaran"] as const;

function mapRow(r: any) {
  return { ...r, jumlah_uang: Number(r.jumlah_uang) };
}

export const keuanganService = {
  async list(id_user: number, jenis?: string) {
    const params: unknown[] = [id_user];
    let sql = `SELECT * FROM pencatatan_keuangan WHERE id_user = $1`;
    if (jenis && (JENIS as readonly string[]).includes(jenis)) {
      params.push(jenis);
      sql += ` AND jenis_transaksi = $2`;
    }
    sql += ` ORDER BY tgl_pencatatan DESC NULLS LAST, id_keuangan DESC`;
    const { rows } = await pool.query(sql, params);
    const totals = await pool.query(
      `SELECT jenis_transaksi, COALESCE(SUM(jumlah_uang), 0) AS total FROM pencatatan_keuangan WHERE id_user = $1 GROUP BY jenis_transaksi`,
      [id_user],
    );
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    for (const t of totals.rows) {
      if (t.jenis_transaksi === "Pemasukan") totalPemasukan = Number(t.total);
      if (t.jenis_transaksi === "Pengeluaran") totalPengeluaran = Number(t.total);
    }
    const data = rows.map(mapRow);
    return {
      id_user,
      totalPemasukan,
      totalPengeluaran,
      saldoBersih: totalPemasukan - totalPengeluaran,
      totalCatatan: data.length,
      ringkasan: { totalPemasukan, totalPengeluaran, saldoKas: totalPemasukan - totalPengeluaran },
      total: data.length,
      data,
    };
  },

  async create(id_user: number, body: any) {
    const jenis = requireOneOf(body?.jenis_transaksi, JENIS, "Jenis transaksi");
    const jumlah = toPositive(body?.jumlah_uang, "Jumlah uang");
    const keterangan = optionalText(body?.keterangan);
    const { rows } = await pool.query(
      `INSERT INTO pencatatan_keuangan (id_user, jenis_transaksi, jumlah_uang, keterangan) VALUES ($1, $2, $3, $4) RETURNING *`,
      [id_user, jenis, jumlah, keterangan],
    );
    return mapRow(rows[0]);
  },

  async update(id_user: number, id_keuangan: number, body: any) {
    const existing = await pool.query(
      `SELECT * FROM pencatatan_keuangan WHERE id_keuangan = $1 AND id_user = $2`,
      [id_keuangan, id_user],
    );
    if (!existing.rows[0]) throw new HttpError(404, "Catatan keuangan tidak ditemukan.");
    const data: Record<string, unknown> = {};
    if (body?.jenis_transaksi !== undefined) data.jenis_transaksi = requireOneOf(body.jenis_transaksi, JENIS, "Jenis transaksi");
    if (body?.jumlah_uang !== undefined) data.jumlah_uang = toPositive(body.jumlah_uang, "Jumlah uang");
    if (body?.keterangan !== undefined) data.keterangan = optionalText(body.keterangan);
    const upd = buildUpdate("pencatatan_keuangan", "id_keuangan", id_keuangan, data, ["jenis_transaksi", "jumlah_uang", "keterangan"]);
    if (upd) await pool.query(upd.sql, upd.params);
    const { rows } = await pool.query(`SELECT * FROM pencatatan_keuangan WHERE id_keuangan = $1`, [id_keuangan]);
    return mapRow(rows[0]);
  },

  async remove(id_user: number, id_keuangan: number) {
    const { rows } = await pool.query(
      `DELETE FROM pencatatan_keuangan WHERE id_keuangan = $1 AND id_user = $2 RETURNING *`,
      [id_keuangan, id_user],
    );
    if (!rows[0]) throw new HttpError(404, "Catatan keuangan tidak ditemukan.");
    return mapRow(rows[0]);
  },
};

