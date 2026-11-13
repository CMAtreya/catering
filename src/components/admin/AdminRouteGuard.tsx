import React, { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useAdminAuthStore } from '@/store/adminAuthStore'

export const AdminRouteGuard: React.FC = () => {
  const location = useLocation()
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated)
  const isSessionExpired = useAdminAuthStore((state) => state.isSessionExpired)
  const logout = useAdminAuthStore((state) => state.logout)

  const isExpired = isSessionExpired()

  // Handle immediate expired state
  useEffect(() => {
    if (isAuthenticated && isExpired) {
      logout()
      toast.error('Your session has expired. Please log in again.')
    }
  }, [isAuthenticated, isExpired, logout])

  // Active heartbeat check for session expiration while tab remains open
  useEffect(() => {
    if (!isAuthenticated) return

    const checkExpiry = () => {
      if (useAdminAuthStore.getState().isSessionExpired()) {
        useAdminAuthStore.getState().logout()
        toast.error('Your session has expired. Please log in again.')
        window.location.href = '/admin/login?expired=1'
      }
    }

    const interval = setInterval(checkExpiry, 10000)
    window.addEventListener('focus', checkExpiry)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', checkExpiry)
    }
  }, [isAuthenticated])

  if (!isAuthenticated || isExpired) {
    const redirectPath = isExpired ? '/admin/login?expired=1' : '/admin/login'
    return (
      <Navigate 
        to={redirectPath} 
        state={{ from: location, expired: isExpired }} 
        replace 
      />
    )
  }

  return <Outlet />
}

export default AdminRouteGuard
