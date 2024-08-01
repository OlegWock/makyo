import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  root: __dirname,
  plugins: [react(), tsconfigPaths()],
  envPrefix: 'VITE_MAKYO_',
  server: {
    port: 8441,
    proxy: {
      '/api': {
        target: 'http://localhost:8440',
        changeOrigin: true,
        ws: true,
      },
      '/authenticate': {
        target: 'http://localhost:8440',
        changeOrigin: true,
      },
      '/logout': {
        target: 'http://localhost:8440',
        changeOrigin: true,
      },
    }
  }
});
