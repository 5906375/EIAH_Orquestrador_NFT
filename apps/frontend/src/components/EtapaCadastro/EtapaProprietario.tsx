import { useEffect, useState } from "react";
import { buscarEnderecoPorCep } from "@/utils/CepApi";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface EtapaProprietarioProps {
    formData: Record<string, any>;
    setFormData: (data: Record<string, any>) => void;
    proximo: () => void;
}

export default function EtapaProprietario({
    formData,
    setFormData,
    proximo,
}: EtapaProprietarioProps) {
    const [documento, setDocumento] = useState<File | null>(null);
    const [comprovante, setComprovante] = useState<File | null>(null);
    const [previewComprovante, setPreviewComprovante] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fala = new SpeechSynthesisUtterance("Vamos preencher os dados do proprietário.");
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(fala);

        const saved = (localStorage.getItem("wallet") || "").toLowerCase();
        if (saved) {
            setField("wallet", saved);
        } else if ((window as any).ethereum?.request) {
            (window as any).ethereum
                .request({ method: "eth_accounts" })
                .then((accs: string[]) => {
                    if (accs?.[0]) {
                        const w = String(accs[0]).toLowerCase();
                        setField("wallet", w);
                        localStorage.setItem("wallet", w);
                    }
                })
                .catch(() => { });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setField = (name: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setField(name, value);
    };

    const preencherEnderecoComCep = async (cep: string) => {
        try {
            const endereco = await buscarEnderecoPorCep(cep);
            setField("endereco", endereco.logradouro);
            setField("bairro", endereco.bairro);
            setField("cidade", endereco.localidade);
            setField("estado", endereco.uf);
            setField("pais", "Brasil");
        } catch {
            toast.error("❌ CEP não encontrado.");
        }
    };

    const handleArquivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (e.target.name === "comprovanteEndereco") {
            setComprovante(file);
            setPreviewComprovante(URL.createObjectURL(file));
            setField("comprovanteEndereco", file);
        }

        if (e.target.name === "documentoIdentidade") {
            setDocumento(file);
            setField("docIdentidade", file); // nome esperado pelo backend
        }
    };

    const handleSalvarProprietario = async (
        e: React.FormEvent | React.MouseEvent
    ) => {
        e.preventDefault?.();

        const wallet = String(formData.wallet || localStorage.getItem("wallet") || "").toLowerCase();
        if (!wallet) {
            toast.error("Informe ou conecte sua wallet.");
            return;
        }

        
        const tipoPessoaValue = (formData.tipoPessoa === "Física" || formData.tipoPessoa === "Jurídica") ? formData.tipoPessoa : "Física";

        const endereco = {
            cep: formData.cep || "",
            logradouro: formData.endereco || "",
            numero: formData.numero || "",
            bairro: formData.bairro || "",
            cidade: formData.cidade || "",
            uf: formData.estado || "",
            complemento: formData.complemento || "",
        };

        const data = new FormData();
        data.append("nome", formData.nome || "");
        data.append("tipoPessoa", tipoPessoaValue);
        data.append("telefone", `${formData.ddi || ""}${formData.telefone || ""}`);
        data.append("wallet", wallet);
        data.append("endereco", JSON.stringify(endereco));

        if (documento) data.append("documento", documento);
        if (comprovante) data.append("comprovanteEndereco", comprovante);

        setLoading(true);
        try {
            const response = await axios.post("http://localhost:4000/api/perfis", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const idPerfil = response.data?._id || response.data?.id || response.data?.idPerfil;
            if (idPerfil) setField("idPerfil", idPerfil);

            toast.success("✅ Cadastro do perfil concluído!");
            proximo();
        } catch (err: any) {
            const status = err?.response?.status;
            const resp = err?.response?.data;
            const printable = typeof resp === "string" ? resp : JSON.stringify(resp, null, 2);
            console.error("❌ Erro ao cadastrar perfil:", status, printable);

            const msg =
                (resp && (resp.message || resp.erro)) ||
                (typeof resp === "string" ? resp : "") ||
                "Erro ao cadastrar perfil.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }; // <<< fecha a função certinho

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold">👤 Perfil</h2>

            <input
                name="nome"
                placeholder="Nome"
                value={formData.nome || ""}
                onChange={handleChange}
                className="border p-2 w-full rounded"
            />

            <div className="flex gap-2">
                <select
                    name="ddi"
                    value={formData.ddi || "+55"}
                    onChange={handleChange}
                    className="border p-2 rounded"
                >
                    <option value="+55">🇧🇷 +55 (Brasil)</option>
                    <option value="+1">🇺🇸 +1 (EUA)</option>
                    <option value="+351">🇵🇹 +351 (Portugal)</option>
                </select>
                <input
                    name="telefone"
                    placeholder="Telefone"
                    value={formData.telefone || ""}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                />
            </div>

            {/* Wallet visível para edição */}
            <input
                name="wallet"
                placeholder="Wallet (0x...)"
                value={formData.wallet || ""}
                onChange={handleChange}
                className="border p-2 w-full rounded"
            />

            <select
                name="tipoPessoa"
                value={formData.tipoPessoa || ""}
                onChange={handleChange}
                className="border p-2 w-full rounded"
            >
                <option value="">Tipo de Pessoa</option>
                <option value="Física">Pessoa Física</option>
                <option value="Jurídica">Pessoa Jurídica</option>
            </select>

            <input
                name="email"
                placeholder="Email"
                value={formData.email || ""}
                onChange={handleChange}
                className="border p-2 w-full rounded"
            />
            <input
                name="assinatura"
                placeholder="Assinatura"
                value={formData.assinatura || ""}
                onChange={handleChange}
                className="border p-2 w-full rounded"
            />

            <input
                name="cep"
                placeholder="CEP"
                value={formData.cep || ""}
                onChange={(e) => {
                    const cep = e.target.value;
                    setField("cep", cep);
                    if (cep.replace(/\D/g, "").length === 8) {
                        preencherEnderecoComCep(cep);
                    }
                }}
                className="border p-2 w-full rounded"
            />

            <input
                name="endereco"
                placeholder="Endereço"
                value={formData.endereco || ""}
                onChange={handleChange}
                className="border p-2 w-full rounded"
            />
            <input
                name="numero"
                placeholder="Número"
                value={formData.numero || ""}
                onChange={handleChange}
                className="border p-2 w-full rounded"
            />
            <input
                name="bairro"
                placeholder="Bairro"
                value={formData.bairro || ""}
                onChange={handleChange}
                className="border p-2 w-full rounded"
            />
            <input
                name="cidade"
                placeholder="Cidade"
                value={formData.cidade || ""}
                onChange={handleChange}
                className="border p-2 w-full rounded"
            />
            <input
                name="estado"
                placeholder="Estado"
                value={formData.estado || ""}
                onChange={handleChange}
                className="border p-2 w-full rounded"
            />
            <input
                name="pais"
                placeholder="País"
                value={formData.pais || "Brasil"}
                onChange={handleChange}
                className="border p-2 w-full rounded"
            />

            <input
                type="file"
                name="documentoIdentidade"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleArquivoChange}
            />
            <input
                type="file"
                name="comprovanteEndereco"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleArquivoChange}
            />
            {previewComprovante && (
                <img src={previewComprovante} alt="Comprovante" className="w-32 mt-2 rounded border" />
            )}

            <Button
                onClick={handleSalvarProprietario}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded mt-4"
            >
                {loading ? "Salvando..." : "Salvar Proprietário"}
            </Button>
        </div>
    );
}
