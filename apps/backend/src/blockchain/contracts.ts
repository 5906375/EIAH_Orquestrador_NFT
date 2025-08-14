import { Contract } from "ethers";
import { signer } from "../blockchain/signer";
import abiRaw from "../../contracts/NFTDiarias.json"; // << aqui!

const CONTRACT_ADDRESS = (process.env.CONTRACT_ADDRESS || "").trim();
if (!/^0x[0-9a-fA-F]{40}$/.test(CONTRACT_ADDRESS)) {
    throw new Error(`CONTRACT_ADDRESS ausente ou inválido no .env: "${CONTRACT_ADDRESS}"`);
}
const ABI = (abiRaw as any)?.abi ?? (abiRaw as any);
if (!ABI || (Array.isArray(ABI) && ABI.length === 0)) {
    throw new Error("ABI do contrato não encontrado ou vazio em src/contracts/NFTDiarias.json");
}

let _contract: Contract | null = null;
export function getNftContract(): Contract {
    if (_contract) return _contract;
    _contract = new Contract(CONTRACT_ADDRESS, ABI as any, signer);
    return _contract;
}
