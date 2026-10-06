"use strict";
exports.__esModule = true;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var lucide_react_1 = require("lucide-react");
/**
 * Pricing Page
 * Displays all 6 pricing tiers with features comparison
 * Public page - no authentication required
 */
function PricingPage() {
    var _a = react_1.useState('monthly'), billingPeriod = _a[0], setBillingPeriod = _a[1];
    var _b = react_1.useState([]), pricingTiers = _b[0], setPricingTiers = _b[1];
    var _c = react_1.useState(true), loading = _c[0], setLoading = _c[1];
    react_1.useEffect(function () {
        // TODO: Fetch pricing tiers from API
        // For now, use hardcoded data
        setPricingTiers([
            {
                id: 'trial',
                name: 'Trial',
                description: 'Start free for 14 days. No credit card required.',
                monthlyPrice: 0,
                annualPrice: 0,
                monthlyPromo: 'Free',
                features: [
                    { name: 'Up to 5 users', included: true },
                    { name: 'Core CRM', included: true },
                    { name: 'Basic invoicing', included: true },
                    { name: 'Email support', included: true },
                    { name: 'SSO', included: false },
                    { name: 'API access', included: false },
                    { name: 'Dedicated support', included: false },
                ],
                cta: 'Start Free Trial',
                highlighted: false,
                icon: '⚡'
            },
            {
                id: 'accounting',
                name: 'Accounting Only',
                description: 'For independent accountants and bookkeepers.',
                monthlyPrice: 49,
                annualPrice: 490,
                monthlyPromo: '$49/month',
                features: [
                    { name: 'Up to 2 users', included: true },
                    { name: 'CRM (Basic)', included: false },
                    { name: 'Invoicing & Payments', included: true },
                    { name: 'Chart of Accounts', included: true },
                    { name: 'Email support', included: true },
                    { name: 'SSO', included: false },
                    { name: 'API access', included: false },
                ],
                cta: 'Start Now',
                highlighted: false,
                icon: '🧮'
            },
            {
                id: 'starter',
                name: 'Starter',
                description: 'Perfect for growing businesses.',
                monthlyPrice: 99,
                annualPrice: 1008,
                monthlyPromo: '$99/month',
                features: [
                    { name: 'Up to 10 users', included: true },
                    { name: 'Complete CRM', included: true },
                    { name: 'Invoicing & Payments', included: true },
                    { name: 'Basic HR', included: true },
                    { name: 'Priority support', included: true },
                    { name: 'SSO', included: false },
                    { name: 'API access', included: false },
                ],
                cta: 'Start Now',
                highlighted: false,
                icon: '🚀'
            },
            {
                id: 'growth',
                name: 'Growth',
                description: 'For mid-size companies with advanced needs.',
                monthlyPrice: 199,
                annualPrice: 1990,
                monthlyPromo: '$199/month',
                features: [
                    { name: 'Up to 25 users', included: true },
                    { name: 'All Starter features', included: true },
                    { name: 'Payroll & Leave', included: true },
                    { name: 'Advanced Reports', included: true },
                    { name: '24/7 Priority support', included: true },
                    { name: 'SSO', included: true },
                    { name: 'Limited API access', included: true },
                ],
                cta: 'Start Now',
                highlighted: false,
                icon: '📈'
            },
            {
                id: 'professional',
                name: 'Professional',
                description: 'For established enterprises.',
                monthlyPrice: 399,
                annualPrice: 3990,
                monthlyPromo: '$399/month',
                features: [
                    { name: 'Up to 50 users', included: true },
                    { name: 'All Growth features', included: true },
                    { name: 'Procurement', included: true },
                    { name: 'Custom workflows', included: true },
                    { name: 'Advanced security', included: true },
                    { name: 'SSO & SAML', included: true },
                    { name: 'Full API access', included: true },
                ],
                cta: 'Start Now',
                highlighted: true,
                icon: '💼'
            },
            {
                id: 'enterprise',
                name: 'Enterprise',
                description: 'Unlimited everything with dedicated support.',
                monthlyPrice: null,
                annualPrice: null,
                monthlyPromo: 'Custom',
                features: [
                    { name: 'Unlimited users', included: true },
                    { name: 'All Professional features', included: true },
                    { name: 'White-label', included: true },
                    { name: 'Custom integrations', included: true },
                    { name: 'Advanced security & compliance', included: true },
                    { name: 'Dedicated account manager', included: true },
                    { name: 'Custom SLA & support', included: true },
                ],
                cta: 'Contact Sales',
                highlighted: false,
                icon: '👑'
            },
        ]);
        setLoading(false);
    }, []);
    var displayPrice = function (tier) {
        if (!tier.monthlyPrice && !tier.annualPrice)
            return 'Custom';
        if (billingPeriod === 'monthly')
            return "$" + tier.monthlyPrice;
        var annualPrice = tier.annualPrice;
        return "$" + annualPrice;
    };
    if (loading) {
        return (react_1["default"].createElement("div", { className: "flex items-center justify-center min-h-screen" },
            react_1["default"].createElement("div", { className: "text-center" },
                react_1["default"].createElement("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" }),
                react_1["default"].createElement("p", { className: "text-gray-600" }, "Loading pricing..."))));
    }
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" },
        react_1["default"].createElement("header", { className: "border-b border-gray-200 bg-white sticky top-0 z-50" },
            react_1["default"].createElement("nav", { className: "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" },
                react_1["default"].createElement(react_router_dom_1.Link, { to: "/", className: "text-2xl font-bold text-blue-600" }, "\uD83C\uDFE2 Kiini CRM"),
                react_1["default"].createElement("div", { className: "flex gap-4" },
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/about", className: "text-gray-700 hover:text-blue-600" }, "About"),
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/contact", className: "text-gray-700 hover:text-blue-600" }, "Contact"),
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/login", className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" }, "Sign In")))),
        react_1["default"].createElement("section", { className: "max-w-7xl mx-auto px-6 py-16 text-center" },
            react_1["default"].createElement("h1", { className: "text-5xl font-bold text-gray-900 mb-4" }, "Simple, Transparent Pricing"),
            react_1["default"].createElement("p", { className: "text-xl text-gray-600 mb-8" }, "Choose the perfect plan for your business. All plans include our core features."),
            react_1["default"].createElement("div", { className: "flex justify-center mb-12" },
                react_1["default"].createElement("div", { className: "inline-flex rounded-lg border border-gray-300 bg-white p-1" },
                    react_1["default"].createElement("button", { onClick: function () { return setBillingPeriod('monthly'); }, className: "px-6 py-2 rounded transition " + (billingPeriod === 'monthly'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100') }, "Monthly"),
                    react_1["default"].createElement("button", { onClick: function () { return setBillingPeriod('annual'); }, className: "px-6 py-2 rounded transition " + (billingPeriod === 'annual'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100') },
                        "Annual",
                        react_1["default"].createElement("span", { className: "ml-2 text-green-600 font-semibold text-sm" }, "Save 15%"))))),
        react_1["default"].createElement("section", { className: "max-w-7xl mx-auto px-6 pb-20" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" }, pricingTiers.map(function (tier) { return (react_1["default"].createElement("div", { key: tier.id, className: "rounded-lg border transition-all " + (tier.highlighted
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-2xl scale-105'
                    : 'border-gray-200 bg-white shadow-lg hover:shadow-xl') },
                tier.highlighted && (react_1["default"].createElement("div", { className: "bg-blue-600 text-white text-sm font-semibold px-4 py-2 text-center rounded-t" }, "\u2B50 Most Popular")),
                react_1["default"].createElement("div", { className: "p-8 text-center border-b border-gray-200" },
                    react_1["default"].createElement("div", { className: "text-4xl mb-3" }, tier.icon),
                    react_1["default"].createElement("h3", { className: "text-2xl font-bold text-gray-900 mb-2" }, tier.name),
                    react_1["default"].createElement("p", { className: "text-gray-600 text-sm mb-6" }, tier.description),
                    react_1["default"].createElement("div", { className: "mb-6" },
                        react_1["default"].createElement("span", { className: "text-4xl font-bold text-gray-900" }, displayPrice(tier)),
                        tier.monthlyPrice && (react_1["default"].createElement("span", { className: "text-gray-600 ml-2" }, billingPeriod === 'annual' ? '/year' : '/month'))),
                    react_1["default"].createElement("button", { className: "w-full py-3 rounded font-semibold transition flex items-center justify-center gap-2 " + (tier.highlighted
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200') },
                        tier.cta,
                        react_1["default"].createElement(lucide_react_1.ArrowRight, { size: 18 }))),
                react_1["default"].createElement("div", { className: "p-8" },
                    react_1["default"].createElement("p", { className: "text-xs font-semibold text-gray-600 mb-4 uppercase" }, "FEATURES"),
                    react_1["default"].createElement("ul", { className: "space-y-4" }, tier.features.map(function (feature, idx) { return (react_1["default"].createElement("li", { key: idx, className: "flex items-start gap-3" },
                        feature.included ? (react_1["default"].createElement(lucide_react_1.Check, { size: 18, className: "text-green-600 flex-shrink-0 mt-0.5" })) : (react_1["default"].createElement(lucide_react_1.X, { size: 18, className: "text-gray-300 flex-shrink-0 mt-0.5" })),
                        react_1["default"].createElement("span", { className: feature.included ? 'text-gray-900' : 'text-gray-400' }, feature.name))); }))))); }))),
        react_1["default"].createElement("section", { className: "bg-gray-900 text-white py-16" },
            react_1["default"].createElement("div", { className: "max-w-3xl mx-auto px-6" },
                react_1["default"].createElement("h2", { className: "text-3xl font-bold mb-12 text-center" }, "Frequently Asked Questions"),
                react_1["default"].createElement("div", { className: "space-y-8" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-lg font-bold mb-2" }, "Can I change my plan anytime?"),
                        react_1["default"].createElement("p", { className: "text-gray-400" }, "Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.")),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-lg font-bold mb-2" }, "Do you offer a free trial?"),
                        react_1["default"].createElement("p", { className: "text-gray-400" }, "Absolutely! All new organizations start with a 14-day free trial with full access to core features.")),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-lg font-bold mb-2" }, "What payment methods do you accept?"),
                        react_1["default"].createElement("p", { className: "text-gray-400" }, "We accept credit/debit cards, bank transfers, M-Pesa, and Paybill via our secure payment gateway.")),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-lg font-bold mb-2" }, "Is there a setup fee?"),
                        react_1["default"].createElement("p", { className: "text-gray-400" }, "No setup fees! You only pay for the plan you choose. For Enterprise plans, we offer custom pricing."))))),
        react_1["default"].createElement("section", { className: "bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16" },
            react_1["default"].createElement("div", { className: "max-w-3xl mx-auto px-6 text-center" },
                react_1["default"].createElement("h2", { className: "text-3xl font-bold mb-4" }, "Ready to transform your business?"),
                react_1["default"].createElement("p", { className: "text-lg mb-8 text-blue-100" }, "Join hundreds of organizations using Kiini CRM to streamline their operations."),
                react_1["default"].createElement(react_router_dom_1.Link, { to: "/signup", className: "inline-block bg-white text-blue-600 px-8 py-3 rounded font-bold hover:bg-blue-50 transition" }, "Start Your Free Trial Today"))),
        react_1["default"].createElement("footer", { className: "bg-gray-900 text-gray-400 py-8 border-t border-gray-800" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-6 text-center" },
                react_1["default"].createElement("p", null, "\u00A9 2025 Kiini Solutions. All rights reserved."),
                react_1["default"].createElement("div", { className: "flex justify-center gap-6 mt-4" },
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/privacy", className: "hover:text-white" }, "Privacy Policy"),
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/terms", className: "hover:text-white" }, "Terms of Service"),
                    react_1["default"].createElement(react_router_dom_1.Link, { to: "/contact", className: "hover:text-white" }, "Contact"))))));
}
exports["default"] = PricingPage;
