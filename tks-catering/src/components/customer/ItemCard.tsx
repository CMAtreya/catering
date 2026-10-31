import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
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
 * Authentic Mysuru Heritage Food Card
 * Designed with pure vegetarian indicator, heritage badges, Fraunces serif headlines,
 * and a strictly consistent, beautifully aligned Add to Feast button across all cards.
 */
export const ItemCard: React.FC<ItemCardProps> = ({ 
  item, 
  isSelected: controlledSelected, 
  onToggle: controlledToggle 
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const { isReduced } = useMotionTier()
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
      aria-label={`${item.name}, ${formatRupees(item.pricePerPlate)} per plate${isSelected ? ', selected in feast' : ''}${!isAvailable ? ', currently unavailable' : ''}`}
      tabIndex={isAvailable ? 0 : -1}
      onClick={handleCardClick}
      whileTap={isReduced || !isAvailable ? undefined : { scale: 0.98 }}
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
      className={`group relative rounded-[20px] p-3.5 flex flex-col justify-between select-none cursor-pointer transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
        !isAvailable
          ? 'bg-surface-container-low border border-outline-variant/30 opacity-60 cursor-not-allowed'
          : isSelected
          ? 'bg-surface-container-lowest border-2 border-secondary-container/90 shadow-[0_8px_24px_-4px_rgba(253,182,71,0.25)] ring-2 ring-secondary-container/30'
          : 'bg-surface-container-lowest border border-outline-variant/15 shadow-[0_4px_20px_-4px_rgba(40,23,20,0.04)] hover:shadow-lg hover:border-outline-variant/35 hover:-translate-y-0.5'
      }`}
    >
      {/* Food Image Container */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-surface-container-low">
        {/* Shimmer loading placeholder */}
        {!imageLoaded && item.image && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface-container-low via-surface-container-lowest to-surface-container-low z-0" />
        )}

        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            width="320"
            height="240"
            decoding="async"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).src = '/default-dish.svg'
              setImageLoaded(true)
            }}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${item.gradient || 'from-amber-50 to-orange-100'} flex items-center justify-center p-4 select-none`}
          >
            <img
              src="/default-dish.svg"
              alt={item.name}
              className="w-16 h-16 object-contain"
            />
          </div>
        )}

        {/* Pure Vegetarian Green Indicator Symbol */}
        <div 
          aria-hidden="true" 
          className="absolute top-2.5 left-2.5 bg-surface/90 backdrop-blur-xs p-1 rounded-md shadow-xs border border-outline-variant/20 flex items-center justify-center pointer-events-none"
        >
          <div className="w-3.5 h-3.5 border-2 border-[#006632] flex items-center justify-center rounded-xs">
            <div className="w-2 h-2 rounded-full bg-[#006632]" />
          </div>
        </div>

        {/* Selected "In Feast" Badge */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0, transition: { duration: MOTION_DURATIONS.quick } }}
              transition={MOTION_SPRINGS.tap}
              className="absolute top-2.5 right-2.5 bg-secondary-container/95 text-on-secondary-container text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs border border-secondary/30 pointer-events-none"
            >
              <span className="material-symbols-outlined text-[13px]">check_circle</span>
              <span>In Feast</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Heritage Tag badge (bottom left of image) */}
        {item.heritageTag && (
          <div className="absolute bottom-2.5 left-2.5 bg-surface-container-lowest/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-on-surface flex items-center gap-1 shadow-xs border border-outline-variant/10 pointer-events-none">
            <span className="material-symbols-outlined text-[12px] text-primary">local_fire_department</span>
            <span>{item.heritageTag}</span>
          </div>
        )}

        {/* Unavailable overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-[2px] flex items-center justify-center z-10 px-2 text-center">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-surface text-on-surface shadow-sm leading-tight">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Item Details: Equalized heights for pixel-perfect card alignment */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-headline font-bold text-base sm:text-lg text-primary tracking-tight leading-snug group-hover:text-primary-container transition-colors line-clamp-1 min-h-[1.75rem]">
            {item.name}
          </h3>
          {item.description ? (
            <p className="text-xs text-on-surface-variant/80 font-normal mt-1 line-clamp-2 leading-relaxed min-h-[2.5rem]">
              {item.description}
            </p>
          ) : (
            <div className="min-h-[2.5rem]" />
          )}
        </div>

        {/* Bottom portion price & Consistent Add to Feast CTA button strictly on a single line */}
        <div className="pt-3 border-t border-outline-variant/10 flex items-center justify-between mt-3 gap-2">
          <div className="flex items-baseline gap-1 whitespace-nowrap">
            <span className="font-headline font-bold text-base sm:text-lg text-primary">
              {formatRupees(item.pricePerPlate)}
            </span>
            <span className="text-xs text-outline font-medium">/ plate</span>
          </div>

          {isAvailable && (
            <div aria-hidden="true" className="shrink-0">
              {isSelected ? (
                <div
                  role="presentation"
                  onClick={handleCardClick}
                  className="h-8 px-3 sm:px-3.5 rounded-lg bg-primary hover:bg-primary-container text-white border border-primary text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer select-none whitespace-nowrap shrink-0"
                >
                  <span className="material-symbols-outlined text-[15px] shrink-0">check</span>
                  <span className="whitespace-nowrap">Added to Feast</span>
                </div>
              ) : (
                <div
                  role="presentation"
                  onClick={handleCardClick}
                  className="h-8 px-3 sm:px-3.5 rounded-lg bg-surface-container-low hover:bg-primary-fixed/40 text-primary border border-primary/25 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer select-none whitespace-nowrap shrink-0"
                >
                  <span className="material-symbols-outlined text-[15px] shrink-0">add</span>
                  <span className="whitespace-nowrap">Add to Feast</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ItemCard
