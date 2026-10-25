import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  ChevronRight, 
  Info, 
  MapPin, 
  FileText, 
  UtensilsCrossed, 
  User, 
  Phone, 
  X 
} from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { format, parseISO, isValid } from 'date-fns'

import { motion } from 'motion/react'
import { useEnquiryStore, type LocalEnquiryRecord } from '@/store/enquiryStore'
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
  const enquiries = useEnquiryStore((state) => state.enquiries)
  const clearHistory = useEnquiryStore((state) => state.clearHistory)

  // Selected enquiry for the bottom sheet
  const [selectedEnquiry, setSelectedEnquiry] = useState<LocalEnquiryRecord | null>(null)

  // Clear history dialog state
  const [isClearDialogOpen, setIsClearDialogOpen] = useState<boolean>(false)

  // Sort newest first
  const sortedEnquiries = [...enquiries].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime() || 0
    const timeB = new Date(b.createdAt).getTime() || 0
    return timeB - timeA
  })

  // Format submission date nicely (e.g., '22 Oct 2026, 08:35 PM')
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

  // First 3 items + '+N more' helper per spec
  const getItemsPreview = (record: LocalEnquiryRecord): string => {
    let names: string[] = []
    if (record.itemsList && record.itemsList.length > 0) {
      names = record.itemsList.map((item) => item.name)
    } else if (record.itemsSummary) {
      names = record.itemsSummary.split(',').map((s) => s.trim()).filter(Boolean)
    }

    if (names.length === 0) return 'Catering selection'
    if (names.length <= 3) return names.join(', ')

    const firstThree = names.slice(0, 3).join(', ')
    const remaining = names.length - 3
    return `${firstThree} +${remaining} more`
  }

  // Handle confirm clear history
  const handleConfirmClear = () => {
    clearHistory()
    setIsClearDialogOpen(false)
    toast.success('Enquiry history cleared')
  }

  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  })

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <CustomerDesktopShell maxWidth="w-full">
      <Toaster position="bottom-center" richColors />
      <div className="w-full flex flex-col bg-transparent relative min-h-screen">
        
        {/* ==========================================================
            1. TOP BAR (glass)
            Back arrow, 'My enquiries', and 'Clear history' text button
            ========================================================== */}
        <header className="sticky top-0 z-10 glass-top-bar px-4 sm:px-6 lg:px-8 py-3 transition-all border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all tap-target-48 text-[var(--text-primary)] -ml-1 cursor-pointer"
                aria-label="Back to menu"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <div>
                <h1 className="font-serif font-bold text-base sm:text-lg lg:text-xl text-[var(--brand-900)] tracking-tight leading-tight">
                  My enquiries
                </h1>
                <p className="text-[11px] text-[var(--text-muted)] font-semibold leading-none pt-0.5">
                  Saved on this device • Local booking history
                </p>
              </div>
            </div>

            {/* Clear history text button */}
            {enquiries.length > 0 && (
              <button
                type="button"
                onClick={() => setIsClearDialogOpen(true)}
                className="text-xs font-bold text-[var(--status-cancelled-text)] hover:underline active:scale-95 transition-all tap-target-48 px-2 py-1 cursor-pointer"
              >
                Clear history
              </button>
            )}
          </div>
        </header>

        {/* ==========================================================
            MAIN CONTENT
            ========================================================== */}
        <PageTransition direction="forward">
          <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pt-6 pb-24 space-y-6">
          
          {/* ==========================================================
              2. INFO BANNER (small, glass)
              'Saved on this phone and browser only. It may be lost if you clear your browser data and it will not appear on other devices.'
              ========================================================== */}
          <div className="bg-white p-3 sm:p-3.5 rounded-2xl flex items-start gap-2.5 shadow-2xs border border-slate-200/80">
            <Info className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Saved on this phone and browser only. It may be lost if you clear your browser data and it will not appear on other devices.
            </p>
          </div>

          {/* ==========================================================
              3. EMPTY STATE (Made of pure CSS shapes)
              'No enquiries yet' with a 'Browse menu' button.
              Survives refreshes & restarts via zustand persist.
              ========================================================== */}
          {enquiries.length === 0 ? (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-5 my-auto">
              
              {/* Pure CSS Geometric Shapes Illustration */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Outer concentric dashed ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--brand-200)] animate-spin-slow opacity-60" />
                
                {/* Soft circular background glow */}
                <div className="w-24 h-24 rounded-full bg-[var(--brand-soft)] flex items-center justify-center shadow-inner">
                  
                  {/* Stylized CSS Receipt Shape */}
                  <div className="relative w-12 h-16 bg-white rounded-t-lg rounded-b-sm border-2 border-[var(--brand-300)] shadow-md flex flex-col justify-between p-2">
                    {/* Header bar */}
                    <div className="w-full h-1.5 rounded-full bg-[var(--brand)]" />
                    
                    {/* Item lines */}
                    <div className="space-y-1 my-auto">
                      <div className="w-3/4 h-1 rounded-full bg-slate-200" />
                      <div className="w-1/2 h-1 rounded-full bg-slate-200" />
                      <div className="w-2/3 h-1 rounded-full bg-[var(--brand-200)]" />
                    </div>

                    {/* Bottom dashed tear line */}
                    <div className="w-full border-b-2 border-dotted border-slate-300 pt-0.5" />
                  </div>

                </div>

                {/* Decorative floating CSS dot bubbles */}
                <div className="absolute top-1 right-2 w-3 h-3 rounded-full bg-[var(--brand-2)] shadow-xs" />
                <div className="absolute bottom-2 left-3 w-2.5 h-2.5 rounded-full bg-[var(--brand-400)]" />
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5 max-w-xs">
                <h2 className="font-heading font-black text-xl text-[var(--text-primary)]">
                  No enquiries yet
                </h2>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  When you submit a catering request, it will be safely remembered here on this phone.
                </p>
              </div>

              {/* Action Button: 'Browse menu' */}
              <Button
                onClick={() => navigate('/')}
                className="h-11 px-6 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[var(--on-brand)] font-bold text-xs sm:text-sm shadow-md tap-target-48"
              >
                Browse menu
              </Button>
            </div>
          ) : (
            /* ==========================================================
                4. ENQUIRY CARDS (Swiggy 'Your orders' style)
                Newest first:
                - date submitted
                - occasion and occasion date
                - plates
                - estimated total
                - first 3 item names with '+N more'
                - chevron opens bottom sheet
                - SHOW NO STATUS (admin's record is separate)
                ========================================================== */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedEnquiries.map((enquiry, index) => {
                const variants = getItemEntranceVariants(tier, index)
                return (
                  <motion.div
                    key={enquiry.orderId}
                    initial={isReduced ? false : variants.hidden}
                    animate={variants.visible}
                    whileTap={isReduced ? undefined : { scale: 0.98 }}
                    onClick={() => setSelectedEnquiry(enquiry)}
                    className="content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs hover:border-[var(--brand-300)] cursor-pointer group space-y-3"
                  >
                    {/* Top Row: Submitted timestamp + Chevron */}
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)] border-b border-slate-100 pb-2">
                      <span className="font-medium">
                        Submitted on {formatSubmittedAt(enquiry.createdAt)}
                      </span>
                      <div className="flex items-center gap-1 text-[var(--brand)] font-bold text-xs">
                        <span>View details</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Main Row: Occasion & Event Date */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-serif font-bold text-base text-[var(--text-primary)] leading-tight">
                          {enquiry.eventType}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 pt-0.5">
                          {formatEventDate(enquiry.eventDate)}
                        </p>
                      </div>

                      {/* Estimated total & plates */}
                      <div className="text-right shrink-0">
                        <span className="font-heading font-black text-base text-[var(--brand-900)] block">
                          {formatRupees(enquiry.totalAmount)}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {enquiry.guestCount} plates
                        </span>
                      </div>
                    </div>

                    {/* First 3 item names with '+N more' */}
                    <div className="rounded-xl bg-slate-50 p-2.5 flex items-center gap-2 text-xs text-slate-700 border border-slate-100">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
                      <span className="font-medium truncate">
                        {getItemsPreview(enquiry)}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

        </main>
      </PageTransition>

        {/* ==========================================================
            5. DETAIL: Bottom sheet on phones & tablets; Right-side panel on desktop
            Opened by chevron / card tap:
            - items with per-plate prices
            - address
            - instructions
            - estimate
            - name
            - mobile
            - NO STATUS shown
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
                      <SheetTitle className="font-heading font-black text-lg text-[var(--brand-900)]">
                        Enquiry Details
                      </SheetTitle>
                      <SheetDescription className="text-xs text-[var(--text-muted)] pt-0.5">
                        Ref #{selectedEnquiry.orderId} • {formatSubmittedAt(selectedEnquiry.createdAt)}
                      </SheetDescription>
                    </div>
                    <SheetClose asChild>
                      <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                        <X className="w-4 h-4" />
                      </button>
                    </SheetClose>
                  </SheetHeader>

                  <div className="space-y-4 py-4 text-xs sm:text-sm">
                    {/* Occasion & Schedule */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-400">Occasion</span>
                        <p className="font-bold text-slate-900">{selectedEnquiry.eventType}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-400">Event Date</span>
                        <p className="font-bold text-slate-900">{formatEventDate(selectedEnquiry.eventDate)}</p>
                      </div>
                    </div>

                    {/* Plates count */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-slate-600">Number of plates</span>
                      <span className="font-bold text-slate-900">{selectedEnquiry.guestCount} meals</span>
                    </div>

                    {/* Full Items with per-plate prices */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-[var(--brand)]" />
                        <span>Items Selected ({selectedEnquiry.itemsCount || selectedEnquiry.itemsList?.length || 0})</span>
                      </div>

                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-2">
                        {selectedEnquiry.itemsList && selectedEnquiry.itemsList.length > 0 ? (
                          selectedEnquiry.itemsList.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-xs py-0.5">
                              <span className="font-medium text-slate-800">{item.name}</span>
                              <span className="font-bold text-slate-600">{formatRupees(item.pricePerPlate)} / plate</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {selectedEnquiry.itemsSummary}
                          </p>
                        )}

                        {selectedEnquiry.perPlateTotal && (
                          <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between font-bold text-xs">
                            <span>Base price per plate</span>
                            <span className="text-[var(--brand-900)] font-black">{formatRupees(selectedEnquiry.perPlateTotal)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[var(--brand)]" />
                        Delivery Address
                      </span>
                      <p className="font-medium text-slate-800 whitespace-pre-wrap">
                        {selectedEnquiry.venueAddress || 'Not provided'}
                      </p>
                    </div>

                    {/* Special Instructions */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-[var(--brand)]" />
                        Special Instructions
                      </span>
                      <p className="font-medium text-slate-800 italic">
                        {selectedEnquiry.notes && selectedEnquiry.notes.trim() ? selectedEnquiry.notes : 'None provided'}
                      </p>
                    </div>

                    {/* Customer Contact */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3 text-[var(--brand)]" />
                          Customer Name
                        </span>
                        <p className="font-bold text-slate-900">{selectedEnquiry.customerName}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[var(--brand)]" />
                          Mobile Number
                        </span>
                        <p className="font-bold text-slate-900">+91 {selectedEnquiry.customerPhone}</p>
                      </div>
                    </div>

                    {/* Calculated Estimate */}
                    <div className="p-3.5 rounded-2xl bg-[var(--brand-soft)] border border-[var(--brand-200)] flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-[var(--brand-900)] block">
                          Estimated Food Total
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          {selectedEnquiry.guestCount} plates estimated
                        </span>
                      </div>
                      <span className="font-heading font-black text-lg sm:text-xl text-[var(--brand-900)]">
                        {formatRupees(selectedEnquiry.totalAmount)}
                      </span>
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
            <DrawerContent className="p-4 sm:p-6 max-w-md md:max-w-xl mx-auto rounded-t-[28px] max-h-[85vh] overflow-y-auto">
              {selectedEnquiry && (
                <>
                  <DrawerHeader className="text-left pb-2 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <DrawerTitle className="font-heading font-black text-lg text-[var(--brand-900)]">
                          Enquiry Details
                        </DrawerTitle>
                        <DrawerDescription className="text-xs text-[var(--text-muted)] pt-0.5">
                          Ref #{selectedEnquiry.orderId} • {formatSubmittedAt(selectedEnquiry.createdAt)}
                        </DrawerDescription>
                      </div>
                      <DrawerClose asChild>
                        <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                          <X className="w-4 h-4" />
                        </button>
                      </DrawerClose>
                    </div>
                  </DrawerHeader>

                  <div className="space-y-4 py-3 text-xs sm:text-sm">
                    {/* Occasion & Schedule */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-400">Occasion</span>
                        <p className="font-bold text-slate-900">{selectedEnquiry.eventType}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-400">Event Date</span>
                        <p className="font-bold text-slate-900">{formatEventDate(selectedEnquiry.eventDate)}</p>
                      </div>
                    </div>

                    {/* Plates count */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-slate-600">Number of plates</span>
                      <span className="font-bold text-slate-900">{selectedEnquiry.guestCount} meals</span>
                    </div>

                    {/* Full Items with per-plate prices */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-[var(--brand)]" />
                        <span>Items Selected ({selectedEnquiry.itemsCount || selectedEnquiry.itemsList?.length || 0})</span>
                      </div>

                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-2">
                        {selectedEnquiry.itemsList && selectedEnquiry.itemsList.length > 0 ? (
                          selectedEnquiry.itemsList.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-xs py-0.5">
                              <span className="font-medium text-slate-800">{item.name}</span>
                              <span className="font-bold text-slate-600">{formatRupees(item.pricePerPlate)} / plate</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {selectedEnquiry.itemsSummary}
                          </p>
                        )}

                        {selectedEnquiry.perPlateTotal && (
                          <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between font-bold text-xs">
                            <span>Base price per plate</span>
                            <span className="text-[var(--brand-900)] font-black">{formatRupees(selectedEnquiry.perPlateTotal)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[var(--brand)]" />
                        Delivery Address
                      </span>
                      <p className="font-medium text-slate-800 whitespace-pre-wrap">
                        {selectedEnquiry.venueAddress || 'Not provided'}
                      </p>
                    </div>

                    {/* Special Instructions */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-[var(--brand)]" />
                        Special Instructions
                      </span>
                      <p className="font-medium text-slate-800 italic">
                        {selectedEnquiry.notes && selectedEnquiry.notes.trim() ? selectedEnquiry.notes : 'None provided'}
                      </p>
                    </div>

                    {/* Customer Contact */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3 text-[var(--brand)]" />
                          Customer Name
                        </span>
                        <p className="font-bold text-slate-900">{selectedEnquiry.customerName}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[var(--brand)]" />
                          Mobile Number
                        </span>
                        <p className="font-bold text-slate-900">+91 {selectedEnquiry.customerPhone}</p>
                      </div>
                    </div>

                    {/* Calculated Estimate */}
                    <div className="p-3.5 rounded-2xl bg-[var(--brand-soft)] border border-[var(--brand-200)] flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-[var(--brand-900)] block">
                          Estimated Food Total
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          {selectedEnquiry.guestCount} plates estimated
                        </span>
                      </div>
                      <span className="font-heading font-black text-lg sm:text-xl text-[var(--brand-900)]">
                        {formatRupees(selectedEnquiry.totalAmount)}
                      </span>
                    </div>

                  </div>

                  <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                      <Button
                        variant="outline"
                        className="rounded-full h-11 text-xs font-bold"
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
            'Clear all enquiries from this device? This cannot be undone.'
            ========================================================== */}
        <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
          <AlertDialogContent className="rounded-[20px] max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading font-black text-base text-[var(--brand-900)]">
                Clear history
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-[var(--text-muted)] leading-relaxed">
                Clear all enquiries from this device? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="pt-2 flex items-center gap-2">
              <AlertDialogCancel className="rounded-full h-10 text-xs font-semibold">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmClear}
                className="rounded-full h-10 text-xs font-bold bg-[var(--status-cancelled-text)] text-white hover:bg-[var(--status-cancelled-text)]/90"
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
