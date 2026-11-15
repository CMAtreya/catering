import React from 'react'

/**
 * Universal pulse shimmer primitive
 */
export const PulseShimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-stone-200/80 via-stone-100 to-stone-200/80 rounded-xl ${className}`}
  />
)

/**
 * 1. General Section / Container Loading State with warm Mysuru branding
 */
export interface LoadingStateProps {
  title?: string
  subtitle?: string
  className?: string
  compact?: boolean
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Preparing authentic delicacies...',
  subtitle = 'Fetching kitchen records and authentic recipes',
  className = '',
  compact = false
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 ${className}`}
    >
      <div className="relative mb-4">
        {/* Outer glowing pulsing ring */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-[#8B0A00]/10 flex items-center justify-center border border-[#8B0A00]/20 animate-pulse">
          <div className="w-8 h-8 rounded-full border-3 border-[#8B0A00] border-t-transparent animate-spin" />
        </div>
      </div>

      <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D1810] tracking-tight">
        {title}
      </h3>
      {!compact && subtitle && (
        <p className="text-xs sm:text-sm text-[#785A48] mt-1 max-w-sm leading-relaxed">
          {subtitle}
        </p>
      )}
      <span className="sr-only">Loading</span>
    </div>
  )
}

/**
 * 2. Skeleton for Individual Dish Item Card
 */
export const DishCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-stone-200/70 p-4 flex flex-col justify-between space-y-3.5 shadow-xs ${className}`}
    >
      {/* Dish Image Placeholder */}
      <PulseShimmer className="w-full aspect-[4/3] rounded-xl" />

      {/* Dish Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <PulseShimmer className="h-4.5 w-3/4 rounded-md" />
          <PulseShimmer className="h-4 w-12 rounded-full" />
        </div>
        <PulseShimmer className="h-3.5 w-full rounded" />
        <PulseShimmer className="h-3.5 w-2/3 rounded" />
      </div>

      {/* Footer / Price & Add Button */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
        <PulseShimmer className="h-5 w-16 rounded" />
        <PulseShimmer className="h-8 w-24 rounded-full" />
      </div>
    </div>
  )
}

/**
 * 3. Grid of Dish Card Skeletons
 */
export const DishGridSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 6,
  className = ''
}) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 w-full ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <DishCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * 4. Skeleton for Curated Feast Package Card
 */
export const FeastCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-stone-50/80 rounded-2xl p-5 border border-stone-200/60 flex flex-col justify-between space-y-4 shadow-xs ${className}`}>
      <div className="space-y-3">
        {/* Tag Pill */}
        <PulseShimmer className="h-4.5 w-24 rounded-full" />
        
        {/* Title */}
        <PulseShimmer className="h-6 w-4/5 rounded-lg" />

        {/* Pricing strip */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white border border-stone-100">
          <PulseShimmer className="h-7 rounded-lg" />
          <PulseShimmer className="h-7 rounded-lg" />
        </div>

        {/* Dish Spotlight Circle */}
        <div className="flex items-center gap-3 pt-2">
          <PulseShimmer className="w-14 h-14 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <PulseShimmer className="h-3.5 w-28 rounded" />
            <PulseShimmer className="h-3 w-40 rounded" />
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <PulseShimmer className="h-10 w-full rounded-xl" />
    </div>
  )
}

/**
 * 5. Grid of Feast Card Skeletons
 */
export const FeastGridSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 4,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <FeastCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * 6. Skeleton for Table Rows
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
      {/* Table Header */}
      <div className="p-4 bg-stone-50 border-b border-stone-200/80 grid grid-cols-5 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <PulseShimmer key={i} className="h-4 w-24 rounded" />
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-stone-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 grid grid-cols-5 gap-4 items-center">
            {Array.from({ length: columns }).map((_, c) => (
              <PulseShimmer
                key={c}
                className={`h-4 rounded ${c === 0 ? 'w-32' : c === columns - 1 ? 'w-16' : 'w-24'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
