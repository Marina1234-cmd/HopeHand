import { auth } from '../config/firebase'
import { logSystemAction } from './activityLogger'
import { User } from 'firebase/auth'

interface SessionConfig {
  adminTimeoutMs: number // Timeout for admin sessions
  userTimeoutMs: number // Timeout for regular user sessions
  warningBeforeMs: number // Show warning before timeout
  checkIntervalMs: number // How often to check for inactive sessions
  maxRetries: number
  retryDelayMs: number
}

const defaultConfig: SessionConfig = {
  adminTimeoutMs: 30 * 60 * 1000, // 30 minutes for admins
  userTimeoutMs: 2 * 60 * 60 * 1000, // 2 hours for regular users
  warningBeforeMs: 5 * 60 * 1000, // Warning 5 minutes before timeout
  checkIntervalMs: 60 * 1000, // Check every minute
  maxRetries: 3, // Maximum number of retries for operations
  retryDelayMs: 1000 // Delay between retries
}

class SessionManager {
  private config: SessionConfig
  private lastActivity: Map<string, number>
  private warningShown: Map<string, boolean>
  private checkInterval: NodeJS.Timeout | null
  private subscribers: Map<string, (event: 'warning' | 'timeout') => void>
  private _boundUpdateActivity: (() => void) | null
  private isDestroyed: boolean
  private _isInitialized: boolean

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.lastActivity = new Map()
    this.warningShown = new Map()
    this.subscribers = new Map()
    this.checkInterval = null
    this._boundUpdateActivity = null
    this.isDestroyed = false
    this._isInitialized = false
  }

  public get isInitialized(): boolean {
    return this._isInitialized
  }

  private async retry<T>(operation: () => Promise<T>, retries = this.config.maxRetries): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelayMs))
        return this.retry(operation, retries - 1)
      }
      throw error
    }
  }

  public init(): void {
    if (this.isDestroyed || this._isInitialized) {
      console.warn('Session manager is already initialized or has been destroyed')
      return
    }

    // Start the inactivity checker
    this.checkInterval = setInterval(() => {
      this.checkInactiveSessions().catch(error => {
        console.error('Error checking inactive sessions:', error)
      })
    }, this.config.checkIntervalMs)

    // Add activity listeners
    if (typeof window !== 'undefined') {
      const boundUpdateActivity = this.updateActivity.bind(this)
      const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll']
      activityEvents.forEach(event => {
        window.addEventListener(event, boundUpdateActivity, { passive: true })
      })

      // Store bound function for cleanup
      this._boundUpdateActivity = boundUpdateActivity
    }

    this._isInitialized = true
  }

  // Update last activity timestamp for current user
  public updateActivity(): void {
    if (this.isDestroyed) return

    const user = auth.currentUser
    if (user) {
      this.lastActivity.set(user.uid, Date.now())
      this.warningShown.set(user.uid, false)
    }
  }

  // Subscribe to session events for a user
  public subscribe(userId: string, callback: (event: 'warning' | 'timeout') => void): () => void {
    if (this.isDestroyed) {
      console.warn('Attempting to subscribe to destroyed session manager')
      return () => {}
    }

    this.subscribers.set(userId, callback)
    return () => {
      if (!this.isDestroyed) {
        this.subscribers.delete(userId)
      }
    }
  }

  // Check for inactive sessions
  private async checkInactiveSessions(): Promise<void> {
    if (this.isDestroyed) return

    const now = Date.now()
    const user = auth.currentUser

    if (!user) return

    const lastActivity = this.lastActivity.get(user.uid) || now
    const isAdmin = user.email?.endsWith('@admin.hopehand.org') || false
    const timeout = isAdmin ? this.config.adminTimeoutMs : this.config.userTimeoutMs

    // Calculate time until timeout
    const timeSinceActivity = now - lastActivity
    const timeUntilTimeout = timeout - timeSinceActivity

    // Check if warning should be shown
    if (timeUntilTimeout <= this.config.warningBeforeMs && !this.warningShown.get(user.uid)) {
      this.warningShown.set(user.uid, true)
      this.notifySubscriber(user.uid, 'warning')

      // Log warning event
      await this.retry(() => 
        logSystemAction(
          'session',
          { id: user.uid, name: user.displayName || 'Unknown User', role: isAdmin ? 'admin' : 'user' },
          `Session timeout warning for ${isAdmin ? 'admin' : 'user'}`,
          true,
          'warning'
        )
      )
    }

    // Check if session should be terminated
    if (timeSinceActivity >= timeout) {
      this.notifySubscriber(user.uid, 'timeout')
      await this.terminateSession(user)
    }
  }

  // Terminate user session
  private async terminateSession(user: User): Promise<void> {
    if (this.isDestroyed) return

    try {
      const isAdmin = user.email?.endsWith('@admin.hopehand.org') || false

      // Log session termination
      await this.retry(() =>
        logSystemAction(
          'session',
          { id: user.uid, name: user.displayName || 'Unknown User', role: isAdmin ? 'admin' : 'user' },
          `Session automatically terminated due to inactivity`,
          true,
          'warning'
        )
      )

      // Sign out user
      await this.retry(() => auth.signOut())

      // Clean up session data
      this.lastActivity.delete(user.uid)
      this.warningShown.delete(user.uid)
    } catch (error) {
      console.error('Failed to terminate session:', error)
      
      await this.retry(() =>
        logSystemAction(
          'session',
          { id: user.uid, name: user.displayName || 'Unknown User', role: 'admin' },
          `Failed to terminate session: ${error instanceof Error ? error.message : 'Unknown error'}`,
          false,
          'critical'
        )
      )
    }
  }

  // Notify subscriber of session events
  private notifySubscriber(userId: string, event: 'warning' | 'timeout'): void {
    if (this.isDestroyed) return

    const callback = this.subscribers.get(userId)
    if (callback) {
      try {
        callback(event)
      } catch (error) {
        console.error(`Error notifying subscriber for user ${userId}:`, error)
      }
    }
  }

  public destroy(): void {
    if (!this._isInitialized) return

    this.isDestroyed = true
    this._isInitialized = false

    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }

    if (typeof window !== 'undefined' && this._boundUpdateActivity) {
      const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll']
      activityEvents.forEach(event => {
        window.removeEventListener(event, this._boundUpdateActivity as EventListener)
      })
      this._boundUpdateActivity = null
    }

    this.lastActivity.clear()
    this.warningShown.clear()
    this.subscribers.clear()
  }
}

// Create singleton instance
const sessionManager = new SessionManager()

export default sessionManager 