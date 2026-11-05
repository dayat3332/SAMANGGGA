import { SEED_LIMBAH } from "../seeds/waste.seed.js";
let wasteList = [...SEED_LIMBAH];
export const limbahController = {
    getAll: (req, res) => {
        const { jenis, status } = req.query;
        let result = [...wasteList];
        if (jenis && typeof jenis === "string" && jenis !== "Semua") {
            result = result.filter((w) => w.jenis_limbah.toLowerCase() === jenis.toLowerCase());
        }
        if (status && typeof status === "string") {
            result = result.filter((w) => w.status_jemput.toLowerCase() === status.toLowerCase());
        }
        res.status(200).json({
            success: true,
            total: result.length,
            data: result,
        });
    },
    create: (req, res) => {
        const { id_umkm, jenis_limbah, berat_kg, estimasi_harga, jenis_kompensasi, lokasi_penjemputan, foto_limbah } = req.body;
        if (!jenis_limbah || !berat_kg || !lokasi_penjemputan) {
            res.status(400).json({
                success: false,
                message: "Jenis limbah, berat (kg), dan lokasi penjemputan wajib diisi.",
            });
            return;
        }
        const newWaste = {
            id_limbah: Date.now(),
            id_umkm: Number(id_umkm || 202),
            id_mitra: null,
            jenis_limbah,
            berat_kg: Number(berat_kg),
            estimasi_harga: Number(estimasi_harga || 0),
            jenis_kompensasi: jenis_kompensasi || "Jual Beli",
            harga_kesepakatan: null,
            lokasi_penjemputan,
            titik_koordinat: null,
            foto_limbah: foto_limbah || "/images/limbah/limbah_kulit_mangga.jpg",
            status_jemput: "Tersedia",
            tgl_jemput: null,
            status_verifikasi: "Terverifikasi",
            tgl_input: new Date().toISOString(),
        };
        wasteList.unshift(newWaste);
        res.status(201).json({
            success: true,
            message: "Setor limbah sirkular berhasil dicatat ke sistem.",
            data: newWaste,
        });
    },
    claimPickup: (req, res) => {
        const id = parseInt(String(req.params.id), 10);
        const { id_mitra, tgl_jemput } = req.body;
        const item = wasteList.find((w) => w.id_limbah === id);
        if (!item) {
            res.status(404).json({
                success: false,
                message: "Data limbah tidak ditemukan.",
            });
            return;
        }
        item.id_mitra = id_mitra || 303;
        item.status_jemput = "Proses";
        item.tgl_jemput = tgl_jemput || new Date().toISOString();
        res.status(200).json({
            success: true,
            message: "Pengajuan jemput limbah berhasil diproses.",
            data: item,
        });
    },
};
