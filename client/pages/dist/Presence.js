"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
function Presence() {
    var teamMembers = react_1.useState([
        {
            id: 1,
            name: 'Alice Johnson',
            avatar: '👩',
            status: 'online',
            currentPage: 'Dashboard',
            lastSeen: 'now',
            location: 'HQ - Office'
        },
        {
            id: 2,
            name: 'Bob Smith',
            avatar: '👨',
            status: 'online',
            currentPage: 'Reports',
            lastSeen: 'now',
            location: 'HQ - Office'
        },
        {
            id: 3,
            name: 'Charlie Brown',
            avatar: '👨‍💼',
            status: 'away',
            currentPage: 'Analytics',
            lastSeen: '5 min ago',
            location: 'Remote'
        },
        {
            id: 4,
            name: 'Diana Prince',
            avatar: '👩‍💼',
            status: 'offline',
            currentPage: null,
            lastSeen: '2 hours ago',
            location: 'Remote'
        },
    ])[0];
    var userActivity = react_1.useState([
        { user: 'Alice', action: 'viewed', item: 'Q1 Budget Report', time: '14:32' },
        { user: 'Bob', action: 'edited', item: 'Sales Dashboard', time: '14:28' },
        { user: 'Charlie', action: 'commented on', item: 'Project Plan', time: '14:15' },
        { user: 'Alice', action: 'created', item: 'New Workflow', time: '14:05' },
    ])[0];
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "Team Presence"),
        react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Online Now"),
                react_1["default"].createElement("div", { className: "text-3xl font-bold text-green-600" }, "2"),
                react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, "+ 1 away, 1 offline")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Team Size"),
                react_1["default"].createElement("div", { className: "text-3xl font-bold" }, "4"),
                react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, "All members"))),
        react_1["default"].createElement("div", { className: "bg-white rounded-lg shadow overflow-hidden" },
            react_1["default"].createElement("div", { className: "p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white" },
                react_1["default"].createElement("h2", { className: "font-semibold" }, "Team Presence Map")),
            react_1["default"].createElement("div", { className: "divide-y" }, teamMembers.map(function (member) { return (react_1["default"].createElement("div", { key: member.id, className: "p-4 hover:bg-gray-50 transition" },
                react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-2" },
                    react_1["default"].createElement("span", { className: "text-2xl" }, member.avatar),
                    react_1["default"].createElement("div", { className: "flex-1" },
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement("h3", { className: "font-semibold" }, member.name),
                            react_1["default"].createElement("div", { className: "w-3 h-3 rounded-full " + (member.status === 'online' ? 'bg-green-500' :
                                    member.status === 'away' ? 'bg-yellow-500' :
                                        'bg-gray-400') })),
                        react_1["default"].createElement("p", { className: "text-xs text-gray-600" }, member.currentPage ? "Viewing: " + member.currentPage : 'Offline')),
                    react_1["default"].createElement("div", { className: "text-right" },
                        react_1["default"].createElement("div", { className: "text-xs font-medium text-gray-600 flex items-center gap-1" },
                            react_1["default"].createElement(lucide_react_1.MapPin, { className: "w-3 h-3" }),
                            member.location),
                        react_1["default"].createElement("div", { className: "text-xs text-gray-500" }, member.lastSeen))))); }))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Live Activity Stream"),
            react_1["default"].createElement("div", { className: "space-y-3" }, userActivity.map(function (activity, i) { return (react_1["default"].createElement("div", { key: i, className: "flex items-center gap-3 p-3 border rounded" },
                react_1["default"].createElement(lucide_react_1.Circle, { className: "w-2 h-2 " + (i === 0 ? 'fill-green-500 text-green-500' : 'fill-gray-300 text-gray-300') }),
                react_1["default"].createElement("div", { className: "flex-1" },
                    react_1["default"].createElement("div", { className: "text-sm" },
                        react_1["default"].createElement("span", { className: "font-semibold" }, activity.user),
                        ' ',
                        react_1["default"].createElement("span", { className: "text-gray-600" }, activity.action),
                        ' ',
                        react_1["default"].createElement("span", { className: "font-medium" }, activity.item))),
                react_1["default"].createElement("div", { className: "text-xs text-gray-500" }, activity.time))); }))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Presence Settings"),
            react_1["default"].createElement("div", { className: "space-y-3" }, [
                { name: 'Show my presence to team', enabled: true },
                { name: 'Show current page', enabled: true },
                { name: 'Show typing status', enabled: true },
                { name: 'Share location', enabled: false },
            ].map(function (setting) { return (react_1["default"].createElement("div", { key: setting.name, className: "flex items-center justify-between p-2" },
                react_1["default"].createElement("span", { className: "text-sm" }, setting.name),
                react_1["default"].createElement("button", { className: "px-3 py-1 rounded text-xs font-medium " + (setting.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800') }, setting.enabled ? '✓' : '✗'))); })))));
}
exports["default"] = Presence;
