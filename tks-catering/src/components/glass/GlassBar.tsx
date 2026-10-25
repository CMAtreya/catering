import React from 'react'

interface GlassBarProps {
  children: React.ReactNode
  variant?: 'top' | 'bottom' | 'floating'
  className?: string
}

export const GlassBar: React.FC<GlassBarProps> = ({
  children,
  variant = 'top',
  className = ''
}) => {
  const variantClass = {
    top: 'glass-top-bar sticky top-0 z-40',
    bottom: 'glass-bottom-bar sticky bottom-0 z-40',
    floating: 'glass-floating-bar fixed z-50 rounded-full'
  }[variant]

  return <div className={`${variantClass} ${className}`}>{children}</div>
}
