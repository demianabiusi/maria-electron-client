import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    monacoEditorPlugin({})
  ],
  base: './', // Importante para que Electron encuentre los archivos (rutas relativas)
  build: {
    outDir: '../../dist/renderer', // Carpeta de salida (fuera de src)
    emptyOutDir: true
  },
  server: {
    port: 5173 // Puerto por defecto de Vite
  }
})