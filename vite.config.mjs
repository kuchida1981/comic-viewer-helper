import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.js'),
      name: 'ComicViewerHelper',
      formats: ['iife'],
      fileName: () => 'comic-viewer-helper.user.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
  },
  test: {
    environment: 'node',
    globals: true,
  },
});