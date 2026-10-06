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
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var ClientForm_1 = require("@/components/ClientForm");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
function CreateClient() {
    var _this = this;
    var _a;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState(false), isLoading = _c[0], setIsLoading = _c[1];
    var _d = react_1.useState({
        // Basic info
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        secondaryPhone: "",
        // Address
        address: "",
        city: "",
        country: "Kenya",
        postalCode: "",
        // Business details
        taxId: "",
        website: "",
        industry: "",
        businessType: "",
        registrationNumber: "",
        yearEstablished: "",
        numberOfEmployees: "",
        businessLicense: "",
        // Financial
        paymentTerms: "",
        creditLimit: "",
        bankName: "",
        bankCode: "",
        branch: "",
        bankAccountNumber: "",
        currency: "KES",
        // Acquisition
        leadSource: "",
        // Classification
        status: "active",
        assignedTo: "",
        notes: "",
        // Portal login
        createClientLogin: false,
        clientPassword: ""
    }), formData = _d[0], setFormData = _d[1];
    var utils = trpc_1.trpc.useUtils();
    var _e = trpc_1.trpc.users.list.useQuery({}).data, usersData = _e === void 0 ? [] : _e;
    var teamMembers = Array.isArray(usersData) ? usersData : ((_a = usersData) === null || _a === void 0 ? void 0 : _a.users) || [];
    // Create mutation
    var createClientMutation = trpc_1.trpc.clients.create.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("Client created successfully!");
            utils.clients.list.invalidate();
            setLocation("/clients/" + data.id);
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create client: " + error.message);
        }
    });
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!formData.companyName || !formData.contactPerson) {
                        sonner_1.toast.error("Please fill in required fields (Company Name and Contact Person)");
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, mutationHelpers_1["default"](createClientMutation, __assign(__assign({}, formData), { yearEstablished: formData.yearEstablished ? parseInt(formData.yearEstablished) : undefined, numberOfEmployees: formData.numberOfEmployees ? parseInt(formData.numberOfEmployees) : undefined, creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined }))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Create Client", description: "Add a new client to your CRM", icon: React.createElement(lucide_react_1.UserPlus, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Clients", href: "/clients" },
            { label: "Create" },
        ], backLink: { label: "Clients", href: "/clients" } },
        React.createElement("div", { className: "space-y-6 max-w-5xl" },
            React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                React.createElement(ClientForm_1.ClientForm, { formData: formData, setFormData: setFormData, teamMembers: teamMembers, showCreateClientLogin: true }),
                React.createElement("div", { className: "flex gap-3 justify-between pb-8" },
                    React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setLocation("/clients"); } },
                        React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                        " Cancel"),
                    React.createElement(button_1.Button, { type: "submit", disabled: isLoading || createClientMutation.isPending, size: "lg" },
                        React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }),
                        isLoading || createClientMutation.isPending ? "Creating..." : "Create Client"))))));
}
exports["default"] = CreateClient;
