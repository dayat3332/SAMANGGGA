const B = "http://localhost:4000/api";
let pass = 0, fail = 0;
async function call(method, path, body) {
  const res = await fetch(B + path, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}
function check(name, cond, extra = "") {
  if (cond) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra ? "-> " + extra : ""); }
}
const SUP = 101, SUP2 = 202, KON = 404;
const RITEL_EMAIL = `ritel.${Date.now()}@samangga.id`;

const login = await call("POST", "/auth/login", { email: "agus.sumberrejeki@samangga.id", password: "samangga2026" });
check("login supplier 101", login.status === 200 && login.json.data.user.peran === "Supplier", JSON.stringify(login.json));
const badPw = await call("POST", "/auth/login", { email: "agus.sumberrejeki@samangga.id", password: "salah123" });
check("login salah password -> 401", badPw.status === 401);
const noAcc = await call("POST", "/auth/login", { email: "tidak@ada.id", password: "samangga2026" });
check("login akun tidak ada -> 401", noAcc.status === 401);
const loginKon = await call("POST", "/auth/login", { email: "purchasing@segarbuah.co.id", password: "samangga2026" });
check("login konsumen 404", loginKon.status === 200 && loginKon.json.data.user.peran === "Konsumen");

const prof = await call("GET", `/supplier/profil/${SUP}`);
check("GET supplier profil", prof.status === 200 && prof.json.data.tipe_supplier === "Petani", JSON.stringify(prof.json).slice(0, 200));
const profUpd = await call("PUT", `/supplier/profil/${SUP}`, { nama_lengkap: "H. Agus Supriyadi", luas_lahan_m2: 26000, no_telp: "0812-2345-6789", alamat: "Desa Lohbener, Indramayu" });
check("PUT supplier profil", profUpd.status === 200 && Number(profUpd.json.data.luas_lahan_m2) === 26000, JSON.stringify(profUpd.json).slice(0, 200));
const profBad = await call("GET", `/supplier/profil/${KON}`);
check("supplier profil user konsumen -> 403", profBad.status === 403, JSON.stringify(profBad.json));
const profNone = await call("GET", `/supplier/profil/99999`);
check("supplier profil user tidak ada -> 404", profNone.status === 404);

const dash = await call("GET", `/supplier/dashboard/${SUP}`);
check("GET supplier dashboard", dash.status === 200 && dash.json.data.katalog.totalProduk >= 2, JSON.stringify(dash.json).slice(0, 300));

const plist = await call("GET", `/supplier/produk/${SUP}`);
check("GET supplier produk", plist.status === 200 && plist.json.data.every((p) => p.id_user === SUP), JSON.stringify(plist.json).slice(0, 200));
const pCreate = await call("POST", "/supplier/produk", { id_user: SUP, nama_produk: "Mangga Cengkir Uji", harga: 900000, stok: 50, satuan: "Kwintal", deskripsi: "Uji", tags: ["uji"] });
check("POST supplier produk", pCreate.status === 201 && pCreate.json.data.kategori === "Buah", JSON.stringify(pCreate.json).slice(0, 200));
const newPid = pCreate.json.data.id_produk;
const pUpd = await call("PUT", `/supplier/produk/${newPid}`, { id_user: SUP, harga: 950000, stok: 60 });
check("PUT supplier produk", pUpd.status === 200 && Number(pUpd.json.data.harga) === 950000 && pUpd.json.data.stok === 60, JSON.stringify(pUpd.json).slice(0, 200));
const pUpdBad = await call("PUT", `/supplier/produk/${newPid}`, { id_user: SUP2, harga: 1 });
check("PUT produk bukan milik -> 403/404", pUpdBad.status === 403 || pUpdBad.status === 404, JSON.stringify(pUpdBad.json));
const pDelBad = await call("DELETE", `/supplier/produk/${newPid}`, { id_user: SUP2 });
check("DELETE produk bukan milik ditolak", pDelBad.status === 403 || pDelBad.status === 404);

const katalog = await call("GET", "/konsumen/katalog");
check("GET katalog konsumen", katalog.status === 200 && katalog.json.total >= 6, JSON.stringify(katalog.json).slice(0, 200));
const katalogFilter = await call("GET", "/konsumen/katalog?kategori=Olahan");
check("katalog filter Olahan", katalogFilter.json.data.every((p) => p.kategori === "Olahan"));

const stokAwal = (await call("GET", "/konsumen/katalog")).json.data.find((p) => p.id_produk === 1).stok;
const salahOrder = await call("POST", "/konsumen/pesanan", { id_user: SUP, items: [{ id_produk: 1, jumlah_produk: 1 }], metode_pembayaran: "QRIS" });
check("pesanan oleh supplier ditolak", salahOrder.status === 403, JSON.stringify(salahOrder.json));
const kosong = await call("POST", "/konsumen/pesanan", { id_user: KON, items: [], metode_pembayaran: "QRIS" });
check("keranjang kosong ditolak", kosong.status === 400);
const kebanyakan = await call("POST", "/konsumen/pesanan", { id_user: KON, items: [{ id_produk: 1, jumlah_produk: 999999 }], metode_pembayaran: "QRIS" });
check("stok tidak cukup ditolak", kebanyakan.status === 400 && /tidak mencukupi/.test(kebanyakan.json.message), JSON.stringify(kebanyakan.json));

const order = await call("POST", "/konsumen/pesanan", {
  id_user: KON,
  items: [{ id_produk: 1, jumlah_produk: 2 }, { id_produk: 6, jumlah_produk: 3 }],
  metode_pembayaran: "Virtual Account",
});
check("buat pesanan multi-penjual (2 transaksi)", order.status === 201 && order.json.data.length === 2, JSON.stringify(order.json).slice(0, 300));
const orderSup = order.json.data.find((t) => t.id_penjual === SUP);
const orderUmkm = order.json.data.find((t) => t.id_penjual === SUP2);
check("total pesanan sesuai harga DB", orderSup && orderSup.total_harga === 2 * 1450000 && orderUmkm.total_harga === 3 * (orderUmkm.items[0].harga_satuan), JSON.stringify(orderSup?.total_harga));
check("pembayaran Menunggu & kode 16 digit", orderSup.pembayaran.status_pembayaran === "Menunggu" && /^8808\d{10}$/.test(orderSup.pembayaran.kode_pembayaran), JSON.stringify(orderSup.pembayaran));
const stokSetelah = (await call("GET", "/konsumen/katalog")).json.data.find((p) => p.id_produk === 1).stok;
check("stok berkurang setelah pesan", stokSetelah === stokAwal - 2, `${stokAwal} -> ${stokSetelah}`);

const diprosesDulu = await call("PUT", `/supplier/pesanan/${orderSup.id_transaksi}/status`, { id_user: SUP, status: "Diproses" });
check("Diproses sebelum bayar ditolak", diprosesDulu.status === 400, JSON.stringify(diprosesDulu.json));
const bayarOrangLain = await call("PUT", `/konsumen/pesanan/${orderSup.id_transaksi}/bayar`, { id_user: SUP });
check("bayar oleh bukan pembeli ditolak", bayarOrangLain.status === 403);
const bayar = await call("PUT", `/konsumen/pesanan/${orderSup.id_transaksi}/bayar`, { id_user: KON });
check("konfirmasi bayar", bayar.status === 200 && bayar.json.data.pembayaran.status_pembayaran === "Berhasil", JSON.stringify(bayar.json).slice(0, 300));
const bayarLagi = await call("PUT", `/konsumen/pesanan/${orderSup.id_transaksi}/bayar`, { id_user: KON });
check("konfirmasi bayar dua kali tetap aman", bayarLagi.status === 200);
const statusKonsumen = await call("PUT", `/supplier/pesanan/${orderSup.id_transaksi}/status`, { id_user: KON, status: "Diproses" });
check("pembeli tidak boleh Diproses", statusKonsumen.status === 403);
const proses = await call("PUT", `/supplier/pesanan/${orderSup.id_transaksi}/status`, { id_user: SUP, status: "Diproses" });
check("penjual Diproses", proses.status === 200 && proses.json.data.status === "Diproses", JSON.stringify(proses.json).slice(0, 200));
const lompat = await call("PUT", `/supplier/pesanan/${orderSup.id_transaksi}/status`, { id_user: SUP, status: "Batal" });
check("Batal dari Diproses oleh penjual diizinkan", lompat.status === 200);

const orderB = await call("POST", "/konsumen/pesanan", { id_user: KON, items: [{ id_produk: 2, jumlah_produk: 4 }], metode_pembayaran: "QRIS" });
const trxB = orderB.json.data[0];
const stokB = (await call("GET", "/konsumen/katalog")).json.data.find((p) => p.id_produk === 2).stok;
const batalKon = await call("PUT", `/konsumen/pesanan/${trxB.id_transaksi}/status`, { id_user: KON, status: "Batal" });
check("pembeli batalkan pesanan Pending", batalKon.status === 200 && batalKon.json.data.status === "Batal", JSON.stringify(batalKon.json).slice(0, 200));
const stokBatal = (await call("GET", "/konsumen/katalog")).json.data.find((p) => p.id_produk === 2).stok;
check("stok kembali setelah batal", stokBatal === stokB + 4, `${stokB} -> ${stokBatal}`);

const orderC = await call("POST", "/konsumen/pesanan", { id_user: KON, items: [{ id_produk: 1, jumlah_produk: 1 }], metode_pembayaran: "QRIS" });
const trxC = orderC.json.data[0];
await call("PUT", `/konsumen/pesanan/${trxC.id_transaksi}/bayar`, { id_user: KON });
await call("PUT", `/supplier/pesanan/${trxC.id_transaksi}/status`, { id_user: SUP, status: "Diproses" });
const selesai = await call("PUT", `/konsumen/pesanan/${trxC.id_transaksi}/status`, { id_user: KON, status: "Selesai" });
check("pembeli konfirmasi Selesai", selesai.status === 200 && selesai.json.data.status === "Selesai", JSON.stringify(selesai.json).slice(0, 200));
const selesaiUlang = await call("PUT", `/supplier/pesanan/${trxC.id_transaksi}/status`, { id_user: SUP, status: "Batal" });
check("Selesai tidak bisa dibatalkan", selesaiUlang.status === 400);

const kasSup = await call("GET", `/supplier/keuangan/${SUP}`);
check("keuangan supplier berisi pemasukan otomatis", kasSup.json.data.data.some((k) => k.id_transaksi === trxC.id_transaksi && k.jenis_transaksi === "Pemasukan"));
const kasKon = await call("GET", `/konsumen/keuangan/${KON}`);
check("keuangan konsumen berisi pengeluaran otomatis", kasKon.json.data.data.some((k) => k.id_transaksi === trxC.id_transaksi && k.jenis_transaksi === "Pengeluaran"));
const selesaiDua = await call("PUT", `/supplier/pesanan/${trxC.id_transaksi}/status`, { id_user: SUP, status: "Diproses" });
check("status sudah Selesai tidak berubah ke Diproses", selesaiDua.status === 400);
const kasKon2 = await call("GET", `/konsumen/keuangan/${KON}`);
check("pengeluaran tidak tergandakan", kasKon2.json.data.data.filter((k) => k.id_transaksi === trxC.id_transaksi).length === 1);

const kasNew = await call("POST", "/supplier/keuangan", { id_user: SUP, jenis_transaksi: "Pengeluaran", jumlah_uang: 150000, keterangan: "Beli pupuk uji" });
check("POST keuangan supplier", kasNew.status === 201 && kasNew.json.data.jumlah_uang === 150000, JSON.stringify(kasNew.json));
const kasEdit = await call("PUT", `/supplier/keuangan/${kasNew.json.data.id_keuangan}`, { id_user: SUP, jumlah_uang: 175000 });
check("PUT keuangan supplier", kasEdit.status === 200 && kasEdit.json.data.jumlah_uang === 175000);
const kasDel = await call("DELETE", `/supplier/keuangan/${kasNew.json.data.id_keuangan}`, { id_user: SUP });
check("DELETE keuangan supplier", kasDel.status === 200);
const kasBad = await call("POST", "/konsumen/keuangan", { id_user: KON, jenis_transaksi: "Salah", jumlah_uang: 1000 });
check("keuangan jenis tidak valid -> 400", kasBad.status === 400);

const pDel = await call("DELETE", `/supplier/produk/${newPid}`, { id_user: SUP });
check("DELETE supplier produk", pDel.status === 200);

const kProf = await call("PUT", `/konsumen/profil/${KON}`, { nama_lengkap: "Budi Santoso", kategori_konsumen: "Grosir", alamat_pengiriman_utama: "Cakung, Jakarta Timur", titik_koordinat: "-6.1852, 106.9463" });
check("PUT konsumen profil", kProf.status === 200 && kProf.json.data.kategori_konsumen === "Grosir", JSON.stringify(kProf.json).slice(0, 200));
const kDash = await call("GET", `/konsumen/dashboard/${KON}`);
check("GET konsumen dashboard", kDash.status === 200 && kDash.json.data.pembelian.totalPesanan >= 3, JSON.stringify(kDash.json).slice(0, 200));
const kList = await call("GET", `/konsumen/pesanan/${KON}`);
check("GET konsumen pesanan list", kList.status === 200 && kList.json.data.length >= 3);
const kDetail = await call("GET", `/konsumen/pesanan/detail/${orderSup.id_transaksi}?id_user=${KON}`);
check("GET konsumen detail pesanan", kDetail.status === 200 && kDetail.json.data.items.length === 1);
const kDetailOrang = await call("GET", `/konsumen/pesanan/detail/${orderSup.id_transaksi}?id_user=${SUP2}`);
check("detail pesanan bukan akses ditolak", kDetailOrang.status === 403 || kDetailOrang.status === 404);
const sPes = await call("GET", `/supplier/pesanan/${SUP}`);
check("GET supplier pesanan masuk", sPes.status === 200 && sPes.json.data.every((t) => t.id_penjual === SUP));

const reg = await call("POST", "/auth/register", { nama_lengkap: "Toko Uji Ritel", email: RITEL_EMAIL, no_telp: "0812345678", peran: "Konsumen", alamat: "Jl. Uji No. 1, Indramayu", password: "rahasia123" });
check("register konsumen", reg.status === 201 && reg.json.data.status_verifikasi === "Terverifikasi", JSON.stringify(reg.json).slice(0, 200));
const regDup = await call("POST", "/auth/register", { nama_lengkap: "Toko Uji Ritel", email: RITEL_EMAIL, no_telp: "0812345678", peran: "Konsumen", alamat: "Jl. Uji No. 1", password: "rahasia123" });
check("register email ganda -> 409", regDup.status === 409);
const regSup = await call("POST", "/auth/register", { nama_lengkap: "Petani Uji", email: `petani.${Date.now()}@samangga.id`, no_telp: "0812999888", peran: "Supplier", alamat: "Desa Uji, Indramayu", password: "rahasia123" });
check("register supplier -> Menunggu", regSup.status === 201 && regSup.json.data.status_verifikasi === "Menunggu");
const ritelLogin = await call("POST", "/auth/login", { email: RITEL_EMAIL, password: "rahasia123" });
check("login akun baru", ritelLogin.status === 200);
const regProfil = await call("GET", `/konsumen/profil/${reg.json.data.id_user}`);
check("akun baru punya profil konsumen", regProfil.status === 200 && regProfil.json.data.kategori_konsumen === "Ritel");
const regSupProfil = await call("GET", `/supplier/profil/${regSup.json.data.id_user}`);
check("akun supplier baru punya profil supplier", regSupProfil.status === 200 && regSupProfil.json.data.tipe_supplier === "Petani");
const users = await call("GET", "/auth/users");
check("daftar user tanpa password", users.status === 200 && users.json.data.every((u) => u.password === undefined));

console.log(`\nHASIL: ${pass} lulus, ${fail} gagal`);
