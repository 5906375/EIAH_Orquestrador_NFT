// backend/src/routes/regras.routes.ts
import express from "express";
const router = express.Router();

router.post("/", async (req, res) => {
    const dados = req.body;
    console.log("[Regras recebidas]", dados);
    // Salvar as regras no banco ou associar ao NFT, se desejado
    return res.status(201).json({ mensagem: "Regras salvas com sucesso!" });
});

export default router;

