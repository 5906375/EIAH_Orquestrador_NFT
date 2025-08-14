# apps/backend_ia/orquestrador/utils/paths.py
import os
from pathlib import Path

# base do projeto = .../backend_ia
BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))

RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
EXPORTS_DIR = DATA_DIR / "exports"

for d in (RAW_DIR, PROCESSED_DIR, EXPORTS_DIR):
    d.mkdir(parents=True, exist_ok=True)
