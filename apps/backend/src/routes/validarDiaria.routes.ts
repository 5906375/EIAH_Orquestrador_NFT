import express from "express";
import { ethers } from "ethers";
import abiJson from "../../contracts/NFTDiarias.json";

const router = express.Router();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const contractRO = new ethers.Contract(process.env.CONTRACT_ADDRESS!, abiJson.abi, provider);

// GET /isAvailable/:imovelId?start=...&end=...
router.get("/isAvailable/:imovelId", async (req, res) => {
    try {
        const { imovelId } = req.params;
        const start = Number(req.query.start);
        const end = Number(req.query.end);
        if (!start || !end) return res.status(400).json({ erro: "start/end obrigatorios (epoch segundos)" });

        const ok: boolean = await contractRO.isAvailable(BigInt(imovelId), BigInt(start), BigInt(end));
        res.json({ imovelId, start, end, available: ok });
    } catch (e) {
        console.error(e);
        res.status(500).json({ erro: "Falha ao verificar disponibilidade" });
    }
});

export default router;
