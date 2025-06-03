export interface Campaign {
  id: string
  title: string
  description: string
  imageUrl: string
  amountRaised: number
  targetAmount: number
  daysLeft: number
  featured?: boolean
  location: string
  owner: {
    name: string
    avatarUrl: string
  }
  category: {
    id: string
    name: string
  }
  donationsCount: number
  lastUpdated: string
  story: string
  updates: Array<{
    id: string
    date: string
    content: string
    author: string
  }>
  donations: Array<{
    id: string
    amount: number
    name: string
    date: string
    message?: string
    isAnonymous: boolean
  }>
  tags: string[]
  status: 'active' | 'completed' | 'suspended'
  socialShares: {
    facebook: number
    twitter: number
    email: number
  }
  organizer: {
    id: string
    name: string
    avatarUrl: string
    location: string
    campaignsCount: number
    joinedDate: string
    isVerified: boolean
  }
  beneficiary?: {
    name: string
    relationship: string
    location: string
  }
  team?: Array<{
    id: string
    name: string
    role: string
    avatarUrl: string
  }>
}

export interface CampaignListFilters {
  category?: string
  location?: string
  sortBy?: 'recent' | 'mostFunded' | 'trending' | 'endingSoon'
  status?: Campaign['status']
  lastDoc?: any
}

export interface CampaignListResponse {
  campaigns: Campaign[]
  lastDoc: any
} 