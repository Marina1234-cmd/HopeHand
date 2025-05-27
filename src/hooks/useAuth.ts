import { useState, useEffect, useCallback } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import { AuthUser, UserRole, DEFAULT_PERMISSIONS, UseAuthReturn } from '../types/auth'

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          const userData = userDoc.data()
          
          const role = userData?.role || 'user'
          const permissions = DEFAULT_PERMISSIONS[role as UserRole]

          setUser({
            ...firebaseUser,
            role: role as UserRole,
            permissions,
            name: userData?.name,
            volunteerVerified: userData?.volunteerVerified || false
          })
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const hasPermission = (permission: keyof typeof DEFAULT_PERMISSIONS.admin): boolean => {
    if (!user) return false
    return user.permissions[permission] || false
  }

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))
      const userData = userDoc.data()

      if (!userData) {
        // Create user document if it doesn't exist
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          role: 'user',
          createdAt: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }, [])

  const signup = useCallback(async (email: string, password: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user document
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        name,
        role: 'user',
        createdAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error('Password reset failed:', error)
      throw error
    }
  }, [])

  return {
    user,
    loading,
    hasPermission,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
    resetPassword,
  }
} 