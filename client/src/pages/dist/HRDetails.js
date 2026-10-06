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
var react_1 = require("react");
var wouter_1 = require("wouter");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var DeleteConfirmationModal_1 = require("@/components/DeleteConfirmationModal");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
function HRDetails() {
    var _this = this;
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState(false), showDeleteModal = _b[0], setShowDeleteModal = _b[1];
    var _c = react_1.useState(false), isDeleting = _c[0], setIsDeleting = _c[1];
    // Fetch employee from backend (HR details are employee records)
    var _d = trpc_1.trpc.employees.getById.useQuery(id || ""), employeeData = _d.data, isLoading = _d.isLoading;
    var utils = trpc_1.trpc.useUtils();
    var deleteEmployeeMutation = trpc_1.trpc.employees["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("HR record deleted successfully");
            utils.employees.list.invalidate();
            setLocation("/hr");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete HR record");
        }
    });
    var hrRecord = employeeData ? {
        id: id,
        employeeId: employeeData.employeeNumber || "EMP-" + (id === null || id === void 0 ? void 0 : id.slice(0, 8)),
        employeeName: ((employeeData.firstName || "") + " " + (employeeData.lastName || "")).trim() || "Unknown",
        department: employeeData.department || "Not assigned",
        position: employeeData.position || "Not specified",
        joinDate: employeeData.joinDate ? new Date(employeeData.joinDate).toISOString().split('T')[0] : "Not specified",
        email: employeeData.email || "Not provided",
        phone: employeeData.phone || "Not provided",
        status: employeeData.status || "active"
    } : null;
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDeleting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, mutationHelpers_1["default"](deleteEmployeeMutation, id || "")];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setIsDeleting(false);
                    setShowDeleteModal(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "HR Details", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "HR", href: "/hr" },
                { label: "Details" },
            ] },
            React.createElement("div", { className: "flex items-center justify-center h-64" },
                React.createElement("p", null, "Loading HR record..."))));
    }
    if (!hrRecord) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "HR Details", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "HR", href: "/hr" },
                { label: "Details" },
            ] },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "HR record not found"),
                React.createElement(button_1.Button, { onClick: function () { return setLocation("/hr"); } }, "Back to HR"))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "HR Details", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "HR", href: "/hr" },
            { label: "Details" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, hrRecord.employeeName),
                    React.createElement(card_1.CardDescription, null, hrRecord.position)),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-slate-600" }, "Employee ID"),
                            React.createElement("p", { className: "font-semibold" }, (hrRecord === null || hrRecord === void 0 ? void 0 : hrRecord.employeeId) || "N/A")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-slate-600" }, "Department"),
                            React.createElement("p", { className: "font-semibold" }, (hrRecord === null || hrRecord === void 0 ? void 0 : hrRecord.department) || "N/A")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-slate-600" }, "Join Date"),
                            React.createElement("p", { className: "font-semibold" }, (hrRecord === null || hrRecord === void 0 ? void 0 : hrRecord.joinDate) || "N/A")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-slate-600" }, "Status"),
                            React.createElement("p", { className: "font-semibold " + (((hrRecord === null || hrRecord === void 0 ? void 0 : hrRecord.status) || 'inactive') === 'active' ? 'text-green-600' : 'text-red-600') }, ((hrRecord === null || hrRecord === void 0 ? void 0 : hrRecord.status) || "inactive").charAt(0).toUpperCase() + ((hrRecord === null || hrRecord === void 0 ? void 0 : hrRecord.status) || "inactive").slice(1))),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-slate-600" }, "Email"),
                            React.createElement("p", { className: "font-semibold" }, (hrRecord === null || hrRecord === void 0 ? void 0 : hrRecord.email) || "N/A")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-slate-600" }, "Phone"),
                            React.createElement("p", { className: "font-semibold" }, (hrRecord === null || hrRecord === void 0 ? void 0 : hrRecord.phone) || "N/A"))),
                    React.createElement("div", { className: "flex gap-2 pt-4" },
                        React.createElement(button_1.Button, { variant: "outline", className: "gap-2", onClick: function () { return setLocation("/hr/" + id + "/edit"); } },
                            React.createElement(lucide_react_1.Edit2, { className: "w-4 h-4" }),
                            "Edit"),
                        React.createElement(button_1.Button, { variant: "destructive", className: "gap-2", onClick: function () { return setShowDeleteModal(true); } },
                            React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }),
                            "Delete")))),
            React.createElement(DeleteConfirmationModal_1["default"], { isOpen: showDeleteModal, title: "Delete HR Record", description: "Are you sure you want to delete this HR record? This action cannot be undone.", onConfirm: handleDelete, onCancel: function () { return setShowDeleteModal(false); }, isLoading: isDeleting }))));
}
exports["default"] = HRDetails;
