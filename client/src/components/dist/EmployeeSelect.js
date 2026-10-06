"use strict";
exports.__esModule = true;
exports.EmployeeSelect = void 0;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var select_1 = require("@/components/ui/select");
var label_1 = require("@/components/ui/label");
var spinner_1 = require("@/components/ui/spinner");
function EmployeeSelect(_a) {
    var value = _a.value, onChange = _a.onChange, _b = _a.label, label = _b === void 0 ? "Select Employee" : _b, _c = _a.required, required = _c === void 0 ? false : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d, className = _a.className, _e = _a.filterStatus, filterStatus = _e === void 0 ? "active" : _e, filterDepartment = _a.filterDepartment, _f = _a.showEmployeeNumber, showEmployeeNumber = _f === void 0 ? true : _f;
    // Fetch employees from DB
    var _g = trpc_1.trpc.employees.list.useQuery(undefined, { refetchOnWindowFocus: false }), _h = _g.data, employees = _h === void 0 ? [] : _h, isLoading = _g.isLoading;
    // Filter employees based on criteria
    var filteredEmployees = react_1.useMemo(function () {
        return employees
            .filter(function (emp) {
            // Status filter
            if (filterStatus !== "all" && emp.status !== filterStatus) {
                return false;
            }
            // Department filter
            if (filterDepartment && emp.department !== filterDepartment) {
                return false;
            }
            return true;
        })
            .sort(function (a, b) {
            var nameA = ((a.firstName || "") + " " + (a.lastName || "")).trim();
            var nameB = ((b.firstName || "") + " " + (b.lastName || "")).trim();
            return nameA.localeCompare(nameB);
        });
    }, [employees, filterStatus, filterDepartment]);
    return (React.createElement("div", { className: className },
        React.createElement(label_1.Label, { className: required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : "" }, label),
        React.createElement(select_1.Select, { value: value || "", onValueChange: onChange, disabled: disabled || isLoading },
            React.createElement(select_1.SelectTrigger, null,
                React.createElement(select_1.SelectValue, { placeholder: isLoading ? "Loading employees..." : "Select an employee" })),
            isLoading ? (React.createElement("div", { className: "p-4 flex items-center justify-center" },
                React.createElement(spinner_1.Spinner, { className: "h-4 w-4" }),
                React.createElement("span", { className: "ml-2 text-sm" }, "Loading employees..."))) : (React.createElement(select_1.SelectContent, { className: "max-h-64" }, filteredEmployees.length === 0 ? (React.createElement("div", { className: "p-4 text-sm text-muted-foreground text-center" }, "No employees found")) : (filteredEmployees.map(function (emp) { return (React.createElement(select_1.SelectItem, { key: emp.id, value: emp.id },
                React.createElement("div", { className: "flex flex-col" },
                    React.createElement("span", { className: "font-medium" },
                        emp.firstName,
                        " ",
                        emp.lastName),
                    React.createElement("div", { className: "text-xs text-muted-foreground" },
                        emp.position && React.createElement("span", null, emp.position),
                        emp.department && React.createElement("span", null,
                            " \u2022 ",
                            emp.department),
                        showEmployeeNumber && emp.employeeNumber && (React.createElement("span", null,
                            " \u2022 ",
                            emp.employeeNumber)))))); })))))));
}
exports.EmployeeSelect = EmployeeSelect;
