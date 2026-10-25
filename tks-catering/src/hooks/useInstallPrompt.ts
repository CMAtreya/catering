import { useState, useEffect, useCallback } from 'react'

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export interface UseInstallPromptOptions {
  storageKey?: string
  expiryDays?: number
}

export function useInstallPrompt(options: UseInstallPromptOptions = {}) {
  const { storageKey = 'tks_pwa_install_dismissed', expiryDays = 14 } = options

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  // Detect standalone mode
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as unknown as { standalone?: boolean }).standalone)
    )
  })

  // Detect iOS / iPadOS Safari (which does not support beforeinstallprompt)
  const [isIOS] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const ua = window.navigator.userAgent.toLowerCase()
    return /iphone|ipad|ipod/.test(ua) && !('MSStream' in window)
  })

  // Check 14-day dismissal state from localStorage
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try {
      const dismissedTimestamp = localStorage.getItem(storageKey)
      if (!dismissedTimestamp) return false
      const dismissedAt = parseInt(dismissedTimestamp, 10)
      const now = Date.now()
      const expiryMs = expiryDays * 24 * 60 * 60 * 1000
      if (now - dismissedAt < expiryMs) {
        return true
      }
      localStorage.removeItem(storageKey)
      return false
    } catch {
      return false
    }
  })

  const [showIOSSheet, setShowIOSSheet] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        Boolean((window.navigator as unknown as { standalone?: boolean }).standalone)
      setIsStandalone(standalone)
    }

    const media = window.matchMedia('(display-mode: standalone)')
    if (media.addEventListener) {
      media.addEventListener('change', checkStandalone)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsStandalone(true)
      setDeferredPrompt(null)
      try {
        localStorage.removeItem(storageKey)
      } catch {}
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', checkStandalone)
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [storageKey])

  const promptToInstall = useCallback(async (): Promise<boolean> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        setDeferredPrompt(null)
        if (choice.outcome === 'accepted') {
          setIsStandalone(true)
          return true
        }
      } catch (err) {
        console.error('PWA install prompt error:', err)
      }
      return false
    }

    if (isIOS) {
      setShowIOSSheet(true)
      return true
    }

    return false
  }, [deferredPrompt, isIOS])

  const dismissPrompt = useCallback(() => {
    setIsDismissed(true)
    setShowIOSSheet(false)
    try {
      localStorage.setItem(storageKey, Date.now().toString())
    } catch {}
  }, [storageKey])

  const canInstall = !isStandalone && !isDismissed && (Boolean(deferredPrompt) || isIOS)

  return {
    deferredPrompt,
    isStandalone,
    isIOS,
    isDismissed,
    canInstall,
    showIOSSheet,
    setShowIOSSheet,
    promptToInstall,
    dismissPrompt,
  }
}

export default useInstallPrompt
