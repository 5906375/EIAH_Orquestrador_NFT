import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
    return (
        <section id="hero" className="relative bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white py-24 px-6 overflow-hidden">
            <div className="max-w-5xl mx-auto text-center z-10 relative">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
                    <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                        Tokenize diárias com IA + Blockchain
                    </span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                    NFTDiárias transforma contratos de aluguel em ativos digitais, com segurança jurídica e automação via agentes IA.
                </p>
                <div className="mt-10 flex justify-center gap-4 flex-col sm:flex-row">
                    <Link to="/emitir-orquestrado">
                        <Button size="lg" className="bg-pink-600 hover:bg-pink-700 transition">
                            Criar NFT de Diária
                        </Button>
                    </Link>
                    <a href="#listings">
                        <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
                            Ver Imóveis Tokenizados
                        </Button>
                    </a>
                    <Link to="/planos">
                        <Button size="lg" variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">
                            Ver Planos
                        </Button>
                    </Link>
                </div>

            </div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent pointer-events-none"></div>
        </section>
    );
}