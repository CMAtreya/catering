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
    <div ref={menuRef} className="fixed bottom-[max(4.85rem,calc(env(safe-area-inset-bottom)+4.35rem))] lg:bottom-[max(1.3rem,env(safe-area-inset-bottom))] left-[13px] sm:left-[21px] lg:left-[34px] z-50">
      
      {/* Floating Menu Trigger Button (Golden 55px Fibonacci Squircle, Logo only) */}
      <motion.button
        type="button"
        id="floating-menu-categories-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        whileTap={{ scale: 0.92 }}
        className={`h-[48px] w-[48px] sm:h-[55px] sm:w-[55px] rounded-[16px] sm:rounded-[21px] flex items-center justify-center transition-all shadow-[0_10px_35px_-5px_rgba(0,0,0,0.25),0_2px_8px_rgba(0,0,0,0.12)] border cursor-pointer select-none relative group ${
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
          <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 stroke-[2.2] group-hover:scale-110 transition-transform" />
        )}

        {/* Selected count pip badge */}
        {!isOpen && totalSelected > 0 && (
          <span 
            className="absolute -top-[3px] -right-[3px] min-w-[21px] h-[21px] px-[5px] rounded-full bg-emerald-600 text-white text-golden-xs font-black flex items-center justify-center shadow-xs ring-2 ring-white"
            aria-label={`${totalSelected} items selected`}
          >
            {totalSelected}
          </span>
        )}
      </motion.button>

      {/* Floating Category Options Flyout Panel (Golden Rectangle proportions) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 13, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 13, scale: 0.95 }}
            transition={{ duration: 0.21, ease: 'easeOut' }}
            className="absolute bottom-[58px] sm:bottom-[68px] left-0 w-[280px] sm:w-[320px] bg-white/98 backdrop-blur-xl rounded-[21px] border border-slate-200/90 shadow-[0_21px_55px_-10px_rgba(0,0,0,0.22),0_5px_21px_rgba(0,0,0,0.08)] p-[13px] space-y-[8px] select-none overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-[8px] border-b border-slate-100 px-[5px]">
              <div className="flex items-center gap-[8px]">
                <span className="w-[26px] h-[26px] rounded-[8px] bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center text-xs font-black">
                  📖
                </span>
                <div>
                  <h3 className="font-heading font-black text-golden-sm sm:text-golden-base text-[var(--brand-900)]">
                    Menu Categories
                  </h3>
                  <p className="text-golden-xs text-slate-500 font-medium">
                    Tap to jump to banquet course
                  </p>
                </div>
              </div>
              <span className="text-golden-xs font-bold text-slate-400 bg-slate-100 px-[8px] py-[2px] rounded-full">
                {categories.length} sections
              </span>
            </div>

            {/* Category Options List */}
            <div 
              role="menu" 
              aria-label="Catering menu categories"
              className="space-y-[5px] max-h-[60vh] overflow-y-auto pr-0.5 no-scrollbar"
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
                    className={`w-full p-[10px] rounded-[13px] flex items-center justify-between gap-[10px] text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[var(--brand-soft)] text-[var(--brand-900)] font-bold ring-1 ring-[var(--brand-200)] shadow-2xs'
                        : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-[10px] min-w-0">
                      <span className="text-base shrink-0">{getCategoryEmoji(category.name)}</span>
                      <div className="min-w-0">
                        <span className="text-golden-sm truncate block">{category.name}</span>
                        {typeof itemCount === 'number' && (
                          <span className="text-golden-xs text-slate-400 font-normal">
                            {itemCount} {itemCount === 1 ? 'dish' : 'dishes'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-[5px] shrink-0">
                      {catSelectedCount > 0 && (
                        <span className="px-[8px] py-[2px] rounded-full text-golden-xs font-black bg-[var(--brand)] text-white">
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

