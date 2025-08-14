// frontend/src/context/TutorContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

type TutorContextType = {
    idPerfil: string | null;
    setIdPerfil: (id: string | null) => void;
    etapaAtual: string;
    setEtapaAtual: (etapa: string) => void;
    plano: string;
    setPlano: (plano: string) => void;
};

const TutorContext = createContext<TutorContextType | undefined>(undefined);
export { TutorContext };
export const TutorProvider = ({ children }: { children: ReactNode }) => {
    const [idPerfil, setIdPerfil] = useState<string | null>(null);
    const [etapaAtual, setEtapaAtual] = useState<string>("inicio");
    const [plano, setPlano] = useState<string>("start");

    return (
        <TutorContext.Provider
            value={{ idPerfil, setIdPerfil, etapaAtual, setEtapaAtual, plano, setPlano }}
        >
            {children}
        </TutorContext.Provider>
    );
};

export const useTutorContext = (): TutorContextType => {
    const context = useContext(TutorContext);
    if (!context) {
        throw new Error("useTutorContext must be used within a TutorProvider");
    }
    return context;
};
