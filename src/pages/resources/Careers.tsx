import React from 'react'

const jobOpenings = [
  {
    title: "Senior Full Stack Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Join our engineering team to build and scale our fundraising platform."
  },
  {
    title: "Product Marketing Manager",
    department: "Marketing",
    location: "New York, NY",
    type: "Full-time",
    description: "Drive product adoption and growth through strategic marketing initiatives."
  },
  {
    title: "Customer Success Manager",
    department: "Support",
    location: "Remote",
    type: "Full-time",
    description: "Help our nonprofit partners succeed in their fundraising goals."
  }
]

const benefits = [
  {
    title: "Health & Wellness",
    description: "Comprehensive health, dental, and vision coverage for you and your family.",
    icon: "🏥"
  },
  {
    title: "Remote Work",
    description: "Work from anywhere with flexible hours and unlimited PTO.",
    icon: "🏠"
  },
  {
    title: "Professional Growth",
    description: "Learning stipend and career development opportunities.",
    icon: "📚"
  },
  {
    title: "Equity",
    description: "Be an owner in the company with competitive stock options.",
    icon: "📈"
  }
]

export default function Careers() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join Our Mission
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help us empower people and organizations to make a positive impact in the world.
          </p>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Impact-Driven
              </h3>
              <p className="text-gray-600">
                We measure success by the positive change we create in the world.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Collaborative
              </h3>
              <p className="text-gray-600">
                We work together across teams to achieve our shared mission.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Innovative
              </h3>
              <p className="text-gray-600">
                We embrace new ideas and creative solutions to complex problems.
              </p>
            </div>
          </div>
        </div>

        {/* Job Openings */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Open Positions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobOpenings.map((job) => (
              <div key={job.title} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {job.title}
                </h3>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {job.department}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {job.location}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {job.type}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  {job.description}
                </p>
                <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Benefits & Perks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="text-4xl mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-green-600 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Don't See the Right Role?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            We're always looking for talented people to join our team.
          </p>
          <button className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors">
            Send Your Resume
          </button>
        </div>
      </div>
    </div>
  )
} 