// apps/backend/src/routes/cadastroCompleto.routes.ts
import express from "express";
import { keccak256, toUtf8Bytes } from "ethers";
import Perfil from "../models/Perfil";
import Imovel from "../models/Imovel";
import { autenticarWallet } from "../middleware/auth";
import { getNftContract } from "@/blockchain/contracts"; // factory centralizada
import { signer, provider } from "@/blockchain/signer";   // opcional: health/debug

// Helpers (implemente de acordo com sua infra)
async function pinJSONToIPFS(metadata: any): Promise<string> {
    // TODO: substituir por integração real (Pinata/Web3.Storage/S3)
    return `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString("base64")}`;
}

const router = express.Router();

/** Health opcional (útil pra debug) */
router.get("/health", async (_req, res) => {
    try {
        const [addr, net] = await Promise.all([signer.getAddress(), provider.getNetwork()]);
        res.json({ ok: true, signer: addr, chainId: Number(net.chainId) });
    } catch (e: any) {
        res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
});

router.post("/", autenticarWallet, async (req, res) => {
    try {
        const { perfil, imovel } = req.body;

        // 1) Define wallet do proprietário
        const ownerWallet: string = perfil?.wallet || req.user?.wallet;
        if (!ownerWallet) return res.status(400).json({ erro: "wallet do proprietario ausente" });

        // 2) Cria Perfil
        const novoPerfil = new Perfil({ ...perfil, wallet: ownerWallet });
        await novoPerfil.save();

        // 3) Cria Imóvel vinculado ao Perfil
        const novoImovel = new Imovel({ ...imovel, idPerfil: novoPerfil._id });
        await novoImovel.save();

        // 4) Gera id on-chain determinístico a partir do ObjectId
        const imovelIdString = novoImovel._id.toString();
        const imovelIdHex = keccak256(toUtf8Bytes(imovelIdString)); // 0x...
        const imovelIdOnchain = BigInt(imovelIdHex);                // uint256

        // 5) Define owner on-chain (ADMIN setando owner)
        const contract = getNftContract();
        const txOwner = await contract.setPropertyOwner(imovelIdOnchain, ownerWallet);
        await txOwner.wait();

        // 6) Regras off-chain -> hash + tokenURI base
        const regras = imovel?.regras ?? {};
        const regrasHash = keccak256(toUtf8Bytes(JSON.stringify(regras)));

        const baseMetadata = {
            name: `Reserva - Imóvel ${novoImovel._id}`,
            description: `NFT de reserva (diárias) para o imóvel ${novoImovel._id}`,
            image: imovel?.image || "",
            attributes: [
                { trait_type: "imovelId", value: novoImovel._id.toString() },
                { trait_type: "tipo", value: "diarias" },
                { trait_type: "regrasHash", value: regrasHash },
            ],
        };

        const tokenURI = await pinJSONToIPFS(baseMetadata);

        await Imovel.updateOne(
            { _id: novoImovel._id },
            { regrasHash, tokenURI, ownerWallet }
        );

        res.status(201).json({
            sucesso: true,
            mensagem: "Cadastro completo realizado (owner definido on-chain)",
            idPerfil: novoPerfil._id,
            idPropriedade: novoImovel._id,
            onchain: { imovelId: imovelIdOnchain.toString(), setPropertyOwnerTx: txOwner.hash },
            tokenURI,
        });
    } catch (err: any) {
        console.error("Erro ao cadastrar:", err);
        res.status(500).json({ erro: err?.reason || err?.message || "Erro no cadastro completo" });
    }
});

export default router;
