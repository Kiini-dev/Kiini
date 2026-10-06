"use strict";
exports.__esModule = true;
exports.EmployeeSelector = void 0;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var select_1 = require("@/components/ui/select");
var spinner_1 = require("@/components/ui/spinner");
/**
 * Reusable Employee Selector Component
 * Fetches employees from database and provides a searchable select dropdown
 */
function EmployeeSelector(_a) {
    var value = _a.value, onChange = _a.onChange, _b = _a.placeholder, placeholder = _b === void 0 ? "Select employee..." : _b, _c = _a.disabled, disabled = _c === void 0 ? false : _c, filter = _a.filter, label = _a.label, _d = _a.required, required = _d === void 0 ? false : _d;
    // Fetch employees from backend
    var _e = trpc_1.trpc.employees.list.useQuery({}), _f = _e.data, employees = _f === void 0 ? [] : _f, isLoading = _e.isLoading;
    // Filter employees based on provided filter function
    var filteredEmployees = react_1.useMemo(function () {
        if (!employees)
            return [];
        return filter ? employees.filter(filter) : employees;
    }, [employees, filter]);
    // Get the display name for selected employee
    var selectedEmployee = employees.find(function (e) { return e.id === value; });
    var displayValue = selectedEmployee
        ? selectedEmployee.firstName + " " + selectedEmployee.lastName
        : undefined;
    return (React.createElement("div", { className: "space-y-2" },
        label && (React.createElement("label", { className: "text-sm font-medium" },
            label,
            required && React.createElement("span", { className: "text-red-500 ml-1" }, "*"))),
        React.createElement(select_1.Select, { value: value, onValueChange: onChange, disabled: disabled || isLoading },
            React.createElement(select_1.SelectTrigger, null,
                React.createElement(select_1.SelectValue, { placeholder: placeholder })),
            React.createElement(select_1.SelectContent, null, isLoading ? (React.createElement("div", { className: "flex items-center justify-center p-4" },
                React.createElement(spinner_1.Spinner, { className: "h-4 w-4" }))) : filteredEmployees.length === 0 ? (React.createElement("div", { className: "text-center p-4 text-muted-foreground text-sm" }, "No employees found")) : (filteredEmployees.map(function (employee) { return (React.createElement(select_1.SelectItem, { key: employee.id, value: employee.id },
                employee.firstName,
                " ",
                employee.lastName,
                employee.department && " - " + employee.department)); }))))));
}
exports.EmployeeSelector = EmployeeSelector;
exports["default"] = EmployeeSelector;
