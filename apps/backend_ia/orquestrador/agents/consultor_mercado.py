# apps/backend_ia/orquestrador/agents/consultor_mercado.py
from datetime import datetime
from typing import List, Dict, Any, Optional

"""
Agente de benchmarking & estratégia para NFTDiárias.
- Coleta/integra dados de mercado (placeholders para conectar a datasets/APIs).
- Compara Airbnb/Booking/Vrbo/Dtravel/Staynex vs. NFTDiárias.
- Gera sugestões, contratos (texto) e um esboço de smart contract (Solidity).
- Retorna JSON padronizado consumível pelo frontend ou por outros agentes.

IMPORTANTE:
- Para dados reais, conecte esses stubs a fontes como InsideAirbnb (open data),
  AirDNA (paga), relatórios públicos das plataformas, IBGE/WTTC, etc.
- Evite scraping direto das UIs (frágil / possivelmente contra ToS).
"""

# ---------- PROMPT BASE (caso use LLM junto do agente) ----------
PROMPT_BASE = """
Atue como consultor de mercado para locação por temporada e Web3.
Objetivo: comparar Airbnb/Booking/Vrbo/Dtravel/Staynex vs. NFTDiárias (projeto).
Entregue: tabela comparativa (ticket médio, ocupação, sazonalidade, tipos de imóvel),
sugestões priorizadas, cláusulas contratuais (BR + internacional), e um esboço de
smart contract para reservas/cancelamentos/garantias. Considere KYC/AML (Lei 9.613/98),
LGPD, CDC e Lei do Inquilinato. Proponha usos de IA (precificação dinâmica, recomendação,
fraude, gestão de ocupação). Retorne um JSON compatível com a estrutura solicitada.
"""

# ---------- Stubs de coleta de dados (substitua por conectores reais) ----------
def fetch_inside_airbnb(cidades: List[str]) -> List[Dict[str, Any]]:
    """
    TODO: Conectar a datasets InsideAirbnb (CSV/Parquet por cidade).
    Retorne objetos com campos coerentes: ticket_medio, ocupacao_media, sazonalidade etc.
    """
    # Exemplo de shape vazio (preparado para receber dados reais)
    return [{"fonte":"InsideAirbnb","cidade":c,"ticket_medio":None,"ocupacao_media":None,
             "sazonalidade":[],"tipos_imovel":[],"duracao_media":None} for c in cidades]

def fetch_airbnb_overview(regioes: List[str]) -> List[Dict[str, Any]]:
    """
    TODO: Integrar a relatórios públicos/análises de mercado (ex.: AirDNA se licenciado).
    """
    return [{"fonte":"Airbnb-reports","regiao":r,"ticket_medio":None,"ocupacao_media":None,
             "sazonalidade":[],"tipos_imovel":[],"duracao_media":None} for r in regioes]

def fetch_web2_platforms_summary() -> List[Dict[str, Any]]:
    """
    TODO: Booking/Vrbo/Expedia – usar relatórios anuais/trimestrais, blogs de dados,
    ou provedores de inteligência de mercado. Evitar scraping direto.
    """
    return [
        {"plataforma":"Booking","ticket_medio":None,"ocupacao_media":None},
        {"plataforma":"Vrbo","ticket_medio":None,"ocupacao_media":None},
        {"plataforma":"Expedia","ticket_medio":None,"ocupacao_media":None},
    ]

def fetch_web3_platforms_summary() -> List[Dict[str, Any]]:
    """
    TODO: Dtravel/Staynex – checar docs, whitepapers e relatórios da comunidade.
    """
    return [
        {"plataforma":"Dtravel","modelo":"Web3","ticket_medio":None,"ocupacao_media":None},
        {"plataforma":"Staynex","modelo":"Web3","ticket_medio":None,"ocupacao_media":None},
    ]


# ---------- Utilidades de composição ----------
def montar_tabela_comparativa(dados: Dict[str, Any]) -> str:
    """
    Retorna uma tabela em Markdown (fácil de exibir no frontend) comparando plataformas.
    Preenche com None quando faltarem números (até os conectores reais entrarem).
    """
    linhas = [
        "| Plataforma | Modelo | Ticket Médio | Ocupação Média | Sazonalidade | Tipos de Imóvel | Duração Média |",
        "|-----------:|:------:|-------------:|---------------:|:------------:|:---------------:|:-------------:|",
        f"| Airbnb | Web2 | {dados['airbnb'].get('ticket_medio')} | {dados['airbnb'].get('ocupacao_media')} | {', '.join(dados['airbnb'].get('sazonalidade', [])) or '-'} | {', '.join(dados['airbnb'].get('tipos_imovel', [])) or '-'} | {dados['airbnb'].get('duracao_media')} |",
        f"| Booking | Web2 | {dados['booking'].get('ticket_medio')} | {dados['booking'].get('ocupacao_media')} | - | - | - |",
        f"| Vrbo | Web2 | {dados['vrbo'].get('ticket_medio')} | {dados['vrbo'].get('ocupacao_media')} | - | - | - |",
        f"| Dtravel | Web3 | {dados['dtravel'].get('ticket_medio')} | {dados['dtravel'].get('ocupacao_media')} | - | - | - |",
        f"| Staynex | Web3 | {dados['staynex'].get('ticket_medio')} | {dados['staynex'].get('ocupacao_media')} | - | - | - |",
        f"| NFTDiárias | Web3 | {dados['nftdiarias'].get('ticket_medio')} | {dados['nftdiarias'].get('ocupacao_media')} | {', '.join(dados['nftdiarias'].get('sazonalidade', [])) or '-'} | {', '.join(dados['nftdiarias'].get('tipos_imovel', [])) or '-'} | {dados['nftdiarias'].get('duracao_media')} |",
    ]
    return "\n".join(linhas)

def sugerir_melhorias() -> List[Dict[str, Any]]:
    """
    Sugestões de alto impacto para o NFTDiárias (prontas para priorização no backlog).
    """
    return [
        {
            "titulo": "Precificação dinâmica com IA",
            "acao": "Modelar preço por ocupação-alvo, sazonalidade e competição local.",
            "impacto_estimado": "+10–25% receita / +5–15% ocupação",
            "complexidade": "média",
            "dependencias": ["dados históricos", "conector de calendário", "motor de regras/IA"]
        },
        {
            "titulo": "NFT de Pacote Flex (7/15/30 diárias)",
            "acao": "Emitir NFTs com direito a X diárias flexíveis/ano, com janela de agendamento.",
            "impacto_estimado": "+8–20% receita recorrente",
            "complexidade": "média",
            "dependencias": ["regra de queima/uso parcial", "UI de calendário", "política de remarcação"]
        },
        {
            "titulo": "Programa de fidelidade tokenizado",
            "acao": "Pontos on-chain + tiers (NFTD staking) para desconto e upgrades.",
            "impacto_estimado": "+5–12% LTV",
            "complexidade": "média",
            "dependencias": ["token ERC-20", "regras de acúmulo/resgate"]
        },
        {
            "titulo": "Integração Web2 ↔ Web3",
            "acao": "Bridge com iCal/Booking.com/VRBO para sincronizar calendário e inventário.",
            "impacto_estimado": "reduz overbooking e aumenta alcance",
            "complexidade": "média/alta",
            "dependencias": ["conectores APIs/ICS", "motor de conflito"]
        },
        {
            "titulo": "Detecção de fraude e chargeback com IA",
            "acao": "Score de risco por carteira/dispositivo, padrões de reserva e geolocalização.",
            "impacto_estimado": "redução de perdas operacionais",
            "complexidade": "média",
            "dependencias": ["feature store", "modelo de risco", "webhooks de pagamento"]
        },
    ]

def clausulas_contratuais_texto() -> str:
    """
    Texto base (BR) – adaptar ao caso concreto com advogado.
    """
    return (
        "CLÁUSULAS-BASE – LOCAÇÃO TEMPORÁRIA TOKENIZADA (BR)\n"
        "1) Objeto: cessão de uso do imóvel por período determinado, representado por NFT.\n"
        "2) Identificação e KYC/AML: locador e locatário submetem documentos para verificação (Lei 9.613/98).\n"
        "3) Política de Cancelamento: Flexível/Moderada/Rígida (parametrizável no NFT/contrato).\n"
        "4) Regras do Imóvel: silêncio, pets, fumantes, ocupação máxima, check-in/out, caução.\n"
        "5) LGPD: tratamento de dados pessoais limitado à execução do contrato e obrigações legais.\n"
        "6) Garantias e Caução: bloqueio/garantia on-chain/off-chain conforme regras.\n"
        "7) Responsabilidades: danos, multas, mau uso, limpeza.\n"
        "8) Resolução de Conflitos: mediação/arbitragem; foro supletivo.\n"
        "9) Tributação: observância de ISS/IR/tributos, emissão de NFS-e quando aplicável.\n"
    )

def contrato_solidity_exemplo() -> str:
    """
    Esboço de smart contract (simplificado) para reservas/cancelamentos/garantia.
    Ajuste para o seu padrão (ERC721URIStorage + regras de uso parcial/queima).
    """
    return r"""// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LocacaoNFT
 * @dev Exemplo educacional – ajustar lógica de janelas, remarcação e caução.
 */
contract LocacaoNFT is ERC721URIStorage, Ownable {
    struct Reserva {
        uint256 tokenId;
        address hospede;
        uint64 checkIn;   // epoch
        uint64 checkOut;  // epoch
        uint256 caucao;   // em wei
        uint8 politicaCancelamento; // 0 flex, 1 moderada, 2 rigida
        bool ativa;
    }

    uint256 public tokenCount;
    mapping(uint256 => Reserva) public reservas;

    constructor() ERC721("LocacaoNFT", "LOCNFT") {}

    function mintNFT(address to, string memory tokenURI) external onlyOwner returns (uint256) {
        tokenCount += 1;
        uint256 newId = tokenCount;
        _mint(to, newId);
        _setTokenURI(newId, tokenURI);
        return newId;
    }

    function registrarReserva(
        uint256 tokenId,
        address hospede,
        uint64 checkIn,
        uint64 checkOut,
        uint256 caucao,
        uint8 politicaCancelamento
    ) external onlyOwner {
        reservas[tokenId] = Reserva(tokenId, hospede, checkIn, checkOut, caucao, politicaCancelamento, true);
    }

    function cancelarReserva(uint256 tokenId) external onlyOwner {
        require(reservas[tokenId].ativa, "Reserva inativa");
        reservas[tokenId].ativa = false;
        // TODO: aplicar regras de estorno por politicaCancelamento + tempo restante
    }
}
"""

def plano_de_acao() -> List[Dict[str, Any]]:
    return [
        {"prazo":"curto (0-30d)","itens":[
            "Conectar InsideAirbnb e datasets públicos (ETL simples).",
            "Definir política de cancelamento padrão (Flex/Moderada/Rígida) e refletir no NFT.",
            "Prototipar precificação dinâmica (baseline por cidade/temporada).",
        ]},
        {"prazo":"médio (31-90d)","itens":[
            "Bridge Web2 (iCal/ICS) ↔ NFTDiárias para evitar overbooking.",
            "Lançar NFT de pacote flex (7/15/30 diárias).",
            "Piloto de IA de recomendação (wallet + perfil).",
        ]},
        {"prazo":"longo (90-180d)","itens":[
            "IA antifraude produtiva (score + bloqueio dinâmico).",
            "Governança/DAO para regras de fidelidade e upgrades.",
            "Expansão internacional com compliance local."
        ]},
    ]


# ---------- Entrada/saída principal do agente ----------
def executar(dados: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parâmetros esperados (opcionais):
    - cidades: ["Florianopolis","Sao Paulo", ...]
    - regioes: ["Brasil","LatAm","Europa"]
    - moeda: "BRL"|"USD"
    - incluir_contratos: bool
    - incluir_solidity: bool
    """
    try:
        cidades = dados.get("cidades", ["Florianopolis"])
        regioes = dados.get("regioes", ["Brasil"])
        moeda = dados.get("moeda", "BRL")
        incluir_contratos = bool(dados.get("incluir_contratos", True))
        incluir_solidity = bool(dados.get("incluir_solidity", True))

        # 1) Coleta (stubs prontos para conectar)
        inside = fetch_inside_airbnb(cidades)
        airbnb = fetch_airbnb_overview(regioes)
        web2 = fetch_web2_platforms_summary()
        web3 = fetch_web3_platforms_summary()

        # 2) Montagem de um dict de comparação (placeholder -> None onde não há dado)
        comp = {
            "airbnb": {"ticket_medio": None, "ocupacao_media": None, "sazonalidade": [], "tipos_imovel": [], "duracao_media": None},
            "booking": {"ticket_medio": None, "ocupacao_media": None},
            "vrbo": {"ticket_medio": None, "ocupacao_media": None},
            "dtravel": {"ticket_medio": None, "ocupacao_media": None},
            "staynex": {"ticket_medio": None, "ocupacao_media": None},
            "nftdiarias": {"ticket_medio": None, "ocupacao_media": None, "sazonalidade": [], "tipos_imovel": [], "duracao_media": None},
        }

        tabela = montar_tabela_comparativa(comp)
        melhorias = sugerir_melhorias()

        contratos_txt = clausulas_contratuais_texto() if incluir_contratos else ""
        solidity_src = contrato_solidity_exemplo() if incluir_solidity else ""

        resposta = {
            "sucesso": True,
            "resultado": {
                "agente": "consultor_mercado",
                "timestamp": datetime.utcnow().isoformat(),
                "moeda": moeda,
                "comparativo_markdown": tabela,
                "sugestoes": melhorias,
                "contratos_texto": contratos_txt,
                "contrato_solidity": solidity_src,
                "plano_acao": plano_de_acao(),
                "insights_pendentes": {
                    "tem_dados_reais?": False,
                    "mensagem": "Conecte os stubs às fontes (InsideAirbnb/AirDNA/relatórios) para preencher medidas reais."
                }
            }
        }
        return resposta
    except Exception as e:
        return {"sucesso": False, "erro": str(e)}
