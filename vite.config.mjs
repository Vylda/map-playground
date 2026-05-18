import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'ES2020',
  },
  server: {
    open: true,
    port: 5173,
  },
});
