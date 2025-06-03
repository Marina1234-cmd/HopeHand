import React from 'react'

const features = [
  {
    title: "Customizable Campaign Pages",
    description: "Create beautiful, branded fundraising pages that reflect your organization's identity.",
    icon: "🎨"
  },
  {
    title: "Donor Management",
    description: "Track and manage donor relationships with our powerful CRM tools.",
    icon: "👥"
  },
  {
    title: "Automated Tax Receipts",
    description: "Automatically generate and send tax receipts to your donors.",
    icon: "📄"
  },
  {
    title: "Real-time Analytics",
    description: "Get detailed insights into your fundraising performance and donor behavior.",
    icon: "📊"
  }
]

const successStories = [
  {
    name: "Save the Children",
    impact: "$2.5M raised",
    description: "Launched a successful emergency relief campaign during natural disasters.",
    logo: "🌟"
  },
  {
    name: "Ocean Conservation Fund",
    impact: "10,000+ donors",
    description: "Built a sustainable monthly giving program for ocean cleanup.",
    logo: "🌊"
  },
  {
    name: "Local Food Bank",
    impact: "500,000 meals",
    description: "Mobilized community support to fight hunger during the pandemic.",
    logo: "🍎"
  }
]

const pricingTiers = [
  {
    name: "Starter",
    price: "Free",
    features: [
      "Basic campaign pages",
      "Up to 100 donors",
      "Email support",
      "Standard processing fees"
    ]
  },
  {
    name: "Growth",
    price: "$99/month",
    features: [
      "Custom branding",
      "Unlimited donors",
      "Priority support",
      "Reduced processing fees",
      "CRM integration"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "All Growth features",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "Lowest processing fees"
    ]
  }
]

export default function CharityFundraising() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Fundraising Solutions for Charities
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful tools to help your charity raise more funds and make a bigger impact.
          </p>
          <div className="mt-8">
            <button className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors mr-4">
              Start Free Trial
            </button>
            <button className="bg-gray-100 text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors">
              Request Demo
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-4xl mb-4">
                {feature.icon}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h2>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Success Stories */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story) => (
              <div key={story.name} className="text-center">
                <div className="text-4xl mb-4">
                  {story.logo}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {story.name}
                </h3>
                <p className="text-green-600 font-medium mb-2">
                  {story.impact}
                </p>
                <p className="text-gray-600">
                  {story.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Simple, Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <div 
                key={tier.name} 
                className={`bg-white rounded-lg shadow-sm p-6 ${
                  tier.popular ? 'ring-2 ring-green-500' : ''
                }`}
              >
                {tier.popular && (
                  <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold text-green-600 bg-green-100 mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                <p className="text-3xl font-bold text-gray-900 mb-6">
                  {tier.price}
                </p>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2 px-4 rounded-md font-medium ${
                  tier.popular
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  {tier.price === "Custom" ? "Contact Sales" : "Get Started"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-green-600 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Fundraising?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of charities using HopeHand to make a difference.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors">
              Get Started
            </button>
            <button className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-400 transition-colors">
              Talk to Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 