import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, CheckCircle2, AlertCircle, Sparkles, Plus, ArrowRight } from 'lucide-react'
import { useDraftStore } from '@/store/draftStore'
import { formatRupees } from '@/lib/format'

interface VirtualBananaLeafModalProps {
  isOpen: boolean
  onClose: () => void
  onProceedToRequirements?: () => void
}

export const VirtualBananaLeafModal: React.FC<VirtualBananaLeafModalProps> = ({
  isOpen,
  onClose,
  onProceedToRequirements
}) => {
  const items = useDraftStore((state) => state.items)
  const selectedList = Object.values(items)
  const perPlateTotal = useDraftStore((state) => state.getPerPlateTotal())

  // Categorize selected items for traditional leaf layout
  const riceItems = selectedList.filter((it) => it.category === 'Rice & Rice Dishes')
  const curryItems = selectedList.filter((it) => it.category === 'Curries & Gravies')
  const sweetItems = selectedList.filter((it) => it.category === 'Sweets & Desserts')
  const tiffinItems = selectedList.filter((it) => it.category === 'Tiffins & Breakfast')
  const beverageItems = selectedList.filter((it) => it.category === 'Beverages')

  // Check completeness of a traditional feast
  const hasRice = riceItems.length > 0
  const hasCurry = curryItems.length > 0
  const hasSweet = sweetItems.length > 0
  const hasCurdRice = selectedList.some((it) => it.name.toLowerCase().includes('curd'))

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shadow-xs">
                🍃
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-base sm:text-lg">
                    Traditional Plantain Leaf Feast Layout
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-sans">
                    Ceremonial
                  </span>
                </div>
                <p className="text-xs text-white/80 font-medium">
                  Authentic Mysore Brahmin placement order: salt & pickles top-left, rice & ghee center, sweets bottom.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close banana leaf visualizer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Banana Leaf Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-gradient-to-b from-emerald-50/40 to-slate-50">
            
            {/* The Visual Plantain Leaf Canvas */}
            <div className="relative rounded-[32px] p-5 sm:p-8 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 shadow-xl text-white border-4 border-emerald-800/40 overflow-hidden">
              {/* Organic leaf spine and vein lines */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-emerald-800/40 -translate-y-1/2 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/20 pointer-events-none" />

              <div className="relative z-10 space-y-6">
                
                {/* 1. TOP ROW: Relishes, Pickles, Palya & Kootu */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-100 uppercase tracking-wider">
                    <span>Top Row: Starters, Accoutrements & Vegetable Stews</span>
                    <span className="text-[10px] text-emerald-200">Served first</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {/* Ceremonial Salt & Pickle (Always present) */}
                    <div className="p-2 sm:p-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-center">
                      <span className="text-lg block">🧂</span>
                      <span className="text-xs font-bold block">Salt & Pickles</span>
                      <span className="text-[10px] text-emerald-200 font-medium">Uppu & Thokku</span>
                    </div>

                    {/* Palya / Kootu */}
                    {curryItems.map((item) => (
                      <div key={item.id} className="p-2 sm:p-2.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-center shadow-xs">
                        <span className="text-lg block">🍛</span>
                        <span className="text-xs font-bold block truncate">{item.name}</span>
                        <span className="text-[10px] text-amber-300 font-semibold">{formatRupees(item.pricePerPlate)}</span>
                      </div>
                    ))}

                    {curryItems.length === 0 && (
                      <div className="p-2 sm:p-2.5 rounded-xl border border-dashed border-white/40 text-center text-white/70 flex flex-col items-center justify-center">
                        <Plus className="w-4 h-4 mb-0.5 opacity-60" />
                        <span className="text-[11px] font-medium">Add Palya or Kootu</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. CENTER SECTION: Main Feasts, Bisi Bele Bath, Steamed Rice, Sambar & Rasam with Cow Ghee */}
                <div className="space-y-1.5 pt-2 border-t border-emerald-500/40">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-200 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <span>✨ Center Stage: Main Course with Pure Cow Ghee</span>
                    </span>
                    <span className="text-[10px] text-emerald-200">Warm & Steaming</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                    {riceItems.map((item) => (
                      <div key={item.id} className="p-3 rounded-2xl bg-white/25 backdrop-blur-md border-2 border-amber-300/60 text-center shadow-md">
                        <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center mx-auto mb-1 text-sm font-bold shadow-xs">
                          🧈
                        </div>
                        <h5 className="font-heading font-black text-xs sm:text-sm">{item.name}</h5>
                        <p className="text-[10px] text-amber-200 font-medium">Served with Pure Cow Ghee</p>
                        <span className="text-[11px] font-bold text-white mt-1 inline-block bg-black/20 px-2 py-0.5 rounded-full">
                          {formatRupees(item.pricePerPlate)}
                        </span>
                      </div>
                    ))}

                    {riceItems.length === 0 && (
                      <div className="p-4 rounded-2xl border-2 border-dashed border-white/50 text-center text-white/80 flex flex-col items-center justify-center col-span-full">
                        <span className="text-2xl mb-1">🍚</span>
                        <p className="text-xs font-bold">No Rice or Bath Dishes Selected</p>
                        <p className="text-[11px] text-emerald-200">Add Bisi Bele Bath, Puliyogare or Lemon Rice to anchor the feast</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. BOTTOM SECTION: Sweets, Payasa, Medu Vada, Appalam & Coffee */}
                <div className="space-y-1.5 pt-2 border-t border-emerald-500/40">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-100 uppercase tracking-wider">
                    <span>Bottom Row: Crispies, Royal Sweets & Beverages</span>
                    <span className="text-[10px] text-emerald-200">The Grand Finale</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {/* Tiffins / Vada / Appalam */}
                    {tiffinItems.map((item) => (
                      <div key={item.id} className="p-2 sm:p-2.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-center">
                        <span className="text-lg block">🥞</span>
                        <span className="text-xs font-bold block truncate">{item.name}</span>
                        <span className="text-[10px] text-amber-300 font-semibold">{formatRupees(item.pricePerPlate)}</span>
                      </div>
                    ))}

                    {/* Sweets & Payasams */}
                    {sweetItems.map((item) => (
                      <div key={item.id} className="p-2 sm:p-2.5 rounded-xl bg-amber-400/30 backdrop-blur-md border border-amber-300/50 text-center ring-1 ring-amber-300/40">
                        <span className="text-lg block">🍯</span>
                        <span className="text-xs font-black block truncate text-amber-200">{item.name}</span>
                        <span className="text-[10px] text-white font-semibold">{formatRupees(item.pricePerPlate)}</span>
                      </div>
                    ))}

                    {/* Beverages */}
                    {beverageItems.map((item) => (
                      <div key={item.id} className="p-2 sm:p-2.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-center">
                        <span className="text-lg block">☕</span>
                        <span className="text-xs font-bold block truncate">{item.name}</span>
                        <span className="text-[10px] text-amber-300 font-semibold">{formatRupees(item.pricePerPlate)}</span>
                      </div>
                    ))}

                    {!hasSweet && (
                      <div className="p-2 sm:p-2.5 rounded-xl border border-dashed border-amber-300/60 text-center text-amber-200 flex flex-col items-center justify-center">
                        <Sparkles className="w-4 h-4 mb-0.5" />
                        <span className="text-[11px] font-bold">Add Mysore Pak / Payasa</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Feast Balance Audit & Recommendations */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-500">
                Traditional Feast Authenticity Check
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium">
                <div className={`p-2 rounded-xl flex items-center gap-2 border ${hasRice ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                  {hasRice ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
                  <span>{hasRice ? 'Rice Main Dishes' : 'Missing Rice Dish'}</span>
                </div>

                <div className={`p-2 rounded-xl flex items-center gap-2 border ${hasCurry ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                  {hasCurry ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
                  <span>{hasCurry ? 'Sambar / Rasam / Palya' : 'Missing Curries'}</span>
                </div>

                <div className={`p-2 rounded-xl flex items-center gap-2 border ${hasSweet ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                  {hasSweet ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
                  <span>{hasSweet ? 'Traditional Sweet' : 'Add Sweet / Payasam'}</span>
                </div>

                <div className={`p-2 rounded-xl flex items-center gap-2 border ${hasCurdRice ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                  {hasCurdRice ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <span className="w-4 h-4 text-center shrink-0">🥣</span>}
                  <span>{hasCurdRice ? 'Curd Rice (Cooler)' : 'Curd Rice Optional'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div>
              <p className="text-xs text-slate-500 font-medium">
                {selectedList.length} dishes on plantain leaf
              </p>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-black text-xl text-[var(--brand)]">
                  {formatRupees(perPlateTotal)}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ plate</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 transition-colors cursor-pointer"
              >
                Modify Dishes
              </button>
              
              {onProceedToRequirements && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onProceedToRequirements()
                  }}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Proceed to Headcount</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
export default VirtualBananaLeafModal

