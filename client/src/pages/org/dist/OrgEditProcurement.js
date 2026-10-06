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
var select_1 = require("@/components/ui/select");
var skeleton_1 = require("@/components/ui/skeleton");
var trpc_1 = require("@/lib/trpc");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
function OrgEditProcurement() {
    var _this = this;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var procurementId = params.id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var checkPermission = useOrgPermission_1.useOrgPermission().checkPermission;
    var _b = trpc_1.trpc.procurement.getById.useQuery(procurementId, {
        enabled: !!procurementId && checkPermission("procurement:edit")
    }), procurement = _b.data, isLoading = _b.isLoading;
    var _c = react_1.useState({
        title: "",
        description: "",
        vendor: "",
        amount: "",
        status: "draft",
        requestDate: "",
        notes: ""
    }), formData = _c[0], setFormData = _c[1];
    var _d = react_1.useState(false), isSaving = _d[0], setIsSaving = _d[1];
    react_1["default"].useEffect(function () {
        if (procurement) {
            setFormData({
                title: procurement.title || "",
                description: procurement.description || "",
                vendor: procurement.vendor || "",
                amount: procurement.amount ? (procurement.amount / 100).toFixed(2) : "",
                status: procurement.status || "draft",
                requestDate: procurement.requestDate ? new Date(procurement.requestDate).toISOString().split("T")[0] : "",
                notes: procurement.notes || ""
            });
        }
    }, [procurement]);
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setIsSaving(true);
            try {
                // Add save logic here
                sonner_1.toast.success("Procurement request updated successfully");
                setLocation("/org/" + slug + "/procurement/" + procurementId);
            }
            catch (error) {
                sonner_1.toast.error("Failed to update procurement request");
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
                    { label: "Procurement", href: "/org/" + slug + "/procurement" },
                    { label: "PR #" + procurementId, href: "/org/" + slug + "/procurement/" + procurementId },
                    { label: "Edit" },
                ] }),
            react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return setLocation("/org/" + slug + "/procurement/" + procurementId); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4" })),
                react_1["default"].createElement("h1", { className: "text-3xl font-bold" }, "Edit Procurement Request")),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Procurement Details")),
                react_1["default"].createElement(card_1.CardContent, { className: "space-y-6" },
                    react_1["default"].createElement("div", { className: "grid gap-6 md:grid-cols-2" },
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Title"),
                            react_1["default"].createElement(input_1.Input, { value: formData.title, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { title: e.target.value })); }, placeholder: "Procurement title" })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Vendor"),
                            react_1["default"].createElement(input_1.Input, { value: formData.vendor, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { vendor: e.target.value })); }, placeholder: "Vendor name" })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Amount"),
                            react_1["default"].createElement(input_1.Input, { type: "number", step: "0.01", value: formData.amount, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { amount: e.target.value })); }, placeholder: "0.00" })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Request Date"),
                            react_1["default"].createElement(input_1.Input, { type: "date", value: formData.requestDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { requestDate: e.target.value })); } })),
                        react_1["default"].createElement("div", { className: "space-y-2 md:col-span-2" },
                            react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Status"),
                            react_1["default"].createElement(select_1.Select, { value: formData.status, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { status: value })); } },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"))))),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Description"),
                        react_1["default"].createElement(textarea_1.Textarea, { value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }, placeholder: "Procurement description", rows: 3 })),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Notes"),
                        react_1["default"].createElement(textarea_1.Textarea, { value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }, placeholder: "Additional notes", rows: 4 })),
                    react_1["default"].createElement("div", { className: "flex gap-3" },
                        react_1["default"].createElement(button_1.Button, { onClick: handleSave, disabled: isSaving, className: "gap-2" },
                            react_1["default"].createElement(lucide_react_1.Save, { className: "h-4 w-4" }),
                            isSaving ? "Saving..." : "Save Changes"),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/org/" + slug + "/procurement/" + procurementId); } }, "Cancel")))))));
}
exports["default"] = OrgEditProcurement;
