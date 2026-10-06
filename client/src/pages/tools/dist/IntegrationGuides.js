"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var utils_1 = require("@/lib/utils");
var INTEGRATION_GUIDES = [
    {
        id: "theme-integration",
        title: "Integrate Theme Customization",
        description: "Learn how to programmatically apply custom theme settings in your codebase",
        icon: React.createElement(lucide_react_1.Palette, { className: "h-6 w-6" }),
        category: "theme",
        difficulty: "beginner",
        steps: [
            {
                title: "Import Theme Hook",
                description: "Import the useTheme hook from the contexts directory",
                code: "import { useTheme } from '@/contexts/ThemeContext';"
            },
            {
                title: "Access Theme Config",
                description: "Use the hook in your component to get current theme settings",
                code: "const { theme, setTheme } = useTheme();"
            },
            {
                title: "Apply Theme Classes",
                description: "Apply theme classes to your components",
                code: "<div className={theme.darkMode ? 'bg-slate-900' : 'bg-white'}>\n  Your content here\n</div>"
            },
        ],
        links: [
            { label: "Theme Context Documentation", url: "#" },
            { label: "Color Palette Reference", url: "#" },
            { label: "Theme Examples", url: "#" },
        ]
    },
    {
        id: "brand-integration",
        title: "Integrate Brand Customization",
        description: "Apply brand colors and typography across your application",
        icon: React.createElement(lucide_react_1.Zap, { className: "h-6 w-6" }),
        category: "brand",
        difficulty: "beginner",
        steps: [
            {
                title: "Fetch Brand Config",
                description: "Query the brand customization API to get current branding",
                code: "const { data: brandConfig } = trpc.brandCustomization.getConfig.useQuery();"
            },
            {
                title: "Create CSS Variables",
                description: "Create root CSS variables for brand colors",
                code: ":root {\n  --primary-color: " + "{brandConfig.primaryColor}" + ";\n  --secondary-color: " + "{brandConfig.secondaryColor}" + ";\n  --accent-color: " + "{brandConfig.accentColor}" + ";\n}"
            },
            {
                title: "Apply in Stylesheets",
                description: "Use CSS variables in your styles",
                code: ".button {\n  background-color: var(--primary-color);\n  color: var(--lightText);\n}"
            },
        ],
        links: [
            { label: "Brand Guidelines", url: "#" },
            { label: "API Reference", url: "#" },
            { label: "Component Examples", url: "#" },
        ]
    },
    {
        id: "homepage-integration",
        title: "Build Custom Homepage Widgets",
        description: "Create and integrate custom widgets for the homepage builder",
        icon: React.createElement(lucide_react_1.Layout, { className: "h-6 w-6" }),
        category: "homepage",
        difficulty: "intermediate",
        steps: [
            {
                title: "Create Widget Component",
                description: "Create a new widget component that extends the Widget interface",
                code: "interface Widget {\n  id: string;\n  title: string;\n  category: 'finance' | 'hr' | 'sales';\n  enabled: boolean;\n  size: 'small' | 'medium' | 'large';\n}"
            },
            {
                title: "Implement Widget Logic",
                description: "Implement the widget's data fetching and rendering logic",
                code: "export function CustomWidget() {\n  const { data } = trpc.module.getData.useQuery();\n  return <div>{/* Your widget content */}</div>;\n}"
            },
            {
                title: "Register Widget",
                description: "Add the widget to the AVAILABLE_WIDGETS object",
                code: "AVAILABLE_WIDGETS.customWidget = {\n  id: 'custom',\n  title: 'Your Widget',\n  // ... other properties\n};"
            },
        ],
        links: [
            { label: "Widget Architecture", url: "#" },
            { label: "Component Library", url: "#" },
            { label: "Widget Examples", url: "#" },
        ]
    },
    {
        id: "api-integration",
        title: "API Integration Guide",
        description: "Integrate CRM APIs into your external systems",
        icon: React.createElement(lucide_react_1.Code, { className: "h-6 w-6" }),
        category: "api",
        difficulty: "advanced",
        steps: [
            {
                title: "Authentication",
                description: "Set up API authentication with bearer tokens",
                code: "const headers = {\n  'Authorization': 'Bearer YOUR_API_TOKEN',\n  'Content-Type': 'application/json'\n};"
            },
            {
                title: "Make API Request",
                description: "Make API requests to the tRPC endpoint",
                code: "fetch('/api/trpc/items.list', {\n  method: 'GET',\n  headers: headers,\n})\n  .then(res => res.json())\n  .then(data => console.log(data));"
            },
            {
                title: "Handle Responses",
                description: "Properly handle API responses and errors",
                code: "if (response.ok) {\n  const data = await response.json();\n  // Process data\n} else {\n  console.error('API Error:', response.statusText);\n}"
            },
        ],
        links: [
            { label: "API Documentation", url: "#" },
            { label: "Authentication Methods", url: "#" },
            { label: "Code Examples", url: "#" },
        ]
    },
];
function IntegrationGuides() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(null), selectedGuide = _b[0], setSelectedGuide = _b[1];
    var _c = react_1.useState(null), copiedCode = _c[0], setCopiedCode = _c[1];
    var _d = react_1.useState(""), searchQuery = _d[0], setSearchQuery = _d[1];
    var filteredGuides = INTEGRATION_GUIDES.filter(function (guide) {
        return guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    });
    var handleCopyCode = function (code) {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        sonner_1.toast.success("Code copied to clipboard!");
        setTimeout(function () { return setCopiedCode(null); }, 2000);
    };
    var getDifficultyColor = function (difficulty) {
        switch (difficulty) {
            case "beginner":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
            case "intermediate":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
            case "advanced":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Integration Guides", description: "Complete documentation for integrating brand and theme customization into your applications", icon: React.createElement(lucide_react_1.BookOpen, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Settings", href: "/settings" },
            { label: "Integration Guides" },
        ] },
        React.createElement("div", { className: "space-y-8 max-w-7xl" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, { htmlFor: "search" }, "Search Guides"),
                React.createElement(input_1.Input, { id: "search", placeholder: "Search by title or description...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "max-w-md" })),
            React.createElement("div", { className: "grid lg:grid-cols-3 gap-6" },
                React.createElement("div", { className: "lg:col-span-1 space-y-4" },
                    React.createElement("h2", { className: "text-lg font-semibold" }, "Available Guides"),
                    React.createElement("div", { className: "space-y-2" }, filteredGuides.length === 0 ? (React.createElement(card_1.Card, { className: "p-4 text-center text-muted-foreground" }, "No guides found matching your search")) : (filteredGuides.map(function (guide) { return (React.createElement(card_1.Card, { key: guide.id, className: utils_1.cn("cursor-pointer transition-all hover:shadow-md", (selectedGuide === null || selectedGuide === void 0 ? void 0 : selectedGuide.id) === guide.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : ""), onClick: function () { return setSelectedGuide(guide); } },
                        React.createElement(card_1.CardHeader, { className: "pb-3" },
                            React.createElement("div", { className: "flex items-start gap-3" },
                                React.createElement("div", { className: "text-slate-600 dark:text-slate-400 mt-1" }, guide.icon),
                                React.createElement("div", { className: "flex-1 min-w-0" },
                                    React.createElement(card_1.CardTitle, { className: "text-sm line-clamp-2" }, guide.title),
                                    React.createElement(badge_1.Badge, { className: utils_1.cn("mt-2", getDifficultyColor(guide.difficulty)) }, guide.difficulty)))))); })))),
                React.createElement("div", { className: "lg:col-span-2" }, selectedGuide ? (React.createElement("div", { className: "space-y-6" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement("div", { className: "flex items-start gap-4" },
                                React.createElement("div", { className: "text-blue-600 dark:text-blue-400" }, selectedGuide.icon),
                                React.createElement("div", { className: "flex-1" },
                                    React.createElement(card_1.CardTitle, { className: "text-2xl mb-2" }, selectedGuide.title),
                                    React.createElement(card_1.CardDescription, { className: "text-base" }, selectedGuide.description),
                                    React.createElement("div", { className: "flex gap-2 mt-4 flex-wrap" },
                                        React.createElement(badge_1.Badge, { variant: "outline" }, selectedGuide.category),
                                        React.createElement(badge_1.Badge, { className: getDifficultyColor(selectedGuide.difficulty) }, selectedGuide.difficulty)))))),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("h3", { className: "font-semibold text-lg" }, "Implementation Steps"),
                        selectedGuide.steps.map(function (step, index) { return (React.createElement(card_1.Card, { key: step.title || "step-" + index },
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, { className: "text-base" },
                                    "Step ",
                                    index + 1,
                                    ": ",
                                    step.title),
                                React.createElement(card_1.CardDescription, null, step.description)),
                            step.code && (React.createElement(card_1.CardContent, null,
                                React.createElement("div", { className: "bg-slate-900 dark:bg-slate-950 rounded-lg p-4 relative" },
                                    React.createElement("pre", { className: "text-slate-100 text-sm overflow-x-auto" },
                                        React.createElement("code", null, step.code)),
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", className: "absolute top-2 right-2", onClick: function () { return handleCopyCode(step.code); } }, copiedCode === step.code ? (React.createElement(lucide_react_1.Check, { className: "h-4 w-4 text-green-500" })) : (React.createElement(lucide_react_1.Copy, { className: "h-4 w-4" })))))))); })),
                    selectedGuide.links.length > 0 && (React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-base" }, "Additional Resources")),
                        React.createElement(card_1.CardContent, { className: "space-y-2" }, selectedGuide.links.map(function (link) { return (React.createElement(button_1.Button, { key: link.url || link.label, variant: "outline", className: "w-full justify-between", onClick: function () { return window.open(link.url, "_blank"); } },
                            React.createElement("span", null, link.label),
                            React.createElement(lucide_react_1.ExternalLink, { className: "h-4 w-4" }))); })))))) : (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-12 text-center" },
                        React.createElement(lucide_react_1.AlertCircle, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" }),
                        React.createElement("h3", { className: "font-semibold mb-2" }, "Select a Guide"),
                        React.createElement("p", { className: "text-muted-foreground" }, "Choose a guide from the left to view implementation details")))))))));
}
exports["default"] = IntegrationGuides;
