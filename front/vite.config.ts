import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  server: {
    proxy: {
      '/api': 'http://localhost:3002',

      '/grafana-api': {
        target: "",
        changeOrigin: true,
        secure: false,
        headers: {
          vtoken: "",
        },
        rewrite: (path) => path.replace(/^\/grafana-api/, "/opd/cws_grafana_json/"),
      },
    }
  }
})
