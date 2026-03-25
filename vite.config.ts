import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import checker from 'vite-plugin-checker';
import path from 'path';
import { cspString } from './csp.config';

function cspPlugin(): Plugin {
  return {
    name: 'vite-plugin-csp',
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: {
            'http-equiv': 'Content-Security-Policy',
            content: cspString,
          },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cspPlugin(),
    checker({
      enableBuild: false,
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint --ext .ts,.tsx src'
      },
      stylelint: { lintCommand: 'stylelint "./**/*.css"' },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
});
