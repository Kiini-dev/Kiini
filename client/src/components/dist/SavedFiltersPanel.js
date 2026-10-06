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
exports.SavedFiltersPanel = void 0;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var dialog_1 = require("@/components/ui/dialog");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var badge_1 = require("@/components/ui/badge");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
function SavedFiltersPanel(_a) {
    var _this = this;
    var moduleName = _a.moduleName, currentFilters = _a.currentFilters, onLoadFilter = _a.onLoadFilter, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b;
    var _c = react_1.useState(false), isSaveDialogOpen = _c[0], setIsSaveDialogOpen = _c[1];
    var _d = react_1.useState(""), filterName = _d[0], setFilterName = _d[1];
    var _e = react_1.useState(""), filterDescription = _e[0], setFilterDescription = _e[1];
    var _f = react_1.useState(false), deleteDialogOpen = _f[0], setDeleteDialogOpen = _f[1];
    var _g = react_1.useState(null), selectedFilterId = _g[0], setSelectedFilterId = _g[1];
    var _h = react_1.useState(false), isLoadingFilters = _h[0], setIsLoadingFilters = _h[1];
    // Fetch saved filters
    var _j = trpc_1.trpc.savedFilters.listByModule.useQuery({ moduleName: moduleName }, { enabled: true }), _k = _j.data, savedFilters = _k === void 0 ? [] : _k, refetchFilters = _j.refetch;
    // Mutations
    var createFilterMutation = trpc_1.trpc.savedFilters.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Filter saved successfully");
            setFilterName("");
            setFilterDescription("");
            setIsSaveDialogOpen(false);
            refetchFilters();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to save filter");
        }
    });
    var deleteFilterMutation = trpc_1.trpc.savedFilters["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Filter deleted successfully");
            setDeleteDialogOpen(false);
            setSelectedFilterId(null);
            refetchFilters();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete filter");
        }
    });
    var setDefaultMutation = trpc_1.trpc.savedFilters.setDefault.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Default filter updated");
            refetchFilters();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to set default filter");
        }
    });
    var handleSaveFilter = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!filterName.trim()) {
                sonner_1.toast.error("Filter name is required");
                return [2 /*return*/];
            }
            createFilterMutation.mutate({
                moduleName: moduleName,
                filterName: filterName.trim(),
                description: filterDescription.trim() || undefined,
                filterConfig: currentFilters
            });
            return [2 /*return*/];
        });
    }); };
    var handleLoadFilter = function (filter) {
        onLoadFilter(filter.filterConfig);
        sonner_1.toast.success("Loaded filter: " + filter.filterName);
    };
    var handleDeleteFilter = function (filterId) {
        setSelectedFilterId(filterId);
        setDeleteDialogOpen(true);
    };
    var confirmDelete = function () {
        if (selectedFilterId) {
            deleteFilterMutation.mutate({ id: selectedFilterId });
        }
    };
    var handleSetDefault = function (filterId) {
        setDefaultMutation.mutate({ id: filterId, moduleName: moduleName });
    };
    var hasFilters = Object.values(currentFilters).some(function (value) { return value !== undefined && value !== null && value !== ""; });
    return (React.createElement("div", { className: "flex items-center gap-2" },
        React.createElement(dialog_1.Dialog, { open: isSaveDialogOpen, onOpenChange: setIsSaveDialogOpen },
            React.createElement(dialog_1.DialogTrigger, { asChild: true },
                React.createElement(button_1.Button, { variant: "outline", size: "sm", disabled: !hasFilters || isLoading, className: "gap-2" },
                    React.createElement(lucide_react_1.Save, { className: "h-4 w-4" }),
                    "Save Filter")),
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Save Current Filter"),
                    React.createElement(dialog_1.DialogDescription, null, "Give your filter a name and optional description for easy access later.")),
                React.createElement("div", { className: "space-y-4 py-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "filter-name" }, "Filter Name *"),
                        React.createElement(input_1.Input, { id: "filter-name", placeholder: "e.g., High-value invoices", value: filterName, onChange: function (e) { return setFilterName(e.target.value); }, disabled: createFilterMutation.isPending })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "filter-description" }, "Description"),
                        React.createElement(textarea_1.Textarea, { id: "filter-description", placeholder: "Optional description of this filter...", value: filterDescription, onChange: function (e) { return setFilterDescription(e.target.value); }, disabled: createFilterMutation.isPending, rows: 3 })),
                    React.createElement("div", { className: "flex justify-end gap-2" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsSaveDialogOpen(false); }, disabled: createFilterMutation.isPending }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: handleSaveFilter, disabled: createFilterMutation.isPending }, createFilterMutation.isPending ? (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                            "Saving...")) : ("Save Filter")))))),
        savedFilters.length > 0 && (React.createElement(dropdown_menu_1.DropdownMenu, null,
            React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "gap-2" },
                    React.createElement(lucide_react_1.Bookmark, { className: "h-4 w-4" }),
                    "Load Filter",
                    React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" }))),
            React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-56" },
                savedFilters.map(function (filter) { return (React.createElement("div", { key: filter.id },
                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleLoadFilter(filter); }, className: "flex items-center justify-between cursor-pointer" },
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("span", null, filter.filterName),
                                filter.isDefault && (React.createElement(lucide_react_1.Star, { className: "h-3 w-3 fill-yellow-400 text-yellow-400" }))),
                            filter.description && (React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, filter.description)))),
                    React.createElement(dropdown_menu_1.DropdownMenuSeparator, null))); }),
                React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () {
                        // Show filter management options
                    }, className: "text-xs text-muted-foreground" },
                    savedFilters.length,
                    " saved filter",
                    savedFilters.length !== 1 ? "s" : "")))),
        savedFilters.length > 0 && (React.createElement(dropdown_menu_1.DropdownMenu, null,
            React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "gap-2" },
                    React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" }))),
            React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-64" },
                React.createElement("div", { className: "p-2 text-sm font-semibold" }, "Manage Filters"),
                React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                savedFilters.map(function (filter) { return (React.createElement("div", { key: filter.id, className: "p-2 space-y-2 border-b last:border-b-0" },
                    React.createElement("div", { className: "flex items-start justify-between" },
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("span", { className: "font-medium text-sm" }, filter.filterName),
                                filter.isDefault && (React.createElement(badge_1.Badge, { variant: "secondary", className: "text-xs" }, "Default"))),
                            filter.description && (React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, filter.description)))),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-7 text-xs flex-1", onClick: function () { return handleLoadFilter(filter); } }, "Load"),
                        !filter.isDefault && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-7 text-xs flex-1", onClick: function () { return handleSetDefault(filter.id); }, disabled: setDefaultMutation.isPending },
                            React.createElement(lucide_react_1.Star, { className: "h-3 w-3 mr-1" }),
                            "Set Default")),
                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-7 text-xs text-red-600 hover:text-red-700", onClick: function () { return handleDeleteFilter(filter.id); } },
                            React.createElement(lucide_react_1.Trash2, { className: "h-3 w-3" }))))); })))),
        React.createElement(alert_dialog_1.AlertDialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Filter"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null, "Are you sure you want to delete this saved filter? This action cannot be undone."),
                React.createElement("div", { className: "flex gap-2 justify-end" },
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { onClick: confirmDelete, className: "hover:opacity-90", style: { background: 'var(--destructive)', color: 'var(--destructive-foreground)' }, disabled: deleteFilterMutation.isPending }, deleteFilterMutation.isPending ? (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        "Deleting...")) : ("Delete")))))));
}
exports.SavedFiltersPanel = SavedFiltersPanel;
