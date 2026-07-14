import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

const buildId = `${Date.now()}`

function writeVersionFile() {
  return {
    name: 'write-version-file',
    writeBundle(options: { dir?: string }) {
      const outDir = options.dir ?? 'dist'
      fs.writeFileSync(path.join(outDir, 'version.json'), JSON.stringify({ buildId }))
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), writeVersionFile()],
  define: {
    __APP_BUILD_ID__: JSON.stringify(buildId),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-router')) {
            return 'react-vendor'
          }
          if (id.includes('leaflet')) return 'map-vendor'
          if (id.includes('@tanstack/react-query')) return 'query-vendor'
        },
      },
    },
  },
})
