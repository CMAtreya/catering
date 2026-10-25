import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AdminUser {
  name: string
  role: string
  phone: string
}

interface AdminAuthState {
  isAuthenticated: boolean
  token: string | null
  user: AdminUser | null
  keepSignedIn: boolean
  expiresAt: number | null
  failedAttempts: number
  lockedUntil: number | null

  login: (token: string, user: AdminUser, keepSignedIn?: boolean) => void
  logout: () => void
  recordFailedAttempt: () => { locked: boolean; remainingSeconds: number }
  resetFailedAttempts: () => void
  isSessionExpired: () => boolean
  expireSessionNow: () => void
}


export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      keepSignedIn: true,
      expiresAt: null,
      failedAttempts: 0,
      lockedUntil: null,

      login: (token, user, keepSignedIn = true) => {
        // Session expiry: 30 days if keepSignedIn, else 2 hours
        const duration = keepSignedIn ? 30 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000
        set({
          isAuthenticated: true,
          token,
          user,
          keepSignedIn,
          expiresAt: Date.now() + duration,
          failedAttempts: 0,
          lockedUntil: null
        })
      },

      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
          user: null,
          expiresAt: null
        })
      },

      recordFailedAttempt: () => {
        const state = get()
        const now = Date.now()

        // If already locked, calculate remaining
        if (state.lockedUntil && now < state.lockedUntil) {
          return {
            locked: true,
            remainingSeconds: Math.ceil((state.lockedUntil - now) / 1000)
          }
        }

        const nextCount = state.failedAttempts + 1
        if (nextCount >= 5) {
          const lockTime = now + 5 * 60 * 1000 // 5 minutes
          set({
            failedAttempts: nextCount,
            lockedUntil: lockTime
          })
          return {
            locked: true,
            remainingSeconds: 300
          }
        }

        set({ failedAttempts: nextCount })
        return {
          locked: false,
          remainingSeconds: 0
        }
      },

      resetFailedAttempts: () => {
        set({ failedAttempts: 0, lockedUntil: null })
      },

      isSessionExpired: () => {
        const state = get()
        if (!state.isAuthenticated) return false
        if (!state.expiresAt) return false
        return Date.now() > state.expiresAt
      },

      expireSessionNow: () => {
        set({ expiresAt: Date.now() - 1000 })
      }
    }),

    {
      name: 'tks-catering-admin-auth'
    }
  )
)
