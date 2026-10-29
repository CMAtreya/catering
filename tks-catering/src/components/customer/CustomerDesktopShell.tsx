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
      {/* 1. ATMOSPHERIC AMBIENT GLOW & TEXTURED HERITAGE BACKGROUND */}
      {/* Same theme as TKS logo: Ceremonial Crimson & Marigold Gold */}
      {/* ======================================================== */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
      >
        {/* Layer 1: Warm Light Ivory Royal Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFFFFF] via-[#FFFDF9] to-[#FAF7F2]" />

        {/* Layer 2: Repeating Royal Mysore Kolam & Silk Weave Texture (Low-intensity watermark) */}
        <div 
          className="absolute inset-0 bg-repeat opacity-45 mix-blend-multiply"
          style={{ 
            backgroundImage: "url('/heritage-texture.svg')",
            backgroundSize: '120px 120px'
          }}
        />

        {/* Layer 3: Tactile Handmade Cotton Paper / Parchment Grain */}
        <div 
          className="absolute inset-0 bg-repeat opacity-20 mix-blend-overlay"
          style={{ 
            backgroundImage: "url('/paper-grain.svg')",
            backgroundSize: '200px 200px'
          }}
        />

        {/* Layer 4: Soft Ceremonial Crimson Ambient Orb on Left (Logo Primary) */}
        <div 
          className="absolute -top-28 -left-28 w-[640px] h-[640px] rounded-full opacity-[0.06] filter blur-[120px]"
          style={{ background: 'radial-gradient(circle, var(--brand) 0%, transparent 70%)' }}
        />

        {/* Layer 5: Warm Marigold Gold Ambient Orb on Right (Logo Secondary) */}
        <div 
          className="absolute top-1/4 -right-28 w-[560px] h-[560px] rounded-full opacity-[0.08] filter blur-[120px]"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, #ffd861 40%, transparent 70%)' }}
        />

        {/* Layer 6: Subtle Ceremonial Crimson Base Orb at Bottom */}
        <div 
          className="absolute -bottom-36 left-1/3 w-[640px] h-[640px] rounded-full opacity-[0.05] filter blur-[130px]"
          style={{ background: 'radial-gradient(circle, var(--brand-700) 0%, transparent 70%)' }}
        />

        {/* Layer 7: Subtle Perimeter Vignette Accent */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 140px rgba(180, 83, 9, 0.018)'
          }}
        />
      </div>

      {/* ======================================================== */}
      {/* 2. DESKTOP HERITAGE TOP ANNOUNCEMENT STRIP (from 1024px) */}
      {/* ======================================================== */}
      <aside 
        aria-label="Heritage catering assurance"
        className="hidden lg:flex w-full bg-[var(--brand-900)] text-[var(--on-brand)] text-xs py-2 px-6 border-b border-amber-950/40 z-20"
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4 font-medium">
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
