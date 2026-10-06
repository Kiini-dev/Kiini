"use strict";
/**
 * Mobile Utilities
 * Centralized export of all utility functions
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
exports.__esModule = true;
var storage_1 = require("./storage");
__createBinding(exports, storage_1, "storage");
var analytics_1 = require("./analytics");
__createBinding(exports, analytics_1, "analytics");
var validation_1 = require("./validation");
__createBinding(exports, validation_1, "validators");
__createBinding(exports, validation_1, "validateForm");
