// frontend/src/components/AudioGuia.tsx
import { useEffect } from "react";
import { useTutorContext } from "@/context/TutorContext";
import { speak } from "@/utils/voice";

const mensagensPorEtapa: Record<string, string> = {
    inicio: "Bem-vindo. Vamos iniciar o processo guiado.",
    proprietario: "Vamos preencher os dados do proprietário.",
    propriedade: "Agora, vamos cadastrar o imóvel.",
    regras: "Defina as regras para hospedagem.",
    nft: "Hora de emitir seu NFT de hospedagem.",
    finalizado: "Cadastro finalizado. Obrigado!",
};

export default function AudioGuia() {
    const { idPerfil, etapaAtual, plano } = useTutorContext();

    useEffect(() => {
        switch (etapaAtual) {
            case "cadastroProprietario":
                speak("Vamos preencher os dados do proprietário.");
                break;
            case "cadastroPropriedade":
                speak("Agora vamos cadastrar sua propriedade.");
                break;
            case "emitirNFT":
                speak("Vamos emitir o NFT da diária.");
                break;
            // ...
        }
    }, [etapaAtual]);


    return null; // componente invisível
}
