import { defineConfig } from 'vite';

const targetServer = process.env.VITE_API_URL || 'http://185.193.67.45:5050';

export default defineConfig({
  server: {
    port: 4000,
    proxy: {
      '/api': {
        target: targetServer,
        changeOrigin: true
      },
      '/المنتجات': {
        target: targetServer,
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4000,
    proxy: {
      '/api': {
        target: targetServer,
        changeOrigin: true
      },
      '/المنتجات': {
        target: targetServer,
        changeOrigin: true
      }
    }
  }
});

