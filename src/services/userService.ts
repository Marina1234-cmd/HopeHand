import { db } from '../config/firebase'
import { collection, doc, getDoc, getDocs, query, where, orderBy, updateDoc } from 'firebase/firestore'
import { logSystemAction } from './activityLogger'
import notificationService from './notificationService'
import { UserRole } from '../types/auth'

export interface User {
  id: string
  email: string
  displayName: string | null
  role: UserRole
  volunteerVerified: boolean
  createdAt: Date
  updatedAt: Date
}

class UserService {
  // Get a user by ID
  async getUser(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))

      if (!userDoc.exists()) {
        return null
      }

      return {
        id: userDoc.id,
        ...userDoc.data()
      } as User
    } catch (error) {
      console.error('Failed to get user:', error)
      throw error
    }
  }

  // List users with optional filters
  async listUsers(filters?: {
    role?: UserRole
    volunteerVerified?: boolean
  }): Promise<User[]> {
    try {
      let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))

      if (filters?.role) {
        q = query(q, where('role', '==', filters.role))
      }

      if (filters?.volunteerVerified !== undefined) {
        q = query(q, where('volunteerVerified', '==', filters.volunteerVerified))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[]
    } catch (error) {
      console.error('Failed to list users:', error)
      throw error
    }
  }

  // Update user role
  async updateUserRole(userId: string, newRole: UserRole, performerId: string, performerName: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        throw new Error('User not found')
      }

      const userData = userDoc.data() as User
      const oldRole = userData.role

      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date()
      })

      await logSystemAction(
        'update_role',
        { id: performerId, name: performerName, role: 'admin' },
        `Updated user ${userData.email} role from ${oldRole} to ${newRole}`,
        true,
        'warning'
      )

      // Notify admins about role change
      const adminSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'admin'))
      )

      const notificationPromises = adminSnapshot.docs.map(doc =>
        notificationService.notifyNewUser(doc.id, {
          userId,
          userName: userData.displayName || userData.email,
          userRole: newRole
        })
      )

      await Promise.all(notificationPromises)
    } catch (error) {
      console.error('Failed to update user role:', error)
      throw error
    }
  }

  // Verify volunteer status
  async verifyVolunteer(userId: string, performerId: string, performerName: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        throw new Error('User not found')
      }

      const userData = userDoc.data() as User

      if (userData.role !== 'volunteer') {
        throw new Error('User is not a volunteer')
      }

      await updateDoc(userRef, {
        volunteerVerified: true,
        updatedAt: new Date()
      })

      await logSystemAction(
        'verify_volunteer',
        { id: performerId, name: performerName, role: 'admin' },
        `Verified volunteer status for user ${userData.email}`,
        true,
        'info'
      )

      // Notify admins about volunteer verification
      const adminSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'admin'))
      )

      const notificationPromises = adminSnapshot.docs.map(doc =>
        notificationService.notifyNewUser(doc.id, {
          userId,
          userName: userData.displayName || userData.email,
          userRole: 'volunteer (verified)'
        })
      )

      await Promise.all(notificationPromises)
    } catch (error) {
      console.error('Failed to verify volunteer:', error)
      throw error
    }
  }
}

// Create singleton instance
const userService = new UserService()

export default userService 