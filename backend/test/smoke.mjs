// Uji alur utama terhadap server yang sedang berjalan: node test/smoke.mjs [BASE_URL]
const BASE = process.argv[2] || "http://localhost:4000";
const PASS = process.env.SEED_PASSWORD || "Samangga123!";
let gagal = 0;
const cek = (nama, kondisi, info = "") => {
  console.log(`${kondisi ? "OK  " : "GAGAL"} ${nama}${!kondisi && info ? "  -> " + info : ""}`);
  if (!kondisi) gagal++;
};
const api = async (method, path, { token, body, headers } = {}) => {
  const r = await fetch(BASE + path, {
    method,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  return { status: r.status, json };
};
const login = async (email) => (await api("POST", "/api/auth/masuk", { body: { email, password: PASS } })).json.token;

const admin = await login("admin@samangga.id");
const supplier = await login("agus.sumberrejeki@samangga.id");
const umkm = await login("bu.ning@samangga.id");
const mitra = await login("ciptarasa@samangga.id");
const konsumen = await login("tokobuah@samangga.id");
cek("login 5 peran", admin && supplier && umkm && mitra && konsumen);

let r = await api("POST", "/api/auth/masuk", { body: { email: "admin@samangga.id", password: "salah-salah" } });
cek("login password salah -> 401", r.status === 401);

// Pendaftaran
const email = `uji${Date.now()}@contoh.id`;
r = await api("POST", "/api/auth/daftar", { body: { nama_lengkap: "Uji Coba", email, no_telp: "081234500000", peran: "Konsumen", alamat: "Jalan Mangga No. 1", password: "rahasia123" } });
cek("daftar -> 201 Menunggu", r.status === 201 && r.json.status_verifikasi === "Menunggu", JSON.stringify(r.json));
r = await api("POST", "/api/auth/daftar", { body: { nama_lengkap: "U", email: "x", no_telp: "1", peran: "Admin", alamat: "a", password: "1" } });
cek("daftar tidak valid -> 422 + errors", r.status === 422 && r.json.errors?.email && r.json.errors?.peran, JSON.stringify(r.json));
r = await api("POST", "/api/auth/daftar", { body: { nama_lengkap: "Uji Coba", email, no_telp: "081234500000", peran: "Konsumen", alamat: "Jalan Mangga No. 1", password: "rahasia123" } });
cek("email duplikat -> 409", r.status === 409);
const baru = (await api("POST", "/api/auth/masuk", { body: { email, password: "rahasia123" } })).json.token;
r = await api("POST", "/api/transaksi", { token: baru, body: { metode_pembayaran: "QRIS", items: [{ id_produk: 1, jumlah_produk: 1 }] } });
cek("akun Menunggu tidak boleh transaksi -> 403", r.status === 403);
r = await api("GET", "/api/admin/pengguna?status=Menunggu", { token: admin });
const idBaru = r.json.data?.find((u) => u.email === email)?.id_user;
r = await api("PATCH", `/api/admin/pengguna/${idBaru}/verifikasi`, { token: admin, body: { status_verifikasi: "Terverifikasi" } });
cek("admin verifikasi pengguna", r.status === 200);

// Produk
r = await api("GET", "/api/produk?kategori=Buah");
cek("katalog publik", r.status === 200 && r.json.data.length >= 3);
r = await api("POST", "/api/produk", { token: konsumen, body: { nama_produk: "Tes", kategori: "Buah", harga: 1, stok: 1, satuan: "kg" } });
cek("konsumen tidak boleh jual -> 403", r.status === 403);
r = await api("POST", "/api/produk", { token: supplier, body: { nama_produk: "Mangga Uji", kategori: "Buah", harga: 10000, stok: 10, satuan: "kg" } });
cek("supplier tambah produk -> Menunggu", r.status === 201 && r.json.data.status_verifikasi === "Menunggu");
const idProdukBaru = r.json.data?.id_produk;
r = await api("GET", `/api/produk/${idProdukBaru}`);
cek("produk belum verifikasi tidak publik -> 404", r.status === 404);
r = await api("PATCH", `/api/admin/produk/${idProdukBaru}/verifikasi`, { token: admin, body: { status_verifikasi: "Terverifikasi" } });
cek("admin verifikasi produk", r.status === 200);

// Transaksi Transfer Manual
const stokAwal = (await api("GET", "/api/produk/1")).json.data.stok;
r = await api("POST", "/api/transaksi", { token: konsumen, body: { metode_pembayaran: "Transfer Manual", items: [{ id_produk: 1, jumlah_produk: 2 }, { id_produk: 2, jumlah_produk: 1 }] } });
cek("checkout produk 1 penjual", r.status === 201 && r.json.transaksi.total_harga === 1450000 * 2 + 1200000, JSON.stringify(r.json));
const t1 = r.json.transaksi?.id_transaksi;
cek("stok berkurang", (await api("GET", "/api/produk/1")).json.data.stok === stokAwal - 2);
r = await api("POST", "/api/transaksi", { token: konsumen, body: { metode_pembayaran: "QRIS", items: [{ id_produk: 1, jumlah_produk: 99999 }] } });
cek("stok tidak cukup -> 409", r.status === 409);
r = await api("POST", "/api/transaksi", { token: konsumen, body: { metode_pembayaran: "QRIS", items: [{ id_produk: 1, jumlah_produk: 1 }, { id_produk: 5, jumlah_produk: 1 }] } });
cek("beda penjual -> 422", r.status === 422);
r = await api("POST", `/api/transaksi/${t1}/konfirmasi`, { token: supplier, body: { diterima: true } });
cek("konfirmasi tanpa bukti -> 409", r.status === 409);
r = await api("POST", `/api/transaksi/${t1}/bukti`, { token: konsumen, body: { bukti_transfer: "/uploads/bukti1.jpg" } });
cek("upload bukti", r.status === 200);
r = await api("POST", `/api/transaksi/${t1}/konfirmasi`, { token: konsumen, body: { diterima: true } });
cek("pembeli tidak boleh konfirmasi -> 403", r.status === 403);
r = await api("POST", `/api/transaksi/${t1}/konfirmasi`, { token: supplier, body: { diterima: true } });
cek("penjual konfirmasi pembayaran", r.status === 200);
r = await api("GET", `/api/transaksi/${t1}`, { token: konsumen });
cek("status Diproses + pembayaran Berhasil", r.json.transaksi.status === "Diproses" && r.json.pembayaran.status_pembayaran === "Berhasil" && r.json.detail.length === 2);
r = await api("POST", `/api/transaksi/${t1}/pengiriman`, { token: supplier, body: { no_resi_lacak: "RESI-001" } });
cek("buat pengiriman", r.status === 201);
const idKirim = r.json.data?.id_pengiriman;
r = await api("PATCH", `/api/transaksi/pengiriman/${idKirim}`, { token: supplier, body: { status_pengiriman: "Tiba di Lokasi" } });
cek("pengiriman tiba", r.status === 200 && r.json.data.tgl_diterima);
r = await api("PATCH", `/api/transaksi/${t1}/status`, { token: konsumen, body: { status: "Selesai" } });
cek("pembeli selesaikan pesanan", r.status === 200 && r.json.data.status === "Selesai");
r = await api("GET", "/api/keuangan", { token: supplier });
cek("keuangan penjual: pemasukan tercatat", r.json.ringkasan.total_pemasukan >= 4100000, JSON.stringify(r.json.ringkasan));
r = await api("GET", "/api/keuangan", { token: konsumen });
cek("keuangan pembeli: pengeluaran tercatat", r.json.ringkasan.total_pengeluaran >= 4100000);

// Virtual Account + callback gateway + batal
r = await api("POST", "/api/transaksi", { token: konsumen, body: { metode_pembayaran: "Virtual Account", items: [{ id_produk: 3, jumlah_produk: 1 }] } });
const t2 = r.json.transaksi.id_transaksi, ref = r.json.pembayaran.id_referensi_gateway;
cek("VA punya kode pembayaran", /^8808\d{12}$/.test(r.json.pembayaran.kode_pembayaran));
r = await api("POST", "/api/pembayaran/callback", { body: { id_referensi_gateway: ref, status: "Berhasil" } });
cek("callback tanpa token -> 401", r.status === 401);
const hdr = { "x-callback-token": process.env.PAYMENT_CALLBACK_TOKEN || "ganti-token-callback-gateway" };
r = await api("POST", "/api/pembayaran/callback", { headers: hdr, body: { id_referensi_gateway: ref, status: "Berhasil" } });
cek("callback Berhasil", r.status === 200, JSON.stringify(r.json));
await api("POST", "/api/pembayaran/callback", { headers: hdr, body: { id_referensi_gateway: ref, status: "Berhasil" } });
r = await api("GET", `/api/transaksi/${t2}`, { token: konsumen });
cek("callback idempoten (Diproses)", r.json.transaksi.status === "Diproses");

const stok3 = (await api("GET", "/api/produk/3")).json.data.stok;
r = await api("POST", "/api/transaksi", { token: konsumen, body: { metode_pembayaran: "QRIS", items: [{ id_produk: 3, jumlah_produk: 3 }] } });
const t3 = r.json.transaksi.id_transaksi;
r = await api("PATCH", `/api/transaksi/${t3}/status`, { token: konsumen, body: { status: "Batal" } });
cek("batal Pending", r.status === 200 && r.json.data.status === "Batal");
cek("stok kembali setelah batal", (await api("GET", "/api/produk/3")).json.data.stok === stok3);

// Login memakai nomor WhatsApp + simulasi gateway
r = await api("POST", "/api/auth/masuk", { body: { identifier: "081211223344", password: PASS } });
cek("login pakai nomor WhatsApp", r.status === 200 && !!r.json.token, JSON.stringify(r.json));
r = await api("POST", "/api/auth/masuk", { body: { identifier: "+62 812-1122-3344", password: PASS } });
cek("login nomor format +62", r.status === 200);
r = await api("POST", "/api/transaksi", { token: konsumen, body: { metode_pembayaran: "QRIS", items: [{ id_produk: 3, jumlah_produk: 1 }] } });
const t4 = r.json.transaksi.id_transaksi;
r = await api("POST", `/api/pembayaran/simulasi/${t4}`, { token: supplier });
cek("simulasi bayar oleh bukan pembeli -> 403", r.status === 403);
r = await api("POST", `/api/pembayaran/simulasi/${t4}`, { token: konsumen });
cek("simulasi bayar QRIS", r.status === 200, JSON.stringify(r.json));
r = await api("GET", `/api/transaksi/${t4}`, { token: konsumen });
cek("setelah simulasi -> Diproses", r.json.transaksi.status === "Diproses");

// Limbah
r = await api("POST", "/api/limbah", { token: umkm, body: { jenis_limbah: "Kulit", berat_kg: 80, lokasi_penjemputan: "Losarang, Indramayu", kondisi: "Segar, < 24 jam" } });
cek("UMKM setor limbah -> Menunggu", r.status === 201 && r.json.data.status_verifikasi === "Menunggu" && r.json.data.estimasi_harga === 80000 && r.json.data.kondisi === "Segar, < 24 jam", JSON.stringify(r.json));
const idL = r.json.data?.id_limbah;
r = await api("POST", `/api/limbah/${idL}/jemput`, { token: mitra, body: { jenis_kompensasi: "Jual Beli", harga_kesepakatan: 90000 } });
cek("jemput limbah belum verifikasi -> 409", r.status === 409);
r = await api("PATCH", `/api/limbah/${idL}/verifikasi`, { token: admin, body: { status_verifikasi: "Terverifikasi" } });
cek("admin verifikasi limbah", r.status === 200);
r = await api("POST", `/api/limbah/${idL}/jemput`, { token: mitra, body: { jenis_kompensasi: "Jual Beli", harga_kesepakatan: 90000 } });
cek("mitra ajukan jemput", r.status === 201 && r.json.data.status_jemput === "Diajukan");
r = await api("POST", `/api/limbah/${idL}/jemput`, { token: mitra, body: { jenis_kompensasi: "Gratis" } });
cek("jemput ganda -> 409", r.status === 409);
r = await api("PATCH", `/api/limbah/${idL}/status`, { token: mitra, body: { status_jemput: "Selesai" } });
cek("lompat status -> 409", r.status === 409);
await api("PATCH", `/api/limbah/${idL}/status`, { token: mitra, body: { status_jemput: "Proses" } });
r = await api("PATCH", `/api/limbah/${idL}/status`, { token: mitra, body: { status_jemput: "Selesai" } });
cek("jemput selesai", r.status === 200 && r.json.data.status_jemput === "Selesai");
r = await api("GET", "/api/keuangan", { token: umkm });
cek("keuangan UMKM: pemasukan limbah", r.json.data.some((x) => x.id_limbah === idL && x.jenis_transaksi === "Pemasukan" && x.jumlah_uang === 90000));
r = await api("GET", "/api/keuangan", { token: mitra });
cek("keuangan Mitra: pengeluaran limbah", r.json.data.some((x) => x.id_limbah === idL && x.jenis_transaksi === "Pengeluaran"));
r = await api("GET", "/api/limbah?jenis=Kulit");
cek("listing limbah publik", r.status === 200 && r.json.data.length >= 1);

// Upload file
const kirimFile = (tipe, mime, data, token) =>
  fetch(BASE + `/api/upload/${tipe}`, { method: "POST", headers: { "content-type": mime, ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: data });
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
let u = await kirimFile("produk", "image/png", png, supplier);
const ju = await u.json();
cek("upload gambar PNG -> 201 + path", u.status === 201 && /^\/uploads\/produk\/.+\.png$/.test(ju.path), JSON.stringify(ju));
const ambil = await fetch(BASE + ju.path);
cek("file hasil upload bisa dibuka", ambil.status === 200 && ambil.headers.get("content-type") === "image/png");
u = await kirimFile("produk", "image/png", Buffer.from("bukan gambar"), supplier);
cek("isi file palsu -> 422", u.status === 422);
u = await kirimFile("produk", "text/html", Buffer.from("<script>1</script>"), supplier);
cek("jenis file tidak didukung -> 415", u.status === 415);
u = await kirimFile("produk", "image/png", png);
cek("upload tanpa login -> 401", u.status === 401);
u = await kirimFile("limbah", "application/pdf", Buffer.from("%PDF-1.4 x"), umkm);
cek("PDF tidak boleh untuk foto limbah -> 415", u.status === 415);
u = await kirimFile("bukti", "application/pdf", Buffer.from("%PDF-1.4 x"), konsumen);
cek("PDF boleh untuk bukti transfer", u.status === 201);

// Admin + log
r = await api("GET", "/api/admin/ringkasan", { token: admin });
cek("ringkasan admin", r.status === 200 && r.json.data.total_pengguna >= 6);
r = await api("GET", "/api/admin/log?level=Warning", { token: admin });
cek("log sistem tercatat", r.status === 200 && r.json.data.length > 0);
r = await api("GET", "/api/admin/log", { token: umkm });
cek("non-admin akses log -> 403", r.status === 403);
r = await api("GET", "/api/auth/me", { token: umkm });
cek("/me berisi profil UMKM tanpa password", r.json.profil?.nama_usaha && !("password" in r.json.pengguna));
r = await api("GET", "/api/tidak-ada");
cek("404 endpoint", r.status === 404);

console.log(gagal ? `\n${gagal} pengujian GAGAL` : "\nSemua pengujian lulus");
process.exit(gagal ? 1 : 0);
