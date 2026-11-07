import crypto from 'node:crypto'
import type { AuthUser } from '../types/auth.js'

const sessions = new Map<string, AuthUser>()

export const sessionStorage = {
  create(user: AuthUser): string {
    const sessionId = crypto.randomUUID()
    sessions.set(sessionId, user)
    return sessionId
  },

  get(sessionId: string): AuthUser | undefined {
    return sessions.get(sessionId)
  },

  delete(sessionId: string): void {
    sessions.delete(sessionId)
  },
}
