import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { logSystemAction } from './activityLogger'

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs: number
}

interface RateLimitRecord {
  attempts: {
    timestamp: string
    ip: string
  }[]
  blockedUntil?: string
  lastResetAt: string
}

const configs: Record<string, RateLimitConfig> = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes
  },
  twoFactor: {
    maxAttempts: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
    blockDurationMs: 15 * 60 * 1000 // 15 minutes
  },
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 24 * 60 * 60 * 1000 // 24 hours
  }
}

export const checkRateLimit = async (
  type: keyof typeof configs,
  identifier: string,
  ip: string,
  user?: { id: string; name: string; role: string }
): Promise<{ allowed: boolean; remainingAttempts: number; blockedUntil?: Date }> => {
  const config = configs[type]
  const now = new Date()
  const rateLimitRef = doc(db, 'rateLimits', `${type}_${identifier}`)

  try {
    // Get or create rate limit record
    const record = await getDoc(rateLimitRef)
    const rateLimitData: RateLimitRecord = record.exists()
      ? record.data() as RateLimitRecord
      : {
          attempts: [],
          lastResetAt: now.toISOString()
        }

    // Check if currently blocked
    if (rateLimitData.blockedUntil) {
      const blockExpiry = new Date(rateLimitData.blockedUntil)
      if (blockExpiry > now) {
        return {
          allowed: false,
          remainingAttempts: 0,
          blockedUntil: blockExpiry
        }
      }
      // Block expired, clear it
      rateLimitData.blockedUntil = undefined
    }

    // Clean up old attempts
    const windowStart = new Date(now.getTime() - config.windowMs)
    rateLimitData.attempts = rateLimitData.attempts.filter(
      attempt => new Date(attempt.timestamp) > windowStart
    )

    // Count recent attempts
    const recentAttempts = rateLimitData.attempts.length

    // If exceeded limit, block the identifier
    if (recentAttempts >= config.maxAttempts) {
      const blockedUntil = new Date(now.getTime() + config.blockDurationMs)
      rateLimitData.blockedUntil = blockedUntil.toISOString()

      await updateDoc(rateLimitRef, {
        ...rateLimitData,
        updatedAt: serverTimestamp()
      })

      // Log the blocking event
      if (user) {
        await logSystemAction(
          `blocked from ${type}`,
          user,
          `Too many ${type} attempts. Blocked until ${blockedUntil.toLocaleString()}`,
          true,
          'warning'
        )
      }

      return {
        allowed: false,
        remainingAttempts: 0,
        blockedUntil
      }
    }

    // Record this attempt
    rateLimitData.attempts.push({
      timestamp: now.toISOString(),
      ip
    })

    // Update the record
    await setDoc(rateLimitRef, {
      ...rateLimitData,
      updatedAt: serverTimestamp()
    })

    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - (recentAttempts + 1)
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Fail open to prevent lockout in case of errors
    return {
      allowed: true,
      remainingAttempts: 1
    }
  }
}

export const resetRateLimit = async (
  type: keyof typeof configs,
  identifier: string
): Promise<void> => {
  const rateLimitRef = doc(db, 'rateLimits', `${type}_${identifier}`)
  
  try {
    await setDoc(rateLimitRef, {
      attempts: [],
      lastResetAt: new Date().toISOString(),
      blockedUntil: undefined,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Failed to reset rate limit:', error)
  }
}

export const getRateLimitStatus = async (
  type: keyof typeof configs,
  identifier: string
): Promise<{ isBlocked: boolean; remainingAttempts: number; blockedUntil?: Date }> => {
  const config = configs[type]
  const rateLimitRef = doc(db, 'rateLimits', `${type}_${identifier}`)

  try {
    const record = await getDoc(rateLimitRef)
    if (!record.exists()) {
      return {
        isBlocked: false,
        remainingAttempts: config.maxAttempts
      }
    }

    const data = record.data() as RateLimitRecord
    const now = new Date()

    // Check if blocked
    if (data.blockedUntil) {
      const blockExpiry = new Date(data.blockedUntil)
      if (blockExpiry > now) {
        return {
          isBlocked: true,
          remainingAttempts: 0,
          blockedUntil: blockExpiry
        }
      }
    }

    // Count valid attempts
    const windowStart = new Date(now.getTime() - config.windowMs)
    const recentAttempts = data.attempts.filter(
      attempt => new Date(attempt.timestamp) > windowStart
    ).length

    return {
      isBlocked: false,
      remainingAttempts: Math.max(0, config.maxAttempts - recentAttempts)
    }
  } catch (error) {
    console.error('Failed to get rate limit status:', error)
    return {
      isBlocked: false,
      remainingAttempts: 1
    }
  }
} 