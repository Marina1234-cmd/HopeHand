import React, { createContext, useContext } from 'react'
import { useAuth as useFirebaseAuthHook } from '../hooks/useAuth'
import { UseAuthReturn } from '../types/auth'

const AuthContext = createContext<UseAuthReturn | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useFirebaseAuthHook()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext 