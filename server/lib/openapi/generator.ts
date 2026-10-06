/**
 * OpenAPI Specification Generator
 * Generates OpenAPI 3.0.0 spec from tRPC routes
 */

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
    contact: {
      name: string;
      url: string;
      email: string;
    };
    license: {
      name: string;
      url: string;
    };
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
    securitySchemes: {
      bearerAuth: {
        type: string;
        scheme: string;
        bearerFormat: string;
      };
    };
  };
  security: Array<{
    bearerAuth: string[];
  }>;
  tags: Array<{
    name: string;
    description: string;
  }>;
}

/**
 * Generate OpenAPI 3.0.0 specification
 */
export function generateOpenAPISpec(): OpenAPISpec {
  const baseUrl = process.env.API_URL || "https://kiini.africa";

  return {
    openapi: "3.0.0",
    info: {
      title: "Kiini CRM API",
      version: "1.0.0",
      description:
        "Comprehensive CRM and business management system with advanced features for contacts, invoices, projects, HR, and more.",
      contact: {
        name: "Kiini",
        url: "https://kiini.africa",
        email: "support@kiini.africa",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: baseUrl,
        description: "Production server",
      },
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    paths: {
      "/api/trpc": {
        post: {
          tags: ["tRPC"],
          summary: "tRPC endpoint",
          description: "Main tRPC API endpoint for all operations",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    jsonrpc: { type: "string", example: "2.0" },
                    method: { type: "string", example: "query" },
                    params: { type: "object" },
                    id: { type: ["string", "number"] },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      result: { type: "object" },
                      error: { type: "object" },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad request",
            },
            "401": {
              description: "Unauthorized",
            },
            "500": {
              description: "Internal server error",
            },
          },
          security: [{ bearerAuth: [] }],
        },
      },
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          description: "Check if the API is running",
          responses: {
            "200": {
              description: "Server is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      timestamp: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/docs": {
        get: {
          tags: ["Documentation"],
          summary: "API documentation",
          description: "View interactive API documentation (Swagger UI)",
          responses: {
            "200": {
              description: "Swagger UI page",
            },
          },
        },
      },
      "/api/openapi.json": {
        get: {
          tags: ["Documentation"],
          summary: "OpenAPI specification",
          description: "Download the OpenAPI 3.0.0 specification",
          responses: {
            "200": {
              description: "OpenAPI specification",
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            role: { type: "string", enum: ["admin", "user", "staff"] },
            createdAt: { type: "string", format: "date-time" },
          },
          required: ["id", "email", "name"],
        },
        Invoice: {
          type: "object",
          properties: {
            id: { type: "string" },
            invoiceNo: { type: "string" },
            clientId: { type: "string" },
            amount: { type: "number" },
            status: { type: "string", enum: ["draft", "sent", "partial", "paid"] },
            invoiceDate: { type: "string", format: "date" },
            dueDate: { type: "string", format: "date" },
            createdAt: { type: "string", format: "date-time" },
          },
          required: ["id", "invoiceNo", "clientId", "amount"],
        },
        Client: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            address: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
          required: ["id", "name"],
        },
        Project: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["planning", "active", "on_hold", "completed"] },
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
            createdAt: { type: "string", format: "date-time" },
          },
          required: ["id", "name"],
        },
        Employee: {
          type: "object",
          properties: {
            id: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            department: { type: "string" },
            position: { type: "string" },
            status: { type: "string", enum: ["active", "inactive", "on_leave"] },
            hireDate: { type: "string", format: "date" },
          },
          required: ["id", "firstName", "lastName", "email"],
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
              },
              required: ["code", "message"],
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "tRPC",
        description: "Main API operations through tRPC",
      },
      {
        name: "Health",
        description: "Health check endpoints",
      },
      {
        name: "Documentation",
        description: "API documentation endpoints",
      },
      {
        name: "Users",
        description: "User management operations",
      },
      {
        name: "Invoices",
        description: "Invoice management and tracking",
      },
      {
        name: "Clients",
        description: "Client management",
      },
      {
        name: "Projects",
        description: "Project management",
      },
      {
        name: "Employees",
        description: "Employee management and HR operations",
      },
      {
        name: "GDPR",
        description: "GDPR compliance operations",
      },
    ],
  };
}
