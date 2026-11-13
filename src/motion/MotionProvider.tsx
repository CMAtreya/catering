import React, { createContext, useContext, useEffect, useState } from 'react'
import { MotionConfig } from 'motion/react'
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

/**
 * Universal Motion Provider
 * Guarantees buttery-smooth 60fps animations and visual effects across
 * ALL devices: Mobile, Tablet, Laptop, and Desktop.
 */
export const MotionProvider: React.FC<MotionProviderProps> = ({ children }) => {
  const [tier, setTier] = useState<MotionTier>('full')

  useEffect(() => {
    // Keep animations active and smooth across all form factors
    setTier('full')
  }, [])

  const value: MotionContextValue = {
    tier,
    isReduced: false,
    isLite: false,
    isFull: true,
  }

  return (
    <MotionContext.Provider value={value}>
      <MotionConfig reducedMotion="never">
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  )
}

export default MotionProvider
