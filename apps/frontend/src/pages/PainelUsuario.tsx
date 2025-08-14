import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/context/Web3Context";
import axios from "axios";
import { toast } from "sonner";

export default function PainelUsuario() {
    const navigate = useNavigate();
    const { carteira } = useWeb3();

    const [perfil, setPerfil] = useState<any>(null);
    const [imoveis, setImoveis] = useState<any[]>([]);
    const [nfts, setNfts] = useState<any[]>([]);

    // 🔍 Carrega dados assim que a carteira for detectada
    useEffect(() => {
        const fetchDados = async () => {
            if (!carteira) return;

            try {
                const perfilRes = await axios.get(`http://localhost:4000/api/perfis/wallet/${carteira}`);
                const perfilData = perfilRes.data;
                setPerfil(perfilData);

                const imoveisRes = await axios.get(`http://localhost:4000/api/imoveis/perfil/${perfilData._id}`);
                setImoveis(imoveisRes.data);

                const nftsRes = await axios.get(`http://localhost:4000/api/nfts/perfil/${perfilData._id}`);
                setNfts(nftsRes.data);
            } catch (error) {
                console.warn("Perfil não encontrado. Redirecionando para cadastro.");
                toast.error("🔐 Você ainda não possui um cadastro.");
                navigate("/cadastro-guia?etapa=proprietario"); // primeira etapa do cadastro
            }

        };

        fetchDados();
    }, [carteira, navigate]);

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
            <h1 className="text-3xl font-bold text-center text-purple-700">
                Meu Painel de Cadastro
            </h1>

            {/* 👤 Resumo do Perfil */}
            {perfil && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-2">👤 Perfil</h2>
                    <p><strong>Nome:</strong> {perfil.nome}</p>
                    <p><strong>Email:</strong> {perfil.email}</p>
                    <p><strong>Telefone:</strong> {perfil.ddi} {perfil.telefone}</p>
                    <p><strong>Tipo:</strong> {perfil.tipoPessoa}</p>
                    <div className="mt-4 flex gap-2">
                        <Button onClick={() => navigate("/meu-cadastro/perfil")}>Editar Perfil</Button>
                        <Button variant="outline" onClick={() => alert("⚠️ Exclusão de perfil ainda não implementada.")}>
                            Excluir Perfil
                        </Button>
                    </div>
                </div>
            )}

            {/* 🏠 Lista de Imóveis */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">🏠 Meus Imóveis</h2>
                {imoveis.length > 0 ? (
                    <ul className="list-disc pl-6 space-y-1">
                        {imoveis.map((imovel, idx) => (
                            <li key={idx}>{imovel.nomePropriedade} - {imovel.emailPropriedade}</li>
                        ))}
                    </ul>
                ) : (
                    <p>Nenhum imóvel cadastrado.</p>
                )}
                <div className="mt-4 flex gap-2">
                    <Button onClick={() => navigate("/cadastro-guia?etapa=propriedade")}>
                        Adicionar Novo Imóvel
                    </Button>
                </div>
            </div>

            {/* 📜 Regras */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">📜 Regras de Hospedagem</h2>
                {perfil?.regras ? (
                    <ul className="list-disc pl-6 space-y-1">
                        {perfil.regras.map((r: string, i: number) => (
                            <li key={i}>{r}</li>
                        ))}
                    </ul>
                ) : (
                    <p>Nenhuma regra cadastrada.</p>
                )}
                <div className="mt-4 flex gap-2">
                    <Button onClick={() => navigate("/cadastro-guia?etapa=regras")}>Criar ou Editar Regras</Button>
                </div>
            </div>

            {/* 🪙 NFTs Emitidos */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">🪙 NFTs Emitidos</h2>
                {nfts.length > 0 ? (
                    <ul className="list-disc pl-6 space-y-1">
                        {nfts.map((nft, idx) => (
                            <li key={idx}>
                                {nft.nomeNFT} - {nft.dataInicio} → {nft.dataFim}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Você ainda não emitiu NFTs.</p>
                )}
                <div className="mt-4">
                    <Button onClick={() => navigate("/emitir-nft")}>Emitir Novo NFT</Button>
                </div>
            </div>
        </div>
    );
}
