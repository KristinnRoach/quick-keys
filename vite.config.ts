import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  base: '/quick-keys/', // added for gh-pages
  publicDir: 'public',
  // Base URL configuration
  // base: process.env.NODE_ENV === 'production' ? '/quick-keys/' : '/',
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'keyboard-spline': ['./src/ui/components/KeyboardSpline'],
          'audio-engine': ['./src/web-audio-core/audio/WebAudioEngine'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['solid-js'],
  },
});
