import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: '/',
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
});
