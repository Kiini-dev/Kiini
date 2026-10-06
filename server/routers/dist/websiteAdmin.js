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
exports.websiteAdminRouter = void 0;
var zod_1 = require("zod");
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
// Admin-only guard
var adminOnly = trpc_1.protectedProcedure.use(function (_a) {
    var ctx = _a.ctx, next = _a.next;
    if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }
    return next({ ctx: ctx });
});
// ── Website pages registry (matches actual public routes) ─────────────
var WEBSITE_PAGES = [
    { slug: "landing", title: "Landing Page", path: "/", description: "Main homepage with hero, features overview, and CTAs" },
    { slug: "features", title: "Features", path: "/features", description: "Product features showcase by category" },
    { slug: "pricing", title: "Pricing", path: "/pricing", description: "Pricing tiers and feature comparison" },
    { slug: "about", title: "About Us", path: "/about", description: "Company story, values, team, and milestones" },
    { slug: "contact", title: "Contact", path: "/contact", description: "Contact form and company info" },
    { slug: "demo", title: "Demo", path: "/demo", description: "Interactive product demo page" },
    { slug: "documentation", title: "Documentation", path: "/documentation", description: "Platform documentation and knowledge base" },
    { slug: "user-guide", title: "User Guide", path: "/user-guide", description: "Step-by-step user guide" },
    { slug: "troubleshooting", title: "Troubleshooting", path: "/troubleshooting", description: "Support and troubleshooting guide" },
    { slug: "privacy-policy", title: "Privacy Policy", path: "/privacy-policy", description: "Privacy policy page" },
    { slug: "terms-and-conditions", title: "Terms & Conditions", path: "/terms-and-conditions", description: "Terms of service" },
];
exports.websiteAdminRouter = trpc_1.router({
    // ── Pages ──────────────────────────────────────────────────────
    getPages: adminOnly.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, rows, settings, settingsMap, _i, settings_1, s;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            return [2 /*return*/, WEBSITE_PAGES.map(function (p) { return (__assign(__assign({}, p), { isPublished: true, seoTitle: "", seoDescription: "", seoKeywords: "" })); })];
                        return [4 /*yield*/, pool.query("SELECT * FROM systemSettings WHERE category = 'website_page'")];
                    case 1:
                        rows = (_b.sent())[0];
                        settings = rows;
                        settingsMap = {};
                        for (_i = 0, settings_1 = settings; _i < settings_1.length; _i++) {
                            s = settings_1[_i];
                            settingsMap[s.key] = s.dataType === "json" ? JSON.parse(s.value || "{}") : s.value;
                        }
                        return [2 /*return*/, WEBSITE_PAGES.map(function (p) {
                                var pageData = settingsMap["page_" + p.slug] || {};
                                return __assign(__assign({}, p), { isPublished: pageData.isPublished !== false, seoTitle: pageData.seoTitle || "", seoDescription: pageData.seoDescription || "", seoKeywords: pageData.seoKeywords || "" });
                            })];
                }
            });
        });
    }),
    updatePage: adminOnly
        .input(zod_1.z.object({
        slug: zod_1.z.string(),
        isPublished: zod_1.z.boolean().optional(),
        seoTitle: zod_1.z.string().optional(),
        seoDescription: zod_1.z.string().optional(),
        seoKeywords: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, key, value, existing, rows;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        key = "page_" + input.slug;
                        value = JSON.stringify({
                            isPublished: (_b = input.isPublished) !== null && _b !== void 0 ? _b : true,
                            seoTitle: input.seoTitle || "",
                            seoDescription: input.seoDescription || "",
                            seoKeywords: input.seoKeywords || ""
                        });
                        return [4 /*yield*/, pool.query("SELECT id FROM systemSettings WHERE category = 'website_page' AND `key` = ?", [key])];
                    case 1:
                        existing = (_c.sent())[0];
                        rows = existing;
                        if (!rows.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, pool.query("UPDATE systemSettings SET value = ?, updatedBy = ?, updatedAt = NOW() WHERE id = ?", [value, ctx.user.id, rows[0].id])];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, pool.query("INSERT INTO systemSettings (id, category, `key`, value, dataType, description, isPublic, updatedBy, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())", [uuid_1.v4(), "website_page", key, value, "json", "Page settings for " + input.slug, 0, ctx.user.id])];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Navigation ─────────────────────────────────────────────────
    getNavigation: adminOnly.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, rows, arr;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_nav' AND `key` = 'config'")];
                    case 1:
                        rows = (_b.sent())[0];
                        arr = rows;
                        if (arr.length && arr[0].value) {
                            return [2 /*return*/, JSON.parse(arr[0].value)];
                        }
                        // Return default nav structure
                        return [2 /*return*/, {
                                mainLinks: [
                                    { label: "Features", href: "/features", visible: true },
                                    { label: "Pricing", href: "/pricing", visible: true },
                                    { label: "Book a Demo", href: "/book-a-demo", visible: true },
                                    { label: "Partners", href: "/become-a-partner", visible: true },
                                    { label: "About", href: "/about", visible: true },
                                    { label: "Contact", href: "/contact", visible: true },
                                ],
                                resourceLinks: [
                                    { label: "Documentation", href: "/documentation", visible: true },
                                    { label: "User Guide", href: "/user-guide", visible: true },
                                    { label: "Troubleshooting", href: "/troubleshooting", visible: true },
                                ],
                                ctaText: "Get Started",
                                ctaLink: "/signup"
                            }];
                }
            });
        });
    }),
    updateNavigation: adminOnly
        .input(zod_1.z.object({
        mainLinks: zod_1.z.array(zod_1.z.object({
            label: zod_1.z.string(),
            href: zod_1.z.string(),
            visible: zod_1.z.boolean()
        })),
        resourceLinks: zod_1.z.array(zod_1.z.object({
            label: zod_1.z.string(),
            href: zod_1.z.string(),
            visible: zod_1.z.boolean()
        })),
        ctaText: zod_1.z.string(),
        ctaLink: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, value, existing, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        value = JSON.stringify(input);
                        return [4 /*yield*/, pool.query("SELECT id FROM systemSettings WHERE category = 'website_nav' AND `key` = 'config'")];
                    case 1:
                        existing = (_b.sent())[0];
                        rows = existing;
                        if (!rows.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, pool.query("UPDATE systemSettings SET value = ?, updatedBy = ?, updatedAt = NOW() WHERE id = ?", [value, ctx.user.id, rows[0].id])];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, pool.query("INSERT INTO systemSettings (id, category, `key`, value, dataType, description, isPublic, updatedBy, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())", [uuid_1.v4(), "website_nav", "config", value, "json", "Website navigation configuration", 0, ctx.user.id])];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── General website settings ───────────────────────────────────
    getSettings: adminOnly.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, rows, arr, result, _i, arr_1, r;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, pool.query("SELECT * FROM systemSettings WHERE category = 'website_general'")];
                    case 1:
                        rows = (_b.sent())[0];
                        arr = rows;
                        result = {};
                        for (_i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
                            r = arr_1[_i];
                            result[r.key] = r.value || "";
                        }
                        return [2 /*return*/, {
                                siteTitle: result.siteTitle || "Kiini",
                                tagline: result.tagline || "Complete Business Management Platform",
                                heroTitle: result.heroTitle || "",
                                heroSubtitle: result.heroSubtitle || "",
                                contactEmail: result.contactEmail || "",
                                contactPhone: result.contactPhone || "",
                                contactAddress: result.contactAddress || "",
                                socialLinkedIn: result.socialLinkedIn || "",
                                socialTwitter: result.socialTwitter || "",
                                socialFacebook: result.socialFacebook || "",
                                socialInstagram: result.socialInstagram || "",
                                googleAnalyticsId: result.googleAnalyticsId || "",
                                customHeadScript: result.customHeadScript || "",
                                announcementBanner: result.announcementBanner || "",
                                announcementEnabled: result.announcementEnabled === "true"
                            }];
                }
            });
        });
    }),
    updateSettings: adminOnly
        .input(zod_1.z.object({
        siteTitle: zod_1.z.string().optional(),
        tagline: zod_1.z.string().optional(),
        heroTitle: zod_1.z.string().optional(),
        heroSubtitle: zod_1.z.string().optional(),
        contactEmail: zod_1.z.string().optional(),
        contactPhone: zod_1.z.string().optional(),
        contactAddress: zod_1.z.string().optional(),
        socialLinkedIn: zod_1.z.string().optional(),
        socialTwitter: zod_1.z.string().optional(),
        socialFacebook: zod_1.z.string().optional(),
        socialInstagram: zod_1.z.string().optional(),
        googleAnalyticsId: zod_1.z.string().optional(),
        customHeadScript: zod_1.z.string().optional(),
        announcementBanner: zod_1.z.string().optional(),
        announcementEnabled: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, _i, _b, _c, key, val, strVal, existing, rows;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        _i = 0, _b = Object.entries(input);
                        _d.label = 1;
                    case 1:
                        if (!(_i < _b.length)) return [3 /*break*/, 7];
                        _c = _b[_i], key = _c[0], val = _c[1];
                        if (val === undefined)
                            return [3 /*break*/, 6];
                        strVal = typeof val === "boolean" ? String(val) : val;
                        return [4 /*yield*/, pool.query("SELECT id FROM systemSettings WHERE category = 'website_general' AND `key` = ?", [key])];
                    case 2:
                        existing = (_d.sent())[0];
                        rows = existing;
                        if (!rows.length) return [3 /*break*/, 4];
                        return [4 /*yield*/, pool.query("UPDATE systemSettings SET value = ?, updatedBy = ?, updatedAt = NOW() WHERE id = ?", [strVal, ctx.user.id, rows[0].id])];
                    case 3:
                        _d.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, pool.query("INSERT INTO systemSettings (id, category, `key`, value, dataType, description, isPublic, updatedBy, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())", [uuid_1.v4(), "website_general", key, strVal, "string", "Website setting: " + key, 0, ctx.user.id])];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Contact form submissions ───────────────────────────────────
    getContactSubmissions: adminOnly.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, rows, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            return [2 /*return*/, []];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, pool.query("SELECT * FROM websiteContacts ORDER BY createdAt DESC LIMIT 100")];
                    case 2:
                        rows = (_c.sent())[0];
                        return [2 /*return*/, rows.map(function (r) { return ({
                                id: r.id,
                                name: r.name,
                                email: r.email,
                                phone: r.phone || "",
                                company: r.company || "",
                                subject: r.subject || "",
                                message: r.message,
                                status: r.status || "new",
                                createdAt: r.createdAt
                            }); })];
                    case 3:
                        _b = _c.sent();
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    updateContactStatus: adminOnly
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        status: zod_1.z["enum"](["new", "read", "replied", "archived"])
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 9]);
                        return [4 /*yield*/, pool.query("UPDATE websiteContacts SET status = ? WHERE id = ?", [input.status, input.id])];
                    case 2:
                        _d.sent();
                        return [3 /*break*/, 9];
                    case 3:
                        _b = _d.sent();
                        _d.label = 4;
                    case 4:
                        _d.trys.push([4, 7, , 8]);
                        return [4 /*yield*/, pool.query("ALTER TABLE websiteContacts ADD COLUMN status VARCHAR(20) DEFAULT 'new'")];
                    case 5:
                        _d.sent();
                        return [4 /*yield*/, pool.query("UPDATE websiteContacts SET status = ? WHERE id = ?", [input.status, input.id])];
                    case 6:
                        _d.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _c = _d.sent();
                        return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 9];
                    case 9: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Analytics placeholder ──────────────────────────────────────
    getAnalytics: adminOnly.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, pageRows, pageSettings, publishedCount, _i, pageSettings_1, s, val, totalInquiries, inquiriesByMonth, inquiriesByStatus, countRows, monthRows, statusRows, _a, _b, r, _c;
        var _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool) {
                        return [2 /*return*/, { totalPages: WEBSITE_PAGES.length, publishedPages: WEBSITE_PAGES.length, lastUpdated: new Date().toISOString(), totalInquiries: 0, inquiriesByMonth: [], inquiriesByStatus: {} }];
                    }
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_page'")];
                case 1:
                    pageRows = (_f.sent())[0];
                    pageSettings = pageRows;
                    publishedCount = WEBSITE_PAGES.length;
                    for (_i = 0, pageSettings_1 = pageSettings; _i < pageSettings_1.length; _i++) {
                        s = pageSettings_1[_i];
                        try {
                            val = JSON.parse(s.value || "{}");
                            if (val.isPublished === false)
                                publishedCount--;
                        }
                        catch (_g) { }
                    }
                    totalInquiries = 0;
                    inquiriesByMonth = [];
                    inquiriesByStatus = { "new": 0, read: 0, replied: 0, archived: 0 };
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, pool.query("SELECT COUNT(*) as total FROM websiteContacts")];
                case 3:
                    countRows = (_f.sent())[0];
                    totalInquiries = (_e = (_d = countRows[0]) === null || _d === void 0 ? void 0 : _d.total) !== null && _e !== void 0 ? _e : 0;
                    return [4 /*yield*/, pool.query("SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as count FROM websiteContacts GROUP BY month ORDER BY month DESC LIMIT 12")];
                case 4:
                    monthRows = (_f.sent())[0];
                    inquiriesByMonth = monthRows.reverse();
                    return [4 /*yield*/, pool.query("SELECT COALESCE(status, 'new') as status, COUNT(*) as count FROM websiteContacts GROUP BY status")];
                case 5:
                    statusRows = (_f.sent())[0];
                    for (_a = 0, _b = statusRows; _a < _b.length; _a++) {
                        r = _b[_a];
                        inquiriesByStatus[r.status] = r.count;
                    }
                    return [3 /*break*/, 7];
                case 6:
                    _c = _f.sent();
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, {
                        totalPages: WEBSITE_PAGES.length,
                        publishedPages: publishedCount,
                        lastUpdated: new Date().toISOString(),
                        totalInquiries: totalInquiries,
                        inquiriesByMonth: inquiriesByMonth,
                        inquiriesByStatus: inquiriesByStatus
                    }];
            }
        });
    }); }),
    // ── Delete contact ────────────────────────────────────────────
    deleteContact: adminOnly
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        return [4 /*yield*/, pool.query("DELETE FROM websiteContacts WHERE id = ?", [input.id])];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Bulk update contacts ──────────────────────────────────────
    bulkUpdateContacts: adminOnly
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string()),
        action: zod_1.z["enum"](["read", "replied", "archived", "delete"])
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        if (!(input.action === "delete")) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("DELETE FROM websiteContacts WHERE id IN (?)", [input.ids])];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, pool.query("UPDATE websiteContacts SET status = ? WHERE id IN (?)", [input.action, input.ids])];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Footer configuration ──────────────────────────────────────
    getFooterConfig: adminOnly.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, rows, arr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_footer' AND `key` = 'config'")];
                case 1:
                    rows = (_a.sent())[0];
                    arr = rows;
                    if (arr.length && arr[0].value)
                        return [2 /*return*/, JSON.parse(arr[0].value)];
                    return [2 /*return*/, {
                            columns: [
                                { title: "Product", links: [
                                        { label: "Features", href: "/features" },
                                        { label: "Pricing", href: "/pricing" },
                                        { label: "Demo", href: "/demo" },
                                        { label: "Documentation", href: "/documentation" },
                                    ] },
                                { title: "Resources", links: [
                                        { label: "User Guide", href: "/user-guide" },
                                        { label: "Troubleshooting", href: "/troubleshooting" },
                                        { label: "About", href: "/about" },
                                        { label: "Contact", href: "/contact" },
                                    ] },
                                { title: "Legal", links: [
                                        { label: "Privacy Policy", href: "/privacy-policy" },
                                        { label: "Terms & Conditions", href: "/terms-and-conditions" },
                                    ] },
                            ],
                            copyrightText: "",
                            showCloudPartners: true,
                            showComplianceBadges: true
                        }];
            }
        });
    }); }),
    updateFooterConfig: adminOnly
        .input(zod_1.z.object({
        columns: zod_1.z.array(zod_1.z.object({
            title: zod_1.z.string(),
            links: zod_1.z.array(zod_1.z.object({ label: zod_1.z.string(), href: zod_1.z.string() }))
        })),
        copyrightText: zod_1.z.string().optional(),
        showCloudPartners: zod_1.z.boolean().optional(),
        showComplianceBadges: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, value, existing, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        value = JSON.stringify(input);
                        return [4 /*yield*/, pool.query("SELECT id FROM systemSettings WHERE category = 'website_footer' AND `key` = 'config'")];
                    case 1:
                        existing = (_b.sent())[0];
                        rows = existing;
                        if (!rows.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, pool.query("UPDATE systemSettings SET value = ?, updatedBy = ?, updatedAt = NOW() WHERE id = ?", [value, ctx.user.id, rows[0].id])];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, pool.query("INSERT INTO systemSettings (id, category, `key`, value, dataType, description, isPublic, updatedBy, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())", [uuid_1.v4(), "website_footer", "config", value, "json", "Website footer configuration", 0, ctx.user.id])];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Public endpoints (no auth required) ────────────────────────
    publicNavigation: trpc_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, defaultNav, rows, arr, stored, hasPartners, bookIdx, insertAt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pool = db_1.getPool();
                    defaultNav = {
                        mainLinks: [
                            { label: "Features", href: "/features", visible: true },
                            { label: "Pricing", href: "/pricing", visible: true },
                            { label: "Book a Demo", href: "/book-a-demo", visible: true },
                            { label: "Partners", href: "/become-a-partner", visible: true },
                            { label: "About", href: "/about", visible: true },
                            { label: "Contact", href: "/contact", visible: true },
                        ],
                        resourceLinks: [
                            { label: "Documentation", href: "/documentation", visible: true },
                            { label: "User Guide", href: "/user-guide", visible: true },
                            { label: "Troubleshooting", href: "/troubleshooting", visible: true },
                        ],
                        ctaText: "Get Started",
                        ctaLink: "/signup"
                    };
                    if (!pool)
                        return [2 /*return*/, defaultNav];
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_nav' AND `key` = 'config'")];
                case 1:
                    rows = (_a.sent())[0];
                    arr = rows;
                    if (!arr.length || !arr[0].value)
                        return [2 /*return*/, defaultNav];
                    stored = JSON.parse(arr[0].value);
                    // Upgrade legacy /demo link → /book-a-demo, and inject /become-a-partner if missing
                    if (stored.mainLinks) {
                        stored.mainLinks = stored.mainLinks.map(function (link) {
                            if (link.href === "/demo")
                                return __assign(__assign({}, link), { label: "Book a Demo", href: "/book-a-demo" });
                            return link;
                        });
                        hasPartners = stored.mainLinks.some(function (l) { return l.href === "/become-a-partner"; });
                        if (!hasPartners) {
                            bookIdx = stored.mainLinks.findIndex(function (l) { return l.href === "/book-a-demo"; });
                            insertAt = bookIdx >= 0 ? bookIdx + 1 : stored.mainLinks.length;
                            stored.mainLinks.splice(insertAt, 0, { label: "Partners", href: "/become-a-partner", visible: true });
                        }
                    }
                    return [2 /*return*/, stored];
            }
        });
    }); }),
    publicSettings: trpc_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, rows, arr, result, _i, arr_2, r, logoUrl, companyName, database, logoRows, logoMap, _a, logoRows_1, r, generalRows, generalMap, _b, generalRows_1, r, _1;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, pool.query("SELECT * FROM systemSettings WHERE category = 'website_general'")];
                case 1:
                    rows = (_e.sent())[0];
                    arr = rows;
                    result = {};
                    for (_i = 0, arr_2 = arr; _i < arr_2.length; _i++) {
                        r = arr_2[_i];
                        result[r.key] = r.value || "";
                    }
                    logoUrl = "";
                    companyName = "";
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, db_1.getDb()];
                case 3:
                    database = _e.sent();
                    if (!database) return [3 /*break*/, 6];
                    return [4 /*yield*/, database
                            .select()
                            .from(schema_1.settings)
                            .where(drizzle_orm_1.eq(schema_1.settings.category, "company_logos"))];
                case 4:
                    logoRows = _e.sent();
                    logoMap = {};
                    for (_a = 0, logoRows_1 = logoRows; _a < logoRows_1.length; _a++) {
                        r = logoRows_1[_a];
                        logoMap[r.key] = (_c = r.value) !== null && _c !== void 0 ? _c : "";
                    }
                    logoUrl = logoMap.largeLogo || logoMap.smallLogo || "";
                    return [4 /*yield*/, database
                            .select()
                            .from(schema_1.settings)
                            .where(drizzle_orm_1.eq(schema_1.settings.category, "general"))];
                case 5:
                    generalRows = _e.sent();
                    generalMap = {};
                    for (_b = 0, generalRows_1 = generalRows; _b < generalRows_1.length; _b++) {
                        r = generalRows_1[_b];
                        generalMap[r.key] = (_d = r.value) !== null && _d !== void 0 ? _d : "";
                    }
                    companyName = generalMap.companyName || "";
                    _e.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    _1 = _e.sent();
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/, {
                        siteTitle: result.siteTitle || "Kiini",
                        tagline: result.tagline || "One Hub. Total Control. The unified business management platform for modern enterprises.",
                        contactEmail: result.contactEmail || "",
                        contactPhone: result.contactPhone || "",
                        contactAddress: result.contactAddress || "",
                        socialLinkedIn: result.socialLinkedIn || "",
                        socialTwitter: result.socialTwitter || "",
                        socialFacebook: result.socialFacebook || "",
                        socialInstagram: result.socialInstagram || "",
                        announcementBanner: result.announcementBanner || "",
                        announcementEnabled: result.announcementEnabled === "true",
                        logoUrl: logoUrl,
                        companyName: companyName
                    }];
            }
        });
    }); }),
    publicFooterConfig: trpc_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, rows, arr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_footer' AND `key` = 'config'")];
                case 1:
                    rows = (_a.sent())[0];
                    arr = rows;
                    if (arr.length && arr[0].value)
                        return [2 /*return*/, JSON.parse(arr[0].value)];
                    return [2 /*return*/, {
                            columns: [
                                { title: "Product", links: [
                                        { label: "Features", href: "/features" },
                                        { label: "Pricing", href: "/pricing" },
                                        { label: "Demo", href: "/demo" },
                                        { label: "Documentation", href: "/documentation" },
                                    ] },
                                { title: "Resources", links: [
                                        { label: "User Guide", href: "/user-guide" },
                                        { label: "Troubleshooting", href: "/troubleshooting" },
                                        { label: "About", href: "/about" },
                                        { label: "Contact", href: "/contact" },
                                    ] },
                                { title: "Legal", links: [
                                        { label: "Privacy Policy", href: "/privacy-policy" },
                                        { label: "Terms & Conditions", href: "/terms-and-conditions" },
                                    ] },
                            ],
                            copyrightText: "",
                            showCloudPartners: true,
                            showComplianceBadges: true
                        }];
            }
        });
    }); }),
    /** Public pricing data - fetches plans from CRM pricing management */
    publicPricing: trpc_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, priceRows, priceArr, prices, dbPlans, planRows, _a, tierFeatures, featureRows, _i, _b, f, _c, customConfig, cfgRows, cfgArr, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, pool.query("SELECT value FROM settings WHERE `key` = 'plan_prices' LIMIT 1")];
                case 1:
                    priceRows = (_e.sent())[0];
                    priceArr = priceRows;
                    prices = null;
                    if (priceArr.length && priceArr[0].value) {
                        try {
                            prices = JSON.parse(priceArr[0].value);
                        }
                        catch ( /* ignore */_f) { /* ignore */ }
                    }
                    dbPlans = [];
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, pool.query("SELECT * FROM pricingPlans WHERE isActive = 1 ORDER BY displayOrder ASC, monthlyPrice ASC")];
                case 3:
                    planRows = (_e.sent())[0];
                    dbPlans = planRows;
                    return [3 /*break*/, 5];
                case 4:
                    _a = _e.sent();
                    return [3 /*break*/, 5];
                case 5:
                    tierFeatures = {};
                    _e.label = 6;
                case 6:
                    _e.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, pool.query("SELECT tier, featureKey, isEnabled FROM pricingTierFeatures")];
                case 7:
                    featureRows = (_e.sent())[0];
                    for (_i = 0, _b = featureRows; _i < _b.length; _i++) {
                        f = _b[_i];
                        if (!tierFeatures[f.tier])
                            tierFeatures[f.tier] = {};
                        tierFeatures[f.tier][f.featureKey] = Boolean(f.isEnabled);
                    }
                    return [3 /*break*/, 9];
                case 8:
                    _c = _e.sent();
                    return [3 /*break*/, 9];
                case 9:
                    customConfig = null;
                    _e.label = 10;
                case 10:
                    _e.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_pricing' AND `key` = 'config' LIMIT 1")];
                case 11:
                    cfgRows = (_e.sent())[0];
                    cfgArr = cfgRows;
                    if (cfgArr.length && cfgArr[0].value) {
                        customConfig = JSON.parse(cfgArr[0].value);
                    }
                    return [3 /*break*/, 13];
                case 12:
                    _d = _e.sent();
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/, { prices: prices, dbPlans: dbPlans, tierFeatures: tierFeatures, customConfig: customConfig }];
            }
        });
    }); }),
    /** Admin: save pricing page customization */
    updatePricingConfig: adminOnly
        .input(zod_1.z.object({
        config: zod_1.z.object({
            plans: zod_1.z.array(zod_1.z.object({
                name: zod_1.z.string(),
                tier: zod_1.z.string(),
                monthlyKes: zod_1.z.number(),
                annualKes: zod_1.z.number(),
                description: zod_1.z.string(),
                highlight: zod_1.z.boolean(),
                badge: zod_1.z.string().nullable(),
                cta: zod_1.z.string(),
                ctaLink: zod_1.z.string(),
                maxUsers: zod_1.z.string(),
                features: zod_1.z.array(zod_1.z.object({
                    text: zod_1.z.string(),
                    included: zod_1.z.boolean()
                }))
            })),
            comparisonRows: zod_1.z.array(zod_1.z.object({
                category: zod_1.z.string().optional(),
                label: zod_1.z.string().optional(),
                starter: zod_1.z.any().optional(),
                pro: zod_1.z.any().optional(),
                ent: zod_1.z.any().optional()
            })),
            faq: zod_1.z.array(zod_1.z.object({
                q: zod_1.z.string(),
                a: zod_1.z.string()
            }))
        })
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, value, existing, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        value = JSON.stringify(input.config);
                        return [4 /*yield*/, pool.query("SELECT id FROM systemSettings WHERE category = 'website_pricing' AND `key` = 'config'")];
                    case 1:
                        existing = (_b.sent())[0];
                        rows = existing;
                        if (!rows.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, pool.query("UPDATE systemSettings SET value = ?, updatedBy = ?, updatedAt = NOW() WHERE id = ?", [value, ctx.user.id, rows[0].id])];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, pool.query("INSERT INTO systemSettings (id, category, `key`, value, dataType, description, isPublic, updatedBy, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())", [uuid_1.v4(), "website_pricing", "config", value, "json", "Public pricing page configuration", 1, ctx.user.id])];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /** Admin: get pricing page config */
    getPricingConfig: adminOnly.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, rows, arr, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, null];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_pricing' AND `key` = 'config' LIMIT 1")];
                case 2:
                    rows = (_b.sent())[0];
                    arr = rows;
                    if (arr.length && arr[0].value)
                        return [2 /*return*/, JSON.parse(arr[0].value)];
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, null];
            }
        });
    }); }),
    // ── About Page Content ─────────────────────────────────────────
    getAboutContent: adminOnly.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, rows, arr, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, null];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_about' AND `key` = 'content' LIMIT 1")];
                case 2:
                    rows = (_b.sent())[0];
                    arr = rows;
                    if (arr.length && arr[0].value)
                        return [2 /*return*/, JSON.parse(arr[0].value)];
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, null];
            }
        });
    }); }),
    updateAboutContent: adminOnly
        .input(zod_1.z.object({
        heroTitle: zod_1.z.string().max(200).optional(),
        heroSubtitle: zod_1.z.string().max(500).optional(),
        missionText: zod_1.z.string().max(2000).optional(),
        stats: zod_1.z.array(zod_1.z.object({ label: zod_1.z.string(), value: zod_1.z.string() })).optional(),
        values: zod_1.z.array(zod_1.z.object({ title: zod_1.z.string(), desc: zod_1.z.string(), icon: zod_1.z.string().optional(), color: zod_1.z.string().optional() })).optional(),
        milestones: zod_1.z.array(zod_1.z.object({ year: zod_1.z.string(), event: zod_1.z.string() })).optional(),
        team: zod_1.z.array(zod_1.z.object({ name: zod_1.z.string(), role: zod_1.z.string(), bio: zod_1.z.string() })).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, value;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No DB" });
                        value = JSON.stringify(input);
                        return [4 /*yield*/, pool.query("INSERT INTO systemSettings (id, category, `key`, value, dataType)\n         VALUES (?, 'website_about', 'content', ?, 'json')\n         ON DUPLICATE KEY UPDATE value = ?", [uuid_1.v4(), value, value])];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Public About content
    publicAboutContent: trpc_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, rows, arr, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, null];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_about' AND `key` = 'content' LIMIT 1")];
                case 2:
                    rows = (_b.sent())[0];
                    arr = rows;
                    if (arr.length && arr[0].value)
                        return [2 /*return*/, JSON.parse(arr[0].value)];
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, null];
            }
        });
    }); }),
    // ── Features Page Content ──────────────────────────────────────
    getFeaturesContent: adminOnly.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, rows, arr, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, null];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_features' AND `key` = 'content' LIMIT 1")];
                case 2:
                    rows = (_b.sent())[0];
                    arr = rows;
                    if (arr.length && arr[0].value)
                        return [2 /*return*/, JSON.parse(arr[0].value)];
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, null];
            }
        });
    }); }),
    updateFeaturesContent: adminOnly
        .input(zod_1.z.object({
        heroTitle: zod_1.z.string().max(200).optional(),
        heroBadge: zod_1.z.string().max(100).optional(),
        heroSubtitle: zod_1.z.string().max(500).optional(),
        sections: zod_1.z.array(zod_1.z.object({
            category: zod_1.z.string(),
            desc: zod_1.z.string().optional(),
            icon: zod_1.z.string().optional(),
            features: zod_1.z.array(zod_1.z.string())
        })).optional(),
        pillars: zod_1.z.array(zod_1.z.object({ title: zod_1.z.string(), desc: zod_1.z.string(), icon: zod_1.z.string().optional() })).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, value;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No DB" });
                        value = JSON.stringify(input);
                        return [4 /*yield*/, pool.query("INSERT INTO systemSettings (id, category, `key`, value, dataType)\n         VALUES (?, 'website_features', 'content', ?, 'json')\n         ON DUPLICATE KEY UPDATE value = ?", [uuid_1.v4(), value, value])];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Public Features content
    publicFeaturesContent: trpc_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, rows, arr, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, null];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_features' AND `key` = 'content' LIMIT 1")];
                case 2:
                    rows = (_b.sent())[0];
                    arr = rows;
                    if (arr.length && arr[0].value)
                        return [2 /*return*/, JSON.parse(arr[0].value)];
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, null];
            }
        });
    }); }),
    // ── Testimonials ──────────────────────────────────────────────
    getTestimonials: adminOnly.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, rows, arr, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, []];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_testimonials' AND `key` = 'items' LIMIT 1")];
                case 2:
                    rows = (_b.sent())[0];
                    arr = rows;
                    if (arr.length && arr[0].value)
                        return [2 /*return*/, JSON.parse(arr[0].value)];
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, []];
            }
        });
    }); }),
    updateTestimonials: adminOnly
        .input(zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().max(100),
        role: zod_1.z.string().max(100).optional(),
        company: zod_1.z.string().max(100).optional(),
        content: zod_1.z.string().max(1000),
        rating: zod_1.z.number().min(1).max(5)["default"](5),
        isVisible: zod_1.z.boolean()["default"](true),
        avatarUrl: zod_1.z.string().max(500).optional()
    })))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, value;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No DB" });
                        value = JSON.stringify(input);
                        return [4 /*yield*/, pool.query("INSERT INTO systemSettings (id, category, `key`, value, dataType)\n         VALUES (?, 'website_testimonials', 'items', ?, 'json')\n         ON DUPLICATE KEY UPDATE value = ?", [uuid_1.v4(), value, value])];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    publicTestimonials: trpc_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, rows, arr, items, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, []];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_testimonials' AND `key` = 'items' LIMIT 1")];
                case 2:
                    rows = (_b.sent())[0];
                    arr = rows;
                    if (arr.length && arr[0].value) {
                        items = JSON.parse(arr[0].value);
                        return [2 /*return*/, items.filter(function (t) { return t.isVisible !== false; })];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, []];
            }
        });
    }); }),
    // ── FAQ ────────────────────────────────────────────────────────
    getFAQs: adminOnly.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, rows, arr, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, []];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_faq' AND `key` = 'items' LIMIT 1")];
                case 2:
                    rows = (_b.sent())[0];
                    arr = rows;
                    if (arr.length && arr[0].value)
                        return [2 /*return*/, JSON.parse(arr[0].value)];
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, []];
            }
        });
    }); }),
    updateFAQs: adminOnly
        .input(zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        question: zod_1.z.string().max(500),
        answer: zod_1.z.string().max(2000),
        category: zod_1.z.string().max(100).optional(),
        order: zod_1.z.number()["default"](0),
        isVisible: zod_1.z.boolean()["default"](true)
    })))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, value;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No DB" });
                        value = JSON.stringify(input);
                        return [4 /*yield*/, pool.query("INSERT INTO systemSettings (id, category, `key`, value, dataType)\n         VALUES (?, 'website_faq', 'items', ?, 'json')\n         ON DUPLICATE KEY UPDATE value = ?", [uuid_1.v4(), value, value])];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    publicFAQs: trpc_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, rows, arr, items, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, []];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_faq' AND `key` = 'items' LIMIT 1")];
                case 2:
                    rows = (_b.sent())[0];
                    arr = rows;
                    if (arr.length && arr[0].value) {
                        items = JSON.parse(arr[0].value);
                        return [2 /*return*/, items.filter(function (f) { return f.isVisible !== false; }).sort(function (a, b) { return (a.order || 0) - (b.order || 0); })];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, []];
            }
        });
    }); }),
    // ── Blog ───────────────────────────────────────────────────────
    getBlogPosts: adminOnly.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, rows, arr, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, []];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_blog' AND `key` = 'posts' LIMIT 1")];
                case 2:
                    rows = (_b.sent())[0];
                    arr = rows;
                    if (arr.length && arr[0].value)
                        return [2 /*return*/, JSON.parse(arr[0].value)];
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, []];
            }
        });
    }); }),
    updateBlogPosts: adminOnly
        .input(zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string().max(300),
        slug: zod_1.z.string().max(300),
        excerpt: zod_1.z.string().max(500).optional(),
        content: zod_1.z.string().max(50000),
        author: zod_1.z.string().max(100).optional(),
        category: zod_1.z.string().max(100).optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        coverImageUrl: zod_1.z.string().max(500).optional(),
        isPublished: zod_1.z.boolean()["default"](false),
        publishedAt: zod_1.z.string().optional(),
        createdAt: zod_1.z.string().optional()
    })))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, value;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No DB" });
                        value = JSON.stringify(input);
                        return [4 /*yield*/, pool.query("INSERT INTO systemSettings (id, category, `key`, value, dataType)\n         VALUES (?, 'website_blog', 'posts', ?, 'json')\n         ON DUPLICATE KEY UPDATE value = ?", [uuid_1.v4(), value, value])];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    publicBlogPosts: trpc_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, rows, arr, posts, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, []];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_blog' AND `key` = 'posts' LIMIT 1")];
                case 2:
                    rows = (_b.sent())[0];
                    arr = rows;
                    if (arr.length && arr[0].value) {
                        posts = JSON.parse(arr[0].value);
                        return [2 /*return*/, posts.filter(function (p) { return p.isPublished; }).sort(function (a, b) {
                                return new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime();
                            })];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, []];
            }
        });
    }); }),
    // ── Hero / Landing Content ─────────────────────────────────────
    getHeroContent: adminOnly.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, rows, arr, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, null];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_hero' AND `key` = 'content' LIMIT 1")];
                case 2:
                    rows = (_b.sent())[0];
                    arr = rows;
                    if (arr.length && arr[0].value)
                        return [2 /*return*/, JSON.parse(arr[0].value)];
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, null];
            }
        });
    }); }),
    updateHeroContent: adminOnly
        .input(zod_1.z.object({
        badge: zod_1.z.string().max(100).optional(),
        title: zod_1.z.string().max(300).optional(),
        subtitle: zod_1.z.string().max(500).optional(),
        ctaPrimary: zod_1.z.object({ label: zod_1.z.string(), href: zod_1.z.string() }).optional(),
        ctaSecondary: zod_1.z.object({ label: zod_1.z.string(), href: zod_1.z.string() }).optional(),
        stats: zod_1.z.array(zod_1.z.object({ label: zod_1.z.string(), value: zod_1.z.string() })).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, value;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No DB" });
                        value = JSON.stringify(input);
                        return [4 /*yield*/, pool.query("INSERT INTO systemSettings (id, category, `key`, value, dataType)\n         VALUES (?, 'website_hero', 'content', ?, 'json')\n         ON DUPLICATE KEY UPDATE value = ?", [uuid_1.v4(), value, value])];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    publicHeroContent: trpc_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var pool, rows, arr, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, null];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pool.query("SELECT value FROM systemSettings WHERE category = 'website_hero' AND `key` = 'content' LIMIT 1")];
                case 2:
                    rows = (_b.sent())[0];
                    arr = rows;
                    if (arr.length && arr[0].value)
                        return [2 /*return*/, JSON.parse(arr[0].value)];
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, null];
            }
        });
    }); }),
    // ── Public: Submit contact / partner application ───────────────
    submitContact: trpc_1.publicProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1).max(255),
        email: zod_1.z.string().email().max(255),
        company: zod_1.z.string().max(255).optional(),
        phone: zod_1.z.string().max(50).optional(),
        website: zod_1.z.string().max(500).optional(),
        subject: zod_1.z.string().max(500).optional(),
        message: zod_1.z.string().min(1).max(10000)
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, id, subject, err_1, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        pool = db_1.getPool();
                        id = uuid_1.v4();
                        subject = input.subject || "Website Enquiry";
                        if (!pool) return [3 /*break*/, 8];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 8]);
                        return [4 /*yield*/, pool.query("INSERT INTO websiteContacts (id, name, email, company, phone, subject, message, status, createdAt)\n             VALUES (?, ?, ?, ?, ?, ?, ?, 'new', NOW())\n             ON DUPLICATE KEY UPDATE id = id", [id, input.name, input.email, input.company || null, input.phone || null, subject, input.message])];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 3:
                        err_1 = _c.sent();
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, pool.query("INSERT INTO websiteContacts (id, name, email, company, subject, message, status, createdAt)\n               VALUES (?, ?, ?, ?, ?, ?, 'new', NOW())", [id, input.name, input.email, input.company || null, subject, input.message])];
                    case 5:
                        _c.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _b = _c.sent();
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, { success: true, message: "Thank you! We'll be in touch shortly." }];
                }
            });
        });
    }),
    // ── Public: Book a demo ───────────────────────────────────────
    bookDemo: trpc_1.publicProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1).max(255),
        email: zod_1.z.string().email().max(255),
        company: zod_1.z.string().max(255).optional(),
        phone: zod_1.z.string().max(50).optional(),
        teamSize: zod_1.z.string().max(50).optional(),
        message: zod_1.z.string().max(2000).optional(),
        date: zod_1.z.string().max(50),
        time: zod_1.z.string().max(20),
        timezone: zod_1.z.string().max(100),
        duration: zod_1.z.number().int().min(15).max(120)
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, id, subject, messageBody, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pool = db_1.getPool();
                        id = uuid_1.v4();
                        subject = "Demo Booking \u2013 " + input.date + " at " + input.time + " (" + input.timezone + ")";
                        messageBody = [
                            "Meeting: " + input.date + " at " + input.time + " " + input.timezone + " (" + input.duration + " min)",
                            "Company: " + (input.company || "—"),
                            "Phone: " + (input.phone || "—"),
                            "Team size: " + (input.teamSize || "—"),
                            input.message ? "Notes: " + input.message : "",
                        ].filter(Boolean).join("\n");
                        if (!pool) return [3 /*break*/, 8];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 8]);
                        return [4 /*yield*/, pool.query("INSERT INTO websiteContacts (id, name, email, company, phone, subject, message, status, createdAt)\n             VALUES (?, ?, ?, ?, ?, ?, ?, 'new', NOW())", [id, input.name, input.email, input.company || null, input.phone || null, subject, messageBody])];
                    case 2:
                        _d.sent();
                        return [3 /*break*/, 8];
                    case 3:
                        _b = _d.sent();
                        _d.label = 4;
                    case 4:
                        _d.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, pool.query("INSERT INTO websiteContacts (id, name, email, company, subject, message, status, createdAt)\n               VALUES (?, ?, ?, ?, ?, ?, 'new', NOW())", [id, input.name, input.email, input.company || null, subject, messageBody])];
                    case 5:
                        _d.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _c = _d.sent();
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, { success: true, message: "Demo booked! Check your email for a confirmation." }];
                }
            });
        });
    })
});
