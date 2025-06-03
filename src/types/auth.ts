import { User } from 'firebase/auth'

export type UserRole = 'user' | 'admin'

export interface AuthUser extends User {
  role: UserRole
  name: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
} 