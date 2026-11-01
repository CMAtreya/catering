import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'

import { getOrder, confirmOrder, setStatus, getCatalogue } from '@/api'
import type { Order, OrderStatus, OrderItem } from '@/data/mockData'

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeCatalogueCategory, setActiveCatalogueCategory] = useState<string>('all')

  // Form & calculations state
  const [customerName, setCustomerName] = useState<string>('Srinivas Raghavan')
  const [customerPhone, setCustomerPhone] = useState<string>('+91 98450 12345')
  const [occasionType, setOccasionType] = useState<string>('Griha Pravesh')
  const [occasionDate, setOccasionDate] = useState<string>('18 Nov 2025')
  const [plateCount, setPlateCount] = useState<number>(100)
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    'No. 42, 3rd Main, Vani Vilas Mohalla, Agrahara, Mysuru - 570004'
  )
  const [specialInstructions, setSpecialInstructions] = useState<string>(
    'Pure cow ghee only. Strictly no onion, no garlic. Melkote tradition thindi format.'
  )
  const [dispatchNote, setDispatchNote] = useState<string>(
    'Deliver hot containers by 7:45 AM sharp to the Kalyana Mantapa kitchen.'
  )

  // Delicacies list
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([
    { id: 'item-1', name: 'Mysuru Puliyogare', pricePerPlate: 65, quantity: 1 },
    { id: 'item-2', name: 'Bisi Bele Bath (Pure Ghee)', pricePerPlate: 85, quantity: 1 },
    { id: 'item-3', name: 'Melkote Majjige Huli', pricePerPlate: 50, quantity: 1 },
    { id: 'item-4', name: 'Royal Mysuru Pak (Pure Desi Ghee)', pricePerPlate: 50, quantity: 1 },
    { id: 'item-5', name: 'Mysuru Degree Filter Coffee', pricePerPlate: 35, quantity: 1 }
  ])

  // Logistics & service setup inputs
  const [logisticsCharge, setLogisticsCharge] = useState<number>(1500)
  const [serviceCharge, setServiceCharge] = useState<number>(1000)

  // Coordination notes log
  const [notesList, setNotesList] = useState<Array<{ id: string; author: string; time: string; text: string }>>([
    {
      id: 'note-1',
      author: 'Raghavan (Manager)',
      time: '18 Nov, 10:15 AM',
      text: 'Customer called to confirm morning muhurtham timing (8:30 AM leaf serving). Uruli arrangement verified.'
    },
    {
      id: 'note-2',
      author: 'Kitchen Supervisor',
      time: '17 Nov, 04:30 PM',
      text: 'Confirmed fresh Melkote Majjige Huli ingredient availability and organic sour curd supply.'
    }
  ])
  const [newNoteText, setNewNoteText] = useState<string>('')

  // Modals state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false)
  const [isFoodPickerOpen, setIsFoodPickerOpen] = useState<boolean>(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false)

  // Passcode Cancel Modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false)
  const [cancelPasscode, setCancelPasscode] = useState<string>('')
  const [cancelError, setCancelError] = useState<string>('')

  // Toast / copy state
  const [isCopiedToastVisible, setIsCopiedToastVisible] = useState<boolean>(false)

  // Fetch order data and catalogue on mount
  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setIsLoading(true)
      try {
        if (id) {
          const found = await getOrder(id)
          if (isMounted && found) {
            setOrder(found)
            setCustomerName(found.customerName || 'Srinivas Raghavan')
            setCustomerPhone(found.customerPhone || '+91 98450 12345')
            setOccasionType(found.eventType || 'Griha Pravesh')
            setOccasionDate(found.eventDate ? found.eventDate : '18 Nov 2025')
            setPlateCount(found.guestCount || 100)
            if (found.venueAddress) setDeliveryAddress(found.venueAddress)
            if (found.notes) setSpecialInstructions(found.notes)
            if (found.items && found.items.length > 0) {
              setSelectedItems(found.items)
            }
            if (found.deliveryCharges !== undefined) setLogisticsCharge(found.deliveryCharges)
            if (found.customizationCharges !== undefined) setServiceCharge(found.customizationCharges)
          } else if (isMounted) {
            // Seed a fallback order matching ID
            const fallback: Order = {
              id: id || 'TKS-84920',
              source: 'Online',
              status: 'New Request',
              customerName: 'Srinivas Raghavan',
              customerPhone: '9845012345',
              eventDate: '2025-11-18',
              eventTime: 'Morning',
              eventType: 'Griha Pravesh',
              guestCount: 100,
              venueAddress: 'No. 42, 3rd Main, Vani Vilas Mohalla, Agrahara, Mysuru - 570004',
              notes: 'Pure cow ghee only. Strictly no onion, no garlic.',
              items: selectedItems,
              perPlateTotal: 285,
              totalAmount: 32550,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
            setOrder(fallback)
          }
        }

        await getCatalogue().catch(() => null)
      } catch (err) {
        console.error('Failed to load order:', err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [id])

  // Calculations
  const baseRatePerPlate = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + (item.pricePerPlate || 0), 0)
  }, [selectedItems])

  const foodSubtotal = useMemo(() => {
    return baseRatePerPlate * Math.max(1, plateCount)
  }, [baseRatePerPlate, plateCount])

  const gstAmount = useMemo(() => {
    return Math.round((foodSubtotal + logisticsCharge + serviceCharge) * 0.05)
  }, [foodSubtotal, logisticsCharge, serviceCharge])

  const grandTotal = useMemo(() => {
    return foodSubtotal + logisticsCharge + serviceCharge + gstAmount
  }, [foodSubtotal, logisticsCharge, serviceCharge, gstAmount])

  // Clean telephone format helper: returns e.g. "tel:+919845012345"
  const cleanTelHref = useMemo(() => {
    const raw = customerPhone.replace(/\D/g, '')
    if (raw.length === 10) return `tel:+91${raw}`
    if (raw.length === 12 && raw.startsWith('91')) return `tel:+${raw}`
    return `tel:+91${raw.slice(-10)}`
  }, [customerPhone])

  // Current order status
  const currentStatus: OrderStatus = order?.status || 'New Request'

  // Change order status helper
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return
    try {
      await setStatus(order.id, newStatus)
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
      toast.success(`Status updated to: ${newStatus}`)
    } catch (err) {
      console.error('Failed to set status:', err)
      toast.error('Could not update status')
    }
  }

  // Execute Order Confirmation
  const handleExecuteConfirmation = async () => {
    if (!order) return
    try {
      await confirmOrder(order.id)
      setOrder((prev) => (prev ? { ...prev, status: 'Confirmed' } : null))
      setIsConfirmModalOpen(false)
      toast.success('Order confirmed successfully! Banquet Tax Invoice is now unlocked.')
    } catch (err) {
      console.error('Confirmation failed:', err)
      toast.error('Failed to confirm order')
    }
  }

  // Authorize Cancellation with Passcode 1965
  const handleConfirmCancelOrder = async () => {
    if (cancelPasscode.trim() !== '1965') {
      setCancelError('Incorrect passcode')
      return
    }

    if (!order) return
    try {
      await setStatus(order.id, 'Cancelled')
      setOrder((prev) => (prev ? { ...prev, status: 'Cancelled' } : null))
      setIsCancelModalOpen(false)
      setCancelPasscode('')
      setCancelError('')
      toast.error('This catering request was cancelled.')
    } catch (err) {
      console.error('Cancel failed:', err)
      toast.error('Could not cancel order')
    }
  }

  // Remove Delicacy Row
  const handleRemoveItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index))
  }

  // Add Item from Catalogue
  const handleAddCatalogueItem = (name: string, price: number) => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      name,
      pricePerPlate: price,
      quantity: 1
    }
    setSelectedItems((prev) => [...prev, newItem])
    setIsFoodPickerOpen(false)
    toast.success(`Added ${name} (₹${price}/plate)`)
  }

  // Add Internal Coordination Note
  const handleAddNote = () => {
    if (!newNoteText.trim()) return
    const newNote = {
      id: `note-${Date.now()}`,
      author: 'Desk Supervisor',
      time: 'Just now',
      text: newNoteText.trim()
    }
    setNotesList((prev) => [newNote, ...prev])
    setNewNoteText('')
    toast.success('Note added to internal coordination log')
  }

  // Copy Order ID
  const handleCopyOrderId = () => {
    const copyText = `#${order?.id || id || 'TKS-84920'}`
    navigator.clipboard?.writeText(copyText).catch(() => {})
    setIsCopiedToastVisible(true)
    setTimeout(() => setIsCopiedToastVisible(false), 1800)
  }

  // Copy Share Proposal Link
  const handleCopyShareLink = () => {
    const shareUrl = `https://catering.tksiyengar.in/order/${order?.id || id || '84920'}`
    navigator.clipboard?.writeText(shareUrl).catch(() => {})
    setIsShareModalOpen(false)
    toast.success('Proposal link copied to clipboard!')
  }

  if (isLoading || !order) {
    return (
      <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col font-body-md text-body-md">
        <header className="bg-surface/85 backdrop-blur-md border-b border-outline-variant/60 sticky top-0 z-50 py-4 px-4 sm:px-8 shadow-xs">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest animate-pulse" />
              <div>
                <div className="h-4 w-36 bg-surface-container-highest rounded animate-pulse" />
                <div className="h-3 w-24 bg-surface-container-highest rounded mt-1 animate-pulse" />
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-on-surface-variant font-mono">Loading order specification #{id}...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col font-body-md text-body-md selection:bg-primary-fixed selection:text-on-primary-fixed">

      {/* ========================================================
           1. TOP APP BAR (Flagship Heritage Header)
           ======================================================== */}
      <header className="bg-surface/85 backdrop-blur-md text-primary docked full-width top-0 sticky z-50 border-b border-outline-variant/60 shadow-xs">
        <div className="flex justify-between items-center w-full px-4 md:px-8 2xl:px-12 h-20">
          
          {/* Brand & Section Title */}
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-3 group">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpkBNPj4-1JNjKS6MW7bmxBj2ggTlPkACLO6d2iNNjbzSl79bObZAULQjZhSeiomQLyvgzTUhs2Od23ax4MDN0I9eNQYN1q_Hb1kSE_qxGZlDcWzoImM-8hmzWkJQ-Cjdy9gRuvLdPjC1cOYI9pBVfr0x3pFp2SOxLKEwb_0o-nZXSpDE26S3dJic0FC-XqXONgZ_NFTAdzHafQd3FUs6hU7gGVjoNUz1jJKLmy1mvgRW89hGwsPGY"
                alt="TKS Iyengar's Logo"
                className="h-11 w-auto object-contain drop-shadow-sm group-hover:scale-102 transition-transform"
              />
              <div className="hidden sm:block">
                <span className="text-headline-md font-serif font-bold text-primary tracking-wide block leading-none">
                  TKS Iyengar's Catering
                </span>
                <span className="text-[11px] font-bold text-secondary tracking-widest block mt-0.5">
                  MYSURU TRADITION • DESK PORTAL
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Global Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 text-label-lg font-label-lg">
            <Link to="/admin" className="text-on-surface-variant hover:text-primary transition-colors font-semibold">
              Dashboard
            </Link>
            <Link to="/admin/orders" className="text-primary border-b-2 border-primary pb-1 font-bold">
              All Orders
            </Link>
            <Link to="/admin/menu" className="text-on-surface-variant hover:text-primary transition-colors font-semibold">
              Catering Menus
            </Link>
            <Link to="/admin/customers" className="text-on-surface-variant hover:text-primary transition-colors font-semibold">
              Customers
            </Link>
          </nav>

          {/* Trailing Action Cluster */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/50 text-xs font-semibold text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-tertiary-container mr-1.5">
                verified
              </span>
              100% Sattvic Iyengar Pure Ghee
            </div>

            <Link
              to="/admin"
              className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all duration-200"
              title="Calendar Schedule"
            >
              <span className="material-symbols-outlined">calendar_month</span>
            </Link>

            <Link
              to="/admin/orders"
              className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all duration-200 relative"
              title="All Orders"
            >
              <span className="material-symbols-outlined">receipt_long</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary"></span>
            </Link>

            <div className="h-8 w-px bg-outline-variant/60 mx-1"></div>

            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs">
                TR
              </div>
              <div className="hidden xl:block text-left text-xs">
                <p className="font-semibold text-on-surface leading-tight">T. Raghavan</p>
                <p className="text-secondary text-[11px] leading-tight">Head Acharya</p>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* ========================================================
           2. MAIN CONTAINER WITH LEFT SIDEBAR & WORKSPACE
           ======================================================== */}
      <div className="flex-1 flex w-full">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-60 hidden md:flex flex-col border-r border-outline-variant/50 bg-surface-container-low/40 py-6 px-3 justify-between">
          <div className="space-y-6">
            
            {/* Sub-brand Tag */}
            <div className="px-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-outline">
                MANAGEMENT CONSOLE
              </p>
              <p className="text-title-md font-serif font-bold text-primary mt-0.5">
                Agrahara Branch
              </p>
            </div>

            {/* Sidebar Navigation */}
            <nav className="space-y-1">
              <Link
                to="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors font-semibold text-xs"
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                <span>Dashboard</span>
              </Link>

              <Link
                to="/admin/orders"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary-fixed text-on-primary-fixed font-bold text-xs shadow-xs"
              >
                <span className="material-symbols-outlined text-[20px] text-primary">receipt_long</span>
                <span>All Orders</span>
                <span className="ml-auto bg-primary text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                  12
                </span>
              </Link>

              <Link
                to="/admin/menu"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors font-semibold text-xs"
              >
                <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
                <span>Catering Menu</span>
              </Link>

              <Link
                to="/admin/customers"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors font-semibold text-xs"
              >
                <span className="material-symbols-outlined text-[20px]">group</span>
                <span>Customers</span>
              </Link>
            </nav>

            {/* Quick Status Metrics */}
            <div className="bg-surface-container/60 p-3 rounded-xl border border-outline-variant/40 space-y-2">
              <span className="text-xs text-secondary block font-bold">Today's Muhurthams</span>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-lg font-bold text-primary">3 Banquets</span>
                <span className="text-xs text-tertiary font-bold">450 Leaves</span>
              </div>
              <p className="text-[11px] text-on-surface-variant">Melkote &amp; Mysore palace styles</p>
            </div>
          </div>

          {/* Bottom Sign Out */}
          <div className="border-t border-outline-variant/40 pt-4 px-2">
            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="w-full flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded-lg transition-colors font-semibold text-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MAIN DESK WORKSPACE */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6">
          
          {/* PREVIEW DESK STATES INTERACTIVE SWITCHER BAR */}
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs text-secondary font-bold">
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Preview Desk States:</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <button
                  type="button"
                  id="state-pill-new"
                  onClick={() => handleStatusChange('New Request')}
                  className={`px-2.5 py-1 rounded-full transition-all font-medium cursor-pointer ${
                    currentStatus === 'New Request'
                      ? 'bg-secondary-fixed text-on-secondary-fixed border border-secondary font-bold'
                      : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container border border-transparent'
                  }`}
                >
                  1. New Request
                </button>

                <button
                  type="button"
                  id="state-pill-discussion"
                  onClick={() => handleStatusChange('Under Discussion')}
                  className={`px-2.5 py-1 rounded-full transition-all font-medium cursor-pointer ${
                    currentStatus === 'Under Discussion'
                      ? 'bg-secondary-fixed text-on-secondary-fixed border border-secondary font-bold'
                      : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container border border-transparent'
                  }`}
                >
                  2. Under Discussion
                </button>

                <button
                  type="button"
                  id="state-pill-confirmed"
                  onClick={() => handleStatusChange('Confirmed')}
                  className={`px-2.5 py-1 rounded-full transition-all font-medium cursor-pointer ${
                    currentStatus === 'Confirmed'
                      ? 'bg-secondary-fixed text-on-secondary-fixed border border-secondary font-bold'
                      : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container border border-transparent'
                  }`}
                >
                  3. Confirmed (Ready)
                </button>

                <button
                  type="button"
                  id="state-pill-cancelled"
                  onClick={() => handleStatusChange('Cancelled')}
                  className={`px-2.5 py-1 rounded-full transition-all font-medium cursor-pointer ${
                    currentStatus === 'Cancelled'
                      ? 'bg-secondary-fixed text-on-secondary-fixed border border-secondary font-bold'
                      : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container border border-transparent'
                  }`}
                >
                  4. Cancelled
                </button>

                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-all font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">receipt</span>
                  <span>5. Show Invoice Modal (A4)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFoodPickerOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary border border-tertiary/20 hover:bg-tertiary/15 transition-all font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">menu_book</span>
                  <span>6. Food Picker Sheet</span>
                </button>
              </div>
            </div>
          </div>

          {/* CANCELLED STATE BANNER */}
          {currentStatus === 'Cancelled' && (
            <div id="cancelled-banner" className="bg-error-container/70 border-l-4 border-error text-on-error-container p-4 rounded-r-xl shadow-xs">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-error text-[24px]">cancel</span>
                <div>
                  <h4 className="font-bold text-error">
                    This order was cancelled on 18 Nov 2025. This catering request was cancelled.
                  </h4>
                  <p className="text-xs mt-0.5 text-on-surface-variant">
                    Reason: Customer rescheduled date beyond kitchen auspicious muhurtham slot availability. Read-only audit view enabled.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ORDER HEADER CONTROL BAR */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-outline-variant/60">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Link
                  to="/admin/orders"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-bold"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Back to All Orders</span>
                </Link>
                <span className="text-outline-variant">•</span>
                <div className="inline-flex items-center gap-1 bg-surface-container-high px-2.5 py-0.5 rounded-full border border-outline-variant/60 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[15px] text-tertiary">
                    {order?.source === 'Manual' ? 'storefront' : 'public'}
                  </span>
                  <span id="source-badge">
                    {order?.source === 'Manual' ? 'Manual Walk-in / Phone' : 'Online Web Enquiry'}
                  </span>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-3">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface flex items-center gap-2">
                  <span>Order</span>
                  <span className="text-primary font-bold">#{order?.id || id || 'TKS-84920'}</span>
                </h1>
                
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="p-1.5 hover:bg-surface-container text-on-surface-variant rounded-md transition-colors cursor-pointer"
                  title="Copy Order ID"
                >
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                </button>

                {isCopiedToastVisible && (
                  <span id="copy-toast" className="text-[12px] bg-inverse-surface text-inverse-on-surface px-2 py-0.5 rounded">
                    Copied!
                  </span>
                )}
              </div>
            </div>

            {/* Right Header Action Cluster */}
            <div className="flex items-center flex-wrap gap-3">
              
              {/* Status Indicator & Role="status" badge */}
              <div className="relative">
                <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-3 py-1.5 rounded-xl shadow-xs">
                  <span
                    role="status"
                    className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                      currentStatus === 'Confirmed'
                        ? 'text-emerald-800'
                        : currentStatus === 'Cancelled'
                        ? 'text-red-700'
                        : 'text-amber-800'
                    }`}
                  >
                    <span
                      id="status-indicator-dot"
                      className={`w-2.5 h-2.5 rounded-full ${
                        currentStatus === 'Confirmed'
                          ? 'bg-emerald-600'
                          : currentStatus === 'Cancelled'
                          ? 'bg-red-600'
                          : 'bg-amber-500 animate-pulse'
                      }`}
                    ></span>
                    <span>{currentStatus}</span>
                  </span>

                  <select
                    id="order-status-select"
                    value={
                      currentStatus === 'New Request'
                        ? 'new'
                        : currentStatus === 'Under Discussion'
                        ? 'discussion'
                        : currentStatus === 'Confirmed'
                        ? 'confirmed'
                        : currentStatus === 'Completed'
                        ? 'completed'
                        : 'cancelled'
                    }
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === 'new') handleStatusChange('New Request')
                      else if (v === 'discussion') handleStatusChange('Under Discussion')
                      else if (v === 'confirmed') handleStatusChange('Confirmed')
                      else if (v === 'completed') handleStatusChange('Completed')
                      else if (v === 'cancelled') handleStatusChange('Cancelled')
                    }}
                    className="bg-transparent border-0 text-xs font-semibold text-on-surface focus:ring-0 p-0 pr-6 cursor-pointer"
                  >
                    <option value="new">New Request (Awaiting Review)</option>
                    <option value="discussion">Under Discussion (Editing Details)</option>
                    <option value="confirmed">Confirmed (Invoice Ready)</option>
                    <option value="completed">Completed (Archived)</option>
                    <option value="cancelled">Cancelled (Read-only)</option>
                  </select>
                </div>
              </div>

              {/* Primary Confirm Action Button */}
              {currentStatus !== 'Confirmed' && currentStatus !== 'Cancelled' && (
                <button
                  type="button"
                  id="primary-confirm-btn"
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="primary-btn-gradient text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Confirm Order</span>
                </button>
              )}

              {/* Cancel Order Action Button (Passcode Protected) */}
              {currentStatus !== 'Cancelled' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCancelModalOpen(true)
                    setCancelPasscode('')
                    setCancelError('')
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-error bg-error-container/40 hover:bg-error-container border border-error/30 transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  <span>Cancel order</span>
                </button>
              )}

            </div>
          </div>

          {/* MAIN TWO-COLUMN WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            
            {/* LEFT COLUMN: Customer & Event Details + Selected Delicacies (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* CUSTOMER & EVENT CARD */}
              <div className="glass-card rounded-2xl p-6 relative">
                <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[22px]">person_pin</span>
                    </div>
                    <div>
                      <h2 className="text-title-lg font-serif font-bold text-on-surface">
                        Customer &amp; Muhurtham Banquet Spec
                      </h2>
                      <p className="text-xs text-on-surface-variant">Editable client brief for holy celebration</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                    <span className="material-symbols-outlined text-[15px]">check</span>
                    <span>Verified Caller</span>
                  </span>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* Customer Name */}
                  <div>
                    <label className="block text-on-surface-variant font-semibold mb-1">
                      Customer Name <span className="text-primary">*</span>
                    </label>
                    <input
                      id="cust-name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/80 rounded-xl px-3.5 py-2 text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>

                  {/* Contact Number with Call Link */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-on-surface-variant font-semibold">
                        Mobile Number <span className="text-primary">*</span>
                      </label>
                      <a
                        href={cleanTelHref}
                        className="text-primary hover:underline font-bold inline-flex items-center gap-0.5"
                        title="Call Customer"
                      >
                        <span className="material-symbols-outlined text-[14px]">call</span>
                        <span>Call</span>
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        id="cust-phone"
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant/80 rounded-xl px-3.5 py-2 text-xs font-mono focus:border-primary focus:ring-1 focus:ring-primary pr-20"
                      />
                      <span className="absolute right-2 top-2 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        WhatsApp
                      </span>
                    </div>
                  </div>

                  {/* Occasion Type Selector */}
                  <div>
                    <label className="block text-on-surface-variant font-semibold mb-1">
                      Occasion Type <span className="text-primary">*</span>
                    </label>
                    <select
                      id="occasion-type"
                      value={occasionType}
                      onChange={(e) => setOccasionType(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/80 rounded-xl px-3.5 py-2 text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option>Griha Pravesh</option>
                      <option>Wedding Muhurtham</option>
                      <option>Upanayana</option>
                      <option>Satyanarayana Pooja</option>
                      <option>Sashtiapthapoorthi (60th Birthday)</option>
                    </select>
                  </div>

                  {/* Occasion Date */}
                  <div>
                    <label className="block text-on-surface-variant font-semibold mb-1">
                      Occasion Date <span className="text-primary">*</span>
                    </label>
                    <input
                      id="occasion-date"
                      type="text"
                      value={occasionDate}
                      onChange={(e) => setOccasionDate(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/80 rounded-xl px-3.5 py-2 text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Number of Plates */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-on-surface-variant font-semibold">
                        Leaf Serving Count (Plates) <span className="text-primary">*</span>
                      </label>
                      <span className="text-secondary font-medium">Bale Ele (Plantain Leaf Service)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <input
                          id="plate-count-input"
                          type="number"
                          min="25"
                          step="5"
                          value={plateCount}
                          onChange={(e) => setPlateCount(Number(e.target.value) || 0)}
                          className="w-full bg-surface-container-lowest border border-outline-variant/80 rounded-xl px-3.5 py-2 text-base font-bold text-primary focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs text-on-surface-variant">
                          Plates Requested
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPlateCount(50)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            plateCount === 50
                              ? 'bg-primary-fixed text-on-primary-fixed font-bold'
                              : 'bg-surface-container hover:bg-surface-container-high'
                          }`}
                        >
                          50
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlateCount(100)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            plateCount === 100
                              ? 'bg-primary-fixed text-on-primary-fixed font-bold'
                              : 'bg-surface-container hover:bg-surface-container-high'
                          }`}
                        >
                          100
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlateCount(250)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            plateCount === 250
                              ? 'bg-primary-fixed text-on-primary-fixed font-bold'
                              : 'bg-surface-container hover:bg-surface-container-high'
                          }`}
                        >
                          250
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="md:col-span-2">
                    <label className="block text-on-surface-variant font-semibold mb-1">
                      Delivery / Kalyana Mantapa Address
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/80 rounded-xl px-3.5 py-2 text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Special Religious Instructions */}
                  <div className="md:col-span-2">
                    <label className="block text-on-surface-variant font-semibold mb-1">
                      Special Acharya &amp; Dietary Instructions
                    </label>
                    <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/50 flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">
                        temple_hindu
                      </span>
                      <input
                        type="text"
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        className="w-full bg-transparent border-0 p-0 text-xs font-medium text-on-surface focus:ring-0"
                      />
                    </div>
                  </div>

                </div>

                {/* ENQUIRY NOTES COORDINATION LOG */}
                <div className="mt-6 pt-5 border-t border-outline-variant/40">
                  <h3 className="text-xs font-bold text-on-surface mb-3 flex items-center justify-between">
                    <span>Internal Coordination Log</span>
                    <span className="text-on-surface-variant font-medium">{notesList.length} entries</span>
                  </h3>

                  {/* New Note Entry */}
                  <div className="flex gap-2 mb-4">
                    <input
                      id="new-note-text"
                      type="text"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddNote()
                        }
                      }}
                      placeholder="Add supervisor or client note..."
                      className="flex-1 bg-surface-container-lowest border border-outline-variant/80 rounded-xl px-3.5 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddNote}
                      className="px-4 py-1.5 bg-surface-container hover:bg-surface-container-high text-primary font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Add Note
                    </button>
                  </div>

                  {/* Note History List */}
                  <div id="notes-list" className="space-y-2.5">
                    {notesList.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 text-xs"
                      >
                        <div className="flex items-center justify-between text-secondary mb-1">
                          <span className="font-bold">{note.author}</span>
                          <span className="text-[11px] text-outline">{note.time}</span>
                        </div>
                        <p className="text-on-surface font-medium">{note.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* SELECTED FOOD ITEMS CARD */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-on-surface">
                        Selected Delicacies
                      </h2>
                      <span
                        id="items-count-badge"
                        className="bg-secondary-fixed text-on-secondary-fixed text-xs px-2.5 py-0.5 rounded-full font-bold"
                      >
                        {selectedItems.length} items
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">Traditional plantain leaf meal sequence</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFoodPickerOpen(true)}
                    className="px-3.5 py-2 bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span>Add Items</span>
                  </button>
                </div>

                {/* Delicacy List */}
                <div id="selected-delicacies-list" className="space-y-3">
                  {selectedItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="food-item-row flex items-center justify-between p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/40 hover:border-outline-variant transition-colors"
                      data-price={item.pricePerPlate}
                    >
                      <div className="flex items-center gap-3">
                        <div className="veg-marker-box">
                          <div className="veg-marker-dot"></div>
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-on-surface leading-snug">
                            {item.name}
                          </h3>
                          <p className="text-xs text-secondary">
                            Traditional Mysuru Iyengar pure ghee recipe
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-bold text-sm text-primary">₹{item.pricePerPlate}</span>
                          <span className="text-[11px] text-on-surface-variant block">/ plate</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-outline hover:text-error transition-colors p-1 cursor-pointer"
                          title="Remove delicacy"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delicacies Footnote */}
                <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Standard feast includes banana leaves, salt, pickle &amp; water cups.</span>
                  <span id="rate-summary-label" className="font-bold text-primary text-sm">
                    ₹{baseRatePerPlate} / Plate Subtotal
                  </span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Pricing & Finalization Desk (5 Cols - Sticky) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* PRICING BREAKDOWN CARD */}
              <div className="glass-card rounded-2xl p-6 sticky top-24 border border-outline-variant/70 shadow-md">
                <div className="flex items-center justify-between pb-4 border-b border-outline-variant/50">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary">
                    Banquet Pricing Breakdown
                  </h2>
                  <span className="text-[11px] bg-secondary-fixed text-on-secondary-fixed px-2.5 py-0.5 rounded-full font-bold">
                    TKS Iyengar Est. 1984
                  </span>
                </div>

                {/* Calculations List */}
                <div className="divide-y divide-outline-variant/30 mt-4 text-xs font-medium">
                  
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-on-surface-variant">Base Food Rate</span>
                    <span id="rate-per-plate-text" className="font-bold text-on-surface">
                      ₹{baseRatePerPlate} per plate
                    </span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-on-surface-variant">Plates Count</span>
                    <span id="plates-count-multiplier-text" className="font-bold text-on-surface">
                      × {plateCount} plates
                    </span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center bg-surface-container-low px-3 rounded-lg my-1">
                    <span className="font-bold text-on-surface">Food Subtotal</span>
                    <span id="food-subtotal-text" className="font-bold text-sm text-on-surface">
                      ₹{foodSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Delivery & Logistics Input */}
                  <div className="py-3 flex justify-between items-center gap-4">
                    <div>
                      <span className="text-on-surface-variant block font-semibold leading-tight">
                        Delivery &amp; Uruli Logistics
                      </span>
                      <span className="text-[11px] text-outline block">Tempo vehicle &amp; hot containers</span>
                    </div>
                    <div className="w-28 text-right">
                      <div className="flex items-center justify-end">
                        <span className="text-on-surface-variant mr-1 font-bold">₹</span>
                        <input
                          id="logistics-input"
                          type="number"
                          value={logisticsCharge}
                          onChange={(e) => setLogisticsCharge(Number(e.target.value) || 0)}
                          className="w-20 text-right bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-1 text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Setup Input */}
                  <div className="py-3 flex justify-between items-center gap-4">
                    <div>
                      <span className="text-on-surface-variant block font-semibold leading-tight">
                        Copper Vessel &amp; Service Setup
                      </span>
                      <span className="text-[11px] text-outline block">Plantain leaf servers &amp; clean up</span>
                    </div>
                    <div className="w-28 text-right">
                      <div className="flex items-center justify-end">
                        <span className="text-on-surface-variant mr-1 font-bold">₹</span>
                        <input
                          id="service-input"
                          type="number"
                          value={serviceCharge}
                          onChange={(e) => setServiceCharge(Number(e.target.value) || 0)}
                          className="w-20 text-right bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-1 text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* GST */}
                  <div className="py-3 flex justify-between items-center">
                    <div>
                      <span className="text-on-surface-variant block font-semibold leading-tight">
                        GST (5% Food &amp; Catering)
                      </span>
                      <span className="text-[11px] text-outline block">Govt. Catering Tax</span>
                    </div>
                    <span id="gst-amount-text" className="font-bold text-on-surface">
                      ₹{gstAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* GRAND TOTAL */}
                  <div className="pt-4 pb-2">
                    <div className="flex items-baseline justify-between">
                      <span className="font-serif text-lg font-bold text-on-surface">Final Amount</span>
                      <div className="text-right">
                        <span id="grand-total-amount" className="font-serif text-2xl font-black text-primary block leading-none">
                          ₹{grandTotal.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-secondary font-semibold">
                          All taxes &amp; brassware included
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Dispatch & Kitchen Timing Note */}
                <div className="mt-4 pt-3 border-t border-outline-variant/40">
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Dispatch &amp; Kitchen Timing Note
                  </label>
                  <textarea
                    rows={2}
                    value={dispatchNote}
                    onChange={(e) => setDispatchNote(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/70 rounded-xl px-3 py-1.5 text-xs"
                  />
                </div>

                {/* Payment Policy Callout */}
                <div className="mt-3.5 bg-surface-container-low p-3 rounded-xl border border-outline-variant/40 flex items-start gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-secondary text-[18px]">info</span>
                  <p>
                    Payment is handled separately — no direct payment is collected here. Cash or direct bank transfer on event day upon verification.
                  </p>
                </div>

                {/* Confirm Order Specification Action Button */}
                <div className="mt-5 space-y-2">
                  <button
                    type="button"
                    id="order-confirm-side-btn"
                    onClick={() => {
                      if (currentStatus !== 'Confirmed' && currentStatus !== 'Cancelled') {
                        setIsConfirmModalOpen(true)
                      }
                    }}
                    disabled={currentStatus === 'Confirmed' || currentStatus === 'Cancelled'}
                    className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      currentStatus === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 opacity-90'
                        : currentStatus === 'Cancelled'
                        ? 'bg-red-100 text-red-800 border border-red-300 opacity-90'
                        : 'primary-btn-gradient text-white shadow-md active:scale-98'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {currentStatus === 'Confirmed' ? 'check_circle' : 'assignment_turned_in'}
                    </span>
                    <span>
                      {currentStatus === 'Confirmed'
                        ? '✓ Order Confirmed'
                        : currentStatus === 'Cancelled'
                        ? 'Order Cancelled'
                        : 'Confirm Order Specification'}
                    </span>
                  </button>
                  <p id="validation-note" className="text-[11px] text-center text-outline font-medium">
                    ✓ Occasion date and plates count are valid for confirmation.
                  </p>
                </div>

                {/* INVOICE SECTION (DYNAMIC STATE) */}
                <div className="mt-6 pt-5 border-t border-outline-variant/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-primary">receipt</span>
                      <span>Banquet Tax Invoice</span>
                    </h3>
                    <span
                      id="invoice-status-pill"
                      className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                        currentStatus === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentStatus === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {currentStatus === 'Confirmed'
                        ? 'Ready for Print'
                        : currentStatus === 'Cancelled'
                        ? 'Order Voided'
                        : 'Pending Confirmation'}
                    </span>
                  </div>

                  {/* Unconfirmed State Helper */}
                  {currentStatus !== 'Confirmed' ? (
                    <div
                      id="invoice-locked-state"
                      className="p-3 bg-surface-container-low rounded-xl border border-dashed border-outline text-xs text-on-surface-variant text-center"
                    >
                      <span className="material-symbols-outlined text-outline text-[22px] block mx-auto mb-1">
                        lock
                      </span>
                      Confirm the order to unlock generation of official GST invoice &amp; printable estimation slips.
                    </div>
                  ) : (
                    /* Confirmed State Actions */
                    <div id="invoice-active-state" className="space-y-2">
                      <Link
                        to={`/admin/orders/${order?.id || id || 'TKS-84920'}/invoice`}
                        className="w-full py-2.5 px-4 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-primary rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                        <span>Generate / View Invoice (A4)</span>
                      </Link>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            toast.success(`Downloading official A4 banquet slip: TKS-INV-${order?.id || id}.pdf`)
                            window.print()
                          }}
                          className="py-2 px-3 bg-surface-container-lowest hover:bg-surface-container border border-outline-variant rounded-xl text-xs font-semibold text-on-surface flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px] text-secondary">download</span>
                          <span>Download PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsShareModalOpen(true)}
                          className="py-2 px-3 bg-surface-container-lowest hover:bg-surface-container border border-outline-variant rounded-xl text-xs font-semibold text-on-surface flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px] text-primary">share</span>
                          <span>Share Details</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>

          </div>

        </main>
      </div>

      {/* FOOTER */}
      <footer className="w-full bg-surface-container-low border-t border-outline-variant/50 mt-12">
        <div className="w-full px-4 md:px-12 2xl:px-16 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="font-serif text-lg font-bold text-primary block">TKS Iyengar's Catering</span>
            <p className="text-xs text-on-surface-variant max-w-xl mt-1">
              © 2025 TKS Iyengar's Catering Services, Mysuru. Pure Vegetarian Tradition &amp; Heritage Feasts. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-on-surface-variant font-medium">
            <Link to="/#tradition" className="hover:text-primary transition-colors">Sacred Menu Heritage</Link>
            <Link to="/#muhurtham" className="hover:text-primary transition-colors">Muhurtham Packages</Link>
            <Link to="/#tradition" className="hover:text-primary transition-colors">Purity Guarantee</Link>
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY FLOATING ACTION BAR (< md screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-surface/90 backdrop-blur-lg border-t border-outline-variant/60 flex items-center justify-between z-40">
        <div>
          <span className="text-[11px] text-on-surface-variant block">Total ({plateCount} Plates)</span>
          <span id="mobile-total-text" className="font-serif text-lg font-bold text-primary">
            ₹{grandTotal.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsInvoiceModalOpen(true)}
            className="p-2.5 bg-surface-container border border-outline-variant text-primary rounded-xl cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">receipt</span>
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={currentStatus === 'Confirmed' || currentStatus === 'Cancelled'}
            className="primary-btn-gradient text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Confirm</span>
          </button>
        </div>
      </div>

      {/* ========================================================
           MODALS & OVERLAYS
           ======================================================== */}

      {/* 1. ORDER CONFIRMATION DIALOG MODAL */}
      {isConfirmModalOpen && (
        <div
          id="confirm-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant">
            <div className="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[28px]">check_circle</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-center text-on-surface">
              Confirm Order #{order?.id || id || 'TKS-84920'}?
            </h3>
            <p className="text-xs text-center text-on-surface-variant mt-2 leading-relaxed">
              Make sure the customer {customerName} has agreed to the date ({occasionDate}), plantain leaf arrangements, {selectedItems.length} delicacy choices, and final amount of ₹{grandTotal.toLocaleString('en-IN')}.
            </p>

            <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/40 my-4 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-on-surface-variant">Customer:</span>
                <span className="font-bold text-on-surface">{customerName} ({customerPhone})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-on-surface-variant">Plates:</span>
                <span className="font-bold text-on-surface">{plateCount} Leaf Covers</span>
              </div>
              <div className="flex justify-between py-1 border-t border-outline-variant/30 mt-1">
                <span className="text-on-surface-variant">Estimated Total:</span>
                <span className="font-bold text-primary">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirmation}
                className="flex-1 py-2.5 px-4 primary-btn-gradient text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Yes, Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. A4 INVOICE PREVIEW MODAL */}
      {isInvoiceModalOpen && (
        <div
          id="invoice-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-inverse-surface/70 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
        >
          <div className="bg-surface-container-lowest text-on-surface rounded-2xl max-w-3xl w-full my-auto shadow-2xl border border-outline-variant flex flex-col max-h-[92vh]">
            
            {/* Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/60 bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">description</span>
                <h3 className="font-serif text-lg font-bold text-on-surface">
                  Banquet Tax Invoice &amp; Estimation Slip
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs text-primary font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Print Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success('Downloading official A4 banquet invoice PDF')
                    window.print()
                  }}
                  className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="p-1.5 hover:bg-surface-container rounded-lg text-outline cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Printable A4 Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs bg-white">
              
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-primary pb-6 gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpkBNPj4-1JNjKS6MW7bmxBj2ggTlPkACLO6d2iNNjbzSl79bObZAULQjZhSeiomQLyvgzTUhs2Od23ax4MDN0I9eNQYN1q_Hb1kSE_qxGZlDcWzoImM-8hmzWkJQ-Cjdy9gRuvLdPjC1cOYI9pBVfr0x3pFp2SOxLKEwb_0o-nZXSpDE26S3dJic0FC-XqXONgZ_NFTAdzHafQd3FUs6hU7gGVjoNUz1jJKLmy1mvgRW89hGwsPGY"
                    alt="TKS Iyengar's Logo"
                    className="h-14 w-auto object-contain"
                  />
                  <div>
                    <h2 className="font-serif text-xl font-bold text-primary leading-tight">
                      TKS Iyengar's Catering Services
                    </h2>
                    <p className="text-secondary font-semibold">
                      Estd. 1984 • Agrahara Heritage Pure Vegetarian Cuisine
                    </p>
                    <p className="text-[11px] text-outline mt-1">
                      Vani Vilas Mohalla, Agrahara, Mysuru, Karnataka - 570004
                    </p>
                    <p className="text-[11px] text-outline">
                      GSTIN: 29AABCT8492C1ZP • FSSAI Lic: 11219334000421
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="font-serif text-lg font-bold text-primary block">
                    TAX ESTIMATION INVOICE
                  </span>
                  <p className="font-bold text-on-surface">#INV-2025-{order?.id || id || '84920'}</p>
                  <p className="text-on-surface-variant text-[11px]">Date: 18 Nov 2025</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    CONFIRMED FEAST
                  </span>
                </div>
              </div>

              {/* Bill To Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface p-4 rounded-xl border border-outline-variant/50 text-xs">
                <div>
                  <h4 className="text-secondary font-bold uppercase tracking-wider text-[10px]">
                    Bill To / Host:
                  </h4>
                  <p className="font-bold text-on-surface mt-1 text-sm">{customerName}</p>
                  <p className="text-on-surface-variant font-mono">{customerPhone}</p>
                  <p className="text-on-surface-variant">{deliveryAddress}</p>
                </div>
                <div>
                  <h4 className="text-secondary font-bold uppercase tracking-wider text-[10px]">
                    Banquet Details:
                  </h4>
                  <p className="font-bold text-primary mt-1 text-sm">{occasionType}</p>
                  <p className="text-on-surface-variant">Muhurtham Date: {occasionDate}</p>
                  <p className="text-on-surface-variant">Service: Traditional Plantain Leaf ({plateCount} Plates)</p>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="border border-outline-variant/60 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container text-xs font-bold text-on-surface">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Sattvic Delicacy Description</th>
                      <th className="p-3 text-right">Rate / Leaf</th>
                      <th className="p-3 text-center">Plates</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 text-xs">
                    {selectedItems.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="p-3 text-outline font-mono">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="p-3 font-semibold text-on-surface">{item.name}</td>
                        <td className="p-3 text-right">₹{item.pricePerPlate}</td>
                        <td className="p-3 text-center">{plateCount}</td>
                        <td className="p-3 text-right font-bold">₹{(item.pricePerPlate * plateCount).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown & Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="text-[11px] text-on-surface-variant space-y-1.5 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/40">
                  <p className="font-bold text-primary text-xs">Sacred Kitchen Guarantee &amp; Terms:</p>
                  <p>1. 100% Sattvic Iyengar preparation. Strictly no garlic, no onions, no preservatives.</p>
                  <p>2. Prepared in stainless steel &amp; heavy brass urulis with direct wood charcoal &amp; steam.</p>
                  <p>3. Balance settlement to be made on event day via Cash / NEFT / UPI to TKS Iyengar Catering Account.</p>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Catering Food Subtotal:</span>
                    <span className="font-bold">₹{foodSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Logistics &amp; Container Tempo:</span>
                    <span className="font-bold">₹{logisticsCharge.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Copper Vessel Setup &amp; Servers:</span>
                    <span className="font-bold">₹{serviceCharge.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">GST (5% Composite Catering):</span>
                    <span className="font-bold">₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-primary pt-2 font-serif text-base font-bold text-primary">
                    <span>Grand Total Amount:</span>
                    <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Signature */}
              <div className="pt-8 flex justify-between items-end border-t border-outline-variant/50 text-[11px] text-outline">
                <div>
                  <p>Generated by TKS Iyengar Desk System</p>
                  <p>Mysuru Agrahara Main Office</p>
                </div>
                <div className="text-right">
                  <div className="h-10 border-b border-outline-variant w-40 mb-1 ml-auto"></div>
                  <p className="font-bold text-on-surface">Authorized Signatory / Acharya</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 3. FOOD CATALOGUE PICKER SHEET (DRAWER/MODAL) */}
      {isFoodPickerOpen && (
        <div
          id="food-picker-sheet"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6"
        >
          <div className="bg-surface rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-outline-variant">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">menu_book</span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-on-surface">
                    Iyengar Delicacy Catalogue
                  </h3>
                  <p className="text-xs text-on-surface-variant">Select additional items for the plantain leaf feast</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFoodPickerOpen(false)}
                className="p-1 hover:bg-surface-container rounded-lg text-outline cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Categories */}
            <div className="px-6 py-2.5 border-b border-outline-variant/30 flex gap-2 overflow-x-auto bg-surface text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveCatalogueCategory('all')}
                className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer ${
                  activeCatalogueCategory === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                All Items
              </button>
              <button
                type="button"
                onClick={() => setActiveCatalogueCategory('rice')}
                className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer ${
                  activeCatalogueCategory === 'rice'
                    ? 'bg-primary text-white'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                Rice Delicacies
              </button>
              <button
                type="button"
                onClick={() => setActiveCatalogueCategory('sweets')}
                className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer ${
                  activeCatalogueCategory === 'sweets'
                    ? 'bg-primary text-white'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                Sweets &amp; Payasa
              </button>
              <button
                type="button"
                onClick={() => setActiveCatalogueCategory('sambar')}
                className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer ${
                  activeCatalogueCategory === 'sambar'
                    ? 'bg-primary text-white'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                Sambhar &amp; Rasam
              </button>
              <button
                type="button"
                onClick={() => setActiveCatalogueCategory('savouries')}
                className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer ${
                  activeCatalogueCategory === 'savouries'
                    ? 'bg-primary text-white'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                Savouries &amp; Vada
              </button>
            </div>

            {/* Extra Delicacies List */}
            <div className="p-6 overflow-y-auto space-y-3">
              {[
                { name: 'Gasagase Payasa', desc: 'Poppy seed & coconut milk pudding with pure jaggery', price: 45 },
                { name: 'Ambode (Crispy Chana Dal Vada)', desc: 'Festive crunch vada with dill leaves & fresh ginger', price: 30 },
                { name: 'Mysuru Menasina Saaru (Pepper Rasam)', desc: 'Piping hot black pepper & cumin digestive rasam', price: 25 },
                { name: 'Temple Curd Rice', desc: 'Temple style tempered curd rice with grapes & pearls', price: 40 },
                { name: 'Pineapple Gojju', desc: 'Sweet, tangy & spiced fruit relish with mustard tempering', price: 35 },
                { name: 'Dry Fruit Kashi Halwa', desc: 'Caramelized ash-gourd halwa roasted in Gir cow ghee', price: 55 }
              ].map((extra, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/50 hover:border-primary transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="veg-marker-box">
                      <div className="veg-marker-dot"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">{extra.name}</h4>
                      <p className="text-secondary">{extra.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">₹{extra.price} / plt</span>
                    <button
                      type="button"
                      onClick={() => handleAddCatalogueItem(extra.name, extra.price)}
                      className="px-3 py-1.5 bg-surface-container hover:bg-primary-fixed text-primary font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-outline-variant/50 bg-surface-container-low flex justify-end">
              <button
                type="button"
                onClick={() => setIsFoodPickerOpen(false)}
                className="px-5 py-2 bg-primary text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Done Adding Items
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. DEVICE SHARE SHEET MODAL */}
      {isShareModalOpen && (
        <div
          id="share-sheet-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="bg-surface rounded-t-3xl sm:rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-outline-variant">
            <div className="w-12 h-1 bg-outline-variant rounded-full mx-auto mb-4 sm:hidden"></div>
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-on-surface">Share Order Proposal</h3>
                <p className="text-xs text-on-surface-variant">Order #{order?.id || id} (₹{grandTotal.toLocaleString('en-IN')})</p>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 hover:bg-surface-container rounded-lg text-outline cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Targets */}
            <div className="grid grid-cols-4 gap-3 text-center my-4">
              <button
                type="button"
                onClick={() => {
                  toast.success(`Shared proposal via WhatsApp to ${customerPhone}`)
                  setIsShareModalOpen(false)
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">chat</span>
                </div>
                <span className="text-[11px] font-medium">WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  toast.success('AirDrop proposal sheet simulated')
                  setIsShareModalOpen(false)
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-surface-container-high text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">airplay</span>
                </div>
                <span className="text-[11px] font-medium">AirDrop</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  toast.success('Opening Email draft with PDF quotation')
                  setIsShareModalOpen(false)
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-surface-container-high text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <span className="text-[11px] font-medium">Mail</span>
              </button>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">link</span>
                </div>
                <span className="text-[11px] font-medium">Copy Link</span>
              </button>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/40 flex items-center justify-between text-xs mt-4">
              <span className="text-on-surface-variant truncate font-mono">
                https://catering.tksiyengar.in/order/{order?.id || id}
              </span>
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="text-primary font-bold ml-2 cursor-pointer"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PASSCODE PROTECTED ORDER CANCELLATION MODAL */}
      {isCancelModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant">
            <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[28px]">shield_lock</span>
            </div>

            <h3 className="font-serif text-xl font-bold text-center text-on-surface">
              Cancel Catering Order
            </h3>

            <p className="text-xs text-center text-on-surface-variant mt-2 leading-relaxed">
              This action requires supervisor authorization. Please enter your 4-digit supervisor passcode to cancel #{order?.id || id}.
            </p>

            <div className="my-4 space-y-2">
              <label htmlFor="cancel-order-passcode" className="block text-xs font-semibold text-on-surface">
                Supervisor Passcode
              </label>
              <input
                id="cancel-order-passcode"
                type="password"
                maxLength={8}
                value={cancelPasscode}
                onChange={(e) => {
                  setCancelPasscode(e.target.value)
                  setCancelError('')
                }}
                placeholder="Enter passcode (e.g. 1965)"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2 text-xs font-mono focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {cancelError && (
                <p className="text-xs text-error font-bold">{cancelError}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                id="confirm-cancel-order-btn"
                onClick={handleConfirmCancelOrder}
                className="flex-1 py-2.5 px-4 bg-error text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer hover:bg-error/90 active:scale-95"
              >
                Authorize &amp; Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
export default AdminOrderDetailPage
