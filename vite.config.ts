import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    // maplibre-gl is a lazy chunk that loads only when the map panel is near view.
    chunkSizeWarningLimit: 1100,
  },
});
