import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  badge?: string
}

export interface SelectAction {
  label: string
  onSelect: () => void
  icon?: React.ReactNode
}

export interface CustomSelectProps {
  id?: string
  value: string
  onChange: (value: string) => void
  options: (SelectOption | string)[]
  placeholder?: string
  actionOption?: SelectAction
  sortAlphabetical?: boolean
  className?: string
  disabled?: boolean
  error?: boolean
  align?: 'left' | 'right'
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  actionOption,
  sortAlphabetical = true,
  className = '',
  disabled = false,
  error = false,
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Normalize options into standard SelectOption objects
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt }
    }
    return opt
  })

  // Sort remaining options alphabetically if enabled
  const sortedOptions = sortAlphabetical
    ? [...normalizedOptions].sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
      )
    : normalizedOptions

  // Active selected option
  const selectedOption = normalizedOptions.find((opt) => opt.value === value)

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full px-3.5 py-2 rounded-xl text-xs font-semibold text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer shadow-xs select-none ${
          disabled
            ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
            : error
            ? 'bg-white border border-red-400 text-[#2D1810] focus:ring-2 focus:ring-red-200'
            : isOpen
            ? 'bg-white border-[#8B0A00] ring-2 ring-[#8B0A00]/15 text-[#2D1810]'
            : 'bg-white hover:bg-stone-50/80 border border-stone-200/90 text-[#2D1810] hover:border-[#8B0A00]/40'
        }`}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption ? (
            <>
              {selectedOption.icon}
              <span className="font-semibold text-[#2D1810]">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 font-bold">
                  {selectedOption.badge}
                </span>
              )}
            </>
          ) : (
            <span className="text-stone-400 font-normal">{placeholder}</span>
          )}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-stone-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#8B0A00]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Container */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-[#EADBC8] shadow-xl shadow-stone-900/10 overflow-hidden py-1.5 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 custom-scroll`}
        >
          {/* 1. FIRST OPTION: Action Option (e.g. + Add New Category) */}
          {actionOption && (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  actionOption.onSelect()
                }}
                className="w-full px-3.5 py-2.5 text-xs font-bold text-[#8B0A00] hover:bg-amber-50/80 transition-colors text-left cursor-pointer"
              >
                {actionOption.label}
              </button>

              {/* Line Separator dividing action from options */}
              <div className="my-1.5 mx-2 border-t border-stone-200/80" />
            </>
          )}

          {/* 2. REMAINING OPTIONS (Sorted Alphabetically) */}
          {sortedOptions.length === 0 ? (
            <div className="px-3.5 py-3 text-xs text-stone-400 text-center">
              No options available
            </div>
          ) : (
            sortedOptions.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={`w-full px-3.5 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-amber-50/70 text-[#8B0A00] font-bold'
                      : 'text-stone-700 hover:bg-stone-50 hover:text-[#2D1810] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    {opt.icon}
                    <span className="truncate">{opt.label}</span>
                    {opt.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold shrink-0">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#8B0A00] shrink-0 stroke-[2.5]" />
                  )}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default CustomSelect
