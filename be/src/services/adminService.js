import { query } from "../config/db.js";
export const adminService = {
    /**
     * Mengambil statistik komprehensif ekosistem SAMANGGA untuk Dashboard Admin
     */
    async getDashboardMetrics() {
        // 1. Hitung total dan agregasi status pengguna
        const usersRes = await query(`
      SELECT 
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status_verifikasi = 'Menunggu')::int AS menunggu,
        COUNT(*) FILTER (WHERE status_verifikasi = 'Terverifikasi')::int AS terverifikasi,
        COUNT(*) FILTER (WHERE status_verifikasi = 'Ditolak')::int AS ditolak,
        COUNT(*) FILTER (WHERE peran = 'Supplier')::int AS supplier,
        COUNT(*) FILTER (WHERE peran = 'UMKM')::int AS umkm,
        COUNT(*) FILTER (WHERE peran = 'Mitra')::int AS mitra,
        COUNT(*) FILTER (WHERE peran = 'Konsumen')::int AS konsumen,
        COUNT(*) FILTER (WHERE peran = 'Admin')::int AS admin
      FROM pengguna;
    `);
        // 2. Hitung statistik produk
        const produkRes = await query(`SELECT COUNT(*)::int AS total FROM produk;`);
        // 3. Hitung statistik limbah sirkular
        const limbahRes = await query(`
      SELECT 
        COUNT(*)::int AS total_item,
        COALESCE(SUM(berat_kg), 0)::float AS total_kg
      FROM limbah;
    `);
        // 4. Hitung statistik transaksi rantai pasok
        const transaksiRes = await query(`
      SELECT 
        COUNT(*)::int AS total_transaksi,
        COALESCE(SUM(total_harga), 0)::float AS total_nominal
      FROM transaksi;
    `);
        // 5. Ambil 5 aktivitas log sistem terbaru
        const logsRes = await query(`
      SELECT l.*, u.nama_lengkap AS nama_user, u.peran AS peran_user
      FROM log_sistem l
      LEFT JOIN pengguna u ON l.id_user = u.id_user
      ORDER BY l.waktu DESC
      LIMIT 5;
    `);
        const uRow = usersRes.rows[0] || {};
        return {
            totalPengguna: uRow.total || 0,
            peranCounts: {
                Supplier: uRow.supplier || 0,
                UMKM: uRow.umkm || 0,
                Mitra: uRow.mitra || 0,
                Konsumen: uRow.konsumen || 0,
                Admin: uRow.admin || 0,
            },
            statusCounts: {
                menunggu: uRow.menunggu || 0,
                terverifikasi: uRow.terverifikasi || 0,
                ditolak: uRow.ditolak || 0,
            },
            totalProduk: produkRes.rows[0]?.total || 0,
            totalLimbahKg: limbahRes.rows[0]?.total_kg || 0,
            totalTransaksi: transaksiRes.rows[0]?.total_transaksi || 0,
            totalNominalTransaksi: transaksiRes.rows[0]?.total_nominal || 0,
            recentLogs: logsRes.rows || [],
        };
    },
    /**
     * Mengambil daftar pendaftaran akun/mitra yang memerlukan verifikasi
     * lengkap dengan profil tabel anak (Supplier, UMKM, Mitra, Konsumen).
     */
    async getVerifikasiList(options = {}) {
        const { peran, status, search, limit = 50, offset = 0 } = options;
        const conditions = [];
        const params = [];
        let paramIdx = 1;
        if (status) {
            conditions.push(`u.status_verifikasi = $${paramIdx++}`);
            params.push(status);
        }
        if (peran) {
            conditions.push(`u.peran = $${paramIdx++}`);
            params.push(peran);
        }
        if (search) {
            conditions.push(`(u.nama_lengkap ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx} OR u.no_telp ILIKE $${paramIdx})`);
            params.push(`%${search}%`);
            paramIdx++;
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `
      SELECT 
        u.id_user,
        u.nama_lengkap,
        u.peran,
        u.no_telp,
        u.alamat,
        u.email,
        u.status_verifikasi,
        u.foto_persyaratan_url,
        u.foto_persyaratan_name,
        u.alasan_penolakan,
        u.tgl_daftar,
        -- Profil Supplier
        s.id_supplier, s.tipe_supplier, s.luas_lahan_m2, s.jenis_komoditas_utama,
        -- Profil UMKM
        um.id_umkm, um.nama_usaha, um.nib, um.kategori_produk_olahan, um.kapasitas_produksi_bulanan,
        -- Profil Mitra
        m.id_mitra, m.nama_mitra_instansi, m.jenis_pengolahan_limbah, m.kapasitas_tampung_limbah_kg, m.jangkauan_area,
        -- Profil Konsumen
        k.id_konsumen, k.kategori_konsumen, k.alamat_pengiriman_utama
      FROM pengguna u
      LEFT JOIN supplier s ON u.id_user = s.id_user
      LEFT JOIN umkm um ON u.id_user = um.id_user
      LEFT JOIN mitra m ON u.id_user = m.id_user
      LEFT JOIN konsumen k ON u.id_user = k.id_user
      ${whereClause}
      ORDER BY 
        CASE WHEN u.status_verifikasi = 'Menunggu' THEN 1 ELSE 2 END,
        u.tgl_daftar DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++};
    `;
        params.push(limit, offset);
        const res = await query(sql, params);
        const countSql = `SELECT COUNT(*)::int AS total FROM pengguna u ${whereClause};`;
        const countRes = await query(countSql, params.slice(0, paramIdx - 3));
        return {
            data: res.rows,
            total: countRes.rows[0]?.total || 0,
            limit,
            offset,
        };
    },
    /**
     * Menyetujui pendaftaran mitra/pengguna
     */
    async approveUser(id_user, admin_id) {
        const checkRes = await query(`SELECT * FROM pengguna WHERE id_user = $1;`, [id_user]);
        if (checkRes.rowCount === 0) {
            throw new Error(`Pengguna dengan ID ${id_user} tidak ditemukan.`);
        }
        const targetUser = checkRes.rows[0];
        // Update status
        const updateRes = await query(`UPDATE pengguna
       SET status_verifikasi = 'Terverifikasi',
           alasan_penolakan = NULL
       WHERE id_user = $1
       RETURNING *;`, [id_user]);
        // Catat log audit sistem
        await query(`INSERT INTO log_sistem (id_user, level, aksi, endpoint_api, kode_status, pesan, waktu)
       VALUES ($1, 'Info', 'VERIFIKASI_DISETUJUI', '/api/v1/admin/verifikasi/setujui', 200, $2, CURRENT_TIMESTAMP);`, [
            admin_id || 505,
            `Admin memverifikasi akun ${targetUser.nama_lengkap} (${targetUser.peran}) menjadi Terverifikasi.`,
        ]);
        return updateRes.rows[0];
    },
    /**
     * Menolak pendaftaran mitra/pengguna dengan alasan penolakan
     */
    async rejectUser(id_user, alasan, admin_id) {
        const checkRes = await query(`SELECT * FROM pengguna WHERE id_user = $1;`, [id_user]);
        if (checkRes.rowCount === 0) {
            throw new Error(`Pengguna dengan ID ${id_user} tidak ditemukan.`);
        }
        const targetUser = checkRes.rows[0];
        const alasanFinal = alasan || "Dokumen persyaratan kurang jelas / tidak memenuhi kualifikasi standar.";
        // Update status
        const updateRes = await query(`UPDATE pengguna
       SET status_verifikasi = 'Ditolak',
           alasan_penolakan = $2
       WHERE id_user = $1
       RETURNING *;`, [id_user, alasanFinal]);
        // Catat log audit sistem
        await query(`INSERT INTO log_sistem (id_user, level, aksi, endpoint_api, kode_status, pesan, waktu)
       VALUES ($1, 'Warning', 'VERIFIKASI_DITOLAK', '/api/v1/admin/verifikasi/tolak', 200, $2, CURRENT_TIMESTAMP);`, [
            admin_id || 505,
            `Admin menolak verifikasi akun ${targetUser.nama_lengkap} (${targetUser.peran}). Alasan: ${alasanFinal}`,
        ]);
        return updateRes.rows[0];
    },
    /**
     * Mengambil semua pengguna untuk manajemen akun Admin
     */
    async getAllUsers(options = {}) {
        const { peran, status, search, limit = 50, offset = 0 } = options;
        const conditions = [];
        const params = [];
        let paramIdx = 1;
        if (status) {
            conditions.push(`status_verifikasi = $${paramIdx++}`);
            params.push(status);
        }
        if (peran) {
            conditions.push(`peran = $${paramIdx++}`);
            params.push(peran);
        }
        if (search) {
            conditions.push(`(nama_lengkap ILIKE $${paramIdx} OR email ILIKE $${paramIdx} OR no_telp ILIKE $${paramIdx})`);
            params.push(`%${search}%`);
            paramIdx++;
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `
      SELECT id_user, nama_lengkap, peran, no_telp, alamat, email, status_verifikasi, alasan_penolakan, tgl_daftar
      FROM pengguna
      ${whereClause}
      ORDER BY id_user ASC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++};
    `;
        params.push(limit, offset);
        const res = await query(sql, params);
        const countRes = await query(`SELECT COUNT(*)::int AS total FROM pengguna ${whereClause};`, params.slice(0, paramIdx - 3));
        return {
            data: res.rows,
            total: countRes.rows[0]?.total || 0,
            limit,
            offset,
        };
    },
    /**
     * Mengubah status verifikasi pengguna secara manual
     */
    async updateUserStatus(id_user, status, admin_id) {
        const updateRes = await query(`UPDATE pengguna SET status_verifikasi = $1 WHERE id_user = $2 RETURNING *;`, [status, id_user]);
        if (updateRes.rowCount === 0) {
            throw new Error(`Pengguna dengan ID ${id_user} tidak ditemukan.`);
        }
        await query(`INSERT INTO log_sistem (id_user, level, aksi, endpoint_api, kode_status, pesan, waktu)
       VALUES ($1, 'Info', 'STATUS_PENGGUNA_DIUBAH', '/api/v1/admin/pengguna/status', 200, $2, CURRENT_TIMESTAMP);`, [admin_id || 505, `Status akun ID ${id_user} diubah menjadi ${status}.`]);
        return updateRes.rows[0];
    },
    /**
     * Mengambil riwayat Audit Log Sistem
     */
    async getSystemLogs(limit = 50, level) {
        const conditions = [];
        const params = [];
        let paramIdx = 1;
        if (level) {
            conditions.push(`l.level = $${paramIdx++}`);
            params.push(level);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `
      SELECT l.*, u.nama_lengkap AS nama_user, u.peran AS peran_user
      FROM log_sistem l
      LEFT JOIN pengguna u ON l.id_user = u.id_user
      ${whereClause}
      ORDER BY l.waktu DESC
      LIMIT $${paramIdx++};
    `;
        params.push(limit);
        const res = await query(sql, params);
        return res.rows;
    },
    /**
     * Menambahkan entri log sistem manual
     */
    async createSystemLog(log) {
        const res = await query(`INSERT INTO log_sistem (id_user, level, aksi, endpoint_api, kode_status, pesan, detail_error, waktu)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       RETURNING *;`, [
            log.id_user || null,
            log.level || "Info",
            log.aksi,
            log.endpoint_api || null,
            log.kode_status || 200,
            log.pesan,
            log.detail_error || null,
        ]);
        return res.rows[0];
    },
    /**
     * Mengambil profil Admin berdasarkan id_user
     */
    async getAdminProfile(id_user) {
        const sql = `
      SELECT 
        u.id_user,
        u.nama_lengkap,
        u.email,
        u.no_telp,
        u.peran,
        u.status_verifikasi,
        u.tgl_daftar,
        a.id_admin,
        a.nip_id_pegawai,
        a.tingkat_akses,
        a.divisi
      FROM pengguna u
      JOIN admin a ON u.id_user = a.id_user
      WHERE u.id_user = $1;
    `;
        const res = await query(sql, [id_user]);
        return res.rows[0] || null;
    },
};
