// src/types/global.d.ts

export { };

declare global {
    interface EthereumProvider {
        request: (args: { method: string }) => Promise<any>;
        on: (event: string, handler: (...args: any[]) => void) => void;
        removeListener: (event: string, handler: (...args: any[]) => void) => void;
    }

    interface Window {
        ethereum?: EthereumProvider;
    }
}
