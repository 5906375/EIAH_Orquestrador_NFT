import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import "dotenv/config";
import mongoose from "mongoose";

import eiahOrquestradorRoutes from "./routes/eiah.orquestrador";
import cadastroCompletoRoutes from "./routes/cadastroCompleto.routes";
import validarDiariaRoutes from "./routes/validarDiaria.routes";
import perfilRoutes from "./routes/perfil.routes";
import imoveisRoutes from "./routes/imoveis.routes";
import nftRoutes from "./routes/nft.routes";
import gestoresRoutes from "./routes/gestores.routes";
import campanha from "@/routes/campanha.routes";

const app = express();
const PORT = process.env.PORT || 4000;

/* ---------- Middlewares ---------- */
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
app.options(
    "*",
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Servir uploads (debug/preview)
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

/* ---------- Rotas ---------- */
app.use("/api", eiahOrquestradorRoutes);
app.use("/api/cadastro-completo", cadastroCompletoRoutes);
app.use("/api/validar-diaria", validarDiariaRoutes);
app.use("/api/imoveis", imoveisRoutes);
app.use("/api/nfts", nftRoutes);
app.use("/api/perfis", perfilRoutes);
app.use("/gestores", gestoresRoutes);
app.use("/api/campanha", campanha);

/* ---------- Healthcheck ---------- */
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

/* ---------- Conexão Mongo + Start ---------- */
async function start() {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("❌ MONGO_URI não definido no .env");
        }

        // Config extra para evitar buffering
        mongoose.set("strictQuery", true);
        mongoose.set("bufferCommands", false);

        mongoose.connection.on("connected", () => {
            console.log("✅ MongoDB conectado com sucesso");
        });
        mongoose.connection.on("error", (err) => {
            console.error("❌ Erro na conexão MongoDB:", err.message);
        });

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 8000,
        });

        app.listen(PORT, () => {
            console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("❌ Falha ao conectar no MongoDB:", err);
        process.exit(1);
    }
}

start();
