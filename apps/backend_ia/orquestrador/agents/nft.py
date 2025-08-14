from ..utils.ipfs import upload_to_ipfs
from ..utils.blockchain import mint_nft
from ..utils.pdf import gerar_pdf_prova
from orquestrador.schemas.nft_schema import NFTRequest
from datetime import datetime
import uuid

def executar(dados: dict):
    try:
        # 1. ✅ Validar dados recebidos
        entrada = NFTRequest(**dados)

        # 2. ✅ Gerar metadata
        metadata = {
            "name": entrada.nomeNFT,
            "description": entrada.descricao,
            "image": entrada.imagemUrl or "",
            "attributes": [
                {"trait_type": "Data de Início", "value": entrada.dataInicio},
                {"trait_type": "Data de Fim", "value": entrada.dataFim},
                {"trait_type": "Valor da Diária", "value": entrada.valorDiaria},
                {"trait_type": "Moeda", "value": entrada.moeda},
                {"trait_type": "Regras", "value": entrada.regras},
            ]
        }

        # 3. ✅ Upload IPFS
        ipfs_result = upload_to_ipfs(metadata)
        token_uri = ipfs_result["tokenURI"]
        ipfs_hash = ipfs_result["ipfsHash"]

        # 4. ✅ Mint na blockchain
        mint_result = mint_nft(entrada.wallet, token_uri)
        tx_hash = mint_result["txHash"]
        nft_id = mint_result["nftId"]

        # 5. ✅ (Opcional) Geração de Prova PDF
        pdf_url = gerar_pdf_prova({
            "nftId": nft_id,
            "nome": entrada.nomeProprietario,
            "descricao": entrada.descricao,
            "wallet": entrada.wallet,
            "tokenURI": token_uri,
            "txHash": tx_hash,
        })

        # 6. ✅ Resposta estruturada
        return {
            "sucesso": True,
            "resultado": {
                "agente": "nft",
                "status": "ativo",
                "mensagem": "NFT da diária criada com sucesso na blockchain.",
                "tokenURI": token_uri,
                "ipfsHash": ipfs_hash,
                "txHash": tx_hash,
                "idNFT": nft_id,
                "provaVerificacaoNFT": pdf_url,
                "timestamp": datetime.utcnow().isoformat(),
            }
        }

    except Exception as e:
        return {
            "sucesso": False,
            "erro": str(e),
            "mensagem": "Falha ao executar agente NFT."
        }
