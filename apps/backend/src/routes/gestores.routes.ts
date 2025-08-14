import express from "express";
import { getAddress, keccak256, toUtf8Bytes } from "ethers";
import { autenticarWallet } from "../middleware/auth";
import { getNftContract } from "../blockchain/contracts"; // ✅ usa factory com signer centralizado

const router = express.Router();

/** Converte o parâmetro imovelId para uint256.
 *  Aceita:
 *   - "0x..." (hex)  → BigInt(hex)
 *   - "12345" (num)  → BigInt(num)
 *   - qualquer outro (ex.: ObjectId) → keccak256(string) como uint256
 */
function toUint256FromParam(id: string): bigint {
    const s = String(id).trim();
    if (/^0x[0-9a-fA-F]+$/.test(s)) return BigInt(s);
    if (/^\d+$/.test(s)) return BigInt(s);
    return BigInt(keccak256(toUtf8Bytes(s))); // hash determinístico em uint256
}

// Aprovar / revogar operador para um imovelId
router.post("/:imovelId/operadores", autenticarWallet, async (req, res) => {
    try {
        const { imovelId } = req.params;
        const { agenteWallet, approved } = req.body;

        if (!agenteWallet) {
            return res.status(400).json({ erro: "agenteWallet obrigatório" });
        }

        // normaliza e valida address
        let agente: string;
        try {
            agente = getAddress(agenteWallet);
        } catch {
            return res.status(400).json({ erro: "agenteWallet inválido" });
        }

        const id256 = toUint256FromParam(imovelId);
        const contract = getNftContract();

        const tx = await contract.setPropertyOperator(id256, agente, !!approved);
        const receipt = await tx.wait();

        return res.json({ sucesso: true, tx: tx.hash, blockNumber: receipt.blockNumber });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({ erro: e?.reason || e?.message || "Falha ao configurar operador" });
    }
});

export default router;
