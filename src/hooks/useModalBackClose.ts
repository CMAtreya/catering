import { useEffect, useRef } from 'react'

/**
 * useModalBackClose hook
 * Ensures modal sheets, dialogs and drawers intercept browser Back button / swipe gesture
 * so they close first before the page navigates away.
 */
export function useModalBackClose(
  open: boolean | undefined,
  onOpenChange: ((open: boolean) => void) | undefined,
  modalKey = '__modal'
) {
  const isPushedRef = useRef(false)
  const onOpenChangeRef = useRef(onOpenChange)
  onOpenChangeRef.current = onOpenChange

  useEffect(() => {
    // If not open or closed, clean up history state if we pushed it
    if (!open) {
      if (isPushedRef.current) {
        isPushedRef.current = false
        if (typeof window !== 'undefined' && window.history.state?.[modalKey]) {
          window.history.back()
        }
      }
      return
    }

    // Modal opened: push a history state
    if (typeof window !== 'undefined') {
      window.history.pushState({ ...window.history.state, [modalKey]: true }, '')
      isPushedRef.current = true
    }

    const handlePopState = () => {
      // User tapped browser Back
      isPushedRef.current = false
      onOpenChangeRef.current?.(false)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      if (isPushedRef.current) {
        isPushedRef.current = false
        if (typeof window !== 'undefined' && window.history.state?.[modalKey]) {
          window.history.back()
        }
      }
    }
  }, [open, modalKey])
}
