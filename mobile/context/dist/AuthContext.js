"use strict";
/**
 * Authentication Context
 * Stores authentication state and handles login/logout operations
 */
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
exports.useAuth = exports.AuthProvider = void 0;
var react_1 = require("react");
var async_storage_1 = require("@react-native-async-storage/async-storage");
var constants_1 = require("../config/constants");
var storage_1 = require("../utils/storage");
var AuthContext = react_1.createContext(undefined);
function AuthProvider(_a) {
    var _this = this;
    var children = _a.children;
    var _b = react_1.useState(false), isAuthenticated = _b[0], setIsAuthenticated = _b[1];
    var _c = react_1.useState(true), isLoading = _c[0], setIsLoading = _c[1];
    var _d = react_1.useState(null), user = _d[0], setUser = _d[1];
    react_1.useEffect(function () {
        function restoreAuth() {
            return __awaiter(this, void 0, void 0, function () {
                var token, userData, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, 4, 5]);
                            return [4 /*yield*/, storage_1.storage.getSecure(constants_1.STORAGE_KEYS.AUTH_TOKEN)];
                        case 1:
                            token = _a.sent();
                            return [4 /*yield*/, async_storage_1["default"].getItem(constants_1.STORAGE_KEYS.USER_DATA)];
                        case 2:
                            userData = _a.sent();
                            setIsAuthenticated(!!token);
                            setUser(userData ? JSON.parse(userData) : null);
                            return [3 /*break*/, 5];
                        case 3:
                            error_1 = _a.sent();
                            console.error("Error restoring auth state:", error_1);
                            setIsAuthenticated(false);
                            return [3 /*break*/, 5];
                        case 4:
                            setIsLoading(false);
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
        restoreAuth();
    }, []);
    var signIn = function (email, password) { return __awaiter(_this, void 0, void 0, function () {
        var token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = "mock-token";
                    return [4 /*yield*/, storage_1.storage.setSecure(constants_1.STORAGE_KEYS.AUTH_TOKEN, token)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, async_storage_1["default"].setItem(constants_1.STORAGE_KEYS.USER_DATA, JSON.stringify({ email: email, name: "Mobile User" }))];
                case 2:
                    _a.sent();
                    setUser({ email: email, name: "Mobile User" });
                    setIsAuthenticated(true);
                    return [2 /*return*/];
            }
        });
    }); };
    var signOut = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, storage_1.storage.removeSecure(constants_1.STORAGE_KEYS.AUTH_TOKEN)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, async_storage_1["default"].removeItem(constants_1.STORAGE_KEYS.USER_DATA)];
                case 2:
                    _a.sent();
                    setUser(null);
                    setIsAuthenticated(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var value = react_1.useMemo(function () { return ({
        isAuthenticated: isAuthenticated,
        isLoading: isLoading,
        user: user,
        signIn: signIn,
        signOut: signOut
    }); }, [isAuthenticated, isLoading, user]);
    return react_1["default"].createElement(AuthContext.Provider, { value: value }, children);
}
exports.AuthProvider = AuthProvider;
function useAuth() {
    var context = react_1.useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
exports.useAuth = useAuth;
