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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.FinanceSettingsPage = void 0;
var react_1 = require("react");
var trpc_1 = require("../utils/trpc");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var table_1 = require("@/components/ui/table");
exports.FinanceSettingsPage = function () {
    var _a = react_1.useState(''), vendorId = _a[0], setVendorId = _a[1];
    var _b = react_1.useState(''), expenseAccount = _b[0], setExpenseAccount = _b[1];
    var _c = react_1.useState(''), payableAccount = _c[0], setPayableAccount = _c[1];
    var setAccounts = trpc_1.trpc.finance.setVendorAccounts.useMutation();
    var defaults = trpc_1.trpc.finance.getDefaults.useQuery().data;
    var vendorQuery = trpc_1.trpc.finance.getVendorAccounts.useQuery(vendorId, { enabled: !!vendorId });
    var listVendors = trpc_1.trpc.finance.listVendorAccounts.useQuery(undefined);
    var _d = react_1.useState(''), vendorSearch = _d[0], setVendorSearch = _d[1];
    var _e = react_1.useState(0), vendorPage = _e[0], setVendorPage = _e[1];
    var pageSize = 5;
    var save = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, setAccounts.mutateAsync({ vendorId: vendorId, expenseAccountId: expenseAccount, payableAccountId: payableAccount })];
                case 1:
                    _a.sent();
                    sonner_1.toast.success('Vendor accounts saved');
                    return [2 /*return*/];
            }
        });
    }); };
    var _f = react_1.useState(''), journalId = _f[0], setJournalId = _f[1];
    var _g = react_1.useState(''), notesSearch = _g[0], setNotesSearch = _g[1];
    var reconcile = trpc_1.trpc.finance.reconcileEntry.useMutation();
    var updateRec = trpc_1.trpc.finance.updateReconciliation.useMutation();
    var undoRec = trpc_1.trpc.finance.undoReconciliation.useMutation();
    var _h = trpc_1.trpc.finance.listReconciliations.useQuery(journalId || notesSearch ? { journalEntryId: journalId || undefined, notesSearch: notesSearch || undefined } : undefined), recs = _h.data, refetchRecs = _h.refetch;
    var reconcileNow = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!journalId)
                        return [2 /*return*/];
                    return [4 /*yield*/, reconcile.mutateAsync({ journalEntryId: journalId })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, refetchRecs()];
                case 2:
                    _a.sent();
                    sonner_1.toast.success('Entry reconciled successfully');
                    return [2 /*return*/];
            }
        });
    }); };
    var doEdit = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var notes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    notes = prompt('Enter new notes');
                    if (notes === null)
                        return [2 /*return*/];
                    return [4 /*yield*/, updateRec.mutateAsync({ id: id, notes: notes })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, refetchRecs()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var doUndo = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Undo this reconciliation?'))
                        return [2 /*return*/];
                    return [4 /*yield*/, undoRec.mutateAsync(id)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, refetchRecs()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    // when vendorId changes, populate fields if mapping exists
    react_1["default"].useEffect(function () {
        if (vendorQuery.data) {
            setExpenseAccount(vendorQuery.data.expense || '');
            setPayableAccount(vendorQuery.data.payable || '');
        }
    }, [vendorQuery.data]);
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Finance Settings", icon: react_1["default"].createElement(lucide_react_1.Settings, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Finance", href: "/accounting" },
            { label: "Settings" },
        ] },
        react_1["default"].createElement("div", null,
            defaults && (react_1["default"].createElement("div", null,
                react_1["default"].createElement("h3", null, "Default Accounts"),
                react_1["default"].createElement("div", null,
                    "Expense: ",
                    defaults.expense || '<none>'),
                react_1["default"].createElement("div", null,
                    "Payable: ",
                    defaults.payable || '<none>'))),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("label", null, "Vendor ID"),
                react_1["default"].createElement("input", { value: vendorId, onChange: function (e) { return setVendorId(e.target.value); } })),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("label", null, "Expense Account"),
                react_1["default"].createElement("input", { value: expenseAccount, onChange: function (e) { return setExpenseAccount(e.target.value); } })),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("label", null, "Payable Account"),
                react_1["default"].createElement("input", { value: payableAccount, onChange: function (e) { return setPayableAccount(e.target.value); } })),
            react_1["default"].createElement("button", { onClick: save }, "Save"),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("button", { onClick: function () { return listVendors.refetch(); } }, "Refresh Vendor List"),
                react_1["default"].createElement("button", { onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                        var exp, csv, blob, a;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, trpc_1.trpc.finance.exportVendorAccounts.query()];
                                case 1:
                                    exp = _a.sent();
                                    csv = __spreadArrays(['VendorId,ExpenseAccount,PayableAccount'], (Array.isArray(exp) ? exp : []).map(function (v) { return v.vendorId + "," + (v.expense || '') + "," + (v.payable || ''); })).join('\n');
                                    blob = new Blob([csv], { type: 'text/csv' });
                                    a = document.createElement('a');
                                    a.href = URL.createObjectURL(blob);
                                    a.download = 'vendor-accounts.csv';
                                    a.click();
                                    URL.revokeObjectURL(a.href);
                                    sonner_1.toast.success('Vendor accounts exported');
                                    return [2 /*return*/];
                            }
                        });
                    }); } }, "Export Settings"),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", null, "Search vendors:"),
                    react_1["default"].createElement("input", { value: vendorSearch, onChange: function (e) { setVendorSearch(e.target.value); setVendorPage(0); } })),
                listVendors.data && (function () {
                    var filtered = listVendors.data.filter(function (v) { return v.vendorId.includes(vendorSearch); });
                    var paged = filtered.slice(vendorPage * pageSize, vendorPage * pageSize + pageSize);
                    return (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(table_1.Table, null,
                            react_1["default"].createElement(table_1.TableHeader, null,
                                react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableHead, null, "Vendor"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Expense"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Payable"))),
                            react_1["default"].createElement(table_1.TableBody, null, paged.map(function (v) { return (react_1["default"].createElement(table_1.TableRow, { key: v.vendorId },
                                react_1["default"].createElement(table_1.TableCell, null, v.vendorId),
                                react_1["default"].createElement(table_1.TableCell, null, v.expense || '-'),
                                react_1["default"].createElement(table_1.TableCell, null, v.payable || '-'))); }))),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("button", { disabled: vendorPage === 0, onClick: function () { return setVendorPage(function (p) { return p - 1; }); } }, "Prev"),
                            react_1["default"].createElement("button", { disabled: (vendorPage + 1) * pageSize >= filtered.length, onClick: function () { return setVendorPage(function (p) { return p + 1; }); } }, "Next"))));
                })()),
            react_1["default"].createElement("h2", null, "Reconciliation"),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("label", null, "Journal Entry ID"),
                react_1["default"].createElement("input", { value: journalId, onChange: function (e) { return setJournalId(e.target.value); } }),
                react_1["default"].createElement("button", { onClick: reconcileNow }, "Reconcile")),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("label", null, "Search notes:"),
                react_1["default"].createElement("input", { value: notesSearch, onChange: function (e) { return setNotesSearch(e.target.value); } }),
                react_1["default"].createElement("button", { onClick: function () { return refetchRecs(); } }, "Filter"),
                react_1["default"].createElement("button", { onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                        var exp, rows, csv, blob, a;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, trpc_1.trpc.finance.exportReconciliations.query({ journalEntryId: journalId || undefined })];
                                case 1:
                                    exp = _a.sent();
                                    rows = Array.isArray(exp) ? exp : [];
                                    csv = __spreadArrays(['ID,JournalEntryId,ReconciledBy,ReconciledAt,Notes'], rows.map(function (r) { return r.id + "," + r.journalEntryId + "," + r.reconciledBy + "," + r.reconciledAt + ",\"" + (r.notes || '').replace(/"/g, '""') + "\""; })).join('\n');
                                    blob = new Blob([csv], { type: 'text/csv' });
                                    a = document.createElement('a');
                                    a.href = URL.createObjectURL(blob);
                                    a.download = 'reconciliations.csv';
                                    a.click();
                                    URL.revokeObjectURL(a.href);
                                    sonner_1.toast.success('Reconciliations exported');
                                    return [2 /*return*/];
                            }
                        });
                    }); } }, "Export CSV")),
            react_1["default"].createElement(table_1.Table, null,
                react_1["default"].createElement(table_1.TableHeader, null,
                    react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableHead, null, "ID"),
                        react_1["default"].createElement(table_1.TableHead, null, "Entry"),
                        react_1["default"].createElement(table_1.TableHead, null, "By"),
                        react_1["default"].createElement(table_1.TableHead, null, "When"),
                        react_1["default"].createElement(table_1.TableHead, null, "Notes"),
                        react_1["default"].createElement(table_1.TableHead, null, "Actions"))),
                react_1["default"].createElement(table_1.TableBody, null, Array.isArray(recs) && recs.map(function (r) { return (react_1["default"].createElement(table_1.TableRow, { key: r.id },
                    react_1["default"].createElement(table_1.TableCell, null, r.id),
                    react_1["default"].createElement(table_1.TableCell, null, r.journalEntryId),
                    react_1["default"].createElement(table_1.TableCell, null, r.reconciledBy),
                    react_1["default"].createElement(table_1.TableCell, null, new Date(r.reconciledAt).toLocaleString()),
                    react_1["default"].createElement(table_1.TableCell, null, r.notes || '-'),
                    react_1["default"].createElement(table_1.TableCell, null,
                        react_1["default"].createElement("button", { onClick: function () { return doEdit(r.id); } }, "Edit"),
                        react_1["default"].createElement("button", { onClick: function () { return doUndo(r.id); } }, "Undo")))); }))))));
};
exports["default"] = exports.FinanceSettingsPage;
