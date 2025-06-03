import { Link } from 'react-router-dom'
import '../styles/effects.css'

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Make a Difference,
              <span className="block">One Hope at a Time</span>
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Join our community of changemakers and help turn dreams into reality. 
              Start your campaign today or support causes that matter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                to="/campaigns/create" 
                className="btn-hover-effect bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                Start a Campaign
              </Link>
              <Link 
                to="/campaigns" 
                className="btn-hover-effect bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg border-2 border-primary-400 hover:bg-primary-600 transition"
              >
                Browse Campaigns
              </Link>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 transform hover:scale-105 transition">
              <div className="text-4xl font-bold text-white mb-2">$2.5M+</div>
              <div className="text-primary-100">Funds Raised</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 transform hover:scale-105 transition">
              <div className="text-4xl font-bold text-white mb-2">5000+</div>
              <div className="text-primary-100">Campaigns</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 transform hover:scale-105 transition">
              <div className="text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-primary-100">Supporters</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 transform hover:scale-105 transition">
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-primary-100">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection 