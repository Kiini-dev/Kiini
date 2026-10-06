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
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var card_1 = require("@/components/ui/card");
var switch_1 = require("@/components/ui/switch");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var spinner_1 = require("@/components/ui/spinner");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var LocationSelects_1 = require("@/components/LocationSelects");
function CreateContact() {
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var search = wouter_1.useSearch();
    var params = new URLSearchParams(search);
    var presetClientId = params.get("clientId") || "";
    var _b = react_1.useState({
        salutation: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        mobile: "",
        jobTitle: "",
        department: "",
        address: "",
        city: "",
        country: "",
        postalCode: "",
        linkedIn: "",
        notes: "",
        isPrimary: false,
        clientId: presetClientId
    }), formData = _b[0], setFormData = _b[1];
    var _c = trpc_1.trpc.clients.list.useQuery({}).data, clients = _c === void 0 ? [] : _c;
    var createMutation = trpc_1.trpc.contacts.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Contact created successfully!");
            setLocation("/contacts");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create contact: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName) {
            sonner_1.toast.error("First name and last name are required");
            return;
        }
        createMutation.mutate(__assign(__assign({}, formData), { clientId: formData.clientId || undefined, salutation: formData.salutation || undefined, email: formData.email || undefined, phone: formData.phone || undefined, mobile: formData.mobile || undefined, jobTitle: formData.jobTitle || undefined, department: formData.department || undefined, address: formData.address || undefined, city: formData.city || undefined, country: formData.country || undefined, postalCode: formData.postalCode || undefined, linkedIn: formData.linkedIn || undefined, notes: formData.notes || undefined }));
    };
    var update = function (field, value) {
        return setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Create Contact", icon: React.createElement(lucide_react_1.UserPlus, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Contacts", href: "/contacts" },
            { label: "Create Contact" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/contacts"); } }, "Cancel"),
            React.createElement(button_1.Button, { onClick: handleSubmit, disabled: createMutation.isPending },
                createMutation.isPending ? React.createElement(spinner_1.Spinner, { className: "mr-2 h-4 w-4" }) : null,
                "Create Contact")) },
        React.createElement("form", { onSubmit: handleSubmit, className: "max-w-3xl space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Contact Information")),
                React.createElement(card_1.CardContent, { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "salutation" }, "Salutation"),
                        React.createElement(select_1.Select, { value: formData.salutation, onValueChange: function (v) { return update("salutation", v); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "Mr" }, "Mr"),
                                React.createElement(select_1.SelectItem, { value: "Mrs" }, "Mrs"),
                                React.createElement(select_1.SelectItem, { value: "Ms" }, "Ms"),
                                React.createElement(select_1.SelectItem, { value: "Dr" }, "Dr"),
                                React.createElement(select_1.SelectItem, { value: "Eng" }, "Eng"),
                                React.createElement(select_1.SelectItem, { value: "Prof" }, "Prof")))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "firstName" }, "First Name *"),
                        React.createElement(input_1.Input, { id: "firstName", value: formData.firstName, onChange: function (e) { return update("firstName", e.target.value); }, required: true })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "lastName" }, "Last Name *"),
                        React.createElement(input_1.Input, { id: "lastName", value: formData.lastName, onChange: function (e) { return update("lastName", e.target.value); }, required: true })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "email" }, "Email"),
                        React.createElement(input_1.Input, { id: "email", type: "email", value: formData.email, onChange: function (e) { return update("email", e.target.value); } })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "phone" }, "Phone"),
                        React.createElement(input_1.Input, { id: "phone", value: formData.phone, onChange: function (e) { return update("phone", e.target.value); } })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "mobile" }, "Mobile"),
                        React.createElement(input_1.Input, { id: "mobile", value: formData.mobile, onChange: function (e) { return update("mobile", e.target.value); } })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "jobTitle" }, "Job Title"),
                        React.createElement(input_1.Input, { id: "jobTitle", value: formData.jobTitle, onChange: function (e) { return update("jobTitle", e.target.value); } })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "department" }, "Department"),
                        React.createElement(input_1.Input, { id: "department", value: formData.department, onChange: function (e) { return update("department", e.target.value); } })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "clientId" }, "Associated Client"),
                        React.createElement("select", { id: "clientId", className: "w-full rounded-md border bg-background px-3 py-2 text-sm", value: formData.clientId, onChange: function (e) { return update("clientId", e.target.value); } },
                            React.createElement("option", { value: "" }, "-- No client --"),
                            clients.map(function (c) { return (React.createElement("option", { key: c.id, value: c.id }, c.companyName || c.firstName + " " + c.lastName)); }))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Address")),
                React.createElement(card_1.CardContent, { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement("div", { className: "md:col-span-2" },
                        React.createElement(label_1.Label, { htmlFor: "address" }, "Address"),
                        React.createElement(input_1.Input, { id: "address", value: formData.address, onChange: function (e) { return update("address", e.target.value); } })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "city" }, "City"),
                        React.createElement(LocationSelects_1.CitySelect, { value: formData.city, onChange: function (v) { return update("city", v); } })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "country" }, "Country"),
                        React.createElement(LocationSelects_1.CountrySelect, { value: formData.country, onChange: function (v) { return update("country", v); } })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "postalCode" }, "Postal Code"),
                        React.createElement(input_1.Input, { id: "postalCode", value: formData.postalCode, onChange: function (e) { return update("postalCode", e.target.value); } })))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Additional")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "linkedIn" }, "LinkedIn URL"),
                        React.createElement(input_1.Input, { id: "linkedIn", value: formData.linkedIn, onChange: function (e) { return update("linkedIn", e.target.value); }, placeholder: "https://linkedin.com/in/..." })),
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(switch_1.Switch, { checked: formData.isPrimary, onCheckedChange: function (v) { return update("isPrimary", v); } }),
                        React.createElement(label_1.Label, null, "Primary Contact")),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                        React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.notes, onChange: function (html) { return update("notes", html); }, minHeight: "100px" })))))));
}
exports["default"] = CreateContact;
