import { create } from "ipfs-http-client";
import fs from "fs";
import path from "path";

// Conectando ao daemon IPFS local (pode ser substituído por Infura se necessário)
const ipfs = create({ url: "http://localhost:5001/api/v0" });

export async function uploadParaIPFS(dados: any): Promise<string> {
    const midia = fs.readFileSync(path.resolve(dados.midiaPath));
    const { cid: cidMidia } = await ipfs.add(midia);

    const metadata = {
        name: dados.nomeNFT,
        description: dados.descricao,
        image: `ipfs://${cidMidia}`, // Link para o arquivo no IPFS
        attributes: [
            { trait_type: "Data Início", value: dados.dataInicio },
            { trait_type: "Data Fim", value: dados.dataFim },
            {
                trait_type: "Endereço",
                value: `${dados.endereco.endereco}, ${dados.endereco.numero} - ${dados.endereco.cidade}/${dados.endereco.uf}`,
            },
        ],
    };

    const { cid: cidMetadata } = await ipfs.add(JSON.stringify(metadata));
    return `ipfs://${cidMetadata}`;
}
