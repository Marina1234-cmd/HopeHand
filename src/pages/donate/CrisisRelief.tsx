import React from 'react'
import { Link } from 'react-router-dom'

const emergencyCampaigns = [
  {
    id: 1,
    title: "Emergency Disaster Relief Fund",
    description: "Supporting communities affected by natural disasters with immediate aid and resources.",
    amountRaised: 250000,
    targetAmount: 500000,
    imageUrl: "https://images.unsplash.com/photo-1523485765843-7553353a65b9?auto=format&fit=crop",
    daysLeft: 15
  },
  {
    id: 2,
    title: "Urgent Medical Support",
    description: "Providing critical medical supplies and support to areas in crisis.",
    amountRaised: 75000,
    targetAmount: 100000,
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop",
    daysLeft: 7
  }
]

export default function CrisisRelief() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Crisis Relief
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Support immediate relief efforts and help communities recover from emergencies.
            Your donation can make a real difference in times of crisis.
          </p>
        </div>

        {/* Featured Emergency */}
        <div className="bg-red-50 rounded-xl p-8 mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Urgent Need
              </span>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                Emergency Response Fund
              </h2>
              <p className="mt-2 text-gray-600">
                A dedicated fund to provide immediate assistance during crises.
                100% of donations go directly to emergency relief efforts.
              </p>
              <div className="mt-6">
                <Link
                  to="/donate/emergency-fund"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700"
                >
                  Donate Now
                </Link>
              </div>
            </div>
            <div className="flex-1">
              <img
                src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop"
                alt="Emergency Response"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Active Emergency Campaigns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {emergencyCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {campaign.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {campaign.description}
                  </p>
                  <div className="mb-4">
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                        <div
                          style={{
                            width: `${(campaign.amountRaised / campaign.targetAmount) * 100}%`
                          }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${campaign.amountRaised.toLocaleString()} raised</span>
                      <span>${campaign.targetAmount.toLocaleString()} goal</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {campaign.daysLeft} days left
                    </span>
                    <Link
                      to={`/campaign/${campaign.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700"
                    >
                      Donate Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            How Crisis Relief Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Immediate Response
              </h3>
              <p className="text-gray-600">
                Funds are immediately available to verified relief organizations working on the ground.
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">💯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                100% Goes to Relief
              </h3>
              <p className="text-gray-600">
                Every dollar you donate goes directly to emergency relief efforts.
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Transparent Reporting
              </h3>
              <p className="text-gray-600">
                Regular updates on how your donation is making an impact.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 