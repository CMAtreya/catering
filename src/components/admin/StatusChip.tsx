import React from 'react'
import { motion } from 'motion/react'
import { Sparkles, Clock, CheckCircle2, CheckCheck, XCircle } from 'lucide-react'
import type { OrderStatus } from '@/data/mockData'
import { MOTION_SPRINGS } from '@/motion/tokens'

interface StatusChipProps {
  status: OrderStatus
  size?: 'sm' | 'base'
  className?: string
  layoutId?: string
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  size = 'base',
  className = '',
  layoutId
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'

  const getDetails = (st: OrderStatus) => {
    switch (st) {
      case 'New Request':
        return {
          bg: 'var(--status-new-bg)',
          text: 'var(--status-new-text)',
          border: 'var(--status-new-border)',
          Icon: Sparkles,
          ariaLabel: 'Status: New Request'
        }
      case 'Under Discussion':
        return {
          bg: 'var(--status-discussion-bg)',
          text: 'var(--status-discussion-text)',
          border: 'var(--status-discussion-border)',
          Icon: Clock,
          ariaLabel: 'Status: Under Discussion'
        }
      case 'Confirmed':
        return {
          bg: 'var(--status-confirmed-bg)',
          text: 'var(--status-confirmed-text)',
          border: 'var(--status-confirmed-border)',
          Icon: CheckCircle2,
          ariaLabel: 'Status: Confirmed'
        }
      case 'Completed':
        return {
          bg: 'var(--status-completed-bg)',
          text: 'var(--status-completed-text)',
          border: 'var(--status-completed-border)',
          Icon: CheckCheck,
          ariaLabel: 'Status: Completed'
        }
      case 'Cancelled':
        return {
          bg: 'var(--status-cancelled-bg)',
          text: 'var(--status-cancelled-text)',
          border: 'var(--status-cancelled-border)',
          Icon: XCircle,
          ariaLabel: 'Status: Cancelled'
        }
    }
  }

  const s = getDetails(status)
  const IconComponent = s.Icon

  return (
    <motion.span
      layout
      layoutId={layoutId}
      transition={MOTION_SPRINGS.soft}
      role="status"
      aria-label={s.ariaLabel}
      style={{
        backgroundColor: s.bg,
        color: s.text,
        borderColor: s.border
      }}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border select-none shrink-0 tracking-tight transition-colors duration-200 ${sizeClasses} ${className}`}
    >
      <IconComponent className={`${iconSize} shrink-0 stroke-[2.2]`} aria-hidden="true" />
      <span>{status}</span>
    </motion.span>
  )
}

