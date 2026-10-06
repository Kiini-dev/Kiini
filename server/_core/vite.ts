import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { pathToFileURL } from "url";

export async function setupVite(app: Express, server: Server) {
  const { createServer: createViteServer } = await import("vite");
  const viteConfigPath = path.resolve(process.cwd(), "vite.config.ts");
  const { default: viteConfig } = await import(pathToFileURL(viteConfigPath).href);
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Try multiple possible paths for the dist directory
  const possiblePaths = [
    // Absolute path based on process.cwd()
    path.join(process.cwd(), "dist", "public"),
    // Relative to this file's directory (in unbundled development)
    path.resolve(import.meta.dirname, "../..", "dist", "public"),
    // Absolute path for Docker container
    "/app/dist/public",
  ];

  let distPath = possiblePaths[0];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      distPath = p;
      console.log(`[Static] Serving assets from: ${distPath}`);
      break;
    }
  }

  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory. Tried:`,
      possiblePaths.join(", "),
      `Make sure to build the client first`
    );
  }

  // Serve static assets from the Vite build output
  app.use(express.static(distPath, { extensions: ["html"], dotfiles: "allow" }));

  // Only fall through to index.html for non-asset, non-API routes. This prevents
  // requests for module files (e.g. /src/main.tsx) from being rewritten to
  // the SPA index.html which would return text/html instead of a JS module.
  // API requests must never be served as HTML; if they miss the tRPC router,
  // return a proper JSON 404 so the client does not try to parse HTML as JSON.
  app.get("*", (req, res) => {
    const p = req.path || req.url || "";

    if (p.startsWith("/api") || p === "/api") {
      res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "API route not found",
          path: p,
        },
      });
      return;
    }

    // If the request looks like an asset (has an extension or is in /assets),
    // let the static middleware return 404 instead of serving index.html.
    if (path.extname(p) || p.startsWith("/assets/") || p.startsWith("/src/")) {
      res.status(404).end();
      return;
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
