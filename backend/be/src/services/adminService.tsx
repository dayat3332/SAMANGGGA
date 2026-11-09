import { prisma } from "../config/prisma.tsx";

export const adminService = {
  async getDashboardMetrics(): Promise<any> {
    const [
      totalPengguna,
      supplierCount,
      umkmCount,
      mitraCount,
      konsumenCount,
      adminCount,
      menungguCount,
      terverifikasiCount,
      ditolakCount,
      totalProduk,
      limbahAgg,
      transaksiAgg,
      recentLogsRaw,
    ] = await Promise.all([
      prisma.pengguna.count(),
      prisma.pengguna.count({ where: { peran: "Supplier" } }),
      prisma.pengguna.count({ where: { peran: "UMKM" } }),
      prisma.pengguna.count({ where: { peran: "Mitra" } }),
      prisma.pengguna.count({ where: { peran: "Konsumen" } }),
      prisma.pengguna.count({ where: { peran: "Admin" } }),
      prisma.pengguna.count({ where: { status_verifikasi: "Menunggu" } }),
      prisma.pengguna.count({ where: { status_verifikasi: "Terverifikasi" } }),
      prisma.pengguna.count({ where: { status_verifikasi: "Ditolak" } }),
      prisma.produk.count(),
      prisma.limbah.aggregate({
        _count: { id_limbah: true },
        _sum: { berat_kg: true },
      }),
      prisma.transaksi.aggregate({
        _count: { id_transaksi: true },
        _sum: { total_harga: true },
      }),
      prisma.log_sistem.findMany({
        take: 5,
        orderBy: { waktu: "desc" },
        include: {
          pengguna: {
            select: {
              nama_lengkap: true,
              peran: true,
            },
          },
        },
      }),
    ]);

    const recentLogs = recentLogsRaw.map((l) => ({
      ...l,
      nama_user: l.pengguna?.nama_lengkap || null,
      peran_user: l.pengguna?.peran || null,
    }));

    return {
      totalPengguna,
      peranCounts: {
        Supplier: supplierCount,
        UMKM: umkmCount,
        Mitra: mitraCount,
        Konsumen: konsumenCount,
        Admin: adminCount,
      },
      statusCounts: {
        menunggu: menungguCount,
        terverifikasi: terverifikasiCount,
        ditolak: ditolakCount,
      },
      totalProduk,
      totalLimbahKg: Number(limbahAgg._sum.berat_kg || 0),
      totalTransaksi: transaksiAgg._count.id_transaksi || 0,
      totalNominalTransaksi: Number(transaksiAgg._sum.total_harga || 0),
      recentLogs,
    };
  },

  async getVerifikasiList(
    options: {
      peran?: string;
      status?: string;
      search?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<any> {
    const { peran, status, search, limit = 50, offset = 0 } = options;
    const where: any = {};

    if (status) {
      where.status_verifikasi = status;
    }

    if (peran) {
      where.peran = peran;
    }

    if (search) {
      where.OR = [
        { nama_lengkap: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.pengguna.findMany({
        where,
        include: {
          mitra: true,
          umkm: true,
          supplier: true,
        },
        orderBy: [{ tgl_daftar: "desc" }],
        take: limit,
        skip: offset,
      }),
      prisma.pengguna.count({ where }),
    ]);

    const data = users.map((u) => ({
      id_user: u.id_user,
      nama_lengkap: u.nama_lengkap,
      peran: u.peran,
      email: u.email,
      no_telp: u.no_telp,
      alamat: u.alamat,
      status_verifikasi: u.status_verifikasi,
      foto_persyaratan_url: u.foto_persyaratan_url,
      foto_persyaratan_name: u.foto_persyaratan_name,
      alasan_penolakan: u.alasan_penolakan,
      tgl_daftar: u.tgl_daftar,
      nama_mitra_instansi: u.mitra?.nama_mitra_instansi || null,
      jenis_pengolahan_limbah: u.mitra?.jenis_pengolahan_limbah || null,
      kapasitas_tampung_limbah_kg: u.mitra?.kapasitas_tampung_limbah_kg || null,
      nama_usaha_umkm: u.umkm?.nama_usaha || null,
      nib: u.umkm?.nib || null,
      tipe_supplier: u.supplier?.tipe_supplier || null,
      jenis_komoditas_utama: u.supplier?.jenis_komoditas_utama || null,
    }));

    return {
      total,
      limit,
      offset,
      data,
    };
  },

  async approveUser(id_user: number, admin_id?: number): Promise<any> {
    const user = await prisma.pengguna.findUnique({
      where: { id_user },
    });

    if (!user) {
      throw new Error(`Pengguna dengan ID ${id_user} tidak ditemukan.`);
    }

    const updated = await prisma.pengguna.update({
      where: { id_user },
      data: {
        status_verifikasi: "Terverifikasi",
        alasan_penolakan: null,
      },
      select: {
        id_user: true,
        nama_lengkap: true,
        peran: true,
        email: true,
        status_verifikasi: true,
      },
    });

    await prisma.log_sistem.create({
      data: {
        id_user: admin_id || null,
        level: "Info",
        aksi: "VERIFIKASI_SETUJUI",
        endpoint_api: "/api/v1/admin/verifikasi/setujui",
        kode_status: 200,
        pesan: `Admin menyetujui akun [${updated.peran}] ${updated.nama_lengkap} (${updated.email}).`,
      },
    });

    return updated;
  },

  async rejectUser(id_user: number, alasan: string, admin_id?: number): Promise<any> {
    if (!alasan || !alasan.trim()) {
      throw new Error("Alasan penolakan wajib disertakan.");
    }

    const user = await prisma.pengguna.findUnique({
      where: { id_user },
    });

    if (!user) {
      throw new Error(`Pengguna dengan ID ${id_user} tidak ditemukan.`);
    }

    const updated = await prisma.pengguna.update({
      where: { id_user },
      data: {
        status_verifikasi: "Ditolak",
        alasan_penolakan: alasan.trim(),
      },
      select: {
        id_user: true,
        nama_lengkap: true,
        peran: true,
        email: true,
        status_verifikasi: true,
        alasan_penolakan: true,
      },
    });

    await prisma.log_sistem.create({
      data: {
        id_user: admin_id || null,
        level: "Warning",
        aksi: "VERIFIKASI_TOLAK",
        endpoint_api: "/api/v1/admin/verifikasi/tolak",
        kode_status: 200,
        pesan: `Admin menolak akun [${updated.peran}] ${updated.nama_lengkap}. Alasan: "${alasan}"`,
      },
    });

    return updated;
  },

  async getAuditLogs(
    options: { level?: string; limit?: number; offset?: number } = {}
  ): Promise<any> {
    const { level, limit = 50, offset = 0 } = options;
    const where: any = {};

    if (level) {
      where.level = level;
    }

    const [logs, total] = await Promise.all([
      prisma.log_sistem.findMany({
        where,
        include: {
          pengguna: {
            select: {
              nama_lengkap: true,
              peran: true,
              email: true,
            },
          },
        },
        orderBy: { waktu: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.log_sistem.count({ where }),
    ]);

    const data = logs.map((l) => ({
      ...l,
      nama_user: l.pengguna?.nama_lengkap || null,
      peran_user: l.pengguna?.peran || null,
      email_user: l.pengguna?.email || null,
    }));

    return {
      total,
      data,
    };
  },
};
