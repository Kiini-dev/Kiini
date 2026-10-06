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
exports.BulkTeamOperations = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var client_1 = require("../_trpc/client");
var Button_1 = require("./Button");
var Modal_1 = require("./Modal");
var Toast_1 = require("./Toast");
function BulkTeamOperations(_a) {
    var _this = this;
    var teamMembers = _a.teamMembers, onOperationComplete = _a.onOperationComplete, projectId = _a.projectId;
    var _b = react_1.useState(new Set()), selectedIds = _b[0], setSelectedIds = _b[1];
    var _c = react_1.useState(false), showReassignModal = _c[0], setShowReassignModal = _c[1];
    var _d = react_1.useState(false), showBulkUpdateModal = _d[0], setShowBulkUpdateModal = _d[1];
    var _e = react_1.useState(false), showConfirmDelete = _e[0], setShowConfirmDelete = _e[1];
    var _f = react_1.useState(""), newProjectId = _f[0], setNewProjectId = _f[1];
    var _g = react_1.useState({
        role: "",
        hoursAllocated: "",
        startDate: "",
        endDate: ""
    }), updateFields = _g[0], setUpdateFields = _g[1];
    var _h = react_1.useState(null), toast = _h[0], setToast = _h[1];
    var _j = react_1.useState(false), isLoading = _j[0], setIsLoading = _j[1];
    var projectsQuery = client_1.trpc.projects.list.useQuery({ limit: 100 });
    var bulkReassignMutation = client_1.trpc.projects.teamMembers.bulkReassign.useMutation();
    var bulkUpdateMutation = client_1.trpc.projects.teamMembers.bulkUpdate.useMutation();
    var bulkDeleteMutation = client_1.trpc.projects.teamMembers.bulkDelete.useMutation();
    var toggleSelectAll = function () {
        if (selectedIds.size === teamMembers.length) {
            setSelectedIds(new Set());
        }
        else {
            setSelectedIds(new Set(teamMembers.map(function (m) { return m.id; })));
        }
    };
    var toggleSelect = function (id) {
        var newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected["delete"](id);
        }
        else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };
    var handleReassign = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!newProjectId) {
                        setToast({ message: "Please select a destination project", type: "error" });
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, bulkReassignMutation.mutateAsync({
                            memberIds: Array.from(selectedIds),
                            newProjectId: newProjectId
                        })];
                case 2:
                    result = _a.sent();
                    if (result.successCount > 0) {
                        setToast({
                            message: "Successfully reassigned " + result.successCount + " team member(s)",
                            type: "success"
                        });
                        setSelectedIds(new Set());
                        setNewProjectId("");
                        setShowReassignModal(false);
                        onOperationComplete();
                    }
                    if (result.errors.length > 0) {
                        setToast({ message: "Errors: " + result.errors.join(", "), type: "error" });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    setToast({
                        message: "Error reassigning: " + error_1.message,
                        type: "error"
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleBulkUpdate = function () { return __awaiter(_this, void 0, void 0, function () {
        var updates, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    updates = {};
                    if (updateFields.role)
                        updates.role = updateFields.role;
                    if (updateFields.hoursAllocated)
                        updates.hoursAllocated = parseFloat(updateFields.hoursAllocated);
                    if (updateFields.startDate)
                        updates.startDate = updateFields.startDate;
                    if (updateFields.endDate)
                        updates.endDate = updateFields.endDate;
                    if (Object.keys(updates).length === 0) {
                        setToast({ message: "Please fill in at least one field to update", type: "error" });
                        setIsLoading(false);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, bulkUpdateMutation.mutateAsync({
                            memberIds: Array.from(selectedIds),
                            updates: updates
                        })];
                case 2:
                    result = _a.sent();
                    if (result.successCount > 0) {
                        setToast({
                            message: "Successfully updated " + result.successCount + " team member(s)",
                            type: "success"
                        });
                        setSelectedIds(new Set());
                        setUpdateFields({ role: "", hoursAllocated: "", startDate: "", endDate: "" });
                        setShowBulkUpdateModal(false);
                        onOperationComplete();
                    }
                    if (result.errors.length > 0) {
                        setToast({ message: "Errors: " + result.errors.join(", "), type: "error" });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    setToast({
                        message: "Error updating: " + error_2.message,
                        type: "error"
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleBulkDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, bulkDeleteMutation.mutateAsync({
                            memberIds: Array.from(selectedIds)
                        })];
                case 2:
                    result = _a.sent();
                    if (result.successCount > 0) {
                        setToast({
                            message: "Successfully deleted " + result.successCount + " team member(s)",
                            type: "success"
                        });
                        setSelectedIds(new Set());
                        setShowConfirmDelete(false);
                        onOperationComplete();
                    }
                    if (result.errors.length > 0) {
                        setToast({ message: "Errors: " + result.errors.join(", "), type: "error" });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    setToast({
                        message: "Error deleting: " + error_3.message,
                        type: "error"
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (teamMembers.length === 0) {
        return null;
    }
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        selectedIds.size > 0 && (react_1["default"].createElement("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_1["default"].createElement("input", { type: "checkbox", checked: selectedIds.size === teamMembers.length, onChange: toggleSelectAll, className: "w-5 h-5 text-blue-600 rounded cursor-pointer" }),
                    react_1["default"].createElement("span", { className: "text-sm font-semibold text-blue-900" },
                        selectedIds.size,
                        " team member(s) selected")),
                react_1["default"].createElement("div", { className: "flex gap-2" },
                    react_1["default"].createElement(Button_1["default"], { variant: "secondary", size: "sm", onClick: function () { return setShowReassignModal(true); }, disabled: isLoading, icon: react_1["default"].createElement(lucide_react_1.Copy, { className: "w-4 h-4" }) }, "Reassign Project"),
                    react_1["default"].createElement(Button_1["default"], { variant: "secondary", size: "sm", onClick: function () { return setShowBulkUpdateModal(true); }, disabled: isLoading, icon: react_1["default"].createElement(lucide_react_1.Edit3, { className: "w-4 h-4" }) }, "Bulk Update"),
                    react_1["default"].createElement(Button_1["default"], { variant: "danger", size: "sm", onClick: function () { return setShowConfirmDelete(true); }, disabled: isLoading, icon: react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }) }, "Delete"),
                    react_1["default"].createElement("button", { onClick: function () { return setSelectedIds(new Set()); }, className: "text-gray-500 hover:text-gray-700" },
                        react_1["default"].createElement(lucide_react_1.X, { className: "w-5 h-5" })))))),
        react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-2" },
            react_1["default"].createElement("input", { type: "checkbox", checked: selectedIds.size === teamMembers.length && teamMembers.length > 0, onChange: toggleSelectAll, className: "w-5 h-5 text-blue-600 rounded cursor-pointer", title: "Select/deselect all team members" }),
            react_1["default"].createElement("span", { className: "text-xs text-gray-600" }, "Select all")),
        showReassignModal && (react_1["default"].createElement(Modal_1["default"], { isOpen: showReassignModal, onClose: function () { return setShowReassignModal(false); }, title: "Reassign Team Members to Different Project" },
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Select Destination Project"),
                    react_1["default"].createElement("select", { value: newProjectId, onChange: function (e) { return setNewProjectId(e.target.value); }, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" },
                        react_1["default"].createElement("option", { value: "" }, "-- Select a project --"),
                        Array.isArray(projectsQuery.data) && projectsQuery.data.map(function (proj) { return (react_1["default"].createElement("option", { key: proj.id, value: proj.id, disabled: proj.id === projectId },
                            proj.name,
                            proj.id === projectId ? " (current)" : "")); }))),
                react_1["default"].createElement("div", { className: "bg-yellow-50 border border-yellow-200 rounded p-3 flex gap-2" },
                    react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" }),
                    react_1["default"].createElement("div", { className: "text-sm text-yellow-800" },
                        react_1["default"].createElement("p", { className: "font-semibold" }, "Note:"),
                        react_1["default"].createElement("p", null,
                            "This will move ",
                            selectedIds.size,
                            " team member(s) to the selected project."))),
                react_1["default"].createElement("div", { className: "flex gap-2 justify-end" },
                    react_1["default"].createElement(Button_1["default"], { variant: "secondary", onClick: function () { return setShowReassignModal(false); }, disabled: isLoading }, "Cancel"),
                    react_1["default"].createElement(Button_1["default"], { onClick: handleReassign, isLoading: isLoading, disabled: !newProjectId || isLoading }, "Reassign"))))),
        showBulkUpdateModal && (react_1["default"].createElement(Modal_1["default"], { isOpen: showBulkUpdateModal, onClose: function () { return setShowBulkUpdateModal(false); }, title: "Bulk Update Team Members" },
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Role"),
                    react_1["default"].createElement("input", { type: "text", value: updateFields.role, onChange: function (e) { return setUpdateFields(__assign(__assign({}, updateFields), { role: e.target.value })); }, placeholder: "e.g., Lead Developer, Designer, QA", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Hours Allocated (per week)"),
                    react_1["default"].createElement("input", { type: "number", value: updateFields.hoursAllocated, onChange: function (e) { return setUpdateFields(__assign(__assign({}, updateFields), { hoursAllocated: e.target.value })); }, placeholder: "e.g., 40", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Start Date"),
                        react_1["default"].createElement("input", { type: "date", value: updateFields.startDate, onChange: function (e) { return setUpdateFields(__assign(__assign({}, updateFields), { startDate: e.target.value })); }, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "End Date"),
                        react_1["default"].createElement("input", { type: "date", value: updateFields.endDate, onChange: function (e) { return setUpdateFields(__assign(__assign({}, updateFields), { endDate: e.target.value })); }, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }))),
                react_1["default"].createElement("div", { className: "bg-blue-50 border border-blue-200 rounded p-3 flex gap-2" },
                    react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" }),
                    react_1["default"].createElement("div", { className: "text-sm text-blue-800" },
                        react_1["default"].createElement("p", { className: "font-semibold" }, "Tip:"),
                        react_1["default"].createElement("p", null, "Leave fields blank to skip updating them. Only filled fields will be updated."))),
                react_1["default"].createElement("div", { className: "flex gap-2 justify-end" },
                    react_1["default"].createElement(Button_1["default"], { variant: "secondary", onClick: function () { return setShowBulkUpdateModal(false); }, disabled: isLoading }, "Cancel"),
                    react_1["default"].createElement(Button_1["default"], { onClick: handleBulkUpdate, isLoading: isLoading },
                        "Update ",
                        selectedIds.size))))),
        showConfirmDelete && (react_1["default"].createElement(Modal_1["default"], { isOpen: showConfirmDelete, onClose: function () { return setShowConfirmDelete(false); }, title: "Confirm Bulk Delete" },
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("div", { className: "bg-red-50 border border-red-200 rounded p-4 flex gap-3" },
                    react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "w-6 h-6 text-red-600 flex-shrink-0" }),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "font-semibold text-red-900" },
                            "Delete ",
                            selectedIds.size,
                            " team member(s)?"),
                        react_1["default"].createElement("p", { className: "text-sm text-red-800 mt-1" }, "This action cannot be undone. These team members will be removed from the project."))),
                react_1["default"].createElement("div", { className: "flex gap-2 justify-end" },
                    react_1["default"].createElement(Button_1["default"], { variant: "secondary", onClick: function () { return setShowConfirmDelete(false); }, disabled: isLoading }, "Cancel"),
                    react_1["default"].createElement(Button_1["default"], { variant: "danger", onClick: handleBulkDelete, isLoading: isLoading, icon: react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }) },
                        "Delete ",
                        selectedIds.size))))),
        toast && (react_1["default"].createElement(Toast_1["default"], { message: toast.message, type: toast.type, onClose: function () { return setToast(null); } })),
        react_1["default"].createElement("div", { className: "space-y-1" }, teamMembers.map(function (member) { return (react_1["default"].createElement("div", { key: member.id, className: "flex items-center gap-2" },
            react_1["default"].createElement("input", { type: "checkbox", checked: selectedIds.has(member.id), onChange: function () { return toggleSelect(member.id); }, className: "w-4 h-4 text-blue-600 rounded cursor-pointer" }))); }))));
}
exports.BulkTeamOperations = BulkTeamOperations;
exports["default"] = BulkTeamOperations;
