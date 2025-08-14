// backend/src/routes/index.ts
import express from "express";
import perfilRoutes from "./perfil.routes";
import imovelRoutes from "./imoveis.routes";
import nftRoutes from "./nft.routes";
import cadastroCompletoRoutes from "./cadastroCompleto.routes";

const router = express.Router();

router.use("/api/perfis", perfilRoutes);
router.use("/api/imoveis", imovelRoutes);
router.use("/api/nfts", nftRoutes);
router.use("/api/cadastro-completo", cadastroCompletoRoutes);

export default router;
