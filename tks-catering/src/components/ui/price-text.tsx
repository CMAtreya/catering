import React from 'react'
import { formatRupees } from '@/lib/format'

interface PriceTextProps {
  amount: number
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'
  suffix?: string
  className?: string
  highlight?: boolean
}

export const PriceText: React.FC<PriceTextProps> = ({
  amount,
  size = 'base',
  suffix,
  className = '',
  highlight = false
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base font-semibold',
    lg: 'text-lg font-bold',
    xl: 'text-xl font-bold tracking-tight',
    '2xl': 'text-2xl sm:text-3xl font-black tracking-tight'
  }[size]

  return (
    <span
      className={`inline-flex items-baseline gap-1 font-sans ${sizeClasses} ${
        highlight ? 'text-[var(--brand)]' : 'text-[var(--text-primary)]'
      } ${className}`}
    >
      <span>{formatRupees(amount)}</span>
      {suffix && (
        <span className="text-xs font-normal text-[var(--text-muted)] select-none">
          {suffix}
        </span>
      )}
    </span>
  )
}
