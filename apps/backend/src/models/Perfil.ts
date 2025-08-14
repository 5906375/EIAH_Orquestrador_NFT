// apps/backend/src/models/Perfil.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPerfil extends Document {
    nome: string;
    tipoPessoa: "Física" | "Jurídica";
    documento: string;
    telefone: string;
    wallet: string;
    endereco?: {
        cep?: string;
        rua?: string;
        numero?: string;
        bairro?: string;
        cidade?: string;
        estado?: string;
    };
    docIdentidade?: string;
    comprovanteEndereco?: string;
    linkExterno?: string;
}

const EnderecoSchema = new Schema(
    {
        cep: String,
        rua: String,
        numero: String,
        bairro: String,
        cidade: String,
        estado: String,
    },
    { _id: false }
);

const PerfilSchema = new Schema<IPerfil>(
    {
        nome: { type: String, required: true },
        tipoPessoa: { type: String, enum: ["Física", "Jurídica"], required: true },
        documento: { type: String, required: true },
        telefone: { type: String, required: true },

        // ✅ Sempre salvar em minúsculas e garantir índice único
        wallet: {
            type: String,
            required: true,
            unique: true,
            index: true,
            set: (v: string) => (v ? String(v).toLowerCase() : v),
        },

        endereco: EnderecoSchema,
        docIdentidade: String,
        comprovanteEndereco: String,
        linkExterno: String,
    },
    { timestamps: true, collection: "perfis" }
);

// ✅ Normaliza em operações update
PerfilSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate() as any;
    if (update?.wallet) update.wallet = String(update.wallet).toLowerCase();
    if (update?.$set?.wallet) update.$set.wallet = String(update.$set.wallet).toLowerCase();
    next();
});

// ✅ Normaliza em `save` para documentos novos/alterados
PerfilSchema.pre("save", function (next) {
    // @ts-ignore
    if (this.wallet) this.wallet = String(this.wallet).toLowerCase();
    next();
});

const Perfil: Model<IPerfil> = mongoose.model<IPerfil>("Perfil", PerfilSchema);
export default Perfil;
