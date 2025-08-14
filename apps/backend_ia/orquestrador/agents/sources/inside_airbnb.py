import io, zipfile, urllib.request, os, hashlib, time
import pandas as pd
from datetime import datetime
from typing import Dict, Any, List, Optional

# === Config ===
CACHE_DIR = os.path.join(os.path.expanduser("~"), ".eiah_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

# Cole os links exatos de "listings.csv(.gz)" daqui: https://insideairbnb.com/get-the-data/
CITY_DATASETS = {
    "Florianopolis": "PUT_THE_REAL_URL_HERE_for_florianopolis_listings_csv_or_gz",
    # Se não houver BC, use None (retorna métricas None) ou reaproveite Floripa como proxy:
    "Balneario Camboriu": None,  # ou o mesmo link de Floripa, se quiser proxy
}

def _cache_path(url: str) -> str:
    h = hashlib.sha256(url.encode("utf-8")).hexdigest()[:16]
    ext = ".csv.gz" if url.endswith(".gz") else ".csv"
    return os.path.join(CACHE_DIR, f"inside_{h}{ext}")

def _download_or_cache_csv(url: str, max_age_sec: int = 86400) -> pd.DataFrame:
    path = _cache_path(url)
    if os.path.exists(path) and (time.time() - os.path.getmtime(path) < max_age_sec):
        return pd.read_csv(path, compression="gzip" if path.endswith(".gz") else None, low_memory=False)

    with urllib.request.urlopen(url) as resp:
        raw = resp.read()

    if url.endswith(".gz"):
        open(path, "wb").write(raw)
        return pd.read_csv(path, compression="gzip", low_memory=False)

    if url.endswith(".zip"):
        zf = zipfile.ZipFile(io.BytesIO(raw))
        name = next((n for n in zf.namelist() if n.lower().endswith(".csv")), None)
        if not name:
            raise RuntimeError("ZIP sem CSV.")
        with zf.open(name) as f:
            df = pd.read_csv(f, low_memory=False)
        df.to_csv(path, index=False)
        return df

    # CSV puro
    open(path, "wb").write(raw)
    return pd.read_csv(path, low_memory=False)

def _normalize_price(series: pd.Series) -> pd.Series:
    s = series.astype(str).str.replace(r"[^\d,\.]", "", regex=True)
    s = s.str.replace(".", "", regex=False).str.replace(",", ".", regex=False)
    return pd.to_numeric(s, errors="coerce")

def _compute_seasonality(df: pd.DataFrame) -> List[str]:
    if "last_review" not in df.columns: return []
    dt = pd.to_datetime(df["last_review"], errors="coerce")
    dt = dt.dropna()
    if dt.empty: return []
    counts = dt.dt.month.value_counts().sort_values(ascending=False)
    nomes = {1:"jan",2:"fev",3:"mar",4:"abr",5:"mai",6:"jun",7:"jul",8:"ago",9:"set",10:"out",11:"nov",12:"dez"}
    return [nomes.get(m, str(m)) for m in counts.index[:3]]

def _compute_room_types(df: pd.DataFrame) -> List[str]:
    for c in ["room_type", "property_type", "room_type_category"]:
        if c in df.columns:
            vc = df[c].astype(str).value_counts().head(3)
            return vc.index.tolist()
    return []

def compute_metrics_for_city(city: str, url: Optional[str]) -> Dict[str, Any]:
    if not url:
        return {
            "cidade": city, "ticket_medio": None, "ocupacao_media": None,
            "sazonalidade": [], "tipos_imovel": [], "duracao_media": None,
            "fonte": "InsideAirbnb (indisponível p/ cidade)"
        }
    try:
        df = _download_or_cache_csv(url)

        # Ticket médio
        price_col = next((c for c in ["price","median_price","avg_price"] if c in df.columns), None)
        ticket_medio = None
        if price_col:
            prices = _normalize_price(df[price_col])
            if prices.notna().any():
                ticket_medio = float(prices.mean())

        # Ocupação (aprox) via availability_365
        ocupacao_media = None
        if "availability_365" in df.columns:
            avail = pd.to_numeric(df["availability_365"], errors="coerce").dropna()
            if not avail.empty:
                ocupacao_media = float(1.0 - (avail.mean()/365.0))

        sazonalidade = _compute_seasonality(df)
        tipos = _compute_room_types(df)

        duracao_media = None
        if "minimum_nights" in df.columns:
            mn = pd.to_numeric(df["minimum_nights"], errors="coerce").dropna()
            if not mn.empty:
                duracao_media = float(mn.mean())

        return {
            "cidade": city,
            "ticket_medio": round(ticket_medio, 2) if ticket_medio is not None else None,
            "ocupacao_media": round(ocupacao_media, 4) if ocupacao_media is not None else None,
            "sazonalidade": sazonalidade,
            "tipos_imovel": tipos,
            "duracao_media": round(duracao_media, 2) if duracao_media is not None else None,
            "fonte": "InsideAirbnb"
        }
    except Exception as e:
        return {
            "cidade": city, "erro": str(e),
            "ticket_medio": None, "ocupacao_media": None,
            "sazonalidade": [], "tipos_imovel": [], "duracao_media": None,
            "fonte": "InsideAirbnb (falha de leitura)"
        }

def get_city_metrics(cities: List[str]) -> Dict[str, Any]:
    out = {}
    for c in cities:
        url = CITY_DATASETS.get(c)
        out[c] = compute_metrics_for_city(c, url)
    return out
