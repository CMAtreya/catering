import React, { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Phone, Calendar, Utensils, IndianRupee, Sparkles, ChevronRight } from 'lucide-react'
import confetti from 'canvas-confetti'

import { useDraftStore } from '@/store/draftStore'
import { useEnquiryStore } from '@/store/enquiryStore'
import { formatRupees, formatEventDate } from '@/lib/format'
import { InstallPromptCard } from '@/components/customer/InstallPromptCard'
import { CustomerDesktopShell } from '@/components/customer/CustomerDesktopShell'

export const SubmittedPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const resetDraft = useDraftStore((state) => state.resetDraft)

  // Retrieve submitted order ID from location state or session storage
  const stateOrderId = location.state?.orderId as string | undefined
  const sessionOrderId = typeof window !== 'undefined' ? sessionStorage.getItem('tks_last_submitted_order_id') : null
  const targetOrderId = stateOrderId || sessionOrderId

  const order = useEnquiryStore((state) => 
    targetOrderId ? state.getEnquiryById(targetOrderId) : undefined
  )

  // Guard: only reachable right after a successful submission (otherwise redirect to /)
  useEffect(() => {
    if (!targetOrderId || !order) {
      navigate('/', { replace: true })
    }
  }, [targetOrderId, order, navigate])

  // Fire celebratory brand confetti on mount (honour reduced motion)
  useEffect(() => {
    if (!targetOrderId || !order) return

    const prefersReducedMotion = 
      typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReducedMotion) {
      const brand = typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || 'var(--brand)' : 'var(--brand)'
      const brand2 = typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--brand-2').trim() || 'var(--brand-2)' : 'var(--brand-2)'
      // Elegant brand color burst
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.3 },
        colors: [brand, brand2, '#f59e0b', '#78350f', '#e11d48']
      })
    }
  }, [targetOrderId, order])

  const shouldReduceMotion = useReducedMotion()

  if (!targetOrderId || !order) {
    return null
  }

  // Handle back to menu: clear draft selection and navigate to /
  const handleBackToMenu = () => {
    resetDraft()
    sessionStorage.removeItem('tks_last_submitted_order_id')
    navigate('/')
  }

  return (
    <CustomerDesktopShell maxWidth="w-full" className="justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center space-y-6">
        
        {/* ==========================================================
            1. LOGO ON TOP
            ========================================================== */}
        <div className="w-16 h-16 rounded-2xl bg-white shadow-md p-2 flex items-center justify-center border border-slate-100">
          <img
            src="/logo-128.webp"
            alt="TKS Iyengars Logo"
            width="64"
            height="64"
            decoding="async"
            className="w-full h-full object-contain"
          />
        </div>

        {/* ==========================================================
            2. ANIMATED SUCCESS TICK
            Brand ring draws, check pops, 600ms (honours reduced motion)
            ========================================================== */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-20 h-20" viewBox="0 0 80 80" aria-label="Success checkmark">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r="36"
              className="stroke-slate-100"
              strokeWidth="4"
              fill="transparent"
            />
            {/* Brand ring draws */}
            <motion.circle
              cx="40"
              cy="40"
              r="36"
              stroke="var(--brand)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="color-mix(in srgb, var(--brand) 6%, transparent)"
              initial={shouldReduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.45, ease: 'easeOut' }}
            />
            {/* Check pops */}
            <motion.path
              d="M 24 41 L 35 52 L 56 31"
              fill="transparent"
              stroke="var(--brand)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={shouldReduceMotion ? false : { pathLength: 0, scale: 0.5, opacity: 0 }}
              animate={{ pathLength: 1, scale: 1, opacity: 1 }}
              transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.35, duration: 0.35, ease: 'backOut' }}
            />
          </svg>
        </div>

        {/* ==========================================================
            3. TITLE & SENTENCE
            'Request submitted!'
            'Our team will contact you within 24 hours to discuss your requirements.'
            ========================================================== */}
        <div className="space-y-1.5 px-2">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--brand-900)] tracking-tight">
            Request submitted!
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium max-w-sm mx-auto leading-relaxed">
            Our team will contact you within 24 hours to discuss your requirements.
          </p>
          <div className="pt-1">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
              Reference #{order.orderId}
            </span>
          </div>
        </div>

        {/* ==========================================================
            4. INVITATION CARD UNFOLD (CSS 3D rotateX + foil shimmer once)
            Occasion, occasion date, plates, estimated food total,
            with note: 'Estimate only. Delivery fees and customization charges may apply.'
            ========================================================== */}
        <motion.div
          initial={shouldReduceMotion ? false : { rotateX: -90, opacity: 0, scale: 0.95 }}
          animate={{ rotateX: 0, opacity: 1, scale: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.7, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ perspective: 1200, transformOrigin: 'top center' }}
          className="relative content-card p-5 sm:p-6 rounded-[24px] bg-white border border-slate-200/90 shadow-md w-full text-left space-y-4 overflow-hidden"
        >
          {/* Brand-tinted foil shimmer once */}
          {!shouldReduceMotion && (
            <div className="absolute inset-0 pointer-events-none foil-shimmer z-10 opacity-70" />
          )}

          <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
            <h2 className="font-serif font-bold text-base text-[var(--text-primary)]">
              Enquiry Summary
            </h2>
            <span className="text-xs font-bold text-[var(--brand)] px-2.5 py-0.5 rounded-full bg-[var(--brand-soft)] border border-[var(--brand-200)]">
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            {/* Occasion */}
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[var(--brand)]" />
                Occasion
              </span>
              <p className="font-bold text-[var(--text-primary)] leading-tight">
                {order.eventType}
              </p>
            </div>

            {/* Occasion date */}
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[var(--brand)]" />
                Occasion date
              </span>
              <p className="font-bold text-[var(--text-primary)] leading-tight">
                {formatEventDate(order.eventDate)}
              </p>
            </div>

            {/* Plates */}
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Utensils className="w-3 h-3 text-[var(--brand)]" />
                Plates
              </span>
              <p className="font-bold text-[var(--text-primary)] leading-tight">
                {order.guestCount} meals
              </p>
            </div>

            {/* Estimated food total */}
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-[var(--brand)]" />
                Estimated food total
              </span>
              <p className="font-heading font-black text-sm sm:text-base text-[var(--brand-900)] leading-tight">
                {formatRupees(order.totalAmount)}
              </p>
            </div>
          </div>

          {/* Note: exactly as specified */}
          <div className="border-t border-slate-100 pt-3">
            <p className="text-[11px] text-[var(--text-muted)] italic leading-normal">
              Estimate only. Delivery fees and customization charges may apply.
            </p>
          </div>
        </motion.div>

        {/* ==========================================================
            5. URGENT ORDER CARD (slides up in sequence after 1.15s)
            Heading 'Need it urgently?', text 'Call us now',
            Large pill button with phone icon and business number (+91 90000 00000)
            as tel: link so it opens phone dialler on mobile.
            ========================================================== */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 1.15, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full rounded-[22px] bg-[var(--brand-soft)] border border-[var(--brand-200)] p-5 text-left space-y-3.5 shadow-xs"
        >
          <div className="space-y-0.5">
            <h3 className="font-serif font-bold text-base text-[var(--brand-900)]">
              Need it urgently?
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium">
              Call us now
            </p>
          </div>

          <a
            href="tel:+919000000000"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[var(--on-brand)] font-bold text-sm shadow-md active:scale-[0.98] transition-all tap-target-48"
          >
            <Phone className="w-4 h-4 stroke-[2.5]" />
            <span>+91 90000 00000</span>
          </a>
        </motion.div>

        {/* ==========================================================
            6. INSTALL TO HOME SCREEN PROMPT CARD
            Shown only after a successful submission
            ========================================================== */}
        <InstallPromptCard />

        {/* ==========================================================
            7. ACTIONS
            Primary: 'Back to menu' (clears the draft selection)
            Text link: 'View my enquiries'
            ========================================================== */}
        <div className="w-full pt-2 space-y-3 flex flex-col items-center">
          <motion.button
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            type="button"
            onClick={handleBackToMenu}
            className="w-full h-12 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[var(--on-brand)] font-heading font-bold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 tap-target-48 cursor-pointer"
          >
            <span>Back to menu</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </motion.button>

          <Link
            to="/enquiries"
            className="text-xs sm:text-sm font-bold text-[var(--text-muted)] hover:text-[var(--brand)] hover:underline py-2 transition-colors tap-target-48 inline-flex items-center justify-center"
          >
            View my enquiries
          </Link>
        </div>

      </div>
    </CustomerDesktopShell>
  )
}

export default SubmittedPage
