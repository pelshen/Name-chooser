import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  base: '/',
  plugins: [react(), tsconfigPaths(), mkcert()],
  server: {
    port: 3000,
    proxy: {
      // Proxy API calls to the serverless backend on port 4000
      '/api': {
        target: 'https://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
  },
});
