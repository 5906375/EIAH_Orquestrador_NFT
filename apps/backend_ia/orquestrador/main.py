# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from orquestrador.routes import router as api_router
from orquestrador.routers import mkt_bridge
from orquestrador.routers import imagem_bridge  

app = FastAPI(
    title="EIAH Orquestrador de Agentes NFTDiárias",
    description="API para orquestrar agentes IA como contrato, tutor, imagem, mkt, nft",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas antigas
app.include_router(api_router)

# 🔗 ADICIONE ESTA LINHA para registrar /mkt/preview
app.include_router(mkt_bridge.router, tags=["mkt"])
app.include_router(imagem_bridge.router, tags=["Image"])

@app.get("/")
def home():
    return {"mensagem": "Orquestrador EIAH ativo."}
