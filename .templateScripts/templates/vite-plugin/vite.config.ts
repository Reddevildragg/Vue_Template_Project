import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [
      dts({ insertTypesEntry: true })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: '{{PASCAL_PLUGIN_NAME}}',
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['vite'],
      output: {
        globals: {
          vite: 'Vite'
        }
      }
    }
  }
});
