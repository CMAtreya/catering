import React, { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { format, parseISO, isValid } from 'date-fns'

import { useDraftStore } from '@/store/draftStore'
import { useEnquiryStore } from '@/store/enquiryStore'

export const SubmittedPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const resetDraft = useDraftStore((state) => state.resetDraft)

  // Retrieve submitted order ID from location state or session storage
  const stateOrderId = location.state?.orderId as string | undefined
  const sessionOrderId = typeof window !== 'undefined' ? sessionStorage.getItem('tks_last_submitted_order_id') : null
  const targetOrderId = stateOrderId || sessionOrderId

  const storeOrder = useEnquiryStore((state) => 
    targetOrderId ? state.getEnquiryById(targetOrderId) : state.enquiries[0]
  )

  // Celebratory confetti on mount - fires smoothly across all devices
  useEffect(() => {
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

  // Panchanga and Kannada helpers
  const getPanchangaDetails = (dateStr?: string) => {
    if (!dateStr) return { display: '18 Nov 2025', tithi: 'Karthika Somavara Feast' }
    try {
      const d = parseISO(dateStr)
      if (!isValid(d)) return { display: dateStr, tithi: 'Shubha Muhurtham Feast' }
      const display = format(d, 'dd MMM yyyy')
      const dayName = format(d, 'EEEE')
      const dayKannadaMap: Record<string, string> = {
        Monday: 'Somavara',
        Tuesday: 'Mangalavara',
        Wednesday: 'Budhavara',
        Thursday: 'Guruvara',
        Friday: 'Shukravara',
        Saturday: 'Shanivara',
        Sunday: 'Bhanuvara'
      }
      const kannadaDay = dayKannadaMap[dayName] || dayName
      return {
        display,
        tithi: `Karthika ${kannadaDay} Feast`
      }
    } catch {
      return { display: dateStr, tithi: 'Shubha Muhurtham Feast' }
    }
  }

  const getOccasionKannada = (eventType?: string) => {
    const normalized = (eventType || '').toLowerCase()
    if (normalized.includes('griha') || normalized.includes('housewarming')) return 'ಗೃಹ ಪ್ರವೇಶ'
    if (normalized.includes('pooja') || normalized.includes('homa')) return 'ಪೂಜಾ / ಹೋಮ'
    if (normalized.includes('wed') || normalized.includes('kalyana') || normalized.includes('muhurtham')) return 'ಕಲ್ಯಾಣ ಮಹೋತ್ಸವ'
    if (normalized.includes('upanayana') || normalized.includes('thread')) return 'ಉಪನಯನ'
    if (normalized.includes('birth') || normalized.includes('seemantha') || normalized.includes('shower')) return 'ಸೀಮಂತ & ಆಯುಷ್ಯ'
    return 'ಕುಟುಂಬ ಸಮಾರಂಭ'
  }

  // Display details resolved from store or fallback
  const displayId = storeOrder?.orderId ? storeOrder.orderId.replace(/^#/, '') : 'TKS-84920'
  const displayOccasion = storeOrder?.eventType || 'Griha Pravesh'
  const occasionKannada = getOccasionKannada(displayOccasion)
  const panchanga = getPanchangaDetails(storeOrder?.eventDate)
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
      
      {/* ================= TOP APP BAR (Shared Component) ================= */}
      <header className="bg-surface/85 backdrop-blur-md text-primary sticky top-0 z-50 shadow-xs border-b border-outline-variant/60">
        <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-7xl mx-auto h-20">
          {/* Brand Logo & Monogram */}
          <Link to="/" className="flex items-center gap-3.5 group transition-transform active:scale-95 duration-150">
            <img 
              alt="TKS Iyengar's Authentic Iyengar Catering Logo" 
              className="h-12 sm:h-14 w-auto object-contain drop-shadow-xs group-hover:scale-102 transition-transform duration-200" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqhyrR75tNmAhWEsCEMO6QDlHs95Ugrby715Ri87TvgLaNrFo-wxt2PpETGVHM9uxS2K854cOt0YSuYJ2cT8RGwuaeX2gEvZtBt-I7yrSTrHHlYDmHVZ45RQa80lUJhHLWHMcjxcflJrEF37nvVsi8Me6QkzJSi6Miq-0YZsavv62Xx4DKPgkTpMv3V-VXVoy0cG7LV-AJY99CmZATrtbakjp9uXhivZ2Ol_8mROH2n3f-a1vRayyr"
            />
            <div className="flex flex-col">
              <span className="font-headline font-semibold text-lg sm:text-xl text-primary tracking-wide leading-none">
                TKS Iyengar's Catering
              </span>
              <span className="text-[11px] font-medium text-on-surface-variant flex items-center gap-1.5 mt-1 tracking-tight">
                <span className="inline-block w-2.5 h-2.5 rounded-xs border border-tertiary-container flex items-center justify-center p-[1px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container block"></span>
                </span>
                Mysuru Tradition • Estd. 1984
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/#tradition" className="text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low px-2 py-1 rounded-lg">
              Tradition
            </Link>
            <Link to="/#menus" className="text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low px-2 py-1 rounded-lg">
              Catering Menus
            </Link>
            <Link to="/#muhurtham" className="text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low px-2 py-1 rounded-lg">
              Muhurtham Feasts
            </Link>
            <Link to="/enquiries" className="text-primary border-b-2 border-primary pb-1 font-semibold">
              Enquiry
            </Link>
          </nav>

          {/* Trailing Action Cluster */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center bg-surface-container-low rounded-full px-3.5 py-1.5 border border-outline-variant/50 focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-outline text-lg mr-2">search</span>
              <input 
                className="bg-transparent border-none text-xs sm:text-sm focus:outline-none focus:ring-0 p-0 placeholder-on-surface-variant/70 text-on-surface w-40" 
                placeholder="Search Muhurtham menus..." 
                type="text"
              />
            </div>
            <Link 
              to="/request" 
              aria-label="Auspicious Calendar" 
              className="p-2.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all duration-200 active:scale-95 flex items-center justify-center"
            >
              <span className="material-symbols-outlined">calendar_month</span>
            </Link>
            <Link 
              to="/" 
              aria-label="Banqueting Bag" 
              className="relative p-2.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all duration-200 active:scale-95 flex items-center justify-center"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-surface"></span>
            </Link>
            <Link 
              to="/request" 
              className="ml-2 bg-gradient-to-r from-[#8B0A00] via-[#E0000F] to-[#8B0A00] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-transform duration-150 flex items-center gap-2"
            >
              <span>Plan Event Banquet</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT CANVAS ================= */}
      <main className="flex-grow w-full py-10 md:py-12 px-4 sm:px-6 max-w-7xl mx-auto flex items-center justify-center">
        {/* Central High-Fidelity Confirmation Container (max-w-4xl) */}
        <div className="w-full max-w-4xl mx-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-lg p-6 sm:p-8 md:p-12 relative overflow-hidden">
          
          {/* Top Decorative Rangoli/Kalasam Subtle Background Accent */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-surface-container-high/40 blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none"></div>

          {/* Top Header & Enquiry Status Badge */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-outline-variant/40">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3.5 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/80 text-primary font-semibold text-xs sm:text-sm tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                #{displayId}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-semibold">
                Request submitted! • Muhurtham Banqueting Desk
              </span>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant text-xs sm:text-sm">
              <span className="material-symbols-outlined text-tertiary-container text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <span>Mysuru Kitchen Assigned</span>
            </div>
          </div>

          {/* Hero Auspicious Icon & Confirmation Heading */}
          <div className="text-center py-8 px-2 sm:px-4 flex flex-col items-center">
            {/* Auspicious green animated/styled checkmark circle emblem with sacred rings */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-tertiary-fixed/40 flex items-center justify-center">
                <div className="w-18 h-18 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center shadow-lg border-2 border-surface-container-lowest">
                  <span className="material-symbols-outlined text-4xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check
                  </span>
                </div>
              </div>
              {/* Sacred decorative ring indicators */}
              <div 
                className="absolute inset-0 rounded-full border-2 border-dashed border-tertiary-container/30 animate-spin" 
                style={{ animationDuration: '24s' }}
              ></div>
            </div>

            {/* Headline & Warm Copy */}
            <h1 className="font-headline text-3xl sm:text-4xl text-primary text-center font-bold tracking-tight mb-3">
              Request received 🙏
            </h1>
            <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl text-center leading-relaxed mb-4">
              Namaskara! Our catering team will contact you within 24 hours to curate your auspicious banquet feast.
            </p>

            {/* SMS Notice Pill */}
            <div className="inline-flex items-center gap-2.5 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/60 text-on-surface text-xs sm:text-sm">
              <span className="material-symbols-outlined text-primary text-lg">sms</span>
              <span>
                SMS confirmation sent to registered mobile <strong className="font-semibold text-on-surface">{displayPhone}</strong>
              </span>
            </div>
          </div>

          {/* Two-Column Cards Grid: Enquiry Summary (Left) & Direct Kitchen Contact (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            
            {/* CARD A (Left): Enquiry Summary (Received) */}
            <div className="bg-surface-container-low/70 rounded-2xl p-6 border border-outline-variant/70 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-outline-variant/50">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">receipt_long</span>
                    <h3 className="font-semibold text-base sm:text-lg text-on-surface">Enquiry Summary (Received)</h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold">
                    Pure Veg
                  </span>
                </div>

                {/* Details List with Sacred South Indian Visual Cues */}
                <ul className="divide-y divide-outline-variant/30 mt-3 text-xs sm:text-sm">
                  <li className="py-3 flex justify-between items-start gap-4">
                    <span className="text-on-surface-variant flex items-center gap-1.5 shrink-0">
                      <span className="material-symbols-outlined text-base text-secondary">celebration</span>
                      Occasion:
                    </span>
                    <div className="text-right">
                      <span className="font-semibold text-on-surface block">{displayOccasion}</span>
                      <span className="text-secondary font-medium text-xs block">({occasionKannada})</span>
                    </div>
                  </li>

                  <li className="py-3 flex justify-between items-start gap-4">
                    <span className="text-on-surface-variant flex items-center gap-1.5 shrink-0">
                      <span className="material-symbols-outlined text-base text-secondary">event</span>
                      Auspicious Date:
                    </span>
                    <div className="text-right">
                      <span className="font-semibold text-on-surface block">{panchanga.display}</span>
                      <span className="text-on-surface-variant text-xs block">({panchanga.tithi})</span>
                    </div>
                  </li>

                  <li className="py-3 flex justify-between items-start gap-4">
                    <span className="text-on-surface-variant flex items-center gap-1.5 shrink-0">
                      <span className="material-symbols-outlined text-base text-secondary">restaurant</span>
                      Catering Plates:
                    </span>
                    <div className="text-right">
                      <span className="font-semibold text-on-surface block">{guestCount} Plates</span>
                      <span className="text-tertiary-container text-xs block font-medium">(Pure Plantain Leaf)</span>
                    </div>
                  </li>

                  <li className="py-3 flex justify-between items-start gap-4">
                    <span className="text-on-surface-variant flex items-center gap-1.5 shrink-0">
                      <span className="material-symbols-outlined text-base text-secondary">soup_kitchen</span>
                      Curated Feasts:
                    </span>
                    <div className="text-right max-w-[210px] leading-snug">
                      <span className="font-semibold text-on-surface block">{itemCount} items</span>
                      <span className="text-xs text-on-surface-variant block font-normal">({itemSummary})</span>
                    </div>
                  </li>

                  <li className="py-3 flex justify-between items-start gap-4">
                    <span className="text-on-surface-variant flex items-center gap-1.5 shrink-0">
                      <span className="material-symbols-outlined text-base text-secondary">payments</span>
                      Estimated Food Total:
                    </span>
                    <div className="text-right">
                      <span className="font-headline font-bold text-lg sm:text-xl text-primary">₹{totalAmount.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-on-surface-variant block font-normal">(₹{perPlate}/leaf service • Zero advance needed)</span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Customer Contact Footnote */}
              <div className="mt-4 pt-3 border-t border-outline-variant/50 flex items-center gap-2.5 bg-surface-container-lowest/80 p-3 rounded-xl border border-outline-variant/40">
                <span className="material-symbols-outlined text-primary text-xl shrink-0">person_check</span>
                <div className="text-xs min-w-0">
                  <span className="text-on-surface-variant block">Customer Contact:</span>
                  <span className="font-semibold text-on-surface truncate block">{customerName} ({displayPhone} Verified)</span>
                </div>
              </div>
            </div>

            {/* CARD B (Right): Urgent Assistance & Fast Navigation Actions */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/70 shadow-xs flex flex-col justify-between">
              <div>
                {/* Banner: Need it urgently? Call us */}
                <div className="bg-surface-container-high/60 rounded-xl p-4 border border-outline-variant/60 mb-5">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm sm:text-base mb-1">
                    <span className="material-symbols-outlined text-primary">timer</span>
                    Need it urgently? Call us
                  </div>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    For auspicious dates within 48 hours or instant kitchen consultation with our head supervisor.
                  </p>
                </div>

                {/* Direct Contact Buttons */}
                <div className="space-y-3 mb-6">
                  {/* Phone Button */}
                  <a 
                    className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#8B0A00] via-[#E0000F] to-[#8B0A00] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md active:scale-98 transition-transform duration-150" 
                    href="tel:+918212448920"
                  >
                    <span className="material-symbols-outlined text-xl">phone_in_talk</span>
                    <span>Call Kitchen: +91 821 244 8920</span>
                  </a>

                  {/* WhatsApp Button */}
                  <a 
                    className="w-full flex items-center justify-center gap-2.5 bg-surface-container-low border border-outline-variant text-on-surface py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm hover:bg-surface-container-high transition-colors active:scale-98" 
                    href="https://wa.me/918212448920" 
                    rel="noopener noreferrer" 
                    target="_blank"
                  >
                    <span className="material-symbols-outlined text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                      chat
                    </span>
                    <span>Or WhatsApp our Catering Prabandhakar</span>
                  </a>
                </div>
              </div>

              {/* Fast Navigation Actions */}
              <div className="pt-4 border-t border-outline-variant/40 space-y-2.5">
                <span className="text-[11px] font-semibold text-on-surface-variant block uppercase tracking-wider">Fast Actions</span>
                
                {/* Primary Action: View My Past Requests */}
                <button 
                  type="button"
                  onClick={handleViewPastRequests}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-xs sm:text-sm transition-colors border border-outline-variant/50 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                    View My Past Requests
                  </span>
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>

                {/* Secondary Ghost Action: Place Another Catering Request */}
                <button 
                  type="button"
                  onClick={handlePlaceAnother}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-low font-medium text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    Place Another Catering Request
                  </span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>

          </div>

          {/* Sacred Quality Guarantee Footer Banner */}
          <div className="mt-8 pt-6 border-t border-outline-variant/40 text-center">
            <p className="font-headline text-sm sm:text-base text-primary tracking-wide flex items-center justify-center gap-2 flex-wrap font-semibold">
              <span>🌿 100% Sattvic</span>
              <span className="text-outline-variant">•</span>
              <span>Pure Cow Ghee</span>
              <span className="text-outline-variant">•</span>
              <span>Estd. 1984</span>
              <span className="text-outline-variant">•</span>
              <span>Mysuru</span>
            </p>
          </div>

        </div>
      </main>

      {/* ================= FOOTER (Shared Component) ================= */}
      <footer className="w-full bg-surface-container-low border-t border-outline-variant/50 mt-12 transition-colors duration-150">
        <div className="w-full px-4 md:px-8 py-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand & Heritage Note */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
            <span className="font-headline text-lg sm:text-xl font-semibold text-primary">
              TKS Iyengar's Catering
            </span>
            <p className="text-xs text-on-surface-variant max-w-md">
              © 2025 TKS Iyengar's Catering Services, Mysuru. Pure Vegetarian Tradition &amp; Heritage Feasts. All rights reserved.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-xs font-medium text-center">
            <Link to="/#tradition" className="text-on-surface-variant hover:text-primary transition-colors">
              Sacred Menu Heritage
            </Link>
            <Link to="/#muhurtham" className="text-on-surface-variant hover:text-primary transition-colors">
              Muhurtham Packages
            </Link>
            <Link to="/#tradition" className="text-on-surface-variant hover:text-primary transition-colors">
              Purity Guarantee
            </Link>
            <Link to="/#tradition" className="text-on-surface-variant hover:text-primary transition-colors">
              Temple Tradition
            </Link>
            <Link to="/enquiries" className="text-primary font-semibold hover:underline transition-colors">
              Enquire for Banquets
            </Link>
            <Link to="/privacy-policy" className="text-on-surface-variant hover:text-primary transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default SubmittedPage
