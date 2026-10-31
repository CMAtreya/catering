import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Phone, 
  Plus, 
  Minus, 
  UtensilsCrossed, 
  Check, 
  X, 
  AlertCircle, 
  Printer, 
  CheckCircle2, 
  Sparkles,
  Clock,
  ShieldAlert,
  Eye,
  EyeOff,
  ChefHat
} from 'lucide-react'
import { KitchenBEOSheetModal } from '@/components/admin/KitchenBEOSheetModal'
import { toast } from 'sonner'
import { 
  getOrder, 
  saveOrder, 
  confirmOrder, 
  setStatus, 
  getCatalogue, 
  getCustomer 
} from '@/api'
import type { 
  Order, 
  MenuItem, 
  Category, 
  OrderItem, 
  CustomerRecord 
} from '@/data/mockData'
import { AdminAppShell } from '@/components/admin/AdminAppShell'
import { StatusChip } from '@/components/admin/StatusChip'
import { SourceChip } from '@/components/admin/SourceChip'
import { ItemCard } from '@/components/customer/ItemCard'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useVisualViewport } from '@/hooks/useVisualViewport'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetClose 
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatRupees } from '@/lib/format'
import { calculateOrderPricing, type GstMode } from '@/lib/pricing'

const OCCASION_SUGGESTIONS = [
  'Wedding',
  'Pooja',
  'Housewarming',
  'Birthday',
  'Naming ceremony',
  'Corporate',
  'Other'
]

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isKeyboardOpen } = useVisualViewport()

  // Loading & initial data states
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [initialOrder, setInitialOrder] = useState<Order | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [allItems, setAllItems] = useState<MenuItem[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [crmCustomer, setCrmCustomer] = useState<CustomerRecord | null>(null)

  // Form State (Solid white cards with every field editable inline)
  // 1) Customer fields
  const [customerName, setCustomerName] = useState<string>('')
  const [customerPhone, setCustomerPhone] = useState<string>('')

  // 2) Event fields
  const [occasion, setOccasion] = useState<string>('')
  const [eventDate, setEventDate] = useState<string>('')
  const [eventTime, setEventTime] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning')
  const [plates, setPlates] = useState<number>(0)
  const [venueAddress, setVenueAddress] = useState<string>('')
  const [specialInstructions, setSpecialInstructions] = useState<string>('')

  // 3) Selected food items
  const [itemsList, setItemsList] = useState<OrderItem[]>([])
  const [isFoodSheetOpen, setIsFoodSheetOpen] = useState<boolean>(false)
  const [isBEOSheetOpen, setIsBEOSheetOpen] = useState<boolean>(false)

  // 4) Enquiry notes
  const [enquiryNotes, setEnquiryNotes] = useState<string>('')

  // 5) Pricing fields
  const [deliveryCharges, setDeliveryCharges] = useState<number>(0)
  const [customizationCharges, setCustomizationCharges] = useState<number>(0)
  const [gstMode, setGstMode] = useState<GstMode>('percent')
  const [gstValue, setGstValue] = useState<number>(5)
  const [finalInstructions, setFinalInstructions] = useState<string>('')

  // Actions & Dialog states
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false)
  const [cancelPasscode, setCancelPasscode] = useState<string>('')
  const [passcodeError, setPasscodeError] = useState<string>('')
  const [showCancelPasscode, setShowCancelPasscode] = useState<boolean>(false)
  const [isCancelling, setIsCancelling] = useState<boolean>(false)

  // Network online status for offline rules (disable actions while offline)
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

  // Load Order & Catalogue
  const loadOrderData = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const [orderRes, catRes] = await Promise.all([
        getOrder(id),
        getCatalogue()
      ])

      if (!orderRes) {
        toast.error(`Order ${id} not found`)
        navigate('/admin/orders')
        return
      }

      setInitialOrder(orderRes)
      setCategories(catRes.categories)
      setAllItems(catRes.items)

      // Initialize form fields
      setCustomerName(orderRes.customerName || '')
      setCustomerPhone(orderRes.customerPhone || '')
      setOccasion(orderRes.eventType || '')
      setEventDate(orderRes.eventDate || '')
      setEventTime(orderRes.eventTime || 'Morning')
      setPlates(orderRes.guestCount || 0)
      setVenueAddress(orderRes.venueAddress || '')
      setSpecialInstructions(orderRes.specialInstructions || orderRes.notes || '')
      setItemsList(orderRes.items || [])
      setEnquiryNotes(orderRes.enquiryNotes || '')
      setDeliveryCharges(orderRes.deliveryCharges || 0)
      setCustomizationCharges(orderRes.customizationCharges || 0)
      setGstMode(orderRes.gstMode || 'percent')
      setGstValue(orderRes.gstValue !== undefined ? orderRes.gstValue : 5)
      setFinalInstructions(orderRes.finalInstructions || '')

      // Fetch CRM info for customer
      if (orderRes.customerPhone) {
        const clean = orderRes.customerPhone.replace(/^\+91/, '').replace(/\D/g, '')
        getCustomer(clean).then((cRes) => {
          if (cRes.customer) setCrmCustomer(cRes.customer)
        }).catch(console.error)
      }
    } catch (err) {
      console.error('Failed to load order details:', err)
      toast.error('Failed to load order record')
    } finally {
      setIsLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    loadOrderData()
  }, [loadOrderData])

  // Food calculation: price per plate is sum of selected items
  const perPlatePrice = useMemo(() => {
    return itemsList.reduce((sum, item) => sum + (item.pricePerPlate * (item.quantity || 1)), 0)
  }, [itemsList])

  // Full Order Pricing result using central pricing engine
  const pricingResult = useMemo(() => {
    return calculateOrderPricing({
      perPlatePrice,
      guestCount: plates,
      deliveryCharges,
      customizationCharges,
      gstMode,
      gstValue
    })
  }, [perPlatePrice, plates, deliveryCharges, customizationCharges, gstMode, gstValue])

  // Check if form has unsaved modifications (Dirty state)
  const isDirty = useMemo(() => {
    if (!initialOrder) return false
    
    // Compare items list
    const initialItemsIds = (initialOrder.items || []).map((i) => i.id).sort().join(',')
    const currentItemsIds = itemsList.map((i) => i.id).sort().join(',')

    const initialSpecial = initialOrder.specialInstructions || initialOrder.notes || ''
    
    return (
      customerName !== (initialOrder.customerName || '') ||
      customerPhone !== (initialOrder.customerPhone || '') ||
      occasion !== (initialOrder.eventType || '') ||
      eventDate !== (initialOrder.eventDate || '') ||
      eventTime !== (initialOrder.eventTime || 'Morning') ||
      plates !== (initialOrder.guestCount || 0) ||
      venueAddress !== (initialOrder.venueAddress || '') ||
      specialInstructions !== initialSpecial ||
      enquiryNotes !== (initialOrder.enquiryNotes || '') ||
      initialItemsIds !== currentItemsIds ||
      deliveryCharges !== (initialOrder.deliveryCharges || 0) ||
      customizationCharges !== (initialOrder.customizationCharges || 0) ||
      gstMode !== (initialOrder.gstMode || 'percent') ||
      gstValue !== (initialOrder.gstValue !== undefined ? initialOrder.gstValue : 5) ||
      finalInstructions !== (initialOrder.finalInstructions || '')
    )
  }, [
    initialOrder,
    customerName,
    customerPhone,
    occasion,
    eventDate,
    eventTime,
    plates,
    venueAddress,
    specialInstructions,
    enquiryNotes,
    itemsList,
    deliveryCharges,
    customizationCharges,
    gstMode,
    gstValue,
    finalInstructions
  ])

  // Discard changes
  const handleDiscardChanges = () => {
    if (!initialOrder) return
    setCustomerName(initialOrder.customerName || '')
    setCustomerPhone(initialOrder.customerPhone || '')
    setOccasion(initialOrder.eventType || '')
    setEventDate(initialOrder.eventDate || '')
    setEventTime(initialOrder.eventTime || 'Morning')
    setPlates(initialOrder.guestCount || 0)
    setVenueAddress(initialOrder.venueAddress || '')
    setSpecialInstructions(initialOrder.specialInstructions || initialOrder.notes || '')
    setItemsList(initialOrder.items || [])
    setEnquiryNotes(initialOrder.enquiryNotes || '')
    setDeliveryCharges(initialOrder.deliveryCharges || 0)
    setCustomizationCharges(initialOrder.customizationCharges || 0)
    setGstMode(initialOrder.gstMode || 'percent')
    setGstValue(initialOrder.gstValue !== undefined ? initialOrder.gstValue : 5)
    setFinalInstructions(initialOrder.finalInstructions || '')
    toast.info('Unsaved changes discarded')
  }

  // Save changes handler
  const handleSaveChanges = async () => {
    if (!id || !initialOrder) return
    const cleanPhone = customerPhone.replace(/^\+91/, '').replace(/\D/g, '').trim()

    if (!cleanPhone || cleanPhone.length !== 10) {
      toast.error('A valid 10-digit mobile number is required.')
      return
    }

    setIsSaving(true)
    try {
      const updated = await saveOrder({
        id,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        eventType: occasion.trim(),
        eventDate: eventDate.trim(),
        eventTime,
        guestCount: plates,
        venueAddress: venueAddress.trim(),
        specialInstructions: specialInstructions.trim(),
        notes: specialInstructions.trim(), // sync backwards compatibility
        enquiryNotes: enquiryNotes.trim(),
        items: itemsList,
        perPlateTotal: perPlatePrice,
        deliveryCharges,
        customizationCharges,
        gstMode,
        gstValue,
        gstAmount: pricingResult.gstAmount,
        totalAmount: pricingResult.finalTotal,
        finalInstructions: finalInstructions.trim()
      })

      setInitialOrder(updated)
      toast.success('Order details updated successfully')
    } catch (err) {
      console.error('Failed to update order:', err)
      toast.error('Failed to save order updates')
    } finally {
      setIsSaving(false)
    }
  }

  // Status Action: Mark Under Discussion
  const handleMarkUnderDiscussion = async () => {
    if (!id) return
    try {
      const updated = await setStatus(id, 'Under Discussion')
      setInitialOrder(updated)
      toast.success('Order marked as Under Discussion')
    } catch {
      toast.error('Failed to update status')
    }
  }

  // Status Action: Confirm Order
  const handleConfirmOrder = async () => {
    if (!id) return
    try {
      const updated = await confirmOrder(id)
      setInitialOrder(updated)
      setIsConfirmDialogOpen(false)
      toast.success('Order confirmed! Added to banquet calendar.')
    } catch {
      toast.error('Failed to confirm order')
    }
  }

  // Status Action: Mark Completed
  const handleMarkCompleted = async () => {
    if (!id) return
    try {
      const updated = await setStatus(id, 'Completed')
      setInitialOrder(updated)
      toast.success('Order marked as Completed')
    } catch {
      toast.error('Failed to complete order')
    }
  }

  // Status Action: Cancel Order (Protected by Passcode)
  const handleOpenCancelDialog = () => {
    setCancelPasscode('')
    setPasscodeError('')
    setShowCancelPasscode(false)
    setIsCancelDialogOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!id || !initialOrder) return
    const trimmed = cancelPasscode.trim()
    const validPasscodes = ['1965', 'mysore1965', 'admin123']
    if (!validPasscodes.includes(trimmed)) {
      setPasscodeError('Incorrect passcode. Please enter valid admin passcode.')
      return
    }
    try {
      setIsCancelling(true)
      const updated = await setStatus(id, 'Cancelled')
      setInitialOrder(updated)
      setIsCancelDialogOpen(false)
      setCancelPasscode('')
      setPasscodeError('')
      toast.error(`Order #${initialOrder.id} cancelled`)
    } catch {
      toast.error('Failed to cancel order')
    } finally {
      setIsCancelling(false)
    }
  }

  // Food Item handlers
  const handleRemoveItem = (itemId: string) => {
    setItemsList((prev) => prev.filter((i) => i.id !== itemId))
  }

  const handleToggleCatalogueItem = (item: MenuItem) => {
    setItemsList((prev) => {
      const exists = prev.some((i) => i.id === item.id)
      if (exists) {
        return prev.filter((i) => i.id !== item.id)
      } else {
        return [
          ...prev,
          {
            id: item.id,
            name: item.name,
            pricePerPlate: item.pricePerPlate,
            quantity: 1
          }
        ]
      }
    })
  }

  // Filter items in food sheet
  const filteredCategoryItems = useMemo(() => {
    if (selectedCategoryId === 'all') return allItems
    return allItems.filter((i) => i.category === selectedCategoryId)
  }, [allItems, selectedCategoryId])

  // Stepper handlers
  const handleDecrementPlates = () => {
    setPlates((prev) => Math.max(0, prev - 10))
  }
  const handleIncrementPlates = () => {
    setPlates((prev) => prev + 10)
  }

  // Validation for confirmation:
  // "Confirm stays disabled with the helper line 'Add occasion date and number of plates to confirm' until both exist"
  const canConfirm = useMemo(() => {
    return Boolean(eventDate.trim() && plates > 0)
  }, [eventDate, plates])

  if (isLoading || !initialOrder) {
    return (
      <AdminAppShell title="Order Management" subtitle="Loading record..." hideBottomNav>
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse p-4">
          <div className="h-10 bg-slate-200/70 rounded-xl w-48" />
          <div className="h-44 bg-slate-100 rounded-2xl" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
          <div className="h-44 bg-slate-100 rounded-2xl" />
        </div>
      </AdminAppShell>
    )
  }

  const cleanPhoneDisplay = customerPhone.replace(/^\+91/, '').replace(/\D/g, '')
  const telHref = `tel:+91${cleanPhoneDisplay}`
  const isConfirmedOrLater = initialOrder.status === 'Confirmed' || initialOrder.status === 'Completed'
  const isTerminalStatus = initialOrder.status === 'Completed' || initialOrder.status === 'Cancelled'

  return (
    <AdminAppShell title={`Order ${initialOrder.id}`} subtitle="Manage catering booking and requirements" hideBottomNav>
      <div className="max-w-6xl mx-auto space-y-6 pb-40">

        {/* ======================================================== */}
        {/* HEADER: Back arrow, record ID, source chip, status chip, */}
        {/* and Kebab menu                                           */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between gap-2 p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link
              to="/admin/orders"
              className="w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-[var(--brand)] transition-colors shrink-0 tap-target-48 sm:tap-target-auto border border-red-100"
              title="Back to All Orders"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading font-black text-base sm:text-xl text-[var(--brand-900)] tracking-tight">
                  {initialOrder.id}
                </h1>
                <SourceChip source={initialOrder.source} size="sm" />
                <StatusChip status={initialOrder.status} size="sm" />
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-medium truncate">
                Created: {new Date(initialOrder.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Terminal status read-only alert banner if Completed or Cancelled */}
        {isTerminalStatus && (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
            initialOrder.status === 'Completed'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            {initialOrder.status === 'Completed' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <div className="text-xs sm:text-sm">
              <span className="font-bold">Order status: {initialOrder.status}.</span>{' '}
              {initialOrder.status === 'Completed'
                ? 'This event has concluded. You can review requirements and print historical banquet invoices.'
                : 'This catering request was cancelled.'}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TWO-PANE LAYOUT FROM 1024px WITH SIDEBAR                */}
        {/* Left: Customer, Event, Food Items, Notes (7 cols)        */}
        {/* Right: Sticky Pricing, Billing & Invoice (5 cols)        */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Pane (7 cols on 1024px+) */}
          <div className="lg:col-span-7 space-y-6 min-w-0">
            {/* (1) CUSTOMER CARD: Name, Mobile with green Call icon     */}
            <div className="content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-sm sm:text-base text-[var(--brand-900)] flex items-center gap-2">
              <span>Customer Details</span>
              {crmCustomer && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  CRM: {crmCustomer.confirmedCount} confirmed orders
                </span>
              )}
            </h2>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">Card 1 of 5</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div className="space-y-1.5">
              <label htmlFor="edit-cust-name" className="text-xs font-bold text-slate-700">
                Customer Name
              </label>
              <Input
                id="edit-cust-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Kalyan Ramanathan"
                className="bg-slate-50/50"
              />
            </div>

            {/* Mobile number with green call icon */}
            <div className="space-y-1.5">
              <label htmlFor="edit-cust-phone" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Mobile Number <span className="text-red-500">*</span></span>
                <span className="text-[10px] text-[var(--text-muted)]">Required</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex rounded-xl overflow-hidden border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-[var(--brand-300)] focus-within:border-[var(--brand)]">
                  <span className="px-3 py-2 bg-slate-50 text-slate-700 font-bold text-xs flex items-center border-r border-slate-200 select-none">
                    +91
                  </span>
                  <input
                    id="edit-cust-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={cleanPhoneDisplay}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9845012345"
                    className="w-full px-3 py-2 text-xs sm:text-sm font-bold text-[var(--text-primary)] outline-none bg-transparent"
                  />
                </div>

                {/* Green Call Icon Button */}
                {cleanPhoneDisplay ? (
                  <a
                    href={telHref}
                    aria-label={`Call customer +91 ${cleanPhoneDisplay}`}
                    className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center shadow-xs transition-transform shrink-0 tap-target-48"
                    title={`Call +91 ${cleanPhoneDisplay}`}
                  >
                    <Phone className="w-4 h-4 fill-white" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    aria-label="Customer phone number not available"
                    className="w-10 h-10 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center shrink-0 cursor-not-allowed"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* (2) EVENT DETAILS CARD: Occasion, Date, Plates, Address  */}
        {/* ======================================================== */}
        <div className="content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-sm sm:text-base text-[var(--brand-900)]">
              Event & Function Details
            </h2>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">Card 2 of 5</span>
          </div>

          {/* Occasion type with quick suggestion chips */}
          <div className="space-y-2">
            <label htmlFor="edit-occasion" className="text-xs font-bold text-slate-700">
              Occasion Type
            </label>
            <div className="flex flex-wrap gap-1.5 pb-1">
              {OCCASION_SUGGESTIONS.map((occ) => (
                <button
                  key={occ}
                  type="button"
                  onClick={() => setOccasion(occ)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                    occasion.toLowerCase() === occ.toLowerCase()
                      ? 'bg-[var(--brand)] text-[var(--on-brand)] border-[var(--brand)]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>
            <Input
              id="edit-occasion"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="e.g. Wedding Reception, Gruhapravesha"
              className="bg-slate-50/50"
            />
          </div>

          {/* Date & Meal Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label htmlFor="edit-event-date" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Occasion Date <span className="text-red-500">*</span></span>
                <span className="text-[10px] text-[var(--text-muted)]">Required to confirm</span>
              </label>
              <div className="relative">
                <input
                  id="edit-event-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-bold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--brand-300)] focus:border-[var(--brand)]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Meal Timing</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Morning', 'Afternoon', 'Evening'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEventTime(t)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-colors ${
                      eventTime === t
                        ? 'bg-[var(--brand-900)] text-white border-[var(--brand-900)]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Number of plates stepper & input */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label htmlFor="edit-plates" className="text-xs font-bold text-slate-700">
                Number of Plates <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-[var(--text-muted)]">Required to confirm</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDecrementPlates}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 flex items-center justify-center font-bold tap-target-48 sm:tap-target-auto"
                title="Decrease 10 plates"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1">
                <input
                  id="edit-plates"
                  type="number"
                  min={0}
                  step={10}
                  value={plates || ''}
                  onChange={(e) => setPlates(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="e.g. 150"
                  className="w-full text-center py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-[var(--brand-900)] outline-none focus:ring-2 focus:ring-[var(--brand-300)] focus:border-[var(--brand)]"
                />
              </div>
              <button
                type="button"
                onClick={handleIncrementPlates}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 flex items-center justify-center font-bold tap-target-48 sm:tap-target-auto"
                title="Increase 10 plates"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-1.5 pt-1">
            <label htmlFor="edit-address" className="text-xs font-bold text-slate-700">
              Delivery / Banquet Address
            </label>
            <Textarea
              id="edit-address"
              rows={2}
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="e.g. Kalyana Mantapa / Residence Address, Mysuru"
              className="bg-slate-50/50"
            />
          </div>

          {/* Special Instructions */}
          <div className="space-y-1.5 pt-1">
            <label htmlFor="edit-instructions" className="text-xs font-bold text-slate-700">
              Special Instructions
            </label>
            <Textarea
              id="edit-instructions"
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Less spicy sambar, traditional banana leaf layout, extra coffee decoction"
              className="bg-slate-50/50"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* (3) SELECTED FOOD ITEMS CARD                             */}
        {/* ======================================================== */}
        <div className="content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-black text-sm sm:text-base text-[var(--brand-900)] flex items-center gap-2">
                <span>Selected Food Items</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  {itemsList.length} dishes
                </span>
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">Card 3 of 5</p>
            </div>

            <button
              type="button"
              onClick={() => setIsFoodSheetOpen(true)}
              className="px-3.5 py-2 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform tap-target-48 sm:tap-target-auto"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Add / change items</span>
            </button>
          </div>

          {/* Item rows */}
          {itemsList.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/40">
              {itemsList.map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0 select-none">
                      🍛
                    </span>
                    <span className="font-bold text-[var(--text-primary)]">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-600">
                      {formatRupees(item.pricePerPlate)} / plate
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                      title="Remove dish"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Footer row showing price per plate */}
              <div className="p-3 bg-white flex items-center justify-between font-bold text-xs sm:text-sm border-t border-slate-200">
                <span className="text-slate-700">Total Price per plate</span>
                <span className="text-[var(--brand-900)] text-sm sm:text-base font-black">
                  {formatRupees(perPlatePrice)} / plate
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center space-y-2 bg-slate-50/50">
              <p className="text-xs text-slate-500 font-medium">
                No food items currently attached to this order.
              </p>
              <button
                type="button"
                onClick={() => setIsFoodSheetOpen(true)}
                className="text-xs font-bold text-[var(--brand)] hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Open catering catalogue to add dishes</span>
              </button>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* (4) ENQUIRY NOTES CARD                                   */}
        {/* ======================================================== */}
        <div className="content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-sm sm:text-base text-[var(--brand-900)]">
              Enquiry Notes
            </h2>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">Card 4 of 5</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            A short note about the phone conversation, in-person discussions, or follow-up details with the customer.
          </p>
          <Textarea
            rows={3}
            value={enquiryNotes}
            onChange={(e) => setEnquiryNotes(e.target.value)}
            placeholder="e.g. Spoke to groom's father regarding muhurtham timing at 7:30 AM. Tasting scheduled for next Saturday."
            className="bg-slate-50/50"
          />
          </div>
          </div>

          {/* Right Pane (5 cols on 1024px+, sticky top-24) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 min-w-0">
            {/* (5) PRICING & BILLING CARD (All maths in src/lib/pricing) */}
            <div className="content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-sm sm:text-base text-[var(--brand-900)]">
              Pricing & Billing
            </h2>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">Card 5 of 5</span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            {/* Food Subtotal (Read-only) */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Food Subtotal</p>
                <p className="text-[11px] text-slate-500">
                  {formatRupees(perPlatePrice)} × {plates} plates (Auto-calculated)
                </p>
              </div>
              <p className="font-heading font-black text-base text-[var(--brand-900)]">
                {formatRupees(pricingResult.foodSubtotal)}
              </p>
            </div>

            {/* Delivery Charges (₹ input) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label htmlFor="edit-delivery" className="font-bold text-slate-700 text-xs">
                  Delivery Charges (₹)
                </label>
                <p className="text-[10px] text-slate-500">Logistics and transport</p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold select-none">₹</span>
                <input
                  id="edit-delivery"
                  type="number"
                  min={0}
                  value={deliveryCharges || ''}
                  onChange={(e) => setDeliveryCharges(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[var(--brand-300)]"
                />
              </div>
            </div>

            {/* Customization Charges (₹ input) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label htmlFor="edit-customization" className="font-bold text-slate-700 text-xs">
                  Customization Charges (₹)
                </label>
                <p className="text-[10px] text-slate-500">Extra live counters, premium setup</p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold select-none">₹</span>
                <input
                  id="edit-customization"
                  type="number"
                  min={0}
                  value={customizationCharges || ''}
                  onChange={(e) => setCustomizationCharges(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[var(--brand-300)]"
                />
              </div>
            </div>

            {/* GST (one input with % / ₹ toggle) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <div className="flex items-center gap-1.5">
                  <label htmlFor="edit-gst" className="font-bold text-slate-700 text-xs">
                    GST Tax
                  </label>
                  {/* Mode Toggle Buttons */}
                  <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setGstMode('percent')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        gstMode === 'percent'
                          ? 'bg-white text-[var(--brand)] shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      % Rate
                    </button>
                    <button
                      type="button"
                      onClick={() => setGstMode('fixed')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        gstMode === 'fixed'
                          ? 'bg-white text-[var(--brand)] shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ₹ Fixed
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Calculated GST: <span className="font-bold text-slate-700">{formatRupees(pricingResult.gstAmount)}</span>
                </p>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold select-none">
                  {gstMode === 'percent' ? '%' : '₹'}
                </span>
                <input
                  id="edit-gst"
                  type="number"
                  min={0}
                  value={gstValue || ''}
                  onChange={(e) => setGstValue(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder={gstMode === 'percent' ? '5' : '1000'}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[var(--brand-300)]"
                />
              </div>
            </div>

            {/* Formula in small grey text */}
            <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-[11px] text-slate-500 font-mono">
              <span className="font-bold text-slate-700 block mb-0.5 font-sans">Formula Breakdown:</span>
              <span>{pricingResult.formulaText}</span>
            </div>

            {/* Final Total (Auto, large, brand colour) */}
            <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
              <div>
                <p className="font-heading font-black text-sm sm:text-base text-[var(--brand-900)]">
                  Final Grand Total
                </p>
                <p className="text-[10px] text-slate-400">All services & taxes included</p>
              </div>
              <p className="font-heading font-black text-2xl sm:text-3xl text-[var(--brand)] tracking-tight">
                {formatRupees(pricingResult.finalTotal)}
              </p>
            </div>

            {/* Final instructions textarea */}
            <div className="space-y-1.5 pt-2">
              <label htmlFor="edit-final-instructions" className="text-xs font-bold text-slate-700">
                Final Billing Instructions
              </label>
              <Textarea
                id="edit-final-instructions"
                rows={2}
                value={finalInstructions}
                onChange={(e) => setFinalInstructions(e.target.value)}
                placeholder="e.g. 50% advance received via NEFT. Balance due on event day. Bill in name of Raghavendra Rao."
                className="bg-slate-50/50"
              />
            </div>

            <p className="text-[11px] text-center text-slate-400 font-medium pt-2 border-t border-slate-100">
              Payment is handled separately outside this system.
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* (7) INVOICE CARD (Visible ONLY after confirmation)       */}
        {/* ======================================================== */}
        {isConfirmedOrLater && (
          <div className="content-card p-5 rounded-[22px] bg-gradient-to-br from-amber-50/60 to-orange-50/40 border border-amber-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold">
                  📄
                </span>
                <div>
                  <h3 className="font-heading font-black text-sm sm:text-base text-[var(--brand-900)]">
                    Official Banquet Invoice & Function Sheet
                  </h3>
                  <p className="text-xs text-amber-800">
                    Confirmed order document ready for client delivery and kitchen printout.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Ready
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-900">Total Billed:</span> {formatRupees(pricingResult.finalTotal)} • {itemsList.length} dishes • {plates} plates
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsBEOSheetOpen(true)}
                  className="px-4 py-2.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors tap-target-48 sm:tap-target-auto cursor-pointer"
                >
                  <ChefHat className="w-4 h-4 text-amber-600" />
                  <span>Kitchen BEO</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/admin/orders/${initialOrder.id}/invoice`)}
                  className="px-5 py-2.5 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] active:scale-95 text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform tap-target-48 sm:tap-target-auto cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Generate invoice</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
    </div>

      {/* ======================================================== */}
      {/* (6) ACTION BAR (glass, floating, compact)                */}
      {/* ======================================================== */}
      <div className={`fixed bottom-3 sm:bottom-5 inset-x-3 sm:inset-x-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-4xl z-30 glass-floating-bar rounded-2xl sm:rounded-full px-3.5 py-2 sm:px-5 sm:py-2.5 shadow-xl border border-slate-200/90 transition-all duration-200 ${
        isKeyboardOpen ? 'translate-y-full opacity-0 pointer-events-none lg:translate-y-0 lg:opacity-100 lg:pointer-events-auto' : 'translate-y-0 opacity-100'
      }`}>
        <div className="w-full">

          {/* If Dirty: show Save Bar */}
          {isDirty ? (
            <div className="flex items-center justify-between gap-2.5 sm:gap-4 w-full">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span className="text-xs font-bold text-amber-900 truncate">
                  You have unsaved changes on this order
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDiscardChanges}
                  disabled={isSaving}
                  className="h-8 px-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 active:scale-95 transition-all"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={isSaving || !isOnline}
                  className="h-8 px-4 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Status-aware Action Bar when clean */
            <div className="flex items-center justify-between gap-2.5 sm:gap-4 w-full flex-wrap sm:flex-nowrap">
              {/* Left helper / status info */}
              <div className="min-w-0">
                {(initialOrder.status === 'New Request' || initialOrder.status === 'Under Discussion') ? (
                  !canConfirm ? (
                    <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Add occasion date & plates to confirm</span>
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Requirements ready to confirm banquet booking</span>
                    </p>
                  )
                ) : (
                  <p className="text-xs font-bold text-slate-600 whitespace-nowrap">
                    Status: <span className="text-[var(--brand-900)]">{initialOrder.status}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons based on status */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                {(initialOrder.status === 'New Request' || initialOrder.status === 'Under Discussion') && (
                  <>
                    {initialOrder.status === 'New Request' && (
                      <button
                        type="button"
                        onClick={handleMarkUnderDiscussion}
                        disabled={!isOnline}
                        className="h-8 sm:h-8.5 px-3.5 sm:px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        Mark Under Discussion
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsConfirmDialogOpen(true)}
                      disabled={!canConfirm || !isOnline}
                      className="h-8 sm:h-8.5 px-4 sm:px-5 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white font-heading font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Confirm order</span>
                    </button>
                  </>
                )}

                {initialOrder.status === 'Confirmed' && (
                  <>
                    <button
                      type="button"
                      onClick={handleMarkCompleted}
                      disabled={!isOnline}
                      className="h-8 sm:h-8.5 px-3.5 sm:px-4 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      Mark Completed
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsBEOSheetOpen(true)}
                      className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                      title="View and print Kitchen BEO procurement sheet"
                    >
                      <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                      <span>BEO</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/admin/orders/${initialOrder.id}/invoice`)}
                      className="h-8 sm:h-8.5 px-3.5 sm:px-4.5 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-transform shrink-0"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Generate invoice</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenCancelDialog}
                      disabled={!isOnline}
                      className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs border border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      Cancel order
                    </button>
                  </>
                )}

                {isTerminalStatus && (
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/orders/${initialOrder.id}/invoice`)}
                    className="h-8 sm:h-8.5 px-4 sm:px-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-transform shrink-0"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>View banquet sheet</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* FOOD ITEMS SELECTION BOTTOM SHEET                        */}
      {/* ======================================================== */}
      <Sheet open={isFoodSheetOpen} onOpenChange={setIsFoodSheetOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="max-h-[85vh] h-[85vh] rounded-t-[24px] p-0 flex flex-col bg-[var(--bg-base)]">
          <SheetHeader className="p-4 sm:p-5 border-b border-slate-200/80 bg-white sticky top-0 z-10 flex flex-row items-center justify-between shrink-0">
            <div>
              <SheetTitle className="font-heading font-black text-base sm:text-lg text-[var(--brand-900)]">
                Select Catering Menu Items
              </SheetTitle>
              <p className="text-xs text-[var(--text-muted)] font-medium">
                {itemsList.length} items chosen • {formatRupees(perPlatePrice)} / plate
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

          {/* Grid of ItemCards */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 pb-20">
              {filteredCategoryItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isSelected={itemsList.some((i) => i.id === item.id)}
                  onToggle={handleToggleCatalogueItem}
                />
              ))}
            </div>
          </div>

          {/* Bottom Sticky Action inside Sheet */}
          <div className="sticky bottom-0 z-20 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--brand-900)]">
                {itemsList.length} items attached
              </p>
              <p className="text-xs text-[var(--text-muted)] font-semibold">
                Per plate: <span className="text-[var(--brand)] font-bold">{formatRupees(perPlatePrice)}</span>
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

      {/* ======================================================== */}
      {/* CONFIRM ORDER ALERT DIALOG                               */}
      {/* ======================================================== */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-black text-lg text-[var(--brand-900)]">
              Confirm this order?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm text-slate-600">
              Confirm this order after verifying requirements with the customer?
              Once confirmed, this event will appear on the banquet calendar and the official function invoice can be generated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex gap-2">
            <AlertDialogCancel className="rounded-full text-xs font-bold">
              Back to edit
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmOrder}
              className="rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white text-xs font-bold"
            >
              Confirm Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ======================================================== */}
      {/* CANCEL ORDER ALERT DIALOG (Passcode Protected)           */}
      {/* ======================================================== */}
      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={(open) => {
          setIsCancelDialogOpen(open)
          if (!open) {
            setCancelPasscode('')
            setPasscodeError('')
            setShowCancelPasscode(false)
          }
        }}
      >
        <AlertDialogContent className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-w-md">
          <AlertDialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <AlertDialogTitle className="font-heading font-black text-lg text-rose-900 leading-tight">
                  Cancel Catering Order
                </AlertDialogTitle>
                <p className="text-xs text-rose-600 font-semibold">
                  Order #{initialOrder.id} • {initialOrder.customerName}
                </p>
              </div>
            </div>
            <AlertDialogDescription className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Cancelling will remove this booking from the active banquet schedule and kitchen sheets. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Passcode input field */}
          <div className="space-y-2 py-3 border-y border-slate-100 my-1">
            <label htmlFor="cancel-order-passcode" className="block text-xs font-bold text-slate-700">
              Enter Admin Passcode to Authorize <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="cancel-order-passcode"
                type={showCancelPasscode ? 'text' : 'password'}
                autoFocus
                value={cancelPasscode}
                onChange={(e) => {
                  setCancelPasscode(e.target.value)
                  if (passcodeError) setPasscodeError('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleConfirmCancel()
                  }
                }}
                placeholder="Enter passcode (e.g. 1965)"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-mono outline-none transition-all pr-10 ${
                  passcodeError
                    ? 'border-rose-400 bg-rose-50/50 focus:ring-2 focus:ring-rose-200 text-rose-900'
                    : 'border-slate-200 bg-slate-50/50 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-200)] text-slate-900'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCancelPasscode(!showCancelPasscode)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                title={showCancelPasscode ? 'Hide passcode' : 'Show passcode'}
              >
                {showCancelPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {passcodeError ? (
              <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{passcodeError}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 font-medium">
                Admin authorization passcode: <span className="font-mono font-bold text-slate-600">1965</span>
              </p>
            )}
          </div>

          <AlertDialogFooter className="mt-3 flex gap-2 sm:justify-end">
            <AlertDialogCancel
              onClick={() => {
                setIsCancelDialogOpen(false)
                setCancelPasscode('')
                setPasscodeError('')
              }}
              className="rounded-full text-xs font-bold px-4 py-2 hover:bg-slate-100"
            >
              Keep Order Active
            </AlertDialogCancel>
            <button
              type="button"
              id="confirm-cancel-order-btn"
              onClick={handleConfirmCancel}
              disabled={!cancelPasscode.trim() || isCancelling}
              className="rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Kitchen BEO Procurement & Dispatch Sheet Modal */}
      {initialOrder && (
        <KitchenBEOSheetModal
          order={initialOrder}
          isOpen={isBEOSheetOpen}
          onClose={() => setIsBEOSheetOpen(false)}
        />
      )}

    </AdminAppShell>
  )
}

export default AdminOrderDetailPage
