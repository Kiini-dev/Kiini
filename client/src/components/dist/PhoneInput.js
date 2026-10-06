"use strict";
exports.__esModule = true;
exports.PhoneInput = void 0;
var react_1 = require("react");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var locations_1 = require("@/data/locations");
function parsePhone(value) {
    if (!value)
        return { code: "+254", number: "" };
    var trimmed = value.trim();
    // Try to match a known country code prefix
    for (var _i = 0, PHONE_COUNTRY_CODES_1 = locations_1.PHONE_COUNTRY_CODES; _i < PHONE_COUNTRY_CODES_1.length; _i++) {
        var pc = PHONE_COUNTRY_CODES_1[_i];
        if (trimmed.startsWith(pc.code + " ") || trimmed.startsWith(pc.code)) {
            var num = trimmed.slice(pc.code.length).trim();
            return { code: pc.code, number: num };
        }
    }
    // If starts with +, try to extract code
    if (trimmed.startsWith("+")) {
        var match = trimmed.match(/^(\+\d{1,4})\s*(.*)/);
        if (match)
            return { code: match[1], number: match[2] };
    }
    return { code: "+254", number: trimmed };
}
function PhoneInput(_a) {
    var value = _a.value, onChange = _a.onChange, label = _a.label, _b = _a.placeholder, placeholder = _b === void 0 ? "700 000 000" : _b, required = _a.required, className = _a.className, id = _a.id, disabled = _a.disabled;
    var parsed = parsePhone(value);
    var _c = react_1.useState(parsed.code), code = _c[0], setCode = _c[1];
    var _d = react_1.useState(parsed.number), number = _d[0], setNumber = _d[1];
    react_1.useEffect(function () {
        var p = parsePhone(value);
        setCode(p.code);
        setNumber(p.number);
    }, [value]);
    var handleCodeChange = function (newCode) {
        setCode(newCode);
        onChange(number ? newCode + " " + number : "");
    };
    var handleNumberChange = function (newNumber) {
        setNumber(newNumber);
        onChange(newNumber ? code + " " + newNumber : "");
    };
    return (React.createElement("div", { className: className },
        label && (React.createElement(label_1.Label, { htmlFor: id },
            label,
            required && React.createElement("span", { className: "text-red-500" }, "*"))),
        React.createElement("div", { className: "flex gap-2" },
            React.createElement(select_1.Select, { value: code, onValueChange: handleCodeChange, disabled: disabled },
                React.createElement(select_1.SelectTrigger, { className: "w-[130px] shrink-0" },
                    React.createElement(select_1.SelectValue, { placeholder: "+254" })),
                React.createElement(select_1.SelectContent, null, locations_1.PHONE_COUNTRY_CODES.map(function (pc, i) { return (React.createElement(select_1.SelectItem, { key: pc.code + "-" + pc.country + "-" + i, value: pc.code },
                    pc.flag,
                    " ",
                    pc.code)); }))),
            React.createElement(input_1.Input, { id: id, value: number, onChange: function (e) { return handleNumberChange(e.target.value); }, placeholder: placeholder, className: "flex-1", disabled: disabled }))));
}
exports.PhoneInput = PhoneInput;
