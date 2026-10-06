"use strict";
exports.__esModule = true;
exports.useCurrency = exports.CurrencyProvider = exports.CURRENCIES = void 0;
var react_1 = require("react");
exports.CURRENCIES = [
    { code: "KES", symbol: "KSh", name: "Kenyan Shilling", rateFromKes: 1 },
    { code: "USD", symbol: "$", name: "US Dollar", rateFromKes: 1 / 128 },
    { code: "EUR", symbol: "€", name: "Euro", rateFromKes: 1 / 140 },
    { code: "GBP", symbol: "£", name: "British Pound", rateFromKes: 1 / 163 },
    { code: "UGX", symbol: "USh", name: "Ugandan Shilling", rateFromKes: 4.7 },
    { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", rateFromKes: 3.3 },
];
var CurrencyContext = react_1.createContext(null);
function CurrencyProvider(_a) {
    var _b;
    var children = _a.children;
    var saved = (typeof window !== "undefined" ? localStorage.getItem("kiini_currency") : null);
    var initial = (_b = exports.CURRENCIES.find(function (c) { return c.code === saved; })) !== null && _b !== void 0 ? _b : exports.CURRENCIES[0];
    var _c = react_1.useState(initial), currency = _c[0], setCurrencyState = _c[1];
    var setCurrency = function (code) {
        var found = exports.CURRENCIES.find(function (c) { return c.code === code; });
        if (found) {
            setCurrencyState(found);
            localStorage.setItem("kiini_currency", code);
        }
    };
    var fmt = function (kesAmount) {
        var converted = kesAmount * currency.rateFromKes;
        var formatted = new Intl.NumberFormat("en-KE", {
            minimumFractionDigits: converted < 1 ? 2 : 0,
            maximumFractionDigits: converted < 1 ? 2 : 0
        }).format(Math.round(converted));
        return "" + currency.symbol + formatted;
    };
    return (react_1["default"].createElement(CurrencyContext.Provider, { value: { currency: currency, setCurrency: setCurrency, fmt: fmt } }, children));
}
exports.CurrencyProvider = CurrencyProvider;
function useCurrency() {
    var ctx = react_1.useContext(CurrencyContext);
    if (!ctx)
        throw new Error("useCurrency must be used within CurrencyProvider");
    return ctx;
}
exports.useCurrency = useCurrency;
