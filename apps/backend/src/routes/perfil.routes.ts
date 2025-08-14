import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Perfil from "../models/Perfil";

const router = Router();

/* ===== Multer setup ===== */
const uploadDir = path.resolve(process.cwd(), "uploads/documentos");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

// aceita nomes novos e legados
const upload = multer({ storage });

/**
 * POST /api/perfis
 * - Campos texto: nome*, tipoPessoa* ("Física"|"Jurídica"), telefone*, wallet*, linkExterno
 * - Endereço: JSON em `endereco` OU campos achatados
 * - Arquivos: "documento" (principal), "docIdentidade" (legado), "comprovanteEndereco" (opcional)
 *
 * Idempotente:
 *  - Se a wallet já tem perfil, ATUALIZA campos recebidos e retorna 200
 *  - Se não tem, cria e retorna 201
 */
router.post(
  "/",
  upload.fields([
    { name: "documento", maxCount: 1 },
    { name: "docIdentidade", maxCount: 1 },
    { name: "comprovanteEndereco", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const { nome, tipoPessoa, telefone, wallet, linkExterno, endereco } = req.body as any;

      if (!nome)    return res.status(400).json({ message: "Nome é obrigatório" });
      if (!telefone)return res.status(400).json({ message: "Telefone é obrigatório" });
      if (!wallet)  return res.status(400).json({ message: "Wallet é obrigatória" });

      const walletLower = String(wallet).toLowerCase();

      // normaliza tipoPessoa pro enum com acento
      const tp = String(tipoPessoa || "").toUpperCase();
      const tipoNormalizado =
        tp === "FISICA" ? "Física" :
        tp === "JURIDICA" ? "Jurídica" :
        (tipoPessoa === "Física" || tipoPessoa === "Jurídica") ? tipoPessoa : undefined;

      // endereço tolerante (aceita JSON e campos achatados/legados)
      let enderecoObj: any = {};
      try {
        if (typeof endereco === "string" && endereco.trim()) {
          const parsed = JSON.parse(endereco);
          enderecoObj = {
            cep:     parsed.cep     ?? req.body["endereco.cep"],
            rua:     parsed.rua     ?? parsed.logradouro ?? req.body["endereco.rua"] ?? req.body["endereco.logradouro"] ?? req.body.endereco,
            numero:  parsed.numero  ?? req.body["endereco.numero"] ?? req.body.numero,
            bairro:  parsed.bairro  ?? req.body["endereco.bairro"] ?? req.body.bairro,
            cidade:  parsed.cidade  ?? req.body["endereco.cidade"] ?? req.body.cidade,
            estado:  parsed.estado  ?? parsed.uf ?? req.body["endereco.estado"] ?? req.body["endereco.uf"] ?? req.body.estado,
          };
        } else {
          enderecoObj = {
            cep:     req.body["endereco.cep"] ?? req.body.cep,
            rua:     req.body["endereco.rua"] ?? req.body["endereco.logradouro"] ?? req.body.endereco,
            numero:  req.body["endereco.numero"] ?? req.body.numero,
            bairro:  req.body["endereco.bairro"] ?? req.body.bairro,
            cidade:  req.body["endereco.cidade"] ?? req.body.cidade,
            estado:  req.body["endereco.estado"] ?? req.body["endereco.uf"] ?? req.body.estado,
          };
        }
      } catch {
        enderecoObj = {};
      }

      // arquivos recebidos
      const files = req.files as { [k: string]: Express.Multer.File[] } | undefined;
      const documentoPath            = files?.documento?.[0]?.path        || files?.docIdentidade?.[0]?.path || undefined;
      const docIdentidadePathLegacy  = files?.docIdentidade?.[0]?.path     || undefined;
      const comprovanteEnderecoPath  = files?.comprovanteEndereco?.[0]?.path || undefined;

      /* ========== IDEMPOTENTE: se existir, atualiza e retorna 200 ========== */
      const existente = await Perfil.findOne({ wallet: walletLower });
      if (existente) {
        // merge seguro: só substitui se veio valor novo
        if (nome) existente.nome = nome;
        if (telefone) existente.telefone = telefone;
        if (typeof tipoNormalizado !== "undefined") existente.tipoPessoa = tipoNormalizado;
        if (linkExterno !== undefined) existente.linkExterno = linkExterno;

        // arquivos: se mandar de novo, trocamos os paths
        if (documentoPath) existente.documento = documentoPath;
        if (docIdentidadePathLegacy) existente.docIdentidade = docIdentidadePathLegacy;
        if (comprovanteEnderecoPath) existente.comprovanteEndereco = comprovanteEnderecoPath;

        // endereço: faz merge campo a campo, sem apagar os já salvos
        existente.endereco = {
          cep:    enderecoObj.cep    ?? existente.endereco?.cep,
          rua:    enderecoObj.rua    ?? existente.endereco?.rua,
          numero: enderecoObj.numero ?? existente.endereco?.numero,
          bairro: enderecoObj.bairro ?? existente.endereco?.bairro,
          cidade: enderecoObj.cidade ?? existente.endereco?.cidade,
          estado: enderecoObj.estado ?? existente.endereco?.estado,
        } as any;

        await existente.save();
        return res.status(200).json(existente);
      }

      /* ========== CRIAÇÃO (não existe ainda) ========== */
      if (!documentoPath) {
        return res.status(400).json({ message: "Documento (documento/docIdentidade) é obrigatório" });
      }

      const payload = {
        nome,
        tipoPessoa: tipoNormalizado || "Física",
        documento: documentoPath, // requerido pelo schema
        telefone,
        wallet: walletLower,
        endereco: {
          cep:    enderecoObj.cep    ?? "",
          rua:    enderecoObj.rua    ?? "",
          numero: enderecoObj.numero ?? "",
          bairro: enderecoObj.bairro ?? "",
          cidade: enderecoObj.cidade ?? "",
          estado: enderecoObj.estado ?? "",
        },
        docIdentidade: docIdentidadePathLegacy,
        comprovanteEndereco: comprovanteEnderecoPath,
        linkExterno: linkExterno || undefined,
      };

      console.info("🧪 Criando perfil com payload:", JSON.stringify(payload, null, 2));
      const perfil = await Perfil.create(payload);
      return res.status(201).json(perfil);
    } catch (err: any) {
      console.error("POST /api/perfis erro RAW:", {
        message: err?.message,
        name: err?.name,
        code: err?.code,
        stack: err?.stack,
        errors: err?.errors,
      });

      if (err?.code === 11000) {
        // índice único de wallet — retorna existente
        const existente = await Perfil.findOne({ wallet: String(req.body.wallet || "").toLowerCase() });
        return res.status(200).json(existente);
      }
      if (err?.name === "ValidationError") {
        return res.status(400).json({ message: "Campos inválidos", detalhes: err?.errors });
      }
      return res.status(500).json({ message: "Erro interno ao salvar perfil" });
    }
  }
);

/**
 * GET /api/perfis/wallet/:wallet
 * Buscar perfil por carteira
 */
router.get("/wallet/:wallet", async (req: Request, res: Response) => {
  try {
    const walletLower = String(req.params.wallet || "").toLowerCase();
    if (!walletLower) {
      return res.status(400).json({ message: "Wallet é obrigatória" });
    }

    const perfil = await Perfil.findOne({ wallet: walletLower });
    if (!perfil) return res.status(404).json({ message: "Perfil não encontrado" });

    return res.json(perfil);
  } catch (err: any) {
    console.error("GET /api/perfis/wallet erro:", err?.message, err?.stack);
    return res.status(500).json({ message: "Erro ao buscar perfil" });
  }
});

export default router;
