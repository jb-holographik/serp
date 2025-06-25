// vite.config.js
import { defineConfig } from 'vite'
import eslintPlugin from 'vite-plugin-eslint'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ command }) => {
  const common = {
    plugins: [eslintPlugin({ cache: false })],
    build: {
      // désactive manifest s'il n'est pas nécessaire en CI
      manifest: false,
      rollupOptions: {
        // CHEMIN ABSOLU vers ton point d'entrée
        input: path.resolve(__dirname, 'src/main.js'),
        output: {
          entryFileNames: 'main.js',
          format: 'iife',      // ou 'umd' selon ton besoin
          compact: true,
        },
        external: ['jquery'],
      },
    },
  }

  if (command === 'serve') {
    return {
      ...common,
      server: {
        host: 'localhost',
        cors: '*',
        // load certs **seulement** en dev local
        https: {
          key: fs.readFileSync(path.resolve(__dirname, 'certs/localhost-key.pem')),
          cert: fs.readFileSync(path.resolve(__dirname, 'certs/localhost.pem')),
        },
        hmr: { host: 'localhost', protocol: 'wss' },
      },
    }
  }

  // build / preview en CI : pas de https
  return common
})