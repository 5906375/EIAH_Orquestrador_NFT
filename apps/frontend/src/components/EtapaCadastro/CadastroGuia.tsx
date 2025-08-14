import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import EtapaProprietario from "./EtapaProprietario";
import EtapaPropriedade from "./EtapaPropriedade";
import EtapaRegras from "./EtapaRegras";
import { Button } from "@/components/ui/button";

type Etapas = "proprietario" | "propriedade" | "regras";
const ETAPAS: Etapas[] = ["proprietario", "propriedade", "regras"];

function isEtapa(value: string | null): value is Etapas {
    return !!value && (ETAPAS as string[]).includes(value);
}

export default function CadastroGuia() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // 1) Etapa inicial via URL ou localStorage
    const etapaFromURL = useMemo<Etapas>(() => {
        const p = searchParams.get("etapa") || localStorage.getItem("cadastro_etapa");
        return isEtapa(p) ? p : "proprietario";
    }, [searchParams]);

    const [etapa, setEtapa] = useState<Etapas>(etapaFromURL);
    const [formData, setFormData] = useState<any>(() => {
        try {
            const saved = localStorage.getItem("cadastro_formData");
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    // 🔹 Salva formData no localStorage
    useEffect(() => {
        try {
            localStorage.setItem("cadastro_formData", JSON.stringify(formData));
        } catch { }
    }, [formData]);

    // 🔹 Salva etapa atual no localStorage
    useEffect(() => {
        try {
            localStorage.setItem("cadastro_etapa", etapa);
        } catch { }
    }, [etapa]);

    // 2) Bloqueia acesso à etapa "regras" sem idPropriedade
    useEffect(() => {
        if (etapa === "regras" && !formData?.idPropriedade) {
            setEtapa("propriedade");
            const params = new URLSearchParams(searchParams);
            params.set("etapa", "propriedade");
            setSearchParams(params, { replace: true } as any);
        }
    }, [etapa, formData?.idPropriedade, searchParams, setSearchParams]);

    // 3) Sincroniza etapa com URL
    useEffect(() => {
        const current = searchParams.get("etapa");
        if (current !== etapa) {
            const params = new URLSearchParams(searchParams);
            params.set("etapa", etapa);
            setSearchParams(params, { replace: true } as any);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [etapa, searchParams, setSearchParams]);

    const indiceEtapa = useMemo(() => ETAPAS.indexOf(etapa), [etapa]);
    const progresso = ((indiceEtapa + 1) / ETAPAS.length) * 100;

    const avancarEtapa = useCallback(() => {
        if (etapa === "proprietario") setEtapa("propriedade");
        else if (etapa === "propriedade") setEtapa("regras");
    }, [etapa]);

    const voltarEtapa = useCallback(() => {
        if (etapa === "regras") setEtapa("propriedade");
        else if (etapa === "propriedade") setEtapa("proprietario");
    }, [etapa]);

    // 🔹 Redireciona para emissão ao finalizar
    const finalizarCadastro = useCallback(() => {
        navigate("/emitir-nft", {
            state: {
                idPerfil: formData.idPerfil,
                wallet: formData.wallet,
                idPropriedade: formData.idPropriedade,
            },
        });
    }, [navigate, formData]);

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <header className="space-y-2">
                <h1 className="text-2xl font-bold text-center">Cadastro Guiado</h1>
                <div className="w-full h-2 bg-gray-200 rounded">
                    <div
                        className="h-2 rounded bg-purple-600 transition-all"
                        style={{ width: `${progresso}%` }}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progresso}
                        role="progressbar"
                    />
                </div>
                <p className="text-center text-sm text-gray-600">
                    Etapa {indiceEtapa + 1} de {ETAPAS.length} —{" "}
                    {etapa === "proprietario" && "Proprietário"}
                    {etapa === "propriedade" && "Propriedade"}
                    {etapa === "regras" && "Regras"}
                </p>
            </header>

            {etapa === "proprietario" && (
                <EtapaProprietario
                    formData={formData}
                    setFormData={setFormData}
                    proximo={avancarEtapa}
                />
            )}

            {etapa === "propriedade" && (
                <EtapaPropriedade
                    formData={formData}
                    setFormData={setFormData}
                    proximo={avancarEtapa}
                    voltar={voltarEtapa}
                />
            )}

            {etapa === "regras" && (
                <EtapaRegras
                    formData={formData}
                    setFormData={setFormData}
                    proximo={finalizarCadastro} // 🚀 já vai para emissão
                    voltar={voltarEtapa}
                />
            )}

            <div className="flex justify-between mt-6">
                {etapa !== "proprietario" ? (
                    <Button onClick={voltarEtapa} variant="outline">
                        Voltar
                    </Button>
                ) : (
                    <span />
                )}
            </div>
        </div>
    );
}
