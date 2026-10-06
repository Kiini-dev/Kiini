"use strict";
/**
 * Payment Webhook Handler
 * Handles callbacks from Stripe and M-Pesa
 *
 * Mount this router in the Express server BEFORE JSON middleware
 * Stripe needs raw body, so must be configured with express.raw()
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
exports.setupPaymentWebhooks = void 0;
var stripeService = require("../services/stripe");
var mpesaService = require("../services/mpesa");
var subscriptionJobs_1 = require("../jobs/subscriptionJobs");
/**
 * Setup webhook routes in Express app
 */
function setupPaymentWebhooks(app) {
    var _this = this;
    /**
     * Stripe webhook endpoint
     * POST /api/webhooks/stripe
     *
     * Stripe sends raw JSON body, needs to be processed with signature verification
     * Use raw parser for this endpoint to capture raw body for signature verification
     */
    app.post('/api/webhooks/stripe', 
    // Use raw body parser ONLY for this endpoint to preserve raw bytes for signature verification
    function (req, res, next) {
        var data = '';
        req.on('data', function (chunk) {
            data += chunk.toString();
        });
        req.on('end', function () {
            try {
                req.body = JSON.parse(data);
                req.rawBody = data;
                next();
            }
            catch (error) {
                return res.status(400).json({ error: 'Invalid JSON in webhook body' });
            }
        });
    }, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var signature, result, getDb, database, billingInvoices, eq, billingRows, subErr_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 12, , 13]);
                    signature = req.headers['stripe-signature'];
                    if (!signature) {
                        return [2 /*return*/, res.status(400).json({ error: 'Missing stripe-signature header' })];
                    }
                    return [4 /*yield*/, stripeService.handleWebhookEvent(req.rawBody, signature)];
                case 1:
                    result = _a.sent();
                    console.log('[Webhook] Stripe event processed:', {
                        eventType: result.eventType,
                        invoiceId: result.invoiceId,
                        processed: result.processed
                    });
                    if (!(result.processed && result.invoiceId)) return [3 /*break*/, 11];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 10, , 11]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../db'); })];
                case 3:
                    getDb = (_a.sent()).getDb;
                    return [4 /*yield*/, getDb()];
                case 4:
                    database = _a.sent();
                    if (!database) return [3 /*break*/, 9];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                case 5:
                    billingInvoices = (_a.sent()).billingInvoices;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                case 6:
                    eq = (_a.sent()).eq;
                    return [4 /*yield*/, database
                            .select()
                            .from(billingInvoices)
                            .where(eq(billingInvoices.id, result.invoiceId))
                            .limit(1)];
                case 7:
                    billingRows = _a.sent();
                    if (!(billingRows.length > 0 && billingRows[0].subscriptionId)) return [3 /*break*/, 9];
                    return [4 /*yield*/, subscriptionJobs_1.activateSubscriptionAfterPayment(billingRows[0].subscriptionId)];
                case 8:
                    _a.sent();
                    console.log('[Webhook] Stripe: Subscription activated for invoice', result.invoiceId);
                    _a.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    subErr_1 = _a.sent();
                    console.warn('[Webhook] Stripe subscription activation failed:', subErr_1);
                    return [3 /*break*/, 11];
                case 11:
                    res.status(200).json({ received: true, processed: result.processed });
                    return [3 /*break*/, 13];
                case 12:
                    error_1 = _a.sent();
                    console.error('[Webhook] Stripe webhook error:', error_1);
                    // Return 400 for signature failures, 500 for other errors
                    if (error_1 instanceof Error && error_1.message.includes('signature')) {
                        return [2 /*return*/, res.status(400).json({ error: 'Invalid signature' })];
                    }
                    res.status(500).json({ error: 'Webhook processing failed' });
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    }); });
    /**
     * M-Pesa callback endpoint
     * POST /api/webhooks/mpesa
     *
     * M-Pesa sends JSON body with transaction confirmation
     */
    app.post('/api/webhooks/mpesa', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var result, getDb, database, _a, mpesaTransactions, billingInvoices, eq, txRows, invoiceId, billingRows, subErr_2, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 13, , 14]);
                    return [4 /*yield*/, mpesaService.handleCallback(req.body)];
                case 1:
                    result = _b.sent();
                    console.log('[Webhook] M-Pesa callback processed:', {
                        checkoutRequestId: result.checkoutRequestId,
                        status: result.status
                    });
                    if (!(result.status === 'success')) return [3 /*break*/, 12];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 11, , 12]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../db'); })];
                case 3:
                    getDb = (_b.sent()).getDb;
                    return [4 /*yield*/, getDb()];
                case 4:
                    database = _b.sent();
                    if (!database) return [3 /*break*/, 10];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                case 5:
                    _a = _b.sent(), mpesaTransactions = _a.mpesaTransactions, billingInvoices = _a.billingInvoices;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                case 6:
                    eq = (_b.sent()).eq;
                    return [4 /*yield*/, database
                            .select()
                            .from(mpesaTransactions)
                            .where(eq(mpesaTransactions.checkoutRequestId, result.checkoutRequestId))
                            .limit(1)];
                case 7:
                    txRows = _b.sent();
                    if (!(txRows.length > 0)) return [3 /*break*/, 10];
                    invoiceId = txRows[0].invoiceId;
                    if (!invoiceId) return [3 /*break*/, 10];
                    return [4 /*yield*/, database
                            .select()
                            .from(billingInvoices)
                            .where(eq(billingInvoices.id, invoiceId))
                            .limit(1)];
                case 8:
                    billingRows = _b.sent();
                    if (!(billingRows.length > 0 && billingRows[0].subscriptionId)) return [3 /*break*/, 10];
                    return [4 /*yield*/, subscriptionJobs_1.activateSubscriptionAfterPayment(billingRows[0].subscriptionId)];
                case 9:
                    _b.sent();
                    console.log('[Webhook] M-Pesa: Subscription activated for invoice', invoiceId);
                    _b.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    subErr_2 = _b.sent();
                    console.warn('[Webhook] M-Pesa subscription activation failed:', subErr_2);
                    return [3 /*break*/, 12];
                case 12:
                    // M-Pesa expects 200 OK response
                    res.status(200).json({
                        ResultCode: 0,
                        ResultDesc: 'Accepted'
                    });
                    return [3 /*break*/, 14];
                case 13:
                    error_2 = _b.sent();
                    console.error('[Webhook] M-Pesa webhook error:', error_2);
                    // Always return 200 to M-Pesa to avoid retries, but log error
                    res.status(200).json({
                        ResultCode: 1,
                        ResultDesc: 'Error processing callback'
                    });
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/];
            }
        });
    }); });
    /**
     * M-Pesa validation endpoint (for test transactions)
     * POST /api/webhooks/mpesa-validation
     */
    app.post('/api/webhooks/mpesa-validation', function (req, res) {
        try {
            // M-Pesa validation request - always accept
            res.status(200).json({
                ResultCode: 0,
                ResultDesc: 'Validation successful'
            });
        }
        catch (error) {
            console.error('[Webhook] M-Pesa validation error:', error);
            res.status(200).json({
                ResultCode: 0,
                ResultDesc: 'Validation processed'
            });
        }
    });
    /**
     * Health check for webhook endpoints
     * GET /api/webhooks/health
     */
    app.get('/api/webhooks/health', function (req, res) {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            endpoints: {
                stripe: '/api/webhooks/stripe',
                mpesa: '/api/webhooks/mpesa',
                mpesaValidation: '/api/webhooks/mpesa-validation'
            }
        });
    });
}
exports.setupPaymentWebhooks = setupPaymentWebhooks;
exports["default"] = setupPaymentWebhooks;
