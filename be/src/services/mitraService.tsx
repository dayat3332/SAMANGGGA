import { prisma } from "../config/prisma.tsx";

export const mitraService = {
  /**
   * Mengambil data profil Mitra berdasarkan id_user atau id_mitra
   */
  async getProfile(identifier: { id_user?: number; id_mitra?: number }): Promise<any> {
    const mitra = await prisma.mitra.findFirst({
      where: identifier.id_user
        ? { id_user: identifier.id_user }
        : { id_mitra: identifier.id_mitra },
      include: {
        pengguna: true,
      },
    });

    if (!mitra) return null;

    return {
      id_mitra: mitra.id_mitra,
      id_user: mitra.id_user,
      nama_mitra_instansi: mitra.nama_mitra_instansi,
      no_telp_mitra: mitra.no_telp,
      jenis_pengolahan_limbah: mitra.jenis_pengolahan_limbah,
      kapasitas_tampung_limbah_kg: mitra.kapasitas_tampung_limbah_kg,
      jangkauan_area: mitra.jangkauan_area,
      nama_bank: mitra.nama_bank,
      no_rekening: mitra.no_rekening,
      nama_lengkap: mitra.pengguna.nama_lengkap,
      email: mitra.pengguna.email,
      no_telp_user: mitra.pengguna.no_telp,
      alamat: mitra.pengguna.alamat,
      peran: mitra.pengguna.peran,
      status_verifikasi: mitra.pengguna.status_verifikasi,
      foto_persyaratan_url: mitra.pengguna.foto_persyaratan_url,
      foto_persyaratan_name: mitra.pengguna.foto_persyaratan_name,
      alasan_penolakan: mitra.pengguna.alasan_penolakan,
      tgl_daftar: mitra.pengguna.tgl_daftar,
    };
  },

  /**
   * Mengambil semua daftar mitra (untuk publik & admin)
   */
  async getAllMitra(status?: string): Promise<any[]> {
    const mitras = await prisma.mitra.findMany({
      where: status
        ? {
            pengguna: {
              status_verifikasi: status,
            },
          }
        : {},
      include: {
        pengguna: true,
      },
      orderBy: { id_mitra: "asc" },
    });

    return mitras.map((m) => ({
      id_mitra: m.id_mitra,
      id_user: m.id_user,
      nama_mitra_instansi: m.nama_mitra_instansi,
      jenis_pengolahan_limbah: m.jenis_pengolahan_limbah,
      kapasitas_tampung_limbah_kg: m.kapasitas_tampung_limbah_kg,
      jangkauan_area: m.jangkauan_area,
      no_telp: m.no_telp,
      nama_lengkap: m.pengguna.nama_lengkap,
      email: m.pengguna.email,
      alamat: m.pengguna.alamat,
      status_verifikasi: m.pengguna.status_verifikasi,
      tgl_daftar: m.pengguna.tgl_daftar,
    }));
  },

  /**
   * Memperbarui profil mitra
   */
  async updateProfile(id_user: number, data: any): Promise<any> {
    const updateMitraData: any = {};
    if (data.nama_mitra_instansi !== undefined) updateMitraData.nama_mitra_instansi = data.nama_mitra_instansi;
    if (data.no_telp !== undefined) updateMitraData.no_telp = data.no_telp;
    if (data.jenis_pengolahan_limbah !== undefined) updateMitraData.jenis_pengolahan_limbah = data.jenis_pengolahan_limbah;
    if (data.kapasitas_tampung_limbah_kg !== undefined) updateMitraData.kapasitas_tampung_limbah_kg = Number(data.kapasitas_tampung_limbah_kg);
    if (data.jangkauan_area !== undefined) updateMitraData.jangkauan_area = data.jangkauan_area;
    if (data.nama_bank !== undefined) updateMitraData.nama_bank = data.nama_bank;
    if (data.no_rekening !== undefined) updateMitraData.no_rekening = data.no_rekening;

    if (Object.keys(updateMitraData).length > 0) {
      await prisma.mitra.update({
        where: { id_user },
        data: updateMitraData,
      });
    }

    if (data.alamat || data.no_telp) {
      const updatePenggunaData: any = {};
      if (data.alamat !== undefined) updatePenggunaData.alamat = data.alamat;
      if (data.no_telp !== undefined) updatePenggunaData.no_telp = data.no_telp;

      await prisma.pengguna.update({
        where: { id_user },
        data: updatePenggunaData,
      });
    }

    return this.getProfile({ id_user });
  },

  /**
   * Dashboard & Statistik Operasional Mitra
   */
  async getDashboard(id_mitra: number): Promise<any> {
    const profile = await this.getProfile({ id_mitra });
    if (!profile) {
      throw new Error(`Mitra dengan ID ${id_mitra} tidak ditemukan.`);
    }

    const kapasitas = profile.kapasitas_tampung_limbah_kg || 0;

    const [diolahAgg, antreanCount, bursaCount, shipAktifCount, shipSelesaiCount] =
      await Promise.all([
        prisma.limbah.aggregate({
          where: {
            id_mitra,
            status_jemput: "Selesai",
          },
          _sum: {
            berat_kg: true,
            harga_kesepakatan: true,
            estimasi_harga: true,
          },
        }),
        prisma.limbah.count({
          where: {
            id_mitra,
            status_jemput: { in: ["Diajukan", "Proses"] },
          },
        }),
        prisma.limbah.count({
          where: {
            status_jemput: "Tersedia",
            status_verifikasi: "Terverifikasi",
          },
        }),
        prisma.riwayat_pengiriman.count({
          where: {
            id_mitra,
            status_pengiriman: { in: ["Diproses", "Dalam Perjalanan"] },
          },
        }),
        prisma.riwayat_pengiriman.count({
          where: {
            id_mitra,
            status_pengiriman: "Tiba di Lokasi",
          },
        }),
      ]);

    const totalKg = Number(diolahAgg._sum.berat_kg || 0);
    const totalKompensasi = Number(
      diolahAgg._sum.harga_kesepakatan ?? diolahAgg._sum.estimasi_harga ?? 0
    );
    const persentase = kapasitas > 0 ? Math.min(100, Math.round((totalKg / kapasitas) * 100)) : 0;

    return {
      id_mitra,
      nama_mitra_instansi: profile.nama_mitra_instansi,
      kapasitasTampungKg: kapasitas,
      totalLimbahDiolahKg: totalKg,
      antreanPenjemputanCount: antreanCount,
      bursaTersediaCount: bursaCount,
      pengirimanAktifCount: shipAktifCount,
      pengirimanSelesaiCount: shipSelesaiCount,
      totalKompensasiLimbah: totalKompensasi,
      persentaseKapasitasTerpakai: persentase,
    };
  },

  /**
   * Mengambil bursa limbah sirkular yang tersedia untuk diajukan
   */
  async getAvailableWaste(filters: { jenis?: string; search?: string } = {}): Promise<any[]> {
    const where: any = {
      status_jemput: "Tersedia",
      status_verifikasi: "Terverifikasi",
    };

    if (filters.jenis) {
      where.jenis_limbah = filters.jenis;
    }

    if (filters.search) {
      where.OR = [
        { lokasi_penjemputan: { contains: filters.search, mode: "insensitive" } },
        {
          umkm: {
            nama_usaha: { contains: filters.search, mode: "insensitive" },
          },
        },
      ];
    }

    const limbahs = await prisma.limbah.findMany({
      where,
      include: {
        umkm: {
          include: {
            pengguna: {
              select: {
                nama_lengkap: true,
              },
            },
          },
        },
      },
      orderBy: { tgl_input: "desc" },
    });

    return limbahs.map((l) => ({
      ...l,
      nama_usaha: l.umkm?.nama_usaha || null,
      no_telp_umkm: l.umkm?.no_telp || null,
      nama_pemilik_umkm: l.umkm?.pengguna?.nama_lengkap || null,
    }));
  },

  /**
   * Mengambil antrean penjemputan limbah milik Mitra tertentu
   */
  async getMyPickups(id_mitra: number, status?: string): Promise<any[]> {
    const where: any = { id_mitra };
    if (status) {
      where.status_jemput = status;
    }

    const limbahs = await prisma.limbah.findMany({
      where,
      include: {
        umkm: {
          include: {
            pengguna: {
              select: {
                nama_lengkap: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { tgl_input: "desc" },
    });

    return limbahs.map((l) => ({
      ...l,
      nama_usaha: l.umkm?.nama_usaha || null,
      no_telp_umkm: l.umkm?.no_telp || null,
      nama_pemilik_umkm: l.umkm?.pengguna?.nama_lengkap || null,
      email_umkm: l.umkm?.pengguna?.email || null,
    }));
  },

  /**
   * Mitra mengajukan diri untuk menjemput limbah dari Bursa Sirkular (Tersedia ➔ Diajukan)
   */
  async claimPickup(id_limbah: number, id_mitra: number, harga_kesepakatan?: number): Promise<any> {
    const current = await prisma.limbah.findUnique({
      where: { id_limbah },
    });

    if (!current) {
      throw new Error(`Batch limbah dengan ID #${id_limbah} tidak ditemukan.`);
    }

    if (current.status_jemput !== "Tersedia") {
      throw new Error(
        `Batch limbah #${id_limbah} sudah tidak tersedia (status saat ini: ${current.status_jemput}).`
      );
    }

    const profile = await this.getProfile({ id_mitra });
    if (!profile) {
      throw new Error(`Mitra dengan ID ${id_mitra} tidak valid.`);
    }

    const hargaFinal =
      harga_kesepakatan !== undefined ? harga_kesepakatan : Number(current.estimasi_harga);

    const updated = await prisma.limbah.update({
      where: { id_limbah },
      data: {
        id_mitra,
        status_jemput: "Diajukan",
        harga_kesepakatan: hargaFinal,
      },
    });

    await prisma.log_sistem.create({
      data: {
        id_user: profile.id_user,
        level: "Info",
        aksi: "KLAIM_PENJEMPUTAN_LIMBAH",
        endpoint_api: "/api/v1/mitra/limbah/klaim",
        kode_status: 200,
        pesan: `Mitra ${profile.nama_mitra_instansi} mengajukan penjemputan Batch Limbah #${id_limbah} (${current.jenis_limbah}, ${current.berat_kg} kg).`,
      },
    });

    return updated;
  },

  /**
   * Mitra memperbarui tahapan penjemputan limbah:
   * Diajukan ➔ Proses ➔ Selesai
   */
  async updatePickupStatus(
    id_limbah: number,
    id_mitra: number,
    status_jemput: string
  ): Promise<any> {
    const current = await prisma.limbah.findFirst({
      where: { id_limbah, id_mitra },
      include: {
        umkm: true,
      },
    });

    if (!current) {
      throw new Error(`Batch limbah #${id_limbah} untuk mitra ini tidak ditemukan.`);
    }

    const profile = await this.getProfile({ id_mitra });

    const updateData: any = { status_jemput };
    if (status_jemput === "Selesai") {
      updateData.tgl_jemput = new Date();
    }

    const updated = await prisma.limbah.update({
      where: { id_limbah },
      data: updateData,
    });

    // Jika selesai dan ada kompensasi jual beli, catat kas otomatis
    if (status_jemput === "Selesai") {
      const nominal = Number(updated.harga_kesepakatan ?? updated.estimasi_harga ?? 0);
      if (nominal > 0 && current.jenis_kompensasi === "Jual Beli") {
        if (profile?.id_user) {
          await prisma.pencatatan_keuangan.create({
            data: {
              id_user: profile.id_user,
              id_limbah,
              jenis_transaksi: "Pengeluaran",
              jumlah_uang: nominal,
              keterangan: `Pembelian bahan baku sirkular (${current.jenis_limbah} ${current.berat_kg} kg) dari ${current.umkm?.nama_usaha || "UMKM"}`,
            },
          });
        }
        if (current.umkm?.id_user) {
          await prisma.pencatatan_keuangan.create({
            data: {
              id_user: current.umkm.id_user,
              id_limbah,
              jenis_transaksi: "Pemasukan",
              jumlah_uang: nominal,
              keterangan: `Kompensasi setor limbah sirkular (${current.jenis_limbah} ${current.berat_kg} kg) kepada ${profile?.nama_mitra_instansi || "Mitra"}`,
            },
          });
        }
      }

      await prisma.log_sistem.create({
        data: {
          id_user: profile?.id_user || null,
          level: "Info",
          aksi: "PENJEMPUTAN_LIMBAH_SELESAI",
          endpoint_api: "/api/v1/mitra/limbah/status",
          kode_status: 200,
          pesan: `Penjemputan Batch Limbah #${id_limbah} (${current.jenis_limbah} ${current.berat_kg} kg) telah selesai diproses oleh ${profile?.nama_mitra_instansi}.`,
        },
      });
    }

    return updated;
  },

  /**
   * Mengambil riwayat pengiriman logistik produk yang ditangani mitra
   */
  async getShipments(id_mitra: number, status?: string): Promise<any[]> {
    const where: any = { id_mitra };
    if (status) {
      where.status_pengiriman = status;
    }

    const shipments = await prisma.riwayat_pengiriman.findMany({
      where,
      include: {
        transaksi: {
          include: {
            pengguna_transaksi_id_pembeliTopengguna: true,
            pengguna_transaksi_id_penjualTopengguna: true,
          },
        },
      },
      orderBy: { tgl_pengiriman: "desc" },
    });

    return shipments.map((rp) => ({
      id_pengiriman: rp.id_pengiriman,
      id_transaksi: rp.id_transaksi,
      id_mitra: rp.id_mitra,
      tgl_pengiriman: rp.tgl_pengiriman,
      no_resi_lacak: rp.no_resi_lacak,
      status_pengiriman: rp.status_pengiriman,
      tgl_diterima: rp.tgl_diterima,
      total_harga: rp.transaksi.total_harga,
      status_transaksi: rp.transaksi.status,
      tgl_transaksi: rp.transaksi.tgl_transaksi,
      nama_pembeli: rp.transaksi.pengguna_transaksi_id_pembeliTopengguna.nama_lengkap,
      no_telp_pembeli: rp.transaksi.pengguna_transaksi_id_pembeliTopengguna.no_telp,
      alamat_tujuan: rp.transaksi.pengguna_transaksi_id_pembeliTopengguna.alamat,
      nama_penjual: rp.transaksi.pengguna_transaksi_id_penjualTopengguna.nama_lengkap,
      alamat_asal: rp.transaksi.pengguna_transaksi_id_penjualTopengguna.alamat,
    }));
  },

  /**
   * Memperbarui status riwayat pengiriman ekspedisi
   */
  async updateShipmentStatus(
    id_pengiriman: number,
    id_mitra: number,
    status_pengiriman: string
  ): Promise<any> {
    const check = await prisma.riwayat_pengiriman.findFirst({
      where: { id_pengiriman, id_mitra },
    });

    if (!check) {
      throw new Error(`Data pengiriman #${id_pengiriman} untuk mitra ini tidak ditemukan.`);
    }

    const updateData: any = { status_pengiriman };
    if (status_pengiriman === "Tiba di Lokasi") {
      updateData.tgl_diterima = new Date();
    }

    return prisma.riwayat_pengiriman.update({
      where: { id_pengiriman },
      data: updateData,
    });
  },

  /**
   * Mengirim ulang berkas persyaratan Mitra
   */
  async resubmitDocument(
    id_user: number,
    foto_persyaratan_url: string,
    foto_persyaratan_name?: string
  ): Promise<any> {
    const check = await prisma.pengguna.findFirst({
      where: { id_user, peran: "Mitra" },
    });

    if (!check) {
      throw new Error("Pengguna mitra tidak ditemukan atau peran tidak sesuai.");
    }

    return prisma.pengguna.update({
      where: { id_user },
      data: {
        foto_persyaratan_url,
        foto_persyaratan_name: foto_persyaratan_name ?? check.foto_persyaratan_name,
        status_verifikasi: "Menunggu",
        alasan_penolakan: null,
      },
      select: {
        id_user: true,
        nama_lengkap: true,
        email: true,
        status_verifikasi: true,
        foto_persyaratan_url: true,
        foto_persyaratan_name: true,
      },
    });
  },
};
