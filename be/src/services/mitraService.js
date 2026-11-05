import { query } from "../config/db.js";
export const mitraService = {
    /**
     * Mengambil data profil Mitra berdasarkan id_user atau id_mitra
     */
    async getProfile(identifier) {
        const condition = identifier.id_user ? "u.id_user = $1" : "m.id_mitra = $1";
        const val = identifier.id_user ?? identifier.id_mitra;
        const sql = `
      SELECT 
        m.id_mitra,
        m.id_user,
        m.nama_mitra_instansi,
        m.no_telp AS no_telp_mitra,
        m.jenis_pengolahan_limbah,
        m.kapasitas_tampung_limbah_kg,
        m.jangkauan_area,
        m.nama_bank,
        m.no_rekening,
        u.nama_lengkap,
        u.email,
        u.no_telp AS no_telp_user,
        u.alamat,
        u.peran,
        u.status_verifikasi,
        u.foto_persyaratan_url,
        u.foto_persyaratan_name,
        u.alasan_penolakan,
        u.tgl_daftar
      FROM mitra m
      JOIN pengguna u ON m.id_user = u.id_user
      WHERE ${condition};
    `;
        const res = await query(sql, [val]);
        return res.rows[0] || null;
    },
    /**
     * Mengambil semua daftar mitra (untuk publik & admin)
     */
    async getAllMitra(status) {
        const params = [];
        let whereClause = "";
        if (status) {
            whereClause = "WHERE u.status_verifikasi = $1";
            params.push(status);
        }
        const sql = `
      SELECT 
        m.id_mitra,
        m.id_user,
        m.nama_mitra_instansi,
        m.jenis_pengolahan_limbah,
        m.kapasitas_tampung_limbah_kg,
        m.jangkauan_area,
        m.no_telp,
        u.nama_lengkap,
        u.email,
        u.alamat,
        u.status_verifikasi,
        u.tgl_daftar
      FROM mitra m
      JOIN pengguna u ON m.id_user = u.id_user
      ${whereClause}
      ORDER BY m.id_mitra ASC;
    `;
        const res = await query(sql, params);
        return res.rows;
    },
    /**
     * Memperbarui profil mitra
     */
    async updateProfile(id_user, data) {
        // 1. Update mitra
        const mitraRes = await query(`UPDATE mitra
       SET 
         nama_mitra_instansi = COALESCE($1, nama_mitra_instansi),
         no_telp = COALESCE($2, no_telp),
         jenis_pengolahan_limbah = COALESCE($3, jenis_pengolahan_limbah),
         kapasitas_tampung_limbah_kg = COALESCE($4, kapasitas_tampung_limbah_kg),
         jangkauan_area = COALESCE($5, jangkauan_area),
         nama_bank = COALESCE($6, nama_bank),
         no_rekening = COALESCE($7, no_rekening)
       WHERE id_user = $8
       RETURNING *;`, [
            data.nama_mitra_instansi || null,
            data.no_telp || null,
            data.jenis_pengolahan_limbah || null,
            data.kapasitas_tampung_limbah_kg || null,
            data.jangkauan_area || null,
            data.nama_bank || null,
            data.no_rekening || null,
            id_user,
        ]);
        // 2. Update pengguna
        if (data.alamat || data.no_telp) {
            await query(`UPDATE pengguna
         SET 
           alamat = COALESCE($1, alamat),
           no_telp = COALESCE($2, no_telp)
         WHERE id_user = $3;`, [data.alamat || null, data.no_telp || null, id_user]);
        }
        return this.getProfile({ id_user });
    },
    /**
     * Dashboard & Statistik Operasional Mitra
     */
    async getDashboard(id_mitra) {
        const profile = await this.getProfile({ id_mitra });
        if (!profile) {
            throw new Error(`Mitra dengan ID ${id_mitra} tidak ditemukan.`);
        }
        const kapasitas = profile.kapasitas_tampung_limbah_kg || 0;
        // 1. Hitung total limbah yang selesai dijemput/diolah
        const diolahRes = await query(`
      SELECT 
        COALESCE(SUM(berat_kg), 0)::float AS total_kg,
        COALESCE(SUM(COALESCE(harga_kesepakatan, estimasi_harga)), 0)::float AS total_kompensasi
      FROM limbah
      WHERE id_mitra = $1 AND status_jemput = 'Selesai';
    `, [id_mitra]);
        // 2. Hitung penjemputan aktif
        const antreanRes = await query(`
      SELECT COUNT(*)::int AS total
      FROM limbah
      WHERE id_mitra = $1 AND status_jemput IN ('Diajukan', 'Proses');
    `, [id_mitra]);
        // 3. Hitung bursa limbah yang tersedia
        const bursaRes = await query(`
      SELECT COUNT(*)::int AS total
      FROM limbah
      WHERE status_jemput = 'Tersedia' AND status_verifikasi = 'Terverifikasi';
    `);
        // 4. Hitung pengiriman aktif & selesai
        const shipRes = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status_pengiriman IN ('Diproses', 'Dalam Perjalanan'))::int AS aktif,
        COUNT(*) FILTER (WHERE status_pengiriman = 'Tiba di Lokasi')::int AS selesai
      FROM riwayat_pengiriman
      WHERE id_mitra = $1;
    `, [id_mitra]);
        const totalKg = diolahRes.rows[0]?.total_kg || 0;
        const persentase = kapasitas > 0 ? Math.min(100, Math.round((totalKg / kapasitas) * 100)) : 0;
        return {
            id_mitra,
            nama_mitra_instansi: profile.nama_mitra_instansi,
            kapasitasTampungKg: kapasitas,
            totalLimbahDiolahKg: totalKg,
            antreanPenjemputanCount: antreanRes.rows[0]?.total || 0,
            bursaTersediaCount: bursaRes.rows[0]?.total || 0,
            pengirimanAktifCount: shipRes.rows[0]?.aktif || 0,
            pengirimanSelesaiCount: shipRes.rows[0]?.selesai || 0,
            totalKompensasiLimbah: diolahRes.rows[0]?.total_kompensasi || 0,
            persentaseKapasitasTerpakai: persentase,
        };
    },
    /**
     * Mengambil bursa limbah sirkular yang tersedia untuk diajukan
     */
    async getAvailableWaste(filters = {}) {
        const conditions = ["l.status_jemput = 'Tersedia'", "l.status_verifikasi = 'Terverifikasi'"];
        const params = [];
        let paramIdx = 1;
        if (filters.jenis) {
            conditions.push(`l.jenis_limbah = $${paramIdx++}`);
            params.push(filters.jenis);
        }
        if (filters.search) {
            conditions.push(`(l.lokasi_penjemputan ILIKE $${paramIdx} OR um.nama_usaha ILIKE $${paramIdx})`);
            params.push(`%${filters.search}%`);
            paramIdx++;
        }
        const sql = `
      SELECT 
        l.*,
        um.nama_usaha,
        um.no_telp AS no_telp_umkm,
        u.nama_lengkap AS nama_pemilik_umkm
      FROM limbah l
      LEFT JOIN umkm um ON l.id_umkm = um.id_umkm
      LEFT JOIN pengguna u ON um.id_user = u.id_user
      WHERE ${conditions.join(" AND ")}
      ORDER BY l.tgl_input DESC;
    `;
        const res = await query(sql, params);
        return res.rows;
    },
    /**
     * Mengambil antrean penjemputan limbah milik Mitra tertentu
     */
    async getMyPickups(id_mitra, status) {
        const conditions = ["l.id_mitra = $1"];
        const params = [id_mitra];
        if (status) {
            conditions.push("l.status_jemput = $2");
            params.push(status);
        }
        const sql = `
      SELECT 
        l.*,
        um.nama_usaha,
        um.no_telp AS no_telp_umkm,
        u.nama_lengkap AS nama_pemilik_umkm,
        u.email AS email_umkm
      FROM limbah l
      LEFT JOIN umkm um ON l.id_umkm = um.id_umkm
      LEFT JOIN pengguna u ON um.id_user = u.id_user
      WHERE ${conditions.join(" AND ")}
      ORDER BY 
        CASE 
          WHEN l.status_jemput = 'Diajukan' THEN 1
          WHEN l.status_jemput = 'Proses' THEN 2
          ELSE 3
        END,
        l.tgl_input DESC;
    `;
        const res = await query(sql, params);
        return res.rows;
    },
    /**
     * Mitra mengajukan diri untuk menjemput limbah dari Bursa Sirkular (Tersedia ➔ Diajukan)
     */
    async claimPickup(id_limbah, id_mitra, harga_kesepakatan) {
        // 1. Validasi limbah tersedia
        const checkRes = await query(`SELECT * FROM limbah WHERE id_limbah = $1;`, [id_limbah]);
        if (checkRes.rowCount === 0) {
            throw new Error(`Batch limbah dengan ID #${id_limbah} tidak ditemukan.`);
        }
        const current = checkRes.rows[0];
        if (current.status_jemput !== "Tersedia") {
            throw new Error(`Batch limbah #${id_limbah} sudah tidak tersedia (status saat ini: ${current.status_jemput}).`);
        }
        // 2. Ambil profil mitra
        const profile = await this.getProfile({ id_mitra });
        if (!profile) {
            throw new Error(`Mitra dengan ID ${id_mitra} tidak valid.`);
        }
        const hargaFinal = harga_kesepakatan !== undefined ? harga_kesepakatan : current.estimasi_harga;
        // 3. Update status limbah
        const updateRes = await query(`UPDATE limbah
       SET 
         id_mitra = $1,
         status_jemput = 'Diajukan',
         harga_kesepakatan = $2
       WHERE id_limbah = $3
       RETURNING *;`, [id_mitra, hargaFinal, id_limbah]);
        // 4. Catat ke log sistem
        await query(`INSERT INTO log_sistem (id_user, level, aksi, endpoint_api, kode_status, pesan, waktu)
       VALUES ($1, 'Info', 'KLAIM_PENJEMPUTAN_LIMBAH', '/api/v1/mitra/limbah/klaim', 200, $2, CURRENT_TIMESTAMP);`, [
            profile.id_user,
            `Mitra ${profile.nama_mitra_instansi} mengajukan penjemputan Batch Limbah #${id_limbah} (${current.jenis_limbah}, ${current.berat_kg} kg).`,
        ]);
        return updateRes.rows[0];
    },
    /**
     * Mitra memperbarui tahapan penjemputan limbah:
     * Diajukan ➔ Proses (Berangkat ke lokasi)
     * Proses ➔ Selesai (Limbah tiba di fasilitas pengolahan)
     */
    async updatePickupStatus(id_limbah, id_mitra, status_jemput) {
        const checkRes = await query(`SELECT l.*, um.id_user AS id_user_umkm, um.nama_usaha
       FROM limbah l
       LEFT JOIN umkm um ON l.id_umkm = um.id_umkm
       WHERE l.id_limbah = $1 AND l.id_mitra = $2;`, [id_limbah, id_mitra]);
        if (checkRes.rowCount === 0) {
            throw new Error(`Batch limbah #${id_limbah} untuk mitra ini tidak ditemukan.`);
        }
        const current = checkRes.rows[0];
        const profile = await this.getProfile({ id_mitra });
        let sqlUpdate = `UPDATE limbah SET status_jemput = $1 WHERE id_limbah = $2 RETURNING *;`;
        let updateParams = [status_jemput, id_limbah];
        if (status_jemput === "Selesai") {
            sqlUpdate = `UPDATE limbah SET status_jemput = $1, tgl_jemput = CURRENT_TIMESTAMP WHERE id_limbah = $2 RETURNING *;`;
        }
        const updateRes = await query(sqlUpdate, updateParams);
        const updatedLimbah = updateRes.rows[0];
        // Jika selesai dan ada transaksi kompensasi uang, catat otomatis di `pencatatan_keuangan`
        if (status_jemput === "Selesai") {
            const nominal = parseFloat(String(updatedLimbah.harga_kesepakatan || updatedLimbah.estimasi_harga || 0));
            if (nominal > 0 && current.jenis_kompensasi === "Jual Beli") {
                // A. Catat Pengeluaran untuk Mitra
                if (profile?.id_user) {
                    await query(`INSERT INTO pencatatan_keuangan (id_user, id_limbah, jenis_transaksi, jumlah_uang, keterangan, tgl_pencatatan)
             VALUES ($1, $2, 'Pengeluaran', $3, $4, CURRENT_TIMESTAMP);`, [
                        profile.id_user,
                        id_limbah,
                        nominal,
                        `Pembelian bahan baku sirkular (${current.jenis_limbah} ${current.berat_kg} kg) dari ${current.nama_usaha || "UMKM"}`,
                    ]);
                }
                // B. Catat Pemasukan untuk UMKM
                if (current.id_user_umkm) {
                    await query(`INSERT INTO pencatatan_keuangan (id_user, id_limbah, jenis_transaksi, jumlah_uang, keterangan, tgl_pencatatan)
             VALUES ($1, $2, 'Pemasukan', $3, $4, CURRENT_TIMESTAMP);`, [
                        current.id_user_umkm,
                        id_limbah,
                        nominal,
                        `Kompensasi setor limbah sirkular (${current.jenis_limbah} ${current.berat_kg} kg) kepada ${profile?.nama_mitra_instansi || "Mitra"}`,
                    ]);
                }
            }
            // Catat log sistem
            await query(`INSERT INTO log_sistem (id_user, level, aksi, endpoint_api, kode_status, pesan, waktu)
         VALUES ($1, 'Info', 'PENJEMPUTAN_LIMBAH_SELESAI', '/api/v1/mitra/limbah/status', 200, $2, CURRENT_TIMESTAMP);`, [
                profile?.id_user || null,
                `Penjemputan Batch Limbah #${id_limbah} (${current.jenis_limbah} ${current.berat_kg} kg) telah selesai diproses oleh ${profile?.nama_mitra_instansi}.`,
            ]);
        }
        else {
            await query(`INSERT INTO log_sistem (id_user, level, aksi, endpoint_api, kode_status, pesan, waktu)
         VALUES ($1, 'Info', 'STATUS_PENJEMPUTAN_DIUBAH', '/api/v1/mitra/limbah/status', 200, $2, CURRENT_TIMESTAMP);`, [
                profile?.id_user || null,
                `Status penjemputan Batch Limbah #${id_limbah} diubah menjadi '${status_jemput}' oleh ${profile?.nama_mitra_instansi}.`,
            ]);
        }
        return updatedLimbah;
    },
    /**
     * Mengambil riwayat pengiriman logistik produk yang ditangani mitra
     */
    async getShipments(id_mitra, status) {
        const conditions = ["rp.id_mitra = $1"];
        const params = [id_mitra];
        if (status) {
            conditions.push("rp.status_pengiriman = $2");
            params.push(status);
        }
        const sql = `
      SELECT 
        rp.*,
        t.total_harga,
        t.status AS status_transaksi,
        t.tgl_transaksi,
        p_pembeli.nama_lengkap AS nama_pembeli,
        p_pembeli.no_telp AS no_telp_pembeli,
        p_pembeli.alamat AS alamat_tujuan,
        p_penjual.nama_lengkap AS nama_penjual,
        p_penjual.alamat AS alamat_asal
      FROM riwayat_pengiriman rp
      JOIN transaksi t ON rp.id_transaksi = t.id_transaksi
      JOIN pengguna p_pembeli ON t.id_pembeli = p_pembeli.id_user
      JOIN pengguna p_penjual ON t.id_penjual = p_penjual.id_user
      WHERE ${conditions.join(" AND ")}
      ORDER BY 
        CASE 
          WHEN rp.status_pengiriman = 'Diproses' THEN 1
          WHEN rp.status_pengiriman = 'Dalam Perjalanan' THEN 2
          ELSE 3
        END,
        rp.tgl_pengiriman DESC;
    `;
        const res = await query(sql, params);
        return res.rows;
    },
    /**
     * Memperbarui tahapan status pengiriman produk:
     * Diproses ➔ Dalam Perjalanan ➔ Tiba di Lokasi
     */
    async updateShipmentStatus(id_pengiriman, id_mitra, status_pengiriman) {
        const checkRes = await query(`SELECT * FROM riwayat_pengiriman WHERE id_pengiriman = $1 AND id_mitra = $2;`, [id_pengiriman, id_mitra]);
        if (checkRes.rowCount === 0) {
            throw new Error(`Data pengiriman #${id_pengiriman} untuk mitra ini tidak ditemukan.`);
        }
        const current = checkRes.rows[0];
        const profile = await this.getProfile({ id_mitra });
        let sql = `UPDATE riwayat_pengiriman SET status_pengiriman = $1 WHERE id_pengiriman = $2 RETURNING *;`;
        let params = [status_pengiriman, id_pengiriman];
        if (status_pengiriman === "Tiba di Lokasi") {
            sql = `UPDATE riwayat_pengiriman SET status_pengiriman = $1, tgl_diterima = CURRENT_TIMESTAMP WHERE id_pengiriman = $2 RETURNING *;`;
            // Update juga status transaksi menjadi 'Selesai'
            await query(`UPDATE transaksi SET status = 'Selesai' WHERE id_transaksi = $1;`, [current.id_transaksi]);
        }
        const updateRes = await query(sql, params);
        // Catat log sistem
        await query(`INSERT INTO log_sistem (id_user, level, aksi, endpoint_api, kode_status, pesan, waktu)
       VALUES ($1, 'Info', 'STATUS_PENGIRIMAN_DIUBAH', '/api/v1/mitra/pengiriman/status', 200, $2, CURRENT_TIMESTAMP);`, [
            profile?.id_user || null,
            `Mitra ${profile?.nama_mitra_instansi} memperbarui status resi ${current.no_resi_lacak} menjadi '${status_pengiriman}'.`,
        ]);
        return updateRes.rows[0];
    },
    /**
     * Mengirim ulang dokumen persyaratan mitra jika ditolak
     */
    async resubmitDocument(id_user, foto_persyaratan_url, foto_persyaratan_name) {
        const checkRes = await query(`SELECT * FROM pengguna WHERE id_user = $1 AND peran = 'Mitra';`, [id_user]);
        if (checkRes.rowCount === 0) {
            throw new Error(`Mitra dengan ID ${id_user} tidak ditemukan.`);
        }
        const updateRes = await query(`UPDATE pengguna
       SET 
         foto_persyaratan_url = $1,
         foto_persyaratan_name = $2,
         status_verifikasi = 'Menunggu',
         alasan_penolakan = NULL
       WHERE id_user = $3
       RETURNING *;`, [foto_persyaratan_url, foto_persyaratan_name || "berkas-mitra-baru.jpg", id_user]);
        await query(`INSERT INTO log_sistem (id_user, level, aksi, endpoint_api, kode_status, pesan, waktu)
       VALUES ($1, 'Info', 'RESUBMIT_DOKUMEN_MITRA', '/api/v1/mitra/resubmit', 200, $2, CURRENT_TIMESTAMP);`, [id_user, `Mitra ${checkRes.rows[0].nama_lengkap} mengirim ulang berkas verifikasi baru.`]);
        return updateRes.rows[0];
    },
};
