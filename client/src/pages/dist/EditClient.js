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
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var ClientForm_1 = require("@/components/ClientForm");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
function EditClient() {
    var _this = this;
    var _a;
    var params = wouter_1.useParams();
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = permissions_1.useRequireFeature("clients:edit"), allowed = _c.allowed, isLoadingPermissions = _c.isLoading;
    var _d = react_1.useState(false), isLoading = _d[0], setIsLoading = _d[1];
    var _e = react_1.useState({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        secondaryPhone: "",
        address: "",
        city: "",
        country: "",
        postalCode: "",
        taxId: "",
        website: "",
        industry: "",
        businessType: "",
        registrationNumber: "",
        yearEstablished: "",
        numberOfEmployees: "",
        businessLicense: "",
        paymentTerms: "",
        creditLimit: "",
        bankName: "",
        bankCode: "",
        branch: "",
        bankAccountNumber: "",
        currency: "KES",
        leadSource: "",
        status: "active",
        assignedTo: "",
        notes: ""
    }), formData = _e[0], setFormData = _e[1];
    var utils = trpc_1.trpc.useUtils();
    var _f = trpc_1.trpc.users.list.useQuery({}).data, usersData = _f === void 0 ? [] : _f;
    var teamMembers = Array.isArray(usersData) ? usersData : ((_a = usersData) === null || _a === void 0 ? void 0 : _a.users) || [];
    // Fetch client data from backend
    var _g = trpc_1.trpc.clients.getById.useQuery(params.id, {
        enabled: !!params.id
    }), clientData = _g.data, isLoadingClient = _g.isLoading;
    // Update mutation
    var updateClientMutation = trpc_1.trpc.clients.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Client updated successfully!");
            utils.clients.list.invalidate();
            utils.clients.getById.invalidate(params.id);
            setLocation("/clients/" + params.id);
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update client: " + error.message);
        }
    });
    // Delete mutation
    var deleteClientMutation = trpc_1.trpc.clients["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Client deleted successfully!");
            utils.clients.list.invalidate();
            setLocation("/clients");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete client: " + error.message);
        }
    });
    // Load client data when component mounts
    react_1.useEffect(function () {
        if (clientData) {
            var d = clientData;
            setFormData({
                companyName: d.companyName || "",
                contactPerson: d.contactPerson || "",
                email: d.email || "",
                phone: d.phone || "",
                secondaryPhone: d.secondaryPhone || "",
                address: d.address || "",
                city: d.city || "",
                country: d.country || "",
                postalCode: d.postalCode || "",
                taxId: d.taxId || "",
                website: d.website || "",
                industry: d.industry || "",
                businessType: d.businessType || "",
                registrationNumber: d.registrationNumber || "",
                yearEstablished: d.yearEstablished || "",
                numberOfEmployees: d.numberOfEmployees || "",
                businessLicense: d.businessLicense || "",
                paymentTerms: d.paymentTerms || "",
                creditLimit: d.creditLimit || "",
                bankName: d.bankName || "",
                bankCode: d.bankCode || "",
                branch: d.branch || "",
                bankAccountNumber: d.bankAccountNumber || "",
                currency: d.currency || "KES",
                leadSource: d.leadSource || "",
                status: (d.status || "active"),
                assignedTo: d.assignedTo || "",
                notes: d.notes || ""
            });
        }
    }, [clientData]);
    if (isLoadingPermissions)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
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
                    return [4 /*yield*/, mutationHelpers_1["default"](updateClientMutation, __assign({ id: params.id }, formData))];
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
    var handleDelete = function () {
        if (confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
            deleteClientMutation.mutate(params.id);
        }
    };
    if (isLoadingClient) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Client", description: "Update client information", icon: React.createElement(lucide_react_1.Edit, { className: "w-5 h-5" }), backLink: { label: "Clients", href: "/clients" }, breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "Clients", href: "/clients" },
                { label: "Edit" },
            ] },
            React.createElement("div", { className: "flex items-center justify-center h-96" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Client", description: "Update client information", icon: React.createElement(lucide_react_1.Edit, { className: "w-5 h-5" }), backLink: { label: "Clients", href: "/clients" }, breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Clients", href: "/clients" },
            { label: "Edit" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Client Information"),
                    React.createElement(card_1.CardDescription, null, "Update the client's details below")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        React.createElement(ClientForm_1.ClientForm, { formData: formData, setFormData: setFormData, teamMembers: teamMembers, showPortalLogin: false }),
                        React.createElement("div", { className: "flex gap-2 justify-between" },
                            React.createElement(button_1.Button, { type: "button", variant: "destructive", onClick: handleDelete, disabled: deleteClientMutation.isPending },
                                deleteClientMutation.isPending ? (React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" })) : (React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" })),
                                "Delete Client"),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setLocation("/clients/" + params.id); } }, "Cancel"),
                                React.createElement(button_1.Button, { type: "submit", disabled: isLoading || updateClientMutation.isPending },
                                    (isLoading || updateClientMutation.isPending) ? (React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" })) : (React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-2" })),
                                    isLoading || updateClientMutation.isPending ? "Saving..." : "Save Changes")))))))));
}
exports["default"] = EditClient;
