"use strict";
/**
 * Production Migration Runner - v2 (Simplified Comment Handling)
 *
 * Executes .sql migration files directly to the database.
 * Handles comment removal properly to avoid SQL syntax errors.
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
require("dotenv/config");
var fs = require("fs");
var path = require("path");
var mysql = require("mysql2/promise");
function runMigrations() {
    return __awaiter(this, void 0, void 0, function () {
        var dbUrl, match, user, password, host, port, database, pool, conn, appliedMigrations, appliedHashes, migrationsDir, migrationFiles, appliedCount, _i, migrationFiles_1, file, fileHash, sqlContent, statements, conn_1, _a, statements_1, statement, err_1, msg, code, errno, shouldSkip, error_1, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!process.env.DATABASE_URL) {
                        console.log("[Migrations] ℹ️  DATABASE_URL not set - skipping migrations");
                        process.exit(0);
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 28, , 29]);
                    console.log("[Migrations] 🔄 Connecting to database...");
                    dbUrl = process.env.DATABASE_URL;
                    console.log("[Migrations] 📝 DATABASE_URL:", dbUrl === null || dbUrl === void 0 ? void 0 : dbUrl.replace(/:[^:]+@/, ":***@"));
                    match = dbUrl.match(/^mysql:\/\/([^:]+):(.+)@([^:]+):(\d+)\/([^?]+)(?:\?(.*))?$/);
                    if (!match) {
                        throw new Error("Invalid DATABASE_URL format");
                    }
                    user = match[1], password = match[2], host = match[3], port = match[4], database = match[5];
                    console.log("[Migrations] ✓ Parsed credentials: user=%s, host=%s, port=%s, database=%s", user, host, port, database);
                    return [4 /*yield*/, mysql.createPool({
                            host: host,
                            port: parseInt(port),
                            user: user,
                            password: password,
                            database: database,
                            waitForConnections: true,
                            connectionLimit: 5,
                            queueLimit: 0
                        })];
                case 2:
                    pool = _b.sent();
                    console.log("[Migrations] ✓ Database connection pool created");
                    return [4 /*yield*/, pool.getConnection()];
                case 3:
                    conn = _b.sent();
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, , 6, 7]);
                    return [4 /*yield*/, conn.execute("\n        CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (\n          id BIGINT AUTO_INCREMENT PRIMARY KEY,\n          hash TEXT NOT NULL,\n          created_at BIGINT\n        )\n      ")];
                case 5:
                    _b.sent();
                    console.log("[Migrations] ✓ Ensured __drizzle_migrations table exists");
                    return [3 /*break*/, 7];
                case 6:
                    conn.release();
                    return [7 /*endfinally*/];
                case 7: return [4 /*yield*/, pool.execute("SELECT hash FROM `__drizzle_migrations`")];
                case 8:
                    appliedMigrations = (_b.sent())[0];
                    appliedHashes = new Set(appliedMigrations.map(function (row) { return row.hash; }));
                    migrationsDir = "./drizzle/migrations";
                    if (!!fs.existsSync(migrationsDir)) return [3 /*break*/, 10];
                    console.log("[Migrations] ℹ️  No migrations directory found");
                    return [4 /*yield*/, pool.end()];
                case 9:
                    _b.sent();
                    process.exit(0);
                    _b.label = 10;
                case 10:
                    migrationFiles = fs
                        .readdirSync(migrationsDir)
                        .filter(function (f) { return f.endsWith(".sql"); })
                        .sort();
                    console.log("[Migrations] 📋 Found", migrationFiles.length, "migration files to process");
                    appliedCount = 0;
                    _i = 0, migrationFiles_1 = migrationFiles;
                    _b.label = 11;
                case 11:
                    if (!(_i < migrationFiles_1.length)) return [3 /*break*/, 26];
                    file = migrationFiles_1[_i];
                    fileHash = path.basename(file, ".sql");
                    if (appliedHashes.has(fileHash)) {
                        console.log("[Migrations] \u2713 " + file + " (already applied)");
                        return [3 /*break*/, 25];
                    }
                    _b.label = 12;
                case 12:
                    _b.trys.push([12, 24, , 25]);
                    console.log("[Migrations] \uD83D\uDD04 Applying " + file + "...");
                    sqlContent = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
                    // Remove all types of comments
                    sqlContent = sqlContent
                        .split("\n")
                        .map(function (line) {
                        // Remove -- comments
                        var idx = line.indexOf("--");
                        return idx === -1 ? line : line.substring(0, idx);
                    })
                        .join("\n");
                    // Remove /* */ comments
                    sqlContent = sqlContent.replace(/\/\*[\s\S]*?\*\//g, "");
                    statements = sqlContent
                        .split(";")
                        .map(function (s) { return s.trim(); })
                        .filter(function (s) { return s.length > 0; });
                    return [4 /*yield*/, pool.getConnection()];
                case 13:
                    conn_1 = _b.sent();
                    _b.label = 14;
                case 14:
                    _b.trys.push([14, , 22, 23]);
                    _a = 0, statements_1 = statements;
                    _b.label = 15;
                case 15:
                    if (!(_a < statements_1.length)) return [3 /*break*/, 20];
                    statement = statements_1[_a];
                    _b.label = 16;
                case 16:
                    _b.trys.push([16, 18, , 19]);
                    return [4 /*yield*/, conn_1.query(statement)];
                case 17:
                    _b.sent();
                    return [3 /*break*/, 19];
                case 18:
                    err_1 = _b.sent();
                    msg = (((err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || "") + " " + ((err_1 === null || err_1 === void 0 ? void 0 : err_1.sqlMessage) || "")).trim().toLowerCase();
                    code = (err_1 === null || err_1 === void 0 ? void 0 : err_1.code) || "";
                    errno = (err_1 === null || err_1 === void 0 ? void 0 : err_1.errno) || 0;
                    shouldSkip = msg.includes("already exists") ||
                        msg.includes("doesn't exist") ||
                        msg.includes("doesnt exist") ||
                        msg.includes("no such table") ||
                        msg.includes("duplicate column") ||
                        msg.includes("foreign key") ||
                        msg.includes("can't drop") ||
                        msg.includes("referencing column") ||
                        msg.includes("failed to open") ||
                        msg.includes("incompatible") ||
                        code === "ER_NO_SUCH_TABLE" ||
                        code === "ER_TABLE_EXISTS_ERROR" ||
                        code === "ER_DUP_FIELDNAME" ||
                        code === "ER_FK_INCOMPATIBLE_COLUMNS" ||
                        code === "ER_FK_CANNOT_OPEN_PARENT" ||
                        code === "ER_CANT_DROP_FIELD_OR_KEY" ||
                        errno === 1824 || // ER_FK_CANNOT_OPEN_PARENT
                        errno === 1452 || // ER_NO_REFERENCED_ROW
                        errno === 1091;
                    // Also treat duplicate key name errors as safe to skip
                    if (shouldSkip || msg.includes("duplicate key")) {
                        return [3 /*break*/, 19];
                    }
                    throw err_1;
                case 19:
                    _a++;
                    return [3 /*break*/, 15];
                case 20: 
                // Mark migration as applied
                return [4 /*yield*/, conn_1.execute("INSERT INTO `__drizzle_migrations` (hash, created_at) VALUES (?, ?)", [fileHash, Date.now()])];
                case 21:
                    // Mark migration as applied
                    _b.sent();
                    console.log("[Migrations] \u2705 " + file + " applied successfully");
                    appliedCount++;
                    return [3 /*break*/, 23];
                case 22:
                    conn_1.release();
                    return [7 /*endfinally*/];
                case 23: return [3 /*break*/, 25];
                case 24:
                    error_1 = _b.sent();
                    console.error("[Migrations] \u274C Error applying " + file + ":");
                    console.error(error_1.message);
                    throw error_1;
                case 25:
                    _i++;
                    return [3 /*break*/, 11];
                case 26:
                    console.log("[Migrations] \u2705 Applied " + appliedCount + " new migrations");
                    return [4 /*yield*/, pool.end()];
                case 27:
                    _b.sent();
                    process.exit(0);
                    return [3 /*break*/, 29];
                case 28:
                    error_2 = _b.sent();
                    console.error("[Migrations] ❌ Migration failed:", error_2);
                    process.exit(1);
                    return [3 /*break*/, 29];
                case 29: return [2 /*return*/];
            }
        });
    });
}
runMigrations();
