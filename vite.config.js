import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import disableHostCheck from './vite-plugin-disable-host-check.js';

export default defineConfig({
  plugins: [
    disableHostCheck(),
    react()
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
