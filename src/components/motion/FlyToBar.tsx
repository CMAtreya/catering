import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MOTION_DURATIONS, MOTION_EASINGS } from '@/motion/tokens'

interface FlyItem {
  id: string
  startX: number
  startY: number
  targetX: number
  targetY: number
  image?: string
  emoji?: string
}

interface FlyToBarContextValue {
  flyItem: (rect: DOMRect, item: { image?: string; emoji?: string }) => void
}

const FlyToBarContext = createContext<FlyToBarContextValue>({
  flyItem: () => {},
})

export const useFlyToBar = (): FlyToBarContextValue => useContext(FlyToBarContext)

export const FlyToBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeFlights, setActiveFlights] = useState<FlyItem[]>([])

  const flyItem = useCallback(
    (rect: DOMRect, item: { image?: string; emoji?: string }) => {
      // Optional subtle haptic vibration on touch devices
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(10)
        } catch {}
      }

      const id = `${Date.now()}-${Math.random()}`
      const startX = rect.left + rect.width / 2 - 20
      const startY = rect.top + rect.height / 2 - 20

      // Calculate dynamic target coordinates for mobile, tablet, and desktop
      let targetX = typeof window !== 'undefined' ? window.innerWidth / 2 - 20 : 200
      let targetY = typeof window !== 'undefined' ? window.innerHeight - 60 : 600

      if (typeof document !== 'undefined') {
        const targetEl =
          document.querySelector('[data-floating-bar]') ||
          document.getElementById('floating-order-bar') ||
          document.querySelector('#selected-delicacies-bar')

        if (targetEl) {
          const tRect = targetEl.getBoundingClientRect()
          targetX = tRect.left + tRect.width / 2 - 20
          targetY = tRect.top + tRect.height / 2 - 20
        }
      }

      setActiveFlights((prev) => [
        ...prev.slice(-4),
        { id, startX, startY, targetX, targetY, ...item },
      ])

      setTimeout(() => {
        setActiveFlights((prev) => prev.filter((flight) => flight.id !== id))
      }, (MOTION_DURATIONS.slow + 0.15) * 1000)
    },
    []
  )

  return (
    <FlyToBarContext.Provider value={{ flyItem }}>
      {children}
      {/* Floating flying particles overlay with high z-index and GPU acceleration */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        <AnimatePresence>
          {activeFlights.map((flight) => (
            <motion.div
              key={flight.id}
              initial={{
                x: flight.startX,
                y: flight.startY,
                scale: 1,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: flight.targetX,
                y: flight.targetY,
                scale: 0.3,
                opacity: 0.25,
                rotate: 15,
              }}
              exit={{ opacity: 0, scale: 0.1 }}
              transition={{
                duration: MOTION_DURATIONS.slow,
                ease: MOTION_EASINGS.entrance,
              }}
              style={{ willChange: 'transform, opacity' }}
              className="absolute top-0 left-0 w-11 h-11 rounded-full overflow-hidden shadow-2xl border-2 border-primary bg-white flex items-center justify-center pointer-events-none"
            >
              {flight.image ? (
                <img src={flight.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">{flight.emoji || '🍲'}</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </FlyToBarContext.Provider>
  )
}
