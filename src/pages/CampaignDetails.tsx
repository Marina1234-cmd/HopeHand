import React from 'react'
import { useParams } from 'react-router-dom'
import DonationForm from '../components/DonationForm'

interface CampaignUpdate {
  id: number;
  date: string;
  content: string;
  image?: string;
}

interface Donor {
  id: number;
  name: string;
  amount: number;
  date: string;
}

interface Campaign {
  id: number;
  title: string;
  description: string;
  raised: number;
  goal: number;
  image: string;
  progress: number;
  creator: string;
  createdAt: string;
  endDate: string;
  gallery: string[];
  updates: CampaignUpdate[];
  donors: Donor[];
}

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  // Placeholder data - in a real app, this would be fetched from an API
  const campaign: Campaign = {
    id: 1,
    title: "Help Build a Community Garden",
    description: "We're on a mission to create a sustainable community garden that will provide fresh, organic produce to local families in need. This garden will not only serve as a source of nutritious food but also as an educational space where children and adults can learn about sustainable farming practices.",
    raised: 15000,
    goal: 25000,
    image: "/images/garden.jpg",
    progress: 60,
    creator: "Jane Smith",
    createdAt: "2024-02-01",
    endDate: "2024-04-01",
    gallery: [
      "/images/garden-1.jpg",
      "/images/garden-2.jpg",
      "/images/garden-3.jpg"
    ],
    updates: [
      {
        id: 1,
        date: "2024-02-15",
        content: "We've secured the land and are beginning preparations for spring planting!",
        image: "/images/garden-update.jpg"
      }
    ],
    donors: [
      {
        id: 1,
        name: "John Doe",
        amount: 500,
        date: "2024-02-10"
      }
    ]
  }

  const handleDonate = (amount: number, message: string) => {
    // In a real app, this would make an API call to process the donation
    console.log('Processing donation:', { amount, message })
    // You would typically:
    // 1. Process payment
    // 2. Update campaign stats
    // 3. Add donor to the list
    // 4. Show success message
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content - takes up 2 columns */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-96 bg-gray-200 relative overflow-hidden">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-full object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  const target = e.currentTarget;
                  target.src = '/images/placeholder.jpg';
                }}
              />
            </div>
            
            <div className="p-8">
              <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
              
              <div className="flex items-center text-gray-600 mb-6">
                <span>Created by {campaign.creator} on {campaign.createdAt}</span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="h-full bg-primary-600 rounded-full" 
                    style={{ width: `${campaign.progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-lg">
                  <div>
                    <span className="font-bold">${campaign.raised.toLocaleString()}</span>
                    <span className="text-gray-600"> raised of ${campaign.goal.toLocaleString()}</span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-bold">{campaign.progress}%</span> funded
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-2xl font-semibold mb-4">About this campaign</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {campaign.description}
                </p>
              </div>

              {/* Campaign Gallery */}
              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6">Campaign Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {campaign.gallery.map((image, index) => (
                    <div key={index} className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${campaign.title} gallery image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          const target = e.currentTarget;
                          target.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6">Updates</h2>
                {campaign.updates.map(update => (
                  <div key={update.id} className="bg-gray-50 rounded-lg p-6 mb-4">
                    <div className="text-gray-600 mb-2">{update.date}</div>
                    {update.image && (
                      <div className="mb-4 aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={update.image}
                          alt={`Update from ${update.date}`}
                          className="w-full h-full object-cover"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            const target = e.currentTarget;
                            target.src = '/images/placeholder.jpg';
                          }}
                        />
                      </div>
                    )}
                    <p>{update.content}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6">Recent Donors</h2>
                {campaign.donors.map(donor => (
                  <div key={donor.id} className="flex justify-between items-center py-4 border-b">
                    <div>
                      <div className="font-semibold">{donor.name}</div>
                      <div className="text-gray-600">{donor.date}</div>
                    </div>
                    <div className="font-bold">${donor.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Donation form - takes up 1 column */}
        <div className="md:col-span-1">
          <div className="sticky top-8">
            <DonationForm
              campaignTitle={campaign.title}
              onDonate={handleDonate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignDetails 