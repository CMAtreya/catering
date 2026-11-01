import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { saveOrder, getOrders, getCustomer } from '@/api'
import type { CustomerRecord, OrderItem } from '@/data/mockData'

interface DelicacyItem {
  id: string
  name: string
  kannada: string
  tag: string
  category: string
  price: number
  description: string
}

const CURATED_DELICACIES: DelicacyItem[] = [
  {
    id: 'item-1',
    name: 'Mysuru Puliyogare',
    kannada: 'ಮೈಸೂರು ಪುಳಿಯೋಗರೆ',
    tag: 'Signature Iyengar',
    category: 'Traditional Rice & Bath',
    price: 65,
    description: 'Authentic temple-style tangy tamarind rice simmered with freshly roasted sesame & red chillies.'
  },
  {
    id: 'item-2',
    name: 'Bisi Bele Bath & Boondi',
    kannada: 'ಬಿಸಿ ಬೇಳೆ ಬಾತ್ ಮತ್ತು ಕಾರಾ ಬೂಂದಿ',
    tag: 'Rich Ghee Bath',
    category: 'Traditional Rice & Bath',
    price: 85,
    description: 'Pure country ghee infused spiced lentil-rice prepared with dry coconut and garden vegetables.'
  },
  {
    id: 'item-3',
    name: 'Melkote Majjige Huli',
    kannada: 'ಮೇಲುಕೋಟೆ ಮಜ್ಜಿಗೆ ಹುಳಿ',
    tag: 'Temple Heritage',
    category: 'Accompaniments',
    price: 50,
    description: 'Authentic ash gourd buttermilk stew simmered in ground coconut and fresh curry leaves.'
  },
  {
    id: 'item-4',
    name: 'Royal Mysuru Pak',
    kannada: 'ರಾಯಲ್ ಮೈಸೂರು ಪಾಕ್',
    tag: 'Heritage Sweet',
    category: 'Sweets & Payasa',
    price: 50,
    description: 'Melt-in-mouth gram flour fudge prepared with pure churned cow ghee from Mysuru dairy.'
  },
  {
    id: 'item-5',
    name: 'Degree Filter Coffee',
    kannada: 'ಡಿಗ್ರಿ ಫಿಲ್ಟರ್ ಕಾಫಿ',
    tag: 'Chikmagalur Blend',
    category: 'Beverages / Filter Kaapi',
    price: 35,
    description: 'Fresh decoction brewed with rich farm milk, served hot in traditional brass davarah-tumbler.'
  },
  {
    id: 'item-6',
    name: 'Gasagase Payasa',
    kannada: 'ಗಸಗಸೆ ಪಾಯಸ',
    tag: 'Traditional Sweet',
    category: 'Sweets & Payasa',
    price: 45,
    description: 'Fragrant poppy seed pudding enriched with coconut milk, jaggery, cardamom, and ghee roasted cashews.'
  },
  {
    id: 'item-7',
    name: 'Ven Pongal Ghee Roast',
    kannada: 'ವೆನ್ ಪೊಂಗಲ್',
    tag: 'Temple Heritage',
    category: 'Traditional Rice & Bath',
    price: 75,
    description: 'Aromatic moong dal and rice mash tempered with whole peppercorns, cumin, and golden cashews.'
  },
  {
    id: 'item-8',
    name: 'Curd Rice & Pomegranate',
    kannada: 'ಮೊಸರನ್ನ',
    tag: 'Sattvic Soother',
    category: 'Traditional Rice & Bath',
    price: 45,
    description: 'Rich cultured cream curd rice garnished with fresh ruby pomegranate pearls, mustard, and green chillies.'
  },
  {
    id: 'item-9',
    name: 'Akki Kadalebele Payasa',
    kannada: 'ಅಕ್ಕಿ ಕಡಲೆಬೇಳೆ ಪಾಯಸ',
    tag: 'Heritage Sweet',
    category: 'Sweets & Payasa',
    price: 45,
    description: 'Traditional slow-simmered chana dal and raw rice kheer sweetened with organic Kollegal jaggery.'
  },
  {
    id: 'item-10',
    name: 'Mysuru Saaru (Rasam)',
    kannada: 'ಮೈಸೂರು ಸಾರು',
    tag: 'Temple Heritage',
    category: 'Accompaniments',
    price: 40,
    description: 'Traditional pepper cumin tamarind broth infused with freshly pounded Srirangapatna saaru powder.'
  },
  {
    id: 'item-11',
    name: 'Banana Blossom Vada (ವಡೆ)',
    kannada: 'ಬಾಳೆಹೂವು ವಡೆ',
    tag: 'Crisp Savoury',
    category: 'Accompaniments',
    price: 45,
    description: 'Crisp hand-shaped lentil patties folded with tender Kaveri basin plantain blossoms.'
  },
  {
    id: 'item-12',
    name: 'Spiced Neer Majjige',
    kannada: 'ಮಜ್ಜಿಗೆ',
    tag: 'Herbal Cooler',
    category: 'Beverages / Filter Kaapi',
    price: 25,
    description: 'Chilled buttermilk churned with crushed ginger, green chillies, coriander, and rock salt.'
  }
]

const QUICK_TAGS = [
  'Needs Tasting Session',
  'Strictly No Onion/Garlic',
  'Brass Uruli Logistics Required',
  'Muhurtham Date Tentative',
  'Filtered Kaapi Live Urn Setup'
]

const CATEGORIES = [
  'All Delicacies',
  'Traditional Rice & Bath',
  'Sweets & Payasa',
  'Accompaniments',
  'Beverages / Filter Kaapi'
]

export const AdminCreateOrderPage: React.FC = () => {
  const navigate = useNavigate()

  // Sidebar badge order count
  const [orderCount, setOrderCount] = useState<number>(14)

  // Section 1: Customer Details State
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing')
  const [mobile, setMobile] = useState<string>('98450 23419')
  const [customerName, setCustomerName] = useState<string>('Venkatesh Murthy (ವೆಂಕಟೇಶ್ ಮೂರ್ತಿ)')
  const [matchedCustomer, setMatchedCustomer] = useState<CustomerRecord | null>(null)

  // Section 2: Enquiry Notes & Context
  const [enquiryNotes, setEnquiryNotes] = useState<string>(
    "Customer visited desk personally. Daughter's wedding Muhurtham on 14th Dec morning followed by Grand Kalyana Banana Leaf Feast. Strongly requested Melkote Majjige Huli with special temple mustard tempering, hot authentic ghee Mysore Pak directly from uruli, and strict satvik preparation (zero onion, zero garlic)."
  )
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Needs Tasting Session',
    'Strictly No Onion/Garlic',
    'Brass Uruli Logistics Required'
  ])

  // Section 3: Event Specifications & Food Menu Selection
  const [occasion, setOccasion] = useState<string>('Wedding Muhurtham (ಮದುವೆ ಮುಹೂರ್ತ)')
  const [eventDate, setEventDate] = useState<string>('2025-12-14')
  const [plates, setPlates] = useState<number>(100)
  const [address, setAddress] = useState<string>('Shree Cauvery Kalyana Mantapa, Saraswathipuram 8th Main, Mysuru')
  const [diningInstructions, setDiningInstructions] = useState<string>(
    'Traditional 2-batch banana leaf serving. Batch 1 at 11:30 AM, Batch 2 at 1:00 PM.'
  )
  const [activeCategory, setActiveCategory] = useState<string>('All Delicacies')
  const [selectedDelicacyIds, setSelectedDelicacyIds] = useState<string[]>([
    'item-1',
    'item-2',
    'item-3',
    'item-4',
    'item-5'
  ])

  // Section 4: Pricing & Finalization Breakdown
  const [deliveryCharge, setDeliveryCharge] = useState<number>(1500)
  const [customizationCharge, setCustomizationCharge] = useState<number>(1000)

  // Saving state
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Load orders count
  useEffect(() => {
    let isMounted = true
    getOrders()
      .then((res) => {
        if (isMounted && res) {
          setOrderCount(res.length)
        }
      })
      .catch(() => {})
    return () => {
      isMounted = false
    }
  }, [])

  // Lookup customer when 10 digits entered
  useEffect(() => {
    const clean = mobile.replace(/\D/g, '')
    if (clean.length === 10) {
      getCustomer(clean)
        .then((res) => {
          if (res && res.customer) {
            setMatchedCustomer(res.customer)
            if (customerMode === 'existing') {
              if (res.customer.name) setCustomerName(res.customer.name)
              const pastOrderWithVenue = res.orders?.find((o) => o.venueAddress)
              if (pastOrderWithVenue?.venueAddress) {
                setAddress(pastOrderWithVenue.venueAddress)
              }
            }
          } else {
            setMatchedCustomer(null)
          }
        })
        .catch(() => setMatchedCustomer(null))
    } else {
      setMatchedCustomer(null)
    }
  }, [mobile, customerMode])

  // Toggle quick tag
  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  // Toggle delicacy item in menu
  const handleToggleDelicacy = (id: string) => {
    setSelectedDelicacyIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Filter delicacies by active category
  const filteredDelicacies = useMemo(() => {
    if (activeCategory === 'All Delicacies') return CURATED_DELICACIES
    return CURATED_DELICACIES.filter((d) => d.category === activeCategory)
  }, [activeCategory])

  // Currently selected items
  const selectedItemsList = useMemo(() => {
    return CURATED_DELICACIES.filter((d) => selectedDelicacyIds.includes(d.id))
  }, [selectedDelicacyIds])

  // Calculations
  const perPlateSubtotal = useMemo(() => {
    return selectedItemsList.reduce((sum, item) => sum + item.price, 0)
  }, [selectedItemsList])

  const baseFoodTotal = useMemo(() => {
    return perPlateSubtotal * Math.max(1, plates)
  }, [perPlateSubtotal, plates])

  const gstAmount = useMemo(() => {
    const taxableAmount = baseFoodTotal + Number(deliveryCharge || 0) + Number(customizationCharge || 0)
    return Math.round(taxableAmount * 0.05)
  }, [baseFoodTotal, deliveryCharge, customizationCharge])

  const grandFinalTotal = useMemo(() => {
    return baseFoodTotal + Number(deliveryCharge || 0) + Number(customizationCharge || 0) + gstAmount
  }, [baseFoodTotal, deliveryCharge, customizationCharge, gstAmount])

  const netPerPlate = useMemo(() => {
    if (!plates || plates <= 0) return '0.00'
    return (grandFinalTotal / plates).toFixed(2)
  }, [grandFinalTotal, plates])

  // Validation flags
  const isMobileValid = useMemo(() => {
    const clean = mobile.replace(/\D/g, '')
    return clean.length === 10
  }, [mobile])

  const isDateValid = useMemo(() => {
    return !!eventDate && eventDate.trim().length > 0
  }, [eventDate])

  const isPlatesValid = useMemo(() => {
    return plates >= 25
  }, [plates])

  const isReadyToConfirm = isMobileValid && isDateValid && isPlatesValid

  // Save as Enquiry (Under Discussion)
  const handleSaveEnquiry = async () => {
    const cleanMobile = mobile.replace(/\D/g, '')
    if (cleanMobile.length !== 10) {
      toast.error('Mobile number is required to save an enquiry.')
      return
    }

    setIsSaving(true)
    try {
      const orderItems: OrderItem[] = selectedItemsList.map((item) => ({
        id: item.id,
        name: `${item.name} (${item.kannada})`,
        pricePerPlate: item.price,
        quantity: 1
      }))

      const combinedNotes = [
        enquiryNotes.trim(),
        diningInstructions.trim() ? `[Serving Instructions]: ${diningInstructions.trim()}` : '',
        selectedTags.length > 0 ? `[Special Tags]: ${selectedTags.join(', ')}` : ''
      ].filter(Boolean).join('\n\n')

      const newOrder = await saveOrder({
        source: 'Manual',
        status: 'Under Discussion',
        customerPhone: cleanMobile,
        customerName: customerName.trim() || `Patron (${cleanMobile})`,
        eventType: occasion,
        eventDate: eventDate || new Date().toISOString().split('T')[0],
        eventTime: 'Morning',
        guestCount: plates > 0 ? plates : 100,
        venueAddress: address.trim(),
        notes: combinedNotes,
        items: orderItems,
        deliveryCharges: deliveryCharge,
        customizationCharges: customizationCharge,
        perPlateTotal: perPlateSubtotal,
        totalAmount: grandFinalTotal
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

  // Save & Confirm Order
  const handleSaveAndConfirm = async () => {
    const cleanMobile = mobile.replace(/\D/g, '')
    if (cleanMobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number.')
      return
    }
    if (!isDateValid) {
      toast.error('Occasion date is required to confirm this order.')
      return
    }
    if (!isPlatesValid) {
      toast.error('Minimum 25 plates required to confirm order.')
      return
    }

    setIsSaving(true)
    try {
      const orderItems: OrderItem[] = selectedItemsList.map((item) => ({
        id: item.id,
        name: `${item.name} (${item.kannada})`,
        pricePerPlate: item.price,
        quantity: 1
      }))

      const combinedNotes = [
        enquiryNotes.trim(),
        diningInstructions.trim() ? `[Serving Instructions]: ${diningInstructions.trim()}` : '',
        selectedTags.length > 0 ? `[Special Tags]: ${selectedTags.join(', ')}` : ''
      ].filter(Boolean).join('\n\n')

      const newOrder = await saveOrder({
        source: 'Manual',
        status: 'Confirmed',
        customerPhone: cleanMobile,
        customerName: customerName.trim() || `Patron (${cleanMobile})`,
        eventType: occasion,
        eventDate: eventDate,
        eventTime: 'Morning',
        guestCount: plates,
        venueAddress: address.trim(),
        notes: combinedNotes,
        items: orderItems,
        deliveryCharges: deliveryCharge,
        customizationCharges: customizationCharge,
        perPlateTotal: perPlateSubtotal,
        totalAmount: grandFinalTotal
      })

      toast.success('Manual order confirmed successfully! Tax estimation invoice is ready.')
      navigate(`/admin/orders/${newOrder.id}`)
    } catch (err) {
      console.error('Failed to confirm order:', err)
      toast.error('Failed to confirm order. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Sign out
  const handleSignOut = () => {
    localStorage.removeItem('tks_admin_auth')
    toast.success('Signed out successfully')
    navigate('/admin/login')
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex antialiased font-body-md text-body-md selection:bg-primary-fixed selection:text-on-primary-fixed">
      <style>{`
        .glass-nav {
          background: rgba(255, 248, 246, 0.92);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
        }
        .card-ambient-shadow {
          box-shadow: 0 4px 20px -2px rgba(107, 8, 0, 0.05), 0 2px 8px -1px rgba(43, 26, 23, 0.03);
        }
        .floating-tray-shadow {
          box-shadow: 0 16px 40px -6px rgba(107, 8, 0, 0.12), 0 6px 12px -2px rgba(43, 26, 23, 0.05);
        }
        .primary-cta-glow {
          box-shadow: 0 8px 24px -4px rgba(179, 10, 5, 0.35);
        }
        .kannada-sub {
          font-feature-settings: "kern" 1;
          opacity: 0.85;
        }
      `}</style>

      {/* ============================================================== */}
      {/* ADMIN LEFT NAVIGATION SIDEBAR (Exact Continuity)               */}
      {/* ============================================================== */}
      <aside className="w-64 bg-surface-container-low flex flex-col shrink-0 min-h-screen sticky top-0 h-screen z-40 hidden md:flex border-r border-outline-variant/40">
        
        {/* Brand / Logo Anchor */}
        <div className="p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <img
              alt="TKS Iyengar's Logo"
              className="h-12 w-auto object-contain drop-shadow-sm"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpkYFRG5nSur7PwqqYy0NLugmRAFXc9eqTcGWR-G_dZ6uQSvXalDwa8nOo2naIUy9L32uSH5x8a0z5RfCDTeaRaJO51Wy6z9J0XXU4F8rLRzmkv-iAgbNQnU3YoFOnQMy5tMUFmAMxmpi_qtbYaWRT-eQcHRn24cO_Ey5ZpkFDsMOlieDPe1SQ23rRDcE0XjQIel_xqScfo5T4G5Z_TVUjnNcXtL85OzBIw5sx7Kfi9qjd510eFGh1"
            />
            <div>
              <span className="font-serif text-lg text-primary font-bold block leading-tight">
                TKS Iyengar&apos;s
              </span>
              <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Admin Desk Mysuru
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-primary text-xs font-semibold mt-2 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Mysuru Main Kitchen Live</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all group text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
              dashboard
            </span>
            <span>Dashboard</span>
          </Link>

          {/* Active orders link with badge */}
          <Link
            to="/admin/orders"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface-container text-primary text-sm font-bold group shadow-xs"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">
                receipt_long
              </span>
              <span>All Orders</span>
            </div>
            <span className="bg-primary text-on-primary text-xs font-bold px-2 py-0.5 rounded-full">
              {orderCount}
            </span>
          </Link>

          <Link
            to="/admin/menu"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all group text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
              restaurant_menu
            </span>
            <span>Catering Menu</span>
          </Link>

          <Link
            to="/admin/customers"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all group text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
              group
            </span>
            <span>Customers</span>
          </Link>

          <div className="pt-4 pb-2 px-3">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider block">
              Kitchen Logistics
            </span>
          </div>

          <Link
            to="/admin"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all group text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
              soup_kitchen
            </span>
            <span>Uruli &amp; Master Cooks</span>
          </Link>

          <Link
            to="/admin"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all group text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
              event_available
            </span>
            <span>Muhurtham Calendar</span>
          </Link>
        </nav>

        {/* Bottom Admin Desk Profile & Sign Out */}
        <div className="p-4 mt-auto">
          <div className="p-3 bg-surface rounded-xl flex items-center justify-between mb-2 border border-outline-variant/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs">
                KS
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface leading-snug">K. Seshadri</p>
                <p className="text-[11px] text-on-surface-variant">Desk In-charge</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors text-xs font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MAIN DESK CANVAS                                               */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-background pb-32">
        
        {/* Top Admin Header Bar */}
        <header className="glass-nav sticky top-0 z-30 px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/50 shadow-xs">
          <div className="flex flex-col gap-1">
            <Link
              to="/admin/orders"
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary cursor-pointer transition-colors w-fit text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-sm font-semibold">arrow_back</span>
              <span>Back to All Orders</span>
            </Link>
            
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-serif text-2xl md:text-3xl text-on-surface tracking-tight font-bold">
                Create Manual Order{' '}
                <span className="text-lg md:text-xl text-on-surface-variant font-normal">
                  (Walk-in / Phone Enquiry)
                </span>
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-primary text-xs font-bold">
                <span className="material-symbols-outlined text-[16px]">phone_in_talk</span>
                <span>Manual / Phone Booking</span>
              </span>
            </div>
          </div>

          {/* Prominent Reassurance Pill */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-secondary-fixed/50 text-on-secondary-container shadow-xs">
            <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
            <p className="text-xs font-medium">
              <span className="font-bold">Fast Capture:</span> Only mobile number is needed to save. Date and plates are needed to confirm.
            </p>
          </div>
        </header>

        {/* Main Workspace Content */}
        <main className="w-full max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-8">
          
          {/* ========================================================== */}
          {/* SECTION 1: CUSTOMER DETAILS                                */}
          {/* ========================================================== */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 md:p-7 card-ambient-shadow relative overflow-hidden border border-outline-variant/40">
            {/* Section Header Anchor */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-serif text-lg font-bold shadow-xs shrink-0">
                  1
                </div>
                <div>
                  <h2 className="font-serif text-xl md:text-2xl font-bold text-on-surface">
                    Customer Details &amp; Instant Lookup
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Capture contact details or retrieve registered patrons from Mysuru &amp; Bengaluru records
                  </p>
                </div>
              </div>

              {/* Toggle State Preview */}
              <div className="inline-flex items-center bg-surface-container-low p-1 rounded-full self-start sm:self-auto border border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('new')
                    setCustomerName('')
                  }}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    customerMode === 'new'
                      ? 'bg-surface-container-lowest shadow-xs text-primary'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  New Customer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('existing')
                    if (!customerName) setCustomerName('Venkatesh Murthy (ವೆಂಕಟೇಶ್ ಮೂರ್ತಿ)')
                  }}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    customerMode === 'existing'
                      ? 'bg-surface-container-lowest shadow-xs text-primary'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px] text-emerald-700">check_circle</span>
                  <span>Existing Customer Match</span>
                </button>
              </div>
            </div>

            {/* Smart Phone Lookup Match Card */}
            {customerMode === 'existing' && (
              <div className="mb-6 p-4 rounded-xl bg-tertiary-container/10 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border border-tertiary/20">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-800 mt-0.5 text-2xl shrink-0">
                    verified_user
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-on-surface">
                        Existing customer found: {matchedCustomer?.name || 'Venkatesh Murthy'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-800 text-white font-bold">
                        Auto-Linked Profile #{matchedCustomer ? `MY-${matchedCustomer.phone.slice(-4)}` : 'MY-4821'}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {matchedCustomer?.notes ||
                        'Patron history: 3 past muhurtham banquets in Mysuru (Jayalakshmipuram & Saraswathipuram). Prefers Melkote style ghee items and zero garlic.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (matchedCustomer) {
                      navigate(`/admin/customers/${matchedCustomer.phone}`)
                    } else {
                      toast.info('Patron history: 3 past muhurtham banquets in Mysuru records.')
                    }
                  }}
                  className="text-xs text-primary font-bold hover:underline shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  View Past Menus
                </button>
              </div>
            )}

            {/* Form Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="customer-mobile" className="block text-xs font-bold text-on-surface mb-2">
                  Mobile Number <span className="text-primary font-bold">*Required</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-outline font-bold text-xs select-none">
                    +91
                  </span>
                  <input
                    id="customer-mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setMobile(val)
                    }}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-12 pr-10 py-2.5 rounded-xl bg-surface border border-outline-variant text-on-surface font-semibold text-xs focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-xs"
                  />
                  {isMobileValid && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-emerald-700">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    </span>
                  )}
                </div>
                <p
                  className={`text-[11px] mt-1.5 flex items-center gap-1 font-medium ${
                    isMobileValid ? 'text-emerald-700' : 'text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {isMobileValid ? 'done' : 'info'}
                  </span>
                  <span>
                    {isMobileValid
                      ? 'Validated mobile record. Eligible to save draft immediately.'
                      : 'Enter a valid 10-digit Indian mobile number.'}
                  </span>
                </p>
              </div>

              <div>
                <label htmlFor="customer-name" className="block text-xs font-bold text-on-surface mb-2">
                  Customer Full Name
                </label>
                <div className="relative">
                  <input
                    id="customer-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full name in English or Kannada"
                    className="w-full px-3.5 pr-10 py-2.5 rounded-xl bg-surface border border-outline-variant text-on-surface font-semibold text-xs focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-xs"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-outline">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1.5 font-medium">
                  Primary family contact &amp; head host for the muhurtham feast.
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================== */}
          {/* SECTION 2: ENQUIRY NOTES & CONVERSATION CONTEXT            */}
          {/* ========================================================== */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 md:p-7 card-ambient-shadow relative border border-outline-variant/40">
            <div className="flex items-center gap-3 pb-5">
              <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-serif text-lg font-bold shadow-xs shrink-0">
                2
              </div>
              <div>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-on-surface">
                  Enquiry Notes &amp; Conversation Context
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Log walk-in conversation nuances, familial preferences, and kitchen dispatch notes
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="enquiry-notes" className="block text-xs font-bold text-on-surface mb-2">
                  Desk Conversation Transcript / Special Notes
                </label>
                <textarea
                  id="enquiry-notes"
                  rows={3}
                  value={enquiryNotes}
                  onChange={(e) => setEnquiryNotes(e.target.value)}
                  placeholder="e.g. Customer called regarding sister's daughter's wedding muhurtham in early December. Needs Melkote style breakfast and traditional plantain leaf lunch with live hot Mysore Pak counters..."
                  className="w-full p-3.5 rounded-xl bg-surface border border-outline-variant text-on-surface text-xs leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none shadow-xs transition-all"
                />
              </div>

              {/* Quick Context Tags */}
              <div>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                  Quick Tags (Click to toggle)
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-on-primary shadow-xs'
                            : 'bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high border border-outline-variant/40'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isSelected ? 'check' : 'add'}
                        </span>
                        <span>{tag}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================== */}
          {/* SECTION 3: EVENT SPECIFICATIONS & FOOD MENU SELECTION      */}
          {/* ========================================================== */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 md:p-7 card-ambient-shadow space-y-8 border border-outline-variant/40">
            <div className="flex items-center gap-3 pb-2">
              <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-serif text-lg font-bold shadow-xs shrink-0">
                3
              </div>
              <div>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-on-surface">
                  Event Specifications &amp; Food Menu Selection
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Set occasion timing, plate volume, and curate the sacred traditional feast items
                </p>
              </div>
            </div>

            {/* Subgrid: Event Details */}
            <div className="p-5 md:p-6 rounded-2xl bg-surface-container-low/50 space-y-6 border border-outline-variant/30">
              <h3 className="font-serif text-lg text-primary flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-[20px]">celebration</span>
                <span>Muhurtham Banquet Details</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Occasion Type */}
                <div>
                  <label htmlFor="occasion-type" className="block text-xs font-bold text-on-surface mb-2">
                    Occasion Type
                  </label>
                  <select
                    id="occasion-type"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none shadow-xs cursor-pointer"
                  >
                    <option value="Wedding Muhurtham (ಮದುವೆ ಮುಹೂರ್ತ)">Wedding Muhurtham (ಮದುವೆ ಮುಹೂರ್ತ)</option>
                    <option value="Griha Pravesh (ಗೃಹ ಪ್ರವೇಶ)">Griha Pravesh (ಗೃಹ ಪ್ರವೇಶ)</option>
                    <option value="Upanayana Brahmopadesha (ಉಪನಯನ)">Upanayana Brahmopadesha (ಉಪನಯನ)</option>
                    <option value="Satyanarayana Pooja (ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ)">Satyanarayana Pooja (ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ)</option>
                    <option value="Sashtiapthapoorthi (60th Birthday)">Sashtiapthapoorthi (60th Birthday)</option>
                    <option value="Seemantham Feast">Seemantham Feast</option>
                    <option value="Other Traditional Feast">Other Traditional Feast</option>
                  </select>
                </div>

                {/* Occasion Date Picker */}
                <div>
                  <label htmlFor="occasion-date" className="block text-xs font-bold text-on-surface mb-2">
                    Occasion Date <span className="text-primary font-bold">*For Confirmation</span>
                  </label>
                  <div className="relative">
                    <input
                      id="occasion-date"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none shadow-xs"
                    />
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    <span>Date validated &amp; available in Mysuru Kitchen calendar</span>
                  </p>
                </div>

                {/* Number of Plates */}
                <div>
                  <label htmlFor="plates-count" className="block text-xs font-bold text-on-surface mb-2">
                    Number of Plates (ಎಲೆಗಳ ಸಂಖ್ಯೆ) <span className="text-primary font-bold">*For Confirmation</span>
                  </label>
                  <div className="relative">
                    <input
                      id="plates-count"
                      type="number"
                      min={25}
                      value={plates}
                      onChange={(e) => setPlates(Math.max(1, parseInt(e.target.value, 10) || 0))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none shadow-xs text-primary"
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant text-xs font-bold pointer-events-none">
                      Plates
                    </span>
                  </div>

                  {/* Quick Plate Chips */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[11px] font-bold text-outline">Quick:</span>
                    {[50, 100, 250, 500].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPlates(num)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          plates === num
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container hover:bg-surface-variant text-on-surface border border-outline-variant/30'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Address & Logistics Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label htmlFor="delivery-address" className="block text-xs font-bold text-on-surface mb-2">
                    Delivery / Kalyana Mantapa Address
                  </label>
                  <input
                    id="delivery-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label htmlFor="dining-instructions" className="block text-xs font-bold text-on-surface mb-2">
                    Dining Timing &amp; Serving Instructions
                  </label>
                  <input
                    id="dining-instructions"
                    type="text"
                    value={diningInstructions}
                    onChange={(e) => setDiningInstructions(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Two Column Layout: Catalogue on Left, Floating Summary on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
              
              {/* Left Catalogue (8 Cols) */}
              <div className="lg:col-span-8 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-on-surface">
                      Curate Traditional Delicacies
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Prepared with pure cow ghee &amp; authentic temple spice formulas
                    </p>
                  </div>
                  <span className="text-xs text-emerald-800 flex items-center gap-1.5 font-bold self-start sm:self-auto">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span>100% Pure Satvik Pure Veg</span>
                  </span>
                </div>

                {/* Category Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-primary text-on-primary shadow-xs'
                            : 'bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container border border-outline-variant/30'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>

                {/* Delicacy Visual Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredDelicacies.map((item) => {
                    const isSelected = selectedDelicacyIds.includes(item.id)
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-surface-container-low/40 card-ambient-shadow flex flex-col justify-between hover:border-primary/40 border border-outline-variant/30 transition-all"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5">
                              {/* Veg Badge */}
                              <span className="w-4 h-4 border border-emerald-700 flex items-center justify-center p-0.5 rounded-[2px] bg-white">
                                <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                              </span>
                              <span className="text-[11px] text-secondary font-bold">
                                {item.tag}
                              </span>
                            </div>
                            <span className="text-xs text-primary font-bold">
                              ₹{item.price}{' '}
                              <span className="text-[10px] font-normal text-on-surface-variant">
                                /plate
                              </span>
                            </span>
                          </div>

                          <h4 className="text-sm text-on-surface font-bold leading-snug">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-on-surface-variant kannada-sub font-semibold">
                            {item.kannada}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-1.5 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 flex items-center justify-between border-t border-outline-variant/20">
                          {isSelected ? (
                            <>
                              <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                <span>Added in Menu</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleDelicacy(item.id)}
                                className="px-3 py-1 rounded-full bg-surface-container text-primary text-xs font-bold hover:bg-surface-variant transition-colors flex items-center gap-1 cursor-pointer border border-outline-variant/30"
                              >
                                <span className="material-symbols-outlined text-[14px]">check</span>
                                <span>Added ✓</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-xs text-outline font-medium">
                                Not selected
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleDelicacy(item.id)}
                                className="px-3.5 py-1 rounded-full bg-surface-container-highest text-on-surface hover:bg-primary hover:text-on-primary text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[14px]">add</span>
                                <span>+ Add</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Side: Floating / Adjacent Menu Selection Summary (4 Cols) */}
              <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
                <div className="p-5 rounded-2xl bg-surface-container-low/70 card-ambient-shadow border border-outline-variant/40">
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        local_dining
                      </span>
                      <h4 className="text-sm text-on-surface font-bold">
                        Selected Delicacies
                      </h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-xs font-bold">
                      {selectedItemsList.length} Items
                    </span>
                  </div>

                  {/* Selected Items List */}
                  <div className="space-y-2.5 pt-3 divide-y divide-outline-variant/20">
                    {selectedItemsList.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs pt-2 first:pt-0"
                      >
                        <div className="pr-2 min-w-0">
                          <p className="font-bold text-on-surface leading-tight truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-on-surface-variant kannada-sub">
                            {item.kannada}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-on-surface">₹{item.price}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleDelicacy(item.id)}
                            className="text-outline hover:text-error transition-colors cursor-pointer p-0.5"
                            title="Remove delicacy"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    {selectedItemsList.length === 0 && (
                      <div className="py-6 text-center text-xs text-on-surface-variant">
                        No dishes selected yet. Click &quot;+ Add&quot; on dishes from the catalogue.
                      </div>
                    )}
                  </div>

                  {/* Menu Subtotal Banner */}
                  <div className="mt-4 pt-4 bg-surface-container-high/40 rounded-xl p-3 flex items-center justify-between border border-outline-variant/30">
                    <div>
                      <span className="text-[11px] font-bold text-on-surface-variant block uppercase tracking-wider">
                        Subtotal Per Plate
                      </span>
                      <span className="text-[11px] text-emerald-800 font-bold">
                        Includes leaf service
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg text-primary font-bold">
                        ₹{perPlateSubtotal}
                      </span>
                      <span className="text-[11px] text-on-surface-variant block font-medium">
                        / person
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* ========================================================== */}
          {/* SECTION 4: PRICING & FINALIZATION BREAKDOWN                */}
          {/* ========================================================== */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 md:p-7 card-ambient-shadow space-y-6 border border-outline-variant/40">
            <div className="flex items-center gap-3 pb-2">
              <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-serif text-lg font-bold shadow-xs shrink-0">
                4
              </div>
              <div>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-on-surface">
                  Pricing &amp; Finalization Breakdown
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Transparent automated costing for the banquet contract
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Breakdown Glass Card */}
              <div className="p-5 md:p-6 rounded-2xl bg-surface-container-low/50 card-ambient-shadow space-y-4 border border-outline-variant/30">
                <h3 className="text-sm text-on-surface font-bold flex items-center gap-2 pb-2 border-b border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    calculate
                  </span>
                  <span>Cost Quotation Summary</span>
                </h3>

                {/* Item 1: Base Food Rate */}
                <div className="flex items-center justify-between py-1 text-xs">
                  <div>
                    <p className="font-bold text-on-surface">Base Food Rate</p>
                    <p className="text-[11px] text-on-surface-variant">
                      ₹{perPlateSubtotal} / plate × {plates} plates
                    </p>
                  </div>
                  <span className="font-bold text-on-surface text-sm">
                    ₹{baseFoodTotal.toLocaleString('en-IN')}.00
                  </span>
                </div>

                {/* Item 2: Delivery & Uruli Logistics */}
                <div className="flex items-center justify-between py-1 text-xs">
                  <div className="flex-1 pr-4">
                    <label htmlFor="delivery-charge" className="font-bold text-on-surface block">
                      Delivery &amp; Uruli Logistics
                    </label>
                    <span className="text-[11px] text-on-surface-variant">
                      Mysuru City Kalyana Mantapa dispatch
                    </span>
                  </div>
                  <div className="w-28 relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-on-surface-variant text-xs font-bold pointer-events-none">
                      ₹
                    </span>
                    <input
                      id="delivery-charge"
                      type="number"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(parseInt(e.target.value, 10) || 0)}
                      className="w-full pl-6 pr-2 py-1 text-right rounded-lg bg-surface border border-outline-variant text-on-surface font-bold text-xs focus:ring-1 focus:ring-primary shadow-inner"
                    />
                  </div>
                </div>

                {/* Item 3: Customization & Service Setup */}
                <div className="flex items-center justify-between py-1 text-xs">
                  <div className="flex-1 pr-4">
                    <label htmlFor="customization-charge" className="font-bold text-on-surface block">
                      Customization &amp; Service Setup
                    </label>
                    <span className="text-[11px] text-on-surface-variant">
                      Live filter coffee samovar &amp; head servers
                    </span>
                  </div>
                  <div className="w-28 relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-on-surface-variant text-xs font-bold pointer-events-none">
                      ₹
                    </span>
                    <input
                      id="customization-charge"
                      type="number"
                      value={customizationCharge}
                      onChange={(e) => setCustomizationCharge(parseInt(e.target.value, 10) || 0)}
                      className="w-full pl-6 pr-2 py-1 text-right rounded-lg bg-surface border border-outline-variant text-on-surface font-bold text-xs focus:ring-1 focus:ring-primary shadow-inner"
                    />
                  </div>
                </div>

                {/* Item 4: GST */}
                <div className="flex items-center justify-between py-1 text-xs">
                  <div>
                    <p className="font-bold text-on-surface">GST (5% Food &amp; Catering Services)</p>
                    <p className="text-[11px] text-on-surface-variant">CGST 2.5% + SGST 2.5%</p>
                  </div>
                  <span className="font-bold text-on-surface text-sm">
                    ₹{gstAmount.toLocaleString('en-IN')}.00
                  </span>
                </div>

                {/* Grand Final Total */}
                <div className="pt-4 mt-2 border-t border-outline-variant/30">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">
                        Grand Final Total
                      </span>
                      <p className="text-[11px] text-on-surface-variant">
                        Including taxes and Mysuru logistics
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-2xl md:text-3xl text-primary font-bold tracking-tight">
                        ₹{grandFinalTotal.toLocaleString('en-IN')}
                      </span>
                      <span className="block text-[11px] text-on-surface-variant font-semibold">
                        (₹{netPerPlate} per plate net)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Terms & Payment Handling Context */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-secondary-fixed/40 space-y-3 border border-secondary/20">
                  <div className="flex items-center gap-2 text-on-secondary-container">
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      shield_person
                    </span>
                    <h4 className="text-xs font-bold">Payment &amp; Desk Guarantee</h4>
                  </div>
                  <p className="text-xs text-on-secondary-container leading-relaxed">
                    <span className="font-bold text-on-surface">
                      Payment is handled separately — no direct payment is collected here.
                    </span>{' '}
                    Upon saving or confirming this order, an official pro-forma invoice will be printed for the guest, and a digital copy sent to {customerName.split(' ')[0] || 'the customer'}&apos;s WhatsApp (+91 {mobile}).
                  </p>
                </div>

                {/* Validation Checkpoints Card */}
                <div className="p-5 rounded-2xl bg-surface-container-low/60 space-y-3 border border-outline-variant/30">
                  <h4 className="text-xs font-bold text-on-surface">
                    Order Readiness Checklist
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li
                      className={`flex items-center gap-2 ${
                        isMobileValid ? 'text-emerald-800 font-semibold' : 'text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isMobileValid ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>
                        <strong>Mobile Phone:</strong> +91 {mobile}{' '}
                        {isMobileValid ? '(Ready for Draft & Confirm)' : '(10 digits required)'}
                      </span>
                    </li>

                    <li
                      className={`flex items-center gap-2 ${
                        isDateValid ? 'text-emerald-800 font-semibold' : 'text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isDateValid ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>
                        <strong>Occasion Date:</strong> {eventDate || 'Not selected'}{' '}
                        {isDateValid ? '(Ready for Confirmation)' : '(Required to confirm)'}
                      </span>
                    </li>

                    <li
                      className={`flex items-center gap-2 ${
                        isPlatesValid ? 'text-emerald-800 font-semibold' : 'text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isPlatesValid ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>
                        <strong>Plates Count:</strong> {plates} Plates{' '}
                        {isPlatesValid ? '(Ready for Confirmation)' : '(Min 25 required)'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </section>

        </main>

        {/* ============================================================== */}
        {/* BOTTOM STICKY ACTION BAR (Docked at Screen Bottom)             */}
        {/* ============================================================== */}
        <footer className="fixed bottom-0 right-0 left-0 md:left-64 glass-nav px-4 sm:px-8 py-3.5 floating-tray-shadow z-50 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-outline-variant/50">
          
          {/* Left side: Status Indicator & Reassurance Reminder */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container text-on-surface text-xs font-bold border border-outline-variant/40">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isReadyToConfirm ? 'bg-emerald-600' : 'bg-secondary'
                }`}
              ></span>
              <span>
                Status:{' '}
                <strong className={isReadyToConfirm ? 'text-emerald-800' : 'text-primary'}>
                  {isReadyToConfirm ? 'Ready to Confirm' : 'Draft Enquiry'}
                </strong>
              </span>
            </div>

            <p className="text-[11px] text-on-surface-variant hidden lg:flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-secondary text-sm">lightbulb</span>
              <span>Only mobile number is needed to save. Date and plates are needed to confirm.</span>
            </p>
          </div>

          {/* Right side: Dual Action CTAs */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Secondary Button: Save as Enquiry */}
            <button
              type="button"
              onClick={handleSaveEnquiry}
              disabled={isSaving || !isMobileValid}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-container text-on-surface text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xs border border-outline-variant/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-outline text-[18px]">bookmark</span>
              <span>{isSaving ? 'Saving...' : 'Save as Enquiry'}</span>
            </button>

            {/* Primary Button: Save & Confirm Order */}
            <button
              type="button"
              onClick={handleSaveAndConfirm}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B0A00] via-[#B30A05] to-[#8B0A00] text-on-primary text-xs font-bold primary-cta-glow transition-all active:scale-95 flex items-center justify-center gap-2 hover:brightness-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Save &amp; Confirm Order</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  )
}

export default AdminCreateOrderPage
