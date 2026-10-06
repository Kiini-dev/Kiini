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
exports.getCurrencyService = exports.createCurrencyFormatter = exports.CurrencyService = exports.SUPPORTED_CURRENCIES = void 0;
// Supported currencies with their properties
exports.SUPPORTED_CURRENCIES = {
    USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
    KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rate: 130 },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
    ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', rate: 18.5 },
    UGX: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', rate: 3800 },
    TZS: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', rate: 2600 },
    NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1500 },
    GHS: { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', rate: 15 },
    EGP: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rate: 50 }
};
/**
 * CurrencyService - Handles multi-currency operations
 * Provides exchange rate management, currency conversion, and locale-aware formatting
 */
var CurrencyService = /** @class */ (function () {
    function CurrencyService(db) {
        this.exchangeRates = new Map();
        this.cacheExpiry = 1000 * 60 * 60; // 1 hour
        this.db = db;
    }
    /**
     * Get supported currencies
     */
    CurrencyService.prototype.getSupportedCurrencies = function () {
        return Object.entries(exports.SUPPORTED_CURRENCIES).map(function (_a) {
            var code = _a[0], details = _a[1];
            return (__assign({ code: code }, details));
        });
    };
    /**
     * Get organization's base currency
     */
    CurrencyService.prototype.getOrganizationCurrency = function (organizationId) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                // TODO: Query organization settings from database
                // For now, return default based on organization's country
                return [2 /*return*/, 'KES'];
            });
        });
    };
    /**
     * Set organization's base currency
     */
    CurrencyService.prototype.setOrganizationCurrency = function (organizationId, currency) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                // TODO: Update organization settings in database
                console.log("Set currency for org " + organizationId + " to " + currency);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get exchange rate between two currencies
     * With automatic cache and expiry management
     */
    CurrencyService.prototype.getExchangeRate = function (from, to) {
        return __awaiter(this, void 0, Promise, function () {
            var cacheKey, cached, rate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (from === to)
                            return [2 /*return*/, 1];
                        cacheKey = from + ":" + to;
                        cached = this.exchangeRates.get(cacheKey);
                        if (cached && Date.now() - cached.timestamp.getTime() < this.cacheExpiry) {
                            return [2 /*return*/, cached.rate];
                        }
                        return [4 /*yield*/, this.fetchExchangeRate(from, to)];
                    case 1:
                        rate = _a.sent();
                        this.exchangeRates.set(cacheKey, {
                            fromCurrency: from,
                            toCurrency: to,
                            rate: rate,
                            timestamp: new Date(),
                            provider: 'openexchangerates'
                        });
                        return [2 /*return*/, rate];
                }
            });
        });
    };
    /**
     * Fetch real exchange rate from API
     * Implement with actual service like Open Exchange Rates or Fixer.io
     */
    CurrencyService.prototype.fetchExchangeRate = function (from, to) {
        return __awaiter(this, void 0, Promise, function () {
            var apiKey, response, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        apiKey = process.env.EXCHANGE_RATE_API_KEY;
                        if (!apiKey) {
                            console.warn('Exchange rate API key not configured, using fallback rates');
                            return [2 /*return*/, this.getFallbackRate(from, to)];
                        }
                        return [4 /*yield*/, fetch("https://openexchangerates.org/api/latest.json?app_id=" + apiKey + "&base=" + from + "&symbols=" + to)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            return [2 /*return*/, this.getFallbackRate(from, to)];
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = (_a.sent());
                        return [2 /*return*/, data.rates[to] || this.getFallbackRate(from, to)];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Failed to fetch exchange rate:', error_1);
                        return [2 /*return*/, this.getFallbackRate(from, to)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get fallback rate from static configuration
     */
    CurrencyService.prototype.getFallbackRate = function (from, to) {
        var _a, _b;
        var fromRate = ((_a = exports.SUPPORTED_CURRENCIES[from]) === null || _a === void 0 ? void 0 : _a.rate) || 1;
        var toRate = ((_b = exports.SUPPORTED_CURRENCIES[to]) === null || _b === void 0 ? void 0 : _b.rate) || 1;
        return toRate / fromRate;
    };
    /**
     * Convert amount between currencies
     */
    CurrencyService.prototype.convert = function (amount, from, to) {
        return __awaiter(this, void 0, Promise, function () {
            var rate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getExchangeRate(from, to)];
                    case 1:
                        rate = _a.sent();
                        return [2 /*return*/, Math.round(amount * rate * 100) / 100];
                }
            });
        });
    };
    /**
     * Format amount as currency string
     */
    CurrencyService.prototype.formatCurrency = function (amount, currency, locale) {
        if (locale === void 0) { locale = 'en-US'; }
        var formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return formatter.format(amount);
    };
    /**
     * Parse formatted currency string to number
     */
    CurrencyService.prototype.parseCurrency = function (formatted, currency) {
        var curr = exports.SUPPORTED_CURRENCIES[currency];
        if (!curr)
            throw new Error("Unsupported currency: " + currency);
        // Remove currency symbol and whitespace
        var cleaned = formatted
            .replace(new RegExp("\\" + curr.symbol, 'g'), '')
            .replace(/\s/g, '')
            .trim();
        var parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    };
    /**
     * Get currency display name
     */
    CurrencyService.prototype.getCurrencyName = function (currency) {
        var _a;
        return ((_a = exports.SUPPORTED_CURRENCIES[currency]) === null || _a === void 0 ? void 0 : _a.name) || currency;
    };
    /**
     * Get currency symbol
     */
    CurrencyService.prototype.getCurrencySymbol = function (currency) {
        var _a;
        return ((_a = exports.SUPPORTED_CURRENCIES[currency]) === null || _a === void 0 ? void 0 : _a.symbol) || currency;
    };
    /**
     * Clear exchange rate cache
     */
    CurrencyService.prototype.clearCache = function () {
        this.exchangeRates.clear();
    };
    return CurrencyService;
}());
exports.CurrencyService = CurrencyService;
/**
 * Create formatter instance for a specific locale and currency
 */
exports.createCurrencyFormatter = function (currencyService) {
    return {
        format: function (amount, currency, locale) {
            if (locale === void 0) { locale = 'en-US'; }
            return currencyService.formatCurrency(amount, currency, locale);
        },
        parse: function (formatted, currency) {
            return currencyService.parseCurrency(formatted, currency);
        },
        convert: function (amount, from, to, rate) {
            return __awaiter(this, void 0, Promise, function () {
                return __generator(this, function (_a) {
                    if (rate !== undefined) {
                        return [2 /*return*/, Math.round(amount * rate * 100) / 100];
                    }
                    return [2 /*return*/, currencyService.convert(amount, from, to)];
                });
            });
        }
    };
};
// Export singleton instance
exports.getCurrencyService = function (db) { return new CurrencyService(db); };
