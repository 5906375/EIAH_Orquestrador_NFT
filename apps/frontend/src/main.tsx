// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { Toaster } from 'sonner';
import { TutorProvider } from '@/context/TutorContext';
import { Web3Provider } from '@/context/Web3Context'; // ✅ Importação do contexto da carteira
import { FooterConfigProvider } from "@/context/FooterConfigContext";
import { CampaignProvider } from "@/context/CampaignContext";
import { AuthProvider } from "@/context/AuthContext";


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <TutorProvider>
        <Web3Provider>
          <FooterConfigProvider>
            <CampaignProvider>
               <AuthProvider>
            <App />
            <Toaster position="top-right" richColors />
              </AuthProvider>
            </CampaignProvider>
          </FooterConfigProvider>
        </Web3Provider>
      </TutorProvider>
    </BrowserRouter>
  </React.StrictMode>
);
