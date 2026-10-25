import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
  fullScreen?: boolean
}

/**
 * Reusable Generic Error with Retry Component
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We could not complete your request. Please check your connection and try again.',
  onRetry,
  retryLabel = 'Retry',
  className = '',
  fullScreen = false
}) => {
  const content = (
    <div
      className={`content-card p-6 rounded-[24px] bg-white border border-slate-200/80 shadow-sm flex flex-col items-center text-center max-w-sm mx-auto space-y-4 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[var(--status-cancelled-bg)] text-[var(--status-cancelled-text)] border border-[var(--status-cancelled-border)] flex items-center justify-center shadow-xs">
        <AlertCircle className="w-7 h-7 stroke-[2.2]" />
      </div>

      <div className="space-y-1">
        <h3 className="font-heading font-black text-lg text-[var(--text-primary)]">
          {title}
        </h3>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          {message}
        </p>
      </div>

      {onRetry && (
        <Button
          onClick={onRetry}
          className="h-11 px-6 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[var(--on-brand)] font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 tap-target-48"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{retryLabel}</span>
        </Button>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        {content}
      </div>
    )
  }

  return content
}

export default ErrorState
