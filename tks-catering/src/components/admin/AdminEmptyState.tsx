import React from 'react'
import { Plus, Calendar, Users, ShoppingBag, UtensilsCrossed } from 'lucide-react'

export interface AdminEmptyStateProps {
  variant?: 'orders' | 'customers' | 'calendar' | 'menu' | 'generic'
  icon?: React.ReactNode
  emoji?: string
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  className?: string
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  variant = 'generic',
  icon,
  emoji,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) => {
  // Preset defaults per variant
  const getPreset = () => {
    switch (variant) {
      case 'orders':
        return {
          icon: <ShoppingBag className="w-8 h-8 text-[var(--brand)]" />,
          title: title || 'No orders found',
          description: description || 'No banquet requests or catering orders match the selected filters.',
          actionLabel: actionLabel || 'Create Manual Order'
        }
      case 'customers':
        return {
          icon: <Users className="w-8 h-8 text-[var(--brand)]" />,
          title: title || 'No customers recorded yet',
          description: description || 'Customers are automatically registered when enquiries are submitted or orders are saved.',
          actionLabel: actionLabel
        }
      case 'calendar':
        return {
          icon: <Calendar className="w-8 h-8 text-[var(--brand)]" />,
          title: title || 'No confirmed bookings on this date',
          description: description || 'Only confirmed orders with banquet schedules appear on the calendar.',
          actionLabel: actionLabel
        }
      case 'menu':
        return {
          icon: <UtensilsCrossed className="w-8 h-8 text-[var(--brand)]" />,
          title: title || 'No dishes in this category',
          description: description || 'Add dishes to this catering category so customers can select them.',
          actionLabel: actionLabel || 'Add Dish'
        }
      case 'generic':
      default:
        return {
          icon: icon || <ShoppingBag className="w-8 h-8 text-[var(--brand)]" />,
          title: title || 'Nothing here yet',
          description: description || 'There are no records to display at this moment.',
          actionLabel
        }
    }
  }

  const preset = getPreset()

  return (
    <div className={`p-8 sm:p-12 rounded-[24px] bg-white border border-dashed border-slate-200 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs ${className}`}>
      {/* Icon Tile with Royal Soft Gradient */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100/70 border border-amber-200/60 flex items-center justify-center shadow-xs select-none">
        {emoji ? (
          <span className="text-3xl">{emoji}</span>
        ) : (
          preset.icon
        )}
      </div>

      {/* Title & Description */}
      <div className="space-y-1.5 max-w-sm">
        <h3 className="font-heading font-black text-base sm:text-lg text-[var(--brand-900)] tracking-tight">
          {preset.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
          {preset.description}
        </p>
      </div>

      {/* Action Buttons */}
      {(preset.actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-2.5 pt-2 flex-wrap justify-center">
          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="h-10 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer tap-target-48 sm:tap-target-auto"
            >
              {secondaryActionLabel}
            </button>
          )}

          {preset.actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="h-10 px-5 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white font-heading font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer tap-target-48 sm:tap-target-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{preset.actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminEmptyState
