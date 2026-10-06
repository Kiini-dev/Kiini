"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
exports.__esModule = true;
// Barrel file to make imports like "../../drizzle" resolve to the schema
__exportStar(require("./schema"), exports);
__exportStar(require("./relations"), exports);
// schema-extended may contain additional exports referenced elsewhere
__exportStar(require("./schema-extended"), exports);
// Phase 4 approval workflow schema
__exportStar(require("./approvalSchema"), exports);
