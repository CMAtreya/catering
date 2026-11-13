/**
 * TKS Iyengars Catering — Master Motion System Tokens
 * Quiet luxury motion design system:
 * - Durations: instant (120ms), quick (200ms), base (320ms), slow (600ms), hero (900ms)
 * - Easings: standard cubic-bezier(0.2, 0.8, 0.2, 1), entrance cubic-bezier(0.16, 1, 0.3, 1)
 * - Springs: tap/sheet (380/32), soft layout (170/26)
 * - Rules: transform and opacity only; no blur per frame; stagger 40-60ms capped at 8 items
 */

export const MOTION_DURATIONS = {
  instant: 0.12,
  quick: 0.20,
  base: 0.32,
  slow: 0.60,
  hero: 0.90,
} as const

export const MOTION_EASINGS = {
  /** Standard easing for micro-interactions: cubic-bezier(0.2, 0.8, 0.2, 1) */
  standard: [0.2, 0.8, 0.2, 1] as const,
  /** Entrance curve for reveals and sheets: cubic-bezier(0.16, 1, 0.3, 1) */
  entrance: [0.16, 1, 0.3, 1] as const,
} as const

export const MOTION_SPRINGS = {
  /** Responsive tap & bottom sheet spring */
  tap: {
    type: 'spring' as const,
    stiffness: 380,
    damping: 32,
  },
  /** Softer spring for shared-layout transitions and page moves */
  soft: {
    type: 'spring' as const,
    stiffness: 170,
    damping: 26,
  },
} as const

export const MOTION_STAGGER = {
  delay: 0.05,
  maxItems: 8,
} as const

export type MotionTier = 'full' | 'lite' | 'reduced'

/**
 * Standard transition configurations scaled by Tier
 */
export const getTransition = (
  tier: MotionTier,
  type: 'instant' | 'quick' | 'base' | 'slow' | 'hero' | 'spring' | 'softSpring' = 'base'
) => {
  if (tier === 'reduced') {
    return { duration: MOTION_DURATIONS.instant, ease: 'linear' }
  }

  if (tier === 'lite') {
    if (type === 'spring' || type === 'softSpring') {
      return { duration: MOTION_DURATIONS.quick, ease: MOTION_EASINGS.standard }
    }
    return {
      duration: Math.min(MOTION_DURATIONS[type] || MOTION_DURATIONS.quick, MOTION_DURATIONS.base),
      ease: MOTION_EASINGS.standard,
    }
  }

  // Full Tier
  if (type === 'spring') return MOTION_SPRINGS.tap
  if (type === 'softSpring') return MOTION_SPRINGS.soft
  return {
    duration: MOTION_DURATIONS[type],
    ease: type === 'hero' || type === 'slow' ? MOTION_EASINGS.entrance : MOTION_EASINGS.standard,
  }
}

/**
 * Reusable Card / Item Entrance variants respecting Motion Tier
 */
export const getItemEntranceVariants = (tier: MotionTier, index = 0) => {
  const clampedIndex = Math.min(index, MOTION_STAGGER.maxItems - 1)
  const staggerDelay = clampedIndex * MOTION_STAGGER.delay

  if (tier === 'reduced') {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: MOTION_DURATIONS.instant } },
    }
  }

  if (tier === 'lite') {
    return {
      hidden: { opacity: 0, y: 8 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: MOTION_DURATIONS.quick,
          ease: MOTION_EASINGS.standard,
          delay: staggerDelay * 0.5,
        },
      },
    }
  }

  // Full Tier
  return {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 280,
        damping: 24,
        delay: staggerDelay,
      },
    },
  }
}

/**
 * Shared-axis page transitions: forward slides left, back slides right
 */
export const getPageTransitionVariants = (tier: MotionTier, direction: 'forward' | 'back' | 'admin' = 'forward') => {
  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches)

  // Per specification: simple fade on touch devices to avoid gesture fights; instant on reduced
  if (tier === 'reduced' || (direction !== 'admin' && isTouchDevice)) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: MOTION_DURATIONS.quick } },
      exit: { opacity: 0, transition: { duration: MOTION_DURATIONS.instant } },
    }
  }

  if (direction === 'admin') {
    // Admin experience: quick fades with a 12px slide
    const slideOffset = 12
    return {
      initial: { opacity: 0, y: slideOffset },
      animate: {
        opacity: 1,
        y: 0,
        transition: { duration: MOTION_DURATIONS.quick, ease: MOTION_EASINGS.standard },
      },
      exit: {
        opacity: 0,
        y: -slideOffset,
        transition: { duration: MOTION_DURATIONS.instant, ease: MOTION_EASINGS.standard },
      },
    }
  }

  // Customer shared-axis page transitions
  const distance = tier === 'lite' ? 24 : 48
  const xOffset = direction === 'forward' ? distance : -distance

  return {
    initial: { opacity: 0, x: xOffset },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: MOTION_DURATIONS.base,
        ease: MOTION_EASINGS.entrance,
      },
    },
    exit: {
      opacity: 0,
      x: -xOffset * 0.7,
      transition: {
        duration: MOTION_DURATIONS.quick,
        ease: MOTION_EASINGS.standard,
      },
    },
  }
}
