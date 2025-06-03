import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import { logSystemAction } from './activityLogger'
import { UserRole } from '../types/auth'

interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

interface TwoFactorUser {
  id: string
  name: string
  role: UserRole
}

export const generateBackupCodes = (): string[] => {
  const codes = []
  for (let i = 0; i < 10; i++) {
    codes.push(Math.random().toString(36).substring(2, 8).toUpperCase())
  }
  return codes
}

export const setupTwoFactor = async (userId: string, userEmail: string): Promise<TwoFactorSetup> => {
  try {
    const secret = authenticator.generateSecret()
    const appName = 'HopeHand'
    const otpauth = authenticator.keyuri(userEmail, appName, secret)
    const qrCodeUrl = await QRCode.toDataURL(otpauth)
    const backupCodes = generateBackupCodes()

    // Store the secret and backup codes in Firestore
    await updateDoc(doc(db, 'users', userId), {
      twoFactorAuth: {
        enabled: false,
        secret,
        backupCodes: backupCodes.map(code => ({
          code,
          used: false
        })),
        lastUsed: null
      }
    })

    return {
      secret,
      qrCodeUrl,
      backupCodes
    }
  } catch (error) {
    console.error('Error setting up 2FA:', error)
    throw new Error('Failed to setup two-factor authentication')
  }
}

export const verifyTwoFactorToken = async (
  userId: string,
  token: string,
  user: TwoFactorUser
): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    const userData = userDoc.data()

    if (!userData?.twoFactorAuth) {
      throw new Error('Two-factor authentication not set up')
    }

    const { secret, backupCodes } = userData.twoFactorAuth

    // Check if it's a backup code
    const backupCodeIndex = backupCodes.findIndex(
      (bc: { code: string; used: boolean }) => bc.code === token && !bc.used
    )

    if (backupCodeIndex >= 0) {
      // Mark backup code as used
      backupCodes[backupCodeIndex].used = true
      await updateDoc(doc(db, 'users', userId), {
        'twoFactorAuth.backupCodes': backupCodes,
        'twoFactorAuth.lastUsed': new Date().toISOString()
      })

      await logSystemAction(
        'used backup code for 2FA',
        user,
        'Backup code used for two-factor authentication',
        true,
        'warning'
      )

      return true
    }

    // Verify TOTP token
    const isValid = authenticator.verify({
      token,
      secret
    })

    if (isValid) {
      await updateDoc(doc(db, 'users', userId), {
        'twoFactorAuth.lastUsed': new Date().toISOString()
      })

      await logSystemAction(
        'verified 2FA token',
        user,
        'Successfully verified two-factor authentication token',
        true,
        'info'
      )
    } else {
      await logSystemAction(
        'failed 2FA verification',
        user,
        'Failed to verify two-factor authentication token',
        false,
        'warning'
      )
    }

    return isValid
  } catch (error) {
    console.error('Error verifying 2FA token:', error)
    throw new Error('Failed to verify two-factor authentication')
  }
}

export const enableTwoFactor = async (
  userId: string,
  token: string,
  user: TwoFactorUser
): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    const userData = userDoc.data()

    if (!userData?.twoFactorAuth) {
      throw new Error('Two-factor authentication not set up')
    }

    const isValid = authenticator.verify({
      token,
      secret: userData.twoFactorAuth.secret
    })

    if (isValid) {
      await updateDoc(doc(db, 'users', userId), {
        'twoFactorAuth.enabled': true,
        'twoFactorAuth.enabledAt': new Date().toISOString()
      })

      await logSystemAction(
        'enabled 2FA',
        user,
        'Successfully enabled two-factor authentication',
        true,
        'warning'
      )
    }

    return isValid
  } catch (error) {
    console.error('Error enabling 2FA:', error)
    throw new Error('Failed to enable two-factor authentication')
  }
}

export const disableTwoFactor = async (
  userId: string,
  token: string,
  user: TwoFactorUser
): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    const userData = userDoc.data()

    if (!userData?.twoFactorAuth?.enabled) {
      throw new Error('Two-factor authentication not enabled')
    }

    const isValid = authenticator.verify({
      token,
      secret: userData.twoFactorAuth.secret
    })

    if (isValid) {
      await updateDoc(doc(db, 'users', userId), {
        'twoFactorAuth.enabled': false,
        'twoFactorAuth.disabledAt': new Date().toISOString()
      })

      await logSystemAction(
        'disabled 2FA',
        user,
        'Successfully disabled two-factor authentication',
        true,
        'critical'
      )
    }

    return isValid
  } catch (error) {
    console.error('Error disabling 2FA:', error)
    throw new Error('Failed to disable two-factor authentication')
  }
} 