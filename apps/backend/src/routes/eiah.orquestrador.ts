import { Router } from 'express';
import axios from 'axios';

const router = Router();

router.post('/nfts/orquestrador', async (req, res) => {
    try {
        const { contrato, idPropriedade, dataInicio, dataFim, finalidade, hospedesPermitidos } = req.body;

        // 1. GPT Jurídico
        const regrasRes = await axios.post('http://localhost:8000/api/analisar-contrato', contrato);
        const regrasExtraidas = regrasRes.data.regras;

        // 2. tokenURI
        const tokenRes = await axios.post('http://localhost:4000/api/tokenuri', {
            idPropriedade, dataInicio, dataFim, finalidade, hospedesPermitidos, regrasExtraidas
        });
        const tokenURI = tokenRes.data.tokenURI;

        // 3. ImageNFT
        const imageRes = await axios.post('http://localhost:4000/api/image/gerar', { idPropriedade, regrasExtraidas });
        const imageUrl = imageRes.data.image;

        // 4. MKT Diárias
        const mktRes = await axios.post('http://localhost:4000/api/mkt/gerar-copy', {
            finalidade, dataInicio, dataFim, regrasExtraidas
        });

        // 5. Mint NFT final
        const mintRes = await axios.post('http://localhost:4000/api/nfts/emitir', {
            idPropriedade, dataInicio, dataFim, finalidade, hospedesPermitidos, regrasExtraidas, tokenURI, imagem: imageUrl
        });

        res.status(200).json({
            success: true,
            tokenURI,
            txHash: mintRes.data.txHash,
            campanha: mktRes.data,
            imagem: imageUrl
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro na emissão orquestrada' });
    }
});

export default router;