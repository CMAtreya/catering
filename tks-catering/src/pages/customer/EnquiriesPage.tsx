import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast, Toaster } from 'sonner'
import { format, parseISO, isValid } from 'date-fns'
import { motion } from 'motion/react'

import { useEnquiryStore, type LocalEnquiryRecord } from '@/store/enquiryStore'
import { useDraftStore } from '@/store/draftStore'
import { formatRupees, formatEventDate } from '@/lib/format'
import { CustomerDesktopShell } from '@/components/customer/CustomerDesktopShell'
import { PageTransition } from '@/components/motion/PageTransition'
import { useMotionTier } from '@/motion/MotionProvider'
import { getItemEntranceVariants } from '@/motion/tokens'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export const EnquiriesPage: React.FC = () => {
  const navigate = useNavigate()
  const { tier, isReduced } = useMotionTier()

  // Enquiry store
  const enquiries = useEnquiryStore((state) => state.enquiries)
  const clearHistory = useEnquiryStore((state) => state.clearHistory)

  // Draft store integration for reordering
  const setRequirements = useDraftStore((state) => state.setRequirements)
  const draftItemCount = useDraftStore((state) => Object.keys(state.items).length)

  // View mode switcher: 'active' or 'empty'
  const [activeTab, setActiveTab] = useState<'active' | 'empty'>('active')

  // Search input state
  const [searchQuery, setSearchQuery] = useState('')

  // Selected enquiry for details sheet/drawer
  const [selectedEnquiry, setSelectedEnquiry] = useState<LocalEnquiryRecord | null>(null)

  // Clear history dialog state
  const [isClearDialogOpen, setIsClearDialogOpen] = useState<boolean>(false)

  // Responsive desktop detection
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  })

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Sort enquiries newest first & apply search filtering
  const sortedEnquiries = useMemo(() => {
    const list = [...enquiries].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0
      const timeB = new Date(b.createdAt).getTime() || 0
      return timeB - timeA
    })

    if (!searchQuery.trim()) return list

    const q = searchQuery.toLowerCase().trim()
    return list.filter((e) => {
      return (
        e.eventType.toLowerCase().includes(q) ||
        e.orderId.toLowerCase().includes(q) ||
        (e.customerName && e.customerName.toLowerCase().includes(q)) ||
        (e.itemsSummary && e.itemsSummary.toLowerCase().includes(q))
      )
    })
  }, [enquiries, searchQuery])

  // Format submission date nicely (e.g. 'Today, 11:42 AM' or '18 Nov 2025, 08:35 PM')
  const formatSubmittedAt = (isoString: string): string => {
    try {
      const d = parseISO(isoString)
      if (isValid(d)) {
        return format(d, 'dd MMM yyyy, hh:mm a')
      }
      return isoString
    } catch {
      return isoString
    }
  }

  // Handle confirm clear history
  const handleConfirmClear = () => {
    clearHistory()
    setIsClearDialogOpen(false)
    setActiveTab('active')
    toast.success('Enquiry history cleared from this device')
  }

  // Handle re-ordering / duplicating an enquiry into draft
  const handleReorder = (enquiry: LocalEnquiryRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()

    setRequirements({
      guestCount: enquiry.guestCount || 100,
      eventDate: enquiry.eventDate || '',
      eventTime: enquiry.eventTime || 'Morning',
      eventType: enquiry.eventType || 'Traditional Feast',
      venueAddress: enquiry.venueAddress || '',
      notes: enquiry.notes || '',
    })

    toast.success(`Duplicate feast for "${enquiry.eventType}" loaded into your plan!`)
    navigate('/request')
  }

  // Download banquet brochure mock action
  const handleDownloadBrochure = () => {
    toast.info('Downloading TKS Iyengar Authentic Banquet Brochure (PDF)...')
    setTimeout(() => {
      toast.success('Brochure downloaded successfully')
    }, 1200)
  }

  return (
    <CustomerDesktopShell maxWidth="w-full">
      <Toaster position="bottom-center" richColors />
      <div className="w-full flex flex-col bg-surface text-on-surface min-h-screen relative font-sans">

        {/* ==========================================================
            1. TOP NAVBAR (Shared Authentic Mysuru Heritage Header)
            ========================================================== */}
        <header className="bg-surface/85 backdrop-blur-md border-b border-outline-variant/60 shadow-xs sticky top-0 z-40 w-full">
          <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-8 max-w-7xl mx-auto h-20">
            
            {/* Brand Logo & Identity */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-3.5 text-left group cursor-pointer"
            >
              <img
                alt="TKS Iyengar's Authentic Logo"
                className="h-12 sm:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105 rounded-md"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6occrKYgf2RCe6-ZpsHHNSwBTZw3OIJCIu6JOOkQR-MmVOIiKZ7bUBYzMU1l09v4a7bX1aa5bfz0MQN5Gh1wPHBVRO7LGbM1E9Bko7oNR5cwbenpCKvUqkdjPSjrtKo9Dv1OlVn0VLfzhNsNmnyXZsER8N1zZKYj1hy1Z5QQB-5nt5D6OCeHk91zan3n3flKIP17cg5vuWoRorqja0dU2rPYG_7kXSD98DR2K5GVG8F_91Jgo9rr6"
              />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg sm:text-xl text-primary tracking-wide leading-tight">
                  TKS Iyengar's Catering
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-on-surface-variant flex items-center gap-1.5 pt-0.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-tertiary-container animate-pulse" />
                  Mysuru Pure Vegetarian Sattvic Heritage
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold" aria-label="Main Navigation">
              <button
                type="button"
                onClick={() => navigate('/#tradition')}
                className="text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low px-2.5 py-1 rounded cursor-pointer"
              >
                Tradition
              </button>
              <button
                type="button"
                onClick={() => navigate('/#menus')}
                className="text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low px-2.5 py-1 rounded cursor-pointer"
              >
                Catering Menus
              </button>
              <button
                type="button"
                onClick={() => navigate('/#muhurtham')}
                className="text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low px-2.5 py-1 rounded cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px] text-tertiary-container">eco</span>
                <span>Muhurtham Feasts</span>
              </button>
              <button
                type="button"
                className="text-primary border-b-2 border-primary pb-0.5 font-bold cursor-pointer"
                aria-current="page"
              >
                Enquiry
              </button>
            </nav>

            {/* Trailing Action Cluster & Search */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:flex items-center bg-surface-container-low border border-outline-variant/50 rounded-xl px-3 py-1.5 gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                <span className="material-symbols-outlined text-outline text-[18px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search past requests..."
                  className="bg-transparent border-0 p-0 text-xs sm:text-sm text-on-surface placeholder:text-outline focus:ring-0 w-36 outline-none"
                  aria-label="Search past requests"
                />
              </div>

              {/* Event Muhurtham Calendar Button */}
              <button
                type="button"
                onClick={() => navigate('/request')}
                className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-xl transition-all relative cursor-pointer"
                title="Event Muhurtham Calendar"
                aria-label="Plan event date on calendar"
              >
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              </button>

              {/* Saved Requests Cart */}
              <button
                type="button"
                onClick={() => navigate('/request')}
                className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-xl transition-all relative cursor-pointer"
                title="Saved Feast Selection"
                aria-label="View selected feast cart"
              >
                <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                {draftItemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {draftItemCount}
                  </span>
                )}
              </button>

              {/* Plan Event Banquet CTA */}
              <button
                type="button"
                onClick={() => navigate('/request')}
                className="crimson-gradient text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl custom-cta-glow hover:opacity-95 active:scale-95 transition-all duration-150 flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
              >
                <span>Plan Event Banquet</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

          </div>
        </header>

        {/* ==========================================================
            2. MAIN CANVAS CONTAINER
            ========================================================== */}
        <PageTransition direction="forward">
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

            {/* Breadcrumb & Header Title Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/40 pb-6">
              <div className="space-y-1.5">
                <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant flex-wrap" aria-label="Breadcrumb">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    Mysuru Catering Home
                  </button>
                  <span className="text-outline-variant">•</span>
                  <span className="text-primary font-bold">Your Past Catering Requests</span>
                  <span className="text-outline-variant">•</span>
                  <span className="text-secondary font-medium">Mysuru Traditional Sattvic Feast</span>
                </nav>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-primary tracking-tight">
                  Your Past Catering Requests
                </h1>
                <p className="text-sm sm:text-base text-on-surface-variant max-w-3xl leading-relaxed">
                  Review historical banquet menus, calculate guest servings, or instantaneously duplicate prior auspicious feast bookings.
                </p>
              </div>

              {/* Kitchen Concierge Quick Contact Chip */}
              <div className="flex items-center gap-3 bg-surface-container-low border border-outline-variant/60 rounded-2xl p-3 px-4 shadow-2xs self-start md:self-auto shrink-0">
                <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[22px]">support_agent</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-on-surface-variant block">Kitchen Concierge</span>
                  <a
                    href="tel:+918212448920"
                    className="text-sm font-bold text-on-surface hover:text-primary transition-colors block"
                  >
                    +91 821 244 8920
                  </a>
                </div>
              </div>
            </div>

            {/* Privacy Callout Card (Apple-style frosted banner) */}
            <div className="rounded-2xl p-5 bg-surface-container-low border border-outline-variant/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 custom-warm-shadow relative overflow-hidden">
              <div 
                aria-hidden="true" 
                className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full pointer-events-none blur-2xl" 
              />
              <div className="flex items-start md:items-center gap-3.5 relative z-10">
                <div className="p-2.5 rounded-xl bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-on-surface">Guest Order Privacy</h2>
                  <p className="text-xs sm:text-sm text-on-surface-variant pt-0.5">
                    Saved only on this browser and device. No account or password needed for genuine Mysuru hospitality.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-secondary bg-secondary-fixed/50 px-3 py-1.5 rounded-full border border-secondary-container shrink-0 relative z-10">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span>Local Device Storage Protected</span>
              </div>
            </div>

            {/* View Switcher Tabs & History Management Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
              
              {/* Tabs Switcher */}
              <div className="inline-flex p-1.5 bg-surface-container border border-outline-variant/60 rounded-xl space-x-1" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'active'}
                  id="tabActiveBtn"
                  onClick={() => setActiveTab('active')}
                  className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'active'
                      ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                      : 'text-on-surface-variant hover:text-primary font-medium'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
                  <span>Active History ({enquiries.length} Requests)</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'empty'}
                  id="tabEmptyBtn"
                  onClick={() => setActiveTab('empty')}
                  className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'empty'
                      ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                      : 'text-on-surface-variant hover:text-primary font-medium'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">inbox</span>
                  <span>Empty State Preview</span>
                </button>
              </div>

              {/* Action Cluster: Clear History & Place New Request */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsClearDialogOpen(true)}
                  className="px-4 py-2 rounded-xl border border-outline-variant hover:bg-error-container/40 text-on-surface-variant hover:text-error transition-all text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  <span>Clear History</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/request')}
                  className="crimson-gradient text-white px-4 sm:px-5 py-2 rounded-xl custom-cta-glow text-xs sm:text-sm font-bold hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>+ Place New Catering Request</span>
                </button>
              </div>

            </div>

            {/* Top Status Indicator Bar */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-on-surface-variant px-1">
              <span className="font-semibold text-on-surface">
                Showing {sortedEnquiries.length} catering banquet {sortedEnquiries.length === 1 ? 'request' : 'requests'}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-secondary">
                <span className="material-symbols-outlined text-sm">sync</span>
                Last synced just now
              </span>
            </div>

            {/* ==========================================================
                3. ENQUIRIES CONTENT
                Either Empty View OR Active Enquiries Cards
                ========================================================== */}
            {activeTab === 'empty' || enquiries.length === 0 ? (
              /* TAB 2: EMPTY STATE CONTAINER */
              <div id="emptyView" className="w-full">
                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto custom-warm-shadow space-y-6 my-6">
                  
                  {/* Clean SVG/Icon representation */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary shadow-inner">
                    <span className="material-symbols-outlined text-4xl sm:text-5xl">restaurant</span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
                      No enquiries yet
                    </h2>
                    <p className="text-sm sm:text-base text-on-surface-variant max-w-md mx-auto leading-relaxed">
                      No requests yet on this device. When you submit an auspicious catering feast, it will be safely remembered here on this phone.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/')}
                      className="crimson-gradient text-white text-xs sm:text-sm font-bold px-6 sm:px-8 py-3 rounded-xl custom-cta-glow hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 shadow-md w-full sm:w-auto justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">soup_kitchen</span>
                      <span>Browse Catering Menus</span>
                    </button>
                    {enquiries.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('active')}
                        className="border border-outline-variant hover:bg-surface-container text-on-surface text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition-all w-full sm:w-auto cursor-pointer"
                      >
                        Return to Active View
                      </button>
                    )}
                  </div>

                  {/* Trust and Purity Assurance Badges */}
                  <div className="pt-6 border-t border-outline-variant/40 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-sm">verified</span>
                      100% Mysuru Purity
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-sm">local_fire_department</span>
                      Fresh Live Counters
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-sm">volunteer_activism</span>
                      Sacred Hospitality
                    </span>
                  </div>

                </div>
              </div>
            ) : (
              /* TAB 1: ACTIVE REQUESTS CONTAINER */
              <div id="activeView" className="space-y-6">
                {sortedEnquiries.map((enquiry, index) => {
                  const variants = getItemEntranceVariants(tier, index)
                  const itemsList = enquiry.itemsList && enquiry.itemsList.length > 0 
                    ? enquiry.itemsList 
                    : enquiry.itemsSummary
                      ? enquiry.itemsSummary.split(',').map((name, i) => ({
                          id: `item-${i}`,
                          name: name.trim(),
                          pricePerPlate: enquiry.perPlateTotal ? Math.round(enquiry.perPlateTotal / (enquiry.itemsSummary.split(',').length || 1)) : 65,
                          quantity: 1
                        }))
                      : []

                  return (
                    <motion.article
                      key={enquiry.orderId}
                      initial={isReduced ? false : variants.hidden}
                      animate={variants.visible}
                      onClick={() => setSelectedEnquiry(enquiry)}
                      className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 sm:p-6 md:p-8 custom-warm-shadow hover:border-primary/50 transition-all duration-200 cursor-pointer group space-y-5"
                    >
                      {/* Header Row */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-outline-variant/30 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                            <span className="font-serif font-bold text-xl sm:text-2xl text-primary">
                              Request #{enquiry.orderId}
                            </span>
                            <span className="text-xs sm:text-sm text-on-surface-variant font-medium">
                              ({formatSubmittedAt(enquiry.createdAt)})
                            </span>
                            {/* Status Badge */}
                            <span className="inline-flex items-center gap-1.5 bg-surface-container-high text-primary border border-outline-variant px-3 py-0.5 rounded-full text-xs font-bold">
                              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                              Submitted
                            </span>
                            {/* Sattvic Purity Chip */}
                            <span className="inline-flex items-center gap-1 bg-secondary-fixed/40 text-on-secondary-fixed border border-secondary-container px-2.5 py-0.5 rounded-full text-xs font-semibold">
                              <span className="material-symbols-outlined text-xs">eco</span>
                              100% Traditional Sattvic
                            </span>
                          </div>

                          {/* Occasion Heading with separate exact match element for Playwright test */}
                          <h3 className="text-base sm:text-lg font-bold text-on-surface flex items-baseline gap-2 flex-wrap">
                            <span className="text-on-surface-variant font-normal text-sm">Occasion:</span>
                            <span className="font-serif font-bold text-lg sm:text-xl text-primary hover:underline">
                              {enquiry.eventType}
                            </span>
                            <span className="text-on-surface-variant font-normal text-xs sm:text-sm">
                              • Auspicious Morning Muhurtham
                            </span>
                          </h3>
                        </div>

                        {/* Total Estimation Highlight */}
                        <div className="flex items-baseline lg:items-end flex-col bg-surface-container-low px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-outline-variant/40 shrink-0">
                          <span className="text-xs font-semibold text-on-surface-variant">Estimated Total Budget</span>
                          <div className="font-serif font-bold text-xl sm:text-2xl text-primary flex items-baseline gap-1">
                            {formatRupees(enquiry.totalAmount)}
                            <span className="text-xs font-normal text-on-surface-variant font-sans">incl. taxes</span>
                          </div>
                        </div>
                      </div>

                      {/* Banquet Metadata Ribbon */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 py-4 border-b border-outline-variant/30 text-xs sm:text-sm">
                        {/* 1. Muhurtham Date */}
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-surface-container text-primary shrink-0">
                            <span className="material-symbols-outlined text-[20px]">event</span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-on-surface-variant block">Muhurtham Date</span>
                            <span className="font-bold text-on-surface block">{formatEventDate(enquiry.eventDate)}</span>
                            <span className="text-[11px] text-secondary font-medium block">Auspicious Muhurtham</span>
                          </div>
                        </div>

                        {/* 2. Guest Serving Count (Matches Playwright '120 plates') */}
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-surface-container text-primary shrink-0">
                            <span className="material-symbols-outlined text-[20px]">groups</span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-on-surface-variant block">Guest Serving Count</span>
                            <span className="font-bold text-on-surface block">{enquiry.guestCount} plates</span>
                            <span className="text-[11px] text-tertiary-container font-medium block">Bale Ele (Plantain Leaf)</span>
                          </div>
                        </div>

                        {/* 3. Curated Spread */}
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-surface-container text-primary shrink-0">
                            <span className="material-symbols-outlined text-[20px]">soup_kitchen</span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-on-surface-variant block">Curated Spread</span>
                            <span className="font-bold text-on-surface block">
                              {enquiry.itemsCount || itemsList.length || 5} Delicacies
                            </span>
                            <span className="text-[11px] text-on-surface-variant block">Pure Ghee Specialties</span>
                          </div>
                        </div>

                        {/* 4. Delivery & Service Hub */}
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-surface-container text-primary shrink-0">
                            <span className="material-symbols-outlined text-[20px]">pin_drop</span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-on-surface-variant block">Delivery &amp; Service Hub</span>
                            <span className="font-bold text-on-surface block truncate max-w-[130px] sm:max-w-[180px]">
                              {enquiry.venueAddress || 'Mysuru Hall Venue'}
                            </span>
                            <span className="text-[11px] text-on-surface-variant block">Hall Buffet Setup</span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded List of Delicacies Grid */}
                      <div className="pt-2 pb-2">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-base">menu_book</span>
                            Curated Traditional Course Details
                          </h4>
                          <span className="text-xs font-semibold text-secondary hidden sm:inline-block">
                            Authentic Melkote &amp; Mysuru Preparation
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                          {itemsList.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-3.5 h-3.5 border-2 border-tertiary-container flex items-center justify-center p-0.5 rounded-xs shrink-0">
                                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container" />
                                </span>
                                <div>
                                  <h5 className="font-medium text-xs sm:text-sm text-on-surface leading-tight">
                                    {item.name}
                                  </h5>
                                  <span className="text-[11px] text-on-surface-variant block leading-tight">
                                    Traditional Sattvic Recipe
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-bold text-xs sm:text-sm text-primary">
                                  {formatRupees(item.pricePerPlate)}
                                </span>
                                <span className="text-[10px] text-on-surface-variant block">/plt</span>
                              </div>
                            </div>
                          ))}

                          {/* Plantain Leaf Service Note */}
                          <div className="p-3 rounded-xl bg-secondary-fixed/30 border border-secondary-container flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-secondary text-[20px]">restaurant</span>
                              <div>
                                <span className="text-xs sm:text-sm font-bold text-on-secondary-fixed block">
                                  Bale Ele Seva (Full Setup)
                                </span>
                                <span className="text-[11px] text-on-secondary-fixed-variant block">
                                  Complimentary salt, pickle, appalam
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold bg-secondary text-white px-2 py-0.5 rounded">
                              Included
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Action Toolbar */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/30">
                        <div className="flex items-center gap-2 text-on-surface-variant text-xs sm:text-sm self-start sm:self-auto">
                          <span className="material-symbols-outlined text-secondary text-base">info</span>
                          <span>Chef assigned: Srivatsa Iyengar (Head Rasamacharya)</span>
                        </div>
                        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                          <a
                            href="tel:+918212448920"
                            onClick={(e) => e.stopPropagation()}
                            className="px-4 py-2 rounded-xl border border-outline-variant hover:bg-surface-container text-on-surface text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all flex-1 sm:flex-initial"
                          >
                            <span className="material-symbols-outlined text-primary text-base">call</span>
                            <span>Call Kitchen</span>
                          </a>
                          <button
                            type="button"
                            onClick={(e) => handleReorder(enquiry, e)}
                            className="crimson-gradient text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 rounded-xl custom-cta-glow hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm flex-1 sm:flex-initial cursor-pointer whitespace-nowrap"
                          >
                            <span className="material-symbols-outlined text-base">content_copy</span>
                            <span>Re-order / Duplicate Menu</span>
                          </button>
                        </div>
                      </div>

                    </motion.article>
                  )
                })}
              </div>
            )}

            {/* Assurance & Tradition Banner */}
            <section className="bg-surface-container-high border border-outline-variant/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-2xl sm:text-3xl">spa</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-primary">
                    Sacred Purity &amp; Sattvic Kitchen Discipline
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                    Every banquet is prepared adhering to orthodox Vedic principles: zero onion, zero garlic, unadulterated cold-pressed sesame oil, and fragrant A2 pure cow ghee sourced directly from Mandya goshalas.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleDownloadBrochure}
                  className="bg-surface-container-lowest text-primary border border-outline hover:bg-surface-container text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs w-full md:w-auto cursor-pointer"
                >
                  Download Banquet Brochure
                </button>
              </div>
            </section>

          </main>
        </PageTransition>

        {/* ==========================================================
            4. SHARED TRADITIONAL HERITAGE FOOTER
            ========================================================== */}
        <footer className="bg-surface-container-low border-t border-outline-variant/50 w-full mt-16">
          <div className="w-full px-4 md:px-12 py-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="font-serif font-bold text-base sm:text-lg text-primary">
                  TKS Iyengar's Catering
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                <span className="text-xs font-semibold text-secondary">Mysuru Heritage Kitchens</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                © 2025 TKS Iyengar's Catering Services, Mysuru. Pure Vegetarian Tradition &amp; Heritage Feasts. All rights reserved.
              </p>
            </div>
            <nav className="flex flex-wrap justify-center md:justify-end gap-x-5 gap-y-2 text-xs font-semibold" aria-label="Footer Navigation">
              <button type="button" onClick={() => navigate('/#tradition')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                Sacred Menu Heritage
              </button>
              <button type="button" onClick={() => navigate('/#muhurtham')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                Muhurtham Packages
              </button>
              <button type="button" onClick={() => navigate('/#menus')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                Purity Guarantee
              </button>
              <button type="button" onClick={() => navigate('/enquiries')} className="text-primary font-bold transition-colors cursor-pointer">
                Enquire for Banquets
              </button>
            </nav>
          </div>
        </footer>

        {/* ==========================================================
            5. DETAIL SHEET (Desktop: Right Panel, Mobile: Bottom Drawer)
            Opened by card tap:
            Displays customerName (e.g. Kalyan Iyengar), phone, address, notes
            ========================================================== */}
        {isDesktop ? (
          <Sheet
            open={!!selectedEnquiry}
            onOpenChange={(open) => {
              if (!open) setSelectedEnquiry(null)
            }}
          >
            <SheetContent side="right" showCloseButton={false} className="w-full sm:max-w-md p-6 bg-white overflow-y-auto z-50">
              {selectedEnquiry && (
                <>
                  <SheetHeader className="text-left pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                      <SheetTitle className="font-serif font-bold text-xl text-primary">
                        Enquiry Details
                      </SheetTitle>
                      <SheetDescription className="text-xs text-on-surface-variant pt-0.5">
                        Ref #{selectedEnquiry.orderId} • {formatSubmittedAt(selectedEnquiry.createdAt)}
                      </SheetDescription>
                    </div>
                    <SheetClose asChild>
                      <button 
                        type="button"
                        aria-label="Close enquiry details"
                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </SheetClose>
                  </SheetHeader>

                  <div className="space-y-4 py-4 text-xs sm:text-sm">
                    {/* Occasion & Schedule */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-0.5">
                        <span className="text-[11px] font-semibold text-on-surface-variant">Occasion</span>
                        <p className="font-bold text-on-surface">{selectedEnquiry.eventType}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-0.5">
                        <span className="text-[11px] font-semibold text-on-surface-variant">Event Date</span>
                        <p className="font-bold text-on-surface">{formatEventDate(selectedEnquiry.eventDate)}</p>
                      </div>
                    </div>

                    {/* Plates count */}
                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between">
                      <span className="font-semibold text-on-surface-variant">Number of plates</span>
                      <span className="font-bold text-on-surface">{selectedEnquiry.guestCount} plates</span>
                    </div>

                    {/* Customer Contact (Target for Kalyan Iyengar in tests) */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-0.5">
                        <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-primary">person</span>
                          Customer Name
                        </span>
                        <p className="font-bold text-on-surface">{selectedEnquiry.customerName}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-0.5">
                        <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-primary">phone</span>
                          Mobile Number
                        </span>
                        <p className="font-bold text-on-surface">+91 {selectedEnquiry.customerPhone}</p>
                      </div>
                    </div>

                    {/* Full Items with per-plate prices */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                        <span className="material-symbols-outlined text-xs text-primary">restaurant</span>
                        <span>Items Selected ({selectedEnquiry.itemsCount || selectedEnquiry.itemsList?.length || 0})</span>
                      </div>

                      <div className="rounded-xl bg-surface-container-low border border-outline-variant/40 p-3 space-y-2">
                        {selectedEnquiry.itemsList && selectedEnquiry.itemsList.length > 0 ? (
                          selectedEnquiry.itemsList.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-xs py-0.5">
                              <span className="font-medium text-on-surface">{item.name}</span>
                              <span className="font-bold text-primary">{formatRupees(item.pricePerPlate)} / plate</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                            {selectedEnquiry.itemsSummary}
                          </p>
                        )}

                        {selectedEnquiry.perPlateTotal && (
                          <div className="border-t border-outline-variant/40 pt-2 flex items-center justify-between font-bold text-xs">
                            <span>Base price per plate</span>
                            <span className="text-primary font-bold">{formatRupees(selectedEnquiry.perPlateTotal)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-1">
                      <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-primary">location_on</span>
                        Delivery Address
                      </span>
                      <p className="font-medium text-on-surface whitespace-pre-wrap">
                        {selectedEnquiry.venueAddress || 'Mysuru Hall Setup'}
                      </p>
                    </div>

                    {/* Special Instructions */}
                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-1">
                      <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-primary">description</span>
                        Special Instructions
                      </span>
                      <p className="font-medium text-on-surface italic">
                        {selectedEnquiry.notes && selectedEnquiry.notes.trim() ? selectedEnquiry.notes : 'None provided'}
                      </p>
                    </div>

                    {/* Calculated Estimate */}
                    <div className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant/60 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-primary block">
                          Estimated Food Total
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          {selectedEnquiry.guestCount} plates estimated
                        </span>
                      </div>
                      <span className="font-serif font-bold text-xl text-primary">
                        {formatRupees(selectedEnquiry.totalAmount)}
                      </span>
                    </div>

                    {/* Bottom Action in Drawer */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          handleReorder(selectedEnquiry, e)
                          setSelectedEnquiry(null)
                        }}
                        className="w-full crimson-gradient text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                        <span>Re-order Duplicate Menu</span>
                      </button>
                    </div>

                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        ) : (
          <Drawer
            open={!!selectedEnquiry}
            onOpenChange={(open) => {
              if (!open) setSelectedEnquiry(null)
            }}
          >
            <DrawerContent className="p-4 sm:p-6 max-w-md md:max-w-xl mx-auto rounded-t-[28px] max-h-[85vh] overflow-y-auto bg-white">
              {selectedEnquiry && (
                <>
                  <DrawerHeader className="text-left pb-2 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <DrawerTitle className="font-serif font-bold text-lg text-primary">
                          Enquiry Details
                        </DrawerTitle>
                        <DrawerDescription className="text-xs text-on-surface-variant pt-0.5">
                          Ref #{selectedEnquiry.orderId} • {formatSubmittedAt(selectedEnquiry.createdAt)}
                        </DrawerDescription>
                      </div>
                      <DrawerClose asChild>
                        <button 
                          type="button"
                          aria-label="Close details"
                          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </DrawerClose>
                    </div>
                  </DrawerHeader>

                  <div className="space-y-4 py-3 text-xs sm:text-sm">
                    {/* Occasion & Schedule */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-0.5">
                        <span className="text-[11px] font-semibold text-on-surface-variant">Occasion</span>
                        <p className="font-bold text-on-surface">{selectedEnquiry.eventType}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-0.5">
                        <span className="text-[11px] font-semibold text-on-surface-variant">Event Date</span>
                        <p className="font-bold text-on-surface">{formatEventDate(selectedEnquiry.eventDate)}</p>
                      </div>
                    </div>

                    {/* Plates count */}
                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between">
                      <span className="font-semibold text-on-surface-variant">Number of plates</span>
                      <span className="font-bold text-on-surface">{selectedEnquiry.guestCount} plates</span>
                    </div>

                    {/* Customer Contact */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-0.5">
                        <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-primary">person</span>
                          Customer Name
                        </span>
                        <p className="font-bold text-on-surface">{selectedEnquiry.customerName}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-0.5">
                        <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-primary">phone</span>
                          Mobile Number
                        </span>
                        <p className="font-bold text-on-surface">+91 {selectedEnquiry.customerPhone}</p>
                      </div>
                    </div>

                    {/* Full Items with per-plate prices */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                        <span className="material-symbols-outlined text-xs text-primary">restaurant</span>
                        <span>Items Selected ({selectedEnquiry.itemsCount || selectedEnquiry.itemsList?.length || 0})</span>
                      </div>

                      <div className="rounded-xl bg-surface-container-low border border-outline-variant/40 p-3 space-y-2">
                        {selectedEnquiry.itemsList && selectedEnquiry.itemsList.length > 0 ? (
                          selectedEnquiry.itemsList.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-xs py-0.5">
                              <span className="font-medium text-on-surface">{item.name}</span>
                              <span className="font-bold text-primary">{formatRupees(item.pricePerPlate)} / plate</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                            {selectedEnquiry.itemsSummary}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Calculated Estimate */}
                    <div className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant/60 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-primary block">
                          Estimated Food Total
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          {selectedEnquiry.guestCount} plates estimated
                        </span>
                      </div>
                      <span className="font-serif font-bold text-lg sm:text-xl text-primary">
                        {formatRupees(selectedEnquiry.totalAmount)}
                      </span>
                    </div>

                  </div>

                  <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                      <Button
                        variant="outline"
                        className="rounded-full h-11 text-xs font-bold cursor-pointer"
                      >
                        Close
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </>
              )}
            </DrawerContent>
          </Drawer>
        )}

        {/* ==========================================================
            6. CLEAR HISTORY CONFIRMATION DIALOG
            Matches Playwright targets:
            - Button with text 'Clear all'
            ========================================================== */}
        <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
          <AlertDialogContent className="rounded-2xl max-w-sm bg-white p-6 shadow-xl border border-outline-variant/60">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-serif font-bold text-lg text-primary">
                Clear history
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-on-surface-variant leading-relaxed pt-1">
                Are you sure you wish to clear all past catering requests from this browser and device? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="pt-4 flex items-center gap-2.5">
              <AlertDialogCancel className="rounded-full h-10 text-xs font-semibold px-4 cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmClear}
                className="rounded-full h-10 text-xs font-bold bg-error text-white hover:bg-error/90 px-4 cursor-pointer"
              >
                Clear all
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </CustomerDesktopShell>
  )
}

export default EnquiriesPage
