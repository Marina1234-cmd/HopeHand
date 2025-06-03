import { auth, db } from '../config/firebase'
import { 
  sendPasswordResetEmail, 
  confirmPasswordReset,
  verifyPasswordResetCode
} from 'firebase/auth'
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { logSystemAction } from './activityLogger'
import securityMonitorService from './securityMonitorService'
import emailService from './emailService'

interface RecoveryAttempt {
  userId: string
  email: string
  phone?: string
  method: 'email' | 'sms'
  token: string
  expiresAt: Date
  attempts: number
  status: 'pending' | 'completed' | 'expired' | 'blocked'
  ipAddress: string
  userAgent: string
}

class AccountRecoveryService {
  private readonly TOKEN_EXPIRY = 30 * 60 * 1000 // 30 minutes
  private readonly MAX_ATTEMPTS = 3
  private readonly COOLDOWN_PERIOD = 24 * 60 * 60 * 1000 // 24 hours

  async initiateRecovery(email: string, method: 'email' | 'sms' = 'email'): Promise<void> {
    try {
      // Check for existing recovery attempts
      await this.checkExistingAttempts(email)

      // Get user data
      const userSnapshot = await getDocs(
        query(collection(db, 'users'), where('email', '==', email))
      )

      if (userSnapshot.empty) {
        throw new Error('No account found with this email')
      }

      const userData = userSnapshot.docs[0].data()
      const userId = userSnapshot.docs[0].id

      // Create recovery token
      const token = await this.generateSecureToken()
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY)

      // Get client info
      const ipAddress = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)

      // Store recovery attempt
      const recoveryAttempt: RecoveryAttempt = {
        userId,
        email,
        phone: userData.phone,
        method,
        token,
        expiresAt,
        attempts: 0,
        status: 'pending',
        ipAddress,
        userAgent: navigator.userAgent
      }

      await addDoc(collection(db, 'recoveryAttempts'), {
        ...recoveryAttempt,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt)
      })

      // Send recovery instructions
      if (method === 'email') {
        await this.sendRecoveryEmail(email, token)
      } else if (method === 'sms' && userData.phone) {
        await this.sendRecoverySMS(userData.phone, token)
      } else {
        throw new Error('Invalid recovery method or missing phone number')
      }

      // Log recovery attempt
      await this.logRecoveryAttempt(userId, email, method, 'initiated')

    } catch (error) {
      console.error('Recovery initiation failed:', error)
      throw error
    }
  }

  async verifyRecoveryToken(email: string, token: string): Promise<boolean> {
    try {
      const recoverySnapshot = await getDocs(
        query(
          collection(db, 'recoveryAttempts'),
          where('email', '==', email),
          where('token', '==', token),
          where('status', '==', 'pending')
        )
      )

      if (recoverySnapshot.empty) {
        throw new Error('Invalid or expired recovery token')
      }

      const recovery = recoverySnapshot.docs[0].data() as RecoveryAttempt
      const recoveryRef = recoverySnapshot.docs[0].ref

      // Check if token is expired
      if (recovery.expiresAt.getTime() < Date.now()) {
        await updateDoc(recoveryRef, {
          status: 'expired',
          updatedAt: serverTimestamp()
        })
        throw new Error('Recovery token has expired')
      }

      // Check attempts
      if (recovery.attempts >= this.MAX_ATTEMPTS) {
        await updateDoc(recoveryRef, {
          status: 'blocked',
          updatedAt: serverTimestamp()
        })
        throw new Error('Too many invalid attempts')
      }

      return true
    } catch (error) {
      console.error('Token verification failed:', error)
      throw error
    }
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    try {
      // Verify token first
      await this.verifyRecoveryToken(email, token)

      // Reset password using Firebase Auth
      const actionCode = await verifyPasswordResetCode(auth, token)
      await confirmPasswordReset(auth, token, newPassword)

      // Update recovery attempt status
      const recoverySnapshot = await getDocs(
        query(
          collection(db, 'recoveryAttempts'),
          where('email', '==', email),
          where('token', '==', token)
        )
      )

      if (!recoverySnapshot.empty) {
        await updateDoc(recoverySnapshot.docs[0].ref, {
          status: 'completed',
          completedAt: serverTimestamp()
        })
      }

      // Log successful password reset
      const userSnapshot = await getDocs(
        query(collection(db, 'users'), where('email', '==', email))
      )

      if (!userSnapshot.empty) {
        const userId = userSnapshot.docs[0].id
        await this.logRecoveryAttempt(userId, email, 'email', 'completed')

        // Track security event
        await securityMonitorService.trackSecurityEvent({
          type: 'auth_failure',
          severity: 'medium',
          source: {
            ip: await fetch('https://api.ipify.org?format=json')
              .then(res => res.json())
              .then(data => data.ip),
            userAgent: navigator.userAgent
          },
          details: 'Password reset completed',
          userId
        })

        // Send confirmation email
        await this.sendPasswordChangeConfirmation(email)
      }
    } catch (error) {
      console.error('Password reset failed:', error)
      throw error
    }
  }

  private async checkExistingAttempts(email: string): Promise<void> {
    const recentAttempts = await getDocs(
      query(
        collection(db, 'recoveryAttempts'),
        where('email', '==', email),
        where('createdAt', '>=', new Date(Date.now() - this.COOLDOWN_PERIOD))
      )
    )

    const blockedAttempts = recentAttempts.docs
      .filter(doc => doc.data().status === 'blocked')
      .length

    if (blockedAttempts > 0) {
      throw new Error('Account recovery is temporarily blocked. Please try again later.')
    }

    const pendingAttempts = recentAttempts.docs
      .filter(doc => doc.data().status === 'pending')
      .length

    if (pendingAttempts > 0) {
      throw new Error('A recovery attempt is already in progress')
    }
  }

  private async generateSecureToken(): Promise<string> {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  private async sendRecoveryEmail(email: string, token: string): Promise<void> {
    const resetLink = `${window.location.origin}/reset-password?token=${token}&email=${encodeURIComponent(email)}`
    
    await emailService.sendEmail({
      to: email,
      subject: 'Account Recovery - Password Reset',
      text: `
        You requested to reset your password.
        Click the following link to reset your password:
        ${resetLink}
        
        This link will expire in 30 minutes.
        
        If you didn't request this, please ignore this email.
      `,
      html: `
        <h2>Account Recovery - Password Reset</h2>
        <p>You requested to reset your password.</p>
        <p>Click the following link to reset your password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p><strong>This link will expire in 30 minutes.</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    })
  }

  private async sendRecoverySMS(phone: string, token: string): Promise<void> {
    // Implement SMS sending logic here using your preferred SMS provider
    // This is a placeholder for the actual implementation
    console.log(`Sending recovery SMS to ${phone} with token ${token}`)
  }

  private async sendPasswordChangeConfirmation(email: string): Promise<void> {
    await emailService.sendEmail({
      to: email,
      subject: 'Password Changed Successfully',
      text: `
        Your password has been successfully changed.
        If you did not make this change, please contact support immediately.
      `,
      html: `
        <h2>Password Changed Successfully</h2>
        <p>Your password has been successfully changed.</p>
        <p><strong>If you did not make this change, please contact support immediately.</strong></p>
      `
    })
  }

  private async logRecoveryAttempt(
    userId: string,
    email: string,
    method: 'email' | 'sms',
    status: 'initiated' | 'completed' | 'failed'
  ): Promise<void> {
    await logSystemAction(
      'account_recovery',
      { id: userId, email, role: 'user' },
      `Account recovery ${status} via ${method}`,
      status === 'completed',
      status === 'failed' ? 'warning' : 'info'
    )
  }
}

const accountRecoveryService = new AccountRecoveryService()
export default accountRecoveryService 