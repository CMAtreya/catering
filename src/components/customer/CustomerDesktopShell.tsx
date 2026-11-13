import React from 'react'
import { AppFooter } from '@/components/common/AppFooter'

interface CustomerDesktopShellProps {
  children: React.ReactNode
  maxWidth?: string
  className?: string
  showFooter?: boolean
}

export const CustomerDesktopShell: React.FC<CustomerDesktopShellProps> = ({
  children,
  maxWidth = 'w-full',
  className = '',
  showFooter = false
}) => {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans relative overflow-x-hidden flex flex-col w-full selection:bg-primary selection:text-white">
      {/* Ambient background glows matching heritage theme */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
      >
        <div className="absolute inset-0 bg-surface" />
        <div className="ambient-glow-top" />
        <div className="ambient-glow-right" />
      </div>

      {/* Main content container */}
      <div className={`relative z-10 w-full ${maxWidth} flex-1 flex flex-col ${className}`}>
        {children}
      </div>

      {/* Optional fallback footer */}
      {showFooter && <AppFooter />}
    </div>
  )
}

export default CustomerDesktopShell
