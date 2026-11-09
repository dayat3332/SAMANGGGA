import { konsumenService } from "../services/konsumenService.tsx";
import { handle, param } from "../utils/handle.tsx";
import { toId } from "../utils/parse.tsx";

export const konsumenController = {
  getProfil: handle(async (req) => ({ data: await konsumenService.getProfile(toId(param(req, "id"), "ID pengguna")) })),

  updateProfil: handle(async (req) => ({
    message: "Profil konsumen berhasil diperbarui.",
    data: await konsumenService.updateProfile(toId(param(req, "id"), "ID pengguna"), req.body),
  })),

  getDashboard: handle(async (req) => ({
    data: await konsumenService.getDashboard(toId(param(req, "id"), "ID pengguna")),
  })),

  katalog: handle(async (req) => {
    const kategori = typeof req.query.kategori === "string" ? req.query.kategori : undefined;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const data = await konsumenService.katalog({ kategori, search });
    return { data, extra: { total: data.length } };
  }),

  listPesanan: handle(async (req) => {
    const data = await konsumenService.listPesanan(toId(param(req, "id"), "ID pengguna"));
    return { data, extra: { total: data.length } };
  }),

  detailPesanan: handle(async (req) => ({
    data: await konsumenService.detailPesanan(toId(req.query.id_user, "ID pengguna"), toId(param(req, "id"), "ID transaksi")),
  })),

  buatPesanan: handle(async (req) => {
    const data = await konsumenService.buatPesanan(toId(req.body?.id_user, "ID pengguna"), req.body);
    const total = data.reduce((s: number, t: any) => s + Number(t.total_harga), 0);
    return {
      status: 201,
      message: data.length > 1 ? `${data.length} pesanan berhasil dibuat (dipisah per penjual).` : "Pesanan berhasil dibuat.",
      data,
      extra: { total_bayar: total },
    };
  }),

  konfirmasiBayar: handle(async (req) => ({
    message: "Pembayaran pesanan berhasil dikonfirmasi.",
    data: await konsumenService.konfirmasiBayar(toId(req.body?.id_user, "ID pengguna"), toId(param(req, "id"), "ID transaksi")),
  })),

  ubahStatusPesanan: handle(async (req) => {
    const data = await konsumenService.ubahStatusPesanan(toId(req.body?.id_user, "ID pengguna"), toId(param(req, "id"), "ID transaksi"), req.body?.status);
    return { message: `Status pesanan #${data.id_transaksi} berhasil diubah menjadi '${data.status}'.`, data };
  }),

  listKeuangan: handle(async (req) => {
    const jenis = typeof req.query.jenis === "string" ? req.query.jenis : undefined;
    return { data: await konsumenService.keuangan.list(toId(param(req, "id"), "ID pengguna"), jenis) };
  }),

  createKeuangan: handle(async (req) => ({
    status: 201,
    message: "Catatan keuangan berhasil disimpan.",
    data: await konsumenService.keuangan.create(toId(req.body?.id_user, "ID pengguna"), req.body),
  })),

  updateKeuangan: handle(async (req) => ({
    message: "Catatan keuangan berhasil diperbarui.",
    data: await konsumenService.keuangan.update(toId(req.body?.id_user, "ID pengguna"), toId(param(req, "id"), "ID keuangan"), req.body),
  })),

  removeKeuangan: handle(async (req) => ({
    message: "Catatan keuangan berhasil dihapus.",
    data: await konsumenService.keuangan.remove(toId(req.body?.id_user ?? req.query.id_user, "ID pengguna"), toId(param(req, "id"), "ID keuangan")),
  })),
};
