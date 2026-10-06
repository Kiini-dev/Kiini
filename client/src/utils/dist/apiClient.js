"use strict";
/**
 * HTTP API Client with JWT Authentication
 * Provides axios-like interface for making authenticated API requests
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
var const_1 = require("@shared/const");
/**
 * Get JWT token from storage
 * Checks localStorage first (for persistent storage), then cookies
 */
function getAuthToken() {
    // Check localStorage first
    var storedToken = localStorage.getItem('auth-token');
    if (storedToken) {
        console.log('[apiClient] Using token from localStorage (length: ' + storedToken.length + ')');
        return storedToken;
    }
    // Check for alternative token keys
    var altToken = localStorage.getItem('auth_token');
    if (altToken) {
        console.log('[apiClient] Found auth_token in localStorage, using it');
        return altToken;
    }
    // Fallback to reading cookies
    var name = const_1.COOKIE_NAME + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    for (var _i = 0, cookieArray_1 = cookieArray; _i < cookieArray_1.length; _i++) {
        var cookie = cookieArray_1[_i];
        cookie = cookie.trim();
        if (cookie.indexOf(name) === 0) {
            var cookieToken = cookie.substring(name.length, cookie.length);
            console.log('[apiClient] Using token from cookie (length: ' + cookieToken.length + ')');
            return cookieToken;
        }
    }
    console.warn('[apiClient] No authentication token found in localStorage or cookies');
    return null;
}
/**
 * Build query string from params object
 */
function buildQueryString(params) {
    if (!params)
        return '';
    var searchParams = new URLSearchParams();
    for (var key in params) {
        if (params[key] !== null && params[key] !== undefined) {
            searchParams.append(key, String(params[key]));
        }
    }
    var qs = searchParams.toString();
    return qs ? "?" + qs : '';
}
/**
 * Make an authenticated HTTP request
 */
function request(method, url, config) {
    return __awaiter(this, void 0, Promise, function () {
        var token, headers, queryString, fullUrl, response, data, error, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = getAuthToken();
                    headers = __assign({ 'Content-Type': 'application/json' }, ((config === null || config === void 0 ? void 0 : config.headers) || {}));
                    // Add Authorization header if token exists
                    if (token) {
                        headers['Authorization'] = "Bearer " + token;
                        console.log("[apiClient] " + method + " " + url + " - Token added to Authorization header");
                    }
                    else {
                        console.warn("[apiClient] " + method + " " + url + " - No token available for request");
                    }
                    queryString = buildQueryString(config === null || config === void 0 ? void 0 : config.params);
                    fullUrl = url + queryString;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    console.log("[apiClient] Making " + method + " request to " + fullUrl);
                    return [4 /*yield*/, fetch(fullUrl, {
                            method: method,
                            headers: headers,
                            credentials: 'include',
                            body: (config === null || config === void 0 ? void 0 : config.data) ? JSON.stringify(config.data) : undefined
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()["catch"](function () { return null; })];
                case 3:
                    data = _a.sent();
                    if (!response.ok) {
                        console.error("[apiClient] " + method + " " + fullUrl + " failed with status " + response.status, data);
                        error = new Error((data === null || data === void 0 ? void 0 : data.error) || (data === null || data === void 0 ? void 0 : data.message) || "HTTP " + response.status + ": " + response.statusText);
                        error.status = response.status;
                        error.response = { data: data, status: response.status };
                        throw error;
                    }
                    console.log("[apiClient] " + method + " " + fullUrl + " succeeded with status " + response.status);
                    return [2 /*return*/, {
                            data: (data === null || data === void 0 ? void 0 : data.data) || data,
                            status: response.status,
                            statusText: response.statusText
                        }];
                case 4:
                    error_1 = _a.sent();
                    // Re-throw with enhanced context
                    if (error_1 instanceof Error) {
                        throw error_1;
                    }
                    throw new Error(String(error_1));
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * apiClient - axios-like HTTP client with JWT authentication
 */
var apiClient = {
    /**
     * GET request
     */
    get: function (url, config) {
        return request('GET', url, config);
    },
    /**
     * POST request
     */
    post: function (url, data, config) {
        return request('POST', url, __assign(__assign({}, config), { data: data }));
    },
    /**
     * PUT request
     */
    put: function (url, data, config) {
        return request('PUT', url, __assign(__assign({}, config), { data: data }));
    },
    /**
     * DELETE request
     */
    "delete": function (url, config) {
        return request('DELETE', url, config);
    },
    /**
     * PATCH request
     */
    patch: function (url, data, config) {
        return request('PATCH', url, __assign(__assign({}, config), { data: data }));
    }
};
exports["default"] = apiClient;
