import React from 'react'

const features = [
  {
    title: "Advanced Analytics",
    description: "Get deep insights into donor behavior and campaign performance.",
    icon: "📊"
  },
  {
    title: "Custom Branding",
    description: "Create a seamless experience with your organization's branding.",
    icon: "🎨"
  },
  {
    title: "Team Management",
    description: "Collaborate effectively with role-based access controls.",
    icon: "👥"
  },
  {
    title: "API Integration",
    description: "Connect with your existing tools and systems.",
    icon: "🔌"
  }
]

const resources = [
  {
    title: "Fundraising Strategy Guide",
    description: "Learn proven strategies to maximize your fundraising efforts.",
    type: "Guide",
    downloadLink: "#"
  },
  {
    title: "Donor Retention Playbook",
    description: "Discover techniques to build lasting donor relationships.",
    type: "Playbook",
    downloadLink: "#"
  },
  {
    title: "Digital Marketing Templates",
    description: "Ready-to-use templates for social media and email campaigns.",
    type: "Templates",
    downloadLink: "#"
  }
]

const webinars = [
  {
    title: "Mastering Online Fundraising",
    date: "April 15, 2024",
    time: "2:00 PM EST",
    speaker: "Emily Chen",
    role: "Fundraising Strategist"
  },
  {
    title: "Building Donor Trust",
    date: "April 22, 2024",
    time: "1:00 PM EST",
    speaker: "Michael Roberts",
    role: "Nonprofit Consultant"
  }
]

export default function NonprofitPro() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            HopeHand for Nonprofits
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional tools and resources to help your nonprofit organization thrive.
          </p>
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

        {/* Resources Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Free Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {resources.map((resource) => (
              <div key={resource.title} className="border border-gray-200 rounded-lg p-6">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                  {resource.type}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {resource.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {resource.description}
                </p>
                <a
                  href={resource.downloadLink}
                  className="inline-flex items-center text-green-600 hover:text-green-700"
                >
                  Download Now
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Webinars Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Upcoming Webinars
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {webinars.map((webinar) => (
              <div key={webinar.title} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {webinar.title}
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-600">
                    <span className="font-medium">Date:</span> {webinar.date}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Time:</span> {webinar.time}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Speaker:</span> {webinar.speaker}, {webinar.role}
                  </p>
                </div>
                <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Register Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-green-600 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Your Nonprofit to the Next Level?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Get started with HopeHand Pro and unlock powerful tools for your organization.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors">
              Start Free Trial
            </button>
            <button className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-400 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 