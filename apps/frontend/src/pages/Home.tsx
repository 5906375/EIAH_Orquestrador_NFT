// apps/frontend/src/pages/Home.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/Home/HeroSection";
import BeneficiosSection from "@/components/Home/BeneficiosSection";
import ComoFuncionaSection from "@/components/Home/ComoFuncionaSection";
import ListagensSection from "@/components/Home/ListagensSection";
import CtaSection from "@/components/Home/CtaSection";
import PerguntasAntesDeEmitir from "@/components/ui/PerguntasAntesDeEmitir";
import { useWeb3 } from "@/context/Web3Context";
import { toast } from "sonner";
import { verificarCadastro } from "@/utils/verificarCadastro";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
    const [mostrarPerguntas, setMostrarPerguntas] = useState(false);
    const navigate = useNavigate();
    const { carteira, conectarCarteira } = useWeb3();
    const { user } = useAuth();

    const handleCliquePainel = async () => {
        if (!carteira) {
            toast.error("Conecte sua carteira primeiro.");
            return;
        }
        try {
            const temCadastro = await verificarCadastro(carteira);
            if (temCadastro) navigate("/painel-usuario");
            else {
                toast("⚠️ Você ainda não possui cadastro.");
                navigate("/cadastro-guia");
            }
        } catch (error) {
            toast.error("Erro ao verificar cadastro.");
            console.error("Erro ao verificar perfil:", error);
        }
    };

    return (
        <>
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="text-3xl font-extrabold text-indigo-600">
                        NFTDiarias
                    </Link>

                    {/* Menu desktop */}
                    <div className="hidden md:flex space-x-4 items-center">
                        <a href="#beneficios" className="text-gray-600 hover:text-indigo-600 font-semibold transition-colors">
                            Benefícios
                        </a>
                        <a href="#como-funciona" className="text-gray-600 hover:text-indigo-600 font-semibold transition-colors">
                            Como Funciona
                        </a>
                        <a href="#listings" className="text-gray-600 hover:text-indigo-600 font-semibold transition-colors">
                            Imóveis
                        </a>

                        <Button onClick={() => setMostrarPerguntas(true)} className="bg-green-600 text-white font-bold hover:bg-green-700">
                            Emitir meu primeiro NFT
                        </Button>

                        <Button onClick={conectarCarteira} className="bg-purple-600 text-white font-bold hover:bg-purple-700">
                            {carteira ? "Carteira Conectada" : "Conectar Carteira"}
                        </Button>

                        {carteira && (
                            <Button onClick={handleCliquePainel} className="bg-blue-600 text-white font-bold hover:bg-blue-700">
                                Meu Painel
                            </Button>
                        )}

                        {/* 🔕 REMOVIDO: botão de Gerenciar Campanha no topo */}
                    </div>
                </div>
            </nav>

            <main>
                <HeroSection />
                <BeneficiosSection />
                <ComoFuncionaSection />
                <ListagensSection />
                <CtaSection onEmitirNFT={() => setMostrarPerguntas(true)} />
            </main>

           
            {mostrarPerguntas && (
                <PerguntasAntesDeEmitir onClose={() => setMostrarPerguntas(false)} />
            )}
        </>
    );
}
