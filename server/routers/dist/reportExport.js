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
exports.__esModule = true;
exports.reportExportRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var report_pdf_generator_1 = require("../utils/report-pdf-generator");
var report_export_utils_1 = require("../utils/report-export-utils");
var reportCreateProcedure = trpc_1.createFeatureRestrictedProcedure("reports:create");
var reportExportProcedure = trpc_1.createFeatureRestrictedProcedure("reports:export");
exports.reportExportRouter = trpc_1.router({
    // Generate financial report in multiple formats
    generateFinancialReport: reportCreateProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string()["default"]("Financial Report"),
        format: zod_1.z["enum"](["pdf", "csv", "txt", "json"])["default"]("pdf"),
        startDate: zod_1.z.date().optional(),
        endDate: zod_1.z.date().optional(),
        includeDetails: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var config, buffer, mimeType, filename, dateStr, _b, base64, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 10, , 11]);
                        config = {
                            title: input.title,
                            startDate: input.startDate,
                            endDate: input.endDate,
                            includeDetails: input.includeDetails
                        };
                        buffer = void 0;
                        mimeType = void 0;
                        filename = void 0;
                        dateStr = new Date().toISOString().split("T")[0];
                        _b = input.format;
                        switch (_b) {
                            case "csv": return [3 /*break*/, 1];
                            case "txt": return [3 /*break*/, 3];
                            case "json": return [3 /*break*/, 5];
                            case "pdf": return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 7];
                    case 1: return [4 /*yield*/, report_export_utils_1.generateFinancialReportCSV(config)];
                    case 2:
                        buffer = _c.sent();
                        mimeType = "text/csv";
                        filename = "Financial_Report_" + dateStr + ".csv";
                        return [3 /*break*/, 9];
                    case 3: return [4 /*yield*/, report_export_utils_1.generateFinancialReportTXT(config)];
                    case 4:
                        buffer = _c.sent();
                        mimeType = "text/plain";
                        filename = "Financial_Report_" + dateStr + ".txt";
                        return [3 /*break*/, 9];
                    case 5: return [4 /*yield*/, report_export_utils_1.generateFinancialReportJSON(config)];
                    case 6:
                        buffer = _c.sent();
                        mimeType = "application/json";
                        filename = "Financial_Report_" + dateStr + ".json";
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, report_pdf_generator_1.generateFinancialReportPDF(config)];
                    case 8:
                        buffer = _c.sent();
                        mimeType = "application/pdf";
                        filename = "Financial_Report_" + dateStr + ".pdf";
                        return [3 /*break*/, 9];
                    case 9:
                        base64 = buffer.toString("base64");
                        return [2 /*return*/, {
                                success: true,
                                data: base64,
                                filename: filename,
                                mimeType: mimeType
                            }];
                    case 10:
                        error_1 = _c.sent();
                        console.error("Error generating financial report:", error_1);
                        return [2 /*return*/, {
                                success: false,
                                error: error_1 instanceof Error ? error_1.message : "Failed to generate report"
                            }];
                    case 11: return [2 /*return*/];
                }
            });
        });
    }),
    // Generate expense report PDF
    generateExpenseReport: reportExportProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string()["default"]("Expense Report"),
        startDate: zod_1.z.date().optional(),
        endDate: zod_1.z.date().optional(),
        includeDetails: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var pdfBuffer, base64, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, report_pdf_generator_1.generateExpenseReportPDF({
                                title: input.title,
                                startDate: input.startDate,
                                endDate: input.endDate,
                                includeDetails: input.includeDetails
                            })];
                    case 1:
                        pdfBuffer = _b.sent();
                        base64 = pdfBuffer.toString("base64");
                        return [2 /*return*/, {
                                success: true,
                                data: base64,
                                filename: "Expense_Report_" + new Date().toISOString().split("T")[0] + ".pdf"
                            }];
                    case 2:
                        error_2 = _b.sent();
                        console.error("Error generating expense report:", error_2);
                        return [2 /*return*/, {
                                success: false,
                                error: error_2 instanceof Error ? error_2.message : "Failed to generate report"
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    })
});
