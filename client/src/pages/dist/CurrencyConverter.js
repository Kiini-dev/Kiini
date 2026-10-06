"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
function CurrencyConverter() {
    var _a, _b;
    var _c = react_1.useState("USD"), fromCurrency = _c[0], setFromCurrency = _c[1];
    var _d = react_1.useState("EUR"), toCurrency = _d[0], setToCurrency = _d[1];
    var _e = react_1.useState(100), amount = _e[0], setAmount = _e[1];
    var _f = react_1.useState(null), result = _f[0], setResult = _f[1];
    var configsQuery = trpc_1.trpc.globalFeatures.listConfigs.useQuery({ configType: "currency" });
    var convertMutation = trpc_1.trpc.globalFeatures.handleCurrencyConversion.useMutation({
        onSuccess: function (data) {
            setResult(data);
            sonner_1.toast.success("Conversion complete");
        },
        onError: function (err) { var _a; return sonner_1.toast.error((_a = err.message) !== null && _a !== void 0 ? _a : "Conversion failed"); }
    });
    var handleConvert = function () {
        convertMutation.mutate({ from: fromCurrency, to: toCurrency, amount: amount });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Currency Converter", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Finance" },
            { label: "Currency Converter" },
        ] },
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Convert Currency")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-sm font-semibold text-gray-700 mb-2" }, "From"),
                        React.createElement(input_1.Input, { value: fromCurrency, onChange: function (e) { return setFromCurrency(e.target.value); }, placeholder: "USD" })),
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-sm font-semibold text-gray-700 mb-2" }, "Amount"),
                        React.createElement(input_1.Input, { type: "number", value: amount, onChange: function (e) { return setAmount(Number(e.target.value)); } })),
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-sm font-semibold text-gray-700 mb-2" }, "To"),
                        React.createElement(input_1.Input, { value: toCurrency, onChange: function (e) { return setToCurrency(e.target.value); }, placeholder: "EUR" }))),
                React.createElement(button_1.Button, { className: "mt-4", onClick: handleConvert, disabled: convertMutation.isPending },
                    convertMutation.isPending ? React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin mr-2" }) : null,
                    "Convert"),
                result && (React.createElement("div", { className: "mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded" },
                    React.createElement("p", { className: "text-gray-700 text-sm" },
                        amount,
                        " ",
                        fromCurrency,
                        " = ", (_a = result.convertedAmount) !== null && _a !== void 0 ? _a : "—",
                        " ",
                        toCurrency),
                    React.createElement("p", { className: "text-xs text-gray-500 mt-1" },
                        "Rate: ", (_b = result.rate) !== null && _b !== void 0 ? _b : "—"))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Currency Configurations")),
            React.createElement(card_1.CardContent, null,
                configsQuery.isLoading && (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))),
                configsQuery.error && (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
                    "Error: ",
                    configsQuery.error.message)),
                configsQuery.data && (React.createElement(React.Fragment, null, configsQuery.data.length === 0 ? (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No data found.")) : (React.createElement("div", { className: "grid grid-cols-3 gap-2" }, configsQuery.data.map(function (cfg, idx) {
                    var _a, _b, _c;
                    return (React.createElement("div", { key: idx, className: "p-2 bg-emerald-50 border border-emerald-200 rounded text-center text-sm font-semibold text-gray-900" }, (_c = (_b = (_a = cfg.name) !== null && _a !== void 0 ? _a : cfg.value) !== null && _b !== void 0 ? _b : cfg.key) !== null && _c !== void 0 ? _c : "—"));
                })))))))));
}
exports["default"] = CurrencyConverter;
