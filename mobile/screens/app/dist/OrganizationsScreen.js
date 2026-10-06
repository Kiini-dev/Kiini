"use strict";
/**
 * Organizations Screen
 * Display and manage organizations
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
var react_1 = require("react");
var react_native_1 = require("react-native");
var hooks_1 = require("../../hooks");
function OrganizationsScreen(_a) {
    var _this = this;
    var navigation = _a.navigation;
    var _b = hooks_1.useApi(), execute = _b.execute, loading = _b.loading, error = _b.error, organizations = _b.data;
    var _c = react_1.useState(false), refreshing = _c[0], setRefreshing = _c[1];
    react_1.useEffect(function () {
        loadOrganizations();
    }, []);
    var loadOrganizations = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, execute("/api/organizations")];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.error("Error loading organizations:", err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var onRefresh = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setRefreshing(true);
                    return [4 /*yield*/, loadOrganizations()];
                case 1:
                    _a.sent();
                    setRefreshing(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var renderOrganization = function (_a) {
        var item = _a.item;
        return (react_1["default"].createElement(react_native_1.TouchableOpacity, { style: styles.card, onPress: function () {
                return navigation.navigate("OrganizationDetails", { orgId: item.id });
            } },
            react_1["default"].createElement(react_native_1.View, { style: styles.cardContent },
                react_1["default"].createElement(react_native_1.Text, { style: styles.cardTitle }, item.name),
                react_1["default"].createElement(react_native_1.Text, { style: styles.cardSubtitle }, item.slug),
                react_1["default"].createElement(react_native_1.View, { style: styles.tier },
                    react_1["default"].createElement(react_native_1.Text, { style: styles.tierText }, item.tier.toUpperCase())))));
    };
    if (loading && !organizations) {
        return (react_1["default"].createElement(react_native_1.View, { style: styles.centered },
            react_1["default"].createElement(react_native_1.ActivityIndicator, { size: "large", color: "#3b82f6" })));
    }
    return (react_1["default"].createElement(react_native_1.View, { style: styles.container },
        error && (react_1["default"].createElement(react_native_1.View, { style: styles.error },
            react_1["default"].createElement(react_native_1.Text, { style: styles.errorText }, error))),
        react_1["default"].createElement(react_native_1.FlatList, { data: organizations || [], keyExtractor: function (item) { return item.id; }, renderItem: renderOrganization, refreshControl: react_1["default"].createElement(react_native_1.RefreshControl, { refreshing: refreshing, onRefresh: onRefresh }), contentContainerStyle: styles.listContent })));
}
exports["default"] = OrganizationsScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5"
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    listContent: {
        padding: 16
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3
    },
    cardContent: {
        padding: 16
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 4,
        color: "#1f2937"
    },
    cardSubtitle: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 8
    },
    tier: {
        alignSelf: "flex-start",
        backgroundColor: "#dbeafe",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4
    },
    tierText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#0369a1"
    },
    error: {
        backgroundColor: "#fee2e2",
        padding: 12,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 6,
        borderLeftWidth: 4,
        borderLeftColor: "#dc2626"
    },
    errorText: {
        color: "#7f1d1d",
        fontSize: 14
    }
});
