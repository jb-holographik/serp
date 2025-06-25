import { defineConfig } from 'vite'
import eslintPlugin from 'vite-plugin-eslint'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    eslintPlugin({
      cache: false,
    }),
  ],
  server: {
    host: true, // 'true' permet de se connecter via IP locale aussi
    cors: {
      origin: '*', // meilleur pour éviter des erreurs que `cors: '*'`
    },
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/localhost.pem')),
    },
    hmr: {
      host: 'localhost',
      protocol: 'wss',
    },
  },
  build: {
    minify: 'esbuild', // plus rapide que terser
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
})