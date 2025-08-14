import React from "react";

export default function BeneficiosSection() {
    const beneficios = [
        { icon: "🔒", title: "Segurança Jurídica", text: "Nossa IA jurídica valida contratos e gera regras imutáveis..." },
        { icon: "🌐", title: "Totalmente Descentralizado", text: "Com blockchain, eliminamos intermediários..." },
        { icon: "🤖", title: "Agentes de IA", text: "Nossos agentes orquestram criação, validação e promoção." },
        { icon: "📈", title: "Liquidez para Propriedades", text: "Tokenize sua propriedade, gere liquidez e receita." },
        { icon: "🗂️", title: "Gestão Facilitada", text: "Gestão automatizada com recibos e QR Code." },
        { icon: "💰", title: "Pagamentos em Cripto", text: "Aceite cripto de forma segura e global." },
    ];

    return (
        <section id="beneficios" className="py-16 md:py-24 px-6">
            <div className="container mx-auto">
                <h2 className="text-4xl font-extrabold text-center">Por que escolher a NFTDiarias?</h2>
                <p className="mt-4 text-center text-gray-600 max-w-3xl mx-auto text-lg">
                    Construímos uma nova forma de interagir com o mercado imobiliário, com base em pilares de segurança, eficiência e inovação.
                </p>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {beneficios.map((b, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:-translate-y-1 transition-all">
                            <div className="flex items-center space-x-4 mb-4">
                                <span className="text-4xl text-indigo-600">{b.icon}</span>
                                <h3 className="text-xl font-bold">{b.title}</h3>
                            </div>
                            <p className="text-gray-600">{b.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
