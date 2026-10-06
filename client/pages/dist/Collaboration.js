"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
function Collaboration() {
    var documents = react_1.useState([
        {
            id: 1,
            name: 'Q1 Planning Document',
            collaborators: ['Alice', 'Bob', 'Charlie'],
            lastModified: '2026-03-16 14:32',
            status: 'editing',
            version: 23
        },
        {
            id: 2,
            name: 'Budget Review',
            collaborators: ['Alice', 'Diana'],
            lastModified: '2026-03-16 12:15',
            status: 'viewing',
            version: 18
        },
        {
            id: 3,
            name: 'Product Roadmap',
            collaborators: ['Bob', 'Charlie'],
            lastModified: '2026-03-15 09:40',
            status: 'idle',
            version: 42
        },
    ])[0];
    var activeSession = react_1.useState('Q1 Planning Document')[0];
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "Collaborative Editing"),
        react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4" },
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Active Sessions"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "3"),
                react_1["default"].createElement("div", { className: "text-xs text-green-600" }, "5 users total")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Conflicts Resolved"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "0"),
                react_1["default"].createElement("div", { className: "text-xs text-green-600" }, "No issues")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Sync Status"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold text-green-600" }, "\u2713 Live"),
                react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, "All docs synced"))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Active Collaborations"),
            react_1["default"].createElement("div", { className: "space-y-3" }, documents.map(function (doc) { return (react_1["default"].createElement("div", { key: doc.id, className: "p-4 border rounded-lg hover:shadow-md transition" },
                react_1["default"].createElement("div", { className: "flex items-start justify-between mb-2" },
                    react_1["default"].createElement("div", { className: "flex-1" },
                        react_1["default"].createElement("h3", { className: "font-semibold" }, doc.name),
                        react_1["default"].createElement("p", { className: "text-xs text-gray-600 mt-1" },
                            "v",
                            doc.version,
                            " \u2022 Modified ",
                            doc.lastModified)),
                    react_1["default"].createElement("span", { className: "text-xs px-2 py-1 rounded font-medium " + (doc.status === 'editing' ? 'bg-blue-100 text-blue-800' :
                            doc.status === 'viewing' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800') }, doc.status === 'editing' ? '✎ Editing' : doc.status === 'viewing' ? '👁 View' : 'Idle')),
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Users, { className: "w-4 h-4 text-gray-400" }),
                    react_1["default"].createElement("div", { className: "flex -space-x-2" }, doc.collaborators.map(function (col, i) { return (react_1["default"].createElement("div", { key: i, className: "w-6 h-6 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center border-2 border-white" }, col[0])); })),
                    react_1["default"].createElement("span", { className: "text-sm text-gray-600" },
                        doc.collaborators.length,
                        " collaborating")))); }))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" },
                "Current Session: ",
                activeSession),
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h3", { className: "font-semibold mb-2" }, "Active Contributors"),
                    react_1["default"].createElement("div", { className: "space-y-2" }, [
                        { name: 'Alice Johnson', role: 'Editing', cursor: 'Line 23, Col 45', color: 'bg-red-500' },
                        { name: 'Bob Smith', role: 'Viewing', cursor: 'Line 18, Col 12', color: 'bg-blue-500' },
                        { name: 'Charlie Brown', role: 'Editing', cursor: 'Line 1, Col 1', color: 'bg-green-500' },
                    ].map(function (contributor) { return (react_1["default"].createElement("div", { key: contributor.name, className: "flex items-center gap-3 p-2 border rounded" },
                        react_1["default"].createElement("div", { className: "w-3 h-3 rounded " + contributor.color }),
                        react_1["default"].createElement("div", { className: "flex-1" },
                            react_1["default"].createElement("div", { className: "font-medium text-sm" }, contributor.name),
                            react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, contributor.cursor)),
                        react_1["default"].createElement("span", { className: "text-xs text-gray-500" }, contributor.role))); }))),
                react_1["default"].createElement("div", { className: "border-t pt-4" },
                    react_1["default"].createElement("h3", { className: "font-semibold mb-2" }, "Recent Changes"),
                    react_1["default"].createElement("div", { className: "space-y-2" }, [
                        { user: 'Alice', action: 'Added paragraph', time: '14:34' },
                        { user: 'Bob', action: 'Formatted text', time: '14:32' },
                        { user: 'Charlie', action: 'Updated section', time: '14:30' },
                    ].map(function (change, i) { return (react_1["default"].createElement("div", { key: i, className: "text-xs p-2 border-l-2 border-blue-400" },
                        react_1["default"].createElement("div", { className: "font-medium" },
                            change.user,
                            " ",
                            change.action),
                        react_1["default"].createElement("div", { className: "text-gray-600" }, change.time))); }))))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Collaboration Tools"),
            react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-3" }, [
                { icon: '💬', name: 'Comments', action: 'Add comment' },
                { icon: '✓', name: 'Tasks', action: 'Create task' },
                { icon: '🔁', name: 'Version History', action: 'View versions' },
            ].map(function (tool) { return (react_1["default"].createElement("button", { key: tool.name, className: "p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center" },
                react_1["default"].createElement("div", { className: "text-2xl mb-1" }, tool.icon),
                react_1["default"].createElement("div", { className: "font-medium text-sm" }, tool.name),
                react_1["default"].createElement("div", { className: "text-xs text-gray-600 mt-1" }, tool.action))); })))));
}
exports["default"] = Collaboration;
