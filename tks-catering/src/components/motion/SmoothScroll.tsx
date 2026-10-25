import React, { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { useMotionTier } from '@/motion/MotionProvider'

export const SmoothScroll: React.FC = () => {
  const location = useLocation()
  const { isReduced } = useMotionTier()
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Strict rules:
    // 1. Reduced motion: disable
    // 2. Admin pages: disable (per spec: "No smooth-scroll library and no 3D in the admin")
    // 3. Touch devices: disable (per spec: "ONLY on non-touch devices (syncTouch false)... never hijack native scroll on phones")
    if (typeof window === 'undefined' || isReduced) return

    const isAdmin = location.pathname.startsWith('/admin')
    const isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches

    if (isAdmin || isTouchDevice) {
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
      return
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false, // NEVER hijack touch device scrolling
    })

    lenisRef.current = lenis

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    // Stop Lenis while any sheet, dialog or input is focused
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable ||
        target.closest('[role="dialog"]') ||
        target.closest('[data-slot="sheet-content"]')

      if (isInput) {
        lenis.stop()
      }
    }

    const handleFocusOut = () => {
      // Re-enable when active element is not an interactive input or dialog
      setTimeout(() => {
        const active = document.activeElement as HTMLElement | null
        const isInput =
          active &&
          (active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.tagName === 'SELECT' ||
            active.isContentEditable ||
            active.closest('[role="dialog"]') ||
            active.closest('[data-slot="sheet-content"]'))

        if (!isInput) {
          lenis.start()
        }
      }, 50)
    }

    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [location.pathname, isReduced])

  return null
}
