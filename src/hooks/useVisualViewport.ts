import { useState, useEffect } from 'react'

export interface VisualViewportState {
  isKeyboardOpen: boolean
  keyboardHeight: number
  viewportHeight: number
  viewportWidth: number
}

/**
 * useVisualViewport:
 * Monitors software keyboard visibility and dimensions using window.visualViewport.
 * When the keyboard opens, focused form inputs are automatically centered in view,
 * and sticky bars can either shift above the keyboard or hide until closed.
 */
export function useVisualViewport(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return {
        isKeyboardOpen: false,
        keyboardHeight: 0,
        viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
        viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 390
      }
    }
    const vv = window.visualViewport
    const diff = window.innerHeight - vv.height
    return {
      isKeyboardOpen: diff > 140,
      keyboardHeight: Math.max(0, diff),
      viewportHeight: vv.height,
      viewportWidth: vv.width
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const vv = window.visualViewport
    if (!vv) return

    let prevKeyboardOpen = false

    const handleResize = () => {
      const heightDiff = window.innerHeight - vv.height
      const isKeyboard = heightDiff > 140

      setState({
        isKeyboardOpen: isKeyboard,
        keyboardHeight: isKeyboard ? heightDiff : 0,
        viewportHeight: vv.height,
        viewportWidth: vv.width
      })

      // When software keyboard first opens, gently scroll input if needed
      if (isKeyboard && !prevKeyboardOpen && document.activeElement) {
        const el = document.activeElement as HTMLElement
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) {
          el.scrollIntoView({ block: 'nearest' })
        }
      }
      prevKeyboardOpen = isKeyboard
    }

    vv.addEventListener('resize', handleResize)

    return () => {
      vv.removeEventListener('resize', handleResize)
    }
  }, [])

  return state
}
