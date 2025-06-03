import React from 'react'

const plans = [
  {
    name: "Basic",
    price: "Free",
    description: "Perfect for individuals and small fundraisers",
    features: [
      "Create unlimited campaigns",
      "Basic analytics",
      "Social media sharing",
      "Email support",
      "Standard processing fees"
    ]
  },
  {
    name: "Pro",
    price: "$29",
    description: "For organizations with regular fundraising needs",
    features: [
      "All Basic features",
      "Advanced analytics",
      "Custom branding",
      "Priority support",
      "Reduced processing fees",
      "Team collaboration"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with specific requirements",
    features: [
      "All Pro features",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "Lowest processing fees",
      "SLA guarantees"
    ]
  }
]

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that best fits your fundraising needs. 
            No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`bg-white rounded-lg shadow-sm p-8 ${
                plan.popular ? 'ring-2 ring-green-500' : ''
              }`}
            >
              {plan.popular && (
                <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold text-green-600 bg-green-100 mb-4">
                  Most Popular
                </span>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h2>
              <div className="text-4xl font-bold text-gray-900 mb-4">
                {plan.price}
                {plan.price !== "Custom" && (
                  <span className="text-lg font-normal text-gray-500">/month</span>
                )}
              </div>
              <p className="text-gray-600 mb-6">
                {plan.description}
              </p>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 px-4 rounded-md font-semibold ${
                plan.popular
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}>
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Are there any hidden fees?
              </h3>
              <p className="text-gray-600">
                No hidden fees. We're completely transparent about our pricing and processing fees.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-green-600 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Contact our sales team to discuss your specific requirements.
          </p>
          <button className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  )
} 