"use strict";
/**
 * App Stack Navigator
 * Bottom tab navigation for authenticated users
 */
exports.__esModule = true;
var react_1 = require("react");
var native_stack_1 = require("@react-navigation/native-stack");
var bottom_tabs_1 = require("@react-navigation/bottom-tabs");
var vector_icons_1 = require("@expo/vector-icons");
var DashboardScreen_1 = require("../../screens/app/DashboardScreen");
var InvoicesScreen_1 = require("../../screens/app/InvoicesScreen");
var ContactsScreen_1 = require("../../screens/app/ContactsScreen");
var ProjectsScreen_1 = require("../../screens/app/ProjectsScreen");
var OrganizationsScreen_1 = require("../../screens/app/OrganizationsScreen");
var ReportsScreen_1 = require("../../screens/app/ReportsScreen");
var SettingsScreen_1 = require("../../screens/app/SettingsScreen");
var Stack = native_stack_1.createNativeStackNavigator();
var Tab = bottom_tabs_1.createBottomTabNavigator();
function DashboardStack() {
    return (react_1["default"].createElement(Stack.Navigator, null,
        react_1["default"].createElement(Stack.Screen, { name: "DashboardList", component: DashboardScreen_1["default"], options: { headerTitle: "Dashboard" } })));
}
function InvoicesStack() {
    return (react_1["default"].createElement(Stack.Navigator, null,
        react_1["default"].createElement(Stack.Screen, { name: "InvoicesList", component: InvoicesScreen_1["default"], options: { headerTitle: "Invoices" } })));
}
function ContactsStack() {
    return (react_1["default"].createElement(Stack.Navigator, null,
        react_1["default"].createElement(Stack.Screen, { name: "ContactsList", component: ContactsScreen_1["default"], options: { headerTitle: "Contacts" } })));
}
function ProjectsStack() {
    return (react_1["default"].createElement(Stack.Navigator, null,
        react_1["default"].createElement(Stack.Screen, { name: "ProjectsList", component: ProjectsScreen_1["default"], options: { headerTitle: "Projects" } })));
}
function OrganizationsStack() {
    return (react_1["default"].createElement(Stack.Navigator, null,
        react_1["default"].createElement(Stack.Screen, { name: "OrganizationsList", component: OrganizationsScreen_1["default"], options: { headerTitle: "Organizations" } })));
}
function ReportsStack() {
    return (react_1["default"].createElement(Stack.Navigator, null,
        react_1["default"].createElement(Stack.Screen, { name: "ReportsList", component: ReportsScreen_1["default"], options: { headerTitle: "Reports" } })));
}
function SettingsStack() {
    return (react_1["default"].createElement(Stack.Navigator, null,
        react_1["default"].createElement(Stack.Screen, { name: "SettingsList", component: SettingsScreen_1["default"], options: { headerTitle: "Settings" } })));
}
function AppStack() {
    return (react_1["default"].createElement(Tab.Navigator, { screenOptions: function (_a) {
            var route = _a.route;
            return ({
                tabBarIcon: function (_a) {
                    var focused = _a.focused, color = _a.color, size = _a.size;
                    var iconName = "home";
                    if (route.name === "Dashboard") {
                        iconName = focused ? "view-dashboard" : "view-dashboard-outline";
                    }
                    else if (route.name === "Invoices") {
                        iconName = focused ? "file-document" : "file-document-outline";
                    }
                    else if (route.name === "Contacts") {
                        iconName = focused ? "contacts" : "contacts-outline";
                    }
                    else if (route.name === "Projects") {
                        iconName = focused ? "briefcase" : "briefcase-outline";
                    }
                    else if (route.name === "Organizations") {
                        iconName = focused ? "office-building" : "office-building-outline";
                    }
                    else if (route.name === "Reports") {
                        iconName = focused ? "chart-line" : "chart-line";
                    }
                    else if (route.name === "Settings") {
                        iconName = focused ? "cog" : "cog-outline";
                    }
                    return (react_1["default"].createElement(vector_icons_1.MaterialCommunityIcons, { name: iconName, size: size, color: color }));
                },
                tabBarActiveTintColor: "#3b82f6",
                tabBarInactiveTintColor: "#9ca3af",
                headerShown: true
            });
        } },
        react_1["default"].createElement(Tab.Screen, { name: "Dashboard", component: DashboardStack, options: { headerShown: false } }),
        react_1["default"].createElement(Tab.Screen, { name: "Invoices", component: InvoicesStack, options: { headerShown: false } }),
        react_1["default"].createElement(Tab.Screen, { name: "Contacts", component: ContactsStack, options: { headerShown: false } }),
        react_1["default"].createElement(Tab.Screen, { name: "Projects", component: ProjectsStack, options: { headerShown: false } }),
        react_1["default"].createElement(Tab.Screen, { name: "Organizations", component: OrganizationsStack, options: { headerShown: false } }),
        react_1["default"].createElement(Tab.Screen, { name: "Reports", component: ReportsStack, options: { headerShown: false } }),
        react_1["default"].createElement(Tab.Screen, { name: "Settings", component: SettingsStack, options: { headerShown: false } })));
}
exports["default"] = AppStack;
