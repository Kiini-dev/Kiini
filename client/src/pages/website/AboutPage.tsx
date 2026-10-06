import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Zap, Shield, Globe, Award } from 'lucide-react';

/**
 * About Page
 * Company information, mission, values, and team overview
 */
export default function AboutPage() {
  const values = [
    {
      icon: <Target size={32} />,
      title: 'Customer-Centric',
      description: 'We build products that solve real business problems.',
    },
    {
      icon: <Zap size={32} />,
      title: 'Innovation',
      description: 'Continuously improving and adding cutting-edge features.',
    },
    {
      icon: <Shield size={32} />,
      title: 'Security',
      description: 'Enterprise-grade security to protect your data.',
    },
    {
      icon: <Globe size={32} />,
      title: 'Global Ready',
      description: 'Supporting multiple currencies, languages, and regions.',
    },
  ];

  const stats = [
    { number: '500+', label: 'Active Organizations' },
    { number: '50K+', label: 'Total Users' },
    { number: '10M+', label: 'Transactions Processed' },
    { number: '99.9%', label: 'Uptime' },
  ];

  const team = [
    {
      name: 'John Kipchoge',
      role: 'CEO & Co-founder',
      bio: 'Former CTO at a leading East African fintech. 10+ years in software.',
    },
    {
      name: 'Sarah Mwangi',
      role: 'CTO & Product Lead',
      bio: 'Full-stack engineer with expertise in scaling systems. 8+ years experience.',
    },
    {
      name: 'James Kariuki',
      role: 'Head of Sales',
      bio: 'Enterprise sales specialist. Built sales teams from 0 to $10M ARR.',
    },
    {
      name: 'Grace Njoroge',
      role: 'Head of Customer Success',
      bio: 'Customer success expert. Dedicated to supporting our organizations.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 z-50 bg-white">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            🏢 Kiini
          </Link>
          <div className="flex gap-4">
            <Link to="/pricing" className="text-gray-700 hover:text-blue-600">
              Pricing
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
      <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 text-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">About Kiini</h1>
          <p className="text-xl text-blue-100">
            Empowering East African businesses with intelligent, all-in-one business management software.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 mb-6">
            At Kiini, we believe every business—regardless of size—deserves access to enterprise-grade business management tools. Our mission is to democratize business software by providing an affordable, cloud-based, integrated platform that helps organizations streamline operations, maximize profitability, and scale sustainably.
          </p>
          <p className="text-lg text-gray-700">
            We're committed to supporting the East African entrepreneurial ecosystem by building solutions that understand local business needs—from Kenyan businesses managing multiple currencies to regional expansion challenges.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="text-center">
                <div className="text-blue-600 mb-4 flex justify-center">{value.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Journey</h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                2019
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Company Founded</h3>
                <p className="text-gray-600">Started with a vision to simplify business management for SMEs.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                2020
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">First 100 Customers</h3>
                <p className="text-gray-600">Reached product-market fit with focused CRM and invoicing features.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                2022
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Platform Expansion</h3>
                <p className="text-gray-600">Launched HR, Accounting, Procurement, and Advanced Analytics modules.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                2024
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">AI & Regional Expansion</h3>
                <p className="text-gray-600">Introduced AI Insights module and expanded to 5 East African countries.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                2025
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Today & Beyond</h3>
                <p className="text-gray-600">Serving 500+ organizations with continuous innovation and support.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 text-center">
                <div className="w-24 h-24 bg-blue-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users size={40} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-semibold text-sm mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Technology & Security</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <Shield size={24} className="text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Enterprise-Grade Security</h3>
                <p className="text-gray-600">ISO 27001 certification, End-to-end encryption, Regular security audits.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Award size={24} className="text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">99.9% Uptime SLA</h3>
                <p className="text-gray-600">Redundant infrastructure across multiple data centers in East Africa.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Zap size={24} className="text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Scalable Architecture</h3>
                <p className="text-gray-600">Built to handle millions of transactions and grow with your business.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Growing Community</h2>
          <p className="text-lg mb-8 text-blue-100">
            Experience the difference with Kiini. Start your free trial today.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded font-bold hover:bg-blue-50 transition"
          >
            Get Started Free
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
