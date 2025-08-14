import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import abi from "../../contracts/NFTDiarias.json";

// Verificações de ambiente para debug
if (!process.env.PRIVATE_KEY) throw new Error("❌ PRIVATE_KEY não definida");
if (!process.env.CONTRACT_ADDRESS) throw new Error("❌ CONTRACT_ADDRESS não definida");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contrato = new ethers.Contract(process.env.CONTRACT_ADDRESS!, abi.abi, wallet);

export async function mintNFT(destinatario: string, tokenURI: string): Promise<string> {
    const tx = await contrato.mintNFT(destinatario, tokenURI);
    await tx.wait(); // Aguarda a transação ser minerada
    return tx.hash;
}
