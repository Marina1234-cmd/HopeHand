import React from 'react'

const tips = [
  {
    title: 'Set a realistic goal',
    description: 'Calculate your expenses carefully and set an achievable fundraising goal. You can always raise it later if needed.',
    icon: '🎯'
  },
  {
    title: 'Add compelling photos',
    description: 'High-quality photos help tell your story and build trust with potential donors.',
    icon: '📸'
  },
  {
    title: 'Write a clear title',
    description: 'Make your fundraiser title specific and memorable. Include who or what the funds are for.',
    icon: '✍️'
  },
  {
    title: 'Keep supporters updated',
    description: 'Post regular updates about your progress and how the funds are being used.',
    icon: '📢'
  },
  {
    title: 'Share on social media',
    description: 'Share your fundraiser on all your social networks and ask friends and family to share too.',
    icon: '🌐'
  },
  {
    title: 'Thank your donors',
    description: 'Always thank donors promptly and personally. Consider sharing their impact in your updates.',
    icon: '💝'
  }
]

export default function FundraisingBasics() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Top Tips for Your Fundraiser
          </h1>
          <p className="text-lg text-gray-600">
            Follow these proven tips to make your fundraiser more successful
          </p>
        </div>

        {/* Tips Grid */}
        <div className="space-y-8">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl" role="img" aria-label={tip.title}>
                    {tip.icon}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {tip.title}
                  </h3>
                  <p className="text-gray-600">
                    {tip.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <a
            href="/fundraise/create"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Start Your Fundraiser
          </a>
        </div>
      </div>
    </div>
  )
} 