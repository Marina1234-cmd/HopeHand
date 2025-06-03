import React from 'react'
import { Link } from 'react-router-dom'

const steps = [
  {
    number: 1,
    title: 'Create Your Campaign',
    description: 'Set up your fundraiser in minutes. Add your story, photos, and fundraising goal.',
    icon: '📝'
  },
  {
    number: 2,
    title: 'Share Your Story',
    description: 'Share your campaign with friends, family, and social networks to gain support.',
    icon: '🌟'
  },
  {
    number: 3,
    title: 'Receive Donations',
    description: 'Watch your campaign grow as people contribute to your cause.',
    icon: '💖'
  },
  {
    number: 4,
    title: 'Withdraw Funds',
    description: 'Transfer funds directly to your bank account as donations come in.',
    icon: '💳'
  }
]

const faqs = [
  {
    question: 'How long does it take to create a campaign?',
    answer: 'You can create a campaign in as little as 5 minutes. We guide you through each step of the process to make it quick and easy.'
  },
  {
    question: 'What fees do you charge?',
    answer: 'We don't charge any platform fees. You keep more of your donations, only paying standard payment processing fees.'
  },
  {
    question: 'When can I withdraw the donations?',
    answer: 'You can withdraw donations as soon as they clear, typically within 2-5 business days of receiving the donation.'
  },
  {
    question: 'Is my campaign secure?',
    answer: 'Yes, we use bank-level encryption and security measures to protect your campaign and donations.'
  },
  {
    question: 'Can I edit my campaign after launching?',
    answer: 'Yes, you can update your campaign story, photos, and goal amount at any time.'
  },
  {
    question: 'What kind of support do you offer?',
    answer: 'We offer 24/7 customer support, fundraising tips, and tools to help your campaign succeed.'
  }
]

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Steps Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900">
              How It Works
            </h1>
            <p className="mt-4 text-xl text-gray-500">
              Start your fundraiser in minutes and reach donors worldwide
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">{step.number}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Everything you need to know about fundraising on our platform
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-500">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">
              Ready to Start Your Fundraiser?
            </h2>
            <p className="mt-4 text-xl text-green-100">
              Join thousands of successful fundraisers making a difference
            </p>
            <div className="mt-8">
              <Link
                to="/fundraise/create"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-green-700 bg-white hover:bg-green-50 shadow-sm"
              >
                Start Your Campaign
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 