import bcrypt from "bcryptjs";
import { pool, tx } from "../src/db.js";

const PASSWORD = process.env.SEED_PASSWORD || "Samangga123!";
const hash = await bcrypt.hash(PASSWORD, 10);

const USERS = [
  { key: "admin", nama: "Admin Utama SAMANGGA", peran: "Admin", email: "admin@samangga.id", telp: "081200000001", alamat: "Kantor SAMANGGA, Indramayu" },
  { key: "supplier", nama: "H. Agus Supriyadi (KT Sumber Rejeki)", peran: "Supplier", email: "agus.sumberrejeki@samangga.id", telp: "081223456789", alamat: "Desa Lohbener, Kec. Lohbener, Indramayu" },
  { key: "umkm", nama: "Hj. Ning (Dapur Mangga Bu Ning)", peran: "UMKM", email: "bu.ning@samangga.id", telp: "081234567890", alamat: "Indramayu Kota, Indramayu" },
  { key: "mitra", nama: "Mitra Olah Cipta Rasa", peran: "Mitra", email: "ciptarasa@samangga.id", telp: "081298765432", alamat: "Lohbener, Indramayu" },
  { key: "konsumen", nama: "Toko Buah Segar Cirebon", peran: "Konsumen", email: "tokobuah@samangga.id", telp: "081211223344", alamat: "Kota Cirebon, Jawa Barat" },
];

const PRODUK = [
  ["supplier", "Mangga Gedong Gincu", "Buah", 1450000, 50, "kwintal", "Kulit merah-jingga, aroma kuat, grade A untuk ritel premium.", "/images/mangga/mangga_gincu.jpg"],
  ["supplier", "Mangga Arumanis", "Buah", 1200000, 80, "kwintal", "Daging tebal, manis, sedikit serat. Sudah disortir.", "/images/mangga/mangga_harusmanis.jpg"],
  ["supplier", "Mangga Golek", "Buah", 950000, 35, "kwintal", "Buah lonjong besar, manis segar, siap kirim mingguan.", "/images/mangga/mangga_golek.jpg"],
  ["supplier", "Bibit Mangga Arumanis", "Bibit", 45000, 200, "pohon", "Bibit okulasi tinggi 60-80 cm.", "/images/bibit/bibit_arummanis.jpg"],
  ["umkm", "Dodol Mangga", "Olahan", 35000, 120, "pak", "Dodol mangga khas Indramayu tanpa pengawet.", "/images/olahan/dodol_mangga.jpg"],
  ["umkm", "Keripik Mangga", "Olahan", 28000, 150, "bungkus", "Keripik mangga renyah, kemasan 150 gram.", "/images/olahan/keripik_mangga.jpg"],
  ["umkm", "Sirup Mangga", "Olahan", 32000, 90, "botol", "Sirup mangga asli botol 500 ml.", "/images/olahan/sirup_mangga.jpg"],
];

const LIMBAH = [
  ["Kulit", 120, 120000, "Indramayu Kota, Indramayu", "/images/limbah/limbah_kulit_mangga.jpg"],
  ["Biji", 350, 525000, "Gantar, Indramayu", "/images/limbah/limbah_biji_mangga.jpg"],
  ["Buah Afkir", 500, 1250000, "Lohbener, Indramayu", "/images/mangga/mangga_afkir.jpg"],
  ["Daun", 300, 150000, "Jatibarang, Indramayu", "/images/limbah/limbah_daun_mangga.jpg"],
];

try {
  await tx(async (c) => {
    const id = {};
    for (const u of USERS) {
      const r = await c.query(
        `INSERT INTO pengguna (nama_lengkap, peran, no_telp, alamat, email, password, status_verifikasi)
         VALUES ($1,$2,$3,$4,$5,$6,'Terverifikasi')
         ON CONFLICT (lower(email)) DO UPDATE SET email = EXCLUDED.email RETURNING id_user`,
        [u.nama, u.peran, u.telp, u.alamat, u.email, hash],
      );
      id[u.key] = r.rows[0].id_user;
    }
    const U = (k) => USERS.find((x) => x.key === k);
    await c.query(`INSERT INTO admin (id_user, nip_id_pegawai, tingkat_akses, no_telp, divisi) VALUES ($1,'ADM-0001','Super Admin',$2,'Operasional') ON CONFLICT (id_user) DO NOTHING`, [id.admin, U("admin").telp]);
    await c.query(`INSERT INTO supplier (id_user, tipe_supplier, no_telp, luas_lahan_m2, jenis_komoditas_utama, nama_bank, no_rekening) VALUES ($1,'Petani',$2,45000,'Mangga Gedong Gincu & Arumanis','BRI','002901088219532') ON CONFLICT (id_user) DO NOTHING`, [id.supplier, U("supplier").telp]);
    await c.query(`INSERT INTO umkm (id_user, nama_usaha, nib, no_telp, kategori_produk_olahan, kapasitas_produksi_bulanan, nama_bank, no_rekening) VALUES ($1,'Dapur Mangga Bu Ning','1234567890123',$2,'Dodol, keripik, sirup',800,'BNI','0123456789') ON CONFLICT (id_user) DO NOTHING`, [id.umkm, U("umkm").telp]);
    await c.query(`INSERT INTO mitra (id_user, nama_mitra_instansi, no_telp, jenis_pengolahan_limbah, kapasitas_tampung_limbah_kg, jangkauan_area, nama_bank, no_rekening) VALUES ($1,'Mitra Olah Cipta Rasa',$2,'Kompos, pakan maggot, pulp',5000,'Indramayu dan sekitarnya','Mandiri','1230009876543') ON CONFLICT (id_user) DO NOTHING`, [id.mitra, U("mitra").telp]);
    await c.query(`INSERT INTO konsumen (id_user, kategori_konsumen, no_telp, alamat_pengiriman_utama, titik_koordinat) VALUES ($1,'Grosir',$2,'Kota Cirebon, Jawa Barat','') ON CONFLICT (id_user) DO NOTHING`, [id.konsumen, U("konsumen").telp]);

    const nProduk = (await c.query(`SELECT count(*)::int n FROM produk`)).rows[0].n;
    if (nProduk === 0) {
      for (const [k, nama, kat, harga, stok, satuan, desk, img] of PRODUK) {
        await c.query(
          `INSERT INTO produk (id_user, nama_produk, kategori, harga, stok, satuan, deskripsi, gambar, status_verifikasi)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Terverifikasi')`, [id[k], nama, kat, harga, stok, satuan, desk, img]);
      }
    }
    const nLimbah = (await c.query(`SELECT count(*)::int n FROM limbah`)).rows[0].n;
    if (nLimbah === 0) {
      const { id_umkm } = (await c.query(`SELECT id_umkm FROM umkm WHERE id_user = $1`, [id.umkm])).rows[0];
      for (const [jenis, kg, harga, lokasi, foto] of LIMBAH) {
        await c.query(
          `INSERT INTO limbah (id_umkm, jenis_limbah, berat_kg, estimasi_harga, lokasi_penjemputan, foto_limbah, status_verifikasi)
           VALUES ($1,$2,$3,$4,$5,$6,'Terverifikasi')`, [id_umkm, jenis, kg, harga, lokasi, foto]);
      }
    }
  });
  console.log(`Seed selesai. Akun demo (password: ${PASSWORD}):`);
  for (const u of USERS) console.log(`  ${u.peran.padEnd(9)} ${u.email}`);
} catch (e) {
  console.error("Seed gagal:", e.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
