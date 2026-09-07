import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

const base = process.env.LASTLIGHT_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'LAST LIGHT',
        short_name: 'LAST LIGHT',
        description:
          'A survival-management roguelite. Keep four strangers alive in an underground vault after the world went quiet.',
        theme_color: '#0a0c0d',
        background_color: '#0a0c0d',
        display: 'standalone',
        orientation: 'any',
        start_url: base,
        scope: base,
        categories: ['games', 'strategy'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      '@engine': fileURLToPath(new URL('./src/engine', import.meta.url)),
      '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
      '@save': fileURLToPath(new URL('./src/save', import.meta.url)),
      '@ui': fileURLToPath(new URL('./src/ui', import.meta.url)),
      '@i18n': fileURLToPath(new URL('./src/i18n', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    // The content chunk is prose and legitimately large; the default 500 kB warning is noise
    // here, and a warning nobody can act on is a warning everybody learns to ignore.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        /*
         * Three chunks, split by how often each changes rather than to shrink first load.
         *
         * The bulk of the bundle is authored prose — 127 events, 46 encounters, 43 lore
         * entries — and the store reaches for all of it the moment a run starts, so deferring
         * it would buy a faster title screen and a stall on the first click. What this does
         * buy is caching: editing an event does not invalidate React, and a UI change does
         * not invalidate the content.
         */
        manualChunks(id: string) {
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'react';
          }
          if (id.includes('/src/engine/data/')) return 'content';
          return undefined;
        },
      },
    },
  },
  server: { port: 5173, strictPort: false },
  preview: { port: 4173, strictPort: false },
});
