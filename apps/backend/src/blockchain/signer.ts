// apps/backend/src/blockchain/signer.ts
import { JsonRpcProvider, Wallet } from "ethers";

const RPC_URL = (process.env.RPC_URL || "http://127.0.0.1:8545").trim();
export const provider = new JsonRpcProvider(RPC_URL);

// aceita PRIVATE_KEY ou ADMIN_PRIVATE_KEY
const PK = (process.env.PRIVATE_KEY || process.env.ADMIN_PRIVATE_KEY || "").trim();
if (!/^0x[0-9a-fA-F]{64}$/.test(PK)) {
    throw new Error(
        "Chave privada ausente/invalid. Defina PRIVATE_KEY (ou ADMIN_PRIVATE_KEY) no .env no formato 0x + 64 hex."
    );
}

export const signer = new Wallet(PK, provider);
