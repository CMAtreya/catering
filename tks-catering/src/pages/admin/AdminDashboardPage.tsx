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
  X,
  Zap,
  Layers
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

  // Tab state to separate New Requests and Active Orders below the calendar: 'new' | 'active'
  const [activeQueueTab, setActiveQueueTab] = useState<'new' | 'active'>('new')

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
        {/* 3. CATERING SCHEDULE CALENDAR (Full-Width Flagship Card)  */}
        {/* ======================================================== */}
        <div className="w-full min-w-0">
          {isLoading ? (
            <CalendarSkeleton />
          ) : (
            <CalendarCard orders={orders} />
          )}
        </div>

        {/* ======================================================== */}
        {/* 4 & 5. ORDER QUEUES SECTION: PLACED DIRECTLY BELOW CALENDAR*/}
        {/* Separated New Requests & Active Orders with Scroll        */}
        {/* ======================================================== */}
        <div className="w-full min-w-0">
          <div className="content-card bg-white border border-slate-200/80 rounded-[24px] shadow-sm overflow-hidden flex flex-col h-[520px]">
            
            {/* Header: Title, Segmented Tabs & CRM Link */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-white">
              
              {/* Title & Icon */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-sm sm:text-base text-[var(--brand-900)] leading-tight">
                    Order Queues & Enquiries
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] font-medium">
                    Live customer bookings & confirmed banquets
                  </p>
                </div>
              </div>

              {/* Segmented Tabs & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
                <div 
                  role="tablist" 
                  aria-label="Order queues navigation"
                  className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/60"
                >
                  {/* Tab 1: New Requests */}
                  <button
                    type="button"
                    role="tab"
                    id="tab-new-requests"
                    aria-selected={activeQueueTab === 'new'}
                    aria-controls="panel-new-requests"
                    onClick={() => setActiveQueueTab('new')}
                    className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeQueueTab === 'new'
                        ? 'bg-white text-[var(--brand-900)] shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${activeQueueTab === 'new' ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                    <span>New Requests</span>
                    {newRequestsCount > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        activeQueueTab === 'new'
                          ? 'bg-red-500 text-white'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {newRequestsCount}
                      </span>
                    )}
                  </button>

                  {/* Tab 2: Active Orders */}
                  <button
                    type="button"
                    role="tab"
                    id="tab-active-orders"
                    aria-selected={activeQueueTab === 'active'}
                    aria-controls="panel-active-orders"
                    onClick={() => setActiveQueueTab('active')}
                    className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeQueueTab === 'active'
                        ? 'bg-white text-[var(--brand-900)] shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${activeQueueTab === 'active' ? 'text-[var(--brand)]' : 'text-slate-400'}`} />
                    <span>Active Orders</span>
                    {activeOrdersCount > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        activeQueueTab === 'active'
                          ? 'bg-[var(--brand)] text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {activeOrdersCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* View all link */}
                <Link
                  to={
                    activeQueueTab === 'new'
                      ? '/admin/orders?status=new'
                      : '/admin/orders?tab=active'
                  }
                  className="text-xs font-bold text-[var(--brand)] hover:underline flex items-center gap-0.5 shrink-0 tap-target-48 sm:tap-target-auto"
                >
                  <span>View all</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

            {/* Scrollable Body: Smooth internal scroll inside bounded card */}
            <div 
              id={
                activeQueueTab === 'new' 
                  ? 'panel-new-requests' 
                  : 'panel-active-orders'
              }
              role="tabpanel"
              tabIndex={0}
              className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 custom-scrollbar focus:outline-none"
            >
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <Shimmer className="h-32 rounded-[20px]" />
                  <Shimmer className="h-32 rounded-[20px]" />
                  <Shimmer className="h-32 rounded-[20px]" />
                  <Shimmer className="h-32 rounded-[20px]" />
                </div>
              ) : activeQueueTab === 'new' ? (
                /* TAB 1: NEW REQUESTS FOCUSED FULL-WIDTH VIEW */
                newRequests.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {newRequests.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        showTimeReceived={true}
                        onConfirm={handleConfirmOrder}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Inbox className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <h4 className="font-heading font-black text-sm text-[var(--brand-900)]">
                      No pending online enquiries
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                      All incoming customer catering requests have been reviewed and processed.
                    </p>
                    {activeOrdersCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveQueueTab('active')}
                        className="mt-2 text-xs font-bold text-[var(--brand)] hover:underline cursor-pointer"
                      >
                        View {activeOrdersCount} Active Banquets →
                      </button>
                    )}
                  </div>
                )
              ) : (
                /* TAB 2: ACTIVE ORDERS FOCUSED FULL-WIDTH VIEW */
                activeOrders.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {activeOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        showTimeReceived={false}
                        onConfirm={handleConfirmOrder}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <h4 className="font-heading font-bold text-sm text-[var(--brand-900)]">
                      No active orders
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                      There are currently no orders under discussion or confirmed in the system.
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Card Footer: Summary & CRM Link */}
            <div className="px-4 py-3 bg-slate-50/90 border-t border-slate-100 shrink-0 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[var(--brand-900)]">
                  {newRequestsCount} New Enquiries
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-bold text-[var(--brand-900)]">
                  {activeOrdersCount} Active Banquets
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">Smooth Scrollable Feed</span>
              </div>

              <Link
                to="/admin/orders"
                className="font-bold text-[var(--brand)] hover:underline flex items-center gap-0.5 text-xs tap-target-48 sm:tap-target-auto"
              >
                <span>Orders CRM</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </AdminAppShell>
  )
}

export default AdminDashboardPage
