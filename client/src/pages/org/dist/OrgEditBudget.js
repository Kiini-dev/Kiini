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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var skeleton_1 = require("@/components/ui/skeleton");
var trpc_1 = require("@/lib/trpc");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
function OrgEditBudget() {
    var _this = this;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var budgetId = params.id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var checkPermission = useOrgPermission_1.useOrgPermission().checkPermission;
    var _b = trpc_1.trpc.budgets.getById.useQuery(budgetId, {
        enabled: !!budgetId && checkPermission("accounting:budgets:edit")
    }), budget = _b.data, isLoading = _b.isLoading;
    var _c = react_1.useState({
        name: "",
        amount: "",
        department: "",
        startDate: "",
        endDate: "",
        notes: ""
    }), formData = _c[0], setFormData = _c[1];
    var _d = react_1.useState(false), isSaving = _d[0], setIsSaving = _d[1];
    react_1["default"].useEffect(function () {
        if (budget) {
            setFormData({
                name: budget.name || "",
                amount: budget.amount ? (budget.amount / 100).toFixed(2) : "",
                department: budget.department || "",
                startDate: budget.startDate ? new Date(budget.startDate).toISOString().split("T")[0] : "",
                endDate: budget.endDate ? new Date(budget.endDate).toISOString().split("T")[0] : "",
                notes: budget.notes || ""
            });
        }
    }, [budget]);
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setIsSaving(true);
            try {
                // Add save logic here
                sonner_1.toast.success("Budget updated successfully");
                setLocation("/org/" + slug + "/budgets/" + budgetId);
            }
            catch (error) {
                sonner_1.toast.error("Failed to update budget");
            }
            finally {
                setIsSaving(false);
            }
            return [2 /*return*/];
        });
    }); };
    if (isLoading) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { slug: slug },
            react_1["default"].createElement("div", { className: "space-y-4 p-6" },
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-10 w-1/4" }),
                react_1["default"].createElement("div", { className: "space-y-2" }, __spreadArrays(Array(5)).map(function (_, i) { return (react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-12 w-full" })); })))));
    }
    return (react_1["default"].createElement(OrgLayout_1["default"], { slug: slug },
        react_1["default"].createElement("div", { className: "p-6 space-y-6" },
            react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                    { label: "Budgets", href: "/org/" + slug + "/budgets" },
                    { label: (budget === null || budget === void 0 ? void 0 : budget.name) || "Budget #" + budgetId, href: "/org/" + slug + "/budgets/" + budgetId },
                    { label: "Edit" },
                ] }),
            react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return setLocation("/org/" + slug + "/budgets/" + budgetId); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4" })),
                react_1["default"].createElement("h1", { className: "text-3xl font-bold" }, "Edit Budget")),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Budget Details")),
                react_1["default"].createElement(card_1.CardContent, { className: "space-y-6" },
                    react_1["default"].createElement("div", { className: "grid gap-6 md:grid-cols-2" },
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Budget Name"),
                            react_1["default"].createElement(input_1.Input, { value: formData.name, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }, placeholder: "Budget name" })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Amount"),
                            react_1["default"].createElement(input_1.Input, { type: "number", step: "0.01", value: formData.amount, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { amount: e.target.value })); }, placeholder: "0.00" })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Department"),
                            react_1["default"].createElement(input_1.Input, { value: formData.department, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { department: e.target.value })); }, placeholder: "Department name" })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Start Date"),
                            react_1["default"].createElement(input_1.Input, { type: "date", value: formData.startDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { startDate: e.target.value })); } })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement("label", { className: "text-sm font-medium" }, "End Date"),
                            react_1["default"].createElement(input_1.Input, { type: "date", value: formData.endDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { endDate: e.target.value })); } }))),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Notes"),
                        react_1["default"].createElement(textarea_1.Textarea, { value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }, placeholder: "Additional notes", rows: 4 })),
                    react_1["default"].createElement("div", { className: "flex gap-3" },
                        react_1["default"].createElement(button_1.Button, { onClick: handleSave, disabled: isSaving, className: "gap-2" },
                            react_1["default"].createElement(lucide_react_1.Save, { className: "h-4 w-4" }),
                            isSaving ? "Saving..." : "Save Changes"),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/org/" + slug + "/budgets/" + budgetId); } }, "Cancel")))))));
}
exports["default"] = OrgEditBudget;
