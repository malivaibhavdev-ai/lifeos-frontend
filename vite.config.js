import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Vendor code changes far less often than app code — splitting it
        // into its own chunk means a browser that already cached it on a
        // prior visit doesn't re-download React/react-query/etc. just
        // because an app screen changed. Grouped by library rather than one
        // giant vendor blob so unrelated deploys don't invalidate the whole
        // group's cache entry either.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-router')) return 'vendor-react';
          if (id.includes('@tanstack')) return 'vendor-query';
          if (id.includes('@dnd-kit')) return 'vendor-dnd';
          if (id.includes('react-icons')) return 'vendor-icons';
          if (id.includes('dexie')) return 'vendor-dexie';
          if (id.includes('react-markdown') || id.includes('remark') || id.includes('mdast') || id.includes('micromark') || id.includes('unist') || id.includes('unified')) return 'vendor-markdown';
          return 'vendor';
        },
      },
    },
  },
})
