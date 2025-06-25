import { defineConfig } from 'vite'
import eslintPlugin from 'vite-plugin-eslint'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [eslintPlugin({ cache: false })],
  server: {
    host: 'localhost',
    cors: '*',
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/localhost.pem')),
    },
    hmr: {
      host: 'localhost',
      protocol: 'wss', // wss = secure WebSocket
    },
  },
  build: {
    minify: true,
    manifest: true,
    rollupOptions: {
      input: './src/main.js',
      output: {
        format: 'umd',
        entryFileNames: 'main.js',
        esModule: false,
        compact: true,
        globals: {
          jquery: '$',
        },
        manualChunks: undefined,
        inlineDynamicImports: true,
      },
      external: ['jquery'],
    },
  },
})