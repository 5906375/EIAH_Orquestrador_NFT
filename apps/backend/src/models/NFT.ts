import mongoose from "mongoose";

const NFTSchema = new mongoose.Schema({
    nomeNFT: { type: String, required: true },
    descricao: { type: String, required: true },
    idPropriedade: { type: mongoose.Schema.Types.ObjectId, ref: "Imovel" },
    idPerfil: { type: mongoose.Schema.Types.ObjectId, ref: "Perfil" },
    wallet: { type: String, required: true },
    tokenURI: { type: String, required: true },
    txHash: { type: String, required: true },
    dataInicio: { type: Date, required: true },
    dataFim: { type: Date, required: true },
    midia: { type: String },
    enderecoCompleto: {
        cep: String,
        endereco: String,
        numero: String,
        cidade: String,
        uf: String,
    },
}, {
    timestamps: true
});

export default mongoose.model("NFT", NFTSchema);
