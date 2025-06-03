import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import SearchFilters from '../components/SearchFilters'
import '../styles/effects.css'

interface Campaign {
  id: string
  title: string
  description: string
  raised: number
  goal: number
  image: string
  progress: number
  category: string
}

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [imagesLoaded, setImagesLoaded] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const campaignsRef = collection(db, 'campaigns')
        const querySnapshot = await getDocs(campaignsRef)
        
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
  }, [])

  // Filter campaigns based on search query and category
  useEffect(() => {
    let filtered = [...campaigns]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        campaign =>
          campaign.title.toLowerCase().includes(query) ||
          campaign.description.toLowerCase().includes(query)
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(campaign => campaign.category === selectedCategory)
    }

    setFilteredCampaigns(filtered)
  }, [campaigns, searchQuery, selectedCategory])

  const handleImageLoad = (campaignId: string) => {
    setImagesLoaded(prev => ({ ...prev, [campaignId]: true }))
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-xl text-gray-600">
          <div className="skeleton-loading w-48 h-6 rounded mb-2"></div>
          <div className="skeleton-loading w-64 h-4 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Active Campaigns</h1>
          <p className="text-gray-600 mt-1">Support meaningful projects in your community</p>
        </div>
        <Link 
          to="/campaigns/create" 
          className="btn-primary btn-hover-effect transform transition hover:scale-105"
        >
          Start a Campaign
        </Link>
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
          <p>No campaigns found matching your criteria.</p>
        ) : (
          <p>Showing {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Campaign Grid */}
      <div className="responsive-grid">
        {filteredCampaigns.map(campaign => (
          <div 
            key={campaign.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden card-hover"
          >
            <div className="relative h-48 bg-gray-200 overflow-hidden">
              <img
                src={campaign.image}
                alt={campaign.title}
                className={`w-full h-full object-cover image-fade-in ${
                  imagesLoaded[campaign.id] ? 'loaded' : ''
                }`}
                onLoad={() => handleImageLoad(campaign.id)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder.jpg';
                  handleImageLoad(campaign.id);
                }}
              />
              {!imagesLoaded[campaign.id] && (
                <div className="absolute inset-0 skeleton-loading"></div>
              )}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {campaign.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 line-clamp-1">{campaign.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
              <div className="space-y-2">
                <div className="progress-bar w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="progress-bar-fill h-full bg-primary-600 rounded-full" 
                    style={{ 
                      '--progress': `${campaign.progress}%`,
                      width: `${campaign.progress}%`
                    } as React.CSSProperties}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">${campaign.raised.toLocaleString()} raised</span>
                  <span className="text-gray-600">{campaign.progress}%</span>
                </div>
              </div>
              <Link 
                to={`/campaigns/${campaign.id}`}
                className="mt-4 block text-center btn-primary btn-hover-effect transform transition hover:scale-105"
              >
                View Campaign
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria, or{' '}
            <Link 
              to="/campaigns/create" 
              className="text-primary-600 hover:text-primary-500 btn-hover-effect"
            >
              start your own campaign
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}

export default Campaigns 