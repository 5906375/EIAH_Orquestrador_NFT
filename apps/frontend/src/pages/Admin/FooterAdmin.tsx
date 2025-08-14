// apps/frontend/src/pages/admin/FooterAdmin.tsx
import { useFooterConfig } from "@/context/FooterConfigContext";
import { useEffect, useMemo, useState } from "react";
import { FooterConfig } from "@/config/footer";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import SocialCampaignWeb3 from "./SocialCampaignWeb3";

/* ---------------- Tipos ---------------- */
type CampanhaStats = {
  total?: number;
  planejado?: number;
  emProducao?: number;
  aprovado?: number;
  publicado?: number;
};

type Campanha = {
  id: string;          // usado na rota: /admin/campanha/:id
  titulo: string;
  descricao?: string;
};

/* --------- Cartões de Métrica --------- */
function CardMetric({ titulo, valor }: { titulo: string; valor: string | number }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-gray-500">{titulo}</div>
      <div className="text-xl font-bold">{valor}</div>
    </div>
  );
}

/* --------- Card de Campanha --------- */
function CampaignCard({
  campanha,
  stats,
  loadingStats,
  onDeleted,
}: {
  campanha: { id: string; titulo: string; descricao?: string };
  stats?: CampanhaStats | null;
  loadingStats: boolean;
  onDeleted: (id: string) => void;
}) {
  type Status = "planejado" | "emProducao" | "aprovado" | "publicado";
  type Item = {
    id: string;
    titulo: string;
    responsavel: string;
    status: Status;
    data?: string; // ISO
  };

  const navigate = useNavigate();

  // edição (título/descrição)
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [titulo, setTitulo] = useState(campanha.titulo);
  const [descricao, setDescricao] = useState(campanha.descricao || "");
  const [msg, setMsg] = useState("");

  // visualização de dados
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);

  // filtros
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState<Status | "todos">("todos");

  const statuses: { key: Status; label: string }[] = [
    { key: "planejado",   label: "Planejado" },
    { key: "emProducao",  label: "Em produção" },
    { key: "aprovado",    label: "Aprovado" },
    { key: "publicado",   label: "Publicado" },
  ];

  function voltar() {
    if (window.history.length > 1) navigate(-1);
    else navigate("/admin");
  }

  async function salvar() {
    try {
      setSaving(true);
      setMsg("");
      await axios.put(`/api/campanha/${campanha.id}`, { titulo, descricao });
      setMsg("Alterações salvas.");
      setEdit(false);
    } catch (e: any) {
      setMsg(e?.response?.data?.erro || "Falha ao salvar a campanha.");
    } finally {
      setSaving(false);
    }
  }

  async function excluir() {
    if (!confirm("Tem certeza que deseja excluir esta campanha?")) return;
    try {
      setDeleting(true);
      setMsg("");
      await axios.delete(`/api/campanha/${campanha.id}`);
      onDeleted(campanha.id);
    } catch (e: any) {
      setMsg(e?.response?.data?.erro || "Falha ao excluir a campanha.");
    } finally {
      setDeleting(false);
    }
  }

  // carrega dados ao abrir pela 1ª vez
  useEffect(() => {
    if (!open || loadedOnce) return;
    (async () => {
      try {
        setLoadingItems(true);
        setMsg("");
        const { data } = await axios.get(`/api/campanha/${campanha.id}/dados`);
        // espera { itens: Item[] }
        setItems(Array.isArray(data?.itens) ? data.itens : []);
        setLoadedOnce(true);
      } catch (e: any) {
        setMsg(e?.response?.data?.erro || "Falha ao carregar dados da campanha.");
        // fallback de DEV (remove se não quiser)
        setItems([
          { id: "1", titulo: "Post lançamento", responsavel: "Ana", status: "planejado",  data: "2025-08-01" },
          { id: "2", titulo: "Reels bastidores", responsavel: "João", status: "emProducao", data: "2025-08-02" },
          { id: "3", titulo: "Carrossel features", responsavel: "Ana", status: "aprovado",  data: "2025-08-03" },
          { id: "4", titulo: "Stories depoimento", responsavel: "Paula", status: "publicado", data: "2025-08-04" },
        ]);
        setLoadedOnce(true);
      } finally {
        setLoadingItems(false);
      }
    })();
  }, [open, loadedOnce, campanha.id]);

  // filtros aplicados
  const filtered = items.filter((it) => {
    const okStatus = fStatus === "todos" ? true : it.status === fStatus;
    const okQ =
      !q ||
      it.titulo.toLowerCase().includes(q.toLowerCase()) ||
      it.responsavel.toLowerCase().includes(q.toLowerCase());
    return okStatus && okQ;
  });

  // resumo por status
  const sum = statuses.map((s) => ({
    key: s.key,
    label: s.label,
    n: items.filter((i) => i.status === s.key).length,
  }));
  const total = items.length || 1;

  return (
    <section className="grid gap-4 rounded-2xl border bg-white p-5">
      {/* Cabeçalho + ações */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          {edit ? (
            <div className="grid gap-2">
              <input
                className="rounded-md border px-3 py-2"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título da campanha"
              />
              <input
                className="rounded-md border px-3 py-2"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição (opcional)"
              />
            </div>
          ) : (
            <>
              <h2 className="font-semibold truncate">{campanha.titulo}</h2>
              {campanha.descricao && (
                <p className="text-sm text-gray-600">{campanha.descricao}</p>
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={voltar}>Voltar</Button>
          {!edit ? (
            <Button onClick={() => setEdit(true)}>Alterar</Button>
          ) : (
            <Button onClick={salvar} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          )}
          <Button onClick={excluir} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
            {deleting ? "Excluindo..." : "Excluir"}
          </Button>
          <Button onClick={() => setOpen((v) => !v)} className="bg-slate-800 text-white hover:bg-slate-900">
            {open ? "Ocultar dados" : "Visualizar dados"}
          </Button>
          <Link to={`/admin/campanha/${campanha.id}`}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Gerenciar Campanha</Button>
          </Link>
        </div>
      </div>

      {msg && <div className="text-sm text-gray-600">{msg}</div>}

      {/* Métricas resumidas (topo) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <CardMetric titulo="Total"       valor={loadingStats ? "…" : stats?.total ?? "—"} />
        <CardMetric titulo="Planejado"   valor={loadingStats ? "…" : stats?.planejado ?? "—"} />
        <CardMetric titulo="Em produção" valor={loadingStats ? "…" : stats?.emProducao ?? "—"} />
        <CardMetric titulo="Aprovado"    valor={loadingStats ? "…" : stats?.aprovado ?? "—"} />
        <CardMetric titulo="Publicado"   valor={loadingStats ? "…" : stats?.publicado ?? "—"} />
      </div>

      {/* ======= VISUALIZAÇÃO DE DADOS ======= */}
      {open && (
        <div className="mt-2 grid gap-4">
          {/* Resumo por status */}
          <div className="rounded-xl border p-3">
            <div className="text-sm font-medium mb-2">Resumo</div>
            <div className="space-y-2">
              {sum.map((s) => (
                <div key={s.key} className="grid grid-cols-5 items-center gap-3">
                  <div className="col-span-1 text-sm text-gray-700">{s.label}</div>
                  <div className="col-span-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-indigo-600"
                      style={{ width: `${(s.n / total) * 100}%` }}
                    />
                  </div>
                  <div className="col-span-1 text-right text-sm text-gray-700">{s.n}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <input
              className="rounded-md border px-3 py-2 w-full md:w-1/2"
              placeholder="Buscar por título ou responsável…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="rounded-md border px-3 py-2 w-full md:w-52"
              value={fStatus}
              onChange={(e) => setFStatus(e.target.value as any)}
            >
              <option value="todos">Todos os status</option>
              {statuses.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto rounded-xl border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left">Título</th>
                  <th className="px-3 py-2 text-left">Responsável</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Data</th>
                </tr>
              </thead>
              <tbody>
                {loadingItems ? (
                  <tr><td className="px-3 py-4 text-gray-500" colSpan={4}>Carregando…</td></tr>
                ) : filtered.length ? (
                  filtered.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="px-3 py-2">{it.titulo}</td>
                      <td className="px-3 py-2">{it.responsavel}</td>
                      <td className="px-3 py-2">
                        {{
                          planejado: "Planejado",
                          emProducao: "Em produção",
                          aprovado: "Aprovado",
                          publicado: "Publicado",
                        }[it.status]}
                      </td>
                      <td className="px-3 py-2">{it.data ? new Date(it.data).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="px-3 py-4 text-gray-500" colSpan={4}>Nenhum item encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
/* -------- Cabeçalho com Voltar -------- */
function HeaderWithBack({ title }: { title: string }) {
  const { config } = useFooterConfig();

  // normaliza a URL do site, se houver
  const raw = config.social?.site?.trim();
  const site =
    raw && (raw.startsWith("http://") || raw.startsWith("https://"))
      ? raw
      : raw
        ? `https://${raw}`
        : "/";

  const isExternal = site.startsWith("http");

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {isExternal ? (
          <a
            href={site}
            className="text-sm text-indigo-600 hover:underline"
            rel="noopener noreferrer"
          >
            Voltar 
          </a>
        ) : (
          <Link to={site} className="text-sm text-indigo-600 hover:underline">
            Voltar
          </Link>
        )}
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
    </div>
  );
}

/* --------------- PÁGINA --------------- */
export default function FooterAdmin() {
  const { config, setConfig, resetConfig } = useFooterConfig();
  const [form, setForm] = useState<FooterConfig>(config);

  const { user, loading } = useAuth();
  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  // campanhas (adicione mais aqui quando quiser)
  const [campanhas, setCampanhas] = useState<Campanha[]>([
    {
      id: "social",
      titulo: "Campanha (Social)",
      descricao:
        "Consulte e altere o status da campanha (calendário, responsáveis e publicações).",
    },
  ]);

  const [stats, setStats] = useState<CampanhaStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const up = (k: keyof FooterConfig, v: any) => setForm({ ...form, [k]: v });
  const upNested = (k: "links" | "social", f: string, v: string) =>
    setForm({ ...form, [k]: { ...(form[k] || {}), [f]: v } });
  const onSave = () => setConfig(form);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const { data } = await axios.get("/api/campanha/stats");
        setStats(data || null);
      } catch {
        setStats(null);
      } finally {
        setLoadingStats(false);
      }
    };
    if (isAdmin) fetchStats();
  }, [isAdmin]);

  function removeCampanhaLocally(id: string) {
    setCampanhas((prev) => prev.filter((c) => c.id !== id));
  }

  const l = form.links || {};
  const s = form.social || {};

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <HeaderWithBack title="Admin • Rodapé" />

      {/* Cards de campanha existentes */}
      {!loading && isAdmin &&
        campanhas.map((c) => (
          <CampaignCard
            key={c.id}
            campanha={c}
            stats={stats}
            loadingStats={loadingStats}
            onDeleted={removeCampanhaLocally}
          />
        ))}

      {/* ✅ NOVO BLOCO — Campanha (Social) — Engajamento Web3 */}
      <section id="web3">
        <SocialCampaignWeb3 />
      </section>

      {/* Institucional */}
      <section className="grid gap-4 rounded-2xl border bg-white p-5">
        <h2 className="font-semibold">Institucional</h2>
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Nome da empresa</span>
          <input
            value={form.companyName}
            onChange={(e) => up("companyName", e.target.value)}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">E-mail</span>
          <input
            value={form.email || ""}
            onChange={(e) => up("email", e.target.value)}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Telefone</span>
            <input
              value={form.phone || ""}
              onChange={(e) => up("phone", e.target.value)}
              className="rounded-md border px-3 py-2"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">WhatsApp (apenas números)</span>
            <input
              value={form.whatsapp || ""}
              onChange={(e) => up("whatsapp", e.target.value)}
              className="rounded-md border px-3 py-2"
            />
          </label>
        </div>
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Endereço</span>
          <input
            value={form.address || ""}
            onChange={(e) => up("address", e.target.value)}
            className="rounded-md border px-3 py-2"
          />
        </label>
      </section>

      {/* Links rápidos */}
      <section className="grid gap-4 rounded-2xl border bg-white p-5">
        <h2 className="font-semibold">Links rápidos</h2>
        {["planos", "termos", "privacidade", "cancelamento", "kyc", "suporte"].map((k) => (
          <label key={k} className="grid gap-1">
            <span className="text-sm text-gray-600">{k.toUpperCase()}</span>
            <input
              value={(l?.[k as keyof NonNullable<typeof l>] as string) || ""}
              onChange={(e) => upNested("links", k, e.target.value)}
              className="rounded-md border px-3 py-2"
            />
          </label>
        ))}
      </section>

      {/* Redes sociais */}
      <section className="grid gap-4 rounded-2xl border bg-white p-5">
        <h2 className="font-semibold">Redes sociais</h2>
        {["site", "instagram", "x", "linkedin", "youtube"].map((k) => (
          <label key={k} className="grid gap-1">
            <span className="text-sm text-gray-600">{k.toUpperCase()}</span>
            <input
              value={(s?.[k as keyof NonNullable<typeof s>] as string) || ""}
              onChange={(e) => upNested("social", k, e.target.value)}
              className="rounded-md border px-3 py-2"
              placeholder="https://..."
            />
          </label>
        ))}
      </section>

      <div className="flex gap-3">
        <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700 text-white">
          Salvar
        </Button>
        <Button onClick={resetConfig} className="bg-gray-200 text-gray-800 hover:bg-gray-300">
          Restaurar padrão
        </Button>
      </div>
    </div>
  );
}

