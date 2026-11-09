import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

// GitHub Pages serves the site from /Oloodi_assignment/. Local dev stays at /.
const base = process.env.BASE_PATH?.endsWith('/')
  ? process.env.BASE_PATH
  : process.env.BASE_PATH
    ? `${process.env.BASE_PATH}/`
    : '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
