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
import { PurityFilterMatrix, type PurityFilter } from '@/components/customer/PurityFilterMatrix'
import { TastingSessionModal } from '@/components/customer/TastingSessionModal'
import { FloatingMenuNav } from '@/components/customer/FloatingMenuNav'
import { formatRupees } from '@/lib/format'

type ViewMode = 'grid' | 'leaf' | 'split'

export const CataloguePage: React.FC = () => {
  const navigate = useNavigate()
  const { tier, isReduced } = useMotionTier()

  // State for catalogue data, loading, and error
  const [data, setData] = useState<CatalogueResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // View mode switcher: Golden Split (61.8% / 38.2%) vs Full Menu Grid vs Full Plantain Leaf
  const [viewMode, setViewMode] = useState<ViewMode>('split')

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
  const clearItems = useDraftStore((state) => state.clearItems)
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
          <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 w-full pb-32">
            <div className="mt-3 mb-2 h-20 rounded-[20px] animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
            <CatalogueSkeleton count={8} />
          </main>
        )}

        {/* Error state with retry */}
        {!loading && error && (
          <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 w-full p-6 flex flex-col items-center justify-center text-center my-auto pb-32">
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
          <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 w-full p-6 flex flex-col items-center justify-center text-center my-auto pb-32">
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
                MAIN CONTENT AREA (GOLDEN RATIO Φ = 1.618 EDGE-TO-EDGE)
                ========================================================== */}
            <main className="flex-1 px-[13px] sm:px-[21px] md:px-[34px] lg:px-[55px] w-full pt-[13px] pb-[144px] space-y-[21px] sm:space-y-[34px]">
              
              {/* 1. INSTANT SEARCH BAR & GOLDEN VIEW SWITCHER */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-[13px]">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <div className="relative flex items-center bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/15 rounded-[13px] sm:rounded-[21px] shadow-2xs transition-all px-[21px] py-[10px] sm:py-[13px]">
                    <Search className="w-4 h-4 text-slate-400 shrink-0 mr-[13px]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search dishes (e.g. Mysore Pak, Bisi Bele Bath, Rasam, Pongal...)"
                      className="w-full bg-transparent text-golden-xs sm:text-golden-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
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

                {/* Golden View Switcher: Golden Split (61.8% / 38.2%) vs Full Grid vs Live Plantain Leaf */}
                <div className="flex items-center rounded-[13px] sm:rounded-[21px] bg-white border border-slate-200/90 p-[3px] shadow-2xs shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setViewMode('split')}
                    className={`px-[13px] py-[8px] rounded-[10px] text-golden-xs sm:text-golden-sm font-bold transition-all flex items-center gap-[5px] cursor-pointer select-none ${
                      viewMode === 'split'
                        ? 'bg-[var(--brand)] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Golden Ratio Split: 61.8% Menu + 38.2% Live Banana Leaf"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Golden Split (Φ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`px-[13px] py-[8px] rounded-[10px] text-golden-xs sm:text-golden-sm font-bold transition-all flex items-center gap-[5px] cursor-pointer select-none ${
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
                    className={`px-[13px] py-[8px] rounded-[10px] text-golden-xs sm:text-golden-sm font-bold transition-all flex items-center gap-[5px] cursor-pointer select-none ${
                      viewMode === 'leaf'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-emerald-700'
                    }`}
                  >
                    <span>🍃</span>
                    <span>Live Leaf ({selectedCount})</span>
                  </button>
                </div>
              </div>

              {/* 2. GOLDEN HERO BANNER (61.8% Narrative vs 38.2% Visual Stage) */}
              {viewMode !== 'leaf' && !searchQuery && (
                <section aria-label="Feast selection banner" className="p-[21px] sm:p-[34px] rounded-[21px] sm:rounded-[34px] bg-gradient-to-r from-[var(--brand-900)] via-[var(--brand)] to-[var(--brand-800)] text-[var(--on-brand)] shadow-lg overflow-hidden relative border border-amber-950/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[21px] sm:gap-[34px]">
                    {/* Major Golden Section (61.8% Width) */}
                    <div className="space-y-[13px] z-10 max-w-full sm:max-w-[61.8%]">
                      <div className="flex items-center gap-[8px] flex-wrap">
                        <span className="text-[10px] tracking-wider uppercase font-black text-amber-300 bg-amber-400/20 px-[10px] py-[3px] rounded-full border border-amber-300/30 inline-flex items-center gap-[5px]">
                          <span>⚡</span>
                          <span>Mysuru Authentic Feast</span>
                        </span>
                        <span className="text-[10px] font-bold text-white/90 bg-white/10 px-[10px] py-[3px] rounded-full">
                          100% Pure Cow Ghee
                        </span>
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/40 px-[10px] py-[3px] rounded-full border border-emerald-400/30">
                          Satvik Brahmin Kitchen
                        </span>
                      </div>

                      <h2 className="font-heading font-black text-golden-xl sm:text-golden-2xl tracking-tight leading-tight">
                        Craft Your Royal Catering Feast
                      </h2>
                      <p className="text-golden-xs sm:text-golden-sm text-white/90 font-medium leading-relaxed">
                        Handcrafted South Indian delicacies, ceremonial Muhurtham spreads, and live per-plate quotations. Tap dishes below or arrange on the traditional plantain leaf.
                      </p>

                      {/* Quick Interactive Actions */}
                      <div className="pt-[5px] flex items-center gap-[8px] flex-wrap">
                        <button
                          type="button"
                          onClick={() => setViewMode('leaf')}
                          className="px-[21px] py-[10px] rounded-full text-golden-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-xs flex items-center gap-[5px] cursor-pointer active:scale-95"
                        >
                          <span>🍃</span>
                          <span>Open Plantain Leaf</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsTastingModalOpen(true)}
                          className="px-[21px] py-[10px] rounded-full text-golden-xs font-bold bg-white/15 hover:bg-white/25 text-white transition-all border border-white/30 flex items-center gap-[5px] cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Book Tasting Box</span>
                        </button>
                      </div>
                    </div>

                    {/* Minor Golden Section (38.2% Visual Stage): Ceremonial Brass Lamp */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 shrink-0 relative flex items-center justify-center self-end sm:self-center">
                      <Hero3D />
                    </div>
                  </div>
                </section>
              )}

              {/* 3. CURATED PRESET FEASTS (Golden Rectangles 1.618 : 1) */}
              {viewMode !== 'leaf' && !searchQuery && (
                <PresetFeastBar
                  availableItems={data.items}
                  onOpenLeafVisualizer={() => setIsLeafModalOpen(true)}
                />
              )}

              {/* 4. DIETARY & PURITY FILTER MATRIX */}
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
                <div className="space-y-[21px]">
                  <div className="flex items-center justify-between bg-white p-[21px] rounded-[21px] border border-slate-200/90 shadow-2xs">
                    <div>
                      <h3 className="font-heading font-black text-golden-base sm:text-golden-md text-slate-900 flex items-center gap-[8px]">
                        <span>🍃 Ceremonial South Indian Plantain Leaf</span>
                        <span className="text-golden-xs font-bold px-[8px] py-[2px] rounded-full bg-emerald-100 text-emerald-800">
                          {selectedCount} dishes placed
                        </span>
                      </h3>
                      <p className="text-golden-xs text-slate-500 mt-[5px]">
                        Dishes are placed in traditional Brahmin order. Click any (+) slot to add, or tap a placed dish to remove.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setViewMode('split')}
                      className="px-[21px] py-[10px] rounded-[13px] border border-slate-200 hover:bg-slate-100 text-slate-700 text-golden-xs font-bold transition-colors cursor-pointer"
                    >
                      Back to Menu
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
                  <div className="bg-white rounded-[21px] p-[21px] border border-slate-200/90 shadow-sm space-y-[13px]">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-bold text-golden-sm sm:text-golden-base text-slate-900">
                        Quick Add Dishes to Leaf
                      </h4>
                      <span className="text-golden-xs text-slate-400">
                        Tap any dish to place it on the banana leaf
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-[8px] sm:gap-[13px]">
                      {data.items.map((item) => {
                        const isSelected = Boolean(selectedItems[item.id])
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleItem(item)}
                            className={`p-[10px] rounded-[13px] text-left border transition-all flex items-center gap-[8px] cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-400 shadow-2xs ring-1 ring-emerald-400/20'
                                : 'bg-slate-50 hover:bg-white border-slate-200/80 hover:shadow-2xs'
                            }`}
                          >
                            <img
                              src={item.image || '/default-dish.svg'}
                              alt={item.name}
                              className="w-9 h-9 rounded-[8px] object-cover shrink-0"
                              onError={(e) => {
                                ;(e.currentTarget as HTMLImageElement).src = '/default-dish.svg'
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-golden-xs font-bold text-slate-800 truncate">{item.name}</p>
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
                  VIEW MODE B: GOLDEN RATIO DUAL SPLIT (61.8% / 38.2%)
                  ========================================================== */}
              {viewMode === 'split' && (
                <div className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr] gap-[21px] lg:gap-[34px] items-start w-full">
                  {/* Major Golden Section (61.8%): Menu Items */}
                  <div className="w-full min-w-0 space-y-[21px] sm:space-y-[34px]">
                    {/* Search Results View */}
                    {filteredSearchItems !== null ? (
                      <section className="space-y-[13px]">
                        <div className="flex items-center justify-between">
                          <h3 className="font-heading font-black text-golden-sm sm:text-golden-base text-slate-800">
                            Found {filteredSearchItems.length} {filteredSearchItems.length === 1 ? 'dish' : 'dishes'} for &ldquo;{searchQuery}&rdquo;
                          </h3>
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="text-golden-xs font-bold text-[var(--brand)] hover:underline cursor-pointer"
                          >
                            Clear search
                          </button>
                        </div>

                        {filteredSearchItems.length === 0 ? (
                          <div className="p-[34px] text-center bg-white rounded-[21px] border border-dashed border-slate-200">
                            <p className="text-golden-sm font-semibold text-slate-700">No matching dishes found</p>
                            <p className="text-golden-xs text-slate-400 mt-1">Try searching for sweets, rice, rasam, or curries</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-[8px] sm:gap-[13px]">
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
                            className="scroll-mt-32 space-y-[13px]"
                          >
                            <ScrollReveal>
                              <div className="flex items-center justify-between pt-[5px] border-b border-slate-200/60 pb-[8px]">
                                <h3 className="font-heading font-black text-golden-base sm:text-golden-md text-slate-800 tracking-tight flex items-center gap-[8px]">
                                  <span>{category.name}</span>
                                  <span className="text-golden-xs font-bold text-slate-500 bg-slate-100 px-[8px] py-[2px] rounded-full font-sans">
                                    {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                                  </span>
                                </h3>
                              </div>
                            </ScrollReveal>

                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-[8px] sm:gap-[13px]">
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
                  </div>

                  {/* Minor Golden Section (38.2%): Sticky Live Banana Leaf Cockpit */}
                  <div className="hidden lg:block w-full sticky top-[21px] space-y-[13px] min-w-0">
                    {/* Platter Card */}
                    <div className="bg-white rounded-[21px] border border-slate-200/90 shadow-sm p-[13px] space-y-[8px]">
                      <div className="flex items-center justify-between pb-[5px]">
                        <span className="font-heading font-black text-golden-sm text-slate-900 flex items-center gap-[5px]">
                          <span>🍃 Plantain Leaf Platter</span>
                        </span>
                        <span className="text-golden-xs font-bold text-emerald-800 bg-emerald-100 px-[8px] py-[2px] rounded-full">
                          {selectedCount} placed
                        </span>
                      </div>

                      <PlantainLeafCanvas
                        availableItems={data.items}
                        selectedItemsMap={selectedItems}
                        onToggleItem={toggleItem}
                        showGhosts={true}
                        className="rounded-[13px]"
                      />
                    </div>

                    {/* Auspicious Feast Ledger Card */}
                    <div className="bg-white rounded-[21px] border border-slate-200/90 shadow-sm p-[16px] space-y-[13px]">
                      <div className="flex items-center justify-between pb-[8px] border-b border-slate-100">
                        <div>
                          <span className="text-golden-xs text-slate-400 uppercase tracking-wider font-bold block">
                            Base Rate Per Plate
                          </span>
                          <div className="flex items-baseline gap-[5px]">
                            <span className="font-heading font-black text-golden-lg text-[var(--brand)]">
                              {formatRupees(perPlateTotal)}
                            </span>
                            <span className="text-golden-xs text-slate-400 font-medium">/ plate</span>
                          </div>
                        </div>

                        {selectedCount > 0 && (
                          <button
                            type="button"
                            onClick={() => clearItems()}
                            className="text-golden-xs font-bold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            Clear all
                          </button>
                        )}
                      </div>

                      {/* Selected Items horizontal chips */}
                      {selectedCount > 0 ? (
                        <div className="space-y-[8px]">
                          <div className="flex items-center justify-between text-golden-xs text-slate-500">
                            <span>Placed on leaf ({selectedCount}):</span>
                            <span className="font-bold text-slate-700">100 plates ≈ {formatRupees(perPlateTotal * 100)}</span>
                          </div>
                          <div className="flex gap-[5px] overflow-x-auto no-scrollbar py-1">
                            {Object.values(selectedItems).map((it) => (
                              <span
                                key={it.id}
                                className="px-[8px] py-[3px] rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-900 whitespace-nowrap shrink-0 flex items-center gap-1"
                              >
                                <span>✓</span>
                                <span>{it.name}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-golden-xs text-slate-400 text-center py-[8px]">
                          Tap any dish on the left to serve it onto the fresh leaf
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-[8px] pt-[5px]">
                        <button
                          type="button"
                          onClick={() => setIsLeafModalOpen(true)}
                          className="h-[38px] rounded-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-golden-xs font-bold border border-emerald-200 transition-colors flex items-center justify-center gap-[5px] cursor-pointer"
                        >
                          <span>🍃 Expand Leaf</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsTastingModalOpen(true)}
                          className="h-[38px] rounded-[10px] bg-amber-50 hover:bg-amber-100 text-amber-900 text-golden-xs font-bold border border-amber-200 transition-colors flex items-center justify-center gap-[5px] cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Tasting Box</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==========================================================
                  VIEW MODE C: FULL MENU GRID (100% Full Width)
                  ========================================================== */}
              {viewMode === 'grid' && (
                <div className="w-full space-y-[21px] sm:space-y-[34px]">
                  {/* Search Results View */}
                  {filteredSearchItems !== null ? (
                    <section className="space-y-[13px]">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading font-black text-golden-sm sm:text-golden-base text-slate-800">
                          Found {filteredSearchItems.length} {filteredSearchItems.length === 1 ? 'dish' : 'dishes'} for &ldquo;{searchQuery}&rdquo;
                        </h3>
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="text-golden-xs font-bold text-[var(--brand)] hover:underline cursor-pointer"
                        >
                          Clear search
                        </button>
                      </div>

                      {filteredSearchItems.length === 0 ? (
                        <div className="p-[34px] text-center bg-white rounded-[21px] border border-dashed border-slate-200">
                          <p className="text-golden-sm font-semibold text-slate-700">No matching dishes found</p>
                          <p className="text-golden-xs text-slate-400 mt-1">Try searching for sweets, rice, rasam, or curries</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-[8px] sm:gap-[13px]">
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
                          className="scroll-mt-32 space-y-[13px]"
                        >
                          <ScrollReveal>
                            <div className="flex items-center justify-between pt-[5px] border-b border-slate-200/60 pb-[8px]">
                              <h3 className="font-heading font-black text-golden-base sm:text-golden-md lg:text-golden-lg text-slate-800 tracking-tight flex items-center gap-[8px]">
                                <span>{category.name}</span>
                                <span className="text-golden-xs font-bold text-slate-500 bg-slate-100 px-[8px] py-[2px] rounded-full font-sans">
                                  {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                                </span>
                              </h3>
                            </div>
                          </ScrollReveal>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-[8px] sm:gap-[13px]">
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
                </div>
              )}

            </main>

            {/* ==========================================================
                4. FLOATING MENU CATEGORIES BUTTON (BOTTOM-LEFT, LOGO ONLY)
                ========================================================== */}
            {data && data.categories && data.categories.length > 0 && (
              <FloatingMenuNav
                categories={data.categories}
                activeCategoryId={activeCategoryId}
                onSelectCategory={scrollToCategory}
                getCategorySelectedCount={getCategorySelectedCount}
                categoryItemCounts={data.categories.reduce((acc, cat) => {
                  acc[cat.id] = getCategoryItems(cat, data.items).length
                  return acc
                }, {} as Record<string, number>)}
              />
            )}

            {/* ==========================================================
                5. GOLDEN FLOATING BOTTOM BAR (61.8% / 38.2% SECTION)
                ========================================================== */}
            <motion.nav
              aria-label="Order summary and checkout"
              key={bounceKey}
              animate={!isReduced && bounceKey > 0 ? { y: [0, -3, 0] } : undefined}
              transition={MOTION_SPRINGS.tap}
              className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] inset-x-[13px] sm:inset-x-[21px] lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-3xl z-40 pointer-events-auto rounded-[21px] bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_13px_34px_-5px_rgba(0,0,0,0.15),0_3px_13px_rgba(0,0,0,0.06)] p-[8px] sm:p-[13px]"
            >
              <div className="w-full flex items-center justify-between gap-[13px] sm:gap-[21px]">
                {/* Major Golden Section (61.8%): Bag icon + 'N items selected' with Odometer */}
                <div className="flex items-center gap-[10px] sm:gap-[13px] min-w-0 flex-[1.618]">
                  <div className={`w-[38px] h-[38px] sm:w-[44px] sm:h-[44px] rounded-[13px] flex items-center justify-center shrink-0 transition-colors ${
                    selectedCount > 0 
                      ? 'bg-[var(--brand)] text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <div className="font-heading font-black text-golden-xs sm:text-golden-sm text-slate-900 flex items-center gap-1 leading-tight truncate">
                      <Odometer value={selectedCount} />
                      <span className="truncate">{selectedCount === 1 ? 'item' : 'items'} selected</span>
                      {selectedCount > 0 && (
                        <span className="text-golden-xs font-bold text-[var(--brand)] shrink-0 ml-0.5">
                          • {formatRupees(perPlateTotal)}/pl
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-golden-xs text-slate-500 font-medium leading-tight truncate mt-[2px]">
                      {selectedCount === 0
                        ? 'Select dishes to build feast'
                        : 'Custom quotation on next step'}
                    </span>
                  </div>
                </div>

                {/* Minor Golden Section (38.2%): Leaf button & Proceed button */}
                <div className="flex items-center gap-[8px] shrink-0">
                  {selectedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsLeafModalOpen(true)}
                      className="h-[38px] sm:h-[44px] px-[10px] sm:px-[16px] rounded-[13px] bg-emerald-50 hover:bg-emerald-100 active:scale-[0.97] text-emerald-800 font-bold text-golden-xs flex items-center justify-center gap-[5px] border border-emerald-200 transition-colors shadow-2xs cursor-pointer shrink-0"
                      title="View feast arranged on traditional South Indian plantain leaf"
                    >
                      <span className="text-sm">🍃</span>
                      <span className="hidden sm:inline">Leaf View</span>
                    </button>
                  )}

                  {selectedCount === 0 ? (
                    <button
                      disabled
                      className="h-[38px] sm:h-[44px] px-[13px] sm:px-[21px] rounded-[13px] bg-slate-100 text-slate-400 font-bold text-golden-xs sm:text-golden-sm cursor-not-allowed select-none tap-target-48 flex items-center justify-center transition-colors text-center shrink-0 whitespace-nowrap"
                    >
                      Select at least one item
                    </button>
                  ) : (
                    <button
                      type="button"
                      id="proceed-to-request-btn"
                      onClick={() => navigate('/request')}
                      className="h-[38px] sm:h-[44px] px-[16px] sm:px-[26px] rounded-[13px] bg-[var(--brand)] hover:bg-[var(--brand-600)] active:scale-[0.97] text-white font-heading font-black text-golden-xs sm:text-golden-sm flex items-center justify-center gap-[5px] shadow-md tap-target-48 transition-all select-none cursor-pointer shrink-0 whitespace-nowrap"
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
