import React, { useEffect, useState, useRef } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { RefreshCw, X, Sparkles } from 'lucide-react'

/**
 * PWA Update Toast
 * Listens for new Service Worker versions via virtual:pwa-register and workbox-window.
 * Displays 'New version available' with a 'Refresh' button.
 * Automatically checks for updates every hour and on app resume (visibilitychange and focus).
 */
export const UpdateToast: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState<boolean>(false)
  const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null)

  useEffect(() => {
    let cleanUpListeners: (() => void) | undefined

    try {
      updateSWRef.current = registerSW({
        immediate: true,
        onNeedRefresh() {
          setNeedRefresh(true)
        },
        onOfflineReady() {
          // App shell is fully cached and ready offline
        },
        onRegisteredSW(_swUrl, registration) {
          if (!registration) return

          // 1) Check for updates every hour
          const intervalId = setInterval(() => {
            registration.update().catch((err) => {
              console.debug('Hourly PWA update check failed:', err)
            })
          }, 60 * 60 * 1000)

          // 2) Check for updates on app resume
          const handleResume = () => {
            if (document.visibilityState === 'visible') {
              registration.update().catch((err) => {
                console.debug('App resume PWA update check failed:', err)
              })
            }
          }

          window.addEventListener('visibilitychange', handleResume)
          window.addEventListener('focus', handleResume)

          cleanUpListeners = () => {
            clearInterval(intervalId)
            window.removeEventListener('visibilitychange', handleResume)
            window.removeEventListener('focus', handleResume)
          }
        },
        onRegisterError(error) {
          console.debug('SW registration error:', error)
        }
      })
    } catch (err) {
      console.debug('virtual:pwa-register not available in non-PWA dev mode:', err)
    }

    return () => {
      if (cleanUpListeners) cleanUpListeners()
    }
  }, [])

  const handleRefresh = async () => {
    if (updateSWRef.current) {
      await updateSWRef.current(true)
    } else {
      window.location.reload()
    }
  }

  if (!needRefresh) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 text-white backdrop-blur-xl border border-slate-700/60 shadow-2xl">
        <div className="w-8 h-8 rounded-full bg-[var(--brand)] text-white flex items-center justify-center shrink-0 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>

        <div className="flex-1 sm:pr-2">
          <p className="font-heading font-black text-xs sm:text-sm text-white tracking-tight leading-tight">
            New version available
          </p>
          <p className="text-[11px] text-slate-300 leading-tight">
            Update to get the latest banquet menu and features.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            className="h-9 px-4 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-600)] active:scale-95 text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer tap-target-48 sm:tap-target-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 flex items-center justify-center transition-colors"
            aria-label="Dismiss update alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default UpdateToast
