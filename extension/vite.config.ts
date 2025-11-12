import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { copyFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      generateBundle() {
        const srcManifest = resolve(__dirname, 'src/manifest.json');
        const distManifest = resolve(__dirname, 'dist/manifest.json');
        const srcOptions = resolve(__dirname, 'src/ui/options/options.html');
        const distOptions = resolve(__dirname, 'dist/options.html');
        
        if (!existsSync(srcManifest)) {
          console.error(`Source manifest not found: ${srcManifest}`);
          throw new Error(`Manifest file not found at ${srcManifest}`);
        }
        if (!existsSync(srcOptions)) {
          console.error(`Source options.html not found: ${srcOptions}`);
          throw new Error(`Options HTML not found at ${srcOptions}`);
        }
        
        copyFileSync(srcManifest, distManifest);
        copyFileSync(srcOptions, distOptions);
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
