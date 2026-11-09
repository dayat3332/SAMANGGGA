import { supplierService } from "../services/supplierService.tsx";
import { handle, param } from "../utils/handle.tsx";
import { toId } from "../utils/parse.tsx";

export const supplierController = {
  getProfil: handle(async (req) => ({ data: await supplierService.getProfile(toId(param(req, "id"), "ID pengguna")) })),

  updateProfil: handle(async (req) => ({
    message: "Profil supplier berhasil diperbarui.",
    data: await supplierService.updateProfile(toId(param(req, "id"), "ID pengguna"), req.body),
  })),

  getDashboard: handle(async (req) => ({
    data: await supplierService.getDashboard(toId(param(req, "id"), "ID pengguna")),
  })),

  listProduk: handle(async (req) => {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const kategori = typeof req.query.kategori === "string" ? req.query.kategori : undefined;
    const data = await supplierService.listProduk(toId(param(req, "id"), "ID pengguna"), { search, kategori });
    return { data, extra: { total: data.length } };
  }),

  createProduk: handle(async (req) => {
    const data = await supplierService.createProduk(toId(req.body?.id_user, "ID pengguna"), req.body);
    return { status: 201, message: `Komoditas '${data.nama_produk}' berhasil ditambahkan.`, data };
  }),

  updateProduk: handle(async (req) => {
    const id_user = toId(req.body?.id_user, "ID pengguna");
    const data = await supplierService.updateProduk(id_user, toId(param(req, "id"), "ID produk"), req.body);
    return { message: `Komoditas '${data.nama_produk}' berhasil diperbarui.`, data };
  }),

  removeProduk: handle(async (req) => {
    const id_user = toId(req.body?.id_user ?? req.query.id_user, "ID pengguna");
    const data = await supplierService.removeProduk(id_user, toId(param(req, "id"), "ID produk"));
    return { message: `Komoditas '${data.nama_produk}' berhasil dihapus.`, data };
  }),

  listPesanan: handle(async (req) => {
    const data = await supplierService.listPesanan(toId(param(req, "id"), "ID pengguna"));
    return { data, extra: { total: data.length } };
  }),

  ubahStatusPesanan: handle(async (req) => {
    const id_user = toId(req.body?.id_user, "ID pengguna");
    const data = await supplierService.ubahStatusPesanan(id_user, toId(param(req, "id"), "ID transaksi"), req.body?.status);
    return { message: `Status pesanan #${data.id_transaksi} berhasil diubah menjadi '${data.status}'.`, data };
  }),

  resubmitDokumen: handle(async (req) => ({
    message: "Dokumen supplier berhasil dikirim ulang. Menunggu verifikasi admin.",
    data: await supplierService.resubmitDokumen(toId(param(req, "id"), "ID pengguna"), req.body?.foto_persyaratan_url, req.body?.foto_persyaratan_name),
  })),

  listKeuangan: handle(async (req) => {
    const jenis = typeof req.query.jenis === "string" ? req.query.jenis : undefined;
    return { data: await supplierService.keuangan.list(toId(param(req, "id"), "ID pengguna"), jenis) };
  }),

  createKeuangan: handle(async (req) => ({
    status: 201,
    message: "Catatan keuangan berhasil disimpan.",
    data: await supplierService.keuangan.create(toId(req.body?.id_user, "ID pengguna"), req.body),
  })),

  updateKeuangan: handle(async (req) => ({
    message: "Catatan keuangan berhasil diperbarui.",
    data: await supplierService.keuangan.update(toId(req.body?.id_user, "ID pengguna"), toId(param(req, "id"), "ID keuangan"), req.body),
  })),

  removeKeuangan: handle(async (req) => ({
    message: "Catatan keuangan berhasil dihapus.",
    data: await supplierService.keuangan.remove(toId(req.body?.id_user ?? req.query.id_user, "ID pengguna"), toId(param(req, "id"), "ID keuangan")),
  })),
};
