import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    // The lazy Three.js globe chunk is intentionally larger than the 500 kB default;
    // the initial (eager) bundle is budgeted separately at <= 80 kB gzipped.
    chunkSizeWarningLimit: 900,
  },
});
