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
exports.DataImport = void 0;
var react_1 = require("react");
var react_i18next_1 = require("react-i18next");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
exports.DataImport = function (_a) {
    var organizationId = _a.organizationId, supportedEntityTypes = _a.supportedEntityTypes, onImportComplete = _a.onImportComplete;
    var t = react_i18next_1.useTranslation().t;
    var _b = react_1.useState(''), entityType = _b[0], setEntityType = _b[1];
    var _c = react_1.useState('csv'), format = _c[0], setFormat = _c[1];
    var _d = react_1.useState(null), file = _d[0], setFile = _d[1];
    var _e = react_1.useState(false), loading = _e[0], setLoading = _e[1];
    var _f = react_1.useState(false), preview = _f[0], setPreview = _f[1];
    var _g = react_1.useState(null), result = _g[0], setResult = _g[1];
    var _h = react_1.useState(null), error = _h[0], setError = _h[1];
    var fileInputRef = react_1.useRef(null);
    var handleFileSelect = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var selectedFile, validTypes;
        var _a, _b;
        return __generator(this, function (_c) {
            selectedFile = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!selectedFile)
                return [2 /*return*/];
            setFile(selectedFile);
            setError(null);
            setResult(null);
            validTypes = {
                csv: ['text/csv', 'application/vnd.ms-excel'],
                xlsx: [
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ],
                json: ['application/json']
            };
            if (!((_b = validTypes[format]) === null || _b === void 0 ? void 0 : _b.includes(selectedFile.type))) {
                setError(t('import.invalidFileType', 'Invalid file type for selected format'));
                setFile(null);
                return [2 /*return*/];
            }
            // File size limit: 50MB
            if (selectedFile.size > 50 * 1024 * 1024) {
                setError(t('import.fileTooLarge', 'File size exceeds 50MB limit'));
                setFile(null);
                return [2 /*return*/];
            }
            return [2 /*return*/];
        });
    }); };
    var handlePreview = function () { return __awaiter(void 0, void 0, void 0, function () {
        var formData;
        return __generator(this, function (_a) {
            if (!file || !entityType)
                return [2 /*return*/];
            setLoading(true);
            setPreview(true);
            try {
                formData = new FormData();
                formData.append('file', file);
                formData.append('entityType', entityType);
                formData.append('format', format);
                // TODO: Call API for preview
                // const response = await api.dataMigration.previewImport.query({...});
                // Show preview results
                setLoading(false);
            }
            catch (err) {
                setError(err.message);
                setLoading(false);
                setPreview(false);
            }
            return [2 /*return*/];
        });
    }); };
    var handleImport = function () { return __awaiter(void 0, void 0, void 0, function () {
        var formData;
        return __generator(this, function (_a) {
            if (!file || !entityType)
                return [2 /*return*/];
            setLoading(true);
            setResult(null);
            try {
                formData = new FormData();
                formData.append('file', file);
                formData.append('entityType', entityType);
                formData.append('format', format);
                // TODO: Call API for import
                // const response = await api.dataMigration.importData.mutate({...});
                // const mockResult: ImportResult = {
                //   totalRecords: 150,
                //   successfulRecords: 147,
                //   failedRecords: 3,
                //   errors: [
                //     { recordIndex: 15, error: 'Invalid email format' },
                //     { recordIndex: 87, error: 'Duplicate record' },
                //     { recordIndex: 142, error: 'Missing required field' },
                //   ],
                //   warnings: [],
                //   duration: 5234,
                // };
                // setResult(mockResult);
                // onImportComplete?.(mockResult);
                setLoading(false);
                setPreview(false);
            }
            catch (err) {
                setError(err.message);
                setLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    var successRate = result
        ? Math.round((result.successfulRecords / result.totalRecords) * 100)
        : 0;
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, null, t('import.title', 'Import Data')),
                react_1["default"].createElement(card_1.CardDescription, null, t('import.description', 'Upload CSV, Excel, or JSON files to import data into the system'))),
            react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                error && (react_1["default"].createElement(alert_1.Alert, { variant: "destructive" },
                    react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                    react_1["default"].createElement(alert_1.AlertDescription, null, error))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium mb-2" }, t('import.entityType', 'Entity Type *')),
                    react_1["default"].createElement(select_1.Select, { value: entityType, onValueChange: setEntityType },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: t('import.selectEntityType', 'Select entity type...') })),
                        react_1["default"].createElement(select_1.SelectContent, null, supportedEntityTypes.map(function (type) { return (react_1["default"].createElement(select_1.SelectItem, { key: type, value: type }, type.replace('_', ' ').toUpperCase())); })))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium mb-2" }, t('import.format', 'File Format *')),
                    react_1["default"].createElement(select_1.Select, { value: format, onValueChange: function (v) { return setFormat(v); } },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, null)),
                        react_1["default"].createElement(select_1.SelectContent, null,
                            react_1["default"].createElement(select_1.SelectItem, { value: "csv" }, "CSV (Comma-Separated Values)"),
                            react_1["default"].createElement(select_1.SelectItem, { value: "xlsx" }, "Excel (XLSX)"),
                            react_1["default"].createElement(select_1.SelectItem, { value: "json" }, "JSON")))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium mb-2" }, t('import.file', 'File *')),
                    react_1["default"].createElement("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition", onClick: function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); } },
                        react_1["default"].createElement("input", { ref: fileInputRef, type: "file", hidden: true, accept: format === 'csv'
                                ? '.csv'
                                : format === 'xlsx'
                                    ? '.xlsx,.xls'
                                    : '.json', onChange: handleFileSelect }),
                        react_1["default"].createElement(lucide_react_1.FileUp, { className: "h-8 w-8 mx-auto mb-2 text-gray-400" }),
                        react_1["default"].createElement("p", { className: "text-sm font-medium text-gray-700" }, file
                            ? file.name
                            : t('import.dragDrop', 'Drag and drop file here or click')),
                        react_1["default"].createElement("p", { className: "text-xs text-gray-500 mt-1" }, t('import.maxSize', 'Maximum file size: 50MB')))),
                react_1["default"].createElement("div", { className: "flex gap-2 pt-4" },
                    react_1["default"].createElement(button_1.Button, { onClick: handlePreview, variant: "outline", disabled: !file || !entityType || loading }, loading ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        t('common.loading', 'Loading...'))) : (t('import.preview', 'Preview'))),
                    react_1["default"].createElement(button_1.Button, { onClick: handleImport, disabled: !file || !entityType || loading }, loading ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        t('common.importing', 'Importing...'))) : (t('import.import', 'Import')))))),
        result && (react_1["default"].createElement(card_1.Card, { className: result.failedRecords === 0 ? 'border-green-200' : '' },
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" }, result.failedRecords === 0 ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5 text-green-600" }),
                        t('import.success', 'Import Successful'))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-orange-600" }),
                        t('import.partialSuccess', 'Import Completed with Issues')))),
                    react_1["default"].createElement("span", { className: "text-sm text-gray-600" },
                        t('import.duration', 'Duration'),
                        ": ",
                        (result.duration / 1000).toFixed(2),
                        "s"))),
            react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("div", { className: "flex justify-between text-sm mb-2" },
                        react_1["default"].createElement("span", { className: "font-medium" }, t('import.progress', 'Progress')),
                        react_1["default"].createElement("span", null,
                            successRate,
                            "%")),
                    react_1["default"].createElement(progress_1.Progress, { value: successRate })),
                react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4 pt-2" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, t('import.total', 'Total')),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold" }, result.totalRecords)),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-sm text-gray-600 flex items-center gap-1" },
                            react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-green-600" }),
                            t('import.successful', 'Successful')),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-green-600" }, result.successfulRecords)),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-sm text-gray-600 flex items-center gap-1" },
                            react_1["default"].createElement(lucide_react_1.XCircle, { className: "h-4 w-4 text-red-600" }),
                            t('import.failed', 'Failed')),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-red-600" }, result.failedRecords))),
                result.errors.length > 0 && (react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h4", { className: "font-semibold text-sm mb-2 text-red-600" },
                        t('import.errors', 'Errors'),
                        " (",
                        result.errors.length,
                        ")"),
                    react_1["default"].createElement("div", { className: "space-y-1 max-h-40 overflow-y-auto" },
                        result.errors.slice(0, 5).map(function (error, idx) { return (react_1["default"].createElement("p", { key: idx, className: "text-xs text-red-700" },
                            "Row ",
                            error.recordIndex,
                            ": ",
                            error.error)); }),
                        result.errors.length > 5 && (react_1["default"].createElement("p", { className: "text-xs text-gray-500" },
                            t('import.andMore', 'and'),
                            " ",
                            result.errors.length - 5,
                            ' ',
                            t('import.more', 'more...')))))))))));
};
exports["default"] = exports.DataImport;
