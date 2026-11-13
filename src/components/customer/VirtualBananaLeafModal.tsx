import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, CheckCircle2, AlertCircle, Sparkles, ArrowRight, RefreshCw } from 'lucide-react'
import { useDraftStore } from '@/store/draftStore'
import { formatRupees } from '@/lib/format'
import { PlantainLeafCanvas } from './PlantainLeafCanvas'
import { INITIAL_ITEMS, type MenuItem } from '@/data/mockData'

interface VirtualBananaLeafModalProps {
  isOpen: boolean
  onClose: () => void
  onProceedToRequirements?: () => void
  availableItems?: MenuItem[]
}

export const VirtualBananaLeafModal: React.FC<VirtualBananaLeafModalProps> = ({
  isOpen,
  onClose,
  onProceedToRequirements,
  availableItems = INITIAL_ITEMS
}) => {
  const itemsMap = useDraftStore((state) => state.items)
  const toggleItem = useDraftStore((state) => state.toggleItem)
  const clearItems = useDraftStore((state) => state.clearItems)
  const selectedList = Object.values(itemsMap)
  const perPlateTotal = useDraftStore((state) => state.getPerPlateTotal())

  // Check completeness of a traditional South Indian feast
  const hasRice = selectedList.some((it) => it.category === 'Rice & Rice Dishes')
  const hasCurry = selectedList.some((it) => it.category === 'Curries & Gravies')
  const hasSweet = selectedList.some((it) => it.category === 'Sweets & Desserts')
  const hasCurdRice = selectedList.some((it) => it.name.toLowerCase().includes('curd'))
  const isBalanced = hasRice && hasCurry && hasSweet

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[94vh]"
        >
          {/* Header */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-emerald-950/20 flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shadow-xs border border-white/20">
                🍃
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-base sm:text-lg tracking-tight">
                    Traditional Plantain Leaf Feast Visualizer
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-sans shadow-xs">
                    Mysuru 1965
                  </span>
                </div>
                <p className="text-xs text-white/80 font-medium">
                  Watch your dishes dynamically appear in authentic ceremonial order on a fresh banana leaf.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer select-none"
              aria-label="Close banana leaf visualizer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Banana Leaf Body */}
          <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4 bg-gradient-to-b from-emerald-50/40 via-white to-slate-50">
            
            {/* The Authentic 3D Plantain Leaf Canvas */}
            <PlantainLeafCanvas
              availableItems={availableItems}
              selectedItemsMap={itemsMap}
              onToggleItem={toggleItem}
              showGhosts={true}
            />

            {/* Feast Nutritional & Traditional Balance Checklist */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                    Traditional Feast Balance (Shadrasa Harmony)
                  </h4>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isBalanced 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {isBalanced ? '✓ Well Balanced Feast' : 'Incomplete Traditional Sequence'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* 1. Rice Course */}
                <div className={`p-2 rounded-xl flex items-center gap-2 border ${
                  hasRice ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  {hasRice ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <span className="font-medium text-[11px]">Rice / Bath</span>
                </div>

                {/* 2. Sambar / Gravy */}
                <div className={`p-2 rounded-xl flex items-center gap-2 border ${
                  hasCurry ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  {hasCurry ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <span className="font-medium text-[11px]">Sambar / Rasam</span>
                </div>

                {/* 3. Sweets */}
                <div className={`p-2 rounded-xl flex items-center gap-2 border ${
                  hasSweet ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  {hasSweet ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <span className="font-medium text-[11px]">Payasa / Sweet</span>
                </div>

                {/* 4. Curd Rice Finale */}
                <div className={`p-2 rounded-xl flex items-center gap-2 border ${
                  hasCurdRice ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  {hasCurdRice ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <span className="font-medium text-[11px]">Curd Rice (Finale)</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            {/* Live Per-Plate Rate */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Feast Rate Per Plate
                </span>
                <span className="font-heading font-black text-xl text-[var(--brand)]">
                  {formatRupees(perPlateTotal)} <span className="text-xs text-slate-400 font-normal">/ plate</span>
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-semibold text-slate-600">
                {selectedList.length} items on leaf
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={clearItems}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Leaf</span>
              </button>

              <button
                type="button"
                disabled={selectedList.length === 0}
                onClick={() => {
                  onClose()
                  onProceedToRequirements?.()
                }}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-heading font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all select-none cursor-pointer ${
                  selectedList.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-[var(--brand)] hover:bg-[var(--brand-600)] active:scale-98 text-white'
                }`}
              >
                <span>Confirm Feast & Proceed</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default VirtualBananaLeafModal
