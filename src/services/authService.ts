import { auth, db } from '../config/firebase'
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  signOut,
  linkWithPopup,
  unlink,
  AuthProvider,
  UserCredential,
  getAdditionalUserInfo
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { logSystemAction } from './activityLogger'

export type SSOProvider = 
  | 'google'
  | 'facebook'
  | 'microsoft'
  | 'github'
  | 'twitter'

interface AuthError extends Error {
  code?: string
  email?: string
  credential?: any
}

class AuthService {
  private providers: Record<SSOProvider, AuthProvider> = {
    google: new GoogleAuthProvider(),
    facebook: new FacebookAuthProvider(),
    microsoft: new OAuthProvider('microsoft.com'),
    github: new GithubAuthProvider(),
    twitter: new TwitterAuthProvider()
  }

  constructor() {
    // Configure providers
    this.configureProviders()
  }

  private configureProviders() {
    // Google configuration
    this.providers.google.addScope('profile')
    this.providers.google.addScope('email')
    this.providers.google.setCustomParameters({
      prompt: 'select_account'
    })

    // Facebook configuration
    this.providers.facebook.addScope('email')
    this.providers.facebook.addScope('public_profile')

    // Microsoft configuration
    ;(this.providers.microsoft as OAuthProvider).addScope('profile')
    ;(this.providers.microsoft as OAuthProvider).addScope('email')
    ;(this.providers.microsoft as OAuthProvider).setCustomParameters({
      prompt: 'select_account'
    })

    // GitHub configuration
    this.providers.github.addScope('read:user')
    this.providers.github.addScope('user:email')

    // Twitter configuration
    this.providers.twitter.setCustomParameters({
      lang: 'en'
    })
  }

  async signInWithSSO(provider: SSOProvider, useRedirect: boolean = false): Promise<UserCredential> {
    try {
      const authProvider = this.providers[provider]
      let result: UserCredential

      if (useRedirect) {
        await signInWithRedirect(auth, authProvider)
        result = await getRedirectResult(auth)
      } else {
        result = await signInWithPopup(auth, authProvider)
      }

      if (!result) {
        throw new Error('Authentication failed')
      }

      // Get additional user info
      const additionalInfo = getAdditionalUserInfo(result)
      const isNewUser = additionalInfo?.isNewUser

      // Create or update user document
      await this.handleUserData(result, provider, isNewUser)

      // Log the authentication
      await this.logAuthentication(result.user.uid, provider, isNewUser)

      return result
    } catch (error) {
      const authError = error as AuthError
      console.error('SSO authentication failed:', authError)

      // Handle specific error cases
      if (authError.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with the same email address but different sign-in credentials. Please sign in using the original provider.')
      }

      throw error
    }
  }

  async linkProvider(provider: SSOProvider): Promise<UserCredential> {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('No user is currently signed in')
      }

      const result = await linkWithPopup(user, this.providers[provider])

      // Update user document with new provider
      await this.updateUserProviders(user.uid, provider, 'link')

      // Log the provider linking
      await logSystemAction(
        'auth_provider_link',
        { id: user.uid, provider },
        `Linked ${provider} provider to account`,
        true,
        'info'
      )

      return result
    } catch (error) {
      console.error('Failed to link provider:', error)
      throw error
    }
  }

  async unlinkProvider(provider: SSOProvider): Promise<void> {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('No user is currently signed in')
      }

      const providerId = this.getProviderId(provider)
      await unlink(user, providerId)

      // Update user document
      await this.updateUserProviders(user.uid, provider, 'unlink')

      // Log the provider unlinking
      await logSystemAction(
        'auth_provider_unlink',
        { id: user.uid, provider },
        `Unlinked ${provider} provider from account`,
        true,
        'info'
      )
    } catch (error) {
      console.error('Failed to unlink provider:', error)
      throw error
    }
  }

  async signOut(): Promise<void> {
    try {
      const userId = auth.currentUser?.uid
      await signOut(auth)

      if (userId) {
        await logSystemAction(
          'auth_signout',
          { id: userId },
          'User signed out',
          true,
          'info'
        )
      }
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }

  private async handleUserData(
    credential: UserCredential,
    provider: SSOProvider,
    isNewUser: boolean
  ): Promise<void> {
    const { user } = credential
    const userRef = doc(db, 'users', user.uid)

    if (isNewUser) {
      // Create new user document
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        providers: [provider],
        roles: ['user'],
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        metadata: {
          provider,
          providerId: user.providerData[0]?.providerId
        }
      })
    } else {
      // Update existing user document
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        displayName: user.displayName,
        photoURL: user.photoURL,
        email: user.email,
        'metadata.lastProvider': provider
      })
    }
  }

  private async updateUserProviders(
    userId: string,
    provider: SSOProvider,
    action: 'link' | 'unlink'
  ): Promise<void> {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      const providers = userData.providers || []

      if (action === 'link' && !providers.includes(provider)) {
        providers.push(provider)
      } else if (action === 'unlink') {
        const index = providers.indexOf(provider)
        if (index > -1) {
          providers.splice(index, 1)
        }
      }

      await updateDoc(userRef, { providers })
    }
  }

  private async logAuthentication(
    userId: string,
    provider: SSOProvider,
    isNewUser: boolean
  ): Promise<void> {
    await logSystemAction(
      'auth_signin',
      { id: userId, provider },
      `User ${isNewUser ? 'registered' : 'signed in'} with ${provider}`,
      true,
      'info'
    )
  }

  private getProviderId(provider: SSOProvider): string {
    const providerMap: Record<SSOProvider, string> = {
      google: GoogleAuthProvider.PROVIDER_ID,
      facebook: FacebookAuthProvider.PROVIDER_ID,
      microsoft: 'microsoft.com',
      github: GithubAuthProvider.PROVIDER_ID,
      twitter: TwitterAuthProvider.PROVIDER_ID
    }
    return providerMap[provider]
  }
}

const authService = new AuthService()
export default authService 