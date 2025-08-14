// backend/src/routes/nft.routes.ts
import express from "express";
import multer from "multer";
import { emitirNFT } from "../controllers/nftEmitirController";
import { autenticarWallet } from "../middleware/auth";

const router = express.Router();

// multer vai salvar o arquivo enviado em uma pasta local chamada /uploads
const upload = multer({ dest: "uploads/" });

/**
 * POST /api/nfts/emitir
 * Recebe dados do formulário + arquivo de mídia (imagem/vídeo)
 * Chama o controller que: gera tokenURI no IPFS, executa mintNFT e salva no MongoDB
 */
router.post("/api/nfts/emitir", autenticarWallet, upload.single("arquivoMidia"), emitirNFT);

export default router;
