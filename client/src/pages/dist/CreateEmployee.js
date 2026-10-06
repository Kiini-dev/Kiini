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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var separator_1 = require("@/components/ui/separator");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var avatar_1 = require("@/components/ui/avatar");
function CreateEmployee() {
    var _this = this;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var utils = trpc_1.trpc.useUtils();
    // Fetch departments and job groups from backend
    var _b = trpc_1.trpc.departments.list.useQuery({}), _c = _b.data, departmentsData = _c === void 0 ? [] : _c, departmentsLoading = _b.isLoading;
    var _d = trpc_1.trpc.jobGroups.list.useQuery({}), _e = _d.data, jobGroupsData = _e === void 0 ? [] : _e, jobGroupsLoading = _d.isLoading;
    var _f = react_1.useState(null), photoPreview = _f[0], setPhotoPreview = _f[1];
    var _g = react_1.useState(null), photoFile = _g[0], setPhotoFile = _g[1];
    // Password management state
    var _h = react_1.useState(false), showPasswordModal = _h[0], setShowPasswordModal = _h[1];
    var _j = react_1.useState(null), generatedPassword = _j[0], setGeneratedPassword = _j[1];
    var _k = react_1.useState(false), passwordCopied = _k[0], setPasswordCopied = _k[1];
    var _l = react_1.useState({
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
        // Identity & Government IDs
        nationalId: "",
        taxId: "",
        nhifNumber: "",
        nssfNumber: "",
        // Address & Emergency Contact
        address: "",
        emergencyContactName: "",
        emergencyContactRelationship: "",
        emergencyContactPhone: "",
        emergencyContact: "",
        // Banking
        bankName: "",
        bankBranch: "",
        bankAccountNumber: ""
    }), formData = _l[0], setFormData = _l[1];
    var createEmployeeMutation = trpc_1.trpc.employees.create.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("Employee created successfully!");
            // If a password was generated, show it to the admin
            if (data.generatedPassword) {
                setGeneratedPassword(data.generatedPassword);
                setShowPasswordModal(true);
            }
            else {
                utils.employees.list.invalidate();
                navigate("/employees");
            }
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create employee: " + error.message);
        }
    });
    var handleCopyPassword = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!generatedPassword) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, navigator.clipboard.writeText(generatedPassword)];
                case 2:
                    _a.sent();
                    setPasswordCopied(true);
                    sonner_1.toast.success("Password copied to clipboard!");
                    setTimeout(function () { return setPasswordCopied(false); }, 2000);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    sonner_1.toast.error("Failed to copy password");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleClosePasswordModal = function () {
        setShowPasswordModal(false);
        setGeneratedPassword(null);
        setPasswordCopied(false);
        utils.employees.list.invalidate();
        navigate("/employees");
    };
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.employeeNumber || !formData.firstName || !formData.lastName || !formData.hireDate || !formData.jobGroupId) {
            sonner_1.toast.error("Please fill in all required fields (including Job Group)");
            return;
        }
        if (photoFile) {
            // Convert photo to base64
            var reader_1 = new FileReader();
            reader_1.onload = function () {
                var photoDataUrl = reader_1.result;
                createEmployeeMutation.mutate({
                    employeeNumber: formData.employeeNumber,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email || undefined,
                    phone: formData.phone || undefined,
                    gender: formData.gender || undefined,
                    maritalStatus: formData.maritalStatus || undefined,
                    dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
                    hireDate: new Date(formData.hireDate),
                    probationEndDate: formData.probationEndDate ? new Date(formData.probationEndDate) : undefined,
                    contractEndDate: formData.contractEndDate ? new Date(formData.contractEndDate) : undefined,
                    department: formData.department || undefined,
                    position: formData.position || undefined,
                    jobGroupId: formData.jobGroupId,
                    salary: formData.salary ? Math.round(parseFloat(formData.salary)) : undefined,
                    employmentType: formData.employmentType || undefined,
                    status: formData.status || undefined,
                    photoUrl: photoDataUrl,
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
            };
            reader_1.readAsDataURL(photoFile);
        }
        else {
            createEmployeeMutation.mutate({
                employeeNumber: formData.employeeNumber,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                gender: formData.gender || undefined,
                maritalStatus: formData.maritalStatus || undefined,
                dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
                hireDate: new Date(formData.hireDate),
                probationEndDate: formData.probationEndDate ? new Date(formData.probationEndDate) : undefined,
                contractEndDate: formData.contractEndDate ? new Date(formData.contractEndDate) : undefined,
                department: formData.department || undefined,
                position: formData.position || undefined,
                jobGroupId: formData.jobGroupId,
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
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Add Employee", description: "Create a new employee record in your organisation", icon: React.createElement(lucide_react_1.UserPlus, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/employees" },
            { label: "Employees", href: "/employees" },
            { label: "Add" },
        ], backLink: { label: "Employees", href: "/employees" } },
        React.createElement("div", { className: "space-y-6 max-w-5xl" },
            React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                            React.createElement(lucide_react_1.Users, { className: "h-4 w-4" }),
                            "Employment Information")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null,
                                    "Employee Number ",
                                    React.createElement("span", { className: "text-destructive" }, "*")),
                                React.createElement(input_1.Input, { placeholder: "e.g., EMP-001", value: formData.employeeNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { employeeNumber: e.target.value })); } })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null,
                                    "Hire Date ",
                                    React.createElement("span", { className: "text-destructive" }, "*")),
                                React.createElement(input_1.Input, { type: "date", value: formData.hireDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { hireDate: e.target.value })); } }))),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null,
                                    "First Name ",
                                    React.createElement("span", { className: "text-destructive" }, "*")),
                                React.createElement(input_1.Input, { placeholder: "e.g., John", value: formData.firstName, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { firstName: e.target.value })); } })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null,
                                    "Last Name ",
                                    React.createElement("span", { className: "text-destructive" }, "*")),
                                React.createElement(input_1.Input, { placeholder: "e.g., Kamau", value: formData.lastName, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { lastName: e.target.value })); } }))),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Email Address"),
                                React.createElement(input_1.Input, { type: "email", placeholder: "john@company.co.ke", value: formData.email, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { email: e.target.value })); } })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Phone Number"),
                                React.createElement(input_1.Input, { placeholder: "+254 712 345 678", value: formData.phone, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { phone: e.target.value })); } }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Date of Birth"),
                            React.createElement(input_1.Input, { type: "date", value: formData.dateOfBirth, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { dateOfBirth: e.target.value })); } })),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Gender"),
                                React.createElement(select_1.Select, { value: formData.gender, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { gender: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select gender" })),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "male" }, "Male"),
                                        React.createElement(select_1.SelectItem, { value: "female" }, "Female"),
                                        React.createElement(select_1.SelectItem, { value: "other" }, "Other")))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Marital Status"),
                                React.createElement(select_1.Select, { value: formData.maritalStatus, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { maritalStatus: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select status" })),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "single" }, "Single"),
                                        React.createElement(select_1.SelectItem, { value: "married" }, "Married"),
                                        React.createElement(select_1.SelectItem, { value: "divorced" }, "Divorced"),
                                        React.createElement(select_1.SelectItem, { value: "widowed" }, "Widowed"))))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                            React.createElement(lucide_react_1.Save, { className: "h-4 w-4" }),
                            "Role & Compensation")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Department"),
                                React.createElement("div", { className: "flex gap-2" },
                                    React.createElement(select_1.Select, { value: formData.department, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { department: v })); } },
                                        React.createElement(select_1.SelectTrigger, { className: "flex-1" },
                                            React.createElement(select_1.SelectValue, { placeholder: "Select department" })),
                                        React.createElement(select_1.SelectContent, null, departmentsLoading ? (React.createElement(select_1.SelectItem, { value: "loading", disabled: true }, "Loading...")) : departmentsData.length === 0 ? (React.createElement(select_1.SelectItem, { value: "none", disabled: true }, "No departments")) : (departmentsData.map(function (dept) { return (React.createElement(select_1.SelectItem, { key: dept.id, value: dept.name }, dept.name)); })))),
                                    React.createElement(button_1.Button, { type: "button", variant: "outline", size: "icon", onClick: function () { return navigate("/departments/create"); }, title: "Create department" },
                                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Position / Job Title"),
                                React.createElement(input_1.Input, { placeholder: "e.g., Senior Software Developer", value: formData.position, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { position: e.target.value })); } }))),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null,
                                    "Job Group ",
                                    React.createElement("span", { className: "text-destructive" }, "*")),
                                React.createElement(select_1.Select, { value: formData.jobGroupId, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { jobGroupId: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select job group" })),
                                    React.createElement(select_1.SelectContent, null, jobGroupsLoading ? (React.createElement(select_1.SelectItem, { value: "loading", disabled: true }, "Loading...")) : jobGroupsData.length === 0 ? (React.createElement(select_1.SelectItem, { value: "none", disabled: true }, "No job groups")) : (jobGroupsData.map(function (jg) { return (React.createElement(select_1.SelectItem, { key: jg.id, value: jg.id },
                                        jg.name,
                                        " (",
                                        jg.minimumGrossSalary,
                                        " \u2013 ",
                                        jg.maximumGrossSalary,
                                        ")")); }))))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Gross Salary (KES)"),
                                React.createElement(input_1.Input, { type: "number", placeholder: "0.00", value: formData.salary, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { salary: e.target.value })); }, step: "0.01", min: "0" }))),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Employment Type"),
                                React.createElement(select_1.Select, { value: formData.employmentType, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { employmentType: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "full_time" }, "Full-time (Permanent)"),
                                        React.createElement(select_1.SelectItem, { value: "part_time" }, "Part-time"),
                                        React.createElement(select_1.SelectItem, { value: "contract" }, "Contract"),
                                        React.createElement(select_1.SelectItem, { value: "contractual" }, "Contractual"),
                                        React.createElement(select_1.SelectItem, { value: "hourly" }, "Hourly"),
                                        React.createElement(select_1.SelectItem, { value: "wage" }, "Wage"),
                                        React.createElement(select_1.SelectItem, { value: "temporary" }, "Temporary"),
                                        React.createElement(select_1.SelectItem, { value: "seasonal" }, "Seasonal"),
                                        React.createElement(select_1.SelectItem, { value: "intern" }, "Intern / Attachment")))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Employment Status"),
                                React.createElement(select_1.Select, { value: formData.status, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { status: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "active" }, "\uD83D\uDFE2 Active"),
                                        React.createElement(select_1.SelectItem, { value: "on_leave" }, "\uD83D\uDFE1 On Leave"),
                                        React.createElement(select_1.SelectItem, { value: "suspended" }, "\uD83D\uDFE0 Suspended"),
                                        React.createElement(select_1.SelectItem, { value: "terminated" }, "\uD83D\uDD34 Terminated"))))),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Probation End Date"),
                                React.createElement(input_1.Input, { type: "date", value: formData.probationEndDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { probationEndDate: e.target.value })); } })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Contract End Date"),
                                React.createElement(input_1.Input, { type: "date", value: formData.contractEndDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { contractEndDate: e.target.value })); } }),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "For contract/temporary employees"))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                            React.createElement(lucide_react_1.Shield, { className: "h-4 w-4" }),
                            "Identity & Government IDs")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "National ID / Passport Number"),
                                React.createElement(input_1.Input, { placeholder: "e.g., 12345678", value: formData.nationalId, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { nationalId: e.target.value })); } })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "KRA PIN (Tax ID)"),
                                React.createElement(input_1.Input, { placeholder: "e.g., A001234567T", value: formData.taxId, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { taxId: e.target.value })); } }))),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "NHIF Number"),
                                React.createElement(input_1.Input, { placeholder: "e.g., 1234567890", value: formData.nhifNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { nhifNumber: e.target.value })); } })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "NSSF Number"),
                                React.createElement(input_1.Input, { placeholder: "e.g., 12345678", value: formData.nssfNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { nssfNumber: e.target.value })); } }))),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Required for payroll, PAYE, NSSF and NHIF computations."))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                            React.createElement(lucide_react_1.MapPin, { className: "h-4 w-4" }),
                            "Address & Emergency Contact")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Home / Residential Address"),
                            React.createElement(textarea_1.Textarea, { value: formData.address, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { address: e.target.value })); }, placeholder: "Street, Estate, Town, County", rows: 2 })),
                        React.createElement(separator_1.Separator, null),
                        React.createElement("p", { className: "text-sm font-medium" }, "Emergency / Next of Kin"),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Contact Name"),
                                React.createElement(input_1.Input, { placeholder: "e.g., Jane Kamau", value: formData.emergencyContactName, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { emergencyContactName: e.target.value })); } })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Relationship"),
                                React.createElement(select_1.Select, { value: formData.emergencyContactRelationship, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { emergencyContactRelationship: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select..." })),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "spouse" }, "Spouse"),
                                        React.createElement(select_1.SelectItem, { value: "parent" }, "Parent"),
                                        React.createElement(select_1.SelectItem, { value: "sibling" }, "Sibling"),
                                        React.createElement(select_1.SelectItem, { value: "child" }, "Child"),
                                        React.createElement(select_1.SelectItem, { value: "friend" }, "Friend"),
                                        React.createElement(select_1.SelectItem, { value: "other" }, "Other")))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Phone Number"),
                                React.createElement(input_1.Input, { placeholder: "+254 722 000 000", value: formData.emergencyContactPhone, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { emergencyContactPhone: e.target.value })); } }))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                            React.createElement(lucide_react_1.CreditCard, { className: "h-4 w-4" }),
                            "Banking Details (for Salary Disbursement)")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Bank Name"),
                                React.createElement(select_1.Select, { value: formData.bankName, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { bankName: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select bank" })),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "KCB Bank" }, "KCB Bank"),
                                        React.createElement(select_1.SelectItem, { value: "Equity Bank" }, "Equity Bank"),
                                        React.createElement(select_1.SelectItem, { value: "Co-operative Bank" }, "Co-operative Bank"),
                                        React.createElement(select_1.SelectItem, { value: "ABSA Bank" }, "ABSA Bank"),
                                        React.createElement(select_1.SelectItem, { value: "Standard Chartered" }, "Standard Chartered"),
                                        React.createElement(select_1.SelectItem, { value: "NCBA Bank" }, "NCBA Bank"),
                                        React.createElement(select_1.SelectItem, { value: "I&M Bank" }, "I&M Bank"),
                                        React.createElement(select_1.SelectItem, { value: "Diamond Trust Bank" }, "Diamond Trust Bank"),
                                        React.createElement(select_1.SelectItem, { value: "Stanbic Bank" }, "Stanbic Bank"),
                                        React.createElement(select_1.SelectItem, { value: "Family Bank" }, "Family Bank"),
                                        React.createElement(select_1.SelectItem, { value: "M-Pesa" }, "M-Pesa (Safaricom)"),
                                        React.createElement(select_1.SelectItem, { value: "Other" }, "Other")))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Bank Branch"),
                                React.createElement(input_1.Input, { placeholder: "e.g., Westlands Branch", value: formData.bankBranch, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { bankBranch: e.target.value })); } }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Bank Account Number / M-Pesa Number"),
                            React.createElement(input_1.Input, { placeholder: "e.g., 0123456789 or +254 712 345 678", value: formData.bankAccountNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { bankAccountNumber: e.target.value })); } }),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Enter bank account number or M-Pesa number for payroll disbursement")))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                            React.createElement(lucide_react_1.Upload, { className: "h-4 w-4" }),
                            "Employee Photo")),
                    React.createElement(card_1.CardContent, null,
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
                                                    var compressedData = canvas_1.toDataURL('image/jpeg', 0.7);
                                                    setPhotoPreview(compressedData);
                                                };
                                                var reader = new FileReader();
                                                reader.onload = function (event) {
                                                    var _a;
                                                    img_1.src = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        } }),
                                    React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { var _a; return (_a = document.getElementById("photo")) === null || _a === void 0 ? void 0 : _a.click(); }, className: "w-full" },
                                        React.createElement(lucide_react_1.Upload, { className: "h-4 w-4 mr-2" }),
                                        "Upload Photo")),
                                photoFile && (React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", onClick: function () {
                                        setPhotoFile(null);
                                        setPhotoPreview(null);
                                    } },
                                    React.createElement(lucide_react_1.X, { className: "h-4 w-4 mr-1" }),
                                    "Remove Photo")),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "JPG, PNG or GIF \u2013 Max 5MB"))))),
                React.createElement("div", { className: "flex gap-3 justify-between pb-8" },
                    React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/employees"); } },
                        React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                        "Cancel"),
                    React.createElement(button_1.Button, { type: "submit", disabled: createEmployeeMutation.isPending, size: "lg" },
                        React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }),
                        createEmployeeMutation.isPending ? "Saving..." : "Add Employee")))),
        showPasswordModal && generatedPassword && (React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" },
            React.createElement(card_1.Card, { className: "w-full max-w-md" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "User Account Created"),
                    React.createElement("p", { className: "text-sm text-muted-foreground mt-1" },
                        "A user account has been created for ",
                        formData.firstName,
                        " ",
                        formData.lastName)),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { className: "text-sm text-muted-foreground mb-2 block" }, "Temporary Password (Share with the employee):"),
                        React.createElement("div", { className: "flex gap-2 items-center bg-muted p-3 rounded-md" },
                            React.createElement("code", { className: "flex-1 font-mono text-sm break-all select-all" }, generatedPassword),
                            React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: handleCopyPassword, className: "flex-shrink-0" }, passwordCopied ? (React.createElement(lucide_react_1.Check, { className: "w-4 h-4 text-green-600" })) : (React.createElement(lucide_react_1.Copy, { className: "w-4 h-4" }))))),
                    React.createElement("div", { className: "bg-amber-50 border border-amber-200 rounded-md p-3" },
                        React.createElement("p", { className: "text-sm text-amber-800" },
                            React.createElement("strong", null, "Important:"),
                            " The employee will be required to change this password on their first login.")),
                    React.createElement("div", { className: "bg-blue-50 border border-blue-200 rounded-md p-3" },
                        React.createElement("p", { className: "text-sm text-blue-800" },
                            React.createElement("strong", null, "Tip:"),
                            " You can copy this password and send it securely to the employee, or display it for them to note down.")),
                    React.createElement(button_1.Button, { onClick: handleClosePasswordModal, className: "w-full" }, "Done")))))));
}
exports["default"] = CreateEmployee;
