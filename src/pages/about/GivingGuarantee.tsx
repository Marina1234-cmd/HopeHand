import React from 'react'

const guarantees = [
  {
    title: "100% Secure Donations",
    description: "Your donations are processed using bank-level security and encryption.",
    icon: "🔒"
  },
  {
    title: "Verified Organizations",
    description: "We verify every nonprofit organization before they can start fundraising.",
    icon: "✅"
  },
  {
    title: "Transparent Fees",
    description: "We're upfront about our platform fees, with no hidden charges.",
    icon: "💯"
  },
  {
    title: "Money-Back Guarantee",
    description: "If something's not right, we'll work with you to make it right.",
    icon: "💰"
  }
]

export default function GivingGuarantee() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Giving Guarantee
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to making your giving experience safe, secure, and impactful.
            Here's our promise to you:
          </p>
        </div>

        {/* Guarantees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {guarantees.map((guarantee) => (
            <div key={guarantee.title} className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-4xl mb-4">
                {guarantee.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {guarantee.title}
              </h3>
              <p className="text-gray-600">
                {guarantee.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Trusted by Leading Organizations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Replace with actual trust badges/logos */}
            <div className="h-16 bg-gray-100 rounded flex items-center justify-center text-gray-500">
              Trust Badge 1
            </div>
            <div className="h-16 bg-gray-100 rounded flex items-center justify-center text-gray-500">
              Trust Badge 2
            </div>
            <div className="h-16 bg-gray-100 rounded flex items-center justify-center text-gray-500">
              Trust Badge 3
            </div>
            <div className="h-16 bg-gray-100 rounded flex items-center justify-center text-gray-500">
              Trust Badge 4
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-green-600 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Questions About Our Guarantee?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Our support team is here to help you 24/7.
          </p>
          <button className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
} 