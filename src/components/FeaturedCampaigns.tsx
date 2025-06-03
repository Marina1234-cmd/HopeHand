import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'

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

const FeaturedCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedCampaigns = async () => {
      try {
        const campaignsRef = collection(db, 'campaigns')
        const q = query(
          campaignsRef,
          where('status', '==', 'active'),
          orderBy('raised', 'desc'),
          limit(3)
        )
        const querySnapshot = await getDocs(q)
        
        const fetchedCampaigns: Campaign[] = []
        querySnapshot.forEach((doc) => {
          fetchedCampaigns.push({ id: doc.id, ...doc.data() } as Campaign)
        })

        setCampaigns(fetchedCampaigns)
      } catch (error) {
        console.error('Error fetching featured campaigns:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedCampaigns()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 skeleton-loading"></div>
              <div className="p-6 space-y-4">
                <div className="h-6 w-3/4 skeleton-loading rounded"></div>
                <div className="h-4 w-full skeleton-loading rounded"></div>
                <div className="h-4 w-2/3 skeleton-loading rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Campaigns</h2>
          <p className="text-lg text-gray-600">Support these impactful campaigns making a difference</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              to={`/campaigns/${campaign.id}`}
              className="group bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder.jpg';
                  }}
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/90 backdrop-blur-sm text-primary-600">
                    {campaign.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                  {campaign.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
                
                <div className="space-y-3">
                  <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${campaign.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-primary-600">
                      ${campaign.raised.toLocaleString()}
                      <span className="text-gray-500 font-normal"> raised</span>
                    </span>
                    <span className="font-medium text-gray-900">{campaign.progress}%</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <span className="inline-flex items-center text-primary-600 font-medium group-hover:text-primary-700">
                    View Campaign
                    <svg
                      className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/campaigns"
            className="inline-flex items-center px-8 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-600 hover:text-white transition-colors duration-300"
          >
            View All Campaigns
            <svg
              className="ml-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedCampaigns 