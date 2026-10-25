import React, { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FilterX, Phone, ExternalLink, Printer, Calendar, Users, MapPin, Sparkles, Utensils } from 'lucide-react'
import { getOrders } from '@/api'
import type { Order, OrderStatus, OrderSource } from '@/data/mockData'
import { AdminAppShell } from '@/components/admin/AdminAppShell'
import { OrderCard } from '@/components/admin/OrderCard'
import { OrderListSkeleton } from '@/components/admin/AdminSkeletons'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'
import { StatusChip } from '@/components/admin/StatusChip'
import { SourceChip } from '@/components/admin/SourceChip'
import { formatRupees, formatEventDate } from '@/lib/format'

type TimeSegment = 'Upcoming' | 'Past' | 'All'
type StatusFilter = 'All' | OrderStatus
type SourceFilter = 'Any' | OrderSource

const STATUS_OPTIONS: StatusFilter[] = [
  'All',
  'New Request',
  'Under Discussion',
  'Confirmed',
  'Completed',
  'Cancelled'
]

const SOURCE_OPTIONS: SourceFilter[] = ['Any', 'Online', 'Manual']

export const AdminOrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Initialize filters from query parameters if present
  const [timeSegment, setTimeSegment] = useState<TimeSegment>(() => {
    const t = searchParams.get('time')
    if (t === 'past') return 'Past'
    if (t === 'all') return 'All'
    return 'Upcoming'
  })

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => {
    const s = searchParams.get('status')
    if (s === 'new') return 'New Request'
    if (s === 'discussion') return 'Under Discussion'
    if (s === 'confirmed') return 'Confirmed'
    if (s === 'completed') return 'Completed'
    if (s === 'cancelled') return 'Cancelled'
    return 'All'
  })

  const [sourceFilter, setSourceFilter] = useState<SourceFilter>(() => {
    const src = searchParams.get('source')
    if (src === 'online') return 'Online'
    if (src === 'manual') return 'Manual'
    return 'Any'
  })

  // Reference date: current date string (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }, [])

  // Two-pane desktop inspector state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  // Fetch orders from API
  useEffect(() => {
    let isMounted = true
    const loadOrders = async () => {
      try {
        setIsLoading(true)
        const data = await getOrders()
        if (isMounted) {
          setOrders(data)
        }
      } catch (err) {
        console.error('Failed to load orders in AdminOrdersPage:', err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadOrders()
    return () => {
      isMounted = false
    }
  }, [])

  // Sync URL search parameters with filter state
  useEffect(() => {
    const params = new URLSearchParams()
    if (timeSegment !== 'Upcoming') params.set('time', timeSegment.toLowerCase())
    if (statusFilter !== 'All') {
      if (statusFilter === 'New Request') params.set('status', 'new')
      else if (statusFilter === 'Under Discussion') params.set('status', 'discussion')
      else params.set('status', statusFilter.toLowerCase())
    }
    if (sourceFilter !== 'Any') params.set('source', sourceFilter.toLowerCase())
    setSearchParams(params, { replace: true })
  }, [timeSegment, statusFilter, sourceFilter, setSearchParams])

  // 1. Calculate time segment counts
  const segmentCounts = useMemo(() => {
    let upcoming = 0
    let past = 0
    for (const o of orders) {
      if (o.eventDate >= todayStr) upcoming++
      else past++
    }
    return {
      Upcoming: upcoming,
      Past: past,
      All: orders.length
    }
  }, [orders, todayStr])

  // 2. Orders filtered by time segment first
  const ordersInTimeSegment = useMemo(() => {
    return orders.filter((o) => {
      if (timeSegment === 'Upcoming') return o.eventDate >= todayStr
      if (timeSegment === 'Past') return o.eventDate < todayStr
      return true
    })
  }, [orders, timeSegment, todayStr])

  // 3. Status counts within the active time segment (per spec: "each with a count")
  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      'All': ordersInTimeSegment.length,
      'New Request': 0,
      'Under Discussion': 0,
      'Confirmed': 0,
      'Completed': 0,
      'Cancelled': 0
    }

    for (const o of ordersInTimeSegment) {
      if (counts[o.status] !== undefined) {
        counts[o.status]++
      }
    }
    return counts
  }, [ordersInTimeSegment])

  // 4. Source counts within the active time segment and status filter
  const sourceCounts = useMemo(() => {
    const pool = ordersInTimeSegment.filter((o) => {
      if (statusFilter === 'All') return true
      return o.status === statusFilter
    })

    let online = 0
    let manual = 0
    for (const o of pool) {
      if (o.source === 'Online') online++
      else if (o.source === 'Manual') manual++
    }
    return {
      Any: pool.length,
      Online: online,
      Manual: manual
    }
  }, [ordersInTimeSegment, statusFilter])

  // 5. Filter and Sort final list
  const filteredAndSortedOrders = useMemo(() => {
    // A. Apply time, status, and source filters
    const result = orders.filter((o) => {
      // Time segment filter
      if (timeSegment === 'Upcoming' && o.eventDate < todayStr) return false
      if (timeSegment === 'Past' && o.eventDate >= todayStr) return false

      // Status filter
      if (statusFilter !== 'All' && o.status !== statusFilter) return false

      // Source filter
      if (sourceFilter !== 'Any' && o.source !== sourceFilter) return false

      return true
    })

    // B. Sort per specification:
    // "Upcoming sorts soonest first, past newest first."
    return result.sort((a, b) => {
      if (timeSegment === 'Upcoming') {
        // Soonest first
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      } else if (timeSegment === 'Past') {
        // Newest past first
        return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      } else {
        // 'All': Upcoming first (soonest first), then past (newest first)
        const aUpcoming = a.eventDate >= todayStr
        const bUpcoming = b.eventDate >= todayStr
        if (aUpcoming && !bUpcoming) return -1
        if (!aUpcoming && bUpcoming) return 1
        if (aUpcoming && bUpcoming) {
          return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        }
        return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      }
    })
  }, [orders, timeSegment, statusFilter, sourceFilter, todayStr])

  // Selected order for right pane inspector on 1024px+
  const selectedOrder = useMemo(() => {
    if (selectedOrderId) {
      const found = orders.find((o) => o.id === selectedOrderId)
      if (found) return found
    }
    return filteredAndSortedOrders[0] || null
  }, [orders, selectedOrderId, filteredAndSortedOrders])

  // Reset filters helper
  const handleResetFilters = () => {
    setTimeSegment('Upcoming')
    setStatusFilter('All')
    setSourceFilter('Any')
  }

  // Get active filter description for empty state
  const getEmptyStateDescription = () => {
    if (statusFilter !== 'All' && sourceFilter !== 'Any') {
      return `No ${timeSegment.toLowerCase()} ${statusFilter.toLowerCase()} orders received via ${sourceFilter}.`
    }
    if (statusFilter !== 'All') {
      return `No ${timeSegment.toLowerCase()} orders found with status "${statusFilter}".`
    }
    if (sourceFilter !== 'Any') {
      return `No ${timeSegment.toLowerCase()} orders found with source "${sourceFilter}".`
    }
    if (timeSegment === 'Past') {
      return 'No past completed or cancelled catering orders on record.'
    }
    return `No ${timeSegment.toLowerCase()} catering orders found.`
  }

  return (
    <AdminAppShell title="All Orders" subtitle="Master Register & Filtered History">
      <div className="relative space-y-6 pb-28 lg:pb-12">
        
        {/* ======================================================== */}
        {/* GLASS LARGE-TITLE HEADER WITH FILTERS                    */}
        {/* ======================================================== */}
        <div className="sticky top-0 z-10 -mx-4 -mt-4 px-4 pt-3 pb-4 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-4 sm:pb-5 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pt-6 lg:pb-5 glass-top-bar border-b border-slate-200/80 space-y-3.5 sm:space-y-4">
          
          {/* Large Title & Counter */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-[var(--brand-900)] tracking-tight">
                All Orders
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium pt-0.5">
                {isLoading ? (
                  'Loading catering records...'
                ) : (
                  `Showing ${filteredAndSortedOrders.length} of ${orders.length} total orders`
                )}
              </p>
            </div>

            {/* Reset Filters button if any filter is active */}
            {(timeSegment !== 'Upcoming' || statusFilter !== 'All' || sourceFilter !== 'Any') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-xs font-bold text-[var(--brand)] hover:underline tap-target-48 sm:tap-target-auto"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* 1. SEGMENTED CONTROL: Upcoming / Past / All per spec */}
          <div className="bg-slate-200/60 p-1 rounded-2xl flex items-center select-none shadow-inner max-w-md">
            {(['Upcoming', 'Past', 'All'] as TimeSegment[]).map((segment) => {
              const active = timeSegment === segment
              const count = segmentCounts[segment]
              return (
                <button
                  key={segment}
                  type="button"
                  onClick={() => setTimeSegment(segment)}
                  className={`flex-1 py-1.5 sm:py-2 px-3 rounded-xl font-heading font-bold text-xs sm:text-sm text-center transition-all tap-target-48 sm:tap-target-auto ${
                    active
                      ? 'bg-white text-[var(--brand-900)] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{segment}</span>
                  <span className={`ml-1 text-[11px] font-semibold ${active ? 'text-[var(--brand)]' : 'text-slate-400'}`}>
                    ({count})
                  </span>
                </button>
              )
            })}
          </div>

          {/* 2. HORIZONTALLY SCROLLING STATUS CHIPS (each with a count) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar select-none">
            {STATUS_OPTIONS.map((st) => {
              const active = statusFilter === st
              const count = statusCounts[st]
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all tap-target-48 sm:tap-target-auto flex items-center gap-1.5 ${
                    active
                      ? 'bg-[var(--brand)] text-[var(--on-brand)] border-[var(--brand)] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <span>{st}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* 3. SMALL SECOND CHIP GROUP FOR SOURCE: Any, Online, Manual */}
          <div className="flex items-center gap-2 select-none pt-0.5 text-xs">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider shrink-0">
              Source:
            </span>
            <div className="flex items-center gap-1.5">
              {SOURCE_OPTIONS.map((src) => {
                const active = sourceFilter === src
                const count = sourceCounts[src]
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setSourceFilter(src)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all tap-target-48 sm:tap-target-auto flex items-center gap-1 ${
                      active
                        ? 'bg-[var(--brand-900)] text-white border-[var(--brand-900)] shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{src}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                )
              })}
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* TWO-PANE LAYOUT FROM 1024px: Orders List + Inspector     */}
        {/* ======================================================== */}
        {isLoading ? (
          <OrderListSkeleton count={4} />
        ) : filteredAndSortedOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-1">
            
            {/* Left Pane: Orders List (Cards on mobile, dense table-like list on desktop) */}
            <div className="col-span-12 lg:col-span-5 space-y-3.5 min-w-0">
              
              {/* Mobile View (< 1024px): Card-based list */}
              <div className="lg:hidden space-y-3.5">
                {filteredAndSortedOrders.map((order) => (
                  <div key={order.id}>
                    <OrderCard
                      order={order}
                      showTimeReceived={order.status === 'New Request'}
                    />
                  </div>
                ))}
              </div>

              {/* Desktop View (>= 1024px): Dense table-like list */}
              <div className="hidden lg:block bg-white rounded-[20px] border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-3.5 py-2.5 bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  <div className="col-span-5 truncate">Customer / Event</div>
                  <div className="col-span-3 text-center truncate">Date</div>
                  <div className="col-span-4 text-right truncate">Status / Plates</div>
                </div>

                <div className="divide-y divide-slate-100 max-h-[calc(100vh-220px)] overflow-y-auto">
                  {filteredAndSortedOrders.map((order) => {
                    const isSelected = selectedOrder?.id === order.id
                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => setSelectedOrderId(order.id)}
                        className={`w-full text-left grid grid-cols-12 gap-2 px-3.5 py-3 items-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/70 border-l-4 border-l-[var(--brand)] text-slate-900'
                            : 'hover:bg-slate-50/80 text-slate-700'
                        }`}
                      >
                        <div className="col-span-5 min-w-0">
                          <p className="font-heading font-black text-xs text-[var(--brand-900)] truncate">
                            {order.customerName}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium truncate">
                            {order.eventType} • #{order.id.replace(/^TKS-/, '')}
                          </p>
                        </div>

                        <div className="col-span-3 text-center min-w-0">
                          <span className="text-[11px] font-bold text-slate-700 block truncate">
                            {formatEventDate(order.eventDate)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {order.eventTime || 'Morning'}
                          </span>
                        </div>

                        <div className="col-span-4 flex flex-col items-end gap-1 min-w-0">
                          <StatusChip status={order.status} size="sm" />
                          <span className="text-[11px] font-bold text-[var(--brand)] truncate">
                            {order.guestCount} pl • ₹{order.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* Right Pane: Selected Order Inspector Console (hidden lg:block lg:col-span-7 sticky top-24) */}
            {selectedOrder && (
              <div className="hidden lg:block lg:col-span-7 sticky top-24 min-w-0">
                <div className="content-card p-6 rounded-[24px] bg-white border border-slate-200/90 shadow-md space-y-5">
                  
                  {/* Top Bar: Order ID, Chips, Call Customer */}
                  <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading font-black text-xl text-[var(--brand-900)]">
                          {selectedOrder.customerName}
                        </h2>
                        <SourceChip source={selectedOrder.source} size="sm" />
                        <StatusChip status={selectedOrder.status} size="sm" />
                      </div>
                      <p className="text-xs text-[var(--text-muted)] font-medium pt-1">
                        Record ID: <span className="font-bold text-slate-800">{selectedOrder.id}</span> • Customer: <span className="font-semibold text-slate-700">{selectedOrder.customerPhone}</span>
                      </p>
                    </div>

                    <a
                      href={`tel:${selectedOrder.customerPhone}`}
                      className="h-9 px-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0"
                      title={`Call +91 ${selectedOrder.customerPhone}`}
                    >
                      <Phone className="w-3.5 h-3.5 fill-white" />
                      <span>Call</span>
                    </a>
                  </div>

                  {/* Event Details Grid */}
                  <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider block">
                        Occasion
                      </span>
                      <p className="font-bold text-[var(--text-primary)] mt-0.5 truncate">
                        {selectedOrder.eventType}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider block">
                        Occasion Date
                      </span>
                      <div className="flex items-center gap-1 mt-0.5 font-bold text-[var(--brand-900)]">
                        <Calendar className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
                        <span className="truncate">{formatEventDate(selectedOrder.eventDate)}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider block">
                        Plates
                      </span>
                      <div className="flex items-center gap-1 mt-0.5 font-bold text-[var(--brand-900)]">
                        <Users className="w-3.5 h-3.5 text-[var(--brand-600)] shrink-0" />
                        <span>{selectedOrder.guestCount} guests</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address & Special Instructions */}
                  <div className="space-y-2 text-xs">
                    {selectedOrder.venueAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[var(--brand)] shrink-0 mt-0.5" />
                        <span className="text-slate-600 leading-snug">
                          <strong className="text-slate-900">Delivery Address:</strong> {selectedOrder.venueAddress}
                        </span>
                      </div>
                    )}
                    {selectedOrder.specialInstructions && (
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="text-slate-600 leading-snug">
                          <strong className="text-slate-900">Instructions:</strong> {selectedOrder.specialInstructions}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Selected Dishes Mini Breakdown */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] pb-2 flex items-center justify-between">
                      <span>Selected Dishes ({selectedOrder.items.length})</span>
                      <span className="text-[11px] font-bold text-[var(--brand)] lowercase">₹{selectedOrder.perPlateTotal}/plate</span>
                    </h3>
                    <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl bg-white text-xs">
                      {selectedOrder.items.map((it, idx) => (
                        <div key={idx} className="p-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Utensils className="w-3.5 h-3.5 text-amber-600" />
                            <span className="font-semibold text-slate-800">{it.name}</span>
                          </div>
                          <span className="font-bold text-slate-600">₹{it.pricePerPlate}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Overview */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50/60 to-orange-50/40 border border-amber-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[var(--brand-900)] block">Grand Banquet Total</span>
                      <span className="text-[10px] text-slate-500">Includes food subtotal, delivery & GST</span>
                    </div>
                    <span className="font-heading font-black text-xl text-[var(--brand-900)]">
                      {formatRupees(selectedOrder.totalAmount)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <Link
                      to={`/admin/orders/${selectedOrder.id}`}
                      className="flex-1 h-11 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[var(--on-brand)] font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                      <span>Open Full Order Management</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    {(selectedOrder.status === 'Confirmed' || selectedOrder.status === 'Completed') && (
                      <Link
                        to={`/admin/orders/${selectedOrder.id}/invoice`}
                        className="h-11 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>Invoice</span>
                      </Link>
                    )}
                  </div>

                </div>
              </div>
            )}

          </div>
        ) : (
          /* Empty state per filter specification */
          <AdminEmptyState
            variant="orders"
            title="No orders match your filter"
            description={getEmptyStateDescription()}
            actionLabel="Clear all filters"
            onAction={handleResetFilters}
          />
        )}
      </div>
    </AdminAppShell>
  )
}

export default AdminOrdersPage
