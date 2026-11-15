import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  Check, 
  Clock, 
  PhoneCall, 
  MessageCircle, 
  ChevronRight, 
  PlusCircle, 
  ArrowRight,
  Leaf
} from 'lucide-react'
import { AppFooter } from '@/components/common/AppFooter'
import { BookingStepper } from '@/components/customer/BookingStepper'
import { CustomerTopNav } from '@/components/customer/CustomerTopNav'
import confetti from 'canvas-confetti'
import { format, parseISO, isValid } from 'date-fns'

import { useDraftStore } from '@/store/draftStore'
import { useEnquiryStore } from '@/store/enquiryStore'
import { useBusinessSettingsStore } from '@/store/businessSettingsStore'

export const SubmittedPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const resetDraft = useDraftStore((state) => state.resetDraft)
  const settings = useBusinessSettingsStore((state) => state.settings)

  // Retrieve submitted order ID from location state or session storage
  const stateOrderId = location.state?.orderId as string | undefined
  const sessionOrderId = typeof window !== 'undefined' ? sessionStorage.getItem('tks_last_submitted_order_id') : null
  const targetOrderId = stateOrderId || sessionOrderId

  const storeOrder = useEnquiryStore((state) => 
    targetOrderId ? state.getEnquiryById(targetOrderId) : state.enquiries[0]
  )

  // Celebratory confetti on mount & ensure scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.35 },
      colors: ['#880000', '#b30a05', '#fdb647', '#006632', '#815500'],
      disableForReducedMotion: false
    })
  }, [])

  // Action handlers
  const handlePlaceAnother = () => {
    resetDraft()
    sessionStorage.removeItem('tks_last_submitted_order_id')
    navigate('/')
  }

  const handleViewPastRequests = () => {
    navigate('/enquiries')
  }

  // Display details resolved from store or fallback
  const displayId = storeOrder?.orderId ? storeOrder.orderId.replace(/^#/, '') : 'TKS-84920'
  const displayOccasion = storeOrder?.eventType || 'Griha Pravesh'
  const guestCount = storeOrder?.guestCount || 100
  const itemCount = storeOrder?.itemsCount || storeOrder?.itemsList?.length || 5
  const itemSummary = storeOrder?.itemsSummary || 'Puliyogare, Bisi Bele Bath, Melkote Huli, Mysore Pak, Filter Coffee'
  const totalAmount = storeOrder?.totalAmount || 28500
  const perPlate = storeOrder?.perPlateTotal || Math.round(totalAmount / (guestCount || 1)) || 285
  const customerName = storeOrder?.customerName || 'Srinivasa Raghavan'
  const rawPhone = storeOrder?.customerPhone || '9845012345'
  const displayPhone = rawPhone.length === 10 ? `+91 ${rawPhone.slice(0, 5)} ${rawPhone.slice(5)}` : `+91 ${rawPhone}`

  return (
    <div className="min-h-screen bg-[#fff8f6] text-[#281714] font-sans antialiased flex flex-col justify-between selection:bg-primary selection:text-white">
      {/* UNIFIED STICKY TOP NAVIGATION BAR */}
      <CustomerTopNav activeNavTab="enquiry" />

      {/* ================= MAIN CONTENT CANVAS ================= */}
      <main className="flex-grow w-full py-6 sm:py-8 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center justify-center relative">
        {/* Subtle Ambient Radial Backdrops for Glass Refraction */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-br from-amber-400/12 via-[#8B0A00]/6 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        {/* Progressive 3-Step Stepper (All Completed & Non-interactive) */}
        <div className="w-full max-w-4xl mx-auto mb-4 relative z-10">
          <BookingStepper currentStep={4} isInteractive={false} />
        </div>

        {/* Central High-Fidelity Confirmation Container (max-w-4xl) */}
        <div className="w-full max-w-4xl mx-auto bg-surface-container-lowest/85 backdrop-blur-xl rounded-3xl border border-[#EADBC8]/90 shadow-[0_16px_48px_-12px_rgba(107,8,0,0.10)] p-5 sm:p-7 md:p-8 relative overflow-hidden ring-1 ring-white/80 z-10">
          
          {/* Ornate Gold Corner Accents */}
          <div className="absolute top-3.5 left-3.5 w-4 h-4 border-t-2 border-l-2 border-amber-500/40 rounded-tl pointer-events-none"></div>
          <div className="absolute top-3.5 right-3.5 w-4 h-4 border-t-2 border-r-2 border-amber-500/40 rounded-tr pointer-events-none"></div>

          {/* Top Decorative Subtle Background Accents */}
          <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-amber-400/15 blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-[#8B0A00]/8 blur-2xl pointer-events-none"></div>

          {/* Top Header Strip - Clean & Dignified */}
          <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-outline-variant/30">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-[#EADBC8] text-primary font-bold text-xs tracking-wider shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                #{displayId}
              </span>
              <span className="text-xs font-serif italic text-on-surface-variant hidden sm:inline-block">
                TKS Heritage Banquet Desk
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-900 border border-amber-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> 100% Pure Veg
            </span>
          </div>

          {/* Hero Auspicious Confirmation Section */}
          <div className="text-center pt-5 pb-5 px-2 flex flex-col items-center">
            {/* Royal Mysore Heritage Emblem Seal */}
            <div className="relative w-14 h-14 mx-auto mb-3 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md pointer-events-none"></div>
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#8B0A00] via-[#5C0A04] to-[#3B0502] border-2 border-amber-400/80 shadow-md shadow-amber-950/25 flex items-center justify-center ring-2 ring-amber-300/30">
                <Check className="w-7 h-7 text-[#F5DB9C] stroke-[2.5]" />
              </div>
            </div>

            {/* Headline & Warm Copy */}
            <h1 className="font-serif text-3xl sm:text-4xl text-primary text-center font-bold tracking-tight mb-1.5">
              Request Received
            </h1>
            <p className="font-serif italic text-xs sm:text-sm md:text-base text-on-surface-variant max-w-xl text-center leading-relaxed">
              &ldquo;Namaskara! Our catering team will contact you within 24 hours to curate your auspicious banquet feast.&rdquo;
            </p>
          </div>

          {/* Two-Column Cards Grid: Celebration Summary (Left) & Concierge (Right) with Royal Frosted Glass */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-1">
            
            {/* CARD A (Left): Celebration Summary (Royal Frosted Glass) */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#EADBC8]/90 shadow-[0_8px_24px_-4px_rgba(107,8,0,0.06)] ring-1 ring-white/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Celebration Summary
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-medium">Order Desk Verified</span>
                </div>

                {/* Details List */}
                <dl className="divide-y divide-outline-variant/20 text-xs sm:text-sm mt-1">
                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <dt className="text-on-surface-variant font-medium">Occasion</dt>
                    <dd className="font-semibold text-on-surface text-right">{displayOccasion}</dd>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <dt className="text-on-surface-variant font-medium">Muhurtham Date</dt>
                    <dd className="font-semibold text-on-surface text-right">
                      {storeOrder?.eventDate && isValid(parseISO(storeOrder.eventDate))
                        ? format(parseISO(storeOrder.eventDate), 'EEEE, dd MMMM yyyy')
                        : (storeOrder?.eventDate || 'Friday, 27 November 2026')}
                      <span className="text-on-surface-variant text-[11px] block font-normal">
                        ({storeOrder?.eventTime || 'Morning'} Service{storeOrder?.specificTime ? ` • ${storeOrder.specificTime}` : ''})
                      </span>
                    </dd>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <dt className="text-on-surface-variant font-medium">Scale &amp; Seating</dt>
                    <dd className="font-semibold text-on-surface text-right">
                      {guestCount} Plantain Leaves
                      <span className="text-primary text-[11px] block font-normal">(Traditional Leaf Dining)</span>
                    </dd>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <dt className="text-on-surface-variant font-medium">Curated Delicacies</dt>
                    <dd className="font-semibold text-on-surface text-right max-w-[200px] leading-snug">
                      {itemCount} Traditional Items
                      <span className="text-[11px] text-on-surface-variant block font-normal truncate" title={itemSummary}>
                        ({itemSummary})
                      </span>
                    </dd>
                  </div>
                </dl>

                {/* Customer Contact Footnote */}
                <div className="mt-3 pt-2.5 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Host: <strong className="text-on-surface font-semibold">{customerName}</strong></span>
                  <span className="text-on-surface font-medium">{displayPhone}</span>
                </div>
              </div>

              {/* Investment Callout Bar */}
              <div className="mt-3.5 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#880000] via-[#6e0503] to-[#45070B] text-white border border-amber-400/40 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-200 block">
                    Estimated Feast Total
                  </span>
                  <span className="text-xs text-amber-100/80 font-normal">
                    ₹{perPlate}/plate
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-200 tracking-tight">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* CARD B (Right): Direct Kitchen Concierge & Fast Actions (Royal Frosted Glass) */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#EADBC8]/90 shadow-[0_8px_24px_-4px_rgba(107,8,0,0.06)] ring-1 ring-white/80 flex flex-col justify-between space-y-4">
              <div>
                {/* Concierge Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>Direct Kitchen Concierge</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-900 text-[10px] font-bold border border-amber-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span> Active Desk
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-3.5">
                  Need urgent muhurtham adjustments within 48h? Connect directly with our Mysuru head supervisor.
                </p>

                {/* Direct Contact Buttons */}
                <div className="space-y-2.5">
                  {/* Phone Button */}
                  <a 
                    className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#880000] via-[#9E1C24] to-[#630C13] hover:from-[#9E1C24] hover:to-[#750E17] text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm tracking-wide transition-all shadow-sm active:scale-[0.99] border border-amber-400/30" 
                    href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}
                  >
                    <PhoneCall className="w-4 h-4 text-amber-200" />
                    <span>Call Kitchen: {settings.phone}</span>
                  </a>

                  {/* WhatsApp Button */}
                  <a 
                    className="w-full flex items-center justify-center gap-2 bg-white/90 hover:bg-white border border-[#EADBC8] hover:border-amber-400/50 text-on-surface font-semibold py-2.5 px-3 rounded-xl text-xs transition-all shadow-2xs active:scale-[0.99] backdrop-blur-xs" 
                    href={`https://wa.me/${(settings.mobile || settings.phone).replace(/\D/g, '')}`} 
                    rel="noopener noreferrer" 
                    target="_blank"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-700" />
                    <span>WhatsApp {settings.businessName.split(' ')[0] || 'Catering'} Desk</span>
                  </a>
                </div>
              </div>

              {/* Fast Navigation Actions */}
              <div className="pt-3 border-t border-outline-variant/30 space-y-1.5">
                <span className="text-[10px] font-bold text-on-surface-variant block uppercase tracking-wider">Fast Actions</span>
                
                {/* Primary Action: View My Past Requests */}
                <button 
                  type="button"
                  onClick={handleViewPastRequests}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/90 hover:bg-white border border-[#EADBC8]/80 hover:border-primary/40 text-xs text-on-surface font-medium transition-all group cursor-pointer shadow-2xs backdrop-blur-xs"
                >
                  <span className="group-hover:text-primary transition-colors flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>View Past Requests</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Secondary Action: Place Another Catering Request */}
                <button 
                  type="button"
                  onClick={handlePlaceAnother}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/90 hover:bg-white border border-[#EADBC8]/80 hover:border-primary/40 text-xs text-on-surface font-medium transition-all group cursor-pointer shadow-2xs backdrop-blur-xs"
                >
                  <span className="group-hover:text-primary transition-colors flex items-center gap-2">
                    <PlusCircle className="w-3.5 h-3.5 text-primary" />
                    <span>Place Another Catering Request</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

          </div>

          {/* Sacred Quality Guarantee Footer Banner */}
          <div className="mt-5 pt-3.5 border-t border-outline-variant/30 text-center">
            <p className="font-headline text-xs sm:text-sm text-primary tracking-wide flex items-center justify-center gap-2 flex-wrap font-semibold">
              <span className="flex items-center gap-1"><Leaf className="w-3.5 h-3.5 text-tertiary-container" /> 100% Sattvic</span>
              <span className="text-outline-variant/60">•</span>
              <span>Pure Cow Ghee</span>
              <span className="text-outline-variant/60">•</span>
              <span>Estd. 1984</span>
              <span className="text-outline-variant/60">•</span>
              <span className="text-primary font-semibold">Mysuru Heritage Banquet</span>
            </p>
          </div>

        </div>
      </main>

      {/* ================= FOOTER (Shared Component) ================= */}
      <AppFooter />

    </div>
  )
}

export default SubmittedPage
