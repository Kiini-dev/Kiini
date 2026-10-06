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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.SupplierForm = void 0;
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var PhoneInput_1 = require("@/components/PhoneInput");
var FormField_1 = require("@/components/FormField");
var LocationSelects_1 = require("@/components/LocationSelects");
function SupplierForm(_a) {
    var formData = _a.formData, setFormData = _a.setFormData, teamMembers = _a.teamMembers, _b = _a.errors, errors = _b === void 0 ? {} : _b;
    var handleInputChange = function (field, value) {
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    var PAYMENT_METHODS = ["bank_transfer", "cheque", "mpesa", "cash", "credit_card", "letter_of_credit"];
    var SUPPLY_CATEGORIES = ["office_supplies", "it_equipment", "furniture", "stationery", "cleaning", "security", "catering", "transport", "construction", "electrical", "plumbing", "consulting", "legal", "marketing", "printing"];
    var CERTIFICATIONS = ["ISO_9001", "ISO_14001", "ISO_45001", "AGPO", "NCA", "KEBS", "NEMA", "tax_compliant"];
    return (React.createElement(React.Fragment, null,
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Basic Information")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement(FormField_1.FormField, { label: "Company Name", required: true, error: errors.companyName },
                    React.createElement(FormField_1.FormTextInput, { placeholder: "Enter company name", value: formData.companyName, onChange: function (e) { return handleInputChange("companyName", e.target.value); } })),
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement(FormField_1.FormField, { label: "Contact Person", error: errors.contactPerson },
                        React.createElement(FormField_1.FormTextInput, { placeholder: "Full name", value: formData.contactPerson, onChange: function (e) { return handleInputChange("contactPerson", e.target.value); } })),
                    React.createElement(FormField_1.FormField, { label: "Contact Title", error: errors.contactTitle },
                        React.createElement(FormField_1.FormSelect, { value: formData.contactTitle, onValueChange: function (value) { return handleInputChange("contactTitle", value); } },
                            React.createElement("option", { value: "" }, "Select title..."),
                            React.createElement("option", { value: "Mr" }, "Mr"),
                            React.createElement("option", { value: "Mrs" }, "Mrs"),
                            React.createElement("option", { value: "Ms" }, "Ms"),
                            React.createElement("option", { value: "Dr" }, "Dr"),
                            React.createElement("option", { value: "Eng" }, "Eng"),
                            React.createElement("option", { value: "Prof" }, "Prof")))),
                React.createElement(FormField_1.FormField, { label: "Website", error: errors.website },
                    React.createElement(FormField_1.FormTextInput, { placeholder: "https://example.com", value: formData.website, onChange: function (e) { return handleInputChange("website", e.target.value); } })),
                React.createElement(FormField_1.FormField, { label: "Address", error: errors.address },
                    React.createElement(FormField_1.FormTextarea, { placeholder: "Street address", value: formData.address, onChange: function (e) { return handleInputChange("address", e.target.value); } })),
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement(FormField_1.FormField, { label: "City", error: errors.city },
                        React.createElement(LocationSelects_1.CitySelect, { value: formData.city, onChange: function (v) { return handleInputChange("city", v); } })),
                    React.createElement(FormField_1.FormField, { label: "Country", error: errors.country },
                        React.createElement(LocationSelects_1.CountrySelect, { value: formData.country, onChange: function (v) { return handleInputChange("country", v); } })),
                    React.createElement(FormField_1.FormField, { label: "Industry", error: errors.industry },
                        React.createElement(LocationSelects_1.IndustrySelect, { value: formData.industry, onChange: function (v) { return handleInputChange("industry", v); } })),
                    React.createElement(FormField_1.FormField, { label: "Postal Code", error: errors.postalCode },
                        React.createElement(FormField_1.FormTextInput, { placeholder: "Postal code", value: formData.postalCode, onChange: function (e) { return handleInputChange("postalCode", e.target.value); } }))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Contact Information")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement(FormField_1.FormField, { label: "Email", error: errors.email },
                        React.createElement(FormField_1.FormTextInput, { type: "email", placeholder: "supplier@company.com", value: formData.email, onChange: function (e) { return handleInputChange("email", e.target.value); } })),
                    React.createElement(FormField_1.FormField, { label: "Phone", error: errors.phone },
                        React.createElement(PhoneInput_1.PhoneInput, { id: "supplier-phone", value: formData.phone, onChange: function (value) { return handleInputChange("phone", value); }, placeholder: "Enter phone number" }))),
                React.createElement(FormField_1.FormField, { label: "Alternate Phone", error: errors.alternatePhone },
                    React.createElement(PhoneInput_1.PhoneInput, { id: "supplier-alternate-phone", value: formData.alternatePhone, onChange: function (value) { return handleInputChange("alternatePhone", value); }, placeholder: "Enter alternate phone" })))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Tax & Banking Information")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement(FormField_1.FormField, { label: "Tax ID", error: errors.taxId },
                        React.createElement(FormField_1.FormTextInput, { placeholder: "Tax ID number", value: formData.taxId, onChange: function (e) { return handleInputChange("taxId", e.target.value); } })),
                    React.createElement(FormField_1.FormField, { label: "Registration Number", error: errors.registrationNumber },
                        React.createElement(FormField_1.FormTextInput, { placeholder: "Company registration number", value: formData.registrationNumber, onChange: function (e) { return handleInputChange("registrationNumber", e.target.value); } }))),
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement(FormField_1.FormField, { label: "Bank Name", error: errors.bankName },
                        React.createElement(FormField_1.FormTextInput, { placeholder: "Bank name", value: formData.bankName, onChange: function (e) { return handleInputChange("bankName", e.target.value); } })),
                    React.createElement(FormField_1.FormField, { label: "Bank Branch", error: errors.bankBranch },
                        React.createElement(FormField_1.FormTextInput, { placeholder: "Branch name/code", value: formData.bankBranch, onChange: function (e) { return handleInputChange("bankBranch", e.target.value); } }))),
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement(FormField_1.FormField, { label: "Account Number", error: errors.accountNumber },
                        React.createElement(FormField_1.FormTextInput, { placeholder: "Bank account number", value: formData.accountNumber, onChange: function (e) { return handleInputChange("accountNumber", e.target.value); } })),
                    React.createElement(FormField_1.FormField, { label: "Account Name", error: errors.accountName },
                        React.createElement(FormField_1.FormTextInput, { placeholder: "Account holder name", value: formData.accountName, onChange: function (e) { return handleInputChange("accountName", e.target.value); } }))),
                React.createElement(FormField_1.FormField, { label: "Payment Terms", error: errors.paymentTerms },
                    React.createElement(FormField_1.FormTextInput, { placeholder: "e.g., Net 30 days", value: formData.paymentTerms, onChange: function (e) { return handleInputChange("paymentTerms", e.target.value); } })))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Supplier Status & Classification")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement(FormField_1.FormField, { label: "Qualification Status", error: errors.qualificationStatus },
                        React.createElement(FormField_1.FormSelect, { value: formData.qualificationStatus, onValueChange: function (value) { return handleInputChange("qualificationStatus", value); } },
                            React.createElement("option", { value: "pending" }, "Pending"),
                            React.createElement("option", { value: "pre_qualified" }, "Pre-Qualified"),
                            React.createElement("option", { value: "qualified" }, "Qualified"),
                            React.createElement("option", { value: "rejected" }, "Rejected"),
                            React.createElement("option", { value: "inactive" }, "Inactive"))),
                    React.createElement(FormField_1.FormField, { label: "Qualification Date", error: errors.qualificationDate },
                        React.createElement(FormField_1.FormTextInput, { type: "date", value: formData.qualificationDate, onChange: function (e) { return handleInputChange("qualificationDate", e.target.value); } }))),
                React.createElement(FormField_1.FormField, { label: "Payment Methods", error: errors.paymentMethods },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement("div", { className: "flex flex-wrap gap-2" }, PAYMENT_METHODS.map(function (method) { return (React.createElement(badge_1.Badge, { key: method, variant: formData.paymentMethods.includes(method) ? "default" : "outline", className: "cursor-pointer capitalize", onClick: function () {
                                handleInputChange("paymentMethods", formData.paymentMethods.includes(method)
                                    ? formData.paymentMethods.filter(function (m) { return m !== method; })
                                    : __spreadArrays(formData.paymentMethods, [method]));
                            } }, method.replace(/_/g, " "))); })))),
                React.createElement(FormField_1.FormField, { label: "Supply Categories", error: errors.categories },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement("div", { className: "flex flex-wrap gap-2" }, SUPPLY_CATEGORIES.map(function (cat) { return (React.createElement(badge_1.Badge, { key: cat, variant: formData.categories.includes(cat) ? "default" : "outline", className: "cursor-pointer capitalize", onClick: function () {
                                handleInputChange("categories", formData.categories.includes(cat)
                                    ? formData.categories.filter(function (c) { return c !== cat; })
                                    : __spreadArrays(formData.categories, [cat]));
                            } }, cat.replace(/_/g, " "))); })))),
                React.createElement(FormField_1.FormField, { label: "Certifications", error: errors.certifications },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement("div", { className: "flex flex-wrap gap-2" }, CERTIFICATIONS.map(function (cert) { return (React.createElement(badge_1.Badge, { key: cert, variant: formData.certifications.includes(cert) ? "default" : "outline", className: "cursor-pointer capitalize", onClick: function () {
                                handleInputChange("certifications", formData.certifications.includes(cert)
                                    ? formData.certifications.filter(function (c) { return c !== cert; })
                                    : __spreadArrays(formData.certifications, [cert]));
                            } }, cert.replace(/_/g, " "))); })))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Account Management")),
            React.createElement(card_1.CardContent, null,
                React.createElement(FormField_1.FormField, { label: "Account Manager", error: errors.accountManagerId },
                    React.createElement(FormField_1.FormSelect, { value: formData.accountManagerId, onValueChange: function (value) { return handleInputChange("accountManagerId", value); } },
                        React.createElement("option", { value: "" }, "\u2014 Unassigned \u2014"),
                        teamMembers.map(function (u) { return (React.createElement("option", { key: u.id, value: u.id }, u.name || u.email)); }))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Additional Notes")),
            React.createElement(card_1.CardContent, null,
                React.createElement(FormField_1.FormField, { label: "Notes", error: errors.notes },
                    React.createElement(FormField_1.FormTextarea, { placeholder: "Additional notes about this supplier...", value: formData.notes, onChange: function (e) { return handleInputChange("notes", e.target.value); }, rows: 4 }))))));
}
exports.SupplierForm = SupplierForm;
