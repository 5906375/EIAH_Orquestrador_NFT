import React from "react";
import { Button } from "@/components/ui/button";

export default function ListagensSection() {
    return (
        <section id="listings" className="py-16 md:py-24 px-6 bg-gray-50">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-4xl font-extrabold">Diárias em Destaque</h2>
                    <a href="#" className="text-indigo-600 font-semibold hover:underline">Ver todos →</a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:-translate-y-1 transition-all">
                            <div
                                className="h-56 bg-cover bg-center"
                                style={{ backgroundImage: `url('https://placehold.co/600x400/5B21B6/FFFFFF?text=NFT+Diaria+${n}')` }}
                            />
                            <div className="p-6">
                                <h3 className="text-xl font-bold">Imóvel NFT #{n}</h3>
                                <p className="text-gray-600 mt-1">1 diária disponível</p>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-2xl font-bold text-indigo-600">0.{n} ETH</span>
                                    <Button className="text-sm px-4 py-2">Reservar</Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
