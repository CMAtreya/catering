import React from 'react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  emoji?: string
  icon?: React.ReactNode
  title: string
  description: string
  actionText?: string
  onAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  emoji,
  icon,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 ${className}`}>
      {emoji ? (
        <div className="w-16 h-16 rounded-2xl bg-[var(--brand-soft)] border border-[var(--brand-100)] flex items-center justify-center text-3xl mb-4 shadow-sm select-none">
          {emoji}
        </div>
      ) : icon ? (
        <div className="w-16 h-16 rounded-2xl bg-[var(--brand-soft)] border border-[var(--brand-100)] flex items-center justify-center text-[var(--brand-700)] mb-4 shadow-sm">
          {icon}
        </div>
      ) : null}

      <h3 className="font-heading font-bold text-lg text-[var(--text-primary)] mb-1.5">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <Button
          onClick={onAction}
          className="bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[var(--on-brand)] font-semibold text-xs h-11 px-5 rounded-xl shadow-sm min-h-[48px]"
        >
          {actionText}
        </Button>
      )}
    </div>
  )
}
