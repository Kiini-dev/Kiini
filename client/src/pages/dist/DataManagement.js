"use strict";
/**
 * Data Management Page
 * Provides access to backup, restore, and CSV import/export functionality
 */
exports.__esModule = true;
var react_1 = require("react");
var BackupCSVManager_1 = require("@/components/BackupCSVManager");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
function DataManagementPage() {
    return (react_1["default"].createElement("div", { className: "container mx-auto p-6" },
        react_1["default"].createElement("div", { className: "mb-8" },
            react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-2" },
                react_1["default"].createElement(lucide_react_1.Database, { className: "h-8 w-8 text-primary" }),
                react_1["default"].createElement("h1", { className: "text-3xl font-bold" }, "Data Management")),
            react_1["default"].createElement("p", { className: "text-muted-foreground text-lg" }, "Comprehensive tools for backing up, restoring, and transferring your data")),
        react_1["default"].createElement(card_1.Card, { className: "mb-6 border-amber-200 bg-amber-50" },
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-amber-800" },
                    react_1["default"].createElement(lucide_react_1.Shield, { className: "h-5 w-5" }),
                    "Security Notice")),
            react_1["default"].createElement(card_1.CardContent, null,
                react_1["default"].createElement("div", { className: "text-amber-700 space-y-2" },
                    react_1["default"].createElement("p", null,
                        react_1["default"].createElement("strong", null, "Admin Access Required:"),
                        " These operations require administrator privileges."),
                    react_1["default"].createElement("p", null,
                        react_1["default"].createElement("strong", null, "Data Safety:"),
                        " Always backup your current data before performing restore operations."),
                    react_1["default"].createElement("p", null,
                        react_1["default"].createElement("strong", null, "Sensitive Data:"),
                        " Passwords and API keys are automatically excluded from backups and exports.")))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-lg" },
                        react_1["default"].createElement(lucide_react_1.Database, { className: "h-5 w-5 text-blue-500" }),
                        "Full Backups")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement(card_1.CardDescription, null, "Complete database backups of all tables and data for disaster recovery"))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-lg" },
                        react_1["default"].createElement(lucide_react_1.Download, { className: "h-5 w-5 text-green-500" }),
                        "Selective Backups")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement(card_1.CardDescription, null, "Backup specific tables or data ranges for targeted operations"))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-lg" },
                        react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5 text-purple-500" }),
                        "CSV Export")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement(card_1.CardDescription, null, "Export any table to CSV with customizable columns and filtering"))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-lg" },
                        react_1["default"].createElement(lucide_react_1.Upload, { className: "h-5 w-5 text-orange-500" }),
                        "CSV Import")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement(card_1.CardDescription, null, "Import data from CSV files with validation and error reporting")))),
        react_1["default"].createElement(BackupCSVManager_1.BackupCSVManager, null)));
}
exports["default"] = DataManagementPage;
content >
    react_1["default"].createElement("parameter", { name: "filePath" }, "e:\\Kiini\\client\\src\\pages\\DataManagement.tsx");
