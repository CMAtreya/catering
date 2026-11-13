import React from 'react'

/**
 * Shimmer element utility
 */
export const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-slate-200/80 via-slate-100 to-slate-200/80 rounded-lg ${className}`}
  />
)

/**
 * 2-Column Catalogue Items Skeleton for Quick-Commerce Swiggy/Instamart style
 */
export const CatalogueSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="space-y-6 px-4 py-2">
      {/* Category Tabs Skeleton */}
      <div className="flex items-center gap-2 overflow-hidden py-1">
        <Shimmer className="h-9 w-24 rounded-full shrink-0" />
        <Shimmer className="h-9 w-32 rounded-full shrink-0" />
        <Shimmer className="h-9 w-28 rounded-full shrink-0" />
        <Shimmer className="h-9 w-36 rounded-full shrink-0" />
      </div>

      {/* Category Section Skeleton */}
      <div className="space-y-3">
        <Shimmer className="h-6 w-48 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200/80 p-3 rounded-[20px] space-y-3 shadow-sm"
            >
              <Shimmer className="w-full aspect-square rounded-[16px]" />
              <div className="space-y-2 pt-1 pb-1">
                <Shimmer className="h-4 w-4/5 rounded" />
                <Shimmer className="h-3.5 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Item Grid Shimmer Skeleton for 2-column mobile, 3-column tablet, 4-column desktop
 */
export const ItemGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 px-4 py-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200/80 p-3 rounded-[20px] space-y-3 shadow-xs"
        >
          <Shimmer className="w-full aspect-square rounded-[16px]" />
          <div className="space-y-2 pt-1 pb-1">
            <Shimmer className="h-4 w-4/5 rounded" />
            <Shimmer className="h-3.5 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Bill Card Shimmer Skeleton (Swiggy / Zomato style)
 */
export const BillCardSkeleton: React.FC = () => {
  return (
    <div className="content-card p-4 sm:p-5 rounded-[20px] bg-white border border-slate-200/80 shadow-sm space-y-3.5">
      <Shimmer className="h-5 w-28 rounded-md" />
      <div className="space-y-2.5 pt-1">
        <div className="flex justify-between items-center">
          <Shimmer className="h-4 w-28 rounded" />
          <Shimmer className="h-4 w-16 rounded" />
        </div>
        <div className="flex justify-between items-center">
          <Shimmer className="h-4 w-32 rounded" />
          <Shimmer className="h-4 w-14 rounded" />
        </div>
        <div className="border-t border-dashed border-slate-200 my-2" />
        <div className="flex justify-between items-center pt-1">
          <Shimmer className="h-5 w-36 rounded" />
          <Shimmer className="h-6 w-24 rounded" />
        </div>
      </div>
      <Shimmer className="h-14 w-full rounded-xl mt-3" />
    </div>
  )
}

/**
 * History List Shimmer Skeleton (Swiggy 'Your orders' style)
 */
export const HistoryListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="content-card p-4 sm:p-5 rounded-[20px] bg-white border border-slate-200/80 shadow-xs space-y-3"
        >
          {/* Top Row: Submitted timestamp + Chevron */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <Shimmer className="h-3.5 w-44 rounded" />
            <Shimmer className="h-3.5 w-16 rounded" />
          </div>

          {/* Main Row: Occasion & Event Date */}
          <div className="flex justify-between items-start pt-1">
            <div className="space-y-1.5">
              <Shimmer className="h-5 w-32 rounded" />
              <Shimmer className="h-3.5 w-24 rounded" />
            </div>
            <div className="space-y-1 text-right flex flex-col items-end">
              <Shimmer className="h-5 w-20 rounded" />
              <Shimmer className="h-3.5 w-14 rounded" />
            </div>
          </div>

          {/* Items preview box */}
          <Shimmer className="h-9 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}

/**
 * Order Card List Skeleton
 */
export const OrderListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="content-card p-4 rounded-[20px] space-y-3">
          <div className="flex justify-between items-center">
            <Shimmer className="h-4 w-28" />
            <Shimmer className="h-6 w-20 rounded-full" />
          </div>
          <Shimmer className="h-3 w-3/4" />
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Table Rows Skeleton for Admin views
 */
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="content-card rounded-[20px] overflow-hidden p-4 space-y-3">
      <div className="flex justify-between py-2 border-b border-slate-100">
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-4 w-20" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex justify-between items-center py-2.5">
          <Shimmer className="h-3.5 w-28" />
          <Shimmer className="h-3.5 w-36" />
          <Shimmer className="h-5 w-20 rounded-full" />
          <Shimmer className="h-3.5 w-16" />
        </div>
      ))}
    </div>
  )
}
