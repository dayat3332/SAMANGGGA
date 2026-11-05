import { SEED_PENGGUNA } from "../seeds/users.seed.js";
// In-memory user store (siap dihubungkan ke Prisma / Database)
let users = [...SEED_PENGGUNA];
export const authController = {
    login: (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email dan kata sandi wajib diisi.",
            });
            return;
        }
        const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Akun dengan email tersebut belum terdaftar di platform SAMANGGA.",
            });
            return;
        }
        // Simulasi verifikasi password
        res.status(200).json({
            success: true,
            message: "Login berhasil.",
            data: {
                user: {
                    id: user.id_user,
                    nama: user.nama_lengkap,
                    email: user.email,
                    peran: user.peran,
                    statusVerifikasi: user.status_verifikasi,
                },
                token: `mock_jwt_token_${user.id_user}_${Date.now()}`,
            },
        });
    },
    register: (req, res) => {
        const { nama_lengkap, email, no_telp, peran, alamat, password, foto_persyaratan_url, foto_persyaratan_name } = req.body;
        if (!nama_lengkap || !email || !no_telp || !peran || !password) {
            res.status(400).json({
                success: false,
                message: "Semua field pendaftaran wajib diisi lengkap.",
            });
            return;
        }
        const existing = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
        if (existing) {
            res.status(409).json({
                success: false,
                message: "Email sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.",
            });
            return;
        }
        const newUser = {
            id_user: Date.now(),
            nama_lengkap,
            email,
            no_telp,
            peran: peran,
            alamat: alamat || "",
            password: `$2b$10$hash_${Date.now()}`,
            status_verifikasi: peran === "Mitra" ? "Menunggu" : "Terverifikasi",
            tgl_daftar: new Date().toISOString(),
            foto_persyaratan_url,
            foto_persyaratan_name,
        };
        users.push(newUser);
        res.status(201).json({
            success: true,
            message: "Pendaftaran akun berhasil disimpan.",
            data: newUser,
        });
    },
    googleAuth: (req, res) => {
        const { email, name } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: "Email Google wajib disertakan.",
            });
            return;
        }
        let user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
        if (!user) {
            // Buat akun baru jika belum terdaftar
            user = {
                id_user: Date.now(),
                nama_lengkap: name || "Pengguna Google",
                email,
                no_telp: "",
                peran: "Konsumen",
                alamat: "",
                password: "$2b$10$hash_google_oauth",
                status_verifikasi: "Terverifikasi",
                tgl_daftar: new Date().toISOString(),
            };
            users.push(user);
        }
        res.status(200).json({
            success: true,
            message: "Autentikasi Google berhasil.",
            data: {
                user,
                token: `mock_google_jwt_${user.id_user}`,
            },
        });
    },
    getAllUsers: (_req, res) => {
        res.status(200).json({
            success: true,
            total: users.length,
            data: users,
        });
    },
};
