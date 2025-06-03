import { db } from '../config/firebase'
import { collection, addDoc, doc, getDoc, getDocs, query, where, orderBy, updateDoc } from 'firebase/firestore'
import { logDonationAction } from './activityLogger'
import notificationService from './notificationService'
import { UserRole } from '../types/auth'
import campaignService from './campaignService'

export interface Donation {
  id: string
  amount: number
  campaignId: string
  campaignTitle: string
  donorId: string
  donorName: string
  message?: string
  anonymous: boolean
  status: 'pending' | 'completed' | 'failed'
  createdAt: Date
}

class DonationService {
  // Create a new donation
  async createDonation(donation: Omit<Donation, 'id' | 'status' | 'createdAt'>): Promise<string> {
    try {
      const donationData = {
        ...donation,
        status: 'pending',
        createdAt: new Date()
      }

      const docRef = await addDoc(collection(db, 'donations'), donationData)

      await logDonationAction(
        'create',
        { id: donation.donorId, name: donation.donorName, role: 'user' as UserRole },
        { id: docRef.id, amount: donation.amount, campaign: donation.campaignTitle },
        'Donation created successfully'
      )

      // Get campaign creator ID
      const campaign = await campaignService.getCampaign(donation.campaignId)
      if (campaign) {
        // Notify campaign creator about new donation
        await notificationService.notifyNewDonation(campaign.creatorId, {
          amount: donation.amount,
          campaignId: donation.campaignId,
          campaignTitle: donation.campaignTitle,
          donorName: donation.anonymous ? 'Anonymous' : donation.donorName
        })
      }

      return docRef.id
    } catch (error) {
      console.error('Failed to create donation:', error)
      throw error
    }
  }

  // Complete a donation
  async completeDonation(donationId: string): Promise<void> {
    try {
      const donationRef = doc(db, 'donations', donationId)
      const donationDoc = await getDoc(donationRef)

      if (!donationDoc.exists()) {
        throw new Error('Donation not found')
      }

      const donation = donationDoc.data() as Donation
      const campaign = await campaignService.getCampaign(donation.campaignId)

      if (!campaign) {
        throw new Error('Campaign not found')
      }

      // Update donation status
      await updateDoc(donationRef, {
        status: 'completed'
      })

      // Update campaign amount
      await campaignService.updateCampaign(
        donation.campaignId,
        { currentAmount: campaign.currentAmount + donation.amount },
        'system',
        'Payment System'
      )

      await logDonationAction(
        'complete',
        { id: donation.donorId, name: donation.donorName, role: 'user' as UserRole },
        { id: donationId, amount: donation.amount, campaign: donation.campaignTitle },
        'Donation completed successfully'
      )
    } catch (error) {
      console.error('Failed to complete donation:', error)
      throw error
    }
  }

  // Get a donation by ID
  async getDonation(donationId: string): Promise<Donation | null> {
    try {
      const donationDoc = await getDoc(doc(db, 'donations', donationId))

      if (!donationDoc.exists()) {
        return null
      }

      return {
        id: donationDoc.id,
        ...donationDoc.data()
      } as Donation
    } catch (error) {
      console.error('Failed to get donation:', error)
      throw error
    }
  }

  // List donations with optional filters
  async listDonations(filters?: {
    campaignId?: string
    donorId?: string
    status?: 'pending' | 'completed' | 'failed'
  }): Promise<Donation[]> {
    try {
      let q = query(collection(db, 'donations'), orderBy('createdAt', 'desc'))

      if (filters?.campaignId) {
        q = query(q, where('campaignId', '==', filters.campaignId))
      }

      if (filters?.donorId) {
        q = query(q, where('donorId', '==', filters.donorId))
      }

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Donation[]
    } catch (error) {
      console.error('Failed to list donations:', error)
      throw error
    }
  }

  // Get campaign statistics
  async getCampaignStats(campaignId: string): Promise<{
    totalDonations: number
    totalAmount: number
    uniqueDonors: number
  }> {
    try {
      const donations = await this.listDonations({
        campaignId,
        status: 'completed'
      })

      const uniqueDonorIds = new Set(donations.map(d => d.donorId))

      return {
        totalDonations: donations.length,
        totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
        uniqueDonors: uniqueDonorIds.size
      }
    } catch (error) {
      console.error('Failed to get campaign stats:', error)
      throw error
    }
  }
}

// Create singleton instance
const donationService = new DonationService()

export default donationService 