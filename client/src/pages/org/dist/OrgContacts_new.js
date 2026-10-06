"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgModuleLayout_1 = require("@/components/OrgModuleLayout");
var SummaryStatCards_1 = require("@/components/list-page/SummaryStatCards");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var skeleton_1 = require("@/components/ui/skeleton");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
function OrgContacts() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(""), search = _b[0], setSearch = _b[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("contacts", "create");
    var canEdit = hasPermission("contacts", "update");
    var canDelete = hasPermission("contacts", "delete");
    // Fetch contacts
    var _c = trpc_1.trpc.multiTenancy.getOrgContacts.useQuery({ slug: slug, search: search || undefined, limit: 1000 }, { keepPreviousData: true }), _d = _c.data, contactsData = _d === void 0 ? [] : _d, isLoading = _c.isLoading;
    var utils = trpc_1.trpc.useUtils();
    var deleteMutation = trpc_1.trpc.multiTenancy.deleteOrgContact.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Contact deleted");
            utils.multiTenancy.getOrgContacts.invalidate();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var contacts = react_1.useMemo(function () {
        return (Array.isArray(contactsData) ? contactsData : []).map(function (c) { return ({
            id: c.id,
            firstName: c.firstName || "",
            lastName: c.lastName || "",
            email: c.email || "",
            phone: c.phone || "",
            jobTitle: c.jobTitle || "",
            department: c.department || "",
            city: c.city || "",
            country: c.country || ""
        }); });
    }, [contactsData]);
    var filtered = react_1.useMemo(function () {
        return contacts.filter(function (contact) {
            var fullName = (contact.firstName + " " + contact.lastName).toLowerCase();
            return (fullName.includes(search.toLowerCase()) ||
                (contact.email && contact.email.toLowerCase().includes(search.toLowerCase())) ||
                (contact.phone && contact.phone.includes(search)) ||
                (contact.department && contact.department.toLowerCase().includes(search.toLowerCase())));
        });
    }, [contacts, search]);
    var summaryStats = [
        { label: "Total Contacts", value: String(contacts.length), trend: undefined },
        { label: "With Email", value: String(contacts.filter(function (c) { return c.email; }).length), trend: undefined },
        { label: "With Phone", value: String(contacts.filter(function (c) { return c.phone; }).length), trend: undefined },
    ];
    var handleView = function (id) {
        navigate("/org/" + slug + "/contacts/" + id);
    };
    var handleEdit = function (id) {
        navigate("/org/" + slug + "/contacts/" + id + "/edit");
    };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this contact?")) {
            deleteMutation.mutate({ slug: slug, id: id });
        }
    };
    var handleNewContact = function () {
        navigate("/org/" + slug + "/contacts/new");
    };
    return (React.createElement(OrgModuleLayout_1.OrgModuleLayout, { title: "Contacts", description: "Manage your organization contacts and people", icon: lucide_react_1.Users, breadcrumbs: [
            { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
            { label: "Contacts" },
        ], actions: canCreate && (React.createElement(button_1.Button, { size: "sm", onClick: handleNewContact },
            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
            " New Contact")), backLink: "/org/" + slug + "/dashboard", hasAccess: canCreate || canEdit || canDelete, accessDeniedMessage: "Contacts module is not enabled for your organization." },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(SummaryStatCards_1.SummaryStatCards, { cards: summaryStats, isLoading: isLoading }),
            React.createElement("div", { className: "flex items-center gap-3 flex-wrap" },
                React.createElement("div", { className: "relative flex-1 max-w-sm" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search by name, email, department...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" }))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (React.createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 6 }).map(function (_, i) { return React.createElement(skeleton_1.Skeleton, { key: i, className: "h-12 rounded" }); }))) : filtered.length === 0 ? (React.createElement("div", { className: "py-16 text-center" },
                    React.createElement(lucide_react_1.Users, { className: "h-10 w-10 text-muted-foreground/20 mx-auto mb-3" }),
                    React.createElement("p", { className: "text-muted-foreground text-sm" }, search ? "No contacts match your search" : "No contacts yet"))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Name"),
                                React.createElement(table_1.TableHead, null, "Email"),
                                React.createElement(table_1.TableHead, null, "Phone"),
                                React.createElement(table_1.TableHead, null, "Job Title"),
                                React.createElement(table_1.TableHead, null, "Department"),
                                React.createElement(table_1.TableHead, null, "City"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filtered.map(function (contact) { return (React.createElement(table_1.TableRow, { key: contact.id, className: "hover:bg-muted/30" },
                            React.createElement(table_1.TableCell, { className: "font-semibold" },
                                contact.firstName,
                                " ",
                                contact.lastName),
                            React.createElement(table_1.TableCell, { className: "text-muted-foreground" }, contact.email || "—"),
                            React.createElement(table_1.TableCell, { className: "text-muted-foreground" }, contact.phone || "—"),
                            React.createElement(table_1.TableCell, { className: "text-muted-foreground" }, contact.jobTitle || "—"),
                            React.createElement(table_1.TableCell, null, contact.department && (React.createElement(badge_1.Badge, { variant: "outline" }, contact.department))),
                            React.createElement(table_1.TableCell, { className: "text-muted-foreground" }, contact.city || "—"),
                            React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(contact.id); }, title: "View" },
                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                canEdit && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(contact.id); }, title: "Edit" },
                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
                                canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(contact.id); }, title: "Delete" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))))));
}
exports["default"] = OrgContacts;
