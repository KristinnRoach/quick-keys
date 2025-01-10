import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});

//  // PWA - Still Testing below:
//  rollupOptions: {
//   input: {
//     main: 'index.html',
//     sw: 'service-worker.js',
//   },
// },
