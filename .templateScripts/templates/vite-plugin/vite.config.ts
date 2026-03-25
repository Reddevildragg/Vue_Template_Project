import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [
    dts({ include: ['src'] })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: '{{PASCAL_PLUGIN_NAME}}',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['vite']
    }
  }
});
