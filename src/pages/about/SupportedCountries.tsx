import React from 'react'

const regions = [
  {
    name: "North America",
    countries: ["United States", "Canada", "Mexico"],
    icon: "🌎"
  },
  {
    name: "Europe",
    countries: ["United Kingdom", "France", "Germany", "Spain", "Italy", "Netherlands"],
    icon: "🌍"
  },
  {
    name: "Asia Pacific",
    countries: ["Australia", "Japan", "Singapore", "Hong Kong", "South Korea"],
    icon: "🌏"
  }
]

export default function SupportedCountries() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Supported Countries
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            HopeHand is available in multiple countries across the globe. 
            Check if your country is supported:
          </p>
        </div>

        {/* Regions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {regions.map((region) => (
            <div key={region.name} className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-4xl mb-4">
                {region.icon}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {region.name}
              </h2>
              <ul className="space-y-2">
                {region.countries.map((country) => (
                  <li key={country} className="text-gray-600">
                    {country}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Coming Soon
          </h2>
          <p className="text-gray-600 text-center">
            We're constantly expanding our reach. If your country isn't listed, 
            sign up to be notified when we launch in your region.
          </p>
          <div className="mt-8 max-w-md mx-auto">
            <form className="flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Notify Me
              </button>
            </form>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-green-600 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need Help?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Our support team is available 24/7 to answer your questions.
          </p>
          <button className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
} 