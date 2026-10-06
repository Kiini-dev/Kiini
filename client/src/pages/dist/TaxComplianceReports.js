"use strict";
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var date_fns_1 = require("date-fns");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
// Helper to format month string
function formatMonth(month) {
    try {
        var dt = new Date(month + "-01");
        return date_fns_1.format(dt, "MMM yyyy");
    }
    catch (_a) {
        return month;
    }
}
var ModuleLayout_1 = require("@/components/ModuleLayout");
var lucide_react_1 = require("lucide-react");
var currency_1 = require("@/lib/currency");
var TaxComplianceReportsPage = function () {
    var formatMoney = currency_1.useCurrency().format;
    var _a = react_1.useState(date_fns_1.format(new Date(), "yyyy-MM-01")), from = _a[0], setFrom = _a[1];
    var _b = react_1.useState(date_fns_1.format(new Date(), "yyyy-MM-dd")), to = _b[0], setTo = _b[1];
    var rangeInput = {
        from: new Date(from),
        to: new Date(to)
    };
    var payeQuery = trpc_1.trpc.taxCompliance.getPAYEReport.useQuery(rangeInput, {
        enabled: !!from && !!to
    });
    var nssfQuery = trpc_1.trpc.taxCompliance.getNSSFReport.useQuery(rangeInput, {
        enabled: !!from && !!to
    });
    var shifQuery = trpc_1.trpc.taxCompliance.getSHIFReport.useQuery(rangeInput, {
        enabled: !!from && !!to
    });
    var housingQuery = trpc_1.trpc.taxCompliance.getHousingLevyReport.useQuery(rangeInput, {
        enabled: !!from && !!to
    });
    var kraExport = trpc_1.trpc.taxCompliance.getKRAFilingFormat.useQuery(rangeInput, {
        enabled: false
    });
    var ytdQuery = trpc_1.trpc.taxCompliance.getYearToDateSummary.useQuery({}, {
        enabled: !!from && !!to
    });
    var handleExportKRA = function () {
        kraExport.refetch().then(function (res) {
            if (res.data) {
                var blob = new Blob([atob(res.data)], { type: "text/csv" });
                var url = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = url;
                a.download = "KRA_Filing_" + from + "_to_" + to + ".csv";
                a.click();
            }
        });
    };
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Tax Reports", description: "PAYE, NSSF, SHIF & Housing Levy reports", icon: react_1["default"].createElement(lucide_react_1.BarChart3, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Finance", href: "/accounting" },
            { label: "Tax Reports" },
        ] },
        react_1["default"].createElement("div", { className: "p-6" },
            react_1["default"].createElement("div", { className: "flex flex-wrap gap-4 items-end" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium" }, "From"),
                    react_1["default"].createElement(input_1.Input, { type: "date", value: from, onChange: function (e) { return setFrom(e.target.value); } })),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium" }, "To"),
                    react_1["default"].createElement(input_1.Input, { type: "date", value: to, onChange: function (e) { return setTo(e.target.value); } })),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(button_1.Button, { onClick: function () {
                            payeQuery.refetch();
                            nssfQuery.refetch();
                            shifQuery.refetch();
                            housingQuery.refetch();
                            ytdQuery.refetch();
                        } }, "Refresh")),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: handleExportKRA, disabled: kraExport.isFetching }, "Export KRA Filing"))),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Year-to-Date Summary")),
                    react_1["default"].createElement(card_1.CardContent, null, ytdQuery.isLoading ? (react_1["default"].createElement("p", null, "Loading...")) : ytdQuery.data ? (react_1["default"].createElement("div", { className: "space-y-1" },
                        react_1["default"].createElement("p", null,
                            "Gross Salary: ",
                            formatMoney(ytdQuery.data.grossSalary)),
                        react_1["default"].createElement("p", null,
                            "PAYE: ",
                            formatMoney(ytdQuery.data.payeeTax)),
                        react_1["default"].createElement("p", null,
                            "NSSF: ",
                            formatMoney(ytdQuery.data.nssfContribution)),
                        react_1["default"].createElement("p", null,
                            "SHIF: ",
                            formatMoney(ytdQuery.data.shifContribution)),
                        react_1["default"].createElement("p", null,
                            "Housing Levy: ",
                            formatMoney(ytdQuery.data.housingLevy)))) : (react_1["default"].createElement("p", null, "No data")))),
                react_1["default"].createElement("div", { className: "col-span-full" },
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-2" }, "PAYE Withholdings"),
                    react_1["default"].createElement("div", { className: "overflow-auto" },
                        react_1["default"].createElement(table_1.Table, null,
                            react_1["default"].createElement(table_1.TableHeader, null,
                                react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableCell, null, "Month"),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, "Total PAYE"))),
                            react_1["default"].createElement(table_1.TableBody, null, Array.isArray(payeQuery.data) && payeQuery.data.map(function (row) { return (react_1["default"].createElement(table_1.TableRow, { key: row.month },
                                react_1["default"].createElement(table_1.TableCell, null, formatMonth(row.month)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatMoney(row.totalPayee)))); }))))),
                react_1["default"].createElement("div", { className: "col-span-full" },
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-2" }, "NSSF Contributions"),
                    react_1["default"].createElement("div", { className: "overflow-auto" },
                        react_1["default"].createElement(table_1.Table, null,
                            react_1["default"].createElement(table_1.TableHeader, null,
                                react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableCell, null, "Month"),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, "Total NSSF"))),
                            react_1["default"].createElement(table_1.TableBody, null, Array.isArray(nssfQuery.data) && nssfQuery.data.map(function (row) { return (react_1["default"].createElement(table_1.TableRow, { key: row.month },
                                react_1["default"].createElement(table_1.TableCell, null, formatMonth(row.month)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatMoney(row.totalNSSF)))); }))))),
                react_1["default"].createElement("div", { className: "col-span-full" },
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-2" }, "SHIF Contributions"),
                    react_1["default"].createElement("div", { className: "overflow-auto" },
                        react_1["default"].createElement(table_1.Table, null,
                            react_1["default"].createElement(table_1.TableHeader, null,
                                react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableCell, null, "Month"),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, "Total SHIF"))),
                            react_1["default"].createElement(table_1.TableBody, null, Array.isArray(shifQuery.data) && shifQuery.data.map(function (row) { return (react_1["default"].createElement(table_1.TableRow, { key: row.month },
                                react_1["default"].createElement(table_1.TableCell, null, formatMonth(row.month)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatMoney(row.totalSHIF)))); }))))),
                react_1["default"].createElement("div", { className: "col-span-full" },
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-2" }, "Housing Levy"),
                    react_1["default"].createElement("div", { className: "overflow-auto" },
                        react_1["default"].createElement(table_1.Table, null,
                            react_1["default"].createElement(table_1.TableHeader, null,
                                react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableCell, null, "Month"),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, "Total Housing Levy"))),
                            react_1["default"].createElement(table_1.TableBody, null, Array.isArray(housingQuery.data) && housingQuery.data.map(function (row) { return (react_1["default"].createElement(table_1.TableRow, { key: row.month },
                                react_1["default"].createElement(table_1.TableCell, null, formatMonth(row.month)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatMoney(row.totalHousing)))); }))))))),
        " "));
};
exports["default"] = TaxComplianceReportsPage;
