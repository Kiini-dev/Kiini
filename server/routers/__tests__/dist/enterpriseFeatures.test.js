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
var vitest_1 = require("vitest");
var enterpriseFeatures_1 = require("../enterpriseFeatures");
vitest_1.vi.mock('../../db', function () { return ({
    getOrganization: vitest_1.vi.fn(),
    getOrganizationSettings: vitest_1.vi.fn(),
    updateOrganization: vitest_1.vi.fn(),
    getUsersByOrganization: vitest_1.vi.fn(),
    getOrganizationSubscription: vitest_1.vi.fn(),
    getPricingPlan: vitest_1.vi.fn(),
    getBillingUsageSummary: vitest_1.vi.fn(),
    createExportJob: vitest_1.vi.fn()
}); });
var db = require("../../db");
vitest_1.describe('Enterprise Features Router persistence', function () {
    vitest_1.beforeEach(function () {
        db.getOrganization.mockReset();
        db.getOrganizationSettings.mockReset();
        db.updateOrganization.mockReset();
        db.getUsersByOrganization.mockReset();
        db.getOrganizationSubscription.mockReset();
        db.getPricingPlan.mockReset();
        db.getBillingUsageSummary.mockReset();
        db.createExportJob.mockReset();
    });
    vitest_1.it('configures white label and persists settings', function () { return __awaiter(void 0, void 0, void 0, function () {
        var caller, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db.getOrganization.mockResolvedValue({ id: 'org1', settings: {} });
                    db.getOrganizationSettings.mockResolvedValue({});
                    db.updateOrganization.mockResolvedValue({});
                    caller = enterpriseFeatures_1.enterpriseFeaturesRouter.createCaller({ user: { id: 'u1', role: 'super_admin', organizationId: 'org1' } });
                    return [4 /*yield*/, caller.configureWhiteLabel({
                            companyName: 'Acme Systems',
                            supportEmail: 'support@acme.example',
                            hideKiiniLogo: true
                        })];
                case 1:
                    response = _a.sent();
                    vitest_1.expect(response.success).toBe(true);
                    vitest_1.expect(response.config.companyName).toBe('Acme Systems');
                    vitest_1.expect(response.config.hideKiiniLogo).toBe(true);
                    vitest_1.expect(db.updateOrganization).toHaveBeenCalledWith('org1', vitest_1.expect.objectContaining({
                        settings: vitest_1.expect.objectContaining({
                            enterprise: vitest_1.expect.objectContaining({
                                whiteLabel: vitest_1.expect.objectContaining({ companyName: 'Acme Systems' })
                            })
                        })
                    }));
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('returns stored white-label configuration', function () { return __awaiter(void 0, void 0, void 0, function () {
        var caller, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db.getOrganization.mockResolvedValue({ id: 'org1', settings: { enterprise: { whiteLabel: { companyName: 'Acme Systems', primaryColor: '#112233' } } } });
                    db.getOrganizationSettings.mockResolvedValue({ enterprise: { whiteLabel: { companyName: 'Acme Systems', primaryColor: '#112233' } } });
                    caller = enterpriseFeatures_1.enterpriseFeaturesRouter.createCaller({ user: { id: 'u1', role: 'super_admin', organizationId: 'org1' } });
                    return [4 /*yield*/, caller.getWhiteLabelConfig()];
                case 1:
                    response = _a.sent();
                    vitest_1.expect(response.success).toBe(true);
                    vitest_1.expect(response.config.companyName).toBe('Acme Systems');
                    vitest_1.expect(response.config.primaryColor).toBe('#112233');
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('stores SSO config and returns sanitized settings', function () { return __awaiter(void 0, void 0, void 0, function () {
        var caller, result, readResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db.getOrganization.mockResolvedValue({ id: 'org1', settings: {} });
                    db.getOrganizationSettings.mockResolvedValue({});
                    db.updateOrganization.mockResolvedValue({});
                    caller = enterpriseFeatures_1.enterpriseFeaturesRouter.createCaller({ user: { id: 'u1', role: 'super_admin', organizationId: 'org1' } });
                    return [4 /*yield*/, caller.configureSSOSettings({
                            ssoType: 'oidc',
                            name: 'Acme Login',
                            idpUrl: 'https://idp.example.com',
                            clientId: 'client-id',
                            clientSecret: 'secret',
                            mappings: { emailField: 'email', nameField: 'name' },
                            autoProvision: true,
                            forceSSO: false
                        })];
                case 1:
                    result = _a.sent();
                    vitest_1.expect(result.success).toBe(true);
                    vitest_1.expect(db.updateOrganization).toHaveBeenCalledWith('org1', vitest_1.expect.objectContaining({
                        settings: vitest_1.expect.objectContaining({
                            enterprise: vitest_1.expect.objectContaining({
                                sso: vitest_1.expect.objectContaining({
                                    name: 'Acme Login',
                                    ssoType: 'oidc'
                                })
                            })
                        })
                    }));
                    db.getOrganization.mockResolvedValue({ id: 'org1', settings: { enterprise: { sso: { name: 'Acme Login', ssoType: 'oidc', clientSecret: 'secret', idpUrl: 'https://idp.example.com', clientId: 'client-id', mappings: { emailField: 'email', nameField: 'name' }, autoProvision: true, forceSSO: false, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } } } });
                    db.getOrganizationSettings.mockResolvedValue({ enterprise: { sso: { name: 'Acme Login', ssoType: 'oidc', clientSecret: 'secret', idpUrl: 'https://idp.example.com', clientId: 'client-id', mappings: { emailField: 'email', nameField: 'name' }, autoProvision: true, forceSSO: false, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } } });
                    return [4 /*yield*/, caller.getSSOSettings()];
                case 2:
                    readResult = _a.sent();
                    vitest_1.expect(readResult.success).toBe(true);
                    vitest_1.expect(readResult.sso).toEqual({ name: 'Acme Login', ssoType: 'oidc', idpUrl: 'https://idp.example.com', clientId: 'client-id', mappings: { emailField: 'email', nameField: 'name' }, autoProvision: true, forceSSO: false, isActive: true, createdAt: vitest_1.expect.any(String), updatedAt: vitest_1.expect.any(String) });
                    vitest_1.expect(readResult.sso.clientSecret).toBeUndefined();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('creates workflow template and stores it in settings', function () { return __awaiter(void 0, void 0, void 0, function () {
        var caller, workflowInput, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db.getOrganization.mockResolvedValue({ id: 'org1', settings: {} });
                    db.getOrganizationSettings.mockResolvedValue({});
                    db.updateOrganization.mockResolvedValue({});
                    caller = enterpriseFeatures_1.enterpriseFeaturesRouter.createCaller({ user: { id: 'u1', role: 'super_admin', organizationId: 'org1' } });
                    workflowInput = {
                        name: 'Invoice to Payment',
                        category: 'invoice_to_payment',
                        steps: [{ name: 'Approve invoice', action: 'approve' }],
                        triggers: ['invoice_created'],
                        description: 'Payment approval workflow',
                        isTemplate: true
                    };
                    return [4 /*yield*/, caller.createWorkflowTemplate(workflowInput)];
                case 1:
                    response = _a.sent();
                    vitest_1.expect(response.success).toBe(true);
                    vitest_1.expect(response.workflow.name).toBe('Invoice to Payment');
                    vitest_1.expect(db.updateOrganization).toHaveBeenCalledWith('org1', vitest_1.expect.objectContaining({
                        settings: vitest_1.expect.objectContaining({
                            enterprise: vitest_1.expect.objectContaining({
                                workflows: vitest_1.expect.arrayContaining([vitest_1.expect.objectContaining({ name: 'Invoice to Payment' })])
                            })
                        })
                    }));
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('returns enterprise feature usage from settings and billing metrics', function () { return __awaiter(void 0, void 0, void 0, function () {
        var caller, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db.getOrganization.mockResolvedValue({ id: 'org1', settings: { enterprise: { whiteLabel: { isActive: true, customDomain: 'app.acme.com' }, sso: { id: 'sso1' }, workflows: [{ id: 'wf1' }], teamWorkflows: { dept1: { id: 'tw1' } } } } });
                    db.getOrganizationSettings.mockResolvedValue({ enterprise: { whiteLabel: { isActive: true, customDomain: 'app.acme.com' }, sso: { id: 'sso1' }, workflows: [{ id: 'wf1' }], teamWorkflows: { dept1: { id: 'tw1' } } } });
                    db.getUsersByOrganization.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);
                    db.getOrganizationSubscription.mockResolvedValue({ id: 'sub1', planId: 'plan1', storageUsedGB: 12 });
                    db.getPricingPlan.mockResolvedValue({ id: 'plan1', maxStorageGB: 50 });
                    db.getBillingUsageSummary.mockResolvedValue({ totalApiCalls: 420 });
                    caller = enterpriseFeatures_1.enterpriseFeaturesRouter.createCaller({ user: { id: 'u1', role: 'super_admin', organizationId: 'org1' } });
                    return [4 /*yield*/, caller.getFeatureUsage()];
                case 1:
                    response = _a.sent();
                    vitest_1.expect(response.success).toBe(true);
                    vitest_1.expect(response.usage).toMatchObject({
                        whiteLabelEnabled: true,
                        ssoConfigured: true,
                        customDomainActive: true,
                        workflowCount: 2,
                        userCount: 2,
                        apiCallsThisMonth: 420,
                        storageUsedGB: 12,
                        maxStorageGB: 50
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('queues export job for organization data export', function () { return __awaiter(void 0, void 0, void 0, function () {
        var caller, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db.getOrganization.mockResolvedValue({ id: 'org1', settings: {} });
                    db.createExportJob.mockResolvedValue({});
                    caller = enterpriseFeatures_1.enterpriseFeaturesRouter.createCaller({ user: { id: 'u1', role: 'super_admin', organizationId: 'org1' } });
                    return [4 /*yield*/, caller.exportOrganizationData({ format: 'json', includeUsers: true, includeTransactions: false, includeTemplates: true })];
                case 1:
                    response = _a.sent();
                    vitest_1.expect(response.success).toBe(true);
                    vitest_1.expect(response.exportId).toBeTruthy();
                    vitest_1.expect(db.createExportJob).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                        dataType: 'organization_export',
                        format: 'json',
                        status: 'processing',
                        createdBy: 'u1'
                    }));
                    return [2 /*return*/];
            }
        });
    }); });
});
