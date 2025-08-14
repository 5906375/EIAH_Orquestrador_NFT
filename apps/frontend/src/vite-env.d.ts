/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL?: string; // ex.: http://localhost:4000
    readonly VITE_IA_URL?: string;  // ex.: http://localhost:8000
    // adicione aqui outras VITE_* que quiser expor ao cliente
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
