import React from 'react'
import { Link } from 'react-router-dom'

const impactFunds = [
  {
    id: 'education',
    title: 'Education Fund',
    description: 'Support equal access to quality education and learning opportunities.',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop',
    impact: '50,000+ students supported',
    raised: 2500000
  },
  {
    id: 'healthcare',
    title: 'Healthcare Access Fund',
    description: 'Help provide medical care to underserved communities worldwide.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop',
    impact: '10,000+ patients treated',
    raised: 1800000
  },
  {
    id: 'environment',
    title: 'Climate Action Fund',
    description: 'Support initiatives fighting climate change and protecting our planet.',
    imageUrl: 'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop',
    impact: '100+ projects funded',
    raised: 3200000
  },
  {
    id: 'hunger',
    title: 'Food Security Fund',
    description: 'Combat hunger and support sustainable food systems.',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop',
    impact: '1M+ meals provided',
    raised: 1500000
  }
]

export default function SocialImpactFunds() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Social Impact Funds
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our collective effort to create lasting social change. Each fund focuses on
            a specific cause area with verified partners and measurable impact.
          </p>
        </div>

        {/* Impact Funds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {impactFunds.map((fund) => (
            <div
              key={fund.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={fund.imageUrl}
                  alt={fund.title}
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {fund.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {fund.description}
                </p>
                <div className="flex items-center mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {fund.impact}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Raised</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${fund.raised.toLocaleString()}
                    </p>
                  </div>
                  <Link
                    to={`/impact-funds/${fund.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700"
                  >
                    Contribute
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            How Impact Funds Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Focused Impact
              </h3>
              <p className="text-gray-600">
                Each fund targets specific social challenges with clear goals and metrics.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Verified Partners
              </h3>
              <p className="text-gray-600">
                We work with trusted organizations to ensure your donation creates real change.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Transparent Reporting
              </h3>
              <p className="text-gray-600">
                Regular updates on fund performance and impact metrics.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of donors creating lasting social change.
          </p>
          <Link
            to="/impact-funds/start"
            className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            Start Monthly Giving
          </Link>
        </div>
      </div>
    </div>
  )
} 