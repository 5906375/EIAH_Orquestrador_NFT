// apps/frontend/src/components/TutorOnboarding.tsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { speak } from "@/utils/voice";
import { Button } from "@/components/ui/button";

type Etapa = {
    id: number;
    texto: string;
};

type Props = {
    etapas: Etapa[];
};

export default function TutorOnboarding({ etapas }: Props) {
    const [etapaAtual, setEtapaAtual] = useState<number>(0);
    const navigate = useNavigate();

    const avancarEtapa = () => {
        if (etapaAtual < etapas.length - 1) {
            setEtapaAtual(etapaAtual + 1);
        } else {
            speak("Você concluiu o onboarding. Agora vamos iniciar o cadastro da sua propriedade.");
            setTimeout(() => {
                navigate("/cadastro-propriedade"); // Altere se sua rota for diferente
            }, 3000); // Espera 3 segundos para permitir que a fala finalize
        }
    };

    useEffect(() => {
        speak(etapas[etapaAtual]?.texto);
    }, [etapaAtual]);

    if (etapas.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-lg text-gray-700 mb-6">{etapas[etapaAtual].texto}</p>
            <Button onClick={avancarEtapa}>
                {etapaAtual < etapas.length - 1 ? "Próximo" : "Finalizar"}
            </Button>
        </div>
    );
}