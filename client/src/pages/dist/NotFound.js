"use strict";
exports.__esModule = true;
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var wouter_1 = require("wouter");
var WebsiteNav_1 = require("./website/WebsiteNav");
var WebsiteFooter_1 = require("./website/WebsiteFooter");
function NotFound() {
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var handleGoHome = function () {
        setLocation("/");
    };
    return (React.createElement("div", { className: "min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" },
        React.createElement(WebsiteNav_1.WebsiteNav, null),
        React.createElement("div", { className: "flex-1 flex items-center justify-center pt-16" },
            React.createElement(card_1.Card, { className: "w-full max-w-lg mx-4 shadow-xl border-0 bg-white/80 backdrop-blur-sm" },
                React.createElement(card_1.CardContent, { className: "pt-8 pb-8 text-center" },
                    React.createElement("div", { className: "flex justify-center mb-6" },
                        React.createElement("div", { className: "relative" },
                            React.createElement("div", { className: "absolute inset-0 bg-indigo-100 rounded-full animate-pulse" }),
                            React.createElement(lucide_react_1.AlertCircle, { className: "relative h-16 w-16 text-indigo-500" }))),
                    React.createElement("h1", { className: "text-4xl font-bold text-slate-900 mb-2" }, "404"),
                    React.createElement("h2", { className: "text-xl font-semibold text-slate-700 mb-4" }, "Page Not Found"),
                    React.createElement("p", { className: "text-slate-600 mb-8 leading-relaxed" },
                        "Sorry, the page you are looking for doesn't exist.",
                        React.createElement("br", null),
                        "It may have been moved or deleted."),
                    React.createElement("div", { id: "not-found-button-group", className: "flex flex-col sm:flex-row gap-3 justify-center" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return window.history.back(); }, className: "border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-lg" },
                            React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                            "Go Back"),
                        React.createElement(button_1.Button, { onClick: handleGoHome, className: "bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg" },
                            React.createElement(lucide_react_1.Home, { className: "w-4 h-4 mr-2" }),
                            "Go Home"))))),
        React.createElement(WebsiteFooter_1.WebsiteFooter, null)));
}
exports["default"] = NotFound;
