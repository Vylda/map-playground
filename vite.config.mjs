import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'ES2020',
  },
  server: {
    open: true,
    port: 5173,
  },
});
