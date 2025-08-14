import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CtaSection({ onEmitirNFT }: { onEmitirNFT: () => void }) {
    return (
        <section className="bg-gray-100 py-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Pronto para tokenizar sua propriedade?</h2>
            <p className="text-gray-600 mb-6">Comece hoje mesmo a gerar ativos digitais e explorar o futuro da economia imobiliária.</p>
            <button onClick={onEmitirNFT} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded">
                Emitir Meu Primeiro NFT
            </button>
        </section>
    );
}
