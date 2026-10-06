"use strict";
exports.__esModule = true;
exports.SummaryStatCards = void 0;
var utils_1 = require("@/lib/utils");
var colorMap = {
    blue: { bar: "bg-blue-400", text: "text-blue-600" },
    green: { bar: "bg-emerald-400", text: "text-emerald-600" },
    orange: { bar: "bg-orange-400", text: "text-orange-600" },
    red: { bar: "bg-red-400", text: "text-red-600" },
    purple: { bar: "bg-purple-400", text: "text-purple-600" },
    gray: { bar: "bg-gray-400", text: "text-gray-600" }
};
function SummaryStatCards(_a) {
    var cards = _a.cards, className = _a.className;
    return (React.createElement("div", { className: utils_1.cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 rounded-xl border bg-white dark:bg-slate-900 overflow-hidden", className) }, cards.map(function (card, i) {
        var _a;
        var c = colorMap[card.color || "blue"];
        return (React.createElement("div", { key: i, className: utils_1.cn("p-5 relative", i < cards.length - 1 && "border-r border-border") },
            React.createElement("h3", { className: "text-2xl font-bold text-foreground" }, card.value),
            React.createElement("p", { className: "text-sm text-muted-foreground mt-1" },
                card.label,
                card.count !== undefined && " (" + card.count + ")"),
            React.createElement("div", { className: "mt-3 h-1 w-full rounded-full bg-muted overflow-hidden" },
                React.createElement("div", { className: utils_1.cn("h-full rounded-full transition-all", c.bar), style: { width: ((_a = card.progress) !== null && _a !== void 0 ? _a : 100) + "%" } }))));
    })));
}
exports.SummaryStatCards = SummaryStatCards;
