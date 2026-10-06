"use strict";
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.recruitmentRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
function pool() {
    var p = db_1.getPool();
    if (!p)
        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    return p;
}
var readProc = trpc_1.createFeatureRestrictedProcedure("hr:view");
var writeProc = trpc_1.createFeatureRestrictedProcedure("hr:edit");
exports.recruitmentRouter = trpc_1.router({
    // ── Job Postings ──
    listPostings: readProc
        .input(zod_1.z.object({
        status: zod_1.z.string().optional(),
        departmentId: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var conds, params, where, rows, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        conds = [];
                        params = [];
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            conds.push("jp.status = ?");
                            params.push(input.status);
                        }
                        if (input === null || input === void 0 ? void 0 : input.departmentId) {
                            conds.push("jp.departmentId = ?");
                            params.push(input.departmentId);
                        }
                        where = conds.length ? "WHERE " + conds.join(" AND ") : "";
                        return [4 /*yield*/, pool().query("SELECT jp.*, d.name as departmentName,\n            (SELECT COUNT(*) FROM jobApplicants ja WHERE ja.jobPostingId = jp.id) as applicantCount\n           FROM jobPostings jp\n           LEFT JOIN departments d ON jp.departmentId = d.id\n           " + where + " ORDER BY jp.createdAt DESC", params)];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows];
                    case 2:
                        err_1 = _b.sent();
                        console.error("recruitment.listPostings error", err_1);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    getPosting: readProc.input(zod_1.z.string()).query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, pool().query("SELECT jp.*, d.name as departmentName\n       FROM jobPostings jp LEFT JOIN departments d ON jp.departmentId = d.id\n       WHERE jp.id = ? LIMIT 1", [input])];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows[0] || null];
                }
            });
        });
    }),
    createPosting: writeProc
        .input(zod_1.z.object({
        title: zod_1.z.string(),
        departmentId: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        requirements: zod_1.z.string().optional(),
        responsibilities: zod_1.z.string().optional(),
        qualifications: zod_1.z.string().optional(),
        experienceLevel: zod_1.z["enum"](["entry", "mid", "senior", "lead", "executive"]).optional(),
        employmentType: zod_1.z["enum"](["full_time", "part_time", "contract", "internship", "temporary"]).optional(),
        salaryMin: zod_1.z.number().optional(),
        salaryMax: zod_1.z.number().optional(),
        location: zod_1.z.string().optional(),
        isRemote: zod_1.z.boolean().optional(),
        openings: zod_1.z.number().optional(),
        applicationDeadline: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["draft", "open", "closed", "on_hold", "filled"]).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = uuid_1.v4();
                        return [4 /*yield*/, pool().query("INSERT INTO jobPostings (id, title, departmentId, description, requirements, responsibilities, qualifications, experienceLevel, employmentType, salaryMin, salaryMax, location, isRemote, openings, applicationDeadline, status, postedBy)\n         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, input.title, input.departmentId || null, input.description || null, input.requirements || null, input.responsibilities || null, input.qualifications || null, input.experienceLevel || 'mid', input.employmentType || 'full_time', input.salaryMin || null, input.salaryMax || null, input.location || null, input.isRemote ? 1 : 0, input.openings || 1, input.applicationDeadline || null, input.status || 'draft', ctx.user.id])];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({ userId: ctx.user.id, action: 'job_posting_created', entityType: 'jobPosting', entityId: id, description: "Created job posting: " + input.title })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    updatePosting: writeProc
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string().optional(),
        departmentId: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        requirements: zod_1.z.string().optional(),
        responsibilities: zod_1.z.string().optional(),
        qualifications: zod_1.z.string().optional(),
        experienceLevel: zod_1.z["enum"](["entry", "mid", "senior", "lead", "executive"]).optional(),
        employmentType: zod_1.z["enum"](["full_time", "part_time", "contract", "internship", "temporary"]).optional(),
        salaryMin: zod_1.z.number().optional(),
        salaryMax: zod_1.z.number().optional(),
        location: zod_1.z.string().optional(),
        isRemote: zod_1.z.boolean().optional(),
        openings: zod_1.z.number().optional(),
        applicationDeadline: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["draft", "open", "closed", "on_hold", "filled"]).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var id, fields, sets, params, _i, _b, _c, key, val;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        id = input.id, fields = __rest(input, ["id"]);
                        sets = [];
                        params = [];
                        for (_i = 0, _b = Object.entries(fields); _i < _b.length; _i++) {
                            _c = _b[_i], key = _c[0], val = _c[1];
                            if (val !== undefined) {
                                sets.push(key + " = ?");
                                params.push(key === 'isRemote' ? (val ? 1 : 0) : val);
                            }
                        }
                        if (!sets.length)
                            return [2 /*return*/, { success: true }];
                        params.push(id);
                        return [4 /*yield*/, pool().query("UPDATE jobPostings SET " + sets.join(", ") + " WHERE id = ?", params)];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, db_1.logActivity({ userId: ctx.user.id, action: 'job_posting_updated', entityType: 'jobPosting', entityId: id, description: "Updated job posting " + id })];
                    case 2:
                        _d.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    deletePosting: writeProc.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, pool().query("DELETE FROM jobApplicants WHERE jobPostingId = ?", [input])];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, pool().query("DELETE FROM jobPostings WHERE id = ?", [input])];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({ userId: ctx.user.id, action: 'job_posting_deleted', entityType: 'jobPosting', entityId: input, description: "Deleted job posting " + input })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Applicants ──
    listApplicants: readProc
        .input(zod_1.z.object({
        jobPostingId: zod_1.z.string().optional(),
        stage: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var conds, params, where, rows, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        conds = [];
                        params = [];
                        if (input === null || input === void 0 ? void 0 : input.jobPostingId) {
                            conds.push("ja.jobPostingId = ?");
                            params.push(input.jobPostingId);
                        }
                        if (input === null || input === void 0 ? void 0 : input.stage) {
                            conds.push("ja.stage = ?");
                            params.push(input.stage);
                        }
                        where = conds.length ? "WHERE " + conds.join(" AND ") : "";
                        return [4 /*yield*/, pool().query("SELECT ja.*, jp.title as jobTitle\n           FROM jobApplicants ja\n           LEFT JOIN jobPostings jp ON ja.jobPostingId = jp.id\n           " + where + " ORDER BY ja.createdAt DESC", params)];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows];
                    case 2:
                        err_2 = _b.sent();
                        console.error("recruitment.listApplicants error", err_2);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    getApplicant: readProc.input(zod_1.z.string()).query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, pool().query("SELECT ja.*, jp.title as jobTitle FROM jobApplicants ja\n       LEFT JOIN jobPostings jp ON ja.jobPostingId = jp.id\n       WHERE ja.id = ? LIMIT 1", [input])];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows[0] || null];
                }
            });
        });
    }),
    createApplicant: writeProc
        .input(zod_1.z.object({
        jobPostingId: zod_1.z.string(),
        firstName: zod_1.z.string(),
        lastName: zod_1.z.string(),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().optional(),
        currentEmployer: zod_1.z.string().optional(),
        currentTitle: zod_1.z.string().optional(),
        experienceYears: zod_1.z.number().optional(),
        expectedSalary: zod_1.z.number().optional(),
        noticePeriod: zod_1.z.number().optional(),
        source: zod_1.z["enum"](["website", "referral", "linkedin", "agency", "job_board", "other"]).optional(),
        referredBy: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = uuid_1.v4();
                        return [4 /*yield*/, pool().query("INSERT INTO jobApplicants (id, jobPostingId, firstName, lastName, email, phone, currentEmployer, currentTitle, experienceYears, expectedSalary, noticePeriod, source, referredBy, notes, stage)\n         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'applied')", [id, input.jobPostingId, input.firstName, input.lastName, input.email, input.phone || null, input.currentEmployer || null, input.currentTitle || null, input.experienceYears || null, input.expectedSalary || null, input.noticePeriod || null, input.source || 'website', input.referredBy || null, input.notes || null])];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({ userId: ctx.user.id, action: 'applicant_created', entityType: 'applicant', entityId: id, description: "Added applicant " + input.firstName + " " + input.lastName })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    updateApplicant: writeProc
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        stage: zod_1.z["enum"](["applied", "screening", "shortlisted", "interview", "assessment", "offer", "hired", "rejected", "withdrawn"]).optional(),
        rating: zod_1.z.number().optional(),
        notes: zod_1.z.string().optional(),
        interviewDate: zod_1.z.string().optional(),
        interviewNotes: zod_1.z.string().optional(),
        offerAmount: zod_1.z.number().optional(),
        offerDate: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var sets, params;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sets = [];
                        params = [];
                        if (input.stage) {
                            sets.push("stage = ?");
                            params.push(input.stage);
                        }
                        if (input.rating !== undefined) {
                            sets.push("rating = ?");
                            params.push(input.rating);
                        }
                        if (input.notes !== undefined) {
                            sets.push("notes = ?");
                            params.push(input.notes);
                        }
                        if (input.interviewDate !== undefined) {
                            sets.push("interviewDate = ?");
                            params.push(input.interviewDate);
                        }
                        if (input.interviewNotes !== undefined) {
                            sets.push("interviewNotes = ?");
                            params.push(input.interviewNotes);
                        }
                        if (input.offerAmount !== undefined) {
                            sets.push("offerAmount = ?");
                            params.push(input.offerAmount);
                        }
                        if (input.offerDate !== undefined) {
                            sets.push("offerDate = ?");
                            params.push(input.offerDate);
                        }
                        if (!sets.length)
                            return [2 /*return*/, { success: true }];
                        params.push(input.id);
                        return [4 /*yield*/, pool().query("UPDATE jobApplicants SET " + sets.join(", ") + " WHERE id = ?", params)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({ userId: ctx.user.id, action: 'applicant_updated', entityType: 'applicant', entityId: input.id, description: "Updated applicant " + input.id })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    deleteApplicant: writeProc.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, pool().query("DELETE FROM jobApplicants WHERE id = ?", [input])];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({ userId: ctx.user.id, action: 'applicant_deleted', entityType: 'applicant', entityId: input, description: "Deleted applicant " + input })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Stats ──
    stats: readProc.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var postingRows, applicantRows, p, a, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool().query("\n        SELECT \n          COUNT(*) as totalPostings,\n          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as openPostings,\n          SUM(openings) as totalOpenings\n        FROM jobPostings\n      ")];
                case 1:
                    postingRows = (_b.sent())[0];
                    return [4 /*yield*/, pool().query("\n        SELECT \n          COUNT(*) as totalApplicants,\n          SUM(CASE WHEN stage = 'applied' THEN 1 ELSE 0 END) as newApplicants,\n          SUM(CASE WHEN stage = 'interview' THEN 1 ELSE 0 END) as inInterview,\n          SUM(CASE WHEN stage = 'hired' THEN 1 ELSE 0 END) as hired\n        FROM jobApplicants\n      ")];
                case 2:
                    applicantRows = (_b.sent())[0];
                    p = postingRows[0];
                    a = applicantRows[0];
                    return [2 /*return*/, {
                            totalPostings: Number(p.totalPostings || 0), openPostings: Number(p.openPostings || 0), totalOpenings: Number(p.totalOpenings || 0),
                            totalApplicants: Number(a.totalApplicants || 0), newApplicants: Number(a.newApplicants || 0), inInterview: Number(a.inInterview || 0), hired: Number(a.hired || 0)
                        }];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, { totalPostings: 0, openPostings: 0, totalOpenings: 0, totalApplicants: 0, newApplicants: 0, inInterview: 0, hired: 0 }];
                case 4: return [2 /*return*/];
            }
        });
    }); })
});
