import { defineConfig } from 'vite'
import eslintPlugin from 'vite-plugin-eslint'
import fs from 'fs'
import path from 'path'

function getHttpsConfig() {
  const keyPath = path.resolve(__dirname, 'certs/localhost-key.pem')
  const certPath = path.resolve(__dirname, 'certs/localhost.pem')

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  }

  return false // Pas de HTTPS si les fichiers n'existent pas
}

export default defineConfig(({ command }) => ({
  plugins: [eslintPlugin({ cache: false })],
  server: {
    host: true,
    cors: { origin: '*' },
    https: getHttpsConfig(),
    hmr: {
      host: 'localhost',
      protocol: 'wss',
    },
  },
  build: {
    minify: 'esbuild',
    manifest: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main.js'),
      output: {
        format: 'umd',
        entryFileNames: 'main.js',
        esModule: false,
        compact: true,
        globals: {
          jquery: '$',
        },
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
      external: ['jquery'],
    },
  },
}))