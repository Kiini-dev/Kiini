"use strict";
/**
 * Phase 10: useCustomFields Hook
 * Manages custom fields operations via API
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.useCustomFields = void 0;
var react_1 = require("react");
var API_BASE = '/api/customFields';
/**
 * Get authorization headers with JWT token
 */
function getAuthHeaders() {
    var token = localStorage.getItem('auth-token');
    var headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = "Bearer " + token;
    }
    return headers;
}
function useCustomFields(organizationId) {
    var _this = this;
    var _a = react_1.useState([]), fields = _a[0], setFields = _a[1];
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(null), error = _c[0], setError = _c[1];
    /**
     * Fetch all custom fields for an entity type
     */
    var getFieldsByEntity = react_1.useCallback(function (entityType) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_1, errorMsg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch(API_BASE + "?entityType=" + entityType, {
                            headers: getAuthHeaders(),
                            credentials: 'include'
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        if (response.status === 401) {
                            throw new Error('Unauthorized: Please log in');
                        }
                        throw new Error("Failed to fetch fields: " + response.statusText);
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    setFields(data || []);
                    return [2 /*return*/, data || []];
                case 4:
                    err_1 = _a.sent();
                    errorMsg = err_1 instanceof Error ? err_1.message : 'Unknown error';
                    setError(errorMsg);
                    console.error('Error fetching custom fields:', err_1);
                    return [2 /*return*/, []];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, []);
    /**
     * Get a single custom field by ID
     */
    var getField = react_1.useCallback(function (id) { return __awaiter(_this, void 0, void 0, function () {
        var response, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch(API_BASE + "/" + id, {
                            headers: getAuthHeaders(),
                            credentials: 'include'
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        if (response.status === 401) {
                            throw new Error('Unauthorized: Please log in');
                        }
                        throw new Error("Failed to fetch field: " + response.statusText);
                    }
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    err_2 = _a.sent();
                    console.error('Error fetching custom field:', err_2);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    /**
     * Create a new custom field
     */
    var createField = react_1.useCallback(function (input) { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, newField_1, err_3, errorMsg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch(API_BASE, {
                            method: 'POST',
                            headers: getAuthHeaders(),
                            credentials: 'include',
                            body: JSON.stringify(input)
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    if (response.status === 401) {
                        throw new Error('Unauthorized: Please log in');
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.error || "Failed to create field: " + response.statusText);
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    newField_1 = _a.sent();
                    setFields(function (prev) { return __spreadArrays(prev, [newField_1]); });
                    return [2 /*return*/, newField_1];
                case 6:
                    err_3 = _a.sent();
                    errorMsg = err_3 instanceof Error ? err_3.message : 'Unknown error';
                    setError(errorMsg);
                    console.error('Error creating custom field:', err_3);
                    throw err_3;
                case 7:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); }, []);
    /**
     * Update a custom field
     */
    var updateField = react_1.useCallback(function (id, input) { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, updatedField_1, err_4, errorMsg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch(API_BASE + "/" + id, {
                            method: 'PUT',
                            headers: getAuthHeaders(),
                            credentials: 'include',
                            body: JSON.stringify(input)
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    if (response.status === 401) {
                        throw new Error('Unauthorized: Please log in');
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.error || "Failed to update field: " + response.statusText);
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    updatedField_1 = _a.sent();
                    setFields(function (prev) { return prev.map(function (f) { return f.id === id ? updatedField_1 : f; }); });
                    return [2 /*return*/, updatedField_1];
                case 6:
                    err_4 = _a.sent();
                    errorMsg = err_4 instanceof Error ? err_4.message : 'Unknown error';
                    setError(errorMsg);
                    console.error('Error updating custom field:', err_4);
                    throw err_4;
                case 7:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); }, []);
    /**
     * Delete a custom field
     */
    var deleteField = react_1.useCallback(function (id) { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, err_5, errorMsg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, fetch(API_BASE + "/" + id, {
                            method: 'DELETE',
                            headers: getAuthHeaders(),
                            credentials: 'include'
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    if (response.status === 401) {
                        throw new Error('Unauthorized: Please log in');
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.error || "Failed to delete field: " + response.statusText);
                case 4:
                    setFields(function (prev) { return prev.filter(function (f) { return f.id !== id; }); });
                    return [3 /*break*/, 7];
                case 5:
                    err_5 = _a.sent();
                    errorMsg = err_5 instanceof Error ? err_5.message : 'Unknown error';
                    setError(errorMsg);
                    console.error('Error deleting custom field:', err_5);
                    throw err_5;
                case 6:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); }, []);
    /**
     * Validate a field value
     */
    var validateValue = react_1.useCallback(function (customFieldId, value) { return __awaiter(_this, void 0, void 0, function () {
        var response, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch(API_BASE + "/" + customFieldId + "/validate", {
                            method: 'POST',
                            headers: getAuthHeaders(),
                            credentials: 'include',
                            body: JSON.stringify({ value: value })
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        if (response.status === 401) {
                            throw new Error('Unauthorized: Please log in');
                        }
                        throw new Error("Failed to validate: " + response.statusText);
                    }
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    err_6 = _a.sent();
                    console.error('Error validating value:', err_6);
                    return [2 /*return*/, { valid: false, error: 'Validation error' }];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    /**
     * Add validation rule to custom field
     */
    var addValidation = react_1.useCallback(function (customFieldId, rule) { return __awaiter(_this, void 0, void 0, function () {
        var response, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch(API_BASE + "/" + customFieldId + "/validations", {
                            method: 'POST',
                            headers: getAuthHeaders(),
                            credentials: 'include',
                            body: JSON.stringify(rule)
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        if (response.status === 401) {
                            throw new Error('Unauthorized: Please log in');
                        }
                        throw new Error("Failed to add validation: " + response.statusText);
                    }
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    err_7 = _a.sent();
                    console.error('Error adding validation:', err_7);
                    throw err_7;
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    /**
     * Get validation rules for a field
     */
    var getValidations = react_1.useCallback(function (customFieldId) { return __awaiter(_this, void 0, void 0, function () {
        var response, err_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch(API_BASE + "/" + customFieldId + "/validations", {
                            headers: getAuthHeaders(),
                            credentials: 'include'
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        if (response.status === 401) {
                            throw new Error('Unauthorized: Please log in');
                        }
                        throw new Error("Failed to fetch validations: " + response.statusText);
                    }
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    err_8 = _a.sent();
                    console.error('Error fetching validations:', err_8);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    return {
        fields: fields,
        loading: loading,
        error: error,
        getFieldsByEntity: getFieldsByEntity,
        getField: getField,
        createField: createField,
        updateField: updateField,
        deleteField: deleteField,
        validateValue: validateValue,
        addValidation: addValidation,
        getValidations: getValidations
    };
}
exports.useCustomFields = useCustomFields;
