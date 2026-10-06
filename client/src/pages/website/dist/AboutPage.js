"use strict";
exports.__esModule = true;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var lucide_react_1 = require("lucide-react");
/**
 * About Page
 * Company information, mission, values, and team overview
 */
function AboutPage() {
    var values = [
        {
            icon: react_1["default"].createElement(lucide_react_1.Target, { size: 32 }),
            title: 'Customer-Centric',
            description: 'We build products that solve real business problems.'
        },
        {
            icon: react_1["default"].createElement(lucide_react_1.Zap, { size: 32 }),
            title: 'Innovation',
            description: 'Continuously improving and adding cutting-edge features.'
        },
        {
            icon: react_1["default"].createElement(lucide_react_1.Shield, { size: 32 }),
            title: 'Security',
            description: 'Enterprise-grade security to protect your data.'
        },
        {
            icon: react_1["default"].createElement(lucide_react_1.Globe, { size: 32 }),
            title: 'Global Ready',
            description: 'Supporting multiple currencies, languages, and regions.'
        },
    ];
    var stats = [
        { number: '500+', label: 'Active Organizations' },
        { number: '50K+', label: 'Total Users' },
        { number: '10M+', label: 'Transactions Processed' },
        { number: '99.9%', label: 'Uptime' },
    ];
    var team = [
        {
            name: 'John Kipchoge',
            role: 'CEO & Co-founder',
            bio: 'Former CTO at a leading East African fintech. 10+ years in software.'
        },
        {
            name: 'Sarah Mwangi',
            role: 'CTO & Product Lead',
            bio: 'Full-stack engineer with expertise in scaling systems. 8+ years experience.'
        },
        {
            name: 'James Kariuki',
            role: 'Head of Sales',
            bio: 'Enterprise sales specialist. Built sales teams from 0 to $10M ARR.'
        },
        {
            name: 'Grace Njoroge',
            role: 'Head of Customer Success',
            bio: 'Customer success expert. Dedicated to supporting our organizations.'
        },
    ];
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-white" },
        react_1["default"].createElement("header", { className: "border-b border-gray-200 sticky top-0 z-50 bg-white" },
            react_1["default"].createElement("nav", { className: "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" },
                react_1["default"].createElement(react_router_dom_1.Link, { to: "/", className: "text-2xl font-bold text-blue-600" }, "\uD83C\uDFE2 Kiini CRM"),
                react_1["default"].createElement("div", { className: "flex gap-4" },
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/pricing", className: "text-gray-700 hover:text-blue-600" }, "Pricing"),
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/contact", className: "text-gray-700 hover:text-blue-600" }, "Contact"),
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/login", className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" }, "Sign In")))),
        react_1["default"].createElement("section", { className: "bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 text-white py-20" },
            react_1["default"].createElement("div", { className: "max-w-3xl mx-auto px-6 text-center" },
                react_1["default"].createElement("h1", { className: "text-5xl font-bold mb-4" }, "About Kiini Solutions"),
                react_1["default"].createElement("p", { className: "text-xl text-blue-100" }, "Empowering East African businesses with intelligent, all-in-one business management software."))),
        react_1["default"].createElement("section", { className: "py-16 bg-gray-50" },
            react_1["default"].createElement("div", { className: "max-w-3xl mx-auto px-6" },
                react_1["default"].createElement("h2", { className: "text-3xl font-bold text-gray-900 mb-6" }, "Our Mission"),
                react_1["default"].createElement("p", { className: "text-lg text-gray-700 mb-6" }, "At Kiini, we believe every business\u2014regardless of size\u2014deserves access to enterprise-grade business management tools. Our mission is to democratize business software by providing an affordable, cloud-based, integrated platform that helps organizations streamline operations, maximize profitability, and scale sustainably."),
                react_1["default"].createElement("p", { className: "text-lg text-gray-700" }, "We're committed to supporting the East African entrepreneurial ecosystem by building solutions that understand local business needs\u2014from Kenyan businesses managing multiple currencies to regional expansion challenges."))),
        react_1["default"].createElement("section", { className: "py-16 bg-white" },
            react_1["default"].createElement("div", { className: "max-w-6xl mx-auto px-6" },
                react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-8 text-center" }, stats.map(function (stat, idx) { return (react_1["default"].createElement("div", { key: idx },
                    react_1["default"].createElement("div", { className: "text-4xl font-bold text-blue-600 mb-2" }, stat.number),
                    react_1["default"].createElement("p", { className: "text-gray-600" }, stat.label))); })))),
        react_1["default"].createElement("section", { className: "py-16 bg-gray-50" },
            react_1["default"].createElement("div", { className: "max-w-6xl mx-auto px-6" },
                react_1["default"].createElement("h2", { className: "text-3xl font-bold text-gray-900 mb-12 text-center" }, "Our Values"),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" }, values.map(function (value, idx) { return (react_1["default"].createElement("div", { key: idx, className: "text-center" },
                    react_1["default"].createElement("div", { className: "text-blue-600 mb-4 flex justify-center" }, value.icon),
                    react_1["default"].createElement("h3", { className: "text-lg font-bold text-gray-900 mb-2" }, value.title),
                    react_1["default"].createElement("p", { className: "text-gray-600" }, value.description))); })))),
        react_1["default"].createElement("section", { className: "py-16 bg-white" },
            react_1["default"].createElement("div", { className: "max-w-3xl mx-auto px-6" },
                react_1["default"].createElement("h2", { className: "text-3xl font-bold text-gray-900 mb-12 text-center" }, "Our Journey"),
                react_1["default"].createElement("div", { className: "space-y-8" },
                    react_1["default"].createElement("div", { className: "flex gap-4" },
                        react_1["default"].createElement("div", { className: "flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold" }, "2019"),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("h3", { className: "text-lg font-bold text-gray-900" }, "Company Founded"),
                            react_1["default"].createElement("p", { className: "text-gray-600" }, "Started with a vision to simplify business management for SMEs."))),
                    react_1["default"].createElement("div", { className: "flex gap-4" },
                        react_1["default"].createElement("div", { className: "flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold" }, "2020"),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("h3", { className: "text-lg font-bold text-gray-900" }, "First 100 Customers"),
                            react_1["default"].createElement("p", { className: "text-gray-600" }, "Reached product-market fit with focused CRM and invoicing features."))),
                    react_1["default"].createElement("div", { className: "flex gap-4" },
                        react_1["default"].createElement("div", { className: "flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold" }, "2022"),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("h3", { className: "text-lg font-bold text-gray-900" }, "Platform Expansion"),
                            react_1["default"].createElement("p", { className: "text-gray-600" }, "Launched HR, Accounting, Procurement, and Advanced Analytics modules."))),
                    react_1["default"].createElement("div", { className: "flex gap-4" },
                        react_1["default"].createElement("div", { className: "flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold" }, "2024"),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("h3", { className: "text-lg font-bold text-gray-900" }, "AI & Regional Expansion"),
                            react_1["default"].createElement("p", { className: "text-gray-600" }, "Introduced AI Insights module and expanded to 5 East African countries."))),
                    react_1["default"].createElement("div", { className: "flex gap-4" },
                        react_1["default"].createElement("div", { className: "flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold" }, "2025"),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("h3", { className: "text-lg font-bold text-gray-900" }, "Today & Beyond"),
                            react_1["default"].createElement("p", { className: "text-gray-600" }, "Serving 500+ organizations with continuous innovation and support.")))))),
        react_1["default"].createElement("section", { className: "py-16 bg-gray-50" },
            react_1["default"].createElement("div", { className: "max-w-6xl mx-auto px-6" },
                react_1["default"].createElement("h2", { className: "text-3xl font-bold text-gray-900 mb-12 text-center" }, "Leadership Team"),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" }, team.map(function (member, idx) { return (react_1["default"].createElement("div", { key: idx, className: "bg-white rounded-lg p-6 text-center" },
                    react_1["default"].createElement("div", { className: "w-24 h-24 bg-blue-300 rounded-full mx-auto mb-4 flex items-center justify-center" },
                        react_1["default"].createElement(lucide_react_1.Users, { size: 40, className: "text-white" })),
                    react_1["default"].createElement("h3", { className: "text-lg font-bold text-gray-900 mb-1" }, member.name),
                    react_1["default"].createElement("p", { className: "text-blue-600 font-semibold text-sm mb-3" }, member.role),
                    react_1["default"].createElement("p", { className: "text-gray-600 text-sm" }, member.bio))); })))),
        react_1["default"].createElement("section", { className: "py-16 bg-white" },
            react_1["default"].createElement("div", { className: "max-w-3xl mx-auto px-6" },
                react_1["default"].createElement("h2", { className: "text-3xl font-bold text-gray-900 mb-6 text-center" }, "Technology & Security"),
                react_1["default"].createElement("div", { className: "space-y-6" },
                    react_1["default"].createElement("div", { className: "flex gap-4" },
                        react_1["default"].createElement(lucide_react_1.Shield, { size: 24, className: "text-blue-600 flex-shrink-0" }),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("h3", { className: "font-bold text-gray-900 mb-2" }, "Enterprise-Grade Security"),
                            react_1["default"].createElement("p", { className: "text-gray-600" }, "ISO 27001 certification, End-to-end encryption, Regular security audits."))),
                    react_1["default"].createElement("div", { className: "flex gap-4" },
                        react_1["default"].createElement(lucide_react_1.Award, { size: 24, className: "text-blue-600 flex-shrink-0" }),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("h3", { className: "font-bold text-gray-900 mb-2" }, "99.9% Uptime SLA"),
                            react_1["default"].createElement("p", { className: "text-gray-600" }, "Redundant infrastructure across multiple data centers in East Africa."))),
                    react_1["default"].createElement("div", { className: "flex gap-4" },
                        react_1["default"].createElement(lucide_react_1.Zap, { size: 24, className: "text-blue-600 flex-shrink-0" }),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("h3", { className: "font-bold text-gray-900 mb-2" }, "Scalable Architecture"),
                            react_1["default"].createElement("p", { className: "text-gray-600" }, "Built to handle millions of transactions and grow with your business.")))))),
        react_1["default"].createElement("section", { className: "bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16" },
            react_1["default"].createElement("div", { className: "max-w-3xl mx-auto px-6 text-center" },
                react_1["default"].createElement("h2", { className: "text-3xl font-bold mb-4" }, "Join Our Growing Community"),
                react_1["default"].createElement("p", { className: "text-lg mb-8 text-blue-100" }, "Experience the difference with Kiini CRM. Start your free trial today."),
                react_1["default"].createElement(react_router_dom_1.Link, { to: "/signup", className: "inline-block bg-white text-blue-600 px-8 py-3 rounded font-bold hover:bg-blue-50 transition" }, "Get Started Free"))),
        react_1["default"].createElement("footer", { className: "bg-gray-900 text-gray-400 py-8 border-t border-gray-800" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-6 text-center" },
                react_1["default"].createElement("p", null, "\u00A9 2025 Kiini Solutions. All rights reserved."),
                react_1["default"].createElement("div", { className: "flex justify-center gap-6 mt-4" },
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/privacy", className: "hover:text-white" }, "Privacy Policy"),
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/terms", className: "hover:text-white" }, "Terms of Service"),
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/contact", className: "hover:text-white" }, "Contact"))))));
}
exports["default"] = AboutPage;
