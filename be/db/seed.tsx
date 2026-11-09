import bcrypt from "bcryptjs";
import { pool } from "./index.tsx";
import {
  SEED_PENGGUNA,
  SEED_SUPPLIER,
  SEED_UMKM,
  SEED_MITRA,
  SEED_KONSUMEN,
  SEED_ADMIN,
} from "./seeds/users.seed.tsx";
import { SEED_PRODUK } from "./seeds/products.seed.tsx";
import { SEED_LIMBAH } from "./seeds/waste.seed.tsx";
import {
  SEED_TRANSAKSI,
  SEED_DETAIL_TRANSAKSI,
  SEED_PEMBAYARAN,
  SEED_RIWAYAT_PENGIRIMAN,
  SEED_KEUANGAN,
  SEED_LOG_SISTEM,
} from "./seeds/transactions.seed.tsx";
import { fileURLToPath } from "url";

export async function runSeed(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log("🌱 Memulai seeding data PostgreSQL SAMANGGA (TypeScript / TSX)...");

    await client.query("BEGIN;");

    await client.query(`
      TRUNCATE TABLE
        log_sistem,
        pencatatan_keuangan,
        riwayat_pengiriman,
        pembayaran,
        detail_transaksi,
        transaksi,
        limbah,
        produk,
        konsumen,
        mitra,
        umkm,
        supplier,
        admin,
        pengguna
      RESTART IDENTITY CASCADE;
    `);

    const passwordHash = await bcrypt.hash(process.env.DEMO_PASSWORD || "samangga2026", 10);

    for (const u of SEED_PENGGUNA) {
      await client.query(
        `INSERT INTO pengguna (
          id_user, nama_lengkap, peran, no_telp, alamat, email, password,
          status_verifikasi, foto_persyaratan_url, foto_persyaratan_name, alasan_penolakan, tgl_daftar
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id_user) DO UPDATE SET
          nama_lengkap = EXCLUDED.nama_lengkap,
          status_verifikasi = EXCLUDED.status_verifikasi,
          password = EXCLUDED.password;`,
        [
          u.id_user,
          u.nama_lengkap,
          u.peran,
          u.no_telp,
          u.alamat,
          u.email,
          passwordHash,
          u.status_verifikasi,
          u.foto_persyaratan_url || null,
          u.foto_persyaratan_name || null,
          u.alasan_penolakan || null,
          u.tgl_daftar || new Date(),
        ]
      );
    }
    console.log(`✅ ${SEED_PENGGUNA.length} Pengguna seeded.`);

    for (const a of SEED_ADMIN) {
      await client.query(
        `INSERT INTO admin (
          id_admin, id_user, nip_id_pegawai, tingkat_akses, no_telp, divisi
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id_user) DO NOTHING;`,
        [a.id_admin, a.id_user, a.nip_id_pegawai, a.tingkat_akses, a.no_telp, a.divisi]
      );
    }
    console.log(`✅ ${SEED_ADMIN.length} Admin seeded.`);

    for (const s of SEED_SUPPLIER) {
      await client.query(
        `INSERT INTO supplier (
          id_supplier, id_user, tipe_supplier, no_telp, luas_lahan_m2,
          jenis_komoditas_utama, nama_bank, no_rekening
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id_user) DO NOTHING;`,
        [
          s.id_supplier,
          s.id_user,
          s.tipe_supplier,
          s.no_telp,
          s.luas_lahan_m2,
          s.jenis_komoditas_utama,
          s.nama_bank,
          s.no_rekening,
        ]
      );
    }

    for (const m of SEED_UMKM) {
      await client.query(
        `INSERT INTO umkm (
          id_umkm, id_user, nama_usaha, nib, no_telp, kategori_produk_olahan,
          kapasitas_produksi_bulanan, nama_bank, no_rekening
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id_user) DO NOTHING;`,
        [
          m.id_umkm,
          m.id_user,
          m.nama_usaha,
          m.nib,
          m.no_telp,
          m.kategori_produk_olahan,
          m.kapasitas_produksi_bulanan,
          m.nama_bank,
          m.no_rekening,
        ]
      );
    }

    for (const mt of SEED_MITRA) {
      await client.query(
        `INSERT INTO mitra (
          id_mitra, id_user, nama_mitra_instansi, no_telp, jenis_pengolahan_limbah,
          kapasitas_tampung_limbah_kg, jangkauan_area, nama_bank, no_rekening
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id_user) DO NOTHING;`,
        [
          mt.id_mitra,
          mt.id_user,
          mt.nama_mitra_instansi,
          mt.no_telp,
          mt.jenis_pengolahan_limbah,
          mt.kapasitas_tampung_limbah_kg,
          mt.jangkauan_area,
          mt.nama_bank,
          mt.no_rekening,
        ]
      );
    }

    for (const k of SEED_KONSUMEN) {
      await client.query(
        `INSERT INTO konsumen (
          id_konsumen, id_user, kategori_konsumen, no_telp, alamat_pengiriman_utama, titik_koordinat
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id_user) DO NOTHING;`,
        [k.id_konsumen, k.id_user, k.kategori_konsumen, k.no_telp, k.alamat_pengiriman_utama, k.titik_koordinat]
      );
    }

    for (const p of SEED_PRODUK) {
      await client.query(
        `INSERT INTO produk (
          id_produk, id_user, nama_produk, kategori, harga, stok, satuan,
          deskripsi, gambar, status_verifikasi, lokasi, tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id_produk) DO NOTHING;`,
        [
          p.id_produk,
          p.id_user,
          p.nama_produk,
          p.kategori,
          p.harga,
          p.stok,
          p.satuan,
          p.deskripsi,
          p.gambar,
          p.status_verifikasi,
          p.lokasi || "Indramayu",
          p.tags || [],
        ]
      );
    }

    for (const l of SEED_LIMBAH) {
      await client.query(
        `INSERT INTO limbah (
          id_limbah, id_umkm, id_mitra, jenis_limbah, berat_kg, estimasi_harga,
          jenis_kompensasi, harga_kesepakatan, lokasi_penjemputan, titik_koordinat,
          foto_limbah, status_jemput, status_verifikasi, tgl_input
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id_limbah) DO NOTHING;`,
        [
          l.id_limbah,
          l.id_umkm,
          l.id_mitra,
          l.jenis_limbah,
          l.berat_kg,
          l.estimasi_harga,
          l.jenis_kompensasi,
          l.harga_kesepakatan,
          l.lokasi_penjemputan,
          l.titik_koordinat,
          l.foto_limbah,
          l.status_jemput,
          l.status_verifikasi,
          l.tgl_input || new Date(),
        ]
      );
    }

    for (const t of SEED_TRANSAKSI) {
      await client.query(
        `INSERT INTO transaksi (
          id_transaksi, id_pembeli, id_penjual, total_harga, status, tgl_transaksi
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id_transaksi) DO NOTHING;`,
        [t.id_transaksi, t.id_pembeli, t.id_penjual, t.total_harga, t.status, t.tgl_transaksi]
      );
    }

    for (const dt of SEED_DETAIL_TRANSAKSI) {
      await client.query(
        `INSERT INTO detail_transaksi (
          id_detail_transaksi, id_transaksi, id_produk, jumlah_produk, harga_satuan, subtotal_harga
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id_detail_transaksi) DO NOTHING;`,
        [
          dt.id_detail_transaksi,
          dt.id_transaksi,
          dt.id_produk,
          dt.jumlah_produk,
          dt.harga_satuan,
          dt.subtotal_harga,
        ]
      );
    }

    for (const pb of SEED_PEMBAYARAN) {
      await client.query(
        `INSERT INTO pembayaran (
          id_pembayaran, id_transaksi, metode_pembayaran, jumlah_bayar, status_pembayaran,
          id_referensi_gateway, kode_pembayaran, bukti_transfer, batas_waktu_bayar, tgl_bayar
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id_pembayaran) DO NOTHING;`,
        [
          pb.id_pembayaran,
          pb.id_transaksi,
          pb.metode_pembayaran,
          pb.jumlah_bayar,
          pb.status_pembayaran,
          pb.id_referensi_gateway,
          pb.kode_pembayaran,
          pb.bukti_transfer,
          pb.batas_waktu_bayar,
          pb.tgl_bayar,
        ]
      );
    }

    for (const rp of SEED_RIWAYAT_PENGIRIMAN) {
      await client.query(
        `INSERT INTO riwayat_pengiriman (
          id_pengiriman, id_transaksi, id_mitra, tgl_pengiriman, no_resi_lacak, status_pengiriman, tgl_diterima
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id_pengiriman) DO NOTHING;`,
        [
          rp.id_pengiriman,
          rp.id_transaksi,
          rp.id_mitra,
          rp.tgl_pengiriman,
          rp.no_resi_lacak,
          rp.status_pengiriman,
          rp.tgl_diterima,
        ]
      );
    }

    for (const k of SEED_KEUANGAN) {
      await client.query(
        `INSERT INTO pencatatan_keuangan (
          id_keuangan, id_user, id_transaksi, id_limbah, jenis_transaksi, jumlah_uang, keterangan, tgl_pencatatan
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id_keuangan) DO NOTHING;`,
        [
          k.id_keuangan,
          k.id_user,
          k.id_transaksi,
          k.id_limbah,
          k.jenis_transaksi,
          k.jumlah_uang,
          k.keterangan,
          k.tgl_pencatatan,
        ]
      );
    }

    for (const log of SEED_LOG_SISTEM) {
      await client.query(
        `INSERT INTO log_sistem (
          id_log, id_user, level, aksi, endpoint_api, kode_status, pesan, detail_error, waktu
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id_log) DO NOTHING;`,
        [
          log.id_log,
          log.id_user,
          log.level,
          log.aksi,
          log.endpoint_api,
          log.kode_status,
          log.pesan,
          log.detail_error,
          log.waktu,
        ]
      );
    }

    await client.query(`
      SELECT setval('pengguna_id_user_seq', COALESCE((SELECT MAX(id_user) FROM pengguna), 1) + 1, false);
      SELECT setval('admin_id_admin_seq', COALESCE((SELECT MAX(id_admin) FROM admin), 1) + 1, false);
      SELECT setval('supplier_id_supplier_seq', COALESCE((SELECT MAX(id_supplier) FROM supplier), 1) + 1, false);
      SELECT setval('umkm_id_umkm_seq', COALESCE((SELECT MAX(id_umkm) FROM umkm), 1) + 1, false);
      SELECT setval('mitra_id_mitra_seq', COALESCE((SELECT MAX(id_mitra) FROM mitra), 1) + 1, false);
      SELECT setval('konsumen_id_konsumen_seq', COALESCE((SELECT MAX(id_konsumen) FROM konsumen), 1) + 1, false);
      SELECT setval('produk_id_produk_seq', COALESCE((SELECT MAX(id_produk) FROM produk), 1) + 1, false);
      SELECT setval('limbah_id_limbah_seq', COALESCE((SELECT MAX(id_limbah) FROM limbah), 1) + 1, false);
      SELECT setval('transaksi_id_transaksi_seq', COALESCE((SELECT MAX(id_transaksi) FROM transaksi), 1) + 1, false);
      SELECT setval('detail_transaksi_id_detail_transaksi_seq', COALESCE((SELECT MAX(id_detail_transaksi) FROM detail_transaksi), 1) + 1, false);
      SELECT setval('pembayaran_id_pembayaran_seq', COALESCE((SELECT MAX(id_pembayaran) FROM pembayaran), 1) + 1, false);
      SELECT setval('riwayat_pengiriman_id_pengiriman_seq', COALESCE((SELECT MAX(id_pengiriman) FROM riwayat_pengiriman), 1) + 1, false);
      SELECT setval('pencatatan_keuangan_id_keuangan_seq', COALESCE((SELECT MAX(id_keuangan) FROM pencatatan_keuangan), 1) + 1, false);
      SELECT setval('log_sistem_id_log_seq', COALESCE((SELECT MAX(id_log) FROM log_sistem), 1) + 1, false);
    `);

    await client.query("COMMIT;");
    console.log("✅ Seeding database SAMANGGA (TypeScript / TSX) selesai dengan sukses!");
  } catch (error) {
    await client.query("ROLLBACK;");
    console.error("❌ Gagal melakukan seeding database:", error);
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeed()
    .then(() => pool.end())
    .catch(() => process.exit(1));
}
