import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ChevronRight, Phone, RefreshCw, AlertCircle, Search, X, ShoppingBag } from 'lucide-react'
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

export const CataloguePage: React.FC = () => {
  const navigate = useNavigate()
  const { tier, isReduced } = useMotionTier()

  // State for catalogue data, loading, and error
  const [data, setData] = useState<CatalogueResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Scroll spy active category id
  const [activeCategoryId, setActiveCategoryId] = useState<string>('')
  
  // Search query for quick-commerce instant dish filtering
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  // Track if a manual tab click initiated scroll (to prevent scroll spy flicker)
  const isTabClickScrolling = useRef<boolean>(false)

  // Global stores
  const selectedItems = useDraftStore((state) => state.items)
  const selectedCount = Object.keys(selectedItems).length
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
          item.category.toLowerCase().includes(q)
        )
      })
    : null

  // Smooth scroll to category section
  const scrollToCategory = (categoryId: string) => {
    isTabClickScrolling.current = true
    setActiveCategoryId(categoryId)

    const element = document.getElementById(`cat-section-${categoryId}`)
    if (element) {
      // Offset for sticky Top Bar + Category Tabs
      const offset = 110
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

      const headerOffset = 140 // Header offset buffer
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
            Shrinks into compact glass bar with pre-blurred depth layer.
            Category tabs have a sliding underline (shared layoutId).
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
              {/* Quick Search Bar (Instamart / Zepto Style) */}
              <div className="relative">
                <div className="relative flex items-center bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/15 rounded-xl sm:rounded-2xl shadow-2xs transition-all px-3 py-2 sm:py-2.5">
                  <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes (e.g. Mysore Pak, Bisi Bele Bath, Rasam...)"
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

              {/* 2. COMPACT HERO STRIP: punchy quick-commerce banner */}
              {!searchQuery && (
                <section aria-label="Feast selection banner" className="p-3 sm:p-4 lg:p-5 rounded-2xl bg-gradient-to-r from-[var(--brand-900)] via-[var(--brand)] to-[var(--brand-800)] text-[var(--on-brand)] shadow-md overflow-hidden relative border border-amber-950/20">
                  <div className="flex items-center justify-between gap-3 sm:gap-6">
                    <div className="space-y-1 sm:space-y-1.5 z-10 max-w-xl">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] sm:text-[11px] tracking-wider uppercase font-extrabold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-300/30 inline-flex items-center gap-1">
                          <span>⚡</span>
                          <span>Mysuru Authentic Feast</span>
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-white/80 bg-white/10 px-2 py-0.5 rounded-full hidden sm:inline-block">
                          100% Pure Veg
                        </span>
                      </div>
                      <h2 className="font-heading font-black text-base sm:text-xl lg:text-2xl tracking-tight leading-tight">
                        Build Your Royal Catering Menu
                      </h2>
                      <p className="text-[11px] sm:text-xs lg:text-sm text-white/90 font-medium leading-relaxed line-clamp-2 sm:line-clamp-none">
                        Tap dishes to add to your feast. Live per-plate quotation and guest counts calculated on the next step.
                      </p>
                    </div>

                    {/* 3D Hero Object: Ceremonial Brass Lamp */}
                    <div className="w-16 h-16 sm:w-22 sm:h-22 lg:w-26 lg:h-26 shrink-0 relative flex items-center justify-center">
                      <Hero3D />
                    </div>
                  </div>
                </section>
              )}

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
                  const categoryItems = getCategoryItems(category, data.items)
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
              className="fixed bottom-0 left-0 right-0 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-2xl lg:bottom-5 lg:rounded-2xl z-20 bg-white/95 backdrop-blur-md border-t lg:border border-slate-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-3.5 sm:px-5 py-2.5 sm:py-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] lg:pb-3"
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
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight">
                      {selectedCount === 0
                        ? 'Select dishes to build feast'
                        : 'Custom quotation on next step'}
                    </span>
                  </div>
                </div>

                {/* Right: Proceed button */}
                <div>
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
          </>
        )}

      </div>
    </CustomerDesktopShell>
  )
}

export default CataloguePage
