import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Users, 
  CheckCircle2, 
  ChevronRight as ArrowRight 
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import type { Order } from '@/data/mockData'
import { StatusChip } from '@/components/admin/StatusChip'
import { formatEventDate } from '@/components/admin/OrderCard'

interface CalendarCardProps {
  orders: Order[]
  initialDate?: string // YYYY-MM-DD
}

export const CalendarCard: React.FC<CalendarCardProps> = ({
  orders,
  initialDate = '2026-10-23'
}) => {
  // Parse initial date
  const [initYear, initMonth] = initialDate.split('-').map(Number)

  const [viewDate, setViewDate] = useState<Date>(() => new Date(initYear, initMonth - 1, 1))
  const [selectedDate, setSelectedDate] = useState<string>(initialDate)

  // Filter STRICTLY for Confirmed orders only (pending enquiries NEVER appear here per spec)
  const confirmedOrdersByDate = useMemo(() => {
    const map: Record<string, Order[]> = {}
    for (const order of orders) {
      if (order.status === 'Confirmed' && order.eventDate) {
        if (!map[order.eventDate]) {
          map[order.eventDate] = []
        }
        map[order.eventDate].push(order)
      }
    }
    return map
  }, [orders])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth() // 0-indexed
  const [monthDirection, setMonthDirection] = useState<'prev' | 'next'>('next')

  const handlePrevMonth = () => {
    setMonthDirection('prev')
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setMonthDirection('next')
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleGoToToday = () => {
    const today = new Date()
    setMonthDirection(today > viewDate ? 'next' : 'prev')
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    setSelectedDate(todayStr)
  }

  // Touch swipe gestures between months on mobile
  const touchStartX = React.useRef<number | null>(null)
  const touchStartY = React.useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
    touchStartY.current = e.targetTouches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const diffX = touchStartX.current - endX
    const diffY = touchStartY.current - endY

    // Check if horizontal swipe was dominant and exceeded threshold
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      if (diffX > 0) {
        handleNextMonth()
      } else {
        handlePrevMonth()
      }
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  // Days calculations
  const monthName = viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const firstDayOfWeek = new Date(year, month, 1).getDay() // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  // Generate grid cells
  const gridCells = useMemo(() => {
    const cells: {
      dayNumber: number
      dateStr: string
      isCurrentMonth: boolean
      isToday: boolean
      isSelected: boolean
      confirmedOrders: Order[]
    }[] = []

    // 1. Previous month trailing days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const prevMonth = month === 0 ? 11 : month - 1
      const prevYear = month === 0 ? year - 1 : year
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === initialDate,
        isSelected: dateStr === selectedDate,
        confirmedOrders: confirmedOrdersByDate[dateStr] || []
      })
    }

    // 2. Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === initialDate,
        isSelected: dateStr === selectedDate,
        confirmedOrders: confirmedOrdersByDate[dateStr] || []
      })
    }

    // 3. Next month leading days (to complete week rows)
    const totalCells = Math.ceil(cells.length / 7) * 7
    const remaining = totalCells - cells.length
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1
      const nextYear = month === 11 ? year + 1 : year
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === initialDate,
        isSelected: dateStr === selectedDate,
        confirmedOrders: confirmedOrdersByDate[dateStr] || []
      })
    }

    return cells
  }, [year, month, firstDayOfWeek, daysInMonth, daysInPrevMonth, initialDate, selectedDate, confirmedOrdersByDate])

  const selectedConfirmedOrders = confirmedOrdersByDate[selectedDate] || []

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="content-card bg-white border border-slate-200/80 rounded-[24px] shadow-sm overflow-hidden">
      
      {/* Calendar Card Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[var(--brand-soft)] text-[var(--brand-900)] flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 text-[var(--brand)]" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm sm:text-base text-[var(--brand-900)]">
              Catering Schedule
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] font-medium">
              Confirmed banquet dates & functions
            </p>
          </div>
        </div>

        {/* Month Navigation & Today button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleGoToToday}
            className="text-[11px] font-bold text-[var(--brand)] px-2.5 py-1 rounded-full hover:bg-[var(--brand-soft)] transition-colors border border-[var(--brand-200)] tap-target-48 sm:tap-target-auto"
          >
            Today
          </button>
          <div className="flex items-center bg-slate-100 rounded-full p-0.5">
            <button
              onClick={handlePrevMonth}
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:text-black hover:bg-white transition-all tap-target-48 sm:tap-target-auto"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-2 text-slate-800 min-w-[100px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:text-black hover:bg-white transition-all tap-target-48 sm:tap-target-auto"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Layout: 
          On Desktop (1024px+): Month grid on left, Selected Date Confirmed Orders in right-hand side panel.
          On Mobile (< 1024px): Month grid on top, Selected Date Confirmed Orders directly below with slide-in. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        
        {/* Month Grid (col-span-7 on desktop, touch-swipeable on mobile) */}
        <div 
          className="p-3 sm:p-5 lg:col-span-7 touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1 text-center">
            {weekdays.map((day, i) => (
              <span
                key={day}
                className={`text-[11px] font-bold py-1 select-none ${
                  i === 0 ? 'text-red-500' : 'text-[var(--text-muted)]'
                }`}
              >
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid: horizontal slide on month change */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${year}-${month}`}
              initial={{ x: monthDirection === 'next' ? 24 : -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: monthDirection === 'next' ? -24 : 24, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
              className="grid grid-cols-7 gap-1 sm:gap-1.5"
            >
              {gridCells.map((cell) => {
                const hasConfirmed = cell.confirmedOrders.length > 0

                let buttonStyles = 'text-slate-800 hover:bg-slate-50'
                if (!cell.isCurrentMonth) {
                  buttonStyles = 'text-slate-300 hover:bg-slate-50/50'
                }

                if (cell.isSelected) {
                  buttonStyles = 'bg-[var(--brand)] text-[var(--on-brand)] font-black shadow-sm ring-2 ring-[var(--brand-200)]'
                } else if (cell.isToday) {
                  buttonStyles = 'ring-2 ring-[var(--brand)] ring-offset-1 font-bold text-[var(--brand-900)] bg-[var(--brand-soft)]/50'
                }

                return (
                  <motion.button
                    key={cell.dateStr}
                    type="button"
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    aria-label={`${cell.dateStr}, ${hasConfirmed ? `${cell.confirmedOrders.length} confirmed event${cell.confirmedOrders.length > 1 ? 's' : ''}` : 'no confirmed events'}${cell.isToday ? ', today' : ''}${cell.isSelected ? ', selected' : ''}`}
                    aria-pressed={cell.isSelected}
                    className={`aspect-square sm:aspect-auto sm:h-12 rounded-xl p-1 flex flex-col items-center justify-between transition-all relative tap-target-48 sm:tap-target-auto select-none cursor-pointer ${buttonStyles}`}
                  >
                    <span className={`text-xs ${cell.isSelected ? 'text-white' : ''}`}>
                      {cell.dayNumber}
                    </span>

                    {/* Confirmed Orders Badge per spec */}
                    {hasConfirmed ? (
                      <span
                        title={`${cell.confirmedOrders.length} Confirmed Orders`}
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 shadow-xs ${
                          cell.isSelected
                            ? 'bg-white text-[var(--brand)]'
                            : 'bg-[var(--brand)] text-white'
                        }`}
                      >
                        {cell.confirmedOrders.length}
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5" />
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
          </AnimatePresence>

          {/* Legend */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full ring-2 ring-[var(--brand)] ring-offset-1 inline-block" />
                <span>Today</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[var(--brand)] text-white text-[9px] font-black flex items-center justify-center">
                  1
                </span>
                <span>Confirmed Orders</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Pending enquiries excluded
            </span>
          </div>
        </div>

        {/* Selected Date Confirmed Orders Panel:
            Desktop: Right-hand side panel
            Mobile: Directly below the calendar with slide-in */}
        <div className="p-4 sm:p-5 lg:col-span-5 bg-slate-50/50 flex flex-col justify-start">
          
          <div className="pb-3 border-b border-slate-200/70 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                Selected Date
              </span>
              <h4 className="font-heading font-black text-xs sm:text-sm text-[var(--brand-900)] mt-0.5">
                {formatEventDate(selectedDate)}
              </h4>
            </div>

            {selectedConfirmedOrders.length > 0 && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--status-confirmed-bg)] text-[var(--status-confirmed-text)] border border-[var(--status-confirmed-border)] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[var(--status-confirmed-text)]" />
                <span>{selectedConfirmedOrders.length} Confirmed</span>
              </span>
            )}
          </div>

          <div className="mt-3 flex-1 min-h-[160px]">
            <AnimatePresence mode="wait">
              {selectedConfirmedOrders.length > 0 ? (
                <motion.div
                  key={selectedDate}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-2.5"
                >
                  {selectedConfirmedOrders.map((order) => (
                    <Link
                      key={order.id}
                      to={`/admin/orders/${order.id}`}
                      className="block p-3 rounded-xl bg-white border border-slate-200/80 hover:border-[var(--brand-300)] hover:shadow-xs transition-all group tap-target-48"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h5 className="font-heading font-bold text-xs sm:text-sm text-[var(--brand-900)] truncate group-hover:text-[var(--brand)] transition-colors">
                            {order.customerName}
                          </h5>
                          <p className="text-[11px] text-[var(--text-muted)] font-medium truncate">
                            {order.eventType}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Source chip */}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              order.source === 'Online'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {order.source}
                          </span>
                          <StatusChip status={order.status} size="sm" />
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1 text-[var(--text-muted)] font-semibold">
                          <Users className="w-3 h-3 text-[var(--brand)]" />
                          <span>{order.guestCount} plates</span>
                        </span>

                        <span className="flex items-center gap-0.5 font-bold text-[var(--brand)] group-hover:translate-x-0.5 transition-transform">
                          <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty-date"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <CalendarIcon className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-muted)]">
                    No confirmed orders on this date
                  </p>
                  <p className="text-[10px] text-slate-400 max-w-[200px]">
                    Tap highlighted dates with brand circles to view confirmed events.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  )
}
export default CalendarCard
