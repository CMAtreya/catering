import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Plus, 
  ChevronRight, 
  ClipboardList, 
  Sparkles, 
  Inbox, 
  CheckCircle2,
  Download,
  X
} from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { IOSInstallSheet } from '@/components/pwa/IOSInstallSheet'
import { getOrders, confirmOrder, subscribeToOrders } from '@/api'
import type { Order } from '@/data/mockData'
import { AdminAppShell } from '@/components/admin/AdminAppShell'
import { OrderCard } from '@/components/admin/OrderCard'
import { CalendarCard } from '@/components/admin/CalendarCard'
import { CalendarSkeleton } from '@/components/admin/AdminSkeletons'
import { Shimmer } from '@/components/ui/skeletons'
import { Odometer } from '@/components/motion/Odometer'


export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // PWA Install Prompt for Admin Shell
  const {
    canInstall,
    showIOSSheet,
    setShowIOSSheet,
    promptToInstall,
    dismissPrompt
  } = useInstallPrompt({
    storageKey: 'tks_admin_install_dismissed',
    expiryDays: 14
  })

  // Fetch orders from API with real-time subscription
  useEffect(() => {
    let isMounted = true
    const loadData = async (showLoading = false) => {
      try {
        if (showLoading) setIsLoading(true)
        const data = await getOrders()
        if (isMounted) {
          setOrders(data)
        }
      } catch (err) {
        console.error('Failed to load admin orders:', err)
      } finally {
        if (showLoading && isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData(true)

    // Real-time listener for updates across tabs and actions
    const unsubscribe = subscribeToOrders((latestOrders) => {
      if (isMounted) {
        setOrders(latestOrders)
      }
    })

    // Auto-refresh on window focus and background polling
    const handleFocus = () => loadData(false)
    window.addEventListener('focus', handleFocus)
    const pollTimer = setInterval(() => loadData(false), 5000)

    return () => {
      isMounted = false
      unsubscribe()
      window.removeEventListener('focus', handleFocus)
      clearInterval(pollTimer)
    }
  }, [])

  // Format today's date for greeting (e.g. "Friday, 23 October 2026")
  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date())

  // 1. New Requests: online enquiries awaiting review (newest first)
  const newRequests = orders
    .filter((o) => o.source === 'Online' && o.status === 'New Request')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // 2. Active Orders per spec assumption: status 'Under Discussion' or 'Confirmed'
  const activeOrders = orders
    .filter((o) => o.status === 'Under Discussion' || o.status === 'Confirmed')
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())

  const newRequestsCount = newRequests.length
  const activeOrdersCount = activeOrders.length

  const handleConfirmOrder = async (orderId: string) => {
    try {
      const updated = await confirmOrder(orderId)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
    } catch (err) {
      console.error('Failed to confirm order:', err)
    }
  }

  return (
    <AdminAppShell title="Dashboard" subtitle="Live Catering Operations & Enquiry Feed">
      <div className="space-y-6 sm:space-y-8">
        
        {/* ======================================================== */}
        {/* 1. GREETING & TODAY'S DATE                               */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200/70">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-[var(--brand-900)] tracking-tight">
                Hello, TKS Iyengars
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--brand-soft)] text-[var(--brand-900)] border border-[var(--brand-200)]">
                <Sparkles className="w-3 h-3 text-[var(--brand)]" />
                <span>Live Workspace</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium pt-1">
              {todayFormatted}
            </p>
          </div>
        </div>

        {/* PWA Dismissible Glass Banner for Admin */}
        {canInstall && (
          <div className="glass p-3.5 sm:p-4 rounded-2xl border border-[var(--brand-200)] flex items-center justify-between gap-3 shadow-xs bg-white/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand)] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Download className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-black text-xs sm:text-sm text-[var(--brand-900)] leading-tight">
                  Install the admin app for faster access
                </p>
                <p className="text-[11px] text-[var(--text-muted)] truncate pt-0.5">
                  Instant 1-tap home screen access to banquet calendar, live orders and CRM.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={promptToInstall}
                className="h-9 px-4 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white font-bold text-xs shadow-xs active:scale-95 transition-all tap-target-48 sm:tap-target-auto cursor-pointer"
              >
                Install
              </button>
              <button
                type="button"
                onClick={dismissPrompt}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Dismiss admin install prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* iOS Safari Instruction Bottom Sheet for Admin */}
        <IOSInstallSheet
          open={showIOSSheet}
          onOpenChange={setShowIOSSheet}
          appName="TKS Admin"
        />

        {/* ======================================================== */}
        {/* 2. TWO LARGE TAPPABLE COUNT TILES & ACTION TILES         */}
        {/* ======================================================== */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Shimmer className="h-28 rounded-[22px]" />
            <Shimmer className="h-28 rounded-[22px]" />
            <Shimmer className="h-28 rounded-[22px]" />
            <Shimmer className="h-28 rounded-[22px]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Tile 1: 'New Requests' (count with odometer, red dot when above 0) */}
            <button
              type="button"
              onClick={() => navigate('/admin/orders?status=new')}
              className="group content-card bg-white border border-slate-200/80 hover:border-[var(--brand-300)] rounded-[22px] p-4 sm:p-5 text-left shadow-xs hover:shadow-md transition-all tap-target-48 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-[var(--text-muted)]">
                    New Requests
                  </span>
                  {/* Red dot when above 0 per spec */}
                  {newRequestsCount > 0 && (
                    <span 
                      title={`${newRequestsCount} new requests awaiting review`}
                      className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0" 
                    />
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[var(--brand)] group-hover:translate-x-0.5 transition-all" />
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading font-black text-3xl sm:text-4xl text-[var(--brand-900)]">
                  <Odometer value={newRequestsCount} />
                </span>
                <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                  awaiting review
                </span>
              </div>
            </button>

            {/* Tile 2: 'Active Orders' (count with odometer) */}
            <button
              type="button"
              onClick={() => navigate('/admin/orders?tab=active')}
              className="group content-card bg-white border border-slate-200/80 hover:border-[var(--brand-300)] rounded-[22px] p-4 sm:p-5 text-left shadow-xs hover:shadow-md transition-all tap-target-48 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-[var(--text-muted)]">
                  Active Orders
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[var(--brand)] group-hover:translate-x-0.5 transition-all" />
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading font-black text-3xl sm:text-4xl text-[var(--brand-900)]">
                  <Odometer value={activeOrdersCount} />
                </span>
                <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                  confirmed & active
                </span>
              </div>
            </button>


            {/* Tile 3: Wide Brand-Filled Action Tile: 'Create Manual Order' */}
            <Link
              to="/admin/orders/new"
              className="bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[var(--on-brand)] rounded-[22px] p-4 sm:p-5 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all tap-target-48 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 stroke-[3] text-white" />
                </div>
                <div className="text-left">
                  <span className="font-heading font-bold text-sm block leading-tight">
                    Create Manual Order
                  </span>
                  <span className="text-[11px] text-white/80 font-medium">
                    Phone / walk-in booking
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>

            {/* Tile 4: Quieter Tile: 'All Orders' */}
            <Link
              to="/admin/orders"
              className="bg-white hover:bg-slate-50 border border-slate-200/80 rounded-[22px] p-4 sm:p-5 flex items-center justify-between shadow-xs transition-all tap-target-48 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="font-heading font-bold text-sm text-[var(--text-primary)] block leading-tight">
                    All Orders
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] font-medium">
                    Filter history & banquets
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>

          </div>
        )}

        {/* ======================================================== */}
        {/* 3, 4 & 5. DASHBOARD LAYOUT: TWO COLUMNS FROM 1024px       */}
        {/* Left (7 cols): Calendar Card + Selected Date Panel       */}
        {/* Right (5 cols): New Requests & Active Orders             */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Column 1 (Left, 7 cols on 1024px+): Calendar Card */}
          <div className="col-span-12 lg:col-span-7 min-w-0">
            {isLoading ? (
              <CalendarSkeleton />
            ) : (
              <CalendarCard orders={orders} />
            )}
          </div>

          {/* Column 2 (Right, 5 cols on 1024px+): New Requests & Active Orders */}
          <div className="col-span-12 lg:col-span-5 space-y-6 sm:space-y-8 min-w-0">
            
            {/* 4. NEW REQUESTS BLOCK */}
            <section className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-base sm:text-lg text-[var(--brand-900)]">
                    New Requests
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                    {newRequestsCount}
                  </span>
                </div>

                <Link
                  to="/admin/orders?status=new"
                  className="text-xs font-bold text-[var(--brand)] hover:underline flex items-center gap-0.5 tap-target-48 sm:tap-target-auto"
                >
                  <span>View all</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  <Shimmer className="h-32 rounded-[20px]" />
                  <Shimmer className="h-32 rounded-[20px]" />
                </div>
              ) : newRequests.length > 0 ? (
                <div className="space-y-3">
                  {newRequests.slice(0, 4).map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      showTimeReceived={true}
                      onConfirm={handleConfirmOrder}
                    />
                  ))}
                </div>
              ) : (
                /* Empty state for New Requests */
                <div className="content-card bg-white border border-slate-200/80 rounded-[20px] p-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <Inbox className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-[var(--brand-900)]">
                    No pending online enquiries
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                    All incoming customer catering requests have been reviewed and processed.
                  </p>
                </div>
              )}
            </section>

            {/* 5. ACTIVE ORDERS BLOCK (Under Discussion or Confirmed) */}
            <section className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-base sm:text-lg text-[var(--brand-900)]">
                    Active Orders
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--brand-soft)] text-[var(--brand-900)] border border-[var(--brand-200)]">
                    {activeOrdersCount}
                  </span>
                </div>

                <Link
                  to="/admin/orders?tab=active"
                  className="text-xs font-bold text-[var(--brand)] hover:underline flex items-center gap-0.5 tap-target-48 sm:tap-target-auto"
                >
                  <span>View all</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  <Shimmer className="h-32 rounded-[20px]" />
                  <Shimmer className="h-32 rounded-[20px]" />
                  <Shimmer className="h-32 rounded-[20px]" />
                </div>
              ) : activeOrders.length > 0 ? (
                <div className="space-y-3">
                  {activeOrders.slice(0, 4).map((order) => (
                    <OrderCard key={order.id} order={order} showTimeReceived={false} />
                  ))}
                </div>
              ) : (
                /* Empty state for Active Orders */
                <div className="content-card bg-white border border-slate-200/80 rounded-[20px] p-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-[var(--brand-900)]">
                    No active orders
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                    There are currently no orders under discussion or confirmed in the system.
                  </p>
                </div>
              )}
            </section>

          </div>

        </div>

      </div>
    </AdminAppShell>
  )
}

export default AdminDashboardPage
