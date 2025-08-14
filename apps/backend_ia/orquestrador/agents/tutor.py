# apps/backend_ia/orquestrador/agents/tutor.py
import gtts
from io import BytesIO

def executar(entrada: str):
    planos = {
        "start": [
            {"id": 1, "texto": "Bem-vindo ao plano Start! Vamos começar seu cadastro."},
            {"id": 2, "texto": "Cadastre sua propriedade com endereço e fotos."},
            {"id": 3, "texto": "Defina regras de hospedagem e finalize seu NFT."},
        ],
        "pro": [
            {"id": 1, "texto": "Você escolheu o plano Pro. Vamos registrar múltiplos imóveis."},
            {"id": 2, "texto": "Use IA para gerar descrições e regras automáticas."},
            {"id": 3, "texto": "Acompanhe relatórios na aba de NFTs emitidos."},
        ],
        "business": [
            {"id": 1, "texto": "Plano Business selecionado. Começando o fluxo da imobiliária."},
            {"id": 2, "texto": "Cadastre membros da equipe e acesse a API."},
            {"id": 3, "texto": "Participe da DAO e votações com acesso premium."},
        ]
    }

    if entrada.lower() in planos:
        return {
            "agente": "tutor",
            "status": "ativo",
            "mensagem": "Roteiro de onboarding retornado com sucesso.",
            "etapas": planos[entrada.lower()],
        }

    # Caso contrário, gerar áudio via gTTS
    try:
        tts = gtts.gTTS(text=entrada, lang='pt-br')
        audio_stream = BytesIO()
        tts.write_to_fp(audio_stream)
        audio_stream.seek(0)

        return {
            "agente": "tutor",
            "status": "ativo",
            "mensagem": "Áudio de tutoria gerado com sucesso.",
            "audio_stream": audio_stream,
            "transcricao": entrada
        }
    except Exception as e:
        print(f"[ERRO AGENTE TUTOR] {e}")
        return {
            "agente": "tutor",
            "status": "erro",
            "mensagem": f"Não foi possível gerar a tutoria por voz. Erro: {str(e)}"
        }
