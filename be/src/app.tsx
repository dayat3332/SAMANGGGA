import express from "express";
import cors from "cors";
import apiRouter from "./routes/index.tsx";
import { errorHandler } from "./middlewares/errorHandler.tsx";
import { config } from "./config/index.tsx";

const app = express();

app.use(
  cors({
    origin: [config.clientUrl, "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Route Root
app.get("/", (_req, res) => {
  res.json({
    message: "Selamat Datang di REST API SAMANGGA - Rantai Pasok & Pasar Limbah Sirkular Mangga Indramayu (TypeScript / TSX)",
    healthCheck: "/api/health",
  });
});

// API Routes
app.use("/api", apiRouter);

// Error Handling Middleware
app.use(errorHandler);

export default app;
