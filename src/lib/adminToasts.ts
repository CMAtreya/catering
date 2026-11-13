import { toast } from 'sonner'

/**
 * Reusable Admin Toast notification helpers
 * Positioned bottom-center with richColors matching brand aesthetic
 */
export const adminToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3500
    })
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 4500
    })
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 3500
    })
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000
    })
  },

  sessionExpired: () => {
    toast.error('Session Expired', {
      description: 'Your administrator session has expired. Please log in again.',
      duration: 5000
    })
  },

  offline: () => {
    toast.warning('Offline Mode', {
      description: 'You are offline. Showing cached records. Changes will sync when reconnected.',
      duration: 4000
    })
  }
}

export default adminToast
