import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./button";

interface Props {
    onClose: () => void;
}

export default function PerguntasAntesDeEmitir({ onClose }: Props) {
    const navigate = useNavigate();
    const [respostas, setRespostas] = useState({
        perfil: null,
        imovel: null,
        regras: null,
    });

    const handleResposta = (campo: string, valor: boolean) => {
        setRespostas((prev) => ({ ...prev, [campo]: valor }));
    };

    const podeEmitir = Object.values(respostas).every((v) => v === true);
    const podeContinuar = Object.values(respostas).every((v) => v !== null);

    const decidirRota = () => {
        onClose(); // fecha o modal
        if (podeEmitir) {
            navigate("/emitir-nft");
        } else {
            navigate("/cadastro");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4 shadow-lg">
                <h2 className="text-xl font-bold text-center text-purple-700">Antes de continuar...</h2>

                {["perfil", "imovel", "regras"].map((campo) => (
                    <div key={campo}>
                        <p className="font-medium">
                            {campo === "perfil"
                                ? "✅ Você já possui perfil cadastrado?"
                                : campo === "imovel"
                                    ? "🏠 Já cadastrou o imóvel?"
                                    : "📜 Já definiu as regras da hospedagem?"}
                        </p>
                        <div className="flex gap-2 mt-1">
                            <Button onClick={() => handleResposta(campo, true)}>Sim</Button>
                            <Button variant="outline" onClick={() => handleResposta(campo, false)}>Não</Button>
                        </div>
                    </div>
                ))}

                <Button
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-4"
                    onClick={decidirRota}
                    disabled={!podeContinuar}
                >
                    Continuar
                </Button>

                <button onClick={onClose} className="text-sm text-gray-500 underline block text-center mt-2">
                    Cancelar
                </button>
            </div>
        </div>
    );
}
