import React, { createContext, useContext, useEffect, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { getGPUTier } from 'detect-gpu'
import type { MotionTier } from './tokens'

interface MotionContextValue {
  tier: MotionTier
  isReduced: boolean
  isLite: boolean
  isFull: boolean
}

const MotionContext = createContext<MotionContextValue>({
  tier: 'full',
  isReduced: false,
  isLite: false,
  isFull: true,
})

export const useMotionTier = (): MotionContextValue => {
  return useContext(MotionContext)
}

interface MotionProviderProps {
  children: React.ReactNode
}

export const MotionProvider: React.FC<MotionProviderProps> = ({ children }) => {
  const [tier, setTier] = useState<MotionTier>(() => {
    if (typeof window === 'undefined') return 'full'

    // 1. Reduced Motion Preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'reduced'
    }

    // 2. Save-Data mode or low CPU/RAM heuristics
    const nav = navigator as any
    const isSaveData = Boolean(nav.connection?.saveData)
    const isLowCore = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4
    const isLowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4

    if (isSaveData || (isLowCore && isLowMemory)) {
      return 'lite'
    }

    return 'full'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Listen to OS reduced motion changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleReducedChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setTier('reduced')
      } else {
        // Re-evaluate GPU tier
        evaluateGpuTier()
      }
    }

    mediaQuery.addEventListener('change', handleReducedChange)

    const evaluateGpuTier = async () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setTier('reduced')
        return
      }

      const nav = navigator as any
      if (nav.connection?.saveData) {
        setTier('lite')
        return
      }

      try {
        const gpuTier = await getGPUTier()
        // If low benchmark or unsupported WebGL
        if (gpuTier.tier < 2 || (gpuTier.isMobile && gpuTier.tier < 3)) {
          setTier('lite')
        } else {
          setTier('full')
        }
      } catch {
        // Fallback gracefully on mobile heuristics
        const isMobile = window.innerWidth < 768
        const lowHardware = (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4)
        setTier(isMobile && lowHardware ? 'lite' : 'full')
      }
    }

    evaluateGpuTier()

    return () => {
      mediaQuery.removeEventListener('change', handleReducedChange)
    }
  }, [])

  const value: MotionContextValue = {
    tier,
    isReduced: tier === 'reduced',
    isLite: tier === 'lite',
    isFull: tier === 'full',
  }

  return (
    <MotionContext.Provider value={value}>
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  )
}
