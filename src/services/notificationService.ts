import { db } from '../config/firebase'
import { collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc, Timestamp, getDocs } from 'firebase/firestore'
import { logSystemAction } from './activityLogger'

export interface Notification {
  id?: string
  type: 'donation' | 'campaign' | 'user' | 'system'
  title: string
  message: string
  recipientId: string
  read: boolean
  createdAt: Timestamp
  data?: Record<string, any>
  priority: 'low' | 'medium' | 'high'
  link?: string
}

class NotificationService {
  private listeners: Map<string, () => void> = new Map()

  // Create a new notification
  async createNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<string> {
    try {
      const notificationData = {
        ...notification,
        read: false,
        createdAt: Timestamp.now()
      }

      const docRef = await addDoc(collection(db, 'notifications'), notificationData)

      await logSystemAction(
        'notification',
        { id: notification.recipientId, name: 'System', role: 'system' },
        `Created ${notification.type} notification: ${notification.title}`,
        true,
        'info'
      )

      return docRef.id
    } catch (error) {
      console.error('Failed to create notification:', error)
      throw error
    }
  }

  // Subscribe to notifications for a user
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[]
      callback(notifications)
    })

    this.listeners.set(userId, unsubscribe)
    return unsubscribe
  }

  // Mark a notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId)
      await updateDoc(notificationRef, {
        read: true
      })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        where('read', '==', false)
      )

      const snapshot = await getDocs(q)
      const updatePromises = snapshot.docs.map(doc =>
        updateDoc(doc.ref, { read: true })
      )

      await Promise.all(updatePromises)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  }

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        where('read', '==', false)
      )

      const snapshot = await getDocs(q)
      return snapshot.size
    } catch (error) {
      console.error('Failed to get unread count:', error)
      throw error
    }
  }

  // Create donation notification
  async notifyNewDonation(recipientId: string, data: {
    amount: number
    campaignId: string
    campaignTitle: string
    donorName: string
  }): Promise<void> {
    await this.createNotification({
      type: 'donation',
      title: 'New Donation Received',
      message: `${data.donorName} donated $${data.amount} to "${data.campaignTitle}"`,
      recipientId,
      priority: 'high',
      data,
      link: `/campaigns/${data.campaignId}`
    })
  }

  // Create campaign notification
  async notifyNewCampaign(recipientId: string, data: {
    campaignId: string
    campaignTitle: string
    creatorName: string
  }): Promise<void> {
    await this.createNotification({
      type: 'campaign',
      title: 'New Campaign Created',
      message: `${data.creatorName} created a new campaign: "${data.campaignTitle}"`,
      recipientId,
      priority: 'medium',
      data,
      link: `/campaigns/${data.campaignId}`
    })
  }

  // Create new user notification
  async notifyNewUser(recipientId: string, data: {
    userId: string
    userName: string
    userRole: string
  }): Promise<void> {
    await this.createNotification({
      type: 'user',
      title: 'New User Registration',
      message: `${data.userName} joined as a ${data.userRole}`,
      recipientId,
      priority: 'medium',
      data,
      link: '/admin/users'
    })
  }

  // Clean up listeners
  cleanup(): void {
    this.listeners.forEach(unsubscribe => unsubscribe())
    this.listeners.clear()
  }
}

// Create singleton instance
const notificationService = new NotificationService()

export default notificationService 