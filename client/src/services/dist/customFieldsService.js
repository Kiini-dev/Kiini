"use strict";
/**
 * Phase 10: Custom Fields API Service
 */
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
exports.customFieldsService = void 0;
var apiClient_1 = require("@/utils/apiClient");
/**
 * Custom Fields API Service
 * Handles all API communication for custom fields management
 */
var CustomFieldsService = /** @class */ (function () {
    function CustomFieldsService() {
        this.endpoint = '/api/customFields';
    }
    /**
     * Fetch all custom fields for an organization/entity type
     */
    CustomFieldsService.prototype.getFields = function (entityType, organizationId, options) {
        return __awaiter(this, void 0, Promise, function () {
            var params, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        params = new URLSearchParams();
                        if (entityType)
                            params.append('entityType', entityType);
                        if (organizationId)
                            params.append('organizationId', organizationId);
                        if (options === null || options === void 0 ? void 0 : options.page)
                            params.append('page', String(options.page));
                        if (options === null || options === void 0 ? void 0 : options.pageSize)
                            params.append('pageSize', String(options.pageSize));
                        return [4 /*yield*/, apiClient_1["default"].get("" + this.endpoint + (params.toString() ? "?" + params.toString() : ''))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error fetching custom fields:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetch a single custom field by ID
     */
    CustomFieldsService.prototype.getField = function (fieldId) {
        return __awaiter(this, void 0, Promise, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"].get(this.endpoint + "/" + fieldId)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error fetching custom field " + fieldId + ":", error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new custom field
     */
    CustomFieldsService.prototype.createField = function (input) {
        return __awaiter(this, void 0, Promise, function () {
            var response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"].post(this.endpoint, input)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error creating custom field:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update an existing custom field
     */
    CustomFieldsService.prototype.updateField = function (fieldId, input) {
        return __awaiter(this, void 0, Promise, function () {
            var response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"].put(this.endpoint + "/" + fieldId, input)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_4 = _a.sent();
                        console.error("Error updating custom field " + fieldId + ":", error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a custom field
     */
    CustomFieldsService.prototype.deleteField = function (fieldId) {
        return __awaiter(this, void 0, Promise, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"]["delete"](this.endpoint + "/" + fieldId)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error("Error deleting custom field " + fieldId + ":", error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reorder custom fields
     */
    CustomFieldsService.prototype.reorderFields = function (fields, entityType) {
        return __awaiter(this, void 0, Promise, function () {
            var response, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"].post(this.endpoint + "/reorder", { fields: fields, entityType: entityType })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Error reordering custom fields:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate a custom field value
     */
    CustomFieldsService.prototype.validateValue = function (customFieldId, value) {
        return __awaiter(this, void 0, Promise, function () {
            var response, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"].post(this.endpoint + "/" + customFieldId + "/validate", { value: value })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_7 = _a.sent();
                        console.error("Error validating custom field " + customFieldId + ":", error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate multiple custom field values
     */
    CustomFieldsService.prototype.validateValues = function (fields) {
        return __awaiter(this, void 0, Promise, function () {
            var response, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"].post(this.endpoint + "/validate-bulk", { fields: fields })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_8 = _a.sent();
                        console.error('Error validating custom fields:', error_8);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add a validation rule to a custom field
     */
    CustomFieldsService.prototype.addValidation = function (customFieldId, rule) {
        return __awaiter(this, void 0, Promise, function () {
            var response, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"].post(this.endpoint + "/" + customFieldId + "/validations", rule)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_9 = _a.sent();
                        console.error("Error adding validation to field " + customFieldId + ":", error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all validations for a custom field
     */
    CustomFieldsService.prototype.getValidations = function (customFieldId) {
        return __awaiter(this, void 0, Promise, function () {
            var response, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"].get(this.endpoint + "/" + customFieldId + "/validations")];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_10 = _a.sent();
                        console.error("Error fetching validations for field " + customFieldId + ":", error_10);
                        throw error_10;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update a validation rule
     */
    CustomFieldsService.prototype.updateValidation = function (customFieldId, validationId, rule) {
        return __awaiter(this, void 0, Promise, function () {
            var response, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"].put(this.endpoint + "/" + customFieldId + "/validations/" + validationId, rule)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_11 = _a.sent();
                        console.error("Error updating validation " + validationId + " for field " + customFieldId + ":", error_11);
                        throw error_11;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a validation rule
     */
    CustomFieldsService.prototype.deleteValidation = function (customFieldId, validationId) {
        return __awaiter(this, void 0, Promise, function () {
            var error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"]["delete"](this.endpoint + "/" + customFieldId + "/validations/" + validationId)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_12 = _a.sent();
                        console.error("Error deleting validation " + validationId + " for field " + customFieldId + ":", error_12);
                        throw error_12;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save custom field values for an entity
     */
    CustomFieldsService.prototype.saveFieldValues = function (entityId, entityType, values) {
        return __awaiter(this, void 0, Promise, function () {
            var response, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"].post(this.endpoint + "/values", {
                                entityId: entityId,
                                entityType: entityType,
                                customFields: Object.entries(values).map(function (_a) {
                                    var fieldId = _a[0], value = _a[1];
                                    return ({
                                        fieldId: fieldId,
                                        value: value
                                    });
                                })
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_13 = _a.sent();
                        console.error('Error saving custom field values:', error_13);
                        throw error_13;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get custom field values for an entity
     */
    CustomFieldsService.prototype.getFieldValues = function (entityId, entityType) {
        return __awaiter(this, void 0, Promise, function () {
            var response, mapping, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"].get(this.endpoint + "/values/" + entityType + "/" + entityId)];
                    case 1:
                        response = _a.sent();
                        mapping = response.data;
                        return [2 /*return*/, mapping.customFields.reduce(function (acc, field) {
                                acc[field.fieldId] = field.value;
                                return acc;
                            }, {})];
                    case 2:
                        error_14 = _a.sent();
                        console.error("Error fetching custom field values for " + entityType + "/" + entityId + ":", error_14);
                        throw error_14;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete custom field values for an entity
     */
    CustomFieldsService.prototype.deleteFieldValues = function (entityId, entityType) {
        return __awaiter(this, void 0, Promise, function () {
            var error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"]["delete"](this.endpoint + "/values/" + entityType + "/" + entityId)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_15 = _a.sent();
                        console.error("Error deleting custom field values for " + entityType + "/" + entityId + ":", error_15);
                        throw error_15;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Bulk delete custom fields
     */
    CustomFieldsService.prototype.bulkDeleteFields = function (fieldIds) {
        return __awaiter(this, void 0, Promise, function () {
            var error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"].post(this.endpoint + "/bulk-delete", { fieldIds: fieldIds })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_16 = _a.sent();
                        console.error('Error bulk deleting custom fields:', error_16);
                        throw error_16;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Bulk update custom field properties
     */
    CustomFieldsService.prototype.bulkUpdateFields = function (updates) {
        return __awaiter(this, void 0, Promise, function () {
            var response, error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"].post(this.endpoint + "/bulk-update", { updates: updates })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_17 = _a.sent();
                        console.error('Error bulk updating custom fields:', error_17);
                        throw error_17;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Export custom fields configuration
     */
    CustomFieldsService.prototype.exportFields = function (entityType) {
        return __awaiter(this, void 0, Promise, function () {
            var params, response, error_18;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        params = new URLSearchParams();
                        if (entityType)
                            params.append('entityType', entityType);
                        return [4 /*yield*/, apiClient_1["default"].get(this.endpoint + "/export" + (params.toString() ? "?" + params.toString() : ''), { responseType: 'blob' })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_18 = _a.sent();
                        console.error('Error exporting custom fields:', error_18);
                        throw error_18;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Import custom fields configuration
     */
    CustomFieldsService.prototype.importFields = function (file, entityType) {
        return __awaiter(this, void 0, Promise, function () {
            var formData, response, error_19;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        formData = new FormData();
                        formData.append('file', file);
                        if (entityType)
                            formData.append('entityType', entityType);
                        return [4 /*yield*/, apiClient_1["default"].post(this.endpoint + "/import", formData, {
                                headers: {
                                    'Content-Type': 'multipart/form-data'
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_19 = _a.sent();
                        console.error('Error importing custom fields:', error_19);
                        throw error_19;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get field usage statistics
     */
    CustomFieldsService.prototype.getFieldUsageStats = function (fieldId) {
        return __awaiter(this, void 0, Promise, function () {
            var response, error_20;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"].get(this.endpoint + "/" + fieldId + "/usage-stats")];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_20 = _a.sent();
                        console.error("Error fetching usage stats for field " + fieldId + ":", error_20);
                        throw error_20;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Duplicate a custom field
     */
    CustomFieldsService.prototype.duplicateField = function (fieldId, label) {
        return __awaiter(this, void 0, Promise, function () {
            var response, error_21;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient_1["default"].post(this.endpoint + "/" + fieldId + "/duplicate", { label: label })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_21 = _a.sent();
                        console.error("Error duplicating custom field " + fieldId + ":", error_21);
                        throw error_21;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Search custom fields
     */
    CustomFieldsService.prototype.searchFields = function (query, entityType) {
        return __awaiter(this, void 0, Promise, function () {
            var params, response, error_22;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        params = new URLSearchParams();
                        params.append('q', query);
                        if (entityType)
                            params.append('entityType', entityType);
                        return [4 /*yield*/, apiClient_1["default"].get(this.endpoint + "/search?" + params.toString())];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_22 = _a.sent();
                        console.error('Error searching custom fields:', error_22);
                        throw error_22;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return CustomFieldsService;
}());
// Export singleton instance
exports.customFieldsService = new CustomFieldsService();
exports["default"] = exports.customFieldsService;
