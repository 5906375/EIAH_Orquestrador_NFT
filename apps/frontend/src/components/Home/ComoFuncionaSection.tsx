import React from "react";

export default function ComoFuncionaSection() {
    const passos = [
        ["1", "Crie seu Ativo", "Upload do contrato validado por IA e tokenização."],
        ["2", "Publique no Marketplace", "Listagem com imagem e descrição geradas por IA."],
        ["3", "Negocie sem Fricção", "Compra e uso direto com NFT como reserva."],
    ];

    return (
        <section id="como-funciona" className="bg-indigo-600 text-white py-16 md:py-24 px-6">
            <div className="container mx-auto text-center">
                <h2 className="text-4xl font-extrabold">Como funciona em 3 passos</h2>
                <p className="mt-4 text-indigo-100 max-w-3xl mx-auto text-lg">
                    Nosso processo simplificado facilita a emissão e gestão dos seus ativos digitais.
                </p>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                    {passos.map(([n, t, d], i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-white text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-xl">
                                {n}
                            </div>
                            <h3 className="text-2xl font-bold">{t}</h3>
                            <p className="mt-2 text-indigo-100">{d}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}