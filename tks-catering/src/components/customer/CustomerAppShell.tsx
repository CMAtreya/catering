import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Phone, Clock, ArrowLeft } from 'lucide-react'
import { Toaster } from 'sonner'
import { useEnquiryStore } from '@/store/enquiryStore'

interface CustomerAppShellProps {
  children: React.ReactNode
  title?: string
  showBack?: boolean
  onBack?: () => void
  showHistoryLink?: boolean
}

export const CustomerAppShell: React.FC<CustomerAppShellProps> = ({
  children,
  title,
  showBack = false,
  onBack,
  showHistoryLink = true
}) => {
  const location = useLocation()
  const enquiriesCount = useEnquiryStore((state) => state.enquiries.length)
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans flex flex-col items-center">
      {/* Bottom Toast notifications per spec */}
      <Toaster position="bottom-center" richColors />

      {/* Responsive Container: Max 480px on mobile, centered 960px on desktop */}
      <div className="w-full max-w-[480px] md:max-w-[960px] min-h-screen flex flex-col bg-transparent relative">
        
        {/* Compact Frosted Top Bar */}
        <header className="sticky top-0 z-40 glass-top-bar px-4 py-2.5 transition-all">
          <div className="flex items-center justify-between gap-3">
            
            {/* Left: Back button or Logo + Title */}
            <div className="flex items-center gap-2.5">
              {showBack ? (
                <button
                  onClick={onBack || (() => window.history.back())}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all tap-target-48 text-[var(--text-primary)] -ml-1"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
              ) : (
                <Link to="/" className="flex items-center gap-2.5 group">
                  {/* Logo on white rounded tile to avoid glass clash per spec */}
                  <div className="logo-tile">
                    <img
                      src="/logo-128.webp"
                      alt="TKS Iyengars Logo"
                      width="36"
                      height="36"
                      decoding="async"
                      className="h-8 sm:h-9 w-auto object-contain"
                    />
                  </div>
                </Link>
              )}

              <div>
                <h1 className="font-heading font-black text-sm sm:text-base text-[var(--brand-900)] tracking-tight leading-tight">
                  {title || 'TKS Iyengars Catering'}
                </h1>
                <p className="text-[11px] text-[var(--text-muted)] font-medium leading-none pt-0.5">
                  Vani Vilas Mohalla, Mysuru
                </p>
              </div>
            </div>

            {/* Right: Business Phone & Enquiry History Link */}
            <div className="flex items-center gap-2">
              <a
                href="tel:+919000000000"
                className="w-9 h-9 rounded-full bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center hover:bg-[var(--brand-100)] transition-colors tap-target-48"
                title="Call Restaurant (+91 90000 00000)"
              >
                <Phone className="w-4 h-4" />
              </a>

              {showHistoryLink && (
                <Link
                  to="/enquiries"
                  className={`h-9 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all tap-target-48 border ${
                    location.pathname === '/enquiries'
                      ? 'bg-[var(--brand)] text-[var(--on-brand)] border-[var(--brand)]'
                      : 'bg-white text-[var(--text-primary)] border-[var(--glass-border)] hover:bg-[var(--brand-soft)]'
                  }`}
                  title="My Local Enquiries"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">My Orders</span>
                  {enquiriesCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[var(--brand-2)] text-[var(--on-brand-2)] text-[10px] font-bold flex items-center justify-center shrink-0">
                      {enquiriesCount}
                    </span>
                  )}
                </Link>
              )}
            </div>

          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 pb-24">{children}</main>

        {/* Minimal Footer on Home */}
        {isHome && (
          <footer className="py-6 px-4 text-center text-xs text-[var(--text-muted)] border-t border-slate-200/60 mt-auto">
            <p className="font-semibold text-[var(--brand-800)]">TKS Iyengars Catering System</p>
            <p className="pt-0.5">Pure Vegetarian South Indian Catering in Mysuru • Est. 1998</p>
          </footer>
        )}

      </div>
    </div>
  )
}
