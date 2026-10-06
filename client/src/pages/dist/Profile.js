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
var useAuth_1 = require("@/_core/hooks/useAuth");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var avatar_1 = require("@/components/ui/avatar");
var separator_1 = require("@/components/ui/separator");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
function Profile() {
    var _this = this;
    var _a;
    var user = useAuth_1.useAuth().user;
    var _b = react_1.useState(false), isLoading = _b[0], setIsLoading = _b[1];
    var _c = react_1.useState(false), isUploadingPhoto = _c[0], setIsUploadingPhoto = _c[1];
    var _d = react_1.useState({
        name: (user === null || user === void 0 ? void 0 : user.name) || "",
        email: (user === null || user === void 0 ? void 0 : user.email) || "",
        phone: "",
        company: "",
        position: "",
        address: "",
        city: "",
        country: ""
    }), formData = _d[0], setFormData = _d[1];
    var handleInputChange = function (e) {
        var _a;
        setFormData(__assign(__assign({}, formData), (_a = {}, _a[e.target.name] = e.target.value, _a)));
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, mutationHelpers_1["default"](updateProfileMutation, {
                            name: formData.name || undefined,
                            email: formData.email || undefined,
                            phone: formData.phone || undefined,
                            company: formData.company || undefined,
                            position: formData.position || undefined,
                            address: formData.address || undefined,
                            city: formData.city || undefined,
                            country: formData.country || undefined
                        })];
                case 2:
                    _a.sent();
                    sonner_1.toast.success("Profile updated successfully!");
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    sonner_1.toast.error((err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || "Failed to update profile");
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleAvatarUpload = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var file, maxSizeBytes, reader_1;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file)
                return [2 /*return*/];
            maxSizeBytes = 5 * 1024 * 1024;
            if (file.size > maxSizeBytes) {
                sonner_1.toast.error("Photo must be less than 5MB");
                return [2 /*return*/];
            }
            // Check file type
            if (!file.type.startsWith('image/')) {
                sonner_1.toast.error("File must be an image");
                return [2 /*return*/];
            }
            setIsUploadingPhoto(true);
            try {
                reader_1 = new FileReader();
                reader_1.onloadend = function () { return __awaiter(_this, void 0, void 0, function () {
                    var photoBase64, err_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, 3, 4]);
                                photoBase64 = reader_1.result;
                                // Validate base64 length before upload
                                if (photoBase64.length > 6500000) { // Approximate 5MB limit
                                    sonner_1.toast.error("Image too large after compression. Please use a smaller image.");
                                    setIsUploadingPhoto(false);
                                    return [2 /*return*/];
                                }
                                return [4 /*yield*/, mutationHelpers_1["default"](uploadPhotoMutation, { photoBase64: photoBase64 })];
                            case 1:
                                _a.sent();
                                sonner_1.toast.success("Profile photo updated successfully!");
                                return [3 /*break*/, 4];
                            case 2:
                                err_2 = _a.sent();
                                console.error("Photo upload error:", err_2);
                                sonner_1.toast.error((err_2 === null || err_2 === void 0 ? void 0 : err_2.message) || "Failed to upload photo");
                                return [3 /*break*/, 4];
                            case 3:
                                setIsUploadingPhoto(false);
                                return [7 /*endfinally*/];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); };
                reader_1.readAsDataURL(file);
            }
            catch (err) {
                console.error("File reading error:", err);
                sonner_1.toast.error("Error reading file");
                setIsUploadingPhoto(false);
            }
            return [2 /*return*/];
        });
    }); };
    var getInitials = function (name) {
        if (!name)
            return "U";
        return name
            .split(" ")
            .map(function (n) { return n[0]; })
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };
    var utils = trpc_1.trpc.useUtils();
    var _e = trpc_1.trpc.users.getMyProfile.useQuery(), profileData = _e.data, isProfileLoading = _e.isLoading;
    var updateProfileMutation = trpc_1.trpc.users.updateMyProfile.useMutation({
        onSuccess: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, utils.users.getMyProfile.invalidate()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
    });
    var uploadPhotoMutation = trpc_1.trpc.users.uploadProfilePhoto.useMutation({
        onSuccess: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, utils.users.getMyProfile.invalidate()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
    });
    react_1.useEffect(function () {
        if (profileData) {
            setFormData(function (prev) { return (__assign(__assign({}, prev), { name: profileData.name || prev.name, email: profileData.email || prev.email, phone: profileData.phone || prev.phone, company: profileData.company || prev.company, position: profileData.position || prev.position, address: profileData.address || prev.address, city: profileData.city || prev.city, country: profileData.country || prev.country })); });
        }
    }, [profileData]);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "My Profile", description: "Manage your personal information and preferences", icon: React.createElement(lucide_react_1.User, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Profile" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-6 md:grid-cols-3" },
                React.createElement(card_1.Card, { className: "md:col-span-1" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Profile Picture"),
                        React.createElement(card_1.CardDescription, null, "Update your profile photo")),
                    React.createElement(card_1.CardContent, { className: "flex flex-col items-center space-y-4" },
                        React.createElement(avatar_1.Avatar, { className: "h-32 w-32" },
                            React.createElement(avatar_1.AvatarImage, { src: (profileData === null || profileData === void 0 ? void 0 : profileData.photoUrl) || undefined }),
                            React.createElement(avatar_1.AvatarFallback, { className: "text-2xl" }, getInitials((_a = user === null || user === void 0 ? void 0 : user.name) !== null && _a !== void 0 ? _a : undefined))),
                        React.createElement("input", { id: "avatar-upload", type: "file", accept: "image/*", onChange: handleAvatarUpload, disabled: isUploadingPhoto, className: "hidden", "aria-label": "Upload profile picture" }),
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { var _a; return (_a = document.getElementById('avatar-upload')) === null || _a === void 0 ? void 0 : _a.click(); }, className: "w-full", disabled: isUploadingPhoto }, isUploadingPhoto ? (React.createElement(React.Fragment, null,
                            React.createElement("span", { className: "animate-spin mr-2" }, "\u23F3"),
                            "Uploading...")) : (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.Upload, { className: "mr-2 h-4 w-4" }),
                            "Upload Photo"))),
                        React.createElement("p", { className: "text-xs text-muted-foreground text-center" }, "JPG, PNG or GIF. Max size 2MB."))),
                React.createElement(card_1.Card, { className: "md:col-span-2" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Personal Information"),
                        React.createElement(card_1.CardDescription, null, "Update your personal details")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
                            React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "name" }, "Full Name"),
                                    React.createElement("div", { className: "relative" },
                                        React.createElement(lucide_react_1.User, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
                                        React.createElement(input_1.Input, { id: "name", name: "name", value: formData.name, onChange: handleInputChange, className: "pl-9", placeholder: "John Doe" }))),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "email" }, "Email Address"),
                                    React.createElement("div", { className: "relative" },
                                        React.createElement(lucide_react_1.Mail, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
                                        React.createElement(input_1.Input, { id: "email", name: "email", type: "email", value: formData.email, onChange: handleInputChange, className: "pl-9", placeholder: "john@example.com" }))),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "phone" }, "Phone Number"),
                                    React.createElement("div", { className: "relative" },
                                        React.createElement(lucide_react_1.Phone, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
                                        React.createElement(input_1.Input, { id: "phone", name: "phone", value: formData.phone, onChange: handleInputChange, className: "pl-9", placeholder: "+254 700 000 000" }))),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "company" }, "Company"),
                                    React.createElement("div", { className: "relative" },
                                        React.createElement(lucide_react_1.Building2, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
                                        React.createElement(input_1.Input, { id: "company", name: "company", value: formData.company, onChange: handleInputChange, className: "pl-9", placeholder: "Your Company" }))),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "position" }, "Position"),
                                    React.createElement(input_1.Input, { id: "position", name: "position", value: formData.position, onChange: handleInputChange, placeholder: "Software Developer" })),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "address" }, "Address"),
                                    React.createElement("div", { className: "relative" },
                                        React.createElement(lucide_react_1.MapPin, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
                                        React.createElement(input_1.Input, { id: "address", name: "address", value: formData.address, onChange: handleInputChange, className: "pl-9", placeholder: "123 Main St" }))),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "city" }, "City"),
                                    React.createElement(input_1.Input, { id: "city", name: "city", value: formData.city, onChange: handleInputChange, placeholder: "Nairobi" })),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "country" }, "Country"),
                                    React.createElement(input_1.Input, { id: "country", name: "country", value: formData.country, onChange: handleInputChange, placeholder: "Kenya" }))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "flex justify-end gap-4" },
                                React.createElement(button_1.Button, { type: "button", variant: "outline" }, "Cancel"),
                                React.createElement(button_1.Button, { type: "submit", disabled: isLoading }, isLoading ? "Saving..." : "Save Changes")))))))));
}
exports["default"] = Profile;
