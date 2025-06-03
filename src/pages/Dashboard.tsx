import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import SearchFilters from '../components/SearchFilters'

interface Campaign {
  id: string
  title: string
  description: string
  goal: number
  raised: number
  image: string
  progress: number
  status: 'active' | 'draft' | 'ended'
  category: string
  createdAt: string
}

const Dashboard = () => {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'draft' | 'ended'>('active')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!user) return

      try {
        const campaignsRef = collection(db, 'campaigns')
        const q = query(campaignsRef, where('userId', '==', user.uid))
        const querySnapshot = await getDocs(q)
        
        const fetchedCampaigns: Campaign[] = []
        querySnapshot.forEach((doc) => {
          fetchedCampaigns.push({ id: doc.id, ...doc.data() } as Campaign)
        })

        setCampaigns(fetchedCampaigns)
        setFilteredCampaigns(fetchedCampaigns)
      } catch (error) {
        console.error('Error fetching campaigns:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [user])

  // Filter campaigns based on status, search query, and category
  useEffect(() => {
    let filtered = [...campaigns]

    // Apply status filter
    filtered = filtered.filter(campaign => campaign.status === activeTab)

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        campaign =>
          campaign.title.toLowerCase().includes(query) ||
          campaign.description.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(campaign => campaign.category === selectedCategory)
    }

    setFilteredCampaigns(filtered)
  }, [campaigns, activeTab, searchQuery, selectedCategory])

  const tabs = [
    { id: 'active', label: 'Active Campaigns' },
    { id: 'draft', label: 'Drafts' },
    { id: 'ended', label: 'Ended' }
  ]

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Campaigns</h1>
          <p className="text-gray-600 mt-1">Manage your fundraising campaigns</p>
        </div>
        <Link to="/campaigns/create" className="btn-primary">
          Create New Campaign
        </Link>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Raised</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">
            ${campaigns.reduce((sum, campaign) => sum + campaign.raised, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Active Campaigns</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">
            {campaigns.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Campaigns</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">{campaigns.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'active' | 'draft' | 'ended')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <SearchFilters
          onSearch={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          selectedCategory={selectedCategory}
        />
      </div>

      {/* Results Summary */}
      <div className="mb-6 text-gray-600">
        {filteredCampaigns.length === 0 ? (
          <p>No {activeTab} campaigns found matching your criteria.</p>
        ) : (
          <p>
            Showing {filteredCampaigns.length} {activeTab} campaign
            {filteredCampaigns.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Campaign List */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No {activeTab} campaigns found. Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder.jpg';
                  }}
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    campaign.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : campaign.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-full bg-primary-600 rounded-full"
                      style={{ width: `${campaign.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">${campaign.raised.toLocaleString()} raised</span>
                    <span className="text-gray-600">{campaign.progress}%</span>
                  </div>
                </div>
                <div className="mt-6 flex space-x-4">
                  <Link
                    to={`/campaigns/${campaign.id}`}
                    className="flex-1 text-center btn-primary"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/campaigns/${campaign.id}/edit`}
                    className="flex-1 text-center btn-secondary"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard 