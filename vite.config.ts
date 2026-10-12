import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const rootDir =
    typeof import.meta !== 'undefined' && import.meta.dirname
      ? import.meta.dirname
      : process.cwd();

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'cloudflare-spa-fallback',
        closeBundle() {
          try {
            const distDir = path.resolve(rootDir, 'dist');
            const indexPath = path.join(distDir, 'index.html');
            if (fs.existsSync(indexPath)) {
              // 200.html enables native Cloudflare Pages SPA client-side routing without redirects
              fs.copyFileSync(indexPath, path.join(distDir, '200.html'));
            }
          } catch {}
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
