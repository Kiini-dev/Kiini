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
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var PhoneInput_1 = require("@/components/PhoneInput");
var LocationSelects_1 = require("@/components/LocationSelects");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
function OrgCreateClient() {
    var _this = this;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = useOrgPermission_1.useOrgPermission(), checkPermission = _b.checkPermission, hasPermission = _b.hasPermission;
    var _c = react_1.useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        industry: "",
        country: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        website: "",
        notes: "",
        status: "active"
    }), form = _c[0], setForm = _c[1];
    var _d = react_1.useState(false), isSubmitting = _d[0], setIsSubmitting = _d[1];
    var createMutation = trpc_1.trpc.clients.create.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("Client created", { description: data.name + " has been added successfully." });
            setLocation("/org/" + slug + "/clients/" + data.id);
        },
        onError: function (err) {
            sonner_1.toast.error("Failed to create client", { description: err.message });
            setIsSubmitting(false);
        }
    });
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            if (!checkPermission("org:clients:create", "create clients")) {
                return [2 /*return*/];
            }
            if (!form.name || !form.email) {
                sonner_1.toast.error("Missing required fields", { description: "Name and email are required." });
                return [2 /*return*/];
            }
            setIsSubmitting(true);
            createMutation.mutate({
                name: form.name,
                email: form.email,
                phone: form.phone || undefined,
                company: form.company || undefined,
                industry: form.industry || undefined,
                country: form.country || undefined,
                address: form.address || undefined,
                city: form.city || undefined,
                state: form.state || undefined,
                zip: form.zip || undefined,
                website: form.website || undefined,
                notes: form.notes || undefined,
                status: form.status
            });
            return [2 /*return*/];
        });
    }); };
    if (!hasPermission("org:clients:create")) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Create Client", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "space-y-6" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: "Clients", href: "/org/" + slug + "/crm" }, { label: "Create Client" }] }),
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                        " Back")),
                react_1["default"].createElement("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-10 text-center" },
                    react_1["default"].createElement(lucide_react_1.Building2, { className: "mx-auto h-12 w-12 text-white/30" }),
                    react_1["default"].createElement("h2", { className: "mt-5 text-xl font-semibold text-white" }, "Access Denied"),
                    react_1["default"].createElement("p", { className: "mt-2 text-sm text-white/60" }, "You do not have permission to create clients.")))));
    }
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Create Client", showOrgInfo: false },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                            { label: "Clients", href: "/org/" + slug + "/crm" },
                            { label: "Create Client" },
                        ] })),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/crm"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                    " Back")),
            react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Building2, { className: "h-5 w-5" }),
                        "New Client"),
                    react_1["default"].createElement(card_1.CardDescription, null, "Add a new client to your organization")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        react_1["default"].createElement("div", { className: "grid gap-4 sm:grid-cols-2" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "name" }, "Client Name *"),
                                react_1["default"].createElement(input_1.Input, { id: "name", placeholder: "Acme Corporation", value: form.name, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { name: e.target.value })); }); }, required: true })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "email" }, "Email Address *"),
                                react_1["default"].createElement(input_1.Input, { id: "email", type: "email", placeholder: "contact@acme.com", value: form.email, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { email: e.target.value })); }); }, required: true }))),
                        react_1["default"].createElement("div", { className: "grid gap-4 sm:grid-cols-2" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "phone" }, "Phone Number"),
                                react_1["default"].createElement(PhoneInput_1.PhoneInput, { value: form.phone, onChange: function (phone) { return setForm(function (f) { return (__assign(__assign({}, f), { phone: phone })); }); } })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "company" }, "Company Name"),
                                react_1["default"].createElement(input_1.Input, { id: "company", placeholder: "Company Name", value: form.company, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { company: e.target.value })); }); } }))),
                        react_1["default"].createElement("div", { className: "grid gap-4 sm:grid-cols-2" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, null, "Industry"),
                                react_1["default"].createElement(LocationSelects_1.IndustrySelect, { value: form.industry, onChange: function (industry) { return setForm(function (f) { return (__assign(__assign({}, f), { industry: industry })); }); } })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, null, "Country"),
                                react_1["default"].createElement(LocationSelects_1.CountrySelect, { value: form.country, onChange: function (country) { return setForm(function (f) { return (__assign(__assign({}, f), { country: country })); }); } }))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "address" }, "Address"),
                            react_1["default"].createElement(input_1.Input, { id: "address", placeholder: "Street address", value: form.address, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { address: e.target.value })); }); } })),
                        react_1["default"].createElement("div", { className: "grid gap-4 sm:grid-cols-3" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "city" }, "City"),
                                react_1["default"].createElement(input_1.Input, { id: "city", placeholder: "City", value: form.city, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { city: e.target.value })); }); } })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "state" }, "State/Region"),
                                react_1["default"].createElement(input_1.Input, { id: "state", placeholder: "State", value: form.state, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { state: e.target.value })); }); } })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "zip" }, "ZIP/Postal Code"),
                                react_1["default"].createElement(input_1.Input, { id: "zip", placeholder: "ZIP Code", value: form.zip, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { zip: e.target.value })); }); } }))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "website" }, "Website"),
                            react_1["default"].createElement(input_1.Input, { id: "website", type: "url", placeholder: "https://acme.com", value: form.website, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { website: e.target.value })); }); } })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                            react_1["default"].createElement(select_1.Select, { value: form.status, onValueChange: function (status) { return setForm(function (f) { return (__assign(__assign({}, f), { status: status })); }); } },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: "active" }, "Active"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "inactive" }, "Inactive"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "prospect" }, "Prospect"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "archived" }, "Archived")))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                            react_1["default"].createElement(textarea_1.Textarea, { id: "notes", placeholder: "Additional notes about this client...", value: form.notes, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { notes: e.target.value })); }); }, rows: 4 })),
                        react_1["default"].createElement("div", { className: "flex gap-2 pt-4" },
                            react_1["default"].createElement(button_1.Button, { type: "submit", disabled: isSubmitting || !form.name || !form.email, className: "bg-blue-600 hover:bg-blue-700" }, isSubmitting ? "Creating..." : "Create Client"),
                            react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setLocation("/org/" + slug + "/crm"); } }, "Cancel"))))))));
}
exports["default"] = OrgCreateClient;
