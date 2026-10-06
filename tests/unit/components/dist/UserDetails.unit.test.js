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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
var react_1 = require("react");
var react_2 = require("@testing-library/react");
var vitest_1 = require("vitest");
vitest_1.vi.mock("wouter", function () { return ({
    useParams: function () { return ({ id: "user-test-1" }); },
    useLocation: function () { return [function () { }, vitest_1.vi.fn()]; }
}); });
vitest_1.vi.mock("@/lib/trpc", function () { return ({
    trpc: {
        users: {
            getById: {
                useQuery: function () { return ({
                    data: {
                        id: "user-test-1",
                        name: "Test User",
                        email: "test.user@example.com",
                        role: "admin",
                        isActive: true,
                        organizationId: "org-test-1",
                        department: "Operations",
                        accountName: "testuser",
                        updatedAt: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                        requiresPasswordChange: false
                    },
                    isLoading: false,
                    error: null
                }); }
            }
        }
    }
}); });
vitest_1.vi.mock("@/components/ModuleLayout", function () { return ({
    ModuleLayout: function (_a) {
        var children = _a.children;
        return react_1["default"].createElement("div", null, children);
    }
}); });
vitest_1.vi.mock("@/components/ui/button", function () { return ({
    Button: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return react_1["default"].createElement("button", __assign({}, props), children);
    }
}); });
vitest_1.vi.mock("@/components/ui/card", function () { return ({
    Card: function (_a) {
        var children = _a.children;
        return react_1["default"].createElement("div", null, children);
    },
    CardHeader: function (_a) {
        var children = _a.children;
        return react_1["default"].createElement("div", null, children);
    },
    CardTitle: function (_a) {
        var children = _a.children;
        return react_1["default"].createElement("div", null, children);
    },
    CardDescription: function (_a) {
        var children = _a.children;
        return react_1["default"].createElement("div", null, children);
    },
    CardContent: function (_a) {
        var children = _a.children;
        return react_1["default"].createElement("div", null, children);
    }
}); });
// Many UI components are imported from package modules but can be mocked as simple wrappers.
vitest_1.vi.mock("lucide-react", function () { return __awaiter(void 0, void 0, void 0, function () {
    var actual;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, vitest_1.vi.importActual("lucide-react")];
            case 1:
                actual = _a.sent();
                return [2 /*return*/, __assign({ __esModule: true }, actual)];
        }
    });
}); });
var UserDetails_1 = require("@/pages/UserDetails");
vitest_1.describe("UserDetails page", function () {
    vitest_1.it("renders user profile details when data is available", function () {
        react_2.render(react_1["default"].createElement(UserDetails_1["default"], null));
        vitest_1.expect(react_2.screen.getByText("User Profile")).toBeInTheDocument();
        vitest_1.expect(react_2.screen.getByText(/test.user@example.com/i)).toBeInTheDocument();
        vitest_1.expect(react_2.screen.getByText(/admin/i)).toBeInTheDocument();
        vitest_1.expect(react_2.screen.getByText(/Organization/i)).toBeInTheDocument();
    });
});
