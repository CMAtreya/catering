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

    // If selecting, trigger the arc fly to bottom bar and haptics
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
      className={`relative rounded-[22px] p-3 transition-all duration-200 flex flex-col justify-between select-none cursor-pointer group focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none ${
        !isAvailable
          ? 'bg-slate-50 border border-slate-200 opacity-60 cursor-not-allowed'
          : isSelected
          ? 'bg-[var(--brand-soft)] border-2 border-[var(--brand)] shadow-md shadow-[var(--brand-ring)]'
          : 'bg-white border border-slate-200/80 hover:border-[var(--brand-200)] shadow-xs hover:shadow-md'
      }`}
    >
      {/* Top-Left Selected Check Badge */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0, transition: { duration: MOTION_DURATIONS.quick } }}
            transition={MOTION_SPRINGS.tap}
            className="absolute top-2.5 left-2.5 z-20 w-6 h-6 rounded-full bg-[var(--brand)] text-[var(--on-brand)] flex items-center justify-center shadow-md"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food Image Container with 18px Corners */}
      <div className="relative w-full aspect-square rounded-[18px] overflow-hidden bg-slate-100 flex items-center justify-center">
        {/* Shimmer loading placeholder while image loads */}
        {!imageLoaded && item.image && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 z-0" />
        )}

        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            width="240"
            height="240"
            decoding="async"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
              isFull ? 'group-hover:scale-108' : ''
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          /* Offline Gradient + Emoji Fallback per spec */
          <div
            className={`w-full h-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-4xl sm:text-5xl select-none`}
          >
            <span role="img" aria-label={item.name}>
              {item.emoji}
            </span>
          </div>
        )}

        {/* Unavailable overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-10 px-2 text-center">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-slate-700 shadow-sm leading-tight">
              Currently unavailable
            </span>
          </div>
        )}

        {/* Pill ADD / ADDED button overlapping the bottom-right image corner */}
        {isAvailable && (
          <div className="absolute bottom-2 right-2 z-10">
            {isSelected ? (
              <motion.div
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.85 }}
                transition={MOTION_SPRINGS.tap}
                className="h-8 px-3 rounded-full bg-[var(--brand)] text-[var(--on-brand)] font-bold text-xs flex items-center gap-1 shadow-md"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>ADDED</span>
              </motion.div>
            ) : (
              <motion.div
                whileTap={isReduced ? undefined : { scale: 0.94 }}
                transition={MOTION_SPRINGS.tap}
                className="h-8 px-3.5 rounded-full bg-white text-[var(--brand)] border-2 border-[var(--brand)] font-extrabold text-xs flex items-center gap-1 shadow-md hover:bg-[var(--brand-soft)] transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>ADD</span>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Item Details: Title (max 2 lines) & Price */}
      <div className="pt-3 pb-1">
        <h4 className="font-serif font-bold text-sm sm:text-base text-[var(--text-primary)] leading-snug line-clamp-2 min-h-[2.5rem]">
          {item.name}
        </h4>
        <div className="pt-1.5 flex items-baseline gap-1">
          <span className="font-heading font-black text-sm sm:text-base text-[var(--brand-900)]">
            {formatRupees(item.pricePerPlate)}
          </span>
          <span className="text-xs font-normal text-[var(--text-muted)] select-none">
            / plate
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default ItemCard
