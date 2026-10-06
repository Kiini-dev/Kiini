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
var trpc_1 = require("@/lib/trpc");
var wouter_1 = require("wouter");
var sonner_1 = require("sonner");
var button_1 = require("@/components/ui/button");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var lucide_react_1 = require("lucide-react");
var SupplierForm_1 = require("@/components/SupplierForm");
function CreateSupplierPage() {
    var _this = this;
    var _a, _b;
    var _c = wouter_1.useLocation(), navigate = _c[1];
    var _d = react_1.useState(false), isSubmitting = _d[0], setIsSubmitting = _d[1];
    var _e = react_1.useState({
        companyName: "",
        contactPerson: "",
        contactTitle: "",
        email: "",
        phone: "",
        alternatePhone: "",
        address: "",
        city: "",
        country: "",
        postalCode: "",
        industry: "",
        taxId: "",
        registrationNumber: "",
        website: "",
        bankName: "",
        bankBranch: "",
        accountNumber: "",
        accountName: "",
        paymentTerms: "",
        paymentMethods: [],
        categories: [],
        certifications: [],
        qualificationStatus: "pending",
        qualificationDate: "",
        accountManagerId: "",
        notes: ""
    }), formData = _e[0], setFormData = _e[1];
    var _f = react_1.useState({}), errors = _f[0], setErrors = _f[1];
    var _g = trpc_1.trpc.users.list.useQuery({}).data, usersData = _g === void 0 ? [] : _g;
    var teamMembers = Array.isArray(usersData) ? usersData : (_b = (_a = usersData) === null || _a === void 0 ? void 0 : _a.users) !== null && _b !== void 0 ? _b : [];
    var createMutation = trpc_1.trpc.suppliers.create.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("Supplier created successfully");
            navigate("/suppliers/" + data.id);
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create supplier");
            setIsSubmitting(false);
        }
    });
    var validateForm = function () {
        var newErrors = {};
        if (!formData.companyName.trim()) {
            newErrors.companyName = "Company name is required";
        }
        if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = "Invalid email format";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!validateForm()) {
                        sonner_1.toast.error("Please fix validation errors");
                        return [2 /*return*/];
                    }
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, createMutation.mutateAsync({
                            companyName: formData.companyName,
                            contactPerson: formData.contactPerson || undefined,
                            contactTitle: formData.contactTitle || undefined,
                            email: formData.email || undefined,
                            phone: formData.phone || undefined,
                            alternatePhone: formData.alternatePhone || undefined,
                            address: formData.address || undefined,
                            city: formData.city || undefined,
                            country: formData.country || undefined,
                            postalCode: formData.postalCode || undefined,
                            taxId: formData.taxId || undefined,
                            registrationNumber: formData.registrationNumber || undefined,
                            website: formData.website || undefined,
                            bankName: formData.bankName || undefined,
                            bankBranch: formData.bankBranch || undefined,
                            accountNumber: formData.accountNumber || undefined,
                            accountName: formData.accountName || undefined,
                            industry: formData.industry || undefined,
                            paymentTerms: formData.paymentTerms || undefined,
                            paymentMethods: formData.paymentMethods.length > 0 ? formData.paymentMethods : undefined,
                            categories: formData.categories.length > 0 ? formData.categories : undefined,
                            certifications: formData.certifications.length > 0 ? formData.certifications : undefined,
                            qualificationStatus: formData.qualificationStatus,
                            qualificationDate: formData.qualificationDate || undefined,
                            accountManagerId: formData.accountManagerId || undefined,
                            notes: formData.notes || undefined
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error creating supplier:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Add Supplier", description: "Create a new supplier in the system", icon: React.createElement(lucide_react_1.Plus, { className: "w-5 h-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Suppliers", href: "/suppliers" }, { label: "Create" }], backLink: { label: "Suppliers", href: "/suppliers" } },
        React.createElement("div", { className: "max-w-4xl mx-auto" },
            React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                React.createElement(SupplierForm_1.SupplierForm, { formData: formData, setFormData: setFormData, teamMembers: teamMembers, errors: errors }),
                React.createElement("div", { className: "flex gap-3 justify-end pt-6 pb-8" },
                    React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/suppliers"); }, disabled: isSubmitting },
                        React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                        "Cancel"),
                    React.createElement(button_1.Button, { type: "submit", disabled: isSubmitting, className: "min-w-[150px]" },
                        isSubmitting && React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                        isSubmitting ? "Creating..." : "Create Supplier"))))));
}
exports["default"] = CreateSupplierPage;
