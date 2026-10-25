import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, Plus } from 'lucide-react'
import type { MenuItem } from '@/data/mockData'
import { formatRupees } from '@/lib/format'
import { useDraftStore } from '@/store/draftStore'
import { useMotionTier } from '@/motion/MotionProvider'
import { useFlyToBar } from '@/components/motion/FlyToBar'
import { MOTION_SPRINGS, MOTION_DURATIONS } from '@/motion/tokens'

interface ItemCardProps {
  item: MenuItem
  isSelected?: boolean
  onToggle?: (item: MenuItem) => void
}

/**
 * Instamart / Zepto / Blinkit style compact food product card
 * Features:
 * - Ultra-compact, dense layout for phone screens
 * - Iconic green pure-veg dot indicator
 * - Crisp corner ADD / ADDED button pill
 * - Clear 2-line title and prominent per-plate price
 */
export const ItemCard: React.FC<ItemCardProps> = ({ 
  item, 
  isSelected: controlledSelected, 
  onToggle: controlledToggle 
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const { isReduced, isFull } = useMotionTier()
  const { flyItem } = useFlyToBar()

  const storeSelected = useDraftStore((state) => !!state.items[item.id])
  const storeToggle = useDraftStore((state) => state.toggleItem)

  const isSelected = controlledSelected !== undefined ? controlledSelected : storeSelected
  const toggleItem = controlledToggle || storeToggle
  const [imageLoaded, setImageLoaded] = useState(false)

  const isAvailable = item.available

  const handleCardClick = (e: React.MouseEvent) => {
    if (!isAvailable) return
    e.stopPropagation()

    // Trigger fly-to-bar animation on selection
    if (!isSelected && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      flyItem(rect, { image: item.image, emoji: item.emoji })
    }

    toggleItem(item)
  }

  return (
    <motion.div
      ref={cardRef}
      role="checkbox"
      aria-checked={isSelected}
      aria-disabled={!isAvailable}
      aria-label={`${item.name}, ${formatRupees(item.pricePerPlate)} per plate${isSelected ? ', selected' : ''}${!isAvailable ? ', currently unavailable' : ''}`}
      tabIndex={isAvailable ? 0 : -1}
      onClick={handleCardClick}
      whileTap={isReduced || !isAvailable ? undefined : { scale: 0.97 }}
      transition={MOTION_SPRINGS.tap}
      onKeyDown={(e) => {
        if (!isAvailable) return
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          if (!isSelected && cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect()
            flyItem(rect, { image: item.image, emoji: item.emoji })
          }
          toggleItem(item)
        }
      }}
      className={`relative rounded-xl sm:rounded-2xl p-1.5 sm:p-2 transition-all duration-200 flex flex-col justify-between select-none cursor-pointer group focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none ${
        !isAvailable
          ? 'bg-slate-50 border border-slate-200/80 opacity-60 cursor-not-allowed'
          : isSelected
          ? 'bg-amber-50/50 border-2 border-[var(--brand)] shadow-xs ring-1 ring-[var(--brand)]/20'
          : 'bg-white border border-slate-200/70 hover:border-slate-300 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-sm'
      }`}
    >
      {/* Top-Right Selected Check Badge */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0, transition: { duration: MOTION_DURATIONS.quick } }}
            transition={MOTION_SPRINGS.tap}
            className="absolute top-1 right-1 z-20 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[var(--brand)] text-white flex items-center justify-center shadow-xs"
          >
            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food Image Container */}
      <div className="relative w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100/90">
        
        {/* Pure Vegetarian Green Indicator Symbol (Quick-Commerce Standard) */}
        <div 
          aria-hidden="true" 
          className="absolute top-1 left-1 z-10 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2.5px] border border-emerald-600 bg-white/95 flex items-center justify-center shadow-2xs pointer-events-none"
        >
          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-600" />
        </div>

        {/* Shimmer loading placeholder while image loads */}
        {!imageLoaded && item.image && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 z-0" />
        )}

        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            width="200"
            height="200"
            decoding="async"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-300 ease-out ${
              isFull ? 'group-hover:scale-105' : ''
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          /* Offline Gradient + Emoji Fallback */
          <div
            className={`w-full h-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl sm:text-3xl select-none`}
          >
            <span role="img" aria-label={item.name}>
              {item.emoji}
            </span>
          </div>
        )}

        {/* Unavailable overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-10 px-1 text-center">
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white text-slate-700 shadow-xs leading-tight">
              Unavailable
            </span>
          </div>
        )}

        {/* Instamart / Zepto Style ADD button pill overlapping image */}
        {isAvailable && (
          <div className="absolute bottom-1 right-1 z-10">
            {isSelected ? (
              <motion.div
                initial={{ scale: 0.88 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.88 }}
                transition={MOTION_SPRINGS.tap}
                className="h-5.5 sm:h-6.5 px-2 rounded-md sm:rounded-lg bg-[var(--brand)] text-white font-heading font-black text-[9px] sm:text-[10px] flex items-center gap-0.5 shadow-xs"
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                <span>ADDED</span>
              </motion.div>
            ) : (
              <motion.div
                whileTap={isReduced ? undefined : { scale: 0.94 }}
                transition={MOTION_SPRINGS.tap}
                className="h-5.5 sm:h-6.5 px-2 sm:px-2.5 rounded-md sm:rounded-lg bg-white/95 backdrop-blur-xs text-[var(--brand)] border border-[var(--brand)]/80 hover:bg-[var(--brand)] hover:text-white font-heading font-black text-[9px] sm:text-[10px] flex items-center gap-0.5 shadow-xs transition-colors"
              >
                <span>ADD</span>
                <Plus className="w-2.5 h-2.5 stroke-[2.5]" />
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Item Details: Title (2 lines) & Price */}
      <div className="pt-1.5 pb-0.5 flex flex-col justify-between flex-1">
        <h4 className="font-heading font-bold text-[11px] sm:text-xs text-slate-800 leading-tight line-clamp-2 min-h-[1.75rem]">
          {item.name}
        </h4>
        <div className="pt-1 flex items-baseline gap-1">
          <span className="font-heading font-black text-xs sm:text-[13px] text-[var(--brand-900)]">
            {formatRupees(item.pricePerPlate)}
          </span>
          <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 select-none">
            / plate
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default ItemCard
