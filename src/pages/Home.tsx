import React from 'react'
import CampaignHero from '../components/campaigns/CampaignHero'
import CampaignList from '../components/campaigns/CampaignList'
import { CategoryCircles } from '../components/categories/CategoryCircles'
import CrowdfundingTips from '../components/tips/CrowdfundingTips'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CampaignHero />
      
      {/* Category Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CategoryCircles />
      </div>

      {/* Featured Campaigns */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Featured Campaigns
          </h2>
          <CampaignList featured={true} />
        </div>
      </div>

      {/* Crowdfunding Tips */}
      <CrowdfundingTips />

      {/* Recent Campaigns */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Recent Campaigns
          </h2>
          <CampaignList />
        </div>
      </div>
    </div>
  )
} 