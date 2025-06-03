import { db } from '../config/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter, DocumentSnapshot, serverTimestamp, DocumentData } from 'firebase/firestore'
import { logCampaignAction } from './activityLogger'
import notificationService from './notificationService'
import { UserRole } from '../types/auth'
import type { Donation, Update } from '../types/campaign'

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

interface ListCampaignsResponse {
  campaigns: Campaign[]
  lastDoc: DocumentSnapshot<DocumentData> | undefined
}

const CAMPAIGNS_COLLECTION = 'campaigns'
const DONATIONS_COLLECTION = 'donations'
const UPDATES_COLLECTION = 'updates'
const PAGE_SIZE = 12

class CampaignService {
  // Create a new campaign
  async createCampaign(campaignData: {
    title: string
    description: string
    goal: number
    creatorId: string
    creatorName: string
    category: string
    imageUrl?: string
    endDate: Date
  }): Promise<string> {
    try {
      const campaign = {
        ...campaignData,
        currentAmount: 0,
        status: 'active' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, CAMPAIGNS_COLLECTION), campaign)

      await logCampaignAction(
        'create',
        { id: campaignData.creatorId, name: campaignData.creatorName, role: 'user' as UserRole },
        { id: docRef.id, title: campaignData.title },
        'Campaign created successfully'
      )

      // Notify admins about new campaign
      const adminSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'admin'))
      )

      const notificationPromises = adminSnapshot.docs.map(doc =>
        notificationService.notifyNewCampaign(doc.id, {
          campaignId: docRef.id,
          campaignTitle: campaignData.title,
          creatorName: campaignData.creatorName
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
      const campaignRef = doc(db, CAMPAIGNS_COLLECTION, campaignId)
      const campaignDoc = await getDoc(campaignRef)

      if (!campaignDoc.exists()) {
        throw new Error('Campaign not found')
      }

      const updatedData = {
        ...updates,
        updatedAt: serverTimestamp()
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
      const campaignRef = doc(db, CAMPAIGNS_COLLECTION, campaignId)
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
      const campaignDoc = await getDoc(doc(db, CAMPAIGNS_COLLECTION, campaignId))

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
  async listCampaigns(category?: string, lastDoc?: DocumentSnapshot): Promise<ListCampaignsResponse> {
    try {
      let q = query(
        collection(db, CAMPAIGNS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      )

      if (category) {
        q = query(q, where('category', '==', category))
      }

      if (lastDoc) {
        q = query(q, startAfter(lastDoc))
      }

      const querySnapshot = await getDocs(q)
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]

      return {
        campaigns: querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Campaign[],
        lastDoc: lastVisible
      }
    } catch (error) {
      console.error('Failed to list campaigns:', error)
      throw error
    }
  }

  async addDonation(donation: Omit<Donation, 'id' | 'createdAt'>): Promise<string> {
    const donationData = {
      ...donation,
      createdAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, DONATIONS_COLLECTION), donationData)

    // Update campaign amount raised
    const campaignRef = doc(db, CAMPAIGNS_COLLECTION, donation.campaignId)
    const campaignSnap = await getDoc(campaignRef)
    if (campaignSnap.exists()) {
      const currentAmount = campaignSnap.data().amountRaised || 0
      await updateDoc(campaignRef, {
        amountRaised: currentAmount + donation.amount
      })
    }

    return docRef.id
  }

  async addUpdate(update: Omit<Update, 'id' | 'createdAt'>): Promise<string> {
    const updateData = {
      ...update,
      createdAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, UPDATES_COLLECTION), updateData)
    return docRef.id
  }

  async getCampaignDonations(campaignId: string): Promise<Donation[]> {
    const q = query(
      collection(db, DONATIONS_COLLECTION),
      where('campaignId', '==', campaignId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Donation[]
  }

  async getCampaignUpdates(campaignId: string): Promise<Update[]> {
    const q = query(
      collection(db, UPDATES_COLLECTION),
      where('campaignId', '==', campaignId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Update[]
  }
}

// Create and export singleton instance
export const campaignService = new CampaignService() 