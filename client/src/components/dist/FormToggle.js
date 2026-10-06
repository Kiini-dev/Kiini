"use strict";
exports.__esModule = true;
exports.FormToggle = void 0;
var react_1 = require("react");
var utils_1 = require("@/lib/utils");
exports.FormToggle = function (_a) {
    var label = _a.label, description = _a.description, checked = _a.checked, onChange = _a.onChange, _b = _a.disabled, disabled = _b === void 0 ? false : _b, id = _a.id;
    return (react_1["default"].createElement("div", { className: "flex items-start justify-between py-4 px-4 border-b border-gray-200 last:border-b-0 dark:border-gray-700" },
        react_1["default"].createElement("div", { className: "flex-1" },
            react_1["default"].createElement("label", { htmlFor: id, className: utils_1.cn("text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer", disabled && "opacity-50 cursor-not-allowed") }, label),
            description && (react_1["default"].createElement("p", { className: "text-xs text-gray-500 mt-1 dark:text-gray-400" }, description))),
        react_1["default"].createElement("button", { id: id, onClick: function () { return onChange(!checked); }, disabled: disabled, role: "switch", "aria-checked": checked, className: utils_1.cn("relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 ml-4 flex-shrink-0", checked
                ? "bg-blue-600 dark:bg-blue-500"
                : "bg-gray-300 dark:bg-gray-600", disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer") },
            react_1["default"].createElement("span", { className: utils_1.cn("inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300", checked ? "translate-x-9" : "translate-x-1") }))));
};
exports["default"] = exports.FormToggle;
