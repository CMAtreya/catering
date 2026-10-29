import React from 'react'
import { motion } from 'motion/react'
import { X, Check } from 'lucide-react'
import type { MenuItem } from '@/data/mockData'
import { formatRupees } from '@/lib/format'
import { MOTION_SPRINGS } from '@/motion/tokens'

interface Mock3DPlatedDishProps {
  item: MenuItem
  isPlaced: boolean
  coordinate: { left: string; top: string }
  onRemove?: (item: MenuItem) => void
  onAdd?: (item: MenuItem) => void
  showGhostWhenUnplaced?: boolean
}

/**
 * Authentic South Indian Mock 3D Plated Culinary Object
 * Renders realistic dishes served in traditional brass katoris, food mounds, 
 * delicacies, or brass dabara tumblers on the banana leaf.
 */
export const Mock3DPlatedDish: React.FC<Mock3DPlatedDishProps> = ({
  item,
  isPlaced,
  coordinate,
  onRemove,
  onAdd,
  showGhostWhenUnplaced = true
}) => {
  const [isHovered, setIsHovered] = React.useState(false)

  // Determine styling archetype based on dish container
  const container = item.leafContainer || 'mound'

  if (!isPlaced) {
    if (!showGhostWhenUnplaced) return null

    // Unplaced Ghost Slot (dashed circular guide inviting customer to add)
    return (
      <div
        style={{ left: coordinate.left, top: coordinate.top }}
        className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
      >
        <button
          type="button"
          onClick={() => onAdd?.(item)}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dashed border-white/40 hover:border-amber-300 bg-black/20 hover:bg-black/40 backdrop-blur-xs flex items-center justify-center text-white/60 hover:text-white transition-all transform hover:scale-110 cursor-pointer shadow-sm group-hover:ring-2 group-hover:ring-amber-300/40"
          title={`Add ${item.name} to leaf (+${formatRupees(item.pricePerPlate)})`}
          aria-label={`Add ${item.name} to plantain leaf`}
        >
          <span className="text-[10px] sm:text-xs font-black select-none">+</span>
        </button>
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900/90 text-amber-200 shadow-md">
            + {item.name}
          </span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      style={{ left: coordinate.left, top: coordinate.top }}
      initial={{ scale: 0, y: -20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0, y: 15, opacity: 0 }}
      transition={MOTION_SPRINGS.tap}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer select-none group"
    >
      {/* 3D Realistic Plated Presentation Container */}
      <div className="relative">
        
        {/* Contact Shadow on Green Plantain Leaf */}
        <div className="absolute -inset-1 rounded-full bg-black/45 blur-[4px] transform translate-y-2 scale-95 pointer-events-none" />

        {/* ======================================================== */}
        {/* CONTAINER 1: TRADITIONAL BRASS KATORI (Curries, Gravies) */}
        {/* ======================================================== */}
        {container === 'katori' && (
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full p-[3px] bg-gradient-to-tr from-amber-700 via-yellow-400 to-amber-600 shadow-[0_6px_14px_rgba(0,0,0,0.5)] border border-amber-300/60 transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-1">
            {/* Inner Metallic Bowl Rim */}
            <div className="w-full h-full rounded-full overflow-hidden relative shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] border border-amber-800/40 bg-amber-950">
              <img
                src={item.image || '/default-dish.svg'}
                alt={item.name}
                className="w-full h-full object-cover rounded-full"
                loading="eager"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).src = '/default-dish.svg'
                }}
              />
              {/* Liquid Gloss Specular Highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent pointer-events-none rounded-full" />
              {/* Garnish Ghee/Spice Accent */}
              {item.pureGhee && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_4px_#ffd861] pointer-events-none" />
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CONTAINER 2: AUTHENTIC RICE/PORRIDGE MOUND               */}
        {/* ======================================================== */}
        {container === 'mound' && (
          <div className="relative w-13 h-13 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-b from-amber-100/40 to-black/20 shadow-[0_8px_16px_rgba(0,0,0,0.55)] transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-1">
            <div className="w-full h-full rounded-full overflow-hidden relative border-2 border-amber-200/40 shadow-inner bg-stone-900">
              <img
                src={item.image || '/default-dish.svg'}
                alt={item.name}
                className="w-full h-full object-cover rounded-full"
                loading="eager"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).src = '/default-dish.svg'
                }}
              />
              {/* 3D Spherical Glistening Dome Layer */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(255,255,255,0.4)_0%,transparent_60%)] pointer-events-none rounded-full" />
              {/* Melting Cow Ghee Well */}
              {item.pureGhee && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-3.5 h-3.5 rounded-full bg-amber-300/80 blur-[0.5px] border border-amber-400 shadow-[0_0_6px_#ffd861]" />
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CONTAINER 3: CRISP DELICACY (Vada, Dosa, Idli, Sweets)   */}
        {/* ======================================================== */}
        {container === 'delicacy' && (
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-0.5 shadow-[0_7px_15px_rgba(0,0,0,0.5)] transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-1">
            <div className="w-full h-full rounded-xl sm:rounded-2xl overflow-hidden relative border border-white/50 shadow-sm bg-stone-900">
              <img
                src={item.image || '/default-dish.svg'}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="eager"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).src = '/default-dish.svg'
                }}
              />
              {/* Crisp Rim Light */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/20 pointer-events-none" />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CONTAINER 4: BRASS TUMBLER / DABARA SET (Coffee, Drink)   */}
        {/* ======================================================== */}
        {container === 'tumbler' && (
          <div className="relative w-11 h-14 sm:w-13 sm:h-16 rounded-b-xl p-[2.5px] bg-gradient-to-b from-yellow-300 via-amber-500 to-amber-700 shadow-[0_8px_16px_rgba(0,0,0,0.6)] border border-amber-200 transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-1">
            <div className="w-full h-full rounded-b-lg overflow-hidden relative shadow-inner bg-amber-950 flex flex-col justify-end">
              <img
                src={item.image || '/default-dish.svg'}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="eager"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).src = '/default-dish.svg'
                }}
              />
              {/* Frothy Head Overlay */}
              <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-amber-100/70 to-transparent pointer-events-none" />
            </div>
          </div>
        )}

        {/* Active Leaf Dish Check Tag */}
        <div className="absolute -top-1 -right-1 z-30 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-emerald-600 border border-white text-white flex items-center justify-center shadow-md">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </div>
      </div>

      {/* ======================================================== */}
      {/* HOVER / TAP INTERACTIVE TOOLTIP                          */}
      {/* ======================================================== */}
      <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-40 transition-all duration-150 pointer-events-auto ${
        isHovered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1 pointer-events-none'
      }`}>
        <div className="bg-slate-950/95 backdrop-blur-md text-white rounded-xl p-2 sm:p-2.5 shadow-2xl border border-white/20 min-w-[140px] max-w-[190px] text-center space-y-1">
          <div className="flex items-center justify-between gap-1 border-b border-white/10 pb-1">
            <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider truncate">
              {item.name}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemove?.(item)
              }}
              className="w-4 h-4 rounded-full bg-white/20 hover:bg-red-500 hover:text-white flex items-center justify-center text-slate-300 transition-colors"
              title="Remove from feast"
              aria-label={`Remove ${item.name} from leaf`}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="font-bold text-white">
              {formatRupees(item.pricePerPlate)}
            </span>
            <span className="text-[9px] text-emerald-400 font-semibold">
              {item.pureGhee ? '🧈 Pure Ghee' : '🌿 Satvik'}
            </span>
          </div>
        </div>
      </div>

    </motion.div>
  )
}

export default Mock3DPlatedDish
