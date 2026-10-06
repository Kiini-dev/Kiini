"use strict";
exports.__esModule = true;
exports.PaymentMethodSelect = void 0;
var constants_1 = require("@/lib/constants");
var select_1 = require("@/components/ui/select");
var label_1 = require("@/components/ui/label");
function PaymentMethodSelect(_a) {
    var value = _a.value, onChange = _a.onChange, _b = _a.label, label = _b === void 0 ? "Payment Method" : _b, _c = _a.required, required = _c === void 0 ? false : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d, className = _a.className;
    return (React.createElement("div", { className: className },
        React.createElement(label_1.Label, { className: required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : "" }, label),
        React.createElement(select_1.Select, { value: value || "", onValueChange: onChange, disabled: disabled },
            React.createElement(select_1.SelectTrigger, null,
                React.createElement(select_1.SelectValue, { placeholder: "Select payment method" })),
            React.createElement(select_1.SelectContent, null, constants_1.PAYMENT_METHODS.map(function (method) { return (React.createElement(select_1.SelectItem, { key: method.value, value: method.value },
                React.createElement("div", { className: "flex flex-col" },
                    React.createElement("span", { className: "font-medium" }, method.label),
                    React.createElement("span", { className: "text-xs text-muted-foreground" }, method.description)))); })))));
}
exports.PaymentMethodSelect = PaymentMethodSelect;
