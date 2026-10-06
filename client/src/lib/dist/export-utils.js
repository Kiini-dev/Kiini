"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.downloadCSV = void 0;
var sonner_1 = require("sonner");
function downloadCSV(data, filename) {
    if (!data.length) {
        sonner_1.toast.info("No data to export");
        return;
    }
    var headers = Object.keys(data[0]);
    var rows = data.map(function (row) {
        return headers.map(function (h) {
            var val = row[h];
            var str = val === null || val === undefined ? "" : String(val);
            return str.includes(",") || str.includes('"') || str.includes("\n")
                ? "\"" + str.replace(/"/g, '""') + "\""
                : str;
        });
    });
    var csv = __spreadArrays([headers.join(",")], rows.map(function (r) { return r.join(","); })).join("\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename + ".csv";
    a.click();
    URL.revokeObjectURL(url);
    sonner_1.toast.success("Exported " + data.length + " records to " + filename + ".csv");
}
exports.downloadCSV = downloadCSV;
