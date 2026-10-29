import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { UtensilsCrossed, X, ChevronRight, Check } from 'lucide-react'
import type { Category } from '@/data/mockData'

interface FloatingMenuNavProps {
  categories: Category[]
  activeCategoryId: string
  onSelectCategory: (categoryId: string) => void
  getCategorySelectedCount: (category: Category) => number
  categoryItemCounts?: Record<string, number>
}

export const FloatingMenuNav: React.FC<FloatingMenuNavProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  getCategorySelectedCount,
  categoryItemCounts = {}
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Total selected dishes across categories
  const totalSelected = categories.reduce(
    (sum, cat) => sum + getCategorySelectedCount(cat),
    0
  )

  const handleSelect = (categoryId: string) => {
    onSelectCategory(categoryId)
    setIsOpen(false)
  }

  // Category emoji icons for Mysore catering spread
  const getCategoryEmoji = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes('rice')) return '🍚'
    if (lower.includes('curr')) return '🍲'
    if (lower.includes('sweet') || lower.includes('dessert')) return '🧈'
    if (lower.includes('tiffin') || lower.includes('breakfast')) return '🥞'
    if (lower.includes('bev')) return '☕'
    return '🍽️'
  }

  return (
    <div ref={menuRef} className="fixed bottom-[max(4.85rem,calc(env(safe-area-inset-bottom)+4.35rem))] lg:bottom-[max(0.85rem,env(safe-area-inset-bottom))] left-3 sm:left-4 lg:left-6 z-50">
      
      {/* Floating Menu Trigger Button (Menu Logo only, NO text) */}
      <motion.button
        type="button"
        id="floating-menu-categories-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        whileTap={{ scale: 0.92 }}
        className={`h-11 w-11 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center transition-all shadow-[0_10px_35px_-5px_rgba(0,0,0,0.25),0_2px_8px_rgba(0,0,0,0.12)] border cursor-pointer select-none relative group ${
          isOpen
            ? 'bg-[var(--brand)] text-white border-[var(--brand-700)] rotate-90'
            : 'bg-[var(--brand-900)] hover:bg-[var(--brand)] text-white border-amber-950/40'
        }`}
        aria-label="Catering menu category navigation"
        aria-expanded={isOpen}
        title="Browse Menu Categories"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white stroke-[2.5]" />
        ) : (
          <UtensilsCrossed className="w-5 h-5 text-amber-300 stroke-[2.2] group-hover:scale-110 transition-transform" />
        )}

        {/* Selected count pip badge */}
        {!isOpen && totalSelected > 0 && (
          <span 
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs ring-2 ring-white"
            aria-label={`${totalSelected} items selected`}
          >
            {totalSelected}
          </span>
        )}
      </motion.button>

      {/* Floating Category Options Flyout Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute bottom-13 sm:bottom-15 left-0 w-72 sm:w-80 bg-white/98 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.22),0_4px_16px_rgba(0,0,0,0.08)] p-3.5 space-y-2 select-none overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center text-xs font-black">
                  📖
                </span>
                <div>
                  <h3 className="font-heading font-black text-xs sm:text-sm text-[var(--brand-900)]">
                    Menu Categories
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Tap to jump to banquet course
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {categories.length} sections
              </span>
            </div>

            {/* Category Options List */}
            <div 
              role="menu" 
              aria-label="Catering menu categories"
              className="space-y-1 max-h-[60vh] overflow-y-auto pr-0.5 no-scrollbar"
            >
              {categories.map((category) => {
                const isActive = activeCategoryId === category.id
                const catSelectedCount = getCategorySelectedCount(category)
                const itemCount = categoryItemCounts[category.id]

                return (
                  <button
                    key={category.id}
                    type="button"
                    role="menuitem"
                    onClick={() => handleSelect(category.id)}
                    className={`w-full p-2.5 rounded-2xl flex items-center justify-between gap-2.5 text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[var(--brand-soft)] text-[var(--brand-900)] font-bold ring-1 ring-[var(--brand-200)] shadow-2xs'
                        : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{getCategoryEmoji(category.name)}</span>
                      <div className="min-w-0">
                        <span className="text-xs truncate block">{category.name}</span>
                        {typeof itemCount === 'number' && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            {itemCount} {itemCount === 1 ? 'dish' : 'dishes'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {catSelectedCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-[var(--brand)] text-white">
                          {catSelectedCount}
                        </span>
                      )}
                      {isActive ? (
                        <Check className="w-3.5 h-3.5 text-[var(--brand)] stroke-[2.5]" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FloatingMenuNav

