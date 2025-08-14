from pydantic import BaseModel, Field
from typing import Optional

class NFTRequest(BaseModel):
    nomeProprietario: str = Field(..., example="Carlos NFT")
    documento: str = Field(..., example="123456789")
    wallet: str = Field(..., example="0xabc123...")
    idPropriedade: str = Field(..., example="prop123")
    nomeNFT: str = Field(..., example="Casa dos Sonhos - Outubro 2025")
    descricao: str = Field(..., example="Hospedagem à beira-mar com piscina e vista deslumbrante.")
    dataInicio: str = Field(..., example="2025-10-01")
    dataFim: str = Field(..., example="2025-10-10")
    valorDiaria: str = Field(..., example="1.5")
    moeda: str = Field(..., example="ETH")
    regras: str = Field(..., example="Check-in após 14h. Proibido fumar.")
    politicaCancelamento: str = Field(..., example="flexivel")
    imagemUrl: Optional[str] = Field(default="", example="https://ipfs.io/ipfs/Qm.../imagem.png")
