# apps/backend_ia/orquestrador/routers/campanha.py
from fastapi import APIRouter, HTTPException
from typing import Literal, List, Dict, Any
from pathlib import Path
import json

Status = Literal["Planejado", "Em produção", "Aprovado", "Publicado"]

router = APIRouter(prefix="/api/campanha", tags=["campanha"])

BASE_DIR = Path.cwd()                   # diretório onde você roda o uvicorn
DATA_DIR = BASE_DIR / "data"
FILE = DATA_DIR / "campanha.json"

def _ensure_store():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not FILE.exists():
        FILE.write_text("[]", encoding="utf-8")

def _read_all() -> List[Dict[str, Any]]:
    _ensure_store()
    raw = FILE.read_text(encoding="utf-8") or "[]"
    return json.loads(raw)

def _write_all(items: List[Dict[str, Any]]):
    _ensure_store()
    FILE.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")

@router.get("", response_model=List[Dict[str, Any]])
def listagem():
    """Retorna a lista completa no formato esperado pelo frontend (mantém 'Responsável' com acento)."""
    return _read_all()

@router.get("/stats")
def stats():
    items = _read_all()
    return {
        "total": len(items),
        "planejado": sum(1 for i in items if i.get("Status") == "Planejado"),
        "emProducao": sum(1 for i in items if i.get("Status") == "Em produção"),
        "aprovado": sum(1 for i in items if i.get("Status") == "Aprovado"),
        "publicado": sum(1 for i in items if i.get("Status") == "Publicado"),
    }

@router.put("/{id}")
def update_status(id: str, body: Dict[str, Any]):
    """
    Atualiza apenas o campo Status de um item.
    Body: { "Status": "Planejado|Em produção|Aprovado|Publicado" }
    """
    status = body.get("Status")
    if status not in ("Planejado", "Em produção", "Aprovado", "Publicado"):
        raise HTTPException(status_code=422, detail="Status inválido")

    items = _read_all()
    for it in items:
        if str(it.get("id")) == str(id):
            it["Status"] = status
            _write_all(items)
            return {"success": True}

    raise HTTPException(status_code=404, detail="Item não encontrado")
