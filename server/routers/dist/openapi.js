"use strict";
/**
 * OpenAPI Documentation Router
 * Serves API documentation and OpenAPI specification
 */
exports.__esModule = true;
exports.openAPIRouter = void 0;
var trpc_1 = require("../_core/trpc");
var generator_1 = require("../lib/openapi/generator");
exports.openAPIRouter = trpc_1.router({
    /**
     * Get OpenAPI specification
     * GET /trpc/openapi.spec
     */
    getSpec: trpc_1.publicProcedure.query(function () {
        return generator_1.generateOpenAPISpec();
    }),
    /**
     * Get API documentation endpoints information
     * GET /trpc/openapi.info
     */
    getInfo: trpc_1.publicProcedure.query(function () {
        var spec = generator_1.generateOpenAPISpec();
        return {
            title: spec.info.title,
            version: spec.info.version,
            description: spec.info.description,
            contact: spec.info.contact,
            license: spec.info.license,
            servers: spec.servers,
            tags: spec.tags.map(function (tag) { return ({
                name: tag.name,
                description: tag.description
            }); }),
            pathCount: Object.keys(spec.paths).length,
            schemaCount: Object.keys(spec.components.schemas).length
        };
    }),
    /**
     * Get documentation URLs
     * GET /trpc/openapi.urls
     */
    getUrls: trpc_1.publicProcedure.query(function () {
        var baseUrl = process.env.API_URL || "http://localhost:3000";
        return {
            swagger: baseUrl + "/api/docs",
            redoc: baseUrl + "/api/docs/redoc",
            openapi: baseUrl + "/api/openapi.json"
        };
    })
});
