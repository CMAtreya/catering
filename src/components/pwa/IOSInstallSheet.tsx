import React from 'react'
import { X, Sparkles } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from '@/components/ui/sheet'

interface IOSInstallSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appName?: string
}

export const IOSInstallSheet: React.FC<IOSInstallSheetProps> = ({
  open,
  onOpenChange,
  appName = 'TKS Catering'
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={false} className="max-w-md mx-auto rounded-t-[28px] p-0 bg-white border-t border-slate-200/90 shadow-2xl">
        {/* Header */}
        <SheetHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-xs p-1.5 flex items-center justify-center border border-slate-100 shrink-0">
              <img
                src="/logo-128.webp"
                alt="TKS Logo"
                width="36"
                height="36"
                decoding="async"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <SheetTitle className="font-heading font-black text-base text-[var(--brand-900)] leading-tight text-left">
                Install on iPhone or iPad
              </SheetTitle>
              <p className="text-xs text-[var(--text-muted)] font-medium text-left">
                Fast home screen access via Safari
              </p>
            </div>
          </div>

          <SheetClose asChild>
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </SheetClose>
        </SheetHeader>

        {/* 3 Step Visual Guide with CSS Shape Illustrations */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Step 1: Tap Share */}
          <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            {/* CSS Shape: Safari Share Icon (Square with arrow pointing up) */}
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 relative">
              <div className="relative w-5 h-5 flex items-center justify-center">
                {/* Square Box Container */}
                <div className="absolute bottom-0 w-4.5 h-3.5 border-2 border-slate-700 rounded-xs border-t-0" />
                {/* Arrow Shaft */}
                <div className="absolute bottom-1 w-0.5 h-3.5 bg-slate-700 rounded-full" />
                {/* Arrow Head (CSS border triangle) */}
                <div className="absolute top-0 w-2 h-2 border-t-2 border-l-2 border-slate-700 -rotate-45" />
              </div>
            </div>

            <div className="flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--brand)] text-white text-[11px] font-black flex items-center justify-center">
                  1
                </span>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                  Tap the Share button
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7">
                In Safari's toolbar at the bottom of your screen, tap the <strong>Share</strong> icon.
              </p>
            </div>
          </div>

          {/* Step 2: Add to Home Screen */}
          <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            {/* CSS Shape: Rounded Squircle with + Sign */}
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
              <div className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center relative">
                {/* Horizontal Bar */}
                <div className="absolute w-3 h-0.5 bg-slate-800 rounded-full" />
                {/* Vertical Bar */}
                <div className="absolute w-0.5 h-3 bg-slate-800 rounded-full" />
              </div>
            </div>

            <div className="flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--brand)] text-white text-[11px] font-black flex items-center justify-center">
                  2
                </span>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                  Select "Add to Home Screen"
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7">
                Scroll down through the share actions sheet and tap <strong>Add to Home Screen</strong>.
              </p>
            </div>
          </div>

          {/* Step 3: Tap 'Add' to Confirm */}
          <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            {/* CSS Shape: Simulated iOS Top Bar with Blue 'Add' Button */}
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
              <div className="px-2 py-1 rounded bg-blue-600 text-white font-bold text-[10px] shadow-2xs select-none">
                Add
              </div>
            </div>

            <div className="flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--brand)] text-white text-[11px] font-black flex items-center justify-center">
                  3
                </span>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                  Tap 'Add' in the top corner
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7">
                Tap <strong>Add</strong> in the top-right corner. <strong>{appName}</strong> will instantly appear on your home screen!
              </p>
            </div>
          </div>

          {/* Bottom dismissal */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full h-11 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white font-heading font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Got it</span>
            </button>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}

export default IOSInstallSheet
