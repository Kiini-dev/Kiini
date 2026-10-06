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
exports.createAdvancedApprovalsService = exports.AdvancedApprovalsService = void 0;
var uuid_1 = require("uuid");
/**
 * AdvancedApprovalsService - Multi-level workflow management
 * Handles sequential, parallel, and mixed approval routing with escalation
 */
var AdvancedApprovalsService = /** @class */ (function () {
    function AdvancedApprovalsService() {
    }
    /**
     * Create a new approval workflow template
     */
    AdvancedApprovalsService.prototype.createWorkflow = function (organizationId, config) {
        return {
            id: uuid_1.v4(),
            organizationId: organizationId,
            name: config.name,
            description: config.description,
            type: config.type,
            applicableEntity: config.applicableEntity,
            minAmount: config.minAmount || 0,
            maxAmount: config.maxAmount,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    };
    /**
     * Create approval levels for a workflow
     */
    AdvancedApprovalsService.prototype.createApprovalLevels = function (organizationId, workflowId, levels) {
        return levels.map(function (level) { return ({
            id: uuid_1.v4(),
            workflowId: workflowId,
            organizationId: organizationId,
            levelNumber: level.levelNumber,
            levelName: level.levelName,
            approvalType: level.approvalType,
            approverRoles: level.approverRoles || [],
            approverUserIds: level.approverUserIds,
            escalationDays: level.escalationDays,
            conditions: level.conditions,
            requiresComment: level.requiresComment || false,
            allowApprovePartially: level.allowApprovePartially || false,
            notificationTemplate: "approval_level_" + level.levelNumber,
            createdAt: new Date(),
            updatedAt: new Date()
        }); });
    };
    /**
     * Initiate an approval request
     */
    AdvancedApprovalsService.prototype.initiateApprovalRequest = function (workflow, input, levels) {
        return {
            id: uuid_1.v4(),
            organizationId: input.organizationId,
            workflowId: input.workflowId,
            entityType: input.entityType,
            entityId: input.entityId,
            status: 'pending',
            currentLevel: 1,
            totalLevels: levels.length,
            progressPercentage: 0,
            completedLevels: 0,
            requestedBy: input.requestedBy,
            requestedAt: new Date(),
            reason: input.reason,
            amount: input.amount,
            dueDate: this.calculateDueDate(levels[0]),
            metadata: input.metadata,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    };
    /**
     * Process an approval decision
     */
    AdvancedApprovalsService.prototype.processApprovalDecision = function (request, decision, currentLevel) {
        return __awaiter(this, void 0, Promise, function () {
            var updatedRequest;
            return __generator(this, function (_a) {
                updatedRequest = __assign({}, request);
                switch (decision.action) {
                    case 'approved':
                        updatedRequest.completedLevels++;
                        updatedRequest.progressPercentage = Math.round((updatedRequest.completedLevels / updatedRequest.totalLevels) * 100);
                        // Check if all levels are approved
                        if (updatedRequest.completedLevels === updatedRequest.totalLevels) {
                            updatedRequest.status = 'approved';
                            updatedRequest.completedAt = new Date();
                            return [2 /*return*/, { updatedRequest: updatedRequest, isComplete: true }];
                        }
                        // Move to next level
                        updatedRequest.currentLevel++;
                        updatedRequest.status = 'pending';
                        break;
                    case 'rejected':
                        updatedRequest.status = 'rejected';
                        updatedRequest.completedAt = new Date();
                        return [2 /*return*/, { updatedRequest: updatedRequest, isComplete: true }];
                    case 'partial':
                        updatedRequest.status = 'partial';
                        // Partial approvals require additional handling
                        break;
                    case 'escalated':
                        updatedRequest.status = 'escalated';
                        // Escalation logic - will be handled by escalation service
                        break;
                }
                updatedRequest.updatedAt = new Date();
                return [2 /*return*/, { updatedRequest: updatedRequest, isComplete: false }];
            });
        });
    };
    /**
     * Get approvers for a level based on conditions
     */
    AdvancedApprovalsService.prototype.getApproversForLevel = function (level, context) {
        var approvers = [];
        // Check conditions
        if (level.conditions && level.conditions.length > 0) {
            var conditionsMet = this.evaluateConditions(level.conditions, context);
            if (!conditionsMet) {
                return [];
            }
        }
        // Get approvers by role or ID
        if (level.approverUserIds && level.approverUserIds.length > 0) {
            approvers = level.approverUserIds;
        }
        else if (level.approverRoles && level.approverRoles.length > 0) {
            // TODO: Resolve roles to user IDs from database
            // approvers = await getUsersByRoles(level.approverRoles);
        }
        return approvers;
    };
    /**
     * Evaluate approval conditions
     */
    AdvancedApprovalsService.prototype.evaluateConditions = function (conditions, context) {
        var _this = this;
        return conditions.every(function (condition) { return _this.evaluateCondition(condition, context); });
    };
    /**
     * Evaluate a single condition
     */
    AdvancedApprovalsService.prototype.evaluateCondition = function (condition, context) {
        var fieldValue = context[condition.field];
        switch (condition.operator) {
            case 'equals':
                return fieldValue === condition.value;
            case '>':
                return fieldValue > condition.value;
            case '<':
                return fieldValue < condition.value;
            case '>=':
                return fieldValue >= condition.value;
            case '<=':
                return fieldValue <= condition.value;
            case 'in':
                return Array.isArray(condition.value) && condition.value.includes(fieldValue);
            case 'contains':
                return String(fieldValue).includes(String(condition.value));
            default:
                return true;
        }
    };
    /**
     * Calculate due date for approval level
     */
    AdvancedApprovalsService.prototype.calculateDueDate = function (level) {
        var daysToAdd = level.escalationDays || 7; // Default 7 days
        var dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + daysToAdd);
        return dueDate;
    };
    /**
     * Check if approval request is overdue
     */
    AdvancedApprovalsService.prototype.isOverdue = function (request) {
        if (!request.dueDate || request.status !== 'pending') {
            return false;
        }
        return new Date() > request.dueDate;
    };
    /**
     * Get approval progress metrics
     */
    AdvancedApprovalsService.prototype.getProgressMetrics = function (request) {
        return {
            totalLevels: request.totalLevels,
            completedLevels: request.completedLevels,
            currentLevel: request.currentLevel,
            progressPercentage: request.progressPercentage,
            status: request.status,
            isOverdue: this.isOverdue(request),
            timeSpent: Math.floor((Date.now() - request.requestedAt.getTime()) / 1000 / 60)
        };
    };
    /**
     * Generate approval summary report
     */
    AdvancedApprovalsService.prototype.generateApprovalSummary = function (requests) {
        var _this = this;
        var total = requests.length;
        var approved = requests.filter(function (r) { return r.status === 'approved'; }).length;
        var rejected = requests.filter(function (r) { return r.status === 'rejected'; }).length;
        var pending = requests.filter(function (r) { return r.status === 'pending'; }).length;
        var partial = requests.filter(function (r) { return r.status === 'partial'; }).length;
        var avgApprovalTime = requests
            .filter(function (r) { return r.completedAt; })
            .reduce(function (sum, r) { return sum + (r.completedAt.getTime() - r.requestedAt.getTime()); }, 0) /
            (approved + rejected) /
            1000 /
            60; // in minutes
        return {
            total: total,
            approved: approved,
            rejected: rejected,
            pending: pending,
            partial: partial,
            approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
            rejectionRate: total > 0 ? Math.round((rejected / total) * 100) : 0,
            avgApprovalTime: Math.round(avgApprovalTime),
            overdueCount: requests.filter(function (r) { return _this.isOverdue(r); }).length
        };
    };
    return AdvancedApprovalsService;
}());
exports.AdvancedApprovalsService = AdvancedApprovalsService;
exports.createAdvancedApprovalsService = function () { return new AdvancedApprovalsService(); };
