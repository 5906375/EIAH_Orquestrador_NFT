import express from "express";
import { ethers } from "ethers";
import { autenticarWallet } from "../middleware/auth";
import Imovel from "../models/Imovel";
import NFT from "../models/NFT"; // seu modelo passa a representar reservas
import abiJson from "../../contracts/NFTDiarias.json";

// ATENÇÃO: este exemplo assume carteira "custodial" para proprietarios/operadores.
// Se o usuário assina pelo front, troque por endpoint que apenas monta calldata.
async function getSignerForAddress(addr: string, provider: ethers.Provider): Promise<ethers.Wallet> {
    // TODO: implementar busca de chave privada segura para 'addr'
    // Exemplo placeholder (NÃO usar em prod):
    throw new Error("Implementar cofre de chaves para custodial");
}

const router = express.Router();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const adminSigner = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider); // usado só se necessário
const contractAdmin = new ethers.Contract(process.env.CONTRACT_ADDRESS!, abiJson.abi, adminSigner);

// POST / (mintar reserva)
// body: { imovelId, guestWallet, startDate, endDate }
router.post("/", autenticarWallet, async (req, res) => {
    try {
        const { imovelId, guestWallet, startDate, endDate } = req.body;
        if (!imovelId || !guestWallet || !startDate || !endDate) {
            return res.status(400).json({ erro: "Campos obrigatorios: imovelId, guestWallet, startDate, endDate" });
        }

        // pega tokenURI base armazenado no Imovel (com regrasHash)
        const imovel = await Imovel.findById(imovelId);
        if (!imovel) return res.status(404).json({ erro: "Imovel nao encontrado" });
        const tokenURI = imovel.tokenURI;
        if (!tokenURI) return res.status(400).json({ erro: "Imovel sem tokenURI base" });

        // checa disponibilidade on-chain (view)
        const available: boolean = await contractAdmin.isAvailable(BigInt(imovelId), BigInt(startDate), BigInt(endDate));
        if (!available) return res.status(409).json({ erro: "Periodo indisponivel" });

        // exige que QUEM CHAMA seja owner ou operator do imovelId
        const callerWallet: string = req.user.wallet;
        // opcional: verificação on-chain de autorização
        const propertyOwner: string = await contractAdmin.propertyOwner(BigInt(imovelId));
        const isOperator: boolean = await contractAdmin.propertyOperator(BigInt(imovelId), callerWallet);
        if (callerWallet.toLowerCase() !== propertyOwner.toLowerCase() && !isOperator) {
            return res.status(403).json({ erro: "Somente owner/operador pode criar reserva" });
        }

        // envia tx usando a carteira do chamador (custodial)
        const callerSigner = await getSignerForAddress(callerWallet, provider);
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS!, abiJson.abi, callerSigner);

        const tx = await contract.mintReservation(
            BigInt(imovelId),
            guestWallet,
            BigInt(startDate),
            BigInt(endDate),
            tokenURI
        );
        const receipt = await tx.wait();

        // recupera o tokenId do evento ReservationMinted (ou incrementa via interface)
        const evt = receipt.logs
            .map(l => contract.interface.parseLog(l).args)
            .find(args => args && args.imovelId?.toString() === BigInt(imovelId).toString());

        const tokenId = evt?.tokenId?.toString() ?? null;

        // salva no banco a “reserva” (NFT)
        const novaReserva = new NFT({
            tokenId,
            idPropriedade: imovelId,
            guestWallet,
            startDate,
            endDate,
            status: "PENDING", // muda para ACTIVE após setReservation(true)
            tokenURI,
            txHash: tx.hash
        });
        await novaReserva.save();

        res.json({ sucesso: true, tokenId, tx: tx.hash });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ erro: e?.message || "Falha ao emitir reserva" });
    }
});

// POST /confirm/:tokenId  -> setReservation(tokenId, true)
router.post("/confirm/:tokenId", autenticarWallet, async (req, res) => {
    try {
        const { tokenId } = req.params;
        const callerWallet: string = req.user.wallet;

        // opcional: verificar owner/operator do imovel desta reserva via banco
        const reserva = await NFT.findOne({ tokenId });
        if (!reserva) return res.status(404).json({ erro: "Reserva nao encontrada" });

        const propertyOwner: string = await contractAdmin.propertyOwner(BigInt(reserva.idPropriedade));
        const isOperator: boolean = await contractAdmin.propertyOperator(BigInt(reserva.idPropriedade), callerWallet);
        if (callerWallet.toLowerCase() !== propertyOwner.toLowerCase() && !isOperator) {
            return res.status(403).json({ erro: "Somente owner/operador pode confirmar" });
        }

        const signer = await getSignerForAddress(callerWallet, provider);
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS!, abiJson.abi, signer);

        const tx = await contract.setReservation(BigInt(tokenId), true);
        await tx.wait();

        await NFT.updateOne({ tokenId }, { status: "ACTIVE", paymentTx: tx.hash });
        res.json({ sucesso: true, tx: tx.hash });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ erro: e?.message || "Falha ao confirmar pagamento" });
    }
});

// POST /cancel/:tokenId -> cancelReservation(tokenId)
router.post("/cancel/:tokenId", autenticarWallet, async (req, res) => {
    try {
        const { tokenId } = req.params;
        const reserva = await NFT.findOne({ tokenId });
        if (!reserva) return res.status(404).json({ erro: "Reserva nao encontrada" });

        const callerWallet: string = req.user.wallet;
        const propertyOwner: string = await contractAdmin.propertyOwner(BigInt(reserva.idPropriedade));
        const isOperator: boolean = await contractAdmin.propertyOperator(BigInt(reserva.idPropriedade), callerWallet);
        if (callerWallet.toLowerCase() !== propertyOwner.toLowerCase() && !isOperator) {
            return res.status(403).json({ erro: "Somente owner/operador pode cancelar" });
        }

        const signer = await getSignerForAddress(callerWallet, provider);
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS!, abiJson.abi, signer);

        const tx = await contract.cancelReservation(BigInt(tokenId));
        await tx.wait();

        await NFT.updateOne({ tokenId }, { status: "CANCELED", cancelTx: tx.hash });
        res.json({ sucesso: true, tx: tx.hash });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ erro: e?.message || "Falha ao cancelar" });
    }
});

// POST /checkout/:tokenId -> completeAndBurn(tokenId)
router.post("/checkout/:tokenId", autenticarWallet, async (req, res) => {
    try {
        const { tokenId } = req.params;
        const reserva = await NFT.findOne({ tokenId });
        if (!reserva) return res.status(404).json({ erro: "Reserva nao encontrada" });

        const callerWallet: string = req.user.wallet;
        const propertyOwner: string = await contractAdmin.propertyOwner(BigInt(reserva.idPropriedade));
        const isOperator: boolean = await contractAdmin.propertyOperator(BigInt(reserva.idPropriedade), callerWallet);
        if (callerWallet.toLowerCase() !== propertyOwner.toLowerCase() && !isOperator) {
            return res.status(403).json({ erro: "Somente owner/operador pode concluir" });
        }

        const signer = await getSignerForAddress(callerWallet, provider);
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS!, abiJson.abi, signer);

        const tx = await contract.completeAndBurn(BigInt(tokenId));
        await tx.wait();

        await NFT.updateOne({ tokenId }, { status: "COMPLETED", checkoutTx: tx.hash });
        res.json({ sucesso: true, tx: tx.hash });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ erro: e?.message || "Falha no checkout/burn" });
    }
});

export default router;
