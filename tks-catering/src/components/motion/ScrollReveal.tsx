import React from 'react'
import { motion } from 'motion/react'
import { useMotionTier } from '@/motion/MotionProvider'
import { MOTION_DURATIONS, MOTION_EASINGS } from '@/motion/tokens'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'h2' | 'h3' | 'span' | 'p'
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
}) => {
  const { isReduced, isLite } = useMotionTier()

  if (isReduced) {
    return <div className={className}>{children}</div>
  }

  if (isLite) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{
          duration: MOTION_DURATIONS.quick,
          ease: MOTION_EASINGS.standard,
          delay,
        }}
        className={className}
      >
        {children}
      </motion.div>
    )
  }

  // Full Tier: soft clip-mask reveal
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: '100%', opacity: 0.2 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{
          duration: MOTION_DURATIONS.base,
          ease: MOTION_EASINGS.entrance,
          delay,
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
