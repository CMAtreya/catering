import React from 'react'
import { motion } from 'motion/react'
import { useMotionTier } from '@/motion/MotionProvider'
import { getPageTransitionVariants } from '@/motion/tokens'

interface PageTransitionProps {
  children: React.ReactNode
  direction?: 'forward' | 'back' | 'admin'
  className?: string
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  direction = 'forward',
  className = '',
}) => {
  const { tier } = useMotionTier()
  const variants = getPageTransitionVariants(tier, direction)

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  )
}
