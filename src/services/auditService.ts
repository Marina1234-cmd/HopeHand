import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { logActivity } from './activityLogger'
import notificationService from './notificationService'
import emailService from './emailService'
import { UserRole } from '../types/auth'

interface AuditConfig {
  emailAlerts: boolean
  notificationAlerts: boolean
  criticalActions: string[]
  adminEmails: string[]
}

class AuditService {
  private config: AuditConfig = {
    emailAlerts: true,
    notificationAlerts: true,
    criticalActions: [
      'delete_campaign',
      'update_role',
      'verify_volunteer',
      'update_settings',
      'block_user',
      'bulk_delete',
      'payment_settings',
      'api_key_change'
    ],
    adminEmails: []
  }

  private listeners: Map<string, () => void> = new Map()

  constructor() {
    this.initializeAdminEmails()
  }

  private async initializeAdminEmails() {
    try {
      const adminSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'admin'))
      )
      this.config.adminEmails = adminSnapshot.docs
        .map(doc => doc.data().email)
        .filter((email): email is string => typeof email === 'string')
    } catch (error) {
      console.error('Failed to initialize admin emails:', error)
    }
  }

  // Start monitoring critical actions
  startMonitoring(): void {
    const q = query(
      collection(db, 'activityLogs'),
      where('severity', '==', 'critical')
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const activity = change.doc.data()
          await this.handleCriticalAction(activity)
        }
      })
    })

    this.listeners.set('criticalActions', unsubscribe)
  }

  // Stop monitoring
  stopMonitoring(): void {
    this.listeners.forEach(unsubscribe => unsubscribe())
    this.listeners.clear()
  }

  // Handle critical action
  private async handleCriticalAction(activity: any): Promise<void> {
    const isCriticalAction = this.config.criticalActions.includes(activity.action)
    
    if (isCriticalAction) {
      // Send notifications to all admins
      if (this.config.notificationAlerts) {
        const adminSnapshot = await getDocs(
          query(collection(db, 'users'), where('role', '==', 'admin'))
        )

        const notificationPromises = adminSnapshot.docs.map(doc =>
          notificationService.createNotification({
            type: 'system',
            title: 'Critical Action Alert',
            message: `${activity.performedBy.name} performed ${activity.action} on ${activity.targetName}`,
            recipientId: doc.id,
            priority: 'high',
            data: {
              action: activity.action,
              performer: activity.performedBy,
              target: {
                type: activity.targetType,
                id: activity.targetId,
                name: activity.targetName
              }
            }
          })
        )

        await Promise.all(notificationPromises)
      }

      // Send email alerts to admin emails
      if (this.config.emailAlerts) {
        const emailPromises = this.config.adminEmails.map(email =>
          emailService.sendCriticalActionAlert(
            email,
            activity.action,
            activity.performedBy,
            activity.details
          )
        )

        await Promise.all(emailPromises)
      }
    }
  }

  // Log and monitor settings change
  async auditSettingsChange(
    setting: string,
    oldValue: string,
    newValue: string,
    performer: { id: string; name: string; role: UserRole }
  ): Promise<void> {
    // Log the activity
    await logActivity({
      action: 'update_settings',
      performedBy: performer,
      targetType: 'system',
      targetId: 'settings',
      targetName: setting,
      details: `Changed ${setting} from "${oldValue}" to "${newValue}"`,
      severity: 'critical',
      success: true
    })

    // Send email alerts for settings changes
    if (this.config.emailAlerts) {
      const emailPromises = this.config.adminEmails.map(email =>
        emailService.sendSettingsChangeAlert(
          email,
          setting,
          oldValue,
          newValue,
          performer
        )
      )

      await Promise.all(emailPromises)
    }
  }

  // Update audit configuration
  async updateConfig(newConfig: Partial<AuditConfig>): Promise<void> {
    this.config = {
      ...this.config,
      ...newConfig
    }
  }
}

const auditService = new AuditService()
export default auditService 