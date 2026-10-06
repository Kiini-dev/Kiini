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
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var ImportProgressMonitor_1 = require("@/components/ImportProgressMonitor");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var uuid_1 = require("uuid");
var moduleConfigs = [
    {
        id: "jobGroups",
        name: "Job Groups",
        description: "Import salary grade levels and job classifications",
        iconComponent: lucide_react_1.Building2,
        color: "blue",
        fields: ["name", "minimumGrossSalary", "maximumGrossSalary", "description", "isActive"]
    },
    {
        id: "employees",
        name: "Employees",
        description: "Import employee records with personal and employment details",
        iconComponent: lucide_react_1.Users,
        color: "green",
        fields: ["employeeNumber", "firstName", "lastName", "email", "phone", "hireDate", "department", "position", "jobGroupId", "salary", "employmentType", "status", "dateOfBirth", "address", "nationalId", "bankAccountNumber", "taxId"]
    },
    {
        id: "clients",
        name: "Clients",
        description: "Import customer and client organization data",
        iconComponent: lucide_react_1.Briefcase,
        color: "purple",
        fields: ["companyName", "contactPerson", "email", "phone", "address", "city", "country", "postalCode", "taxId", "website", "industry", "status", "businessType", "registrationNumber", "creditLimit"]
    },
    {
        id: "products",
        name: "Products",
        description: "Import product inventory with pricing and stock levels",
        iconComponent: lucide_react_1.Package,
        color: "orange",
        fields: ["name", "description", "sku", "category", "unitPrice", "costPrice", "stockQuantity", "minStockLevel", "unit", "taxRate", "isActive", "reorderPoint", "maxStockLevel", "location", "supplier"]
    },
    {
        id: "departments",
        name: "Departments",
        description: "Import organizational departments and divisions",
        iconComponent: lucide_react_1.Building2,
        color: "indigo",
        fields: ["name", "description", "headId", "budget", "status"]
    },
    {
        id: "payroll",
        name: "Payroll",
        description: "Import payroll records and salary payments",
        iconComponent: lucide_react_1.DollarSign,
        color: "emerald",
        fields: ["employeeId", "payPeriodStart", "payPeriodEnd", "basicSalary", "allowances", "deductions", "tax", "netSalary", "status", "paymentDate", "paymentMethod", "notes"]
    },
];
function ImportExcel() {
    var _this = this;
    var _a, _b;
    var _c = react_1.useState("jobGroups"), activeModule = _c[0], setActiveModule = _c[1];
    var _d = react_1.useState(null), file = _d[0], setFile = _d[1];
    var _e = react_1.useState([]), previewRows = _e[0], setPreviewRows = _e[1];
    var _f = react_1.useState({}), fieldMap = _f[0], setFieldMap = _f[1];
    var _g = react_1.useState(null), progress = _g[0], setProgress = _g[1];
    var _h = react_1.useState(null), lastBatchId = _h[0], setLastBatchId = _h[1];
    var _j = react_1.useState([]), validationErrors = _j[0], setValidationErrors = _j[1];
    var _k = react_1.useState(null), importResult = _k[0], setImportResult = _k[1];
    var _l = react_1.useState(true), skipDuplicates = _l[0], setSkipDuplicates = _l[1];
    var _m = react_1.useState(false), isDownloading = _m[0], setIsDownloading = _m[1];
    var importPayroll = trpc_1.trpc.importExport.importPayroll.useMutation();
    var importEmployees = trpc_1.trpc.importExport.importEmployees.useMutation();
    var importClients = trpc_1.trpc.csvImportExport.importClients.useMutation();
    var importProducts = trpc_1.trpc.csvImportExport.importProducts.useMutation();
    var importDepartments = (_b = (_a = trpc_1.trpc.csvImportExport.importDepartments) === null || _a === void 0 ? void 0 : _a.useMutation) === null || _b === void 0 ? void 0 : _b.call(_a);
    var rollbackImport = trpc_1.trpc.importExport.rollbackImport.useMutation();
    var currentModuleConfig = moduleConfigs.find(function (m) { return m.id === activeModule; });
    var downloadTemplate = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var input, encodedInput, response, errorText, data, templateContent, fields, headers, blob, url, link, error_1;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!currentModuleConfig)
                        return [2 /*return*/];
                    setIsDownloading(true);
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 6, 7, 8]);
                    input = JSON.stringify(activeModule);
                    encodedInput = encodeURIComponent(input);
                    return [4 /*yield*/, fetch("/api/trpc/csvImportExport.generateTemplate?input=" + encodedInput, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include'
                        })];
                case 2:
                    response = _f.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.text()];
                case 3:
                    errorText = _f.sent();
                    console.error('Template fetch error:', response.status, errorText);
                    throw new Error("Failed to fetch template: " + response.statusText);
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _f.sent();
                    templateContent = '';
                    if (Array.isArray(data) && ((_c = (_b = (_a = data[0]) === null || _a === void 0 ? void 0 : _a.result) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.content)) {
                        templateContent = data[0].result.data.content;
                    }
                    else if ((_e = (_d = data === null || data === void 0 ? void 0 : data.result) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.content) {
                        templateContent = data.result.data.content;
                    }
                    else {
                        fields = currentModuleConfig.fields;
                        headers = fields.join(',');
                        templateContent = headers + "\n";
                    }
                    blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
                    url = URL.createObjectURL(blob);
                    link = document.createElement("a");
                    link.href = url;
                    link.download = activeModule + "-template.csv";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    sonner_1.toast.success(currentModuleConfig.name + " template downloaded successfully");
                    return [3 /*break*/, 8];
                case 6:
                    error_1 = _f.sent();
                    console.error("Failed to download template:", error_1);
                    sonner_1.toast.error("Failed to download template. Please try again.");
                    return [3 /*break*/, 8];
                case 7:
                    setIsDownloading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); }, [activeModule, currentModuleConfig]);
    var handleFileChange = function (e) {
        if (e.target.files && e.target.files.length > 0) {
            var f_1 = e.target.files[0];
            setFile(f_1);
            setValidationErrors([]);
            setProgress(null);
            setImportResult(null);
            // Parse file
            var reader = new FileReader();
            reader.onload = function (event) { return __awaiter(_this, void 0, void 0, function () {
                var csv, lines, headers_1, rows, XLSX, workbook, sheetName, rows, err_1;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 4, , 5]);
                            if (!f_1.name.endsWith(".csv")) return [3 /*break*/, 1];
                            csv = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
                            lines = csv.split("\n").filter(function (l) { return l.trim(); });
                            headers_1 = lines[0].split(",").map(function (h) { return h.trim(); });
                            rows = lines.slice(1).map(function (line) {
                                var values = line.split(",").map(function (v) { return v.trim(); });
                                var row = {};
                                headers_1.forEach(function (h, i) {
                                    row[h] = values[i] || "";
                                });
                                return row;
                            });
                            setPreviewRows(rows.slice(0, 5));
                            return [3 /*break*/, 3];
                        case 1: return [4 /*yield*/, Promise.resolve().then(function () { return require('xlsx'); })];
                        case 2:
                            XLSX = _c.sent();
                            workbook = XLSX.read((_b = event.target) === null || _b === void 0 ? void 0 : _b.result, { type: "binary" });
                            sheetName = workbook.SheetNames[0];
                            rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                            setPreviewRows(rows.slice(0, 5));
                            _c.label = 3;
                        case 3: return [3 /*break*/, 5];
                        case 4:
                            err_1 = _c.sent();
                            console.error("Error parsing file:", err_1);
                            setValidationErrors([{ row: 0, message: "Failed to parse file", severity: "error" }]);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); };
            if (f_1.name.endsWith(".csv")) {
                reader.readAsText(f_1);
            }
            else {
                reader.readAsBinaryString(f_1);
            }
        }
    };
    var handleRollback = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!lastBatchId)
                return [2 /*return*/];
            if (!confirm("Undo this import? All imported records will be removed."))
                return [2 /*return*/];
            rollbackImport.mutate({ batchId: lastBatchId }, {
                onSuccess: function () {
                    setProgress(function (prev) {
                        return prev ? __assign(__assign({}, prev), { status: "rolled_back" }) : null;
                    });
                    setLastBatchId(null);
                }
            });
            return [2 /*return*/];
        });
    }); }, [lastBatchId, rollbackImport]);
    var handleImport = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var batchId, initialProgress, mutation, payload, errorMsg_1;
        return __generator(this, function (_a) {
            if (!previewRows.length || !currentModuleConfig)
                return [2 /*return*/];
            batchId = uuid_1.v4();
            setLastBatchId(batchId);
            initialProgress = {
                batchId: batchId,
                entityType: activeModule,
                totalRows: previewRows.length,
                processedRows: 0,
                importedRows: 0,
                skippedRows: 0,
                errorRows: 0,
                status: "processing",
                startTime: new Date(),
                errorDetails: [],
                warnings: []
            };
            setProgress(initialProgress);
            try {
                mutation = null;
                payload = null;
                switch (activeModule) {
                    case "employees": {
                        mutation = importEmployees;
                        payload = {
                            data: previewRows.map(function (row) {
                                var get = function (field) { return fieldMap[field] ? row[fieldMap[field]] : row[field]; };
                                return {
                                    employeeNumber: String(get("employeeNumber") || "").trim(),
                                    firstName: String(get("firstName") || "").trim(),
                                    lastName: String(get("lastName") || "").trim(),
                                    email: String(get("email") || "").trim() || undefined,
                                    phone: String(get("phone") || "").trim() || undefined,
                                    hireDate: String(get("hireDate") || "").trim(),
                                    department: String(get("department") || "").trim() || undefined,
                                    position: String(get("position") || "").trim() || undefined,
                                    jobGroupId: String(get("jobGroupId") || "").trim() || undefined,
                                    salary: parseFloat(get("salary") || "0") || 0,
                                    employmentType: String(get("employmentType") || "full_time"),
                                    status: String(get("status") || "active"),
                                    dateOfBirth: String(get("dateOfBirth") || "").trim() || undefined,
                                    address: String(get("address") || "").trim() || undefined,
                                    nationalId: String(get("nationalId") || "").trim() || undefined,
                                    bankAccountNumber: String(get("bankAccountNumber") || "").trim() || undefined,
                                    taxId: String(get("taxId") || "").trim() || undefined
                                };
                            }),
                            skipDuplicates: skipDuplicates,
                            batchId: batchId
                        };
                        break;
                    }
                    case "clients": {
                        mutation = importClients;
                        payload = {
                            data: previewRows.map(function (row) {
                                var get = function (field) { return fieldMap[field] ? row[fieldMap[field]] : row[field]; };
                                return {
                                    companyName: String(get("companyName") || "").trim(),
                                    contactPerson: String(get("contactPerson") || "").trim() || undefined,
                                    email: String(get("email") || "").trim() || undefined,
                                    phone: String(get("phone") || "").trim() || undefined,
                                    address: String(get("address") || "").trim() || undefined,
                                    city: String(get("city") || "").trim() || undefined,
                                    country: String(get("country") || "").trim() || undefined,
                                    postalCode: String(get("postalCode") || "").trim() || undefined,
                                    taxId: String(get("taxId") || "").trim() || undefined,
                                    website: String(get("website") || "").trim() || undefined,
                                    industry: String(get("industry") || "").trim() || undefined,
                                    status: String(get("status") || "active"),
                                    businessType: String(get("businessType") || "").trim() || undefined,
                                    registrationNumber: String(get("registrationNumber") || "").trim() || undefined,
                                    creditLimit: parseFloat(get("creditLimit") || "0") || undefined
                                };
                            }),
                            skipDuplicates: skipDuplicates,
                            batchId: batchId
                        };
                        break;
                    }
                    case "products": {
                        mutation = importProducts;
                        payload = {
                            data: previewRows.map(function (row) {
                                var get = function (field) { return fieldMap[field] ? row[fieldMap[field]] : row[field]; };
                                return {
                                    name: String(get("name") || "").trim(),
                                    description: String(get("description") || "").trim() || undefined,
                                    sku: String(get("sku") || "").trim() || undefined,
                                    category: String(get("category") || "").trim() || undefined,
                                    unitPrice: parseFloat(get("unitPrice") || "0") || 0,
                                    costPrice: parseFloat(get("costPrice") || "0") || 0,
                                    stockQuantity: parseInt(get("stockQuantity") || "0") || 0,
                                    minStockLevel: parseInt(get("minStockLevel") || "0") || 0,
                                    unit: String(get("unit") || "piece").trim(),
                                    taxRate: parseFloat(get("taxRate") || "0") || 0,
                                    isActive: String(get("isActive") || "true").toLowerCase() === "true",
                                    reorderPoint: parseInt(get("reorderPoint") || "0") || 0,
                                    maxStockLevel: parseInt(get("maxStockLevel") || "0") || 0,
                                    location: String(get("location") || "").trim() || undefined,
                                    supplier: String(get("supplier") || "").trim() || undefined
                                };
                            }),
                            skipDuplicates: skipDuplicates,
                            batchId: batchId
                        };
                        break;
                    }
                    case "payroll": {
                        mutation = importPayroll;
                        payload = {
                            data: previewRows.map(function (row) {
                                var get = function (field) { return fieldMap[field] ? row[fieldMap[field]] : row[field]; };
                                return {
                                    employeeId: String(get("employeeId") || "").trim(),
                                    payPeriodStart: String(get("payPeriodStart") || "").trim(),
                                    payPeriodEnd: String(get("payPeriodEnd") || "").trim(),
                                    basicSalary: parseFloat(get("basicSalary") || "0") || 0,
                                    allowances: parseFloat(get("allowances") || "0") || 0,
                                    deductions: parseFloat(get("deductions") || "0") || 0,
                                    tax: parseFloat(get("tax") || "0") || 0,
                                    netSalary: parseFloat(get("netSalary") || "0") || 0,
                                    status: String(get("status") || "draft"),
                                    paymentDate: String(get("paymentDate") || "").trim() || undefined,
                                    paymentMethod: String(get("paymentMethod") || "").trim() || undefined,
                                    notes: String(get("notes") || "").trim() || undefined
                                };
                            }),
                            skipDuplicates: skipDuplicates,
                            batchId: batchId
                        };
                        break;
                    }
                    default:
                        setProgress(function (prev) {
                            return prev ? __assign(__assign({}, prev), { status: "failed", errorRows: 1 }) : null;
                        });
                        return [2 /*return*/];
                }
                if (!mutation || !payload) {
                    setProgress(function (prev) {
                        return prev ? __assign(__assign({}, prev), { status: "failed", errorRows: 1 }) : null;
                    });
                    return [2 /*return*/];
                }
                // Execute the mutation
                mutation.mutate(payload, {
                    onSuccess: function (result) {
                        setProgress(function (prev) {
                            var _a;
                            return prev
                                ? __assign(__assign({}, prev), { status: "completed", processedRows: previewRows.length, importedRows: result.imported || 0, skippedRows: result.skipped || 0, errorRows: ((_a = result.errors) === null || _a === void 0 ? void 0 : _a.length) || 0, endTime: new Date(), errorDetails: (result.errors || []).map(function (err, i) { return ({
                                        rowIndex: i,
                                        row: previewRows[i] || {},
                                        error: err.message || String(err)
                                    }); }) }) : null;
                        });
                        sonner_1.toast.success("Successfully imported " + (result.imported || 0) + " records");
                    },
                    onError: function (error) {
                        var errorMsg = (error === null || error === void 0 ? void 0 : error.message) || "Import failed";
                        setProgress(function (prev) {
                            return prev
                                ? __assign(__assign({}, prev), { status: "failed", endTime: new Date(), errorDetails: [
                                        {
                                            rowIndex: 0,
                                            row: {},
                                            error: errorMsg
                                        },
                                    ] }) : null;
                        });
                        sonner_1.toast.error("Import failed: " + errorMsg);
                    }
                });
            }
            catch (error) {
                errorMsg_1 = error instanceof Error ? error.message : "Import failed";
                setProgress(function (prev) {
                    return prev
                        ? __assign(__assign({}, prev), { status: "failed", endTime: new Date(), errorDetails: [
                                {
                                    rowIndex: 0,
                                    row: {},
                                    error: errorMsg_1
                                },
                            ] }) : null;
                });
                sonner_1.toast.error("Import error: " + errorMsg_1);
            }
            return [2 /*return*/];
        });
    }); }, [previewRows, fieldMap, skipDuplicates, importPayroll, importEmployees, importClients, importProducts, activeModule, currentModuleConfig]);
    var columns = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];
    var requiredFields = (currentModuleConfig === null || currentModuleConfig === void 0 ? void 0 : currentModuleConfig.fields) || [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Data Import", breadcrumbs: [{ label: "Tools" }, { label: "Import Data" }] },
        React.createElement("div", { className: "space-y-6" },
            !file && (React.createElement(React.Fragment, null,
                React.createElement("div", null,
                    React.createElement("h2", { className: "text-xl font-semibold mb-2" }, "1. Select Data Type"),
                    React.createElement("p", { className: "text-muted-foreground mb-4" }, "Choose what type of data you want to import")),
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, moduleConfigs.map(function (module) { return (React.createElement(card_1.Card, { key: module.id, className: "cursor-pointer transition-all " + (activeModule === module.id
                        ? "border-2 border-blue-500 bg-blue-50"
                        : "hover:border-gray-400"), onClick: function () {
                        setActiveModule(module.id);
                        setFieldMap({});
                    } },
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement("div", { className: "flex items-start justify-between" },
                            React.createElement("div", { className: "flex items-center gap-3" },
                                React.createElement("div", { className: "p-2 rounded-lg bg-" + module.color + "-100" },
                                    React.createElement(module.iconComponent, { className: "h-6 w-6" })),
                                React.createElement("div", null,
                                    React.createElement(card_1.CardTitle, { className: "text-lg" }, module.name),
                                    React.createElement(card_1.CardDescription, { className: "text-xs" }, module.description))),
                            activeModule === module.id && (React.createElement(badge_1.Badge, { className: "bg-blue-500" }, "Selected")))),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "w-full", onClick: function (e) {
                                e.stopPropagation();
                                downloadTemplate();
                            } },
                            React.createElement(lucide_react_1.Download, { className: "h-4 w-4 mr-2" }),
                            "Download Template")))); })))),
            currentModuleConfig && (React.createElement(React.Fragment, null,
                React.createElement("div", null,
                    React.createElement("h2", { className: "text-xl font-semibold mb-2" }, "2. Upload File"),
                    React.createElement("p", { className: "text-muted-foreground mb-4" },
                        "Uploading: ",
                        React.createElement("strong", null, currentModuleConfig.name))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.FileUp, { className: "h-5 w-5" }),
                            "Select CSV or Excel File")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement(input_1.Input, { type: "file", accept: ".xlsx,.xls,.csv", onChange: handleFileChange, className: "cursor-pointer" }),
                        file && (React.createElement("div", { className: "p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium text-green-900" },
                                    "Selected: ",
                                    file.name),
                                React.createElement("p", { className: "text-xs text-green-700" },
                                    previewRows.length,
                                    " rows found")),
                            React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-green-600" }))))))),
            file && previewRows.length > 0 && (React.createElement(React.Fragment, null,
                React.createElement("div", null,
                    React.createElement("h2", { className: "text-xl font-semibold mb-2" }, "3. Map Fields"),
                    React.createElement("p", { className: "text-muted-foreground mb-4" },
                        "Map your file columns to the ", currentModuleConfig === null || currentModuleConfig === void 0 ? void 0 :
                        currentModuleConfig.name,
                        " fields")),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Column Mapping"),
                        React.createElement("p", { className: "text-sm text-muted-foreground mt-2" },
                            "Required fields: ",
                            requiredFields.slice(0, 3).join(", "),
                            requiredFields.length > 3 ? ", and " + (requiredFields.length - 3) + " more" : "")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, requiredFields.map(function (field) { return (React.createElement("div", { key: field, className: "space-y-2" },
                            React.createElement("label", { className: "text-sm font-medium" }, field),
                            React.createElement("select", { value: fieldMap[field] || "", onChange: function (e) {
                                    var _a;
                                    return setFieldMap(__assign(__assign({}, fieldMap), (_a = {}, _a[field] = e.target.value, _a)));
                                }, className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm" },
                                React.createElement("option", { value: "" }, "-- Not mapped --"),
                                columns.map(function (col) { return (React.createElement("option", { key: col, value: col }, col)); })))); })))))),
            validationErrors.length > 0 && (React.createElement(alert_1.Alert, { className: "bg-red-50 border-red-200 border-2" },
                React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-red-600" }),
                React.createElement(alert_1.AlertDescription, { className: "text-red-800" },
                    React.createElement("div", { className: "font-semibold mb-2" },
                        validationErrors.length,
                        " Validation Error",
                        validationErrors.length !== 1 ? "s" : ""),
                    React.createElement("ul", { className: "text-sm space-y-1" },
                        validationErrors.slice(0, 10).map(function (err, i) { return (React.createElement("li", { key: "val-err-" + i },
                            React.createElement("strong", null,
                                "Row ",
                                err.row + 1),
                            err.field && " - " + err.field,
                            ": ",
                            err.message)); }),
                        validationErrors.length > 10 && (React.createElement("li", { className: "text-red-600 italic" },
                            "... and ",
                            validationErrors.length - 10,
                            " more errors")))))),
            file && previewRows.length > 0 && validationErrors.length === 0 && (React.createElement(React.Fragment, null,
                React.createElement("div", null,
                    React.createElement("h2", { className: "text-xl font-semibold mb-2" }, "4. Preview & Import"),
                    React.createElement("p", { className: "text-muted-foreground mb-4" },
                        previewRows.length,
                        " rows ready to import")),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Data Preview")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "overflow-x-auto max-h-64 border rounded" },
                            React.createElement(table_1.Table, { className: "w-full text-sm" },
                                React.createElement(table_1.TableHeader, { className: "bg-gray-100 sticky top-0" },
                                    React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableHead, { className: "px-4 py-2 text-left font-semibold" }, "#"),
                                        requiredFields.slice(0, 5).map(function (field) { return (React.createElement(table_1.TableHead, { key: field, className: "px-4 py-2 text-left font-semibold" }, field)); }))),
                                React.createElement(table_1.TableBody, null, previewRows.slice(0, 10).map(function (row, idx) { return (React.createElement(table_1.TableRow, { key: "row-" + idx, className: "border-t hover:bg-gray-50" },
                                    React.createElement(table_1.TableCell, { className: "px-4 py-2 text-gray-500" }, idx + 1),
                                    requiredFields.slice(0, 5).map(function (field) { return (React.createElement(table_1.TableCell, { key: idx + "-" + field, className: "px-4 py-2 text-gray-700 text-xs" }, String(row[fieldMap[field] || field] || "―").substring(0, 20))); }))); })))),
                        React.createElement("div", { className: "flex gap-3 justify-end" },
                            React.createElement(button_1.Button, { variant: "outline", onClick: function () {
                                    setFile(null);
                                    setPreviewRows([]);
                                    setFieldMap({});
                                } }, "Cancel"),
                            React.createElement(button_1.Button, { onClick: handleImport, disabled: importPayroll.isPending || (progress === null || progress === void 0 ? void 0 : progress.status) === "processing", className: "px-8" }, importPayroll.isPending ? "Importing..." : "Import Now")))))),
            progress && (React.createElement(ImportProgressMonitor_1.ImportProgressMonitor, { progress: progress, onRollback: handleRollback, onDismiss: function () { return setProgress(null); } })),
            progress && (progress.status === "completed" || progress.status === "failed") && (React.createElement(card_1.Card, { className: progress.status === "completed" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" }, progress.status === "completed" ? (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-green-600" }),
                        React.createElement("span", { className: "text-green-900" }, "Import Completed Successfully"))) : (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.XCircle, { className: "h-5 w-5 text-red-600" }),
                        React.createElement("span", { className: "text-red-900" }, "Import Failed"))))),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-3 gap-4" },
                        React.createElement("div", { className: "text-center" },
                            React.createElement("div", { className: "text-3xl font-bold text-green-600" }, progress.importedRows),
                            React.createElement("div", { className: "text-sm text-gray-600" }, "Imported")),
                        React.createElement("div", { className: "text-center" },
                            React.createElement("div", { className: "text-3xl font-bold text-yellow-600" }, progress.skippedRows),
                            React.createElement("div", { className: "text-sm text-gray-600" }, "Skipped")),
                        React.createElement("div", { className: "text-center" },
                            React.createElement("div", { className: "text-3xl font-bold text-red-600" }, progress.errorRows),
                            React.createElement("div", { className: "text-sm text-gray-600" }, "Errors")))))))));
}
exports["default"] = ImportExcel;
