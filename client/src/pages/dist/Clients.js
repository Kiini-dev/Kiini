"use strict";
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
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var badge_1 = require("@/components/ui/badge");
var sonner_1 = require("sonner");
var ClientForm_1 = require("@/components/ClientForm");
var trpc_1 = require("@/lib/trpc");
var exportCsv_1 = require("@/utils/exportCsv");
var communications_1 = require("@/lib/communications");
var lucide_react_1 = require("lucide-react");
var healthScore_1 = require("@/lib/healthScore");
var data_table_controls_1 = require("@/components/ui/data-table-controls");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var SummaryStatCards_1 = require("@/components/list-page/SummaryStatCards");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var EnhancedBulkActions_1 = require("@/components/list-page/EnhancedBulkActions");
var COLUMNS = [
    { key: "client", label: "Client", defaultVisible: true },
    { key: "contact", label: "Contact", defaultVisible: true },
    { key: "company", label: "Company", defaultVisible: true },
    { key: "phone", label: "Phone", defaultVisible: false },
    { key: "address", label: "Address", defaultVisible: false },
    { key: "tags", label: "Tags", defaultVisible: true },
    { key: "category", label: "Category", defaultVisible: true },
    { key: "projects", label: "Projects", defaultVisible: true },
    { key: "revenue", label: "Revenue", defaultVisible: true },
    { key: "health", label: "Health", defaultVisible: true },
    { key: "status", label: "Status", defaultVisible: true },
    { key: "accountOwner", label: "Account Owner", defaultVisible: false },
];
function computeClientHealth(clientId, invoices, projects) {
    return healthScore_1.computeHealthScoreForClient(clientId, invoices, projects);
}
function Clients() {
    var _this = this;
    var _a;
    // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
    var _b = permissions_1.useRequireFeature("clients:view"), allowed = _b.allowed, isLoading = _b.isLoading;
    var _c = wouter_1.useLocation(), location = _c[0], navigate = _c[1];
    var _d = react_1.useState(""), searchQuery = _d[0], setSearchQuery = _d[1];
    var _e = react_1.useState({
        status: "all",
        type: "all",
        sortBy: "name",
        sortOrder: "asc"
    }), filters = _e[0], setFilters = _e[1];
    // Pagination & selection (all hooks must be unconditional)
    var _f = data_table_controls_1.usePagination(25), page = _f.page, pageSize = _f.pageSize, setPage = _f.setPage, setPageSize = _f.setPageSize, paginate = _f.paginate, resetPage = _f.resetPage;
    var _g = TableColumnSettings_1.useColumnVisibility(COLUMNS, "clients"), visibleColumns = _g.visibleColumns, toggleColumn = _g.toggleColumn, isVisible = _g.isVisible;
    var _h = react_1.useState(false), isDialogOpen = _h[0], setIsDialogOpen = _h[1];
    var _j = react_1.useState({
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
        notes: "",
        createClientLogin: false,
        clientPassword: ""
    }), newClient = _j[0], setNewClient = _j[1];
    // Fetch clients from backend
    var _k = trpc_1.trpc.clients.list.useQuery({}), _l = _k.data, clientsData = _l === void 0 ? [] : _l, clientsLoading = _k.isLoading;
    var _m = trpc_1.trpc.projects.list.useQuery({}).data, projectsData = _m === void 0 ? [] : _m;
    var _o = trpc_1.trpc.invoices.list.useQuery({}).data, invoicesData = _o === void 0 ? [] : _o;
    var _p = trpc_1.trpc.users.list.useQuery({}).data, usersData = _p === void 0 ? [] : _p;
    var utils = trpc_1.trpc.useUtils();
    var teamMembers = Array.isArray(usersData) ? usersData : ((_a = usersData) === null || _a === void 0 ? void 0 : _a.users) || [];
    // Delete mutation
    var deleteClientMutation = trpc_1.trpc.clients["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Client deleted successfully");
            utils.clients.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete client");
        }
    });
    var bulkDeleteMutation = trpc_1.trpc.clients.bulkDelete.useMutation({
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete clients");
        }
    });
    var updateClientMutation = trpc_1.trpc.clients.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Client updated");
            utils.clients.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update client");
        }
    });
    var createClientMutation = trpc_1.trpc.clients.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Client added successfully!");
            setIsDialogOpen(false);
            setNewClient({
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
                notes: "",
                createClientLogin: false,
                clientPassword: ""
            });
            utils.clients.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to add client: " + error.message);
        }
    });
    // Convert frozen Drizzle objects to plain JS for React dependencies
    var plainClientsData = Array.isArray(clientsData)
        ? clientsData.map(function (client) { return JSON.parse(JSON.stringify(client)); })
        : [];
    var plainProjectsData = Array.isArray(projectsData)
        ? projectsData.map(function (project) { return JSON.parse(JSON.stringify(project)); })
        : [];
    var plainInvoicesData = Array.isArray(invoicesData)
        ? invoicesData.map(function (invoice) { return JSON.parse(JSON.stringify(invoice)); })
        : [];
    // Transform backend data to display format with revenue and project counts
    var clients = react_1.useMemo(function () {
        if (!Array.isArray(plainClientsData))
            return [];
        return plainClientsData.map(function (client) {
            var clientProjects = plainProjectsData.filter(function (p) { return p.clientId === client.id; }).length;
            var clientRevenue = plainInvoicesData
                .filter(function (inv) { return inv.clientId === client.id; })
                .reduce(function (sum, inv) { return sum + (inv.total || 0); }, 0);
            return {
                id: client.id,
                name: client.contactPerson || client.companyName,
                email: client.email || "",
                phone: client.phone || "",
                company: client.companyName,
                address: client.address || "",
                status: (client.status || "active"),
                projects: clientProjects,
                totalRevenue: clientRevenue / 100
            };
        });
    }, [plainClientsData, plainProjectsData, plainInvoicesData]);
    var filteredClients = clients
        .filter(function (client) {
        return client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email.toLowerCase().includes(searchQuery.toLowerCase());
    })
        .sort(function (a, b) {
        var aVal = a[filters.sortBy];
        var bVal = b[filters.sortBy];
        if (typeof aVal === "string")
            aVal = aVal.toLowerCase();
        if (typeof bVal === "string")
            bVal = bVal.toLowerCase();
        var comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return filters.sortOrder === "desc" ? -comparison : comparison;
    });
    var pagedClients = paginate(filteredClients);
    var selection = data_table_controls_1.useTableSelection(pagedClients.map(function (c) { return c.id; }));
    // Reset page when search or filters change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    react_1.useEffect(function () { resetPage(); }, [searchQuery, filters.sortBy, filters.sortOrder, filters.status]);
    var handleAddClient = function () {
        if (!newClient.companyName || !newClient.contactPerson) {
            sonner_1.toast.error("Please fill in required fields (Company Name and Contact Person)");
            return;
        }
        var mutation = {
            companyName: newClient.companyName,
            contactPerson: newClient.contactPerson,
            email: newClient.email || undefined,
            phone: newClient.phone || undefined,
            address: newClient.address || undefined,
            city: newClient.city || undefined,
            country: newClient.country || undefined,
            postalCode: newClient.postalCode || undefined,
            taxId: newClient.taxId || undefined,
            website: newClient.website || undefined,
            industry: newClient.industry || undefined,
            status: (newClient.status || "active"),
            notes: newClient.notes || undefined,
            createClientLogin: newClient.createClientLogin || undefined,
            clientPassword: newClient.clientPassword || undefined
        };
        createClientMutation.mutate(mutation);
    };
    var handleViewClient = function (clientId) {
        navigate("/clients/" + clientId);
    };
    var handleDeleteClient = function (clientId, clientName) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (confirm("Are you sure you want to delete " + clientName + "?")) {
                deleteClientMutation.mutate(clientId);
            }
            return [2 /*return*/];
        });
    }); };
    var totalRevenue = clients.reduce(function (sum, client) { return sum + client.totalRevenue; }, 0);
    var totalProjects = clients.reduce(function (sum, client) { return sum + client.projects; }, 0);
    // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed) {
        return null;
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Clients", icon: React.createElement(lucide_react_1.Users, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "App", href: "/crm-home" },
            { label: "Clients" },
        ], actions: React.createElement(ListPageToolbar_1.ListPageToolbar, { searchValue: searchQuery, onSearchChange: setSearchQuery, searchPlaceholder: "Search clients...", onCreateClick: function () { return setIsDialogOpen(true); }, createLabel: "New Client", onExportClick: function () {
                if (!clients.length) {
                    sonner_1.toast.warning("No clients to export");
                    return;
                }
                exportCsv_1.exportToCsv("clients", clients.map(function (c) {
                    var _a, _b, _c, _d, _e, _f, _g;
                    return ({
                        Name: (((_a = c.firstName) !== null && _a !== void 0 ? _a : "") + " " + ((_b = c.lastName) !== null && _b !== void 0 ? _b : "")).trim(),
                        Company: (_c = c.company) !== null && _c !== void 0 ? _c : "",
                        Email: (_d = c.email) !== null && _d !== void 0 ? _d : "",
                        Phone: (_e = c.phone) !== null && _e !== void 0 ? _e : "",
                        Category: (_f = c.category) !== null && _f !== void 0 ? _f : "",
                        Status: (_g = c.status) !== null && _g !== void 0 ? _g : ""
                    });
                }));
                sonner_1.toast.success("Clients exported");
            }, onImportClick: function () { return sonner_1.toast.info("CSV import is available in Settings > Data Management"); }, onPrintClick: function () { return window.print(); } }) },
        React.createElement(dialog_1.Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen },
            React.createElement(dialog_1.DialogContent, { className: "sm:max-w-[900px] max-h-[90vh] overflow-y-auto" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Add New Client"),
                    React.createElement(dialog_1.DialogDescription, null, "Enter the client's information to create a new client record.")),
                React.createElement("div", { className: "py-4" },
                    React.createElement(ClientForm_1.ClientForm, { formData: newClient, setFormData: setNewClient, teamMembers: teamMembers, showCreateClientLogin: true })),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsDialogOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: handleAddClient, disabled: createClientMutation.isPending }, createClientMutation.isPending ? "Adding..." : "Add Client")))),
        React.createElement("div", { className: "space-y-6" },
            React.createElement(SummaryStatCards_1.SummaryStatCards, { cards: [
                    { label: "Clients", value: clients.length, color: "blue" },
                    { label: "Projects", value: totalProjects, color: "green" },
                    { label: "Invoices", value: "Ksh " + totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 }), color: "orange" },
                    { label: "Payments", value: "Ksh " + totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 }), color: "purple" },
                ] }),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "space-y-3 pt-4" },
                    selection.selectedIds.length > 0 && (React.createElement(EnhancedBulkActions_1.EnhancedBulkActions, { selectedCount: selection.selectedIds.length, onClear: selection.clear, actions: [
                            EnhancedBulkActions_1.bulkExportAction(selection.selectedSet, pagedClients, [
                                { key: "name", label: "Client" },
                                { key: "email", label: "Email" },
                                { key: "company", label: "Company" },
                                { key: "phone", label: "Phone" },
                                { key: "status", label: "Status" },
                            ], "clients"),
                            EnhancedBulkActions_1.bulkCopyIdsAction(selection.selectedSet),
                            EnhancedBulkActions_1.bulkEmailAction(navigate, location),
                            EnhancedBulkActions_1.bulkDeleteAction(selection.selectedSet, function (ids) {
                                bulkDeleteMutation.mutate(ids, {
                                    onSuccess: function (data) {
                                        sonner_1.toast.success(data.count + " client(s) deleted");
                                        utils.clients.list.invalidate();
                                        selection.clear();
                                    }
                                });
                            }),
                        ] })),
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, { className: "w-10" }),
                                    isVisible("client") && (React.createElement(table_1.TableHead, null,
                                        React.createElement("span", { className: "text-primary flex items-center gap-1 cursor-pointer" },
                                            "Client ",
                                            React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                    isVisible("contact") && (React.createElement(table_1.TableHead, null,
                                        React.createElement("span", { className: "text-primary flex items-center gap-1 cursor-pointer" },
                                            "Contact ",
                                            React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                    isVisible("company") && (React.createElement(table_1.TableHead, null,
                                        React.createElement("span", { className: "text-primary flex items-center gap-1 cursor-pointer" },
                                            "Company ",
                                            React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                    isVisible("phone") && (React.createElement(table_1.TableHead, null,
                                        React.createElement("span", { className: "text-primary flex items-center gap-1 cursor-pointer" },
                                            "Phone ",
                                            React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                    isVisible("address") && (React.createElement(table_1.TableHead, null,
                                        React.createElement("span", { className: "text-primary flex items-center gap-1 cursor-pointer" },
                                            "Address ",
                                            React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                    isVisible("tags") && (React.createElement(table_1.TableHead, null,
                                        React.createElement("span", { className: "text-primary flex items-center gap-1 cursor-pointer" },
                                            "Tags ",
                                            React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                    isVisible("category") && (React.createElement(table_1.TableHead, null,
                                        React.createElement("span", { className: "text-primary flex items-center gap-1 cursor-pointer" },
                                            "Category ",
                                            React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                    isVisible("projects") && (React.createElement(table_1.TableHead, null,
                                        React.createElement("span", { className: "text-primary flex items-center gap-1 cursor-pointer" },
                                            "Projects ",
                                            React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                    isVisible("revenue") && (React.createElement(table_1.TableHead, null,
                                        React.createElement("span", { className: "text-primary flex items-center gap-1 cursor-pointer" },
                                            "Revenue ",
                                            React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                    isVisible("health") && (React.createElement(table_1.TableHead, null,
                                        React.createElement("span", { className: "text-primary flex items-center gap-1 cursor-pointer" },
                                            "Health ",
                                            React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                    isVisible("status") && (React.createElement(table_1.TableHead, null,
                                        React.createElement("span", { className: "text-primary flex items-center gap-1 cursor-pointer" },
                                            "Status ",
                                            React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                    isVisible("accountOwner") && (React.createElement(table_1.TableHead, null,
                                        React.createElement("span", { className: "text-primary flex items-center gap-1 cursor-pointer" },
                                            "Account Owner ",
                                            React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                    React.createElement(table_1.TableHead, { className: "text-right" },
                                        React.createElement("div", { className: "flex items-center justify-end gap-1" },
                                            "Actions",
                                            React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: COLUMNS, visibleColumns: visibleColumns, onToggleColumn: toggleColumn }))))),
                            React.createElement(table_1.TableBody, null, clientsLoading ? (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: COLUMNS.filter(function (c) { return isVisible(c.key); }).length + 2, className: "text-center py-8" },
                                    React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin mx-auto text-primary" })))) : pagedClients.length === 0 ? (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: COLUMNS.filter(function (c) { return isVisible(c.key); }).length + 2, className: "text-center py-8 text-muted-foreground" }, "No clients found"))) : (pagedClients.map(function (client) { return (React.createElement(table_1.TableRow, { key: client.id, "data-selected": selection.selectedSet.has(client.id), className: "data-[selected=true]:bg-primary/5" },
                                React.createElement(table_1.TableCell, null,
                                    React.createElement("input", { type: "checkbox", checked: selection.selectedSet.has(client.id), onChange: function () { return selection.toggle(client.id); }, className: "h-4 w-4 rounded border-gray-300 cursor-pointer", "aria-label": "Select " + client.name })),
                                isVisible("client") && (React.createElement(table_1.TableCell, null,
                                    React.createElement("button", { className: "font-medium text-primary hover:underline cursor-pointer", onClick: function () { return handleViewClient(client.id); } }, client.name))),
                                isVisible("contact") && (React.createElement(table_1.TableCell, null,
                                    React.createElement("div", { className: "flex flex-col gap-1" },
                                        React.createElement("div", { className: "flex items-center gap-2 text-sm" },
                                            React.createElement(lucide_react_1.Mail, { className: "h-3 w-3 text-muted-foreground" }),
                                            client.email || "N/A")))),
                                isVisible("company") && (React.createElement(table_1.TableCell, { className: "truncate" }, client.company)),
                                isVisible("phone") && (React.createElement(table_1.TableCell, null,
                                    React.createElement("div", { className: "flex items-center gap-2 text-sm" },
                                        React.createElement(lucide_react_1.Phone, { className: "h-3 w-3 text-muted-foreground" }),
                                        client.phone || "N/A"))),
                                isVisible("address") && (React.createElement(table_1.TableCell, { className: "truncate max-w-[200px]" }, client.address || "N/A")),
                                isVisible("tags") && (React.createElement(table_1.TableCell, null,
                                    React.createElement("span", { className: "text-xs text-muted-foreground" }, "\u2014"))),
                                isVisible("category") && (React.createElement(table_1.TableCell, null,
                                    React.createElement("span", { className: "text-xs text-muted-foreground" }, "\u2014"))),
                                isVisible("projects") && (React.createElement(table_1.TableCell, null, client.projects)),
                                isVisible("revenue") && (React.createElement(table_1.TableCell, null,
                                    "Ksh ",
                                    client.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 }))),
                                isVisible("health") && (React.createElement(table_1.TableCell, null, (function () {
                                    var _a = computeClientHealth(client.id, plainInvoicesData, plainProjectsData), score = _a.score, label = _a.label, color = _a.color;
                                    return (React.createElement("div", { className: "flex items-center gap-2 min-w-[100px]" },
                                        React.createElement("div", { className: "flex-1 h-1.5 bg-muted rounded-full overflow-hidden" },
                                            React.createElement("div", { className: "h-full rounded-full transition-all", style: { width: score + "%", background: color } })),
                                        React.createElement("span", { className: "text-xs font-medium whitespace-nowrap", style: { color: color } }, label)));
                                })())),
                                isVisible("status") && (React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: client.status === "active" ? "default" : "secondary" }, client.status))),
                                isVisible("accountOwner") && (React.createElement(table_1.TableCell, null,
                                    React.createElement("span", { className: "text-xs text-muted-foreground" }, "\u2014"))),
                                React.createElement(table_1.TableCell, { className: "text-right" },
                                    React.createElement(RowActionsMenu_1.RowActionsMenu, { primaryActions: [
                                            { label: "Delete", icon: RowActionsMenu_1.actionIcons["delete"], onClick: function () { return handleDeleteClient(client.id, client.name); }, variant: "destructive" },
                                            { label: "Edit", icon: RowActionsMenu_1.actionIcons.edit, onClick: function () { return navigate("/clients/" + client.id + "/edit"); } },
                                            { label: "Email", icon: RowActionsMenu_1.actionIcons.email, onClick: function () { return navigate(communications_1.buildCommunicationComposePath(location, client.email, "Message for " + client.name)); } },
                                            { label: "View", icon: RowActionsMenu_1.actionIcons.view, onClick: function () { return handleViewClient(client.id); } },
                                        ], menuActions: [
                                            { label: "Client URL", icon: RowActionsMenu_1.actionIcons.copy, onClick: function () { navigator.clipboard.writeText(window.location.origin + "/clients/" + client.id); sonner_1.toast.success("URL copied"); } },
                                            { label: "Quick Edit", icon: RowActionsMenu_1.actionIcons.edit, onClick: function () { return navigate("/clients/" + client.id + "/edit"); } },
                                            { label: "Change Status", icon: React.createElement(lucide_react_1.Activity, { className: "h-4 w-4" }), onClick: function () { var newStatus = client.status === "active" ? "inactive" : "active"; updateClientMutation.mutate({ id: client.id, status: newStatus }); }, separator: true },
                                            { label: "Change Category", icon: React.createElement(lucide_react_1.FolderOpen, { className: "h-4 w-4" }), onClick: function () { return navigate("/clients/" + client.id + "/edit"); } },
                                            { label: "View Projects", icon: React.createElement(lucide_react_1.Building2, { className: "h-4 w-4" }), onClick: function () { return navigate("/clients/" + client.id + "?tab=projects"); }, separator: true },
                                            { label: "View Invoices", icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }), onClick: function () { return navigate("/clients/" + client.id + "?tab=invoices"); } },
                                        ], showStar: true, showDownload: true })))); }))))),
                    React.createElement(data_table_controls_1.PaginationControls, { total: filteredClients.length, page: page, pageSize: pageSize, onPageChange: setPage, onPageSizeChange: setPageSize }))))));
}
exports["default"] = Clients;
