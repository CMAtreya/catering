import React, { lazy, Suspense } from 'react'
import { useMotionTier } from '@/motion/MotionProvider'

// Lazy-loaded 3D Canvas (excluded from PWA precache)
const LazyHero3DCanvas = lazy(() => import('./Hero3DCanvas'))

/**
 * Static Poster Fallback for Lite, Reduced Motion, Save-Data, and Pre-Hydration
 */
export const Hero3DPoster: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center select-none ${className}`}
      aria-hidden="true"
    >
      {/* Heirloom Brass Lamp SVG Poster Graphic */}
      <svg
        viewBox="0 0 120 160"
        className="w-24 h-32 sm:w-28 sm:h-36 drop-shadow-[0_8px_16px_rgba(182,10,6,0.18)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe680" />
            <stop offset="35%" stopColor="#d49e24" />
            <stop offset="70%" stopColor="#f3ca4d" />
            <stop offset="100%" stopColor="#a37207" />
          </linearGradient>
          <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff3a8" />
            <stop offset="40%" stopColor="#ff9900" />
            <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Halo */}
        <circle cx="60" cy="24" r="22" fill="url(#flameGlow)" opacity="0.65" />

        {/* Ceremonial Flame */}
        <path
          d="M 60 10 C 65 18 67 22 64 26 C 62 29 58 29 56 26 C 53 22 55 18 60 10 Z"
          fill="#ffd861"
        />
        <circle cx="60" cy="23" r="3.5" fill="#ff4d00" />

        {/* Lamp Finial */}
        <path d="M 58 27 L 62 27 L 61 34 L 59 34 Z" fill="url(#brassGrad)" />
        <ellipse cx="60" cy="35" rx="3.5" ry="2" fill="url(#brassGrad)" />

        {/* Agal (Oil Dish) */}
        <ellipse cx="60" cy="48" rx="26" ry="6" fill="url(#brassGrad)" />
        <path
          d="M 34 48 C 34 56 46 62 60 62 C 74 62 86 56 86 48 Z"
          fill="url(#brassGrad)"
        />

        {/* Spindle Column */}
        <ellipse cx="60" cy="66" rx="9" ry="3" fill="url(#brassGrad)" />
        <path d="M 56 66 L 64 66 L 62 88 L 58 88 Z" fill="url(#brassGrad)" />
        <circle cx="60" cy="94" r="7.5" fill="url(#brassGrad)" />
        <path d="M 57 101 L 63 101 L 65 125 L 55 125 Z" fill="url(#brassGrad)" />

        {/* Stepped Base */}
        <ellipse cx="60" cy="126" rx="18" ry="4" fill="url(#brassGrad)" />
        <path d="M 42 126 L 78 126 L 84 138 L 36 138 Z" fill="url(#brassGrad)" />
        <ellipse cx="60" cy="138" rx="25" ry="5.5" fill="url(#brassGrad)" />

        {/* Soft Contact Shadow */}
        <ellipse cx="60" cy="148" rx="28" ry="4" fill="#3a2202" opacity="0.22" />
      </svg>
    </div>
  )
}

interface Hero3DProps {
  className?: string
}

export const Hero3D: React.FC<Hero3DProps> = ({ className = '' }) => {
  const { isFull } = useMotionTier()

  // Full Tier: load dynamic 3D canvas with poster fallback
  if (isFull) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
        <Suspense fallback={<Hero3DPoster />}>
          <LazyHero3DCanvas />
        </Suspense>
      </div>
    )
  }

  // Lite or Reduced Tier: static lightweight poster
  return <Hero3DPoster className={className} />
}

export default Hero3D
