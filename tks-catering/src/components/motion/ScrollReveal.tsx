import React from 'react'
import { motion } from 'motion/react'
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{
        duration: MOTION_DURATIONS.quick,
        ease: MOTION_EASINGS.standard,
        delay,
      }}
      style={{ willChange: 'transform, opacity' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default ScrollReveal
