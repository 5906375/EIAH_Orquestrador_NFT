import React, { useState } from "react";
import EmitirNFTForm from "@/pages/EmitirNFTForm";
import { toast } from "sonner";
import { speak } from "@/utils/voice";
import { Button } from "@/components/ui/button";

interface FormularioNFT {
    idPropriedade: string;
    nomeNFT: string;
    dataInicio: string;
    dataFim: string;
    cep: string;
    endereco: string;
    numero: string;
    cidade: string;
    uf: string;
    pais: string;
    midia: File | null;
    descricao: string;
    proposito: string;
    numeroHospedes: string;
    linkExterno: string;
    conteudoExclusivo: string;
}

export default function EmitirNFTOrquestrador() {
    const [form, setForm] = useState<FormularioNFT>({
        idPropriedade: "",
        nomeNFT: "",
        dataInicio: "",
        dataFim: "",
        cep: "",
        endereco: "",
        numero: "",
        cidade: "",
        uf: "",
        pais: "Brasil",
        midia: null,
        descricao: "",
        proposito: "",
        numeroHospedes: "",
        linkExterno: "",
        conteudoExclusivo: "",
    });

    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState<string | null>(null);

    const handleEmitirNFT = async () => {
        const camposObrigatorios = [
            "idPropriedade",
            "nomeNFT",
            "dataInicio",
            "dataFim",
            "descricao",
            "proposito",
            "numeroHospedes"
        ];

        const faltando = camposObrigatorios.filter((campo) => !form[campo as keyof FormularioNFT]);
        if (faltando.length > 0 || !form.midia) {
            toast.warning("Preencha todos os campos obrigatórios.");
            return;
        }

        setLoading(true);
        toast("Enviando dados para o orquestrador...");
        speak("Enviando dados para o orquestrador.");

        try {
            const formData = new FormData();

            // Adiciona cada campo no formData
            for (const [key, value] of Object.entries(form)) {
                if (value instanceof File) {
                    formData.append(key, value);
                } else if (typeof value === "string" || typeof value === "number") {
                    formData.append(key, value.toString());
                }
            }

            const res = await fetch("http://localhost:8000/executar/nft", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Erro ao emitir NFT");

            const data = await res.json();
            const saida = data.resultado ?? data.tokenURI ?? "NFT emitido com sucesso!";
            setResultado(saida);
            toast.success("✅ NFT emitido com sucesso!");
            speak("NFT emitido com sucesso.");
        } catch (err) {
            console.error(err);
            toast.error("❌ Falha ao emitir NFT");
            speak("Falha ao emitir NFT.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-md">
                <EmitirNFTForm form={form} setForm={setForm} />

                <Button
                    type="button"
                    disabled={loading}
                    onClick={handleEmitirNFT}
                    className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white"
                >
                    {loading ? "Emitindo NFT..." : "Emitir NFT Agora"}
                </Button>

                {resultado && (
                    <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-md text-green-800">
                        <p>{resultado}</p>
                        {resultado.startsWith("ipfs://") && (
                            <a
                                href={`https://ipfs.io/ipfs/${resultado.replace("ipfs://", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                            >
                                Ver NFT no IPFS
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
