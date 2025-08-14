import React from "react";

type Tab = "plano" | "payload" | "curl";

const payloadWeb3 = {
    payload: {
        imovel: {
            tipo: "Coleção NFT de Diárias",
            localizacao: "Online / Multidestinos",
            amenidades: [
                "Check-in digital on-chain",
                "Transferência de titularidade",
                "Upgrade sujeito a disponibilidade",
            ],
            extras: [
                "Acesso a experiências selecionadas",
                "NFT de upgrade (quando aplicável)",
            ],
        },
        contexto_mercado: {
            cidade: "Online",
            periodo: "2025-11-19 a 2025-11-20",
            demanda: "média",
            eventos: ["Digital Travel Europe 2025"],
            clima: "—",
            preco_medio_competidores: 0,
        },
        preferencias: {
            idioma: "pt",
            persona: "investidor",
            canais_alvo: ["instagram", "linkedin", "google_ads"],
            seo: {
                keywords_primarias: ["NFT diárias", "hospedagem web3", "reserva via NFT"],
                keywords_secundarias: [
                    "Digital Travel Europe",
                    "Google AI Overview",
                    "agentes de IA no turismo",
                ],
            },
            cta: "Minte sua diária NFT",
            ab_variants: 2,
            utm_base:
                "utm_source=social&utm_medium=organic&utm_campaign=web3_engajamento",
        },
        promocao: {
            ativa: true,
            detalhes:
                "Whitelist aberta até 20/11; disponibilidade limitada; upgrade sujeito a elegibilidade.",
        },
        only_json: true,
    },
};

const curlWeb3 = [
    "curl -s -X POST http://localhost:8000/mkt/preview \\",
    '  -H "Content-Type: application/json" \\',
    "  --data-binary @payload_mkt_web3.json | python -m json.tool",
].join("\n");

function StatBox({ label, value }: { label: string; value?: string | number }) {
    return (
        <div className="rounded-xl border border-zinc-200/60 bg-white p-4">
            <p className="text-sm text-zinc-500">{label}</p>
            <div className="mt-2 h-5 w-16 rounded bg-zinc-200/70" title="placeholder">
                {/* plugue números reais quando tiver J_360 */}
            </div>
        </div>
    );
}

export default function SocialCampaignWeb3() {
    const [tab, setTab] = React.useState<Tab>("plano");

    const handleVoltar = () => window.history.back();
    const handleAlterar = () => console.log("Alterar campanha (web3-engajamento)");
    const handleExcluir = () => console.log("Excluir campanha (web3-engajamento)");
    const handleVisualizar = () => console.log("Visualizar dados (J_360, etc.)");
    const handleGerenciar = () => console.log("Gerenciar Campanha (workflow)");

    return (
        <section className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <div className="mb-3">
                <h2 className="text-lg font-semibold text-zinc-900">Campanha (Social) — Engajamento Web3</h2>
                <p className="mt-1 text-sm text-zinc-600">
                    Consulte e altere o status da campanha (calendário, responsáveis e publicações).
                </p>
            </div>

            {/* Barra de ações (mantém o layout da tua página) */}
            <div className="mb-5 flex flex-wrap items-center gap-4">
                <button onClick={handleVoltar} className="text-sm font-semibold text-zinc-700">
                    Voltar
                </button>
                <button
                    onClick={handleAlterar}
                    className="text-sm font-semibold text-zinc-700"
                >
                    Alterar
                </button>
                <button
                    onClick={handleExcluir}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                >
                    Excluir
                </button>
                <button
                    onClick={handleVisualizar}
                    className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
                >
                    Visualizar dados
                </button>
                <div className="grow" />
                <button
                    onClick={handleGerenciar}
                    className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white"
                >
                    Gerenciar Campanha
                </button>
            </div>

            {/* Métricas (placeholders no mesmo estilo) */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                <StatBox label="Total" />
                <StatBox label="Planejado" />
                <StatBox label="Em produção" />
                <StatBox label="Aprovado" />
                <StatBox label="Publicado" />
            </div>

            {/* Abas: Plano | Payload | cURL */}
            <div className="mb-3 flex flex-wrap gap-2">
                <button
                    onClick={() => setTab("plano")}
                    className={`rounded-full px-3 py-1 text-sm ${tab === "plano"
                            ? "bg-indigo-600 text-white"
                            : "border border-zinc-300 text-zinc-700"
                        }`}
                >
                    Plano
                </button>
                <button
                    onClick={() => setTab("payload")}
                    className={`rounded-full px-3 py-1 text-sm ${tab === "payload"
                            ? "bg-indigo-600 text-white"
                            : "border border-zinc-300 text-zinc-700"
                        }`}
                >
                    Payload (MKT avançado)
                </button>
                <button
                    onClick={() => setTab("curl")}
                    className={`rounded-full px-3 py-1 text-sm ${tab === "curl"
                            ? "bg-indigo-600 text-white"
                            : "border border-zinc-300 text-zinc-700"
                        }`}
                >
                    Disparar agora (cURL)
                </button>
            </div>

            <div className="rounded-xl border border-zinc-200/70">
                {tab === "plano" && (
                    <div className="space-y-4 p-4">
                        <div>
                            <p className="text-xs font-semibold uppercase text-zinc-500">
                                Objetivo
                            </p>
                            <p className="text-sm text-zinc-800">
                                Gerar tração e comunidade para a coleção NFTDiárias (awareness → whitelist → mint/reservas).
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <p className="text-xs font-semibold uppercase text-zinc-500">
                                    Proposta de valor
                                </p>
                                <ul className="mt-1 list-disc pl-5 text-sm text-zinc-800">
                                    <li>Utilidade real: estadia/hospedagem representada em NFT</li>
                                    <li>Check-in digital on-chain (menos atrito)</li>
                                    <li>Transferibilidade + perks/upgrade sujeito a disponibilidade</li>
                                </ul>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-zinc-500">
                                    Ganchos
                                </p>
                                <ul className="mt-1 list-disc pl-5 text-sm text-zinc-800">
                                    <li>Hospedagem com utilidade on-chain</li>
                                    <li>Colecionável digital que desbloqueia experiência real</li>
                                    <li>Check-in com NFT (sem burocracia)</li>
                                </ul>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-zinc-500">
                                    Canais
                                </p>
                                <ul className="mt-1 list-disc pl-5 text-sm text-zinc-800">
                                    <li>
                                        <b>Instagram</b>: carrossel curto + CTA “Minte sua diária NFT”
                                    </li>
                                    <li>
                                        <b>LinkedIn</b>: credenciais/parceiros/compliance
                                    </li>
                                    <li>
                                        <b>Google Ads</b>: RSA “check-in digital”, “reserva via NFT”
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="md:col-span-2">
                                <p className="text-xs font-semibold uppercase text-zinc-500">
                                    Calendário (2 semanas)
                                </p>
                                <div className="mt-1 grid gap-3 md:grid-cols-2">
                                    <div className="rounded-lg border border-zinc-200 p-3">
                                        <p className="text-xs font-semibold text-zinc-600">Semana 1</p>
                                        <ul className="mt-1 list-disc pl-5 text-sm text-zinc-800">
                                            <li>Teaser utilidade on-chain</li>
                                            <li>Explicador “como funciona”</li>
                                            <li>Call de whitelist</li>
                                        </ul>
                                    </div>
                                    <div className="rounded-lg border border-zinc-200 p-3">
                                        <p className="text-xs font-semibold text-zinc-600">Semana 2</p>
                                        <ul className="mt-1 list-disc pl-5 text-sm text-zinc-800">
                                            <li>Cases/benefícios (vídeo curto)</li>
                                            <li>Urgência: slots limitados / evento DTE 2025</li>
                                            <li>Prova social segura</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-zinc-500">KPIs</p>
                                <ul className="mt-1 list-disc pl-5 text-sm text-zinc-800">
                                    <li>CTR por canal</li>
                                    <li>% whitelist → mint</li>
                                    <li>Custo por lead</li>
                                    <li>Engajamento (saves/compartilhamentos)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "payload" && (
                    <div className="space-y-3 p-4">
                        <p className="text-xs font-semibold uppercase text-zinc-500">
                            Payload JSON (para /mkt/preview — only_json)
                        </p>
                        <pre className="max-h-[420px] overflow-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-800">
                            {JSON.stringify(payloadWeb3, null, 2)}
                        </pre>
                        <div className="flex gap-2">
                            <button
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        JSON.stringify(payloadWeb3, null, 2)
                                    )
                                }
                                className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                            >
                                Copiar JSON
                            </button>
                            <a
                                href="data:application/json;charset=utf-8,{{JSON}}"
                                onClick={(e) => {
                                    const a = e.currentTarget as HTMLAnchorElement;
                                    a.href =
                                        "data:application/json;charset=utf-8," +
                                        encodeURIComponent(JSON.stringify(payloadWeb3, null, 2));
                                    a.download = "payload_mkt_web3.json";
                                }}
                                className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                            >
                                Baixar JSON
                            </a>
                        </div>
                    </div>
                )}

                {tab === "curl" && (
                    <div className="space-y-3 p-4">
                        <p className="text-xs font-semibold uppercase text-zinc-500">
                            Disparar agora (cURL)
                        </p>
                        <pre className="overflow-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-800">
                            {curlWeb3}
                        </pre>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigator.clipboard.writeText(curlWeb3)}
                                className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                            >
                                Copiar cURL
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
