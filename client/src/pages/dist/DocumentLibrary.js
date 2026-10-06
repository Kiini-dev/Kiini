"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var card_1 = require("@/components/ui/card");
function DocumentLibrary() {
    var _a;
    var docsQuery = trpc_1.trpc.fileStorage.listDocuments.useQuery({});
    var documents = (_a = docsQuery.data) !== null && _a !== void 0 ? _a : [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Document Library", icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Documents" },
            { label: "Library" },
        ] },
        docsQuery.isLoading && (React.createElement("div", { className: "flex justify-center py-8" },
            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))),
        docsQuery.error && (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
            "Error: ",
            docsQuery.error.message)),
        !docsQuery.isLoading && !docsQuery.error && documents.length === 0 && (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No data found.")),
        documents.length > 0 && (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null,
                    "Documents (",
                    documents.length,
                    ")")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "space-y-2" }, documents.map(function (doc, idx) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                    return (React.createElement("div", { key: (_a = doc.id) !== null && _a !== void 0 ? _a : idx, className: "p-3 bg-slate-50 rounded-lg flex items-center justify-between hover:bg-slate-100" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-medium text-slate-900" }, (_c = (_b = doc.name) !== null && _b !== void 0 ? _b : doc.fileName) !== null && _c !== void 0 ? _c : "—"),
                            React.createElement("p", { className: "text-sm text-slate-600" }, (_e = (_d = doc.owner) !== null && _d !== void 0 ? _d : doc.uploadedBy) !== null && _e !== void 0 ? _e : "—",
                                " \u2022 ", (_g = (_f = doc.size) !== null && _f !== void 0 ? _f : doc.fileSize) !== null && _g !== void 0 ? _g : "—")),
                        React.createElement("span", { className: "text-sm text-slate-500" }, (_j = (_h = doc.updatedAt) !== null && _h !== void 0 ? _h : doc.createdAt) !== null && _j !== void 0 ? _j : "—")));
                })))))));
}
exports["default"] = DocumentLibrary;
