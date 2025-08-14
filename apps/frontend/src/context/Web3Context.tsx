import React, { createContext, useContext, useEffect, useState } from "react";


interface Web3ContextType {
    carteira: string | null;
    conectarCarteira: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
    carteira: null,
    conectarCarteira: async () => { },
});

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
    const [carteira, setCarteira] = useState<string | null>(null);

    const conectarCarteira = async () => {
        if (window.ethereum) {
            try {
                const contas = await window.ethereum.request({ method: "eth_requestAccounts" });
                if (contas.length > 0) {
                    setCarteira(contas[0]);
                }
            } catch (err) {
                console.error("Erro ao conectar carteira:", err);
            }
        }
    };

    useEffect(() => {
        const ethereum = window.ethereum as any;

        if (ethereum) {
            ethereum.request({ method: "eth_accounts" }).then((contas: string[]) => {
                if (contas.length > 0) {
                    setCarteira(contas[0]);
                }
            });

            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length === 0) {
                    setCarteira(null);
                } else {
                    setCarteira(accounts[0]);
                }
            };

            ethereum.on("accountsChanged", handleAccountsChanged);

            return () => {
                ethereum.removeListener("accountsChanged", handleAccountsChanged);
            };
        }
    }, []);


    return (
        <Web3Context.Provider value={{ carteira, conectarCarteira }}>
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3 = () => useContext(Web3Context);
