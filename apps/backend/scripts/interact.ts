import { ethers } from "hardhat";

// AJUSTE AQUI SE PRECISAR
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// helpers
const now = Math.floor(Date.now() / 1000);
const day = 24 * 60 * 60;

async function main() {
    const [admin, owner, operator, guest] = await ethers.getSigners();
    console.log("Admin:", admin.address);
    console.log("Owner:", owner.address);
    console.log("Operator:", operator.address);
    console.log("Guest:", guest.address);

    const c = await ethers.getContractAt("NFTDiarias", CONTRACT_ADDRESS);

    // 1) Definir o proprietário do imóvel (imovelId = 1)
    const imovelId = 1;
    let tx = await c.connect(admin).setPropertyOwner(imovelId, owner.address);
    await tx.wait();
    console.log("setPropertyOwner OK");

    // 2) Aprovar operador para o imóvel
    tx = await c.connect(owner).setPropertyOperator(imovelId, operator.address, true);
    await tx.wait();
    console.log("setPropertyOperator OK");

    // 3) Conferir disponibilidade e mintear reserva (operator minte para o guest)
    const startDate = now + day;        // amanhã
    const endDate = startDate + 3 * day; // 3 diárias
    const available = await c.isAvailable(imovelId, startDate, endDate);
    console.log("isAvailable:", available);
    if (!available) throw new Error("Intervalo não disponível");

    const tokenURI = "ipfs://Qm...token.json";
    tx = await c.connect(operator).mintReservation(imovelId, guest.address, startDate, endDate, tokenURI);
    const receipt = await tx.wait();
    const mintedEvent = receipt!.logs
        .map(l => {
            try { return c.interface.parseLog(l); } catch { return null; }
        })
        .find(ev => ev?.name === "ReservationMinted");
    const tokenId = mintedEvent?.args?.tokenId?.toString();
    console.log("mintReservation OK. tokenId:", tokenId);

    // 4) Marcar como pago
    tx = await c.connect(operator).setReservation(tokenId, true);
    await tx.wait();
    console.log("setReservation(paid=true) OK");

    // 5) Simular fim da estadia (avançar tempo no hardhat local)
    //   OBS: só funciona em localhost Hardhat Node
    await ethers.provider.send("evm_increaseTime", [4 * day]); // +4 dias
    await ethers.provider.send("evm_mine", []);

    // 6) Concluir e queimar
    tx = await c.connect(operator).completeAndBurn(tokenId);
    await tx.wait();
    console.log("completeAndBurn OK");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
