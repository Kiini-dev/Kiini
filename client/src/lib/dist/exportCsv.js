"use strict";
/**
 * Utility helpers for exporting data to CSV.
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.exportToCsv = exports.downloadCsv = exports.toCsv = void 0;
/** Escape a single CSV cell value */
function csvCell(value) {
    if (value === null || value === undefined)
        return "";
    var str = String(value);
    // Quote if contains comma, quote, or newline
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return "\"" + str.replace(/"/g, '""') + "\"";
    }
    return str;
}
/**
 * Convert an array of objects to a CSV string.
 * @param rows   Array of plain objects
 * @param headers  Optional `{ key, label }` pairs; omit to use all object keys
 */
function toCsv(rows, headers) {
    if (rows.length === 0)
        return "";
    var cols = headers !== null && headers !== void 0 ? headers : Object.keys(rows[0]).map(function (k) { return ({ key: k, label: String(k) }); });
    var headerRow = cols.map(function (c) { return csvCell(c.label); }).join(",");
    var bodyRows = rows.map(function (row) { return cols.map(function (c) { return csvCell(row[c.key]); }).join(","); });
    return __spreadArrays([headerRow], bodyRows).join("\n");
}
exports.toCsv = toCsv;
/**
 * Trigger a browser download for a CSV string.
 * @param csv       CSV content string
 * @param filename  Suggested filename (without extension)
 */
function downloadCsv(csv, filename) {
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename + ".csv");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
exports.downloadCsv = downloadCsv;
/**
 * One-call helper: build CSV from rows and download it.
 */
function exportToCsv(rows, filename, headers) {
    var csv = toCsv(rows, headers);
    if (csv)
        downloadCsv(csv, filename);
}
exports.exportToCsv = exportToCsv;
