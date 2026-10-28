import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Minus, 
  Plus, 
  Info, 
  ChevronRight, 
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { z } from 'zod'
import { format, parseISO, isValid } from 'date-fns'

import { useDraftStore } from '@/store/draftStore'
import { formatRupees, formatEventDate } from '@/lib/format'
import { CustomerDesktopShell } from '@/components/customer/CustomerDesktopShell'
import { PageTransition } from '@/components/motion/PageTransition'
import { TicketCard } from '@/components/motion/TicketCard'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

/**
 * Number-roll animated price component for Card 3 and bottom bar
 */
const AnimatedPrice: React.FC<{ amount: number; className?: string }> = ({
  amount,
  className = ''
}) => {
  return (
    <span className={`inline-block font-heading font-black ${className}`}>
      {formatRupees(amount)}
    </span>
  )
}
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'

// Tappable occasion suggestions per specification
const OCCASION_CHIPS = [
  'Wedding',
  'Pooja',
  'Housewarming',
  'Birthday',
  'Naming ceremony',
  'Corporate',
  'Other'
] as const

// Zod validation schema for event requirements
const requirementsSchema = z.object({
  eventType: z
    .string()
    .trim()
    .min(1, 'Please choose or enter an occasion type'),
  eventDate: z
    .string()
    .trim()
    .min(1, 'Please select an occasion date'),
  guestCount: z
    .number()
    .int('Number of plates must be a whole number')
    .min(10, 'Minimum 10 plates required for catering orders'),
  venueAddress: z
    .string()
    .trim()
    .min(5, 'Please provide the delivery / venue address in Mysuru'),
  notes: z.string().optional()
})

type FieldErrors = Partial<Record<'eventType' | 'eventDate' | 'guestCount' | 'venueAddress', string>>

export const RequestPage: React.FC = () => {
  const navigate = useNavigate()

  // Draft store data & actions
  const items = useDraftStore((state) => state.items)
  const requirements = useDraftStore((state) => state.requirements)
  const setRequirements = useDraftStore((state) => state.setRequirements)
  const getPerPlateTotal = useDraftStore((state) => state.getPerPlateTotal)

  const selectedItemsList = Object.values(items)
  const selectedCount = selectedItemsList.length

  // Form state initialized from draftStore
  const [eventType, setEventType] = useState<string>(requirements.eventType || '')
  const [eventDate, setEventDate] = useState<string>(requirements.eventDate || '')
  const [guestCount, setGuestCount] = useState<number | ''>(requirements.guestCount || 100)
  const [venueAddress, setVenueAddress] = useState<string>(requirements.venueAddress || '')
  const [notes, setNotes] = useState<string>(requirements.notes || '')
  const [includeBuffer, setIncludeBuffer] = useState<boolean>(requirements.includeBuffer || false)

  // Inline errors state
  const [errors, setErrors] = useState<FieldErrors>({})

  // Drawer / Popover state for date picker
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false)

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Pricing & Buffer calculations
  const perPlateTotal = getPerPlateTotal()
  const platesCount = typeof guestCount === 'number' && guestCount > 0 ? guestCount : 0
  const tierDiscount = platesCount >= 500 ? 12 : platesCount >= 250 ? 8 : platesCount >= 100 ? 5 : 0
  const discountedPerPlate = tierDiscount > 0 ? Math.round(perPlateTotal * (1 - tierDiscount / 100)) : perPlateTotal
  const bufferPlates = includeBuffer ? Math.max(5, Math.ceil(platesCount * 0.10)) : 0
  const totalPlatesWithBuffer = platesCount + bufferPlates
  const estimatedFoodTotal = discountedPerPlate * (includeBuffer ? totalPlatesWithBuffer : platesCount)

  // Handle number of plates change
  const handlePlatesChange = (val: number | '') => {
    setGuestCount(val)
    if (typeof val === 'number' && val >= 10) {
      setErrors((prev) => ({ ...prev, guestCount: undefined }))
    }
  }

  // Handle validation & proceed to /contact
  const handleContinue = () => {
    const numericPlates = typeof guestCount === 'number' ? guestCount : 0
    const parseResult = requirementsSchema.safeParse({
      eventType,
      eventDate,
      guestCount: numericPlates,
      venueAddress,
      notes
    })

    if (!parseResult.success) {
      const fieldErrors: FieldErrors = {}
      for (const issue of parseResult.error.issues) {
        const field = issue.path[0] as keyof FieldErrors
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      }
      setErrors(fieldErrors)

      // Auto-scroll to first error element
      const firstField = Object.keys(fieldErrors)[0]
      const el = document.getElementById(`field-${firstField}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    // Persist validated data in draftStore
    setRequirements({
      eventType: parseResult.data.eventType,
      eventDate: parseResult.data.eventDate,
      guestCount: parseResult.data.guestCount,
      venueAddress: parseResult.data.venueAddress,
      notes: parseResult.data.notes || '',
      includeBuffer
    })

    // Proceed to Step 3: Contact Details
    navigate('/contact')
  }

  // Date object for shadcn Calendar
  const selectedDateObj = eventDate ? parseISO(eventDate) : undefined
  const isDateValid = selectedDateObj && isValid(selectedDateObj)

  const shouldReduceMotion = useReducedMotion()



  return (
    <CustomerDesktopShell maxWidth="w-full">
      <div className="w-full flex flex-col bg-transparent relative min-h-screen">
        
        {/* ==========================================================
            TOP BAR (glass)
            Back arrow, title 'Your catering details', small 'Step 2 of 3'
            ========================================================== */}
        <header className="sticky top-0 z-10 glass-top-bar px-4 sm:px-6 lg:px-8 py-3 transition-all border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all tap-target-48 text-[var(--text-primary)] -ml-1 cursor-pointer"
                aria-label="Go back to catalogue"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <div>
                <h1 className="font-serif font-bold text-base sm:text-lg lg:text-xl text-[var(--brand-900)] tracking-tight leading-tight">
                  Your catering details
                </h1>
                <p className="text-[11px] text-[var(--text-muted)] font-semibold leading-none pt-0.5">
                  Step 2 of 3 • Customise menu & banquet schedule
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[var(--brand-soft)] text-[var(--brand)] border border-[var(--brand-200)]">
                Step 2 of 3
              </span>
            </div>
          </div>
        </header>

        {/* Thin progress line that fills between steps */}
        <div className="w-full bg-slate-100 h-1 overflow-hidden sticky top-[58px] z-10">
          <motion.div
            className="h-full bg-[var(--brand)]"
            initial={shouldReduceMotion ? { width: '50%' } : { width: '0%' }}
            animate={{ width: '50%' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* ==========================================================
            MAIN CONTENT AREA: 2-COLUMN RESPONSIVE LAYOUT ON DESKTOP
            Left (lg:col-span-7): Event Details Form
            Right (lg:col-span-5): Booking Ticket, Selected Items, Bill
            ========================================================== */}
        <PageTransition direction="forward">
          <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pt-6 pb-36">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* ========================================================
                  LEFT COLUMN: Event Details Form (Card 2)
                  ======================================================== */}
              <div className="lg:col-span-7 space-y-6 order-1">
                {/* On mobile: TicketCard on top */}
                <div className="lg:hidden">
                  <TicketCard
                    eventType={eventType}
                    eventDate={eventDate}
                    guestCount={platesCount}
                    pricePerPlate={perPlateTotal}
                    estimatedTotal={estimatedFoodTotal}
                    selectedCount={selectedCount}
                  />
                </div>

                {/* Section title on desktop */}
                <div className="hidden lg:block pb-2 border-b border-slate-200/60">
                  <h2 className="font-serif font-bold text-2xl text-[var(--brand-900)] tracking-tight">
                    Event & Delivery Requirements
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] font-medium pt-0.5">
                    Provide event timing, approximate meal count, and Mysore delivery address.
                  </p>
                </div>

                {/* CARD 2: 'Event details' form */}
                <div className="content-card p-4 sm:p-6 rounded-[24px] bg-white border border-slate-200/80 shadow-sm space-y-5">
                  <h2 className="font-heading font-black text-base lg:text-lg text-[var(--text-primary)]">
                    Event details
                  </h2>

                  {/* 1. Occasion type */}
                  <div id="field-eventType" className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-primary)] block">
                Occasion type <span className="text-[var(--brand)]">*</span>
              </label>

              {/* Tappable suggestion chips above the input */}
              <div className="flex flex-wrap gap-1.5">
                {OCCASION_CHIPS.map((chip) => {
                  const isMatch = eventType.trim().toLowerCase() === chip.toLowerCase()
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setEventType(chip)
                        setErrors((prev) => ({ ...prev, eventType: undefined }))
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors select-none ${
                        isMatch
                          ? 'bg-[var(--brand)] text-[var(--on-brand)] shadow-xs scale-[1.02]'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent'
                      }`}
                    >
                      {chip}
                    </button>
                  )
                })}
              </div>

              {/* Text input: user may choose chip or type custom */}
              <Input
                type="text"
                value={eventType}
                onChange={(e) => {
                  setEventType(e.target.value)
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, eventType: undefined }))
                  }
                }}
                placeholder="Choose above or type your occasion (e.g. Wedding, Pooja...)"
                className={`h-11 rounded-xl bg-white transition-colors ${
                  errors.eventType ? 'border-[var(--status-cancelled-text)] ring-1 ring-[var(--status-cancelled-text)]' : ''
                }`}
              />
              {errors.eventType && (
                <p className="text-xs text-[var(--status-cancelled-text)] font-semibold flex items-center gap-1 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.eventType}</span>
                </p>
              )}
            </div>

            {/* 2. Occasion date: Popover on desktop, Drawer bottom sheet on mobile/tablet */}
            <div id="field-eventDate" className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-primary)] block">
                Occasion date <span className="text-[var(--brand)]">*</span>
              </label>

              {/* Desktop: Popover anchored to button */}
              {isDesktop ? (
                <div>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={`w-full h-11 px-3.5 rounded-xl border text-left flex items-center justify-between text-xs sm:text-sm transition-all bg-white hover:border-slate-300 active:scale-[0.99] ${
                          errors.eventDate
                            ? 'border-[var(--status-cancelled-text)] ring-1 ring-[var(--status-cancelled-text)]'
                            : 'border-slate-200'
                        }`}
                      >
                        <span
                          className={
                            eventDate && isDateValid
                              ? 'font-bold text-[var(--text-primary)]'
                              : 'text-slate-400 font-normal'
                          }
                        >
                          {eventDate && isDateValid
                            ? formatEventDate(eventDate)
                            : 'Select occasion date (Sat, 14 Nov 2026)'}
                        </span>
                        <CalendarIcon className="w-4 h-4 text-slate-500 shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 bg-white rounded-2xl shadow-xl border border-slate-200" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDateObj}
                        onSelect={(date: Date | undefined) => {
                          if (date) {
                            const formatted = format(date, 'yyyy-MM-dd')
                            setEventDate(formatted)
                            setErrors((prev) => ({ ...prev, eventDate: undefined }))
                            setIsCalendarOpen(false)
                          }
                        }}
                        disabled={(date) => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          return date < today
                        }}
                        className="rounded-xl p-2 bg-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ) : (
                /* Mobile & Tablet: Drawer Bottom Sheet */
                <div>
                  <Drawer open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <DrawerTrigger asChild>
                      <button
                        type="button"
                        className={`w-full h-11 px-3.5 rounded-xl border text-left flex items-center justify-between text-xs sm:text-sm transition-colors bg-white hover:border-slate-300 ${
                          errors.eventDate
                            ? 'border-[var(--status-cancelled-text)] ring-1 ring-[var(--status-cancelled-text)]'
                            : 'border-slate-200'
                        }`}
                      >
                        <span
                          className={
                            eventDate && isDateValid
                              ? 'font-bold text-[var(--text-primary)]'
                              : 'text-slate-400 font-normal'
                          }
                        >
                          {eventDate && isDateValid
                            ? formatEventDate(eventDate)
                            : 'Select occasion date (Sat, 14 Nov 2026)'}
                        </span>
                        <CalendarIcon className="w-4 h-4 text-slate-500 shrink-0" />
                      </button>
                    </DrawerTrigger>

                    <DrawerContent className="p-4 max-w-md mx-auto rounded-t-[24px]">
                      <DrawerHeader className="text-left pb-1">
                        <DrawerTitle className="font-heading font-black text-lg text-[var(--brand-900)]">
                          Select Occasion Date
                        </DrawerTitle>
                        <DrawerDescription className="text-xs text-[var(--text-muted)]">
                          Select the catering date. Past dates are disabled.
                        </DrawerDescription>
                      </DrawerHeader>

                      <div className="flex justify-center py-2">
                        <Calendar
                          mode="single"
                          selected={selectedDateObj}
                          onSelect={(date: Date | undefined) => {
                            if (date) {
                              const formatted = format(date, 'yyyy-MM-dd')
                              setEventDate(formatted)
                              setErrors((prev) => ({ ...prev, eventDate: undefined }))
                              setIsCalendarOpen(false)
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            return date < today
                          }}
                          className="rounded-2xl border border-slate-200/80 p-3 bg-white shadow-xs"
                        />
                      </div>

                      <DrawerFooter className="pt-2">
                        <DrawerClose asChild>
                          <Button
                            variant="outline"
                            className="rounded-full h-11 text-xs font-bold"
                          >
                            Cancel
                          </Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                </div>
              )}

              {errors.eventDate && (
                <p className="text-xs text-[var(--status-cancelled-text)] font-semibold flex items-center gap-1 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.eventDate}</span>
                </p>
              )}
            </div>

            {/* 3. Number of plates: numeric stepper + direct typing */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-primary)] block">
                Number of plates <span className="text-[var(--brand)]">*</span>
              </label>

              {/* Quick Preset Headcount Chips (Craft My Plate / ezCater benchmark) */}
              <div className="flex items-center gap-1.5 flex-wrap pb-1">
                {[50, 100, 250, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePlatesChange(preset)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      guestCount === preset
                        ? 'bg-[var(--brand)] text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {preset} plates
                  </button>
                ))}
              </div>

              {/* Stepper + Input */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const current = typeof guestCount === 'number' ? guestCount : 10
                    handlePlatesChange(Math.max(10, current - 10))
                  }}
                  disabled={typeof guestCount === 'number' && guestCount <= 10}
                  className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 transition-all select-none shrink-0 cursor-pointer"
                  aria-label="Decrease plates by 10"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </button>

                <div id="field-guestCount" className="relative flex-1">
                  <Input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={10}
                    step={1}
                    value={guestCount}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : parseInt(e.target.value, 10)
                      handlePlatesChange(Number.isNaN(val) ? '' : val)
                    }}
                    placeholder="100"
                    className={`h-11 rounded-xl text-center font-heading font-black text-lg bg-white ${
                      errors.guestCount ? 'border-[var(--status-cancelled-text)] ring-1 ring-[var(--status-cancelled-text)]' : ''
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const current = typeof guestCount === 'number' ? guestCount : 0
                    handlePlatesChange(current + 10)
                  }}
                  className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700 transition-all select-none shrink-0 cursor-pointer"
                  aria-label="Increase plates by 10"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Tactile Range Slider */}
              <div className="pt-2">
                <input
                  type="range"
                  min={10}
                  max={1200}
                  step={10}
                  value={typeof guestCount === 'number' ? guestCount : 10}
                  onChange={(e) => handlePlatesChange(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--brand)] cursor-pointer h-2 bg-slate-200 rounded-lg"
                  aria-label="Headcount range slider"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold px-0.5">
                  <span>10 (Intimate)</span>
                  <span>250 (Muhurtham)</span>
                  <span>500 (Grand)</span>
                  <span>1200+ (Royal)</span>
                </div>
              </div>

              {/* Bulk Tier Savings Alert Callout */}
              {tierDiscount > 0 ? (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-2 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-amber-900 font-semibold">
                    <span className="font-black text-[var(--brand)]">{tierDiscount}% Bulk Banquet Discount</span> applied! (Save ₹{perPlateTotal - discountedPerPlate} per plate)
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-xs">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-slate-600 font-medium">
                    Select 100+ plates to unlock <span className="font-bold text-[var(--brand)]">5% bulk banquet savings</span>.
                  </p>
                </div>
              )}

              {/* Kitchen Safety Buffer Assistant (1-Click Toggle - Luxury Catering Standard) */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/60 to-orange-50/60 border border-amber-200/80 space-y-2 mt-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🛡️</span>
                    <div>
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                        Include 10% Kitchen Safety Buffer (+{bufferPlates > 0 ? bufferPlates : Math.max(5, Math.ceil(platesCount * 0.10))} plates)
                      </h4>
                      <p className="text-[11px] text-slate-600 font-medium pt-0.5">
                        Traditional wedding practice: ensures unexpected guests and extra servings are seamlessly covered.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={includeBuffer}
                    onCheckedChange={setIncludeBuffer}
                    className="data-[state=checked]:bg-[var(--brand)]"
                    aria-label="Toggle 10% kitchen safety buffer"
                  />
                </div>
                {includeBuffer && (
                  <p className="text-[10px] text-emerald-800 font-bold bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-300">
                    ✓ Total preparation scaled to {totalPlatesWithBuffer} plates ({platesCount} confirmed + {bufferPlates} safety buffer)
                  </p>
                )}
              </div>

              {errors.guestCount && (
                <p className="text-xs text-[var(--status-cancelled-text)] font-semibold flex items-center gap-1 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.guestCount}</span>
                </p>
              )}
            </div>

            {/* 4. Delivery address: textarea */}
            <div id="field-venueAddress" className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-primary)] block">
                Delivery address <span className="text-[var(--brand)]">*</span>
              </label>
              <Textarea
                value={venueAddress}
                onChange={(e) => {
                  setVenueAddress(e.target.value)
                  if (e.target.value.trim().length >= 5) {
                    setErrors((prev) => ({ ...prev, venueAddress: undefined }))
                  }
                }}
                rows={3}
                autoComplete="street-address"
                placeholder="Full delivery address, hall/residence name, street & area in Mysuru..."
                className={`rounded-xl resize-none bg-white transition-colors ${
                  errors.venueAddress ? 'border-[var(--status-cancelled-text)] ring-1 ring-[var(--status-cancelled-text)]' : ''
                }`}
              />
              {errors.venueAddress && (
                <p className="text-xs text-[var(--status-cancelled-text)] font-semibold flex items-center gap-1 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.venueAddress}</span>
                </p>
              )}
            </div>

            {/* 5. Special instructions: textarea marked 'Optional' */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--text-primary)]">
                  Special instructions
                </label>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Optional
                </span>
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any special preparation preferences, preferred delivery timing, or venue landmarks..."
                className="rounded-xl resize-none bg-white"
              />
                </div>
              </div>
            </div>

              {/* ========================================================
                  RIGHT COLUMN: Ticket, Selected Items & Bill Breakdown
                  ======================================================== */}
              <div className="lg:col-span-5 space-y-5 order-2 lg:sticky lg:top-24">
                
                {/* 1. Desktop Ticket Card */}
                <div className="hidden lg:block">
                  <TicketCard
                    eventType={eventType}
                    eventDate={eventDate}
                    guestCount={platesCount}
                    pricePerPlate={perPlateTotal}
                    estimatedTotal={estimatedFoodTotal}
                    selectedCount={selectedCount}
                  />
                </div>

                {/* 2. CARD 1: Selected items */}
                <div className="content-card p-4 sm:p-5 rounded-[24px] bg-white border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h2 className="font-heading font-black text-sm sm:text-base text-[var(--text-primary)]">
                      Selected items ({selectedCount})
                    </h2>
                    <Link
                      to="/"
                      className="text-xs font-bold text-[var(--brand)] hover:underline flex items-center gap-1 tap-target-48"
                    >
                      <span>Edit items</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>

                  {/* Selected items list */}
                  <div className="space-y-2.5 pt-0.5 max-h-60 overflow-y-auto no-scrollbar">
                    {selectedItemsList.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs sm:text-sm py-0.5"
                      >
                        <span className="font-medium text-[var(--text-primary)] leading-tight pr-2">
                          {item.name}
                        </span>
                        <span className="font-semibold text-[var(--text-muted)] whitespace-nowrap">
                          {formatRupees(item.pricePerPlate)} / plate
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100 pt-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-black text-xs sm:text-sm text-[var(--text-primary)]">
                        Price per plate
                      </span>
                      <span className="font-heading font-black text-sm sm:text-base text-[var(--brand-900)]">
                        {formatRupees(perPlateTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. CARD 3: Bill details */}
                <div className="content-card p-4 sm:p-5 rounded-[24px] bg-white border border-slate-200/80 shadow-sm space-y-3">
                  <h2 className="font-heading font-black text-base text-[var(--text-primary)]">
                    Bill details
                  </h2>

                  <div className="space-y-2 pt-1 text-xs sm:text-sm">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium">Base price per plate</span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {formatRupees(perPlateTotal)}
                      </span>
                    </div>

                    {tierDiscount > 0 && (
                      <div className="flex items-center justify-between text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
                        <span className="font-semibold text-xs">Bulk discount ({tierDiscount}%)</span>
                        <span className="font-black text-xs">
                          {formatRupees(discountedPerPlate)} / plate
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium">Number of meals</span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {platesCount} plates
                      </span>
                    </div>

                    {includeBuffer && (
                      <div className="flex items-center justify-between text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        <span>10% Kitchen safety buffer</span>
                        <span className="font-bold">+{bufferPlates} plates</span>
                      </div>
                    )}

                    {/* Dashed divider */}
                    <div className="border-t border-dashed border-slate-200 my-2.5" />

                    {/* Estimated food total with number-roll animation */}
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="font-heading font-bold text-sm sm:text-base text-[var(--text-primary)]">
                        Estimated food total
                      </span>
                      <span className="text-xl sm:text-2xl text-[var(--brand-900)] tracking-tight">
                        <AnimatedPrice amount={estimatedFoodTotal} />
                      </span>
                    </div>
                  </div>

                  {/* Info row with info icon */}
                  <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-3 mt-3 flex items-start gap-2.5 text-xs text-[var(--text-muted)]">
                    <Info className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
                    <div className="space-y-0.5 leading-snug">
                      <p className="font-bold text-slate-800">
                        Delivery fees and customization charges may apply.
                      </p>
                      <p className="text-[11px] text-slate-500">
                        This is an estimate, not the final quotation.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </main>
        </PageTransition>

        {/* ==========================================================
            STICKY BOTTOM BAR (glass-strong)
            Floating centered pill on desktop, full-width on mobile
            ========================================================== */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-2xl lg:bottom-6 lg:rounded-2xl z-50 pointer-events-auto glass-bottom-bar border-t lg:border border-slate-200/80 shadow-2xl px-4 sm:px-6 py-3 sm:py-3.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:pb-3.5">
          <div className="w-full flex items-center justify-between gap-3">
            {/* Left: Estimated food total */}
            <div className="flex flex-col justify-center">
              <span className="text-[11px] text-[var(--text-muted)] font-medium leading-none">
                Estimated food total
              </span>
              <span className="text-lg sm:text-xl text-[var(--brand-900)] pt-1 leading-tight">
                <AnimatedPrice amount={estimatedFoodTotal} />
              </span>
            </div>

            {/* Right: Large Continue button */}
            <button
              type="button"
              id="continue-request-btn"
              onClick={handleContinue}
              className="h-12 px-7 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] active:scale-[0.98] text-[var(--on-brand)] font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg tap-target-48 transition-colors select-none cursor-pointer"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

      </div>
    </CustomerDesktopShell>
  )
}

export default RequestPage
