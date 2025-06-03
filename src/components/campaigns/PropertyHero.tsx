import React from 'react'
import { Link } from 'react-router-dom'

export default function PropertyHero() {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 to-blue-700">
      {/* Wave Animation */}
      <div className="absolute inset-0 z-0">
        <svg
          className="absolute bottom-0 w-full h-48 transform translate-y-6"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,32L48,37.3C96,43,192,53,288,80C384,107,480,149,576,154.7C672,160,768,128,864,112C960,96,1056,96,1152,101.3C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          >
            <animate
              attributeName="d"
              dur="10s"
              repeatCount="indefinite"
              values="M0,32L48,37.3C96,43,192,53,288,80C384,107,480,149,576,154.7C672,160,768,128,864,112C960,96,1056,96,1152,101.3C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </path>
        </svg>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6">
            Find Your Dream Home
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Discover the perfect property from our extensive collection of homes, apartments, and commercial spaces.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/properties"
              className="inline-block px-8 py-4 text-lg font-semibold rounded-full bg-white text-blue-600 hover:bg-blue-50 transition-colors duration-200"
            >
              Browse Properties
            </Link>
            <Link
              to="/search"
              className="inline-block px-8 py-4 text-lg font-semibold rounded-full bg-blue-500 text-white hover:bg-blue-400 transition-colors duration-200 border-2 border-white"
            >
              Search Now
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="text-4xl font-bold text-white mb-2">1000+</div>
            <div className="text-blue-100">Properties Listed</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="text-4xl font-bold text-white mb-2">500+</div>
            <div className="text-blue-100">Happy Clients</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="text-4xl font-bold text-white mb-2">50+</div>
            <div className="text-blue-100">Cities Covered</div>
          </div>
        </div>

        {/* Trust Banner */}
        <div className="mt-16 bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left">
            <div className="text-white">
              <h3 className="text-xl font-semibold">Trusted & Reliable</h3>
              <p className="text-blue-100">Licensed Real Estate Professionals</p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-4">
              <div className="text-white text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-blue-100 text-sm">Support</div>
              </div>
              <div className="text-white text-center">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-blue-100 text-sm">Verified Listings</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 