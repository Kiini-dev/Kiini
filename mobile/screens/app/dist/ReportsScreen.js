"use strict";
/**
 * Reports Screen
 * Analytics and reporting dashboard
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
function ReportsScreen() {
    var _this = this;
    var _a;
    var _b = hooks_1.useApi(), execute = _b.execute, loading = _b.loading, reportData = _b.data;
    react_1.useEffect(function () {
        loadReports();
    }, []);
    var loadReports = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, execute("/api/reports/dashboard")];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.error("Error loading reports:", err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return (react_1["default"].createElement(react_native_1.View, { style: styles.centered },
            react_1["default"].createElement(react_native_1.ActivityIndicator, { size: "large", color: "#3b82f6" })));
    }
    var report = reportData;
    return (react_1["default"].createElement(react_native_1.ScrollView, { style: styles.container },
        react_1["default"].createElement(react_native_1.View, { style: styles.header },
            react_1["default"].createElement(react_native_1.Text, { style: styles.title }, "Dashboard"),
            react_1["default"].createElement(react_native_1.TouchableOpacity, { style: styles.refreshButton, onPress: loadReports },
                react_1["default"].createElement(react_native_1.Text, { style: styles.refreshButtonText }, "Refresh"))),
        react_1["default"].createElement(react_native_1.View, { style: [styles.card, styles.largeCard] },
            react_1["default"].createElement(react_native_1.Text, { style: styles.cardLabel }, "Total Revenue"),
            react_1["default"].createElement(react_native_1.Text, { style: styles.largeNumber },
                "$",
                ((_a = report === null || report === void 0 ? void 0 : report.totalRevenue) === null || _a === void 0 ? void 0 : _a.toLocaleString()) || "0"),
            react_1["default"].createElement(react_native_1.Text, { style: styles.growth },
                "\u2191 ",
                (report === null || report === void 0 ? void 0 : report.revenueGrowth) || 0,
                "% from last month")),
        react_1["default"].createElement(react_native_1.View, { style: styles.grid },
            react_1["default"].createElement(react_native_1.View, { style: [styles.card, styles.gridCard] },
                react_1["default"].createElement(react_native_1.Text, { style: styles.number }, (report === null || report === void 0 ? void 0 : report.activeProjects) || 0),
                react_1["default"].createElement(react_native_1.Text, { style: styles.label }, "Active Projects")),
            react_1["default"].createElement(react_native_1.View, { style: [styles.card, styles.gridCard] },
                react_1["default"].createElement(react_native_1.Text, { style: styles.number }, (report === null || report === void 0 ? void 0 : report.completedProjects) || 0),
                react_1["default"].createElement(react_native_1.Text, { style: styles.label }, "Completed"))),
        react_1["default"].createElement(react_native_1.View, { style: styles.grid },
            react_1["default"].createElement(react_native_1.View, { style: [styles.card, styles.gridCard] },
                react_1["default"].createElement(react_native_1.Text, { style: styles.number }, (report === null || report === void 0 ? void 0 : report.pendingInvoices) || 0),
                react_1["default"].createElement(react_native_1.Text, { style: styles.label }, "Pending Invoices")),
            react_1["default"].createElement(react_native_1.View, { style: [styles.card, styles.gridCard] },
                react_1["default"].createElement(react_native_1.Text, { style: styles.number }, (report === null || report === void 0 ? void 0 : report.totalClients) || 0),
                react_1["default"].createElement(react_native_1.Text, { style: styles.label }, "Total Clients"))),
        react_1["default"].createElement(react_native_1.View, { style: styles.actions },
            react_1["default"].createElement(react_native_1.TouchableOpacity, { style: styles.actionButton },
                react_1["default"].createElement(react_native_1.Text, { style: styles.actionButtonText }, "Export Report")),
            react_1["default"].createElement(react_native_1.TouchableOpacity, { style: [styles.actionButton, styles.secondaryButton] },
                react_1["default"].createElement(react_native_1.Text, { style: styles.secondaryButtonText }, "View Details")))));
}
exports["default"] = ReportsScreen;
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
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        paddingTop: 24
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1f2937"
    },
    refreshButton: {
        backgroundColor: "#3b82f6",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6
    },
    refreshButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3
    },
    largeCard: {
        backgroundColor: "#3b82f6"
    },
    cardLabel: {
        fontSize: 14,
        color: "#fff",
        opacity: 0.9,
        marginBottom: 8
    },
    largeNumber: {
        fontSize: 36,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 8
    },
    growth: {
        fontSize: 14,
        color: "#fff",
        opacity: 0.9
    },
    grid: {
        flexDirection: "row",
        gap: 16,
        paddingHorizontal: 16,
        marginBottom: 16
    },
    gridCard: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 120
    },
    number: {
        fontSize: 28,
        fontWeight: "700",
        color: "#3b82f6",
        marginBottom: 4
    },
    label: {
        fontSize: 12,
        color: "#6b7280",
        textAlign: "center"
    },
    actions: {
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 16,
        marginBottom: 24
    },
    actionButton: {
        flex: 1,
        backgroundColor: "#3b82f6",
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: "center"
    },
    actionButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14
    },
    secondaryButton: {
        backgroundColor: "#e5e7eb"
    },
    secondaryButtonText: {
        color: "#1f2937",
        fontWeight: "600",
        fontSize: 14
    }
});
