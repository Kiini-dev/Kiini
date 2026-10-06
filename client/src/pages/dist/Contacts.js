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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var react_1 = require("react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var communications_1 = require("@/lib/communications");
var export_utils_1 = require("@/lib/export-utils");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var LocationSelects_1 = require("@/components/LocationSelects");
var textarea_1 = require("@/components/ui/textarea");
var separator_1 = require("@/components/ui/separator");
var spinner_1 = require("@/components/ui/spinner");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var data_table_controls_1 = require("@/components/ui/data-table-controls");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var EnhancedBulkActions_1 = require("@/components/list-page/EnhancedBulkActions");
var table_1 = require("@/components/ui/table");
var emptyForm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    mobile: "",
    jobTitle: "",
    department: "",
    isPrimary: false,
    notes: "",
    address: "",
    city: "",
    country: ""
};
function Contacts() {
    var _a, _b, _c;
    var _d = wouter_1.useLocation(), location = _d[0], navigate = _d[1];
    var _e = react_1.useState(""), search = _e[0], setSearch = _e[1];
    var _f = react_1.useState(false), showDialog = _f[0], setShowDialog = _f[1];
    var _g = react_1.useState(null), editingId = _g[0], setEditingId = _g[1];
    var _h = react_1.useState(emptyForm), form = _h[0], setForm = _h[1];
    var _j = react_1.useState(new Set()), selectedContacts = _j[0], setSelectedContacts = _j[1];
    var contactColumns = [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "jobTitle", label: "Job Title" },
        { key: "department", label: "Department" },
        { key: "city", label: "City" },
        { key: "country", label: "Country" },
    ];
    var _k = TableColumnSettings_1.useColumnVisibility(contactColumns, "contacts"), visibleColumns = _k.visibleColumns, toggleColumn = _k.toggleColumn, isVisible = _k.isVisible, colPageSize = _k.pageSize, updatePageSize = _k.updatePageSize, reset = _k.reset;
    var _l = data_table_controls_1.usePagination(25), page = _l.page, pageSize = _l.pageSize, setPage = _l.setPage, setPageSize = _l.setPageSize, paginate = _l.paginate, resetPage = _l.resetPage;
    var utils = trpc_1.trpc.useUtils();
    var _m = trpc_1.trpc.clients.list.useQuery({}).data, clients = _m === void 0 ? [] : _m;
    var clientsArr = Array.isArray(clients) ? clients : (_b = (_a = clients) === null || _a === void 0 ? void 0 : _a.items) !== null && _b !== void 0 ? _b : [];
    var listQuery = trpc_1.trpc.contacts.list.useQuery({ search: search || undefined, limit: 1000 }, { keepPreviousData: true });
    var createMutation = trpc_1.trpc.contacts.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Contact created");
            utils.contacts.list.invalidate();
            setShowDialog(false);
            setForm(emptyForm);
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateMutation = trpc_1.trpc.contacts.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Contact updated");
            utils.contacts.list.invalidate();
            setShowDialog(false);
            setForm(emptyForm);
            setEditingId(null);
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var deleteMutation = trpc_1.trpc.contacts["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Contact deleted");
            utils.contacts.list.invalidate();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var bulkDeleteMutation = trpc_1.trpc.contacts.bulkDelete.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success(data.count + " contact(s) deleted");
            utils.contacts.list.invalidate();
            setSelectedContacts(new Set());
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var handleSubmit = function () {
        if (!form.firstName || !form.lastName) {
            sonner_1.toast.error("First and last name are required");
            return;
        }
        if (editingId) {
            updateMutation.mutate(__assign({ id: editingId }, form));
        }
        else {
            createMutation.mutate(form);
        }
    };
    var handleEdit = function (contact) {
        setEditingId(contact.id);
        setForm({
            clientId: contact.clientId || "",
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email || "",
            phone: contact.phone || "",
            mobile: contact.mobile || "",
            jobTitle: contact.jobTitle || "",
            department: contact.department || "",
            isPrimary: contact.isPrimary === 1,
            notes: contact.notes || "",
            address: contact.address || "",
            city: contact.city || "",
            country: contact.country || ""
        });
        setShowDialog(true);
    };
    var handleDelete = function (id) {
        if (confirm("Delete this contact?")) {
            deleteMutation.mutate(id);
        }
    };
    var contacts = ((_c = listQuery.data) === null || _c === void 0 ? void 0 : _c.data) || [];
    var pagedContacts = paginate(contacts);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Contacts", description: "Manage contacts across your organisation", icon: React.createElement(lucide_react_1.Users, { className: "h-6 w-6" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Contacts" }], actions: React.createElement(button_1.Button, { onClick: function () {
                setEditingId(null);
                setForm(emptyForm);
                setShowDialog(true);
            } },
            React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
            " Add Contact") },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(ListPageToolbar_1.ListPageToolbar, { searchValue: search, onSearchChange: setSearch, searchPlaceholder: "Search contacts...", onCreateClick: function () { setEditingId(null); setForm(emptyForm); setShowDialog(true); }, createLabel: "Add Contact", onExportClick: function () { return export_utils_1.downloadCSV(contacts, "contacts"); }, onPrintClick: function () { return window.print(); }, showImport: false }),
            React.createElement(EnhancedBulkActions_1.EnhancedBulkActions, { selectedCount: selectedContacts.size, onClear: function () { return setSelectedContacts(new Set()); }, actions: [
                    EnhancedBulkActions_1.bulkExportAction(selectedContacts, contacts, contactColumns, "contacts"),
                    EnhancedBulkActions_1.bulkCopyIdsAction(selectedContacts),
                    EnhancedBulkActions_1.bulkEmailAction(navigate),
                    EnhancedBulkActions_1.bulkDeleteAction(selectedContacts, function (ids) { return bulkDeleteMutation.mutate(ids); }),
                ] }),
            listQuery.isLoading ? (React.createElement("div", { className: "flex justify-center py-20" },
                React.createElement(spinner_1.Spinner, null))) : contacts.length === 0 ? (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "py-16 text-center text-muted-foreground" }, "No contacts found. Create your first contact to get started."))) : (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" },
                    React.createElement("div", { className: "flex items-center justify-between px-4 py-3 border-b" },
                        React.createElement("span", { className: "text-sm text-muted-foreground" },
                            contacts.length,
                            " contacts"),
                        React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: contactColumns, visibleColumns: visibleColumns, onToggleColumn: toggleColumn, onReset: reset, pageSize: pageSize, onPageSizeChange: updatePageSize })),
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, { className: "w-10" },
                                        React.createElement("input", { type: "checkbox", checked: selectedContacts.size === pagedContacts.length && pagedContacts.length > 0, onChange: function (e) {
                                                if (e.target.checked)
                                                    setSelectedContacts(new Set(pagedContacts.map(function (c) { return c.id; })));
                                                else
                                                    setSelectedContacts(new Set());
                                            }, className: "h-4 w-4 rounded border-gray-300 cursor-pointer", "aria-label": "Select all" })),
                                    React.createElement(table_1.TableHead, null, "Name"),
                                    React.createElement(table_1.TableHead, null, "Email"),
                                    React.createElement(table_1.TableHead, null, "Phone"),
                                    React.createElement(table_1.TableHead, null, "Job Title"),
                                    React.createElement(table_1.TableHead, null, "Department"),
                                    React.createElement(table_1.TableHead, null, "City"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            React.createElement(table_1.TableBody, null, pagedContacts.map(function (contact) {
                                var _a, _b;
                                return (React.createElement(table_1.TableRow, { key: contact.id, className: selectedContacts.has(contact.id) ? "bg-primary/5" : "" },
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement("input", { type: "checkbox", checked: selectedContacts.has(contact.id), onChange: function () {
                                                var next = new Set(selectedContacts);
                                                if (next.has(contact.id))
                                                    next["delete"](contact.id);
                                                else
                                                    next.add(contact.id);
                                                setSelectedContacts(next);
                                            }, className: "h-4 w-4 rounded border-gray-300 cursor-pointer", "aria-label": "Select " + contact.firstName })),
                                    React.createElement(table_1.TableCell, { className: "font-medium" },
                                        React.createElement("div", { className: "flex items-center gap-2" },
                                            React.createElement("div", { className: "h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold" }, (_a = contact.firstName) === null || _a === void 0 ? void 0 :
                                                _a[0], (_b = contact.lastName) === null || _b === void 0 ? void 0 :
                                                _b[0]),
                                            contact.firstName,
                                            " ",
                                            contact.lastName,
                                            contact.isPrimary === 1 && (React.createElement("span", { className: "text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded" }, "Primary")))),
                                    React.createElement(table_1.TableCell, null, contact.email && (React.createElement("div", { className: "flex items-center gap-1 text-muted-foreground" },
                                        React.createElement(lucide_react_1.Mail, { className: "h-3 w-3" }),
                                        " ",
                                        contact.email))),
                                    React.createElement(table_1.TableCell, null, contact.phone && (React.createElement("div", { className: "flex items-center gap-1 text-muted-foreground" },
                                        React.createElement(lucide_react_1.Phone, { className: "h-3 w-3" }),
                                        " ",
                                        contact.phone))),
                                    React.createElement(table_1.TableCell, { className: "text-muted-foreground" }, contact.jobTitle || "—"),
                                    React.createElement(table_1.TableCell, { className: "text-muted-foreground" }, contact.department && (React.createElement("div", { className: "flex items-center gap-1" },
                                        React.createElement(lucide_react_1.Building2, { className: "h-3 w-3" }),
                                        " ",
                                        contact.department))),
                                    React.createElement(table_1.TableCell, { className: "text-muted-foreground" }, contact.city || "—"),
                                    React.createElement(table_1.TableCell, { className: "text-right" },
                                        React.createElement(RowActionsMenu_1.RowActionsMenu, { primaryActions: [
                                                { label: "View", icon: RowActionsMenu_1.actionIcons.view, onClick: function () { return navigate("/contacts/" + contact.id); } },
                                                { label: "Edit", icon: RowActionsMenu_1.actionIcons.edit, onClick: function () { return handleEdit(contact); } },
                                                { label: "Delete", icon: RowActionsMenu_1.actionIcons["delete"], onClick: function () { return handleDelete(contact.id); }, variant: "destructive" },
                                            ], menuActions: [
                                                { label: "Send Email", icon: RowActionsMenu_1.actionIcons.email, onClick: function () { return navigate(communications_1.buildCommunicationComposePath(location, contact.email)); } },
                                                { label: "Duplicate Contact", icon: RowActionsMenu_1.actionIcons.copy, onClick: function () { return navigate("/contacts/create?clone=" + contact.id); }, separator: true },
                                                { label: "Add to Client", icon: React.createElement(lucide_react_1.UserPlus, { className: "h-4 w-4" }), onClick: function () { return navigate("/contacts/" + contact.id + "/edit"); } },
                                            ] }))));
                            })))),
                    React.createElement(data_table_controls_1.PaginationControls, { total: contacts.length, page: page, pageSize: pageSize, onPageChange: setPage, onPageSizeChange: function (s) { setPageSize(s); resetPage(); }, className: "px-2" })))),
            React.createElement(dialog_1.Dialog, { open: showDialog, onOpenChange: setShowDialog },
                React.createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }),
                            editingId ? "Edit Contact" : "New Contact")),
                    React.createElement("div", { className: "space-y-5" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Company / Client"),
                            React.createElement(select_1.Select, { value: form.clientId || "", onValueChange: function (v) { return setForm(__assign(__assign({}, form), { clientId: v || undefined })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Link to a client company (optional)" })),
                                React.createElement(select_1.SelectContent, { className: "max-h-56 overflow-y-auto" },
                                    React.createElement(select_1.SelectItem, { value: "none" }, "\u2014 No company \u2014"),
                                    clientsArr.map(function (c) { return (React.createElement(select_1.SelectItem, { key: c.id, value: c.id }, c.companyName || c.contactPerson)); })))),
                        React.createElement(separator_1.Separator, null),
                        React.createElement("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider" }, "Personal Information"),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-1" },
                                React.createElement(label_1.Label, null,
                                    "First Name ",
                                    React.createElement("span", { className: "text-destructive" }, "*")),
                                React.createElement(input_1.Input, { value: form.firstName, onChange: function (e) { return setForm(__assign(__assign({}, form), { firstName: e.target.value })); }, placeholder: "e.g., John" })),
                            React.createElement("div", { className: "space-y-1" },
                                React.createElement(label_1.Label, null,
                                    "Last Name ",
                                    React.createElement("span", { className: "text-destructive" }, "*")),
                                React.createElement(input_1.Input, { value: form.lastName, onChange: function (e) { return setForm(__assign(__assign({}, form), { lastName: e.target.value })); }, placeholder: "e.g., Kamau" }))),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-1" },
                                React.createElement(label_1.Label, null, "Job Title"),
                                React.createElement(input_1.Input, { value: form.jobTitle, onChange: function (e) { return setForm(__assign(__assign({}, form), { jobTitle: e.target.value })); }, placeholder: "e.g., Chief Finance Officer" })),
                            React.createElement("div", { className: "space-y-1" },
                                React.createElement(label_1.Label, null, "Department"),
                                React.createElement(input_1.Input, { value: form.department, onChange: function (e) { return setForm(__assign(__assign({}, form), { department: e.target.value })); }, placeholder: "e.g., Finance, Operations" }))),
                        React.createElement(separator_1.Separator, null),
                        React.createElement("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider" }, "Contact Details"),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-1" },
                                React.createElement(label_1.Label, null, "Email Address"),
                                React.createElement(input_1.Input, { type: "email", value: form.email, onChange: function (e) { return setForm(__assign(__assign({}, form), { email: e.target.value })); }, placeholder: "john@company.com" })),
                            React.createElement("div", { className: "space-y-1" },
                                React.createElement(label_1.Label, null, "Phone (Office)"),
                                React.createElement(input_1.Input, { value: form.phone, onChange: function (e) { return setForm(__assign(__assign({}, form), { phone: e.target.value })); }, placeholder: "+254 20 123 4567" }))),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-1" },
                                React.createElement(label_1.Label, null, "Mobile / WhatsApp"),
                                React.createElement(input_1.Input, { value: form.mobile, onChange: function (e) { return setForm(__assign(__assign({}, form), { mobile: e.target.value })); }, placeholder: "+254 7XX XXX XXX" })),
                            React.createElement("div", { className: "space-y-1" },
                                React.createElement(label_1.Label, null, "City"),
                                React.createElement(LocationSelects_1.CitySelect, { value: form.city, onChange: function (v) { return setForm(__assign(__assign({}, form), { city: v })); } }))),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-1" },
                                React.createElement(label_1.Label, null, "Country"),
                                React.createElement(LocationSelects_1.CountrySelect, { value: form.country, onChange: function (v) { return setForm(__assign(__assign({}, form), { country: v })); } })),
                            React.createElement("div", { className: "space-y-1" },
                                React.createElement(label_1.Label, null, "Physical Address"),
                                React.createElement(input_1.Input, { value: form.address, onChange: function (e) { return setForm(__assign(__assign({}, form), { address: e.target.value })); }, placeholder: "Street, Building, Floor" }))),
                        React.createElement(separator_1.Separator, null),
                        React.createElement("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider" }, "Notes & Settings"),
                        React.createElement("div", { className: "space-y-1" },
                            React.createElement(label_1.Label, null, "Notes"),
                            React.createElement(textarea_1.Textarea, { value: form.notes, onChange: function (e) { return setForm(__assign(__assign({}, form), { notes: e.target.value })); }, placeholder: "Background, preferences, relationship history, or anything useful about this contact...", rows: 3 })),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("input", { type: "checkbox", id: "isPrimary", checked: form.isPrimary, onChange: function (e) { return setForm(__assign(__assign({}, form), { isPrimary: e.target.checked })); }, className: "h-4 w-4 cursor-pointer", title: "Set as primary contact" }),
                            React.createElement(label_1.Label, { htmlFor: "isPrimary", className: "cursor-pointer" }, "Set as Primary Contact for this company")),
                        React.createElement("div", { className: "flex justify-end gap-2 pt-2" },
                            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowDialog(false); } }, "Cancel"),
                            React.createElement(button_1.Button, { onClick: handleSubmit, disabled: createMutation.isPending || updateMutation.isPending }, editingId ? "Update Contact" : "Create Contact"))))))));
}
exports["default"] = Contacts;
