// apps/backend/scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("📦 Deploying contract with account:", deployer.address);

    // ✅ Correto: get balance da carteira do deployer via provider
    const balance = await deployer.provider!.getBalance(deployer.address);
    console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");

    // ✅ Deploy do contrato NFTDiarias (ajuste o nome se necessário)
    const NFTDiarias = await ethers.getContractFactory("NFTDiarias");
    const contrato = await NFTDiarias.deploy();
    await contrato.waitForDeployment();

    const address = await contrato.getAddress();
    console.log("✅ NFTDiarias deployed to:", address);
}

main().catch((error) => {
    console.error("❌ Erro no deploy:", error);
    process.exit(1);
});
