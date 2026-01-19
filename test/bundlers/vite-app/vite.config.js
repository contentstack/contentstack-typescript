import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'ViteBundlerTest',
      fileName: 'index',
      formats: ['cjs'],
    },
    rollupOptions: {
      output: {
        exports: 'auto',
      },
    },
    target: 'node18',
    outDir: 'dist',
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
});

