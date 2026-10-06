"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var useUserLookup_1 = require("@/hooks/useUserLookup");
function VersionControl() {
    var _a, _b, _c, _d, _e;
    var getUserName = useUserLookup_1.useUserLookup().getUserName;
    var _f = trpc_1.trpc.fileStorage.listDocuments.useQuery({ limit: 50 }), documents = _f.data, isLoading = _f.isLoading;
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center min-h-screen" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-slate-600" }));
    var docs = documents ? JSON.parse(JSON.stringify(documents)) : { documents: [], total: 0 };
    var docList = (_b = (_a = docs.documents) !== null && _a !== void 0 ? _a : docs.files) !== null && _b !== void 0 ? _b : [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Version Control", icon: React.createElement(lucide_react_1.GitBranch, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "System" }, { label: "Version Control" }] },
        React.createElement("h1", { className: "text-3xl font-bold text-slate-900 flex items-center gap-2" },
            React.createElement(lucide_react_1.GitBranch, { size: 32 }),
            " Version Control"),
        React.createElement("div", { className: "grid grid-cols-4 gap-4" }, [
            { title: "Total Documents", value: String((_c = docs.total) !== null && _c !== void 0 ? _c : docList.length) },
            { title: "Latest Version", value: (_e = (_d = docList[0]) === null || _d === void 0 ? void 0 : _d.version) !== null && _e !== void 0 ? _e : "—" },
            { title: "Authors", value: String(new Set(docList.map(function (d) { var _a; return (_a = d.createdBy) !== null && _a !== void 0 ? _a : d.uploadedBy; })).size) },
            { title: "File Types", value: String(new Set(docList.map(function (d) { var _a; return (_a = d.type) !== null && _a !== void 0 ? _a : d.mimeType; })).size) },
        ].map(function (stat, idx) { return (React.createElement("div", { key: idx, className: "bg-white p-4 rounded-lg shadow border-l-4 border-slate-600" },
            React.createElement("p", { className: "text-sm text-slate-600" }, stat.title),
            React.createElement("p", { className: "text-2xl font-bold text-slate-900" }, stat.value))); })),
        React.createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            React.createElement("h2", { className: "text-lg font-semibold text-slate-900 mb-4" }, "Document Versions"),
            docList.length === 0 ? (React.createElement("p", { className: "text-slate-500 text-center py-8" }, "No documents found.")) : (React.createElement("div", { className: "space-y-3" }, docList.map(function (doc, idx) {
                var _a, _b, _c, _d, _e, _f;
                return (React.createElement("div", { key: (_a = doc.id) !== null && _a !== void 0 ? _a : idx, className: "p-4 bg-slate-50 rounded-lg flex justify-between items-center" },
                    React.createElement("div", null,
                        React.createElement("p", { className: "font-bold text-slate-900" }, (_c = (_b = doc.name) !== null && _b !== void 0 ? _b : doc.fileName) !== null && _c !== void 0 ? _c : "Document"),
                        React.createElement("p", { className: "text-sm text-slate-600" },
                            getUserName((_d = doc.createdBy) !== null && _d !== void 0 ? _d : doc.uploadedBy) || "—",
                            " ",
                            doc.createdAt ? "\u2022 " + new Date(doc.createdAt).toLocaleDateString() : "")),
                    React.createElement("div", { className: "text-right" },
                        React.createElement("p", { className: "text-sm text-slate-600" }, (_e = doc.size) !== null && _e !== void 0 ? _e : "—"),
                        React.createElement("span", { className: "px-2 py-1 text-xs font-bold rounded mt-1 inline-block " + (idx === 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700") }, idx === 0 ? "CURRENT" : "v" + ((_f = doc.version) !== null && _f !== void 0 ? _f : docList.length - idx)))));
            }))))));
}
exports["default"] = VersionControl;
