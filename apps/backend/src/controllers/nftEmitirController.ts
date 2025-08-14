import { Request, Response } from "express";
import { uploadParaIPFS } from "../services/ipfsService";
import { mintNFT } from "../services/contratoService";
import NFT from "../models/NFT";

export const emitirNFT = async (req: Request, res: Response) => {
    try {
        const {
            nomeNFT,
            descricao,
            idPropriedade,
            idPerfil,
            wallet,
            dataInicio,
            dataFim,
            cep,
            endereco,
            numero,
            cidade,
            uf
        } = req.body;

        const midiaPath = req.file?.path;

        // 1. Gera o tokenURI real no IPFS
        const tokenURI = await uploadParaIPFS({
            nomeNFT,
            descricao,
            endereco: { cep, endereco, numero, cidade, uf },
            dataInicio,
            dataFim,
            midiaPath,
        });

        // 2. Executa o mintNFT via ethers.js
        const txHash = await mintNFT(wallet, tokenURI);

        // 3. Salva os dados no MongoDB
        const novoNFT = await NFT.create({
            nomeNFT,
            descricao,
            idPropriedade,
            idPerfil,
            wallet,
            tokenURI,
            txHash,
            dataInicio,
            dataFim,
            midia: req.file?.filename,
            enderecoCompleto: {
                cep,
                endereco,
                numero,
                cidade,
                uf,
            },
        });


        res.status(201).json({
            mensagem: "NFT emitido com sucesso",
            nft: novoNFT,
            tokenURI,
            txHash
        });
    } catch (err) {
        console.error("[ERRO emitirNFT]", err);
        res.status(500).json({ erro: "Falha ao emitir NFT" });
        try {
            // uploadParaIPFS
        } catch (e) {
            return res.status(500).json({ erro: "Erro ao fazer upload no IPFS", detalhes: e });
        }

        try {
            // mintNFT
        } catch (e) {
            return res.status(500).json({ erro: "Erro ao mintar NFT", detalhes: e });
        }

    }
};
