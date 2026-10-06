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
var express_1 = require("express");
var customFieldsService_1 = require("../services/customFieldsService");
var auth_1 = require("../middleware/auth");
var router = express_1.Router();
/**
 * GET /api/customFields
 * Get all custom fields for an entity type
 * Query params: entityType (required), organizationId (optional, from user context)
 */
router.get('/', auth_1.validateAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var entityType, organizationId, fields, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                entityType = req.query.entityType;
                if (!entityType || typeof entityType !== 'string') {
                    return [2 /*return*/, res.status(400).json({ error: 'entityType query parameter is required' })];
                }
                organizationId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.organizationId) || 'default';
                return [4 /*yield*/, customFieldsService_1.customFieldsService.getFieldsByEntity(organizationId, entityType)];
            case 1:
                fields = _b.sent();
                res.json(fields);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error('Error fetching custom fields:', error_1);
                res.status(500).json({ error: 'Failed to fetch custom fields' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/customFields
 * Create a new custom field
 * Body: {
 *   entityType: string,
 *   fieldName: string,
 *   fieldLabel: string,
 *   fieldType: 'text' | 'number' | 'date' | 'select' | etc,
 *   fieldDescription?: string,
 *   required?: boolean,
 *   displayOrder?: number,
 *   options?: string[] (for select/multiSelect types)
 * }
 */
router.post('/', auth_1.validateAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var organizationId, _a, entityType, fieldName, fieldLabel, fieldType, fieldDescription, required, displayOrder, options, validFieldTypes, field, error_2;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                organizationId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId) || 'default';
                _a = req.body, entityType = _a.entityType, fieldName = _a.fieldName, fieldLabel = _a.fieldLabel, fieldType = _a.fieldType, fieldDescription = _a.fieldDescription, required = _a.required, displayOrder = _a.displayOrder, options = _a.options;
                // Validate required fields
                if (!entityType || !fieldName || !fieldLabel || !fieldType) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'Missing required fields: entityType, fieldName, fieldLabel, fieldType'
                        })];
                }
                validFieldTypes = ['text', 'number', 'date', 'select', 'multiSelect', 'checkbox', 'richText', 'file', 'currency'];
                if (!validFieldTypes.includes(fieldType)) {
                    return [2 /*return*/, res.status(400).json({
                            error: "Invalid fieldType. Must be one of: " + validFieldTypes.join(', ')
                        })];
                }
                return [4 /*yield*/, customFieldsService_1.customFieldsService.createField({
                        organizationId: organizationId,
                        entityType: entityType,
                        fieldName: fieldName,
                        fieldLabel: fieldLabel,
                        fieldType: fieldType,
                        fieldDescription: fieldDescription,
                        required: required || false,
                        displayOrder: displayOrder || 0,
                        options: options
                    })];
            case 1:
                field = _c.sent();
                res.status(201).json(field);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _c.sent();
                console.error('Error creating custom field:', error_2);
                res.status(500).json({ error: 'Failed to create custom field' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/customFields/:id
 * Get a single custom field by ID
 */
router.get('/:id', auth_1.validateAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, field, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, customFieldsService_1.customFieldsService.getField(id)];
            case 1:
                field = _a.sent();
                if (!field) {
                    return [2 /*return*/, res.status(404).json({ error: 'Custom field not found' })];
                }
                res.json(field);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error fetching custom field:', error_3);
                res.status(500).json({ error: 'Failed to fetch custom field' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * PUT /api/customFields/:id
 * Update a custom field
 * Body: {
 *   fieldLabel?: string,
 *   fieldDescription?: string,
 *   required?: boolean,
 *   displayOrder?: number,
 *   isActive?: boolean,
 *   options?: string[]
 * }
 */
router.put('/:id', auth_1.validateAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, fieldLabel, fieldDescription, required, displayOrder, isActive, options, field, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id = req.params.id;
                _a = req.body, fieldLabel = _a.fieldLabel, fieldDescription = _a.fieldDescription, required = _a.required, displayOrder = _a.displayOrder, isActive = _a.isActive, options = _a.options;
                return [4 /*yield*/, customFieldsService_1.customFieldsService.updateField(id, {
                        fieldLabel: fieldLabel,
                        fieldDescription: fieldDescription,
                        required: required,
                        displayOrder: displayOrder,
                        isActive: isActive,
                        options: options
                    })];
            case 1:
                field = _b.sent();
                if (!field) {
                    return [2 /*return*/, res.status(404).json({ error: 'Custom field not found' })];
                }
                res.json(field);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _b.sent();
                console.error('Error updating custom field:', error_4);
                res.status(500).json({ error: 'Failed to update custom field' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * DELETE /api/customFields/:id
 * Delete (deactivate) a custom field
 */
router["delete"]('/:id', auth_1.validateAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, customFieldsService_1.customFieldsService.deleteField(id)];
            case 1:
                _a.sent();
                res.status(204).send();
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error deleting custom field:', error_5);
                res.status(500).json({ error: 'Failed to delete custom field' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/customFields/:id/validate
 * Validate a field value
 * Body: { value: any }
 */
router.post('/:id/validate', auth_1.validateAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, value, result, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                value = req.body.value;
                return [4 /*yield*/, customFieldsService_1.customFieldsService.validateValue(id, value)];
            case 1:
                result = _a.sent();
                res.json(result);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error validating field:', error_6);
                res.status(500).json({ error: 'Failed to validate field' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/customFields/:id/validations
 * Add validation rule to a custom field
 * Body: {
 *   ruleType: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'range' | 'email' | 'phone',
 *   ruleValue: any,
 *   errorMessage: string
 * }
 */
router.post('/:id/validations', auth_1.validateAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, ruleType, ruleValue, errorMessage, validation, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id = req.params.id;
                _a = req.body, ruleType = _a.ruleType, ruleValue = _a.ruleValue, errorMessage = _a.errorMessage;
                if (!ruleType || ruleValue === undefined) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'Missing required fields: ruleType, ruleValue'
                        })];
                }
                return [4 /*yield*/, customFieldsService_1.customFieldsService.addValidation(id, {
                        ruleType: ruleType,
                        ruleValue: ruleValue,
                        errorMessage: errorMessage || ''
                    })];
            case 1:
                validation = _b.sent();
                res.status(201).json(validation);
                return [3 /*break*/, 3];
            case 2:
                error_7 = _b.sent();
                console.error('Error adding validation:', error_7);
                res.status(500).json({ error: 'Failed to add validation' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/customFields/:id/validations
 * Get all validation rules for a custom field
 */
router.get('/:id/validations', auth_1.validateAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, validations, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, customFieldsService_1.customFieldsService.getFieldValidations(id)];
            case 1:
                validations = _a.sent();
                res.json(validations);
                return [3 /*break*/, 3];
            case 2:
                error_8 = _a.sent();
                console.error('Error fetching validations:', error_8);
                res.status(500).json({ error: 'Failed to fetch validations' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/customFields/:id/values
 * Save/update a field value for an entity
 * Body: {
 *   entityId: string,
 *   entityType: string,
 *   value: any
 * }
 */
router.post('/:id/values', auth_1.validateAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, entityId, entityType, value, organizationId, fieldValue, error_9;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                id = req.params.id;
                _a = req.body, entityId = _a.entityId, entityType = _a.entityType, value = _a.value;
                organizationId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId) || 'default';
                if (!entityId || !entityType) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'Missing required fields: entityId, entityType'
                        })];
                }
                return [4 /*yield*/, customFieldsService_1.customFieldsService.setFieldValue({
                        customFieldId: id,
                        entityId: entityId,
                        entityType: entityType,
                        organizationId: organizationId,
                        value: value
                    })];
            case 1:
                fieldValue = _c.sent();
                res.status(201).json(fieldValue);
                return [3 /*break*/, 3];
            case 2:
                error_9 = _c.sent();
                console.error('Error setting field value:', error_9);
                res.status(400).json({ error: error_9.message || 'Failed to set field value' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/customFields/entity/:entityId
 * Get all field values for an entity
 * Query params: entityType (required)
 */
router.get('/entity/:entityId', auth_1.validateAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var entityId, entityType, organizationId, fieldValues, error_10;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                entityId = req.params.entityId;
                entityType = req.query.entityType;
                organizationId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.organizationId) || 'default';
                if (!entityType || typeof entityType !== 'string') {
                    return [2 /*return*/, res.status(400).json({ error: 'entityType query parameter is required' })];
                }
                return [4 /*yield*/, customFieldsService_1.customFieldsService.getEntityFieldValues(organizationId, entityId, entityType)];
            case 1:
                fieldValues = _b.sent();
                res.json(fieldValues);
                return [3 /*break*/, 3];
            case 2:
                error_10 = _b.sent();
                console.error('Error fetching entity field values:', error_10);
                res.status(500).json({ error: 'Failed to fetch entity field values' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
