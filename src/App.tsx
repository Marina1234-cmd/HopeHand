import React, { useEffect, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import sessionManager from './services/sessionManager'
import SessionTimeoutWarning from './components/auth/SessionTimeoutWarning'
import { lazy } from 'react'
import ErrorBoundary from './components/error/ErrorBoundary'
import CampaignList from './components/campaigns/CampaignList'
import CreateCampaign from './pages/CreateCampaign'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import { useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import FundraisingBasics from './pages/tips/FundraisingBasics'
import About from './pages/About'

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
)

// Import pages
const Search = lazy(() => import('./pages/Search'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Campaigns = lazy(() => import('./pages/Campaigns'))
const CampaignDetails = lazy(() => import('./pages/CampaignDetails'))
const FundraisingStory = lazy(() => import('./pages/tips/FundraisingStory'))
const FundraisingShare = lazy(() => import('./pages/tips/FundraisingShare'))
const Categories = lazy(() => import('./pages/Categories'))

// Donate pages
const CrisisRelief = lazy(() => import('./pages/donate/CrisisRelief'))
const SocialImpactFunds = lazy(() => import('./pages/donate/SocialImpactFunds'))
const SupporterSpace = lazy(() => import('./pages/donate/SupporterSpace'))

// Fundraise pages
const TeamFundraising = lazy(() => import('./pages/fundraise/TeamFundraising'))
const FundraisingBlog = lazy(() => import('./pages/fundraise/FundraisingBlog'))
const CharityFundraising = lazy(() => import('./pages/fundraise/CharityFundraising'))
const NonprofitSignup = lazy(() => import('./pages/fundraise/NonprofitSignup'))

// About pages
const HowHopeHandWorks = lazy(() => import('./pages/about/HowHopeHandWorks'))
const GivingGuarantee = lazy(() => import('./pages/about/GivingGuarantee'))
const SupportedCountries = lazy(() => import('./pages/about/SupportedCountries'))
const Pricing = lazy(() => import('./pages/about/Pricing'))
const HelpCenter = lazy(() => import('./pages/about/HelpCenter'))

// Resource pages
const Newsroom = lazy(() => import('./pages/resources/Newsroom'))
const Careers = lazy(() => import('./pages/resources/Careers'))
const Partnerships = lazy(() => import('./pages/resources/Partnerships'))
const NonprofitPro = lazy(() => import('./pages/resources/NonprofitPro'))

const App: React.FC = () => {
  const { user } = useAuth()

  useEffect(() => {
    // Only initialize if not already initialized
    if (!sessionManager.isInitialized) {
      sessionManager.init()
    }

    // Cleanup function
    return () => {
      // Only destroy if component is actually unmounting
      if (!document.hidden) {
        sessionManager.destroy()
      }
    }
  }, []) // Empty dependency array means this runs once on mount

  const handleExtendSession = () => {
    if (sessionManager.isInitialized) {
      sessionManager.updateActivity()
      console.log('Session extended')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ErrorBoundary>
        <Navbar />
      </ErrorBoundary>
      
      <main className="flex-grow">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/create" element={<CreateCampaign />} />
              <Route path="/campaigns/:id" element={<CampaignDetails />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:id" element={<CampaignList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Donate Routes */}
              <Route path="/crisis-relief" element={<CrisisRelief />} />
              <Route path="/impact-funds" element={<SocialImpactFunds />} />
              <Route path="/supporter-space" element={<SupporterSpace />} />
              
              {/* Fundraise Routes */}
              <Route path="/team-fundraising" element={<TeamFundraising />} />
              <Route path="/blog" element={<FundraisingBlog />} />
              <Route path="/charity" element={<CharityFundraising />} />
              <Route path="/nonprofit/signup" element={<NonprofitSignup />} />
              
              {/* About Routes */}
              <Route path="/how-it-works" element={<HowHopeHandWorks />} />
              <Route path="/guarantee" element={<GivingGuarantee />} />
              <Route path="/countries" element={<SupportedCountries />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/about" element={<About />} />
              
              {/* Resource Routes */}
              <Route path="/newsroom" element={<Newsroom />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/partnerships" element={<Partnerships />} />
              <Route path="/nonprofit" element={<NonprofitPro />} />
              
              {/* Fundraising Tips Routes */}
              <Route path="/fundraising-tips/basics" element={<FundraisingBasics />} />
              <Route path="/fundraising-tips/story" element={<FundraisingStory />} />
              <Route path="/fundraising-tips/share" element={<FundraisingShare />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>

      <ErrorBoundary>
        {user && <SessionTimeoutWarning onExtendSession={handleExtendSession} />}
      </ErrorBoundary>
    </div>
  )
}

export default App 