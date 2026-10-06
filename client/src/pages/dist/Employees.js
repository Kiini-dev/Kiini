"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var react_1 = require("react");
var useRequireFeature_1 = require("@/hooks/useRequireFeature");
var spinner_1 = require("@/components/ui/spinner");
var trpc_1 = require("@/lib/trpc");
var communications_1 = require("@/lib/communications");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var avatar_1 = require("@/components/ui/avatar");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var lucide_react_2 = require("lucide-react");
var checkbox_1 = require("@/components/ui/checkbox");
var sonner_1 = require("sonner");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var EnhancedBulkActions_1 = require("@/components/list-page/EnhancedBulkActions");
var data_table_controls_1 = require("@/components/ui/data-table-controls");
function Employees() {
    // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
    var _a = wouter_1.useLocation(), location = _a[0], navigate = _a[1];
    var _b = useRequireFeature_1.useRequireFeature("hr:employees:view"), allowed = _b.allowed, isLoading = _b.isLoading;
    var _c = react_1.useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = react_1.useState("all"), statusFilter = _d[0], setStatusFilter = _d[1];
    var _e = react_1.useState("employeeId"), sortField = _e[0], setSortField = _e[1];
    var _f = react_1.useState("asc"), sortOrder = _f[0], setSortOrder = _f[1];
    var _g = data_table_controls_1.usePagination(25), page = _g.page, pageSize = _g.pageSize, setPage = _g.setPage, setPageSize = _g.setPageSize, paginate = _g.paginate;
    var _h = react_1.useState(false), isAddDialogOpen = _h[0], setIsAddDialogOpen = _h[1];
    var _j = react_1.useState(new Set()), selectedEmployees = _j[0], setSelectedEmployees = _j[1];
    var empColumns = [
        { key: "photo", label: "Photo" },
        { key: "employeeId", label: "Employee ID" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "department", label: "Department" },
        { key: "status", label: "Status" },
        { key: "salary", label: "Salary" },
    ];
    var _k = TableColumnSettings_1.useColumnVisibility(empColumns, "employees"), visibleColumns = _k.visibleColumns, toggleColumn = _k.toggleColumn, isVisible = _k.isVisible, columnPageSize = _k.pageSize, updatePageSize = _k.updatePageSize, reset = _k.reset;
    var _l = react_1.useState(false), bulkStatusChangeOpen = _l[0], setBulkStatusChangeOpen = _l[1];
    var _m = react_1.useState(false), bulkDepartmentChangeOpen = _m[0], setBulkDepartmentChangeOpen = _m[1];
    var _o = react_1.useState("active"), bulkStatus = _o[0], setBulkStatus = _o[1];
    var _p = react_1.useState(""), bulkDepartment = _p[0], setBulkDepartment = _p[1];
    var _q = react_1.useState(null), photoPreview = _q[0], setPhotoPreview = _q[1];
    var _r = react_1.useState({
        employeeNumber: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        department: "",
        position: "",
        jobGroupId: "",
        salary: 0,
        employmentType: "full_time",
        status: "active",
        photoUrl: "",
        address: "",
        emergencyContact: "",
        bankAccountNumber: "",
        taxId: "",
        nationalId: ""
    }), newEmployee = _r[0], setNewEmployee = _r[1];
    // ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT TOP LEVEL - BEFORE ANY EARLY RETURNS
    // Data fetching queries
    var _s = trpc_1.trpc.employees.list.useQuery({}), _t = _s.data, employees = _t === void 0 ? [] : _t, employeesLoading = _s.isLoading;
    var _u = trpc_1.trpc.jobGroups.list.useQuery({}).data, jobGroups = _u === void 0 ? [] : _u;
    var utils = trpc_1.trpc.useUtils();
    // Convert frozen Drizzle objects to plain JS for React dependencies
    var plainEmployees = Array.isArray(employees)
        ? employees.map(function (emp) { return JSON.parse(JSON.stringify(emp)); })
        : [];
    var filteredEmployees = react_1.useMemo(function () {
        return plainEmployees.filter(function (employee) {
            var _a, _b, _c;
            var fullName = (employee.firstName + " " + employee.lastName).toLowerCase();
            var matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                (((_a = employee.employeeNumber) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "").includes(searchQuery.toLowerCase()) ||
                (((_b = employee.email) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || "").includes(searchQuery.toLowerCase()) ||
                (((_c = employee.department) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || "").includes(searchQuery.toLowerCase());
            var matchesStatus = statusFilter === "all" || employee.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [plainEmployees, searchQuery, statusFilter]);
    // Mutations - defined before any conditional returns
    var createMutation = trpc_1.trpc.employees.create.useMutation({
        onSuccess: function () {
            utils.employees.list.invalidate();
            sonner_1.toast.success("Employee added successfully");
            setIsAddDialogOpen(false);
            setPhotoPreview(null);
            setNewEmployee({
                employeeNumber: "",
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                dateOfBirth: "",
                department: "",
                position: "",
                jobGroupId: "",
                salary: 0,
                employmentType: "full_time",
                status: "active",
                photoUrl: "",
                address: "",
                emergencyContact: "",
                bankAccountNumber: "",
                taxId: "",
                nationalId: ""
            });
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to add employee: " + error.message);
        }
    });
    var deleteMutation = trpc_1.trpc.employees["delete"].useMutation({
        onSuccess: function () {
            utils.employees.list.invalidate();
            sonner_1.toast.success("Employee deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete employee: " + error.message);
        }
    });
    // Bulk operations mutations
    var bulkUpdateStatusMutation = trpc_1.trpc.employees.bulkUpdateStatus.useMutation({
        onSuccess: function () {
            utils.employees.list.invalidate();
            sonner_1.toast.success("Updated status for " + selectedEmployees.size + " employees");
            setSelectedEmployees(new Set());
            setBulkStatusChangeOpen(false);
        },
        onError: function (error) {
            sonner_1.toast.error("Bulk status update failed: " + error.message);
        }
    });
    var bulkUpdateDepartmentMutation = trpc_1.trpc.employees.bulkUpdateDepartment.useMutation({
        onSuccess: function () {
            utils.employees.list.invalidate();
            sonner_1.toast.success("Updated department for " + selectedEmployees.size + " employees");
            setSelectedEmployees(new Set());
            setBulkDepartmentChangeOpen(false);
        },
        onError: function (error) {
            sonner_1.toast.error("Bulk department update failed: " + error.message);
        }
    });
    var bulkDeleteMutation = trpc_1.trpc.employees.bulkDelete.useMutation({
        onSuccess: function () {
            utils.employees.list.invalidate();
            sonner_1.toast.success("Deleted " + selectedEmployees.size + " employees");
            setSelectedEmployees(new Set());
        },
        onError: function (error) {
            sonner_1.toast.error("Bulk delete failed: " + error.message);
        }
    });
    // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    var handleBulkStatusChange = function () {
        var employeeIds = Array.from(selectedEmployees);
        bulkUpdateStatusMutation.mutate({ employeeIds: employeeIds, status: bulkStatus });
    };
    var handleBulkDepartmentChange = function () {
        var employeeIds = Array.from(selectedEmployees);
        bulkUpdateDepartmentMutation.mutate({ employeeIds: employeeIds, department: bulkDepartment });
    };
    var handleBulkDelete = function () {
        if (confirm("Are you sure you want to delete " + selectedEmployees.size + " employees?")) {
            var employeeIds = Array.from(selectedEmployees);
            bulkDeleteMutation.mutate(employeeIds);
        }
    };
    var getStatusVariant = function (status) {
        switch (status) {
            case "active": return "default";
            case "inactive": return "secondary";
            case "on-leave": return "outline";
            default: return "default";
        }
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case "active": return React.createElement(lucide_react_2.UserCheck, { className: "h-3 w-3" });
            case "inactive": return React.createElement(lucide_react_2.UserX, { className: "h-3 w-3" });
            case "on-leave": return React.createElement(lucide_react_2.Briefcase, { className: "h-3 w-3" });
            default: return null;
        }
    };
    var handlePhotoUpload = function (e) {
        var _a;
        var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            sonner_1.toast.error("Photo must be less than 5MB");
            return;
        }
        // Validate file type
        if (!file.type.startsWith("image/")) {
            sonner_1.toast.error("Please select an image file");
            return;
        }
        // Convert to base64
        var reader = new FileReader();
        reader.onload = function (event) {
            var _a;
            var base64String = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
            setPhotoPreview(base64String);
            setNewEmployee(__assign(__assign({}, newEmployee), { photoUrl: base64String }));
        };
        reader.readAsDataURL(file);
    };
    var clearPhotoUpload = function () {
        setPhotoPreview(null);
        setNewEmployee(__assign(__assign({}, newEmployee), { photoUrl: "" }));
    };
    var handleAddEmployee = function () {
        if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.email || !newEmployee.jobGroupId) {
            sonner_1.toast.error("Please fill in all required fields (First Name, Last Name, Email, and Job Group)");
            return;
        }
        createMutation.mutate({
            employeeNumber: newEmployee.employeeNumber || "EMP-" + Date.now(),
            firstName: newEmployee.firstName,
            lastName: newEmployee.lastName,
            email: newEmployee.email,
            phone: newEmployee.phone || undefined,
            dateOfBirth: newEmployee.dateOfBirth ? new Date(newEmployee.dateOfBirth) : undefined,
            hireDate: new Date(),
            department: newEmployee.department || undefined,
            position: newEmployee.position || undefined,
            jobGroupId: newEmployee.jobGroupId,
            salary: newEmployee.salary > 0 ? newEmployee.salary : undefined,
            employmentType: newEmployee.employmentType,
            status: newEmployee.status,
            photoUrl: newEmployee.photoUrl || undefined,
            address: newEmployee.address || undefined,
            emergencyContact: newEmployee.emergencyContact || undefined,
            bankAccountNumber: newEmployee.bankAccountNumber || undefined,
            taxId: newEmployee.taxId || undefined,
            nationalId: newEmployee.nationalId || undefined
        });
    };
    var handleDeleteEmployee = function (id) {
        if (confirm("Are you sure you want to delete this employee?")) {
            deleteMutation.mutate(id);
        }
    };
    var safeEmployees = Array.isArray(employees) ? employees : [];
    var activeEmployees = safeEmployees.filter(function (e) { return e.status === "active"; }).length;
    var onLeaveEmployees = safeEmployees.filter(function (e) { return e.status === "on-leave"; }).length;
    var totalSalary = safeEmployees.reduce(function (sum, e) { return sum + (e.salary || 0); }, 0);
    var exportFiltered = function () {
        var ids = filteredEmployees.map(function (e) { return e.id; });
        if (ids.length === 0) {
            sonner_1.toast.error("No records to export");
            return;
        }
        trpc_1.trpc.dataExport.exportEmployeesCSV
            .fetch({ ids: ids })
            .then(function (resp) {
            if (resp === null || resp === void 0 ? void 0 : resp.content) {
                var blob = new Blob([resp.content], { type: "text/csv" });
                var url = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = url;
                a.download = resp.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                sonner_1.toast.success("Export completed successfully");
            }
        })["catch"](function () { return sonner_1.toast.error("Export failed"); });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Employees", description: "Manage your workforce and employee information", icon: React.createElement(lucide_react_2.Users, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Employees" },
        ], actions: React.createElement(React.Fragment, null) },
        React.createElement(ListPageToolbar_1.ListPageToolbar, { searchValue: searchQuery, onSearchChange: setSearchQuery, searchPlaceholder: "Search by name, email, ID...", onCreateClick: function () { return setIsAddDialogOpen(true); }, createLabel: "Add Employee", onExportClick: exportFiltered, onPrintClick: function () { return window.print(); }, filterContent: React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                React.createElement(select_1.SelectTrigger, { className: "w-[180px]" },
                    React.createElement(select_1.SelectValue, null)),
                React.createElement(select_1.SelectContent, null,
                    React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                    React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                    React.createElement(select_1.SelectItem, { value: "inactive" }, "Inactive"),
                    React.createElement(select_1.SelectItem, { value: "on-leave" }, "On Leave"))) }),
        React.createElement(dialog_1.Dialog, { open: isAddDialogOpen, onOpenChange: setIsAddDialogOpen },
            React.createElement(dialog_1.DialogContent, { className: "max-w-2xl" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Add New Employee"),
                    React.createElement(dialog_1.DialogDescription, null, "Enter the employee details below to add them to the system.")),
                React.createElement("div", { className: "grid gap-4 py-4 max-h-[70vh] overflow-y-auto" },
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "firstName" }, "First Name *"),
                            React.createElement(input_1.Input, { id: "firstName", value: newEmployee.firstName, onChange: function (e) { return setNewEmployee(__assign(__assign({}, newEmployee), { firstName: e.target.value })); }, placeholder: "John" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "lastName" }, "Last Name *"),
                            React.createElement(input_1.Input, { id: "lastName", value: newEmployee.lastName, onChange: function (e) { return setNewEmployee(__assign(__assign({}, newEmployee), { lastName: e.target.value })); }, placeholder: "Doe" }))),
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "email" }, "Email *"),
                            React.createElement(input_1.Input, { id: "email", type: "email", value: newEmployee.email, onChange: function (e) { return setNewEmployee(__assign(__assign({}, newEmployee), { email: e.target.value })); }, placeholder: "john@example.com" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "phone" }, "Phone Number"),
                            React.createElement(input_1.Input, { id: "phone", value: newEmployee.phone, onChange: function (e) { return setNewEmployee(__assign(__assign({}, newEmployee), { phone: e.target.value })); }, placeholder: "+254 712 345 678" }))),
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "dateOfBirth" }, "Date of Birth"),
                            React.createElement(input_1.Input, { id: "dateOfBirth", type: "date", value: newEmployee.dateOfBirth, onChange: function (e) { return setNewEmployee(__assign(__assign({}, newEmployee), { dateOfBirth: e.target.value })); } })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "jobGroupId" }, "Job Group *"),
                            React.createElement(select_1.Select, { value: newEmployee.jobGroupId, onValueChange: function (value) { return setNewEmployee(__assign(__assign({}, newEmployee), { jobGroupId: value })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Select job group" })),
                                React.createElement(select_1.SelectContent, null, jobGroups.map(function (group) { return (React.createElement(select_1.SelectItem, { key: group.id, value: group.id }, group.name)); }))))),
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "department" }, "Department"),
                            React.createElement(input_1.Input, { id: "department", value: newEmployee.department, onChange: function (e) { return setNewEmployee(__assign(__assign({}, newEmployee), { department: e.target.value })); }, placeholder: "Engineering" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "position" }, "Position"),
                            React.createElement(input_1.Input, { id: "position", value: newEmployee.position, onChange: function (e) { return setNewEmployee(__assign(__assign({}, newEmployee), { position: e.target.value })); }, placeholder: "Senior Developer" }))),
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "salary" }, "Salary (Ksh)"),
                            React.createElement(input_1.Input, { id: "salary", type: "number", value: newEmployee.salary || "", onChange: function (e) { return setNewEmployee(__assign(__assign({}, newEmployee), { salary: Number(e.target.value) })); }, placeholder: "100000" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "employmentType" }, "Employment Type"),
                            React.createElement(select_1.Select, { value: newEmployee.employmentType, onValueChange: function (value) { return setNewEmployee(__assign(__assign({}, newEmployee), { employmentType: value })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "full_time" }, "Full-time"),
                                    React.createElement(select_1.SelectItem, { value: "part_time" }, "Part-time"),
                                    React.createElement(select_1.SelectItem, { value: "contract" }, "Contract"),
                                    React.createElement(select_1.SelectItem, { value: "freelance" }, "Freelance"))))),
                    React.createElement("div", { className: "border-t pt-4" },
                        React.createElement("h4", { className: "font-semibold text-sm mb-4" }, "Employee Photo"),
                        React.createElement("div", { className: "flex flex-col gap-4" },
                            photoPreview && (React.createElement("div", { className: "relative w-32 h-32" },
                                React.createElement("img", { src: photoPreview, alt: "Photo preview", className: "w-32 h-32 rounded-lg object-cover border border-gray-200" }),
                                React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: clearPhotoUpload, className: "absolute -top-2 -right-2" }, "\u2715"))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "photoUpload", className: "text-sm" }, "Upload Photo (max 5MB, optional)"),
                                React.createElement("input", { id: "photoUpload", type: "file", accept: "image/*", onChange: handlePhotoUpload, className: "block w-full text-sm text-gray-500 border border-gray-300 rounded-md p-2 cursor-pointer hover:border-gray-400" }),
                                React.createElement("p", { className: "text-xs text-gray-500" }, "Supported formats: JPG, PNG, GIF, WebP")))),
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                            React.createElement(select_1.Select, { value: newEmployee.status, onValueChange: function (value) { return setNewEmployee(__assign(__assign({}, newEmployee), { status: value })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                                    React.createElement(select_1.SelectItem, { value: "inactive" }, "Inactive"),
                                    React.createElement(select_1.SelectItem, { value: "on-leave" }, "On Leave")))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "employmentStatus" }, "Employment Status"),
                            React.createElement(select_1.Select, { value: newEmployee.employmentType, onValueChange: function (value) { return setNewEmployee(__assign(__assign({}, newEmployee), { employmentType: value })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "full_time" }, "Full-time"),
                                    React.createElement(select_1.SelectItem, { value: "part_time" }, "Part-time"),
                                    React.createElement(select_1.SelectItem, { value: "contract" }, "Contract"),
                                    React.createElement(select_1.SelectItem, { value: "freelance" }, "Freelance"))))),
                    React.createElement("div", { className: "border-t pt-4" },
                        React.createElement("h4", { className: "font-semibold text-sm mb-4" }, "Additional Information"),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "nationalId" }, "National ID"),
                                React.createElement(input_1.Input, { id: "nationalId", value: newEmployee.nationalId, onChange: function (e) { return setNewEmployee(__assign(__assign({}, newEmployee), { nationalId: e.target.value })); }, placeholder: "ID card number" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "taxId" }, "Tax ID (PIN)"),
                                React.createElement(input_1.Input, { id: "taxId", value: newEmployee.taxId, onChange: function (e) { return setNewEmployee(__assign(__assign({}, newEmployee), { taxId: e.target.value })); }, placeholder: "A000000000X" }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "address" }, "Address"),
                            React.createElement(input_1.Input, { id: "address", value: newEmployee.address, onChange: function (e) { return setNewEmployee(__assign(__assign({}, newEmployee), { address: e.target.value })); }, placeholder: "123 Main Street, Nairobi" })),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "bankAccountNumber" }, "Bank Account Number"),
                                React.createElement(input_1.Input, { id: "bankAccountNumber", value: newEmployee.bankAccountNumber, onChange: function (e) { return setNewEmployee(__assign(__assign({}, newEmployee), { bankAccountNumber: e.target.value })); }, placeholder: "0123456789" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "emergencyContact" }, "Emergency Contact"),
                                React.createElement(input_1.Input, { id: "emergencyContact", value: newEmployee.emergencyContact, onChange: function (e) { return setNewEmployee(__assign(__assign({}, newEmployee), { emergencyContact: e.target.value })); }, placeholder: "Name and phone number" }))))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsAddDialogOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: handleAddEmployee, disabled: createMutation.isPending },
                        createMutation.isPending && React.createElement(lucide_react_2.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                        "Add Employee")))),
        React.createElement(EnhancedBulkActions_1.EnhancedBulkActions, { selectedCount: selectedEmployees.size, onClear: function () { return setSelectedEmployees(new Set()); }, actions: [
                { id: "changeStatus", label: "Change Status", icon: React.createElement(lucide_react_2.Settings, { className: "h-3.5 w-3.5" }), onClick: function () { return setBulkStatusChangeOpen(true); } },
                { id: "changeDept", label: "Change Dept", icon: React.createElement(lucide_react_2.Briefcase, { className: "h-3.5 w-3.5" }), onClick: function () { return setBulkDepartmentChangeOpen(true); } },
                EnhancedBulkActions_1.bulkExportAction(selectedEmployees, employees, empColumns, "employees"),
                EnhancedBulkActions_1.bulkCopyIdsAction(selectedEmployees),
                EnhancedBulkActions_1.bulkEmailAction(navigate),
                EnhancedBulkActions_1.bulkDeleteAction(selectedEmployees, function () { return handleBulkDelete(); }),
            ] }),
        React.createElement(dialog_1.Dialog, { open: bulkStatusChangeOpen, onOpenChange: setBulkStatusChangeOpen },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Change Status")),
                React.createElement(select_1.Select, { value: bulkStatus, onValueChange: setBulkStatus },
                    React.createElement(select_1.SelectTrigger, null,
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                        React.createElement(select_1.SelectItem, { value: "inactive" }, "Inactive"),
                        React.createElement(select_1.SelectItem, { value: "on-leave" }, "On Leave"))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setBulkStatusChangeOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: handleBulkStatusChange }, "Update")))),
        React.createElement(dialog_1.Dialog, { open: bulkDepartmentChangeOpen, onOpenChange: setBulkDepartmentChangeOpen },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Change Department")),
                React.createElement(select_1.Select, { value: bulkDepartment, onValueChange: setBulkDepartment },
                    React.createElement(select_1.SelectTrigger, null,
                        React.createElement(select_1.SelectValue, { placeholder: "Select department" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "Engineering" }, "Engineering"),
                        React.createElement(select_1.SelectItem, { value: "Sales" }, "Sales"),
                        React.createElement(select_1.SelectItem, { value: "Finance" }, "Finance"),
                        React.createElement(select_1.SelectItem, { value: "HR" }, "HR"),
                        React.createElement(select_1.SelectItem, { value: "Design" }, "Design"),
                        React.createElement(select_1.SelectItem, { value: "Operations" }, "Operations"))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setBulkDepartmentChangeOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: handleBulkDepartmentChange }, "Update")))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "p-0" },
                React.createElement("div", { className: "flex items-center justify-between px-4 py-3 border-b" },
                    React.createElement("span", { className: "text-sm text-muted-foreground" },
                        filteredEmployees.length,
                        " of ",
                        employees.length,
                        " employees"),
                    React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: empColumns, visibleColumns: visibleColumns, onToggleColumn: toggleColumn, onReset: reset, pageSize: columnPageSize, onPageSizeChange: updatePageSize })),
                isLoading ? (React.createElement("div", { className: "flex items-center justify-center py-8" },
                    React.createElement(lucide_react_2.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))) : filteredEmployees.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No employees found")) : (React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, { className: "w-12" },
                                React.createElement(checkbox_1.Checkbox, { checked: selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0, onCheckedChange: function (checked) {
                                        if (checked) {
                                            setSelectedEmployees(new Set(filteredEmployees.map(function (e) { return e.id; })));
                                        }
                                        else {
                                            setSelectedEmployees(new Set());
                                        }
                                    } })),
                            isVisible("photo") && React.createElement(table_1.TableHead, { className: "w-12" }, "Photo"),
                            isVisible("employeeId") && React.createElement(table_1.TableHead, null, "Employee ID"),
                            isVisible("name") && React.createElement(table_1.TableHead, null, "Name"),
                            isVisible("email") && React.createElement(table_1.TableHead, { className: "hidden lg:table-cell" }, "Email"),
                            isVisible("department") && React.createElement(table_1.TableHead, { className: "hidden md:table-cell" }, "Department"),
                            isVisible("status") && React.createElement(table_1.TableHead, null, "Status"),
                            isVisible("salary") && React.createElement(table_1.TableHead, { className: "hidden md:table-cell" }, "Salary"),
                            React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                    React.createElement(table_1.TableBody, null, filteredEmployees.map(function (employee) {
                        var _a, _b;
                        return (React.createElement(table_1.TableRow, { key: employee.id },
                            React.createElement(table_1.TableCell, null,
                                React.createElement(checkbox_1.Checkbox, { checked: selectedEmployees.has(employee.id), onCheckedChange: function (checked) {
                                        var newSet = new Set(selectedEmployees);
                                        if (checked) {
                                            newSet.add(employee.id);
                                        }
                                        else {
                                            newSet["delete"](employee.id);
                                        }
                                        setSelectedEmployees(newSet);
                                    } })),
                            isVisible("photo") && React.createElement(table_1.TableCell, null,
                                React.createElement(avatar_1.Avatar, { className: "h-8 w-8" },
                                    React.createElement(avatar_1.AvatarImage, { src: employee.photoUrl || undefined, alt: employee.firstName + " " + employee.lastName }),
                                    React.createElement(avatar_1.AvatarFallback, { className: "text-xs" }, (_a = employee.firstName) === null || _a === void 0 ? void 0 :
                                        _a.charAt(0), (_b = employee.lastName) === null || _b === void 0 ? void 0 :
                                        _b.charAt(0)))),
                            isVisible("employeeId") && React.createElement(table_1.TableCell, { className: "font-mono text-sm" }, employee.employeeNumber),
                            isVisible("name") && React.createElement(table_1.TableCell, null,
                                (employee.firstName || ""),
                                " ",
                                (employee.lastName || "")),
                            isVisible("email") && React.createElement(table_1.TableCell, { className: "hidden lg:table-cell text-sm truncate max-w-[180px]" }, employee.email),
                            isVisible("department") && React.createElement(table_1.TableCell, { className: "hidden md:table-cell" }, employee.department),
                            isVisible("status") && React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: getStatusVariant(employee.status) },
                                    React.createElement("span", { className: "flex items-center gap-1" },
                                        getStatusIcon(employee.status),
                                        employee.status))),
                            isVisible("salary") && React.createElement(table_1.TableCell, { className: "hidden md:table-cell" },
                                "Ksh ",
                                (employee.salary || 0).toLocaleString()),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement(RowActionsMenu_1.RowActionsMenu, { primaryActions: [
                                        { label: "View", icon: RowActionsMenu_1.actionIcons.view, onClick: function () { return navigate("/employees/" + employee.id); } },
                                        { label: "Edit", icon: RowActionsMenu_1.actionIcons.edit, onClick: function () { return navigate("/employees/" + employee.id + "/edit"); } },
                                        { label: "Delete", icon: RowActionsMenu_1.actionIcons["delete"], onClick: function () { return handleDeleteEmployee(employee.id); }, variant: "destructive" },
                                    ], menuActions: [
                                        { label: "Send Email", icon: React.createElement(lucide_react_1.Mail, { className: "h-4 w-4" }), onClick: function () { return navigate(communications_1.buildCommunicationComposePath(location, employee.email, "Message for " + (employee.firstName || "Employee"))); } },
                                        { label: "Call", icon: React.createElement(lucide_react_1.Phone, { className: "h-4 w-4" }), onClick: function () { if (employee.phone)
                                                window.open("tel:" + employee.phone);
                                            else
                                                sonner_1.toast.info("No phone number available"); }, separator: true },
                                        { label: "Duplicate", icon: RowActionsMenu_1.actionIcons.copy, onClick: function () { return navigate("/employees/create?clone=" + employee.id); } },
                                    ] }))));
                    }))))))));
}
exports["default"] = Employees;
