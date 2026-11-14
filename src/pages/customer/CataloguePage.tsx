import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Crown,
  Sun,
  Leaf,
  Home,
  Sparkles,
  PlusSquare,
  Search,
  X,
  Flame,
  CookingPot,
  SlidersHorizontal,
  Layers,
  UtensilsCrossed,
  Coffee,
  Soup,
  Salad,
  AlertCircle,
  SearchX,
  Award,
  ArrowRight,
  MessageCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { getCatalogue, subscribeToMenu, type CatalogueResponse } from '@/api'
import type { MenuItem } from '@/data/mockData'
import { useDraftStore } from '@/store/draftStore'
import { useBusinessSettingsStore } from '@/store/businessSettingsStore'
import { ItemCard } from '@/components/customer/ItemCard'
import { CustomerDesktopShell } from '@/components/customer/CustomerDesktopShell'
import { CustomerTopNav } from '@/components/customer/CustomerTopNav'
import { AppFooter } from '@/components/common/AppFooter'
import { CatalogueSkeleton } from '@/components/ui/skeletons'
import { VirtualBananaLeafModal } from '@/components/customer/VirtualBananaLeafModal'
import { TastingSessionModal } from '@/components/customer/TastingSessionModal'
import { Hero3D } from '@/components/motion/Hero3D'

type PurityFilter = 'all' | 'satvik' | 'pureGhee' | 'live'
type NavTab = 'tradition' | 'menus' | 'muhurtham' | 'enquiry'

interface PresetFeastPlan {
  id: string
  name: string
  subtitle: string
  tag: string
  itemIds: string[]
}

const PRESET_MUHURTHAM_FEASTS: PresetFeastPlan[] = [
  {
    id: 'kalyana-feast',
    name: 'Royal Mysore Kalyana Feast',
    subtitle: 'Grand wedding banquet with pure cow ghee sweets, traditional saaru & live service.',
    tag: 'Most Popular',
    itemIds: ['item-1', 'item-2', 'item-3', 'item-4', 'item-7', 'item-8', 'item-9', 'item-10', 'item-12']
  },
  {
    id: 'muhurtham-breakfast',
    name: 'Traditional Muhurtham Breakfast',
    subtitle: 'Fluffy idlis, crispy medu vadas, ghee ven pongal, and aromatic filter coffee.',
    tag: 'Morning Feasts',
    itemIds: ['item-5', 'item-6', 'item-10', 'item-12']
  },
  {
    id: 'satvik-homam',
    name: 'Satvik Ayushya Homam Feast',
    subtitle: 'Pristine Vedic pooja spread, strictly no onion/garlic, temple-simmered dishes.',
    tag: '100% Satvik',
    itemIds: ['item-1', 'item-7', 'item-9', 'item-11']
  },
  {
    id: 'grihapravesha-special',
    name: 'Grihapravesha Banquet',
    subtitle: 'Auspicious housewarming feast with royal Mysore Pak and heritage gojju spread.',
    tag: 'Housewarming',
    itemIds: ['item-2', 'item-3', 'item-4', 'item-8', 'item-12']
  }
]

const renderFeastIcon = (id: string) => {
  switch (id) {
    case 'kalyana-feast':
      return <Crown className="w-5 h-5 text-primary" />
    case 'muhurtham-breakfast':
      return <Sun className="w-5 h-5 text-primary" />
    case 'satvik-homam':
      return <Leaf className="w-5 h-5 text-primary" />
    case 'grihapravesha-special':
      return <Home className="w-5 h-5 text-primary" />
    default:
      return <Sparkles className="w-5 h-5 text-primary" />
  }
}

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
  const settings = useBusinessSettingsStore((state) => state.settings)
  const selectedCount = Object.keys(selectedItems).length
  const perPlateTotal = useDraftStore((state) => state.getPerPlateTotal())
  const guestCount = requirements.guestCount || 150

  // Proceed navigation state for smooth Fast-In Slow-Out transition
  const [isProceeding, setIsProceeding] = useState<boolean>(false)

  const handleProceed = () => {
    setIsProceeding(true)
    setTimeout(() => {
      navigate('/request')
    }, 200)
  }

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

    const unsubscribe = subscribeToMenu((event) => {
      if (event.table === 'menu_items') {
        loadCatalogue()
      }
    })

    return () => {
      unsubscribe()
    }
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

  // Filtered items based on Category, Search Query, and Purity Filter, sorted strictly alphabetically
  const filteredItems = useMemo(() => {
    if (!data?.items) return []

    return data.items
      .filter((item) => {
        // 0. Only available items visible to customers (when made available, they appear in their exact alphabetical position)
        if (item.available === false) return false

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
      .sort((a, b) => a.name.localeCompare(b.name))
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
      if (found && found.available !== false) itemsToLoad.push(found)
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
    const phoneDigits = (settings.mobile || settings.phone).replace(/\D/g, '')
    return `https://wa.me/${phoneDigits}?text=${text}`
  }, [guestCount, requirements.eventType, selectedCount, displayPerPlate, estimatedBanquetTotal, settings.mobile, settings.phone])

  return (
    <CustomerDesktopShell maxWidth="w-full">
      {/* UNIFIED STICKY TOP NAVIGATION BAR */}
      <CustomerTopNav
        activeNavTab={activeNavTab}
        onNavClick={handleNavClick}
        onOpenLeafModal={() => setIsLeafModalOpen(true)}
        onPlanEvent={() => {
          if (selectedCount > 0) {
            navigate('/request')
          } else {
            const firstItem = data?.items?.[0]
            if (firstItem) toggleItem(firstItem)
            navigate('/request')
          }
        }}
      />

      {/* MAIN FULL-PAGE CONTAINER */}
      <main className="w-full flex-1 flex flex-col">
        {/* SECTION B: FEAST PACKAGES PORTION (Portion 3 from Navbar, Full Page Width) */}
        <section 
          id="muhurtham" 
          aria-label="Curated Feast Packages" 
          className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 scroll-mt-20"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-headline font-black text-2xl sm:text-3xl lg:text-4xl text-primary tracking-tight">
                Curated Feast Packages
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
              <Leaf className="w-4 h-4 text-tertiary-container" />
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
                    {renderFeastIcon(feast.id)}
                  </div>
                  <h3 className="font-headline font-bold text-base sm:text-lg text-primary tracking-tight">
                    {feast.name}
                  </h3>
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
                    <PlusSquare className="w-3.5 h-3.5" />
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
              <h2 className="font-headline font-black text-3xl sm:text-4xl text-primary tracking-tight">
                Catering Menu Catalogue
              </h2>
              <p className="text-sm text-on-surface-variant mt-2 max-w-3xl font-normal leading-relaxed">
                Handcrafted sacred heritage dishes for grand muhurthams, upanayanas, and household poojas. Pick delicacies to customize your plantain leaf feast.
              </p>
            </div>
          </div>
        </section>

        {/* SEARCH & DIETARY FILTER CHIPS (Full Page Width) */}
        <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                  <X className="w-3.5 h-3.5" />
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
                <Leaf className="w-3.5 h-3.5" />
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
                <Flame className="w-3.5 h-3.5" />
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
                <CookingPot className="w-3.5 h-3.5" />
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
                <SlidersHorizontal className="w-3.5 h-3.5" />
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
                  {cat.id === 'cat-all' && <Layers className="w-3.5 h-3.5" />}
                  {cat.id === 'cat-rice' && <UtensilsCrossed className="w-3.5 h-3.5" />}
                  {cat.id === 'cat-tiffins' && <Coffee className="w-3.5 h-3.5" />}
                  {cat.id === 'cat-sambar' && <Soup className="w-3.5 h-3.5" />}
                  {cat.id === 'cat-sweets' && <Sparkles className="w-3.5 h-3.5" />}
                  {cat.id === 'cat-palya' && <Salad className="w-3.5 h-3.5" />}
                  {cat.id === 'cat-beverages' && <Coffee className="w-3.5 h-3.5" />}
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
              <AlertCircle className="w-10 h-10 text-primary mb-2 mx-auto" />
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
              <SearchX className="w-10 h-10 text-outline mb-2 mx-auto" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 w-full">
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
          <div className="w-full mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="font-headline font-black text-2xl sm:text-3xl lg:text-4xl text-primary tracking-tight">
                Mysuru Brahmin Tradition &amp; Sacred Sattvic Heritage
              </h2>
              <p className="text-sm text-on-surface-variant mt-2 max-w-4xl font-normal leading-relaxed">
                For over four decades, TKS Iyengar&apos;s Catering has upheld the holy culinary rites of ancient Mysuru and Melkote. Prepared strictly without onion, garlic, or artificial essences, our recipes honor devout Vaishnavite hospitality, slow-cooked in traditional eeya chombu tin-lined vessels with pure churned cow ghee.
              </p>
            </div>
            <div className="w-36 h-48 sm:w-44 sm:h-52 shrink-0 flex items-center justify-center">
              <Hero3D className="w-full h-full" />
            </div>
          </div>

          {/* Heritage Purity Guarantee Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            {/* Bento Card 1: Pure Desi Ghee */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/15 flex items-start gap-4 shadow-2xs hover:shadow-md transition-shadow">
              <div className="p-3 rounded-xl bg-secondary-container/20 text-on-secondary-container shrink-0">
                <Flame className="w-6 h-6" />
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
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-primary">Traditional Banana Leaf Protocol</h3>
                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                  Full seated traditional serving protocol with trained Mysuru servers strictly adhering to traditional authentic dish serving order.
                </p>
              </div>
            </div>

            {/* Bento Card 3: Strict Vedic Hygiene */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/15 flex items-start gap-4 shadow-2xs hover:shadow-md transition-shadow">
              <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                <Award className="w-6 h-6" />
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
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* 9. TRADITIONAL HERITAGE FOOTER (Full Page Width with all 10 legal and dietary details) */}
      <AppFooter hasFloatingBar={true} onTastingModalOpen={() => setIsTastingModalOpen(true)} />

      {/* 10. FLOATING ACTION SUMMARY BAR (Appears only when at least 1 delicacy is selected) */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.aside 
            key="floating-order-bar"
            id="floating-order-bar"
            data-floating-bar="true"
            aria-label="Banquet feast selection summary" 
            initial={{ opacity: 0, y: 50, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] inset-x-3 sm:inset-x-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-6xl z-50 pointer-events-auto"
          >
            <div className="w-full bg-surface/95 backdrop-blur-md border border-outline-variant/20 rounded-2xl sm:rounded-full p-2.5 sm:p-3 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 ring-1 ring-black/5">
              {/* Left: Delicacies Count & Service Info */}
              <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                  <UtensilsCrossed className="w-5 h-5 text-on-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-headline font-bold text-xs sm:text-sm text-primary block truncate">
                    {selectedCount} Delicacies Selected
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-outline block truncate">
                    Includes Banana Leaf Service &amp; Rasam
                  </span>
                </div>
              </div>

              {/* Center / Right: Per Plate Price, WhatsApp & Primary Proceed CTA */}
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto border-t sm:border-t-0 border-outline-variant/10 pt-2 sm:pt-0">
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[9px] uppercase font-bold text-outline tracking-wider block leading-none">
                    Per Plate Price
                  </span>
                  <div className="flex items-baseline gap-0.5 justify-start sm:justify-end mt-0.5">
                    <span className="font-headline font-black text-xs sm:text-base text-primary leading-tight">
                      ₹{displayPerPlate}
                    </span>
                    <span className="text-[10px] text-outline font-medium">/ plate</span>
                  </div>
                </div>

                {/* WhatsApp Share Button */}
                <a 
                  href={whatsappUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Share feast requirements on WhatsApp"
                  className="px-2.5 sm:px-3 py-2 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-xs flex items-center gap-1 border border-[#25D366]/30 transition-colors shrink-0 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden xs:inline">WhatsApp</span>
                </a>

                {/* Primary Proceed Button */}
                <button
                  id="proceed-to-request-btn"
                  type="button"
                  disabled={isProceeding}
                  onClick={handleProceed}
                  className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-primary to-[#b30a05] text-on-primary text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg active:scale-95 cursor-pointer shrink-0 transition-all ${
                    isProceeding ? 'scale-95 opacity-90' : ''
                  }`}
                  style={{
                    transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <span>Proceed</span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isProceeding ? 'translate-x-1.5' : ''}`} />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Modals for Banana Leaf Preview & Tasting Box */}
      {isLeafModalOpen && (
        <VirtualBananaLeafModal 
          isOpen={isLeafModalOpen} 
          onClose={() => setIsLeafModalOpen(false)} 
          onProceedToRequirements={handleProceed}
          availableItems={(data?.items || []).filter((i) => i.available !== false)}
        />
      )}

      {isTastingModalOpen && (
        <TastingSessionModal 
          isOpen={isTastingModalOpen} 
          onClose={() => setIsTastingModalOpen(false)} 
          availableItems={(data?.items || []).filter((i) => i.available !== false)}
        />
      )}
    </CustomerDesktopShell>
  )
}

export default CataloguePage
