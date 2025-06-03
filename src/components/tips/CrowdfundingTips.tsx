import React from 'react'
import { Link } from 'react-router-dom'

const tips = [
  {
    id: 'basics',
    icon: '💡',
    title: 'Top tips for your GoFundMe fundraiser',
    link: '/fundraising-tips/basics'
  },
  {
    id: 'story',
    icon: '✍️',
    title: 'Tips for telling a great fundraiser story',
    link: '/fundraising-tips/story'
  },
  {
    id: 'share',
    icon: '🌟',
    title: 'Tips for sharing your fundraiser',
    link: '/fundraising-tips/share'
  }
]

export default function CrowdfundingTips() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Top crowdfunding tips
          </h2>
          <Link
            to="/fundraising-tips"
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tips.map((tip) => (
            <Link
              key={tip.id}
              to={tip.link}
              className="group relative bg-yellow-50 rounded-xl p-6 overflow-hidden transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-start space-x-4">
                <span className="text-2xl" role="img" aria-label="tip icon">
                  {tip.icon}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-600">
                    {tip.title}
                  </h3>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-sm text-gray-500 text-center">
          *Statistics on this page are averaged figures based on 2023-2024 GoFundMe data.
        </p>
      </div>
    </div>
  )
} 