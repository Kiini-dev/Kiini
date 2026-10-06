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
exports.DocumentManagement = void 0;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var trpc_1 = require("../utils/trpc");
var lucide_react_1 = require("lucide-react");
/**
 * Document Management Page (Phase 5.5)
 *
 * File storage and document management including:
 * - Document listing and browsing
 * - File upload
 * - Version control
 * - OCR capabilities
 * - Document search
 * - Sharing management
 */
function DocumentManagement() {
    var _this = this;
    var _a = react_1.useState(''), searchQuery = _a[0], setSearchQuery = _a[1];
    var _b = react_1.useState(false), showUpload = _b[0], setShowUpload = _b[1];
    var documents = react_query_1.useQuery({
        queryKey: ['documents'],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, trpc_1.trpc.fileStorage.listDocuments.query({
                            sortBy: 'date'
                        })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); }
    }).data;
    var handleSearch = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            return [2 /*return*/];
        });
    }); };
    var formatBytes = function (bytes) {
        if (bytes === 0)
            return '0 Bytes';
        var k = 1024;
        var sizes = ['Bytes', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };
    return (react_1["default"].createElement("div", { className: "p-8 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen" },
        react_1["default"].createElement("div", { className: "max-w-7xl mx-auto" },
            react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-8" },
                react_1["default"].createElement(lucide_react_1.FileText, { className: "w-8 h-8 text-orange-600" }),
                react_1["default"].createElement("h1", { className: "text-3xl font-bold text-slate-900" }, "Document Management")),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8" },
                react_1["default"].createElement("form", { onSubmit: handleSearch, className: "flex gap-4 mb-4" },
                    react_1["default"].createElement("div", { className: "flex-1 relative" },
                        react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }),
                        react_1["default"].createElement("input", { type: "text", placeholder: "Search documents...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm" })),
                    react_1["default"].createElement("button", { type: "submit", className: "px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition text-sm font-medium" }, "Search")),
                react_1["default"].createElement("div", { className: "flex gap-3" },
                    react_1["default"].createElement("button", { onClick: function () { return setShowUpload(!showUpload); }, className: "flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium" },
                        react_1["default"].createElement(lucide_react_1.Upload, { className: "w-4 h-4" }),
                        "Upload Document"),
                    react_1["default"].createElement("button", { className: "flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition text-sm font-medium" },
                        react_1["default"].createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                        "Export")),
                showUpload && (react_1["default"].createElement("div", { className: "mt-6 p-4 bg-slate-50 rounded-lg border-2 border-dashed border-orange-300" },
                    react_1["default"].createElement("div", { className: "space-y-4" },
                        react_1["default"].createElement("input", { type: "file", multiple: true, className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" }),
                        react_1["default"].createElement("div", { className: "flex gap-2" },
                            react_1["default"].createElement("button", { className: "flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium" }, "Upload Files"),
                            react_1["default"].createElement("button", { type: "button", onClick: function () { return setShowUpload(false); }, className: "flex-1 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition text-sm font-medium" }, "Cancel")))))),
            documents && (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4 mb-8" },
                    react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-center" },
                        react_1["default"].createElement("p", { className: "text-slate-600 text-sm mb-1" }, "Total Documents"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-slate-900" }, documents.documents.length)),
                    react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-center" },
                        react_1["default"].createElement("p", { className: "text-slate-600 text-sm mb-1" }, "Total Size"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-slate-900" }, formatBytes(documents.totalSize))),
                    react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-center" },
                        react_1["default"].createElement("p", { className: "text-slate-600 text-sm mb-1" }, "Recent Activity"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-slate-900" }, "Today"))),
                react_1["default"].createElement("div", { className: "bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden" },
                    react_1["default"].createElement("div", { className: "overflow-x-auto" },
                        react_1["default"].createElement("table", { className: "w-full" },
                            react_1["default"].createElement("thead", { className: "bg-slate-50 border-b border-slate-200" },
                                react_1["default"].createElement("tr", null,
                                    react_1["default"].createElement("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700" }, "Name"),
                                    react_1["default"].createElement("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700" }, "Size"),
                                    react_1["default"].createElement("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700" }, "Versions"),
                                    react_1["default"].createElement("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700" }, "Owner"),
                                    react_1["default"].createElement("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700" }, "Modified"),
                                    react_1["default"].createElement("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700" }, "Actions"))),
                            react_1["default"].createElement("tbody", { className: "divide-y divide-slate-200" }, documents.documents.map(function (doc) { return (react_1["default"].createElement("tr", { key: doc.id, className: "hover:bg-slate-50 transition" },
                                react_1["default"].createElement("td", { className: "px-6 py-4" },
                                    react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                        react_1["default"].createElement(lucide_react_1.FileText, { className: "w-4 h-4 text-orange-600" }),
                                        react_1["default"].createElement("span", { className: "text-sm font-medium text-slate-900" }, doc.name))),
                                react_1["default"].createElement("td", { className: "px-6 py-4 text-sm text-slate-600" }, formatBytes(doc.size)),
                                react_1["default"].createElement("td", { className: "px-6 py-4 text-sm text-slate-600" }, doc.versions),
                                react_1["default"].createElement("td", { className: "px-6 py-4 text-sm text-slate-600" }, doc.owner),
                                react_1["default"].createElement("td", { className: "px-6 py-4 text-sm text-slate-600" }, new Date(doc.updatedAt).toLocaleDateString()),
                                react_1["default"].createElement("td", { className: "px-6 py-4" },
                                    react_1["default"].createElement("div", { className: "flex gap-2" },
                                        react_1["default"].createElement("button", { className: "text-xs font-medium text-orange-600 hover:text-orange-700" }, "Download"),
                                        react_1["default"].createElement("button", { className: "text-xs font-medium text-slate-600 hover:text-slate-700" }, "Versions"),
                                        doc.shared && (react_1["default"].createElement("button", { className: "flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700" },
                                            react_1["default"].createElement(lucide_react_1.Share2, { className: "w-3 h-3" }),
                                            "Shared")))))); }))))))),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200 mt-8" },
                react_1["default"].createElement("h2", { className: "text-lg font-semibold text-slate-900 mb-4" }, "Document OCR Processing"),
                react_1["default"].createElement("p", { className: "text-sm text-slate-600 mb-4" }, "Automatically extract and index text from PDF and image documents for full-text search"),
                react_1["default"].createElement("div", { className: "space-y-3" },
                    react_1["default"].createElement("div", { className: "p-4 bg-slate-50 rounded-lg flex items-center justify-between" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-sm font-medium text-slate-900" }, "Invoice_2025_01.pdf"),
                            react_1["default"].createElement("p", { className: "text-xs text-slate-500" }, "PDF \u2022 2 MB")),
                        react_1["default"].createElement("button", { className: "px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition" }, "Process with OCR")))),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200 mt-8" },
                react_1["default"].createElement("h2", { className: "text-lg font-semibold text-slate-900 mb-4" }, "Recent Activity"),
                react_1["default"].createElement("div", { className: "space-y-3 text-sm" },
                    react_1["default"].createElement("div", { className: "flex justify-between items-center py-2 border-b border-slate-100" },
                        react_1["default"].createElement("span", { className: "text-slate-700" },
                            react_1["default"].createElement("strong", null, "Invoice_2025_01.pdf"),
                            " uploaded"),
                        react_1["default"].createElement("span", { className: "text-slate-500" }, "5 minutes ago")),
                    react_1["default"].createElement("div", { className: "flex justify-between items-center py-2 border-b border-slate-100" },
                        react_1["default"].createElement("span", { className: "text-slate-700" },
                            react_1["default"].createElement("strong", null, "Contract_Template.docx"),
                            " shared with 3 users"),
                        react_1["default"].createElement("span", { className: "text-slate-500" }, "2 days ago")),
                    react_1["default"].createElement("div", { className: "flex justify-between items-center py-2" },
                        react_1["default"].createElement("span", { className: "text-slate-700" },
                            react_1["default"].createElement("strong", null, "Payment_Record_Jan.xlsx"),
                            " version 2 created"),
                        react_1["default"].createElement("span", { className: "text-slate-500" }, "1 week ago")))))));
}
exports.DocumentManagement = DocumentManagement;
