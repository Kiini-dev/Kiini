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
exports.__esModule = true;
exports.ClientForm = void 0;
var react_1 = require("react");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var checkbox_1 = require("@/components/ui/checkbox");
var select_1 = require("@/components/ui/select");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var PhoneInput_1 = require("@/components/PhoneInput");
var LocationSelects_1 = require("@/components/LocationSelects");
var separator_1 = require("@/components/ui/separator");
var PAYMENT_TERMS = [
    "Due on Receipt",
    "Net 7",
    "Net 14",
    "Net 30",
    "Net 45",
    "Net 60",
    "Net 90",
];
var LEAD_SOURCES = [
    { value: "referral", label: "Referral" },
    { value: "website", label: "Website" },
    { value: "social_media", label: "Social Media" },
    { value: "cold_call", label: "Cold Call" },
    { value: "trade_show", label: "Trade Show" },
    { value: "advertisement", label: "Advertisement" },
    { value: "tender", label: "Tender" },
    { value: "existing_client", label: "Existing Client" },
    { value: "other", label: "Other" },
];
var CURRENCY_OPTIONS = [
    { value: "KES", label: "KES - Kenya Shilling" },
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "TZS", label: "TZS - Tanzania Shilling" },
    { value: "UGX", label: "UGX - Uganda Shilling" },
];
var STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "prospect", label: "Prospect" },
    { value: "inactive", label: "Inactive" },
    { value: "archived", label: "Archived" },
];
function ClientForm(_a) {
    var formData = _a.formData, setFormData = _a.setFormData, _b = _a.teamMembers, teamMembers = _b === void 0 ? [] : _b, _c = _a.showPortalLogin, showPortalLogin = _c === void 0 ? false : _c, _d = _a.showCreateClientLogin, showCreateClientLogin = _d === void 0 ? false : _d;
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "companyName" }, "Company Name"),
                react_1["default"].createElement(input_1.Input, { id: "companyName", value: formData.companyName, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { companyName: e.target.value })); }, placeholder: "Acme Corporation" })),
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "contactPerson" }, "Contact Person"),
                react_1["default"].createElement(input_1.Input, { id: "contactPerson", value: formData.contactPerson, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { contactPerson: e.target.value })); }, placeholder: "John Doe" }))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "email" }, "Email"),
                react_1["default"].createElement(input_1.Input, { id: "email", type: "email", value: formData.email, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { email: e.target.value })); }, placeholder: "info@company.com" })),
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "phone" }, "Phone"),
                react_1["default"].createElement(PhoneInput_1.PhoneInput, { id: "phone", value: formData.phone, onChange: function (value) { return setFormData(__assign(__assign({}, formData), { phone: value })); }, placeholder: "0700 000 000" }))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "secondaryPhone" }, "Secondary Phone"),
                react_1["default"].createElement(PhoneInput_1.PhoneInput, { id: "secondaryPhone", value: formData.secondaryPhone, onChange: function (value) { return setFormData(__assign(__assign({}, formData), { secondaryPhone: value })); }, placeholder: "0711 000 000" })),
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "website" }, "Website"),
                react_1["default"].createElement(input_1.Input, { id: "website", value: formData.website, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { website: e.target.value })); }, placeholder: "https://www.company.com" }))),
        react_1["default"].createElement("div", { className: "space-y-2" },
            react_1["default"].createElement(label_1.Label, { htmlFor: "address" }, "Address"),
            react_1["default"].createElement(textarea_1.Textarea, { id: "address", value: formData.address, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { address: e.target.value })); }, placeholder: "123 Business Ave, Suite 100", rows: 2 })),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "city" }, "City / Town"),
                react_1["default"].createElement(LocationSelects_1.CitySelect, { value: formData.city, onChange: function (value) { return setFormData(__assign(__assign({}, formData), { city: value })); } })),
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "country" }, "Country"),
                react_1["default"].createElement(LocationSelects_1.CountrySelect, { value: formData.country, onChange: function (value) { return setFormData(__assign(__assign({}, formData), { country: value })); } })),
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "postalCode" }, "Postal / ZIP Code"),
                react_1["default"].createElement(input_1.Input, { id: "postalCode", value: formData.postalCode, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { postalCode: e.target.value })); }, placeholder: "00100" }))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "taxId" }, "Tax ID / KRA PIN"),
                react_1["default"].createElement(input_1.Input, { id: "taxId", value: formData.taxId, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { taxId: e.target.value })); }, placeholder: "A123456789X" })),
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "industry" }, "Industry"),
                react_1["default"].createElement(LocationSelects_1.IndustrySelect, { value: formData.industry, onChange: function (value) { return setFormData(__assign(__assign({}, formData), { industry: value })); } }))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "businessType" }, "Business Type"),
                react_1["default"].createElement(input_1.Input, { id: "businessType", value: formData.businessType, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { businessType: e.target.value })); }, placeholder: "e.g. Limited Company" })),
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "registrationNumber" }, "Registration Number"),
                react_1["default"].createElement(input_1.Input, { id: "registrationNumber", value: formData.registrationNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { registrationNumber: e.target.value })); }, placeholder: "PVT-12345678" }))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "yearEstablished" }, "Year Established"),
                react_1["default"].createElement(input_1.Input, { id: "yearEstablished", type: "number", min: "1900", max: new Date().getFullYear(), value: formData.yearEstablished, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { yearEstablished: e.target.value })); }, placeholder: "2010" })),
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "numberOfEmployees" }, "Number of Employees"),
                react_1["default"].createElement(input_1.Input, { id: "numberOfEmployees", value: formData.numberOfEmployees, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { numberOfEmployees: e.target.value })); }, placeholder: "e.g. 50" })),
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "businessLicense" }, "Business License / Permit Number"),
                react_1["default"].createElement(input_1.Input, { id: "businessLicense", value: formData.businessLicense, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { businessLicense: e.target.value })); }, placeholder: "BL-2024-XXXX" }))),
        react_1["default"].createElement("div", { className: "space-y-2" },
            react_1["default"].createElement(label_1.Label, { htmlFor: "paymentTerms" }, "Default Payment Terms"),
            react_1["default"].createElement(select_1.Select, { value: formData.paymentTerms, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { paymentTerms: value })); } },
                react_1["default"].createElement(select_1.SelectTrigger, null,
                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select payment terms" })),
                react_1["default"].createElement(select_1.SelectContent, null, PAYMENT_TERMS.map(function (term) { return (react_1["default"].createElement(select_1.SelectItem, { key: term, value: term }, term)); })))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "creditLimit" }, "Credit Limit"),
                react_1["default"].createElement(input_1.Input, { id: "creditLimit", type: "number", value: formData.creditLimit, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { creditLimit: e.target.value })); }, placeholder: "100000", min: "0", step: "0.01" })),
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "currency" }, "Currency"),
                react_1["default"].createElement(select_1.Select, { value: formData.currency, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { currency: value })); } },
                    react_1["default"].createElement(select_1.SelectTrigger, null,
                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select currency" })),
                    react_1["default"].createElement(select_1.SelectContent, null, CURRENCY_OPTIONS.map(function (currency) { return (react_1["default"].createElement(select_1.SelectItem, { key: currency.value, value: currency.value }, currency.label)); }))))),
        react_1["default"].createElement(separator_1.Separator, null),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "bankName" }, "Bank Name"),
                react_1["default"].createElement(input_1.Input, { id: "bankName", value: formData.bankName, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { bankName: e.target.value })); }, placeholder: "Equity Bank" })),
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "bankCode" }, "Bank Code"),
                react_1["default"].createElement(input_1.Input, { id: "bankCode", value: formData.bankCode, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { bankCode: e.target.value })); }, placeholder: "068" })),
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "branch" }, "Branch"),
                react_1["default"].createElement(input_1.Input, { id: "branch", value: formData.branch, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { branch: e.target.value })); }, placeholder: "Westlands Branch" }))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "bankAccountNumber" }, "Bank Account Number"),
                react_1["default"].createElement(input_1.Input, { id: "bankAccountNumber", value: formData.bankAccountNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { bankAccountNumber: e.target.value })); }, placeholder: "0123456789" }))),
        react_1["default"].createElement(separator_1.Separator, null),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                react_1["default"].createElement(select_1.Select, { value: formData.status, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { status: value })); } },
                    react_1["default"].createElement(select_1.SelectTrigger, null,
                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select status" })),
                    react_1["default"].createElement(select_1.SelectContent, null, STATUS_OPTIONS.map(function (option) { return (react_1["default"].createElement(select_1.SelectItem, { key: option.value, value: option.value }, option.label)); })))),
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "leadSource" }, "Lead Source"),
                react_1["default"].createElement(select_1.Select, { value: formData.leadSource, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { leadSource: value })); } },
                    react_1["default"].createElement(select_1.SelectTrigger, null,
                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select lead source" })),
                    react_1["default"].createElement(select_1.SelectContent, null, LEAD_SOURCES.map(function (source) { return (react_1["default"].createElement(select_1.SelectItem, { key: source.value, value: source.value }, source.label)); })))),
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "assignedTo" }, "Assigned To (Account Manager)"),
                react_1["default"].createElement(select_1.Select, { value: formData.assignedTo, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { assignedTo: value })); } },
                    react_1["default"].createElement(select_1.SelectTrigger, null,
                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select team member" })),
                    react_1["default"].createElement(select_1.SelectContent, { className: "max-h-56 overflow-y-auto" },
                        react_1["default"].createElement(select_1.SelectItem, { value: "" }, "\u2014 Unassigned \u2014"),
                        teamMembers.map(function (member) { return (react_1["default"].createElement(select_1.SelectItem, { key: member.id, value: member.id }, member.name || member.email || member.id)); }))))),
        react_1["default"].createElement("div", { className: "space-y-2" },
            react_1["default"].createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
            react_1["default"].createElement(RichTextEditor_1.RichTextEditor, { id: "notes", value: formData.notes, onChange: function (value) { return setFormData(__assign(__assign({}, formData), { notes: value })); }, placeholder: "Additional notes about this client", minHeight: "120px" })),
        showCreateClientLogin && (react_1["default"].createElement("div", { className: "space-y-4 pt-4 border-t" },
            react_1["default"].createElement("div", { className: "flex items-start gap-3" },
                react_1["default"].createElement(checkbox_1.Checkbox, { id: "createClientLogin", checked: !!formData.createClientLogin, onCheckedChange: function (checked) { return setFormData(__assign(__assign({}, formData), { createClientLogin: !!checked })); } }),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(label_1.Label, { htmlFor: "createClientLogin", className: "cursor-pointer" }, "Create client portal login for this client"),
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "Create a portal account so the client can log in and view invoices, projects, and documents."))),
            formData.createClientLogin && (react_1["default"].createElement("div", { className: "space-y-2 pl-10" },
                react_1["default"].createElement(label_1.Label, { htmlFor: "clientPassword" }, "Portal Password"),
                react_1["default"].createElement(input_1.Input, { id: "clientPassword", type: "password", value: formData.clientPassword || "", onChange: function (e) { return setFormData(__assign(__assign({}, formData), { clientPassword: e.target.value })); }, placeholder: "Leave blank to auto-generate" })))))));
}
exports.ClientForm = ClientForm;
