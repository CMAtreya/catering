import React from 'react'
import { Download, Share2, X } from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { IOSInstallSheet } from '@/components/pwa/IOSInstallSheet'

/**
 * Screen C6 Install Card
 * Appears after a successful submission:
 * "Add TKS Catering to your home screen" with "Install" and "Not now" (14-day dismissal memory).
 * On iOS/iPad Safari, triggers the iOS install instruction sheet.
 */
export const InstallPromptCard: React.FC = () => {
  const {
    canInstall,
    isIOS,
    showIOSSheet,
    setShowIOSSheet,
    promptToInstall,
    dismissPrompt
  } = useInstallPrompt({
    storageKey: 'tks_customer_install_dismissed',
    expiryDays: 14
  })

  // If already standalone, dismissed within 14 days, or unsupported
  if (!canInstall && !showIOSSheet) {
    return null
  }

  return (
    <>
      <div className="content-card p-4 sm:p-5 rounded-[20px] bg-white border border-slate-200/80 shadow-sm w-full text-left space-y-3 relative">
        {/* Dismiss button */}
        <button
          type="button"
          onClick={dismissPrompt}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Dismiss install prompt"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-3">
          {/* App Logo Tile */}
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs p-1.5 flex items-center justify-center border border-slate-100 shrink-0">
            <img
              src="/logo-128.webp"
              alt="TKS Iyengars Logo"
              width="48"
              height="48"
              decoding="async"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-0.5 pr-6">
            <h3 className="font-heading font-black text-sm sm:text-base text-[var(--text-primary)] leading-tight">
              Add TKS Catering to your home screen
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-tight">
              Quick 1-tap access to your catering menu and orders anytime.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={promptToInstall}
            className="h-10 px-5 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[var(--on-brand)] font-bold text-xs shadow-xs flex items-center gap-1.5 active:scale-95 transition-all tap-target-48 cursor-pointer"
          >
            {isIOS ? (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Install</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={dismissPrompt}
            className="h-10 px-4 rounded-full text-xs font-semibold text-[var(--text-muted)] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Not now
          </button>
        </div>
      </div>

      {/* iOS Safari Instruction Bottom Sheet */}
      <IOSInstallSheet
        open={showIOSSheet}
        onOpenChange={setShowIOSSheet}
        appName="TKS Catering"
      />
    </>
  )
}

export default InstallPromptCard
