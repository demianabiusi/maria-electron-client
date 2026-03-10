import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Importante para que Electron encuentre los archivos (rutas relativas)
  build: {
    outDir: '../../dist/renderer', // Carpeta de salida (fuera de src)
    emptyOutDir: true
  },
  server: {
    port: 5173 // Puerto por defecto de Vite
  }
})