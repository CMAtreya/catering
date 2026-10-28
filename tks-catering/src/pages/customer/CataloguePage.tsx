import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { 
  ChevronRight, 
  Phone, 
  RefreshCw, 
  AlertCircle, 
  Search, 
  X, 
  ShoppingBag, 
  Sparkles, 
  LayoutGrid, 
  Layers 
} from 'lucide-react'
import { getCatalogue, type CatalogueResponse } from '@/api'
import type { Category, MenuItem } from '@/data/mockData'
import { useDraftStore } from '@/store/draftStore'
import { useEnquiryStore } from '@/store/enquiryStore'
import { ItemCard } from '@/components/customer/ItemCard'
import { CatalogueSkeleton } from '@/components/ui/skeletons'
import { CustomerDesktopShell } from '@/components/customer/CustomerDesktopShell'
import { useMotionTier } from '@/motion/MotionProvider'
import { CollapsingHeader } from '@/components/motion/CollapsingHeader'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { Odometer } from '@/components/motion/Odometer'
import { Hero3D } from '@/components/motion/Hero3D'
import { getItemEntranceVariants, MOTION_SPRINGS } from '@/motion/tokens'
import { PresetFeastBar } from '@/components/customer/PresetFeastBar'
import { VirtualBananaLeafModal } from '@/components/customer/VirtualBananaLeafModal'
import { PlantainLeafCanvas } from '@/components/customer/PlantainLeafCanvas'
import { EventPlanningBar } from '@/components/customer/EventPlanningBar'
import { PurityFilterMatrix, type PurityFilter } from '@/components/customer/PurityFilterMatrix'
import { TastingSessionModal } from '@/components/customer/TastingSessionModal'
import { formatRupees } from '@/lib/format'

type ViewMode = 'grid' | 'leaf' | 'split'

export const CataloguePage: React.FC = () => {
  const navigate = useNavigate()
  const { tier, isReduced } = useMotionTier()

  // State for catalogue data, loading, and error
  const [data, setData] = useState<CatalogueResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // View mode switcher: Swiggy/Blinkit grid vs Live Plantain Leaf vs Split builder
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Modals state
  const [isLeafModalOpen, setIsLeafModalOpen] = useState(false)
  const [isTastingModalOpen, setIsTastingModalOpen] = useState(false)

  // Purity Filter state
  const [purityFilter, setPurityFilter] = useState<PurityFilter>('all')

  // Scroll spy active category id
  const [activeCategoryId, setActiveCategoryId] = useState<string>('')
  
  // Search query for quick-commerce instant dish filtering
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  // Track if a manual tab click initiated scroll (to prevent scroll spy flicker)
  const isTabClickScrolling = useRef<boolean>(false)

  // Global stores
  const selectedItems = useDraftStore((state) => state.items)
  const toggleItem = useDraftStore((state) => state.toggleItem)
  const selectedCount = Object.keys(selectedItems).length
  const perPlateTotal = useDraftStore((state) => state.getPerPlateTotal())
  const enquiriesCount = useEnquiryStore((state) => state.enquiries.length)

  // Bounce animation key for bottom bar when item selection changes
  const [bounceKey, setBounceKey] = useState<number>(0)
  const prevCountRef = useRef(selectedCount)

  useEffect(() => {
    if (prevCountRef.current !== selectedCount) {
      prevCountRef.current = selectedCount
      setBounceKey((k) => k + 1)
    }
  }, [selectedCount])

  // Fetch catalogue data
  const loadCatalogue = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getCatalogue()
      setData(res)
      if (res.categories.length > 0) {
        setActiveCategoryId(res.categories[0].id)
      }
    } catch {
      setError('Unable to load catering menu. Please check your connection and retry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCatalogue()
  }, [])

  // Category items mapping helper
  const getCategoryItems = (category: Category, allItems: MenuItem[]): MenuItem[] => {
    return allItems.filter(
      (item) => item.category === category.name || item.category === category.id
    )
  }

  // Count selected items belonging to a given category
  const getCategorySelectedCount = (category: Category): number => {
    if (!data) return 0
    const catItemIds = new Set(
      getCategoryItems(category, data.items).map((item) => item.id)
    )
    let count = 0
    for (const id of Object.keys(selectedItems)) {
      if (catItemIds.has(id)) count++
    }
    return count
  }

  // Filtered items when searching (Instamart / Zepto style instant search)
  const filteredSearchItems = searchQuery.trim() && data
    ? data.items.filter((item) => {
        const q = searchQuery.toLowerCase().trim()
        return (
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
        )
      })
    : null

  // Purity Filter matching helper
  const matchesPurityFilter = (item: MenuItem): boolean => {
    if (purityFilter === 'all') return true
    if (purityFilter === 'pure-ghee') {
      return Boolean(item.pureGhee) || item.name.toLowerCase().includes('ghee')
    }
    if (purityFilter === 'satvik') {
      return Boolean(item.satvik)
    }
    if (purityFilter === 'sweets') {
      return item.category === 'Sweets & Desserts'
    }
    if (purityFilter === 'tiffins') {
      return item.category === 'Tiffins & Breakfast'
    }
    if (purityFilter === 'beverages') {
      return item.category === 'Beverages'
    }
    return true
  }

  // Smooth scroll to category section
  const scrollToCategory = (categoryId: string) => {
    isTabClickScrolling.current = true
    setActiveCategoryId(categoryId)

    const element = document.getElementById(`cat-section-${categoryId}`)
    if (element) {
      const offset = 120
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: isReduced ? 'auto' : 'smooth'
      })

      setTimeout(() => {
        isTabClickScrolling.current = false
      }, 600)
    }
  }

  // Scroll spy effect: detect which category is currently in viewport
  useEffect(() => {
    if (!data || data.categories.length === 0) return

    const handleScroll = () => {
      if (isTabClickScrolling.current) return

      const headerOffset = 150
      const categories = data.categories

      for (let i = categories.length - 1; i >= 0; i--) {
        const cat = categories[i]
        const element = document.getElementById(`cat-section-${cat.id}`)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= headerOffset) {
            setActiveCategoryId((prev) => (prev !== cat.id ? cat.id : prev))
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [data])

  return (
    <CustomerDesktopShell maxWidth="w-full">
      <div className="w-full flex flex-col bg-transparent relative min-h-screen">
        
        {/* ==========================================================
            1. COLLAPSING LARGE-TITLE HEADER (iOS STYLE)
            ========================================================== */}
        <CollapsingHeader
          categories={data?.categories || []}
          activeCategoryId={activeCategoryId}
          onSelectCategory={scrollToCategory}
          getCategorySelectedCount={getCategorySelectedCount}
          enquiriesCount={enquiriesCount}
        />

        {/* Loading state with skeleton */}
        {loading && (
          <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-32">
            <div className="mt-3 mb-2 h-20 rounded-[20px] animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
            <CatalogueSkeleton count={8} />
          </main>
        )}

        {/* Error state with retry */}
        {!loading && error && (
          <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full p-6 flex flex-col items-center justify-center text-center my-auto pb-32">
            <div className="w-16 h-16 rounded-2xl bg-[var(--status-cancelled-bg)] text-[var(--status-cancelled-text)] flex items-center justify-center mb-4 border border-[var(--status-cancelled-border)] shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="font-serif font-bold text-xl text-[var(--text-primary)]">
              Unable to Load Menu
            </h2>
            <p className="text-sm text-[var(--text-muted)] max-w-xs mt-1 mb-6">
              {error}
            </p>
            <button
              onClick={loadCatalogue}
              className="px-6 py-3 rounded-full bg-[var(--brand)] text-[var(--on-brand)] font-bold text-sm shadow-md hover:bg-[var(--brand-600)] transition-all flex items-center gap-2 tap-target-48 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </main>
        )}

        {/* Empty state: No items available */}
        {!loading && !error && data && data.items.length === 0 && (
          <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full p-6 flex flex-col items-center justify-center text-center my-auto pb-32">
            <div className="text-5xl mb-3">🍲</div>
            <h2 className="font-serif font-bold text-xl text-[var(--brand-900)]">
              Menu is being updated. Please call us.
            </h2>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mt-1 mb-6">
              Our traditional catering selection is currently undergoing seasonal updates.
            </p>
            <a
              href={`tel:${data.businessInfo?.phone || '+919000000000'}`}
              className="px-6 py-3 rounded-full bg-[var(--brand)] text-[var(--on-brand)] font-bold text-sm shadow-md hover:bg-[var(--brand-600)] transition-all flex items-center gap-2 tap-target-48"
            >
              <Phone className="w-4 h-4" />
              <span>Call {data.businessInfo?.phone || '+91 90000 00000'}</span>
            </a>
          </main>
        )}

        {/* Loaded Catalogue View */}
        {!loading && !error && data && data.items.length > 0 && (
          <>
            {/* ==========================================================
                MAIN CONTENT AREA
                ========================================================== */}
            <main className="flex-1 px-3 sm:px-5 lg:px-6 max-w-7xl mx-auto w-full pt-3 pb-36 space-y-4 sm:space-y-5">
              
              {/* 1. EZCATER / ZEROCATER EVENT PLANNING STRIP */}
              <EventPlanningBar />

              {/* 2. INSTANT SEARCH BAR & VIEW MODE SWITCHER */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <div className="relative flex items-center bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/15 rounded-xl sm:rounded-2xl shadow-2xs transition-all px-3 py-2 sm:py-2.5">
                    <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search dishes (e.g. Mysore Pak, Bisi Bele Bath, Rasam, Pongal...)"
                      className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                      aria-label="Search catering dishes"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        aria-label="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* View Switcher: Swiggy Grid vs Live Plantain Leaf View */}
                <div className="flex items-center rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 p-1 shadow-2xs shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      viewMode === 'grid'
                        ? 'bg-[var(--brand)] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Menu Grid</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('leaf')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      viewMode === 'leaf'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-emerald-700'
                    }`}
                  >
                    <span>🍃</span>
                    <span>Live Leaf ({selectedCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('split')}
                    className={`hidden lg:flex px-3 py-1.5 rounded-lg text-xs font-bold transition-all items-center gap-1.5 cursor-pointer select-none ${
                      viewMode === 'split'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-amber-800'
                    }`}
                    title="Split screen: Menu on left, Live Banana Leaf on right"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Split Builder</span>
                  </button>
                </div>
              </div>

              {/* 3. FLAGSHIP HERO BANNER (Only on Grid/Split view without active search) */}
              {viewMode !== 'leaf' && !searchQuery && (
                <section aria-label="Feast selection banner" className="p-4 sm:p-5 lg:p-6 rounded-3xl bg-gradient-to-r from-[var(--brand-900)] via-[var(--brand)] to-[var(--brand-800)] text-[var(--on-brand)] shadow-lg overflow-hidden relative border border-amber-950/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                    <div className="space-y-2 z-10 max-w-xl">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] sm:text-[11px] tracking-wider uppercase font-black text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-300/30 inline-flex items-center gap-1">
                          <span>⚡</span>
                          <span>Mysuru Authentic Feast</span>
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-white/90 bg-white/10 px-2 py-0.5 rounded-full">
                          100% Pure Cow Ghee
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-400/30">
                          Satvik Brahmin Kitchen
                        </span>
                      </div>

                      <h2 className="font-heading font-black text-lg sm:text-2xl lg:text-3xl tracking-tight leading-tight">
                        Craft Your Royal Catering Feast
                      </h2>
                      <p className="text-[11px] sm:text-xs lg:text-sm text-white/90 font-medium leading-relaxed">
                        Handcrafted South Indian delicacies, ceremonial Muhurtham spreads, and live per-plate quotations. Tap dishes below or arrange on the traditional plantain leaf.
                      </p>

                      {/* Quick Interactive Actions */}
                      <div className="pt-1 flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setViewMode('leaf')}
                          className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <span>🍃</span>
                          <span>Open Plantain Leaf</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsTastingModalOpen(true)}
                          className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 text-white transition-all border border-white/30 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Book Tasting Box</span>
                        </button>
                      </div>
                    </div>

                    {/* 3D Hero Object: Ceremonial Brass Lamp */}
                    <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 shrink-0 relative flex items-center justify-center self-end sm:self-center">
                      <Hero3D />
                    </div>
                  </div>
                </section>
              )}

              {/* 4. CURATED PRESET FEASTS (Craft My Plate / CaterNinja 1-Tap Packages) */}
              {viewMode !== 'leaf' && !searchQuery && (
                <PresetFeastBar
                  availableItems={data.items}
                  onOpenLeafVisualizer={() => setIsLeafModalOpen(true)}
                />
              )}

              {/* 5. DIETARY & PURITY FILTER MATRIX (ezCater Multi-Filter Benchmark) */}
              {viewMode !== 'leaf' && !searchQuery && (
                <PurityFilterMatrix
                  activeFilter={purityFilter}
                  onSelectFilter={setPurityFilter}
                  totalCount={data.items.length}
                />
              )}

              {/* ==========================================================
                  VIEW MODE A: FULL LIVE PLANTAIN LEAF CANVAS
                  ========================================================== */}
              {viewMode === 'leaf' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <div>
                      <h3 className="font-heading font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                        <span>🍃 Ceremonial South Indian Plantain Leaf</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {selectedCount} dishes placed
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Dishes are placed in traditional Brahmin order. Click any (+) slot to add, or tap a placed dish to remove.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Back to Menu Grid
                    </button>
                  </div>

                  {/* The Full Canvas */}
                  <PlantainLeafCanvas
                    availableItems={data.items}
                    selectedItemsMap={selectedItems}
                    onToggleItem={toggleItem}
                    showGhosts={true}
                  />

                  {/* Quick-add category carousel below the leaf */}
                  <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                        Quick Add Dishes to Leaf
                      </h4>
                      <span className="text-xs text-slate-400">
                        Tap any dish to place it on the banana leaf
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
                      {data.items.map((item) => {
                        const isSelected = Boolean(selectedItems[item.id])
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleItem(item)}
                            className={`p-2 rounded-xl text-left border transition-all flex items-center gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-400 shadow-2xs ring-1 ring-emerald-400/20'
                                : 'bg-slate-50 hover:bg-white border-slate-200/80 hover:shadow-2xs'
                            }`}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-9 h-9 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                              <p className="text-[10px] font-semibold text-[var(--brand)]">{formatRupees(item.pricePerPlate)}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs ${
                              isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {isSelected ? '✓' : '+'}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ==========================================================
                  VIEW MODE B: SPLIT BUILDER (ZeroCater / ezCater Desktop Mode)
                  ========================================================== */}
              {viewMode === 'split' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left 7 Columns: Menu Items List */}
                  <div className="lg:col-span-7 space-y-4">
                    {data.categories.map((category) => {
                      const categoryItems = getCategoryItems(category, data.items).filter(matchesPurityFilter)
                      if (categoryItems.length === 0) return null

                      return (
                        <div key={category.id} className="space-y-2">
                          <h4 className="font-heading font-black text-sm text-slate-800 border-b pb-1">
                            {category.name} ({categoryItems.length})
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {categoryItems.map((item) => (
                              <ItemCard key={item.id} item={item} />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Right 5 Columns: Sticky Plantain Leaf Live Visualizer */}
                  <div className="lg:col-span-5 sticky top-24 space-y-3">
                    <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                      <span className="font-heading font-black text-xs text-slate-900">
                        Live Banana Leaf Arrangement
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {selectedCount} placed
                      </span>
                    </div>

                    <PlantainLeafCanvas
                      availableItems={data.items}
                      selectedItemsMap={selectedItems}
                      onToggleItem={toggleItem}
                      showGhosts={true}
                    />
                  </div>
                </div>
              )}

              {/* ==========================================================
                  VIEW MODE C: SWIGGY / BLINKIT CATEGORY GRID VIEW
                  ========================================================== */}
              {viewMode === 'grid' && (
                <>
                  {/* Search Results View */}
                  {filteredSearchItems !== null ? (
                    <section className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading font-black text-sm sm:text-base text-slate-800">
                          Found {filteredSearchItems.length} {filteredSearchItems.length === 1 ? 'dish' : 'dishes'} for &ldquo;{searchQuery}&rdquo;
                        </h3>
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="text-xs font-bold text-[var(--brand)] hover:underline cursor-pointer"
                        >
                          Clear search
                        </button>
                      </div>

                      {filteredSearchItems.length === 0 ? (
                        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                          <p className="text-sm font-semibold text-slate-700">No matching dishes found</p>
                          <p className="text-xs text-slate-400 mt-1">Try searching for sweets, rice, rasam, or curries</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3">
                          {filteredSearchItems.map((item) => (
                            <ItemCard key={item.id} item={item} />
                          ))}
                        </div>
                      )}
                    </section>
                  ) : (
                    /* Regular Category View */
                    data.categories.map((category) => {
                      const categoryItems = getCategoryItems(category, data.items).filter(matchesPurityFilter)
                      if (categoryItems.length === 0) return null

                      return (
                        <section
                          key={category.id}
                          id={`cat-section-${category.id}`}
                          className="scroll-mt-32 space-y-2.5"
                        >
                          {/* Category Title & Count */}
                          <ScrollReveal>
                            <div className="flex items-center justify-between pt-1 border-b border-slate-200/60 pb-1.5">
                              <h3 className="font-heading font-black text-sm sm:text-base lg:text-lg text-slate-800 tracking-tight flex items-center gap-2">
                                <span>{category.name}</span>
                                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-sans">
                                  {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                                </span>
                              </h3>
                            </div>
                          </ScrollReveal>

                          {/* Multi-column dense responsive grid of ItemCards */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3">
                            {categoryItems.map((item, index) => {
                              const variants = getItemEntranceVariants(tier, index)
                              return (
                                <motion.div
                                  key={item.id}
                                  initial={isReduced ? false : variants.hidden}
                                  whileInView={isReduced ? undefined : variants.visible}
                                  viewport={{ once: true, margin: '-20px' }}
                                >
                                  <ItemCard item={item} />
                                </motion.div>
                              )
                            })}
                          </div>
                        </section>
                      )
                    })
                  )}
                </>
              )}

            </main>

            {/* ==========================================================
                4. STICKY BOTTOM BAR (Instamart / Zepto Style Floating Bar)
                Elevated floating bar with bag icon, odometer, and Proceed button.
                ========================================================== */}
            <motion.nav
              aria-label="Order summary and checkout"
              key={bounceKey}
              animate={!isReduced && bounceKey > 0 ? { y: [0, -3, 0] } : undefined}
              transition={MOTION_SPRINGS.tap}
              className="fixed bottom-0 left-0 right-0 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-2xl lg:bottom-5 lg:rounded-2xl z-50 pointer-events-auto bg-white/95 backdrop-blur-md border-t lg:border border-slate-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-3.5 sm:px-5 py-2.5 sm:py-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] lg:pb-3"
            >
              <div className="w-full flex items-center justify-between gap-3">
                {/* Left: Bag icon + 'N items selected' with Odometer */}
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    selectedCount > 0 
                      ? 'bg-[var(--brand)] text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-heading font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1 leading-tight">
                      <Odometer value={selectedCount} />
                      <span>{selectedCount === 1 ? 'item' : 'items'} selected</span>
                      {selectedCount > 0 && (
                        <span className="text-[11px] font-bold text-[var(--brand)] ml-1">
                          • {formatRupees(perPlateTotal)}/pl
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight">
                      {selectedCount === 0
                        ? 'Select dishes to build feast'
                        : 'Custom quotation on next step'}
                    </span>
                  </div>
                </div>

                {/* Right: Banana Leaf button & Proceed button */}
                <div className="flex items-center gap-2">
                  {selectedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsLeafModalOpen(true)}
                      className="h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 transition-colors shadow-2xs cursor-pointer shrink-0"
                      title="View feast arranged on traditional South Indian plantain leaf"
                    >
                      <span>🍃</span>
                      <span className="hidden sm:inline">Leaf View</span>
                    </button>
                  )}

                  {selectedCount === 0 ? (
                    <button
                      disabled
                      className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs sm:text-sm cursor-not-allowed select-none tap-target-48 flex items-center justify-center transition-colors"
                    >
                      Select at least one item
                    </button>
                  ) : (
                    <button
                      type="button"
                      id="proceed-to-request-btn"
                      onClick={() => navigate('/request')}
                      className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-600)] active:scale-[0.97] text-white font-heading font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md tap-target-48 transition-all select-none cursor-pointer"
                    >
                      <span>Proceed</span>
                      <ChevronRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  )}
                </div>
              </div>
            </motion.nav>

            {/* Virtual Plantain Leaf Ceremonial Layout Modal */}
            <VirtualBananaLeafModal
              isOpen={isLeafModalOpen}
              onClose={() => setIsLeafModalOpen(false)}
              onProceedToRequirements={() => navigate('/request')}
              availableItems={data.items}
            />

            {/* Tasting Box Booking Modal */}
            <TastingSessionModal
              isOpen={isTastingModalOpen}
              onClose={() => setIsTastingModalOpen(false)}
              availableItems={data.items}
            />
          </>
        )}

      </div>
    </CustomerDesktopShell>
  )
}

export default CataloguePage
