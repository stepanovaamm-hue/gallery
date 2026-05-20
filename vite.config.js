import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, isPreview }) => ({
  base: './',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    fs: {
      strict: true,
      allow: [process.cwd()],
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
  optimizeDeps: {
    noDiscovery: true,
    include: [],
  },
  environments:
    command === 'serve' && !isPreview
      ? {
          client: {
            optimizeDeps: {
              disabled: true,
              noDiscovery: true,
              include: [],
            },
          },
        }
      : {
          client: {
            optimizeDeps: {
              noDiscovery: true,
              include: [],
            },
          },
        },
}));
