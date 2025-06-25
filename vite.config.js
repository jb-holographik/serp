import { defineConfig } from 'vite'
import eslintPlugin from 'vite-plugin-eslint'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ command }) => {
  const common = {
    plugins: [eslintPlugin({ cache: false })],
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
          globals: { jquery: '$' },
          inlineDynamicImports: true,
        },
        external: ['jquery'],
      },
    },
  }

  if (command === 'serve') {
    // mode dev local : on active HTTPS + HMR
    return {
      ...common,
      server: {
        host: 'localhost',
        cors: '*',
        https: {
          key: fs.readFileSync(path.resolve(__dirname, 'certs/localhost-key.pem')),
          cert: fs.readFileSync(path.resolve(__dirname, 'certs/localhost.pem')),
        },
        hmr: { host: 'localhost', protocol: 'wss' },
      },
    }
  } else {
    // mode build ou preview en CI : on ne touche qu'au build
    return common
  }
})