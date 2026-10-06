#!/usr/bin/env node
"use strict";
/**
 * Simple Router Audit Script
 * Checks for hardcoded role checks in TRPC routers
 */
exports.__esModule = true;
var fs_1 = require("fs");
var path_1 = require("path");
function getAllFiles(dir) {
    var files = [];
    try {
        var entries = fs_1["default"].readdirSync(dir, { withFileTypes: true });
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            var fullPath = path_1["default"].join(dir, entry.name);
            if (entry.isDirectory()) {
                files.push.apply(files, getAllFiles(fullPath));
            }
            else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".spec.ts")) {
                files.push(fullPath);
            }
        }
    }
    catch (err) {
        // Skip directories we can't read
    }
    return files;
}
var findings = [];
// Get the router directory - handle both file:// URLs and regular paths
var routerDir = import.meta.url;
if (routerDir.startsWith("file://")) {
    routerDir = routerDir.slice(7); // Remove file://
}
routerDir = path_1["default"].dirname(routerDir);
routerDir = path_1["default"].join(path_1["default"].dirname(routerDir), "server", "routers");
console.log("🔍 Auditing TRPC routers for hardcoded role checks...\n");
console.log("Scanning: " + routerDir + "\n");
var routerFiles = getAllFiles(routerDir);
console.log("Found " + routerFiles.length + " router files\n");
// Patterns to look for
var checkPatterns = [
    { pattern: /role\s*===\s*['"]admin['"]/g, name: "Hardcoded admin check" },
    { pattern: /role\s*===\s*['"]super_admin['"]/g, name: "Hardcoded super_admin check" },
    { pattern: /includes\(\s*['"]admin['"]\s*\)/g, name: "Role includes admin" },
    { pattern: /\[\s*['"]super_admin['"]\s*,\s*['"]admin['"]\s*\]/g, name: "Hardcoded role array" },
];
for (var _i = 0, routerFiles_1 = routerFiles; _i < routerFiles_1.length; _i++) {
    var file = routerFiles_1[_i];
    try {
        var content = fs_1["default"].readFileSync(file, "utf-8");
        var lines = content.split("\n");
        for (var _a = 0, checkPatterns_1 = checkPatterns; _a < checkPatterns_1.length; _a++) {
            var _b = checkPatterns_1[_a], pattern = _b.pattern, name = _b.name;
            var match = void 0;
            var globalPattern = new RegExp(pattern.source, "g");
            while ((match = globalPattern.exec(content)) !== null) {
                var lineNumber = content.substring(0, match.index).split("\n").length;
                var lineText = lines[lineNumber - 1] || "";
                findings.push({
                    file: file.replace(routerDir, ""),
                    pattern: name,
                    lineNumber: lineNumber,
                    matchText: lineText.trim().substring(0, 100)
                });
            }
        }
    }
    catch (err) {
        // Skip files we can't read
    }
}
if (findings.length === 0) {
    console.log("✅ No hardcoded role checks found!\n");
}
else {
    console.log("\u274C Found " + findings.length + " potential issues:\n");
    // Group by file
    var byFile = new Map();
    for (var _c = 0, findings_1 = findings; _c < findings_1.length; _c++) {
        var finding = findings_1[_c];
        if (!byFile.has(finding.file)) {
            byFile.set(finding.file, []);
        }
        byFile.get(finding.file).push(finding);
    }
    for (var _d = 0, _e = byFile.entries(); _d < _e.length; _d++) {
        var _f = _e[_d], file = _f[0], fileFindings = _f[1];
        console.log("\uD83D\uDCC4 " + file);
        for (var _g = 0, fileFindings_1 = fileFindings; _g < fileFindings_1.length; _g++) {
            var f = fileFindings_1[_g];
            console.log("   Line " + f.lineNumber + ": " + f.pattern);
            console.log("   >>> " + f.matchText);
        }
        console.log();
    }
}
console.log("✅ Audit complete!");
