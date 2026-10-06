import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, ArrowRight } from 'lucide-react';

/**
 * Pricing Page
 * Displays all 6 pricing tiers with features comparison
 * Public page - no authentication required
 */
export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [pricingTiers, setPricingTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch pricing tiers from API
    // For now, use hardcoded data
    setPricingTiers([
      {
        id: 'trial',
        name: 'Trial',
                description: 'Start free for 7 days. No credit card required.',
        monthlyPrice: 0,
        annualPrice: 0,
        monthlyPromo: 'Free',
        features: [
          { name: 'Up to 5 users', included: true },
          { name: 'Core CRM', included: true },
          { name: 'Basic invoicing', included: true },
          { name: 'Email support', included: true },
          { name: 'SSO', included: false },
          { name: 'API access', included: false },
          { name: 'Dedicated support', included: false },
        ],
        cta: 'Start Free Trial',
        highlighted: false,
        icon: '⚡',
      },
      {
        id: 'accounting',
        name: 'Accounting Only',
        description: 'For independent accountants and bookkeepers.',
        monthlyPrice: 49,
        annualPrice: 490,
        monthlyPromo: '$49/month',
        features: [
          { name: 'Up to 2 users', included: true },
          { name: 'CRM (Basic)', included: false },
          { name: 'Invoicing & Payments', included: true },
          { name: 'Chart of Accounts', included: true },
          { name: 'Email support', included: true },
          { name: 'SSO', included: false },
          { name: 'API access', included: false },
        ],
        cta: 'Start Now',
        highlighted: false,
        icon: '🧮',
      },
      {
        id: 'starter',
        name: 'Starter',
        description: 'Perfect for growing businesses.',
                monthlyPrice: 3500,
                annualPrice: 35000,
                monthlyPromo: 'KES 3,500/month',
        features: [
          { name: 'Up to 10 users', included: true },
          { name: 'Complete CRM', included: true },
          { name: 'Invoicing & Payments', included: true },
          { name: 'Basic HR', included: true },
          { name: 'Priority support', included: true },
          { name: 'SSO', included: false },
          { name: 'API access', included: false },
        ],
        cta: 'Start Now',
        highlighted: false,
        icon: '🚀',
      },
      {
        id: 'growth',
        name: 'Growth',
        description: 'For mid-size companies with advanced needs.',
        monthlyPrice: 199,
        annualPrice: 1990,
        monthlyPromo: '$199/month',
        features: [
          { name: 'Up to 25 users', included: true },
          { name: 'All Starter features', included: true },
          { name: 'Payroll & Leave', included: true },
          { name: 'Advanced Reports', included: true },
          { name: '24/7 Priority support', included: true },
          { name: 'SSO', included: true },
          { name: 'Limited API access', included: true },
        ],
        cta: 'Start Now',
        highlighted: false,
        icon: '📈',
      },
      {
        id: 'professional',
        name: 'Professional',
        description: 'For established enterprises.',
                monthlyPrice: 18500,
                annualPrice: 185000,
                monthlyPromo: 'KES 18,500/month',
        features: [
          { name: 'Up to 50 users', included: true },
          { name: 'All Growth features', included: true },
          { name: 'Procurement', included: true },
          { name: 'Custom workflows', included: true },
          { name: 'Advanced security', included: true },
          { name: 'SSO & SAML', included: true },
          { name: 'Full API access', included: true },
        ],
        cta: 'Start Now',
        highlighted: true,
        icon: '💼',
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
                description: '500 users with dedicated support.',
                monthlyPrice: 59000,
                annualPrice: 590000,
                monthlyPromo: 'KES 59,000/month',
        features: [
          { name: 'Unlimited users', included: true },
          { name: 'All Professional features', included: true },
          { name: 'White-label', included: true },
          { name: 'Custom integrations', included: true },
          { name: 'Advanced security & compliance', included: true },
          { name: 'Dedicated account manager', included: true },
          { name: 'Custom SLA & support', included: true },
        ],
        cta: 'Contact Sales',
        highlighted: false,
        icon: '👑',
      },
    ]);
    setLoading(false);
  }, []);

  const displayPrice = (tier: any) => {
    if (!tier.monthlyPrice && !tier.annualPrice) return 'Free';
    if (billingPeriod === 'monthly') return `KES ${Number(tier.monthlyPrice).toLocaleString('en-KE')}`;
    const annualPrice = tier.annualPrice;
    return `KES ${Number(annualPrice).toLocaleString('en-KE')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            🏢 Kiini
          </Link>
          <div className="flex gap-4">
            <Link to="/about" className="text-gray-700 hover:text-blue-600">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600">
              Contact
            </Link>
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Choose the perfect plan for your business. All plans include our core features.
        </p>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded transition ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2 rounded transition ${
                billingPeriod === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Annual
                <span className="ml-2 text-green-600 font-semibold text-sm">2 months free</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-lg border transition-all ${
                tier.highlighted
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-2xl scale-105'
                  : 'border-gray-200 bg-white shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Badge for highlighted tier */}
              {tier.highlighted && (
                <div className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 text-center rounded-t">
                  ⭐ Most Popular
                </div>
              )}

              {/* Tier Header */}
              <div className="p-8 text-center border-b border-gray-200">
                <div className="text-4xl mb-3">{tier.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{tier.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {displayPrice(tier)}
                  </span>
                  {tier.monthlyPrice && (
                    <span className="text-gray-600 ml-2">
                      {billingPeriod === 'annual' ? '/year' : '/month'}
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 rounded font-semibold transition flex items-center justify-center gap-2 ${
                    tier.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {tier.cta}
                  <ArrowRight size={18} />
                </button>
              </div>

              {/* Features */}
              <div className="p-8">
                <p className="text-xs font-semibold text-gray-600 mb-4 uppercase">FEATURES</p>
                <ul className="space-y-4">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X size={18} className="text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Do you offer a free trial?</h3>
              <p className="text-gray-400">
                Absolutely! All new organizations start with a free 7-day trial with core features.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">
                We accept credit/debit cards, bank transfers, M-Pesa, and Paybill via our secure payment gateway.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Is there a setup fee?</h3>
              <p className="text-gray-400">
                No setup fees! You only pay for the plan you choose. For Enterprise plans, we offer custom pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your business?</h2>
          <p className="text-lg mb-8 text-blue-100">
            Join hundreds of organizations using Kiini to streamline their operations.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded font-bold hover:bg-blue-50 transition"
          >
            Start Your Free Trial Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>&copy; 2025 Kiini. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
