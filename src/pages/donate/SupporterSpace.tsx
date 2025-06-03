import React from 'react'
import { Link } from 'react-router-dom'

const benefits = [
  {
    title: 'Early Access',
    description: 'Be the first to know about urgent causes and special campaigns.',
    icon: '⭐'
  },
  {
    title: 'Impact Tracking',
    description: 'See the real-world impact of your donations with detailed reports.',
    icon: '📊'
  },
  {
    title: 'Exclusive Events',
    description: 'Join virtual and in-person events with beneficiaries and partners.',
    icon: '🎉'
  },
  {
    title: 'Direct Communication',
    description: 'Direct line to campaign organizers and our support team.',
    icon: '💬'
  }
]

const impactStories = [
  {
    id: 1,
    title: 'Building Schools in Rural Areas',
    description: 'How monthly donors helped build 10 schools in underserved communities.',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop',
    impact: '1,000+ students benefited'
  },
  {
    id: 2,
    title: 'Emergency Medical Support',
    description: 'Providing life-saving medical care to those in urgent need.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop',
    impact: '500+ lives saved'
  }
]

export default function SupporterSpace() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Supporter Space
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our community of monthly donors and make a lasting impact.
            Get exclusive benefits and see how your support changes lives.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Impact Stories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Impact Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {impactStories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {story.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {story.description}
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {story.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Membership Tiers */}
        <div className="bg-white rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Monthly Giving Levels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Friend</h3>
              <p className="text-3xl font-bold text-green-600 mb-4">$10/mo</p>
              <ul className="text-gray-600 space-y-2 mb-6">
                <li>Impact Reports</li>
                <li>Monthly Newsletter</li>
                <li>Supporter Badge</li>
              </ul>
              <button className="w-full px-4 py-2 border border-green-600 text-green-600 rounded-full hover:bg-green-50">
                Select
              </button>
            </div>
            <div className="border-2 border-green-600 rounded-lg p-6 text-center relative">
              <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm">
                Most Popular
              </span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Champion</h3>
              <p className="text-3xl font-bold text-green-600 mb-4">$25/mo</p>
              <ul className="text-gray-600 space-y-2 mb-6">
                <li>All Friend Benefits</li>
                <li>Early Access to Campaigns</li>
                <li>Quarterly Virtual Events</li>
                <li>Priority Support</li>
              </ul>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700">
                Select
              </button>
            </div>
            <div className="border rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Leader</h3>
              <p className="text-3xl font-bold text-green-600 mb-4">$50/mo</p>
              <ul className="text-gray-600 space-y-2 mb-6">
                <li>All Champion Benefits</li>
                <li>1:1 Impact Briefings</li>
                <li>Exclusive Site Visits</li>
                <li>Recognition in Annual Report</li>
              </ul>
              <button className="w-full px-4 py-2 border border-green-600 text-green-600 rounded-full hover:bg-green-50">
                Select
              </button>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community of monthly donors and help create lasting change.
          </p>
          <Link
            to="/supporter-space/join"
            className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            Become a Monthly Donor
          </Link>
        </div>
      </div>
    </div>
  )
} 