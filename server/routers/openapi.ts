/**
 * OpenAPI Documentation Router
 * Serves API documentation and OpenAPI specification
 */

import { publicProcedure, router } from "../_core/trpc";
import { generateOpenAPISpec } from "../lib/openapi/generator";

export const openAPIRouter = router({
  /**
   * Get OpenAPI specification
   * GET /trpc/openapi.spec
   */
  getSpec: publicProcedure.query(() => {
    return generateOpenAPISpec();
  }),

  /**
   * Get API documentation endpoints information
   * GET /trpc/openapi.info
   */
  getInfo: publicProcedure.query(() => {
    const spec = generateOpenAPISpec();
    return {
      title: spec.info.title,
      version: spec.info.version,
      description: spec.info.description,
      contact: spec.info.contact,
      license: spec.info.license,
      servers: spec.servers,
      tags: spec.tags.map(tag => ({
        name: tag.name,
        description: tag.description,
      })),
      pathCount: Object.keys(spec.paths).length,
      schemaCount: Object.keys(spec.components.schemas).length,
    };
  }),

  /**
   * Get documentation URLs
   * GET /trpc/openapi.urls
   */
  getUrls: publicProcedure.query(() => {
    const baseUrl = process.env.API_URL || "http://localhost:3000";
    return {
      swagger: `${baseUrl}/api/docs`,
      redoc: `${baseUrl}/api/docs/redoc`,
      openapi: `${baseUrl}/api/openapi.json`,
    };
  }),
});
