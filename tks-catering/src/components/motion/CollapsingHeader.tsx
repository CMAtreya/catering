import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt } from 'lucide-react'
import type { Category } from '@/data/mockData'

interface CollapsingHeaderProps {
  categories?: Category[]
  activeCategoryId?: string
  onSelectCategory?: (categoryId: string) => void
  getCategorySelectedCount?: (category: Category) => number
  enquiriesCount?: number
}

export const CollapsingHeader: React.FC<CollapsingHeaderProps> = ({
  enquiriesCount = 0,
}) => {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll collapse progress between 0 and 100px scroll
  const collapseProgress = Math.min(Math.max(scrollY / 100, 0), 1)

  return (
    <header className="sticky top-0 z-30 w-full transition-all">
      {/* 
        Layer 1: Pre-blurred glass background layer.
        Rule: never animate blur radius per frame (fade a pre-blurred layer instead)
      */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-150"
        style={{
          opacity: 0.85 + collapseProgress * 0.15,
          background: 'color-mix(in srgb, var(--brand) 2%, rgba(255, 255, 255, 0.94))',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: `1px solid color-mix(in srgb, var(--brand) ${Math.round(6 + collapseProgress * 6)}%, rgba(0, 0, 0, 0.08))`,
          boxShadow: collapseProgress > 0.4 ? '0 4px 20px -2px rgba(0, 0, 0, 0.04)' : 'none',
        }}
      />

      {/* Main Top Bar */}
      <div className="relative px-4 sm:px-6 lg:px-8 xl:px-12 py-2.5 w-full flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white shadow-xs p-1 flex items-center justify-center shrink-0 border border-slate-100">
              <img
                src="/logo-128.webp"
                alt="TKS Iyengars Logo"
                width="36"
                height="36"
                decoding="async"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif font-bold text-base sm:text-lg lg:text-xl text-[var(--brand-900)] tracking-tight leading-tight">
                  TKS Iyengars
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--brand-2-700)] bg-[var(--brand-2-soft)] px-1.5 py-0.5 rounded-full border border-[var(--brand-2-200)] hidden sm:inline-block">
                  Catering
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-medium leading-none pt-0.5">
                Authentic South Indian Vegetarian Feasts
              </p>
            </div>
          </Link>
        </div>

        {/* Right: Icon button 'My enquiries' with brand dot */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/enquiries"
            className="relative h-10 px-3 sm:px-4 rounded-full flex items-center gap-2 bg-white/70 hover:bg-white border border-slate-200/80 shadow-2xs active:scale-95 transition-all tap-target-48 text-[var(--text-primary)]"
            aria-label="My enquiries"
            title="My enquiries"
          >
            <Receipt className="w-4 h-4 text-[var(--brand)] stroke-[2.2]" />
            <span className="text-xs font-bold text-[var(--brand-900)] hidden sm:inline">My Enquiries</span>
            {enquiriesCount > 0 && (
              <span
                className="w-2 h-2 rounded-full bg-[var(--brand)] ring-2 ring-white"
                aria-label="New enquiry updates"
              />
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
