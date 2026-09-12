import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;
          if (
            id.includes('recharts') ||
            id.includes('/d3-') ||
            id.includes('victory-vendor') ||
            id.includes('internmap') ||
            id.includes('decimal.js')
          ) {
            return 'charts';
          }
          if (id.includes('@mui') || id.includes('@emotion')) return 'mui';
          if (
            id.includes('react-router') ||
            id.includes('react-dom') ||
            /[\\/]react[\\/]/.test(id) ||
            id.includes('scheduler')
          ) {
            return 'react';
          }
          if (id.includes('@tanstack') || id.includes('axios')) return 'data';
        },
      },
    },
  },
});
