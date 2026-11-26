import * as React from 'react'
import { AuthContext, type AuthContextType } from '@/context/auth-context-def'

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
