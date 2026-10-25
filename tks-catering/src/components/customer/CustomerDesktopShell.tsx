import React from 'react'
import { Phone, Award, ShieldCheck, Sparkles, Clock } from 'lucide-react'

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
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans relative overflow-x-hidden flex flex-col w-full selection:bg-[var(--brand)] selection:text-white">
      
      {/* ======================================================== */}
      {/* 1. ATMOSPHERIC AMBIENT GLOW (FULL SCREEN BACKGROUND)     */}
      {/* ======================================================== */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/40 via-white/50 to-stone-50/60" />
        
        {/* Soft Crimson Orb on Left */}
        <div 
          className="absolute -top-24 -left-24 w-[600px] h-[600px] rounded-full opacity-10 filter blur-[100px]"
          style={{ background: 'radial-gradient(circle, var(--brand) 0%, transparent 70%)' }}
        />
        {/* Warm Amber Orb on Right */}
        <div 
          className="absolute top-1/4 -right-24 w-[520px] h-[520px] rounded-full opacity-12 filter blur-[100px]"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
        />
        {/* Subtle Bottom Glow */}
        <div 
          className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] rounded-full opacity-8 filter blur-[110px]"
          style={{ background: 'radial-gradient(circle, var(--brand-700) 0%, transparent 70%)' }}
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
        className={`w-full ${maxWidth} flex-1 flex flex-col relative z-0 ${className}`}
      >
        {children}
      </div>

      {/* ======================================================== */}
      {/* 4. LUXURY FULL-SCREEN FOOTER (conditionally rendered)    */}
      {/* ======================================================== */}
      {showFooter && (
        <footer className="w-full bg-white border-t border-slate-200/80 py-8 pb-32 sm:pb-32 px-4 sm:px-6 lg:px-8 mt-auto relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-8 h-8 rounded-lg bg-white shadow-xs p-1 flex items-center justify-center border border-slate-100 shrink-0">
                <img src="/logo-128.webp" alt="TKS Logo" width="32" height="32" decoding="async" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="font-heading font-black text-[var(--brand-900)] text-sm">
                  TKS Iyengars Mysore Catering
                </p>
                <p className="text-[11px] text-[var(--text-muted)] font-medium">
                  142/A, Krishnamurthy Puram, Mysuru, Karnataka 570004
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium">
              <span className="flex items-center gap-1 text-slate-700 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Pure South Indian Vegetarian</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-700 font-bold">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Available 8:00 AM – 9:00 PM IST daily</span>
              </span>
              <span className="text-slate-300">•</span>
              <a href="tel:+919000000000" className="text-[var(--brand)] font-bold hover:underline">
                +91 90000 00000
              </a>
            </div>
          </div>
        </footer>
      )}

    </div>
  )
}

export default CustomerDesktopShell
