import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { reorderChunksPlugin } from "./reorderChunksPlugin.ts";

const plugins = [react(), tailwindcss(), reorderChunksPlugin()];

// Plugin: Ensures vendor-react-ui loads before other chunks to prevent React context errors

export default defineConfig({
  plugins,
  resolve: {
    // Explicit extension order prevents ambiguous resolution when compiled .js
    // files exist alongside .tsx sources in the tree.
    extensions: ['.mjs', '.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split vendor code into sensible chunks so the browser can cache them
        // independently and the initial page-load only fetches what it truly needs.
        manualChunks(id: string) {
          if (!id || !id.includes('node_modules')) return undefined;

          // ── React core + Radix UI bundled together to avoid loading order issues ──
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('scheduler') ||
            id.includes('react-is') ||
            id.includes('@radix-ui')
          ) return 'vendor-react-ui';

          // ── Large standalone libs ──
          if (id.includes('html2canvas')) return 'html2canvas';
          if (id.includes('xlsx') || id.includes('exceljs')) return 'xlsx';
          if (id.includes('@tiptap') || id.includes('prosemirror') || id.includes('@tiptap/pm')) return 'rich-editor';

          // ── Charting and visualization (group together to avoid circular dependency with React) ──
          // Don't create separate chunk - let these depend on main app bundle which imports after vendor-react-ui
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return undefined;

          // ── tRPC + React-Query network layer ──
          if (id.includes('@trpc') || id.includes('@tanstack/react-query')) return 'api-client';

          // ── Date utilities ──
          if (id.includes('date-fns')) return 'date-utils';

          // ── Lucide icons (keep as single bundle, not per-icon) ──
          if (id.includes('lucide-react')) return 'lucide-react';

          // ── Everything else per-package ──
          const parts = id.split('node_modules/');
          if (parts.length < 2) return undefined;
          const pkg = parts[parts.length - 1].split('/')[0];
          // Skip scoped .pnpm directories
          if (pkg === '.pnpm') {
            const pnpmParts = parts[parts.length - 1].split('/');
            const inner = pnpmParts.findIndex((p, i) => i > 0 && p === 'node_modules');
            if (inner !== -1 && pnpmParts[inner + 1]) {
              return `vendor-${pnpmParts[inner + 1].replace('@', '')}`;
            }
            return undefined;
          }
          return undefined;
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
