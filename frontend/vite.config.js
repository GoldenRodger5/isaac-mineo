import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: false, // Allow using alternative ports if 5173 is busy
    hmr: {
      port: 5173,
      clientPort: 5173,
      overlay: false // Disable error overlay for better development experience
    }
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['./src/utils/apiClient']
        }
      }
    }
  }
});
