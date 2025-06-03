import { useState, useEffect } from 'react'
import { collection, query, getDocs, doc, updateDoc, deleteDoc, where } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../hooks/useAuth'

interface Campaign {
  id: string
  title: string
  description: string
  goal: number
  raised: number
  status: 'pending' | 'active' | 'rejected' | 'completed'
  category: string
  createdBy: string
  createdAt: string
}

const CampaignManagement = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { hasPermission } = useAuth()

  const fetchCampaigns = async () => {
    try {
      const campaignsRef = collection(db, 'campaigns')
      const campaignsSnapshot = await getDocs(campaignsRef)
      const campaignsList = campaignsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[]
      
      setCampaigns(campaignsList.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const handleStatusChange = async (campaignId: string, newStatus: Campaign['status']) => {
    try {
      await updateDoc(doc(db, 'campaigns', campaignId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId ? { ...campaign, status: newStatus } : campaign
      ))
    } catch (error) {
      console.error('Error updating campaign status:', error)
    }
  }

  const handleDelete = async (campaignId: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return

    try {
      await deleteDoc(doc(db, 'campaigns', campaignId))
      setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId))
    } catch (error) {
      console.error('Error deleting campaign:', error)
    }
  }

  const handleSaveEdit = async (campaignId: string, updatedData: Partial<Campaign>) => {
    try {
      await updateDoc(doc(db, 'campaigns', campaignId), {
        ...updatedData,
        updatedAt: new Date().toISOString()
      })
      
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId ? { ...campaign, ...updatedData } : campaign
      ))
      setIsEditing(false)
      setSelectedCampaign(null)
    } catch (error) {
      console.error('Error updating campaign:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Campaign Management</h2>
        <div className="flex gap-4">
          <select 
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            onChange={(e) => {
              const status = e.target.value as Campaign['status'] | 'all'
              if (status === 'all') {
                fetchCampaigns()
              } else {
                const filtered = campaigns.filter(c => c.status === status)
                setCampaigns(filtered)
              }
            }}
          >
            <option value="all">All Campaigns</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {campaigns.map((campaign) => (
            <li key={campaign.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium text-primary-600 truncate">
                      {campaign.title}
                    </p>
                    <div className="ml-4 flex-shrink-0">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${campaign.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        ${campaign.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${campaign.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                        ${campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                      `}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Goal: ${campaign.goal.toLocaleString()} • Raised: ${campaign.raised.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Category: {campaign.category}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {hasPermission('canEditCampaign') && (
                        <button
                          onClick={() => {
                            setSelectedCampaign(campaign)
                            setIsEditing(true)
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </button>
                      )}
                      {hasPermission('canDeleteCampaign') && (
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                      {campaign.status === 'pending' && hasPermission('canEditCampaign') && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusChange(campaign.id, 'active')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(campaign.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit Campaign Modal */}
      {isEditing && selectedCampaign && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Campaign</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const updatedData = {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                goal: Number(formData.get('goal')),
                category: formData.get('category') as string,
              }
              handleSaveEdit(selectedCampaign.id, updatedData)
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    defaultValue={selectedCampaign.title}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    defaultValue={selectedCampaign.description}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="goal" className="block text-sm font-medium text-gray-700">
                    Goal
                  </label>
                  <input
                    type="number"
                    name="goal"
                    id="goal"
                    defaultValue={selectedCampaign.goal}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    id="category"
                    defaultValue={selectedCampaign.category}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setSelectedCampaign(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampaignManagement 