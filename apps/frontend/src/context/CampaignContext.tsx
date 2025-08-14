import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

export type CampanhaStatus = "Planejado" | "Em produção" | "Aprovado" | "Publicado";

export type ItemCampanha = {
    id: string | number;
    Data: string;          // "dd/mm/aaaa"
    Tema: string;
    Formato: string;
    Responsável: string;
    Status: CampanhaStatus;
};

export type CampanhaStats = {
    total?: number;
    planejado?: number;
    emProducao?: number;
    aprovado?: number;
    publicado?: number;
};

type Ctx = {
    itens: ItemCampanha[];
    setItens: React.Dispatch<React.SetStateAction<ItemCampanha[]>>;
    stats: CampanhaStats | null;
    carregando: boolean;
    salvando: boolean;
    carregar: () => Promise<void>;
    salvarItem: (item: ItemCampanha) => Promise<void>;
    salvarTudo: () => Promise<void>;
};

const CampaignContext = createContext<Ctx | null>(null);

export function CampaignProvider({ children }: { children: React.ReactNode }) {
    const [itens, setItens] = useState<ItemCampanha[]>([]);
    const [stats, setStats] = useState<CampanhaStats | null>(null);
    const [carregando, setCarregando] = useState<boolean>(true);
    const [salvando, setSalvando] = useState<boolean>(false);

    const carregar = async () => {
        try {
            setCarregando(true);
            const [campRes, statsRes] = await Promise.allSettled([
                axios.get<ItemCampanha[]>("/api/campanha"),
                axios.get<CampanhaStats>("/api/campanha/stats"),
            ]);
            if (campRes.status === "fulfilled") setItens(campRes.value.data || []);
            if (statsRes.status === "fulfilled") setStats(statsRes.value.data || null);

            // cache local (opcional)
            try {
                localStorage.setItem("campanha_cache", JSON.stringify(campRes.status === "fulfilled" ? campRes.value.data : []));
                localStorage.setItem("campanha_stats_cache", JSON.stringify(statsRes.status === "fulfilled" ? statsRes.value.data : {}));
            } catch { }
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        // tenta hidratar do cache antes de buscar
        try {
            const raw = localStorage.getItem("campanha_cache");
            if (raw) setItens(JSON.parse(raw));
            const rawStats = localStorage.getItem("campanha_stats_cache");
            if (rawStats) setStats(JSON.parse(rawStats));
        } catch { }
        carregar();
    }, []);

    const salvarItem = async (item: ItemCampanha) => {
        // atualização otimista
        setItens(prev => prev.map(i => (i.id === item.id ? item : i)));
        try {
            setSalvando(true);
            await axios.put(`/api/campanha/${item.id}`, { Status: item.Status });
        } catch (e) {
            // rollback simples
            await carregar();
            throw e;
        } finally {
            setSalvando(false);
        }
    };

    const salvarTudo = async () => {
        try {
            setSalvando(true);
            await Promise.all(itens.map(i => axios.put(`/api/campanha/${i.id}`, { Status: i.Status })));
            await carregar();
        } finally {
            setSalvando(false);
        }
    };

    const value = useMemo<Ctx>(() => ({
        itens, setItens, stats, carregando, salvando, carregar, salvarItem, salvarTudo
    }), [itens, stats, carregando, salvando]);

    return <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>;
}

export function useCampaign() {
    const ctx = useContext(CampaignContext);
    if (!ctx) throw new Error("useCampaign deve ser usado dentro de <CampaignProvider>");
    return ctx;
}
