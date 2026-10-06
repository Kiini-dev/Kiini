"use strict";
/**
 * CSV Export Utility
 * Generates and downloads CSV files from tabular data
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.exportToCSV = void 0;
function exportToCSV(filename, headers, rows) {
    var escapeCsv = function (val) {
        var str = String(val !== null && val !== void 0 ? val : "");
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return "\"" + str.replace(/"/g, '""') + "\"";
        }
        return str;
    };
    var csv = __spreadArrays([
        headers.map(escapeCsv).join(",")
    ], rows.map(function (row) { return row.map(escapeCsv).join(","); })).join("\n");
    var blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename + "-" + new Date().toISOString().split("T")[0] + ".csv");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
exports.exportToCSV = exportToCSV;
