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
exports.websiteRouter = void 0;
var context_1 = require("./context");
var zod_1 = require("zod");
/**
 * Website & Public Routes Router
 * Handles public pages (pricing, about, contact) and website functionality
 */
exports.websiteRouter = context_1.createRouter()
    // Public route: Get pricing tiers
    .query('getPricingTiers', {
    resolve: function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                // This will be augmented to fetch from pricingTierDescriptions table
                return [2 /*return*/, {
                        tiers: [
                            {
                                id: '1',
                                name: 'Trial',
                                displayName: 'Start Free',
                                monthlyPrice: 0,
                                annualPrice: 0,
                                maxUsers: 5,
                                description: 'Perfect for trying out Kiini',
                                features: [
                                    'Core CRM features',
                                    'Up to 5 users',
                                    '14-day trial',
                                    'Community support',
                                ],
                                icon: '⚡',
                                color: '#f59e0b'
                            },
                            {
                                id: '2',
                                name: 'Accounting-Only',
                                displayName: 'Accounting',
                                monthlyPrice: 49,
                                annualPrice: 490,
                                maxUsers: 2,
                                description: 'Focused on invoicing and accounting',
                                features: [
                                    'Invoice management',
                                    'Expense tracking',
                                    'Financial reports',
                                    'Up to 2 users',
                                    'Email support',
                                ],
                                icon: '🧮',
                                color: '#8b5cf6'
                            },
                            {
                                id: '3',
                                name: 'Starter',
                                displayName: 'Starter',
                                monthlyPrice: 99,
                                annualPrice: 990,
                                maxUsers: 10,
                                description: 'For small teams',
                                features: [
                                    'Full CRM features',
                                    'HR management',
                                    'Up to 10 users',
                                    'API access',
                                    'Priority support',
                                    '15% annual discount',
                                ],
                                icon: '🚀',
                                color: '#06b6d4',
                                isPopular: false
                            },
                            {
                                id: '4',
                                name: 'Growth',
                                displayName: 'Growth',
                                monthlyPrice: 199,
                                annualPrice: 1990,
                                maxUsers: 25,
                                description: 'For growing businesses',
                                features: [
                                    'All Starter features',
                                    'Payroll management',
                                    'Advanced analytics',
                                    'Up to 25 users',
                                    'Dedicated support',
                                    '15% annual discount',
                                ],
                                icon: '📈',
                                color: '#10b981'
                            },
                            {
                                id: '5',
                                name: 'Professional',
                                displayName: 'Professional',
                                monthlyPrice: 399,
                                annualPrice: 3990,
                                maxUsers: 50,
                                description: 'For enterprise teams',
                                features: [
                                    'All Growth features',
                                    'Procurement management',
                                    'Custom integrations',
                                    'Up to 50 users',
                                    '24/7 support',
                                    'SLA guarantee',
                                    '15% annual discount',
                                ],
                                icon: '💼',
                                color: '#3b82f6',
                                isPopular: true
                            },
                            {
                                id: '6',
                                name: 'Enterprise',
                                displayName: 'Enterprise',
                                monthlyPrice: null,
                                annualPrice: null,
                                maxUsers: null,
                                description: 'Custom for your organization',
                                features: [
                                    'Unlimited users',
                                    'Custom features',
                                    'White-label options',
                                    'On-premise deployment',
                                    'Dedicated account manager',
                                    'Custom SLA',
                                ],
                                icon: '👑',
                                color: '#ef4444',
                                contactSales: true
                            },
                        ]
                    }];
            });
        });
    }
})
    // Public route: Submit contact form
    .mutation('submitContactForm', {
    input: zod_1.z.object({
        name: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().optional(),
        company: zod_1.z.string().optional(),
        subject: zod_1.z.string().min(5),
        message: zod_1.z.string().min(10),
        inquiryType: zod_1.z["enum"](['general', 'sales', 'support', 'partnership'])
    }),
    resolve: function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                // TODO: Send email to support team
                // TODO: Create support ticket
                // TODO: Send confirmation email to user
                return [2 /*return*/, {
                        success: true,
                        ticketId: "SUPPORT-" + Date.now(),
                        message: 'Thank you for contacting us. We will be in touch soon.'
                    }];
            });
        });
    }
})
    // Public route: Get company info
    .query('getCompanyInfo', {
    resolve: function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, {
                        name: 'Kiini Solutions',
                        tagline: 'Complete Business Management Platform',
                        mission: 'To empower businesses across Africa with affordable, reliable, and easy-to-use software solutions.',
                        founded: 2019,
                        employees: 50,
                        stats: [
                            { label: 'Happy Customers', value: '500+' },
                            { label: 'Active Users', value: '50K+' },
                            { label: 'Transactions', value: '10M+' },
                            { label: 'Uptime', value: '99.9%' },
                        ],
                        values: [
                            {
                                title: 'Customer-Centric',
                                description: 'We prioritize our customers and listen to their feedback.'
                            },
                            {
                                title: 'Innovation',
                                description: 'We constantly innovate to deliver cutting-edge solutions.'
                            },
                            {
                                title: 'Security',
                                description: 'We take data security and privacy seriously.'
                            },
                            {
                                title: 'Global Ready',
                                description: 'We support multiple currencies, languages, and regulations.'
                            },
                        ],
                        team: [
                            {
                                name: 'Dr. James Mwangi',
                                role: 'Founder & CEO',
                                bio: 'Technology entrepreneur with 15+ years in enterprise software.'
                            },
                            {
                                name: 'Sarah Kipchoge',
                                role: 'CTO',
                                bio: 'Former Google engineer specializing in scalable systems.'
                            },
                            {
                                name: 'Moses Kariuki',
                                role: 'VP Sales',
                                bio: 'Enterprise sales expert with track record in emerging markets.'
                            },
                            {
                                name: 'Grace Muthuri',
                                role: 'Head of Operations',
                                bio: 'Operational excellence expert with 12 years experience.'
                            },
                        ]
                    }];
            });
        });
    }
})
    // Public route: Get FAQ
    .query('getFAQ', {
    resolve: function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, {
                        faqs: [
                            {
                                category: 'Pricing',
                                questions: [
                                    {
                                        q: 'Can I change my plan anytime?',
                                        a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.'
                                    },
                                    {
                                        q: 'Is there a free trial?',
                                        a: 'Yes! We offer a 14-day free trial of our Trial tier with no credit card required.'
                                    },
                                    {
                                        q: 'What payment methods do you accept?',
                                        a: 'We accept credit/debit cards via Stripe, M-Pesa in Kenya, and bank transfers.'
                                    },
                                    {
                                        q: 'Can I get a discount for annual billing?',
                                        a: 'Yes! All paid plans offer 15% discount when you pay annually.'
                                    },
                                ]
                            },
                            {
                                category: 'Features',
                                questions: [
                                    {
                                        q: 'What is included in each tier?',
                                        a: 'Each tier includes progressively more features. Trial includes core CRM, Starter includes HR, Growth includes Payroll, and Professional includes Procurement.'
                                    },
                                    {
                                        q: 'Can I integrate with other tools?',
                                        a: 'Yes, all paid plans include API access. Professional and Enterprise tiers include custom integrations.'
                                    },
                                    {
                                        q: 'Is there a limit on data storage?',
                                        a: 'Trial tier has 5GB, Starter has 100GB, Growth has 500GB, Professional has 1TB, and Enterprise is unlimited.'
                                    },
                                ]
                            },
                            {
                                category: 'Support',
                                questions: [
                                    {
                                        q: 'What support do you offer?',
                                        a: 'Trial tier has community support, Starter has email support, Growth has priority support, Professional has 24/7 support, and Enterprise has dedicated account manager.'
                                    },
                                    {
                                        q: 'What is your uptime SLA?',
                                        a: 'We guarantee 99.9% uptime for all paid plans. Enterprise customers have an enhanced SLA.'
                                    },
                                    {
                                        q: 'How long does onboarding take?',
                                        a: 'Basic onboarding takes 1-2 hours. Enterprise customers get personalized onboarding (1-2 days).'
                                    },
                                ]
                            },
                        ]
                    }];
            });
        });
    }
})
    // Public route: Get bank transfer details (for payment display)
    .query('getBankTransferDetails', {
    resolve: function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, {
                        bankName: process.env.BANK_NAME || 'Equity Bank Kenya',
                        accountName: process.env.BANK_ACCOUNT_NAME || 'Kiini Solutions Ltd',
                        accountNumber: process.env.BANK_ACCOUNT_NUMBER || '**2010234567**',
                        swiftCode: process.env.BANK_SWIFT_CODE || 'EQBLKENA',
                        bankCode: process.env.BANK_CODE || '043',
                        branch: process.env.BANK_BRANCH || 'Nairobi'
                    }];
            });
        });
    }
})
    // Authenticated: Subscribe to pricing tier
    .mutation('subscribeToTier', {
    input: zod_1.z.object({
        tierId: zod_1.z.string(),
        billingCycle: zod_1.z["enum"](['monthly', 'annual']).optional()
    }),
    resolve: function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                // TODO: Create subscription, generate first invoice
                return [2 /*return*/, {
                        success: true,
                        subscriptionId: "SUB-" + Date.now(),
                        message: 'Subscription created successfully'
                    }];
            });
        });
    }
})
    // Authenticated: Get subscription status
    .query('getSubscriptionStatus', {
    resolve: function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                // TODO: fetch from organizationSubscriptions table
                return [2 /*return*/, {
                        currentTier: 'Starter',
                        status: 'active',
                        trialEndsAt: null,
                        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        nextInvoiceDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        autoRenewEnabled: true
                    }];
            });
        });
    }
});
