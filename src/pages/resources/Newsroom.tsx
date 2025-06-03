import React from 'react'

const pressReleases = [
  {
    title: "HopeHand Reaches $100M in Total Donations",
    date: "March 15, 2024",
    excerpt: "Platform milestone demonstrates growing impact of online fundraising for causes worldwide.",
    category: "Milestone"
  },
  {
    title: "New Features Launch to Support Nonprofit Organizations",
    date: "March 10, 2024",
    excerpt: "Enhanced tools help charities raise more funds and engage better with donors.",
    category: "Product Update"
  },
  {
    title: "HopeHand Expands to Five New Countries",
    date: "March 5, 2024",
    excerpt: "Platform now available in additional European and Asian markets.",
    category: "Expansion"
  }
]

const mediaContacts = [
  {
    name: "Sarah Johnson",
    role: "Head of Communications",
    email: "press@hopehand.com",
    phone: "+1 (555) 123-4567"
  }
]

export default function Newsroom() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            HopeHand Newsroom
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Latest news, press releases, and updates from HopeHand
          </p>
        </div>

        {/* Press Releases */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Recent Press Releases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pressReleases.map((release) => (
              <div key={release.title} className="bg-white rounded-lg shadow-sm p-6">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                  {release.category}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {release.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {release.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {release.date}
                  </span>
                  <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                    Read More →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Media Kit */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Media Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Brand Assets
              </h3>
              <p className="text-gray-600">
                Download our logo, brand guidelines, and media assets.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Impact Reports
              </h3>
              <p className="text-gray-600">
                Access our latest impact reports and statistics.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Press Releases
              </h3>
              <p className="text-gray-600">
                Browse our archive of press releases.
              </p>
            </div>
          </div>
        </div>

        {/* Media Contacts */}
        <div className="bg-green-600 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Media Contacts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {mediaContacts.map((contact) => (
              <div key={contact.name} className="bg-white rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {contact.name}
                </h3>
                <p className="text-gray-600 mb-2">
                  {contact.role}
                </p>
                <p className="text-green-600">
                  {contact.email}
                </p>
                <p className="text-green-600">
                  {contact.phone}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 