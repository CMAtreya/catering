import React, { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { format, parseISO, isValid } from 'date-fns'
import { toast } from 'sonner'

import { getOrders, saveOrder, setStatus, subscribeToOrders } from '@/api'
import type { Order, OrderStatus } from '@/data/mockData'
import { AdminAppShell } from '@/components/admin/AdminAppShell'

type ViewMode = 'table' | 'cards' | 'skeleton' | 'empty'
type DateFilter = 'all' | 'this-month' | 'upcoming' | 'past'
type SourceFilter = 'all' | 'online' | 'manual'
type StatusFilter = 'all' | 'new' | 'discussion' | 'confirmed' | 'completed' | 'cancelled'

// Status style mappings matching the Mysuru Heritage design
const STATUS_STYLES: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  'New Request': { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  'Under Discussion': { bg: '#FEF9C3', text: '#854D0E', border: '#FEF08A' },
  'Confirmed': { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
  'Completed': { bg: '#E7E5E4', text: '#44403C', border: '#D6D3D1' },
  'Cancelled': { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' }
}

// Occasion dot indicator colors
const getOccasionDotColor = (occasion: string): string => {
  const occ = (occasion || '').toLowerCase()
  if (occ.includes('griha')) return 'bg-amber-500'
  if (occ.includes('wed') || occ.includes('muhurtham')) return 'bg-amber-800'
  if (occ.includes('poorthi') || occ.includes('60')) return 'bg-amber-400'
  if (occ.includes('pooja') || occ.includes('homa') || occ.includes('satya')) return 'bg-emerald-700'
  if (occ.includes('upanayana') || occ.includes('munji')) return 'bg-emerald-500'
  return 'bg-amber-600'
}

// Auspicious Tithi and Kannada name mappings
const KANNADA_NAMES: Record<string, string> = {
  'Venkatesh Murthy': 'ವೆಂಕಟೇಶ್ ಮೂರ್ತಿ',
  'Sowmya Anantharaman': 'ಸೌಮ್ಯ ಅನಂತರಾಮನ್',
  'K. S. Raghavachar': 'ಕೆ. ಎಸ್. ರಾಘವಾಚಾರ್',
  'Prasanna Kumar B.': 'ಪ್ರಸನ್ನ ಕುಮಾರ್',
  'Padmavathi Narasimhan': 'ಪದ್ಮಾವತಿ ನರಸಿಂಹನ್',
  'Dr. C. Srinivasa Varadan': 'ಡಾ. ಸಿ. ಶ್ರೀನಿವಾಸ ವರದನ್',
  'Geetha Thirunarayanan': 'ಗೀತಾ ತಿರುನಾರಾಯಣನ್',
  'Srinivasa Raghavan': 'ಶ್ರೀನಿವಾಸ ರಾಘವನ್',
  'Lakshminarasimha Bhat': 'ಲಕ್ಷ್ಮೀನರಸಿಂಹ ಭಟ್',
  'Kasturi Rangan': 'ಕಸ್ತೂರಿ ರಂಗನ್',
  'Sampath Kumaran': 'ಸಂಪತ್ ಕುಮಾರನ್',
  'H.V. Seshadri': 'ಎಚ್.ವಿ. ಶೇಷಾದ್ರಿ',
  'Anand Deshikachar': 'ಆನಂದ್ ದೇಶಿಕಾಚಾರ್',
  'Vidya Varadarajan': 'ವಿದ್ಯಾ ವರದರಾಜನ್',
  'Harish Belavadi': 'ಹರೀಶ್ ಬೆಳವಡಿ',
  'Deepa Narayan': 'ದೀಪಾ ನಾರಾಯಣ್',
  'Kalyan Ramanathan': 'ಕಲ್ಯಾಣ್ ರಾಮನಾಥನ್'
}

function getKannadaSubtext(order: Order): string {
  const kn = KANNADA_NAMES[order.customerName] || order.customerName
  const loc = order.venueAddress ? order.venueAddress.split(',')[0].trim() : 'Mysuru'
  return `${kn} • ${loc}`
}

function getAuspiciousTithi(dateStr: string): string {
  const tithis = [
    'Karthika Shuddha Dashami',
    'Karthika Ekadashi • Morning Feast',
    'Karthika Dwadashi',
    'Margashirsha Pratipada',
    'Margashirsha Dwitiya',
    'Margashirsha Chaturthi',
    'Karthika Ashtami • Finished',
    'Karthika Somavara Feast',
    'Karthika Purnima',
    'Shukla Paksha Trayodashi'
  ]
  if (!dateStr) return 'Karthika Somavara'
  let sum = 0
  for (let i = 0; i < dateStr.length; i++) {
    sum += dateStr.charCodeAt(i)
  }
  return tithis[sum % tithis.length]
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return 'Date Pending'
  try {
    const d = parseISO(dateStr)
    if (isValid(d)) return format(d, 'EEE, dd MMM yyyy')
  } catch {
    // fallback
  }
  return dateStr
}

function formatPhone(phone: string): string {
  if (!phone) return '+91 98450 12345'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  return phone.startsWith('+91') ? phone : `+91 ${phone}`
}

function getCleanTel(phone: string): string {
  if (!phone) return 'tel:+919845012345'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `tel:+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `tel:+${digits}`
  return `tel:+91${digits.slice(-10)}`
}

export const AdminOrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // View state: 'table' | 'cards' | 'skeleton' | 'empty'
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  // Search query
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Date Range filter
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')

  // Source filter: 'all' | 'online' | 'manual'
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>(() => {
    const src = searchParams.get('source')
    if (src === 'online') return 'online'
    if (src === 'manual') return 'manual'
    return 'all'
  })

  // Status filter: 'all' | 'new' | 'discussion' | 'confirmed' | 'completed' | 'cancelled'
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => {
    const st = searchParams.get('status')
    if (st === 'new') return 'new'
    if (st === 'discussion') return 'discussion'
    if (st === 'confirmed') return 'confirmed'
    if (st === 'completed') return 'completed'
    if (st === 'cancelled') return 'cancelled'
    return 'all'
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 8

  // Slide-over inspection drawer state
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null)
  const [drawerStatus, setDrawerStatus] = useState<OrderStatus>('New Request')

  // Create Manual Order modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false)
  const [manualName, setManualName] = useState<string>('')
  const [manualPhone, setManualPhone] = useState<string>('')
  const [manualOccasion, setManualOccasion] = useState<string>('Griha Pravesh')
  const [manualDate, setManualDate] = useState<string>('2025-11-22')
  const [manualPlates, setManualPlates] = useState<number>(150)
  const [manualAmount, setManualAmount] = useState<number>(42500)
  const [manualAddress, setManualAddress] = useState<string>('')

  // Toast banner state for matching template
  const [toastMessage, setToastMessage] = useState<string>('')
  const [toastVisible, setToastVisible] = useState<boolean>(false)

  const showToastBanner = (msg: string) => {
    setToastMessage(msg)
    setToastVisible(true)
    setTimeout(() => {
      setToastVisible(false)
    }, 3200)
    toast(msg)
  }

  // Load orders
  const loadOrders = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true)
      const data = await getOrders()
      setOrders(data)
    } catch (err) {
      console.error('Failed to load orders:', err)
      toast.error('Failed to load orders')
    } finally {
      if (showLoader) setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    loadOrders(true)

    const unsubscribe = subscribeToOrders((latest) => {
      if (isMounted && latest) {
        setOrders(latest)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  // Sync inspectOrder status with drawer
  useEffect(() => {
    if (inspectOrder) {
      setDrawerStatus(inspectOrder.status)
    }
  }, [inspectOrder])

  // Sync URL search params
  useEffect(() => {
    const params = new URLSearchParams()
    if (sourceFilter !== 'all') params.set('source', sourceFilter)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    setSearchParams(params, { replace: true })
  }, [sourceFilter, statusFilter, setSearchParams])

  // Today reference string
  const todayStr = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }, [])

  // Status Counts
  const statusCounts = useMemo(() => {
    const counts = {
      all: orders.length,
      new: 0,
      discussion: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    }
    for (const o of orders) {
      if (o.status === 'New Request') counts.new++
      else if (o.status === 'Under Discussion') counts.discussion++
      else if (o.status === 'Confirmed') counts.confirmed++
      else if (o.status === 'Completed') counts.completed++
      else if (o.status === 'Cancelled') counts.cancelled++
    }
    return counts
  }, [orders])

  // Source Counts
  const sourceCounts = useMemo(() => {
    let online = 0
    let manual = 0
    for (const o of orders) {
      if (o.source === 'Online') online++
      else if (o.source === 'Manual') manual++
    }
    return { all: orders.length, online, manual }
  }, [orders])

  // Filtered and Sorted Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = o.customerName.toLowerCase().includes(q)
        const matchesId = o.id.toLowerCase().includes(q)
        const matchesPhone = o.customerPhone.includes(q)
        const matchesOccasion = o.eventType.toLowerCase().includes(q)
        const matchesAddress = (o.venueAddress || '').toLowerCase().includes(q)
        if (!matchesName && !matchesId && !matchesPhone && !matchesOccasion && !matchesAddress) {
          return false
        }
      }

      // 2. Date Filter
      if (dateFilter === 'this-month') {
        const targetMonth = '2025-11'
        const hasNov = o.eventDate && (o.eventDate.startsWith(targetMonth) || o.eventDate.includes('11'))
        if (!hasNov && !o.eventDate.startsWith('2026-10') && !o.eventDate.startsWith('2026-11')) {
          return false
        }
      } else if (dateFilter === 'upcoming') {
        if (o.eventDate && o.eventDate < todayStr && o.status === 'Completed') return false
      } else if (dateFilter === 'past') {
        if (o.status !== 'Completed' && (!o.eventDate || o.eventDate >= todayStr)) return false
      }

      // 3. Source Filter
      if (sourceFilter === 'online' && o.source !== 'Online') return false
      if (sourceFilter === 'manual' && o.source !== 'Manual') return false

      // 4. Status Filter
      if (statusFilter === 'new' && o.status !== 'New Request') return false
      if (statusFilter === 'discussion' && o.status !== 'Under Discussion') return false
      if (statusFilter === 'confirmed' && o.status !== 'Confirmed') return false
      if (statusFilter === 'completed' && o.status !== 'Completed') return false
      if (statusFilter === 'cancelled' && o.status !== 'Cancelled') return false

      return true
    })
  }, [orders, searchQuery, dateFilter, sourceFilter, statusFilter, todayStr])

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize))
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredOrders.slice(start, start + pageSize)
  }, [filteredOrders, currentPage, pageSize])

  const startIndex = filteredOrders.length > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const endIndex = Math.min(currentPage * pageSize, filteredOrders.length)

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('')
    setDateFilter('all')
    setSourceFilter('all')
    setStatusFilter('all')
    setViewMode('table')
    setCurrentPage(1)
    showToastBanner(`Restored all ${orders.length} catering orders`)
  }

  // Save status change from Slide-over drawer
  const handleSaveStatusChange = async () => {
    if (!inspectOrder) return
    try {
      await setStatus(inspectOrder.id, drawerStatus)
      setInspectOrder((prev) => (prev ? { ...prev, status: drawerStatus } : null))
      setOrders((prev) =>
        prev.map((o) => (o.id === inspectOrder.id ? { ...o, status: drawerStatus } : o))
      )
      showToastBanner(`Status updated to: ${drawerStatus}`)
    } catch (err) {
      console.error('Failed to update status:', err)
      toast.error('Failed to update status')
    }
  }

  // Create Manual Order Submission
  const handleManualOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualName.trim() || !manualPhone.trim()) {
      toast.error('Please enter customer name and valid mobile number.')
      return
    }

    try {
      const newOrder = await saveOrder({
        customerName: manualName.trim(),
        customerPhone: manualPhone.trim(),
        eventType: manualOccasion,
        eventDate: manualDate,
        eventTime: 'Morning',
        guestCount: Number(manualPlates) || 100,
        perPlateTotal: Math.round(Number(manualAmount) / (Number(manualPlates) || 100)) || 285,
        totalAmount: Number(manualAmount) || 28500,
        venueAddress: manualAddress.trim() || 'Mysuru Kalyana Mantapa',
        source: 'Manual',
        status: 'Confirmed',
        items: [
          { id: 'item-1', name: 'Mysuru Traditional Puliyogare', pricePerPlate: 65, quantity: 1 },
          { id: 'item-2', name: 'Bisi Bele Bath with Pure Ghee', pricePerPlate: 65, quantity: 1 },
          { id: 'item-3', name: 'Melkote Kalyani Huli', pricePerPlate: 45, quantity: 1 },
          { id: 'item-4', name: 'Royal Mysuru Pak', pricePerPlate: 50, quantity: 1 },
          { id: 'item-5', name: 'Chikmagalur Degree Filter Coffee', pricePerPlate: 25, quantity: 1 }
        ]
      })

      setOrders((prev) => [newOrder, ...prev])
      setIsManualModalOpen(false)
      // Reset form fields
      setManualName('')
      setManualPhone('')
      setManualAddress('')
      showToastBanner(`Order created! Ref: #${newOrder.id}`)
    } catch (err) {
      console.error('Failed to create manual order:', err)
      toast.error('Could not create manual order')
    }
  }

  // Kitchen Sheet CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Order ID',
      'Customer Name',
      'Mobile',
      'Occasion',
      'Event Date',
      'Plates',
      'Total Amount (INR)',
      'Source',
      'Status',
      'Venue Address'
    ]
    const rows = filteredOrders.map((o) => [
      o.id,
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.customerPhone,
      `"${o.eventType}"`,
      o.eventDate,
      o.guestCount,
      o.totalAmount,
      o.source,
      o.status,
      `"${(o.venueAddress || '').replace(/"/g, '""')}"`
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `TKS-Kitchen-Sheet-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToastBanner('Kitchen Sheet CSV generated and downloaded successfully!')
  }

  // Print Order Slips
  const handlePrintSlips = () => {
    window.print()
    showToastBanner('Kitchen order slips sent to printer.')
  }

  return (
    <AdminAppShell>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6">

        {/* ========================================================
             1. TOP SHELL BAR (Namaskara, Pulse Badge, View Switcher, Hotline, Manual CTA)
             ======================================================== */}
        <header className="w-full bg-white/90 backdrop-blur-md rounded-2xl border border-outline-variant/60 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Left: Brand greeting & Live Kitchen Pulse */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                  Namaskara 🙏
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Kitchen: Active &amp; Prep On Schedule
                </span>
              </div>
              <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[15px] text-amber-700">calendar_today</span>
                <span>Karthika Maasa • Friday, 21 November 2025 • Mysuru Heritage Kitchens</span>
              </p>
            </div>
          </div>

          {/* Right: View Switcher Tabs, Hotline, and Manual Order CTA */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
            
            {/* View State Switcher (Interactive Demo Pill) */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 text-xs font-medium text-on-surface-variant">
              <button
                type="button"
                id="tabBtn-table"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                    : 'hover:text-primary'
                }`}
              >
                Table View
              </button>
              <button
                type="button"
                id="tabBtn-cards"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                    : 'hover:text-primary'
                }`}
              >
                Stacked Cards
              </button>
              <button
                type="button"
                id="tabBtn-skeleton"
                onClick={() => setViewMode('skeleton')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'skeleton'
                    ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                    : 'hover:text-primary'
                }`}
              >
                Loading State
              </button>
              <button
                type="button"
                id="tabBtn-empty"
                onClick={() => setViewMode('empty')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'empty'
                    ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                    : 'hover:text-primary'
                }`}
              >
                Empty State
              </button>
            </div>

            {/* Quick Kitchen Supervisor Hotline */}
            <a
              href="tel:+918212456789"
              title="Kitchen Supervisor Hotline"
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-primary border border-outline-variant/40 hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">call</span>
              <span>Kitchen: +91 821 2456789</span>
            </a>

            {/* Create Manual Order Primary Action CTA */}
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-white font-semibold text-xs shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 cursor-pointer"
              style={{ background: 'linear-gradient(90deg, #8B0A00 0%, #E0000F 50%, #8B0A00 100%)' }}
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span className="whitespace-nowrap">+ Create Manual Order</span>
            </button>
          </div>
        </header>

        {/* ========================================================
             2. HEADER TITLE, COUNTS & EXPORT ACTIONS
             ======================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
                All Orders (ಎಲ್ಲಾ ಆರ್ಡರ್ಗಳು)
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffdad4] text-[#410000] border border-primary/20">
                {orders.length} Total
              </span>
            </div>
            <p className="text-sm text-on-surface-variant font-medium mt-0.5">
              {orders.length} total catering orders across Mysuru &amp; Bengaluru heritage banquets
            </p>
          </div>

          {/* Export Kitchen Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrintSlips}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-on-surface bg-surface-container-lowest border border-outline-variant/60 hover:bg-surface-container-low transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">print</span>
              <span>Print Order Slips</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-primary bg-surface-container border border-outline-variant/60 hover:bg-surface-container-high transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">table_view</span>
              <span>Export Kitchen Sheet (CSV)</span>
            </button>
          </div>
        </div>

        {/* ========================================================
             3. FILTER & SEARCH PANEL
             ======================================================== */}
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/60 shadow-xs flex flex-col gap-4">
          
          {/* Search & Date Range Row */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Search Bar */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
                search
              </span>
              <input
                id="orderSearchInput"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search by customer name, order ID, or 10-digit mobile number..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface-container-lowest border border-outline-variant/70 rounded-xl placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-sans"
              />
            </div>

            {/* Quick Filters: Date Range Selector & Source Filter */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              
              {/* Date Range Selector */}
              <div className="relative">
                <select
                  id="dateRangeFilter"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value as DateFilter)
                    setCurrentPage(1)
                  }}
                  className="appearance-none pl-9 pr-8 py-2.5 text-xs font-medium bg-surface-container-lowest border border-outline-variant/70 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                >
                  <option value="all">All Dates</option>
                  <option value="this-month">This Month (Nov 2025)</option>
                  <option value="upcoming">Upcoming Muhurthams</option>
                  <option value="past">Past Events</option>
                </select>
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-outline pointer-events-none">
                  date_range
                </span>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-outline pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Source Filter Pill Toggle */}
              <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/50 text-xs">
                <button
                  type="button"
                  id="srcFilter-all"
                  onClick={() => {
                    setSourceFilter('all')
                    setCurrentPage(1)
                    showToastBanner('Filtered by source: all')
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sourceFilter === 'all'
                      ? 'bg-surface-container-lowest font-semibold text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  All Sources
                </button>
                <button
                  type="button"
                  id="srcFilter-online"
                  onClick={() => {
                    setSourceFilter('online')
                    setCurrentPage(1)
                    showToastBanner('Filtered by source: online')
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sourceFilter === 'online'
                      ? 'bg-surface-container-lowest font-semibold text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Online ({sourceCounts.online})
                </button>
                <button
                  type="button"
                  id="srcFilter-manual"
                  onClick={() => {
                    setSourceFilter('manual')
                    setCurrentPage(1)
                    showToastBanner('Filtered by source: manual')
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sourceFilter === 'manual'
                      ? 'bg-surface-container-lowest font-semibold text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Walk-in ({sourceCounts.manual})
                </button>
              </div>

            </div>
          </div>

          {/* Status Filter Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs whitespace-nowrap custom-scrollbar">
            <span className="text-outline font-medium text-[11px] uppercase tracking-wider pr-1">
              Status:
            </span>

            <button
              type="button"
              id="status-all"
              onClick={() => {
                setStatusFilter('all')
                setCurrentPage(1)
                showToastBanner('Showing all statuses')
              }}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-primary text-white shadow-xs ring-2 ring-primary font-bold'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
              }`}
            >
              All ({statusCounts.all})
            </button>

            {/* New Request: Gold style */}
            <button
              type="button"
              id="status-new"
              onClick={() => {
                setStatusFilter('new')
                setCurrentPage(1)
                showToastBanner('Applied filter for status: New Request')
              }}
              className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                statusFilter === 'new' ? 'ring-2 ring-primary font-bold' : ''
              }`}
              style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}
            >
              New Request ({statusCounts.new})
            </button>

            {/* Under Discussion: Turmeric style */}
            <button
              type="button"
              id="status-discussion"
              onClick={() => {
                setStatusFilter('discussion')
                setCurrentPage(1)
                showToastBanner('Applied filter for status: Under Discussion')
              }}
              className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                statusFilter === 'discussion' ? 'ring-2 ring-primary font-bold' : ''
              }`}
              style={{ backgroundColor: '#FEF9C3', color: '#854D0E', border: '1px solid #FEF08A' }}
            >
              Under Discussion ({statusCounts.discussion})
            </button>

            {/* Confirmed: Green style */}
            <button
              type="button"
              id="status-confirmed"
              onClick={() => {
                setStatusFilter('confirmed')
                setCurrentPage(1)
                showToastBanner('Applied filter for status: Confirmed')
              }}
              className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                statusFilter === 'confirmed' ? 'ring-2 ring-primary font-bold' : ''
              }`}
              style={{ backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' }}
            >
              Confirmed ({statusCounts.confirmed})
            </button>

            {/* Completed: Grey-Brown style */}
            <button
              type="button"
              id="status-completed"
              onClick={() => {
                setStatusFilter('completed')
                setCurrentPage(1)
                showToastBanner('Applied filter for status: Completed')
              }}
              className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                statusFilter === 'completed' ? 'ring-2 ring-primary font-bold' : ''
              }`}
              style={{ backgroundColor: '#E7E5E4', color: '#44403C', border: '1px solid #D6D3D1' }}
            >
              Completed ({statusCounts.completed})
            </button>

            {/* Cancelled: Chilli Red style */}
            <button
              type="button"
              id="status-cancelled"
              onClick={() => {
                setStatusFilter('cancelled')
                setCurrentPage(1)
                showToastBanner('Filtered: 1 Cancelled Catering Order')
              }}
              className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                statusFilter === 'cancelled' ? 'ring-2 ring-primary font-bold' : ''
              }`}
              style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' }}
            >
              Cancelled ({statusCounts.cancelled})
            </button>
          </div>

        </div>

        {/* ========================================================
             4. DYNAMIC VIEW CANVAS (Table / Cards / Skeleton / Empty)
             ======================================================== */}
        <div id="viewContainer" className="w-full">
          
          {/* (A) SKELETON LOADING VIEW */}
          {(viewMode === 'skeleton' || (isLoading && viewMode !== 'empty')) && (
            <div id="skeletonView" className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-outline-variant/60 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
                <div className="h-4 bg-outline-variant/50 rounded-full w-48 animate-pulse"></div>
                <div className="h-4 bg-outline-variant/50 rounded-full w-24 animate-pulse"></div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-12 bg-surface-container-low/70 rounded-xl animate-pulse flex items-center px-4 justify-between">
                    <div className="h-3.5 bg-outline-variant/60 rounded-full w-24"></div>
                    <div className="h-3.5 bg-outline-variant/60 rounded-full w-40"></div>
                    <div className="h-3.5 bg-outline-variant/60 rounded-full w-28"></div>
                    <div className="h-3.5 bg-outline-variant/60 rounded-full w-20"></div>
                    <div className="h-6 bg-outline-variant/60 rounded-full w-24"></div>
                  </div>
                ))}
              </div>
              <div className="pt-4 text-center text-xs text-outline font-medium">
                Fetching orders from Central Dispatch Hub...
              </div>
            </div>
          )}

          {/* (B) EMPTY STATE VIEW */}
          {(viewMode === 'empty' || (!isLoading && filteredOrders.length === 0 && viewMode !== 'skeleton')) && (
            <div id="emptyView" className="bg-white/90 backdrop-blur-md rounded-2xl p-12 text-center border border-outline-variant/60 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary mb-1">
                <span className="material-symbols-outlined text-[36px]">filter_alt_off</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-on-surface">
                No orders match the selected filters
              </h3>
              <p className="text-sm text-on-surface-variant max-w-md">
                We couldn't find any catering orders fitting your current query or Muhurtham timeframe. Clear your filters to view all records.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-primary bg-surface-container border border-outline-variant/60 hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Clear all filters &amp; restore {orders.length} orders
              </button>
            </div>
          )}

          {/* (C) DEFAULT DESKTOP TABLE VIEW */}
          {viewMode === 'table' && !isLoading && filteredOrders.length > 0 && (
            <div id="tableView" className="bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden border border-outline-variant/60 shadow-xs">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/70 border-b border-outline-variant/50 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Customer Name</th>
                      <th className="py-3.5 px-4">Mobile</th>
                      <th className="py-3.5 px-4">Occasion</th>
                      <th className="py-3.5 px-4">Event Date</th>
                      <th className="py-3.5 px-4">Plates &amp; Value</th>
                      <th className="py-3.5 px-4">Source</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody id="ordersTableBody" className="divide-y divide-outline-variant/30 text-sm font-sans bg-surface-container-lowest/60">
                    {paginatedOrders.map((order) => {
                      const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES['New Request']
                      const occasionDot = getOccasionDotColor(order.eventType)

                      return (
                        <tr
                          key={order.id}
                          onClick={() => setInspectOrder(order)}
                          className="hover:bg-surface-container-low/80 cursor-pointer transition-colors group"
                        >
                          {/* Order ID Link */}
                          <td className="py-4 px-4 font-mono font-bold text-xs text-primary group-hover:underline">
                            <Link
                              to={`/admin/orders/${order.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-primary hover:underline"
                            >
                              #{order.id}
                            </Link>
                          </td>

                          {/* Customer Name + Kannada/Location Subtext */}
                          <td className="py-4 px-4">
                            <div className="font-semibold text-on-surface">{order.customerName}</div>
                            <div className="text-[11px] text-on-surface-variant">
                              {getKannadaSubtext(order)}
                            </div>
                          </td>

                          {/* Mobile */}
                          <td className="py-4 px-4 text-xs font-mono text-on-surface-variant">
                            {formatPhone(order.customerPhone)}
                          </td>

                          {/* Occasion */}
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface">
                              <span className={`w-1.5 h-1.5 rounded-full ${occasionDot}`}></span>
                              {order.eventType}
                            </span>
                          </td>

                          {/* Event Date */}
                          <td className="py-4 px-4">
                            <div className="text-xs font-semibold text-on-surface">
                              {formatDisplayDate(order.eventDate)}
                            </div>
                            <div className="text-[11px] text-secondary">
                              {getAuspiciousTithi(order.eventDate)}
                            </div>
                          </td>

                          {/* Plates & Value */}
                          <td className="py-4 px-4">
                            <div className="text-xs font-bold text-on-surface">
                              {order.guestCount} plates
                            </div>
                            <div className="text-xs font-price-md text-primary font-bold">
                              ₹{order.totalAmount.toLocaleString('en-IN')}
                            </div>
                          </td>

                          {/* Source */}
                          <td className="py-4 px-4">
                            {order.source === 'Online' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                <span className="material-symbols-outlined text-[13px]">language</span>
                                Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                <span className="material-symbols-outlined text-[13px]">phone_in_talk</span>
                                Manual
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.text,
                                border: `1px solid ${statusStyle.border}`
                              }}
                            >
                              {order.status}
                            </span>
                          </td>

                          {/* Quick Action */}
                          <td className="py-4 px-4 text-right">
                            <Link
                              to={`/admin/orders/${order.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs font-semibold text-primary hover:text-primary-container group-hover:translate-x-0.5 transition-transform inline-flex items-center justify-end gap-1 ml-auto"
                            >
                              <span>View</span>
                              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* (D) STACKED CARDS VIEW (Tactile Mobile & Tablet Grid) */}
          {viewMode === 'cards' && !isLoading && filteredOrders.length > 0 && (
            <div id="cardsView" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedOrders.map((order) => {
                const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES['New Request']

                return (
                  <div
                    key={order.id}
                    onClick={() => setInspectOrder(order)}
                    className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/60 shadow-xs cursor-pointer hover:border-primary/50 transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-outline-variant/40">
                        <div>
                          <Link
                            to={`/admin/orders/${order.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-mono font-bold text-xs text-primary hover:underline"
                          >
                            #{order.id}
                          </Link>
                          <h3 className="font-bold text-base text-on-surface mt-0.5">
                            {order.customerName}
                          </h3>
                          <p className="text-xs text-on-surface-variant">
                            {getKannadaSubtext(order)}
                          </p>
                        </div>
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                            border: `1px solid ${statusStyle.border}`
                          }}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* 2x2 Info Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs py-3">
                        <div>
                          <span className="text-outline text-[11px] block">Occasion:</span>
                          <p className="font-medium text-on-surface">{order.eventType}</p>
                        </div>
                        <div>
                          <span className="text-outline text-[11px] block">Event Date:</span>
                          <p className="font-medium text-on-surface">{formatDisplayDate(order.eventDate)}</p>
                        </div>
                        <div>
                          <span className="text-outline text-[11px] block">Catering Scale:</span>
                          <p className="font-bold text-on-surface">
                            {order.guestCount} plates (₹{order.totalAmount.toLocaleString('en-IN')})
                          </p>
                        </div>
                        <div>
                          <span className="text-outline text-[11px] block">Source:</span>
                          <p className={`font-medium ${order.source === 'Online' ? 'text-blue-700' : 'text-amber-800'}`}>
                            {order.source === 'Online' ? 'Online Feast Order' : 'Walk-in / Phone Order'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-xs">
                      <a
                        href={getCleanTel(order.customerPhone)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-secondary font-semibold hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">call</span>
                        <span>{formatPhone(order.customerPhone)}</span>
                      </a>
                      <Link
                        to={`/admin/orders/${order.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary font-bold flex items-center gap-0.5 hover:underline"
                      >
                        <span>Inspect Order</span>
                        <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>

        {/* ========================================================
             5. PAGINATION BAR
             ======================================================== */}
        {!isLoading && filteredOrders.length > 0 && (
          <div className="bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-outline-variant/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-on-surface-variant font-medium">
              Showing <span className="font-bold text-on-surface">{startIndex}–{endIndex}</span> of{' '}
              <span className="font-bold text-on-surface">{filteredOrders.length}</span> catering orders
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-outline-variant/50 text-outline hover:text-primary hover:bg-surface-container-low transition-colors disabled:opacity-40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                    currentPage === p
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-outline-variant/50 text-on-surface hover:text-primary hover:bg-surface-container-low transition-colors disabled:opacity-40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================
           6. ORDER DETAIL INSPECTION SLIDE-OVER DRAWER
           ======================================================== */}
      {inspectOrder && (
        <div
          id="orderSlideOver"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-hidden"
        >
          {/* Backdrop */}
          <div
            onClick={() => setInspectOrder(null)}
            className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
          ></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-surface/95 backdrop-blur-md border-l border-outline-variant/70 shadow-2xl flex flex-col justify-between overflow-hidden">
              
              {/* Header */}
              <div className="p-5 border-b border-outline-variant/50 flex items-start justify-between bg-surface-container-low/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span id="detailOrderId" className="font-mono font-bold text-primary text-sm">
                      #{inspectOrder.id}
                    </span>
                    <span
                      id="detailStatusBadge"
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: (STATUS_STYLES[inspectOrder.status] || STATUS_STYLES['New Request']).bg,
                        color: (STATUS_STYLES[inspectOrder.status] || STATUS_STYLES['New Request']).text,
                        border: `1px solid ${(STATUS_STYLES[inspectOrder.status] || STATUS_STYLES['New Request']).border}`
                      }}
                    >
                      {inspectOrder.status}
                    </span>
                  </div>
                  <h2 id="detailCustomerName" className="font-serif text-xl sm:text-2xl font-bold text-on-surface mt-1">
                    {inspectOrder.customerName}
                  </h2>
                  <p id="detailKannadaLoc" className="text-xs text-on-surface-variant">
                    {getKannadaSubtext(inspectOrder)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectOrder(null)}
                  className="p-2 rounded-xl text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                
                {/* Event Details Card */}
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-outline">
                    Muhurtham &amp; Venue Spec
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-outline">Occasion:</span>
                      <p id="detailOccasion" className="font-bold text-on-surface text-sm">
                        {inspectOrder.eventType}
                      </p>
                    </div>
                    <div>
                      <span className="text-outline">Date &amp; Muhurtham Time:</span>
                      <p id="detailDate" className="font-bold text-on-surface text-sm">
                        {formatDisplayDate(inspectOrder.eventDate)} • 07:30 AM
                      </p>
                    </div>
                    <div>
                      <span className="text-outline">Guest Scale:</span>
                      <p id="detailPlates" className="font-bold text-on-surface text-sm">
                        {inspectOrder.guestCount} Traditional Banana-Leaf Thalis
                      </p>
                    </div>
                    <div>
                      <span className="text-outline">Total Package Billing:</span>
                      <p id="detailAmount" className="font-price-md text-primary font-bold text-base">
                        ₹{inspectOrder.totalAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/30 text-xs">
                    <span className="text-outline">Delivery &amp; Serving Hall Address:</span>
                    <p className="font-medium text-on-surface mt-0.5">
                      {inspectOrder.venueAddress || 'Sri Raghavendra Kalyana Mantapa, Jayalakshmipuram, Mysuru - 570012'}
                    </p>
                  </div>
                </div>

                {/* Curated Sattvic Feast Menu Items */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-outline">
                      Curated Menu Selections
                    </h3>
                    <span className="text-[11px] text-tertiary-container font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      100% Sattvic Pure Vegetarian
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/50 space-y-2.5 text-xs">
                    {inspectOrder.items && inspectOrder.items.length > 0 ? (
                      inspectOrder.items.map((item, idx) => (
                        <div key={item.id || idx} className="flex items-center justify-between pb-2 border-b border-outline-variant/30 last:border-b-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border border-emerald-600 flex items-center justify-center rounded-xs">
                              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                            </span>
                            <span className="font-semibold text-on-surface">{item.name}</span>
                          </div>
                          <span className="text-outline font-medium">Included</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border border-emerald-600 flex items-center justify-center rounded-xs">
                              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                            </span>
                            <span className="font-semibold text-on-surface">Mysuru Traditional Puliyogare (ತಂಬುಳ ಸಹಿತ)</span>
                          </div>
                          <span className="text-outline font-medium">Included</span>
                        </div>
                        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border border-emerald-600 flex items-center justify-center rounded-xs">
                              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                            </span>
                            <span className="font-semibold text-on-surface">Bisi Bele Bath with Pure Ghee &amp; Boondi</span>
                          </div>
                          <span className="text-outline font-medium">Included</span>
                        </div>
                        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border border-emerald-600 flex items-center justify-center rounded-xs">
                              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                            </span>
                            <span className="font-semibold text-on-surface">Melkote Kalyani Huli (Aromatic Sambar)</span>
                          </div>
                          <span className="text-outline font-medium">Included</span>
                        </div>
                        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border border-emerald-600 flex items-center justify-center rounded-xs">
                              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                            </span>
                            <span className="font-semibold text-on-surface">Royal Mysuru Pak (Melt-in-mouth Clarified Butter)</span>
                          </div>
                          <span className="text-outline font-medium">Special Sweet</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border border-emerald-600 flex items-center justify-center rounded-xs">
                              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                            </span>
                            <span className="font-semibold text-on-surface">Chikmagalur Degree Filter Coffee (Hot Live Counter)</span>
                          </div>
                          <span className="text-outline font-medium">Beverage</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Advance Payment & Dispatch Status */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50">
                    <span className="text-outline">Advance Payment:</span>
                    <p className="font-bold text-on-surface mt-0.5">
                      ₹{Math.round(inspectOrder.totalAmount * 0.35).toLocaleString('en-IN')} Paid via UPI
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Balance ₹{(inspectOrder.totalAmount - Math.round(inspectOrder.totalAmount * 0.35)).toLocaleString('en-IN')} due on event
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50">
                    <span className="text-outline">Dispatch Schedule:</span>
                    <p className="font-bold text-on-surface mt-0.5">05:45 AM Vans Depart</p>
                    <p className="text-[11px] text-secondary font-medium">Head Chef: Raghu Bhat</p>
                  </div>
                </div>

                {/* Status Changer Controller */}
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 flex flex-col gap-2">
                  <label htmlFor="drawerStatusSelect" className="text-xs font-bold text-on-surface">
                    Update Order Status:
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      id="drawerStatusSelect"
                      value={drawerStatus}
                      onChange={(e) => setDrawerStatus(e.target.value as OrderStatus)}
                      className="flex-1 py-2 px-3 text-xs bg-surface-container-low border border-outline-variant/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                    >
                      <option value="New Request">New Request (Awaiting Call)</option>
                      <option value="Under Discussion">Under Discussion (Menu Tuning)</option>
                      <option value="Confirmed">Confirmed (Advance Received)</option>
                      <option value="Completed">Completed (Feast Concluded)</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleSaveStatusChange}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-container transition-colors shadow-xs cursor-pointer active:scale-95"
                    >
                      Save
                    </button>
                  </div>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-outline-variant/50 bg-surface-container-lowest flex items-center justify-between gap-3">
                <a
                  id="drawerCallBtn"
                  href={getCleanTel(inspectOrder.customerPhone)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">call</span>
                  <span>Call Customer</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintSlips}
                    className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium text-outline hover:text-primary transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    <span>Slip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectOrder(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-container transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================
           7. CREATE MANUAL ORDER MODAL
           ======================================================== */}
      {isManualModalOpen && (
        <div
          id="manualOrderModal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-hidden"
        >
          <div
            onClick={() => setIsManualModalOpen(false)}
            className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
          ></div>

          <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-surface/95 backdrop-blur-md rounded-2xl border border-outline-variant/70 shadow-2xl p-6 space-y-4">
              
              <div className="flex items-start justify-between pb-3 border-b border-outline-variant/50">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary">
                    + Create Manual Catering Order
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Walk-in patron or direct telephone reservation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="p-1 rounded-lg text-outline hover:text-primary cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleManualOrderSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Customer Name (ಶ್ರೀ/ಶ್ರೀಮತಿ)
                    </label>
                    <input
                      type="text"
                      required
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="e.g. Nagaraj Shastry"
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/70 rounded-xl focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      10-Digit Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="+91 9845X XXXXX"
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/70 rounded-xl focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Occasion / Shubhkaarya
                    </label>
                    <select
                      value={manualOccasion}
                      onChange={(e) => setManualOccasion(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/70 rounded-xl focus:ring-2 focus:ring-primary/40 focus:outline-none cursor-pointer"
                    >
                      <option>Griha Pravesh</option>
                      <option>Wedding Muhurtham</option>
                      <option>Upanayana (Munji)</option>
                      <option>Satyanarayana Pooja</option>
                      <option>Sashti Poorthi</option>
                      <option>Namakarana</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Event Date (Muhurtham)
                    </label>
                    <input
                      type="date"
                      required
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/70 rounded-xl focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Estimated Plates
                    </label>
                    <input
                      type="number"
                      required
                      value={manualPlates}
                      onChange={(e) => setManualPlates(Number(e.target.value))}
                      placeholder="e.g. 150"
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/70 rounded-xl focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Estimated Budget / Amount (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={manualAmount}
                      onChange={(e) => setManualAmount(Number(e.target.value))}
                      placeholder="e.g. 45000"
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/70 rounded-xl focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Delivery Hall / Kalyana Mantapa Address
                  </label>
                  <textarea
                    rows={2}
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="e.g. Shankara Mutt Hall, Madhavachar Road, Mysuru"
                    className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/70 rounded-xl focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  ></textarea>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-outline-variant/40">
                  <button
                    type="button"
                    onClick={() => setIsManualModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-white font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
                    style={{ background: 'linear-gradient(90deg, #8B0A00 0%, #b30a05 100%)' }}
                  >
                    Confirm &amp; Book Order
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================
           8. TOAST NOTIFICATION
           ======================================================== */}
      <div
        id="toastNotification"
        className={`fixed bottom-5 right-5 z-50 transform transition-all duration-300 pointer-events-none ${
          toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <div className="bg-surface-container-lowest/95 backdrop-blur-md border border-outline-variant/80 rounded-xl px-4 py-3 shadow-lg flex items-center gap-2.5 text-xs font-semibold text-on-surface">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">
            check_circle
          </span>
          <span id="toastMessage">{toastMessage || 'Kitchen Sheet CSV generated successfully!'}</span>
        </div>
      </div>

    </AdminAppShell>
  )
}
export default AdminOrdersPage
