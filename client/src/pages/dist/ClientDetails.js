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
var ModuleLayout_1 = require("@/components/ModuleLayout");
// DeleteConfirmationModal removed; using browser confirm via actions
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var LocationSelects_1 = require("@/components/LocationSelects");
var sonner_1 = require("sonner");
var actions_1 = require("@/lib/actions");
var lucide_react_1 = require("lucide-react");
var activityLog_1 = require("@/lib/activityLog");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var healthScore_1 = require("@/lib/healthScore");
var useFavorite_1 = require("@/hooks/useFavorite");
function ClientDetails() {
    var _this = this;
    var params = wouter_1.useParams();
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState("corporate"), clientType = _b[0], setClientType = _b[1];
    var _c = react_1.useState(false), isDeleteOpen = _c[0], setIsDeleteOpen = _c[1];
    var _d = react_1.useState(false), isDeleting = _d[0], setIsDeleting = _d[1];
    // Fetch client data from backend
    var _e = trpc_1.trpc.clients.getById.useQuery(params.id, {
        enabled: !!params.id
    }), clientData = _e.data, isLoading = _e.isLoading;
    // Fetch invoices and projects for health score
    var _f = trpc_1.trpc.invoices.byClient.useQuery({ clientId: params.id }, { enabled: !!params.id }).data, clientInvoices = _f === void 0 ? [] : _f;
    var _g = trpc_1.trpc.projects.byClient.useQuery({ clientId: params.id }, { enabled: !!params.id }).data, clientProjects = _g === void 0 ? [] : _g;
    var utils = trpc_1.trpc.useUtils();
    // Delete mutation - moved to component level
    var deleteClientMutation = trpc_1.trpc.clients["delete"].useMutation({
        onSuccess: function () {
            var clientName = clientType === "corporate" ? corporateInfo.companyLegalName : personalInfo.firstName + " " + personalInfo.lastName;
            activityLog_1.logDelete("Clients", params.id, clientName);
            // toast will be shown by actions.handleDelete wrapper
            setIsDeleteOpen(false);
            setLocation("/clients");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete client");
        },
        onSettled: function () {
            setIsDeleting(false);
        }
    });
    // Personal/Individual Information
    var _h = react_1.useState({
        firstName: "",
        middleName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        nationality: "Kenyan",
        idType: "national_id",
        idNumber: "",
        idIssueDate: "",
        idExpiryDate: "",
        kraPin: "",
        maritalStatus: "",
        occupation: "",
        employer: "",
        employmentStatus: ""
    }), personalInfo = _h[0], setPersonalInfo = _h[1];
    // Corporate Information
    var _j = react_1.useState({
        companyLegalName: "",
        tradingName: "",
        registrationNumber: "",
        incorporationDate: "",
        incorporationCountry: "Kenya",
        businessType: "Limited Company",
        industry: "",
        numberOfEmployees: "",
        annualRevenue: "",
        kraPin: "",
        vatNumber: ""
    }), corporateInfo = _j[0], setCorporateInfo = _j[1];
    // Contact Information
    var _k = react_1.useState({
        primaryPhone: "",
        secondaryPhone: "",
        email: "",
        website: "",
        physicalAddress: "",
        city: "",
        county: "",
        postalCode: "",
        mailingAddress: "",
        preferredContact: "email"
    }), contactInfo = _k[0], setContactInfo = _k[1];
    var clientName = clientType === "corporate" ? corporateInfo.companyLegalName : personalInfo.firstName + " " + personalInfo.lastName;
    var _l = useFavorite_1.useFavorite("client", params.id, clientName), isStarred = _l.isStarred, toggleStar = _l.toggleStar;
    // Load client data when component mounts or clientData changes
    react_1.useEffect(function () {
        if (clientData) {
            setCorporateInfo({
                companyLegalName: clientData.companyName || "",
                tradingName: "",
                registrationNumber: clientData.taxId || "",
                incorporationDate: "",
                incorporationCountry: clientData.country || "Kenya",
                businessType: "Limited Company",
                industry: clientData.industry || "",
                numberOfEmployees: "",
                annualRevenue: "",
                kraPin: clientData.taxId || "",
                vatNumber: ""
            });
            setContactInfo({
                primaryPhone: clientData.phone || "",
                secondaryPhone: "",
                email: clientData.email || "",
                website: clientData.website || "",
                physicalAddress: clientData.address || "",
                city: clientData.city || "",
                county: "",
                postalCode: clientData.postalCode || "",
                mailingAddress: "",
                preferredContact: "email"
            });
        }
    }, [clientData]);
    // Key Personnel (for corporate)
    var _m = react_1.useState([
        {
            name: "",
            idNumber: "",
            position: "",
            shareholding: ""
        },
    ]), personnel = _m[0], setPersonnel = _m[1];
    // Financial Information
    var _o = react_1.useState({
        bankName: "",
        bankBranch: "",
        accountNumber: "",
        accountType: "Current",
        paymentTerms: "Net 30",
        creditLimit: ""
    }), financialInfo = _o[0], setFinancialInfo = _o[1];
    // Risk Assessment
    var _p = react_1.useState({
        sourceOfFunds: "",
        businessPurpose: "",
        expectedVolume: "High",
        expectedFrequency: "Monthly",
        pepStatus: "No",
        riskRating: "Low"
    }), riskInfo = _p[0], setRiskInfo = _p[1];
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var clientId, updateMutation, clientName_1, updateData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    clientId = params.id;
                    if (!clientId) {
                        sonner_1.toast.error("Client ID not found");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    updateMutation = trpc_1.trpc.clients.update.useMutation();
                    clientName_1 = clientType === "corporate" ? corporateInfo.companyLegalName : personalInfo.firstName + " " + personalInfo.lastName;
                    updateData = {
                        id: clientId,
                        companyName: clientType === "corporate" ? corporateInfo.companyLegalName : clientName_1,
                        contactPerson: clientType === "individual" ? personalInfo.firstName : "Contact",
                        email: contactInfo.email,
                        phone: contactInfo.primaryPhone,
                        address: contactInfo.physicalAddress,
                        directors: JSON.stringify(personnel)
                    };
                    return [4 /*yield*/, mutationHelpers_1["default"](updateMutation, updateData)];
                case 2:
                    _a.sent();
                    sonner_1.toast.success("Client information saved successfully!");
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    sonner_1.toast.error("Failed to save client information");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleEdit = function () {
        setLocation("/clients/" + params.id + "/edit");
    };
    var onDelete = function () {
        var clientId = params.id;
        if (!clientId) {
            sonner_1.toast.error("Client ID not found");
            return;
        }
        setIsDeleting(true);
        actions_1.handleDelete(clientId, "client", function () { return mutationHelpers_1["default"](deleteClientMutation, clientId); });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Client Details", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Clients", href: "/clients" }, { label: "Details" }], backLink: { label: "Clients", href: "/clients" } },
        React.createElement("div", { className: "space-y-4" },
            React.createElement("div", { className: "flex items-center justify-end gap-1" },
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: toggleStar },
                    React.createElement(lucide_react_1.Star, { className: "h-4 w-4 " + (isStarred ? "fill-amber-400 text-amber-400" : "") })),
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: function () { if (contactInfo.email)
                        window.location.href = "mailto:" + contactInfo.email;
                    else
                        sonner_1.toast.error("No email address"); } },
                    React.createElement(lucide_react_1.Mail, { className: "h-4 w-4" })),
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: handleEdit },
                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })),
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-destructive", onClick: function () { return setIsDeleteOpen(true); } },
                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))),
            React.createElement("div", { className: "flex flex-col lg:flex-row gap-6" },
                React.createElement("div", { className: "w-full lg:w-80 shrink-0 space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "p-5 space-y-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement("h2", { className: "text-xl font-bold" }, clientType === "corporate" ? corporateInfo.companyLegalName : personalInfo.firstName + " " + personalInfo.lastName),
                                React.createElement("div", { className: "flex flex-wrap gap-1.5" },
                                    React.createElement(badge_1.Badge, { variant: "secondary" }, clientType === "corporate" ? "Corporate" : "Individual"),
                                    React.createElement(badge_1.Badge, { className: "bg-green-100 text-green-800" }, "Active"))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-3 text-sm" },
                                contactInfo.primaryPhone && (React.createElement("div", { className: "flex items-start gap-2" },
                                    React.createElement(lucide_react_1.Phone, { className: "h-4 w-4 mt-0.5 text-muted-foreground shrink-0" }),
                                    React.createElement("span", null, contactInfo.primaryPhone))),
                                contactInfo.email && (React.createElement("div", { className: "flex items-start gap-2" },
                                    React.createElement(lucide_react_1.Mail, { className: "h-4 w-4 mt-0.5 text-muted-foreground shrink-0" }),
                                    React.createElement("span", { className: "break-all" }, contactInfo.email))),
                                contactInfo.physicalAddress && (React.createElement("div", { className: "flex items-start gap-2" },
                                    React.createElement(lucide_react_1.MapPin, { className: "h-4 w-4 mt-0.5 text-muted-foreground shrink-0" }),
                                    React.createElement("span", null,
                                        contactInfo.physicalAddress,
                                        contactInfo.city ? ", " + contactInfo.city : ""))),
                                contactInfo.website && (React.createElement("div", { className: "flex items-start gap-2" },
                                    React.createElement(lucide_react_1.Globe, { className: "h-4 w-4 mt-0.5 text-muted-foreground shrink-0" }),
                                    React.createElement("span", null, contactInfo.website))),
                                corporateInfo.industry && (React.createElement("div", { className: "flex items-start gap-2" },
                                    React.createElement(lucide_react_1.Briefcase, { className: "h-4 w-4 mt-0.5 text-muted-foreground shrink-0" }),
                                    React.createElement("span", null, corporateInfo.industry))),
                                corporateInfo.kraPin && (React.createElement("div", { className: "flex items-start gap-2" },
                                    React.createElement(lucide_react_1.Tag, { className: "h-4 w-4 mt-0.5 text-muted-foreground shrink-0" }),
                                    React.createElement("span", null,
                                        "KRA: ",
                                        corporateInfo.kraPin)))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider" }, "Financials"),
                                React.createElement("div", { className: "grid grid-cols-2 gap-2 text-sm" },
                                    React.createElement("div", { className: "p-2 rounded-md bg-muted/50" },
                                        React.createElement("p", { className: "text-muted-foreground text-xs" }, "Invoices"),
                                        React.createElement("p", { className: "font-semibold" }, clientInvoices.length)),
                                    React.createElement("div", { className: "p-2 rounded-md bg-muted/50" },
                                        React.createElement("p", { className: "text-muted-foreground text-xs" }, "Projects"),
                                        React.createElement("p", { className: "font-semibold" }, clientProjects.length)),
                                    React.createElement("div", { className: "p-2 rounded-md bg-muted/50" },
                                        React.createElement("p", { className: "text-muted-foreground text-xs" }, "Bank"),
                                        React.createElement("p", { className: "font-semibold" }, financialInfo.bankName || "—")),
                                    React.createElement("div", { className: "p-2 rounded-md bg-muted/50" },
                                        React.createElement("p", { className: "text-muted-foreground text-xs" }, "Terms"),
                                        React.createElement("p", { className: "font-semibold" }, financialInfo.paymentTerms || "—")))))),
                    (clientInvoices.length > 0 || clientProjects.length > 0) && (function () {
                        var health = healthScore_1.computeHealthScore(clientInvoices, clientProjects);
                        return (React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardContent, { className: "p-5 space-y-3" },
                                React.createElement("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider" }, "Health Score"),
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement("div", { className: "relative flex h-14 w-14 shrink-0 items-center justify-center" },
                                        React.createElement("svg", { className: "absolute inset-0 h-full w-full -rotate-90", viewBox: "0 0 60 60" },
                                            React.createElement("circle", { cx: "30", cy: "30", r: "24", strokeWidth: "6", fill: "none", stroke: "#e5e7eb" }),
                                            React.createElement("circle", { cx: "30", cy: "30", r: "24", strokeWidth: "6", fill: "none", stroke: health.color, strokeDasharray: "" + 2 * Math.PI * 24, strokeDashoffset: "" + 2 * Math.PI * 24 * (1 - health.score / 100), strokeLinecap: "round" })),
                                        React.createElement("span", { className: "text-lg font-bold z-10" }, health.score)),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "font-semibold text-sm", style: { color: health.color } }, health.label),
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Client Health"))),
                                React.createElement("div", { className: "space-y-1.5" }, health.breakdown.map(function (item) { return (React.createElement("div", { key: item.label, className: "flex items-center gap-2 text-xs" },
                                    React.createElement("span", { className: "w-16 text-muted-foreground shrink-0" }, item.label),
                                    React.createElement("div", { className: "flex-1 h-1.5 bg-muted rounded-full overflow-hidden" },
                                        React.createElement("div", { className: "h-full rounded-full", style: { width: item.value + "%", background: item.color } })),
                                    React.createElement("span", { className: "w-6 text-right text-muted-foreground" },
                                        item.value,
                                        "%"))); })))));
                    })()),
                React.createElement("div", { className: "flex-1 min-w-0" },
                    React.createElement(tabs_1.Tabs, { defaultValue: "details", className: "space-y-4" },
                        React.createElement(tabs_1.TabsList, { className: "flex flex-wrap h-auto gap-1" },
                            React.createElement(tabs_1.TabsTrigger, { value: "details", className: "text-xs" }, "Details"),
                            React.createElement(tabs_1.TabsTrigger, { value: "contact", className: "text-xs" }, "Contact"),
                            React.createElement(tabs_1.TabsTrigger, { value: "personnel", className: "text-xs" }, "Personnel"),
                            React.createElement(tabs_1.TabsTrigger, { value: "financial", className: "text-xs" }, "Financial"),
                            React.createElement(tabs_1.TabsTrigger, { value: "risk", className: "text-xs" }, "Risk & Compliance"),
                            React.createElement(tabs_1.TabsTrigger, { value: "projects", className: "text-xs" }, "Projects"),
                            React.createElement(tabs_1.TabsTrigger, { value: "invoices", className: "text-xs" }, "Invoices"),
                            React.createElement(tabs_1.TabsTrigger, { value: "documents", className: "text-xs" }, "Documents")),
                        React.createElement(tabs_1.TabsContent, { value: "details", className: "space-y-6" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("div", null,
                                            React.createElement(card_1.CardTitle, null, "Client Type"),
                                            React.createElement(card_1.CardDescription, null, "Select whether this is an individual or corporate client")),
                                        React.createElement(select_1.Select, { value: clientType, onValueChange: function (v) { return setClientType(v); } },
                                            React.createElement(select_1.SelectTrigger, { className: "w-48" },
                                                React.createElement(select_1.SelectValue, null)),
                                            React.createElement(select_1.SelectContent, null,
                                                React.createElement(select_1.SelectItem, { value: "individual" }, "Individual"),
                                                React.createElement(select_1.SelectItem, { value: "corporate" }, "Corporate")))))),
                            clientType === "corporate" ? (React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                        React.createElement(lucide_react_1.Building2, { className: "h-5 w-5" }),
                                        "Corporate Information"),
                                    React.createElement(card_1.CardDescription, null, "Company registration and business details")),
                                React.createElement(card_1.CardContent, { className: "space-y-4" },
                                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "companyLegalName" }, "Company Legal Name *"),
                                            React.createElement(input_1.Input, { id: "companyLegalName", value: corporateInfo.companyLegalName, onChange: function (e) { return setCorporateInfo(__assign(__assign({}, corporateInfo), { companyLegalName: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "tradingName" }, "Trading Name"),
                                            React.createElement(input_1.Input, { id: "tradingName", value: corporateInfo.tradingName, onChange: function (e) { return setCorporateInfo(__assign(__assign({}, corporateInfo), { tradingName: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "registrationNumber" }, "Registration Number *"),
                                            React.createElement(input_1.Input, { id: "registrationNumber", value: corporateInfo.registrationNumber, onChange: function (e) { return setCorporateInfo(__assign(__assign({}, corporateInfo), { registrationNumber: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "incorporationDate" }, "Date of Incorporation"),
                                            React.createElement(input_1.Input, { id: "incorporationDate", type: "date", value: corporateInfo.incorporationDate, onChange: function (e) { return setCorporateInfo(__assign(__assign({}, corporateInfo), { incorporationDate: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "incorporationCountry" }, "Country of Incorporation"),
                                            React.createElement(LocationSelects_1.CountrySelect, { value: corporateInfo.incorporationCountry, onChange: function (v) { return setCorporateInfo(__assign(__assign({}, corporateInfo), { incorporationCountry: v })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "businessType" }, "Business Type"),
                                            React.createElement(select_1.Select, { value: corporateInfo.businessType, onValueChange: function (v) { return setCorporateInfo(__assign(__assign({}, corporateInfo), { businessType: v })); } },
                                                React.createElement(select_1.SelectTrigger, null,
                                                    React.createElement(select_1.SelectValue, null)),
                                                React.createElement(select_1.SelectContent, null,
                                                    React.createElement(select_1.SelectItem, { value: "Limited Company" }, "Limited Company"),
                                                    React.createElement(select_1.SelectItem, { value: "Partnership" }, "Partnership"),
                                                    React.createElement(select_1.SelectItem, { value: "Sole Proprietor" }, "Sole Proprietor"),
                                                    React.createElement(select_1.SelectItem, { value: "NGO" }, "NGO"),
                                                    React.createElement(select_1.SelectItem, { value: "Other" }, "Other")))),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "industry" }, "Industry/Sector"),
                                            React.createElement(LocationSelects_1.IndustrySelect, { value: corporateInfo.industry || "", onChange: function (v) { return setCorporateInfo(__assign(__assign({}, corporateInfo), { industry: v })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "numberOfEmployees" }, "Number of Employees"),
                                            React.createElement(select_1.Select, { value: corporateInfo.numberOfEmployees, onValueChange: function (v) { return setCorporateInfo(__assign(__assign({}, corporateInfo), { numberOfEmployees: v })); } },
                                                React.createElement(select_1.SelectTrigger, null,
                                                    React.createElement(select_1.SelectValue, null)),
                                                React.createElement(select_1.SelectContent, null,
                                                    React.createElement(select_1.SelectItem, { value: "1-10" }, "1-10"),
                                                    React.createElement(select_1.SelectItem, { value: "11-50" }, "11-50"),
                                                    React.createElement(select_1.SelectItem, { value: "50-100" }, "50-100"),
                                                    React.createElement(select_1.SelectItem, { value: "100-500" }, "100-500"),
                                                    React.createElement(select_1.SelectItem, { value: "500+" }, "500+")))),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "annualRevenue" }, "Annual Revenue Range"),
                                            React.createElement(select_1.Select, { value: corporateInfo.annualRevenue, onValueChange: function (v) { return setCorporateInfo(__assign(__assign({}, corporateInfo), { annualRevenue: v })); } },
                                                React.createElement(select_1.SelectTrigger, null,
                                                    React.createElement(select_1.SelectValue, null)),
                                                React.createElement(select_1.SelectContent, null,
                                                    React.createElement(select_1.SelectItem, { value: "<1M" }, "< 1M"),
                                                    React.createElement(select_1.SelectItem, { value: "1M-10M" }, "1M - 10M"),
                                                    React.createElement(select_1.SelectItem, { value: "10M-50M" }, "10M - 50M"),
                                                    React.createElement(select_1.SelectItem, { value: "50M-100M" }, "50M - 100M"),
                                                    React.createElement(select_1.SelectItem, { value: "100M+" }, "100M+")))),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "kraPin" }, "KRA PIN *"),
                                            React.createElement(input_1.Input, { id: "kraPin", value: corporateInfo.kraPin, onChange: function (e) { return setCorporateInfo(__assign(__assign({}, corporateInfo), { kraPin: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "vatNumber" }, "VAT Registration Number"),
                                            React.createElement(input_1.Input, { id: "vatNumber", value: corporateInfo.vatNumber, onChange: function (e) { return setCorporateInfo(__assign(__assign({}, corporateInfo), { vatNumber: e.target.value })); } })))))) : (React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                        React.createElement(lucide_react_1.User, { className: "h-5 w-5" }),
                                        "Personal Information"),
                                    React.createElement(card_1.CardDescription, null, "Individual client details and identification")),
                                React.createElement(card_1.CardContent, { className: "space-y-4" },
                                    React.createElement("div", { className: "grid gap-4 md:grid-cols-3" },
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "firstName" }, "First Name *"),
                                            React.createElement(input_1.Input, { id: "firstName", value: personalInfo.firstName, onChange: function (e) { return setPersonalInfo(__assign(__assign({}, personalInfo), { firstName: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "middleName" }, "Middle Name"),
                                            React.createElement(input_1.Input, { id: "middleName", value: personalInfo.middleName, onChange: function (e) { return setPersonalInfo(__assign(__assign({}, personalInfo), { middleName: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "lastName" }, "Last Name *"),
                                            React.createElement(input_1.Input, { id: "lastName", value: personalInfo.lastName, onChange: function (e) { return setPersonalInfo(__assign(__assign({}, personalInfo), { lastName: e.target.value })); } }))),
                                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "dateOfBirth" }, "Date of Birth"),
                                            React.createElement(input_1.Input, { id: "dateOfBirth", type: "date", value: personalInfo.dateOfBirth, onChange: function (e) { return setPersonalInfo(__assign(__assign({}, personalInfo), { dateOfBirth: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "gender" }, "Gender"),
                                            React.createElement(select_1.Select, { value: personalInfo.gender, onValueChange: function (v) { return setPersonalInfo(__assign(__assign({}, personalInfo), { gender: v })); } },
                                                React.createElement(select_1.SelectTrigger, null,
                                                    React.createElement(select_1.SelectValue, { placeholder: "Select gender" })),
                                                React.createElement(select_1.SelectContent, null,
                                                    React.createElement(select_1.SelectItem, { value: "Male" }, "Male"),
                                                    React.createElement(select_1.SelectItem, { value: "Female" }, "Female"),
                                                    React.createElement(select_1.SelectItem, { value: "Other" }, "Other")))),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "nationality" }, "Nationality"),
                                            React.createElement(input_1.Input, { id: "nationality", value: personalInfo.nationality, onChange: function (e) { return setPersonalInfo(__assign(__assign({}, personalInfo), { nationality: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "idType" }, "ID Type"),
                                            React.createElement(select_1.Select, { value: personalInfo.idType, onValueChange: function (v) { return setPersonalInfo(__assign(__assign({}, personalInfo), { idType: v })); } },
                                                React.createElement(select_1.SelectTrigger, null,
                                                    React.createElement(select_1.SelectValue, null)),
                                                React.createElement(select_1.SelectContent, null,
                                                    React.createElement(select_1.SelectItem, { value: "national_id" }, "National ID"),
                                                    React.createElement(select_1.SelectItem, { value: "passport" }, "Passport"),
                                                    React.createElement(select_1.SelectItem, { value: "drivers_license" }, "Driver's License")))),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "idNumber" }, "ID Number *"),
                                            React.createElement(input_1.Input, { id: "idNumber", value: personalInfo.idNumber, onChange: function (e) { return setPersonalInfo(__assign(__assign({}, personalInfo), { idNumber: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "kraPin" }, "KRA PIN"),
                                            React.createElement(input_1.Input, { id: "kraPin", value: personalInfo.kraPin, onChange: function (e) { return setPersonalInfo(__assign(__assign({}, personalInfo), { kraPin: e.target.value })); } })))))),
                            React.createElement("div", { className: "flex justify-end" },
                                React.createElement(button_1.Button, { onClick: handleSave },
                                    React.createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }),
                                    "Save Changes"))),
                        React.createElement(tabs_1.TabsContent, { value: "contact", className: "space-y-6" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                        React.createElement(lucide_react_1.Phone, { className: "h-5 w-5" }),
                                        "Contact Information"),
                                    React.createElement(card_1.CardDescription, null, "Phone, email, and address details")),
                                React.createElement(card_1.CardContent, { className: "space-y-4" },
                                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "primaryPhone" }, "Primary Phone *"),
                                            React.createElement(input_1.Input, { id: "primaryPhone", value: contactInfo.primaryPhone, onChange: function (e) { return setContactInfo(__assign(__assign({}, contactInfo), { primaryPhone: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "secondaryPhone" }, "Secondary Phone"),
                                            React.createElement(input_1.Input, { id: "secondaryPhone", value: contactInfo.secondaryPhone, onChange: function (e) { return setContactInfo(__assign(__assign({}, contactInfo), { secondaryPhone: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "email" }, "Email Address *"),
                                            React.createElement(input_1.Input, { id: "email", type: "email", value: contactInfo.email, onChange: function (e) { return setContactInfo(__assign(__assign({}, contactInfo), { email: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "website" }, "Website"),
                                            React.createElement(input_1.Input, { id: "website", value: contactInfo.website, onChange: function (e) { return setContactInfo(__assign(__assign({}, contactInfo), { website: e.target.value })); } }))),
                                    React.createElement(separator_1.Separator, null),
                                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "physicalAddress" }, "Physical Address *"),
                                            React.createElement(textarea_1.Textarea, { id: "physicalAddress", value: contactInfo.physicalAddress, onChange: function (e) { return setContactInfo(__assign(__assign({}, contactInfo), { physicalAddress: e.target.value })); }, rows: 3 })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "mailingAddress" }, "Mailing Address (if different)"),
                                            React.createElement(textarea_1.Textarea, { id: "mailingAddress", value: contactInfo.mailingAddress, onChange: function (e) { return setContactInfo(__assign(__assign({}, contactInfo), { mailingAddress: e.target.value })); }, rows: 3 })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "city" }, "City"),
                                            React.createElement(LocationSelects_1.CitySelect, { value: contactInfo.city, onChange: function (v) { return setContactInfo(__assign(__assign({}, contactInfo), { city: v })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "county" }, "County"),
                                            React.createElement(LocationSelects_1.CountySelect, { value: contactInfo.county, onChange: function (v) { return setContactInfo(__assign(__assign({}, contactInfo), { county: v })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "postalCode" }, "Postal Code"),
                                            React.createElement(input_1.Input, { id: "postalCode", value: contactInfo.postalCode, onChange: function (e) { return setContactInfo(__assign(__assign({}, contactInfo), { postalCode: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "preferredContact" }, "Preferred Contact Method"),
                                            React.createElement(select_1.Select, { value: contactInfo.preferredContact, onValueChange: function (v) { return setContactInfo(__assign(__assign({}, contactInfo), { preferredContact: v })); } },
                                                React.createElement(select_1.SelectTrigger, null,
                                                    React.createElement(select_1.SelectValue, null)),
                                                React.createElement(select_1.SelectContent, null,
                                                    React.createElement(select_1.SelectItem, { value: "email" }, "Email"),
                                                    React.createElement(select_1.SelectItem, { value: "phone" }, "Phone"),
                                                    React.createElement(select_1.SelectItem, { value: "sms" }, "SMS"))))))),
                            React.createElement("div", { className: "flex justify-end" },
                                React.createElement(button_1.Button, { onClick: handleSave },
                                    React.createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }),
                                    "Save Changes"))),
                        React.createElement(tabs_1.TabsContent, { value: "personnel", className: "space-y-6" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("div", null,
                                            React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                                React.createElement(lucide_react_1.Briefcase, { className: "h-5 w-5" }),
                                                "Key Personnel"),
                                            React.createElement(card_1.CardDescription, null, "Directors, partners, and beneficial owners")),
                                        React.createElement(button_1.Button, { onClick: function () { return setPersonnel(__spreadArrays(personnel, [{ name: "", idNumber: "", position: "", shareholding: "" }])); } },
                                            React.createElement(lucide_react_1.User, { className: "mr-2 h-4 w-4" }),
                                            "Add Person"))),
                                React.createElement(card_1.CardContent, null,
                                    React.createElement("div", { className: "space-y-4" }, personnel.map(function (person, index) { return (React.createElement(card_1.Card, { key: person.name || person.idNumber || "person-" + index },
                                        React.createElement(card_1.CardContent, { className: "pt-6" },
                                            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                                                React.createElement("div", { className: "space-y-2" },
                                                    React.createElement(label_1.Label, null, "Full Name"),
                                                    React.createElement(input_1.Input, { value: person.name, onChange: function (e) {
                                                            var updated = __spreadArrays(personnel);
                                                            updated[index].name = e.target.value;
                                                            setPersonnel(updated);
                                                        } })),
                                                React.createElement("div", { className: "space-y-2" },
                                                    React.createElement(label_1.Label, null, "ID Number"),
                                                    React.createElement(input_1.Input, { value: person.idNumber, onChange: function (e) {
                                                            var updated = __spreadArrays(personnel);
                                                            updated[index].idNumber = e.target.value;
                                                            setPersonnel(updated);
                                                        } })),
                                                React.createElement("div", { className: "space-y-2" },
                                                    React.createElement(label_1.Label, null, "Position"),
                                                    React.createElement(input_1.Input, { value: person.position, onChange: function (e) {
                                                            var updated = __spreadArrays(personnel);
                                                            updated[index].position = e.target.value;
                                                            setPersonnel(updated);
                                                        } })),
                                                React.createElement("div", { className: "space-y-2" },
                                                    React.createElement(label_1.Label, null, "Shareholding"),
                                                    React.createElement(input_1.Input, { value: person.shareholding, onChange: function (e) {
                                                            var updated = __spreadArrays(personnel);
                                                            updated[index].shareholding = e.target.value;
                                                            setPersonnel(updated);
                                                        } }))),
                                            React.createElement("div", { className: "flex justify-end gap-2 mt-4" },
                                                React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () {
                                                        var updated = personnel.filter(function (_, i) { return i !== index; });
                                                        setPersonnel(updated);
                                                        sonner_1.toast.success("Personnel record removed");
                                                    } },
                                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }),
                                                    "Remove"))))); }))))),
                        React.createElement(tabs_1.TabsContent, { value: "financial", className: "space-y-6" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                        React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }),
                                        "Financial Information"),
                                    React.createElement(card_1.CardDescription, null, "Banking details and payment terms")),
                                React.createElement(card_1.CardContent, { className: "space-y-4" },
                                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "bankName" }, "Bank Name"),
                                            React.createElement(input_1.Input, { id: "bankName", value: financialInfo.bankName, onChange: function (e) { return setFinancialInfo(__assign(__assign({}, financialInfo), { bankName: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "bankBranch" }, "Bank Branch"),
                                            React.createElement(input_1.Input, { id: "bankBranch", value: financialInfo.bankBranch, onChange: function (e) { return setFinancialInfo(__assign(__assign({}, financialInfo), { bankBranch: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "accountNumber" }, "Account Number"),
                                            React.createElement(input_1.Input, { id: "accountNumber", value: financialInfo.accountNumber, onChange: function (e) { return setFinancialInfo(__assign(__assign({}, financialInfo), { accountNumber: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "accountType" }, "Account Type"),
                                            React.createElement(select_1.Select, { value: financialInfo.accountType, onValueChange: function (v) { return setFinancialInfo(__assign(__assign({}, financialInfo), { accountType: v })); } },
                                                React.createElement(select_1.SelectTrigger, null,
                                                    React.createElement(select_1.SelectValue, null)),
                                                React.createElement(select_1.SelectContent, null,
                                                    React.createElement(select_1.SelectItem, { value: "Current" }, "Current"),
                                                    React.createElement(select_1.SelectItem, { value: "Savings" }, "Savings")))),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "paymentTerms" }, "Payment Terms"),
                                            React.createElement(select_1.Select, { value: financialInfo.paymentTerms, onValueChange: function (v) { return setFinancialInfo(__assign(__assign({}, financialInfo), { paymentTerms: v })); } },
                                                React.createElement(select_1.SelectTrigger, null,
                                                    React.createElement(select_1.SelectValue, null)),
                                                React.createElement(select_1.SelectContent, null,
                                                    React.createElement(select_1.SelectItem, { value: "Net 7" }, "Net 7 Days"),
                                                    React.createElement(select_1.SelectItem, { value: "Net 14" }, "Net 14 Days"),
                                                    React.createElement(select_1.SelectItem, { value: "Net 30" }, "Net 30 Days"),
                                                    React.createElement(select_1.SelectItem, { value: "Net 60" }, "Net 60 Days"),
                                                    React.createElement(select_1.SelectItem, { value: "Due on Receipt" }, "Due on Receipt")))),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "creditLimit" }, "Credit Limit (KES)"),
                                            React.createElement(input_1.Input, { id: "creditLimit", type: "number", value: financialInfo.creditLimit, onChange: function (e) { return setFinancialInfo(__assign(__assign({}, financialInfo), { creditLimit: e.target.value })); } }))))),
                            React.createElement("div", { className: "flex justify-end" },
                                React.createElement(button_1.Button, { onClick: handleSave },
                                    React.createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }),
                                    "Save Changes"))),
                        React.createElement(tabs_1.TabsContent, { value: "risk", className: "space-y-6" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                        React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }),
                                        "Risk Assessment & Compliance"),
                                    React.createElement(card_1.CardDescription, null, "KYC and AML compliance information")),
                                React.createElement(card_1.CardContent, { className: "space-y-4" },
                                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "sourceOfFunds" }, "Source of Funds/Income"),
                                            React.createElement(input_1.Input, { id: "sourceOfFunds", value: riskInfo.sourceOfFunds, onChange: function (e) { return setRiskInfo(__assign(__assign({}, riskInfo), { sourceOfFunds: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "businessPurpose" }, "Purpose of Business Relationship"),
                                            React.createElement(input_1.Input, { id: "businessPurpose", value: riskInfo.businessPurpose, onChange: function (e) { return setRiskInfo(__assign(__assign({}, riskInfo), { businessPurpose: e.target.value })); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "expectedVolume" }, "Expected Transaction Volume"),
                                            React.createElement(select_1.Select, { value: riskInfo.expectedVolume, onValueChange: function (v) { return setRiskInfo(__assign(__assign({}, riskInfo), { expectedVolume: v })); } },
                                                React.createElement(select_1.SelectTrigger, null,
                                                    React.createElement(select_1.SelectValue, null)),
                                                React.createElement(select_1.SelectContent, null,
                                                    React.createElement(select_1.SelectItem, { value: "Low" }, "Low"),
                                                    React.createElement(select_1.SelectItem, { value: "Medium" }, "Medium"),
                                                    React.createElement(select_1.SelectItem, { value: "High" }, "High")))),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "expectedFrequency" }, "Expected Transaction Frequency"),
                                            React.createElement(select_1.Select, { value: riskInfo.expectedFrequency, onValueChange: function (v) { return setRiskInfo(__assign(__assign({}, riskInfo), { expectedFrequency: v })); } },
                                                React.createElement(select_1.SelectTrigger, null,
                                                    React.createElement(select_1.SelectValue, null)),
                                                React.createElement(select_1.SelectContent, null,
                                                    React.createElement(select_1.SelectItem, { value: "Weekly" }, "Weekly"),
                                                    React.createElement(select_1.SelectItem, { value: "Monthly" }, "Monthly"),
                                                    React.createElement(select_1.SelectItem, { value: "Quarterly" }, "Quarterly"),
                                                    React.createElement(select_1.SelectItem, { value: "Annually" }, "Annually")))),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "pepStatus" }, "Politically Exposed Person (PEP)"),
                                            React.createElement(select_1.Select, { value: riskInfo.pepStatus, onValueChange: function (v) { return setRiskInfo(__assign(__assign({}, riskInfo), { pepStatus: v })); } },
                                                React.createElement(select_1.SelectTrigger, null,
                                                    React.createElement(select_1.SelectValue, null)),
                                                React.createElement(select_1.SelectContent, null,
                                                    React.createElement(select_1.SelectItem, { value: "Yes" }, "Yes"),
                                                    React.createElement(select_1.SelectItem, { value: "No" }, "No")))),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "riskRating" }, "Risk Rating"),
                                            React.createElement(select_1.Select, { value: riskInfo.riskRating, onValueChange: function (v) { return setRiskInfo(__assign(__assign({}, riskInfo), { riskRating: v })); } },
                                                React.createElement(select_1.SelectTrigger, null,
                                                    React.createElement(select_1.SelectValue, null)),
                                                React.createElement(select_1.SelectContent, null,
                                                    React.createElement(select_1.SelectItem, { value: "Low" }, "Low"),
                                                    React.createElement(select_1.SelectItem, { value: "Medium" }, "Medium"),
                                                    React.createElement(select_1.SelectItem, { value: "High" }, "High"))))),
                                    React.createElement(separator_1.Separator, null),
                                    React.createElement("div", { className: "space-y-4" },
                                        React.createElement("div", { className: "flex items-center justify-between p-4 border rounded-lg" },
                                            React.createElement("div", { className: "flex items-center gap-3" },
                                                React.createElement(lucide_react_1.Calendar, { className: "h-5 w-5 text-muted-foreground" }),
                                                React.createElement("div", null,
                                                    React.createElement("p", { className: "font-medium" }, "Last KYC Review"),
                                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "January 15, 2024"))),
                                            React.createElement(badge_1.Badge, { variant: "outline", className: "gap-1" },
                                                React.createElement(lucide_react_1.CheckCircle2, { className: "h-3 w-3 text-green-500" }),
                                                "Completed")),
                                        React.createElement("div", { className: "flex items-center justify-between p-4 border rounded-lg" },
                                            React.createElement("div", { className: "flex items-center gap-3" },
                                                React.createElement(lucide_react_1.Calendar, { className: "h-5 w-5 text-muted-foreground" }),
                                                React.createElement("div", null,
                                                    React.createElement("p", { className: "font-medium" }, "Next KYC Review Due"),
                                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "January 15, 2025"))),
                                            React.createElement(badge_1.Badge, { variant: "secondary" }, "Scheduled"))))),
                            React.createElement("div", { className: "flex justify-end" },
                                React.createElement(button_1.Button, { onClick: handleSave },
                                    React.createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }),
                                    "Save Changes"))),
                        React.createElement(tabs_1.TabsContent, { value: "documents", className: "space-y-6" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                        React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }),
                                        "Required Documents"),
                                    React.createElement(card_1.CardDescription, null, "Upload and manage client documentation")),
                                React.createElement(card_1.CardContent, { className: "space-y-4" },
                                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2" }, [
                                        "Certificate of Incorporation",
                                        "CR12 (Certificate of Registration)",
                                        "KRA PIN Certificate",
                                        "Tax Compliance Certificate",
                                        "Bank Statement (Last 3 months)",
                                        "Trade License",
                                        "ID/Passport Copies (Directors)",
                                        "Proof of Address",
                                    ].map(function (doc) { return (React.createElement("div", { key: doc, className: "flex items-center justify-between p-4 border rounded-lg" },
                                        React.createElement("div", { className: "flex items-center gap-3" },
                                            React.createElement(lucide_react_1.FileText, { className: "h-5 w-5 text-muted-foreground" }),
                                            React.createElement("div", null,
                                                React.createElement("p", { className: "font-medium" }, doc),
                                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Not uploaded"))),
                                        React.createElement(button_1.Button, { variant: "outline", size: "sm" },
                                            React.createElement(lucide_react_1.Upload, { className: "mr-2 h-3 w-3" }),
                                            "Upload"))); }))))),
                        React.createElement(tabs_1.TabsContent, { value: "projects", className: "space-y-6" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                        React.createElement(lucide_react_1.Briefcase, { className: "h-5 w-5" }),
                                        "Projects (",
                                        clientProjects.length,
                                        ")")),
                                React.createElement(card_1.CardContent, null, clientProjects.length === 0 ? (React.createElement("p", { className: "text-sm text-muted-foreground text-center py-8" }, "No projects found for this client.")) : (React.createElement("div", { className: "space-y-3" }, clientProjects.map(function (project) { return (React.createElement("div", { key: project.id, className: "flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer", onClick: function () { return setLocation("/projects/" + project.id); } },
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "font-medium" }, project.name || project.title),
                                        React.createElement("p", { className: "text-xs text-muted-foreground" },
                                            project.status && React.createElement(badge_1.Badge, { variant: "outline", className: "mr-2 text-xs" }, project.status),
                                            project.startDate && "Started " + new Date(project.startDate).toLocaleDateString())),
                                    React.createElement(lucide_react_1.ExternalLink, { className: "h-4 w-4 text-muted-foreground" }))); })))))),
                        React.createElement(tabs_1.TabsContent, { value: "invoices", className: "space-y-6" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                        React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }),
                                        "Invoices (",
                                        clientInvoices.length,
                                        ")")),
                                React.createElement(card_1.CardContent, null, clientInvoices.length === 0 ? (React.createElement("p", { className: "text-sm text-muted-foreground text-center py-8" }, "No invoices found for this client.")) : (React.createElement("div", { className: "space-y-3" }, clientInvoices.map(function (inv) { return (React.createElement("div", { key: inv.id, className: "flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer", onClick: function () { return setLocation("/invoices/" + inv.id); } },
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "font-medium" }, inv.invoiceNumber),
                                        React.createElement("p", { className: "text-xs text-muted-foreground" },
                                            React.createElement(badge_1.Badge, { variant: inv.status === "paid" ? "default" : "outline", className: "mr-2 text-xs" }, inv.status),
                                            "Due ",
                                            inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—")),
                                    React.createElement("div", { className: "text-right" },
                                        React.createElement("p", { className: "font-semibold text-sm" }, (inv.total || 0).toLocaleString()),
                                        React.createElement(lucide_react_1.ExternalLink, { className: "h-3 w-3 text-muted-foreground inline" })))); }))))))))))));
}
exports["default"] = ClientDetails;
