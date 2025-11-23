import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-htaccess',
      closeBundle() {
        // Copy .htaccess from public to dist after build
        const htaccessSrc = join(__dirname, 'public', '.htaccess')
        const htaccessDest = join(__dirname, 'dist', '.htaccess')
        if (existsSync(htaccessSrc)) {
          copyFileSync(htaccessSrc, htaccessDest)
          console.log('✅ Copied .htaccess to dist/')
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    include: ['react-quill', 'quill']
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
