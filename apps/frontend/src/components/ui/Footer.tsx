// apps/frontend/src/components/ui/Footer.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useFooterConfig } from "@/context/FooterConfigContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

function ext(url?: string) {
    if (!url) return null;
    const isHttp = url.startsWith("http://") || url.startsWith("https://");
    return isHttp ? url : `https://${url}`;
}

export default function Footer() {
    const { config } = useFooterConfig();
    const { user, login } = useAuth() as any; // se seu contexto tem login(email, senha)
    const isAdmin = useMemo(() => user?.role === "admin", [user]);
    const navigate = useNavigate();
    const location = useLocation();

    const [openLogin, setOpenLogin] = useState(false);
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [err, setErr] = useState("");

    const year = new Date().getFullYear();
    const l = config.links || {};
    const s = config.social || {};

    const goAdmin = () => {
        if (isAdmin) {
            navigate("/admin/footer");
        } else {
            setOpenLogin(true);
        }
    };

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setErr("");

        try {
            // 1) se seu AuthContext expõe login(email, senha), use-o:
            if (typeof login === "function") {
                await login(email, senha, { redirectTo: "/admin/footer", from: location.pathname });
                navigate("/admin/footer");
                setOpenLogin(false);
                return;
            }

            // 2) fallback simples de DEV com .env do frontend (NÃO usar em prod)
            const ENV_USER = import.meta.env.VITE_ADMIN_USER || "admin@nftdiarias.com";
            const ENV_PASS = import.meta.env.VITE_ADMIN_PASS || "admin123";

            if (email === ENV_USER && senha === ENV_PASS) {
                // você pode salvar um flag simples só pra liberar a navegação local
                localStorage.setItem("demo_admin_logged", "1");
                navigate("/admin/footer");
                setOpenLogin(false);
            } else {
                setErr("Usuário ou senha inválidos.");
            }
        } catch (e: any) {
            setErr(e?.message || "Falha ao autenticar.");
        }
    }

    return (
        <footer className="mt-16 border-t bg-white/60 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-8 grid gap-8 md:grid-cols-3">
                {/* bloco 1 - institucional */}
                <div className="space-y-2">
                    <h4 className="text-base font-semibold">{config.companyName}</h4>
                    {config.address && <p className="text-sm text-gray-600">{config.address}</p>}
                    <ul className="text-sm text-gray-700 space-y-1">
                        {config.email && (
                            <li>
                                E-mail: <a className="underline" href={`mailto:${config.email}`}>{config.email}</a>
                            </li>
                        )}
                        {config.phone && (
                            <li>
                                Telefone: <a className="underline" href={`tel:${config.phone}`}>{config.phone}</a>
                            </li>
                        )}
                        {config.whatsapp && (
                            <li>
                                WhatsApp:{" "}
                                <a
                                    className="underline"
                                    href={`https://wa.me/${config.whatsapp.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {config.whatsapp}
                                </a>
                            </li>
                        )}
                    </ul>

                    {/* Botão Acesso Admin logo abaixo do WhatsApp */}
                    <div className="pt-2">
                        <Button variant="outline" onClick={goAdmin}>
                            Acesso Admin
                        </Button>
                    </div>
                </div>

                {/* bloco 2 - links rápidos */}
                <div>
                    <h4 className="text-base font-semibold">Links</h4>
                    <nav className="mt-2 grid gap-2 text-sm text-gray-700">
                        {l.planos && <Link to={l.planos}>Planos</Link>}
                        {l.termos && <Link to={l.termos}>Termos de Uso</Link>}
                        {l.privacidade && <Link to={l.privacidade}>Privacidade</Link>}
                        {l.cancelamento && <Link to={l.cancelamento}>Cancelamento</Link>}
                        {l.kyc && <Link to={l.kyc}>KYC/AML</Link>}
                        {l.suporte && <Link to={l.suporte}>Suporte</Link>}
                    </nav>
                </div>

                {/* bloco 3 - social */}
                <div>
                    <h4 className="text-base font-semibold">Social</h4>
                    <ul className="mt-2 grid gap-2 text-sm text-gray-700">
                        {s.site && <li><a className="underline" href={ext(s.site) || "#"} target="_blank" rel="noreferrer">Site</a></li>}
                        {s.instagram && <li><a className="underline" href={ext(s.instagram) || "#"} target="_blank" rel="noreferrer">Instagram</a></li>}
                        {s.x && <li><a className="underline" href={ext(s.x) || "#"} target="_blank" rel="noreferrer">X (Twitter)</a></li>}
                        {s.linkedin && <li><a className="underline" href={ext(s.linkedin) || "#"} target="_blank" rel="noreferrer">LinkedIn</a></li>}
                        {s.youtube && <li><a className="underline" href={ext(s.youtube) || "#"} target="_blank" rel="noreferrer">YouTube</a></li>}
                    </ul>
                </div>
            </div>

            {/* Modal Login */}
            {openLogin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-semibold">Login do Admin</h3>
                        <p className="mt-1 text-sm text-gray-600">Informe usuário e senha para acessar o painel.</p>

                        <form onSubmit={handleLogin} className="mt-4 grid gap-3">
                            <label className="grid gap-1">
                                <span className="text-xs text-gray-600">Usuário (e-mail)</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="rounded-md border px-3 py-2"
                                    placeholder="admin@nftdiarias.com"
                                    required
                                />
                            </label>
                            <label className="grid gap-1">
                                <span className="text-xs text-gray-600">Senha</span>
                                <input
                                    type="password"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="rounded-md border px-3 py-2"
                                    placeholder="••••••••"
                                    required
                                />
                            </label>
                            {err && <div className="text-sm text-red-600">{err}</div>}

                            <div className="mt-1 flex items-center justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setOpenLogin(false)}>Cancelar</Button>
                                <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">Entrar</Button>
                            </div>
                        </form>

                        <div className="mt-3 text-xs text-gray-500">
                            Dica: em produção, direcione este login para sua API real (ex.: <code>/api/auth/login</code>).
                        </div>
                    </div>
                </div>
            )}

            <div className="border-t">
                <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-gray-600 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <p>© {year} {config.companyName}. Todos os direitos reservados.</p>
                    <p className="text-[11px]">
                        Operamos como <strong>marketplace puro (intermediação)</strong>. ISS sobre a comissão.
                    </p>
                </div>
            </div>
        </footer>
    );
}
