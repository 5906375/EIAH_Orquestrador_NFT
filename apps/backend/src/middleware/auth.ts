import { Request, Response, NextFunction } from "express";

export function autenticarWallet(req: Request, res: Response, next: NextFunction) {
    const wallet =
        (req.headers["x-wallet-address"] as string) ||
        req.body?.perfil?.wallet ||
        req.body?.wallet;

    if (!wallet || !wallet.startsWith("0x") || wallet.length !== 42) {
        return res.status(401).json({ erro: "Carteira inválida ou não informada." });
    }

    // opcional: normalizar (checksum)
    // import { getAddress } from "ethers";  req.user!.wallet = getAddress(wallet);

    req.user = { wallet };      // ✅ agora a rota pode usar req.user.wallet
    req.body.wallet = wallet;   // mantém compatibilidade com quem lê do body
    next();
}
