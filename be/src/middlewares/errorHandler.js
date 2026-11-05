export function errorHandler(err, _req, res, _next) {
    console.error("[SAMANGGA BE Error]:", err.stack || err.message);
    res.status(500).json({
        success: false,
        message: err.message || "Terjadi kesalahan internal pada server backend SAMANGGA.",
    });
}
