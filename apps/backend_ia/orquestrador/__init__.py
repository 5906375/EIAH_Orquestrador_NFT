# apps/backend_ia/orquestrador/agents/__init__.py

# Corrige os caminhos de importação para referenciar os módulos no mesmo diretório
from .agents.contrato import executar as contrato
from .agents.tutor import executar as tutor
from .agents.mkt import executar as mkt
from .agents.imagem import executar as imagem
from .agents.nft import executar as nft