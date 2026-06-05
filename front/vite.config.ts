import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/portalCNE/',
  server: {
    proxy: {
      '/api': 'http://localhost:3002',

      '/grafana-api': {
        target: "https://backup-mazzini.internal.timbrasil.com.br",
        changeOrigin: true,
        secure: false,
        headers: {
          vtoken: "9749d6ff559524cb80f8a650228aefb4d4bc3f4d6e4befee7068e60271290516",
        },
        rewrite: (path) => path.replace(/^\/grafana-api/, "/opd/cws_grafana_json/"),
      },
    }
  }
})
