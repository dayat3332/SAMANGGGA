import { SEED_PRODUK } from "../seeds/products.seed.js";
let products = [...SEED_PRODUK];
export const produkController = {
    getAll: (req, res) => {
        const { kategori, search } = req.query;
        let result = [...products];
        if (kategori && typeof kategori === "string" && kategori !== "Semua") {
            result = result.filter((p) => p.kategori.toLowerCase() === kategori.toLowerCase());
        }
        if (search && typeof search === "string") {
            const q = search.toLowerCase();
            result = result.filter((p) => p.nama_produk.toLowerCase().includes(q) ||
                p.deskripsi.toLowerCase().includes(q) ||
                (p.tags && p.tags.some((t) => t.toLowerCase().includes(q))));
        }
        res.status(200).json({
            success: true,
            total: result.length,
            data: result,
        });
    },
    getById: (req, res) => {
        const id = parseInt(String(req.params.id), 10);
        const item = products.find((p) => p.id_produk === id);
        if (!item) {
            res.status(404).json({
                success: false,
                message: "Produk tidak ditemukan.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: item,
        });
    },
    create: (req, res) => {
        const { nama_produk, kategori, harga, stok, satuan, deskripsi, gambar, id_user, tags, lokasi } = req.body;
        if (!nama_produk || !kategori || !harga || !satuan) {
            res.status(400).json({
                success: false,
                message: "Nama produk, kategori, harga, dan satuan wajib diisi.",
            });
            return;
        }
        const newProduct = {
            id_produk: Date.now(),
            id_user: id_user || 101,
            nama_produk,
            kategori,
            harga: Number(harga),
            stok: Number(stok || 0),
            satuan,
            deskripsi: deskripsi || "",
            gambar: gambar || "/images/mangga/mangga_gincu.jpg",
            status_verifikasi: "Terverifikasi",
            tags: tags || [],
            lokasi: lokasi || "Indramayu",
        };
        products.unshift(newProduct);
        res.status(201).json({
            success: true,
            message: "Produk berhasil ditambahkan ke katalog.",
            data: newProduct,
        });
    },
    delete: (req, res) => {
        const id = parseInt(String(req.params.id), 10);
        const index = products.findIndex((p) => p.id_produk === id);
        if (index === -1) {
            res.status(404).json({
                success: false,
                message: "Produk tidak ditemukan.",
            });
            return;
        }
        products.splice(index, 1);
        res.status(200).json({
            success: true,
            message: "Produk berhasil dihapus.",
        });
    },
};
