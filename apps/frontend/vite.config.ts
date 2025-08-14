import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = env.VITE_API_URL || 'http://localhost:4000';
  const IA_URL = env.VITE_IA_URL || 'http://localhost:8000';

  return {
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: API_URL, changeOrigin: true, secure: false },
        '/ia': {
          target: IA_URL, changeOrigin: true, secure: false,
          rewrite: p => p.replace(/^\/ia/, ''), // /ia/... -> /...
        },
      },
    },
  };
});
