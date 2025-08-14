import mongoose, { Schema } from "mongoose";

const ImovelSchema = new Schema(
    {
        nome: { type: String, required: true },                 // nome da propriedade
        emailContato: { type: String, required: true },
        documentoCompraVenda: { type: String, required: false },// path do arquivo ou URL
        registroImovel: { type: String, required: true },
        wallet: { type: String, required: true },
        perfil: { type: Schema.Types.ObjectId, ref: "Perfil", required: true }, // vínculo
    },
    { timestamps: true }
);

// fixa nome da coleção como "imoveis"
export default mongoose.model("Imovel", ImovelSchema, "imoveis");
