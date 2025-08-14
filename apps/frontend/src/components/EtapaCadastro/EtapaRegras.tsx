import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/utils/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
    formData: Record<string, any>;
    setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    proximo: () => void;
    voltar: () => void;
};

export default function EtapaRegras({ formData, setFormData, voltar }: Props) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();

    const setField = (name: string, value: any) =>
        setFormData(prev => ({ ...prev, [name]: value }));

    const validateFields = () => {
        const req = ["regras", "finalidade", "hospedesPermitidos"] as const;
        const next: Record<string, string> = {};
        for (const k of req) if (!formData[k]) next[k] = "Este campo é obrigatório.";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleFinalizar = async () => {
        if (!validateFields()) return;

        try {
            if (!formData?.idPropriedade) {
                toast.error("Cadastre a propriedade antes.");
                return;
            }

            setLoading(true);

            const payload = {
                regras: formData.regras, // string "a, b" ou array
                finalidade: formData.finalidade,
                hospedesPermitidos: Number(formData.hospedesPermitidos ?? 0),
            };

            await api.patch(`/imoveis/${formData.idPropriedade}/regras`, payload);

            toast.success("Regras salvas! Vamos emitir seu NFT.");

            const wallet = (formData.wallet || localStorage.getItem("wallet") || "").toLowerCase();

            navigate("/emitir-nft", {
                state: {
                    idPerfil: formData.idPerfil,
                    idPropriedade: formData.idPropriedade,
                    wallet,
                    regras: payload.regras,
                    finalidade: payload.finalidade,
                    hospedesPermitidos: payload.hospedesPermitidos,
                },
                replace: true,
            });
        } catch (err: any) {
            console.error(
                "Erro ao salvar regras:",
                err?.response?.status,
                err?.response?.data || err?.message
            );
            toast.error("Erro ao salvar regras.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold">📜 Regras da Propriedade</h2>

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label>Regras</label>
                    <textarea
                        name="regras"
                        value={formData.regras || ""}
                        onChange={(e) => setField("regras", e.target.value)}
                        className="w-full border rounded p-2"
                    />
                    {errors.regras && <p className="text-red-500 text-sm">{errors.regras}</p>}
                </div>

                <div>
                    <label>Finalidade</label>
                    <input
                        name="finalidade"
                        value={formData.finalidade || ""}
                        onChange={(e) => setField("finalidade", e.target.value)}
                        className="w-full border rounded p-2"
                    />
                    {errors.finalidade && <p className="text-red-500 text-sm">{errors.finalidade}</p>}
                </div>

                <div>
                    <label>Hóspedes Permitidos</label>
                    <input
                        name="hospedesPermitidos"
                        type="number"
                        value={formData.hospedesPermitidos ?? ""}
                        onChange={(e) => setField("hospedesPermitidos", e.target.value)}
                        className="w-full border rounded p-2"
                    />
                    {errors.hospedesPermitidos && (
                        <p className="text-red-500 text-sm">{errors.hospedesPermitidos}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={voltar}>Voltar</Button>
                <Button onClick={handleFinalizar} disabled={loading}>
                    {loading ? "Salvando..." : "Finalizar"}
                </Button>
            </div>
        </div>
    );
}
