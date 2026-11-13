import React from 'react'
import { Users, ChevronDown } from 'lucide-react'
import { useDraftStore } from '@/store/draftStore'
import { formatRupees } from '@/lib/format'

const OCCASIONS = [
  'Wedding / Muhurtham',
  'Grihapravesha (Housewarming)',
  'Ayushya / Sashtiapthapoorthi',
  'Upanayanam (Thread Ceremony)',
  'Corporate Banquet',
  'Engagement / Reception',
  'Seemantha (Baby Shower)',
  'Birthday & Family Gathering'
]

export const EventPlanningBar: React.FC = () => {
  const requirements = useDraftStore((state) => state.requirements)
  const setRequirements = useDraftStore((state) => state.setRequirements)
  const perPlateTotal = useDraftStore((state) => state.getPerPlateTotal())
  const guestCount = requirements.guestCount || 100

  const handleOccasionChange = (val: string) => {
    setRequirements({ eventType: val })
  }

  const handleGuestCountChange = (delta: number) => {
    const next = Math.max(10, guestCount + delta)
    setRequirements({ guestCount: next })
  }

  const estimatedTotal = perPlateTotal * guestCount

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-3 sm:p-4 lg:p-5 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Event Planning Inputs (ezCater / ZeroCater style) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 flex-1">
          
          {/* 1. Occasion Selector */}
          <div className="relative">
            <label htmlFor="catering-occasion-select" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Occasion
            </label>
            <div className="relative">
              <select
                id="catering-occasion-select"
                aria-label="Catering occasion type"
                value={requirements.eventType || 'Wedding / Muhurtham'}
                onChange={(e) => handleOccasionChange(e.target.value)}
                className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200/90 focus:border-[var(--brand)] rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 pr-8 transition-colors cursor-pointer"
              >
                {OCCASIONS.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 2. Headcount Stepper */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Guest Count
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200/90 rounded-xl px-2 py-1">
              <button
                type="button"
                onClick={() => handleGuestCountChange(-25)}
                className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 transition-colors shadow-2xs cursor-pointer select-none"
                title="Decrease 25 guests"
              >
                -
              </button>
              <div className="flex-1 text-center font-heading font-black text-xs sm:text-sm text-slate-900 flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{guestCount} guests</span>
              </div>
              <button
                type="button"
                onClick={() => handleGuestCountChange(25)}
                className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 transition-colors shadow-2xs cursor-pointer select-none"
                title="Increase 25 guests"
              >
                +
              </button>
            </div>
          </div>

          {/* 3. Meal Timing / Service Slot */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Service Slot
            </label>
            <div className="flex rounded-xl bg-slate-50 p-1 border border-slate-200/90">
              {(['Morning', 'Afternoon', 'Evening'] as const).map((time) => {
                const isActive = (requirements.eventTime || 'Morning') === time
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setRequirements({ eventTime: time })}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer select-none ${
                      isActive
                        ? 'bg-white text-[var(--brand)] shadow-2xs border border-slate-200/80 font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {time === 'Morning' ? 'Breakfast' : time === 'Afternoon' ? 'Lunch' : 'Dinner'}
                  </button>
                )
              })}
            </div>
          </div>

        </div>

        {/* Right: Live Per-Head Budget & Estimated Food Total */}
        <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Budget Per Plate
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-heading font-black text-base sm:text-lg text-[var(--brand-900)]">
                {formatRupees(perPlateTotal)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">/ person</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Est. Food Total ({guestCount} pl)
            </span>
            <span className="font-heading font-black text-base sm:text-lg text-emerald-800">
              {formatRupees(estimatedTotal)}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default EventPlanningBar
