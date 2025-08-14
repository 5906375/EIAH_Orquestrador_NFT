// src/pages/EmitirNFTDiarias.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/utils/api";

type NavState = {
    idPerfil?: string;
    idPropriedade?: string;
    wallet?: string;
    regras?: string | string[];
    finalidade?: string;
    hospedesPermitidos?: number;
};

export default function EmitirNFTDiarias() {
    const navigate = useNavigate();
    const { state } = useLocation() as { state?: NavState };
    const [qs] = useSearchParams();

    const initial = useMemo(() => {
        const fromQS = {
            idPerfil: qs.get("idPerfil") || undefined,
            idPropriedade: qs.get("idPropriedade") || undefined,
            wallet: qs.get("wallet") || undefined,
        };
        return {
            idPerfil: state?.idPerfil ?? fromQS.idPerfil ?? "",
            idPropriedade: state?.idPropriedade ?? fromQS.idPropriedade ?? "",
            wallet: (state?.wallet || fromQS.wallet || localStorage.getItem("wallet") || "").toLowerCase(),
            regras: Array.isArray(state?.regras) ? state!.regras.join(", ") : state?.regras ?? "",
            finalidade: state?.finalidade ?? "",
            hospedesPermitidos: state?.hospedesPermitidos ?? 0,
            dataInicio: "",
            dataFim: "",
            valorDiaria: "",
        };
    }, [state, qs]);

    const [form, setForm] = useState(initial);

    useEffect(() => {
        if (!initial.idPerfil || !initial.idPropriedade) {
            toast.message("Complete o cadastro guiado antes de emitir.");
            navigate("/cadastro-guia?etapa=proprietario", { replace: true });
        }
    }, [initial, navigate]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleEmitir = async () => {
        try {
            if (!form.dataInicio || !form.dataFim || !form.valorDiaria) {
                toast.error("Preencha datas e valor da diária.");
                return;
            }

            const payload = {
                idPerfil: form.idPerfil,
                idPropriedade: form.idPropriedade,
                wallet: form.wallet,
                regras: form.regras,
                finalidade: form.finalidade,
                hospedesPermitidos: Number(form.hospedesPermitidos ?? 0),
                dataInicio: form.dataInicio,
                dataFim: form.dataFim,
                valorDiaria: Number(form.valorDiaria),
            };

            // Chamada real
            const { data } = await api.post("/nfts/emitir", payload);

            const reciboData = {
                tokenURI: data.tokenURI,
                txHash: data.txHash,
                imagem: data.image || null,
                nomeNFT: data.nomeNFT || `Hospedagem ${form.dataInicio} → ${form.dataFim}`,
                dataInicio: form.dataInicio,
                dataFim: form.dataFim,
                descricao: `NFT de diárias da propriedade ${form.idPropriedade}`,
                numeroHospedes: Number(form.hospedesPermitidos ?? 0),
            };

            try { localStorage.setItem("reciboNFT", JSON.stringify(reciboData)); } catch { }
            navigate("/nft/confirmacao", { state: reciboData, replace: true });
        } catch (err: any) {
            // Fallback mock se a rota não existir/falhar
            console.error("Falha ao emitir NFT:", err?.response?.data || err?.message);
            toast.success("NFT emitido (mock). Redirecionando para confirmação…");

            const reciboData = {
                tokenURI: "ipfs://demo/metadata.json",
                txHash: "0xmocktxhash",
                imagem: null,
                nomeNFT: `Hospedagem ${form.dataInicio} → ${form.dataFim}`,
                dataInicio: form.dataInicio,
                dataFim: form.dataFim,
                descricao: `NFT de diárias da propriedade ${form.idPropriedade}`,
                numeroHospedes: Number(form.hospedesPermitidos ?? 0),
            };

            try { localStorage.setItem("reciboNFT", JSON.stringify(reciboData)); } catch { }
            navigate("/nft/confirmacao", { state: reciboData, replace: true });
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-4">
            <h1 className="text-2xl font-bold">Emitir NFT de Diárias</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="border p-2 rounded" readOnly value={form.idPerfil} placeholder="idPerfil" />
                <input className="border p-2 rounded" readOnly value={form.idPropriedade} placeholder="idPropriedade" />
                <input className="border p-2 rounded" readOnly value={form.wallet} placeholder="wallet" />
                <input className="border p-2 rounded md:col-span-2" readOnly value={form.regras} placeholder="regras" />
                <input className="border p-2 rounded" readOnly value={form.finalidade} placeholder="finalidade" />
                <input className="border p-2 rounded" readOnly value={String(form.hospedesPermitidos)} placeholder="hóspedes permitidos" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-sm">Data de Início</label>
                    <input name="dataInicio" type="date" className="border p-2 rounded w-full" value={form.dataInicio} onChange={onChange} />
                </div>
                <div>
                    <label className="text-sm">Data de Fim</label>
                    <input name="dataFim" type="date" className="border p-2 rounded w-full" value={form.dataFim} onChange={onChange} />
                </div>
                <div>
                    <label className="text-sm">Valor da diária</label>
                    <input name="valorDiaria" type="number" className="border p-2 rounded w-full" value={form.valorDiaria} onChange={onChange} placeholder="0.00" min="0" />
                </div>
            </div>

            <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
                <Button onClick={handleEmitir}>Emitir NFT</Button>
            </div>
        </div>
    );
}
