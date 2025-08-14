# apps/backend_ia/test_main.py
import sys
import os
import re
import pytest
from pathlib import Path
import json
from fastapi.testclient import TestClient

# ---- Filtros de warnings para manter a saída limpa nos testes ----
# Pydantic V2: uso de "example=" em Field é deprecado
pytestmark = [
    pytest.mark.filterwarnings(
        "ignore:Using extra keyword arguments on `Field` is deprecated.*:DeprecationWarning"
    ),
    # datetime.utcnow() deprecado
    pytest.mark.filterwarnings(
        "ignore:datetime\\.datetime\\.utcnow\\(\\) is deprecated.*:DeprecationWarning"
    ),
]

# Adiciona o diretório apps/backend_ia ao PYTHONPATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from orquestrador.main import app  # sua aplicação FastAPI

client = TestClient(app)


def test_read_home():
    """Testa o endpoint principal '/'."""
    resp = client.get("/")
    assert resp.status_code == 200
    body = resp.json()
    # mantém compatibilidade com a mensagem atual
    assert body == {"mensagem": "Orquestrador EIAH ativo."}


def test_executar_agente_sucesso_contrato():
    """
    Testa a execução de um agente válido, como o 'contrato'.
    Mantém a expectativa de sucesso e a presença da mensagem de análise.
    """
    entrada_exemplo = "clausula primeira do documento"
    resp = client.get(f"/executar/contrato?entrada={entrada_exemplo}")

    assert resp.status_code == 200
    data = resp.json()
    assert data["sucesso"] is True
    assert data["resultado"]["agente"] == "contrato"

    # A aplicação original retornava uma string na chave 'resposta'
    # contendo 'Análise do contrato realizada com sucesso'.
    # Mantemos a mesma verificação, sem engessar o texto completo.
    resposta = data["resultado"].get("resposta", "")
    assert isinstance(resposta, str)
    assert "Análise do contrato realizada com sucesso" in resposta


def test_executar_agente_sucesso_mkt():
    """
    Testa o agente 'mkt'. O agente atualizado pode responder em:
      - modo simples (headline/corpo)
      - modo avançado (conteudo.mkt_json com titulo/descricao/hashtags/tags)
    Este teste aceita ambos, mantendo a funcionalidade original.
    """
    entrada_qualquer = "ideias de marketing"
    resp = client.get(f"/executar/mkt?entrada={entrada_qualquer}")

    assert resp.status_code == 200
    data = resp.json()
    assert data["sucesso"] is True

    resultado = data["resultado"]
    assert resultado["agente"] == "mkt"

    # Compatibilidade: aceitamos variações de mensagem
    msg = resultado.get("mensagem", "")
    assert isinstance(msg, str)
    assert any(
        phrase in msg
        for phrase in [
            "Plano de marketing gerado com sucesso",
            "Peça gerada com sucesso",
            "Peça gerada (modo simples)",
            "Peça gerada com sucesso (modo avançado)",
        ]
    )

    # Verifica conteúdo mínimo em qualquer modo:
    conteudo = resultado.get("conteudo", {})
    assert isinstance(conteudo, dict)

    # Modo avançado: deve existir mkt_json com chaves conhecidas
    mkt_json = conteudo.get("mkt_json")
    if mkt_json is not None:
        assert isinstance(mkt_json, dict)
        # presença das chaves principais
        for k in ["titulo_nft", "descricao_longa", "hashtags_social", "tags_mercado"]:
            assert k in mkt_json
            assert mkt_json[k]  # não vazio

        # título até 10 palavras (quando aplicável)
        titulo = str(mkt_json["titulo_nft"])
        assert len(titulo.split()) <= 10

        # descrição com pelo menos ~100 palavras (contagem simples de tokens alfanuméricos)
        desc = str(mkt_json["descricao_longa"])
        assert len(re.findall(r"\w+", desc)) >= 100
    else:
        # Modo simples: deve existir 'headline' e 'corpo'
        assert "headline" in conteudo and "corpo" in conteudo
        assert isinstance(conteudo["headline"], str) and conteudo["headline"]
        assert isinstance(conteudo["corpo"], str) and conteudo["corpo"]


def test_executar_agente_inexistente():
    """Testa a chamada para um agente que não existe e aceita mensagens antigas e novas."""
    resp = client.get("/executar/agente_fantasma?entrada=teste")
    assert resp.status_code == 404

    detail = resp.json().get("detail", "")
    # Deve mencionar o agente pedido
    assert "agente_fantasma" in detail.lower()
    # Aceita "não encontrado" OU "não disponível via GET"
    assert ("não encontrado" in detail.lower()) or ("não disponível via get" in detail.lower())

def test_mkt_avancado_only_json():
    # test_main.py está em .../orquestrador/, então o JSON fica ao lado dele
    payload_path = Path(__file__).parent / "test_payload_mkt_avancado.json"

    if payload_path.exists():
        with payload_path.open("r", encoding="utf-8") as f:
            payload = json.load(f)
    else:
        # Fallback inline (não quebra o CI se o arquivo sumir)
        payload = {
          "payload": {
            "imovel": {
              "tipo": "Apartamento vista mar",
              "localizacao": "Balneário Camboriú",
              "amenidades": ["Wi-Fi 500Mb", "Piscina", "Academia"],
              "extras": ["Late checkout", "NFT de upgrade"]
            },
            "contexto_mercado": {
              "cidade": "Balneário Camboriú",
              "periodo": "2025-11-01 a 2025-11-07",
              "demanda": "baixa",
              "eventos": ["Festival de música"],
              "clima": "Ensolarado",
              "preco_medio_competidores": 320
            },
            "preferencias": {
              "idioma": "pt",
              "persona": "luxo",
              "canais_alvo": ["instagram","google_ads"],
              "seo": {"keywords_primarias": ["diária NFT Balneário Camboriú"]},
              "cta": "Desbloqueie upgrade exclusivo",
              "ab_variants": 2,
              "utm_base": "utm_source=social&utm_medium=paid&utm_campaign=nftdiarias"
            },
            "promocao": {"ativa": True, "detalhes": "10% OFF até 20/11"},
            "only_json": True
          }
        }

    resp = client.post("/mkt/preview", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    for k in ["titulo_nft", "descricao_longa", "hashtags_social", "tags_mercado"]:
        assert k in data and data[k]
    assert len(str(data["titulo_nft"]).split()) <= 10
    assert isinstance(data["hashtags_social"], list) and 3 <= len(data["hashtags_social"]) <= 12
    assert isinstance(data["tags_mercado"], list) and len(data["tags_mercado"]) >= 3