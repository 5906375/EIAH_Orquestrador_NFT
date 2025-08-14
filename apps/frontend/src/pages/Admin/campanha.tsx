// apps/frontend/src/pages/Admin/campanha.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useCampaign } from "@/context/CampaignContext";
import type { ItemCampanha, CampanhaStatus } from "@/context/CampaignContext";

const STATUS_OPCOES: CampanhaStatus[] = ["Planejado", "Em produção", "Aprovado", "Publicado"];

export default function CampanhaAdmin() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const { itens, setItens, stats, carregando, salvando, salvarItem, salvarTudo } = useCampaign();

    const [filtro, setFiltro] = useState("");
    const [statusFiltro, setStatusFiltro] = useState("");

    useEffect(() => {
        if (!loading) {
            if (!user) navigate("/login?next=/admin/campanha");
            else if (user.role !== "admin") navigate("/");
        }
    }, [user, loading, navigate]);

    const itensFiltrados = useMemo(() => {
        const f = filtro.trim().toLowerCase();
        return itens.filter((i) => {
            const matchTexto =
                !f ||
                i.Tema.toLowerCase().includes(f) ||
                i.Formato.toLowerCase().includes(f) ||
                i.Responsável.toLowerCase().includes(f) ||
                i.Data.toLowerCase().includes(f);
            const matchStatus = !statusFiltro || i.Status === statusFiltro;
            return matchTexto && matchStatus;
        });
    }, [itens, filtro, statusFiltro]);

    const atualizarStatusLocal = (id: ItemCampanha["id"], novo: CampanhaStatus) => {
        setItens(prev => prev.map(i => (i.id === id ? { ...i, Status: novo } : i)));
    };

    if (loading || carregando) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Gerenciar Campanha</h1>
                <div className="text-gray-600">Carregando…</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Gerenciar Campanha</h1>
                <Button
                    onClick={async () => {
                        try { await salvarTudo(); toast.success("Campanha atualizada."); }
                        catch { toast.error("Falha ao salvar."); }
                    }}
                    disabled={salvando}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    {salvando ? "Salvando…" : "Salvar tudo"}
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <CardMetric titulo="Total" valor={stats?.total} />
                <CardMetric titulo="Planejado" valor={stats?.planejado} />
                <CardMetric titulo="Em produção" valor={stats?.emProducao} />
                <CardMetric titulo="Aprovado" valor={stats?.aprovado} />
                <CardMetric titulo="Publicado" valor={stats?.publicado} />
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
                <div className="grid gap-1">
                    <span className="text-sm text-gray-600">Buscar</span>
                    <input
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        placeholder="Tema, Formato, Responsável ou Data"
                        className="rounded-md border px-3 py-2 w-72"
                    />
                </div>
                <div className="grid gap-1">
                    <span className="text-sm text-gray-600">Status</span>
                    <select
                        value={statusFiltro}
                        onChange={(e) => setStatusFiltro(e.target.value)}
                        className="rounded-md border px-3 py-2"
                    >
                        <option value="">Todos</option>
                        {STATUS_OPCOES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="bg-gray-50 text-left text-sm">
                            <Th>Data</Th><Th>Tema</Th><Th>Formato</Th><Th>Responsável</Th><Th>Status</Th><Th className="text-right pr-4">Ações</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {itensFiltrados.map((item) => (
                            <tr key={item.id} className="border-t text-sm">
                                <Td>{item.Data}</Td>
                                <Td className="max-w-[380px]"><div className="line-clamp-2">{item.Tema}</div></Td>
                                <Td>{item.Formato}</Td>
                                <Td>{item.Responsável}</Td>
                                <Td>
                                    <select
                                        value={item.Status}
                                        onChange={(e) => atualizarStatusLocal(item.id, e.target.value as CampanhaStatus)}
                                        className="rounded-md border px-2 py-1"
                                    >
                                        {STATUS_OPCOES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </Td>
                                <Td className="text-right pr-4">
                                    <Button
                                        onClick={async () => {
                                            try { await salvarItem(item); toast.success("Status atualizado."); }
                                            catch { toast.error("Falha ao salvar. Alteração desfeita."); }
                                        }}
                                        disabled={salvando}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Salvar
                                    </Button>
                                </Td>
                            </tr>
                        ))}
                        {itensFiltrados.length === 0 && (
                            <tr><td colSpan={6} className="p-6 text-center text-gray-500">Nenhum item encontrado.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function CardMetric({ titulo, valor }: { titulo: string; valor?: number }) {
    return (
        <div className="rounded-xl border p-3">
            <div className="text-xs text-gray-500">{titulo}</div>
            <div className="text-xl font-bold">{valor ?? "—"}</div>
        </div>
    );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <th className={`px-4 py-3 font-semibold ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
