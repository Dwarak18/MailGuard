import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { copyFileSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      generateBundle() {
        copyFileSync('src/manifest.json', 'dist/manifest.json');
        copyFileSync('src/ui/options/options.html', 'dist/options.html');
      }
    }
  ],
  build: {
    target: 'ES2020',
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: 'src/background/worker.ts',
        'content-gmail': 'src/content/gmail.tsx',
        'content-outlook': 'src/content/outlook.tsx',
        'options': 'src/ui/options/index.tsx',
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
