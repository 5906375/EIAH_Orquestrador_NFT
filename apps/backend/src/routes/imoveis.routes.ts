import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Imovel from "../models/Imovel";
import Perfil from "../models/Perfil";

const router = express.Router();

/* ========= Upload opcional (documento de compra e venda) ========= */
const uploadDir = path.resolve(process.cwd(), "uploads/documentos");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

/**
 * GET /
 * Lista imóveis; se `idPerfil` vier na query, filtra pelo dono.
 * Ex.: GET /api/imoveis?idPerfil=...
 */
router.get("/", async (req, res) => {
    try {
        const { idPerfil } = req.query;
        const filtro: any = {};
        if (idPerfil) filtro.perfil = idPerfil;

        const imoveis = await Imovel.find(filtro).populate("perfil");
        res.json(imoveis);
    } catch (err: any) {
        console.error("❌ GET /api/imoveis erro:", err?.message);
        res.status(500).json({ message: "Erro ao buscar imóveis" });
    }
});

/**
 * POST /
 * Cria um imóvel vinculado a um Perfil.
 * Aceita:
 *  - JSON application/json (sem arquivo)  OU
 *  - multipart/form-data (com arquivo em "documentoCompraVenda")
 *
 * Campos esperados:
 *  - nomePropriedade* (string)
 *  - emailContato* (string)
 *  - registroImovel* (string)
 *  - perfilId* (ObjectId do Perfil)
 *  - wallet (string) → será normalizada pra lowercase
 *  - documentoCompraVenda (file OU string/URL)
 */
router.post(
    "/",
    upload.fields([{ name: "documentoCompraVenda", maxCount: 1 }]),
    async (req, res) => {
        try {
            // campos podem vir no body (json) ou como fields do multipart
            const body: any = req.body;

            const nomePropriedade = body.nomePropriedade;
            const emailContato = body.emailContato;
            const registroImovel = body.registroImovel;
            const perfilId = body.perfilId;
            const wallet = String(body.wallet || "").toLowerCase();

            if (!nomePropriedade) return res.status(400).json({ message: "nomePropriedade é obrigatório" });
            if (!emailContato) return res.status(400).json({ message: "emailContato é obrigatório" });
            if (!registroImovel) return res.status(400).json({ message: "registroImovel é obrigatório" });
            if (!perfilId) return res.status(400).json({ message: "perfilId é obrigatório" });

            // valida o perfil
            const perfil = await Perfil.findById(perfilId);
            if (!perfil) return res.status(400).json({ message: "Perfil inválido" });

            // pega arquivo se veio via multipart
            const files = req.files as { [k: string]: Express.Multer.File[] } | undefined;
            const documentoPath = files?.documentoCompraVenda?.[0]?.path || null;

            // se não veio arquivo, pode aceitar uma URL/texto em body.documentoCompraVenda
            const documentoCompraVenda = documentoPath || body.documentoCompraVenda || undefined;

            const imovel = await Imovel.create({
                nome: nomePropriedade,
                emailContato,
                documentoCompraVenda,
                registroImovel,
                wallet: wallet || perfil.wallet,
                perfil: perfil._id,
            });

            res.status(201).json(imovel);
        } catch (err: any) {
            console.error("❌ POST /api/imoveis erro:", err?.message, err?.stack);
            res.status(500).json({ message: "Erro ao salvar imóvel" });
        }
    }
);
/**
 * PATCH /:imovelId/regras
 * Salva regras da propriedade (usado na EtapaRegras)
 * Aceita `regras` como string "a, b, c" ou array ["a","b","c"]
 * e campos auxiliares `finalidade`, `hospedesPermitidos`.
 */
router.patch("/:imovelId/regras", async (req, res) => {
    try {
        const { imovelId } = req.params;
        const { regras, finalidade, hospedesPermitidos } = req.body;

        const regrasArr = Array.isArray(regras)
            ? regras
            : String(regras || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

        const updated = await Imovel.findByIdAndUpdate(
            imovelId,
            {
                regras: regrasArr,
                finalidade: finalidade ?? undefined,
                hospedesPermitidos: Number(hospedesPermitidos ?? 0),
            },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Imóvel não encontrado" });
        res.json(updated);
    } catch (err: any) {
        console.error("❌ PATCH /api/imoveis/:imovelId/regras erro:", err?.message);
        res.status(500).json({ message: "Erro ao salvar regras" });
    }
});

export default router;

