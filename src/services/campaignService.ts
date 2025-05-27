import { db } from '../config/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore'
import { logCampaignAction } from './activityLogger'
import notificationService from './notificationService'
import { UserRole } from '../types/auth'

export interface Campaign {
  id: string
  title: string
  description: string
  goal: number
  currentAmount: number
  creatorId: string
  creatorName: string
  status: 'active' | 'completed' | 'suspended'
  category: string
  imageUrl?: string
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

class CampaignService {
  // Create a new campaign
  async createCampaign(campaign: Omit<Campaign, 'id' | 'currentAmount' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const campaignData = {
        ...campaign,
        currentAmount: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, 'campaigns'), campaignData)

      await logCampaignAction(
        'create',
        { id: campaign.creatorId, name: campaign.creatorName, role: 'user' as UserRole },
        { id: docRef.id, title: campaign.title },
        'Campaign created successfully'
      )

      // Notify admins about new campaign
      const adminSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'admin'))
      )

      const notificationPromises = adminSnapshot.docs.map(doc =>
        notificationService.notifyNewCampaign(doc.id, {
          campaignId: docRef.id,
          campaignTitle: campaign.title,
          creatorName: campaign.creatorName
        })
      )

      await Promise.all(notificationPromises)

      return docRef.id
    } catch (error) {
      console.error('Failed to create campaign:', error)
      throw error
    }
  }

  // Update a campaign
  async updateCampaign(campaignId: string, updates: Partial<Campaign>, performerId: string, performerName: string): Promise<void> {
    try {
      const campaignRef = doc(db, 'campaigns', campaignId)
      const campaignDoc = await getDoc(campaignRef)

      if (!campaignDoc.exists()) {
        throw new Error('Campaign not found')
      }

      const updatedData = {
        ...updates,
        updatedAt: new Date()
      }

      await updateDoc(campaignRef, updatedData)

      await logCampaignAction(
        'update',
        { id: performerId, name: performerName, role: 'user' as UserRole },
        { id: campaignId, title: campaignDoc.data().title },
        `Campaign updated: ${Object.keys(updates).join(', ')}`
      )
    } catch (error) {
      console.error('Failed to update campaign:', error)
      throw error
    }
  }

  // Delete a campaign
  async deleteCampaign(campaignId: string, performerId: string, performerName: string): Promise<void> {
    try {
      const campaignRef = doc(db, 'campaigns', campaignId)
      const campaignDoc = await getDoc(campaignRef)

      if (!campaignDoc.exists()) {
        throw new Error('Campaign not found')
      }

      await deleteDoc(campaignRef)

      await logCampaignAction(
        'delete',
        { id: performerId, name: performerName, role: 'user' as UserRole },
        { id: campaignId, title: campaignDoc.data().title },
        'Campaign deleted successfully',
        true,
        'warning'
      )
    } catch (error) {
      console.error('Failed to delete campaign:', error)
      throw error
    }
  }

  // Get a campaign by ID
  async getCampaign(campaignId: string): Promise<Campaign | null> {
    try {
      const campaignDoc = await getDoc(doc(db, 'campaigns', campaignId))

      if (!campaignDoc.exists()) {
        return null
      }

      return {
        id: campaignDoc.id,
        ...campaignDoc.data()
      } as Campaign
    } catch (error) {
      console.error('Failed to get campaign:', error)
      throw error
    }
  }

  // List campaigns with optional filters
  async listCampaigns(filters?: {
    status?: 'active' | 'completed' | 'suspended'
    category?: string
    creatorId?: string
  }): Promise<Campaign[]> {
    try {
      let q = query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'))

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }

      if (filters?.category) {
        q = query(q, where('category', '==', filters.category))
      }

      if (filters?.creatorId) {
        q = query(q, where('creatorId', '==', filters.creatorId))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[]
    } catch (error) {
      console.error('Failed to list campaigns:', error)
      throw error
    }
  }
}

// Create singleton instance
const campaignService = new CampaignService()

export default campaignService 