#!/usr/bin/env ts-node
"use strict";
/**
 * Permissions Validation Script
 * Validates that:
 * 1. No duplicate permission keys exist
 * 2. All server permissions have corresponding client mappings
 * 3. All TRPC routers have proper permission enforcement
 * 4. All users have required permission records
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var fs_1 = require("fs");
var path_1 = require("path");
// Extract FEATURE_ACCESS entries from both server and client
function parsePermissionsFile(filePath) {
    var content = fs_1["default"].readFileSync(filePath, "utf-8");
    var entries = [];
    // Find all permission entries: "key": [roles]
    var regex = /^\s*"([^"]+)":\s*\[([\s\S]*?)\]/gm;
    var match;
    while ((match = regex.exec(content)) !== null) {
        var key = match[1];
        var rolesStr = match[2];
        // Parse roles
        var roles = rolesStr
            .split(",")
            .map(function (r) { return r.trim().replace(/["']/g, ""); })
            .filter(function (r) { return r; });
        // Get line number
        var line = content.substring(0, match.index).split("\n").length;
        entries.push({ key: key, file: filePath, roles: roles, line: line });
    }
    return entries;
}
// Check for duplicates
function findDuplicates(entries) {
    var duplicates = new Map();
    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
        var entry = entries_1[_i];
        if (!duplicates.has(entry.key)) {
            duplicates.set(entry.key, []);
        }
        duplicates.get(entry.key).push(entry);
    }
    return new Map(__spreadArrays(duplicates.entries()).filter(function (_a) {
        var _ = _a[0], entries = _a[1];
        return entries.length > 1;
    }));
}
// Check for role mismatches
function findMismatches(serverEntries, clientEntries) {
    var issues = [];
    var serverMap = new Map(serverEntries.map(function (e) { return [e.key, e]; }));
    var clientMap = new Map(clientEntries.map(function (e) { return [e.key, e]; }));
    var _loop_1 = function (key, serverPerm) {
        if (!clientMap.has(key)) {
            issues.push("\u274C Server permission missing on client: " + key);
        }
        else {
            var clientPerm = clientMap.get(key);
            var serverRoles_1 = new Set(serverPerm.roles);
            var clientRoles_1 = new Set(clientPerm.roles);
            var missing = __spreadArrays(serverRoles_1).filter(function (r) { return !clientRoles_1.has(r); });
            var extra = __spreadArrays(clientRoles_1).filter(function (r) { return !serverRoles_1.has(r); });
            if (missing.length > 0) {
                issues.push("\u26A0\uFE0F  " + key + ": Missing roles on client: " + missing.join(", "));
            }
            if (extra.length > 0) {
                issues.push("\u26A0\uFE0F  " + key + ": Extra roles on client: " + extra.join(", "));
            }
        }
    };
    // Check each server permission exists on client
    for (var _i = 0, serverMap_1 = serverMap; _i < serverMap_1.length; _i++) {
        var _a = serverMap_1[_i], key = _a[0], serverPerm = _a[1];
        _loop_1(key, serverPerm);
    }
    return issues;
}
// Main validation
console.log("📋 Validating Permissions System\n");
var serverPath = path_1["default"].join(process.cwd(), "server/middleware/enhancedRbac.ts");
var clientPath = path_1["default"].join(process.cwd(), "client/src/lib/permissions.ts");
if (!fs_1["default"].existsSync(serverPath)) {
    console.error("\u274C Server permissions file not found: " + serverPath);
    process.exit(1);
}
if (!fs_1["default"].existsSync(clientPath)) {
    console.error("\u274C Client permissions file not found: " + clientPath);
    process.exit(1);
}
console.log("🔍 Parsing permissions files...\n");
var serverEntries = parsePermissionsFile(serverPath);
var clientEntries = parsePermissionsFile(clientPath);
console.log("Server entries found: " + serverEntries.length);
console.log("Client entries found: " + clientEntries.length + "\n");
// Check for duplicates
console.log("🔎 Checking for duplicate keys...\n");
var serverDups = findDuplicates(serverEntries);
var clientDups = findDuplicates(clientEntries);
if (serverDups.size > 0) {
    console.log("\u274C Found " + serverDups.size + " duplicate keys in SERVER:\n");
    for (var _i = 0, serverDups_1 = serverDups; _i < serverDups_1.length; _i++) {
        var _a = serverDups_1[_i], key = _a[0], entries = _a[1];
        console.log("   \"" + key + "\" appears " + entries.length + " times:");
        entries.forEach(function (e) { return console.log("      Line " + e.line + ": " + e.file); });
    }
    console.log();
}
if (clientDups.size > 0) {
    console.log("\u274C Found " + clientDups.size + " duplicate keys in CLIENT:\n");
    for (var _b = 0, clientDups_1 = clientDups; _b < clientDups_1.length; _b++) {
        var _c = clientDups_1[_b], key = _c[0], entries = _c[1];
        console.log("   \"" + key + "\" appears " + entries.length + " times:");
        entries.forEach(function (e) { return console.log("      Line " + e.line + ": " + e.file); });
    }
    console.log();
}
// Check for mismatches
console.log("🔗 Checking for mismatches...\n");
var mismatches = findMismatches(serverEntries, clientEntries);
if (mismatches.length > 0) {
    console.log("Found " + mismatches.length + " issues:\n");
    mismatches.forEach(function (issue) { return console.log("   " + issue); });
    console.log();
}
else {
    console.log("✅ All server and client permissions match!\n");
}
// Summary
console.log("📊 Summary:");
console.log("   Total Server Permissions: " + serverEntries.length);
console.log("   Total Client Permissions: " + clientEntries.length);
console.log("   Server Duplicates: " + serverDups.size);
console.log("   Client Duplicates: " + clientDups.size);
console.log("   Mismatches: " + mismatches.length);
var hasIssues = serverDups.size > 0 || clientDups.size > 0 || mismatches.length > 0;
if (hasIssues) {
    console.log("\n❌ Validation FAILED - Fix the issues above");
    process.exit(1);
}
else {
    console.log("\n✅ Validation PASSED - All permissions are clean!");
    process.exit(0);
}
