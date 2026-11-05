import { SEED_TRANSAKSI, SEED_DETAIL_TRANSAKSI, SEED_PEMBAYARAN } from "../seeds/transactions.seed.js";
let transactions = [...SEED_TRANSAKSI];
let transactionDetails = [...SEED_DETAIL_TRANSAKSI];
let payments = [...SEED_PEMBAYARAN];
export const transaksiController = {
    getAll: (_req, res) => {
        res.status(200).json({
            success: true,
            total: transactions.length,
            data: transactions,
        });
    },
    getById: (req, res) => {
        const id = parseInt(String(req.params.id), 10);
        const trx = transactions.find((t) => t.id_transaksi === id);
        if (!trx) {
            res.status(404).json({
                success: false,
                message: "Transaksi tidak ditemukan.",
            });
            return;
        }
        const details = transactionDetails.filter((d) => d.id_transaksi === id);
        const payment = payments.find((p) => p.id_transaksi === id);
        res.status(200).json({
            success: true,
            data: {
                ...trx,
                items: details,
                pembayaran: payment,
            },
        });
    },
    create: (req, res) => {
        const { id_pembeli, id_penjual, items, total_harga, metode_pembayaran } = req.body;
        if (!id_pembeli || !id_penjual || !items || !total_harga) {
            res.status(400).json({
                success: false,
                message: "Data pemesanan tidak lengkap.",
            });
            return;
        }
        const newTrxId = Date.now();
        const newTrx = {
            id_transaksi: newTrxId,
            id_pembeli: Number(id_pembeli),
            id_penjual: Number(id_penjual),
            tgl_transaksi: new Date().toISOString(),
            total_harga: Number(total_harga),
            status: "Pending",
        };
        transactions.unshift(newTrx);
        // Tambah pembayaran
        const newPayment = {
            id_pembayaran: Date.now() + 1,
            id_transaksi: newTrxId,
            metode_pembayaran: metode_pembayaran || "Virtual Account",
            jumlah_bayar: Number(total_harga),
            status_pembayaran: "Menunggu",
            id_referensi_gateway: `MID-SMG-${newTrxId}`,
            kode_pembayaran: `8808${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            bukti_transfer: null,
            batas_waktu_bayar: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            tgl_bayar: null,
        };
        payments.unshift(newPayment);
        res.status(201).json({
            success: true,
            message: "Pesanan berhasil dibuat.",
            data: {
                transaksi: newTrx,
                pembayaran: newPayment,
            },
        });
    },
};
