import React from 'react'

const tips = [
  {
    title: 'Share on social media',
    description: 'Post your fundraiser on Facebook, Instagram, Twitter, and LinkedIn. Use relevant hashtags to increase visibility.',
    icon: '📱'
  },
  {
    title: 'Email your network',
    description: 'Send personalized emails to friends, family, and colleagues. Include your story and a direct link to donate.',
    icon: '📧'
  },
  {
    title: 'Create shareable updates',
    description: 'Post regular updates about your progress and milestones. Make it easy for supporters to share these updates.',
    icon: '📢'
  },
  {
    title: 'Engage with your community',
    description: 'Share your fundraiser in relevant community groups, local organizations, and with people who share your cause.',
    icon: '🤝'
  },
  {
    title: 'Thank and tag donors',
    description: 'Publicly thank donors (with their permission) and tag them in updates. This encourages others to donate.',
    icon: '💖'
  },
  {
    title: 'Use multimedia content',
    description: 'Share photos, videos, and stories that show the impact of donations. Visual content is more likely to be shared.',
    icon: '🎬'
  }
]

const socialTips = [
  {
    platform: 'Facebook',
    tips: [
      'Share in relevant groups',
      'Create a Facebook fundraiser',
      'Use Facebook Live to share updates',
      'Pin your fundraiser to your profile'
    ]
  },
  {
    platform: 'Instagram',
    tips: [
      'Add link to your bio',
      'Share visual updates in Stories',
      'Use relevant hashtags',
      'Tag related accounts'
    ]
  },
  {
    platform: 'Twitter',
    tips: [
      'Pin fundraiser tweet',
      'Use trending hashtags',
      'Share regular updates',
      'Engage with supporters'
    ]
  }
]

export default function FundraisingShare() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            How to Share Your Fundraiser
          </h1>
          <p className="text-lg text-gray-600">
            Effective sharing strategies to help your fundraiser reach more people
          </p>
        </div>

        {/* Main Tips */}
        <div className="space-y-8 mb-12">
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

        {/* Social Media Tips */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Platform-Specific Tips
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {socialTips.map((platform) => (
              <div key={platform.platform}>
                <h3 className="font-medium text-gray-900 mb-3">
                  {platform.platform}
                </h3>
                <ul className="space-y-2">
                  {platform.tips.map((tip, index) => (
                    <li key={index} className="text-gray-600 text-sm flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
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