import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite'; // v4 Vite plugin
import checker from 'vite-plugin-checker';
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    checker({
      typescript: true,
      vueTsc: true,
      eslint: {
        // tell the plugin we’re on ESLint 9 flat config
        useFlatConfig: true,
        lintCommand: 'eslint "./src/!**!/!*.{ts,tsx,vue}"', // optional but I like to be explicit
      },
      stylelint: { lintCommand: 'stylelint "./**/*.{css,vue}"' },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
});
