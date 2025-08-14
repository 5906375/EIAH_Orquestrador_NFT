// apps/backend/src/routes/campanha.routes.ts
import { Router } from "express";
const r = Router();

r.get("/stats", (_req, res) => {
    res.json({ total: 12, planejado: 5, emProducao: 3, aprovado: 2, publicado: 2 });
});

// 🔽 dados da campanha (exemplo / mock)
r.get("/:id/dados", (req, res) => {
    const { id } = req.params;
    // TODO: trocar por busca real no Mongo
    const itens = [
        { id: "1", titulo: "Post de lançamento", responsavel: "Ana", status: "planejado", data: "2025-08-01" },
        { id: "2", titulo: "Reels bastidores", responsavel: "João", status: "emProducao", data: "2025-08-02" },
        { id: "3", titulo: "Carrossel features", responsavel: "Ana", status: "aprovado", data: "2025-08-03" },
        { id: "4", titulo: "Stories depoimento", responsavel: "Paula", status: "publicado", data: "2025-08-04" },
    ];
    res.json({ id, itens });
});

r.put("/:id", (req, res) => {
    const { id } = req.params;
    const { titulo, descricao } = req.body;
    // TODO: persistir no DB
    res.json({ ok: true, id, titulo, descricao });
});

r.delete("/:id", (req, res) => {
    const { id } = req.params;
    // TODO: excluir no DB
    res.json({ ok: true, id });
});

export default r;
