import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getCatalogue, type CatalogueResponse } from '@/api'
import type { MenuItem } from '@/data/mockData'
import { useDraftStore } from '@/store/draftStore'
import { useEnquiryStore } from '@/store/enquiryStore'
import { ItemCard } from '@/components/customer/ItemCard'
import { CustomerDesktopShell } from '@/components/customer/CustomerDesktopShell'
import { CatalogueSkeleton } from '@/components/ui/skeletons'
import { VirtualBananaLeafModal } from '@/components/customer/VirtualBananaLeafModal'
import { TastingSessionModal } from '@/components/customer/TastingSessionModal'

type PurityFilter = 'all' | 'satvik' | 'pureGhee' | 'live'
type NavTab = 'tradition' | 'menus' | 'muhurtham' | 'enquiry'

interface PresetFeastPlan {
  id: string
  name: string
  kannadaName: string
  subtitle: string
  tag: string
  icon: string
  itemIds: string[]
}

const PRESET_MUHURTHAM_FEASTS: PresetFeastPlan[] = [
  {
    id: 'kalyana-feast',
    name: 'Royal Mysore Kalyana Feast',
    kannadaName: 'ರಾಜ ಮಹೋತ್ಸವ ಕಲ್ಯಾಣ ಊಟ',
    subtitle: 'Grand wedding banquet with pure cow ghee sweets, traditional saaru & live service.',
    tag: '👑 Most Popular',
    icon: 'crown',
    itemIds: ['item-1', 'item-2', 'item-3', 'item-4', 'item-7', 'item-8', 'item-9', 'item-10', 'item-12']
  },
  {
    id: 'muhurtham-breakfast',
    name: 'Traditional Muhurtham Breakfast',
    kannadaName: 'ಸಾಂಪ್ರದಾಯಿಕ ಮುಹೂರ್ತ ತಿಂಡಿ',
    subtitle: 'Fluffy idlis, crispy medu vadas, ghee ven pongal, and aromatic filter coffee.',
    tag: '🌅 Morning Feasts',
    icon: 'wb_sunny',
    itemIds: ['item-5', 'item-6', 'item-10', 'item-12']
  },
  {
    id: 'satvik-homam',
    name: 'Satvik Ayushya Homam Feast',
    kannadaName: 'ಸಾತ್ವಿಕ ಆಯುಷ್ಯ ಹೋಮ ಊಟ',
    subtitle: 'Pristine Vedic pooja spread, strictly no onion/garlic, temple-simmered dishes.',
    tag: '🌿 100% Satvik',
    icon: 'spa',
    itemIds: ['item-1', 'item-7', 'item-9', 'item-11']
  },
  {
    id: 'grihapravesha-special',
    name: 'Grihapravesha Banquet',
    kannadaName: 'ಗೃಹಪ್ರವೇಶ ಶುಭ ಸಮಾರಂಭ',
    subtitle: 'Auspicious housewarming feast with royal Mysore Pak and heritage gojju spread.',
    tag: '🏡 Housewarming',
    icon: 'cottage',
    itemIds: ['item-2', 'item-3', 'item-4', 'item-8', 'item-12']
  }
]

export const CataloguePage: React.FC = () => {
  const navigate = useNavigate()

  // State for catalogue data, loading, and error
  const [data, setData] = useState<CatalogueResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Active top nav tab state
  const [activeNavTab, setActiveNavTab] = useState<NavTab>('menus')

  // Filter & search state
  const [activeCategoryId, setActiveCategoryId] = useState<string>('cat-all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [purityFilter, setPurityFilter] = useState<PurityFilter>('all')

  // Modals state
  const [isLeafModalOpen, setIsLeafModalOpen] = useState(false)
  const [isTastingModalOpen, setIsTastingModalOpen] = useState(false)

  // Global draft store
  const selectedItems = useDraftStore((state) => state.items)
  const toggleItem = useDraftStore((state) => state.toggleItem)
  const loadPresetFeast = useDraftStore((state) => state.loadPresetFeast)
  const requirements = useDraftStore((state) => state.requirements)
  const setRequirements = useDraftStore((state) => state.setRequirements)
  const selectedCount = Object.keys(selectedItems).length
  const perPlateTotal = useDraftStore((state) => state.getPerPlateTotal())
  const guestCount = requirements.guestCount || 150
  const enquiriesCount = useEnquiryStore((state) => state.enquiries.length)

  // Load catalogue data
  const loadCatalogue = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getCatalogue()
      setData(res)
    } catch {
      setError('Unable to load catering menu. Please check your connection and retry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCatalogue()
  }, [])

  // Smooth scroll helper for navbar portions
  const scrollToSection = (sectionId: 'tradition' | 'menus' | 'muhurtham') => {
    setActiveNavTab(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Handle navigation for the 4 top navbar options
  const handleNavClick = (tab: NavTab) => {
    if (tab === 'enquiry') {
      setActiveNavTab('enquiry')
      navigate('/enquiries')
    } else {
      scrollToSection(tab)
    }
  }

  // Categories list
  const categories = useMemo(() => {
    if (!data?.categories) return []
    const hasAll = data.categories.some((c) => c.id === 'cat-all')
    if (hasAll) return data.categories
    return [
      { id: 'cat-all', name: 'All Dishes', displayOrder: 0 },
      ...data.categories
    ]
  }, [data?.categories])

  // Filtered items based on Category, Search Query, and Purity Filter
  const filteredItems = useMemo(() => {
    if (!data?.items) return []

    return data.items.filter((item) => {
      // 1. Category filter
      if (activeCategoryId && activeCategoryId !== 'cat-all') {
        const catObj = categories.find((c) => c.id === activeCategoryId)
        if (catObj && item.category !== catObj.name && item.category !== catObj.id) {
          return false
        }
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = item.name.toLowerCase().includes(q)
        const matchesDesc = (item.description || '').toLowerCase().includes(q)
        const matchesTag = (item.heritageTag || '').toLowerCase().includes(q)
        const matchesCategory = item.category.toLowerCase().includes(q)
        if (!matchesName && !matchesDesc && !matchesTag && !matchesCategory) {
          return false
        }
      }

      // 3. Purity matrix filter
      if (purityFilter === 'satvik' && !item.satvik) {
        return false
      }
      if (purityFilter === 'pureGhee' && !item.pureGhee) {
        return false
      }
      if (purityFilter === 'live') {
        const isLive = (item.heritageTag || '').toLowerCase().includes('live') ||
                       (item.name || '').toLowerCase().includes('rotti') ||
                       (item.name || '').toLowerCase().includes('dosa') ||
                       (item.name || '').toLowerCase().includes('coffee')
        if (!isLive) return false
      }

      return true
    })
  }, [data?.items, activeCategoryId, searchQuery, purityFilter, categories])

  // Estimated banquet total
  const displayPerPlate = perPlateTotal > 0 ? perPlateTotal : 460
  const estimatedBanquetTotal = displayPerPlate * guestCount

  // Load preset feast handler
  const handleLoadPreset = (preset: PresetFeastPlan) => {
    if (!data?.items) return
    const itemsToLoad: MenuItem[] = []
    preset.itemIds.forEach((id) => {
      const found = data.items.find((it) => it.id === id)
      if (found) itemsToLoad.push(found)
    })

    if (itemsToLoad.length > 0) {
      loadPresetFeast(itemsToLoad, preset.name)
      toast.success(`${preset.name} loaded with ${itemsToLoad.length} authentic delicacies!`)
      scrollToSection('menus')
    }
  }

  // WhatsApp share link
  const whatsappUrl = useMemo(() => {
    const text = encodeURIComponent(
      `Namaskara! I am planning a traditional Mysore Iyengar feast for ${guestCount} guests (${requirements.eventType || 'Muhurtham'}). Selected ${selectedCount} dishes at ₹${displayPerPlate}/plate. Estimated banquet total: ₹${estimatedBanquetTotal.toLocaleString('en-IN')}. Could you please share quotation and availability?`
    )
    return `https://wa.me/918212448920?text=${text}`
  }, [guestCount, requirements.eventType, selectedCount, displayPerPlate, estimatedBanquetTotal])

  return (
    <CustomerDesktopShell maxWidth="w-full">
      {/* 1. TOP ANNOUNCEMENT BANNER (Full Page Edge-to-Edge) */}
      <header className="bg-primary text-on-primary py-2 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 text-xs font-medium tracking-wide border-b border-primary-container/40 w-full">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-secondary-container">local_fire_department</span>
            <span className="truncate">Mysuru's Revered Iyengar Traditional Feasts • Prepared Strictly Without Onion &amp; Garlic</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-primary-fixed shrink-0">
            <a href="tel:+918212448920" className="hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">phone_in_talk</span>
              <span className="hidden sm:inline">Kitchen Hotline:</span> +91 821 244 8920
            </a>
          </div>
        </div>
      </header>

      {/* 2. STICKY TOP NAVIGATION BAR (Full Page Edge-to-Edge) */}
      <nav className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/15 py-3 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 w-full shadow-2xs">
        <div className="w-full flex items-center justify-between">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <img 
              alt="TKS Iyengar's Logo" 
              className="h-10 w-auto object-contain rounded-md" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6occrKYgf2RCe6-ZpsHHNSwBTZw3OIJCIu6JOOkQR-MmVOIiKZ7bUBYzMU1l09v4a7bX1aa5bfz0MQN5Gh1wPHBVRO7LGbM1E9Bko7oNR5cwbenpCKvUqkdjPSjrtKo9Dv1OlVn0VLfzhNsNmnyXZsER8N1zZKYj1hy1Z5QQB-5nt5D6OCeHk91zan3n3flKIP17cg5vuWoRorqja0dU2rPYG_7kXSD98DR2K5GVG8F_91Jgo9rr6"
            />
            <div>
              <h1 className="font-headline font-bold text-lg leading-tight text-primary">
                TKS Iyengar's<br/>
                <span className="text-xs uppercase font-sans tracking-widest text-on-surface-variant font-semibold">Catering</span>
              </h1>
              <span className="inline-block text-[9px] bg-secondary-container/20 text-on-secondary-fixed border border-secondary/30 px-1.5 py-0.2 rounded-xs font-bold uppercase tracking-wider">
                ✦ 100% Mysuru Sattvic Heritage
              </span>
            </div>
          </div>

          {/* 4 Working Middle Nav Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold">
            {/* 1. Tradition */}
            <button
              type="button"
              onClick={() => handleNavClick('tradition')}
              className={`pb-1 transition-all cursor-pointer select-none ${
                activeNavTab === 'tradition'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Tradition
            </button>

            {/* 2. Catering Menus */}
            <button
              type="button"
              onClick={() => handleNavClick('menus')}
              className={`pb-1 transition-all cursor-pointer select-none ${
                activeNavTab === 'menus'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Catering Menus
            </button>

            {/* 3. Muhurtham Feasts */}
            <button
              type="button"
              onClick={() => handleNavClick('muhurtham')}
              className={`pb-1 transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                activeNavTab === 'muhurtham'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary-container">eco</span>
              <span>Muhurtham Feasts</span>
            </button>

            {/* 4. Enquiry */}
            <button
              type="button"
              onClick={() => handleNavClick('enquiry')}
              className={`pb-1 transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                activeNavTab === 'enquiry'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span>Enquiry</span>
              {enquiriesCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                  {enquiriesCount}
                </span>
              )}
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a 
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-primary bg-primary-fixed/30 hover:bg-primary-fixed/50 px-3.5 py-1.5 rounded-full transition-colors border border-primary/10" 
              href="tel:+918212448920"
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              +91 821 244 8920
            </a>

            {/* Enquiries Button */}
            <button 
              type="button"
              onClick={() => navigate('/enquiries')}
              className="relative p-2 rounded-full hover:bg-surface-container-low transition-colors" 
              title="My Enquiries"
              aria-label="View previous banquet enquiries"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface">calendar_month</span>
              {enquiriesCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>

            {/* Shopping Bag Button */}
            <button 
              type="button"
              onClick={() => {
                if (selectedCount > 0) {
                  navigate('/request')
                } else {
                  setIsLeafModalOpen(true)
                }
              }}
              className="relative p-2 rounded-full hover:bg-surface-container-low transition-colors" 
              title="Selected Items"
              aria-label={`Selected delicacies: ${selectedCount}`}
            >
              <span className="material-symbols-outlined text-[22px] text-on-surface">shopping_bag</span>
              {selectedCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-on-primary rounded-full text-[10px] flex items-center justify-center font-bold">
                  {selectedCount}
                </span>
              )}
            </button>

            {/* Plan Event Banquet Button */}
            <button 
              type="button"
              onClick={() => {
                if (selectedCount > 0) {
                  navigate('/request')
                } else {
                  const firstItem = data?.items?.[0]
                  if (firstItem) toggleItem(firstItem)
                  navigate('/request')
                }
              }}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-primary to-[#b30a05] text-on-primary text-xs font-bold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">flatware</span>
              Plan Event Banquet
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar for 4 Options */}
        <div className="flex md:hidden items-center justify-around border-t border-outline-variant/10 pt-2.5 mt-2.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleNavClick('tradition')}
            className={`px-2 py-1 ${activeNavTab === 'tradition' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}
          >
            Tradition
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('menus')}
            className={`px-2 py-1 ${activeNavTab === 'menus' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}
          >
            Menus
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('muhurtham')}
            className={`px-2 py-1 ${activeNavTab === 'muhurtham' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}
          >
            Feasts
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('enquiry')}
            className={`px-2 py-1 ${activeNavTab === 'enquiry' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}
          >
            Enquiry {enquiriesCount > 0 ? `(${enquiriesCount})` : ''}
          </button>
        </div>
      </nav>

      {/* MAIN FULL-PAGE CONTAINER */}
      <main className="w-full flex-1 flex flex-col">
        
        {/* SECTION A: INTERACTIVE EVENT CONTEXT BAR (Full Page Width) */}
        <section id="context-bar" className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 pt-6 pb-2">
          <div className="w-full bg-surface-container-low rounded-2xl p-4 sm:p-5 border border-outline-variant/15 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
            {/* Auspicious Occasion */}
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">celebration</span>
              <div>
                <label 
                  htmlFor="catering-occasion-select" 
                  className="block text-[10px] uppercase font-bold text-outline tracking-wider"
                >
                  Auspicious Occasion
                </label>
                <select 
                  id="catering-occasion-select"
                  aria-label="Catering occasion type"
                  value={requirements.eventType || 'Upanayana (ಉಪನಯನ ಮಹೋತ್ಸವ)'}
                  onChange={(e) => setRequirements({ eventType: e.target.value })}
                  className="bg-transparent font-headline font-bold text-sm sm:text-base lg:text-lg text-primary focus:outline-none cursor-pointer pr-4"
                >
                  <option value="Upanayana (ಉಪನಯನ ಮಹೋತ್ಸವ)">Upanayana (ಉಪನಯನ ಮಹೋತ್ಸವ)</option>
                  <option value="Traditional Muhurtham (ವಿವಾಹ)">Traditional Muhurtham (ವಿವಾಹ)</option>
                  <option value="Grihapravesham (ಗೃಹಪ್ರವೇಶ)">Grihapravesham (ಗೃಹಪ್ರವೇಶ)</option>
                  <option value="Ayushya Homam (ಆಯುಷ್ಯ ಹೋಮ)">Ayushya Homam (ಆಯುಷ್ಯ ಹೋಮ)</option>
                  <option value="Seemantham (ಸೀಮಂತ)">Seemantham (ಸೀಮಂತ)</option>
                  <option value="Satyanarayana Pooja (ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ)">Satyanarayana Pooja (ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ)</option>
                </select>
              </div>
            </div>

            {/* Number of Guests */}
            <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-outline-variant/20 pt-2 sm:pt-0 sm:pl-6">
              <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">groups</span>
              <div>
                <span className="block text-[10px] uppercase font-bold text-outline tracking-wider">Number of Guests</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <button 
                    type="button" 
                    onClick={() => setRequirements({ guestCount: Math.max(25, guestCount - 25) })}
                    title="Decrease 25 guests"
                    aria-label="Decrease 25 guests"
                    className="w-7 h-7 rounded-full bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center font-bold text-xs text-primary hover:bg-surface-container-high transition-colors cursor-pointer select-none shadow-2xs"
                  >
                    -
                  </button>
                  <span className="font-headline font-bold text-base sm:text-lg text-primary min-w-[3ch] text-center select-none">
                    {guestCount}
                  </span>
                  <span className="text-xs text-outline font-medium">Guests</span>
                  <button 
                    type="button" 
                    onClick={() => setRequirements({ guestCount: guestCount + 25 })}
                    title="Increase 25 guests"
                    aria-label="Increase 25 guests"
                    className="w-7 h-7 rounded-full bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center font-bold text-xs text-primary hover:bg-surface-container-high transition-colors cursor-pointer select-none shadow-2xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Muhurtham Date */}
            <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-outline-variant/20 pt-2 sm:pt-0 sm:pl-6">
              <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">event</span>
              <div>
                <label 
                  htmlFor="muhurtham-date-input"
                  className="block text-[10px] uppercase font-bold text-outline tracking-wider"
                >
                  Muhurtham Date
                </label>
                <div className="flex items-center gap-2 mt-0.5">
                  <input 
                    id="muhurtham-date-input"
                    type="date" 
                    aria-label="Muhurtham event date"
                    value={requirements.eventDate || '2026-11-18'} 
                    onChange={(e) => setRequirements({ eventDate: e.target.value })}
                    className="bg-transparent font-headline font-bold text-xs sm:text-sm lg:text-base text-primary focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Traditional Plantain Leaf Service Tag */}
            <div className="hidden lg:flex items-center gap-2.5 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/15 text-xs text-on-surface-variant font-medium shadow-2xs">
              <span className="material-symbols-outlined text-tertiary-container text-lg">eco</span>
              <div>
                <span className="font-bold text-on-surface block text-xs">Traditional Plantain Leaf</span>
                <span className="text-[11px] text-outline">Live hot counters &amp; Mysuru Rasam service included</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION B: MUHURTHAM FEASTS PORTION (Portion 3 from Navbar, Full Page Width) */}
        <section 
          id="muhurtham" 
          aria-label="Curated Muhurtham Banquet Feasts" 
          className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 scroll-mt-20"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/20 text-on-secondary-fixed border border-secondary/30 text-xs font-bold mb-2">
                <span className="material-symbols-outlined text-[14px]">stars</span>
                Curated Banquet Packages
              </div>
              <h2 className="font-headline font-black text-2xl sm:text-3xl lg:text-4xl text-primary tracking-tight">
                Muhurtham Feasts &amp; Grand Packages
              </h2>
              <p className="text-sm text-on-surface-variant mt-1.5 max-w-3xl font-normal leading-relaxed">
                Handcrafted authentic Mysuru banquet menus perfected across 40 years. Select any auspicious feast to load all its authentic delicacies into your estimation with a single tap.
              </p>
            </div>

            {/* Leaf Visualizer Trigger */}
            <button
              type="button"
              onClick={() => setIsLeafModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-tertiary-container/15 hover:bg-tertiary-container/25 text-tertiary-container border border-tertiary-container/30 text-xs font-bold transition-all flex items-center gap-2 self-start md:self-auto shrink-0 shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">eco</span>
              <span>Preview on Banana Leaf</span>
            </button>
          </div>

          {/* 4 Curated Feast Cards Grid (Full width across screen) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
            {PRESET_MUHURTHAM_FEASTS.map((feast) => (
              <div 
                key={feast.id}
                className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/15 flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:border-primary/30"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-container/30 text-on-secondary-container border border-secondary/20">
                      {feast.tag}
                    </span>
                    <span className="material-symbols-outlined text-primary text-xl">
                      {feast.icon}
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-base sm:text-lg text-primary tracking-tight">
                    {feast.name}
                  </h3>
                  <p className="text-[11px] font-kannada text-on-surface-variant/90 font-medium mt-0.5">
                    {feast.kannadaName}
                  </p>
                  <p className="text-xs text-on-surface-variant/80 mt-2 leading-relaxed">
                    {feast.subtitle}
                  </p>
                  <div className="mt-3 text-[11px] text-outline font-semibold">
                    Includes {feast.itemIds.length} traditional delicacies
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-outline-variant/10">
                  <button
                    type="button"
                    onClick={() => handleLoadPreset(feast)}
                    className="w-full py-2 px-3 rounded-xl bg-surface-container-lowest hover:bg-primary hover:text-white text-primary border border-primary/25 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer select-none"
                  >
                    <span className="material-symbols-outlined text-[15px]">add_task</span>
                    <span>Load This Feast</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION C: CATERING MENUS PORTION (Portion 2 from Navbar, Full Page Width) */}
        <section 
          id="menus" 
          aria-label="Catering Menu Catalogue" 
          className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 pt-8 pb-4 scroll-mt-20"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/40 text-primary border border-primary/20 text-xs font-bold mb-2">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                100% Pure Ghee &amp; Authentic Mysuru Temple Recipes
              </div>
              <h2 className="font-headline font-black text-3xl sm:text-4xl text-primary tracking-tight">
                Catering Menu Catalogue
              </h2>
              <p className="text-sm text-on-surface-variant mt-2 max-w-3xl font-normal leading-relaxed">
                Handcrafted sacred heritage dishes for grand muhurthams, upanayanas, and household poojas. Pick delicacies to customize your plantain leaf feast.
              </p>
            </div>

            {/* Feast Price Live Rate Card */}
            <div className="bg-surface-container-low border border-outline-variant/15 rounded-2xl p-4 flex items-center gap-4 self-start md:self-auto shrink-0 shadow-xs">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">restaurant</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-outline block uppercase tracking-wider">Feast Price / Guest</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline font-black text-2xl text-primary">
                    ₹{displayPerPlate}
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium">/ plate</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH & DIETARY FILTER CHIPS (Full Page Width) */}
        <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Box */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Puliyogare, Mysore Pak, Rasam, Pongal..." 
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-full pl-10 pr-9 py-2.5 text-xs sm:text-sm text-on-surface placeholder-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-2xs"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1"
                  aria-label="Clear search query"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Dietary Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <button 
                type="button" 
                onClick={() => setPurityFilter(purityFilter === 'satvik' ? 'all' : 'satvik')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer select-none ${
                  purityFilter === 'satvik'
                    ? 'bg-tertiary-container text-white border border-tertiary-container shadow-2xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/15'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">spa</span>
                <span>No Onion No Garlic</span>
              </button>
              <button 
                type="button" 
                onClick={() => setPurityFilter(purityFilter === 'pureGhee' ? 'all' : 'pureGhee')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer select-none ${
                  purityFilter === 'pureGhee'
                    ? 'bg-secondary-container text-on-secondary-container border border-secondary shadow-2xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/15'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">water_drop</span>
                <span>Pure Desi Ghee Only</span>
              </button>
              <button 
                type="button" 
                onClick={() => setPurityFilter(purityFilter === 'live' ? 'all' : 'live')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer select-none ${
                  purityFilter === 'live'
                    ? 'bg-primary text-on-primary border border-primary shadow-2xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/15'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">skillet</span>
                <span>Live Tiffin Counter</span>
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setPurityFilter('all')
                  setSearchQuery('')
                  setActiveCategoryId('cat-all')
                }}
                title="Reset all filters"
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/15 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer select-none"
              >
                <span className="material-symbols-outlined text-[14px]">tune</span>
                <span>Filters</span>
              </button>
            </div>
          </div>
        </section>

        {/* AGILE CATEGORY PILL CAROUSEL (Full Page Width) */}
        <section className="sticky top-[69px] z-30 bg-surface/95 backdrop-blur-md border-y border-outline-variant/10 py-2.5 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 w-full">
          <div 
            role="tablist" 
            aria-label="Catering menu categories" 
            className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
          >
            {categories.map((cat) => {
              const isSelected = activeCategoryId === cat.id || (!activeCategoryId && cat.id === 'cat-all')
              return (
                <button 
                  key={cat.id}
                  role="tab"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 shrink-0 cursor-pointer select-none ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/15'
                  }`}
                >
                  {cat.id === 'cat-all' && <span className="material-symbols-outlined text-[14px]">all_inclusive</span>}
                  {cat.id === 'cat-rice' && <span className="material-symbols-outlined text-[14px]">rice_bowl</span>}
                  {cat.id === 'cat-tiffins' && <span className="material-symbols-outlined text-[14px]">bakery_dining</span>}
                  {cat.id === 'cat-sambar' && <span className="material-symbols-outlined text-[14px]">soup_kitchen</span>}
                  {cat.id === 'cat-sweets' && <span className="material-symbols-outlined text-[14px]">cake</span>}
                  {cat.id === 'cat-palya' && <span className="material-symbols-outlined text-[14px]">nutrition</span>}
                  {cat.id === 'cat-beverages' && <span className="material-symbols-outlined text-[14px]">local_cafe</span>}
                  <span>
                    {cat.name} {cat.id === 'cat-all' ? `(${filteredItems.length})` : ''}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* DISH CARDS GRID (Full Page Width across all viewports) */}
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-6 flex-1">
          {loading ? (
            <CatalogueSkeleton />
          ) : error ? (
            <div className="p-8 text-center bg-surface-container-low rounded-2xl border border-outline-variant/20 max-w-md mx-auto my-12">
              <span className="material-symbols-outlined text-4xl text-primary mb-2">error</span>
              <p className="text-sm font-semibold text-primary">{error}</p>
              <button 
                type="button" 
                onClick={loadCatalogue} 
                className="mt-4 px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold"
              >
                Retry
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center bg-surface-container-low rounded-2xl border border-outline-variant/15 max-w-md mx-auto my-8">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
              <h4 className="font-headline font-bold text-base text-primary">No dishes found</h4>
              <p className="text-xs text-on-surface-variant mt-1">
                Try adjusting your search query or selecting a different dietary filter.
              </p>
              <button 
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setPurityFilter('all')
                  setActiveCategoryId('cat-all')
                }}
                className="mt-4 px-4 py-1.5 rounded-full bg-surface-container-high text-xs font-bold text-primary hover:bg-surface-container-highest transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 w-full">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* SECTION D: TRADITION PORTION (Portion 1 from Navbar, Full Page Width) */}
        <section 
          id="tradition" 
          aria-label="Authentic Mysuru Sattvic Tradition" 
          className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-12 scroll-mt-20 border-t border-outline-variant/15 bg-surface-container-low/50"
        >
          <div className="w-full mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/40 text-primary border border-primary/20 text-xs font-bold mb-2">
              <span className="material-symbols-outlined text-[14px]">temple_hindu</span>
              ✦ 40+ Years of Sacred Culinary Mastery
            </div>
            <h2 className="font-headline font-black text-2xl sm:text-3xl lg:text-4xl text-primary tracking-tight">
              Mysuru Brahmin Tradition &amp; Sacred Sattvic Heritage
            </h2>
            <p className="text-sm text-on-surface-variant mt-2 max-w-4xl font-normal leading-relaxed">
              For over four decades, TKS Iyengar's Catering has upheld the holy culinary rites of ancient Mysuru and Melkote. Prepared strictly without onion, garlic, or artificial essences, our recipes honor devout Vaishnavite hospitality, slow-cooked in traditional eeya chombu tin-lined vessels with pure churned cow ghee.
            </p>
          </div>

          {/* Heritage Purity Guarantee Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            {/* Bento Card 1: Pure Desi Ghee */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/15 flex items-start gap-4 shadow-2xs hover:shadow-md transition-shadow">
              <div className="p-3 rounded-xl bg-secondary-container/20 text-on-secondary-container shrink-0">
                <span className="material-symbols-outlined text-2xl">water_drop</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-primary">100% Pure Desi Ghee</h3>
                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                  Every sweet, sambar tempering, and payasam is slow-cooked exclusively in authentic dairy clarified butter with zero hydrogenated fats or palm oils.
                </p>
              </div>
            </div>

            {/* Bento Card 2: Traditional Banana Leaf */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/15 flex items-start gap-4 shadow-2xs hover:shadow-md transition-shadow">
              <div className="p-3 rounded-xl bg-tertiary-container/20 text-tertiary-container shrink-0">
                <span className="material-symbols-outlined text-2xl">eco</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-primary">Traditional Banana Leaf Protocol</h3>
                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                  Full seated traditional serving protocol with trained Mysuru servers strictly adhering to Vedic Panchanga dish serving order.
                </p>
              </div>
            </div>

            {/* Bento Card 3: Strict Vedic Hygiene */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/15 flex items-start gap-4 shadow-2xs hover:shadow-md transition-shadow">
              <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                <span className="material-symbols-outlined text-2xl">workspace_premium</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-primary">Strict Vedic Hygiene</h3>
                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                  Prepared by Vaishnavite cooks following devout ritual purity, with multi-stage RO-purified water and autoclaved brass kitchen vessels.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => scrollToSection('menus')}
              className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore Catering Menus</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={() => setIsTastingModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-surface-container-lowest text-primary border border-primary/25 text-xs font-bold hover:bg-surface-container-high transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">box</span>
              <span>Request Private Tasting Box</span>
            </button>
          </div>
        </section>
      </main>

      {/* 9. TRADITIONAL HERITAGE FOOTER (Full Page Width) */}
      <footer className="bg-surface-container-low border-t border-outline-variant/15 py-10 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 mt-12 pb-32 text-xs text-on-surface-variant w-full">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <h3 className="font-headline font-bold text-primary text-base">TKS Iyengar's Catering</h3>
            <span className="text-[10px] bg-secondary-container/20 text-on-secondary-fixed border border-secondary/30 px-1.5 py-0.5 rounded font-bold">
              Mysuru Estd. 1984
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-semibold text-outline">
            <button type="button" onClick={() => scrollToSection('tradition')} className="hover:text-primary transition-colors cursor-pointer">
              Sacred Menu Heritage
            </button>
            <button type="button" onClick={() => scrollToSection('muhurtham')} className="hover:text-primary transition-colors cursor-pointer">
              Muhurtham Packages
            </button>
            <button type="button" onClick={() => scrollToSection('tradition')} className="hover:text-primary transition-colors cursor-pointer">
              Purity Guarantee
            </button>
            <button type="button" onClick={() => setIsTastingModalOpen(true)} className="hover:text-primary transition-colors cursor-pointer">
              Tasting Box Session
            </button>
            <button type="button" onClick={() => navigate('/enquiries')} className="hover:text-primary transition-colors cursor-pointer">
              Enquiry for Banquets
            </button>
          </div>
        </div>
        <div className="w-full border-t border-outline-variant/10 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-outline">
          <p>© 2026 TKS Iyengar's Catering Services, Mysuru. Pure Vegetarian Tradition &amp; Heritage.</p>
          <div className="flex items-center gap-4">
            <span>Head Kitchen: 142/A Krishnamurthy Puram, Mysuru 570004</span>
            <a href="#privacy" className="hover:text-primary">Privacy Policy</a>
          </div>
        </div>
      </footer>

      {/* 10. FLOATING BOTTOM SUMMARY BAR (Generous Wide Layout) */}
      <aside 
        aria-label="Banquet feast selection summary" 
        className="fixed bottom-4 left-4 right-4 sm:left-8 sm:right-8 lg:left-12 lg:right-12 xl:left-16 xl:right-16 2xl:left-24 2xl:right-24 z-50 pointer-events-auto"
      >
        <div className="w-full max-w-6xl mx-auto bg-surface/90 backdrop-blur-md border border-outline-variant/20 rounded-full p-2.5 sm:p-3 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 ring-1 ring-black/5">
          {/* Left: Delicacies Count & Per Plate Rate */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">soup_kitchen</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline font-bold text-xs sm:text-sm text-primary">
                  {selectedCount} Delicacies Selected
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium">
                  • {guestCount} Guests
                </span>
              </div>
              <div className="text-[10px] text-outline flex items-center gap-1">
                <span>Per-Plate: ₹{displayPerPlate}</span>
                <span>• Includes Service &amp; Leaves</span>
              </div>
            </div>
          </div>

          {/* Center / Right: Estimate, WhatsApp & Primary Proceed CTA */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-outline-variant/10 pt-2 sm:pt-0">
            <div className="text-left sm:text-right">
              <span className="text-[9px] uppercase font-bold text-outline tracking-wider block">
                Banquet Estimate
              </span>
              <span className="font-headline font-black text-sm sm:text-base text-primary">
                ₹{estimatedBanquetTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] text-outline block -mt-0.5">
                + applicable GST &amp; transport
              </span>
            </div>

            {/* WhatsApp Share Button */}
            <a 
              href={whatsappUrl}
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Share feast requirements on WhatsApp"
              className="px-3 py-2 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-xs flex items-center gap-1 border border-[#25D366]/30 transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span className="hidden md:inline">WhatsApp</span>
            </a>

            {/* Primary Proceed Button (Maintains strict Playwright test compatibility) */}
            {selectedCount === 0 ? (
              <button
                id="proceed-to-request-btn"
                type="button"
                disabled={true}
                className="px-5 py-2.5 rounded-full bg-surface-container-high text-outline text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed opacity-75 shrink-0"
              >
                <span>Select at least one item</span>
              </button>
            ) : (
              <button
                id="proceed-to-request-btn"
                type="button"
                onClick={() => navigate('/request')}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-[#b30a05] text-on-primary text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg hover:scale-102 transition-all cursor-pointer shrink-0"
              >
                <span>Proceed to Muhurtham Quote</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Modals for Banana Leaf Preview & Tasting Box */}
      {isLeafModalOpen && (
        <VirtualBananaLeafModal 
          isOpen={isLeafModalOpen} 
          onClose={() => setIsLeafModalOpen(false)} 
        />
      )}

      {isTastingModalOpen && (
        <TastingSessionModal 
          isOpen={isTastingModalOpen} 
          onClose={() => setIsTastingModalOpen(false)} 
          availableItems={data?.items || []}
        />
      )}
    </CustomerDesktopShell>
  )
}

export default CataloguePage
