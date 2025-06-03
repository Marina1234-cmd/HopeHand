import { auth, db } from '../config/firebase'
import { 
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { 
  ResourceType, 
  ActionType, 
  ComponentType,
  Permissions,
  DEFAULT_PERMISSIONS
} from '../types/permissions'
import { logSystemAction } from './activityLogger'

class PermissionsService {
  private userPermissionsCache: Map<string, Permissions> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  async getUserPermissions(userId: string): Promise<Permissions> {
    // Check cache first
    const cachedPermissions = this.userPermissionsCache.get(userId)
    if (cachedPermissions) {
      return cachedPermissions
    }

    // Get user's roles and custom permissions from Firestore
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      throw new Error('User not found')
    }

    const userData = userDoc.data()
    const roles = userData.roles || ['user']
    
    // Get custom permissions if they exist
    const customPermissionsDoc = await getDoc(doc(db, 'userPermissions', userId))
    const customPermissions = customPermissionsDoc.exists() 
      ? customPermissionsDoc.data() as Permissions
      : null

    // Merge permissions from all roles
    let mergedPermissions = this.getMergedRolePermissions(roles)

    // Override with custom permissions if they exist
    if (customPermissions) {
      mergedPermissions = this.mergePermissions(mergedPermissions, customPermissions)
    }

    // Cache the result
    this.userPermissionsCache.set(userId, mergedPermissions)
    setTimeout(() => {
      this.userPermissionsCache.delete(userId)
    }, this.CACHE_DURATION)

    return mergedPermissions
  }

  async checkResourcePermission(
    userId: string,
    resource: ResourceType,
    action: string
  ): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId)
      return permissions.resources[resource]?.[action] || false
    } catch (error) {
      console.error('Permission check failed:', error)
      return false
    }
  }

  async checkComponentPermission(
    userId: string,
    component: ComponentType,
    action: string
  ): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId)
      return permissions.components[component]?.[action] || false
    } catch (error) {
      console.error('Permission check failed:', error)
      return false
    }
  }

  async setCustomPermissions(
    userId: string,
    permissions: Partial<Permissions>
  ): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }

      // Get current permissions
      const currentPermissions = await this.getUserPermissions(userId)

      // Merge with new permissions
      const mergedPermissions = this.mergePermissions(currentPermissions, permissions)

      // Save to Firestore
      await setDoc(doc(db, 'userPermissions', userId), mergedPermissions)

      // Clear cache
      this.userPermissionsCache.delete(userId)

      // Log the action
      await logSystemAction(
        'permissions_update',
        { id: userId, role: userDoc.data().roles?.[0] || 'user' },
        'Custom permissions updated',
        true,
        'info'
      )
    } catch (error) {
      console.error('Failed to set custom permissions:', error)
      throw error
    }
  }

  async revokeCustomPermissions(userId: string): Promise<void> {
    try {
      await setDoc(doc(db, 'userPermissions', userId), {})
      this.userPermissionsCache.delete(userId)

      await logSystemAction(
        'permissions_update',
        { id: userId },
        'Custom permissions revoked',
        true,
        'info'
      )
    } catch (error) {
      console.error('Failed to revoke custom permissions:', error)
      throw error
    }
  }

  private getMergedRolePermissions(roles: string[]): Permissions {
    return roles.reduce((merged, role) => {
      const rolePermissions = DEFAULT_PERMISSIONS[role]
      if (!rolePermissions) return merged
      return this.mergePermissions(merged, rolePermissions)
    }, this.getEmptyPermissions())
  }

  private mergePermissions(base: Permissions, override: Partial<Permissions>): Permissions {
    const merged = { ...base }

    if (override.resources) {
      Object.keys(override.resources).forEach(resource => {
        merged.resources[resource] = {
          ...merged.resources[resource],
          ...override.resources[resource]
        }
      })
    }

    if (override.components) {
      Object.keys(override.components).forEach(component => {
        merged.components[component] = {
          ...merged.components[component],
          ...override.components[component]
        }
      })
    }

    return merged
  }

  private getEmptyPermissions(): Permissions {
    return {
      resources: {
        campaign: {
          create: false,
          read: false,
          update: false,
          delete: false,
          approve: false,
          reject: false,
          manageDonations: false,
          manageVolunteers: false,
          exportData: false
        },
        donation: {
          create: false,
          read: false,
          update: false,
          delete: false,
          refund: false,
          export: false
        },
        user: {
          create: false,
          read: false,
          update: false,
          delete: false,
          manageRoles: false,
          resetPassword: false,
          verifyEmail: false,
          exportData: false
        },
        volunteer: {
          create: false,
          read: false,
          update: false,
          delete: false,
          verify: false,
          assign: false,
          track: false
        },
        notification: {
          create: false,
          read: false,
          update: false,
          delete: false,
          sendBulk: false,
          manageTemplates: false
        },
        report: {
          create: false,
          read: false,
          update: false,
          delete: false,
          export: false,
          schedule: false
        },
        payment: {
          process: false,
          refund: false,
          viewTransactions: false,
          manageGateways: false,
          viewAnalytics: false
        },
        settings: {
          read: false,
          update: false,
          manageIntegrations: false,
          manageApiKeys: false,
          manageSecuritySettings: false
        },
        audit_log: {
          read: false,
          export: false,
          delete: false,
          configure: false
        }
      },
      components: {
        AdminDashboard: {
          view: false,
          manageWidgets: false,
          exportData: false
        },
        UserManagement: {
          view: false,
          create: false,
          edit: false,
          delete: false,
          assignRoles: false
        },
        CampaignManagement: {
          view: false,
          create: false,
          edit: false,
          delete: false,
          approve: false
        },
        DonationHistory: {
          view: false,
          export: false,
          process: false,
          refund: false
        },
        PaymentSettings: {
          view: false,
          update: false,
          manageGateways: false,
          viewAnalytics: false
        },
        SecuritySettings: {
          view: false,
          update: false,
          manageApiKeys: false,
          viewAuditLogs: false
        },
        AuditLogs: {
          view: false,
          export: false,
          filter: false,
          configure: false
        },
        Reports: {
          view: false,
          create: false,
          schedule: false,
          export: false
        },
        Analytics: {
          view: false,
          export: false,
          configure: false
        },
        NotificationCenter: {
          view: false,
          send: false,
          manageTemplates: false,
          configure: false
        }
      }
    }
  }
}

const permissionsService = new PermissionsService()
export default permissionsService 