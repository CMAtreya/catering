import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { MenuItem } from '@/data/mockData'
import type { SelectedItem } from '@/store/draftStore'
import { Mock3DPlatedDish } from './Mock3DPlatedDish'
import { Sparkles } from 'lucide-react'

interface PlantainLeafCanvasProps {
  availableItems: MenuItem[]
  selectedItemsMap: Record<string, SelectedItem | MenuItem>
  onToggleItem: (item: MenuItem) => void
  interactive?: boolean
  showGhosts?: boolean
  className?: string
}

// Traditional South Indian Leaf Placement Coordinates calibrated to the leaf image
const LEAF_COORDINATES: Record<string, { left: string; top: string }> = {
  // Top Row: Palya, Majjige Huli, Sambar, Rasam
  'item-8': { left: '34%', top: '23%' },   // Palya
  'item-9': { left: '46%', top: '22%' },   // Majjige Huli
  'item-6': { left: '58%', top: '23%' },   // Sambar
  'item-7': { left: '70%', top: '25%' },   // Rasam

  // Center Row: Rice Specialities & Pongal
  'item-3': { left: '22%', top: '44%' },   // Lemon Rice
  'item-1': { left: '35%', top: '46%' },   // Bisi Bele Bath
  'item-2': { left: '62%', top: '46%' },   // Puliyogare
  'item-5': { left: '74%', top: '48%' },   // Pongal
  'item-4': { left: '48%', top: '64%' },   // Curd Rice

  // Bottom Delicacies & Tiffins
  'item-15': { left: '15%', top: '72%' },  // Medu Vada
  'item-14': { left: '26%', top: '74%' },  // Idli
  'item-17': { left: '37%', top: '76%' },  // Dosa
  'item-16': { left: '18%', top: '56%' },  // Khara Bath
  'item-18': { left: '28%', top: '59%' },  // Akki Roti

  // Sweets & Desserts
  'item-10': { left: '59%', top: '77%' },  // Mysore Pak
  'item-11': { left: '70%', top: '75%' },  // Kesari Bath
  'item-12': { left: '81%', top: '70%' },  // Payasa
  'item-13': { left: '89%', top: '56%' },  // Holige

  // Beverages (Top Right)
  'item-19': { left: '85%', top: '20%' },  // Filter Coffee
  'item-20': { left: '87%', top: '38%' },  // Buttermilk
}

export const PlantainLeafCanvas: React.FC<PlantainLeafCanvasProps> = ({
  availableItems,
  selectedItemsMap,
  onToggleItem,
  showGhosts = true,
  className = ''
}) => {
  const selectedCount = Object.keys(selectedItemsMap).length

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-800/40 bg-emerald-950 select-none ${className}`}>
      
      {/* 1. Real Plantain Leaf Image Backdrop */}
      <div className="relative w-full aspect-[16/9] min-h-[300px] sm:min-h-[420px] max-h-[560px] overflow-hidden flex items-center justify-center">
        <img
          src="/magizh-exports-plantain-leaf-karattupalayam-gobichettipalayam-banana-leaf-wholesalers-pcmv3x0368.avif"
          alt="Authentic Fresh South Indian Plantain Leaf"
          className="w-full h-full object-cover object-center filter saturate-110 contrast-105"
        />

        {/* Ambient Sunlight & Leaf Vein Glaze */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200/10 via-transparent to-transparent pointer-events-none" />

        {/* ========================================================== */}
        {/* TRADITIONAL STATIC GARNISH (Ceremonial Essentials)         */}
        {/* ========================================================== */}
        {/* Pinch of Salt (Uppu) - Top Left */}
        <div 
          style={{ left: '10%', top: '26%' }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
          title="Ceremonial Salt (Uppu)"
        >
          <div className="w-4 h-4 rounded-full bg-white/90 blur-[0.5px] shadow-[0_2px_4px_rgba(0,0,0,0.5)] border border-white" />
          <span className="text-[8px] font-bold text-white/80 drop-shadow-sm absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
            Uppu
          </span>
        </div>

        {/* Lemon Pickle - Top Left */}
        <div 
          style={{ left: '16%', top: '24%' }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
          title="Nimbe Uppinakayi (Lemon Pickle)"
        >
          <div className="w-5 h-5 rounded-full bg-amber-500/90 shadow-[0_3px_6px_rgba(0,0,0,0.6)] border border-amber-300" />
          <span className="text-[8px] font-bold text-white/80 drop-shadow-sm absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
            Pickle
          </span>
        </div>

        {/* Crispy Mysore Appalam - Center Left */}
        <div 
          style={{ left: '48%', top: '48%' }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 opacity-90"
          title="Crisp South Indian Appalam"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-200 to-amber-100 shadow-[0_4px_8px_rgba(0,0,0,0.5)] border border-amber-300/60" />
          <span className="text-[8px] font-bold text-white/80 drop-shadow-sm absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
            Appalam
          </span>
        </div>

        {/* ========================================================== */}
        {/* DYNAMIC PLATED DISHES (Planted onto Leaf Coordinates)       */}
        {/* ========================================================== */}
        <AnimatePresence>
          {availableItems.map((item) => {
            const coord = LEAF_COORDINATES[item.id]
            if (!coord) return null

            const isPlaced = Boolean(selectedItemsMap[item.id])

            return (
              <Mock3DPlatedDish
                key={item.id}
                item={item}
                isPlaced={isPlaced}
                coordinate={coord}
                showGhostWhenUnplaced={showGhosts}
                onAdd={(it) => onToggleItem(it)}
                onRemove={(it) => onToggleItem(it)}
              />
            )
          })}
        </AnimatePresence>

        {/* Empty Leaf Guidance Callout when 0 dishes are chosen */}
        {selectedCount === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none p-4"
          >
            <div className="bg-slate-950/80 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl border border-white/20 text-center max-w-sm shadow-2xl space-y-1">
              <div className="flex items-center justify-center gap-2 text-amber-300 font-heading font-black text-sm sm:text-base">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Your Plantain Leaf is Waiting</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                Tap dishes from the menu below or click the <span className="text-amber-300 font-bold">(+)</span> slots on the leaf to arrange your ceremonial feast.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* 2. Bottom Leaf Control & Live Status Strip */}
      <div className="bg-slate-950/95 border-t border-emerald-800/40 px-4 py-2.5 flex items-center justify-between text-xs text-white">
        <div className="flex items-center gap-2">
          <span className="text-base">🍃</span>
          <span className="font-heading font-black text-amber-300">
            {selectedCount} {selectedCount === 1 ? 'Dish' : 'Dishes'} Placed on Leaf
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-white/70">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time South Indian Placement</span>
        </div>
      </div>

    </div>
  )
}

export default PlantainLeafCanvas
