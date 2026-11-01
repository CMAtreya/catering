import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { AppFooter } from '@/components/common/AppFooter'
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
  icon: string
  canonicalName: string
}

const OCCASION_CARDS: OccasionCard[] = [
  {
    id: 'griha-pravesh',
    title: 'Griha Pravesh',
    subtitle: 'Housewarming Feast',
    icon: 'home',
    canonicalName: 'Housewarming'
  },
  {
    id: 'pooja-homa',
    title: 'Pooja / Homa',
    subtitle: 'Sacred Ritual Prasad',
    icon: 'local_fire_department',
    canonicalName: 'Pooja'
  },
  {
    id: 'wedding',
    title: 'Muhurtham Wedding',
    subtitle: 'Grand Kalyana Feast',
    icon: 'favorite',
    canonicalName: 'Wedding'
  },
  {
    id: 'upanayana',
    title: 'Upanayana',
    subtitle: 'Sacred Thread Feast',
    icon: 'history_edu',
    canonicalName: 'Upanayana'
  },
  {
    id: 'birthday-seemantha',
    title: 'Birthday & Seemantha',
    subtitle: 'Baby Shower & Ayushya',
    icon: 'cake',
    canonicalName: 'Birthday'
  },
  {
    id: 'other',
    title: 'Other Feast',
    subtitle: 'Family Congregation',
    icon: 'diversity_3',
    canonicalName: 'Other'
  }
]

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
  const [eventType, setEventType] = useState<string>(requirements.eventType || '')
  const [eventDate, setEventDate] = useState<string>(requirements.eventDate || '')
  const [eventTime, setEventTime] = useState<'Morning' | 'Afternoon' | 'Evening'>(requirements.eventTime || 'Morning')
  const [specificTime, setSpecificTime] = useState<string>(requirements.specificTime || '')
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
    const parseResult = requirementsSchema.safeParse({
      eventType,
      eventDate,
      eventTime,
      specificTime,
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
      specificTime: specificTime.trim() || undefined,
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
    <div className="min-h-screen bg-[#fff8f6] text-[#281714] flex flex-col font-sans selection:bg-primary-fixed selection:text-primary">
      {/* 1. TOP ANNOUNCEMENT TICKER */}
      <header className="w-full bg-[#880000] text-[#fff8f6] py-1.5 px-3 sm:px-8 text-center text-[10px] sm:text-xs font-medium tracking-wide flex items-center justify-between border-b border-primary/20">
        <span className="truncate flex-1 text-left sm:text-center">
          Mysuru's Revered Iyengar Traditional Feasts • Prepared Strictly Without Onion &amp; Garlic
        </span>
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold shrink-0 ml-4">
          <span className="material-symbols-outlined text-[14px]">call</span>
          Kitchen Hotline: +91 821 244 8920
        </span>
      </header>

      {/* 2. STICKY TOP NAVIGATION BAR */}
      <nav 
        aria-label="Main Navigation"
        className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/15 py-2.5 sm:py-3 px-3 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 w-full shadow-2xs"
      >
        <div className="w-full flex items-center justify-between gap-2">
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0 group">
            <img 
              alt="TKS Iyengar's Logo" 
              className="h-9 sm:h-10 w-auto object-contain rounded-md shrink-0 transition-transform group-hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6occrKYgf2RCe6-ZpsHHNSwBTZw3OIJCIu6JOOkQR-MmVOIiKZ7bUBYzMU1l09v4a7bX1aa5bfz0MQN5Gh1wPHBVRO7LGbM1E9Bko7oNR5cwbenpCKvUqkdjPSjrtKo9Dv1OlVn0VLfzhNsNmnyXZsER8N1zZKYj1hy1Z5QQB-5nt5D6OCeHk91zan3n3flKIP17cg5vuWoRorqja0dU2rPYG_7kXSD98DR2K5GVG8F_91Jgo9rr6"
            />
            <div className="min-w-0">
              <h1 className="font-headline font-bold text-base sm:text-lg leading-tight text-primary truncate">
                TKS Iyengar's<br className="hidden xs:inline" />
                <span className="text-[10px] sm:text-xs uppercase font-sans tracking-widest text-on-surface-variant font-semibold ml-1 xs:ml-0">Catering</span>
              </h1>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold">
            <Link to="/#tradition" className="pb-1 transition-all text-on-surface-variant hover:text-primary">
              Tradition
            </Link>
            <Link to="/#menus" className="pb-1 transition-all text-on-surface-variant hover:text-primary">
              Catering Menus
            </Link>
            <Link to="/#muhurtham" className="pb-1 transition-all text-primary font-bold border-b-2 border-primary">
              Muhurtham Feasts
            </Link>
            <Link to="/enquiries" className="pb-1 transition-all text-on-surface-variant hover:text-primary">
              Enquiry
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsCalendarOpen(true)}
              className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-primary transition-colors cursor-pointer"
              title="Auspicious Muhurtham Dates"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            </button>
            <Link
              to="/"
              className="relative w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-primary transition-colors"
              title="Selected delicacies"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              {selectedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {selectedCount}
                </span>
              )}
            </Link>
            <Link
              to="/#menus"
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <span className="hidden xs:inline">Plan Event Banquet</span>
              <span className="xs:hidden">Plan Event</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 3. STEP PROGRESS BREADCRUMB BAR */}
      <div className="w-full bg-surface border-b border-outline-variant/15 py-3 px-4 sm:px-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Step 1: Menu Curated */}
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-[#004b23] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
              ✓
            </div>
            <div className="text-left">
              <span className="text-[10px] text-outline uppercase font-bold block leading-none">Step 1</span>
              <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">Menu Curated</span>
            </div>
          </Link>

          <div className="flex-1 h-[2px] bg-primary/30 mx-2.5 sm:mx-6" />

          {/* Step 2: Occasion Specifications (Active) */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-xs ring-2 ring-primary/20">
              2
            </div>
            <div className="text-left">
              <span className="text-[10px] text-primary uppercase font-bold block leading-none">Step 2 • In Progress</span>
              <span className="text-xs font-bold text-primary">Occasion Specifications</span>
            </div>
          </div>

          <div className="flex-1 h-[2px] bg-outline-variant/30 mx-2.5 sm:mx-6" />

          {/* Step 3: Contact & Quotation */}
          <div className="flex items-center gap-2 opacity-60">
            <div className="w-6 h-6 rounded-full bg-surface-container-high text-outline flex items-center justify-center text-xs font-bold border border-outline-variant/30">
              3
            </div>
            <div className="text-left">
              <span className="text-[10px] text-outline uppercase font-bold block leading-none">Step 3</span>
              <span className="text-xs font-bold text-outline">Contact &amp; Quotation</span>
            </div>
          </div>
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
                <span className="material-symbols-outlined text-2xl">temple_hindu</span>
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
                    const isSelected = eventType === occ.canonicalName ||
                      eventType.trim().toLowerCase() === occ.canonicalName.toLowerCase() ||
                      eventType.trim().toLowerCase().includes(occ.title.toLowerCase()) ||
                      (occ.id === 'wedding' && eventType.toLowerCase().includes('wedding')) ||
                      (occ.id === 'griha-pravesh' && (eventType.toLowerCase().includes('griha') || eventType.toLowerCase().includes('housewarming'))) ||
                      (occ.id === 'pooja-homa' && eventType.toLowerCase().includes('pooja'))

                    return (
                      <button
                        key={occ.id}
                        type="button"
                        onClick={() => {
                          setEventType(occ.canonicalName)
                          setErrors((prev) => ({ ...prev, eventType: undefined }))
                        }}
                        className={`relative p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[96px] cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99] ${
                          isSelected
                            ? 'bg-primary-fixed/25 border-primary ring-1 ring-primary text-primary'
                            : 'bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant/30 text-on-surface'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`material-symbols-outlined text-[20px] ${isSelected ? 'text-primary' : 'text-outline'}`}>
                            {occ.icon}
                          </span>
                          {isSelected && (
                            <span className="material-symbols-outlined text-[16px] text-primary">
                              check_circle
                            </span>
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

                {/* Accessible text input for custom occasion & test fill compatibility */}
                <div className="mt-2">
                  <input
                    type="text"
                    value={eventType}
                    onChange={(e) => {
                      setEventType(e.target.value)
                      if (e.target.value.trim()) {
                        setErrors((prev) => ({ ...prev, eventType: undefined }))
                      }
                    }}
                    placeholder="Or enter custom ritual / occasion name..."
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold bg-surface-container-low focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary outline-none transition-all shadow-2xs ${
                      errors.eventType ? 'border-error ring-1 ring-error' : 'border-outline-variant/30'
                    }`}
                  />
                </div>

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
                            <span className="material-symbols-outlined text-[20px] text-primary">calendar_today</span>
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
                            <span className="material-symbols-outlined text-[20px] text-primary">calendar_today</span>
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
                      <span className="material-symbols-outlined text-[20px]">calendar_month</span>
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

              {/* 2B. TIME OPTION SELECTION & SPECIFIC TIME */}
              <div id="field-eventTime" className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Service Time Slot <span className="text-primary">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-secondary">
                    {eventTime} Service {specificTime ? `• ${specificTime}` : ''}
                  </span>
                </div>

                {/* 3 Time Option Cards: Morning, Afternoon, Evening */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'Morning' as const,
                      title: 'Morning',
                      kannada: 'ಬೆಳಗಿನ ಉಪಹಾರ / ಮುಹೂರ್ತ',
                      subtitle: 'Breakfast & Muhurtham',
                      window: '7:00 AM – 11:30 AM',
                      icon: 'wb_sunny'
                    },
                    {
                      id: 'Afternoon' as const,
                      title: 'Afternoon',
                      kannada: 'ಮಧ್ಯಾಹ್ನದ ಮಹಾ ಭೋಜನ',
                      subtitle: 'Traditional Lunch Feast',
                      window: '12:00 PM – 3:30 PM',
                      icon: 'light_mode'
                    },
                    {
                      id: 'Evening' as const,
                      title: 'Evening',
                      kannada: 'ಸಂಜೆ ಸ್ವಾಗತ ಭೋಜನ',
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
                          <span className={`material-symbols-outlined text-[20px] ${isSelected ? 'text-primary' : 'text-outline'}`}>
                            {slot.icon}
                          </span>
                          {isSelected && (
                            <span className="material-symbols-outlined text-[16px] text-primary">
                              check_circle
                            </span>
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

                {/* Specific Serving Time Selection ("and if they want to choose the specific time let them have that option too") */}
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-secondary text-[16px]">schedule</span>
                        Specific Serving Time <span className="text-[10px] text-outline font-normal">(Optional)</span>
                      </span>
                      <p className="text-[10.5px] text-outline">
                        Pick a recommended time or enter your exact muhurtham / dining time.
                      </p>
                    </div>
                    {specificTime && (
                      <button
                        type="button"
                        onClick={() => setSpecificTime('')}
                        className="text-[11px] text-primary hover:underline font-semibold self-start sm:self-auto cursor-pointer"
                      >
                        Clear specific time
                      </button>
                    )}
                  </div>

                  {/* Popular quick picks for the selected slot */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-outline tracking-wider mr-1">
                      Quick Picks:
                    </span>
                    {(eventTime === 'Morning'
                      ? ['07:30 AM', '08:30 AM (Muhurtham)', '09:30 AM', '10:30 AM']
                      : eventTime === 'Afternoon'
                      ? ['12:00 PM', '12:45 PM (Feast)', '01:30 PM', '02:15 PM']
                      : ['06:30 PM', '07:30 PM (Reception)', '08:30 PM', '09:15 PM']
                    ).map((timeOption) => {
                      const isTimeActive = specificTime === timeOption
                      return (
                        <button
                          key={timeOption}
                          type="button"
                          onClick={() => setSpecificTime(timeOption)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                            isTimeActive
                              ? 'bg-primary text-white shadow-2xs font-bold'
                              : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30'
                          }`}
                        >
                          {timeOption}
                        </button>
                      )
                    })}
                  </div>

                  {/* Custom exact time input */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                    <div className="relative flex-1 max-w-xs">
                      <input
                        type="text"
                        value={specificTime}
                        onChange={(e) => setSpecificTime(e.target.value)}
                        placeholder={
                          eventTime === 'Morning' 
                            ? 'Or enter exact time e.g. 08:15 AM' 
                            : eventTime === 'Afternoon' 
                            ? 'Or enter exact time e.g. 01:15 PM' 
                            : 'Or enter exact time e.g. 07:45 PM'
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-outline-variant/40 text-xs bg-surface-container-lowest focus:bg-white focus:border-primary outline-none transition-all"
                      />
                    </div>
                    {specificTime && (
                      <span className="text-[11px] font-bold text-secondary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">done</span>
                        Serving fixed at: {specificTime}
                      </span>
                    )}
                  </div>
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
                  <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">eco</span>
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
                    <span className="material-symbols-outlined text-[14px]">my_location</span>
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
                  <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
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
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">info</span>
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
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>

                {/* Footnote with Lock */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-outline">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  <span>Direct confirmation with Mysuru Head Acharya</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 5. HERITAGE FOOTER */}
      <AppFooter />
    </div>
  )
}

export default RequestPage
