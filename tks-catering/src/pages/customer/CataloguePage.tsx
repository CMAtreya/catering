import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ChevronRight, Phone, RefreshCw, AlertCircle } from 'lucide-react'
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

      const scrollPosition = window.scrollY + 130 // Header offset buffer
      const categories = data.categories

      for (let i = categories.length - 1; i >= 0; i--) {
        const cat = categories[i]
        const element = document.getElementById(`cat-section-${cat.id}`)
        if (element) {
          const top = element.offsetTop
          if (scrollPosition >= top) {
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
            <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pt-4 pb-36 space-y-8">
              {/* 2. HERO STRIP: slim rounded banner with brand gradient,
                  featuring the single looping 3D ceremonial brass lamp */}
              <section aria-label="Feast selection banner" className="p-5 sm:p-6 lg:p-8 rounded-[24px] bg-gradient-to-r from-[var(--brand-900)] via-[var(--brand)] to-[var(--brand-800)] text-[var(--on-brand)] shadow-lg overflow-hidden relative border border-amber-900/20">
                <div className="flex items-center justify-between gap-6">
                  <div className="space-y-2 z-10 max-w-xl">
                    <span className="text-[11px] tracking-widest uppercase font-bold text-[var(--brand-2)] bg-amber-400/20 px-2.5 py-1 rounded-full border border-amber-300/30 inline-block">
                      Royal Feast Selection
                    </span>
                    <h2 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl tracking-tight leading-snug">
                      Choose your bespoke catering menu
                    </h2>
                    <p className="text-xs sm:text-sm lg:text-base text-white/90 font-medium leading-relaxed">
                      Select dishes from any traditional Mysore category. Live guest pricing and quotation updates dynamically on the next step.
                    </p>
                  </div>

                  {/* 3D Hero Object: Ceremonial Brass Lamp (Full Tier) / Poster (Lite/Reduced) */}
                  <div className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 relative flex items-center justify-center">
                    <Hero3D />
                  </div>
                </div>
              </section>
              {data.categories.map((category) => {
                const categoryItems = getCategoryItems(category, data.items)
                if (categoryItems.length === 0) return null

                return (
                  <section
                    key={category.id}
                    id={`cat-section-${category.id}`}
                    className="scroll-mt-32 space-y-4"
                  >
                    {/* Category Title & Count revealed with soft clip-mask */}
                    <ScrollReveal>
                      <div className="flex items-baseline justify-between pt-2 border-b border-slate-200/60 pb-2">
                        <h3 className="font-serif font-bold text-lg sm:text-xl lg:text-2xl text-[var(--text-primary)] tracking-tight flex items-baseline gap-2">
                          <span>{category.name}</span>
                          <span className="text-xs font-bold text-[var(--text-muted)] font-sans">
                            ({categoryItems.length} dishes)
                          </span>
                        </h3>
                      </div>
                    </ScrollReveal>

                    {/* Multi-column responsive grid of ItemCards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
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
              })}
            </main>

            {/* ==========================================================
                4. STICKY BOTTOM BAR (glass-strong, above safe area)
                Full width on phones; centered floating bar (max 640px) on desktop.
                Odometer roll for selected count and gentle spring bounce on selection.
                ========================================================== */}
            <motion.nav
              aria-label="Order summary and checkout"
              key={bounceKey}
              animate={!isReduced && bounceKey > 0 ? { y: [0, -3, 0] } : undefined}
              transition={MOTION_SPRINGS.tap}
              className="fixed bottom-0 left-0 right-0 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-2xl lg:bottom-6 lg:rounded-2xl z-20 glass-bottom-bar border-t lg:border border-slate-200/90 shadow-2xl px-4 sm:px-6 py-3 sm:py-3.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:pb-3.5"
            >
              <div className="w-full flex items-center justify-between gap-3">
                {/* Left: 'N items selected' with Odometer */}
                <div className="flex flex-col justify-center">
                  <div className="font-serif font-bold text-sm sm:text-base text-[var(--text-primary)] flex items-center gap-1">
                    <Odometer value={selectedCount} />
                    <span>{selectedCount === 1 ? 'item' : 'items'} selected</span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] font-medium">
                    {selectedCount === 0
                      ? 'Pick dishes from any category'
                      : 'Pricing calculated on next step'}
                  </span>
                </div>

                {/* Right: Large Proceed button */}
                <div>
                  {selectedCount === 0 ? (
                    <button
                      disabled
                      className="h-12 px-5 rounded-full bg-slate-200 text-slate-500 font-bold text-xs sm:text-sm cursor-not-allowed select-none tap-target-48 flex items-center justify-center transition-colors"
                    >
                      Select at least one item
                    </button>
                  ) : (
                    <button
                      type="button"
                      id="proceed-to-request-btn"
                      onClick={() => navigate('/request')}
                      className="h-12 px-6 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] active:scale-[0.98] text-[var(--on-brand)] font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg tap-target-48 transition-colors select-none cursor-pointer"
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
