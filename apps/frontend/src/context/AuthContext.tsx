// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type Role = "admin" | "user";
type User = { id: string; name: string; role: Role };

type AuthCtx = {
    user: User | null;
    loading: boolean;
    login: (token?: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // hidrata de storage ou chama sua API de sessão
    useEffect(() => {
        try {
            const raw = localStorage.getItem("session_user");
            if (raw) setUser(JSON.parse(raw));
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (_token?: string) => {
        // TODO: trocar pela sua chamada real (ex: /api/session/me)
        const mock: User = { id: "1", name: "Admin", role: "admin" };
        setUser(mock);
        localStorage.setItem("session_user", JSON.stringify(mock));
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem("session_user");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
    return ctx;
}
