import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useMotionTier } from '@/motion/MotionProvider'
import { MOTION_DURATIONS, MOTION_EASINGS } from '@/motion/tokens'

interface FlyItem {
  id: string
  startX: number
  startY: number
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
  const { isFull } = useMotionTier()
  const [activeFlights, setActiveFlights] = useState<FlyItem[]>([])

  const flyItem = useCallback(
    (rect: DOMRect, item: { image?: string; emoji?: string }) => {
      // Optional haptic vibration on Android
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(8)
        } catch {}
      }

      // Fly particle only on full tier
      if (!isFull) return

      const id = `${Date.now()}-${Math.random()}`
      const startX = rect.left + rect.width / 2 - 20
      const startY = rect.top + rect.height / 2 - 20

      setActiveFlights((prev) => [...prev.slice(-3), { id, startX, startY, ...item }])

      setTimeout(() => {
        setActiveFlights((prev) => prev.filter((flight) => flight.id !== id))
      }, (MOTION_DURATIONS.slow + 0.1) * 1000)
    },
    [isFull]
  )

  const targetX = typeof window !== 'undefined' ? window.innerWidth / 2 : 200
  const targetY = typeof window !== 'undefined' ? window.innerHeight - 50 : 600

  return (
    <FlyToBarContext.Provider value={{ flyItem }}>
      {children}
      {/* Floating flying particles overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {activeFlights.map((flight) => (
            <motion.div
              key={flight.id}
              initial={{
                x: flight.startX,
                y: flight.startY,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: targetX,
                y: targetY,
                scale: 0.35,
                opacity: 0.2,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: MOTION_DURATIONS.slow,
                ease: MOTION_EASINGS.entrance,
              }}
              className="absolute top-0 left-0 w-10 h-10 rounded-full overflow-hidden shadow-xl border-2 border-[var(--brand)] bg-white flex items-center justify-center z-50"
            >
              {flight.image ? (
                <img src={flight.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg">{flight.emoji || '🍲'}</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </FlyToBarContext.Provider>
  )
}
