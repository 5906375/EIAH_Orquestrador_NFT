const KEY = "nftdiarias_termos_aceitos_v1";

export function getTermosAceitos(): boolean {
    try {
        return localStorage.getItem(KEY) === "true";
    } catch {
        return false;
    }
}

export function setTermosAceitos(value: boolean) {
    try {
        localStorage.setItem(KEY, value ? "true" : "false");
    } catch { }
}
