import React from 'react'
import { Globe, PhoneCall } from 'lucide-react'
import type { OrderSource } from '@/data/mockData'

interface SourceChipProps {
  source: OrderSource
  size?: 'sm' | 'base'
  className?: string
}

export const SourceChip: React.FC<SourceChipProps> = ({
  source,
  size = 'base',
  className = ''
}) => {
  const isOnline = source === 'Online'
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border select-none shrink-0 tracking-tight ${sizeClasses} ${
        isOnline
          ? 'bg-blue-50 text-blue-700 border-blue-200'
          : 'bg-stone-100 text-stone-700 border-stone-200'
      } ${className}`}
    >
      {isOnline ? (
        <Globe className="w-3 h-3 text-blue-600 shrink-0" />
      ) : (
        <PhoneCall className="w-3 h-3 text-stone-600 shrink-0" />
      )}
      <span>{source}</span>
    </span>
  )
}
