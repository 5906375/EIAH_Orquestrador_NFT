import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import { speak } from "@/utils/voice";
import { useTutorContext } from "@/context/TutorContext";

export default function ReciboNFT() {
    const { state } = useLocation();
    const { etapaAtual } = useTutorContext();
    const [dados, setDados] = useState<any>(null);
    const reciboRef = useRef<HTMLDivElement>(null);

    const ipfsToHttp = (uri: string) =>
        uri?.startsWith("ipfs://") ? uri.replace("ipfs://", "https://ipfs.io/ipfs/") : uri;

    useEffect(() => {
        if (state) {
            setDados(state);
            if (etapaAtual === "recibo") {
                speak(`Aqui está o recibo do seu NFT. Nome: ${state.nomeNFT}. Período de ${state.dataInicio} até ${state.dataFim}. Transação registrada com hash ${state.txHash}.`);
            } else {
                speak("NFT emitido com sucesso. Você pode salvar, imprimir ou compartilhar o recibo.");
            }
        }
    }, [state, etapaAtual]);

    const handlePrint = useReactToPrint({
        content: () => reciboRef.current,
        documentTitle: "recibo-nft",
    });

    const handleShare = () => {
        if (navigator.share && dados) {
            navigator.share({
                title: "Recibo NFTDiárias",
                text: `Confira o NFT da propriedade ${dados.nomeNFT} de ${dados.dataInicio} até ${dados.dataFim}`,
                url: dados.tokenURI,
            });
        } else {
            alert("Compartilhamento não suportado neste dispositivo.");
        }
    };

    const handleWhatsApp = () => {
        if (!dados) return;
        const msg = `📄 Recibo NFTDiárias\n🏠 ${dados.nomeNFT}\n📅 ${dados.dataInicio} até ${dados.dataFim}\n🔗 ${dados.tokenURI}`;
        const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
        window.open(url, "_blank");
    };

    if (!dados) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Nenhum dado encontrado.</h2>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6 print:text-black print:bg-white">
            <div
                ref={reciboRef}
                className="bg-white p-6 rounded-xl border shadow space-y-4 print:shadow-none print:border-none print:p-0"
            >
                <h1 className="text-2xl font-bold text-center text-green-700 print:text-black">
                    📄 Recibo NFTDiárias
                </h1>

                <p><strong>🏠 Propriedade:</strong> {dados.nomeNFT}</p>
                <p><strong>📅 Período:</strong> {dados.dataInicio} até {dados.dataFim}</p>
                <p><strong>📝 Descrição:</strong> {dados.descricao}</p>
                <p><strong>👥 Hóspedes:</strong> {dados.numeroHospedes}</p>

                <p>
                    <strong>🔗 tokenURI:</strong>{" "}
                    <a href={dados.tokenURI} className="text-blue-600 underline break-all" target="_blank" rel="noreferrer">
                        {dados.tokenURI}
                    </a>
                </p>

                <p>
                    <strong>📦 Transação:</strong>{" "}
                    <a href={`https://sepolia.etherscan.io/tx/${dados.txHash}`} className="text-green-700 underline break-all" target="_blank" rel="noreferrer">
                        {dados.txHash}
                    </a>
                </p>

                {dados.imagem && (
                    <img src={ipfsToHttp(dados.imagem)} alt="Imagem NFT" className="rounded-xl w-full border print:border-none" />
                )}

                <div className="text-center mt-4">
                    <QRCodeCanvas value={dados.tokenURI} size={160} />
                    <p className="text-sm text-gray-400 print:text-black">Verificação via QR Code</p>
                </div>
            </div>

            <div className="text-center space-x-4">
                <Button onClick={handlePrint} className="bg-purple-600 text-white hover:bg-purple-700">
                    📥 Baixar Recibo em PDF
                </Button>

                <Button onClick={handleShare} className="bg-blue-500 text-white hover:bg-blue-600">
                    🔗 Compartilhar Recibo
                </Button>

                <Button onClick={handleWhatsApp} className="bg-green-600 text-white hover:bg-green-700">
                    💬 Enviar pelo WhatsApp
                </Button>
            </div>
        </div>
    );
}
