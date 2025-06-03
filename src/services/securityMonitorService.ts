import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import { auth, db } from '../config/firebase'
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { logSystemAction } from './activityLogger'
import notificationService from './notificationService'
import auditService from './auditService'

interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit' | 'invalid_token' | 'suspicious_activity' | 'brute_force'
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: {
    ip: string
    userAgent: string
    location?: string
  }
  details: string
  userId?: string
  timestamp: Date
}

class SecurityMonitorService {
  private static instance: SecurityMonitorService
  private failedLoginAttempts: Map<string, { count: number; firstAttempt: Date }> = new Map()
  private readonly MAX_LOGIN_ATTEMPTS = 5
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

  constructor() {
    this.initializeSentry()
    this.initializeNewRelic()
    this.setupAuthListeners()
  }

  private initializeSentry() {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      beforeSend(event) {
        // Scrub sensitive data
        if (event.request?.headers) {
          delete event.request.headers['Authorization']
        }
        return event
      }
    })
  }

  private initializeNewRelic() {
    if (process.env.REACT_APP_NEW_RELIC_LICENSE_KEY) {
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = 'https://js-agent.newrelic.com/nr-spa-1216.min.js'
      document.head.appendChild(script)

      window.NREUM = {
        init: {
          distributed_tracing: { enabled: true },
          privacy: { cookies_enabled: true },
          ajax: { deny_list: ['https://api.ipify.org/'] }
        },
        loader_config: {
          accountID: process.env.REACT_APP_NEW_RELIC_ACCOUNT_ID,
          trustKey: process.env.REACT_APP_NEW_RELIC_TRUST_KEY,
          agentID: process.env.REACT_APP_NEW_RELIC_AGENT_ID,
          licenseKey: process.env.REACT_APP_NEW_RELIC_LICENSE_KEY,
          applicationID: process.env.REACT_APP_NEW_RELIC_APPLICATION_ID
        }
      }
    }
  }

  private setupAuthListeners() {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Reset failed attempts on successful login
        this.failedLoginAttempts.delete(user.email || '')
      }
    })
  }

  async trackSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
    try {
      const fullEvent: SecurityEvent = {
        ...event,
        timestamp: new Date()
      }

      // Log to Firestore
      await addDoc(collection(db, 'securityEvents'), fullEvent)

      // Track in Sentry
      Sentry.captureEvent({
        message: `Security Event: ${event.type}`,
        level: event.severity === 'critical' ? 'fatal' : 
               event.severity === 'high' ? 'error' :
               event.severity === 'medium' ? 'warning' : 'info',
        extra: {
          ...event,
          timestamp: fullEvent.timestamp
        }
      })

      // Log system action
      await logSystemAction(
        'security_event',
        { id: 'system', name: 'Security Monitor', role: 'system' },
        `${event.type}: ${event.details}`,
        true,
        event.severity === 'critical' || event.severity === 'high' ? 'critical' : 'warning'
      )

      // Notify admins for high severity events
      if (event.severity === 'critical' || event.severity === 'high') {
        const adminSnapshot = await getDocs(
          query(collection(db, 'users'), where('role', '==', 'admin'))
        )

        const notificationPromises = adminSnapshot.docs.map(doc =>
          notificationService.createNotification({
            type: 'system',
            title: 'Security Alert',
            message: `${event.type}: ${event.details}`,
            recipientId: doc.id,
            priority: 'high',
            data: {
              eventType: event.type,
              severity: event.severity,
              source: event.source
            }
          })
        )

        await Promise.all(notificationPromises)
      }
    } catch (error) {
      console.error('Failed to track security event:', error)
      Sentry.captureException(error)
    }
  }

  async trackFailedLogin(email: string, ip: string, userAgent: string): Promise<void> {
    const attempts = this.failedLoginAttempts.get(email) || { count: 0, firstAttempt: new Date() }
    attempts.count++

    if (attempts.count === 1) {
      attempts.firstAttempt = new Date()
    }

    this.failedLoginAttempts.set(email, attempts)

    // Check for brute force attempts
    if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
      const timeSinceFirst = Date.now() - attempts.firstAttempt.getTime()
      
      if (timeSinceFirst <= this.LOCKOUT_DURATION) {
        await this.trackSecurityEvent({
          type: 'brute_force',
          severity: 'high',
          source: { ip, userAgent },
          details: `Multiple failed login attempts detected for email: ${email}`,
          userId: undefined
        })

        // Implement account lockout
        await this.lockoutAccount(email)
      }
    }
  }

  private async lockoutAccount(email: string): Promise<void> {
    try {
      await addDoc(collection(db, 'accountLockouts'), {
        email,
        lockedAt: serverTimestamp(),
        unlockAt: new Date(Date.now() + this.LOCKOUT_DURATION)
      })

      // Notify user about account lockout
      const userSnapshot = await getDocs(
        query(collection(db, 'users'), where('email', '==', email))
      )

      if (!userSnapshot.empty) {
        const userId = userSnapshot.docs[0].id
        await notificationService.createNotification({
          type: 'system',
          title: 'Account Security Alert',
          message: 'Your account has been temporarily locked due to multiple failed login attempts',
          recipientId: userId,
          priority: 'high',
          data: {
            lockoutDuration: this.LOCKOUT_DURATION / 60000, // Convert to minutes
            unlockTime: new Date(Date.now() + this.LOCKOUT_DURATION).toISOString()
          }
        })
      }
    } catch (error) {
      console.error('Failed to lockout account:', error)
      Sentry.captureException(error)
    }
  }

  async checkSuspiciousActivity(userId: string, action: string): Promise<boolean> {
    try {
      // Get user's normal activity patterns
      const recentEvents = await getDocs(
        query(
          collection(db, 'activityLogs'),
          where('performedBy.id', '==', userId),
          where('timestamp', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
        )
      )

      const suspiciousPatterns = this.analyzeBehaviorPatterns(recentEvents.docs.map(doc => doc.data()))
      
      if (suspiciousPatterns.length > 0) {
        await this.trackSecurityEvent({
          type: 'suspicious_activity',
          severity: 'medium',
          source: {
            ip: await this.getCurrentIP(),
            userAgent: navigator.userAgent
          },
          details: `Suspicious activity detected: ${suspiciousPatterns.join(', ')}`,
          userId
        })
        return true
      }

      return false
    } catch (error) {
      console.error('Failed to check suspicious activity:', error)
      Sentry.captureException(error)
      return false
    }
  }

  private analyzeBehaviorPatterns(activities: any[]): string[] {
    const patterns: string[] = []
    
    // Check for rapid-fire actions
    const actionCounts = new Map<string, number>()
    activities.forEach(activity => {
      const count = actionCounts.get(activity.action) || 0
      actionCounts.set(activity.action, count + 1)
    })

    actionCounts.forEach((count, action) => {
      if (count > 50) { // Threshold for suspicious number of actions
        patterns.push(`High frequency of ${action} actions`)
      }
    })

    // Check for actions outside normal hours
    const unusualHours = activities.filter(activity => {
      const hour = new Date(activity.timestamp).getHours()
      return hour >= 0 && hour <= 5 // Consider activity between midnight and 5 AM suspicious
    })

    if (unusualHours.length > 5) {
      patterns.push('Unusual activity hours detected')
    }

    return patterns
  }

  private async getCurrentIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }
}

const securityMonitorService = new SecurityMonitorService()
export default securityMonitorService 