import { User as FirebaseUser } from 'firebase/auth'

export type UserRole = 'user' | 'agent' | 'admin'

export interface Permissions {
  canCreateListing: boolean
  canEditListing: boolean
  canDeleteListing: boolean
  canManageUsers: boolean
  canModerateComments: boolean
  canAccessAdminPanel: boolean
  canManageSettings: boolean
}

export interface AuthUser extends FirebaseUser {
  role: UserRole
  permissions: Permissions
  name?: string
  volunteerVerified?: boolean
}

export const DEFAULT_PERMISSIONS = {
  admin: {
    canCreateListing: true,
    canEditListing: true,
    canDeleteListing: true,
    canManageUsers: true,
    canModerateComments: true,
    canAccessAdminPanel: true,
    canManageSettings: true
  },
  agent: {
    canCreateListing: true,
    canEditListing: true,
    canDeleteListing: false,
    canManageUsers: false,
    canModerateComments: false,
    canAccessAdminPanel: false,
    canManageSettings: false
  },
  user: {
    canCreateListing: false,
    canEditListing: false,
    canDeleteListing: false,
    canManageUsers: false,
    canModerateComments: false,
    canAccessAdminPanel: false,
    canManageSettings: false
  }
} as const

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
}

export interface UseAuthReturn {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  hasPermission: (permission: keyof typeof DEFAULT_PERMISSIONS.admin) => boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
} 