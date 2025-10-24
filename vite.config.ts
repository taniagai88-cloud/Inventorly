import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'figma-assets',
      resolveId(id) {
        if (id.startsWith('figma:asset/')) {
          return id;
        }
      },
      load(id) {
        if (id.startsWith('figma:asset/')) {
          // Return a placeholder data URL for images
          const placeholderSvg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#e5e7eb"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="14" fill="#9ca3af">Image</text></svg>`;
          const dataUrl = `data:image/svg+xml;base64,${Buffer.from(placeholderSvg).toString('base64')}`;
          return `export default "${dataUrl}"`;
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
