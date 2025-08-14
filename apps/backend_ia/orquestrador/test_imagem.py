# apps/backend_ia/orquestrador/test_imagem.py
import os, sys, pytest, re
from fastapi.testclient import TestClient

# Avisos deprecados (mesma estratégia do seu test_main.py)
pytestmark = [
    pytest.mark.filterwarnings(
        "ignore:Using extra keyword arguments on `Field` is deprecated.*:DeprecationWarning"
    ),
    pytest.mark.filterwarnings(
        "ignore:datetime\\.datetime\\.utcnow\\(\\) is deprecated.*:DeprecationWarning"
    ),
]

# Garantir import do app FastAPI
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from orquestrador.main import app

client = TestClient(app)


def _payload_nft(only_prompt: bool = True):
    return {
        "payload": {
            "modo": "nft",
            "imagem_referencia": "https://exemplo.com/ref.jpg",
            "imovel": {"tipo": "Casa na praia", "localizacao": "Ilhabela"},
            "estilo": "3D clean",
            "tema": "noite de verao",
            "web3": "grade hexagonal sutil, token brilhante",
            "compliance": {
                "territory": "BR",
                "rights_confirmed": True,
                "third_party_brands": "bloquear/ocultar",
                "disclaimers": [
                    "Imagens meramente ilustrativas.",
                    "Não constitui oferta de investimento.",
                ],
            },
            "mkt_context": {
                "cta": "Desbloqueie upgrade exclusivo",
                "claims_allowlist": [
                    "colecionável digital",
                    "acesso verificado on-chain",
                ],
                "keywords": ["nft diarias", "hospedagem web3"],
                "claims_used": ["colecionável digital"],
            },
            "only_prompt": only_prompt,
        }
    }


def test_imagem_nft_only_prompt_ok():
    """Valida geração de prompts + relatórios (Jurídico, MKT) + J_360 no modo only_prompt."""
    resp = client.post("/imagem/preview", json=_payload_nft(only_prompt=True))
    assert resp.status_code == 200
    data = resp.json()

    # Estrutura básica
    assert data.get("agente") == "imagem"
    assert data.get("status") in ("ok", "ativo")
    assert "prompts" in data and "system" in data["prompts"] and "user" in data["prompts"]

    # Conteúdo do prompt de usuário cita NFT
    assert "Arte ilustrativa do NFT" in data["prompts"]["user"]

    # Compliance report
    comp = data.get("compliance_report", {})
    assert isinstance(comp, dict)
    assert 0.0 <= float(comp.get("risk_score", 0)) <= 1.0
    assert "disclaimers_aplicados" in comp
    assert any("ilustrativas" in d for d in comp["disclaimers_aplicados"])

    # Alinhamento MKT
    mkt = data.get("mkt_alignment_report", {})
    assert mkt.get("cta_usada") == "Desbloqueie upgrade exclusivo"
    assert "colecionável digital" in (mkt.get("claims_validadas") or [])
    assert not mkt.get("violacoes")  # deve estar vazio

    # J_360 event
    j = data.get("j360_event", {})
    assert j.get("type") == "image.generate"
    assert j.get("mode") == "nft"
    assert "payload_hash" in j and len(j["payload_hash"]) >= 8


def test_imagem_nft_manifest_ok():
    """Valida manifesto completo (artefatos simulados) + relatórios aninhados em conteudo."""
    resp = client.post("/imagem/preview", json=_payload_nft(only_prompt=False))
    assert resp.status_code == 200
    data = resp.json()

    assert data.get("agente") == "imagem"
    conteudo = data.get("conteudo", {})
    assert isinstance(conteudo, dict)

    # Artefatos esperados para NFT
    artefatos = conteudo.get("artefatos") or []
    assert any(a.get("role") == "nft" for a in artefatos)
    for a in artefatos:
        assert "name" in a and "path_or_url" in a

    # Prompts presentes
    pr = conteudo.get("prompts", {})
    assert "system" in pr and "user" in pr

    # Relatórios e J_360 dentro de conteudo
    comp = conteudo.get("compliance_report", {})
    mkt = conteudo.get("mkt_alignment_report", {})
    j = conteudo.get("j360_event", {})
    assert 0.0 <= float(comp.get("risk_score", 0)) <= 1.0
    assert mkt.get("cta_usada") == "Desbloqueie upgrade exclusivo"
    assert j.get("type") == "image.generate" and j.get("mode") == "nft"
