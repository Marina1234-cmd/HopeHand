import React, { useEffect, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { useAuth } from './hooks/useAuth'
import sessionManager from './services/sessionManager'
import SessionTimeoutWarning from './components/auth/SessionTimeoutWarning'
import { lazy } from 'react'
import ErrorBoundary from './components/error/ErrorBoundary'

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

// Import pages
const Home = lazy(() => import('./pages/Home'))
const Properties = lazy(() => import('./pages/Properties'))
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'))
const Search = lazy(() => import('./pages/Search'))
const Contact = lazy(() => import('./pages/Contact'))
const ListProperty = lazy(() => import('./pages/ListProperty'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

const App: React.FC = () => {
  const { user } = useAuth()

  useEffect(() => {
    // Initialize session manager
    sessionManager.init()

    return () => {
      sessionManager.destroy()
    }
  }, [])

  const handleExtendSession = () => {
    sessionManager.updateActivity()
    console.log('Session extended')
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <ErrorBoundary>
              <Navbar />
            </ErrorBoundary>
            
            <main className="flex-grow container mx-auto px-4 py-8">
              <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/properties/:id" element={<PropertyDetails />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/list-property" element={<ListProperty />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/dashboard" element={<Dashboard />} />
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
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App 