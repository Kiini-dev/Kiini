"use strict";
/**
 * Swagger UI Service
 * Serves the Swagger UI documentation page
 */
exports.__esModule = true;
exports.getReDocHtml = exports.getSwaggerUIHtml = void 0;
/**
 * Get Swagger UI HTML
 */
function getSwaggerUIHtml() {
    var apiDocsUrl = "/api/openapi.json";
    return "\n    <!DOCTYPE html>\n    <html lang=\"en\">\n      <head>\n        <meta charset=\"utf-8\" />\n        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n        <meta name=\"description\" content=\"Kiini CRM API Documentation\" />\n        <title>Kiini API Documentation</title>\n        <style>\n          html {\n            box-sizing: border-box;\n            overflow: -moz-scrollbars-vertical;\n            overflow-y: scroll;\n          }\n          *, *:before, *:after {\n            box-sizing: inherit;\n          }\n          body {\n            margin: 0;\n            padding: 0;\n            font-family: sans-serif;\n          }\n        </style>\n        <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css\" />\n        <link rel=\"icon\" type=\"image/png\" href=\"https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/favicon-32x32.png\" sizes=\"32x32\" />\n        <link rel=\"icon\" type=\"image/png\" href=\"https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/favicon-16x16.png\" sizes=\"16x16\" />\n      </head>\n      <body>\n        <div id=\"swagger-ui\"></div>\n        <script src=\"https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-bundle.js\"></script>\n        <script src=\"https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-standalone-preset.js\"></script>\n        <script>\n          window.onload = function() {\n            SwaggerUIBundle({\n              url: \"" + apiDocsUrl + "\",\n              dom_id: '#swagger-ui',\n              deepLinking: true,\n              presets: [\n                SwaggerUIBundle.presets.apis,\n                SwaggerUIStandalonePreset\n              ],\n              plugins: [\n                SwaggerUIBundle.plugins.DownloadUrl\n              ],\n              layout: \"StandaloneLayout\",\n              defaultModelsExpandDepth: 1,\n              defaultModelExpandDepth: 1,\n            });\n          };\n        </script>\n      </body>\n    </html>\n  ";
}
exports.getSwaggerUIHtml = getSwaggerUIHtml;
/**
 * Get ReDoc HTML (alternative API documentation)
 */
function getReDocHtml() {
    var apiDocsUrl = "/api/openapi.json";
    return "\n    <!DOCTYPE html>\n    <html lang=\"en\">\n      <head>\n        <meta charset=\"utf-8\" />\n        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n        <meta name=\"description\" content=\"Kiini CRM API Documentation\" />\n        <title>Kiini API Documentation</title>\n        <style>\n          body {\n            margin: 0;\n            padding: 0;\n            font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Roboto\", \"Oxygen\", \"Ubuntu\", \"Cantarell\", \"Fira Sans\", \"Droid Sans\", \"Helvetica Neue\", sans-serif;\n          }\n        </style>\n      </head>\n      <body>\n        <redoc spec-url=\"" + apiDocsUrl + "\"></redoc>\n        <script src=\"https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js\"></script>\n      </body>\n    </html>\n  ";
}
exports.getReDocHtml = getReDocHtml;
