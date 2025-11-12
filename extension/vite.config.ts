import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { copyFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      writeBundle() {
        const srcManifest = resolve(__dirname, 'src/manifest.json');
        const distManifest = resolve(__dirname, 'dist/manifest.json');
        const srcOptions = resolve(__dirname, 'src/ui/options/options.html');
        const distOptions = resolve(__dirname, 'dist/options.html');
        
        console.log(`Copying manifest from: ${srcManifest}`);
        console.log(`Copying to: ${distManifest}`);
        console.log(`Manifest exists: ${existsSync(srcManifest)}`);
        
        copyFileSync(srcManifest, distManifest);
        copyFileSync(srcOptions, distOptions);
        
        // Copy icons directory
        const srcIconsDir = resolve(__dirname, 'src/icons');
        const distIconsDir = resolve(__dirname, 'dist/icons');
        
        if (existsSync(srcIconsDir)) {
          if (!existsSync(distIconsDir)) {
            mkdirSync(distIconsDir, { recursive: true });
          }
          const icons = readdirSync(srcIconsDir);
          for (const icon of icons) {
            const srcIcon = resolve(srcIconsDir, icon);
            const distIcon = resolve(distIconsDir, icon);
            copyFileSync(srcIcon, distIcon);
          }
          console.log('✓ Icons copied successfully');
        }
        
        console.log('✓ Manifest and options copied successfully');
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
