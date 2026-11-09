import type {
  Transaksi,
  DetailTransaksi,
  Pembayaran,
  RiwayatPengiriman,
  PencatatanKeuangan,
  LogSistem,
} from "../../src/types/samangga.tsx";

export const SEED_TRANSAKSI: Transaksi[] = [
  {
    id_transaksi: 1001,
    id_pembeli: 404,
    id_penjual: 101,
    tgl_transaksi: "2026-11-01 08:30:00",
    total_harga: 14500000,
    status: "Selesai",
  },
  {
    id_transaksi: 1002,
    id_pembeli: 202,
    id_penjual: 101,
    tgl_transaksi: "2026-11-02 10:15:00",
    total_harga: 3625000,
    status: "Diproses",
  },
  {
    id_transaksi: 1003,
    id_pembeli: 404,
    id_penjual: 202,
    tgl_transaksi: "2026-11-03 14:00:00",
    total_harga: 5400000,
    status: "Pending",
  },
];

export const SEED_DETAIL_TRANSAKSI: DetailTransaksi[] = [
  {
    id_detail_transaksi: 1,
    id_transaksi: 1001,
    id_produk: 1,
    jumlah_produk: 10,
    harga_satuan: 1450000,
    subtotal_harga: 14500000,
  },
  {
    id_detail_transaksi: 2,
    id_transaksi: 1002,
    id_produk: 1,
    jumlah_produk: 25,
    harga_satuan: 145000,
    subtotal_harga: 3625000,
  },
  {
    id_detail_transaksi: 3,
    id_transaksi: 1003,
    id_produk: 6,
    jumlah_produk: 300,
    harga_satuan: 18000,
    subtotal_harga: 5400000,
  },
];

export const SEED_PEMBAYARAN: Pembayaran[] = [
  {
    id_pembayaran: 1,
    id_transaksi: 1001,
    metode_pembayaran: "Virtual Account",
    jumlah_bayar: 14500000,
    status_pembayaran: "Berhasil",
    id_referensi_gateway: "MID-SAMANGGA-1001-VA",
    kode_pembayaran: "8808123456789012",
    bukti_transfer: null,
    batas_waktu_bayar: "2026-11-02 08:30:00",
    tgl_bayar: "2026-11-01 08:45:00",
  },
  {
    id_pembayaran: 2,
    id_transaksi: 1002,
    metode_pembayaran: "QRIS",
    jumlah_bayar: 3625000,
    status_pembayaran: "Berhasil",
    id_referensi_gateway: "QRIS-SMG-1002-OK",
    kode_pembayaran: "00020101021226...ID.CO.QRIS",
    bukti_transfer: null,
    batas_waktu_bayar: "2026-11-02 11:15:00",
    tgl_bayar: "2026-11-02 10:20:00",
  },
  {
    id_pembayaran: 3,
    id_transaksi: 1003,
    metode_pembayaran: "Transfer Manual",
    jumlah_bayar: 5400000,
    status_pembayaran: "Menunggu",
    id_referensi_gateway: null,
    kode_pembayaran: "MANDIRI-1310012345678",
    bukti_transfer: null,
    batas_waktu_bayar: "2026-11-04 14:00:00",
    tgl_bayar: null,
  },
];

export const SEED_RIWAYAT_PENGIRIMAN: RiwayatPengiriman[] = [
  {
    id_pengiriman: 1,
    id_transaksi: 1001,
    id_mitra: 1,
    tgl_pengiriman: "2026-11-01 10:00:00",
    no_resi_lacak: "SMG-EXP-20261101-001",
    status_pengiriman: "Tiba di Lokasi",
    tgl_diterima: "2026-11-01 18:30:00",
  },
  {
    id_pengiriman: 2,
    id_transaksi: 1002,
    id_mitra: 1,
    tgl_pengiriman: "2026-11-02 13:00:00",
    no_resi_lacak: "SMG-EXP-20261102-002",
    status_pengiriman: "Dalam Perjalanan",
    tgl_diterima: null,
  },
];

export const SEED_KEUANGAN: PencatatanKeuangan[] = [
  {
    id_keuangan: 1,
    id_user: 101,
    id_transaksi: 1001,
    id_limbah: null,
    tgl_pencatatan: "2026-11-01 08:45:00",
    jenis_transaksi: "Pemasukan",
    jumlah_uang: 14500000,
    keterangan: "Penjualan 10 kwintal Gedong Gincu Super ke PT Segar Buah",
  },
  {
    id_keuangan: 2,
    id_user: 202,
    id_transaksi: 1002,
    id_limbah: null,
    tgl_pencatatan: "2026-11-02 10:20:00",
    jenis_transaksi: "Pengeluaran",
    jumlah_uang: 3625000,
    keterangan: "Pembelian bahan baku mangga segar dari KT Sumber Rejeki",
  },
  {
    id_keuangan: 3,
    id_user: 202,
    id_transaksi: null,
    id_limbah: 1,
    tgl_pencatatan: "2026-11-01 14:00:00",
    jenis_transaksi: "Pemasukan",
    jumlah_uang: 525000,
    keterangan: "Penerimaan kompensasi setor 350 kg biji mangga ke CV Bio Tani",
  },
];

export const SEED_LOG_SISTEM: LogSistem[] = [
  {
    id_log: 1,
    id_user: 505,
    level: "Info",
    aksi: "SISTEM_BOOT",
    endpoint_api: "/api/health",
    kode_status: 200,
    pesan: "Backend SAMANGGA Service Online",
    detail_error: null,
    waktu: "2026-11-06 00:00:00",
  },
];
