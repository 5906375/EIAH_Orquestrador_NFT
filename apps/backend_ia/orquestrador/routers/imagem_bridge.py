# apps/backend_ia/orquestrador/routers/imagem_bridge.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Dict
from orquestrador.agents.imagem import executar

router = APIRouter()

class ImgIn(BaseModel):
    payload: Dict[str, Any]

@router.post("/imagem/preview")
def imagem_preview(inp: ImgIn):
    """Encaminha o payload ao agente de imagens (suporta only_prompt)."""
    return executar(inp.payload)
