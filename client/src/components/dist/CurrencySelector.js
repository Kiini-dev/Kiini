"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.CurrencySelector = void 0;
var react_1 = require("react");
var constants_1 = require("@shared/constants");
var select_1 = require("@/components/ui/select");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
/**
 * CurrencySelector - Component for selecting currency
 * Displays supported African currencies with symbol and code
 */
exports.CurrencySelector = function (_a) {
    var _b, _c, _d;
    var value = _a.value, onChange = _a.onChange, onFormatChange = _a.onFormatChange, _e = _a.showLabel, showLabel = _e === void 0 ? true : _e, _f = _a.disabled, disabled = _f === void 0 ? false : _f, _g = _a.className, className = _g === void 0 ? '' : _g;
    var _h = react_1.useState('symbol'), selectedFormat = _h[0], setSelectedFormat = _h[1];
    var handleFormatChange = function (format) {
        setSelectedFormat(format);
        onFormatChange === null || onFormatChange === void 0 ? void 0 : onFormatChange(format);
    };
    var currencies = Object.entries(constants_1.SUPPORTED_CURRENCIES).map(function (_a) {
        var code = _a[0], details = _a[1];
        return (__assign({ code: code }, details));
    });
    return (react_1["default"].createElement("div", { className: "space-y-3 " + className },
        showLabel && (react_1["default"].createElement("div", { className: "flex items-center gap-2" },
            react_1["default"].createElement(lucide_react_1.Globe, { className: "w-4 h-4 text-blue-600" }),
            react_1["default"].createElement("label", { className: "text-sm font-medium text-gray-700" }, "Currency"))),
        react_1["default"].createElement("div", { className: "space-y-2" },
            react_1["default"].createElement(select_1.Select, { value: value, onOpenChange: function () { }, disabled: disabled },
                react_1["default"].createElement(select_1.SelectTrigger, { className: "w-full" },
                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select currency" })),
                react_1["default"].createElement(select_1.SelectContent, null, currencies.map(function (currency) { return (react_1["default"].createElement(select_1.SelectItem, { key: currency.code, value: currency.code, onClick: function () { return onChange(currency.code); } },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                        react_1["default"].createElement("span", { className: "font-medium" }, currency.symbol),
                        react_1["default"].createElement("span", null, currency.code),
                        react_1["default"].createElement("span", { className: "text-gray-500 text-sm" },
                            "- ",
                            currency.name)))); })))),
        react_1["default"].createElement("div", { className: "flex gap-2" },
            react_1["default"].createElement("button", { onClick: function () { return handleFormatChange('symbol'); }, className: "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors " + (selectedFormat === 'symbol'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200') },
                "Symbol ", (_b = constants_1.SUPPORTED_CURRENCIES[value]) === null || _b === void 0 ? void 0 :
                _b.symbol),
            react_1["default"].createElement("button", { onClick: function () { return handleFormatChange('code'); }, className: "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors " + (selectedFormat === 'code'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200') },
                "Code ",
                value)),
        react_1["default"].createElement(card_1.Card, { className: "p-3 bg-gray-50" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("span", { className: "text-sm text-gray-600" }, "Preview:"),
                react_1["default"].createElement("span", { className: "text-lg font-semibold" }, selectedFormat === 'symbol' ? (react_1["default"].createElement(react_1["default"].Fragment, null, (_c = constants_1.SUPPORTED_CURRENCIES[value]) === null || _c === void 0 ? void 0 :
                    _c.symbol,
                    " 1,000.00")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                    "1,000.00 ",
                    value))))),
        react_1["default"].createElement("div", { className: "text-xs text-gray-500 bg-blue-50 p-2 rounded" },
            react_1["default"].createElement("p", null,
                "Current rate: 1 ",
                value,
                " = $",
                (1 / ((_d = constants_1.SUPPORTED_CURRENCIES[value]) === null || _d === void 0 ? void 0 : _d.rate)).toFixed(4),
                " USD"))));
};
exports["default"] = exports.CurrencySelector;
