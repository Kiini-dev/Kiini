"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var table_1 = require("@/components/ui/table");
function CustomFields() {
    var _a, _b, _c;
    var settingsQuery = trpc_1.trpc.settings.getByCategory.useQuery({ category: "custom_fields" });
    var items = (_a = settingsQuery.data) !== null && _a !== void 0 ? _a : ((_c = (_b = settingsQuery.data) === null || _b === void 0 ? void 0 : _b.settings) !== null && _c !== void 0 ? _c : []);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Custom Fields", icon: React.createElement(lucide_react_1.Settings, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Tools" },
            { label: "Custom Fields" },
        ] },
        settingsQuery.isLoading && (React.createElement("div", { className: "flex justify-center py-8" },
            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))),
        settingsQuery.error && (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
            "Error: ",
            settingsQuery.error.message)),
        !settingsQuery.isLoading && !settingsQuery.error && items.length === 0 && (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No data found.")),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null,
                    "Configured Fields (",
                    items.length,
                    ")")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Field Name"),
                                React.createElement(table_1.TableHead, null, "Type"),
                                React.createElement(table_1.TableHead, null, "Entity"),
                                React.createElement(table_1.TableHead, null, "Required"),
                                React.createElement(table_1.TableHead, null, "Status"))),
                        React.createElement(table_1.TableBody, null, items.map(function (field, idx) {
                            var _a, _b, _c, _d, _e, _f, _g;
                            return (React.createElement(table_1.TableRow, { key: (_a = field.id) !== null && _a !== void 0 ? _a : idx },
                                React.createElement(table_1.TableCell, { className: "font-medium" }, (_c = (_b = field.name) !== null && _b !== void 0 ? _b : field.key) !== null && _c !== void 0 ? _c : "—"),
                                React.createElement(table_1.TableCell, null, (_e = (_d = field.type) !== null && _d !== void 0 ? _d : field.fieldType) !== null && _e !== void 0 ? _e : "—"),
                                React.createElement(table_1.TableCell, null, (_g = (_f = field.entity) !== null && _f !== void 0 ? _f : field.module) !== null && _g !== void 0 ? _g : "—"),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: field.required ? "default" : "secondary" }, field.required ? "Required" : "Optional")),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { className: field.active !== false ? "bg-green-100 text-green-800 border-0" : "bg-gray-100 text-gray-600 border-0" }, field.active !== false ? "Active" : "Inactive"))));
                        }))))))));
}
exports["default"] = CustomFields;
