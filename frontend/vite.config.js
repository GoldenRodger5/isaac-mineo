import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    hmr: {
      port: 5173,
      clientPort: 5173,
      overlay: false
    }
  },
  build: {
    sourcemap: false,
    outDir: 'dist'
  }
});
