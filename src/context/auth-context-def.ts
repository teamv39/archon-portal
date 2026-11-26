import * as React from 'react'
import type { AuthUser, LoginCredentials } from '@/types/auth'

export interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<AuthUser>
  logout: () => Promise<void>
  checkAuth: () => Promise<AuthUser | null>
  clearError: () => void
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined)
