import React from 'react'
import { Link } from 'react-router-dom'

const stats = [
  { label: 'Campaigns Funded', value: '50K+' },
  { label: 'Total Raised', value: '$100M+' },
  { label: 'Success Rate', value: '94%' },
  { label: 'Global Reach', value: '150+ Countries' }
]

const values = [
  {
    title: 'Trust & Transparency',
    description: 'We verify every campaign and maintain complete transparency in fund distribution.',
    icon: '🤝'
  },
  {
    title: 'Community First',
    description: 'We build and nurture a supportive community that helps each other in times of need.',
    icon: '💝'
  },
  {
    title: 'Global Impact',
    description: 'We connect donors with causes worldwide, making a difference across borders.',
    icon: '🌍'
  },
  {
    title: 'Zero Platform Fee',
    description: 'We do not charge platform fees, ensuring more funds reach those in need.',
    icon: '✨'
  }
]

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Empowering Change Through Community
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
              We believe in the power of community to create meaningful change. Our platform connects people who want to help with those who need it most.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-green-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                <p className="mt-1 text-base font-medium text-green-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Our Values</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              What drives us to make a difference every day
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="bg-gray-50 rounded-lg p-6">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-lg font-medium text-gray-900">{value.title}</h3>
                <p className="mt-2 text-base text-gray-500">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Ready to Make a Difference?
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Join our community and start making an impact today.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/fundraise/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Start a Fundraiser
              </Link>
              <Link
                to="/campaigns"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-green-700 bg-green-100 hover:bg-green-200"
              >
                Browse Campaigns
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 