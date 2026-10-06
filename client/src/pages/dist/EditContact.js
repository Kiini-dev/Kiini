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
var select_1 = require("@/components/ui/select");
var LocationSelects_1 = require("@/components/LocationSelects");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var spinner_1 = require("@/components/ui/spinner");
var lucide_react_1 = require("lucide-react");
function EditContact() {
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState({
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
        notes: "",
        isPrimary: false,
        clientId: "",
        salutation: "",
        postalCode: "",
        linkedIn: ""
    }), formData = _b[0], setFormData = _b[1];
    var _c = trpc_1.trpc.contacts.getById.useQuery(id || "", { enabled: !!id }), contact = _c.data, isLoadingContact = _c.isLoading;
    var _d = trpc_1.trpc.clients.list.useQuery({}).data, clients = _d === void 0 ? [] : _d;
    var utils = trpc_1.trpc.useUtils();
    react_1.useEffect(function () {
        if (contact) {
            setFormData({
                firstName: contact.firstName || "",
                lastName: contact.lastName || "",
                email: contact.email || "",
                phone: contact.phone || "",
                mobile: contact.mobile || "",
                jobTitle: contact.jobTitle || "",
                department: contact.department || "",
                address: contact.address || "",
                city: contact.city || "",
                country: contact.country || "",
                notes: contact.notes || "",
                isPrimary: !!contact.isPrimary,
                clientId: contact.clientId || "",
                salutation: contact.salutation || "",
                postalCode: contact.postalCode || "",
                linkedIn: contact.linkedIn || ""
            });
        }
    }, [contact]);
    var updateMutation = trpc_1.trpc.contacts.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Contact updated successfully!");
            utils.contacts.list.invalidate();
            utils.contacts.getById.invalidate(id || "");
            setLocation("/contacts");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update contact: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName) {
            sonner_1.toast.error("First name and last name are required");
            return;
        }
        updateMutation.mutate({
            id: id || "",
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email || undefined,
            phone: formData.phone || undefined,
            mobile: formData.mobile || undefined,
            jobTitle: formData.jobTitle || undefined,
            department: formData.department || undefined,
            address: formData.address || undefined,
            city: formData.city || undefined,
            country: formData.country || undefined,
            notes: formData.notes || undefined,
            isPrimary: formData.isPrimary,
            clientId: formData.clientId || undefined,
            salutation: formData.salutation || undefined,
            postalCode: formData.postalCode || undefined,
            linkedIn: formData.linkedIn || undefined
        });
    };
    var update = function (field, value) {
        return setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    if (isLoadingContact) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Contact", icon: React.createElement(lucide_react_1.UserCog, { className: "h-5 w-5" }) },
            React.createElement("div", { className: "flex items-center justify-center py-12" },
                React.createElement(spinner_1.Spinner, { className: "h-8 w-8" }))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Contact", icon: React.createElement(lucide_react_1.UserCog, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Contacts", href: "/contacts" },
            { label: "Edit Contact" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/contacts"); } }, "Cancel"),
            React.createElement(button_1.Button, { onClick: handleSubmit, disabled: updateMutation.isPending },
                updateMutation.isPending ? React.createElement(spinner_1.Spinner, { className: "mr-2 h-4 w-4" }) : null,
                "Save Changes")) },
        React.createElement("form", { onSubmit: handleSubmit, className: "max-w-3xl space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Contact Information")),
                React.createElement(card_1.CardContent, { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement("div", { className: "md:col-span-2" },
                        React.createElement(label_1.Label, { htmlFor: "salutation" }, "Salutation"),
                        React.createElement(select_1.Select, { value: formData.salutation, onValueChange: function (v) { return update("salutation", v); } },
                            React.createElement(select_1.SelectTrigger, { id: "salutation" },
                                React.createElement(select_1.SelectValue, { placeholder: "Select salutation" })),
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
                        React.createElement(input_1.Input, { id: "postalCode", value: formData.postalCode, onChange: function (e) { return update("postalCode", e.target.value); }, placeholder: "00100" })))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Additional")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "linkedIn" }, "LinkedIn URL"),
                        React.createElement(input_1.Input, { id: "linkedIn", value: formData.linkedIn, onChange: function (e) { return update("linkedIn", e.target.value); }, placeholder: "https://linkedin.com/in/username" })),
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(switch_1.Switch, { checked: formData.isPrimary, onCheckedChange: function (v) { return update("isPrimary", v); } }),
                        React.createElement(label_1.Label, null, "Primary Contact")),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                        React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.notes, onChange: function (html) { return update("notes", html); }, minHeight: "100px" })))))));
}
exports["default"] = EditContact;
