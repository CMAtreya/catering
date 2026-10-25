import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { PriceText } from '@/components/ui/price-text'
import { useDraftStore } from '@/store/draftStore'

interface BottomActionBarProps {
  actionLabel?: string
  onAction: () => void
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  showAlways?: boolean
  className?: string
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  actionLabel = 'Review Requirements',
  onAction,
  secondaryAction,
  showAlways = false,
  className = ''
}) => {
  const totalItemsCount = useDraftStore((state) => state.getTotalItemsCount())
  const perPlateTotal = useDraftStore((state) => state.getPerPlateTotal())
  const guestCount = useDraftStore((state) => state.requirements.guestCount)

  const isVisible = showAlways || totalItemsCount > 0

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className={`fixed bottom-0 left-0 right-0 z-40 glass-bottom-bar px-4 py-3 sm:py-3.5 transition-all ${className}`}
        >
          <div className="max-w-md md:max-w-xl mx-auto flex items-center justify-between gap-3">
            {/* Left: Summary Count & Pricing */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-soft)] border border-[var(--brand-200)] flex items-center justify-center shrink-0 text-[var(--brand)]">
                <ShoppingBag className="w-5 h-5" />
              </div>

              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                    {totalItemsCount} {totalItemsCount === 1 ? 'dish' : 'dishes'} selected
                  </span>
                </div>
                <div className="flex items-baseline gap-1 pt-0.5">
                  <PriceText amount={perPlateTotal} size="sm" suffix="/ plate" highlight />
                  {guestCount > 0 && (
                    <span className="text-[11px] text-[var(--text-muted)] hidden xs:inline">
                      ({guestCount} guests)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {secondaryAction && (
                <button
                  onClick={secondaryAction.onClick}
                  className="px-3.5 py-2.5 rounded-full text-xs font-semibold text-[var(--text-primary)] hover:bg-black/5 transition-colors tap-target-48"
                >
                  {secondaryAction.label}
                </button>
              )}

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onAction}
                className="bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[var(--on-brand)] font-bold text-xs sm:text-sm px-5 py-3 rounded-full flex items-center gap-2 shadow-md tap-target-48 transition-colors shrink-0"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
