#!/usr/bin/env ts-node
"use strict";
/**
 * TRPC Router Permission Audit Script
 * Identifies routers with missing permission enforcement
 * Reports any hardcoded role checks instead of using RBAC
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs_1 = require("fs");
var glob_1 = require("glob");
var issues = [];
// Patterns that indicate problems
var PATTERNS = {
    // Missing permission checks
    missing_auth: /\.mutation\(\s*\(\|async\s*\(\s*{\s*input.*ctx.*}\s*=>|\.query\(\s*\(\|async\s*\(\s*{\s*input.*ctx.*}\s*=>/,
    // Hardcoded role arrays
    hardcoded_roles: /\["super_admin"\s*,\s*"admin"\]|\["admin"\s*,\s*"[^"]+"\]|includes\("admin"\)|includes\("super_admin"\)/,
    // Inline role checks
    inline_check: /ctx\.user\.role\s*===|ctx\.user\.role\s*===|\.role\s*!==\s*"admin"/
};
function auditRouters() {
    return __awaiter(this, void 0, void 0, function () {
        var routerFiles, _i, routerFiles_1, filePath, content, lines, inRouter, inProcedure, procedureName, i, line, lineNum, match, byFile, _a, issues_1, issue, _b, byFile_1, _c, file, fileIssues, _d, fileIssues_1, issue, byType, _e, issues_2, issue, _f, byType_1, _g, type, count;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    console.log("🔍 Auditing TRPC Routers for Permission Enforcement\n");
                    return [4 /*yield*/, glob_1.glob("server/routers/**/*.ts", {
                            ignore: ["**/node_modules/**", "**/*.test.ts"]
                        })];
                case 1:
                    routerFiles = _h.sent();
                    console.log("Found " + routerFiles.length + " router files\n");
                    for (_i = 0, routerFiles_1 = routerFiles; _i < routerFiles_1.length; _i++) {
                        filePath = routerFiles_1[_i];
                        content = fs_1["default"].readFileSync(filePath, "utf-8");
                        lines = content.split("\n");
                        inRouter = false;
                        inProcedure = false;
                        procedureName = "";
                        for (i = 0; i < lines.length; i++) {
                            line = lines[i];
                            lineNum = i + 1;
                            // Track router context
                            if (line.includes("export const") && line.includes("Router = router({")) {
                                inRouter = true;
                            }
                            // Check for hardcoded roles
                            if (inRouter && PATTERNS.hardcoded_roles.test(line)) {
                                issues.push({
                                    file: filePath,
                                    line: lineNum,
                                    type: "hardcoded_roles",
                                    description: "Hardcoded role array found - should use createFeatureRestrictedProcedure()",
                                    code: line.trim()
                                });
                            }
                            // Check for inline role checks
                            if (inRouter && PATTERNS.inline_check.test(line)) {
                                issues.push({
                                    file: filePath,
                                    line: lineNum,
                                    type: "hardcoded_roles",
                                    description: "Inline role check found - should use createFeatureRestrictedProcedure()",
                                    code: line.trim()
                                });
                            }
                            // Track procedure definitions
                            if (line.includes(".mutation(") || line.includes(".query(")) {
                                inProcedure = true;
                                match = line.match(/(\w+):\s*(protectedProcedure|createRoleRestrictedProcedure|createFeatureRestrictedProcedure)/);
                                if (match) {
                                    procedureName = match[1];
                                }
                            }
                            // Check for publicly accessible procedures
                            if (inProcedure &&
                                line.includes("protectedProcedure") &&
                                !line.includes("createFeatureRestrictedProcedure") &&
                                !line.includes("createRoleRestrictedProcedure")) {
                                // Flag procedures that only use protectedProcedure without feature restriction
                                if (!lines.slice(Math.max(0, i - 3), i).join(" ").includes("createFeatureRestrictedProcedure")) {
                                    issues.push({
                                        file: filePath,
                                        line: lineNum,
                                        type: "inconsistent_feature",
                                        description: "Procedure \"" + procedureName + "\" uses only protectedProcedure - add feature permission check",
                                        code: line.trim()
                                    });
                                }
                            }
                            if (line.includes("},")) {
                                inProcedure = false;
                            }
                        }
                    }
                    // Report issues
                    if (issues.length === 0) {
                        console.log("✅ No permission enforcement issues found!\n");
                        return [2 /*return*/];
                    }
                    console.log("\u274C Found " + issues.length + " permission issues:\n");
                    byFile = new Map();
                    for (_a = 0, issues_1 = issues; _a < issues_1.length; _a++) {
                        issue = issues_1[_a];
                        if (!byFile.has(issue.file)) {
                            byFile.set(issue.file, []);
                        }
                        byFile.get(issue.file).push(issue);
                    }
                    for (_b = 0, byFile_1 = byFile; _b < byFile_1.length; _b++) {
                        _c = byFile_1[_b], file = _c[0], fileIssues = _c[1];
                        console.log("\n\uD83D\uDCC4 " + file);
                        for (_d = 0, fileIssues_1 = fileIssues; _d < fileIssues_1.length; _d++) {
                            issue = fileIssues_1[_d];
                            console.log("   Line " + issue.line + ": " + issue.type);
                            console.log("   " + issue.description);
                            console.log("   Code: " + issue.code);
                        }
                    }
                    console.log("\n\uD83D\uDCCA Summary by type:");
                    byType = new Map();
                    for (_e = 0, issues_2 = issues; _e < issues_2.length; _e++) {
                        issue = issues_2[_e];
                        byType.set(issue.type, (byType.get(issue.type) || 0) + 1);
                    }
                    for (_f = 0, byType_1 = byType; _f < byType_1.length; _f++) {
                        _g = byType_1[_f], type = _g[0], count = _g[1];
                        console.log("   " + type + ": " + count);
                    }
                    return [2 /*return*/, issues];
            }
        });
    });
}
// Run audit
auditRouters().then(function (issues) {
    process.exit(issues && issues.length > 0 ? 1 : 0);
});
