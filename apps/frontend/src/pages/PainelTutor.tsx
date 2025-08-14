// apps/frontend/src/pages/PainelTutor.tsx
//🔗 Quando usar PainelTutor.tsx?
// ✅ Durante testes do fluxo de onboarding guiado por voz
// ✅ Quando quiser validar o comportamento do tutor antes de integrá - lo ao NFTDiárias
// ✅ Ao mostrar ao usuário o funcionamento guiado passo a passo

// apps/frontend/src/pages/PainelTutor.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import TutorOnboarding from "@/components/TutorOnboarding";

type Etapa = {
    id: number;
    texto: string;
};

export default function PainelTutor() {
    const [planoSelecionado, setPlanoSelecionado] = useState<string | null>(null);
    const [etapas, setEtapas] = useState<Etapa[]>([]);

    const buscarEtapas = async (plano: string) => {
        try {
            const response = await fetch(`http://localhost:8000/executar/tutor?plano=${plano}`);
            const data = await response.json();
            if (data.resultado?.etapas) {
                setEtapas(data.resultado.etapas);
            }
        } catch (error) {
            console.error("Erro ao buscar etapas do tutor:", error);
        }
    };

    useEffect(() => {
        if (planoSelecionado) {
            buscarEtapas(planoSelecionado);
        }
    }, [planoSelecionado]);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between mb-4">
                    <h1 className="text-2xl font-bold">Painel do Tutor IA</h1>
                    <Button onClick={() => window.open("/menu-agentes.html", "_blank")}>
                        Voltar ao Menu de Agentes
                    </Button>
                </div>

                {!planoSelecionado && (
                    <div className="bg-white p-6 rounded-xl shadow mb-6">
                        <p className="mb-4 text-lg font-semibold text-center">Escolha seu plano para iniciar:</p>
                        <div className="flex justify-center gap-4">
                            <Button onClick={() => setPlanoSelecionado("start")}>Start</Button>
                            <Button onClick={() => setPlanoSelecionado("pro")}>Pro</Button>
                            <Button onClick={() => setPlanoSelecionado("business")}>Business</Button>
                        </div>
                    </div>
                )}

                {etapas.length > 0 && <TutorOnboarding etapas={etapas} />}
            </div>
        </main>
    );
}
