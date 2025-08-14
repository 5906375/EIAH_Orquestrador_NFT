from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Dict
from orquestrador.agents.mkt import executar

router = APIRouter()

class MktIn(BaseModel):
    payload: Dict[str, Any]

@router.post("/mkt/preview")
def mkt_preview(inp: MktIn):
    """
    Recebe um payload estruturado (imovel, contexto_mercado, preferencias, promocao, only_json)
    e encaminha ao agente MKT. Retorna o resultado do agente (json final quando only_json=True).
    """
    return executar(inp.payload)
