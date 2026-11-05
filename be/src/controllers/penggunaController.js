import { SEED_PENGGUNA } from "../seeds/users.seed.js";
const users = [...SEED_PENGGUNA];
export const penggunaController = {
    getAll: (req, res) => {
        const { peran, status } = req.query;
        let result = [...users];
        if (peran && typeof peran === "string") {
            result = result.filter((u) => u.peran.toLowerCase() === peran.toLowerCase());
        }
        if (status && typeof status === "string") {
            result = result.filter((u) => u.status_verifikasi.toLowerCase() === status.toLowerCase());
        }
        res.status(200).json({
            success: true,
            total: result.length,
            data: result,
        });
    },
    getById: (req, res) => {
        const id = parseInt(String(req.params.id), 10);
        const user = users.find((u) => u.id_user === id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "Pengguna tidak ditemukan.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    },
};
