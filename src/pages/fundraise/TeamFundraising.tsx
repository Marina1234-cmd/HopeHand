import React from 'react'
import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Create Your Team',
    description: 'Invite friends, family, or colleagues to join your fundraising team.',
    icon: '👥'
  },
  {
    title: 'Set Team Goals',
    description: 'Set individual and team fundraising targets to track progress.',
    icon: '🎯'
  },
  {
    title: 'Track Progress',
    description: 'Monitor real-time fundraising progress and member contributions.',
    icon: '📊'
  },
  {
    title: 'Team Communication',
    description: 'Built-in tools to coordinate and motivate your team.',
    icon: '💬'
  }
]

const successStories = [
  {
    id: 1,
    teamName: "Hope Runners Club",
    cause: "Children's Hospital",
    raised: 25000,
    goal: 30000,
    members: 15,
    imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop",
    description: "Our running club raised funds for new pediatric equipment."
  },
  {
    id: 2,
    teamName: "Tech for Good",
    cause: "Digital Education",
    raised: 18000,
    goal: 20000,
    members: 8,
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop",
    description: "Providing laptops and internet access to underprivileged students."
  }
]

const teamTypes = [
  {
    title: 'Corporate Teams',
    description: 'Engage employees and make a positive impact together.',
    benefits: ['Match employee donations', 'Team building', 'CSR reporting']
  },
  {
    title: 'School Teams',
    description: 'Unite students and faculty for meaningful causes.',
    benefits: ['Safe fundraising tools', 'Progress tracking', 'Educational resources']
  },
  {
    title: 'Community Groups',
    description: 'Bring your community together for local causes.',
    benefits: ['Local impact', 'Event planning', 'Community engagement']
  }
]

export default function TeamFundraising() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Team Fundraising
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Multiply your impact by fundraising together. Create or join a team
            and achieve more for the causes you care about.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/team-fundraising/create"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Start a Team
            </Link>
            <Link
              to="/team-fundraising/join"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-green-700 bg-green-100 hover:bg-green-200"
            >
              Join a Team
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Success Stories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Team Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {successStories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <img
                  src={story.imageUrl}
                  alt={story.teamName}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {story.teamName}
                      </h3>
                      <p className="text-gray-600">{story.cause}</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {story.members} members
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {story.description}
                  </p>
                  <div className="mb-4">
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                        <div
                          style={{
                            width: `${(story.raised / story.goal) * 100}%`
                          }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${story.raised.toLocaleString()} raised</span>
                      <span>${story.goal.toLocaleString()} goal</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Types */}
        <div className="bg-white rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Types of Teams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamTypes.map((type) => (
              <div
                key={type.title}
                className="border rounded-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {type.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {type.description}
                </p>
                <ul className="space-y-2">
                  {type.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Resources Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Your Team?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Get everything you need to launch a successful team fundraiser
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/fundraising-tips/team"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-green-700 bg-green-100 hover:bg-green-200"
            >
              Fundraising Tips
            </Link>
            <Link
              to="/team-resources"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-green-700 bg-green-100 hover:bg-green-200"
            >
              Team Resources
            </Link>
            <Link
              to="/team-support"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-green-700 bg-green-100 hover:bg-green-200"
            >
              Support Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 