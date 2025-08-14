import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_FOOTER_CONFIG, FOOTER_CFG_KEY, FooterConfig } from "@/config/footer";

type Ctx = {
    config: FooterConfig;
    setConfig: (cfg: FooterConfig) => void;
    resetConfig: () => void;
};

const FooterConfigContext = createContext<Ctx | null>(null);

export function FooterConfigProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfigState] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(FOOTER_CFG_KEY);
            if (raw) setConfigState({ ...DEFAULT_FOOTER_CONFIG, ...JSON.parse(raw) });
        } catch {
            setConfigState(DEFAULT_FOOTER_CONFIG);
        }
    }, []);

    const setConfig = (cfg: FooterConfig) => {
        setConfigState(cfg);
        try {
            localStorage.setItem(FOOTER_CFG_KEY, JSON.stringify(cfg));
        } catch { }
    };

    const resetConfig = () => setConfig(DEFAULT_FOOTER_CONFIG);

    const value = useMemo(() => ({ config, setConfig, resetConfig }), [config]);
    return <FooterConfigContext.Provider value={value}>{children}</FooterConfigContext.Provider>;
}

export function useFooterConfig() {
    const ctx = useContext(FooterConfigContext);
    if (!ctx) throw new Error("useFooterConfig deve ser usado dentro de <FooterConfigProvider>");
    return ctx;
}
