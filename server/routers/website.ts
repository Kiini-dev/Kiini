import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';

export const websiteRouter = router({
  getPricingTiers: publicProcedure.query(async () => ({
    tiers: [
      {
        id: 'trial',
        name: 'Trial',
        displayName: 'Trial',
        monthlyPrice: 0,
        annualPrice: 0,
        maxUsers: 5,
        description: 'Try the platform with essential tools.',
        features: ['Core CRM', 'Basic reporting', '5 users'],
        icon: '▣',
        color: '#2563eb',
        isPopular: false,
        contactSales: false,
      },
      {
        id: 'starter',
        name: 'Starter',
        displayName: 'Starter',
        monthlyPrice: 99,
        annualPrice: 990,
        maxUsers: 10,
        description: 'For small teams getting organized.',
        features: ['Full CRM', 'HR tools', 'API access'],
        icon: '▣',
        color: '#10b981',
        isPopular: true,
        contactSales: false,
      },
    ],
  })),

  submitContactForm: publicProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      company: z.string().optional(),
      subject: z.string().min(5),
      message: z.string().min(10),
      inquiryType: z.enum(['general', 'sales', 'support', 'partnership']),
    }))
    .mutation(async ({ input }) => ({
      success: true,
      ticketId: `SUPPORT-${Date.now()}`,
      message: 'Thank you for contacting us. We will be in touch soon.',
      submitted: input,
    })),

  getCompanyInfo: publicProcedure.query(async () => ({
    name: 'Kiini',
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
      { title: 'Customer-Centric', description: 'We prioritize our customers and listen to their feedback.' },
      { title: 'Innovation', description: 'We constantly innovate to deliver cutting-edge solutions.' },
      { title: 'Security', description: 'We take data security and privacy seriously.' },
      { title: 'Global Ready', description: 'We support multiple currencies, languages, and regulations.' },
    ],
    team: [
      { name: 'Dr. James Mwangi', role: 'Founder & CEO', bio: 'Technology entrepreneur with 15+ years in enterprise software.' },
      { name: 'Sarah Kipchoge', role: 'CTO', bio: 'Former Google engineer specializing in scalable systems.' },
      { name: 'Moses Kariuki', role: 'VP Sales', bio: 'Enterprise sales expert with track record in emerging markets.' },
      { name: 'Grace Muthuri', role: 'Head of Operations', bio: 'Operational excellence expert with 12 years experience.' },
    ],
  })),

  getFAQ: publicProcedure.query(async () => ({
    faqs: [
      {
        category: 'Pricing',
        questions: [
          { q: 'Can I change my plan anytime?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.' },
          { q: 'Is there a free trial?', a: 'Yes! New organizations receive a free 7-day Trial tier with no credit card required.' },
          { q: 'What payment methods do you accept?', a: 'We accept credit/debit cards via Stripe, M-Pesa in Kenya, and bank transfers.' },
          { q: 'Can I get a discount for annual billing?', a: 'Yes! All paid plans offer 15% discount when you pay annually.' },
        ],
      },
    ],
  })),

  getBankTransferDetails: publicProcedure.query(async () => ({
    bankName: process.env.BANK_NAME || 'Equity Bank Kenya',
    accountName: process.env.BANK_ACCOUNT_NAME || 'Kiini Ltd',
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || '**2010234567**',
    swiftCode: process.env.BANK_SWIFT_CODE || 'EQBLKENA',
    bankCode: process.env.BANK_CODE || '043',
    branch: process.env.BANK_BRANCH || 'Nairobi',
  })),

  subscribeToTier: protectedProcedure
    .input(z.object({ tierId: z.string(), billingCycle: z.enum(['monthly', 'annual']).optional() }))
    .mutation(async ({ input }) => ({
      success: true,
      subscriptionId: `SUB-${Date.now()}`,
      message: 'Subscription created successfully',
      tierId: input.tierId,
    })),

  getSubscriptionStatus: protectedProcedure.query(async () => ({
    currentTier: 'Starter',
    status: 'active',
    trialEndsAt: null,
    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    nextInvoiceDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    autoRenewEnabled: true,
  })),
});

export type WebsiteRouter = typeof websiteRouter;
