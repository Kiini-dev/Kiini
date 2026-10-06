"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.CurrencySelector = void 0;
var react_1 = require("react");
var react_i18next_1 = require("react-i18next");
var select_1 = require("@/components/ui/select");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var api_client_1 = require("@/lib/api-client");
exports.CurrencySelector = function (_a) {
    var organizationId = _a.organizationId, onCurrencyChange = _a.onCurrencyChange, _b = _a.showRates, showRates = _b === void 0 ? false : _b;
    var t = react_i18next_1.useTranslation().t;
    var _c = react_1.useState('KES'), selectedCurrency = _c[0], setSelectedCurrency = _c[1];
    var _d = react_1.useState(false), loading = _d[0], setLoading = _d[1];
    var _e = react_1.useState({}), exchangeRates = _e[0], setExchangeRates = _e[1];
    // Get supported currencies
    var currencies = api_client_1.api.currency.getSupportedCurrencies.useQuery().data;
    // Fetch exchange rates if showing rates
    react_1.useEffect(function () {
        if (!showRates)
            return;
        var fetchRates = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                setLoading(true);
                try {
                    // TODO: Call API endpoint to fetch exchange rates
                    // const rates = await api.currency.getExchangeRates.query({ baseCurrency: selectedCurrency });
                    // setExchangeRates(rates);
                }
                catch (error) {
                    console.error('Failed to fetch exchange rates:', error);
                }
                finally {
                    setLoading(false);
                }
                return [2 /*return*/];
            });
        }); };
        fetchRates();
    }, [selectedCurrency, showRates]);
    var handleCurrencyChange = function (value) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setSelectedCurrency(value);
            // Update organization setting
            try {
                // TODO: Call API to update organization currency
                // await api.currency.setOrganizationCurrency.mutate({
                //   organizationId,
                //   currency: value,
                // });
                onCurrencyChange === null || onCurrencyChange === void 0 ? void 0 : onCurrencyChange(value);
            }
            catch (error) {
                console.error('Failed to update currency:', error);
            }
            return [2 /*return*/];
        });
    }); };
    return (react_1["default"].createElement("div", { className: "space-y-4" },
        react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
            react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, t('common.currency', 'Currency Settings')),
            react_1["default"].createElement(card_1.CardDescription, null, t('currency.selectCurrency', 'Select your organization\'s base currency'))),
        react_1["default"].createElement("div", { className: "flex items-end gap-3" },
            react_1["default"].createElement("div", { className: "flex-1" },
                react_1["default"].createElement("label", { className: "block text-sm font-medium mb-2" }, t('common.baseCurrency', 'Base Currency')),
                react_1["default"].createElement(select_1.Select, { value: selectedCurrency, onValueChange: handleCurrencyChange },
                    react_1["default"].createElement(select_1.SelectTrigger, null,
                        react_1["default"].createElement(select_1.SelectValue, null)),
                    react_1["default"].createElement(select_1.SelectContent, null, currencies === null || currencies === void 0 ? void 0 : currencies.map(function (currency) { return (react_1["default"].createElement(select_1.SelectItem, { key: currency.code, value: currency.code },
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement("span", { className: "font-semibold" }, currency.symbol),
                            react_1["default"].createElement("span", null, currency.code),
                            react_1["default"].createElement("span", { className: "text-xs text-gray-500" }, currency.name)))); })))),
            showRates && (react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return window.location.reload(); }, disabled: loading }, loading ? t('common.loading', 'Loading...') : t('common.refresh', 'Refresh Rates')))),
        showRates && Object.keys(exchangeRates).length > 0 && (react_1["default"].createElement("div", { className: "mt-4 p-3 bg-gray-50 rounded-lg" },
            react_1["default"].createElement("h4", { className: "font-semibold text-sm mb-2" }, t('currency.exchangeRates', 'Exchange Rates')),
            react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-2 text-sm" }, Object.entries(exchangeRates).map(function (_a) {
                var currency = _a[0], rate = _a[1];
                return (react_1["default"].createElement("div", { key: currency, className: "flex justify-between" },
                    react_1["default"].createElement("span", null,
                        currency,
                        ":"),
                    react_1["default"].createElement("span", { className: "font-mono" }, rate.toFixed(2))));
            }))))));
};
exports["default"] = exports.CurrencySelector;
