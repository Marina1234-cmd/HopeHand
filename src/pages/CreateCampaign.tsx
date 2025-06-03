import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

const categories = [
  { id: 'education', name: 'Education' },
  { id: 'medical', name: 'Medical' },
  { id: 'environment', name: 'Environment' },
  { id: 'community', name: 'Community' },
  { id: 'technology', name: 'Technology' },
  { id: 'creative', name: 'Creative' },
  { id: 'emergency', name: 'Emergency' }
]

const CreateCampaign = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    image: '',
    category: '',
    status: 'draft' as 'draft' | 'active'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category) {
      setError('Please select a category')
      return
    }

    try {
      setError('')
      setLoading(true)

      const campaignData = {
        ...formData,
        userId: user?.uid,
        goal: Number(formData.goal),
        raised: 0,
        progress: 0,
        createdAt: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'campaigns'), campaignData)
      navigate(`/campaigns/${docRef.id}`)
    } catch (err) {
      setError('Failed to create campaign')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create a Campaign</h1>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Campaign Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="input-field mt-1"
            placeholder="Enter campaign title"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="input-field mt-1"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="input-field mt-1"
            placeholder="Describe your campaign"
          />
        </div>

        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-gray-700">
            Funding Goal ($)
          </label>
          <input
            type="number"
            id="goal"
            name="goal"
            required
            min="1"
            value={formData.goal}
            onChange={handleChange}
            className="input-field mt-1"
            placeholder="Enter funding goal"
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Campaign Image URL
          </label>
          <input
            type="url"
            id="image"
            name="image"
            required
            value={formData.image}
            onChange={handleChange}
            className="input-field mt-1"
            placeholder="Enter image URL"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Campaign Status
          </label>
          <select
            id="status"
            name="status"
            required
            value={formData.status}
            onChange={handleChange}
            className="input-field mt-1"
          >
            <option value="draft">Save as Draft</option>
            <option value="active">Publish Now</option>
          </select>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateCampaign 