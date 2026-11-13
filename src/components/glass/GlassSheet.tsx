import React from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer'

interface GlassSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export const GlassSheet: React.FC<GlassSheetProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className = ''
}) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={`glass-sheet border-t border-[var(--glass-border)] rounded-t-[28px] max-w-lg mx-auto ${className}`}>
        {/* Grab Handle */}
        <div className="mx-auto w-12 h-1.5 rounded-full bg-slate-300/80 my-3" />

        {(title || description) && (
          <DrawerHeader className="px-5 pt-0 pb-3 text-left">
            {title && (
              <DrawerTitle className="font-heading font-bold text-lg text-[var(--text-primary)]">
                {title}
              </DrawerTitle>
            )}
            {description && (
              <DrawerDescription className="text-xs text-[var(--text-muted)]">
                {description}
              </DrawerDescription>
            )}
          </DrawerHeader>
        )}

        <div className="px-5 pb-6 overflow-y-auto max-h-[75vh]">
          {children}
        </div>

        {footer && <DrawerFooter className="px-5 py-3 border-t border-slate-100">{footer}</DrawerFooter>}
      </DrawerContent>
    </Drawer>
  )
}
