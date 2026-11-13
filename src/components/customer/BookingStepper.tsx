import React from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useDraftStore } from '@/store/draftStore'

export interface BookingStepperProps {
  currentStep: 1 | 2 | 3 | 4
  className?: string
  isInteractive?: boolean
}

export const BookingStepper: React.FC<BookingStepperProps> = ({ 
  currentStep, 
  className = '',
  isInteractive = true
}) => {
  const draftItems = useDraftStore((s) => s.items)
  const draftRequirements = useDraftStore((s) => s.requirements)

  const itemsCount = Object.keys(draftItems).length || 4
  const occasion = draftRequirements.eventType || 'Traditional Feast'
  const guestCount = draftRequirements.guestCount || 100

  // On completed submission (Step 4) or when isInteractive is false, steps must be non-clickable status indicators
  const canNavigate = isInteractive && currentStep < 4

  return (
    <div className={`bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-xs ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {/* ================= STEP 1: MENU CURATED ================= */}
        {currentStep === 1 ? (
          <div className="flex items-center gap-3.5 bg-surface-container-low/60 rounded-xl px-3 py-2 -my-2 border border-primary/20">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              <span>1</span>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold">
                Current Step
              </span>
              <h2 className="text-sm font-bold text-primary">Menu Curated</h2>
              <p className="text-xs text-secondary">{itemsCount} Traditional Delicacies</p>
            </div>
          </div>
        ) : canNavigate ? (
          <Link to="/" className="flex items-center gap-3.5 group hover:opacity-85 transition-opacity cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-[#8B0A00] shrink-0 shadow-2xs">
              <Check className="w-5 h-5 text-[#8B0A00]" />
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">Step 1</p>
              <h2 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">Menu Curated</h2>
              <p className="text-xs text-secondary">{itemsCount} Traditional Delicacies</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3.5 cursor-default select-none">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-[#8B0A00] shrink-0 shadow-2xs">
              <Check className="w-5 h-5 text-[#8B0A00]" />
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">Step 1</p>
              <h2 className="text-sm font-semibold text-on-surface">Menu Curated</h2>
              <p className="text-xs text-secondary">{itemsCount} Traditional Delicacies</p>
            </div>
          </div>
        )}

        {/* ================= STEP 2: OCCASION VERIFIED ================= */}
        {currentStep === 2 ? (
          <div className="flex items-center gap-3.5 border-t md:border-t-0 md:border-l border-outline-variant/50 pt-3 md:pt-0 md:pl-6 bg-surface-container-low/60 rounded-xl px-3 py-2 -my-2 border border-primary/20">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              <span>2</span>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold">
                Current Step
              </span>
              <h2 className="text-sm font-bold text-primary">Occasion Verified</h2>
              <p className="text-xs text-secondary">{occasion} • {guestCount} Leaves</p>
            </div>
          </div>
        ) : currentStep > 2 ? (
          canNavigate ? (
            <Link
              to="/request"
              className="flex items-center gap-3.5 border-t md:border-t-0 md:border-l border-outline-variant/50 pt-3 md:pt-0 md:pl-6 group hover:opacity-85 transition-opacity cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-[#8B0A00] shrink-0 shadow-2xs">
                <Check className="w-5 h-5 text-[#8B0A00]" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Step 2</p>
                <h2 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">Occasion Verified</h2>
                <p className="text-xs text-secondary">{occasion} • {guestCount} Leaves</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3.5 border-t md:border-t-0 md:border-l border-outline-variant/50 pt-3 md:pt-0 md:pl-6 cursor-default select-none">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-[#8B0A00] shrink-0 shadow-2xs">
                <Check className="w-5 h-5 text-[#8B0A00]" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Step 2</p>
                <h2 className="text-sm font-semibold text-on-surface">Occasion Verified</h2>
                <p className="text-xs text-secondary">{occasion} • {guestCount} Leaves</p>
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center gap-3.5 border-t md:border-t-0 md:border-l border-outline-variant/50 pt-3 md:pt-0 md:pl-6 opacity-60">
            <div className="w-10 h-10 rounded-full bg-surface-container-high text-outline flex items-center justify-center font-bold text-sm shrink-0 border border-outline-variant/40">
              <span>2</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">Step 2</p>
              <h2 className="text-sm font-semibold text-on-surface">Occasion Specifications</h2>
              <p className="text-xs text-secondary">Date, Time &amp; Leaves</p>
            </div>
          </div>
        )}

        {/* ================= STEP 3: CONTACT & VERIFICATION ================= */}
        {currentStep === 3 ? (
          <div className="flex items-center gap-3.5 border-t md:border-t-0 md:border-l border-outline-variant/50 pt-3 md:pt-0 md:pl-6 bg-surface-container-low/60 rounded-xl px-3 py-2 -my-2 border border-primary/20">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              <span>3</span>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold">
                Current Step
              </span>
              <h2 className="text-sm font-bold text-primary">Contact &amp; Verification</h2>
              <p className="text-xs text-on-surface-variant">Prabandhakar Direct Connect</p>
            </div>
          </div>
        ) : currentStep > 3 ? (
          <div className="flex items-center gap-3.5 border-t md:border-t-0 md:border-l border-outline-variant/50 pt-3 md:pt-0 md:pl-6 cursor-default select-none">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300 flex items-center justify-center text-[#45070B] shrink-0 shadow-xs ring-1 ring-amber-200">
              <Check className="w-5 h-5 text-[#45070B] stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">Step 3</p>
              <h2 className="text-sm font-bold text-primary">Booking Confirmed</h2>
              <p className="text-xs text-secondary">Enquiry Recorded</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3.5 border-t md:border-t-0 md:border-l border-outline-variant/50 pt-3 md:pt-0 md:pl-6 opacity-60">
            <div className="w-10 h-10 rounded-full bg-surface-container-high text-outline flex items-center justify-center font-bold text-sm shrink-0 border border-outline-variant/40">
              <span>3</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">Step 3</p>
              <h2 className="text-sm font-semibold text-on-surface">Contact &amp; Verification</h2>
              <p className="text-xs text-secondary">Prabandhakar Direct Connect</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingStepper

