/**
 * Vite Plugin: Reorder Chunks (v4 - Preload Strategy)
 *
 * Ensures vendor-react-ui loads before other chunks by prioritizing it in preload
 */

import type { Plugin } from 'vite';

export function reorderChunksPlugin(): Plugin {
  return {
    name: 'reorder-chunks-v4',
    apply: 'build',
    enforce: 'post',

    transformIndexHtml: {
      order: 'post',
      handler(html: string) {
        try {
          // Vite 5+ uses dynamic imports, so we prioritize vendor-react-ui in modulepreload
          const vendorReactUiPattern = /<link[^>]*rel="modulepreload"[^>]*href="[^"]*vendor-react-ui[^"]*"[^>]*>/;
          const match = html.match(vendorReactUiPattern);

          if (!match) return html;

          // Move vendor-react-ui modulepreload to the very beginning of other modulepreloads
          let result = html.replace(match[0], '');

          // Find the first modulepreload link and insert before it
          const firstModulePreload = result.match(/<link[^>]*rel="modulepreload"/);
          if (firstModulePreload) {
            result = result.replace(firstModulePreload[0], match[0] + '\n    ' + firstModulePreload[0]);
          } else {
            // If no other modulepreload exists, add it right after the main script
            result = result.replace(
              /(<script[^>]*>[\s\S]*?<\/script>)/,
              '$1\n    ' + match[0]
            );
          }

          return result;
        } catch (e) {
          console.warn('[reorderChunksPlugin] Error reordering chunks:', e);
          return html;
        }
      },
    },
  };
}


