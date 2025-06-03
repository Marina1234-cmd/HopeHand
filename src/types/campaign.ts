export interface Campaign {
  id: string
  title: string
  description: string
  goal: number
  amountRaised: number
  createdBy: string
  creatorName: string
  createdAt: string
  imageUrl: string
  category: CampaignCategory
  story: string
  updates: Update[]
  donations: Donation[]
  status: 'active' | 'completed' | 'suspended'
}

export type CampaignCategory = 
  | 'medical'
  | 'emergency'
  | 'memorial'
  | 'education'
  | 'nonprofit'
  | 'animals'
  | 'community'
  | 'business'
  | 'other'

export interface Update {
  id: string
  campaignId: string
  content: string
  createdAt: string
  createdBy: string
}

export interface Donation {
  id: string
  campaignId: string
  amount: number
  donorId: string
  donorName: string
  message?: string
  createdAt: string
  isAnonymous: boolean
} 