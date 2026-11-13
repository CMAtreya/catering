import React, { useState, useEffect, useMemo } from 'react'
import {
  Calendar,
  RefreshCw,
  PlusCircle,
  BellRing,
  CheckCircle2,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MousePointerClick,
  Plus,
  Globe,
  FileEdit,
  CalendarX,
  ChefHat,
  Inbox,
  Phone,
  ArrowRight,
  MailCheck,
  Clock,
  FilePlus,
  X,
  Armchair,
  MapPin,
  FileText,
  Utensils,
  PhoneCall,
  XCircle,
  ExternalLink
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { format, parseISO, isValid } from 'date-fns'
import { toast } from 'sonner'

import { getOrders, saveOrder, setStatus, confirmOrder, subscribeToOrders } from '@/api'
import type { Order, OrderStatus } from '@/data/mockData'
import { AdminAppShell } from '@/components/admin/AdminAppShell'
import { KitchenBEOSheetModal } from '@/components/admin/KitchenBEOSheetModal'
import { AdminShimmer } from '@/components/admin/AdminSkeletons'

export const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Calendar navigation state (year & month, 0-indexed) initialized to actual system date
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date())
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'))

  // Modals state
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false)
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null)
  const [beoOrder, setBeoOrder] = useState<Order | null>(null)

  // Manual order form state
  const [manualName, setManualName] = useState<string>('')
  const [manualPhone, setManualPhone] = useState<string>('')
  const [manualOccasion, setManualOccasion] = useState<string>('Griha Pravesh')
  const [manualDate, setManualDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'))
  const [manualPlates, setManualPlates] = useState<number>(100)
  const [manualAddress, setManualAddress] = useState<string>('')
  const [manualStatus, setManualStatus] = useState<'Confirmed' | 'Under Discussion'>('Confirmed')

  // Load orders & subscribe
  const loadData = async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true)
      const data = await getOrders()
      setOrders(data)
    } catch (err) {
      console.error('Failed to load admin orders:', err)
      toast.error('Could not refresh orders')
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    loadData(true)

    const unsubscribe = subscribeToOrders((latest) => {
      if (isMounted) setOrders(latest)
    })

    const handleFocus = () => loadData(false)
    window.addEventListener('focus', handleFocus)
    const poll = setInterval(() => loadData(false), 5000)

    return () => {
      isMounted = false
      unsubscribe()
      window.removeEventListener('focus', handleFocus)
      clearInterval(poll)
    }
  }, [])

  // Formatted date string
  const getDateDisplayDetails = (dateStr?: string) => {
    if (!dateStr) return { display: format(new Date(), 'EEEE, d MMM yyyy') }
    try {
      const d = parseISO(dateStr)
      if (!isValid(d)) return { display: dateStr }
      const display = format(d, 'EEEE, d MMM yyyy')
      return { display }
    } catch {
      return { display: dateStr }
    }
  }

  // 1. Group confirmed orders by date string YYYY-MM-DD
  const confirmedOrdersByDate = useMemo(() => {
    const map: Record<string, Order[]> = {}
    for (const order of orders) {
      if (order.status === 'Confirmed' && order.eventDate) {
        const dKey = order.eventDate.split('T')[0]
        if (!map[dKey]) map[dKey] = []
        map[dKey].push(order)
      }
    }
    return map
  }, [orders])

  // 2. New Requests (Online enquiries awaiting kitchen confirmation)
  const newRequests = useMemo(() => {
    return orders
      .filter((o) => o.source === 'Online' && o.status === 'New Request')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [orders])

  // 3. Active Orders (Under Discussion or Confirmed)
  const activeOrders = useMemo(() => {
    return orders
      .filter((o) => o.status === 'Under Discussion' || o.status === 'Confirmed')
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
  }, [orders])

  // Stat: Confirmed this month
  const calYear = calendarDate.getFullYear()
  const calMonth = calendarDate.getMonth()
  const monthKeyPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`

  const confirmedThisMonth = useMemo(() => {
    return orders.filter((o) => o.status === 'Confirmed' && o.eventDate && o.eventDate.startsWith(monthKeyPrefix))
  }, [orders, monthKeyPrefix])

  const confirmedThisMonthPlates = useMemo(() => {
    return confirmedThisMonth.reduce((sum, o) => sum + (o.guestCount || 0), 0)
  }, [confirmedThisMonth])

  // Next Confirmed Event
  const nextConfirmedOrder = useMemo(() => {
    const confirmed = orders.filter((o) => o.status === 'Confirmed')
    return confirmed.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())[0]
  }, [orders])

  // Calendar month days generation
  const calDays = useMemo(() => {
    const firstDayIndex = new Date(calYear, calMonth, 1).getDay() // 0 = Sun
    const totalDays = new Date(calYear, calMonth + 1, 0).getDate()

    const days = []
    // Leading padding cells from previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, dateKey: '' })
    }
    // Days in current month
    for (let d = 1; d <= totalDays; d++) {
      const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ day: d, dateKey })
    }
    return days
  }, [calYear, calMonth])

  // Calendar controls
  const handleMonthChange = (delta: number) => {
    setCalendarDate(new Date(calYear, calMonth + delta, 1))
  }

  const handleGoToToday = () => {
    const today = new Date()
    setCalendarDate(today)
    setSelectedDateKey(format(today, 'yyyy-MM-dd'))
  }

  // Selected date orders list
  const selectedDateOrders = confirmedOrdersByDate[selectedDateKey] || []
  const selectedDateCombinedPlates = selectedDateOrders.reduce((sum, o) => sum + (o.guestCount || 0), 0)
  const selectedDateDetails = getDateDisplayDetails(selectedDateKey)

  // Open manual order modal with specific date pre-filled
  const handleOpenManualOrderWithDate = (dStr: string) => {
    setManualDate(dStr)
    setIsManualModalOpen(true)
  }

  // Submit manual order
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualName.trim() || !manualPhone.trim()) {
      toast.error('Please enter customer name and phone')
      return
    }

    try {
      const plates = Number(manualPlates) || 100
      await saveOrder({
        customerName: manualName.trim(),
        customerPhone: manualPhone.trim(),
        eventType: manualOccasion,
        eventDate: manualDate,
        eventTime: 'Morning',
        guestCount: plates,
        venueAddress: manualAddress.trim() || 'Mysuru District',
        status: manualStatus as OrderStatus,
        source: 'Manual',
        perPlateTotal: 285,
        totalAmount: plates * 285,
        items: [
          { id: '1', name: 'Mysuru Puliyogare', pricePerPlate: 85, quantity: 1 },
          { id: '2', name: 'Bisi Bele Bath', pricePerPlate: 90, quantity: 1 },
          { id: '3', name: 'Melkote Majjige Huli', pricePerPlate: 50, quantity: 1 },
          { id: '4', name: 'Royal Mysuru Pak', pricePerPlate: 60, quantity: 1 }
        ]
      })

      toast.success(`Success! Manual order for ${manualName} (${plates} plates) added.`)
      setIsManualModalOpen(false)
      setSelectedDateKey(manualDate)
      // reset form
      setManualName('')
      setManualPhone('')
      setManualAddress('')
      await loadData()
    } catch {
      toast.error('Failed to create manual order')
    }
  }

  // Review modal actions
  const handleConfirmEnquiry = async () => {
    if (!reviewOrder) return
    try {
      await confirmOrder(reviewOrder.id)
      toast.success(`Enquiry confirmed! Added to Confirmed Orders on ${reviewOrder.eventDate}.`)
      setReviewOrder(null)
      await loadData()
    } catch {
      toast.error('Failed to confirm enquiry')
    }
  }

  const handleDiscussEnquiry = async () => {
    if (!reviewOrder) return
    try {
      await setStatus(reviewOrder.id, 'Under Discussion')
      toast.success(`Status updated to 'Under Discussion'. Customer moved to Active Orders.`)
      setReviewOrder(null)
      await loadData()
    } catch {
      toast.error('Failed to update enquiry status')
    }
  }

  const handleCancelEnquiry = async () => {
    if (!reviewOrder) return
    if (!window.confirm('Are you sure you want to decline this booking enquiry?')) return
    try {
      await setStatus(reviewOrder.id, 'Cancelled')
      toast.success('Enquiry declined with SMS notification sent to host.')
      setReviewOrder(null)
      await loadData()
    } catch {
      toast.error('Failed to decline enquiry')
    }
  }

  const todayStr = format(new Date(), 'EEEE, d MMM yyyy')

  return (
    <AdminAppShell>
      <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-6 space-y-6">

        {/* ========================================================
             TOP BAR (Greetings, Date, High-Visibility Action)
             ======================================================== */}
        <header className="bg-white/90 backdrop-blur-md border border-[#EADBC8] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Greeting & Date */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1810] tracking-tight">
                  Namaskara
                </h1>
                <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-green-300">
                  <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span> Kitchen Live
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#785A48] mt-1 flex items-center gap-1.5 flex-wrap">
                <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-semibold text-[#2D1810]">{todayStr}</span>
              </p>
            </div>
          </div>

          {/* Action Area: Refresh & Create Manual Order */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              type="button"
              onClick={() => {
                loadData(true)
                toast.success('Catering orders and kitchen schedule refreshed.')
              }}
              title="Reload Orders"
              className="p-2.5 px-3.5 rounded-xl border border-[#EADBC8] bg-white text-[#2D1810] hover:bg-[#F7EFE2] transition-all flex items-center gap-1.5 text-xs font-semibold shadow-xs cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 text-[#785A48] ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Big Prominent Red Button "Create Manual Order" */}
            <button
              type="button"
              onClick={() => handleOpenManualOrderWithDate(selectedDateKey)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#8B0A00] to-[#B30A05] hover:from-[#5C0500] hover:to-[#8B0A00] text-white font-bold text-sm sm:text-base shadow-md shadow-[#8B0A00]/30 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <span>Create Manual Order</span>
            </button>
          </div>
        </header>

        {/* ========================================================
             SIMPLE STAT CHIPS AT TOP (Strictly No Charts)
             ======================================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Summary Counters">
          
          {/* Chip 1: New Requests Count */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center justify-between border-l-4 border-l-amber-500 shadow-warm min-h-[110px]">
            <div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-800">
                New Online Requests
              </p>
              {isLoading ? (
                <div className="space-y-2 mt-1.5">
                  <div className="flex items-center gap-2">
                    <AdminShimmer className="h-8 w-14 rounded-md" />
                    <AdminShimmer className="h-5 w-24 rounded-md" />
                  </div>
                  <AdminShimmer className="h-3.5 w-40 rounded" />
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-serif font-black text-amber-900">
                      {newRequests.length}
                    </span>
                    {newRequests.length > 0 ? (
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        Action needed
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        All clear
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#785A48] mt-1">Awaiting kitchen confirmation</p>
                </>
              )}
            </div>
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300">
              <BellRing className="w-7 h-7" />
            </div>
          </div>

          {/* Chip 2: Confirmed This Month */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center justify-between border-l-4 border-l-green-600 shadow-warm min-h-[110px]">
            <div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-green-800">
                Confirmed This Month
              </p>
              {isLoading ? (
                <div className="space-y-2 mt-1.5">
                  <div className="flex items-center gap-2">
                    <AdminShimmer className="h-8 w-14 rounded-md" />
                    <AdminShimmer className="h-5 w-24 rounded-md" />
                  </div>
                  <AdminShimmer className="h-3.5 w-36 rounded" />
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-serif font-black text-green-900">
                      {confirmedThisMonth.length}
                    </span>
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                      {confirmedThisMonthPlates.toLocaleString('en-IN')} Plates
                    </span>
                  </div>
                  <p className="text-xs text-[#785A48] mt-1">
                    {format(calendarDate, 'MMMM yyyy')} Muhurthams
                  </p>
                </>
              )}
            </div>
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center shrink-0 border border-green-300">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>

          {/* Chip 3: Next Event Date */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center justify-between border-l-4 border-l-[#8B0A00] shadow-warm min-h-[110px]">
            <div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#8B0A00]">
                Next Confirmed Event
              </p>
              {isLoading ? (
                <div className="space-y-2 mt-1.5">
                  <AdminShimmer className="h-8 w-36 rounded-md" />
                  <AdminShimmer className="h-3.5 w-28 rounded" />
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-serif font-black text-[#5C0500]">
                      {nextConfirmedOrder ? format(parseISO(nextConfirmedOrder.eventDate), 'd MMM yyyy') : 'No upcoming event'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#2D1810] mt-1 truncate max-w-[200px]">
                    {nextConfirmedOrder ? `${nextConfirmedOrder.eventType} (${nextConfirmedOrder.guestCount} plts)` : 'Kitchen slots available'}
                  </p>
                </>
              )}
            </div>
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-red-100 text-[#8B0A00] flex items-center justify-center shrink-0 border border-red-300">
              <CalendarCheck className="w-7 h-7" />
            </div>
          </div>

        </section>

        {/* ========================================================
             MAIN 12-COLUMN SECTION:
             [Col 1..7: Large Calendar Card]  |  [Col 8..12: Date Side Panel]
             ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ====================================================
               1. CALENDAR CARD (Month View, Left Large, Col 7)
               ==================================================== */}
          <section className="lg:col-span-7 glass-card rounded-2xl p-4 sm:p-6 shadow-warm border border-[#EADBC8]">
            
            {/* Calendar Header & Navigation Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EADBC8]">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-6 h-6 text-[#8B0A00] shrink-0" />
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1810]">
                  {format(calendarDate, 'MMMM yyyy')}
                </h2>
              </div>

              {/* Month Switchers with Playwright Accessibility labels */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous Month"
                  onClick={() => handleMonthChange(-1)}
                  className="h-10 px-3.5 rounded-xl border border-[#EADBC8] bg-white hover:bg-[#F7EFE2] font-bold text-sm text-[#2D1810] transition-all flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <button
                  type="button"
                  onClick={handleGoToToday}
                  className="h-10 px-4 rounded-xl border-2 border-amber-500 bg-amber-50 text-amber-950 font-bold text-sm hover:bg-amber-100 transition-all shadow-xs cursor-pointer"
                >
                  Today ({format(new Date(), 'd')})
                </button>
                <button
                  type="button"
                  aria-label="Next Month"
                  onClick={() => handleMonthChange(1)}
                  className="h-10 px-3.5 rounded-xl border border-[#EADBC8] bg-white hover:bg-[#F7EFE2] font-bold text-sm text-[#2D1810] transition-all flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Explainer Legend */}
            <div className="flex flex-wrap items-center justify-between text-xs text-[#785A48] py-2.5 px-3 bg-amber-50/60 rounded-xl my-3 border border-[#EADBC8]/60 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#8B0A00] text-white text-[9px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <span>Confirmed orders count</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3.5 h-3.5 rounded-md border-2 border-amber-500 bg-amber-100/60 inline-block"></span>
                  <span>Today's date (Gold outline)</span>
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#8B0A00] italic">
                Only CONFIRMED bookings appear here
              </span>
            </div>

            {/* Day Names Header */}
            <div className="grid grid-cols-7 text-center font-bold text-xs uppercase tracking-wider text-[#785A48] py-2 border-b border-[#EADBC8]/60">
              <div className="text-[#8B0A00]">Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div className="text-amber-800">Sat</div>
            </div>

            {/* Calendar Day Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-2">
              {calDays.map((cell, idx) => {
                if (!cell.day) {
                  return (
                    <div 
                      key={`empty-${idx}`} 
                      className="calendar-cell p-1 rounded-xl bg-amber-50/20 border border-transparent opacity-30 cursor-not-allowed"
                    />
                  )
                }

                const dateKey = cell.dateKey
                const isToday = dateKey === format(new Date(), 'yyyy-MM-dd')
                const isSelected = dateKey === selectedDateKey
                const confirmedOrders = confirmedOrdersByDate[dateKey] || []
                const count = confirmedOrders.length
                const totalPlates = confirmedOrders.reduce((sum, o) => sum + (o.guestCount || 0), 0)

                return (
                  <div
                    key={dateKey}
                    onClick={() => setSelectedDateKey(dateKey)}
                    className={`calendar-cell relative p-1.5 sm:p-2 rounded-xl cursor-pointer border flex flex-col justify-between transition-all select-none ${
                      isSelected
                        ? 'bg-red-50/90 border-2 border-[#8B0A00] shadow-md scale-[1.02] z-10'
                        : isToday
                        ? 'bg-amber-50/80 border-2 border-amber-500 shadow-xs'
                        : 'bg-white/80 border-[#EADBC8]/70 hover:border-[#8B0A00]/50 hover:bg-[#F7EFE2]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-sm sm:text-base font-bold ${
                        isSelected ? 'text-[#8B0A00] font-black' : isToday ? 'text-amber-900 font-black' : 'text-[#2D1810]'
                      }`}>
                        {cell.day}
                      </span>
                      {count > 0 && (
                        <span 
                          className="w-5 h-5 rounded-full bg-[#8B0A00] text-white text-[11px] font-black flex items-center justify-center shadow-xs" 
                          title={`${count} confirmed orders`}
                        >
                          {count}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-[10px] sm:text-[11px] font-semibold truncate leading-tight">
                      {isToday && (
                        <span className="text-amber-700 font-extrabold block">Today</span>
                      )}
                      {count > 0 ? (
                        <span className="text-green-800 font-bold hidden sm:inline">
                          {totalPlates} plts
                        </span>
                      ) : (
                        <span className="text-transparent">.</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Small Notice for Non-Tech Owners */}
            <div className="mt-4 pt-3 border-t border-[#EADBC8]/60 flex items-center justify-between text-xs text-[#785A48] flex-wrap gap-2">
              <span className="flex items-center gap-1">
                <MousePointerClick className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Tap any date to see catering menu & client details on the right</span>
              </span>
              <span className="font-semibold text-[#2D1810]">
                Month Total: {confirmedThisMonth.length} Banquets
              </span>
            </div>
          </section>

          {/* ====================================================
               2. RIGHT SIDE PANEL: Confirmed Orders for Selected Date (Col 5)
               ==================================================== */}
          <section className="lg:col-span-5 glass-card rounded-2xl p-4 sm:p-6 shadow-warm border border-[#EADBC8] flex flex-col justify-between">
            <div>
              {/* Header of Selected Date */}
              <div className="flex items-start justify-between pb-3 border-b border-[#EADBC8]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8B0A00] bg-red-100/70 px-2 py-0.5 rounded">
                    Selected Feast Date
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#2D1810] mt-1">
                    {selectedDateDetails.display}
                  </h3>
                  <p className="text-xs text-[#785A48]">
                    Auspicious Muhurtham
                  </p>
                </div>

                {/* Quick Order creation for this specific date */}
                <button
                  type="button"
                  onClick={() => handleOpenManualOrderWithDate(selectedDateKey)}
                  className="p-2 px-3 bg-white hover:bg-[#F7EFE2] border border-[#EADBC8] rounded-xl text-[#8B0A00] text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                  title="Add order for this date"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Feast</span>
                </button>
              </div>

              {/* List of Confirmed Orders for This Date */}
              {isLoading ? (
                <div className="mt-4 space-y-3">
                  <div className="p-4 rounded-xl bg-white/70 border border-[#EADBC8] space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1.5">
                        <AdminShimmer className="h-5 w-36 rounded-md" />
                        <AdminShimmer className="h-3.5 w-24 rounded" />
                      </div>
                      <AdminShimmer className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="pt-2 border-t border-[#EADBC8]/50 flex items-center justify-between">
                      <AdminShimmer className="h-4 w-28 rounded" />
                      <AdminShimmer className="h-4 w-16 rounded" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/70 border border-[#EADBC8] space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1.5">
                        <AdminShimmer className="h-5 w-36 rounded-md" />
                        <AdminShimmer className="h-3.5 w-24 rounded" />
                      </div>
                      <AdminShimmer className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="pt-2 border-t border-[#EADBC8]/50 flex items-center justify-between">
                      <AdminShimmer className="h-4 w-28 rounded" />
                      <AdminShimmer className="h-4 w-16 rounded" />
                    </div>
                  </div>
                </div>
              ) : selectedDateOrders.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {selectedDateOrders.map((ord) => (
                    <Link
                      key={ord.id}
                      to={`/admin/orders/${ord.id}`}
                      className="block p-4 rounded-xl bg-white/95 border-2 border-[#EADBC8] hover:border-[#8B0A00]/60 transition-all cursor-pointer shadow-xs hover:shadow-md group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-base text-[#2D1810] group-hover:text-[#8B0A00] flex items-center gap-1.5">
                            <span>{ord.customerName}</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-700 shrink-0" />
                          </h4>
                          <p className="text-xs font-medium text-[#785A48] mt-0.5">
                            {ord.eventType}
                          </p>
                        </div>
                        <span className="status-badge-confirmed text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Confirmed
                        </span>
                      </div>

                      {/* Details Row */}
                      <div className="mt-3 pt-2.5 border-t border-[#EADBC8]/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                            {ord.guestCount} Plates
                          </span>
                          <span className={`${
                            ord.source === 'Online'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          } border px-2 py-0.5 rounded font-semibold flex items-center gap-1`}>
                            {ord.source === 'Online' ? <Globe className="w-3 h-3" /> : <FileEdit className="w-3 h-3" />}
                            {ord.source}
                          </span>
                        </div>
                        <div className="font-serif font-bold text-[#8B0A00] text-sm">
                          ₹{ord.totalAmount.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-[#785A48] flex items-center justify-between">
                        <span className="truncate max-w-[200px]">📍 {ord.venueAddress || 'Mysuru'}</span>
                        <span className="font-bold text-[#8B0A00] group-hover:underline">View Details →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                /* Empty State for Dates with No Confirmed Orders */
                <div className="py-10 px-4 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#F7EFE2] text-[#785A48] flex items-center justify-center">
                    <CalendarX className="w-8 h-8" />
                  </div>
                  <p className="text-base font-bold text-[#2D1810]">No confirmed orders on this date.</p>
                  <p className="text-xs text-[#785A48] max-w-xs mx-auto">
                    This date is completely free for kitchen preparation or taking new banquets.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenManualOrderWithDate(selectedDateKey)}
                    className="mt-2 px-4 py-2 rounded-xl bg-[#8B0A00] text-white text-xs font-bold shadow-xs hover:bg-[#5C0500] cursor-pointer"
                  >
                    Book Event on this Date
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Action in Date Panel */}
            <div className="mt-4 pt-3 border-t border-[#EADBC8]/60 flex items-center justify-between text-xs">
              <span className="text-[#785A48]">
                Combined Plates: <strong>{selectedDateCombinedPlates}</strong>
              </span>
              {selectedDateOrders.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setBeoOrder(selectedDateOrders[0])}
                  className="font-bold text-[#8B0A00] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Print Kitchen Dispatch</span>
                </button>
              ) : (
                <span className="text-xs text-[#785A48]">No bookings today</span>
              )}
            </div>
          </section>

        </div>

        {/* ========================================================
             3. BELOW: TWO SECTIONS SIDE BY SIDE
             [New Requests (Left)]  |  [Active Orders (Right)]
             ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ====================================================
               A. NEW REQUESTS SECTION (Awaiting review, count badge)
               ==================================================== */}
          <section className="glass-card rounded-2xl p-4 sm:p-6 shadow-warm border border-[#EADBC8]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBC8]">
              <div className="flex items-center gap-2.5">
                <Inbox className="w-6 h-6 text-amber-600 shrink-0" />
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1810]">
                  New Requests
                </h3>
                {isLoading ? (
                  <AdminShimmer className="h-5 w-20 rounded-full" />
                ) : (
                  <span className="status-badge-new text-xs px-2.5 py-0.5 rounded-full font-extrabold">
                    {newRequests.length} Pending
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-[#785A48]">Incoming online enquiries</span>
            </div>

            {/* List of Incoming Requests */}
            {isLoading ? (
              <div className="mt-4 space-y-3.5">
                <div className="p-4 rounded-xl bg-white/70 border border-[#EADBC8] space-y-3">
                  <div className="flex justify-between items-center">
                    <AdminShimmer className="h-5 w-36 rounded" />
                    <AdminShimmer className="h-7 w-20 rounded-xl" />
                  </div>
                  <AdminShimmer className="h-4 w-48 rounded" />
                  <div className="pt-2 border-t border-[#EADBC8]/40 flex justify-between">
                    <AdminShimmer className="h-4 w-28 rounded" />
                    <AdminShimmer className="h-4 w-20 rounded" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/70 border border-[#EADBC8] space-y-3">
                  <div className="flex justify-between items-center">
                    <AdminShimmer className="h-5 w-36 rounded" />
                    <AdminShimmer className="h-7 w-20 rounded-xl" />
                  </div>
                  <AdminShimmer className="h-4 w-48 rounded" />
                  <div className="pt-2 border-t border-[#EADBC8]/40 flex justify-between">
                    <AdminShimmer className="h-4 w-28 rounded" />
                    <AdminShimmer className="h-4 w-20 rounded" />
                  </div>
                </div>
              </div>
            ) : newRequests.length > 0 ? (
              <div className="mt-4 space-y-3.5">
                {newRequests.map((req) => (
                  <div 
                    key={req.id}
                    className="p-4 rounded-xl bg-white/95 border-l-4 border-l-amber-500 border border-[#EADBC8] shadow-xs hover:shadow-sm transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-[#2D1810]">{req.customerName}</h4>
                          <span className="status-badge-new text-[11px] px-2 py-0.5 rounded font-bold">
                            New Request
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#785A48] mt-1">
                          <a 
                            href={`tel:${req.customerPhone}`}
                            className="flex items-center gap-1 font-semibold text-[#2D1810] hover:text-[#8B0A00]"
                          >
                            <Phone className="w-3 h-3 text-[#8B0A00] shrink-0" />
                            <span>{req.customerPhone}</span>
                          </a>
                          <span>·</span>
                          <span className="text-[#2D1810] font-medium">
                            {req.eventType}
                          </span>
                        </div>
                      </div>

                      {/* Review Button */}
                      <button
                        type="button"
                        onClick={() => setReviewOrder(req)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Meta */}
                    <div className="pt-2 border-t border-[#EADBC8]/60 flex items-center justify-between text-xs text-[#785A48]">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-[#2D1810]">
                          📅 {format(parseISO(req.eventDate), 'd MMM yyyy')}
                        </span>
                        <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          {req.guestCount} Plates
                        </span>
                      </div>
                      <div className="font-serif font-bold text-[#8B0A00] text-sm">
                        Est: ₹{req.totalAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-[#785A48]">
                <MailCheck className="w-10 h-10 text-amber-700/50 mb-1" />
                <p className="font-bold text-[#2D1810]">No new requests right now.</p>
                <p className="text-xs">All customer enquiries have been reviewed or scheduled.</p>
              </div>
            )}
          </section>

          {/* ====================================================
               B. ACTIVE ORDERS SECTION (Under Discussion / Confirmed)
               ==================================================== */}
          <section className="glass-card rounded-2xl p-4 sm:p-6 shadow-warm border border-[#EADBC8]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBC8]">
              <div className="flex items-center gap-2.5">
                <Clock className="w-6 h-6 text-[#8B0A00] shrink-0" />
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1810]">
                  Active Orders
                </h3>
              </div>
              <Link 
                to="/admin/orders" 
                className="text-xs font-bold text-[#8B0A00] hover:underline flex items-center gap-0.5"
              >
                <span>View All ({orders.length})</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* List of Active Orders */}
            <div className="mt-4 space-y-3">
              {isLoading ? (
                <>
                  <div className="p-3.5 rounded-xl bg-white/70 border border-[#EADBC8] space-y-2.5">
                    <div className="flex justify-between items-center">
                      <AdminShimmer className="h-5 w-32 rounded" />
                      <AdminShimmer className="h-5 w-20 rounded-full" />
                    </div>
                    <div className="pt-2 border-t border-[#EADBC8]/40 flex justify-between">
                      <AdminShimmer className="h-4 w-28 rounded" />
                      <AdminShimmer className="h-4 w-16 rounded" />
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/70 border border-[#EADBC8] space-y-2.5">
                    <div className="flex justify-between items-center">
                      <AdminShimmer className="h-5 w-32 rounded" />
                      <AdminShimmer className="h-5 w-20 rounded-full" />
                    </div>
                    <div className="pt-2 border-t border-[#EADBC8]/40 flex justify-between">
                      <AdminShimmer className="h-4 w-28 rounded" />
                      <AdminShimmer className="h-4 w-16 rounded" />
                    </div>
                  </div>
                </>
              ) : activeOrders.length > 0 ? (
                activeOrders.slice(0, 4).map((ord) => {
                  const isUnderDiscussion = ord.status === 'Under Discussion'
                  return (
                    <Link
                      key={ord.id}
                      to={`/admin/orders/${ord.id}`}
                      className="block p-3.5 rounded-xl bg-white border border-[#EADBC8] hover:border-[#8B0A00] transition-all cursor-pointer shadow-xs group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-[#2D1810] group-hover:text-[#8B0A00]">
                            {ord.customerName}
                          </h4>
                          <p className="text-xs text-[#785A48]">
                            {ord.eventType} · {ord.guestCount} Plates
                          </p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shrink-0 ${
                          isUnderDiscussion ? 'status-badge-discussion' : 'status-badge-confirmed'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isUnderDiscussion ? 'bg-yellow-600' : 'bg-green-600'}`}></span>
                          {ord.status}
                        </span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#EADBC8]/60 flex items-center justify-between text-xs text-[#785A48]">
                        <span>Date: <strong>{format(parseISO(ord.eventDate), 'd MMM yyyy')}</strong></span>
                        <span className="text-[#2D1810] font-semibold truncate max-w-[150px]">
                          {ord.notes || (isUnderDiscussion ? 'Tasting scheduled' : 'Dispatched to hall')}
                        </span>
                        <span className="font-bold text-[#8B0A00] text-sm font-serif">
                          ₹{ord.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </Link>
                  )
                })
              ) : (
                <div className="py-8 text-center text-[#785A48]">
                  <p className="font-bold text-[#2D1810]">No active orders right now.</p>
                  <p className="text-xs">Confirmed orders and active discussions will show here.</p>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* ========================================================
             4. STATUS BADGE COLOR PALETTE GUIDE & QUICK LINK BAR
             ======================================================== */}
        <footer className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#785A48] border-t border-[#EADBC8]/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[#2D1810]">Status Key:</span>
            <span className="status-badge-new px-2 py-0.5 rounded font-bold">New Request = Gold</span>
            <span className="status-badge-discussion px-2 py-0.5 rounded font-bold">Under Discussion = Turmeric</span>
            <span className="status-badge-confirmed px-2 py-0.5 rounded font-bold">Confirmed = Green</span>
            <span className="status-badge-completed px-2 py-0.5 rounded font-bold">Completed = Grey-Brown</span>
            <span className="status-badge-cancelled px-2 py-0.5 rounded font-bold">Cancelled = Chilli Red</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/admin/orders" className="font-bold text-[#8B0A00] hover:underline">
              All Orders ({orders.length})
            </Link>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                if (selectedDateOrders.length > 0) setBeoOrder(selectedDateOrders[0])
                else toast.info('No events scheduled today')
              }}
              className="font-bold text-[#2D1810] hover:underline cursor-pointer"
            >
              Today's Kitchen Roster
            </button>
            <span>·</span>
            <span>© 2025 TKS Iyengar's Mysore</span>
          </div>
        </footer>

      </div>

      {/* ========================================================
           MODAL 1: CREATE MANUAL ORDER (Compact & No-Scroll)
           ======================================================== */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-[#EADBC8] space-y-3.5 animate-in fade-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#EADBC8]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#8B0A00]/10 text-[#8B0A00] flex items-center justify-center font-bold">
                  <FilePlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2D1810]">Create Manual Order</h3>
                  <p className="text-[11px] text-[#785A48]">For direct phone bookings, walk-ins, and temple elders</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#F7EFE2] text-[#785A48] hover:text-[#2D1810] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inputs */}
            <form onSubmit={handleCreateManualOrder} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D1810] mb-1">Customer / Host Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nagaraja Dixit"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-[#EADBC8] focus:border-[#8B0A00] focus:outline-none text-xs sm:text-sm font-semibold bg-[#FFF9F0]/40 text-[#2D1810]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2D1810] mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-[#EADBC8] focus:border-[#8B0A00] focus:outline-none text-xs sm:text-sm font-semibold bg-[#FFF9F0]/40 text-[#2D1810]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D1810] mb-1">Occasion Type *</label>
                  <select
                    value={manualOccasion}
                    onChange={(e) => setManualOccasion(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-[#EADBC8] focus:border-[#8B0A00] focus:outline-none text-xs sm:text-sm font-semibold bg-[#FFF9F0]/40 text-[#2D1810] cursor-pointer"
                  >
                    <option value="Griha Pravesh">Griha Pravesh</option>
                    <option value="Muhurtham Wedding">Muhurtham Wedding</option>
                    <option value="Satyanarayana Pooja">Satyanarayana Pooja</option>
                    <option value="Upanayana">Upanayana</option>
                    <option value="Sashti Poorthi">Sashti Poorthi (60th B'day)</option>
                    <option value="Other Feast">Other Feast</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2D1810] mb-1">Feast Date *</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-[#EADBC8] focus:border-[#8B0A00] focus:outline-none text-xs sm:text-sm font-semibold bg-[#FFF9F0]/40 text-[#2D1810]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D1810] mb-1">Number of Plates *</label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    required
                    value={manualPlates}
                    onChange={(e) => setManualPlates(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-[#EADBC8] focus:border-[#8B0A00] focus:outline-none text-xs sm:text-sm font-semibold bg-[#FFF9F0]/40 text-[#2D1810]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2D1810] mb-1">Delivery Address / Hall Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Raghavendra Kalyana Mantapa, Mysore"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-[#EADBC8] focus:border-[#8B0A00] focus:outline-none text-xs sm:text-sm font-semibold bg-[#FFF9F0]/40 text-[#2D1810]"
                  />
                </div>
              </div>

              {/* Order Status */}
              <div>
                <label className="block text-xs font-bold text-[#2D1810] mb-1">Order Status</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                    manualStatus === 'Confirmed' ? 'border-green-500 bg-green-50/80 ring-1 ring-green-500/20' : 'border-[#EADBC8] bg-white hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="manualStatus"
                      value="Confirmed"
                      checked={manualStatus === 'Confirmed'}
                      onChange={() => setManualStatus('Confirmed')}
                      className="text-green-600 focus:ring-green-500 w-3.5 h-3.5"
                    />
                    <span className="text-xs font-bold text-green-900">Mark as Confirmed</span>
                  </label>
                  <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                    manualStatus === 'Under Discussion' ? 'border-amber-500 bg-amber-50/80 ring-1 ring-amber-500/20' : 'border-[#EADBC8] bg-white hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="manualStatus"
                      value="Under Discussion"
                      checked={manualStatus === 'Under Discussion'}
                      onChange={() => setManualStatus('Under Discussion')}
                      className="text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                    />
                    <span className="text-xs font-bold text-amber-900">Under Discussion</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#EADBC8]">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#EADBC8] text-[#2D1810] font-semibold text-xs hover:bg-[#F7EFE2] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#8B0A00] to-[#B30A05] text-white font-bold text-xs shadow-md shadow-[#8B0A00]/25 hover:brightness-105 active:scale-95 cursor-pointer transition-all"
                >
                  Save &amp; Add Order
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================
           MODAL 2: REVIEW INCOMING REQUEST
           ======================================================== */}
      {reviewOrder && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-order-modal-title"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-[#EADBC8] animate-in fade-in zoom-in-95 duration-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-[#EADBC8] bg-[#FDFBF7] shrink-0">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="status-badge-new text-xs px-2.5 py-0.5 rounded-full font-bold">
                    Review Customer Request
                  </span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#F7EFE2] text-[#785A48] border border-[#EADBC8]">
                    {reviewOrder.id}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {reviewOrder.source}
                  </span>
                </div>
                <h3 id="review-order-modal-title" className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1810]">
                  {reviewOrder.customerName}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#785A48] pt-0.5">
                  <a
                    href={`tel:${reviewOrder.customerPhone}`}
                    className="inline-flex items-center gap-1.5 font-bold text-[#8B0A00] hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>+91 {reviewOrder.customerPhone}</span>
                  </a>
                  <span>•</span>
                  <span>Received {format(parseISO(reviewOrder.createdAt || reviewOrder.eventDate), 'd MMM yyyy, h:mm a')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReviewOrder(null)}
                aria-label="Close review modal"
                className="w-9 h-9 rounded-full bg-[#F7EFE2] text-[#785A48] hover:text-[#2D1810] hover:bg-[#EADBC8] flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Body (Entire Order Summary + Actions) */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1 divide-y divide-[#EADBC8]/60">
              
              {/* SECTION 1: Event & Logistics Summary */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#2D1810] uppercase tracking-wider flex items-center gap-1.5">
                  <Armchair className="w-4 h-4 text-[#8B0A00]" />
                  <span>Occasion &amp; Logistics Overview</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#EADBC8]">
                    <span className="text-[10.5px] font-semibold text-[#785A48] block">Occasion</span>
                    <span className="text-xs sm:text-sm font-bold text-[#2D1810] block truncate mt-0.5">
                      {reviewOrder.eventType || 'Banqueting Feast'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#EADBC8]">
                    <span className="text-[10.5px] font-semibold text-[#785A48] block">Event Date</span>
                    <span className="text-xs sm:text-sm font-bold text-[#8B0A00] block truncate mt-0.5">
                      {format(parseISO(reviewOrder.eventDate), 'dd MMM yyyy')}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#EADBC8]">
                    <span className="text-[10.5px] font-semibold text-[#785A48] block">Time Slot</span>
                    <span className="text-xs sm:text-sm font-bold text-[#2D1810] block truncate mt-0.5">
                      {reviewOrder.eventTime} Service
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#EADBC8]">
                    <span className="text-[10.5px] font-semibold text-[#785A48] block">Headcount</span>
                    <span className="text-xs sm:text-sm font-bold text-[#2D1810] block truncate mt-0.5">
                      {reviewOrder.guestCount} Plates
                    </span>
                  </div>
                </div>

                {/* Venue Address */}
                <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#EADBC8] flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#8B0A00] shrink-0 mt-0.5" />
                  <div className="min-w-0 text-xs">
                    <span className="font-bold text-[#2D1810] block">Delivery / Banquet Venue:</span>
                    <p className="text-[#5A4033] mt-0.5">
                      {reviewOrder.venueAddress || 'Venue address pending customer confirmation during consultation.'}
                    </p>
                  </div>
                </div>

                {/* Notes if present */}
                {Boolean(reviewOrder.notes || reviewOrder.specialInstructions || reviewOrder.enquiryNotes) && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div className="min-w-0 text-xs">
                      <span className="font-bold text-amber-950 block">Customer Special Instructions:</span>
                      <p className="text-amber-900 mt-0.5">
                        {reviewOrder.notes || reviewOrder.specialInstructions || reviewOrder.enquiryNotes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: Selected Menu Breakdown */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#2D1810] uppercase tracking-wider flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-[#8B0A00]" />
                    <span>Selected Menu ({reviewOrder.items?.length || 0} Delicacies)</span>
                  </h4>
                  <span className="text-xs font-bold text-[#8B0A00]">
                    ₹{reviewOrder.perPlateTotal || Math.round(reviewOrder.totalAmount / (reviewOrder.guestCount || 1))}/plate
                  </span>
                </div>

                {reviewOrder.items && reviewOrder.items.length > 0 ? (
                  <div className="border border-[#EADBC8] rounded-xl overflow-hidden divide-y divide-[#EADBC8]/60 bg-[#FDFBF7]">
                    <div className="grid grid-cols-12 px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-wider text-[#785A48] bg-[#F7EFE2]">
                      <span className="col-span-8">Dish Name</span>
                      <span className="col-span-2 text-center">Qty / Leaf</span>
                      <span className="col-span-2 text-right">Per Plate</span>
                    </div>
                    {reviewOrder.items.map((item, idx) => (
                      <div key={item.id || idx} className="grid grid-cols-12 px-3.5 py-2.5 text-xs text-[#2D1810] hover:bg-white/80 transition-colors items-center">
                        <div className="col-span-8 font-medium flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8B0A00] shrink-0"></span>
                          <span className="truncate">{item.name}</span>
                        </div>
                        <span className="col-span-2 text-center text-[11px] text-[#785A48] font-mono">
                          {item.quantity || 1}
                        </span>
                        <span className="col-span-2 text-right font-bold text-[#2D1810]">
                          ₹{item.pricePerPlate}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-[#EADBC8] text-center text-xs text-[#785A48]">
                    No individual dishes pre-selected. Standard Satvik Banana Leaf Thali selected.
                  </div>
                )}

                {/* Financial Summary Strip */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#F7EFE2] to-amber-50 border border-[#EADBC8] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#785A48] block">Estimated Banquet Total</span>
                    <span className="text-[10px] text-[#785A48]">
                      {reviewOrder.guestCount} plates × ₹{reviewOrder.perPlateTotal || Math.round(reviewOrder.totalAmount / (reviewOrder.guestCount || 1))}/plate
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-xl sm:text-2xl font-black text-[#8B0A00] block">
                      ₹{reviewOrder.totalAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-green-700 font-bold block">
                      No advance collected yet
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Choose Next Action */}
              <div className="pt-4 space-y-2.5">
                <label className="block text-xs font-bold text-[#2D1810] uppercase tracking-wider">
                  Choose Next Action:
                </label>
                
                <button
                  type="button"
                  onClick={handleConfirmEnquiry}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-green-500 bg-green-50/70 hover:bg-green-100 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-700 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-bold text-sm text-green-950">Confirm &amp; Add to Calendar</p>
                      <p className="text-xs text-green-800">Leaves date marked as Confirmed with red bubble on booking grid</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-green-800 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={handleDiscussEnquiry}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-yellow-400 bg-yellow-50/70 hover:bg-yellow-100 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <PhoneCall className="w-6 h-6 text-yellow-700 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-bold text-sm text-yellow-950">Mark as "Under Discussion"</p>
                      <p className="text-xs text-yellow-800">Called client; finalizing muhurtham timings or menu dishes</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-yellow-800 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={handleCancelEnquiry}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-bold text-xs text-red-950">Decline / Cancel Request</p>
                      <p className="text-[11px] text-red-800">Slot full, out of delivery zone, or patron cancelled</p>
                    </div>
                  </div>
                </button>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-[#EADBC8] bg-[#FDFBF7] flex items-center justify-between shrink-0">
              <Link
                to={`/admin/orders/${reviewOrder.id}`}
                className="text-xs font-bold text-[#8B0A00] hover:underline flex items-center gap-1"
                onClick={() => setReviewOrder(null)}
              >
                <span>Open Full Order Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setReviewOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-[#F7EFE2] hover:bg-[#EADBC8] text-[#2D1810] font-bold text-xs cursor-pointer transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kitchen BEO Dispatch Sheet Modal */}
      {beoOrder && (
        <KitchenBEOSheetModal
          order={beoOrder}
          isOpen={Boolean(beoOrder)}
          onClose={() => setBeoOrder(null)}
        />
      )}

    </AdminAppShell>
  )
}

export default AdminDashboardPage
