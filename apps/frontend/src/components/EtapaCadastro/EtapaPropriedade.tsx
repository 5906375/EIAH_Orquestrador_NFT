import React, { useState } from "react";
import { api } from "@/utils/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface EtapaPropriedadeProps {
    formData: Record<string, any>;
    setFormData: (updater: any) => void;
    proximo: () => void;
    voltar: () => void;
}

export default function EtapaPropriedade({
    formData,
    setFormData,
    proximo,
    voltar,
}: EtapaPropriedadeProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [arquivoCompraVenda, setArquivoCompraVenda] = useState<File | null>(null);

    const setField = (name: string, value: any) =>
        setFormData((prev: any) => ({ ...prev, [name]: value }));

    const validateField = (name: string, value: string) => {
        const newErrors: Record<string, string> = {};
        if (!value) newErrors[name] = "Este campo é obrigatório.";
        if (name === "emailContato" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors[name] = "Email inválido.";
        }
        setErrors((prev) => ({ ...prev, ...newErrors }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setField(name, value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        validateField(e.target.name, e.target.value);
    };

    const handleArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setArquivoCompraVenda(file);
    };

    const handleSalvarPropriedade = async (
        e?: React.FormEvent | React.MouseEvent
    ) => {
        e?.preventDefault?.();

        try {
            // 1) pré‑validação
            const perfilId = formData?.idPerfil;
            if (!perfilId) {
                toast.error("Cadastre o proprietário primeiro.");
                return;
            }

            const obrig = [
                ["nomePropriedade", formData.nomePropriedade],
                ["emailPropriedade/emailContato", formData.emailPropriedade || formData.emailContato],
                ["registroImovel", formData.registroImovel],
            ] as const;

            for (const [campo, valor] of obrig) {
                if (!valor) {
                    setErrors((prev: any) => ({ ...prev, [campo]: "Este campo é obrigatório." }));
                    toast.error("Preencha os campos obrigatórios.");
                    return;
                }
            }

            const wallet = (formData.wallet || localStorage.getItem("wallet") || "").toLowerCase();
            if (!wallet) {
                toast.error("Wallet não encontrada.");
                return;
            }

            // 2) montar payload e enviar (um único POST)
            setLoading(true);

            // endereço (usado em ambos os ramos)
            const endereco = {
                cep: formData.cepProp,
                rua: formData.ruaProp,
                numero: formData.numeroProp,
                bairro: formData.bairroProp,
                cidade: formData.cidadeProp,
                estado: formData.estadoProp,
            };

            let resp;

            if (arquivoCompraVenda) {
                // multipart
                const fd = new FormData();
                fd.append("nomePropriedade", formData.nomePropriedade || "");
                fd.append("emailContato", formData.emailContato || formData.emailPropriedade || "");
                fd.append("emailPropriedade", formData.emailPropriedade || formData.emailContato || "");
                fd.append("registroImovel", formData.registroImovel || "");
                fd.append("perfilId", perfilId);
                fd.append("wallet", wallet);
                fd.append("documentoCompraVenda", arquivoCompraVenda);
                fd.append("endereco", JSON.stringify(endereco));

                resp = await api.post("/imoveis", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                // json
                const payload = {
                    perfilId,
                    nomePropriedade: formData.nomePropriedade,
                    emailContato: formData.emailContato || formData.emailPropriedade,
                    emailPropriedade: formData.emailPropriedade || formData.emailContato,
                    registroImovel: formData.registroImovel,
                    wallet,
                    documentoCompraVenda: formData.documentoCompraVenda || formData.docCompraVenda || "",
                    endereco: JSON.stringify(endereco),
                };

                resp = await api.post("/imoveis", payload);
            }

            // 3) guardar idPropriedade e avançar
            const { _id } = resp.data;
            setFormData((prev: any) => ({ ...prev, idPropriedade: _id }));

            toast.success("Propriedade salva!");
            proximo();
        } catch (err: any) {
            const status = err?.response?.status;
            const resp = err?.response?.data;
            console.error("❌ Erro ao salvar propriedade:", status, resp || err?.message);
            toast.error(resp?.message || "Erro ao salvar propriedade");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="space-y-4" aria-live="polite">
            <h2 className="text-lg font-bold">🏠 Propriedade</h2>

            <div>
                <label htmlFor="nomePropriedade" className="block text-sm font-medium">
                    Nome da Propriedade *
                </label>
                <input
                    id="nomePropriedade"
                    name="nomePropriedade"
                    placeholder="Ex: Casa na Serra"
                    value={formData.nomePropriedade || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!errors.nomePropriedade}
                    aria-describedby="erro-nomePropriedade"
                    className="border p-2 w-full rounded"
                    required
                />
                {errors.nomePropriedade && (
                    <p id="erro-nomePropriedade" className="text-red-600 text-sm">
                        {errors.nomePropriedade}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="emailContato" className="block text-sm font-medium">
                    Email para contato *
                </label>
                <input
                    id="emailContato"
                    type="email"
                    name="emailContato"
                    placeholder="exemplo@email.com"
                    value={formData.emailContato || formData.emailPropriedade || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!errors.emailContato}
                    aria-describedby="erro-emailContato"
                    className="border p-2 w-full rounded"
                    required
                />
                {errors.emailContato && (
                    <p id="erro-emailContato" className="text-red-600 text-sm">
                        {errors.emailContato}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="documentoCompraVenda" className="block text-sm font-medium">
                    Documento de Compra e Venda
                </label>

                {/* Opção 1: Link/Texto */}
                <input
                    id="documentoCompraVenda"
                    name="documentoCompraVenda"
                    placeholder="Número ou link do documento"
                    value={formData.documentoCompraVenda || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!errors.documentoCompraVenda}
                    aria-describedby="erro-documentoCompraVenda"
                    className="border p-2 w-full rounded mb-2"
                />
                {errors.documentoCompraVenda && (
                    <p id="erro-documentoCompraVenda" className="text-red-600 text-sm">
                        {errors.documentoCompraVenda}
                    </p>
                )}

                {/* Opção 2: Upload */}
                <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleArquivo}
                    className="block"
                />
                <p className="text-xs text-gray-500">
                    Você pode informar um link OU enviar um arquivo. Se enviar arquivo, ele será priorizado.
                </p>
            </div>

            <div>
                <label htmlFor="registroImovel" className="block text-sm font-medium">
                    Registro do Imóvel *
                </label>
                <input
                    id="registroImovel"
                    name="registroImovel"
                    placeholder="123456789"
                    value={formData.registroImovel || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!errors.registroImovel}
                    aria-describedby="erro-registroImovel aviso-lgpd"
                    className="border p-2 w-full rounded"
                    required
                />
                {errors.registroImovel && (
                    <p id="erro-registroImovel" className="text-red-600 text-sm">
                        {errors.registroImovel}
                    </p>
                )}
                <p id="aviso-lgpd" className="text-xs text-gray-500 mt-1">
                    🔒 Este dado será usado apenas para autenticar a posse do imóvel, conforme a LGPD.
                </p>
            </div>

            <div className="flex gap-2">
                <Button onClick={voltar} variant="secondary">Voltar</Button>
                {/* O botão Próximo deve SALVAR antes de avançar */}
                <Button onClick={handleSalvarPropriedade} disabled={loading}>
                    {loading ? "Salvando..." : "Salvar e continuar"}
                </Button>
            </div>
        </div>
    );
}
