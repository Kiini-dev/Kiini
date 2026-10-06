"use strict";
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
exports.generateEmailTemplate = exports.handleDuplicate = exports.handleEmail = exports.handleDownload = exports.handleDelete = exports.handleEdit = exports.handleView = void 0;
var sonner_1 = require("sonner");
var delay_1 = require("@/lib/delay");
exports.handleView = function (id, type, navigate) {
    if (navigate) {
        // Convert type to plural form for routes
        var pluralType = type.endsWith('s') ? type : type + "s";
        navigate("/" + pluralType + "/" + id);
    }
    else {
        sonner_1.toast.info("Viewing " + type + " #" + id);
    }
};
exports.handleEdit = function (id, type, navigate) {
    if (navigate) {
        // Convert type to plural form for routes
        var pluralType = type.endsWith('s') ? type : type + "s";
        navigate("/" + pluralType + "/" + id + "/edit");
    }
    else {
        sonner_1.toast.info("Opening editor for " + type + " #" + id);
    }
};
exports.handleDelete = function (id, type, onConfirm) { return __awaiter(void 0, void 0, void 0, function () {
    var confirmed, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                confirmed = window.confirm("Are you sure you want to delete this " + type + "? This action cannot be undone.");
                if (!confirmed) return [3 /*break*/, 7];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                if (!onConfirm) return [3 /*break*/, 3];
                return [4 /*yield*/, onConfirm()];
            case 2:
                _a.sent();
                return [3 /*break*/, 5];
            case 3: 
            // Fallback simulated delay for callers that don't provide a real handler.
            return [4 /*yield*/, delay_1.maybeDelay(500)];
            case 4:
                // Fallback simulated delay for callers that don't provide a real handler.
                _a.sent();
                _a.label = 5;
            case 5:
                sonner_1.toast.success(type + " deleted successfully");
                return [3 /*break*/, 7];
            case 6:
                error_1 = _a.sent();
                sonner_1.toast.error("Failed to delete " + type);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.handleDownload = function (id, type, format, data, downloadHandler) {
    if (format === void 0) { format = "pdf"; }
    return __awaiter(void 0, void 0, void 0, function () {
        var toastId, blobOrString, content, blob, url, link, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    toastId = sonner_1.toast.loading("Generating " + format.toUpperCase() + " for " + type + " #" + id + "...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    blobOrString = void 0;
                    if (!downloadHandler) return [3 /*break*/, 3];
                    return [4 /*yield*/, downloadHandler(id, type, format, data)];
                case 2:
                    blobOrString = _a.sent();
                    return [3 /*break*/, 5];
                case 3: 
                // Simulate document generation
                return [4 /*yield*/, delay_1.maybeDelay(1500)];
                case 4:
                    // Simulate document generation
                    _a.sent();
                    content = generateDocumentContent(type, id, data);
                    // Default to string content (will be turned into a blob)
                    blobOrString = content;
                    _a.label = 5;
                case 5:
                    blob = blobOrString instanceof Blob ? blobOrString : new Blob([blobOrString], {
                        type: format === "pdf" ? "application/pdf" : "text/csv"
                    });
                    url = window.URL.createObjectURL(blob);
                    link = document.createElement("a");
                    link.href = url;
                    link.download = type + "-" + id + "-" + Date.now() + "." + format;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    sonner_1.toast.success(type + " downloaded successfully", { id: toastId });
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    sonner_1.toast.error("Failed to download " + type, { id: toastId });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
};
exports.handleEmail = function (id, type, recipientEmail, data, sendHandler) { return __awaiter(void 0, void 0, void 0, function () {
    var email, promptResult, emailRegex, toastId, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = recipientEmail;
                if (!email) {
                    promptResult = prompt("Enter recipient email for " + type + " #" + id + ":");
                    if (!promptResult) {
                        sonner_1.toast.error("Email address is required");
                        return [2 /*return*/];
                    }
                    email = promptResult;
                }
                if (!email) {
                    sonner_1.toast.error("Email address is required");
                    return [2 /*return*/];
                }
                emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    sonner_1.toast.error("Please enter a valid email address");
                    return [2 /*return*/];
                }
                toastId = sonner_1.toast.loading("Sending " + type + " to " + email + "...");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                if (!sendHandler) return [3 /*break*/, 3];
                return [4 /*yield*/, sendHandler(id, type, email, data)];
            case 2:
                _a.sent();
                return [3 /*break*/, 5];
            case 3: 
            // Simulate API call to send email
            return [4 /*yield*/, delay_1.maybeDelay(2000)];
            case 4:
                // Simulate API call to send email
                _a.sent();
                _a.label = 5;
            case 5:
                sonner_1.toast.success(type + " sent successfully to " + email, { id: toastId });
                return [3 /*break*/, 7];
            case 6:
                error_3 = _a.sent();
                sonner_1.toast.error("Failed to send " + type, { id: toastId });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.handleDuplicate = function (id, type, onSuccess, duplicateHandler) { return __awaiter(void 0, void 0, void 0, function () {
    var toastId, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                toastId = sonner_1.toast.loading("Duplicating " + type + " #" + id + "...");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                if (!duplicateHandler) return [3 /*break*/, 3];
                return [4 /*yield*/, duplicateHandler(id, type)];
            case 2:
                _a.sent();
                return [3 /*break*/, 5];
            case 3: 
            // Simulate API call
            return [4 /*yield*/, delay_1.maybeDelay(1000)];
            case 4:
                // Simulate API call
                _a.sent();
                _a.label = 5;
            case 5:
                sonner_1.toast.success(type + " duplicated successfully", { id: toastId });
                onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
                return [3 /*break*/, 7];
            case 6:
                error_4 = _a.sent();
                sonner_1.toast.error("Failed to duplicate " + type, { id: toastId });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
// Generate document content for download
var generateDocumentContent = function (type, id, data) {
    var _a, _b, _c, _d;
    var timestamp = new Date().toLocaleString();
    var company = (data === null || data === void 0 ? void 0 : data.companyName) || import.meta.env.VITE_APP_TITLE || 'Your Company';
    var email = (data === null || data === void 0 ? void 0 : data.companyEmail) || '';
    var phone = (data === null || data === void 0 ? void 0 : data.companyPhone) || '';
    switch (type.toLowerCase()) {
        case "invoice":
            return ("\nINVOICE #" + id + "\nGenerated: " + timestamp + "\n\n" + company + "\n" + (email ? 'Email: ' + email : '') + "\n" + (phone ? 'Phone: ' + phone : '') + "\n\nBill To: " + ((data === null || data === void 0 ? void 0 : data.clientName) || "Client Name") + "\nInvoice Date: " + ((data === null || data === void 0 ? void 0 : data.date) || new Date().toLocaleDateString()) + "\nDue Date: " + ((data === null || data === void 0 ? void 0 : data.dueDate) || "N/A") + "\n\nDescription: " + ((data === null || data === void 0 ? void 0 : data.description) || "Services rendered") + "\nAmount: Ksh " + (((_a = data === null || data === void 0 ? void 0 : data.amount) === null || _a === void 0 ? void 0 : _a.toLocaleString()) || "0") + "\n\nThank you for your business!\n      ").trim();
        case "receipt":
            return ("\nPAYMENT RECEIPT #" + id + "\nGenerated: " + timestamp + "\n\n" + company + "\n" + (email ? 'Email: ' + email : '') + "\n\nReceived From: " + ((data === null || data === void 0 ? void 0 : data.clientName) || "Client Name") + "\nAmount: Ksh " + (((_b = data === null || data === void 0 ? void 0 : data.amount) === null || _b === void 0 ? void 0 : _b.toLocaleString()) || "0") + "\nPayment Method: " + ((data === null || data === void 0 ? void 0 : data.method) || "N/A") + "\nDate: " + ((data === null || data === void 0 ? void 0 : data.date) || new Date().toLocaleDateString()) + "\n\nThank you for your payment!\n      ").trim();
        case "estimate":
        case "quotation":
            return ("\nQUOTATION #" + id + "\nGenerated: " + timestamp + "\n\n" + company + "\n" + (email ? 'Email: ' + email : '') + "\n\nPrepared For: " + ((data === null || data === void 0 ? void 0 : data.clientName) || "Client Name") + "\nDate: " + ((data === null || data === void 0 ? void 0 : data.date) || new Date().toLocaleDateString()) + "\nValid Until: " + ((data === null || data === void 0 ? void 0 : data.validUntil) || "N/A") + "\n\nDescription: " + ((data === null || data === void 0 ? void 0 : data.description) || "Services") + "\nTotal Amount: Ksh " + (((_c = data === null || data === void 0 ? void 0 : data.amount) === null || _c === void 0 ? void 0 : _c.toLocaleString()) || "0") + "\n\nThis quotation is valid for 30 days from the date of issue.\n      ").trim();
        case "proposal":
            return ("\nBUSINESS PROPOSAL #" + id + "\nGenerated: " + timestamp + "\n\n" + company + "\n\nProposal For: " + ((data === null || data === void 0 ? void 0 : data.clientName) || "Client Name") + "\nTitle: " + ((data === null || data === void 0 ? void 0 : data.title) || "Project Proposal") + "\nDate: " + ((data === null || data === void 0 ? void 0 : data.date) || new Date().toLocaleDateString()) + "\n\n" + ((data === null || data === void 0 ? void 0 : data.description) || "Proposal details...") + "\n\nTotal Value: Ksh " + (((_d = data === null || data === void 0 ? void 0 : data.amount) === null || _d === void 0 ? void 0 : _d.toLocaleString()) || "0") + "\n      ").trim();
        default:
            return ("\n" + type.toUpperCase() + " #" + id + "\nGenerated: " + timestamp + "\n\n" + company + "\nDocument generated from CRM system.\n      ").trim();
    }
};
// Email template generator
exports.generateEmailTemplate = function (type, data) {
    var _a, _b, _c;
    var companyName = data.companyName || import.meta.env.VITE_APP_TITLE || 'Your Company';
    var templates = {
        invoice: "\n      <h2>Invoice #" + data.number + "</h2>\n      <p>Dear " + data.clientName + ",</p>\n      <p>Please find attached your invoice for " + data.description + ".</p>\n      <p>Amount Due: Ksh " + ((_a = data.amount) === null || _a === void 0 ? void 0 : _a.toLocaleString()) + "</p>\n      <p>Due Date: " + data.dueDate + "</p>\n      <p>Thank you for your business!</p>\n      <br/>\n      <p>Best regards,<br/>" + companyName + "</p>\n    ",
        receipt: "\n      <h2>Payment Receipt #" + data.number + "</h2>\n      <p>Dear " + data.clientName + ",</p>\n      <p>Thank you for your payment of Ksh " + ((_b = data.amount) === null || _b === void 0 ? void 0 : _b.toLocaleString()) + ".</p>\n      <p>Payment Date: " + data.date + "</p>\n      <p>Payment Method: " + data.method + "</p>\n      <br/>\n      <p>Best regards,<br/>" + companyName + "</p>\n    ",
        estimate: "\n      <h2>Quotation #" + data.number + "</h2>\n      <p>Dear " + data.clientName + ",</p>\n      <p>Please find attached our quotation for " + data.description + ".</p>\n      <p>Total Amount: Ksh " + ((_c = data.amount) === null || _c === void 0 ? void 0 : _c.toLocaleString()) + "</p>\n      <p>Valid Until: " + data.validUntil + "</p>\n      <br/>\n      <p>Best regards,<br/>" + companyName + "</p>\n    ",
        proposal: "\n      <h2>Business Proposal #" + data.number + "</h2>\n      <p>Dear " + data.clientName + ",</p>\n      <p>We are pleased to submit our proposal for " + data.title + ".</p>\n      <p>Please review the attached document and let us know if you have any questions.</p>\n      <br/>\n      <p>Best regards,<br/>" + companyName + "</p>\n    "
    };
    return templates[type] || "<p>" + type + " document attached.</p>";
};
