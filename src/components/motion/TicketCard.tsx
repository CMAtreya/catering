import React from 'react'
import { Sparkles, Calendar, Utensils, ShieldCheck } from 'lucide-react'
import { formatEventDate } from '@/lib/format'
import { Odometer } from './Odometer'

interface TicketCardProps {
  eventType?: string
  eventDate?: string
  guestCount: number
  pricePerPlate: number
  estimatedTotal: number
  selectedCount: number
  className?: string
}

export const TicketCard: React.FC<TicketCardProps> = ({
  eventType,
  eventDate,
  guestCount,
  pricePerPlate,
  estimatedTotal,
  selectedCount,
  className = '',
}) => {
  const hasOccasion = Boolean(eventType && eventType.trim().length > 0)
  const hasDate = Boolean(eventDate && eventDate.trim().length > 0)

  return (
    <div
      className={`relative rounded-[24px] overflow-hidden tactile-glass border border-slate-200/90 shadow-md ${className}`}
    >
      {/* Top Header Strip with Brand Gold Accent */}
      <div className="bg-gradient-to-r from-[var(--brand-900)] via-[var(--brand)] to-[var(--brand-700)] text-[var(--on-brand)] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[var(--brand-2)]" />
          </div>
          <div>
            <span className="font-serif text-sm sm:text-base font-semibold tracking-wide">
              Banquet Booking Pass
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--brand-2)] tracking-wider uppercase">
          <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>TKS Iyengars</span>
        </div>
      </div>

      {/* Ticket Main Details Body */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Dynamic growing fields */}
        <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
          {/* 1. Occasion */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[var(--brand)]" />
              Occasion
            </span>
            <p className="font-bold text-[var(--text-primary)]">
              {hasOccasion ? (
                <span className="text-[var(--brand-900)]">{eventType}</span>
              ) : (
                <span className="text-slate-400 italic font-normal">Choose occasion</span>
              )}
            </p>
          </div>

          {/* 2. Occasion Date */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[var(--brand)]" />
              Event Date
            </span>
            <p className="font-bold text-[var(--text-primary)]">
              {hasDate ? (
                <span>{formatEventDate(eventDate!)}</span>
              ) : (
                <span className="text-slate-400 italic font-normal">Select date</span>
              )}
            </p>
          </div>

          {/* 3. Guest Count */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Utensils className="w-3 h-3 text-[var(--brand)]" />
              Guest Meals
            </span>
            <div className="font-bold text-[var(--text-primary)] flex items-center gap-1">
              <Odometer value={guestCount} />
              <span>plates</span>
            </div>
          </div>

          {/* 4. Selected Delicacies */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Utensils className="w-3 h-3 text-[var(--brand-2-700)]" />
              Menu Items
            </span>
            <p className="font-bold text-[var(--text-primary)]">
              {selectedCount} dishes selected
            </p>
          </div>
        </div>

        {/* Perforated Edge Divider with Left & Right Cutout Notches */}
        <div className="relative my-2">
          {/* Left Cutout */}
          <div className="absolute -left-7 sm:-left-8 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[var(--bg-base)] border-r border-slate-200/90" />
          {/* Perforated Dashed Line */}
          <div className="border-t border-dashed border-slate-300 w-full" />
          {/* Right Cutout */}
          <div className="absolute -right-7 sm:-right-8 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[var(--bg-base)] border-l border-slate-200/90" />
        </div>

        {/* Pricing Breakdown: Price per plate & Estimated Food Total */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Rate per plate
            </span>
            <div className="font-heading font-black text-base text-slate-800 flex items-center">
              <Odometer value={pricePerPlate} prefix="₹" />
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Estimated Food Total
            </span>
            <div className="font-heading font-black text-lg sm:text-xl text-[var(--brand-900)] flex items-center justify-end">
              <Odometer value={estimatedTotal} prefix="₹" />
            </div>
          </div>
        </div>

        {/* Required Notice per specification - ALWAYS visible and unaltered */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] text-[var(--text-muted)] italic leading-normal">
            Delivery fees and customization charges may apply.
          </p>
        </div>
      </div>
    </div>
  )
}
