// frontend/src/pages/Planos.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

type Plano = {
    id: "starter" | "pro" | "enterprise";
    nome: string;
    agentes: string;
    validacoes: string;
    preco: string;
};

const PLANOS: Plano[] = [
    { id: "starter", nome: "Starter", agentes: "3 agentes", validacoes: "50", preco: "R$ 499" },
    { id: "pro", nome: "Pro", agentes: "6 agentes", validacoes: "200", preco: "R$ 999" },
    { id: "enterprise", nome: "Enterprise", agentes: "Ilimitado", validacoes: "Ilimitado", preco: "Sob consulta" },
];

export default function Planos() {
    const navigate = useNavigate();

    const escolherPlano = (plano: Plano["id"]) => {
        navigate("/painel-tutor", { state: { plano } });
    };

    const saibaMais = (plano: Plano["id"]) => {
        // ajuste esta rota se já tiver páginas de detalhes
        navigate(`/planos/${plano}`);
    };

    const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/"));

    return (
        <div className="min-h-screen bg-blue-50 py-10 md:py-16 px-4">
            <div className="mx-auto max-w-5xl">
                {/* Topo com Voltar + Título */}
                <div className="mb-6 flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={goBack}>Voltar</Button>
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-800 text-center flex-1">
                        Planos e Preços
                    </h1>
                    <span className="w-[80px]" aria-hidden /> {/* espaçador para alinhamento */}
                </div>

                {/* ===== Desktop/Tablet: Tabela ===== */}
                <div className="hidden md:block">
                    <div className="max-w-4xl mx-auto overflow-x-auto rounded-xl border bg-white shadow-lg">
                        <table className="w-full table-auto">
                            <thead className="bg-blue-100 text-gray-700 font-semibold">
                                <tr>
                                    <th className="px-6 py-4 text-left">Plano</th>
                                    <th className="px-6 py-4 text-left">Agentes Inclusos</th>
                                    <th className="px-6 py-4 text-left">Validações/Mês</th>
                                    <th className="px-6 py-4 text-left">Preço</th>
                                    <th className="px-6 py-4 text-left">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {PLANOS.map((p) => (
                                    <tr key={p.id} className="border-t">
                                        <td className="px-6 py-4 font-bold">{p.nome}</td>
                                        <td className="px-6 py-4">{p.agentes}</td>
                                        <td className="px-6 py-4">{p.validacoes}</td>
                                        <td className="px-6 py-4">{p.preco}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <Button variant="outline" onClick={() => saibaMais(p.id)}>
                                                    Saiba mais
                                                </Button>
                                                <Button onClick={() => escolherPlano(p.id)}>
                                                    {p.id === "enterprise" ? "Solicitar" : "Selecionar"}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ===== Mobile: Cards ===== */}
                <div className="md:hidden grid gap-4">
                    {PLANOS.map((p) => (
                        <div key={p.id} className="rounded-xl bg-white shadow-lg border p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">{p.nome}</h2>
                                <span className="text-sm rounded-full bg-blue-50 px-2 py-1">{p.preco}</span>
                            </div>

                            <div className="mt-3 grid gap-2 text-sm text-gray-700">
                                <div className="flex justify-between">
                                    <span>Agentes Inclusos</span>
                                    <span className="font-medium">{p.agentes}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Validações/Mês</span>
                                    <span className="font-medium">{p.validacoes}</span>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <Button variant="outline" onClick={() => saibaMais(p.id)}>
                                    Saiba mais
                                </Button>
                                <Button onClick={() => escolherPlano(p.id)}>
                                    {p.id === "enterprise" ? "Solicitar" : "Selecionar"}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Rodapé informativo */}
                <p className="mt-8 text-center text-sm text-gray-600">
                    Pagamento disponível via criptomoeda com MetaMask ou tokens de acesso.{" "}
                    <span
                        className="text-yellow-600 font-semibold cursor-pointer hover:underline"
                        onClick={() => navigate("/")}
                    >
                        Conectar Carteira
                    </span>
                </p>
            </div>
        </div>
    );
}
