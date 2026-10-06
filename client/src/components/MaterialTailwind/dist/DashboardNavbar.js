"use strict";
exports.__esModule = true;
exports.DashboardNavbar = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var MaterialTailwindContext_1 = require("@/contexts/MaterialTailwindContext");
var useAuth_1 = require("@/_core/hooks/useAuth");
var ThemeContext_1 = require("@/contexts/ThemeContext");
var input_1 = require("@/components/ui/input");
var avatar_1 = require("@/components/ui/avatar");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
function DashboardNavbar() {
    var _a, _b;
    var _c = MaterialTailwindContext_1.useMaterialTailwindController(), controller = _c[0], dispatch = _c[1];
    var openSidenav = controller.openSidenav, fixedNavbar = controller.fixedNavbar;
    var _d = useAuth_1.useAuth(), user = _d.user, logout = _d.logout;
    var _e = ThemeContext_1.useTheme(), theme = _e.theme, toggleTheme = _e.toggleTheme;
    var _f = wouter_1.useLocation(), setLocationPath = _f[1];
    var pathname = wouter_1.useLocation()[0];
    var breadcrumbs = pathname.split("/").filter(Boolean);
    var currentPage = ((_a = breadcrumbs[breadcrumbs.length - 1]) === null || _a === void 0 ? void 0 : _a.replace(/-/g, " ")) || "Dashboard";
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("button", { onClick: function () { return MaterialTailwindContext_1.setOpenSidenav(dispatch, !openSidenav); }, className: utils_1.cn("fixed top-4 left-4 z-[60] xl:hidden", "p-2.5 rounded-lg shadow-lg transition-all duration-300", "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700", "hover:bg-slate-100 dark:hover:bg-slate-700", "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2", 
            // Move button to the right when sidenav is open to avoid overlap
            openSidenav ? "left-[280px]" : "left-4"), "aria-label": openSidenav ? "Close sidebar" : "Open sidebar" }, openSidenav ? (react_1["default"].createElement(lucide_react_1.X, { className: "w-5 h-5 text-slate-600 dark:text-slate-300" })) : (react_1["default"].createElement(lucide_react_1.Menu, { className: "w-5 h-5 text-slate-600 dark:text-slate-300" }))),
        react_1["default"].createElement("nav", { className: utils_1.cn("sticky top-0 z-30 border-b transition-all", fixedNavbar
                ? "bg-white dark:bg-slate-900 shadow-md border-slate-200 dark:border-slate-700"
                : "bg-transparent border-slate-200/50 dark:border-slate-700/50") },
            react_1["default"].createElement("div", { className: "flex items-center justify-between px-6 py-4" },
                react_1["default"].createElement("div", { className: "flex items-center gap-4" },
                    react_1["default"].createElement("div", { className: "w-12 xl:hidden" }),
                    react_1["default"].createElement("div", { className: "hidden md:block" },
                        react_1["default"].createElement("div", { className: "flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400" }, breadcrumbs.map(function (crumb, idx) { return (react_1["default"].createElement(react_1["default"].Fragment, { key: idx },
                            idx > 0 && react_1["default"].createElement(lucide_react_1.ChevronRight, { className: "w-4 h-4" }),
                            react_1["default"].createElement("span", { className: "capitalize" }, crumb.replace(/-/g, " ")))); })),
                        react_1["default"].createElement("h1", { className: "text-2xl font-bold text-slate-900 dark:text-white capitalize mt-1" }, currentPage))),
                react_1["default"].createElement("div", { className: "flex items-center gap-4" },
                    react_1["default"].createElement("div", { className: "hidden md:block relative w-64" },
                        react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" }),
                        react_1["default"].createElement(input_1.Input, { placeholder: "Search...", className: "pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white" })),
                    react_1["default"].createElement("button", { onClick: toggleTheme, className: "p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors", title: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode" }, theme === "dark" ? (react_1["default"].createElement(lucide_react_1.Sun, { className: "w-5 h-5 text-yellow-500" })) : (react_1["default"].createElement(lucide_react_1.Moon, { className: "w-5 h-5 text-slate-600" }))),
                    react_1["default"].createElement("button", { className: "relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" },
                        react_1["default"].createElement(lucide_react_1.Bell, { className: "w-5 h-5 text-slate-600 dark:text-slate-300" }),
                        react_1["default"].createElement("span", { className: "absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" })),
                    react_1["default"].createElement(dropdown_menu_1.DropdownMenu, null,
                        react_1["default"].createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                            react_1["default"].createElement("button", { className: "flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" },
                                react_1["default"].createElement(avatar_1.Avatar, { className: "w-8 h-8" },
                                    react_1["default"].createElement(avatar_1.AvatarImage, { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (user === null || user === void 0 ? void 0 : user.name) }),
                                    react_1["default"].createElement(avatar_1.AvatarFallback, { className: "dark:bg-slate-700 dark:text-white" }, (_b = user === null || user === void 0 ? void 0 : user.name) === null || _b === void 0 ? void 0 : _b.charAt(0))),
                                react_1["default"].createElement("span", { className: "hidden sm:block text-sm font-medium text-slate-900 dark:text-white" }, (user === null || user === void 0 ? void 0 : user.name) || "User"))),
                        react_1["default"].createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-56 dark:bg-slate-800 dark:border-slate-700" },
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuLabel, { className: "flex flex-col" },
                                react_1["default"].createElement("span", { className: "font-semibold dark:text-white" }, (user === null || user === void 0 ? void 0 : user.name) || "User"),
                                react_1["default"].createElement("span", { className: "text-xs text-slate-500 dark:text-slate-400 font-normal" }, (user === null || user === void 0 ? void 0 : user.email) || "No email")),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuSeparator, { className: "dark:bg-slate-700" }),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { className: "cursor-pointer text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700", onClick: function () { return setLocationPath("/profile"); } },
                                react_1["default"].createElement(lucide_react_1.User, { className: "w-4 h-4 mr-2" }),
                                react_1["default"].createElement("span", null, "Profile")),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { className: "cursor-pointer text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700", onClick: function () { return setLocationPath("/settings"); } },
                                react_1["default"].createElement(lucide_react_1.Settings, { className: "w-4 h-4 mr-2" }),
                                react_1["default"].createElement("span", null, "Settings")),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuSeparator, { className: "dark:bg-slate-700" }),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { className: "cursor-pointer text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-slate-700", onClick: function () { return logout(); } },
                                react_1["default"].createElement(lucide_react_1.LogOut, { className: "w-4 h-4 mr-2" }),
                                react_1["default"].createElement("span", null, "Logout")))),
                    react_1["default"].createElement("button", { onClick: function () { return MaterialTailwindContext_1.setOpenRightSidebar(dispatch, true); }, className: "p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors", title: "Quick Actions" },
                        react_1["default"].createElement(lucide_react_1.Zap, { className: "w-5 h-5 text-slate-600 dark:text-slate-300" })))))));
}
exports.DashboardNavbar = DashboardNavbar;
