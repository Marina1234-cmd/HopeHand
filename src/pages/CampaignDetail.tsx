import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Campaign, Donation, Update } from '../types/campaign'
import { campaignService } from '../services/campaignService'
import { useAuth } from '../hooks/useAuth'

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)
  const [donationAmount, setDonationAmount] = useState('')
  const [donationMessage, setDonationMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  useEffect(() => {
    const loadCampaignData = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const [campaignData, donationsData, updatesData] = await Promise.all([
          campaignService.getCampaign(id),
          campaignService.getCampaignDonations(id),
          campaignService.getCampaignUpdates(id)
        ])

        if (!campaignData) {
          navigate('/404')
          return
        }

        setCampaign(campaignData)
        setDonations(donationsData)
        setUpdates(updatesData)
      } catch (error) {
        console.error('Error loading campaign:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCampaignData()
  }, [id, navigate])

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!campaign || !user || !donationAmount) return

    try {
      const amount = parseFloat(donationAmount)
      if (isNaN(amount) || amount <= 0) return

      await campaignService.addDonation({
        campaignId: campaign.id,
        amount,
        donorId: user.uid,
        donorName: isAnonymous ? 'Anonymous' : user.displayName || 'Anonymous',
        message: donationMessage,
        isAnonymous
      })

      // Refresh donations
      const newDonations = await campaignService.getCampaignDonations(campaign.id)
      setDonations(newDonations)
      
      // Reset form
      setDonationAmount('')
      setDonationMessage('')
      setIsAnonymous(false)
    } catch (error) {
      console.error('Error making donation:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!campaign) return null

  const progress = (campaign.amountRaised / campaign.goal) * 100
  const formattedGoal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(campaign.goal)
  
  const formattedAmountRaised = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(campaign.amountRaised)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="w-full h-96 object-cover rounded-lg"
          />
          
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            {campaign.title}
          </h1>
          
          <div className="mt-4 flex items-center text-gray-500">
            <span>Created by {campaign.creatorName}</span>
            <span className="mx-2">•</span>
            <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="mt-8 prose max-w-none">
            {campaign.story}
          </div>

          {/* Updates Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900">Updates</h2>
            {updates.length > 0 ? (
              <div className="mt-4 space-y-6">
                {updates.map(update => (
                  <div key={update.id} className="bg-white p-6 rounded-lg shadow">
                    <p className="text-gray-600">{update.content}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      {new Date(update.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-gray-500">No updates yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-center">
                <span className="text-3xl font-bold text-gray-900">
                  {formattedAmountRaised}
                </span>
                <p className="text-gray-500">raised of {formattedGoal}</p>
              </div>

              <div className="mt-4">
                <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              {user ? (
                <form onSubmit={handleDonate} className="mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Donation Amount (USD)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={donationAmount}
                        onChange={e => setDonationAmount(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Message (optional)
                    </label>
                    <div className="mt-1">
                      <textarea
                        value={donationMessage}
                        onChange={e => setDonationMessage(e.target.value)}
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={e => setIsAnonymous(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Donate anonymously
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="mt-6 w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Donate Now
                  </button>
                </form>
              ) : (
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Sign in to Donate
                  </button>
                </div>
              )}
            </div>

            {/* Recent Donations */}
            <div className="mt-6 bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Donations
              </h3>
              {donations.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {donations.map(donation => (
                    <div key={donation.id} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {donation.donorName}
                        </p>
                        {donation.message && (
                          <p className="mt-1 text-sm text-gray-500">
                            {donation.message}
                          </p>
                        )}
                      </div>
                      <span className="text-gray-900 font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(donation.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-gray-500">No donations yet. Be the first!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 