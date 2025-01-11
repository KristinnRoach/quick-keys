import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'keyboard-spline': ['./src/ui/ui-components/KeyboardSpline'],
          'audio-engine': ['./src/logic/audio/WebAudioEngine'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['solid-js'],
  },
});
