"use strict";
exports.__esModule = true;
exports.formatAmount = exports.useCurrencySettings = void 0;
var trpc_1 = require("./trpc");
/**
 * Hook to get the user-configured currency from Settings → Currency.
 * Returns { code, symbol, position } with defaults.
 */
function useCurrencySettings() {
    var data = trpc_1.trpc.settings.getByCategory.useQuery({ category: "currency" }, { staleTime: 5 * 60 * 1000 } // cache for 5 minutes
    ).data;
    var code = (data === null || data === void 0 ? void 0 : data.defaultCurrency) || "KES";
    var symbol = (data === null || data === void 0 ? void 0 : data.currencySymbol) || code;
    var position = (data === null || data === void 0 ? void 0 : data.symbolPosition) || "before";
    var formatAmountLocal = function (amount, opts) { return formatAmount(amount, symbol, position, opts); };
    return { code: code, symbol: symbol, position: position, formatAmount: formatAmountLocal };
}
exports.useCurrencySettings = useCurrencySettings;
/**
 * Format a number as currency using the given symbol/position.
 * Defaults to KES if no settings provided.
 */
function formatAmount(amount, symbol, position, opts) {
    var _a, _b;
    if (symbol === void 0) { symbol = "KES"; }
    if (position === void 0) { position = "before"; }
    var formatted = amount.toLocaleString(undefined, {
        minimumFractionDigits: (_a = opts === null || opts === void 0 ? void 0 : opts.minimumFractionDigits) !== null && _a !== void 0 ? _a : 0,
        maximumFractionDigits: (_b = opts === null || opts === void 0 ? void 0 : opts.maximumFractionDigits) !== null && _b !== void 0 ? _b : 2
    });
    return position === "before" ? symbol + " " + formatted : formatted + " " + symbol;
}
exports.formatAmount = formatAmount;
