"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
/**
 * Global Header Search Modal
 * Searchable index of all major entities: clients, invoices, projects, users, tasks, contacts
 * Shows autocomplete results as user types
 */
function HeaderSearchModal(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose;
    var _b = react_1.useState(''), query = _b[0], setQuery = _b[1];
    var _c = react_1.useState([]), results = _c[0], setResults = _c[1];
    var _d = react_1.useState(false), loading = _d[0], setLoading = _d[1];
    var _e = react_1.useState(0), selectedIndex = _e[0], setSelectedIndex = _e[1];
    // Example data - TODO: Replace with actual API calls
    var allItems = [
        // Clients
        {
            id: 'cli_001',
            title: 'Acme Corporation',
            type: 'client',
            description: 'Tech solutions provider',
            icon: react_1["default"].createElement(lucide_react_1.Briefcase, { size: 16, className: "text-blue-500" })
        },
        {
            id: 'cli_002',
            title: 'Global Retail Ltd',
            type: 'client',
            description: 'Retail and e-commerce',
            icon: react_1["default"].createElement(lucide_react_1.Briefcase, { size: 16, className: "text-blue-500" })
        },
        // Invoices
        {
            id: 'inv_001',
            title: 'Invoice #INV-2024-001',
            type: 'invoice',
            description: 'Amount: $5,000 | Due: 2025-04-01',
            icon: react_1["default"].createElement(lucide_react_1.DollarSign, { size: 16, className: "text-green-500" })
        },
        {
            id: 'inv_002',
            title: 'Invoice #INV-2024-002',
            type: 'invoice',
            description: 'Amount: $8,750 | Due: 2025-04-15',
            icon: react_1["default"].createElement(lucide_react_1.DollarSign, { size: 16, className: "text-green-500" })
        },
        // Users
        {
            id: 'usr_001',
            title: 'John Kipchoge',
            type: 'user',
            description: 'CEO | john@example.com',
            icon: react_1["default"].createElement(lucide_react_1.Users, { size: 16, className: "text-purple-500" })
        },
        {
            id: 'usr_002',
            title: 'Sarah Mwangi',
            type: 'user',
            description: 'Finance Manager | sarah@example.com',
            icon: react_1["default"].createElement(lucide_react_1.Users, { size: 16, className: "text-purple-500" })
        },
        // Projects
        {
            id: 'prj_001',
            title: 'Q2 Product Launch',
            type: 'project',
            description: '12 tasks | 80% complete',
            icon: react_1["default"].createElement(lucide_react_1.TrendingUp, { size: 16, className: "text-orange-500" })
        },
        {
            id: 'prj_002',
            title: 'Website Redesign',
            type: 'project',
            description: '8 tasks | 50% complete',
            icon: react_1["default"].createElement(lucide_react_1.TrendingUp, { size: 16, className: "text-orange-500" })
        },
        // Tasks
        {
            id: 'tsk_001',
            title: 'Follow up with client',
            type: 'task',
            description: 'Due: 2025-03-28 | High priority',
            icon: react_1["default"].createElement(lucide_react_1.Clock, { size: 16, className: "text-red-500" })
        },
        {
            id: 'tsk_002',
            title: 'Prepare monthly report',
            type: 'task',
            description: 'Due: 2025-04-05 | Medium priority',
            icon: react_1["default"].createElement(lucide_react_1.Clock, { size: 16, className: "text-red-500" })
        },
        // Contacts
        {
            id: 'cnt_001',
            title: 'Jane Smith',
            type: 'contact',
            description: 'Contact | Acme Corporation | jane@acme.com',
            icon: react_1["default"].createElement(lucide_react_1.FileText, { size: 16, className: "text-pink-500" })
        },
        {
            id: 'cnt_002',
            title: 'Mike Johnson',
            type: 'contact',
            description: 'Contact | Global Retail Ltd | mike@global.com',
            icon: react_1["default"].createElement(lucide_react_1.FileText, { size: 16, className: "text-pink-500" })
        },
    ];
    // Perform search with debounce
    react_1.useEffect(function () {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        setLoading(true);
        var timer = setTimeout(function () {
            var lowerQuery = query.toLowerCase();
            // Filter and score results
            var filtered = allItems
                .filter(function (item) {
                var _a;
                return item.title.toLowerCase().includes(lowerQuery) || ((_a = item.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(lowerQuery)) ||
                    item.type.includes(lowerQuery);
            })
                .sort(function (a, b) {
                // Score by relevance: title match > description match
                var aMatchesTitle = a.title.toLowerCase().includes(lowerQuery);
                var bMatchesTitle = b.title.toLowerCase().includes(lowerQuery);
                if (aMatchesTitle && !bMatchesTitle)
                    return -1;
                if (!aMatchesTitle && bMatchesTitle)
                    return 1;
                return 0;
            })
                .slice(0, 10); // Limit to top 10 results
            setResults(filtered);
            setSelectedIndex(0);
            setLoading(false);
        }, 300);
        return function () { return clearTimeout(timer); };
    }, [query]);
    // Keyboard navigation
    var handleKeyDown = function (e) {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(function (prev) { return Math.min(prev + 1, results.length - 1); });
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(function (prev) { return Math.max(prev - 1, 0); });
                break;
            case 'Enter':
                e.preventDefault();
                if (results[selectedIndex]) {
                    handleSelectResult(results[selectedIndex]);
                }
                break;
            case 'Escape':
                onClose();
                break;
            default:
                break;
        }
    };
    var handleSelectResult = function (result) {
        // TODO: Route to the selected item
        console.log('Selected:', result);
        // Example: navigate(`/crm/clients/${result.id}`);
        onClose();
    };
    var getTypeLabel = function (type) {
        var labels = {
            client: 'Client',
            invoice: 'Invoice',
            user: 'User',
            project: 'Project',
            task: 'Task',
            contact: 'Contact'
        };
        return labels[type] || type;
    };
    var getTypeColor = function (type) {
        var colors = {
            client: 'bg-blue-100 text-blue-700',
            invoice: 'bg-green-100 text-green-700',
            user: 'bg-purple-100 text-purple-700',
            project: 'bg-orange-100 text-orange-700',
            task: 'bg-red-100 text-red-700',
            contact: 'bg-pink-100 text-pink-700'
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };
    if (!isOpen)
        return null;
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("div", { className: "fixed inset-0 bg-black/30 z-40", onClick: onClose }),
        react_1["default"].createElement("div", { className: "fixed inset-0 z-50 flex items-start justify-center pt-20" },
            react_1["default"].createElement("div", { className: "w-full max-w-2xl" },
                react_1["default"].createElement("div", { className: "bg-white rounded-t-lg shadow-lg p-4 border-b" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                        react_1["default"].createElement(lucide_react_1.Search, { size: 20, className: "text-gray-400" }),
                        react_1["default"].createElement("input", { autoFocus: true, type: "text", value: query, onChange: function (e) { return setQuery(e.target.value); }, onKeyDown: handleKeyDown, placeholder: "Search clients, invoices, projects, users, tasks...", className: "flex-1 outline-none text-lg" }),
                        react_1["default"].createElement("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600" },
                            react_1["default"].createElement(lucide_react_1.X, { size: 20 }))),
                    !query && (react_1["default"].createElement("div", { className: "mt-4 p-2 bg-blue-50 rounded text-sm text-gray-600" }, "\uD83D\uDCA1 Try searching by: Client name, Invoice number, User name, Project title, or Task description"))),
                react_1["default"].createElement("div", { className: "bg-white rounded-b-lg shadow-lg max-h-96 overflow-y-auto" }, loading ? (react_1["default"].createElement("div", { className: "p-8 text-center text-gray-500" },
                    react_1["default"].createElement("div", { className: "inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" }),
                    react_1["default"].createElement("p", { className: "mt-2" }, "Searching..."))) : results.length === 0 ? (react_1["default"].createElement("div", { className: "p-8 text-center text-gray-500" }, query ? '❌ No results found' : '👋 Start typing to search')) : (react_1["default"].createElement("div", { className: "divide-y" }, results.map(function (result, index) { return (react_1["default"].createElement("button", { key: result.id, onClick: function () { return handleSelectResult(result); }, className: "w-full text-left px-4 py-3 transition " + (index === selectedIndex
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'hover:bg-gray-50') },
                    react_1["default"].createElement("div", { className: "flex items-start gap-3" },
                        react_1["default"].createElement("div", { className: "mt-1" }, result.icon),
                        react_1["default"].createElement("div", { className: "flex-1 min-w-0" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-1" },
                                react_1["default"].createElement("p", { className: "font-semibold text-gray-900 truncate" }, result.title),
                                react_1["default"].createElement("span", { className: "text-xs font-medium px-2 py-1 rounded whitespace-nowrap " + getTypeColor(result.type) }, getTypeLabel(result.type))),
                            result.description && (react_1["default"].createElement("p", { className: "text-sm text-gray-600 truncate" }, result.description))),
                        react_1["default"].createElement("div", { className: "text-gray-300 mt-1" }, "\u2192")))); })))),
                results.length > 0 && (react_1["default"].createElement("div", { className: "bg-gray-50 rounded-b-lg px-4 py-3 text-xs text-gray-500 border-t" },
                    react_1["default"].createElement("kbd", { className: "px-2 py-1 bg-white border rounded text-gray-700" }, "\u2191\u2193"),
                    react_1["default"].createElement("span", { className: "mx-2" }, "to navigate"),
                    react_1["default"].createElement("kbd", { className: "px-2 py-1 bg-white border rounded text-gray-700" }, "\u23CE"),
                    react_1["default"].createElement("span", { className: "mx-2" }, "to select"),
                    react_1["default"].createElement("kbd", { className: "px-2 py-1 bg-white border rounded text-gray-700" }, "Esc"),
                    react_1["default"].createElement("span", { className: "mx-2" }, "to close")))))));
}
exports["default"] = HeaderSearchModal;
