# apps/backend_ia/orquestrador/agents/mkt.py
from datetime import datetime, timezone
from typing import Any, Dict, List

def _safe_list(v, default=None):
    if v is None:
        return default or []
    return v if isinstance(v, list) else [v]

def _limita_palavras(texto: str, max_palavras: int) -> str:
    palavras = texto.split()
    return " ".join(palavras[:max_palavras])

def _mk_titulo(imovel: Dict[str, Any], preferencias: Dict[str, Any]) -> str:
    base = imovel.get("tipo") or "Estadia exclusiva"
    loc = imovel.get("localizacao")
    persona = (preferencias.get("persona") or "").lower()
    if loc:
        base = f"{base} em {loc}"
    if persona == "luxo":
        base = f"Experiência {base}"
    return _limita_palavras(base, 10)

def _mk_hashtags(imovel: Dict[str, Any], cidade: str = None, persona: str = "") -> List[str]:
    tags = {
        "luxo": ["#viagemdeluxo", "#hospedagempremium"],
        "investidor": ["#nft", "#tokenizacao", "#web3"],
        "familia": ["#viagememfamilia", "#hospedagemsegura"],
        "executivo": ["#workcation", "#viagemdenegocios"],
        "internacional": ["#travel", "#vacation"],
        "": ["#turismo", "#hospedagem", "#experiencias"]
    }
    base = tags.get(persona, []) + tags[""]
    if cidade:
        base.append(f"#{cidade.lower().replace(' ', '')}")
    # remove duplicados mantendo ordem
    seen, out = set(), []
    for t in base:
        if t not in seen:
            seen.add(t); out.append(t)
    return out[:10]

def _mk_tags_mercado(imovel: Dict[str, Any]) -> List[str]:
    out = ["NFT", "Turismo", "Hospedagem", "Blockchain"]
    tipo = imovel.get("tipo")
    if tipo: out.append(tipo)
    for a in (imovel.get("amenidades") or []):
        if isinstance(a, str) and len(out) < 10:
            out.append(a)
    return out[:10]

def _mk_meta_description(descricao: str) -> str:
    s = descricao.replace("\n", " ").strip()
    if len(s) <= 160:
        return s
    return s[:157].rstrip() + "..."

def _mk_descr_long(imovel: Dict[str, Any],
                   contexto: Dict[str, Any],
                   preferencias: Dict[str, Any],
                   promocao: Dict[str, Any],
                   cta_padrao: str) -> str:
    tipo = imovel.get("tipo", "hospedagem exclusiva")
    loc = imovel.get("localizacao", "")
    amen = ", ".join(imovel.get("amenidades") or [])
    extras = ", ".join(imovel.get("extras") or [])
    cidade = contexto.get("cidade") or (loc if isinstance(loc, str) else "")
    periodo = contexto.get("periodo")
    demanda = contexto.get("demanda")
    eventos = ", ".join(contexto.get("eventos") or [])
    clima = contexto.get("clima")
    comp = contexto.get("preco_medio_competidores")
    idioma = (preferencias.get("idioma") or "pt").lower()
    cta = preferencias.get("cta") or cta_padrao

    blocos = []
    # Abertura com storytelling + SEO
    abertura = f"Descubra uma experiência {tipo} em {cidade}" if cidade else f"Descubra uma experiência {tipo}"
    if idioma.startswith("pt"):
        blocos.append(f"{abertura} — onde exclusividade encontra tecnologia Web3. "
                      f"Com NFTs de diárias, você garante acesso verificado on-chain, facilidade de transferência e possibilidade de vantagens exclusivas.")
    elif idioma.startswith("en"):
        blocos.append(f"{abertura} — where exclusivity meets Web3. NFT-stays provide on-chain verified access, easy transfers, and exclusive perks.")
    else:  # es
        blocos.append(f"{abertura} — donde la exclusividad se une al Web3. Las estancias NFT aseguran acceso verificado on-chain, transferencias fáciles y beneficios exclusivos.")

    # Contexto de mercado (opcional)
    contexto_txt = []
    if periodo: contexto_txt.append(f"Período: {periodo}")
    if isinstance(demanda, str): contexto_txt.append(f"Demanda prevista: {demanda}")
    if isinstance(demanda, (int, float)): contexto_txt.append(f"Índice de demanda: {demanda:.2f}")
    if eventos: contexto_txt.append(f"Eventos: {eventos}")
    if clima: contexto_txt.append(f"Clima previsto: {clima}")
    if comp: contexto_txt.append(f"Preço médio dos concorrentes: R$ {comp}")
    if contexto_txt:
        blocos.append(" | ".join(contexto_txt))

    # Amenidades e extras
    if amen:
        blocos.append(f"Amenidades: {amen}.")
    if extras:
        blocos.append(f"Extras do pacote: {extras}.")

    # Compliance leve (sem prometer retorno)
    blocos.append("Transparência e confiança: contratos e registros on-chain, com regras claras de uso e cancelamento.")

    # CTA + condições da promoção
    if promocao.get("ativa"):
        detalhes = promocao.get("detalhes") or "Condições especiais por tempo limitado."
        blocos.append(f"{cta}. {detalhes}")
    else:
        blocos.append(f"{cta}.")

    texto = "\n\n".join(blocos)
    # Garantir >= 100 palavras (fallback simples)
    if len(texto.split()) < 100:
        complemento = (" Reserve com segurança, simplifique o check-in com QR on-chain e desfrute de uma jornada sem atritos. "
                       "NFTs de diárias permitem flexibilidade de transferência (quando permitido), benefícios de upgrade e acesso a experiências selecionadas. "
                       "Nossa curadoria prioriza conforto, localização estratégica e conveniência digital para tornar sua estadia memorável. ")
        while len((texto + complemento).split()) < 100:
            complemento += "Vagas limitadas para as melhores datas. "
        texto += complemento
    return texto.strip()

def _mk_variacoes_por_canal(titulo: str, hashtags: List[str], preferencias: Dict[str, Any], cta: str, descricao: str) -> Dict[str, Any]:
    canais = set(_safe_list(preferencias.get("canais_alvo"), []))
    out = {}
    if "instagram" in canais:
        primeira_linha = f"{titulo}. {cta}"
        out["instagram"] = {"post": f"{primeira_linha[:150]} {' '.join(hashtags[:8])}"}
    if "linkedin" in canais:
        corpo = descricao
        out["linkedin"] = {"post": corpo[:1500]}  # ~220 palavras dá por volta disso
    if "google_ads" in canais:
        headlines = [
            _limita_palavras(titulo, 5),
            "Reserva NFT Verificada",
            "Upgrade Exclusivo",
            "Check-in Digital",
            "Experiência Web3",
            "Hospedagem Premium",
        ][:8]
        descriptions = [
            "Garanta sua diária NFT com check-in digital e vantagens exclusivas.",
            "Condições por tempo limitado. Reserve agora e desbloqueie upgrades."
        ][:2]
        out["google_ads"] = {"headlines": headlines, "descriptions": descriptions}
    return out

def executar(entrada):
    """
    Modos de uso:
      - string -> mantém comportamento atual (headline+corpo simples)
      - dict simples -> idem
      - dict avançado com:
          imovel {tipo, localizacao, amenidades[], extras[]}
          contexto_mercado {cidade, periodo, demanda, eventos[], clima, preco_medio_competidores}
          preferencias {idioma, persona, seo{keywords_primarias[], keywords_secundarias[]}, canais_alvo[], ab_variants, cta}
          promocao {ativa: bool, detalhes: str}
        -> gera JSON no formato novo e inclui em conteudo["mkt_json"].
      - only_json: true -> retorna APENAS o JSON exigido pelo prompt.
    """
    # Backcompat (mantém teu comportamento atual)
    if isinstance(entrada, str):
        entrada = {"brief": entrada}

    brief = entrada.get("brief") or entrada.get("texto") or "copy padrão"
    publico = entrada.get("publico", "geral")
    tom = entrada.get("tom", "informativo")
    idioma = entrada.get("idioma", "pt-BR")
    cta_padrao = entrada.get("cta", "Garanta sua diária NFT")
    only_json = bool(entrada.get("only_json", False))

    # Se não houver imovel/contexto/preferencias, segue o modo antigo:
    imovel = entrada.get("imovel")
    contexto = entrada.get("contexto_mercado") or {}
    preferencias = entrada.get("preferencias") or {}
    promocao = entrada.get("promocao") or {}

    if not imovel:
        headline = "Transforme suas diárias com NFTs e check-in digital."
        if tom == "convincente":
            headline = "Lotação alta com menos atrito: emita NFTs de diárias."
        texto = (
            f"{headline}\n\n"
            f"{brief.strip().capitalize()}.\n"
            f"Público: {publico}. Idioma: {idioma}. \n"
            f"Chamada: {cta_padrao}."
        )
        resp = {
            "agente": "mkt",
            "status": "ativo",
            "mensagem": "Peça gerada (modo simples).",
            "conteudo": {
                "headline": headline,
                "corpo": texto,
                "publico": publico,
                "tom": tom,
                "idioma": idioma,
                "cta": cta_padrao
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        return resp if not only_json else {
            "titulo_nft": _limita_palavras(headline, 10),
            "descricao_longa": texto,
            "hashtags_social": ["#nft", "#hospedagem", "#turismo"],
            "tags_mercado": ["NFT", "Hospedagem", "Turismo"]
        }

    # ====== MODO NOVO (com brief estruturado) ======
    persona = (preferencias.get("persona") or "").lower()
    cidade = contexto.get("cidade") or (imovel.get("localizacao") if isinstance(imovel.get("localizacao"), str) else None)
    titulo = _mk_titulo(imovel, preferencias)
    descricao = _mk_descr_long(imovel, contexto, preferencias, promocao, cta_padrao)
    hashtags = _mk_hashtags(imovel, cidade=cidade, persona=persona)
    tags_mercado = _mk_tags_mercado(imovel)

    seo = {
        "keywords_primarias": _safe_list(preferencias.get("seo", {}).get("keywords_primarias"), []),
        "keywords_secundarias": _safe_list(preferencias.get("seo", {}).get("keywords_secundarias"), []),
        "meta_description": _mk_meta_description(descricao)
    }

    variacoes = _mk_variacoes_por_canal(titulo, hashtags, preferencias, preferencias.get("cta", cta_padrao), descricao)

    mkt_json = {
        "titulo_nft": titulo,
        "descricao_longa": descricao,
        "hashtags_social": hashtags,
        "tags_mercado": tags_mercado,
        "seo": seo if any(seo.values()) else None,
        "variacoes_por_canal": variacoes or None,
        "utm": preferencias.get("utm_base") or None
    }
    # limpa None
    mkt_json = {k: v for k, v in mkt_json.items() if v is not None}

    if only_json:
        return mkt_json

    return {
        "agente": "mkt",
        "status": "ativo",
        "mensagem": "Peça gerada com sucesso (modo avançado).",
        "conteudo": {
            "publico": publico,
            "tom": tom,
            "idioma": preferencias.get("idioma", idioma),
            "cta": preferencias.get("cta", cta_padrao),
            "brief": brief,
            "mkt_json": mkt_json
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
