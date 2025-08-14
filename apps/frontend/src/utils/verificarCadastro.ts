// apps/frontend/src/utils/verificarCadastro.ts
import axios from "axios";

// 🔹 Configuração central da API
const api = axios.create({
    baseURL: "http://localhost:4000/api",
    timeout: 8000, // 8 segundos para evitar travar caso o backend caia
});

/**
 * Verifica se existe cadastro para a carteira informada.
 * Retorna apenas true/false.
 */
export async function verificarCadastro(wallet: string): Promise<boolean> {
    const w = String(wallet || "").toLowerCase();
    if (!w) {
        console.warn("⚠️ verificarCadastro chamado sem wallet");
        return false;
    }

    try {
        const { data } = await api.get(`/perfis/wallet/${encodeURIComponent(w)}`);
        return Boolean(data?._id || data?.idPerfil);
    } catch (error: any) {
        const status = error?.response?.status;
        const resp = error?.response?.data;
        console.error(
            "❌ Erro ao verificar cadastro:",
            status,
            typeof resp === "string" ? resp : JSON.stringify(resp, null, 2)
        );
        // 404 = não cadastrado (fluxo normal)
        return false;
    }
}

/**
 * Busca perfil e retorna mais contexto (para uso no frontend).
 * Retorna objeto { exists: boolean; perfil?: any }
 */
export async function buscarPerfil(wallet: string): Promise<{ exists: boolean; perfil?: any }> {
    const w = String(wallet || "").toLowerCase();
    if (!w) return { exists: false };

    try {
        const { data } = await api.get(`/perfis/wallet/${encodeURIComponent(w)}`);
        return { exists: true, perfil: data };
    } catch (error: any) {
        const status = error?.response?.status;
        const resp = error?.response?.data;
        if (status !== 404) {
            console.error(
                "❌ Erro ao buscar perfil:",
                status,
                typeof resp === "string" ? resp : JSON.stringify(resp, null, 2)
            );
        }
        return { exists: false };
    }
}
