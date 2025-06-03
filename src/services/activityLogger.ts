import { addDoc, collection } from 'firebase/firestore'
import { db } from '../config/firebase'
import { UserRole } from '../types/auth'

interface LogActivity {
  action: string
  performedBy: {
    id: string
    name: string
    role: UserRole
  }
  targetType: 'campaign' | 'user' | 'donation' | 'comment' | 'system'
  targetId: string
  targetName: string
  details: string
  severity: 'info' | 'warning' | 'critical'
  success: boolean
}

// Cache IP address to avoid multiple API calls
let cachedIpAddress: string | undefined

const getIpAddress = async (): Promise<string | undefined> => {
  if (cachedIpAddress) return cachedIpAddress

  try {
    const response = await fetch('https://api.ipify.org?format=json')
    if (!response.ok) throw new Error('Failed to fetch IP address')
    
    const data = await response.json()
    cachedIpAddress = data.ip
    return cachedIpAddress
  } catch (error) {
    console.warn('Failed to fetch IP address:', error)
    return undefined
  }
}

export const logActivity = async (data: LogActivity) => {
  try {
    const activityData = {
      ...data,
      timestamp: new Date().toISOString(),
      ipAddress: await getIpAddress()
    }

    await addDoc(collection(db, 'activityLogs'), activityData)
  } catch (error) {
    console.error('Error logging activity:', error instanceof Error ? error.message : 'Unknown error')
    // Rethrow the error if it's critical and needs to be handled by the caller
    if (data.severity === 'critical') {
      throw error
    }
  }
}

// Predefined logging functions for common actions
export const logUserAction = async (
  action: string,
  performer: { id: string; name: string; role: UserRole },
  targetUser: { id: string; name: string },
  details: string,
  success: boolean = true,
  severity: 'info' | 'warning' | 'critical' = 'info'
) => {
  await logActivity({
    action,
    performedBy: performer,
    targetType: 'user',
    targetId: targetUser.id,
    targetName: targetUser.name,
    details,
    severity,
    success
  })
}

export const logCampaignAction = async (
  action: string,
  performer: { id: string; name: string; role: UserRole },
  campaign: { id: string; title: string },
  details: string,
  success: boolean = true,
  severity: 'info' | 'warning' | 'critical' = 'info'
) => {
  await logActivity({
    action,
    performedBy: performer,
    targetType: 'campaign',
    targetId: campaign.id,
    targetName: campaign.title,
    details,
    severity,
    success
  })
}

export const logDonationAction = async (
  action: string,
  performer: { id: string; name: string; role: UserRole },
  donation: { id: string; amount: number; campaign: string },
  details: string,
  success: boolean = true,
  severity: 'info' | 'warning' | 'critical' = 'info'
) => {
  await logActivity({
    action,
    performedBy: performer,
    targetType: 'donation',
    targetId: donation.id,
    targetName: `${donation.amount} for ${donation.campaign}`,
    details,
    severity,
    success
  })
}

export const logCommentAction = async (
  action: string,
  performer: { id: string; name: string; role: UserRole },
  comment: { id: string; text: string },
  details: string,
  success: boolean = true,
  severity: 'info' | 'warning' | 'critical' = 'info'
) => {
  await logActivity({
    action,
    performedBy: performer,
    targetType: 'comment',
    targetId: comment.id,
    targetName: comment.text.substring(0, 50) + (comment.text.length > 50 ? '...' : ''),
    details,
    severity,
    success
  })
}

export const logSystemAction = async (
  action: string,
  performer: { id: string; name: string; role: UserRole },
  details: string,
  success: boolean = true,
  severity: 'info' | 'warning' | 'critical' = 'info'
) => {
  await logActivity({
    action,
    performedBy: performer,
    targetType: 'system',
    targetId: 'system',
    targetName: 'System',
    details,
    severity,
    success
  })
} 