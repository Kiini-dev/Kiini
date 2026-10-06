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
exports.customFieldsService = exports.CustomFieldsService = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var CustomFieldsService = /** @class */ (function () {
    function CustomFieldsService() {
        this.db = null;
    }
    CustomFieldsService.prototype.getDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.db) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        _a.db = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.db];
                }
            });
        });
    };
    /**
     * Get all custom fields for an entity type
     */
    CustomFieldsService.prototype.getFieldsByEntity = function (organizationId, entityType) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDatabase()];
                    case 1:
                        db = _a.sent();
                        return [2 /*return*/, db.query.customFields.findMany({
                                where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.customFields.organizationId, organizationId), drizzle_orm_1.eq(schema_1.customFields.entityType, entityType), drizzle_orm_1.eq(schema_1.customFields.isActive, 1)),
                                orderBy: drizzle_orm_1.asc(schema_1.customFields.displayOrder)
                            })];
                }
            });
        });
    };
    /**
     * Get single custom field by ID
     */
    CustomFieldsService.prototype.getField = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var db, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDatabase()];
                    case 1:
                        db = _a.sent();
                        return [4 /*yield*/, db.select().from(schema_1.customFields).where(drizzle_orm_1.eq(schema_1.customFields.id, id)).limit(1)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result[0] || null];
                }
            });
        });
    };
    /**
     * Create new custom field
     */
    CustomFieldsService.prototype.createField = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var db, id, newField;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDatabase()];
                    case 1:
                        db = _a.sent();
                        id = uuid_1.v4();
                        newField = {
                            id: id,
                            organizationId: input.organizationId,
                            entityType: input.entityType,
                            fieldName: input.fieldName,
                            fieldLabel: input.fieldLabel,
                            fieldType: input.fieldType,
                            fieldDescription: input.fieldDescription || null,
                            required: input.required ? 1 : 0,
                            displayOrder: input.displayOrder || 0,
                            isActive: 1,
                            options: input.options ? JSON.stringify(input.options) : null,
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        };
                        return [4 /*yield*/, db.insert(schema_1.customFields).values(newField)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.getField(id)];
                }
            });
        });
    };
    /**
     * Update custom field
     */
    CustomFieldsService.prototype.updateField = function (id, input) {
        return __awaiter(this, void 0, void 0, function () {
            var db, updateData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDatabase()];
                    case 1:
                        db = _a.sent();
                        updateData = {
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        };
                        if (input.fieldLabel !== undefined)
                            updateData.fieldLabel = input.fieldLabel;
                        if (input.fieldDescription !== undefined)
                            updateData.fieldDescription = input.fieldDescription;
                        if (input.required !== undefined)
                            updateData.required = input.required ? 1 : 0;
                        if (input.displayOrder !== undefined)
                            updateData.displayOrder = input.displayOrder;
                        if (input.isActive !== undefined)
                            updateData.isActive = input.isActive ? 1 : 0;
                        if (input.options !== undefined)
                            updateData.options = JSON.stringify(input.options);
                        return [4 /*yield*/, db.update(schema_1.customFields).set(updateData).where(drizzle_orm_1.eq(schema_1.customFields.id, id))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.getField(id)];
                }
            });
        });
    };
    /**
     * Delete custom field (soft delete - deactivate)
     */
    CustomFieldsService.prototype.deleteField = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDatabase()];
                    case 1:
                        db = _a.sent();
                        // Cascade delete: remove field values and validations
                        return [4 /*yield*/, db["delete"](schema_1.fieldValues).where(drizzle_orm_1.eq(schema_1.fieldValues.customFieldId, id))];
                    case 2:
                        // Cascade delete: remove field values and validations
                        _a.sent();
                        return [4 /*yield*/, db["delete"](schema_1.fieldValidations).where(drizzle_orm_1.eq(schema_1.fieldValidations.customFieldId, id))];
                    case 3:
                        _a.sent();
                        // Soft delete the field itself
                        return [4 /*yield*/, db.update(schema_1.customFields).set({ isActive: 0 }).where(drizzle_orm_1.eq(schema_1.customFields.id, id))];
                    case 4:
                        // Soft delete the field itself
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    };
    /**
     * Add validation rule to custom field
     */
    CustomFieldsService.prototype.addValidation = function (customFieldId, rule) {
        return __awaiter(this, void 0, void 0, function () {
            var db, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDatabase()];
                    case 1:
                        db = _a.sent();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.fieldValidations).values({
                                id: id,
                                customFieldId: customFieldId,
                                ruleType: rule.ruleType,
                                ruleValue: JSON.stringify(rule.ruleValue),
                                errorMessage: rule.errorMessage,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, __assign({ id: id }, rule)];
                }
            });
        });
    };
    /**
     * Get validation rules for a field
     */
    CustomFieldsService.prototype.getFieldValidations = function (customFieldId) {
        return __awaiter(this, void 0, void 0, function () {
            var db, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDatabase()];
                    case 1:
                        db = _a.sent();
                        return [4 /*yield*/, db.select().from(schema_1.fieldValidations).where(drizzle_orm_1.eq(schema_1.fieldValidations.customFieldId, customFieldId))];
                    case 2:
                        results = _a.sent();
                        return [2 /*return*/, results.map(function (rule) { return ({
                                id: rule.id,
                                customFieldId: rule.customFieldId,
                                ruleType: rule.ruleType,
                                ruleValue: JSON.parse(rule.ruleValue || '{}'),
                                errorMessage: rule.errorMessage
                            }); })];
                }
            });
        });
    };
    /**
     * Validate a field value
     */
    CustomFieldsService.prototype.validateValue = function (customFieldId, value) {
        return __awaiter(this, void 0, Promise, function () {
            var field, validations, _i, validations_1, validation, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getField(customFieldId)];
                    case 1:
                        field = _a.sent();
                        if (!field) {
                            return [2 /*return*/, { valid: false, error: 'Field not found' }];
                        }
                        return [4 /*yield*/, this.getFieldValidations(customFieldId)];
                    case 2:
                        validations = _a.sent();
                        for (_i = 0, validations_1 = validations; _i < validations_1.length; _i++) {
                            validation = validations_1[_i];
                            result = this.checkValidation(field.fieldType, value, validation);
                            if (!result.valid) {
                                return [2 /*return*/, { valid: false, error: result.error }];
                            }
                        }
                        return [2 /*return*/, { valid: true }];
                }
            });
        });
    };
    /**
     * Check individual validation rule
     */
    CustomFieldsService.prototype.checkValidation = function (fieldType, value, validation) {
        var ruleType = validation.ruleType, ruleValue = validation.ruleValue, errorMessage = validation.errorMessage;
        switch (ruleType) {
            case 'required':
                if (value === null || value === undefined || value === '') {
                    return { valid: false, error: errorMessage || 'This field is required' };
                }
                return { valid: true };
            case 'minLength':
                if (String(value).length < parseInt(ruleValue.value || ruleValue)) {
                    return { valid: false, error: errorMessage || "Minimum length is " + (ruleValue.value || ruleValue) };
                }
                return { valid: true };
            case 'maxLength':
                if (String(value).length > parseInt(ruleValue.value || ruleValue)) {
                    return { valid: false, error: errorMessage || "Maximum length is " + (ruleValue.value || ruleValue) };
                }
                return { valid: true };
            case 'pattern':
                try {
                    var regex = new RegExp(ruleValue.pattern || ruleValue);
                    if (!regex.test(String(value))) {
                        return { valid: false, error: errorMessage || 'Invalid format' };
                    }
                }
                catch (e) {
                    return { valid: false, error: 'Invalid validation pattern' };
                }
                return { valid: true };
            case 'range':
                var num = Number(value);
                var min = Number(ruleValue.min || ruleValue);
                var max = Number(ruleValue.max !== undefined ? ruleValue.max : (ruleValue.split(',')[1] || Infinity));
                if (isNaN(num) || num < min || num > max) {
                    return { valid: false, error: errorMessage || "Value must be between " + min + " and " + max };
                }
                return { valid: true };
            case 'email':
                var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(String(value))) {
                    return { valid: false, error: errorMessage || 'Invalid email format' };
                }
                return { valid: true };
            case 'phone':
                var phoneRegex = /^\d{3,15}$/;
                var cleanPhone = String(value).replace(/\D/g, '');
                if (!phoneRegex.test(cleanPhone)) {
                    return { valid: false, error: errorMessage || 'Invalid phone format' };
                }
                return { valid: true };
            default:
                return { valid: true };
        }
    };
    /**
     * Save field value
     */
    CustomFieldsService.prototype.setFieldValue = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var db, validation, existing, valueRecord, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDatabase()];
                    case 1:
                        db = _a.sent();
                        return [4 /*yield*/, this.validateValue(input.customFieldId, input.value)];
                    case 2:
                        validation = _a.sent();
                        if (!validation.valid) {
                            throw new Error(validation.error);
                        }
                        return [4 /*yield*/, db.select().from(schema_1.fieldValues).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.fieldValues.customFieldId, input.customFieldId), drizzle_orm_1.eq(schema_1.fieldValues.entityId, input.entityId))).limit(1)];
                    case 3:
                        existing = _a.sent();
                        valueRecord = {
                            customFieldId: input.customFieldId,
                            entityId: input.entityId,
                            entityType: input.entityType,
                            organizationId: input.organizationId,
                            value: typeof input.value === 'string' ? input.value : JSON.stringify(input.value),
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        };
                        if (!(existing.length > 0)) return [3 /*break*/, 5];
                        // Update existing
                        return [4 /*yield*/, db.update(schema_1.fieldValues).set(valueRecord).where(drizzle_orm_1.eq(schema_1.fieldValues.id, existing[0].id))];
                    case 4:
                        // Update existing
                        _a.sent();
                        return [2 /*return*/, __assign({ id: existing[0].id }, valueRecord)];
                    case 5:
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.fieldValues).values(__assign(__assign({ id: id }, valueRecord), { createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }))];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, __assign({ id: id }, valueRecord)];
                }
            });
        });
    };
    /**
     * Get all field values for an entity
     */
    CustomFieldsService.prototype.getEntityFieldValues = function (organizationId, entityId, entityType) {
        return __awaiter(this, void 0, void 0, function () {
            var db, fields, values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDatabase()];
                    case 1:
                        db = _a.sent();
                        return [4 /*yield*/, db.select().from(schema_1.customFields).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.customFields.organizationId, organizationId), drizzle_orm_1.eq(schema_1.customFields.entityType, entityType), drizzle_orm_1.eq(schema_1.customFields.isActive, 1)))];
                    case 2:
                        fields = _a.sent();
                        return [4 /*yield*/, db.select().from(schema_1.fieldValues).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.fieldValues.organizationId, organizationId), drizzle_orm_1.eq(schema_1.fieldValues.entityId, entityId), drizzle_orm_1.eq(schema_1.fieldValues.entityType, entityType)))];
                    case 3:
                        values = _a.sent();
                        // Build result with all fields and their values (or empty if not set)
                        return [2 /*return*/, fields.map(function (field) {
                                var value = values.find(function (v) { return v.customFieldId === field.id; });
                                return {
                                    customFieldId: field.id,
                                    fieldName: field.fieldName,
                                    fieldLabel: field.fieldLabel,
                                    fieldType: field.fieldType,
                                    value: value ? (typeof value.value === 'string' && (field.fieldType === 'multiSelect' || value.value.startsWith('['))
                                        ? JSON.parse(value.value)
                                        : value.value) : null
                                };
                            })];
                }
            });
        });
    };
    /**
     * Bulk delete field values for an entity (when entity is deleted)
     */
    CustomFieldsService.prototype.deleteEntityFieldValues = function (entityId) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDatabase()];
                    case 1:
                        db = _a.sent();
                        return [4 /*yield*/, db["delete"](schema_1.fieldValues).where(drizzle_orm_1.eq(schema_1.fieldValues.entityId, entityId))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    };
    return CustomFieldsService;
}());
exports.CustomFieldsService = CustomFieldsService;
// Export instance for use in routers
exports.customFieldsService = new CustomFieldsService();
