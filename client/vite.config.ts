import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  // Unfortunately, we can't run Vite with Bun because of https://github.com/oven-sh/bun/issues/10441
  // root: import.meta.dir,

  root: __dirname,
  plugins: [react(), tsconfigPaths()],
  envPrefix: 'VITE_KATUKO_',
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
    }
  }
});
