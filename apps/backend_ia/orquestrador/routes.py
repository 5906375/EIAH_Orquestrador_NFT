# apps/backend_ia/orquestrador/routes.py
from fastapi import Request, APIRouter, HTTPException, Query, Body
from typing import Any, Dict

# importa o subrouter da campanha (/api/campanha)
from orquestrador.routers import campanha

# Agentes (imports relativos, mais robustos)
from .agents.contrato import executar as contrato
from .agents.mkt import executar as mkt
from .agents.imagem import executar as imagem
from .agents.tutor import executar as tutor
from .agents.nft import executar as nft
from .agents.consultor_mercado import executar as consultor_mercado  # novo

router = APIRouter()

# 🔗 Anexa o router de Campanha (endpoints: /api/campanha, /api/campanha/stats, PUT /api/campanha/{id})
router.include_router(campanha.router)

# === GET: agentes que aceitam string ==========================
@router.get("/executar/{agente}", tags=["Agentes"])
def executar_agente_get(
    agente: str,
    entrada: str = Query(..., description="Entrada de texto enviada ao agente"),
):
    # mkt agora aceita string também (via shim no mkt.py)
    agentes_str = {
        "contrato": contrato,
        "imagem": imagem,
        "tutor": tutor,
        "mkt": mkt,
        # ⚠️ não incluímos 'nft' aqui: ele exige JSON válido do NFTRequest
    }
    funcao_agente = agentes_str.get(agente)
    if not funcao_agente:
        # Mantém rota/endpoint, mas evita quebrar passando string pra quem precisa JSON
        raise HTTPException(
            status_code=404,
            detail=f"Agente '{agente}' não disponível via GET. Use POST para: ['nft','consultor_mercado']."
        )

    try:
        print(f"[ROUTER][GET] Executando agente '{agente}' com entrada: '{entrada}'")
        resultado = funcao_agente(entrada)
        return {"sucesso": True, "resultado": resultado}
    except Exception as e:
        print(f"[ERRO][GET] Falha agente '{agente}': {e}")
        raise HTTPException(status_code=500, detail=str(e))

# === POST: agentes que aceitam JSON ===========================
@router.post("/executar/{agente}", tags=["Agentes"])
async def executar_agente_post(agente: str, payload: Dict[str, Any] = Body(...)):
    agentes_json = {
        "nft": nft,
        "consultor_mercado": consultor_mercado,
        "mkt": mkt,  # mkt também aceita JSON estruturado
    }
    funcao_agente = agentes_json.get(agente)
    if not funcao_agente:
        raise HTTPException(
            status_code=404,
            detail=f"Agente '{agente}' não disponível via POST. Use GET para: ['contrato','imagem','tutor','mkt']."
        )

    try:
        print(f"[ROUTER][POST] Executando agente '{agente}' com payload:", payload)
        resultado = funcao_agente(payload)
        return {"sucesso": True, "resultado": resultado}
    except Exception as e:
        print(f"[ERRO][POST] Falha agente '{agente}': {e}")
        raise HTTPException(status_code=500, detail=str(e))

# === Tutor – progresso ========================================
@router.post("/api/tutor/progresso", tags=["Tutor"])
def registrar_progresso(data: dict = Body(...)):
    idPerfil = data.get("idPerfil")
    etapa = data.get("etapa")
    texto = data.get("texto")
    print(f"[TUTOR IA] Progresso – idPerfil: {idPerfil}, Etapa: {etapa}, Texto: {texto}")
    return {"sucesso": True, "mensagem": "Progresso do tutor registrado com sucesso.", "dados": data}

# === Orquestração completa (consultor -> nft -> imagem) =======
@router.post("/api/orquestrador/emitir-nft", tags=["Orquestrador"])
async def emitir_nft_orquestrado(request: Request):
    dados = await request.json()
    print("[ORQ] Dados recebidos:", dados)
    try:
        # 1) consultor de mercado (opcional no payload)
        consult_in = dados.get("consultor") or {"cidades": ["Florianopolis"], "regioes": ["Brasil"], "moeda": "BRL"}
        resultado_consultor = consultor_mercado(consult_in)

        # 2) sugestoes opcionais -> nft
        preco_sugerido = dados.get("precoSugerido")
        politica_cancelamento = dados.get("politicaCancelamento") or "moderada"

        payload_nft = {**(dados.get("nft") or {})}
        if preco_sugerido is not None:
            payload_nft["precoSugerido"] = preco_sugerido
        if politica_cancelamento:
            payload_nft["politicaCancelamento"] = politica_cancelamento

        resultado_nft = nft(payload_nft)

        # 3) imagem (thumb/banner)
        resultado_img = imagem(dados.get("descricao") or "imagem do NFT de diárias")

        return {
            "sucesso": True,
            "consultor": resultado_consultor,
            "nft": resultado_nft,
            "imagem": resultado_img
        }
    except Exception as e:
        print("[ERRO] Falha na orquestração:", e)
        raise HTTPException(status_code=500, detail=f"Erro na orquestração: {str(e)}")

# === Rotas diretas mantidas ===================================
@router.post("/api/nft", tags=["NFT"])
async def executar_agente_nft(data: dict = Body(...)):
    try:
        resultado = nft(data)
        return {"sucesso": True, "resultado": resultado}
    except Exception as e:
        print("[ERRO] Execução do agente NFT-D falhou:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/consultor-mercado", tags=["Consultor"])
async def executar_consultor_mercado(data: dict = Body(...)):
    try:
        resultado = consultor_mercado(data)
        return {"sucesso": True, "resultado": resultado}
    except Exception as e:
        print("[ERRO] Execução do consultor_mercado falhou:", e)
        raise HTTPException(status_code=500, detail=str(e))
    

