import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    build: {
      sourcemap: false,
      // Warn when any single chunk exceeds 500 KB
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Firebase SDK → isolated chunk (SDK is large but cached separately)
            if (id.includes('node_modules/firebase')) {
              return 'firebase';
            }
            // Motion animation library → isolated chunk
            if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) {
              return 'motion';
            }
            // All remaining node_modules → shared vendor chunk
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      sourcemap: false,
      hmr: false,
      ws: false as const,
      watch: null,
    },
  };
});
