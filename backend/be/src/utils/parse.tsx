import { HttpError } from "./httpError.tsx";

export function toId(value: unknown, field = "ID"): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, `${field} tidak valid.`);
  return n;
}

export function toNumberOr(value: unknown, fallback: number): number {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new HttpError(400, "Nilai angka tidak valid.");
  return n;
}

export function toNonNegative(value: unknown, field: string, fallback = 0): number {
  const n = toNumberOr(value, fallback);
  if (n < 0) throw new HttpError(400, `${field} tidak boleh negatif.`);
  return n;
}

export function toPositive(value: unknown, field: string): number {
  const n = toNumberOr(value, NaN);
  if (!Number.isFinite(n) || n <= 0) throw new HttpError(400, `${field} harus lebih dari 0.`);
  return n;
}

export function requireText(value: unknown, field: string, min = 1): string {
  const s = typeof value === "string" ? value.trim() : "";
  if (s.length < min) throw new HttpError(400, `${field} wajib diisi.`);
  return s;
}

export function optionalText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

export function requireOneOf<T extends string>(value: unknown, list: readonly T[], field: string): T {
  if (typeof value !== "string" || !list.includes(value as T))
    throw new HttpError(400, `${field} harus salah satu dari: ${list.join(", ")}.`);
  return value as T;
}

export function optionalOneOf<T extends string>(value: unknown, list: readonly T[], field: string): T | undefined {
  if (value === undefined) return undefined;
  return requireOneOf(value, list, field);
}

export function toTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return value.split(",").map((v) => v.trim()).filter(Boolean);
  return [];
}

export function buildUpdate(
  table: string,
  pkColumn: string,
  pkValue: number,
  data: Record<string, unknown>,
  allowed: readonly string[],
): { sql: string; params: unknown[] } | null {
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      params.push(data[key]);
      sets.push(`${key} = $${params.length}`);
    }
  }
  if (!sets.length) return null;
  params.push(pkValue);
  return { sql: `UPDATE ${table} SET ${sets.join(", ")} WHERE ${pkColumn} = $${params.length}`, params };
}
