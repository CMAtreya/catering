import React from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

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
  const canNavigate = isInteractive && currentStep < 4

  const steps = [
    { number: 1, label: '1. Menu Curated', route: '/' },
    { number: 2, label: '2. Occasion Verified', route: '/request' },
    { number: 3, label: '3. Confirmed & Assigned', route: '/contact' }
  ]

  return (
    <div className={`w-full flex justify-center py-2 ${className}`}>
      <nav 
        aria-label="Progress Stepper" 
        className="inline-flex items-center gap-2.5 sm:gap-4 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-2xs select-none max-w-full overflow-x-auto no-scrollbar"
      >
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.number || (currentStep === 4 && step.number === 3)
          const isCurrent = currentStep === step.number && currentStep < 4

          const content = (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {isCompleted ? (
                <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-600/30 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </span>
              ) : isCurrent ? (
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-2xs ring-2 ring-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed" />
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full border-2 border-outline/30 bg-transparent shrink-0" aria-hidden="true" />
              )}

              <span className={`text-[11px] sm:text-xs whitespace-nowrap ${
                isCompleted 
                  ? 'text-on-surface font-semibold' 
                  : isCurrent 
                  ? 'text-primary font-bold' 
                  : 'text-on-surface-variant/50 font-medium'
              }`}>
                {step.label}
              </span>
            </div>
          )

          return (
            <React.Fragment key={step.number}>
              {canNavigate && step.number < currentStep ? (
                <Link to={step.route} className="hover:opacity-85 transition-opacity cursor-pointer">
                  {content}
                </Link>
              ) : (
                content
              )}

              {idx < steps.length - 1 && (
                <span className={`w-4 sm:w-8 h-[1.5px] shrink-0 ${
                  isCompleted ? 'bg-outline-variant/80' : 'bg-outline-variant/40'
                }`} aria-hidden="true" />
              )}
            </React.Fragment>
          )
        })}
      </nav>
    </div>
  )
}

export default BookingStepper
