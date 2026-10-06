"use strict";
exports.__esModule = true;
exports.exportToCsv = void 0;
/**
 * Generic CSV export utility for list pages.
 * Converts an array of objects to CSV and triggers a browser download.
 */
function exportToCsv(filename, rows, columns) {
    if (!rows.length)
        return;
    // Derive columns from the first row if not provided
    var cols = columns !== null && columns !== void 0 ? columns : Object.keys(rows[0]).map(function (k) { return ({ key: k, label: k }); });
    var header = cols.map(function (c) { return "\"" + c.label + "\""; }).join(",");
    var body = rows
        .map(function (row) {
        return cols
            .map(function (c) {
            var val = row[c.key];
            if (val == null)
                return '""';
            var str = String(val).replace(/"/g, '""');
            return "\"" + str + "\"";
        })
            .join(",");
    })
        .join("\n");
    var csv = header + "\n" + body;
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename + ".csv";
    a.click();
    URL.revokeObjectURL(url);
}
exports.exportToCsv = exportToCsv;
