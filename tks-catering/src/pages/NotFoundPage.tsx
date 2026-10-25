import React from 'react'
import { Link } from 'react-router-dom'
import { Utensils, ChevronRight } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] flex flex-col items-center text-center space-y-5">
        
        {/* Logo / 404 Visual */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-white shadow-md p-3 flex items-center justify-center border border-slate-100">
            <img
              src="/logo-128.webp"
              alt="TKS Iyengars Logo"
              width="80"
              height="80"
              decoding="async"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-[var(--brand)] text-[var(--on-brand)] shadow-sm">
            404
          </div>
        </div>

        {/* Heading & Subtext */}
        <div className="space-y-1.5 px-4">
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-[var(--brand-900)] tracking-tight">
            Page not found
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        {/* 'Go to menu' button */}
        <div className="pt-2 w-full max-w-xs">
          <Link
            to="/"
            className="w-full h-12 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[var(--on-brand)] font-heading font-bold text-sm shadow-md flex items-center justify-center gap-2 tap-target-48 transition-all active:scale-[0.99]"
          >
            <Utensils className="w-4 h-4" />
            <span>Go to menu</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>

      </div>
    </div>
  )
}

export default NotFoundPage
