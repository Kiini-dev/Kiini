"use strict";
/**
 * useApi Hook
 * Custom hook for making API calls with error handling and token refresh
 */
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
exports.useApi = void 0;
var react_1 = require("react");
var axios_1 = require("axios");
var constants_1 = require("../config/constants");
var storage_1 = require("../utils/storage");
function useApi() {
    var _this = this;
    var _a = react_1.useState({
        loading: false,
        error: null,
        data: null
    }), state = _a[0], setState = _a[1];
    var execute = react_1.useCallback(function (endpoint, config) { return __awaiter(_this, void 0, void 0, function () {
        var token, response, err_1, errorMessage;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setState({ loading: true, error: null, data: null });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, storage_1.storage.getSecure(constants_1.STORAGE_KEYS.AUTH_TOKEN)];
                case 2:
                    token = _c.sent();
                    return [4 /*yield*/, axios_1["default"].get("" + constants_1.API_URL + endpoint, __assign(__assign({}, config), { headers: __assign(__assign({}, config === null || config === void 0 ? void 0 : config.headers), { Authorization: token ? "Bearer " + token : undefined }) }))];
                case 3:
                    response = _c.sent();
                    setState({ loading: false, error: null, data: response.data });
                    return [2 /*return*/, response.data];
                case 4:
                    err_1 = _c.sent();
                    errorMessage = ((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || err_1.message || "An error occurred";
                    setState({ loading: false, error: errorMessage, data: null });
                    throw err_1;
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    var reset = react_1.useCallback(function () {
        setState({ loading: false, error: null, data: null });
    }, []);
    return __assign(__assign({}, state), { execute: execute,
        reset: reset });
}
exports.useApi = useApi;
