import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { WifiOff } from 'lucide-react'

/**
 * Reusable Frosted Glass Top Offline Banner
 * Automatically adapts between Customer and Admin shell messages
 */
export const OfflineBanner: React.FC = () => {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  })

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="sticky top-0 z-50 overflow-hidden w-full"
        >
          <div className="glass-top-bar bg-amber-500/15 backdrop-blur-lg border-b border-amber-500/25 px-4 py-2 flex items-center justify-center gap-2 text-amber-950 text-xs font-bold shadow-xs">
            <WifiOff className="w-4 h-4 text-amber-800 shrink-0" />
            <span className="text-center leading-tight">
              {isAdmin
                ? 'You are offline. Changes cannot be saved'
                : 'You are offline. Your selection is saved on this device'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


export default OfflineBanner
