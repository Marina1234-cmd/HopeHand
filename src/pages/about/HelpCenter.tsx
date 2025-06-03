import React from 'react'

const categories = [
  {
    title: "Getting Started",
    icon: "🚀",
    articles: [
      "How to create your first campaign",
      "Setting up your profile",
      "Adding payment methods",
      "Sharing your campaign"
    ]
  },
  {
    title: "Donations",
    icon: "💰",
    articles: [
      "Processing fees explained",
      "Withdrawal methods",
      "Tax receipts",
      "Refund policy"
    ]
  },
  {
    title: "Account Management",
    icon: "👤",
    articles: [
      "Updating account settings",
      "Security features",
      "Team permissions",
      "Deleting your account"
    ]
  }
]

const commonQuestions = [
  {
    question: "How long does it take to receive donations?",
    answer: "Donations are typically processed within 2-3 business days and transferred to your connected bank account."
  },
  {
    question: "What are the platform fees?",
    answer: "Our platform fee is 2.9% + $0.30 per transaction for credit card donations. We also offer lower rates for larger organizations."
  },
  {
    question: "Can I create multiple campaigns?",
    answer: "Yes, you can create unlimited campaigns with any account type."
  },
  {
    question: "Is my donors' information secure?",
    answer: "Yes, we use bank-level encryption and security measures to protect all donor information."
  }
]

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How Can We Help?
          </h1>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full px-4 py-3 rounded-full border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500"
              />
              <button className="absolute right-3 top-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {categories.map((category) => (
            <div key={category.title} className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-4xl mb-4">
                {category.icon}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {category.title}
              </h2>
              <ul className="space-y-2">
                {category.articles.map((article) => (
                  <li key={article}>
                    <a href="#" className="text-green-600 hover:text-green-700">
                      {article}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Common Questions */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {commonQuestions.map((item) => (
              <div key={item.question}>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.question}
                </h3>
                <p className="text-gray-600">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-green-600 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still Need Help?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Our support team is available 24/7 to assist you.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors">
              Contact Support
            </button>
            <button className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-400 transition-colors">
              Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 