import React from 'react'
import { ShieldCheck } from 'lucide-react'

export type PurityFilter = 'all' | 'pure-ghee' | 'satvik' | 'sweets' | 'tiffins' | 'beverages'

interface PurityFilterMatrixProps {
  activeFilter: PurityFilter
  onSelectFilter: (filter: PurityFilter) => void
  totalCount?: number
}

export const PurityFilterMatrix: React.FC<PurityFilterMatrixProps> = ({
  activeFilter,
  onSelectFilter
}) => {
  const filters: { id: PurityFilter; label: string; icon: string; countDesc?: string }[] = [
    { id: 'all', label: 'All Dishes', icon: '✨' },
    { id: 'pure-ghee', label: 'Pure Cow Ghee', icon: '🧈', countDesc: 'Authentic' },
    { id: 'satvik', label: 'Strictly Satvik', icon: '🌿', countDesc: 'No Onion/Garlic' },
    { id: 'sweets', label: 'Royal Sweets', icon: '🍯' },
    { id: 'tiffins', label: 'Breakfast Tiffins', icon: '🥞' },
    { id: 'beverages', label: 'Beverages', icon: '☕' },
  ]

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 -mx-3 px-3 sm:mx-0 sm:px-0 select-none">
      <div className="hidden lg:flex items-center gap-1 pr-2 border-r border-slate-200/80 text-[11px] font-bold text-slate-500 shrink-0">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Purity Matrix:</span>
      </div>

      {filters.map((f) => {
        const isActive = activeFilter === f.id
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelectFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer tap-target-48 sm:tap-target-auto ${
              isActive
                ? 'bg-[var(--brand)] text-white shadow-xs ring-2 ring-[var(--brand)]/20'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
            }`}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
            {f.countDesc && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {f.countDesc}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
export default PurityFilterMatrix

