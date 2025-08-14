# apps/backend_ia/orquestrador/agents/imagem.py
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import hashlib
import json

def _safe_list(v, default=None):
    if v is None:
        return default or []
    return v if isinstance(v, list) else [v]

# --------- SYSTEM PROMPT (resumo: compliance + MKT + J_360) ----------
SYSTEM_PROMPT = (
    "Você é o agente de imagens ImageNFTDiarias. Produza imagens para 3 usos: "
    "(1) Aprimorar fotos reais para marketplace; "
    "(2) Arte do NFT (3D/flat, variações); "
    "(3) Assets de frontend (banners, ícones, mockups). "
    "Aplique identidade visual e acessibilidade (WCAG AA). "
    "Inclua checklist de compliance (risco/flags/disclaimers/direitos) e alinhamento MKT "
    "(CTA/claims allowlist/keywords). Gere j360_event com dados de telemetria. "
    "Saída: artefatos + meta + compliance_report + mkt_alignment_report + j360_event."
)

# ------------------ Templates de prompt por modo ------------------

def _tpl_enhance(payload: Dict[str, Any]) -> str:
    imovel = payload.get("imovel", {})
    prefs = payload.get("preferencias", {}) or {}
    brand = payload.get("brand", {}) or {}
    overlays = payload.get("overlays")
    qr_url = payload.get("qr_url")
    comp = payload.get("compliance") or {}
    mkt = payload.get("mkt_context") or {}
    return f"""
[TAREFA]
Aprimorar foto para marketplace: {payload.get('imagem_url') or payload.get('imagem_base64','<sem imagem>')}

[CONTEÚDO]
Imóvel: {imovel.get('tipo','<tipo>')} em {imovel.get('localizacao','<local>')}
Amenidades: {", ".join(_safe_list(imovel.get('amenidades'), []))}
Extras: {", ".join(_safe_list(imovel.get('extras'), []))}
Persona/estilo: {prefs.get('persona','luxo')}
Identidade: primary={brand.get('primary','#5B8CFF')}, secondary={brand.get('secondary','#0B0D12')}

[SAÍDA VISUAL]
- Correção luz/contraste/cores; horizonte nivelado; realismo.
- Cortes: 1:1 (1080), 4:3 (1600x1200), 16:9 (1920x1080).
- Overlays: {overlays or 'nenhum'}; QR: {qr_url or 'n/a'}; contraste WCAG AA.

[JURÍDICO & COMPLIANCE]
Território: {comp.get('territory','BR')}
Direitos confirmados: {bool(comp.get('rights_confirmed', False))}
Marcas de terceiros: {comp.get('third_party_brands','bloquear/ocultar')}
Disclaimers: {comp.get('disclaimers') or ['Imagens meramente ilustrativas.','Sujeito a disponibilidade.']}
Checklist: risco (0–1), flags, disclaimers_aplicados, direitos_imagem_ok, necessita_revisao_humana.

[MKT & CTA]
CTA: {mkt.get('cta','Garanta sua diária NFT')}
Allowlist de claims: {mkt.get('claims_allowlist') or ['check-in digital','upgrade sujeito a disponibilidade']}
Keywords: {mkt.get('keywords') or []}
Validar violações.

[J_360 LOG]
Gerar j360_event (type 'image.generate', mode '{payload.get('modo','enhance')}', persona '{prefs.get('persona','luxo')}').

[ENTREGAS]
- market-1x1.jpg, market-4x3.jpg, market-16x9.jpg
- JSON: artefatos + meta (alt_text, prompt_usado) + compliance_report + mkt_alignment_report + j360_event
""".strip()

def _tpl_nft(payload: Dict[str, Any]) -> str:
    imovel = payload.get("imovel", {})
    estilo = payload.get("estilo", "3D/flat moderno")
    tema = payload.get("tema", "verão")
    web3 = payload.get("web3", "token/grade sutil")
    ref = payload.get("imagem_referencia") or "sem"
    prefs = payload.get("preferencias", {}) or {}
    comp = payload.get("compliance") or {}
    mkt = payload.get("mkt_context") or {}
    return f"""
[TAREFA]
Arte ilustrativa do NFT (estilo {estilo}) para {imovel.get('tipo','<tipo>')} em {imovel.get('localizacao','<local>')}.

[REFERÊNCIA]
Foto: {ref}

[TEMA]
Estação/tema: {tema}
Elementos Web3: {web3}
Persona: {prefs.get('persona','luxo')}

[JURÍDICO & COMPLIANCE]
Território: {comp.get('territory','BR')}
Sem uso de marcas de terceiros; sem pessoas identificáveis.
Disclaimers: {comp.get('disclaimers') or ['Imagens meramente ilustrativas.','Não constitui oferta de investimento.']}
Checklist completo.

[MKT & CTA]
CTA: {mkt.get('cta','Desbloqueie upgrade exclusivo')}
Allowlist: {mkt.get('claims_allowlist') or ['colecionável digital','acesso verificado on-chain']}
Keywords: {mkt.get('keywords') or []}

[J_360 LOG]
Gerar j360_event (image.generate, mode 'nft').

[SAÍDA]
- PNG com transparência (1200x1200) + hero (1600x1200)
- JSON: artefatos, meta, compliance_report, mkt_alignment_report, j360_event
""".strip()

def _tpl_frontend(payload: Dict[str, Any]) -> str:
    brand = payload.get("brand", {}) or {}
    comp = payload.get("compliance") or {}
    mkt = payload.get("mkt_context") or {}
    return f"""
[TAREFA]
Assets frontend: {payload.get('alvos','banner_hero, icones_menu, mockup_app')}.

[CONTEÚDO]
Mensagem: {payload.get('mensagem_chave','Reserve sua diária via NFT')}
Seções: {payload.get('secoes',['home','tutoriais','relatorios'])}
Identidade: primary={brand.get('primary','#5B8CFF')}, secondary={brand.get('secondary','#0B0D12')}, font={brand.get('font','Inter')}

[JURÍDICO & COMPLIANCE]
Evitar marcas de terceiros e dados pessoais; incluir disclaimers quando houver preço/condições.
Território: {comp.get('territory','BR')}
Checklist completo (risco/flags/direitos/disclaimers).

[MKT & CTA]
CTA: {mkt.get('cta','Reserve via NFT')}
Allowlist de claims: {mkt.get('claims_allowlist') or ['check-in digital']}
Keywords: {mkt.get('keywords') or []}

[J_360 LOG]
Gerar j360_event (image.generate, mode 'frontend').

[SAÍDA]
- Banner hero desktop (1920x820) e mobile (1080x1320), ícones SVG, mockup app
- JSON com artefatos, meta, compliance_report, mkt_alignment_report, j360_event
""".strip()

# ------------------ Compliance, MKT e J_360 helpers ------------------

def _hash_payload(obj: Any) -> str:
    try:
        s = json.dumps(obj, sort_keys=True, ensure_ascii=False)
    except Exception:
        s = str(obj)
    return hashlib.sha1(s.encode("utf-8")).hexdigest()[:12]

def _mk_compliance(payload: Dict[str, Any]) -> Dict[str, Any]:
    comp = payload.get("compliance") or {}
    terr = comp.get("territory", "BR")
    disclaimers = comp.get("disclaimers") or [
        "Imagens meramente ilustrativas.",
        "Sujeito a disponibilidade."
    ]
    rights_confirmed = bool(comp.get("rights_confirmed", False))
    third_party_brands = comp.get("third_party_brands", "bloquear/ocultar")

    flags = []
    if not rights_confirmed:
        flags.append("rights_not_confirmed")
    if third_party_brands != "permitido":
        flags.append("third_party_brand_risk")

    risk = 0.2 + (0.4 if "rights_not_confirmed" in flags else 0) + (0.2 if "third_party_brand_risk" in flags else 0)
    risk = min(1.0, risk)

    return {
        "territory": terr,
        "risk_score": round(risk, 2),
        "flags": flags,
        "disclaimers_aplicados": disclaimers,
        "direitos_imagem_ok": rights_confirmed,
        "necessita_revisao_humana": risk >= 0.6
    }

def _mk_mkt_alignment(payload: Dict[str, Any]) -> Dict[str, Any]:
    ctx = payload.get("mkt_context") or {}
    cta = ctx.get("cta", "Garanta sua diária NFT")
    allow = set((ctx.get("claims_allowlist") or ["check-in digital","upgrade sujeito a disponibilidade"]))
    used_claims = set(ctx.get("claims_used") or [])
    violations = [c for c in used_claims if c not in allow]
    return {
        "cta_usada": cta,
        "claims_validadas": sorted(list(used_claims & allow)),
        "violacoes": violations,
        "keywords": ctx.get("keywords") or []
    }

# ------------------ Orquestração principal ------------------

def executar(entrada: Any = None):
    """
    Modos:
      - string -> resposta simples (backcompat)
      - dict -> payload estruturado:
          { modo: "enhance"|"nft"|"frontend",
            ...campos..., compliance, mkt_context, only_prompt }
    """
    # Backcompat: entrada simples
    if isinstance(entrada, str) or not isinstance(entrada, dict):
        print(f"[AGENTE IMAGEM] Entrada recebida: {entrada}")
        return {
            "agente": "imagem",
            "status": "ativo",
            "mensagem": "Imagem da propriedade gerada via IA (modo simples).",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    modo = (entrada.get("modo") or "enhance").lower()
    only_prompt = bool(entrada.get("only_prompt"))
    payload = entrada

    # Prompts por modo
    if modo == "enhance":
        user_prompt = _tpl_enhance(payload)
    elif modo == "nft":
        user_prompt = _tpl_nft(payload)
    else:
        user_prompt = _tpl_frontend(payload)

    # Relatórios transversais
    compliance_report = _mk_compliance(payload)
    mkt_alignment_report = _mk_mkt_alignment(payload)
    j360_event = {
        "type": "image.generate",
        "agent": "imagem",
        "mode": modo,
        "persona": (payload.get("preferencias") or {}).get("persona", "luxo"),
        "risk_score": compliance_report["risk_score"],
        "flags": compliance_report["flags"],
        "payload_hash": _hash_payload(payload)
    }

    if only_prompt:
        return {
            "agente": "imagem",
            "status": "ok",
            "mensagem": "Prompts gerados (somente prompt).",
            "prompts": {"system": SYSTEM_PROMPT, "user": user_prompt},
            "compliance_report": compliance_report,
            "mkt_alignment_report": mkt_alignment_report,
            "j360_event": j360_event,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    # Manifesto simulado (plugue seu gerador real depois)
    if modo == "enhance":
        artefatos = [
            {"role":"marketplace","name":"market-1x1.jpg","format":"jpg","width":1080,"height":1080,"path_or_url":"data/exports/market-1x1.jpg"},
            {"role":"marketplace","name":"market-4x3.jpg","format":"jpg","width":1600,"height":1200,"path_or_url":"data/exports/market-4x3.jpg"},
            {"role":"marketplace","name":"market-16x9.jpg","format":"jpg","width":1920,"height":1080,"path_or_url":"data/exports/market-16x9.jpg"},
        ]
    elif modo == "nft":
        artefatos = [
            {"role":"nft","name":"nft-square.png","format":"png","width":1200,"height":1200,"path_or_url":"data/exports/nft-square.png"},
            {"role":"nft","name":"nft-hero.png","format":"png","width":1600,"height":1200,"path_or_url":"data/exports/nft-hero.png"},
        ]
    else:
        artefatos = [
            {"role":"banner_desktop","name":"hero-1920x820.jpg","format":"jpg","width":1920,"height":820,"path_or_url":"data/exports/hero-1920x820.jpg"},
            {"role":"banner_mobile","name":"hero-1080x1320.jpg","format":"jpg","width":1080,"height":1320,"path_or_url":"data/exports/hero-1080x1320.jpg"},
            {"role":"icon_svg","name":"icon-emitir-nft.svg","format":"svg","width":128,"height":128,"path_or_url":"data/exports/icon-emitir-nft.svg"},
        ]

    return {
        "agente": "imagem",
        "status": "ativo",
        "mensagem": f"Manifesto de imagens gerado (modo {modo}). Integre ao serviço de geração para criar arquivos reais.",
        "conteudo": {
            "prompts": {"system": SYSTEM_PROMPT, "user": user_prompt},
            "artefatos": artefatos,
            "meta": {
                "alt_text": payload.get("alt_text") or "Imagem otimizada para NFTDiarias",
                "brand": payload.get("brand") or {"primary":"#5B8CFF","secondary":"#0B0D12"},
                "notes": ["wcag-aa"]
            },
            "compliance_report": compliance_report,
            "mkt_alignment_report": mkt_alignment_report,
            "j360_event": j360_event
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
