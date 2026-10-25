import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  UserCheck, 
  Calendar as CalendarIcon, 
  Plus, 
  Minus, 
  UtensilsCrossed, 
  Info, 
  Check, 
  X,
  Phone
} from 'lucide-react'
import { toast } from 'sonner'
import { getCatalogue, getCustomer, saveOrder } from '@/api'
import type { MenuItem, Category, CustomerRecord, OrderItem } from '@/data/mockData'
import { AdminAppShell } from '@/components/admin/AdminAppShell'
import { ItemCard } from '@/components/customer/ItemCard'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetClose
} from '@/components/ui/sheet'
import { formatRupees } from '@/lib/format'

const OCCASION_SUGGESTIONS = [
  'Wedding',
  'Pooja',
  'Housewarming',
  'Birthday',
  'Naming ceremony',
  'Corporate',
  'Other'
]

export const AdminCreateOrderPage: React.FC = () => {
  const navigate = useNavigate()

  // Catalogue data for food item selection
  const [categories, setCategories] = useState<Category[]>([])
  const [allItems, setAllItems] = useState<MenuItem[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')

  // Form State
  // (1) Mobile number FIRST and required (+91)
  const [mobile, setMobile] = useState<string>('')
  const [mobileError, setMobileError] = useState<string | null>(null)
  const [matchedCustomer, setMatchedCustomer] = useState<CustomerRecord | null>(null)
  const [matchedAddress, setMatchedAddress] = useState<string>('')
  const [isCustomerLinked, setIsCustomerLinked] = useState<boolean>(false)

  // (2) Customer name
  const [customerName, setCustomerName] = useState<string>('')

  // (3) Occasion type
  const [occasion, setOccasion] = useState<string>('')

  // (4) Occasion date & meal timing
  const [eventDate, setEventDate] = useState<string>('')
  const [eventTime, setEventTime] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning')

  // (5) Number of plates
  const [plates, setPlates] = useState<number>(100)

  // (6) Delivery address
  const [address, setAddress] = useState<string>('')

  // (7) Special instructions
  const [instructions, setInstructions] = useState<string>('')

  // (8) Enquiry notes (short note about the phone/walk-in conversation)
  const [enquiryNotes, setEnquiryNotes] = useState<string>('')

  // (9) Food items selection
  const [selectedItemsMap, setSelectedItemsMap] = useState<Record<string, MenuItem>>({})
  const [isFoodSheetOpen, setIsFoodSheetOpen] = useState<boolean>(false)

  // Saving state
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Network online status for offline rules (disable saving while offline)
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  })

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Reference today date string
  const todayStr = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }, [])

  // Load menu catalogue
  useEffect(() => {
    let isMounted = true
    getCatalogue().then((res) => {
      if (isMounted) {
        setCategories(res.categories)
        setAllItems(res.items)
      }
    }).catch(console.error)
    return () => {
      isMounted = false
    }
  }, [])

  // Mobile customer matching logic
  useEffect(() => {
    const clean = mobile.replace(/^\+91/, '').replace(/\D/g, '').trim()
    if (clean.length === 10) {
      getCustomer(clean).then((res) => {
        if (res.customer) {
          setMatchedCustomer(res.customer)
          const orderWithAddress = res.orders.find((o) => o.venueAddress)
          if (orderWithAddress && orderWithAddress.venueAddress) {
            setMatchedAddress(orderWithAddress.venueAddress)
          } else {
            setMatchedAddress('')
          }
        } else {
          setMatchedCustomer(null)
          setMatchedAddress('')
        }
      }).catch(() => {
        setMatchedCustomer(null)
      })
    } else {
      setMatchedCustomer(null)
      setIsCustomerLinked(false)
    }
  }, [mobile])

  // Use Existing Customer button action
  const handleUseExistingCustomer = () => {
    if (!matchedCustomer) return
    setCustomerName(matchedCustomer.name)
    if (matchedAddress) {
      setAddress(matchedAddress)
    }
    setIsCustomerLinked(true)
    toast.success(`Prefilled details for ${matchedCustomer.name}`)
  }

  // Toggle item in manual order
  const handleToggleItem = (item: MenuItem) => {
    setSelectedItemsMap((prev) => {
      const next = { ...prev }
      if (next[item.id]) {
        delete next[item.id]
      } else {
        next[item.id] = item
      }
      return next
    })
  }

  // Calculate pricing
  const selectedItemsList = useMemo(() => Object.values(selectedItemsMap), [selectedItemsMap])
  const perPlateTotal = useMemo(() => {
    return selectedItemsList.reduce((sum, item) => sum + item.pricePerPlate, 0)
  }, [selectedItemsList])
  const estimatedFoodTotal = perPlateTotal * (plates || 0)

  // Filter items in food sheet by category
  const filteredCategoryItems = useMemo(() => {
    if (selectedCategoryId === 'all') return allItems
    return allItems.filter((i) => i.category === selectedCategoryId)
  }, [allItems, selectedCategoryId])

  // Stepper handlers
  const handleDecrementPlates = () => {
    setPlates((prev) => Math.max(10, prev - 10))
  }
  const handleIncrementPlates = () => {
    setPlates((prev) => prev + 10)
  }

  // Format date display
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Select date'
    try {
      const [y, m, d] = dateStr.split('-').map(Number)
      return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  // Save Enquiry Handler
  const handleSaveEnquiry = async () => {
    const cleanMobile = mobile.replace(/^\+91/, '').replace(/\D/g, '').trim()

    // Validate mobile number: only mobile number is required to save per spec
    if (!cleanMobile || cleanMobile.length !== 10 || !/^[6-9]/.test(cleanMobile)) {
      setMobileError('Valid 10-digit mobile number required (+91, starts with 6-9)')
      toast.error('Mobile number is required to save an enquiry.')
      return
    }

    setMobileError(null)
    setIsSaving(true)

    try {
      // Map selected items to OrderItem[]
      const orderItems: OrderItem[] = selectedItemsList.map((item) => ({
        id: item.id,
        name: item.name,
        pricePerPlate: item.pricePerPlate,
        quantity: 1
      }))

      // Combine notes and enquiry notes
      let finalNotes = instructions.trim()
      if (enquiryNotes.trim()) {
        finalNotes = finalNotes 
          ? `${finalNotes}\n\n[Enquiry Notes]: ${enquiryNotes.trim()}`
          : `[Enquiry Notes]: ${enquiryNotes.trim()}`
      }

      // ASSUMPTION per spec: saving creates the record with status Under Discussion and opens its detail page
      const newOrder = await saveOrder({
        source: 'Manual',
        status: 'Under Discussion',
        customerPhone: cleanMobile,
        customerName: customerName.trim() || `Customer (${cleanMobile})`,
        eventType: occasion.trim() || 'Catering Function',
        eventDate: eventDate || todayStr,
        eventTime: eventTime,
        guestCount: plates > 0 ? plates : 100,
        venueAddress: address.trim(),
        notes: finalNotes,
        items: orderItems,
        perPlateTotal,
        totalAmount: estimatedFoodTotal
      })

      toast.success('Manual enquiry saved as Under Discussion')
      navigate(`/admin/orders/${newOrder.id}`)
    } catch (err) {
      console.error('Failed to save manual enquiry:', err)
      toast.error('Failed to save enquiry. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminAppShell title="Create Manual Order" subtitle="Take in-person or phone enquiry">
      <div className="max-w-5xl mx-auto space-y-6 pb-28">
        
        {/* Navigation & Header strip */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <Link
            to="/admin/orders"
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--brand)] hover:underline tap-target-48 sm:tap-target-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to orders</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[var(--text-muted)]">Source:</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 select-none">
              Manual
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TWO-PANE LAYOUT FROM 1024px WITH SIDEBAR                */}
        {/* Left: Cards 1-9 Customer & Event Fields (7 cols)         */}
        {/* Right: Sticky Card 10 Pricing Block (5 cols)             */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Pane: Details & Food Selection (7 cols) */}
          <div className="lg:col-span-7 space-y-4 min-w-0">
            {/* (1) MOBILE NUMBER FIRST AND REQUIRED (+91)               */}
            <div className="content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="customer-mobile" className="font-heading font-black text-sm text-[var(--brand-900)] flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-[var(--brand)]" />
              <span>Customer Mobile Number</span>
              <span className="text-red-500 font-bold">*</span>
            </label>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">Required to save</span>
          </div>

          <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-[var(--brand-300)] focus-within:border-[var(--brand)]">
            <span className="px-3 py-2.5 bg-slate-50 text-slate-700 font-bold text-xs flex items-center border-r border-slate-200 select-none">
              +91
            </span>
            <input
              id="customer-mobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="e.g. 98450 12345"
              value={mobile}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '')
                setMobile(val)
                if (mobileError) setMobileError(null)
              }}
              className="flex-1 px-3 py-2.5 text-sm font-semibold outline-none bg-transparent"
            />
          </div>

          {mobileError && (
            <p className="text-xs font-bold text-red-600">{mobileError}</p>
          )}

          {/* Inline card when mobile matches existing customer per spec:
              "When it matches an existing customer, show an inline card 'Existing customer: Name, N enquiries, M confirmed orders' with 'Use this customer'" */}
          {matchedCustomer && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mt-2 shadow-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-heading font-bold text-xs text-amber-900">
                  <UserCheck className="w-4 h-4 text-amber-700" />
                  <span>Existing customer: {matchedCustomer.name}</span>
                </div>
                <p className="text-[11px] text-amber-800 font-medium">
                  {matchedCustomer.enquiryCount} enquiries, {matchedCustomer.confirmedCount} confirmed orders
                </p>
                {matchedCustomer.notes && (
                  <p className="text-[10px] text-amber-700 italic truncate max-w-sm">
                    "{matchedCustomer.notes}"
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleUseExistingCustomer}
                disabled={isCustomerLinked}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 tap-target-48 sm:tap-target-auto ${
                  isCustomerLinked
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                }`}
              >
                {isCustomerLinked ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Customer linked</span>
                  </span>
                ) : (
                  'Use this customer'
                )}
              </button>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* (2) CUSTOMER NAME                                        */}
        {/* ======================================================== */}
        <div className="content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs space-y-2">
          <label htmlFor="customer-name" className="font-heading font-black text-sm text-[var(--brand-900)] block">
            Customer Name
          </label>
          <Input
            id="customer-name"
            type="text"
            placeholder="e.g. Kalyan Ramanathan"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="h-11 rounded-xl bg-white text-sm font-medium"
          />
        </div>

        {/* ======================================================== */}
        {/* (3) OCCASION TYPE                                        */}
        {/* ======================================================== */}
        <div className="content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs space-y-2.5">
          <label htmlFor="occasion-type" className="font-heading font-black text-sm text-[var(--brand-900)] block">
            Occasion Type
          </label>

          {/* Suggestion Chips */}
          <div className="flex flex-wrap gap-1.5 select-none pb-1">
            {OCCASION_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => setOccasion(sug)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  occasion === sug
                    ? 'bg-[var(--brand)] text-[var(--on-brand)] border-[var(--brand)]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sug}
              </button>
            ))}
          </div>

          <Input
            id="occasion-type"
            type="text"
            placeholder="Choose above or enter custom occasion (e.g. Shastiabdapoorthi)"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="h-11 rounded-xl bg-white text-sm font-medium"
          />
        </div>

        {/* ======================================================== */}
        {/* (4) OCCASION DATE & MEAL TIME                            */}
        {/* ======================================================== */}
        <div className="content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs space-y-3">
          <label htmlFor="occasion-date" className="font-heading font-black text-sm text-[var(--brand-900)] block">
            Occasion Date & Timing
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block mb-1">
                Event Date
              </span>
              <div className="relative">
                <input
                  id="occasion-date"
                  type="date"
                  min={todayStr}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full h-11 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--brand-300)]"
                />
              </div>
              {eventDate && (
                <p className="text-[11px] font-bold text-[var(--brand)] mt-1 flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>{formatDateDisplay(eventDate)}</span>
                </p>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block mb-1">
                Meal Timing
              </span>
              <div className="grid grid-cols-3 gap-1.5 h-11">
                {(['Morning', 'Afternoon', 'Evening'] as const).map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setEventTime(time)}
                    className={`rounded-xl text-xs font-bold border transition-all ${
                      eventTime === time
                        ? 'bg-[var(--brand-900)] text-white border-[var(--brand-900)]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* (5) NUMBER OF PLATES                                     */}
        {/* ======================================================== */}
        <div className="content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="plates-input" className="font-heading font-black text-sm text-[var(--brand-900)] block">
                Number of Plates
              </label>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">
                Minimum 10 plates for catering booking
              </p>
            </div>

            {/* Stepper controls */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full border border-slate-200 select-none">
              <button
                type="button"
                onClick={handleDecrementPlates}
                className="w-8 h-8 rounded-full bg-white text-slate-700 flex items-center justify-center hover:bg-slate-50 shadow-xs tap-target-48 sm:tap-target-auto"
                aria-label="Decrease plates"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                id="plates-input"
                type="number"
                min={10}
                step={10}
                value={plates}
                onChange={(e) => setPlates(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-14 text-center font-heading font-black text-base bg-transparent outline-none"
              />
              <button
                type="button"
                onClick={handleIncrementPlates}
                className="w-8 h-8 rounded-full bg-white text-slate-700 flex items-center justify-center hover:bg-slate-50 shadow-xs tap-target-48 sm:tap-target-auto"
                aria-label="Increase plates"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick plate selection chips */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
            {[50, 100, 200, 300, 500].map((pCount) => (
              <button
                key={pCount}
                type="button"
                onClick={() => setPlates(pCount)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  plates === pCount
                    ? 'bg-[var(--brand)] text-[var(--on-brand)] border-[var(--brand)]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {pCount} plates
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* (6) DELIVERY ADDRESS                                     */}
        {/* ======================================================== */}
        <div className="content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs space-y-2">
          <label htmlFor="delivery-address" className="font-heading font-black text-sm text-[var(--brand-900)] block">
            Delivery Address
          </label>
          <Textarea
            id="delivery-address"
            rows={2}
            placeholder="Banquet hall, kalyana mantapa, or residential address in Mysuru..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="rounded-xl bg-white text-sm font-medium resize-none"
          />
        </div>

        {/* ======================================================== */}
        {/* (7) SPECIAL INSTRUCTIONS                                 */}
        {/* ======================================================== */}
        <div className="content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs space-y-2">
          <label htmlFor="special-instructions" className="font-heading font-black text-sm text-[var(--brand-900)] block">
            Special Instructions
          </label>
          <Textarea
            id="special-instructions"
            rows={2}
            placeholder="Preparation requests (e.g. Satvik / strictly no onion-garlic, banana leaf service, hot filter coffee round)..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="rounded-xl bg-white text-sm font-medium resize-none"
          />
        </div>

        {/* ======================================================== */}
        {/* (8) ENQUIRY NOTES (A short note about the conversation)  */}
        {/* ======================================================== */}
        <div className="content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div>
            <label htmlFor="enquiry-notes" className="font-heading font-black text-sm text-[var(--brand-900)] block">
              Enquiry Notes
            </label>
            <p className="text-[11px] text-[var(--text-muted)] font-medium">
              Internal staff notes about the telephone or walk-in discussion
            </p>
          </div>
          <Textarea
            id="enquiry-notes"
            rows={2}
            placeholder="e.g. Inquired about catering for 250 guests. Sent quote; customer will discuss with family and confirm deposit by Friday."
            value={enquiryNotes}
            onChange={(e) => setEnquiryNotes(e.target.value)}
            className="rounded-xl bg-white text-sm font-medium resize-none"
          />
        </div>

        {/* ======================================================== */}
        {/* (9) FOOD ITEMS: BOTTOM SHEET SELECTOR                    */}
        {/* ======================================================== */}
        <div className="content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-black text-sm sm:text-base text-[var(--brand-900)]">
                Food Menu Items
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">
                {selectedItemsList.length} items chosen ({formatRupees(perPlateTotal)} / plate)
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFoodSheetOpen(true)}
              className="px-4 py-2 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[var(--on-brand)] font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all tap-target-48 sm:tap-target-auto"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>{selectedItemsList.length > 0 ? 'Edit items' : 'Select items'}</span>
            </button>
          </div>

          {/* Currently selected items preview list */}
          {selectedItemsList.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
              {selectedItemsList.map((item) => (
                <div key={item.id} className="p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none">{item.emoji || '🍽️'}</span>
                    <span className="font-bold text-[var(--text-primary)]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-600">
                      {formatRupees(item.pricePerPlate)} / plate
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item)}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Remove dish"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
              No dishes selected yet. Tap 'Select items' to choose dishes from the catering catalogue.
            </div>
          )}
          </div>
          </div>

          {/* Right Pane: Sticky Pricing & Action Block (5 cols on 1024px+) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24 min-w-0">
            {/* (10) THE PRICING BLOCK FROM A5                           */}
            <div className="content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="font-heading font-black text-sm sm:text-base text-[var(--brand-900)]">
            Estimated Bill
          </h3>

          <div className="space-y-2 pt-1 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium">Price per plate</span>
              <span className="font-bold text-[var(--text-primary)]">
                {formatRupees(perPlateTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium">Number of plates</span>
              <span className="font-bold text-[var(--text-primary)]">
                × {plates}
              </span>
            </div>

            <div className="border-t border-dashed border-slate-200 my-2" />

            <div className="flex items-baseline justify-between pt-1">
              <span className="font-heading font-bold text-sm sm:text-base text-[var(--text-primary)]">
                Estimated food total
              </span>
              <span className="font-heading font-black text-xl sm:text-2xl text-[var(--brand-900)]">
                {formatRupees(estimatedFoodTotal)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 text-[11px] text-[var(--text-muted)] mt-2">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Estimate only. Delivery fees and customization charges may apply upon final banquet agreement.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
    </div>

      {/* ======================================================== */}
      {/* STICKY GLASS BOTTOM BAR 'Save enquiry'                   */}
      {/* ======================================================== */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-20 glass-bottom-bar p-3.5 sm:p-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Manual Order Estimate
            </p>
            <p className="font-heading font-black text-lg text-[var(--brand-900)] truncate">
              {formatRupees(estimatedFoodTotal)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveEnquiry}
            disabled={isSaving || !isOnline}
            className="h-12 px-8 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[var(--on-brand)] font-heading font-bold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 tap-target-48 cursor-pointer"
          >
            {isSaving ? (
              <span>Saving enquiry...</span>
            ) : (
              <span>Save enquiry</span>
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FOOD ITEMS SELECTION BOTTOM SHEET                        */}
      {/* ======================================================== */}
      <Sheet open={isFoodSheetOpen} onOpenChange={setIsFoodSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] h-[85vh] rounded-t-[24px] p-0 flex flex-col bg-[var(--bg-base)]">
          
          <SheetHeader className="p-4 sm:p-5 border-b border-slate-200/80 bg-white sticky top-0 z-10 flex flex-row items-center justify-between shrink-0">
            <div>
              <SheetTitle className="font-heading font-black text-base sm:text-lg text-[var(--brand-900)]">
                Select Catering Menu Items
              </SheetTitle>
              <p className="text-xs text-[var(--text-muted)] font-medium">
                {selectedItemsList.length} items chosen • {formatRupees(perPlateTotal)} / plate
              </p>
            </div>
            <SheetClose asChild>
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </SheetClose>
          </SheetHeader>

          {/* Category Navigation Pills */}
          <div className="p-3 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 select-none">
            <button
              type="button"
              onClick={() => setSelectedCategoryId('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                selectedCategoryId === 'all'
                  ? 'bg-[var(--brand)] text-[var(--on-brand)]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Items ({allItems.length})
            </button>
            {categories.map((cat) => {
              const catCount = allItems.filter((i) => i.category === cat.name).length
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                    selectedCategoryId === cat.name
                      ? 'bg-[var(--brand)] text-[var(--on-brand)]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.name} ({catCount})
                </button>
              )
            })}
          </div>

          {/* Grid of ItemCards reusing Customer ItemCard */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 pb-20">
              {filteredCategoryItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isSelected={!!selectedItemsMap[item.id]}
                  onToggle={handleToggleItem}
                />
              ))}
            </div>
          </div>

          {/* Bottom Sticky Action inside Sheet */}
          <div className="sticky bottom-0 z-20 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--brand-900)]">
                {selectedItemsList.length} items selected
              </p>
              <p className="text-xs text-[var(--text-muted)] font-semibold">
                Per plate: <span className="text-[var(--brand)] font-bold">{formatRupees(perPlateTotal)}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFoodSheetOpen(false)}
              className="px-6 py-2.5 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[var(--on-brand)] font-heading font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
            >
              Done
            </button>
          </div>

        </SheetContent>
      </Sheet>

    </AdminAppShell>
  )
}

export default AdminCreateOrderPage
