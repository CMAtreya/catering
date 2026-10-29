import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { 
  ArrowLeft, 
  ChevronDown, 
  AlertCircle, 
  RefreshCw, 
  Calendar, 
  MapPin, 
  FileText, 
  UtensilsCrossed,
  Sparkles
} from 'lucide-react'

import { useDraftStore } from '@/store/draftStore'
import { useEnquiryStore } from '@/store/enquiryStore'
import { submitEnquiry } from '@/api'
import { formatRupees, formatEventDate, isValidIndianPhone, cleanIndianPhone } from '@/lib/format'
import { Input } from '@/components/ui/input'
import { CustomerDesktopShell } from '@/components/customer/CustomerDesktopShell'
import { PageTransition } from '@/components/motion/PageTransition'

export const ContactPage: React.FC = () => {
  const navigate = useNavigate()

  // Store data & actions
  const items = useDraftStore((state) => state.items)
  const requirements = useDraftStore((state) => state.requirements)
  const contact = useDraftStore((state) => state.contact)
  const setContact = useDraftStore((state) => state.setContact)
  const getPerPlateTotal = useDraftStore((state) => state.getPerPlateTotal)
  const addEnquiry = useEnquiryStore((state) => state.addEnquiry)

  const selectedItemsList = Object.values(items)
  const selectedCount = selectedItemsList.length

  // Pricing calculations
  const perPlateTotal = getPerPlateTotal()
  const guestCount = typeof requirements.guestCount === 'number' && requirements.guestCount > 0 ? requirements.guestCount : 100
  const estimatedTotal = perPlateTotal * guestCount


  // Form states
  const [customerName, setCustomerName] = useState<string>(contact.name || '')
  const [customerPhone, setCustomerPhone] = useState<string>(contact.phone || '')

  // Inline errors & submission states
  const [nameError, setNameError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [shakeKey, setShakeKey] = useState<number>(0)

  // Collapsed accordion state
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false)

  // Handle phone input allowing only digits and max 10
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 10)
    setCustomerPhone(rawVal)
    if (rawVal.length === 10 && isValidIndianPhone(rawVal)) {
      setPhoneError(null)
    }
    if (submissionError) setSubmissionError(null)
  }

  // Handle name input
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerName(e.target.value)
    if (e.target.value.trim().length >= 2) {
      setNameError(null)
    }
    if (submissionError) setSubmissionError(null)
  }

  // Submission handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSubmitting) return

    // Validation
    let hasError = false

    const trimmedName = customerName.trim()
    if (!trimmedName) {
      setNameError('Customer name is required')
      hasError = true
    } else if (trimmedName.length < 2) {
      setNameError('Please enter your full name')
      hasError = true
    } else {
      setNameError(null)
    }

    const cleanedPhone = cleanIndianPhone(customerPhone)
    if (!customerPhone) {
      setPhoneError('Mobile number is required')
      hasError = true
    } else if (!isValidIndianPhone(cleanedPhone) || customerPhone.length !== 10) {
      setPhoneError('Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9')
      hasError = true
    } else {
      setPhoneError(null)
    }

    if (hasError) return

    // OFFLINE RULE: submitting offline must FAIL clearly with the retry banner from C3
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSubmissionError('We could not send your request. Please check your connection and try again.')
      setShakeKey((k) => k + 1)
      return
    }

    // Clear previous error
    setSubmissionError(null)
    setIsSubmitting(true)

    try {
      // Update contact details in draft store
      setContact({
        name: trimmedName,
        phone: cleanedPhone
      })

      // Call API
      const newOrder = await submitEnquiry({
        customerName: trimmedName,
        customerPhone: cleanedPhone,
        eventDate: requirements.eventDate,
        eventTime: requirements.eventTime || 'Morning',
        eventType: requirements.eventType,
        guestCount: guestCount,
        venueAddress: requirements.venueAddress,
        notes: requirements.notes,
        items: selectedItemsList.map((item) => ({
          id: item.id,
          name: item.name,
          pricePerPlate: item.pricePerPlate,
          quantity: 1
        })),
        perPlateTotal: perPlateTotal,
        totalAmount: estimatedTotal
      })

      // SUCCESS: Only after API confirms, save a copy to local enquiry history
      addEnquiry({
        orderId: newOrder.id,
        createdAt: newOrder.createdAt,
        eventDate: newOrder.eventDate,
        eventTime: newOrder.eventTime,
        eventType: newOrder.eventType,
        guestCount: newOrder.guestCount,
        totalAmount: newOrder.totalAmount,
        status: newOrder.status,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        itemsCount: newOrder.items.length,
        itemsSummary: newOrder.items.map((i) => i.name).join(', '),
        itemsList: newOrder.items,
        perPlateTotal: newOrder.perPlateTotal,
        venueAddress: newOrder.venueAddress,
        notes: newOrder.notes
      })

      // Store in session storage for reliable retrieval on /submitted
      sessionStorage.setItem('tks_last_submitted_order_id', newOrder.id)

      // Go to /submitted
      navigate('/submitted', { state: { orderId: newOrder.id } })
    } catch (err: unknown) {
      // FAILURE: stay on this page, do NOT save to history, do NOT go to /submitted
      setSubmissionError('We could not send your request. Please check your connection and try again.')
      setShakeKey((k) => k + 1)
    } finally {
      setIsSubmitting(false)
    }
  }

  const shouldReduceMotion = useReducedMotion()



  return (
    <CustomerDesktopShell maxWidth="w-full">
      <div className="w-full flex flex-col bg-transparent relative min-h-screen">
        
        {/* ==========================================================
            TOP BAR (glass)
            Back arrow, 'Your contact details', 'Step 3 of 3'
            ========================================================== */}
        <header className="sticky top-0 z-10 glass-top-bar px-4 sm:px-6 lg:px-8 xl:px-12 py-3 transition-all border-b border-slate-200/80">
          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/request')}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all tap-target-48 text-[var(--text-primary)] -ml-1 cursor-pointer"
                aria-label="Back to event requirements"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <div>
                <h1 className="font-serif font-bold text-base sm:text-lg lg:text-xl text-[var(--brand-900)] tracking-tight leading-tight">
                  Your contact details
                </h1>
                <p className="text-[11px] text-[var(--text-muted)] font-semibold leading-none pt-0.5">
                  Step 3 of 3 • Final confirmation & submission
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[var(--brand-soft)] text-[var(--brand)] border border-[var(--brand-200)]">
                Step 3 of 3
              </span>
            </div>
          </div>
        </header>

        {/* Step 3 Progress Line: fills to 100% */}
        <div className="w-full bg-slate-100 h-1 overflow-hidden sticky top-[58px] z-10">
          <motion.div
            className="h-full bg-[var(--brand)]"
            initial={shouldReduceMotion ? { width: '100%' } : { width: '50%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* ==========================================================
            MAIN CONTENT AREA
            - Red error banner if submission failed (gentle shake on retry)
            - Solid Card with exactly 2 fields: Name & Mobile
            - Read-only Accordion 'Request summary'
            ========================================================== */}
        <PageTransition direction="forward">
          <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 w-full pt-6 pb-36 space-y-6">
            
            {/* Desktop Section Header */}
            <div className="hidden lg:block pb-2 border-b border-slate-200/60">
              <h2 className="font-serif font-bold text-2xl text-[var(--brand-900)] tracking-tight">
                Review & Confirm Catering Request
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-medium pt-0.5">
                Our catering manager will review your menu and call you to finalise timing and logistics.
              </p>
            </div>

            {/* Failure Alert Banner: gentle shake on error, no celebration */}
            {submissionError && (
              <motion.div
                key={shakeKey}
                initial={{ opacity: 0, y: -8 }}
                animate={shakeKey > 0 ? { opacity: 1, y: 0, x: [-6, 6, -4, 4, 0] } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="p-4 rounded-[20px] bg-[var(--status-cancelled-bg)] border border-[var(--status-cancelled-border)] text-[var(--status-cancelled-text)] shadow-sm space-y-2.5"
              >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[var(--status-cancelled-text)]" />
                <div className="flex-1">
                  <p className="font-bold text-xs sm:text-sm leading-snug">
                    We could not send your request. Please check your connection and try again.
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="px-4 py-2 rounded-full bg-[var(--status-cancelled-text)] text-white text-xs font-bold hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm tap-target-48"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Responsive 2-column layout on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left Column (lg:col-span-6): Contact information */}
            <div className="lg:col-span-6 space-y-4">
              {/* SOLID CARD: Exactly two fields */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', damping: 26, stiffness: 280 }}
                className="content-card p-4 sm:p-5 rounded-[20px] bg-white border border-slate-200/80 shadow-sm space-y-4"
              >
                <div>
                  <h2 className="font-heading font-black text-base text-[var(--text-primary)]">
                    Contact information
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] pt-0.5">
                    Our catering manager will contact you directly on this number to confirm details.
                  </p>
                </div>

                {/* Field 1: Customer name */}
                <div className="space-y-1.5">
                  <label htmlFor="customer-name" className="text-xs font-bold text-[var(--text-primary)] block">
                    Customer name <span className="text-[var(--brand)]">*</span>
                  </label>
                  <Input
                    id="customer-name"
                    type="text"
                    autoComplete="name"
                    value={customerName}
                    onChange={handleNameChange}
                    placeholder="Enter your full name"
                    className={`h-11 rounded-xl bg-white text-sm ${
                      nameError ? 'border-[var(--status-cancelled-text)] ring-1 ring-[var(--status-cancelled-text)]' : ''
                    }`}
                  />
                  {nameError && (
                    <p className="text-xs text-[var(--status-cancelled-text)] font-semibold flex items-center gap-1 pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{nameError}</span>
                    </p>
                  )}
                </div>

                {/* Field 2: Mobile number with +91 prefix chip */}
                <div className="space-y-1.5">
                  <label htmlFor="customer-phone" className="text-xs font-bold text-[var(--text-primary)] block">
                    Mobile number <span className="text-[var(--brand)]">*</span>
                  </label>

                  <div className="flex items-center">
                    {/* Fixed +91 prefix chip */}
                    <div className="h-11 px-3.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl flex items-center justify-center text-xs font-bold text-slate-700 shrink-0 select-none">
                      🇮🇳 +91
                    </div>

                    {/* Numeric keypad input */}
                    <Input
                      id="customer-phone"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      autoComplete="tel-national"
                      value={customerPhone}
                      onChange={handlePhoneChange}
                      placeholder="10-digit number (e.g. 9845012345)"
                      className={`h-11 rounded-r-xl rounded-l-none bg-white text-sm font-medium tracking-wide ${
                        phoneError ? 'border-[var(--status-cancelled-text)] ring-1 ring-[var(--status-cancelled-text)]' : ''
                      }`}
                    />
                  </div>

                  {phoneError ? (
                    <p className="text-xs text-[var(--status-cancelled-text)] font-semibold flex items-center gap-1 pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{phoneError}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-[var(--text-muted)] font-medium pt-0.5">
                      10 digits starting with 6, 7, 8, or 9
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Next Steps Guidance Card */}
              <div className="p-4 rounded-[20px] bg-white border border-slate-200/80 shadow-2xs space-y-2 text-xs text-slate-600">
                <h4 className="font-heading font-black text-xs text-[var(--brand-900)] uppercase tracking-wider">
                  Next Steps After Submission
                </h4>
                <ul className="space-y-1.5 text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>Our catering manager reviews dish availability & timings.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>You will receive a call within 24 hours to confirm.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>Your enquiry is permanently saved in &quot;My Enquiries&quot; on this browser.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column (lg:col-span-6): Request summary */}
            <div className="lg:col-span-6 space-y-4">
              {/* ==========================================================
                  COLLAPSED, READ-ONLY ACCORDION: 'Request summary'
                  Shows what will be submitted (items, occasion, date, plates,
                  address, instructions, estimate).
                  Only displays data already captured; adds no inputs.
                  ========================================================== */}
              <div className="content-card rounded-[20px] bg-white border border-slate-200/80 shadow-sm overflow-hidden transition-all">
                {/* Accordion Header / Toggle */}
                <button
                  type="button"
                  onClick={() => setIsSummaryOpen((prev) => !prev)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 active:bg-slate-100/70 transition-colors tap-target-48"
                  aria-expanded={isSummaryOpen}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-black text-sm sm:text-base text-[var(--text-primary)]">
                        Request summary
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        Read-only
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] font-medium">
                      {selectedCount} {selectedCount === 1 ? 'dish' : 'dishes'} • {guestCount} plates • {formatRupees(estimatedTotal)}
                    </p>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 transition-transform duration-200 ${
                      isSummaryOpen ? 'rotate-180 bg-[var(--brand-soft)] text-[var(--brand)]' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>

                {/* Accordion Expandable Content */}
                <AnimatePresence>
                  {isSummaryOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-4 overflow-hidden text-xs sm:text-sm"
                    >
                      {/* 1. Selected Dishes */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-[var(--brand)]" />
                          <span>Selected Items ({selectedCount})</span>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 border border-slate-100">
                          {selectedItemsList.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-0.5">
                              <span className="font-medium text-slate-800">{item.name}</span>
                              <span className="text-slate-500 font-semibold">{formatRupees(item.pricePerPlate)} / plate</span>
                            </div>
                          ))}
                          <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between font-bold">
                            <span>Price per plate</span>
                            <span className="text-[var(--brand-900)] font-black">{formatRupees(perPlateTotal)}</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Occasion & Date */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[var(--brand)]" />
                            Occasion
                          </span>
                          <p className="font-bold text-slate-800">{requirements.eventType}</p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[var(--brand)]" />
                            Occasion Date
                          </span>
                          <p className="font-bold text-slate-800">{formatEventDate(requirements.eventDate)}</p>
                        </div>
                      </div>

                      {/* 3. Number of Plates */}
                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-center justify-between">
                        <span className="font-semibold text-slate-600">Number of plates</span>
                        <span className="font-bold text-slate-900">{guestCount} plates (approx. {guestCount} meals)</span>
                      </div>

                      {/* 4. Delivery Address */}
                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[var(--brand)]" />
                          Delivery Address
                        </span>
                        <p className="font-medium text-slate-800 whitespace-pre-wrap">{requirements.venueAddress}</p>
                      </div>

                      {/* 5. Special Instructions */}
                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-[var(--brand)]" />
                          Special Instructions
                        </span>
                        <p className="font-medium text-slate-800 italic">
                          {requirements.notes && requirements.notes.trim() ? requirements.notes : 'None provided'}
                        </p>
                      </div>

                      {/* 6. Calculated Estimate */}
                      <div className="rounded-xl bg-[var(--brand-soft)] border border-[var(--brand-200)] p-3.5 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-[var(--brand-900)] block">
                            Estimated Food Total
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)]">
                            {formatRupees(perPlateTotal)} × {guestCount} plates
                          </span>
                        </div>
                        <span className="font-heading font-black text-lg sm:text-xl text-[var(--brand-900)]">
                          {formatRupees(estimatedTotal)}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>

        </main>
      </PageTransition>

        {/* ==========================================================
            STICKY BOTTOM BAR: Floating pill on all devices
            'Submit catering request'
            Morphs into progress ring while sending (no success motion until server confirms)
            ========================================================== */}
        <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] inset-x-3 sm:inset-x-4 md:inset-x-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-xl z-20 pointer-events-auto rounded-2xl sm:rounded-[22px] bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.06)] px-3.5 sm:px-6 py-2.5 sm:py-3.5">
            <button
              type="button"
              id="submit-contact-btn"
              disabled={isSubmitting}
              onClick={() => handleSubmit()}
              className={`h-11 sm:h-13 rounded-xl sm:rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] active:scale-[0.98] text-[var(--on-brand)] font-heading font-bold text-sm sm:text-base flex items-center justify-center shadow-md transition-all select-none tap-target-48 cursor-pointer ${
                isSubmitting ? 'w-11 sm:w-13 mx-auto px-0 cursor-wait' : 'w-full px-6 gap-2'
              }`}
            >
              {isSubmitting ? (
                <div 
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-3 border-white border-t-transparent animate-spin"
                  role="status"
                  aria-label="Submitting request..."
                />
              ) : (
                <span>Submit catering request</span>
              )}
            </button>
        </div>

      </div>
    </CustomerDesktopShell>
  )
}

export default ContactPage
