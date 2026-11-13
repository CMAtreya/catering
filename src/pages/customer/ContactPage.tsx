import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { 
  AlertCircle,
  Building2,
  User,
  CheckCircle2,
  ArrowRight,
  Clock,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Edit3,
  PartyPopper,
  Calendar,
  Users,
  Leaf,
  Flame,
  UtensilsCrossed
} from 'lucide-react'
import { AppFooter } from '@/components/common/AppFooter'
import { BookingStepper } from '@/components/customer/BookingStepper'
import { CustomerTopNav } from '@/components/customer/CustomerTopNav'
import { format, parseISO, isValid } from 'date-fns'

import { useDraftStore } from '@/store/draftStore'
import { useEnquiryStore } from '@/store/enquiryStore'
import { useBusinessSettingsStore } from '@/store/businessSettingsStore'
import { submitEnquiry } from '@/api'
import { isValidIndianPhone, cleanIndianPhone } from '@/lib/format'
import { INITIAL_ITEMS } from '@/data/mockData'

export const ContactPage: React.FC = () => {
  const navigate = useNavigate()

  // Store data & actions
  const items = useDraftStore((state) => state.items)
  const requirements = useDraftStore((state) => state.requirements)
  const setRequirements = useDraftStore((state) => state.setRequirements)
  const contact = useDraftStore((state) => state.contact)
  const setContact = useDraftStore((state) => state.setContact)
  const resetDraft = useDraftStore((state) => state.resetDraft)
  const getPerPlateTotal = useDraftStore((state) => state.getPerPlateTotal)
  const addEnquiry = useEnquiryStore((state) => state.addEnquiry)
  const settings = useBusinessSettingsStore((state) => state.settings)

  const selectedItemsList = Object.values(items)
  const selectedCount = selectedItemsList.length
  const displayItems = selectedCount > 0 ? selectedItemsList : INITIAL_ITEMS.slice(0, 5)

  // Pricing calculations
  const rawPerPlate = getPerPlateTotal()
  const perPlateTotal = rawPerPlate > 0 ? rawPerPlate : 285
  const guestCount = typeof requirements.guestCount === 'number' && requirements.guestCount > 0 ? requirements.guestCount : 100
  const estimatedTotal = perPlateTotal * guestCount

  // Form states
  const [customerName, setCustomerName] = useState<string>(contact.name || '')
  const [customerPhone, setCustomerPhone] = useState<string>(contact.phone || '')
  const [specialRequests, setSpecialRequests] = useState<string>(requirements.notes || '')

  // Inline errors & submission states
  const [nameError, setNameError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Redirect guard: if user lands here with empty draft (e.g. after submission or manual URL entry)
  useEffect(() => {
    if (selectedCount === 0 && !requirements.eventType) {
      navigate('/', { replace: true })
    }
  }, [selectedCount, requirements.eventType, navigate])

  // Handle phone input allowing only digits up to 10
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
      setPhoneError('Enter a valid 10-digit Indian mobile number')
      hasError = true
    } else {
      setPhoneError(null)
    }

    if (hasError) return

    // OFFLINE RULE: submitting offline must FAIL clearly with the retry banner
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSubmissionError('We could not send your request. Please check your connection and try again.')
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

      if (specialRequests !== requirements.notes) {
        setRequirements({
          ...requirements,
          notes: specialRequests
        })
      }

      const itemsToSubmit = (selectedCount > 0 ? selectedItemsList : INITIAL_ITEMS.slice(0, 5)).map((item) => ({
        id: item.id,
        name: item.name,
        pricePerPlate: item.pricePerPlate,
        quantity: 1
      }))

      // Call API
      const newOrder = await submitEnquiry({
        customerName: trimmedName,
        customerPhone: cleanedPhone,
        eventDate: requirements.eventDate || format(new Date(), 'yyyy-MM-dd'),
        eventTime: requirements.eventTime || 'Morning',
        specificTime: requirements.specificTime,
        eventType: requirements.eventType || 'Griha Pravesh',
        guestCount: guestCount,
        venueAddress: requirements.venueAddress || 'Agrahara, Mysuru',
        notes: specialRequests,
        items: itemsToSubmit,
        perPlateTotal: perPlateTotal,
        totalAmount: estimatedTotal
      })

      // SUCCESS: Save copy to local enquiry store
      addEnquiry({
        orderId: newOrder.id,
        createdAt: newOrder.createdAt,
        eventDate: newOrder.eventDate,
        eventTime: newOrder.eventTime,
        specificTime: newOrder.specificTime,
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

      sessionStorage.setItem('tks_last_submitted_order_id', newOrder.id)
      resetDraft()
      navigate('/submitted', { state: { orderId: newOrder.id }, replace: true })
    } catch {
      // FAILURE: stay on this page, do NOT save to history, do NOT go to /submitted
      setSubmissionError('We could not send your request. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayOccasion = requirements.eventType || 'Griha Pravesh'

  const dotColors = [
    'bg-[#815500]',
    'bg-[#880000]',
    'bg-[#815500]',
    'bg-[#fdb647]',
    'bg-[#3f2c28]'
  ]

  const getTagline = (item: any, idx: number) => {
    if (item.tagline) return item.tagline
    if (item.heritageTag) return item.heritageTag
    const defaults = [
      'Crisp Nendran / Jackfruit fryums',
      'Mysuru royal spiced lentil rice',
      'Authentic temple-style sambar',
      'Melt-in-mouth pure ghee sweet',
      'Freshly frothed chicory blend'
    ]
    return defaults[idx % defaults.length]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.52,
        ease: [0.16, 1, 0.3, 1] // Fast in, slow out (deceleration curve)
      }}
      className="min-h-screen bg-[#fff8f6] text-[#281714] flex flex-col font-sans selection:bg-primary-fixed selection:text-primary"
    >
      {/* UNIFIED STICKY TOP NAVIGATION BAR */}
      <CustomerTopNav activeNavTab="enquiry" />

      {/* 3. MAIN CANVAS */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        
        {/* BREADCRUMB & STEPPER HEADER SECTION */}
        <div className="mb-8 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4 text-xs font-medium text-on-surface-variant">
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-secondary" />
              Mysuru Banquet Planning Service • Reference #TKSI-2025-894
            </span>
            <span className="text-secondary font-medium">Muhurtham Booking Guarantee</span>
          </div>

          {/* Progressive 3-Step Desktop Stepper */}
          <BookingStepper currentStep={3} />
        </div>

        {/* TWO COLUMN HIGH-FIDELITY LAYOUT (7 COLS / 5 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT COLUMN: Contact & Submission Form (7 cols) */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* Title & Subtitle Card */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-6 md:p-8 shadow-xs">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/80 text-primary text-xs font-semibold mb-4">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Final Verification Step
              </div>
              <h1 className="font-headline text-3xl sm:text-4xl text-primary font-bold tracking-tight mb-3">
                How can we reach you?
              </h1>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                Our chief catering prabandhakar will connect directly to honor your muhurtham timings and traditional leaf-service traditions.
              </p>

              {/* FORM CONTROLS */}
              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                
                {/* Full Name Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5" htmlFor="customer-name">
                      Host / Elder Full Name
                      <span className="text-primary font-bold">*</span>
                    </label>
                  </div>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      id="customer-name"
                      name="fullName"
                      data-testid="customer-name"
                      type="text"
                      placeholder="Enter full name"
                      value={customerName}
                      onChange={handleNameChange}
                      className={`block w-full pl-11 pr-4 py-3.5 bg-[#FFF9F0] border ${
                        nameError ? 'border-red-500 focus:ring-red-500' : 'border-outline-variant/70 focus:ring-primary'
                      } rounded-xl text-on-surface font-sans text-sm sm:text-base focus:outline-none focus:ring-2 focus:border-primary transition-all placeholder:text-outline`}
                    />
                  </div>
                  {nameError ? (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{nameError}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-on-surface-variant">
                      Enter the host or family elder's name for communication.
                    </p>
                  )}
                </div>

                {/* Mobile Phone Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5" htmlFor="customer-phone">
                      Mobile Number for Consultation
                      <span className="text-primary font-bold">*</span>
                    </label>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-tertiary bg-tertiary-fixed/40 px-2 py-0.5 rounded-full border border-tertiary/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      SMS &amp; Call verified
                    </span>
                  </div>
                  <div className="relative flex rounded-xl shadow-xs">
                    {/* Country Flag + Prefix */}
                    <div className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-outline-variant/70 bg-surface-container-low text-on-surface font-medium text-sm select-none gap-2 shrink-0">
                      <span className="text-base leading-none">🇮🇳</span>
                      <span className="font-semibold text-on-surface">+91</span>
                    </div>
                    <input
                      id="customer-phone"
                      name="mobilePhone"
                      data-testid="customer-phone"
                      type="tel"
                      placeholder="98450 XXXXX"
                      value={customerPhone}
                      onChange={handlePhoneChange}
                      className={`block w-full px-4 py-3.5 bg-[#FFF9F0] border ${
                        phoneError ? 'border-red-500 focus:ring-red-500' : 'border-outline-variant/70 focus:ring-primary'
                      } rounded-r-xl text-on-surface font-sans text-sm sm:text-base focus:outline-none focus:ring-2 focus:border-primary transition-all tracking-wider placeholder:text-outline`}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{phoneError}</span>
                    </p>
                  )}
                </div>

                {/* Special Requests / Venue Landmark */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5" htmlFor="specialRequests">
                      Special Requests / Venue Landmark
                      <span className="text-xs text-on-surface-variant font-normal">(Optional)</span>
                    </label>
                  </div>
                  <div className="relative">
                    <textarea
                      id="specialRequests"
                      name="specialRequests"
                      rows={3}
                      placeholder="E.g., Near Chamundeshwari Temple Kalyana Mantapa, prefer 7:30 AM early morning Muhurtham leaf batch, sugar-free sweet option for elders..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="block w-full p-4 bg-[#FFF9F0] border border-outline-variant/70 rounded-xl text-on-surface font-sans text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none placeholder:text-outline"
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Mention specific service timings, leaf layout preferences, or landmark details in Mysuru.
                  </p>
                </div>

                {/* Submission Error Banner with Retry */}
                {submissionError && (
                  <div 
                    role="alert" 
                    className="p-4 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#410000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="w-5 h-5 text-[#ba1a1a] shrink-0" />
                      <span className="text-xs sm:text-sm font-medium">{submissionError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSubmit()}
                      className="px-3.5 py-1.5 rounded-lg bg-[#ba1a1a] text-white text-xs font-bold hover:bg-[#930000] transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Primary Submission CTA Button */}
                <div className="pt-2">
                  <button
                    id="submit-contact-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-primary via-primary-container to-primary text-on-primary py-4 px-8 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-md hover:opacity-95 active:scale-[0.99] transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Submitting Request...</span>
                      </span>
                    ) : (
                      <>
                        <span>Submit Catering Request</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
                      </>
                    )}
                  </button>

                  {/* Reassurance Note */}
                  <div className="flex items-center justify-center gap-2 mt-3.5 text-center text-xs sm:text-sm text-on-surface-variant font-medium">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span>We'll call you to confirm everything. No payment needed now.</span>
                  </div>
                </div>

              </form>
            </div>

            {/* URGENT CONSULTATION BANNER & HERITAGE PROMISE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Urgent Consultation WhatsApp Card */}
              <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-5 flex items-center gap-4 hover:border-outline transition-colors">
                <div className="w-12 h-12 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center shrink-0 shadow-xs">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-tertiary font-semibold uppercase tracking-wider">Priority Desk</p>
                  <h4 className="text-sm sm:text-base font-semibold text-on-surface leading-snug">
                    Need urgent consultation?
                  </h4>
                  <a 
                    className="text-xs sm:text-sm text-primary font-bold hover:underline inline-flex items-center gap-1 mt-0.5" 
                    href={`https://wa.me/${(settings.mobile || settings.phone).replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chat on WhatsApp {settings.mobile || settings.phone}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Heritage Seal Card */}
              <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0 border border-secondary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant">
                      100% Sattvic
                    </span>
                    <span className="text-[11px] text-outline font-medium">Since 1984</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-on-surface mt-1">
                    Heritage Banquet Promise
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Pure Plantain Leaf Banquet • Mysuru Estd. 1984
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* RIGHT COLUMN: Sticky Banquet Review Card (5 cols) */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
            <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-2xl p-6 lg:p-7 shadow-xs relative overflow-hidden">
              {/* Traditional decorative corner tag */}
              <div className="absolute top-0 right-0 transform translate-x-7 -translate-y-7 w-20 h-20 bg-secondary/10 rotate-45 pointer-events-none"></div>

              {/* Banquet Summary Header */}
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/60 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-tertiary rounded-xs flex items-center justify-center p-0.5" title="Pure Vegetarian Guaranteed">
                      <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                    </span>
                    <h3 className="font-headline font-bold text-lg sm:text-xl text-primary">
                      Banquet Summary
                    </h3>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">Iyengar Vedic Hospitality Order</p>
                </div>
                <Link 
                  to="/request" 
                  className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <span>Edit details</span>
                  <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                </Link>
              </div>

              {/* Review Attributes Grid */}
              <div className="space-y-4 text-xs sm:text-sm">
                {/* Occasion */}
                <div className="flex items-start justify-between py-2 border-b border-surface-container">
                  <span className="text-on-surface-variant flex items-center gap-2">
                    <PartyPopper className="w-4 h-4 text-secondary" />
                    Occasion:
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-on-surface block">{displayOccasion}</span>
                  </div>
                </div>

                {/* Event Date & Service Time */}
                <div className="flex items-start justify-between py-2 border-b border-surface-container">
                  <span className="text-on-surface-variant flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-secondary" />
                    Event Date &amp; Time:
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-on-surface block">
                      {requirements.eventDate && isValid(parseISO(requirements.eventDate))
                        ? format(parseISO(requirements.eventDate), 'EEE, dd MMM yyyy')
                        : (requirements.eventDate || 'Date Not Selected')}
                    </span>
                    <span className="text-xs text-secondary font-medium">
                      {requirements.eventTime || 'Morning'} Service{requirements.specificTime ? ` • ${requirements.specificTime}` : ''}
                    </span>
                  </div>
                </div>

                {/* Headcount & Seating */}
                <div className="flex items-start justify-between py-2 border-b border-surface-container">
                  <span className="text-on-surface-variant flex items-center gap-2">
                    <Users className="w-4 h-4 text-secondary" />
                    Headcount / Seating:
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-on-surface block">{guestCount} Plates</span>
                    <span className="text-xs text-tertiary font-medium">Pure Plantain Leaf Service</span>
                  </div>
                </div>
              </div>

              {/* SELECTED DELICACIES BENTO LIST */}
              <div className="mt-6 pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm sm:text-base font-semibold text-on-surface flex items-center gap-1.5">
                    <span>Selected Delicacies</span>
                    <span className="bg-secondary-fixed text-on-secondary-fixed text-xs px-2 py-0.5 rounded-full font-bold">
                      {displayItems.length} Items
                    </span>
                  </h4>
                  <span className="text-xs text-outline">Traditional Thali</span>
                </div>

                {/* Delicacy Pills / Bento */}
                <div className="space-y-2.5">
                  {displayItems.map((item, idx) => (
                    <div 
                      key={item.id || idx}
                      className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColors[idx % dotColors.length]}`}></div>
                        <div className="min-w-0">
                          <h5 className="text-xs sm:text-sm font-semibold text-on-surface truncate">{item.name}</h5>
                          <p className="text-[11px] text-outline truncate">{getTagline(item, idx)}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-tertiary shrink-0">Included</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation Card */}
              <div className="mt-6 pt-5 border-t-2 border-dashed border-outline-variant/60 bg-surface-container/60 -mx-6 -mb-6 p-6">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs sm:text-sm text-on-surface-variant font-medium">Estimated Food Total</span>
                  <div className="text-right">
                    <span className="font-headline font-bold text-2xl sm:text-3xl text-primary tracking-tight">
                      ₹{estimatedTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-secondary font-medium">
                  <span>₹{perPlateTotal} / plate ({guestCount} guests)</span>
                  <span className="bg-surface-container-lowest px-2 py-0.5 rounded text-tertiary font-semibold border border-tertiary/30">
                    No advance payment needed
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-3 text-center leading-normal">
                  Final quote includes pure banana leaves, service staff setup, drinking water tumblers, and sacred dining decor assistance.
                </p>
              </div>

            </div>

            {/* Trust Badges Under Summary */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 flex items-center justify-around text-center">
              <div className="space-y-1 flex flex-col items-center">
                <Leaf className="w-5 h-5 text-secondary" />
                <p className="text-[11px] font-semibold text-on-surface">Fresh Banana Leaf</p>
              </div>
              <div className="h-8 w-px bg-outline-variant/60"></div>
              <div className="space-y-1 flex flex-col items-center">
                <Flame className="w-5 h-5 text-secondary" />
                <p className="text-[11px] font-semibold text-on-surface">Pure Desi Ghee</p>
              </div>
              <div className="h-8 w-px bg-outline-variant/60"></div>
              <div className="space-y-1 flex flex-col items-center">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <p className="text-[11px] font-semibold text-on-surface">Zero Preservatives</p>
              </div>
            </div>

          </aside>
        </div>

        {/* CULINARY HERITAGE SPOTLIGHT (Supporting Visual Anchor) */}
        <section className="mt-16 pt-8 border-t border-outline-variant/40">
          <div className="bg-surface-container-low border border-outline-variant/50 rounded-3xl p-6 md:p-8 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-2">
                <span className="text-xs uppercase tracking-widest font-semibold text-secondary">
                  Iyengar Bhojana Parampara
                </span>
                <h3 className="font-headline text-xl sm:text-2xl text-primary font-bold">
                  The Sacred Art of Leaf Hospitality
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                  Every banquet hosted by TKS Iyengar’s adheres to the authentic Agama shastra principles of satvik preparation—served strictly on hand-picked Kaveri basin plantain leaves with divine ghee poured first to honor the guest.
                </p>
              </div>
              <div className="flex justify-start md:justify-center">
                <div className="flex items-center gap-3 bg-surface-container-lowest px-5 py-3 rounded-2xl border border-secondary/40 shadow-xs">
                  <UtensilsCrossed className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-headline text-base sm:text-lg text-primary font-bold">10,000+ Feasts</p>
                    <p className="text-xs text-on-surface-variant">Conducted across Mysuru &amp; Bengaluru</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 4. FOOTER */}
      <AppFooter />
    </motion.div>
  )
}

export default ContactPage
