import React, { useEffect } from "react";
import { speak } from "@/utils/voice";
import { Button } from "@/components/ui/button";
import { buscarEnderecoPorCep } from "@/utils/CepApi";
import axios from "axios";
import { toast } from "sonner";
import { useTutorContext } from "@/context/TutorContext";
import { useNavigate } from "react-router-dom";

type Props = {
    form: any;
    setForm: React.Dispatch<React.SetStateAction<any>>;
};

export default function EmitirNFTForm({ form, setForm }: Props) {
    const navigate = useNavigate();
    const { setEtapaAtual } = useTutorContext();

    useEffect(() => {
        speak("Vamos criar o NFT de sua propriedade.");
        return () => {
            setEtapaAtual("inicio");
        };
    }, []);

    const handleChange = async (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev: any) => ({ ...prev, [name]: value }));

        if (name === "cep" && value.length >= 8) {
            try {
                const endereco = await buscarEnderecoPorCep(value);
                const enderecoFormatado = `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`;
                setForm((prev: any) => ({
                    ...prev,
                    endereco: enderecoFormatado,
                    cidade: endereco.localidade,
                    uf: endereco.uf,
                }));
            } catch (error) {
                console.warn("Erro ao buscar endereço:", error);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setForm((prev: any) => ({ ...prev, midia: file || null }));
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append("nomeNFT", form.nomeNFT);
            formData.append("wallet", form.wallet);
            formData.append("idPropriedade", form.idPropriedade);
            formData.append("descricao", form.descricao);
            formData.append("dataInicio", form.dataInicio);
            formData.append("dataFim", form.dataFim);
            formData.append("proposito", form.proposito);
            formData.append("numeroHospedes", form.numeroHospedes);
            formData.append("linkExterno", form.linkExterno);
            formData.append("conteudoExclusivo", form.conteudoExclusivo);
            formData.append("cep", form.cep);
            formData.append("endereco", form.endereco);
            formData.append("numero", form.numero);
            formData.append("cidade", form.cidade);
            formData.append("uf", form.uf);
            formData.append("pais", form.pais);

            if (form.midia) {
                formData.append("midia", form.midia);
            }

            const res = await axios.post("http://localhost:8000/api/nft", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data?.sucesso) {
                toast.success(res.data.resultado.mensagem || "NFT criado com sucesso!");
                setEtapaAtual("recibo");
                navigate("/recibo", { state: res.data.resultado });
            } else {
                toast.error("Erro ao emitir NFT via IA");
            }
        } catch (err) {
            console.error("[ERRO] ao enviar para agente NFT-D:", err);
            toast.error("Falha ao comunicar com o orquestrador.");
        }
    };

    return (
        <form className="space-y-4 max-w-md mx-auto">
            <h2 className="text-center font-medium text-lg">
                Criar NFTDiárias de sua Propriedade
            </h2>

            <input
                type="text"
                name="idPropriedade"
                placeholder="Id da Propriedade"
                value={form.idPropriedade}
                onChange={handleChange}
                className="input"
            />
            <input
                type="text"
                name="nomeNFT"
                placeholder="Nome | Título"
                value={form.nomeNFT}
                onChange={handleChange}
                className="input"
            />
            <div className="grid grid-cols-2 gap-2">
                <input type="date" name="dataInicio" value={form.dataInicio} onChange={handleChange} className="input" />
                <input type="date" name="dataFim" value={form.dataFim} onChange={handleChange} className="input" />
            </div>
            <p className="text-xs text-center text-gray-500">* UTC - fuso horário São Paulo, Brasil</p>

            <input type="text" name="cep" placeholder="CEP" value={form.cep} onChange={handleChange} className="input" />
            <input type="text" name="endereco" placeholder="Endereço completo" value={form.endereco} readOnly className="input" />
            <input type="text" name="numero" placeholder="Número" value={form.numero} onChange={handleChange} className="input" />
            <input type="text" name="cidade" placeholder="Cidade" value={form.cidade} onChange={handleChange} className="input" />
            <input type="text" name="uf" placeholder="UF" value={form.uf} onChange={handleChange} className="input" />
            <input type="text" name="pais" placeholder="País" value={form.pais} onChange={handleChange} className="input" />

            <div className="border border-dashed border-gray-400 p-6 text-center rounded-md bg-white">
                <input type="file" accept="image/*,video/*,audio/*,.glb,.gltf" onChange={handleFileChange} className="w-full" />
                <p className="text-sm text-gray-600">Imagem, vídeo, áudio ou 3D</p>
                <p className="text-xs text-gray-400">Tamanho máximo: 50MB – JPG, PNG, MP4, GIF, SVG, MP3</p>
            </div>

            <textarea name="descricao" placeholder="Descrição" value={form.descricao} onChange={handleChange} className="input" />
            <textarea name="proposito" placeholder="Propósito" value={form.proposito} onChange={handleChange} className="input" />
            <input type="number" name="numeroHospedes" placeholder="Número de hóspedes" value={form.numeroHospedes} onChange={handleChange} className="input" />
            <input type="text" name="linkExterno" placeholder="Link externo (opcional)" value={form.linkExterno} onChange={handleChange} className="input" />
            <textarea name="conteudoExclusivo" placeholder="Conteúdo exclusivo (opcional)" value={form.conteudoExclusivo} onChange={handleChange} className="input" />

            <Button type="button" onClick={handleSubmit} className="w-full bg-purple-600 text-white hover:bg-purple-700">
                Confirma
            </Button>
        </form>
    );
}

// Classe Tailwind reutilizável
const input = "w-full px-4 py-3 bg-gray-200 text-sm text-black placeholder-gray-400 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500";
