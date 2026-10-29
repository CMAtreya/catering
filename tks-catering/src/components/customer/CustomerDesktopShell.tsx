import React from 'react'
import { Phone, Award, ShieldCheck } from 'lucide-react'
import { AppFooter } from '@/components/common/AppFooter'

interface CustomerDesktopShellProps {
  children: React.ReactNode
  maxWidth?: string // fallback or specific max container if needed
  className?: string
  showFooter?: boolean
}

export const CustomerDesktopShell: React.FC<CustomerDesktopShellProps> = ({
  children,
  maxWidth = 'w-full',
  className = '',
  showFooter = true
}) => {
  return (
    <div className="min-h-screen text-[var(--text-primary)] font-sans relative overflow-x-hidden flex flex-col w-full selection:bg-[var(--brand)] selection:text-white">
      
      {/* ======================================================== */}
      {/* 1. MINIMAL MODERN CANVAS BACKGROUND                       */}
      {/* Clean, serene, minimal studio off-white with micro-dot grid */}
      {/* ======================================================== */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
      >
        {/* Layer 1: Clean Minimal Studio Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAFA] via-[#F8F9FA] to-[#F1F3F5]" />

        {/* Layer 2: Ultra-subtle Minimal Architectural Micro-Dot Matrix */}
        <div 
          className="absolute inset-0 opacity-35"
          style={{ 
            backgroundImage: 'radial-gradient(#94A3B8 0.75px, transparent 0.75px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Layer 3: Soft Clean Radial Light Bloom from Top Center */}
        <div 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1400px] h-[600px] rounded-full opacity-70"
          style={{ 
            background: 'radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0) 70%)'
          }}
        />
      </div>

      {/* ======================================================== */}
      {/* 2. DESKTOP HERITAGE TOP ANNOUNCEMENT STRIP (from 1024px) */}
      {/* ======================================================== */}
      <aside 
        aria-label="Heritage catering assurance"
        className="hidden lg:flex w-full bg-[var(--brand-900)] text-[var(--on-brand)] text-xs py-2 px-4 sm:px-6 lg:px-8 xl:px-12 border-b border-amber-950/40 z-20"
      >
        <div className="w-full flex items-center justify-between gap-4 font-medium">
          {/* Left: Heritage & Tradition */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Est. 1998</span>
            </span>
            <span className="text-white/40">•</span>
            <span className="text-white/90">
              Mysuru's Authentic Iyengar Pure Vegetarian Catering & Banquets
            </span>
          </div>

          {/* Right: Guarantee & Direct Contact */}
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>24-Hour Confirmation Response</span>
            </div>
            <span className="text-white/40">•</span>
            <a 
              href="tel:+919000000000"
              className="flex items-center gap-1 text-white hover:text-amber-200 transition-colors font-bold"
            >
              <Phone className="w-3 h-3 text-amber-300" />
              <span>Direct Desk: +91 90000 00000</span>
            </a>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 3. FULL-SCREEN MAIN CONTENT CONTAINER                    */}
      {/* Expands to 100% full screen width on all viewports       */}
      {/* Note: Kept free of CSS transforms to preserve fixed view- */}
      {/* port positioning of sticky bottom bars and drawers.      */}
      {/* ======================================================== */}
      <div 
        className={`w-full ${maxWidth} flex-1 flex flex-col ${className}`}
      >
        {children}
      </div>

      {/* ======================================================== */}
      {/* 4. LUXURY FULL-SCREEN FOOTER (conditionally rendered)    */}
      {/* ======================================================== */}
      {showFooter && <AppFooter />}

    </div>
  )
}

export default CustomerDesktopShell
