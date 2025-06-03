import { useState, useEffect } from 'react'
import { collection, query, getDocs, where } from 'firebase/firestore'
import { db } from '../../config/firebase'

interface StatsData {
  totalDonations: number
  totalCampaigns: number
  activeUsers: number
  totalRaised: number
  successRate: number
  avgDonation: number
  campaignsByCategory: { [key: string]: number }
  recentActivity: Array<{
    id: string
    type: string
    amount?: number
    campaign?: string
    date: Date
  }>
}

const AdminStats = () => {
  const [stats, setStats] = useState<StatsData>({
    totalDonations: 0,
    totalCampaigns: 0,
    activeUsers: 0,
    totalRaised: 0,
    successRate: 0,
    avgDonation: 0,
    campaignsByCategory: {},
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch campaigns
        const campaignsRef = collection(db, 'campaigns')
        const campaignsSnapshot = await getDocs(campaignsRef)
        const campaigns = campaignsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Fetch users
        const usersRef = collection(db, 'users')
        const usersSnapshot = await getDocs(usersRef)
        
        // Calculate statistics
        const totalCampaigns = campaigns.length
        const totalRaised = campaigns.reduce((sum: number, campaign: any) => sum + (campaign.raised || 0), 0)
        const successfulCampaigns = campaigns.filter((campaign: any) => campaign.raised >= campaign.goal).length
        const successRate = (successfulCampaigns / totalCampaigns) * 100

        // Calculate campaigns by category
        const categoryStats = campaigns.reduce((acc: any, campaign: any) => {
          acc[campaign.category] = (acc[campaign.category] || 0) + 1
          return acc
        }, {})

        setStats({
          totalDonations: 1250, // This would come from donations collection
          totalCampaigns,
          activeUsers: usersSnapshot.size,
          totalRaised,
          successRate,
          avgDonation: 75, // This would be calculated from actual donations
          campaignsByCategory: categoryStats,
          recentActivity: [
            {
              id: '1',
              type: 'donation',
              amount: 100,
              campaign: 'Community Garden',
              date: new Date()
            },
            // Add more recent activity items
          ]
        })
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md">
            <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Raised</h3>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              +12% ↑
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              ${stats.totalRaised.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Campaigns</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Active
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              {stats.totalCampaigns.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Success Rate</h3>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Trending
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              {stats.successRate.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Active Users</h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Growing
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              {stats.activeUsers.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaigns by Category</h3>
        <div className="space-y-4">
          {Object.entries(stats.campaignsByCategory).map(([category, count]) => (
            <div key={category} className="flex items-center">
              <span className="text-sm font-medium text-gray-600 w-32">{category}</span>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary-600 h-2.5 rounded-full"
                    style={{ width: `${(count / stats.totalCampaigns) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {stats.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'donation' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {activity.type === 'donation' ? '$' : 'C'}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.type === 'donation' ? 'New donation' : 'New campaign'}
                  </p>
                  <p className="text-sm text-gray-500">{activity.campaign}</p>
                </div>
              </div>
              <div className="text-right">
                {activity.amount && (
                  <p className="text-sm font-medium text-gray-900">${activity.amount}</p>
                )}
                <p className="text-xs text-gray-500">
                  {activity.date.toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminStats 