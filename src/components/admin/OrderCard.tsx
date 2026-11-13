import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Calendar, Users, Clock, ChevronRight, Check } from 'lucide-react'
import type { Order } from '@/data/mockData'
import { StatusChip } from '@/components/admin/StatusChip'
import { MOTION_SPRINGS } from '@/motion/tokens'

interface OrderCardProps {
  order: Order
  showTimeReceived?: boolean
  onConfirm?: (orderId: string, e: React.MouseEvent) => void
}

/**
 * Helper to format ISO timestamp into human-readable relative/compact time
 */
export function formatTimeReceived(isoString: string): string {
  try {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 5) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    })
  } catch {
    return 'Recently'
  }
}

/**
 * Helper to format event date: 'Sat, 14 Nov 2026'
 */
export function formatEventDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  showTimeReceived = true,
  onConfirm
}) => {
  const [isConfirming, setIsConfirming] = useState(false)
  const [showBurst, setShowBurst] = useState(false)

  const canQuickConfirm = Boolean(order.eventDate && order.eventDate.trim() && order.guestCount && order.guestCount > 0)

  const handleConfirmClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!canQuickConfirm || isConfirming) return
    setIsConfirming(true)
    setShowBurst(true)
    setTimeout(() => {
      onConfirm?.(order.id, e)
    }, 280)
  }

  return (
    <motion.div
      layout
      layoutId={`admin-order-card-${order.id}`}
      transition={MOTION_SPRINGS.soft}
      className="relative rounded-[20px]"
    >
      <Link
        to={`/admin/orders/${order.id}`}
        className="flex flex-col group content-card bg-white border border-slate-200/80 rounded-[20px] p-4 sm:p-4.5 hover:border-[var(--brand-300)] hover:shadow-md transition-all active:scale-[0.99] overflow-hidden"
      >
        {/* Top Row: Customer Name & Status/Source Chips */}
        <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="min-w-0 flex-1">
            <h4 className="font-heading font-black text-sm sm:text-base text-[var(--brand-900)] truncate group-hover:text-[var(--brand)] transition-colors">
              {order.customerName}
            </h4>
            <p className="text-[11px] text-[var(--text-muted)] font-medium truncate pt-0.5">
              {order.id} • {order.customerPhone.startsWith('+91') ? order.customerPhone : `+91 ${order.customerPhone}`}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Source chip: Online vs Manual */}
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold border select-none ${
                order.source === 'Online'
                  ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                  : 'bg-slate-100 text-slate-700 border-slate-200/80'
              }`}
            >
              {order.source}
            </span>

            {/* Status chip with shared layoutId */}
            <StatusChip
              status={order.status}
              size="sm"
              layoutId={`status-chip-${order.id}`}
            />
          </div>
        </div>

        {/* Middle Content: Occasion, Event Date, Guest Plates Count */}
        <div className="pt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {/* Occasion / Event Type */}
          <div className="col-span-2 sm:col-span-1 min-w-0">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
              Occasion
            </span>
            <p className="font-bold text-[var(--text-primary)] truncate mt-0.5">
              {order.eventType}
            </p>
          </div>

          {/* Event Date */}
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
              Occasion Date
            </span>
            <div className="flex items-center gap-1 mt-0.5 font-semibold text-[var(--text-primary)]">
              <Calendar className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
              <span className="truncate">{formatEventDate(order.eventDate)}</span>
            </div>
          </div>

          {/* Plates Count */}
          <div className="min-w-0 text-right sm:text-left">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
              Plates
            </span>
            <div className="flex items-center justify-end sm:justify-start gap-1 mt-0.5 font-bold text-[var(--brand-900)]">
              <Users className="w-3.5 h-3.5 text-[var(--brand-600)] shrink-0" />
              <span>{order.guestCount} plates</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Time Received / Dishes selected, Confirm button, & Price */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[var(--text-muted)]">
          {showTimeReceived ? (
            <div className="flex items-center gap-1 text-[11px] font-medium">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span>Received {formatTimeReceived(order.createdAt)}</span>
            </div>
          ) : (
            <div className="text-[11px] font-medium text-slate-400">
              {order.items.length} dishes selected
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Quick Confirm Button with burst effect on New Requests */}
            {order.status === 'New Request' && onConfirm && (
              <motion.button
                type="button"
                whileTap={canQuickConfirm ? { scale: 0.92 } : undefined}
                onClick={handleConfirmClick}
                disabled={isConfirming || !canQuickConfirm}
                className={`relative px-2.5 py-1 rounded-full font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors overflow-hidden ${
                  canQuickConfirm
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                }`}
                title={
                  canQuickConfirm
                    ? 'Confirm order and add to banquet calendar'
                    : 'Occasion date and number of plates required before confirming'
                }
              >
                {showBurst && (
                  <motion.span
                    initial={{ scale: 0.2, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-white/60 rounded-full pointer-events-none"
                  />
                )}
                <Check className="w-3 h-3 stroke-[2.5]" />
                <span>{isConfirming ? 'Confirming...' : 'Confirm'}</span>
              </motion.button>
            )}

            <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--brand)] group-hover:translate-x-0.5 transition-transform">
              <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default OrderCard

