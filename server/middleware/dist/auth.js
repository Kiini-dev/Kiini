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
exports.validateAuth = void 0;
var jose_1 = require("jose");
var const_1 = require("@shared/const");
var db_users_1 = require("../db-users");
if (!process.env.JWT_SECRET) {
    var msg = '[SECURITY] JWT_SECRET environment variable is not set. Using an insecure fallback. Set JWT_SECRET before deploying to production!';
    if (process.env.NODE_ENV === 'production') {
        throw new Error(msg);
    }
    console.warn(msg);
}
var JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-only-insecure-fallback');
/**
 * Express middleware to validate JWT authentication.
 * Reads the session cookie (or Authorization Bearer header as fallback),
 * verifies the JWT, loads the user from the database, and attaches it
 * to `req.user`. Returns 401 if the token is missing or invalid.
 */
function validateAuth(req, res, next) {
    var _a;
    return __awaiter(this, void 0, Promise, function () {
        var cookieToken, authHeader, bearerToken, token, payload, userId, user, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    cookieToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a[const_1.COOKIE_NAME];
                    authHeader = req.headers.authorization;
                    bearerToken = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer ')) ? authHeader.slice(7) : undefined;
                    token = cookieToken !== null && cookieToken !== void 0 ? cookieToken : bearerToken;
                    if (!token) {
                        res.status(401).json({ error: 'Authentication required' });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, jose_1.jwtVerify(token, JWT_SECRET)];
                case 1:
                    payload = (_b.sent()).payload;
                    userId = payload.userId;
                    if (!userId) {
                        res.status(401).json({ error: 'Invalid token payload' });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, db_users_1.getUserById(userId)];
                case 2:
                    user = _b.sent();
                    if (!user) {
                        res.status(401).json({ error: 'User not found' });
                        return [2 /*return*/];
                    }
                    // Attach user to request for downstream handlers
                    req.user = user;
                    next();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    res.status(401).json({ error: 'Invalid or expired token' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.validateAuth = validateAuth;
