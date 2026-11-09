import { prisma } from "../config/prisma.tsx";
import type {
  UMKMProfile,
  UMKMDashboardMetrics,
  Produk,
  Limbah,
  Transaksi,
  PencatatanKeuangan,
} from "../types/samangga.tsx";

export const umkmService = {
  /**
   * Mengambil data profil UMKM berdasarkan id_user atau id_umkm
   */
  async getProfile(identifier: { id_user?: number; id_umkm?: number }): Promise<UMKMProfile | null> {
    const um = await prisma.umkm.findFirst({
      where: identifier.id_user
        ? { id_user: identifier.id_user }
        : { id_umkm: identifier.id_umkm },
      include: {
        pengguna: true,
      },
    });

    if (!um) return null;

    return {
      id_umkm: um.id_umkm,
      id_user: um.id_user,
      nama_usaha: um.nama_usaha,
      nib: um.nib || undefined,
      no_telp_usaha: um.no_telp || undefined,
      kategori_produk_olahan: um.kategori_produk_olahan || undefined,
      kapasitas_produksi_bulanan: um.kapasitas_produksi_bulanan || undefined,
      nama_bank: um.nama_bank || undefined,
      no_rekening: um.no_rekening || undefined,
      nama_lengkap: um.pengguna.nama_lengkap,
      email: um.pengguna.email,
      no_telp_user: um.pengguna.no_telp || undefined,
      alamat: um.pengguna.alamat || undefined,
      peran: um.pengguna.peran as any,
      status_verifikasi: um.pengguna.status_verifikasi as any,
      foto_persyaratan_url: um.pengguna.foto_persyaratan_url || undefined,
      foto_persyaratan_name: um.pengguna.foto_persyaratan_name || undefined,
      alasan_penolakan: um.pengguna.alasan_penolakan || undefined,
      tgl_daftar: um.pengguna.tgl_daftar ? um.pengguna.tgl_daftar.toISOString() : undefined,
    };
  },

  /**
   * Mengambil semua daftar UMKM (untuk publik & admin)
   */
  async getAllUmkm(status?: string): Promise<any[]> {
    const umkms = await prisma.umkm.findMany({
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
      orderBy: { id_umkm: "asc" },
    });

    return umkms.map((um) => ({
      id_umkm: um.id_umkm,
      id_user: um.id_user,
      nama_usaha: um.nama_usaha,
      nib: um.nib,
      kategori_produk_olahan: um.kategori_produk_olahan,
      kapasitas_produksi_bulanan: um.kapasitas_produksi_bulanan,
      nama_lengkap: um.pengguna.nama_lengkap,
      email: um.pengguna.email,
      alamat: um.pengguna.alamat,
      status_verifikasi: um.pengguna.status_verifikasi,
      tgl_daftar: um.pengguna.tgl_daftar,
    }));
  },

  /**
   * Memperbarui profil UMKM dan informasi pengguna terkait
   */
  async updateProfile(id_user: number, data: Partial<UMKMProfile>): Promise<UMKMProfile | null> {
    const updateUmkmData: any = {};
    if (data.nama_usaha !== undefined) updateUmkmData.nama_usaha = data.nama_usaha;
    if (data.nib !== undefined) updateUmkmData.nib = data.nib;
    if (data.no_telp_usaha !== undefined) updateUmkmData.no_telp = data.no_telp_usaha;
    if (data.kategori_produk_olahan !== undefined) updateUmkmData.kategori_produk_olahan = data.kategori_produk_olahan;
    if (data.kapasitas_produksi_bulanan !== undefined)
      updateUmkmData.kapasitas_produksi_bulanan = Number(data.kapasitas_produksi_bulanan);
    if (data.nama_bank !== undefined) updateUmkmData.nama_bank = data.nama_bank;
    if (data.no_rekening !== undefined) updateUmkmData.no_rekening = data.no_rekening;

    if (Object.keys(updateUmkmData).length > 0) {
      await prisma.umkm.update({
        where: { id_user },
        data: updateUmkmData,
      });
    }

    if (data.alamat || data.no_telp_user || data.no_telp) {
      const updatePenggunaData: any = {};
      if (data.alamat !== undefined) updatePenggunaData.alamat = data.alamat;
      if (data.no_telp_user !== undefined) updatePenggunaData.no_telp = data.no_telp_user;
      else if (data.no_telp !== undefined) updatePenggunaData.no_telp = data.no_telp;

      await prisma.pengguna.update({
        where: { id_user },
        data: updatePenggunaData,
      });
    }

    return this.getProfile({ id_user });
  },

  /**
   * Mengambil Dashboard & Metrik Operasional Komprehensif UMKM
   */
  async getDashboard(identifier: { id_user?: number; id_umkm?: number }): Promise<UMKMDashboardMetrics> {
    const profile = await this.getProfile(identifier);
    if (!profile) {
      throw new Error(`Data UMKM tidak ditemukan.`);
    }

    const id_user = profile.id_user;
    const id_umkm = profile.id_umkm;

    const [
      totalProduk,
      stokAgg,
      menungguVerifikasiCount,
      salesSelesaiAgg,
      salesAktifCount,
      salesSelesaiCount,
      totalPesananCount,
      purchaseSelesaiAgg,
      purchaseAktifCount,
      purchaseSelesaiCount,
      totalBelanjaCount,
      wasteAgg,
      wasteTersediaCount,
      wasteDiprosesCount,
      wasteSelesaiCount,
      kasInAgg,
      kasOutAgg,
    ] = await Promise.all([
      prisma.produk.count({ where: { id_user } }),
      prisma.produk.aggregate({
        where: { id_user },
        _sum: { stok: true },
      }),
      prisma.produk.count({
        where: { id_user, status_verifikasi: "Menunggu" },
      }),
      prisma.transaksi.aggregate({
        where: { id_penjual: id_user, status: "Selesai" },
        _sum: { total_harga: true },
      }),
      prisma.transaksi.count({
        where: {
          id_penjual: id_user,
          status: { in: ["Pending", "Diproses", "Dikirim"] },
        },
      }),
      prisma.transaksi.count({
        where: { id_penjual: id_user, status: "Selesai" },
      }),
      prisma.transaksi.count({
        where: { id_penjual: id_user },
      }),
      prisma.transaksi.aggregate({
        where: { id_pembeli: id_user, status: "Selesai" },
        _sum: { total_harga: true },
      }),
      prisma.transaksi.count({
        where: {
          id_pembeli: id_user,
          status: { in: ["Pending", "Diproses", "Dikirim"] },
        },
      }),
      prisma.transaksi.count({
        where: { id_pembeli: id_user, status: "Selesai" },
      }),
      prisma.transaksi.count({
        where: { id_pembeli: id_user },
      }),
      prisma.limbah.aggregate({
        where: { id_umkm },
        _sum: {
          berat_kg: true,
          harga_kesepakatan: true,
          estimasi_harga: true,
        },
      }),
      prisma.limbah.count({
        where: { id_umkm, status_jemput: "Tersedia" },
      }),
      prisma.limbah.count({
        where: {
          id_umkm,
          status_jemput: { in: ["Diajukan", "Proses"] },
        },
      }),
      prisma.limbah.count({
        where: { id_umkm, status_jemput: "Selesai" },
      }),
      prisma.pencatatan_keuangan.aggregate({
        where: { id_user, jenis_transaksi: "Pemasukan" },
        _sum: { jumlah_uang: true },
      }),
      prisma.pencatatan_keuangan.aggregate({
        where: { id_user, jenis_transaksi: "Pengeluaran" },
        _sum: { jumlah_uang: true },
      }),
    ]);

    const totalKasMasuk = Number(kasInAgg._sum.jumlah_uang || 0);
    const totalKasKeluar = Number(kasOutAgg._sum.jumlah_uang || 0);

    const kapasitas = Number(profile.kapasitas_produksi_bulanan || 0);
    const stokTotal = Number(stokAgg._sum.stok || 0);
    const persentaseKapasitas = kapasitas > 0 ? Math.min(100, Math.round((stokTotal / kapasitas) * 100)) : 0;

    return {
      umkm: {
        id_umkm,
        id_user,
        nama_usaha: profile.nama_usaha,
        nama_pemilik: profile.nama_lengkap,
        kategori_produk_olahan: profile.kategori_produk_olahan || null,
        kapasitas_produksi_bulanan: kapasitas,
        status_verifikasi: profile.status_verifikasi,
      },
      katalog: {
        totalProduk,
        totalStokUnit: stokTotal,
        persentaseKapasitasTerpakai: persentaseKapasitas,
      },
      penjualan: {
        omzetSelesai: Number(salesSelesaiAgg._sum.total_harga || 0),
        omzetPending: 0,
        pesananAktifCount: salesAktifCount,
        totalTransaksiPenjualan: totalPesananCount,
      },
      pembelianBahanBaku: {
        totalBelanjaSelesai: Number(purchaseSelesaiAgg._sum.total_harga || 0),
        belanjaPending: 0,
        pembelianAktifCount: purchaseAktifCount,
        totalTransaksiPembelian: totalBelanjaCount,
      },
      limbahSirkular: {
        totalSetoranCount: wasteTersediaCount + wasteDiprosesCount + wasteSelesaiCount,
        totalLimbahKg: Number(wasteAgg._sum.berat_kg || 0),
        limbahTerangkutKg: 0,
        limbahAktifKg: 0,
        setoranAktifCount: wasteDiprosesCount,
        totalKompensasiDiterima: Number(
          wasteAgg._sum.harga_kesepakatan ?? wasteAgg._sum.estimasi_harga ?? 0
        ),
      },
      keuangan: {
        totalPemasukan: totalKasMasuk,
        totalPengeluaran: totalKasKeluar,
        saldoKas: totalKasMasuk - totalKasKeluar,
      },
    };
  },

  /**
   * Mengambil daftar produk olahan milik UMKM
   */
  async getProducts(
    id_user: number,
    filters: { kategori?: string; search?: string } = {}
  ): Promise<Produk[]> {
    const where: any = { id_user };

    if (filters.kategori) {
      where.kategori = filters.kategori;
    }

    if (filters.search) {
      where.OR = [
        { nama_produk: { contains: filters.search, mode: "insensitive" } },
        { deskripsi: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const items = await prisma.produk.findMany({
      where,
      orderBy: { tgl_dibuat: "desc" },
    });

    return items.map((p) => ({
      ...p,
      harga: Number(p.harga),
      satuan: p.satuan || "pcs",
      tags: p.tags || [],
    })) as unknown as Produk[];
  },

  /**
   * Mengambil detail satu produk berdasarkan ID
   */
  async getProductById(id_produk: number, id_user?: number): Promise<Produk | null> {
    const where: any = { id_produk };
    if (id_user) {
      where.id_user = id_user;
    }

    const p = await prisma.produk.findFirst({ where });
    if (!p) return null;

    return {
      ...p,
      harga: Number(p.harga),
      satuan: p.satuan || "pcs",
      tags: p.tags || [],
    } as unknown as Produk;
  },

  /**
   * Menambahkan produk olahan mangga baru oleh UMKM
   */
  async createProduct(id_user: number, data: Partial<Produk>): Promise<Produk> {
    if (!data.nama_produk || !data.nama_produk.trim()) {
      throw new Error("Nama produk wajib diisi.");
    }
    if (data.harga === undefined || Number(data.harga) < 0) {
      throw new Error("Harga produk tidak valid.");
    }

    const created = await prisma.produk.create({
      data: {
        id_user,
        nama_produk: data.nama_produk.trim(),
        kategori: data.kategori || "Olahan",
        harga: Number(data.harga),
        stok: Number(data.stok || 0),
        satuan: data.satuan || "pcs",
        deskripsi: data.deskripsi || null,
        gambar: data.gambar || null,
        lokasi: data.lokasi || "Indramayu",
        tags: data.tags || [],
        status_verifikasi: "Terverifikasi",
      },
    });

    await prisma.log_sistem.create({
      data: {
        id_user,
        level: "Info",
        aksi: "TAMBAH_PRODUK_UMKM",
        endpoint_api: "/api/v1/umkm/produk",
        kode_status: 201,
        pesan: `UMKM menambahkan produk olahan #${created.id_produk}: ${created.nama_produk}.`,
      },
    });

    return {
      ...created,
      harga: Number(created.harga),
      satuan: created.satuan || "pcs",
      tags: created.tags || [],
    } as unknown as Produk;
  },

  /**
   * Memperbarui produk olahan milik UMKM
   */
  async updateProduct(id_produk: number, id_user: number, data: Partial<Produk>): Promise<Produk> {
    const existing = await prisma.produk.findFirst({
      where: { id_produk, id_user },
    });

    if (!existing) {
      throw new Error(`Produk dengan ID #${id_produk} tidak ditemukan atau bukan milik Anda.`);
    }

    const updateData: any = {};
    if (data.nama_produk !== undefined) updateData.nama_produk = data.nama_produk.trim();
    if (data.kategori !== undefined) updateData.kategori = data.kategori;
    if (data.harga !== undefined) updateData.harga = Number(data.harga);
    if (data.stok !== undefined) updateData.stok = Number(data.stok);
    if (data.satuan !== undefined) updateData.satuan = data.satuan;
    if (data.deskripsi !== undefined) updateData.deskripsi = data.deskripsi;
    if (data.gambar !== undefined) updateData.gambar = data.gambar;
    if (data.lokasi !== undefined) updateData.lokasi = data.lokasi;
    if (data.tags !== undefined) updateData.tags = data.tags;

    const updated = await prisma.produk.update({
      where: { id_produk },
      data: updateData,
    });

    await prisma.log_sistem.create({
      data: {
        id_user,
        level: "Info",
        aksi: "UPDATE_PRODUK_UMKM",
        endpoint_api: `/api/v1/umkm/produk/${id_produk}`,
        kode_status: 200,
        pesan: `UMKM memperbarui data produk #${id_produk}: ${updated.nama_produk}.`,
      },
    });

    return {
      ...updated,
      harga: Number(updated.harga),
      satuan: updated.satuan || "pcs",
      tags: updated.tags || [],
    } as unknown as Produk;
  },

  /**
   * Menghapus produk olahan milik UMKM
   */
  async deleteProduct(id_produk: number, id_user: number): Promise<boolean> {
    const existing = await prisma.produk.findFirst({
      where: { id_produk, id_user },
    });

    if (!existing) {
      throw new Error(`Produk dengan ID #${id_produk} tidak ditemukan atau bukan milik Anda.`);
    }

    await prisma.produk.delete({
      where: { id_produk },
    });

    await prisma.log_sistem.create({
      data: {
        id_user,
        level: "Info",
        aksi: "HAPUS_PRODUK_UMKM",
        endpoint_api: `/api/v1/umkm/produk/${id_produk}`,
        kode_status: 200,
        pesan: `UMKM menghapus produk #${id_produk}: ${existing.nama_produk}.`,
      },
    });

    return true;
  },

  /**
   * Mengambil riwayat setoran residu limbah UMKM ke pasar sirkular
   */
  async getMyWaste(id_umkm: number, status?: string): Promise<any[]> {
    const where: any = { id_umkm };
    if (status) {
      where.status_jemput = status;
    }

    const items = await prisma.limbah.findMany({
      where,
      include: {
        mitra: {
          select: {
            nama_mitra_instansi: true,
            no_telp: true,
            jenis_pengolahan_limbah: true,
          },
        },
      },
      orderBy: { tgl_input: "desc" },
    });

    return items.map((l) => ({
      ...l,
      nama_mitra: l.mitra?.nama_mitra_instansi || null,
      no_telp_mitra: l.mitra?.no_telp || null,
      jenis_pengolahan_limbah: l.mitra?.jenis_pengolahan_limbah || null,
    }));
  },

  /**
   * Menyetorkan residu/limbah mangga hasil olahan ke bursa sirkular
   */
  async createWasteDeposit(id_umkm: number, data: Partial<Limbah>): Promise<Limbah> {
    if (!data.jenis_limbah) {
      throw new Error("Jenis limbah wajib diisi (Kulit, Biji, Daun, atau Buah Afkir).");
    }
    if (!data.berat_kg || Number(data.berat_kg) <= 0) {
      throw new Error("Berat limbah harus lebih dari 0 kg.");
    }
    if (!data.lokasi_penjemputan) {
      throw new Error("Lokasi penjemputan wajib dicantumkan.");
    }

    const profile = await this.getProfile({ id_umkm });
    if (!profile) {
      throw new Error(`UMKM dengan ID ${id_umkm} tidak ditemukan.`);
    }

    const created = await prisma.limbah.create({
      data: {
        id_umkm,
        jenis_limbah: data.jenis_limbah,
        berat_kg: Number(data.berat_kg),
        estimasi_harga: Number(data.estimasi_harga || 0),
        jenis_kompensasi: data.jenis_kompensasi || "Jual Beli",
        lokasi_penjemputan: data.lokasi_penjemputan,
        titik_koordinat: data.titik_koordinat || null,
        foto_limbah: data.foto_limbah || null,
        status_jemput: "Tersedia",
        status_verifikasi: "Terverifikasi",
      },
    });

    await prisma.log_sistem.create({
      data: {
        id_user: profile.id_user,
        level: "Info",
        aksi: "SETOR_LIMBAH_UMKM",
        endpoint_api: "/api/v1/umkm/limbah",
        kode_status: 201,
        pesan: `UMKM ${profile.nama_usaha} menyetorkan limbah sirkular #${created.id_limbah}: ${created.jenis_limbah} (${created.berat_kg} kg).`,
      },
    });

    return created as unknown as Limbah;
  },

  /**
   * Mengambil pesanan penjualan masuk (UMKM bertindak sebagai Penjual produk olahan)
   */
  async getSalesOrders(id_user: number, status?: string): Promise<any[]> {
    const where: any = { id_penjual: id_user };
    if (status) {
      where.status = status;
    }

    const txs = await prisma.transaksi.findMany({
      where,
      include: {
        pengguna_transaksi_id_pembeliTopengguna: true,
        detail_transaksi: {
          include: {
            produk: true,
          },
        },
        pembayaran: true,
        riwayat_pengiriman: true,
      },
      orderBy: { tgl_transaksi: "desc" },
    });

    return txs.map((t) => ({
      id_transaksi: t.id_transaksi,
      id_pembeli: t.id_pembeli,
      id_penjual: t.id_penjual,
      total_harga: t.total_harga,
      status: t.status,
      tgl_transaksi: t.tgl_transaksi,
      nama_pembeli: t.pengguna_transaksi_id_pembeliTopengguna.nama_lengkap,
      no_telp_pembeli: t.pengguna_transaksi_id_pembeliTopengguna.no_telp,
      alamat_pembeli: t.pengguna_transaksi_id_pembeliTopengguna.alamat,
      items: t.detail_transaksi.map((d) => ({
        id_detail_transaksi: d.id_detail_transaksi,
        id_produk: d.id_produk,
        nama_produk: d.produk.nama_produk,
        kategori: d.produk.kategori,
        jumlah_produk: d.jumlah_produk,
        harga_satuan: d.harga_satuan,
        subtotal_harga: d.subtotal_harga,
        satuan: d.produk.satuan,
      })),
      pembayaran: t.pembayaran[0] || null,
      pengiriman: t.riwayat_pengiriman[0] || null,
    }));
  },

  /**
   * Mengambil pesanan pembelian bahan baku (UMKM bertindak sebagai Pembeli mangga segar)
   */
  async getPurchaseOrders(id_user: number, status?: string): Promise<any[]> {
    const where: any = { id_pembeli: id_user };
    if (status) {
      where.status = status;
    }

    const txs = await prisma.transaksi.findMany({
      where,
      include: {
        pengguna_transaksi_id_penjualTopengguna: true,
        detail_transaksi: {
          include: {
            produk: true,
          },
        },
        pembayaran: true,
        riwayat_pengiriman: true,
      },
      orderBy: { tgl_transaksi: "desc" },
    });

    return txs.map((t) => ({
      id_transaksi: t.id_transaksi,
      id_pembeli: t.id_pembeli,
      id_penjual: t.id_penjual,
      total_harga: t.total_harga,
      status: t.status,
      tgl_transaksi: t.tgl_transaksi,
      nama_penjual: t.pengguna_transaksi_id_penjualTopengguna.nama_lengkap,
      no_telp_penjual: t.pengguna_transaksi_id_penjualTopengguna.no_telp,
      alamat_penjual: t.pengguna_transaksi_id_penjualTopengguna.alamat,
      items: t.detail_transaksi.map((d) => ({
        id_detail_transaksi: d.id_detail_transaksi,
        id_produk: d.id_produk,
        nama_produk: d.produk.nama_produk,
        kategori: d.produk.kategori,
        jumlah_produk: d.jumlah_produk,
        harga_satuan: d.harga_satuan,
        subtotal_harga: d.subtotal_harga,
        satuan: d.produk.satuan,
      })),
      pembayaran: t.pembayaran[0] || null,
      pengiriman: t.riwayat_pengiriman[0] || null,
    }));
  },

  /**
   * Memperbarui status pesanan penjualan atau pembelian
   */
  async updateOrderStatus(id_transaksi: number, id_user: number, status: string): Promise<Transaksi> {
    const existing = await prisma.transaksi.findFirst({
      where: {
        id_transaksi,
        OR: [{ id_penjual: id_user }, { id_pembeli: id_user }],
      },
    });

    if (!existing) {
      throw new Error(`Transaksi #${id_transaksi} tidak ditemukan atau Anda tidak memiliki akses.`);
    }

    const updated = await prisma.transaksi.update({
      where: { id_transaksi },
      data: { status },
    });

    // Otomasi Buku Kas jika transaksi Selesai
    if (status === "Selesai") {
      const existingFin = await prisma.pencatatan_keuangan.findFirst({
        where: { id_user: existing.id_penjual, id_transaksi },
      });

      if (!existingFin) {
        await prisma.pencatatan_keuangan.create({
          data: {
            id_user: existing.id_penjual,
            id_transaksi,
            jenis_transaksi: "Pemasukan",
            jumlah_uang: existing.total_harga,
            keterangan: `Pemasukan otomatis dari transaksi penjualan olahan #${id_transaksi}`,
          },
        });
      }
    }

    await prisma.log_sistem.create({
      data: {
        id_user,
        level: "Info",
        aksi: "UPDATE_STATUS_TRANSAKSI",
        endpoint_api: `/api/v1/umkm/transaksi/${id_transaksi}/status`,
        kode_status: 200,
        pesan: `Status transaksi #${id_transaksi} diperbarui menjadi '${status}' oleh pengguna #${id_user}.`,
      },
    });

    return updated as unknown as Transaksi;
  },

  /**
   * Mengambil buku kas pencatatan keuangan UMKM (Pemasukan, Pengeluaran, Saldo)
   */
  async getFinancialRecords(id_user: number, filters: { jenis?: string } = {}): Promise<any> {
    const where: any = { id_user };
    if (filters.jenis) {
      where.jenis_transaksi = filters.jenis;
    }

    const [records, inAgg, outAgg] = await Promise.all([
      prisma.pencatatan_keuangan.findMany({
        where,
        orderBy: { tgl_pencatatan: "desc" },
      }),
      prisma.pencatatan_keuangan.aggregate({
        where: { id_user, jenis_transaksi: "Pemasukan" },
        _sum: { jumlah_uang: true },
      }),
      prisma.pencatatan_keuangan.aggregate({
        where: { id_user, jenis_transaksi: "Pengeluaran" },
        _sum: { jumlah_uang: true },
      }),
    ]);

    const totalPemasukan = Number(inAgg._sum.jumlah_uang || 0);
    const totalPengeluaran = Number(outAgg._sum.jumlah_uang || 0);

    const saldoBersih = totalPemasukan - totalPengeluaran;

    return {
      id_user,
      totalPemasukan,
      totalPengeluaran,
      saldoBersih,
      totalCatatan: records.length,
      ringkasan: {
        totalPemasukan,
        totalPengeluaran,
        saldoKas: saldoBersih,
      },
      total: records.length,
      data: records,
    };
  },

  /**
   * Menambahkan entri catatan keuangan manual
   */
  async addFinancialRecord(
    id_user: number,
    data: Partial<PencatatanKeuangan>
  ): Promise<PencatatanKeuangan> {
    if (!data.jenis_transaksi || !["Pemasukan", "Pengeluaran"].includes(data.jenis_transaksi)) {
      throw new Error("Jenis transaksi harus 'Pemasukan' atau 'Pengeluaran'.");
    }
    if (data.jumlah_uang === undefined || Number(data.jumlah_uang) <= 0) {
      throw new Error("Jumlah uang harus lebih besar dari 0.");
    }

    const record = await prisma.pencatatan_keuangan.create({
      data: {
        id_user,
        jenis_transaksi: data.jenis_transaksi,
        jumlah_uang: Number(data.jumlah_uang),
        keterangan: data.keterangan || null,
        id_transaksi: data.id_transaksi ? Number(data.id_transaksi) : null,
        id_limbah: data.id_limbah ? Number(data.id_limbah) : null,
      },
    });

    await prisma.log_sistem.create({
      data: {
        id_user,
        level: "Info",
        aksi: "TAMBAH_CATATAN_KAS_UMKM",
        endpoint_api: "/api/v1/umkm/keuangan",
        kode_status: 201,
        pesan: `Pencatatan kas baru #${record.id_keuangan}: ${record.jenis_transaksi} sebesar Rp ${record.jumlah_uang}.`,
      },
    });

    return record as unknown as PencatatanKeuangan;
  },

  /**
   * Mengirim ulang berkas persyaratan UMKM
   */
  async resubmitDocument(
    id_user: number,
    foto_persyaratan_url: string,
    foto_persyaratan_name?: string
  ): Promise<any> {
    const check = await prisma.pengguna.findFirst({
      where: { id_user, peran: "UMKM" },
    });

    if (!check) {
      throw new Error("Pengguna UMKM tidak ditemukan atau peran tidak sesuai.");
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
