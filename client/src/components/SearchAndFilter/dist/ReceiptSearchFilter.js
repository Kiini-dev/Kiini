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
exports.ReceiptSearchFilter = void 0;
var react_1 = require("react");
var input_1 = require("@/components/ui/input");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var popover_1 = require("@/components/ui/popover");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var paymentMethods_1 = require("@/const/paymentMethods");
function ReceiptSearchFilter(_a) {
    var onSearch = _a.onSearch, onFilter = _a.onFilter, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b;
    var _c = react_1.useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = react_1.useState({
        paymentMethod: "all",
        sortBy: "date",
        sortOrder: "desc"
    }), filters = _d[0], setFilters = _d[1];
    var _e = react_1.useState(false), isOpen = _e[0], setIsOpen = _e[1];
    var handleSearch = react_1.useCallback(function (value) {
        setSearchQuery(value);
        onSearch(value);
    }, [onSearch]);
    var handleFilterChange = react_1.useCallback(function (key, value) {
        var _a;
        var newFilters = __assign(__assign({}, filters), (_a = {}, _a[key] = value, _a));
        setFilters(newFilters);
        onFilter(newFilters);
    }, [filters, onFilter]);
    var handleClearFilters = react_1.useCallback(function () {
        setSearchQuery("");
        var defaultFilters = {
            paymentMethod: "all",
            sortBy: "date",
            sortOrder: "desc"
        };
        setFilters(defaultFilters);
        onFilter(defaultFilters);
        onSearch("");
    }, [onFilter, onSearch]);
    var hasActiveFilters = searchQuery ||
        filters.paymentMethod !== "all" ||
        filters.sortBy !== "date" ||
        filters.sortOrder !== "desc";
    return (React.createElement("div", { className: "flex items-center gap-2" },
        React.createElement("div", { className: "relative flex-1" },
            React.createElement(lucide_react_1.Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }),
            React.createElement(input_1.Input, { placeholder: "Search receipts...", value: searchQuery, onChange: function (e) { return handleSearch(e.target.value); }, className: "pl-8", disabled: isLoading })),
        React.createElement(popover_1.Popover, { open: isOpen, onOpenChange: setIsOpen },
            React.createElement(popover_1.PopoverTrigger, { asChild: true },
                React.createElement(button_1.Button, { variant: "outline", size: "icon", className: utils_1.cn(hasActiveFilters && "bg-blue-50 text-blue-600") },
                    React.createElement(lucide_react_1.Filter, { className: "h-4 w-4" }))),
            React.createElement(popover_1.PopoverContent, { className: "w-80", align: "end" },
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement("label", { className: "text-sm font-medium" }, "Payment Method"),
                        React.createElement(select_1.Select, { value: filters.paymentMethod || "all", onValueChange: function (value) {
                                return handleFilterChange("paymentMethod", value);
                            } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Methods"),
                                paymentMethods_1.getPaymentMethodOptions().map(function (method) { return (React.createElement(select_1.SelectItem, { key: method.value, value: method.value }, method.label)); })))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement("label", { className: "text-sm font-medium" }, "Sort By"),
                        React.createElement(select_1.Select, { value: filters.sortBy || "date", onValueChange: function (value) {
                                return handleFilterChange("sortBy", value);
                            } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "date" }, "Date"),
                                React.createElement(select_1.SelectItem, { value: "amount" }, "Amount"),
                                React.createElement(select_1.SelectItem, { value: "client" }, "Client")))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement("label", { className: "text-sm font-medium" }, "Order"),
                        React.createElement(select_1.Select, { value: filters.sortOrder || "desc", onValueChange: function (value) {
                                return handleFilterChange("sortOrder", value);
                            } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "asc" }, "Ascending"),
                                React.createElement(select_1.SelectItem, { value: "desc" }, "Descending")))),
                    React.createElement("div", { className: "flex gap-2 pt-2" },
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleClearFilters, className: "flex-1" },
                            React.createElement(lucide_react_1.X, { className: "mr-1 h-4 w-4" }),
                            "Clear")))))));
}
exports.ReceiptSearchFilter = ReceiptSearchFilter;
