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
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var avatar_1 = require("@/components/ui/avatar");
var PhoneInput_1 = require("@/components/PhoneInput");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
function EditEmployee() {
    var params = wouter_1.useParams();
    var employeeId = params.id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var utils = trpc_1.trpc.useUtils();
    var _b = react_1.useState(null), photoPreview = _b[0], setPhotoPreview = _b[1];
    var _c = react_1.useState(null), photoFile = _c[0], setPhotoFile = _c[1];
    var _d = react_1.useState({
        employeeNumber: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "",
        maritalStatus: "",
        dateOfBirth: "",
        hireDate: new Date().toISOString().split("T")[0],
        probationEndDate: "",
        contractEndDate: "",
        department: "",
        position: "",
        jobGroupId: "",
        salary: "",
        employmentType: "full_time",
        status: "active",
        photoUrl: "",
        nationalId: "",
        taxId: "",
        nhifNumber: "",
        nssfNumber: "",
        address: "",
        emergencyContactName: "",
        emergencyContactRelationship: "",
        emergencyContactPhone: "",
        emergencyContact: "",
        bankName: "",
        bankBranch: "",
        bankAccountNumber: ""
    }), formData = _d[0], setFormData = _d[1];
    var _e = react_1.useState(true), isLoading = _e[0], setIsLoading = _e[1];
    // Fetch employee data, departments, and job groups
    var employee = trpc_1.trpc.employees.getById.useQuery(employeeId || "", {
        enabled: !!employeeId
    }).data;
    var _f = trpc_1.trpc.departments.list.useQuery({}), _g = _f.data, departmentsData = _g === void 0 ? [] : _g, departmentsLoading = _f.isLoading;
    var _h = trpc_1.trpc.jobGroups.list.useQuery({}), _j = _h.data, jobGroupsData = _j === void 0 ? [] : _j, jobGroupsLoading = _h.isLoading;
    // Update form when employee data loads
    react_1.useEffect(function () {
        if (employee) {
            var e = employee;
            setFormData({
                employeeNumber: e.employeeNumber || "",
                firstName: e.firstName || "",
                lastName: e.lastName || "",
                email: e.email || "",
                phone: e.phone || "",
                gender: e.gender || "",
                maritalStatus: e.maritalStatus || "",
                dateOfBirth: e.dateOfBirth
                    ? new Date(e.dateOfBirth).toISOString().split("T")[0]
                    : "",
                hireDate: e.hireDate
                    ? new Date(e.hireDate).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                probationEndDate: e.probationEndDate
                    ? new Date(e.probationEndDate).toISOString().split("T")[0]
                    : "",
                contractEndDate: e.contractEndDate
                    ? new Date(e.contractEndDate).toISOString().split("T")[0]
                    : "",
                department: e.department || "",
                position: e.position || "",
                jobGroupId: e.jobGroupId || "",
                salary: e.salary ? e.salary.toString() : "",
                employmentType: e.employmentType || "full-time",
                status: e.status || "active",
                photoUrl: e.photoUrl || "",
                nationalId: e.nationalId || "",
                taxId: e.taxId || "",
                nhifNumber: e.nhifNumber || "",
                nssfNumber: e.nssfNumber || "",
                address: e.address || "",
                emergencyContactName: e.emergencyContactName || "",
                emergencyContactRelationship: e.emergencyContactRelationship || "",
                emergencyContactPhone: e.emergencyContactPhone || "",
                emergencyContact: e.emergencyContact || "",
                bankName: e.bankName || "",
                bankBranch: e.bankBranch || "",
                bankAccountNumber: e.bankAccountNumber || ""
            });
            if (e.photoUrl) {
                setPhotoPreview(e.photoUrl);
            }
            setIsLoading(false);
        }
    }, [employee]);
    var updateEmployeeMutation = trpc_1.trpc.employees.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Employee updated successfully!");
            utils.employees.list.invalidate();
            utils.employees.getById.invalidate(employeeId || "");
            navigate("/employees");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update employee: " + error.message);
        }
    });
    var deleteEmployeeMutation = trpc_1.trpc.employees["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Employee deleted successfully!");
            utils.employees.list.invalidate();
            navigate("/employees");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete employee: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.employeeNumber || !formData.firstName || !formData.lastName || !formData.hireDate || !formData.jobGroupId) {
            sonner_1.toast.error("Please fill in all required fields (including Job Group)");
            return;
        }
        if (photoFile) {
            // Convert photo to compressed base64
            var canvas_1 = document.createElement('canvas');
            var ctx_1 = canvas_1.getContext('2d');
            var img_1 = new Image();
            img_1.onload = function () {
                // Resize to max 300x300
                var maxWidth = 300;
                var maxHeight = 300;
                var width = img_1.width;
                var height = img_1.height;
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                }
                else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }
                canvas_1.width = width;
                canvas_1.height = height;
                ctx_1 === null || ctx_1 === void 0 ? void 0 : ctx_1.drawImage(img_1, 0, 0, width, height);
                // Compress to JPEG with quality 0.7
                var photoDataUrl = canvas_1.toDataURL('image/jpeg', 0.7);
                if (photoDataUrl.length > 1000000) {
                    sonner_1.toast.error("Photo is too large even after compression. Please use a smaller image.");
                    return;
                }
                updateEmployeeMutation.mutate({
                    id: employeeId || "",
                    employeeNumber: formData.employeeNumber,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email || undefined,
                    phone: formData.phone || undefined,
                    gender: formData.gender || undefined,
                    maritalStatus: formData.maritalStatus || undefined,
                    dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
                    hireDate: new Date(formData.hireDate),
                    probationEndDate: formData.probationEndDate || undefined,
                    contractEndDate: formData.contractEndDate || undefined,
                    department: formData.department || undefined,
                    position: formData.position || undefined,
                    jobGroupId: formData.jobGroupId || undefined,
                    salary: formData.salary ? Math.round(parseFloat(formData.salary)) : undefined,
                    employmentType: formData.employmentType || undefined,
                    status: formData.status || undefined,
                    nationalId: formData.nationalId || undefined,
                    taxId: formData.taxId || undefined,
                    nhifNumber: formData.nhifNumber || undefined,
                    nssfNumber: formData.nssfNumber || undefined,
                    address: formData.address || undefined,
                    emergencyContactName: formData.emergencyContactName || undefined,
                    emergencyContactRelationship: formData.emergencyContactRelationship || undefined,
                    emergencyContactPhone: formData.emergencyContactPhone || undefined,
                    emergencyContact: formData.emergencyContact || undefined,
                    bankName: formData.bankName || undefined,
                    bankBranch: formData.bankBranch || undefined,
                    bankAccountNumber: formData.bankAccountNumber || undefined,
                    photoUrl: photoDataUrl
                });
            };
            img_1.src = photoPreview || '';
        }
        else {
            updateEmployeeMutation.mutate({
                id: employeeId || "",
                employeeNumber: formData.employeeNumber,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                gender: formData.gender || undefined,
                maritalStatus: formData.maritalStatus || undefined,
                dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
                hireDate: new Date(formData.hireDate),
                probationEndDate: formData.probationEndDate || undefined,
                contractEndDate: formData.contractEndDate || undefined,
                department: formData.department || undefined,
                position: formData.position || undefined,
                jobGroupId: formData.jobGroupId || undefined,
                salary: formData.salary ? Math.round(parseFloat(formData.salary)) : undefined,
                employmentType: formData.employmentType || undefined,
                status: formData.status || undefined,
                nationalId: formData.nationalId || undefined,
                taxId: formData.taxId || undefined,
                nhifNumber: formData.nhifNumber || undefined,
                nssfNumber: formData.nssfNumber || undefined,
                address: formData.address || undefined,
                emergencyContactName: formData.emergencyContactName || undefined,
                emergencyContactRelationship: formData.emergencyContactRelationship || undefined,
                emergencyContactPhone: formData.emergencyContactPhone || undefined,
                emergencyContact: formData.emergencyContact || undefined,
                bankName: formData.bankName || undefined,
                bankBranch: formData.bankBranch || undefined,
                bankAccountNumber: formData.bankAccountNumber || undefined
            });
        }
    };
    var handleDelete = function () {
        if (confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
            deleteEmployeeMutation.mutate(employeeId || "");
        }
    };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Employee", description: "Update employee details", icon: React.createElement(lucide_react_1.Users, { className: "w-6 h-6" }), breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "HR", href: "/hr" },
                { label: "Employees", href: "/employees" },
                { label: "Edit Employee" },
            ] },
            React.createElement("div", { className: "flex items-center justify-center p-8" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Employee", description: "Update employee details", icon: React.createElement(lucide_react_1.Users, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Employees", href: "/employees" },
            { label: "Edit Employee" },
        ] },
        React.createElement("div", { className: "max-w-3xl" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Edit Employee"),
                    React.createElement(card_1.CardDescription, null, "Update the employee details below")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "employeeNumber" }, "Employee Number *"),
                                React.createElement(input_1.Input, { id: "employeeNumber", placeholder: "e.g., EMP-001", value: formData.employeeNumber, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { employeeNumber: e.target.value }));
                                    } })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "hireDate" }, "Hire Date *"),
                                React.createElement(input_1.Input, { id: "hireDate", type: "date", value: formData.hireDate, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { hireDate: e.target.value }));
                                    } }))),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "firstName" }, "First Name *"),
                                React.createElement(input_1.Input, { id: "firstName", placeholder: "John", value: formData.firstName, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { firstName: e.target.value }));
                                    } })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "lastName" }, "Last Name *"),
                                React.createElement(input_1.Input, { id: "lastName", placeholder: "Doe", value: formData.lastName, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { lastName: e.target.value }));
                                    } }))),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "email" }, "Email"),
                                React.createElement(input_1.Input, { id: "email", type: "email", placeholder: "john@example.com", value: formData.email, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { email: e.target.value }));
                                    } })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "phone" }, "Phone"),
                                React.createElement(PhoneInput_1.PhoneInput, { id: "phone", value: formData.phone, onChange: function (v) {
                                        return setFormData(__assign(__assign({}, formData), { phone: v }));
                                    }, placeholder: "700 000 000" }))),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-3" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "gender" }, "Gender"),
                                React.createElement(select_1.Select, { value: formData.gender, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { gender: value })); } },
                                    React.createElement(select_1.SelectTrigger, { id: "gender" },
                                        React.createElement(select_1.SelectValue, { placeholder: "Select gender" })),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "male" }, "Male"),
                                        React.createElement(select_1.SelectItem, { value: "female" }, "Female"),
                                        React.createElement(select_1.SelectItem, { value: "other" }, "Other")))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "maritalStatus" }, "Marital Status"),
                                React.createElement(select_1.Select, { value: formData.maritalStatus, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { maritalStatus: value })); } },
                                    React.createElement(select_1.SelectTrigger, { id: "maritalStatus" },
                                        React.createElement(select_1.SelectValue, { placeholder: "Select status" })),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "single" }, "Single"),
                                        React.createElement(select_1.SelectItem, { value: "married" }, "Married"),
                                        React.createElement(select_1.SelectItem, { value: "divorced" }, "Divorced"),
                                        React.createElement(select_1.SelectItem, { value: "widowed" }, "Widowed")))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                                React.createElement(select_1.Select, { value: formData.status, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { status: value })); } },
                                    React.createElement(select_1.SelectTrigger, { id: "status" },
                                        React.createElement(select_1.SelectValue, { placeholder: "Select status" })),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                                        React.createElement(select_1.SelectItem, { value: "on_leave" }, "On Leave"),
                                        React.createElement(select_1.SelectItem, { value: "suspended" }, "Suspended"),
                                        React.createElement(select_1.SelectItem, { value: "terminated" }, "Terminated"),
                                        React.createElement(select_1.SelectItem, { value: "resigned" }, "Resigned"))))),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "dateOfBirth" }, "Date of Birth"),
                                React.createElement(input_1.Input, { id: "dateOfBirth", type: "date", value: formData.dateOfBirth, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { dateOfBirth: e.target.value }));
                                    } })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "employmentType" }, "Employment Type"),
                                React.createElement(select_1.Select, { value: formData.employmentType, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { employmentType: value }));
                                    } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select employment type" })),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "full_time" }, "Full-time"),
                                        React.createElement(select_1.SelectItem, { value: "part_time" }, "Part-time"),
                                        React.createElement(select_1.SelectItem, { value: "contract" }, "Contract"),
                                        React.createElement(select_1.SelectItem, { value: "contractual" }, "Contractual"),
                                        React.createElement(select_1.SelectItem, { value: "hourly" }, "Hourly"),
                                        React.createElement(select_1.SelectItem, { value: "wage" }, "Wage"),
                                        React.createElement(select_1.SelectItem, { value: "temporary" }, "Temporary"),
                                        React.createElement(select_1.SelectItem, { value: "seasonal" }, "Seasonal"),
                                        React.createElement(select_1.SelectItem, { value: "intern" }, "Intern"))))),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "probationEndDate" }, "Probation End Date"),
                                React.createElement(input_1.Input, { id: "probationEndDate", type: "date", value: formData.probationEndDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { probationEndDate: e.target.value })); } })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "contractEndDate" }, "Contract End Date"),
                                React.createElement(input_1.Input, { id: "contractEndDate", type: "date", value: formData.contractEndDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { contractEndDate: e.target.value })); } }))),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "department" }, "Department"),
                                React.createElement("div", { className: "flex gap-2" },
                                    React.createElement(select_1.Select, { value: formData.department, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { department: value })); } },
                                        React.createElement(select_1.SelectTrigger, { id: "department", className: "flex-1" },
                                            React.createElement(select_1.SelectValue, { placeholder: "Select a department" })),
                                        React.createElement(select_1.SelectContent, null, departmentsLoading ? (React.createElement(select_1.SelectItem, { value: "__loading__", disabled: true }, "Loading departments...")) : departmentsData.length === 0 ? (React.createElement(select_1.SelectItem, { value: "__empty__", disabled: true }, "No departments available")) : (departmentsData.map(function (dept) { return (React.createElement(select_1.SelectItem, { key: dept.id, value: dept.name }, dept.name)); })))),
                                    React.createElement(button_1.Button, { type: "button", variant: "outline", size: "icon", onClick: function () { return navigate("/departments/create"); }, title: "Create new department" },
                                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "position" }, "Position"),
                                React.createElement(input_1.Input, { id: "position", placeholder: "e.g., Sales Manager", value: formData.position, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { position: e.target.value }));
                                    } }))),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "jobGroupId" }, "Job Group *"),
                                React.createElement(select_1.Select, { value: formData.jobGroupId, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { jobGroupId: value })); } },
                                    React.createElement(select_1.SelectTrigger, { id: "jobGroupId" },
                                        React.createElement(select_1.SelectValue, { placeholder: "Select a job group" })),
                                    React.createElement(select_1.SelectContent, null, jobGroupsLoading ? (React.createElement(select_1.SelectItem, { value: "__loading__", disabled: true }, "Loading job groups...")) : jobGroupsData.length === 0 ? (React.createElement(select_1.SelectItem, { value: "__empty__", disabled: true }, "No job groups available")) : (jobGroupsData.map(function (jg) { return (React.createElement(select_1.SelectItem, { key: jg.id, value: jg.id },
                                        jg.name,
                                        " (",
                                        jg.minimumGrossSalary,
                                        " - ",
                                        jg.maximumGrossSalary,
                                        ")")); }))))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "salary" }, "Salary (Ksh)"),
                                React.createElement(input_1.Input, { id: "salary", type: "number", placeholder: "0.00", value: formData.salary, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { salary: e.target.value }));
                                    }, step: "0.01", min: "0" }))),
                        React.createElement("div", { className: "pt-2" },
                            React.createElement("h3", { className: "text-sm font-medium text-muted-foreground mb-3" }, "Identity & Government IDs"),
                            React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "nationalId" }, "National ID"),
                                    React.createElement(input_1.Input, { id: "nationalId", value: formData.nationalId, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { nationalId: e.target.value })); }, placeholder: "National ID number" })),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "taxId" }, "Tax ID / KRA PIN"),
                                    React.createElement(input_1.Input, { id: "taxId", value: formData.taxId, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { taxId: e.target.value })); }, placeholder: "A123456789X" }))),
                            React.createElement("div", { className: "grid gap-4 md:grid-cols-2 mt-4" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "nhifNumber" }, "NHIF Number"),
                                    React.createElement(input_1.Input, { id: "nhifNumber", value: formData.nhifNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { nhifNumber: e.target.value })); }, placeholder: "NHIF number" })),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "nssfNumber" }, "NSSF Number"),
                                    React.createElement(input_1.Input, { id: "nssfNumber", value: formData.nssfNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { nssfNumber: e.target.value })); }, placeholder: "NSSF number" })))),
                        React.createElement("div", { className: "pt-2" },
                            React.createElement("h3", { className: "text-sm font-medium text-muted-foreground mb-3" }, "Address & Emergency Contact"),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "address" }, "Address"),
                                React.createElement(input_1.Input, { id: "address", value: formData.address, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { address: e.target.value })); }, placeholder: "Residential address" })),
                            React.createElement("div", { className: "grid gap-4 md:grid-cols-2 mt-4" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "emergencyContactName" }, "Emergency Contact Name"),
                                    React.createElement(input_1.Input, { id: "emergencyContactName", value: formData.emergencyContactName, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { emergencyContactName: e.target.value })); }, placeholder: "Full name" })),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "emergencyContactRelationship" }, "Relationship"),
                                    React.createElement(input_1.Input, { id: "emergencyContactRelationship", value: formData.emergencyContactRelationship, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { emergencyContactRelationship: e.target.value })); }, placeholder: "e.g., Spouse, Parent" }))),
                            React.createElement("div", { className: "grid gap-4 md:grid-cols-2 mt-4" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "emergencyContactPhone" }, "Emergency Phone"),
                                    React.createElement(input_1.Input, { id: "emergencyContactPhone", value: formData.emergencyContactPhone, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { emergencyContactPhone: e.target.value })); }, placeholder: "+254 700 000 000" })),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "emergencyContact" }, "Emergency Notes"),
                                    React.createElement(input_1.Input, { id: "emergencyContact", value: formData.emergencyContact, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { emergencyContact: e.target.value })); }, placeholder: "Additional emergency info" })))),
                        React.createElement("div", { className: "pt-2" },
                            React.createElement("h3", { className: "text-sm font-medium text-muted-foreground mb-3" }, "Banking Details"),
                            React.createElement("div", { className: "grid gap-4 md:grid-cols-3" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "bankName" }, "Bank Name"),
                                    React.createElement(input_1.Input, { id: "bankName", value: formData.bankName, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { bankName: e.target.value })); }, placeholder: "Bank name" })),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "bankBranch" }, "Bank Branch"),
                                    React.createElement(input_1.Input, { id: "bankBranch", value: formData.bankBranch, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { bankBranch: e.target.value })); }, placeholder: "Branch name" })),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "bankAccountNumber" }, "Account Number"),
                                    React.createElement(input_1.Input, { id: "bankAccountNumber", value: formData.bankAccountNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { bankAccountNumber: e.target.value })); }, placeholder: "Account number" })))),
                        React.createElement("div", { className: "space-y-3" },
                            React.createElement(label_1.Label, null, "Employee Photo"),
                            React.createElement("div", { className: "flex items-center gap-4" },
                                React.createElement(avatar_1.Avatar, { className: "h-24 w-24" },
                                    React.createElement(avatar_1.AvatarImage, { src: photoPreview || undefined }),
                                    React.createElement(avatar_1.AvatarFallback, null,
                                        formData.firstName.charAt(0),
                                        formData.lastName.charAt(0))),
                                React.createElement("div", { className: "space-y-2 flex-1" },
                                    React.createElement("div", { className: "relative" },
                                        React.createElement(input_1.Input, { id: "photo", type: "file", accept: "image/*", className: "hidden", onChange: function (e) {
                                                var _a;
                                                var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
                                                if (file) {
                                                    if (file.size > 5 * 1024 * 1024) {
                                                        sonner_1.toast.error("Photo must be less than 5MB");
                                                        return;
                                                    }
                                                    setPhotoFile(file);
                                                    // Compress photo immediately on selection
                                                    var canvas_2 = document.createElement('canvas');
                                                    var ctx_2 = canvas_2.getContext('2d');
                                                    var img_2 = new Image();
                                                    img_2.onload = function () {
                                                        // Resize to max 300x300
                                                        var maxWidth = 300;
                                                        var maxHeight = 300;
                                                        var width = img_2.width;
                                                        var height = img_2.height;
                                                        if (width > height) {
                                                            if (width > maxWidth) {
                                                                height *= maxWidth / width;
                                                                width = maxWidth;
                                                            }
                                                        }
                                                        else {
                                                            if (height > maxHeight) {
                                                                width *= maxHeight / height;
                                                                height = maxHeight;
                                                            }
                                                        }
                                                        canvas_2.width = width;
                                                        canvas_2.height = height;
                                                        ctx_2 === null || ctx_2 === void 0 ? void 0 : ctx_2.drawImage(img_2, 0, 0, width, height);
                                                        // Compress to JPEG with quality 0.7
                                                        var compressedData = canvas_2.toDataURL('image/jpeg', 0.7);
                                                        setPhotoPreview(compressedData);
                                                    };
                                                    var reader = new FileReader();
                                                    reader.onload = function (event) {
                                                        var _a;
                                                        img_2.src = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            } }),
                                        React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { var _a; return (_a = document.getElementById("photo")) === null || _a === void 0 ? void 0 : _a.click(); }, className: "w-full" },
                                            React.createElement(lucide_react_1.Upload, { className: "h-4 w-4 mr-2" }),
                                            "Change Photo")),
                                    photoFile && (React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", onClick: function () {
                                            setPhotoFile(null);
                                            setPhotoPreview(formData.photoUrl || null);
                                        }, className: "text-red-600 hover:text-red-700" },
                                        React.createElement(lucide_react_1.X, { className: "h-4 w-4 mr-1" }),
                                        "Remove New Photo"))))),
                        React.createElement("div", { className: "flex gap-2 justify-between" },
                            React.createElement(button_1.Button, { type: "button", variant: "destructive", onClick: handleDelete, disabled: deleteEmployeeMutation.isPending },
                                deleteEmployeeMutation.isPending ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" })),
                                "Delete Employee"),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/employees"); } }, "Cancel"),
                                React.createElement(button_1.Button, { type: "submit", disabled: updateEmployeeMutation.isPending },
                                    updateEmployeeMutation.isPending ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" })),
                                    "Update Employee")))))))));
}
exports["default"] = EditEmployee;
