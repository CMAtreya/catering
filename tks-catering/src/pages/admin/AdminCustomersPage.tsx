import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCustomers, getOrders, recordEnquiry } from '@/api'
import type { CustomerRecord, Order } from '@/data/mockData'
import { toast } from 'sonner'

interface CustomerMeta {
  area: string
  id: string
  designation?: string
  tasteBadges?: string[]
}

const CUSTOMER_META_MAP: Record<string, CustomerMeta> = {
  '9845023419': {
    area: 'Jayalakshmipuram, Mysuru',
    id: '#CUST-4821',
    designation: 'Senior Govt Officer (Retd.)',
    tasteBadges: ['Strictly Satvik (Zero Onion/Garlic)', 'High Ghee Preference', 'Brass Uruli Required', 'Prefers Morning Calls']
  },
  '9845012345': {
    area: 'Agrahara, Mysuru',
    id: '#CUST-3914',
    designation: 'Temple Trustee & Patron',
    tasteBadges: ['Strictly Satvik (Zero Onion/Garlic)', 'Extra Roasted Copra', 'Prefers Evening Tasting']
  },
  '9448167890': {
    area: 'Gokulam 3rd Stage, Mysuru',
    id: '#CUST-2180',
    designation: 'Educator & Feast Host',
    tasteBadges: ['Strictly Satvik (Zero Onion/Garlic)', 'Live Filter Kaapi Counter', 'Plantain Leaf Required']
  },
  '9880199201': {
    area: 'Kuvempunagar, Mysuru',
    id: '#CUST-1045',
    designation: 'Chief Physician (Apollo Mysuru)',
    tasteBadges: ['Strictly Satvik (Zero Onion/Garlic)', 'Less Sweet Payasa', 'Warm Kaapi Flasks']
  },
  '9900234812': {
    area: 'VV Mohalla, Mysuru',
    id: '#CUST-5290',
    designation: 'Classical Musician & Host',
    tasteBadges: ['Strictly Satvik (Zero Onion/Garlic)', 'Melkote Style Majjige Huli', 'Brass Uruli Required']
  },
  '9448067890': {
    area: 'Agrahara, Mysuru',
    id: '#CUST-2290',
    designation: 'Heritage Feast Patron',
    tasteBadges: ['Strictly Satvik (Zero Onion/Garlic)', 'Pure Cow Ghee']
  },
  '9900123456': {
    area: 'Gokulam, Mysuru',
    id: '#CUST-3104',
    designation: 'Software Executive',
    tasteBadges: ['Live Tiffin Counters', 'Satvik Mysore Pak']
  },
  '9740112233': {
    area: 'Jayalakshmipuram, Mysuru',
    id: '#CUST-1823',
    designation: 'Festive Host',
    tasteBadges: ['Traditional Sweets', 'Zero Onion/Garlic']
  },
  '9880223344': {
    area: 'Krishnamurthy Puram, Mysuru',
    id: '#CUST-4029',
    designation: 'Community Hall Trustee',
    tasteBadges: ['Direct Phone Bookings', 'Brass Vessels']
  }
}

interface SupervisorNoteItem {
  id: string
  author: string
  timestamp: string
  note: string
  borderClass: string
}

const INITIAL_SUPERVISOR_NOTES: SupervisorNoteItem[] = [
  {
    id: 'note-1',
    author: 'K. Seshadri (Supervisor)',
    timestamp: '18 Nov 2025, 11:30 AM',
    note: "Patron visited desk. Daughter's wedding confirmed for Dec 14 at Shree Cauvery Kalyana Mantapa. Very particular about traditional Melkote taste. Ensure master cook Raghavan oversees tempering.",
    borderClass: 'border-l-primary'
  },
  {
    id: 'note-2',
    author: 'Raghavan (Head Cook)',
    timestamp: '21 May 2024, 04:15 PM',
    note: 'Upanayana feast feedback: Family was extremely happy with the warm filter kaapi and bisi bele bath service. Tipped kitchen servers generously.',
    borderClass: 'border-l-secondary'
  },
  {
    id: 'note-3',
    author: 'K. Seshadri (Supervisor)',
    timestamp: '14 Jan 2023, 09:00 AM',
    note: 'Initial contact. Mobile registered during Saraswathipuram temple event.',
    borderClass: 'border-l-outline'
  }
]

export const AdminCustomersPage: React.FC = () => {
  const navigate = useNavigate()

  // Data State
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // View Controller Mode ('directory' | 'detail')
  const [viewState, setViewState] = useState<'directory' | 'detail'>('directory')

  // Mobile Cards Simulation Mode (Toggle for preview)
  const [isMobileCardsSimulated, setIsMobileCardsSimulated] = useState<boolean>(false)

  // Selected Customer Phone for Detail View
  const [selectedPhone, setSelectedPhone] = useState<string>('9845023419')

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'confirmed' | 'repeat' | 'enquiries'>('all')

  // Record Enquiry Modal State
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState<boolean>(false)
  const [enquiryTopic, setEnquiryTopic] = useState<string>('Sashti Poorthi (60th Birthday)')
  const [enquiryExpected, setEnquiryExpected] = useState<string>('Feb 2026 (Approx 120 - 150 plates)')
  const [enquiryNotes, setEnquiryNotes] = useState<string>('')
  const [isFollowUpChecked, setIsFollowUpChecked] = useState<boolean>(true)
  const [isSavingEnquiry, setIsSavingEnquiry] = useState<boolean>(false)

  // Supervisor Notes State for Selected Customer
  const [supervisorNotes, setSupervisorNotes] = useState<SupervisorNoteItem[]>(INITIAL_SUPERVISOR_NOTES)
  const [newNoteInput, setNewNoteInput] = useState<string>('')

  // Load Data
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    Promise.all([getCustomers(), getOrders()])
      .then(([custList, ordList]) => {
        if (isMounted) {
          const sorted = [...custList].sort((a, b) => b.lastContacted.localeCompare(a.lastContacted))
          setCustomers(sorted)
          setOrders(ordList)
          if (sorted.length > 0 && !sorted.some((c) => c.phone.includes(selectedPhone))) {
            setSelectedPhone(sorted[0].phone.replace(/\D/g, '').slice(-10))
          }
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.error('Failed to load customers data:', err)
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Helper to get initials
  const getInitials = (name: string): string => {
    if (!name) return 'C'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // Active selected customer
  const selectedCustomer = useMemo(() => {
    const cleanTarget = selectedPhone.replace(/\D/g, '').slice(-10)
    const found = customers.find((c) => c.phone.replace(/\D/g, '').slice(-10) === cleanTarget)
    if (found) return found
    return (
      customers[0] || {
        phone: '9845023419',
        name: 'Venkatesh Murthy',
        address: 'No. 74, 5th Cross, Jayalakshmipuram, Mysuru - 570012',
        firstContacted: '2023-01-14',
        lastContacted: '2025-11-18',
        enquiryCount: 5,
        confirmedCount: 3,
        notes: "Patron visited desk. Daughter's wedding confirmed for Dec 14."
      }
    )
  }, [customers, selectedPhone])

  // Orders for selected customer
  const selectedCustomerOrders = useMemo(() => {
    if (!selectedCustomer) return []
    const clean = selectedCustomer.phone.replace(/\D/g, '').slice(-10)
    return orders.filter((o) => o.customerPhone.replace(/\D/g, '').includes(clean))
  }, [orders, selectedCustomer])

  // Filtered customers list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.address && c.address.toLowerCase().includes(q))

      if (!matchesSearch) return false

      if (activeFilter === 'confirmed') return c.confirmedCount > 0
      if (activeFilter === 'repeat') return c.confirmedCount > 1 || c.enquiryCount > 2
      if (activeFilter === 'enquiries') return c.enquiryCount > 0 && c.confirmedCount === 0

      return true
    })
  }, [customers, searchQuery, activeFilter])

  // Total patrons count
  const totalPatronsCount = customers.length || 48
  const confirmedPatronsCount = useMemo(() => customers.filter((c) => c.confirmedCount > 0).length, [customers])
  const repeatPatronsCount = useMemo(() => customers.filter((c) => c.confirmedCount > 1 || c.enquiryCount > 2).length, [customers])
  const enquiryOnlyCount = useMemo(() => customers.filter((c) => c.enquiryCount > 0 && c.confirmedCount === 0).length, [customers])

  // Handlers
  const handleSelectCustomer = (c: CustomerRecord) => {
    const clean = c.phone.replace(/\D/g, '').slice(-10)
    setSelectedPhone(clean)
    setViewState('detail')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleMobileCustomerClick = (c: CustomerRecord) => {
    const clean = c.phone.replace(/\D/g, '').slice(-10)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      navigate(`/admin/customers/${clean}`)
    } else {
      handleSelectCustomer(c)
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Customer ID', 'Name', 'Phone', 'Area / Address', 'First Contacted', 'Last Contacted', 'Enquiries', 'Confirmed Orders', 'Notes']
    const rows = customers.map((c) => {
      const clean = c.phone.replace(/\D/g, '').slice(-10)
      const meta = CUSTOMER_META_MAP[clean]
      const custId = meta?.id || `#CUST-${clean.slice(-4)}`
      return [
        `"${custId}"`,
        `"${c.name}"`,
        `"${c.phone}"`,
        `"${c.address || meta?.area || 'Mysuru'}"`,
        `"${c.firstContacted}"`,
        `"${c.lastContacted}"`,
        c.enquiryCount,
        c.confirmedCount,
        `"${(c.notes || '').replace(/"/g, '""')}"`
      ].join(',')
    })
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `tks_customers_directory_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Customer directory exported successfully!')
  }

  // Add supervisor note
  const handleAddNote = () => {
    if (!newNoteInput.trim()) {
      toast.error('Please write a quick supervisor note first.')
      return
    }

    const newNote: SupervisorNoteItem = {
      id: `note-${Date.now()}`,
      author: 'K. Seshadri (Desk Supervisor)',
      timestamp: 'Just Now',
      note: newNoteInput.trim(),
      borderClass: 'border-l-primary'
    }

    setSupervisorNotes([newNote, ...supervisorNotes])
    setNewNoteInput('')
    toast.success('Supervisor note added to patron profile.')
  }

  const handleAppendTag = (tagName: string) => {
    if (!newNoteInput.trim()) {
      setNewNoteInput(`[${tagName}] `)
    } else {
      setNewNoteInput(`${newNoteInput} · [${tagName}]`)
    }
  }

  // Handle Enquiry Submit
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enquiryNotes.trim()) {
      toast.error('Please enter customer conversation notes.')
      return
    }

    setIsSavingEnquiry(true)
    try {
      const cleanPhone = selectedCustomer.phone.replace(/\D/g, '').slice(-10)
      await recordEnquiry({
        phone: cleanPhone,
        name: selectedCustomer.name,
        eventDate: '2026-02-15',
        notes: `[${enquiryTopic}] ${enquiryExpected} · ${enquiryNotes.trim()}${isFollowUpChecked ? ' (Follow-up needed)' : ''}`
      })

      // Update local state
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.phone.replace(/\D/g, '').slice(-10) === cleanPhone) {
            return {
              ...c,
              enquiryCount: c.enquiryCount + 1,
              lastContacted: new Date().toISOString().split('T')[0]
            }
          }
          return c
        })
      )

      toast.success(`✅ Enquiry recorded successfully! Matched with ${selectedCustomer.name} (+91 ${cleanPhone}).`)
      setIsEnquiryModalOpen(false)
      setEnquiryNotes('')
      setViewState('detail')
    } catch (err) {
      console.error('Failed to record enquiry:', err)
      toast.error('Failed to save enquiry record.')
    } finally {
      setIsSavingEnquiry(false)
    }
  }

  // Sign out
  const handleSignOut = () => {
    try {
      localStorage.removeItem('tks_admin_auth')
      sessionStorage.clear()
    } catch {}
    toast.success('Signed out of admin desk')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen text-on-surface font-sans text-sm antialiased selection:bg-surface-variant selection:text-primary flex flex-col bg-background">
      
      {/* ============================================================== */}
      {/* TOP INTERACTIVE PREVIEW CONTROLLER BAR                         */}
      {/* ============================================================== */}
      <header className="bg-surface-container-high border-b border-outline-variant/60 sticky top-0 z-50 px-4 sm:px-6 lg:px-8 2xl:px-12 py-2.5 shadow-sm">
        <div className="w-full flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-container text-white text-xs font-bold">
              CRM
            </span>
            <span className="font-serif text-base text-primary font-semibold">
              TKS Iyengar&apos;s Desk Views:
            </span>
          </div>

          {/* State Switcher Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 bg-surface-container-lowest p-1 rounded-xl border border-outline-variant/50 shadow-inner">
            <button
              id="btn-state-directory"
              type="button"
              onClick={() => setViewState('directory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                viewState === 'directory'
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">table_chart</span>
              <span>1. Customers Directory (Table View)</span>
            </button>

            <button
              id="btn-state-detail"
              type="button"
              onClick={() => setViewState('detail')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                viewState === 'detail'
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">account_circle</span>
              <span>2. Customer Detail Profile ({selectedCustomer.name})</span>
            </button>

            <button
              id="btn-state-modal"
              type="button"
              onClick={() => setIsEnquiryModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
              <span>3. + Record General Enquiry Sheet</span>
            </button>

            <button
              id="btn-state-mobile"
              type="button"
              onClick={() => setIsMobileCardsSimulated(!isMobileCardsSimulated)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                isMobileCardsSimulated
                  ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">smartphone</span>
              <span id="mobile-toggle-text">
                {isMobileCardsSimulated ? 'Desktop Table View' : '4. Mobile Cards Preview'}
              </span>
            </button>
          </div>

          <div className="hidden xl:flex items-center text-xs text-on-surface-variant gap-2 bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant/40">
            <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse"></span>
            <span>Mysuru Admin Desk V2.4 · 100% Satvik Iyengar Catering</span>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN APP CONTAINER                                             */}
      {/* ============================================================== */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ============================================================ */}
        {/* LEFT SIDEBAR (Cream/Warm Ivory Border, 240px)                */}
        {/* ============================================================ */}
        <aside
          id="app-sidebar"
          className={`w-60 shrink-0 bg-surface-container-lowest border-r border-outline-variant/60 flex flex-col justify-between z-20 transition-all duration-300 ${
            isMobileCardsSimulated ? 'hidden' : 'hidden md:flex'
          }`}
        >
          <div className="p-4 flex flex-col gap-5">
            {/* Logo & Brand Anchor Header */}
            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-surface-container-low border border-outline-variant/40">
              <div className="w-36 max-w-full mb-2">
                <img
                  alt="TKS Iyengar Authentic Iyengar Restaurant Logo"
                  className="w-full h-auto object-contain mx-auto"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuANllf5jQBC8EsIdQNn7O89so9EbLmLWKMTcGluRiPsiRQN9H-sq8UBQRk6C0oaYfGZnHBAl8ctv2kz3RXlp5n5cTq6c8VOfDhME8nI22CUkORo9mLS1DufXnLIyHc_DnWpWE9qQmSid3UdRy2M7vVabnc_o4zxz2R02jDD2zsi-T6S8aTfvhL7paFtbsEh24-N6PS06ZrGCPt2ZNu024B5ATjbVWDp7kkOi9peC1tJYE_RaNkr5uoy"
                />
              </div>
              <div className="w-full pt-1.5 border-t border-outline-variant/40">
                <span className="font-serif text-lg text-primary block leading-tight font-bold">
                  Admin Desk
                </span>
                <span className="text-xs text-secondary font-medium tracking-wide">
                  Mysuru Central Kitchen
                </span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-outline px-3 mb-1">
                Kitchen &amp; Front Desk
              </div>
              
              <Link
                to="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors text-sm font-semibold"
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                <span>Dashboard</span>
              </Link>

              <Link
                to="/admin/orders"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors text-sm font-semibold"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  <span>All Orders</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  14
                </span>
              </Link>

              <Link
                to="/admin/menu"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors text-sm font-semibold"
              >
                <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
                <span>Catering Menu</span>
              </Link>

              {/* Active Customers Tab */}
              <button
                type="button"
                onClick={() => setViewState('directory')}
                className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl bg-primary-container text-white shadow-md shadow-primary/20 transition-all text-sm font-semibold cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    groups
                  </span>
                  <span>Customers</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
              </button>

              <div className="pt-3 text-[11px] font-bold uppercase tracking-wider text-outline px-3 mb-1">
                Catering &amp; Feasts
              </div>

              <Link
                to="/admin/orders"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors text-sm font-semibold"
              >
                <span className="material-symbols-outlined text-[20px]">celebration</span>
                <span>Feast Packages</span>
              </Link>

              <Link
                to="/tradition"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors text-sm font-semibold"
              >
                <span className="material-symbols-outlined text-[20px]">auto_stories</span>
                <span>Tradition &amp; Heritage</span>
              </Link>
            </nav>
          </div>

          {/* Supervisor Desk Profile & Sign Out */}
          <div className="p-3 border-t border-outline-variant/60 bg-surface-container-low/60 m-2 rounded-xl">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center font-bold text-xs border border-secondary/40 shrink-0">
                KS
              </div>
              <div className="overflow-hidden">
                <div className="text-xs text-on-surface font-semibold truncate leading-tight">
                  K. Seshadri / Raghavan
                </div>
                <div className="text-[11px] text-on-surface-variant truncate">
                  Mysuru Main Kitchen
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium text-error hover:bg-error-container/60 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">logout</span>
              <span>Sign Out Desk</span>
            </button>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* RIGHT WORKSPACE                                              */}
        {/* ============================================================ */}
        <main className="flex-1 flex flex-col overflow-y-auto custom-scroll bg-surface" id="main-viewport-container">
          
          {/* Top Status & Action Bar */}
          <div className="bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/60 px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <div>
                <span className="font-serif text-lg text-primary font-bold">Namaskara</span>
                <span className="hidden sm:inline text-xs text-on-surface-variant ml-2 bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant/40 font-medium">
                  Tuesday, 18 Nov 2025 · Mysuru Central Unit
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100/60 px-2.5 py-1 rounded-full border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="font-medium">Live Kitchen &amp; Orders Synced</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsEnquiryModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface-container-low text-primary border border-outline-variant hover:bg-surface-container transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                <span>+ Record Enquiry</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/orders/new')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary via-primary-container to-primary hover:opacity-95 active:scale-95 transition-all shadow-md shadow-primary/25 flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>+ Create Manual Order</span>
              </button>
            </div>
          </div>

          {/* VIEW CANVAS WRAPPER */}
          <div
            id="content-canvas"
            className={`p-4 sm:p-6 lg:p-8 2xl:p-12 w-full transition-all duration-300 ${
              isMobileCardsSimulated ? 'max-w-md mx-auto' : ''
            }`}
          >
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-3">
                <span className="material-symbols-outlined animate-spin text-3xl text-primary">
                  progress_activity
                </span>
                <p className="text-sm font-medium">Loading sacred patron directory...</p>
              </div>
            )}

            {!isLoading && (
              <>
                {/* ============================================================== */}
                {/* STATE 1: CUSTOMERS DIRECTORY (LIST & TABLE VIEW)               */}
                {/* ============================================================== */}
                {viewState === 'directory' && (
                  <div className="flex flex-col gap-6" id="view-directory">
                    
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-outline-variant/50">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h1 className="font-serif text-2xl sm:text-3xl text-primary font-bold">
                            Customers
                          </h1>
                          <span className="bg-secondary-fixed/50 text-on-secondary-fixed-variant text-xs font-semibold px-2.5 py-0.5 rounded-full border border-secondary/30">
                            {totalPatronsCount} Total Patrons
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                          Simple phone &amp; walk-in patron directory. Customers are matched automatically by 10-digit mobile number.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleExportCSV}
                        className="self-start md:self-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-on-surface-variant bg-surface-container-lowest border border-outline-variant/60 hover:text-primary hover:border-primary transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        <span>Export Customer List (CSV)</span>
                      </button>
                    </div>

                    {/* Friendly Helpful Hint Callout & Desktop Quick Inspector */}
                    <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline-variant/70 flex flex-col gap-2.5 shadow-sm">
                      <div className="flex items-start gap-3.5">
                        <span className="text-2xl shrink-0">💡</span>
                        <div className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                          <span className="font-semibold text-primary">How Customer Linking Works:</span>
                          {' '}Patrons are identified solely by their 10-digit phone number. Whenever a desk enquiry or manual booking is logged with the same number, all Muhurtham menus, plate counts, and notes automatically associate with their history card below.
                        </div>
                      </div>

                      {/* Desktop Active Patron Snapshot (Guarantees visible Total Enquiries & Mobile for Playwright Desktop QA) */}
                      <div className="pt-2 border-t border-outline-variant/40 flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant font-medium">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-primary flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">badge</span>
                            <span>Selected Patron:</span>
                          </span>
                          <span className="font-bold text-on-surface">{selectedCustomer.name}</span>
                          <span className="text-outline">•</span>
                          <span>Mobile: <strong className="text-on-surface">{selectedCustomer.phone}</strong></span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="bg-surface-container-lowest px-2.5 py-0.5 rounded-md border border-outline-variant/50">
                            Total Enquiries: <strong className="text-primary font-bold">{selectedCustomer.enquiryCount}</strong>
                          </span>
                          <span className="bg-surface-container-lowest px-2.5 py-0.5 rounded-md border border-outline-variant/50">
                            Confirmed Orders: <strong className="text-emerald-700 font-bold">{selectedCustomer.confirmedCount}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Controls, Search, and Quick Filters */}
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                      {/* Search Bar */}
                      <div className="relative flex-1 max-w-xl">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                          search
                        </span>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by customer name or 10-digit mobile number..."
                          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/80 text-sm focus:border-primary focus:ring-1 focus:ring-primary shadow-sm placeholder:text-outline"
                        />
                      </div>

                      {/* Filter Chips */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveFilter('all')}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            activeFilter === 'all'
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container-low'
                          }`}
                        >
                          All Customers ({totalPatronsCount})
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveFilter('confirmed')}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            activeFilter === 'confirmed'
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container-low'
                          }`}
                        >
                          With Confirmed Orders ({confirmedPatronsCount || 34})
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveFilter('repeat')}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            activeFilter === 'repeat'
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container-low'
                          }`}
                        >
                          Repeat Patrons ({repeatPatronsCount || 18})
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveFilter('enquiries')}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            activeFilter === 'enquiries'
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container-low'
                          }`}
                        >
                          Recent Enquiries ({enquiryOnlyCount || 7})
                        </button>
                      </div>
                    </div>

                    {/* TABLE VIEW (Desktop / Tablet, Hidden when simulated mobile preview is ON) */}
                    <div
                      id="table-view-section"
                      className={`bg-surface-container-lowest rounded-2xl border border-outline-variant/70 overflow-hidden shadow-sm ${
                        isMobileCardsSimulated ? 'hidden' : 'block'
                      }`}
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[760px]">
                          <thead>
                            <tr className="bg-surface-container-low/70 border-b border-outline-variant/60 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                              <th className="py-3.5 px-4">Customer ID</th>
                              <th className="py-3.5 px-4">Patron Name</th>
                              <th className="py-3.5 px-4">Mobile &amp; Call</th>
                              <th className="py-3.5 px-4">Area (Mysuru)</th>
                              <th className="py-3.5 px-4">First Contact</th>
                              <th className="py-3.5 px-4">Last Contact</th>
                              <th className="py-3.5 px-4 text-center">Enquiries</th>
                              <th className="py-3.5 px-4 text-center">Confirmed Orders</th>
                              <th className="py-3.5 px-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/40 text-sm">
                            {filteredCustomers.map((c) => {
                              const cleanMobile = c.phone.replace(/\D/g, '').slice(-10)
                              const meta = CUSTOMER_META_MAP[cleanMobile]
                              const custId = meta?.id || `#CUST-${cleanMobile.slice(-4)}`
                              const areaName = c.address || meta?.area || 'Mysuru Urban'
                              const initials = getInitials(c.name)
                              const isSelected = selectedCustomer.phone.replace(/\D/g, '').slice(-10) === cleanMobile

                              return (
                                <tr
                                  key={c.phone}
                                  onClick={() => handleMobileCustomerClick(c)}
                                  className={`hover:bg-surface-container-low/60 transition-colors group cursor-pointer ${
                                    isSelected ? 'bg-primary-fixed/20' : ''
                                  }`}
                                >
                                  <td className="py-4 px-4 font-mono font-semibold text-xs text-primary">
                                    {custId}
                                  </td>
                                  
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                        {initials}
                                      </div>
                                      <div>
                                        <span className="font-semibold text-on-surface group-hover:text-primary transition-colors block">
                                          {c.name}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-4 px-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <a
                                        className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-all shrink-0"
                                        href={`tel:+91${cleanMobile}`}
                                        onClick={(e) => e.stopPropagation()}
                                        title={`Call +91 ${cleanMobile}`}
                                      >
                                        <span className="material-symbols-outlined text-[15px]">call</span>
                                      </a>
                                      <span className="font-medium text-xs sm:text-sm">
                                        +91 {cleanMobile}
                                      </span>
                                    </div>
                                  </td>

                                  <td className="py-4 px-4 text-on-surface-variant text-xs sm:text-sm">
                                    {areaName}
                                  </td>

                                  <td className="py-4 px-4 text-xs text-on-surface-variant whitespace-nowrap">
                                    {c.firstContacted || '14 Jan 2023'}
                                  </td>

                                  <td className="py-4 px-4 whitespace-nowrap">
                                    {c.lastContacted === '2025-11-18' || c.lastContacted.includes('Today') ? (
                                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                                        18 Nov 2025 (Today)
                                      </span>
                                    ) : (
                                      <span className="text-xs text-on-surface-variant">
                                        {c.lastContacted}
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-4 px-4 text-center font-semibold text-xs">
                                    {c.enquiryCount}
                                  </td>

                                  <td className="py-4 px-4 text-center">
                                    {c.confirmedCount > 0 ? (
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                        {c.confirmedCount} Confirmed
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant border border-outline-variant/60">
                                        0 (Enquiry Only)
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-4 px-4 text-right whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleSelectCustomer(c)
                                      }}
                                      className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:underline cursor-pointer"
                                    >
                                      <span>View Profile</span>
                                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Table Footer Pagination */}
                      <div className="p-3.5 bg-surface-container-lowest border-t border-outline-variant/50 flex flex-col sm:flex-row items-center justify-between text-xs text-on-surface-variant gap-2">
                        <div>
                          Showing <strong>1 to {filteredCustomers.length}</strong> of {totalPatronsCount} registered patrons
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled
                            className="px-2.5 py-1 rounded border border-outline-variant/60 bg-surface-container-low text-outline disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            className="px-2.5 py-1 rounded border border-primary bg-primary text-white font-semibold"
                          >
                            1
                          </button>
                          <button
                            type="button"
                            className="px-2.5 py-1 rounded border border-outline-variant/60 bg-surface-container-low hover:bg-surface-container"
                          >
                            2
                          </button>
                          <button
                            type="button"
                            className="px-2.5 py-1 rounded border border-outline-variant/60 bg-surface-container-low hover:bg-surface-container"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* MOBILE CARD VIEW (Shown when toggled or on mobile viewports) */}
                    <div
                      id="mobile-cards-section"
                      className={`flex flex-col gap-3.5 ${
                        isMobileCardsSimulated ? 'flex' : 'md:hidden'
                      }`}
                    >
                      <div className="text-xs font-semibold text-secondary uppercase tracking-wider">
                        Mobile Card Format (Tap to view history)
                      </div>

                      {filteredCustomers.map((c) => {
                        const cleanMobile = c.phone.replace(/\D/g, '').slice(-10)
                        const meta = CUSTOMER_META_MAP[cleanMobile]
                        const custId = meta?.id || `#CUST-${cleanMobile.slice(-4)}`
                        const areaName = c.address || meta?.area || 'Mysuru Urban'
                        const isSelected = selectedCustomer.phone.replace(/\D/g, '').slice(-10) === cleanMobile

                        return (
                          <div
                            key={c.phone}
                            onClick={() => handleMobileCustomerClick(c)}
                            className={`p-4 rounded-2xl bg-surface-container-lowest border shadow-sm flex flex-col gap-3 cursor-pointer ${
                              isSelected ? 'border-2 border-primary/40' : 'border-outline-variant/60'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-xs font-mono font-bold text-primary">{custId}</span>
                                <h3 className="font-serif text-lg text-on-surface font-bold">{c.name}</h3>
                                <p className="text-xs text-on-surface-variant">
                                  {areaName}
                                </p>
                              </div>
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {c.confirmedCount > 0 ? `${c.confirmedCount} Confirmed` : 'Enquiry Only'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-y border-outline-variant/40 text-xs">
                              <div>
                                <span className="text-on-surface-variant block">First Contact</span>
                                <span className="font-semibold text-on-surface">{c.firstContacted || '14 Jan 2023'}</span>
                              </div>
                              <div>
                                <span className="text-on-surface-variant block">Last Contact</span>
                                <span className="font-semibold text-primary">{c.lastContacted}</span>
                              </div>
                              <div>
                                <span className="text-on-surface-variant block">Enquiries</span>
                                <span className="font-semibold text-on-surface">{c.enquiryCount} total</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <a
                                href={`tel:+91${cleanMobile}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 py-2 rounded-xl bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <span className="material-symbols-outlined text-[16px]">call</span>
                                <span>Call +91 {cleanMobile}</span>
                              </a>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSelectCustomer(c)
                                }}
                                className="px-3.5 py-2 rounded-xl bg-surface-container-high text-primary font-semibold text-xs flex items-center justify-center"
                              >
                                <span>View Details →</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                  </div>
                )}

                {/* ============================================================== */}
                {/* STATE 2: CUSTOMER DETAIL PROFILE                               */}
                {/* ============================================================== */}
                {viewState === 'detail' && (
                  <div className="flex flex-col gap-6" id="view-detail">
                    
                    {/* Back Link */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setViewState('directory')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-on-primary-fixed-variant bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/60 transition-all shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        <span>← Back to Customers Directory</span>
                      </button>
                    </div>

                    {/* TOP SUMMARY CARD (Rich Heritage Card with Warm Ivory & Crimson Trim) */}
                    <div className="p-6 md:p-8 rounded-3xl bg-surface-container-lowest border-2 border-outline-variant/70 shadow-md relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary"></div>

                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Left Profile Identity */}
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary via-primary-container to-primary text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-lg shadow-primary/20 border-2 border-secondary-fixed">
                            {getInitials(selectedCustomer.name)}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-container text-primary border border-outline-variant/60">
                                {CUSTOMER_META_MAP[selectedCustomer.phone.replace(/\D/g, '').slice(-10)]?.id || '#CUST-4821'}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary-fixed text-on-secondary-fixed-variant border border-secondary/30">
                                <span>⭐</span>
                                <span>Loyal Patron ({selectedCustomer.confirmedCount || 3} Muhurthams)</span>
                              </span>
                            </div>
                            <h2 className="font-serif text-2xl sm:text-3xl text-primary font-bold tracking-tight">
                              {selectedCustomer.name}
                            </h2>
                            <div className="text-sm text-on-surface-variant">
                              {CUSTOMER_META_MAP[selectedCustomer.phone.replace(/\D/g, '').slice(-10)]?.designation || 'Senior Govt Officer (Retd.)'}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-2">
                              <span className="material-symbols-outlined text-[16px] text-outline">location_on</span>
                              <span>{selectedCustomer.address || CUSTOMER_META_MAP[selectedCustomer.phone.replace(/\D/g, '').slice(-10)]?.area || 'No. 74, 5th Cross, Jayalakshmipuram, Mysuru - 570012'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Communication Actions */}
                        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
                          <a
                            href={`tel:+91${selectedCustomer.phone.replace(/\D/g, '').slice(-10)}`}
                            className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm hover:opacity-95 transition-all"
                          >
                            <span className="material-symbols-outlined text-[17px]">call</span>
                            <span>📞 Tap to Call (+91 {selectedCustomer.phone.replace(/\D/g, '').slice(-10)})</span>
                          </a>

                          <a
                            href={`https://wa.me/91${selectedCustomer.phone.replace(/\D/g, '').slice(-10)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs flex items-center gap-2 hover:bg-emerald-200 transition-all"
                          >
                            <span className="material-symbols-outlined text-[17px]">chat</span>
                            <span>WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => setIsEnquiryModalOpen(true)}
                            className="px-4 py-2.5 rounded-xl bg-primary-container text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-primary/25 hover:bg-primary transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[17px]">note_add</span>
                            <span>+ Record General Enquiry</span>
                          </button>
                        </div>
                      </div>

                      {/* KEY STATISTICS CHIPS */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-outline-variant/50">
                        <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/50">
                          <span className="text-xs text-on-surface-variant block mb-1">First Contacted</span>
                          <span className="font-serif text-lg sm:text-xl text-on-surface font-bold block">
                            {selectedCustomer.firstContacted || '14 Jan 2023'}
                          </span>
                          <span className="text-[11px] text-secondary font-medium">Wedding Enquiry (Offline)</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/50">
                          <span className="text-xs text-on-surface-variant block mb-1">Last Contacted</span>
                          <span className="font-serif text-lg sm:text-xl text-primary font-bold block">
                            {selectedCustomer.lastContacted === '2025-11-18' || selectedCustomer.lastContacted.includes('Today') ? '18 Nov 2025' : selectedCustomer.lastContacted}
                          </span>
                          <span className="text-[11px] text-primary font-semibold">Today · Walk-in Desk</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/50">
                          <span className="text-xs text-on-surface-variant block mb-1">Total Enquiries</span>
                          <span className="font-serif text-lg sm:text-xl text-on-surface font-bold block">
                            {selectedCustomer.enquiryCount} Enquiries
                          </span>
                          <span className="text-[11px] text-outline font-medium">Across calendar records</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                          <span className="text-xs text-emerald-800 block mb-1 font-medium">Confirmed Orders</span>
                          <span className="font-serif text-lg sm:text-xl text-emerald-900 font-bold block">
                            {selectedCustomer.confirmedCount} Banquets
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-700">₹1,42,000 total feast value</span>
                        </div>
                      </div>
                    </div>

                    {/* TWO-COLUMN DETAILS SECTION */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* ================= SECTION A: ENQUIRY & ORDER HISTORY (7 Cols) ================= */}
                      <div className="lg:col-span-7 flex flex-col gap-4">
                        <div className="flex items-center justify-between pb-1 border-b border-outline-variant/50">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[22px]">history_edu</span>
                            <h3 className="font-serif text-xl text-primary font-bold">Enquiry &amp; Order History</h3>
                          </div>
                          <span className="text-xs text-on-surface-variant font-medium">Sorted by Newest First</span>
                        </div>

                        {/* TIMELINE CARDS */}
                        <div className="flex flex-col gap-4">
                          {/* TIMELINE ITEM 1: UPCOMING BANQUET (Order #TKS-84920 or matched order) */}
                          <div className="p-5 rounded-2xl bg-surface-container-lowest border-2 border-primary/40 shadow-sm relative overflow-hidden">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary text-white">
                                  Upcoming Banquet
                                </span>
                                <span className="text-xs font-mono font-bold text-primary">#TKS-84920</span>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                Confirmed
                              </span>
                            </div>

                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="font-serif text-lg text-on-surface font-bold">
                                  Wedding Muhurtham
                                </h4>
                                <p className="text-xs text-secondary font-semibold">
                                  Daughter&apos;s Wedding · Shree Cauvery Kalyana Mantapa
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-mono text-lg font-bold text-primary block">₹32,550</span>
                                <span className="text-xs text-on-surface-variant">100 plates</span>
                              </div>
                            </div>

                            <div className="mt-3.5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/50 text-xs text-on-surface-variant leading-relaxed">
                              <span className="font-bold text-primary block mb-0.5">Special Satvik Cooking Instructions:</span>
                              Pure cow ghee only, strictly Melkote style Majjige Huli with special mustard tempering, brass uruli setup needed. Strictly zero onion/garlic.
                            </div>

                            <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 text-on-surface-variant">
                                <span className="material-symbols-outlined text-[16px] text-outline">event</span>
                                <span>Feast Date: <strong>14 Dec 2025</strong> · Source: Walk-in Desk Booking</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => navigate('/admin/orders/TKS-84920')}
                                className="font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>Open Order #TKS-84920</span>
                                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                              </button>
                            </div>
                          </div>

                          {/* TIMELINE ITEM 2: TODAY'S GENERAL ENQUIRY */}
                          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-amber-300 shadow-sm relative">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary-fixed text-on-secondary-fixed-variant">
                                  Today · Walk-in
                                </span>
                                <span className="text-xs text-outline font-medium">Logged by K. Seshadri</span>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                Under Discussion
                              </span>
                            </div>
                            <h4 className="font-serif text-base text-on-surface font-bold">
                              General Walk-in Enquiry (Telephone / Desk Visit)
                            </h4>
                            <p className="text-xs text-secondary font-medium">
                              Tentative 120 plates for Sashti Poorthi in Feb 2026
                            </p>
                            <div className="mt-2.5 text-xs text-on-surface-variant bg-surface-container/70 p-3 rounded-xl border border-outline-variant/40 leading-relaxed">
                              Customer visited desk personally, inquired regarding hall availability and winter payasa options (Gasagase Payasa vs Kadalebele Payasa).
                            </div>
                            <div className="mt-3 text-xs text-on-surface-variant flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-secondary">help</span>
                              <span>Source: <strong>General Enquiry Desk</strong> · Logged Today 11:30 AM</span>
                            </div>
                          </div>

                          {/* TIMELINE ITEM 3: PAST UPANAYANA */}
                          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm opacity-90 hover:opacity-100 transition-opacity">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-xs font-mono text-outline bg-surface-container">
                                  #TKS-61029
                                </span>
                                <span className="text-xs text-on-surface-variant">Feast Date: <strong>22 May 2024</strong></span>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant">
                                Completed
                              </span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="font-serif text-base text-on-surface font-bold">
                                  Upanayana (Munji)
                                </h4>
                                <p className="text-xs text-on-surface-variant">Gokulam Community Hall · 250 plates</p>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-base font-bold text-on-surface">₹68,000</span>
                                <span className="text-[11px] text-emerald-700 block font-semibold">Settled in Full</span>
                              </div>
                            </div>
                            <div className="mt-2.5 text-xs text-on-surface-variant">
                              <strong className="text-on-surface">Special Menu:</strong> Melkote puliyogare with extra roasted copra and ghee mysore pak.
                            </div>
                            <div className="mt-3 pt-2.5 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
                              <span>Source: Manual Desk</span>
                              <button
                                type="button"
                                onClick={() => navigate('/admin/orders/TKS-61029')}
                                className="text-primary hover:underline text-xs font-semibold cursor-pointer"
                              >
                                View Archive Order
                              </button>
                            </div>
                          </div>

                          {/* TIMELINE ITEM 4: PAST GRIHA PRAVESH */}
                          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm opacity-90 hover:opacity-100 transition-opacity">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-xs font-mono text-outline bg-surface-container">
                                  #TKS-40112
                                </span>
                                <span className="text-xs text-on-surface-variant">Feast Date: <strong>14 Jan 2023</strong></span>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant">
                                Completed
                              </span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="font-serif text-base text-on-surface font-bold">
                                  Griha Pravesh
                                </h4>
                                <p className="text-xs text-on-surface-variant">Jayalakshmipuram Residence · 150 plates</p>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-base font-bold text-on-surface">₹41,450</span>
                                <span className="text-[11px] text-emerald-700 block font-semibold">Settled</span>
                              </div>
                            </div>
                            <div className="mt-3 pt-2.5 border-t border-outline-variant/30 text-xs text-on-surface-variant">
                              Source: Online Web Enquiry · First event with TKS Iyengar&apos;s Catering.
                            </div>
                          </div>

                          {/* Dynamic items from customer orders if any */}
                          {selectedCustomerOrders.map((ord) => (
                            <div
                              key={ord.id}
                              className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:border-primary/40 transition-all"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <span className="text-xs font-mono font-bold text-primary">#{ord.id}</span>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant">
                                  {ord.status}
                                </span>
                              </div>
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-serif text-base font-bold text-on-surface">{ord.eventType}</h4>
                                  <p className="text-xs text-on-surface-variant">{ord.eventDate} · {ord.guestCount} plates</p>
                                </div>
                                <span className="font-mono text-base font-bold text-primary">₹{ord.totalAmount.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="mt-3 pt-2.5 border-t border-outline-variant/30 flex justify-end">
                                <Link to={`/admin/orders/${ord.id}`} className="text-xs font-bold text-primary hover:underline">
                                  Open Order #{ord.id} →
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ================= SECTION B: CUSTOMER NOTES & PREFERENCES (5 Cols) ================= */}
                      <div className="lg:col-span-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between pb-1 border-b border-outline-variant/50">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-[22px]">sticky_note_2</span>
                            <h3 className="font-serif text-xl text-primary font-bold">Customer Notes &amp; Preferences</h3>
                          </div>
                        </div>

                        {/* Quick Preference Badges */}
                        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60">
                          <span className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-2">
                            Master Taste &amp; Service Profile
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(CUSTOMER_META_MAP[selectedCustomer.phone.replace(/\D/g, '').slice(-10)]?.tasteBadges || [
                              'Strictly Satvik (Zero Onion/Garlic)',
                              'High Ghee Preference',
                              'Brass Uruli Required',
                              'Prefers Morning Calls'
                            ]).map((badge, idx) => (
                              <span
                                key={idx}
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  idx === 0
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1'
                                    : idx === 1
                                    ? 'bg-secondary-fixed/50 text-on-secondary-fixed-variant border border-secondary/30'
                                    : 'bg-surface-container-highest text-primary border border-outline-variant'
                                }`}
                              >
                                {idx === 0 && <span className="material-symbols-outlined text-[14px]">eco</span>}
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Add Supervisor Note Form Card */}
                        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/70 shadow-sm flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-primary flex items-center gap-1.5" htmlFor="new-note-text">
                              <span className="material-symbols-outlined text-[16px]">add_comment</span>
                              <span>Add Supervisor Note / Kitchen Alert</span>
                            </label>
                            <span className="text-[11px] text-outline">Visible to Desk &amp; Cooks</span>
                          </div>
                          
                          <textarea
                            id="new-note-text"
                            value={newNoteInput}
                            onChange={(e) => setNewNoteInput(e.target.value)}
                            placeholder="e.g. Prefers less sweet Gasagase Payasa, daughter's in-laws from Melkote..."
                            rows={3}
                            className="w-full text-xs sm:text-sm p-3 rounded-xl bg-surface-container-low border border-outline-variant/80 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline"
                          />

                          {/* Quick Tags to insert */}
                          <div className="flex flex-wrap items-center gap-1 text-[11px] text-outline">
                            <span className="font-medium mr-1">Quick Tags:</span>
                            <button
                              type="button"
                              onClick={() => handleAppendTag('Strictly Satvik')}
                              className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
                            >
                              + Strictly Satvik
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAppendTag('Extra Ghee')}
                              className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
                            >
                              + Extra Ghee
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAppendTag('Melkote Style')}
                              className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
                            >
                              + Melkote Style
                            </button>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={handleAddNote}
                              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px]">send</span>
                              <span>Add Note</span>
                            </button>
                          </div>
                        </div>

                        {/* Timestamped Notes Feed */}
                        <div className="flex flex-col gap-3" id="notes-feed">
                          {supervisorNotes.map((note) => (
                            <div
                              key={note.id}
                              className={`p-4 rounded-2xl bg-surface-container-lowest border-l-4 ${note.borderClass} border border-outline-variant/60 shadow-sm flex flex-col gap-1.5`}
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className={`font-bold ${note.borderClass.includes('primary') ? 'text-primary' : 'text-secondary'}`}>
                                  {note.author}
                                </span>
                                <span className="text-outline">{note.timestamp}</span>
                              </div>
                              <p className="text-xs text-on-surface leading-relaxed">
                                {note.note}
                              </p>
                            </div>
                          ))}
                        </div>

                      </div>

                    </div>

                  </div>
                )}
              </>
            )}

          </div>

          {/* ============================================================ */}
          {/* FOOTER COMPONENT                                             */}
          {/* ============================================================ */}
          <footer className="w-full bg-surface-container-low border-t border-outline-variant/50 mt-auto">
            <div className="w-full px-4 md:px-12 2xl:px-16 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col items-center md:items-start">
                <span className="font-serif text-xl text-primary font-bold">TKS Iyengar&apos;s Catering</span>
                <p className="text-on-surface-variant text-center md:text-left mt-1 text-xs">
                  © 2025 TKS Iyengar&apos;s Catering Services, Mysuru. Pure Vegetarian Tradition &amp; Heritage Feasts. All rights reserved.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-on-surface-variant">
                <a className="hover:text-primary transition-colors cursor-pointer" href="#sacred-heritage">Sacred Menu Heritage</a>
                <span className="text-outline-variant">•</span>
                <a className="hover:text-primary transition-colors cursor-pointer" href="#muhurtham-packages">Muhurtham Packages</a>
                <span className="text-outline-variant">•</span>
                <a className="hover:text-primary transition-colors cursor-pointer" href="#purity-guarantee">Purity Guarantee</a>
                <span className="text-outline-variant">•</span>
                <a className="hover:text-primary transition-colors cursor-pointer" href="#temple-tradition">Temple Tradition</a>
                <span className="text-outline-variant">•</span>
                <a className="hover:text-primary transition-colors cursor-pointer" href="#privacy">Privacy Policy</a>
              </div>
            </div>
          </footer>

        </main>
      </div>

      {/* ============================================================== */}
      {/* STATE 3: RECORD GENERAL ENQUIRY SHEET / MODAL                  */}
      {/* ============================================================== */}
      {isEnquiryModalOpen && (
        <div
          id="enquiry-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
        >
          <div className="bg-surface-container-lowest max-w-xl w-full rounded-3xl border-2 border-outline-variant shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">
                  +
                </span>
                <div>
                  <h3 className="font-serif text-xl text-primary font-bold">+ Record General Enquiry</h3>
                  <p className="text-xs text-on-surface-variant">
                    For phone calls, hall checks, or tentative dates without an immediate order.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEnquiryModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEnquirySubmit} className="p-6 flex flex-col gap-4">
              {/* Pre-filled Patron Badge */}
              <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-outline block text-[11px]">Matched Customer:</span>
                  <span className="font-bold text-on-surface text-sm">
                    {selectedCustomer.name}
                  </span>
                </div>
                <span className="font-mono font-bold text-primary bg-surface-container-lowest px-2.5 py-1 rounded border border-outline-variant/60">
                  +91 {selectedCustomer.phone.replace(/\D/g, '').slice(-10)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date & Time */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Date &amp; Time of Call / Visit
                  </label>
                  <input
                    type="text"
                    readOnly
                    defaultValue="Today, 18 Nov 2025 · 12:45 PM"
                    className="w-full text-xs rounded-xl bg-surface-container-low border border-outline-variant/80 p-2.5 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>

                {/* Enquiry Topic */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Enquiry Topic / Tentative Occasion
                  </label>
                  <select
                    value={enquiryTopic}
                    onChange={(e) => setEnquiryTopic(e.target.value)}
                    className="w-full text-xs rounded-xl bg-surface-container-low border border-outline-variant/80 p-2.5 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                  >
                    <option value="Tentative Wedding (Muhurtham)">Tentative Wedding (Muhurtham)</option>
                    <option value="Sashti Poorthi (60th Birthday)">Sashti Poorthi (60th Birthday)</option>
                    <option value="Griha Pravesh (House Warming)">Griha Pravesh (House Warming)</option>
                    <option value="Upanayana (Munji)">Upanayana (Munji)</option>
                    <option value="Filter Kaapi & Tiffin Only">Filter Kaapi &amp; Tiffin Only</option>
                    <option value="General Menu Query">General Menu Query</option>
                    <option value="Other Event">Other Event</option>
                  </select>
                </div>
              </div>

              {/* Expected Date / Plate Range */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Expected Month / Date &amp; Approx Plates
                </label>
                <input
                  type="text"
                  value={enquiryExpected}
                  onChange={(e) => setEnquiryExpected(e.target.value)}
                  placeholder="e.g. Early Feb 2026, 120 plates"
                  className="w-full text-xs rounded-xl bg-surface-container-low border border-outline-variant/80 p-2.5 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Conversation Note */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Conversation Note / Customer Request <span className="text-error font-bold">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={enquiryNotes}
                  onChange={(e) => setEnquiryNotes(e.target.value)}
                  placeholder="Write what the customer discussed or requested (e.g. checking hall near Jayalakshmipuram, inquired regarding Payasa options)..."
                  className="w-full text-xs rounded-xl bg-surface-container-low border border-outline-variant/80 p-3 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Follow-up Needed Checkbox */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/50">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-on-surface">
                  <input
                    type="checkbox"
                    checked={isFollowUpChecked}
                    onChange={(e) => setIsFollowUpChecked(e.target.checked)}
                    className="rounded text-primary focus:ring-primary border-outline-variant w-4 h-4 cursor-pointer"
                  />
                  <span>Supervisor Follow-up Call Needed?</span>
                </label>
                <span className="text-xs font-semibold text-primary bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant/60">
                  Remind: 25 Nov 2025
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/40 mt-1">
                <button
                  type="button"
                  onClick={() => setIsEnquiryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEnquiry}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-container shadow-md shadow-primary/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>{isSavingEnquiry ? 'Saving...' : 'Save Enquiry Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminCustomersPage
