import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EmitirNFTOrquestrado from './pages/EmitirNFTOrquestrado';
import EmitirNFT from "@/pages/EmitirNFTDiarias";
import ConfirmacaoNFT from './pages/ConfirmacaoNFT';
import AudioGuia from "@/components/AudioGuia"; // Tutor IA
import PainelTutor from "./pages/PainelTutor";
import Planos from "./pages/Planos"; 
import CadastroGuia from "@/components/EtapaCadastro/CadastroGuia";
import PainelUsuario from "./pages/PainelUsuario";
import Terms from "./pages/Legal/Terms";
import Privacy from "./pages/Legal/Privacy";
import CancelPolicy from "./pages/Legal/CancelPolicy";
import KycPolicy from "./pages/Legal/KycPolicy";
import FooterAdmin from "./pages/Admin/FooterAdmin";
import Footer from "@/components/ui/Footer";



function App() {
  return (
    <>
      <AudioGuia />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/painel-usuario" element={<PainelUsuario />} /> {/* novo */}
        <Route path="/painel-tutor" element={<PainelTutor />} />
        <Route path="/planos" element={<Planos />} />
        <Route path="/emitir-orquestrado" element={<EmitirNFTOrquestrado />} />
        <Route path="/emitir-nft" element={<EmitirNFT />} />
        <Route path="/nft/confirmacao" element={<ConfirmacaoNFT />} />
        <Route path="/cadastro-guia" element={<CadastroGuia />} />
        <Route path="/admin/footer" element={<FooterAdmin />} />
        <Route path="/termos" element={<Terms />} />
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="/cancelamento" element={<CancelPolicy />} />
        <Route path="/kyc" element={<KycPolicy />} />
      </Routes>
      <Footer />                                       {/* ✅ RENDERIZE AQUI */}
    </>
  );
}

export default App;