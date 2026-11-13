import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { 
  AlertCircle, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Home, 
  Flame, 
  Heart, 
  Scroll, 
  Cake, 
  Users, 
  Sunrise, 
  SunMedium, 
  Moon, 
  Sun,
  Leaf, 
  MapPin, 
  Info, 
  ArrowRight, 
  Lock, 
  Sparkles,
  Building2
} from 'lucide-react'
import { AppFooter } from '@/components/common/AppFooter'
import { BookingStepper } from '@/components/customer/BookingStepper'
import { CustomerTopNav } from '@/components/customer/CustomerTopNav'
import { z } from 'zod'
import { format, parseISO, isValid } from 'date-fns'

import { useDraftStore } from '@/store/draftStore'
import { INITIAL_ITEMS } from '@/data/mockData'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
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

// Sacred occasion options matching the Mysuru Heritage design
interface OccasionCard {
  id: string
  title: string
  subtitle: string
  canonicalName: string
}

const OCCASION_CARDS: OccasionCard[] = [
  {
    id: 'griha-pravesh',
    title: 'Griha Pravesh',
    subtitle: 'Housewarming Feast',
    canonicalName: 'Housewarming'
  },
  {
    id: 'pooja-homa',
    title: 'Pooja / Homa',
    subtitle: 'Sacred Ritual Prasad',
    canonicalName: 'Pooja'
  },
  {
    id: 'wedding',
    title: 'Muhurtham Wedding',
    subtitle: 'Grand Kalyana Feast',
    canonicalName: 'Wedding'
  },
  {
    id: 'upanayana',
    title: 'Upanayana',
    subtitle: 'Sacred Thread Feast',
    canonicalName: 'Upanayana'
  },
  {
    id: 'birthday-seemantha',
    title: 'Birthday & Seemantha',
    subtitle: 'Baby Shower & Ayushya',
    canonicalName: 'Birthday'
  },
  {
    id: 'other',
    title: 'Other Feast',
    subtitle: 'Family Congregation',
    canonicalName: 'Other'
  }
]

const renderOccasionIcon = (id: string, isSelected: boolean) => {
  const className = `w-5 h-5 ${isSelected ? 'text-primary' : 'text-outline'}`
  switch (id) {
    case 'griha-pravesh':
      return <Home className={className} />
    case 'pooja-homa':
      return <Flame className={className} />
    case 'wedding':
      return <Heart className={className} />
    case 'upanayana':
      return <Scroll className={className} />
    case 'birthday-seemantha':
      return <Cake className={className} />
    case 'other':
      return <Users className={className} />
    default:
      return <Sparkles className={className} />
  }
}

const renderSlotIcon = (id: string, isSelected: boolean) => {
  const className = `w-5 h-5 ${isSelected ? 'text-primary' : 'text-outline'}`
  switch (id) {
    case 'Morning':
      return <Sunrise className={className} />
    case 'Afternoon':
      return <SunMedium className={className} />
    case 'Evening':
      return <Moon className={className} />
    default:
      return <Sun className={className} />
  }
}

// Delivery validation schema

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
  eventTime: z.enum(['Morning', 'Afternoon', 'Evening']).default('Morning'),
  specificTime: z.string().optional(),
  guestCount: z
    .number()
    .int('Number of plates must be a whole number')
    .min(10, 'Minimum 10 plates required for catering orders'),
  venueAddress: z
    .string()
    .trim()
    .min(5, 'Please provide the delivery address in Mysuru'),
  notes: z.string().optional()
})

type FieldErrors = Partial<Record<'eventType' | 'eventDate' | 'guestCount' | 'venueAddress', string>>

// Helper to resolve occasion card and canonical text
const resolveOccasionState = (savedType: string) => {
  if (!savedType) return { cardId: 'griha-pravesh', eventType: 'Griha Pravesh', customText: '' }
  const s = savedType.toLowerCase()
  if (s.includes('griha') || s.includes('housewarming')) {
    return { cardId: 'griha-pravesh', eventType: 'Griha Pravesh', customText: '' }
  }
  if (s.includes('pooja') || s.includes('homa') || s.includes('homam')) {
    return { cardId: 'pooja-homa', eventType: 'Pooja / Homa', customText: '' }
  }
  if (s.includes('wedding') || s.includes('muhurtham') || s.includes('kalyana')) {
    return { cardId: 'wedding', eventType: 'Muhurtham Wedding', customText: '' }
  }
  if (s.includes('upanayana') || s.includes('thread')) {
    return { cardId: 'upanayana', eventType: 'Upanayana', customText: '' }
  }
  if (s.includes('birthday') || s.includes('seemantha') || s.includes('baby') || s.includes('ayushya')) {
    return { cardId: 'birthday-seemantha', eventType: 'Birthday & Seemantha', customText: '' }
  }
  if (s === 'other' || s.trim()) {
    return { cardId: 'other', eventType: savedType, customText: savedType === 'Other' ? '' : savedType }
  }
  return { cardId: 'griha-pravesh', eventType: 'Griha Pravesh', customText: '' }
}

export const RequestPage: React.FC = () => {
  const navigate = useNavigate()

  // Draft store data & actions
  const items = useDraftStore((state) => state.items)
  const requirements = useDraftStore((state) => state.requirements)
  const setRequirements = useDraftStore((state) => state.setRequirements)
  const getPerPlateTotal = useDraftStore((state) => state.getPerPlateTotal)

  const selectedItemsList = Object.values(items)
  const selectedCount = selectedItemsList.length
  const displayItems = selectedCount > 0 ? selectedItemsList : INITIAL_ITEMS.slice(0, 5)

  // Form state initialized from draftStore
  const initialOccasion = resolveOccasionState(requirements.eventType || '')
  const [selectedCardId, setSelectedCardId] = useState<string>(initialOccasion.cardId)
  const [eventType, setEventType] = useState<string>(initialOccasion.eventType)
  const [customOccasion, setCustomOccasion] = useState<string>(initialOccasion.customText)

  const [eventDate, setEventDate] = useState<string>(requirements.eventDate || '')
  const [eventTime, setEventTime] = useState<'Morning' | 'Afternoon' | 'Evening'>(requirements.eventTime || 'Morning')
  const [guestCount, setGuestCount] = useState<number | ''>(requirements.guestCount || 100)
  const [venueAddress, setVenueAddress] = useState<string>(requirements.venueAddress || '')
  const [notes, setNotes] = useState<string>(requirements.notes || '')

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

  // Pricing calculations
  const perPlateTotal = getPerPlateTotal() > 0 ? getPerPlateTotal() : 285
  const platesCount = typeof guestCount === 'number' && guestCount > 0 ? guestCount : 100
  const tierDiscount = platesCount >= 500 ? 12 : platesCount >= 250 ? 8 : platesCount >= 100 ? 5 : 0
  const discountedPerPlate = tierDiscount > 0 ? Math.round(perPlateTotal * (1 - tierDiscount / 100)) : perPlateTotal
  const estimatedFoodTotal = discountedPerPlate * platesCount

  // Handle plates change
  const handlePlatesChange = (val: number | '') => {
    setGuestCount(val)
    if (typeof val === 'number' && val >= 10) {
      setErrors((prev) => ({ ...prev, guestCount: undefined }))
    }
  }

  // Handle validation & proceed to /contact
  const handleContinue = () => {
    const numericPlates = typeof guestCount === 'number' ? guestCount : 0
    const finalEventType = selectedCardId === 'other'
      ? (customOccasion.trim() || 'Other Feast')
      : eventType

    const parseResult = requirementsSchema.safeParse({
      eventType: finalEventType,
      eventDate,
      eventTime,
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
      eventTime: parseResult.data.eventTime,
      specificTime: undefined,
      guestCount: parseResult.data.guestCount,
      venueAddress: parseResult.data.venueAddress,
      notes: parseResult.data.notes || '',
      includeBuffer: false
    })

    // Proceed to Step 3: Contact Details
    navigate('/contact')
  }

  // Date parsing calculation
  const selectedDateObj = eventDate ? parseISO(eventDate) : undefined
  const isDateValid = selectedDateObj && isValid(selectedDateObj)

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.52,
        ease: [0.16, 1, 0.3, 1] // Fast in, slow out (deceleration curve)
      }}
      className="min-h-screen bg-[#fff8f6] text-[#281714] flex flex-col font-sans selection:bg-primary-fixed selection:text-primary"
    >
      {/* UNIFIED STICKY TOP NAVIGATION BAR */}
      <CustomerTopNav activeNavTab="muhurtham" />

      {/* 3. STEP PROGRESS STEPPER */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 pt-4 pb-2">
        <div className="max-w-7xl mx-auto">
          <BookingStepper currentStep={2} />
        </div>
      </div>

      {/* 4. MAIN SPECIFICATIONS & ESTIMATE SECTION */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title & Purity Guarantee Banner */}
          <div className="mb-6 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/20 text-on-secondary-fixed border border-secondary/30 text-xs font-bold mb-2">
                <span>MYSURU HERITAGE BANQUETS</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#006632]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006632]" />
                  Pure Vegetarian
                </span>
              </div>
              <h2 className="font-headline font-black text-3xl sm:text-4xl text-primary tracking-tight">
                Tell us about your occasion
              </h2>
              <p className="text-sm text-on-surface-variant mt-1.5 font-normal">
                Mysuru Muhurtham Banquet Planning, Brahmin Parisevane &amp; Logistics Customization.
              </p>
            </div>

            {/* Purity Guarantee Callout Banner */}
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-3.5 shadow-2xs">
              <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl text-primary flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-headline font-bold text-sm sm:text-base text-primary">
                    100% Sattvic &amp; Pure Iyengar Tradition Guarantee
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#006632]/10 text-[#006632] border border-[#006632]/25 text-[10px] font-bold">
                    Purity Guaranteed
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant/90 mt-1 leading-relaxed">
                  Every dish is strictly prepared strictly sans onion &amp; garlic using cold-pressed gingelly oil, pure A2 Gir cow ghee, and hand-ground temple spice mixes from Srirangapatna &amp; Melkote traditions.
                </p>
              </div>
            </div>
          </div>

          {/* TWO COLUMN GRID: Left = Form, Right = Curated Delicacies & Cost Estimate */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* ========================================================
                LEFT COLUMN (Form Specifications - 7 Cols on LG)
                ======================================================== */}
            <div className="lg:col-span-7 bg-surface-container-lowest rounded-3xl p-5 sm:p-7 border border-outline-variant/20 shadow-xs space-y-6">
              
              {/* 1. SELECT OCCASION TYPE */}
              <div id="field-eventType" className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Select Occasion Type <span className="text-primary">*</span>
                  </label>
                  <span className="text-[11px] font-medium text-outline">
                    Custom rituals accommodated
                  </span>
                </div>

                {/* 6 Cards Grid (Matching exact layout from screenshot) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {OCCASION_CARDS.map((occ) => {
                    const isSelected = selectedCardId === occ.id

                    return (
                      <button
                        key={occ.id}
                        type="button"
                        onClick={() => {
                          setSelectedCardId(occ.id)
                          setErrors((prev) => ({ ...prev, eventType: undefined }))
                          if (occ.id === 'other') {
                            setEventType(customOccasion.trim() ? customOccasion.trim() : 'Other Feast')
                          } else {
                            setEventType(occ.title)
                          }
                        }}
                        className={`relative p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[96px] cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99] ${
                          isSelected
                            ? 'bg-primary-fixed/25 border-primary ring-1 ring-primary text-primary'
                            : 'bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant/30 text-on-surface'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          {renderOccasionIcon(occ.id, isSelected)}
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="mt-2">
                          <span className="font-headline font-bold text-xs sm:text-sm block leading-tight">
                            {occ.title}
                          </span>
                          <span className="text-[10px] text-outline block mt-0.5">
                            {occ.subtitle}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Custom occasion input: ONLY displayed when "Other Feast" is selected */}
                <AnimatePresence>
                  {selectedCardId === 'other' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden space-y-1"
                    >
                      <label className="text-[11px] font-semibold text-slate-700 block">
                        Specify Custom Ritual or Occasion Name:
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={customOccasion}
                        onChange={(e) => {
                          const val = e.target.value
                          setCustomOccasion(val)
                          setEventType(val.trim() ? val.trim() : 'Other Feast')
                          if (val.trim()) {
                            setErrors((prev) => ({ ...prev, eventType: undefined }))
                          }
                        }}
                        placeholder="e.g. Shashti Poorthi, Ayushya Homam, Naming Ceremony..."
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold bg-surface-container-low focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary outline-none transition-all shadow-2xs ${
                          errors.eventType ? 'border-error ring-1 ring-error' : 'border-outline-variant/30'
                        }`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {errors.eventType && (
                  <p className="text-xs text-error font-semibold flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.eventType}</span>
                  </p>
                )}
              </div>

              {/* 2. EVENT DATE */}
              <div id="field-eventDate" className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Event Date <span className="text-primary">*</span>
                  </label>
                  <span className="text-[11px] font-medium text-outline">
                    Advance Booking Desk
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                  {/* Left: Interactive Date Button */}
                  <div className="relative">
                    {isDesktop ? (
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={`w-full h-12 px-3.5 rounded-xl border text-left flex items-center justify-between text-xs sm:text-sm transition-all bg-surface-container-lowest hover:border-primary/40 cursor-pointer shadow-2xs ${
                              errors.eventDate ? 'border-error ring-1 ring-error' : 'border-outline-variant/30'
                            }`}
                          >
                            <span className={eventDate && isDateValid ? 'font-bold text-primary' : 'text-outline font-medium'}>
                              {eventDate && isDateValid ? format(parseISO(eventDate), 'dd/MM/yyyy') : 'DD/MM/YYYY'}
                            </span>
                            <CalendarIcon className="w-5 h-5 text-primary" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2 bg-white rounded-2xl shadow-xl border border-slate-200 z-50" align="start">
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
                    ) : (
                      <Drawer open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <DrawerTrigger asChild>
                          <button
                            type="button"
                            className={`w-full h-12 px-3.5 rounded-xl border text-left flex items-center justify-between text-xs sm:text-sm transition-all bg-surface-container-lowest hover:border-primary/40 cursor-pointer shadow-2xs ${
                              errors.eventDate ? 'border-error ring-1 ring-error' : 'border-outline-variant/30'
                            }`}
                          >
                            <span className={eventDate && isDateValid ? 'font-bold text-primary' : 'text-outline font-medium'}>
                              {eventDate && isDateValid ? format(parseISO(eventDate), 'dd/MM/yyyy') : 'DD/MM/YYYY'}
                            </span>
                            <CalendarIcon className="w-5 h-5 text-primary" />
                          </button>
                        </DrawerTrigger>
                        <DrawerContent className="p-4 max-w-md mx-auto rounded-t-[24px] bg-white">
                          <DrawerHeader className="text-left pb-1">
                            <DrawerTitle className="font-headline font-black text-lg text-primary">
                              Select Event Date
                            </DrawerTitle>
                            <DrawerDescription className="text-xs text-outline">
                              Choose the catering banquet date.
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
                              className="rounded-2xl border border-outline-variant/20 p-3 bg-white shadow-xs"
                            />
                          </div>
                          <DrawerFooter className="pt-2">
                            <DrawerClose asChild>
                              <Button variant="outline" className="rounded-full h-11 text-xs font-bold">
                                Close
                              </Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                    )}

                    {/* Hidden accessible input for direct test filling */}
                    <input
                      type="text"
                      value={eventDate}
                      onChange={(e) => {
                        setEventDate(e.target.value)
                        setErrors((prev) => ({ ...prev, eventDate: undefined }))
                      }}
                      placeholder="YYYY-MM-DD"
                      className="sr-only"
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Right: Date Selection Status Card */}
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary-container/30 text-secondary border border-secondary/20 flex items-center justify-center shrink-0">
                      <CalendarIcon className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-headline font-bold text-xs sm:text-sm text-primary block truncate">
                        {eventDate && isDateValid ? format(parseISO(eventDate), 'EEEE, dd MMMM yyyy') : 'No Date Chosen Yet'}
                      </span>
                    </div>
                  </div>
                </div>

                {errors.eventDate && (
                  <p className="text-xs text-error font-semibold flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.eventDate}</span>
                  </p>
                )}
              </div>

              {/* 2B. TIME OPTION SELECTION */}
              <div id="field-eventTime" className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Service Time Slot <span className="text-primary">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-secondary">
                    {eventTime} Service
                  </span>
                </div>

                {/* 3 Time Option Cards: Morning, Afternoon, Evening */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'Morning' as const,
                      title: 'Morning',
                      subtitle: 'Breakfast & Muhurtham',
                      window: '7:00 AM – 11:30 AM',
                      icon: 'wb_sunny'
                    },
                    {
                      id: 'Afternoon' as const,
                      title: 'Afternoon',
                      subtitle: 'Traditional Lunch Feast',
                      window: '12:00 PM – 3:30 PM',
                      icon: 'light_mode'
                    },
                    {
                      id: 'Evening' as const,
                      title: 'Evening',
                      subtitle: 'Reception Dinner',
                      window: '6:30 PM – 10:30 PM',
                      icon: 'nights_stay'
                    }
                  ].map((slot) => {
                    const isSelected = eventTime === slot.id
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setEventTime(slot.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-surface-container-high border-primary ring-1 ring-primary shadow-2xs'
                            : 'bg-surface-container-lowest border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container-low'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          {renderSlotIcon(slot.id, isSelected)}
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <span className={`font-headline font-bold text-xs sm:text-sm block ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                          {slot.title}
                        </span>
                        <span className="text-[10px] text-secondary font-medium block">
                          {slot.subtitle}
                        </span>
                        <span className="text-[10px] text-outline block mt-0.5 font-mono">
                          {slot.window}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 3. NUMBER OF BANQUETING PLATES */}
              <div id="field-guestCount" className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Number of Banqueting Plates <span className="text-primary">*</span>
                  </label>
                  <span className="text-[11px] font-medium text-outline">
                    Min order: 25 leaves
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Stepper with number input */}
                  <div className="flex items-center border border-outline-variant/30 rounded-xl bg-surface-container-lowest p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handlePlatesChange(Math.max(10, (typeof guestCount === 'number' ? guestCount : 25) - 25))}
                      className="w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-primary font-bold transition-colors cursor-pointer"
                      aria-label="Decrease plates"
                    >
                      -
                    </button>
                    <div className="flex-1 px-3 flex items-center justify-center gap-1 min-w-[110px]">
                      <input
                        type="number"
                        min={10}
                        value={guestCount}
                        onChange={(e) => handlePlatesChange(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                        className="w-14 font-headline font-bold text-center text-base sm:text-lg text-primary bg-transparent outline-none border-none p-0 focus:ring-0"
                      />
                      <span className="text-xs text-outline font-semibold">Plates</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePlatesChange((typeof guestCount === 'number' ? guestCount : 25) + 25)}
                      className="w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-primary font-bold transition-colors cursor-pointer"
                      aria-label="Increase plates"
                    >
                      +
                    </button>
                  </div>

                  {/* Preset Chips (25, 50, 100, 200, 500+) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[25, 50, 100, 200, 500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handlePlatesChange(preset)}
                        className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                          guestCount === preset
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/20'
                        }`}
                      >
                        {preset}{preset === 500 ? '+' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leaf Setup & Parisevane Banner */}
                <div className="p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant/20 flex items-start gap-2.5 text-xs text-on-surface-variant">
                  <Leaf className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Includes dedicated <span className="font-bold text-primary">plantain leaf lay-out setup</span> and certified traditional <span className="font-bold text-primary">Iyengar parisevane servers</span> in veshthi &amp; angavastram.
                  </p>
                </div>

                {errors.guestCount && (
                  <p className="text-xs text-error font-semibold flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.guestCount}</span>
                  </p>
                )}
              </div>

              {/* 4. DELIVERY ADDRESS */}
              <div id="field-venueAddress" className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Delivery Address <span className="text-primary">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setVenueAddress('Sri Raghavendra Kalyana Mantapa, 4th Main, Jayalakshmipuram, Mysuru - 570012')
                      setErrors((prev) => ({ ...prev, venueAddress: undefined }))
                    }}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Detect Mysuru Location</span>
                  </button>
                </div>

                <textarea
                  value={venueAddress}
                  onChange={(e) => {
                    setVenueAddress(e.target.value)
                    if (e.target.value.trim().length >= 5) {
                      setErrors((prev) => ({ ...prev, venueAddress: undefined }))
                    }
                  }}
                  placeholder="Sri Raghavendra Kalyana Mantapa, 4th Main, Jayalakshmipuram, Mysuru - 570012"
                  rows={3}
                  className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm font-medium bg-surface-container-lowest focus:ring-1 focus:ring-primary outline-none transition-all shadow-2xs resize-none ${
                    errors.venueAddress ? 'border-error ring-1 ring-error' : 'border-outline-variant/30'
                  }`}
                />

                {/* Delivery Verification Badge */}
                <div className="p-2.5 rounded-xl bg-tertiary-container/10 border border-tertiary-container/20 flex items-center gap-2 text-xs text-tertiary font-bold">
                  <CheckCircle2 className="w-4 h-4 text-tertiary" />
                  <span>Mysuru city delivery &amp; Insulated brass hot-pack live transport verified</span>
                </div>

                {errors.venueAddress && (
                  <p className="text-xs text-error font-semibold flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.venueAddress}</span>
                  </p>
                )}
              </div>

              {/* 5. SPECIAL INSTRUCTIONS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Special Instructions <span className="text-outline font-normal">(Optional)</span>
                  </label>
                  <span className="text-[11px] font-medium text-outline">
                    Chef &amp; serving notes
                  </span>
                </div>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any special dietary preferences, batch serving requests, leaf service notes, or timing instructions for our kitchen crew..."
                  rows={3}
                  className="w-full p-3.5 rounded-2xl border border-outline-variant/30 text-xs sm:text-sm font-medium bg-surface-container-lowest focus:ring-1 focus:ring-primary outline-none transition-all shadow-2xs resize-none"
                />
              </div>
            </div>

            {/* ========================================================
                RIGHT COLUMN (Curated Delicacies & Cost Estimate - 5 Cols)
                ======================================================== */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              
              {/* CARD 1: CURATED DELICACIES */}
              <div className="bg-surface-container-lowest rounded-3xl p-5 sm:p-6 border border-outline-variant/20 shadow-xs space-y-4">
                <div className="flex items-start justify-between border-b border-outline-variant/15 pb-3">
                  <div>
                    <h3 className="font-headline font-bold text-base text-primary">
                      Curated Delicacies
                    </h3>
                    <p className="text-xs text-outline font-medium mt-0.5">
                      Sattvic Muhurtham Thali Menu
                    </p>
                  </div>
                  <Link
                    to="/"
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Edit Menu</span>
                    <span className="text-[11px]">🖊</span>
                  </Link>
                </div>

                {/* Selected Delicacy Items List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {displayItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.image || '/default-dish.svg'}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-outline-variant/15"
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).src = '/default-dish.svg'
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="font-headline font-bold text-xs sm:text-sm text-primary truncate">
                            {item.name}
                          </h4>
                          <p className="text-[10px] text-outline truncate">
                            {('heritageTag' in item && (item as any).heritageTag) || 'Melkote Kovil recipe'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-outline uppercase px-2 py-0.5 rounded-full bg-surface-container-low shrink-0">
                        Included
                      </span>
                    </div>
                  ))}
                </div>

                {/* Base rate per leaf footer */}
                <div className="pt-3 border-t border-outline-variant/15 flex items-center justify-between">
                  <span className="text-xs font-bold text-outline">Base Rate Per Leaf:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline font-black text-base text-primary">
                      ₹{discountedPerPlate}
                    </span>
                    <span className="text-[11px] text-outline font-medium">/ plate</span>
                  </div>
                </div>
              </div>

              {/* CARD 2: BANQUET COST ESTIMATE */}
              <div className="bg-surface-container-lowest rounded-3xl p-5 sm:p-6 border border-outline-variant/20 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
                  <h3 className="font-headline font-bold text-base text-primary">
                    Banquet Cost Estimate
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/30 text-on-secondary-fixed text-[10px] font-bold border border-secondary/30">
                    Tithi Locked
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-on-surface-variant font-medium">
                    <span>Banqueting Headcount:</span>
                    <span className="font-bold text-primary">{platesCount} plates</span>
                  </div>
                  <div className="flex items-center justify-between text-on-surface-variant font-medium">
                    <span>Standard Leaf Fare:</span>
                    <span className="font-bold text-primary">{platesCount} × ₹{discountedPerPlate}</span>
                  </div>
                  <div className="flex items-center justify-between text-on-surface-variant font-medium">
                    <span>Parisevane Brahmin Servers:</span>
                    <span className="font-bold text-tertiary">Complimentary</span>
                  </div>
                  <div className="flex items-center justify-between text-on-surface-variant font-medium">
                    <span>Insulated Transport Packaging:</span>
                    <span className="font-bold text-tertiary">Included</span>
                  </div>
                </div>

                {/* Estimated Food Total */}
                <div className="pt-3 border-t border-outline-variant/15">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                      ESTIMATED FOOD TOTAL
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      Zero Hidden Fees
                    </span>
                  </div>
                  <div className="font-headline font-black text-3xl text-primary mt-1">
                    ₹{estimatedFoodTotal.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Disclaimer info note */}
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-2 text-[11px] text-on-surface-variant leading-relaxed">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>
                    Estimated Food Total: <span className="font-bold text-primary">₹{estimatedFoodTotal.toLocaleString('en-IN')}</span>. Delivery transit logistics and special ritual customizations calculated at final confirmation. No advance deposit needed now.
                  </p>
                </div>

                {/* Primary Proceed CTA button */}
                <button
                  id="continue-request-btn"
                  type="button"
                  onClick={handleContinue}
                  className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-primary to-[#b30a05] text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Contact Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Footnote with Lock */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-outline">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Direct confirmation with Mysuru Head Acharya</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 5. HERITAGE FOOTER */}
      <AppFooter />
    </motion.div>
  )
}

export default RequestPage
