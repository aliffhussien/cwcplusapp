import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  build: {
    rollupOptions: {
      // pdfjs-dist is an optional dependency loaded at runtime only when
      // the admin uploads a PDF. The try/catch in RecipeImporter.tsx
      // handles the case where it isn't installed yet.
      external: ['pdfjs-dist'],
    },
  },
})
