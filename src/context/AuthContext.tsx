import * as React from 'react'
import type { AuthUser, LoginCredentials } from '@/types/auth'
import { apiFetch, onUnauthorized } from '@/lib/api-client'
import { AuthContext, type AuthContextType } from './auth-context-def'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  const checkAuth = React.useCallback(async (): Promise<AuthUser | null> => {
    try {
      const data = await apiFetch<AuthUser>('/api/auth/me', {
        skipUnauthorizedNotify: true,
      })
      setUser(data)
      return data
    } catch {
      setUser(null)
      return null
    }
  }, [])

  // Начальная верификация сессии при загрузке приложения
  React.useEffect(() => {
    let mounted = true

    void apiFetch<AuthUser>('/api/auth/me', { skipUnauthorizedNotify: true })
      .then((data) => {
        if (mounted) {
          setUser(data)
        }
      })
      .catch(() => {
        if (mounted) {
          setUser(null)
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false)
        }
      })

    // Подписка на глобальный 401 статус от BFF
    const unsubscribe = onUnauthorized(() => {
      setUser(null)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const login = React.useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    setError(null)
    try {
      const loggedUser = await apiFetch<AuthUser>('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        skipUnauthorizedNotify: true,
      })
      setUser(loggedUser)
      return loggedUser
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Не удалось войти в систему. Проверьте имя пользователя и пароль.'
      setError(message)
      throw err
    }
  }, [])

  const logout = React.useCallback(async (): Promise<void> => {
    try {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
        skipUnauthorizedNotify: true,
      })
    } catch {
      // Игнорируем сетевые ошибки при выходе
    } finally {
      setUser(null)
      setError(null)
    }
  }, [])

  const value = React.useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      error,
      login,
      logout,
      checkAuth,
      clearError,
    }),
    [user, isLoading, error, login, logout, checkAuth, clearError]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
