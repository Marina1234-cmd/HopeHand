import { useState, useEffect } from 'react'
import AdminStats from './AdminStats'
import CampaignManagement from './CampaignManagement'
import CommentModeration from './CommentModeration'
import UserManagement from './UserManagement'
import DonationManagement from './DonationManagement'
import ActivityLog from './ActivityLog'
import { useAuth } from '../../hooks/useAuth'
import { Permissions } from '../../types/auth'
import TwoFactorVerification from '../auth/TwoFactorVerification'
import TwoFactorSetup from '../auth/TwoFactorSetup'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState('overview')
  const [showTwoFactorVerification, setShowTwoFactorVerification] = useState(false)
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const { hasPermission, user } = useAuth()

  useEffect(() => {
    const checkTwoFactorStatus = async () => {
      if (!user?.uid) return

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userData = userDoc.data()

        if (!userData?.twoFactorAuth?.enabled) {
          setShowTwoFactorSetup(true)
        } else if (!isVerified) {
          setShowTwoFactorVerification(true)
        }
      } catch (error) {
        console.error('Error checking 2FA status:', error)
      }
    }

    checkTwoFactorStatus()
  }, [user?.uid, isVerified])

  const navigation = [
    { name: 'Overview', value: 'overview', permission: 'canAccessAdminPanel' as keyof Permissions },
    { name: 'Campaigns', value: 'campaigns', permission: 'canEditCampaign' as keyof Permissions },
    { name: 'Comments', value: 'comments', permission: 'canModerateComments' as keyof Permissions },
    { name: 'Users', value: 'users', permission: 'canManageUsers' as keyof Permissions },
    { name: 'Donations', value: 'donations', permission: 'canManageDonations' as keyof Permissions },
    { name: 'Activity Log', value: 'activity', permission: 'canAccessAdminPanel' as keyof Permissions },
    { name: 'Settings', value: 'settings', permission: 'canManageSettings' as keyof Permissions },
  ]

  if (showTwoFactorSetup) {
    return (
      <TwoFactorSetup
        onComplete={() => {
          setShowTwoFactorSetup(false)
          setShowTwoFactorVerification(true)
        }}
        onCancel={() => {
          // Redirect to non-admin area or show warning
          window.location.href = '/'
        }}
      />
    )
  }

  if (showTwoFactorVerification) {
    return (
      <TwoFactorVerification
        onSuccess={() => {
          setShowTwoFactorVerification(false)
          setIsVerified(true)
        }}
        onCancel={() => {
          // Redirect to non-admin area
          window.location.href = '/'
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none">
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {navigation.map((item) => (
              hasPermission(item.permission) && (
                <button
                  key={item.value}
                  onClick={() => setCurrentTab(item.value)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${currentTab === item.value
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  {item.name}
                </button>
              )
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <main>
          {currentTab === 'overview' && <AdminStats />}
          {currentTab === 'campaigns' && <CampaignManagement />}
          {currentTab === 'comments' && <CommentModeration />}
          {currentTab === 'users' && <UserManagement />}
          {currentTab === 'donations' && <DonationManagement />}
          {currentTab === 'activity' && <ActivityLog />}
          {currentTab === 'settings' && <div>Settings (Coming Soon)</div>}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard 