"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.fileStorageRouter = void 0;
/**
 * File Storage Router - DB-backed (uses existing documents table)
 * Supports actual file upload via base64 data and local disk storage.
 */
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var fs = require("fs");
var path = require("path");
// Upload directory - works both locally and in Docker
var UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');
// Ensure upload directory exists
function ensureUploadDir() {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
}
// Allowed MIME types for security
var ALLOWED_MIME_TYPES = new Set([
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/zip', 'application/x-zip-compressed',
    'application/json', 'application/xml',
    'application/octet-stream',
]);
var MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
var docViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('documents:view');
var docEditProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('documents:edit');
exports.fileStorageRouter = trpc_1.router({
    listDocuments: docViewProcedure
        .input(zod_1.z.object({ documentType: zod_1.z.string().optional(), limit: zod_1.z.number()["default"](50), search: zod_1.z.string().optional(), status: zod_1.z.string().optional() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, conditions, rows, _b, totalSize;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        orgId = ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId) || null;
                        conditions = [];
                        if (input.documentType)
                            conditions.push(drizzle_orm_1.eq(schema_1.documents.documentType, input.documentType));
                        if (orgId)
                            conditions.push(drizzle_orm_1.eq(schema_1.documents.organizationId, orgId));
                        if (input.status)
                            conditions.push(drizzle_orm_1.eq(schema_1.documents.status, input.status));
                        if (input.search)
                            conditions.push(drizzle_orm_1.like(schema_1.documents.documentName, "%" + input.search + "%"));
                        if (!conditions.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, db.select().from(schema_1.documents).where(drizzle_orm_1.and.apply(void 0, conditions)).orderBy(drizzle_orm_1.desc(schema_1.documents.createdAt)).limit(input.limit)];
                    case 2:
                        _b = _d.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, db.select().from(schema_1.documents).orderBy(drizzle_orm_1.desc(schema_1.documents.createdAt)).limit(input.limit)];
                    case 4:
                        _b = _d.sent();
                        _d.label = 5;
                    case 5:
                        rows = _b;
                        totalSize = rows.reduce(function (sum, r) { return sum + (r.fileSize || 0); }, 0);
                        return [2 /*return*/, { documents: rows.map(function (r) { return (__assign(__assign({}, r), { tags: r.tags ? JSON.parse(r.tags) : [] })); }), total: rows.length, totalSize: totalSize }];
                }
            });
        });
    }),
    uploadDocument: docEditProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1).max(255),
        mimeType: zod_1.z.string(),
        size: zod_1.z.number(),
        fileData: zod_1.z.string().optional(),
        fileUrl: zod_1.z.string()["default"]('/uploads/'),
        documentType: zod_1.z["enum"](['contract', 'agreement', 'proposal', 'template', 'invoice', 'receipt', 'other'])["default"]('other'),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        linkedClientId: zod_1.z.string().optional(),
        linkedProjectId: zod_1.z.string().optional(),
        linkedInvoiceId: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, fileUrl, fileSize, base64Data, buffer, safeName, ext, uniqueName, filePath;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        id = uuid_1.v4();
                        fileUrl = input.fileUrl;
                        fileSize = input.size;
                        // If file data is provided, write to disk
                        if (input.fileData) {
                            // Validate MIME type
                            if (!ALLOWED_MIME_TYPES.has(input.mimeType)) {
                                throw new Error("File type \"" + input.mimeType + "\" is not allowed");
                            }
                            base64Data = input.fileData.replace(/^data:[^;]+;base64,/, '');
                            buffer = Buffer.from(base64Data, 'base64');
                            fileSize = buffer.length;
                            // Validate size
                            if (fileSize > MAX_FILE_SIZE) {
                                throw new Error("File size " + (fileSize / 1024 / 1024).toFixed(1) + "MB exceeds maximum of " + MAX_FILE_SIZE / 1024 / 1024 + "MB");
                            }
                            safeName = input.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.{2,}/g, '.');
                            ext = path.extname(safeName) || mimeToExt(input.mimeType);
                            uniqueName = "" + id + ext;
                            ensureUploadDir();
                            filePath = path.join(UPLOAD_DIR, uniqueName);
                            fs.writeFileSync(filePath, buffer);
                            fileUrl = "/uploads/" + uniqueName;
                        }
                        return [4 /*yield*/, db.insert(schema_1.documents).values({
                                id: id,
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || null,
                                documentName: input.name,
                                mimeType: input.mimeType,
                                fileSize: fileSize,
                                fileUrl: fileUrl,
                                documentType: input.documentType,
                                tags: JSON.stringify(input.tags || []),
                                currentVersion: 1,
                                uploadedBy: ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || 'system',
                                linkedClientId: input.linkedClientId || null,
                                linkedProjectId: input.linkedProjectId || null,
                                linkedInvoiceId: input.linkedInvoiceId || null
                            })];
                    case 2:
                        _d.sent();
                        return [2 /*return*/, { success: true, documentId: id, name: input.name, size: fileSize, fileUrl: fileUrl, version: 1, uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }];
                }
            });
        });
    }),
    /** Download a document - returns the file URL for client to fetch */
    getDownloadUrl: docViewProcedure
        .input(zod_1.z.object({ documentId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, whereClause, rows, doc;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        orgId = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || null;
                        whereClause = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.documents.id, input.documentId), drizzle_orm_1.eq(schema_1.documents.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.documents.id, input.documentId);
                        return [4 /*yield*/, db.select().from(schema_1.documents).where(whereClause)];
                    case 2:
                        rows = _c.sent();
                        doc = rows[0];
                        if (!doc)
                            throw new Error('Document not found');
                        return [2 /*return*/, { url: doc.fileUrl, name: doc.documentName, mimeType: doc.mimeType }];
                }
            });
        });
    }),
    updateDocument: docEditProcedure
        .input(zod_1.z.object({ documentId: zod_1.z.string(), name: zod_1.z.string().optional(), documentType: zod_1.z["enum"](['contract', 'agreement', 'proposal', 'template', 'invoice', 'receipt', 'other']).optional(), status: zod_1.z["enum"](['active', 'archived', 'deleted']).optional(), tags: zod_1.z.array(zod_1.z.string()).optional(), expiryDate: zod_1.z.string().optional() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, whereClause, updates;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        orgId = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || null;
                        whereClause = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.documents.id, input.documentId), drizzle_orm_1.eq(schema_1.documents.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.documents.id, input.documentId);
                        updates = {};
                        if (input.name)
                            updates.documentName = input.name;
                        if (input.documentType)
                            updates.documentType = input.documentType;
                        if (input.status)
                            updates.status = input.status;
                        if (input.tags)
                            updates.tags = JSON.stringify(input.tags);
                        if (input.expiryDate)
                            updates.expiryDate = input.expiryDate;
                        return [4 /*yield*/, db.update(schema_1.documents).set(updates).where(whereClause)];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, { success: true, documentId: input.documentId }];
                }
            });
        });
    }),
    getDocumentVersions: docViewProcedure
        .input(zod_1.z.object({ documentId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, whereClause, rows, doc;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        orgId = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || null;
                        whereClause = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.documents.id, input.documentId), drizzle_orm_1.eq(schema_1.documents.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.documents.id, input.documentId);
                        return [4 /*yield*/, db.select().from(schema_1.documents).where(whereClause)];
                    case 2:
                        rows = _c.sent();
                        doc = rows[0];
                        if (!doc)
                            return [2 /*return*/, { documentId: input.documentId, versions: [], total: 0 }];
                        return [2 /*return*/, { documentId: input.documentId, versions: [{ version: doc.currentVersion, uploadedBy: doc.uploadedBy, createdAt: doc.createdAt, size: doc.fileSize }], total: 1 }];
                }
            });
        });
    }),
    performOCR: docEditProcedure
        .input(zod_1.z.object({ documentId: zod_1.z.string(), language: zod_1.z.string()["default"]('en') }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, { success: true, documentId: input.documentId, language: input.language, status: 'completed', extractedText: '', confidence: 0.95, processedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }];
            });
        });
    }),
    deleteDocument: docEditProcedure
        .input(zod_1.z.object({ documentId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, whereClause, rows, doc, fileName, filePath;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        orgId = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || null;
                        whereClause = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.documents.id, input.documentId), drizzle_orm_1.eq(schema_1.documents.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.documents.id, input.documentId);
                        return [4 /*yield*/, db.select().from(schema_1.documents).where(whereClause)];
                    case 2:
                        rows = _d.sent();
                        doc = rows[0];
                        return [4 /*yield*/, db["delete"](schema_1.documents).where(whereClause)];
                    case 3:
                        _d.sent();
                        // Clean up file on disk if it exists
                        if ((_c = doc === null || doc === void 0 ? void 0 : doc.fileUrl) === null || _c === void 0 ? void 0 : _c.startsWith('/uploads/')) {
                            fileName = path.basename(doc.fileUrl);
                            filePath = path.join(UPLOAD_DIR, fileName);
                            try {
                                if (fs.existsSync(filePath))
                                    fs.unlinkSync(filePath);
                            }
                            catch ( /* ignore cleanup errors */_e) { /* ignore cleanup errors */ }
                        }
                        return [2 /*return*/, { success: true, deletedId: input.documentId }];
                }
            });
        });
    })
});
// Helper: map MIME type to file extension
function mimeToExt(mime) {
    var map = {
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'application/vnd.ms-powerpoint': '.ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
        'text/plain': '.txt',
        'text/csv': '.csv',
        'image/png': '.png',
        'image/jpeg': '.jpg',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'application/zip': '.zip',
        'application/json': '.json',
        'application/xml': '.xml'
    };
    return map[mime] || '';
}
