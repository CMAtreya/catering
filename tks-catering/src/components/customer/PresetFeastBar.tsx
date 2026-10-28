import React from 'react'
import { Sparkles, Check, ChevronRight } from 'lucide-react'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import type { MenuItem } from '@/data/mockData'
import { useDraftStore } from '@/store/draftStore'

export interface PresetFeast {
  id: string
  name: string
  kannadaName?: string
  subtitle: string
  tag: string
  accentColor: string
  itemIds: string[]
}

export const PRESET_FEASTS: PresetFeast[] = [
  {
    id: 'kalyana-feast',
    name: 'Royal Mysore Kalyana Feast',
    kannadaName: 'ರಾಜ ಮಹೋತ್ಸವ ಕಲ್ಯಾಣ ಊಟ',
    subtitle: 'Grand 10-dish wedding banquet with Pure Cow Ghee',
    tag: '👑 Most Popular',
    accentColor: 'from-amber-600 via-[var(--brand)] to-[var(--brand-900)]',
    itemIds: [
      'item-1',  // Bisi Bele Bath
      'item-4',  // Curd Rice
      'item-6',  // Sambar
      'item-7',  // Rasam
      'item-8',  // Palya
      'item-9',  // Kootu
      'item-10', // Mysore Pak
      'item-12', // Payasa
      'item-15', // Medu Vada
      'item-19'  // Filter Coffee
    ]
  },
  {
    id: 'muhurtham-breakfast',
    name: 'Traditional Muhurtham Breakfast',
    kannadaName: 'ಸಾಂಪ್ರದಾಯಿಕ ಮುಹೂರ್ತ ತಿಂಡಿ',
    subtitle: 'Hot Malligai Idlis, crispy Vadas & steaming Filter Coffee',
    tag: '🌅 Morning Feasts',
    accentColor: 'from-orange-500 to-amber-700',
    itemIds: [
      'item-14', // Idli
      'item-15', // Medu Vada
      'item-5',  // Pongal
      'item-11', // Kesari Bath
      'item-6',  // Sambar
      'item-19'  // Filter Coffee
    ]
  },
  {
    id: 'satvik-homam',
    name: 'Satvik Ayushya Homam',
    kannadaName: 'ಸಾತ್ವಿಕ ಆಯುಷ್ಯ ಹೋಮ ಊಟ',
    subtitle: 'Pristine pooja spread, strictly no onion/garlic',
    tag: '🌿 100% Satvik',
    accentColor: 'from-emerald-700 to-teal-800',
    itemIds: [
      'item-2',  // Puliyogare
      'item-4',  // Curd Rice
      'item-7',  // Rasam
      'item-8',  // Palya
      'item-12', // Payasa
      'item-20'  // Buttermilk
    ]
  },
  {
    id: 'grihapravesha-special',
    name: 'Grihapravesha Banquet',
    kannadaName: 'ಗೃಹಪ್ರವೇಶ ಶುಭ ಸಮಾರಂಭ',
    subtitle: 'Auspicious housewarming spread with Mysore Pak',
    tag: '🏡 Housewarming',
    accentColor: 'from-rose-600 to-[var(--brand)]',
    itemIds: [
      'item-3',  // Lemon Rice
      'item-1',  // Bisi Bele Bath
      'item-4',  // Curd Rice
      'item-6',  // Sambar
      'item-8',  // Palya
      'item-10', // Mysore Pak
      'item-11', // Kesari Bath
      'item-19'  // Filter Coffee
    ]
  }
]

interface PresetFeastBarProps {
  availableItems: MenuItem[]
  onOpenLeafVisualizer?: () => void
}

export const PresetFeastBar: React.FC<PresetFeastBarProps> = ({
  availableItems,
  onOpenLeafVisualizer
}) => {
  const selectedItems = useDraftStore((state) => state.items)
  const loadPresetFeast = useDraftStore((state) => state.loadPresetFeast)

  const itemsMap = React.useMemo(() => {
    const map = new Map<string, MenuItem>()
    for (const item of availableItems) {
      map.set(item.id, item)
    }
    return map
  }, [availableItems])

  const handleApplyPreset = (preset: PresetFeast) => {
    const matchedItems: MenuItem[] = []
    for (const id of preset.itemIds) {
      const it = itemsMap.get(id)
      if (it && it.available) {
        matchedItems.push(it)
      }
    }

    if (matchedItems.length === 0) {
      toast.error('Preset dishes currently unavailable')
      return
    }

    loadPresetFeast(matchedItems, preset.name)

    // Joyful celebration confetti
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#b60a06', '#ffd861', '#10b981', '#ffffff']
      })
    } catch {}

    const totalRate = matchedItems.reduce((acc, curr) => acc + curr.pricePerPlate, 0)
    toast.success(`Loaded "${preset.name}"`, {
      description: `${matchedItems.length} curated dishes selected • ₹${totalRate}/plate base price`
    })
  }

  // Check if a preset is currently active (all its items are selected)
  const isPresetActive = (preset: PresetFeast) => {
    if (preset.itemIds.length === 0) return false
    return preset.itemIds.every((id) => Boolean(selectedItems[id]))
  }

  return (
    <section aria-label="Curated banquet packages" className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm sm:text-base text-slate-800 tracking-tight">
              Curated Banquet Feasts
            </h3>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              1-tap authentic South Indian meal packages hand-crafted by our master chefs
            </p>
          </div>
        </div>

        {onOpenLeafVisualizer && (
          <button
            type="button"
            onClick={onOpenLeafVisualizer}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
          >
            <span>🍃</span>
            <span>View on Banana Leaf</span>
            <ChevronRight className="w-3 h-3 text-emerald-600" />
          </button>
        )}
      </div>

      {/* Horizontally scrollable feast cards */}
      <div className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
        {PRESET_FEASTS.map((preset) => {
          const active = isPresetActive(preset)
          const matchedItems = preset.itemIds
            .map((id) => itemsMap.get(id))
            .filter((it): it is MenuItem => Boolean(it))
          const feastRate = matchedItems.reduce((acc, curr) => acc + curr.pricePerPlate, 0)

          return (
            <div
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className={`min-w-[240px] sm:min-w-[270px] max-w-[290px] rounded-2xl p-3 sm:p-3.5 border transition-all cursor-pointer relative flex flex-col justify-between group shadow-2xs hover:shadow-md select-none shrink-0 ${
                active
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50/70 border-[var(--brand)] ring-2 ring-[var(--brand)]/20 shadow-xs'
                  : 'bg-white border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {preset.tag}
                  </span>
                  {active && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--brand)] bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Applied</span>
                    </span>
                  )}
                </div>

                <h4 className="font-heading font-black text-xs sm:text-sm text-slate-900 group-hover:text-[var(--brand)] transition-colors leading-snug">
                  {preset.name}
                </h4>
                {preset.kannadaName && (
                  <p className="text-[10px] text-amber-800/80 font-kannada font-medium">
                    {preset.kannadaName}
                  </p>
                )}
                <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-1 leading-normal">
                  {preset.subtitle}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-heading font-black text-sm sm:text-base text-[var(--brand)]">
                    ₹{feastRate}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium"> / plate</span>
                </div>

                <button
                  type="button"
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    active
                      ? 'bg-[var(--brand)] text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{active ? 'Selected' : 'Load Menu'}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
export default PresetFeastBar

