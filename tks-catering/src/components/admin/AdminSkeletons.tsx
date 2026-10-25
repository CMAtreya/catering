import React from 'react'

/**
 * Pulse shimmer element with smooth gradient
 */
export const AdminShimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-slate-200/90 via-slate-100 to-slate-200/90 rounded-lg ${className}`}
  />
)

/**
 * 1. SKELETON FOR ORDER CARDS (Matches OrderCard.tsx)
 */
export const OrderCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs space-y-3.5 ${className}`}>
      {/* Top Row: Ref ID, SourceChip, StatusChip, Timestamp */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <AdminShimmer className="h-4.5 w-24 rounded-md" />
          <AdminShimmer className="h-5 w-16 rounded-full" />
          <AdminShimmer className="h-5 w-24 rounded-full" />
        </div>
        <AdminShimmer className="h-3.5 w-20 rounded" />
      </div>

      {/* Customer Name & Mobile */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <AdminShimmer className="h-5 w-44 rounded-md" />
          <AdminShimmer className="h-3.5 w-28 rounded" />
        </div>
        <AdminShimmer className="h-6 w-20 rounded-lg" />
      </div>

      {/* Event Details: Occasion, Date, Plates */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="space-y-1.5">
          <AdminShimmer className="h-4 w-32 rounded" />
          <AdminShimmer className="h-3.5 w-40 rounded" />
        </div>
        <div className="space-y-1.5 flex flex-col items-end">
          <AdminShimmer className="h-4 w-20 rounded" />
          <AdminShimmer className="h-3.5 w-28 rounded" />
        </div>
      </div>

      {/* Footer Strip */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <AdminShimmer className="h-3.5 w-36 rounded" />
        <AdminShimmer className="h-3.5 w-14 rounded" />
      </div>
    </div>
  )
}

/**
 * Multiple Order Cards Skeleton List
 */
export const OrderListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * 2. SKELETON FOR CALENDAR CARD (Matches CalendarCard.tsx)
 */
export const CalendarSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`content-card p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-xs space-y-4 ${className}`}>
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="space-y-1">
          <AdminShimmer className="h-6 w-36 rounded-md" />
          <AdminShimmer className="h-3.5 w-24 rounded" />
        </div>
        <div className="flex items-center gap-1.5">
          <AdminShimmer className="h-8 w-8 rounded-full" />
          <AdminShimmer className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Day of Week Headers (7 columns) */}
      <div className="grid grid-cols-7 gap-1 text-center py-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex justify-center">
            <AdminShimmer className="h-3.5 w-6 rounded" />
          </div>
        ))}
      </div>

      {/* Month Days Grid (35 cells) */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl border border-slate-100 bg-slate-50/50 p-1 flex flex-col items-center justify-between"
          >
            <AdminShimmer className="h-3 w-4 rounded-full mt-1" />
            {i % 5 === 2 && <AdminShimmer className="h-2 w-2 rounded-full mb-1 bg-amber-200" />}
          </div>
        ))}
      </div>

      {/* Bottom Selected Date Feed Skeleton */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <AdminShimmer className="h-4 w-48 rounded" />
        <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
          <AdminShimmer className="h-4 w-3/4 rounded" />
          <AdminShimmer className="h-3.5 w-1/2 rounded" />
        </div>
      </div>
    </div>
  )
}

/**
 * 3. SKELETON FOR CUSTOMER ROWS (Matches AdminCustomersPage.tsx)
 */
export const CustomerRowSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`content-card p-4 sm:p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3.5 ${className}`}>
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* 48px Initials Avatar Tile */}
        <AdminShimmer className="w-12 h-12 rounded-2xl shrink-0" />

        {/* Customer Details */}
        <div className="min-w-0 space-y-2 flex-1">
          {/* Top Line: Name, Mobile, Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <AdminShimmer className="h-4.5 w-36 rounded-md" />
            <AdminShimmer className="h-3.5 w-24 rounded" />
            <AdminShimmer className="h-5 w-20 rounded-full" />
            <AdminShimmer className="h-5 w-18 rounded-full" />
          </div>

          {/* Second Line: Last Contacted Date */}
          <AdminShimmer className="h-3.5 w-40 rounded" />
        </div>
      </div>

      {/* Chevron Right */}
      <AdminShimmer className="w-4 h-4 rounded shrink-0" />
    </div>
  )
}

/**
 * Multiple Customer Rows Skeleton List
 */
export const CustomerListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CustomerRowSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Complete Customer Detail Page Skeleton (Matches AdminCustomerDetailPage.tsx)
 */
export const CustomerDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <AdminShimmer className="h-6 w-36 rounded" />

      {/* Top Profile Card */}
      <div className="content-card p-6 rounded-[24px] bg-white border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <AdminShimmer className="w-14 h-14 rounded-2xl" />
            <div className="space-y-1.5">
              <AdminShimmer className="h-6 w-48 rounded" />
              <AdminShimmer className="h-4 w-32 rounded" />
            </div>
          </div>
          <AdminShimmer className="h-10 w-28 rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <AdminShimmer className="h-16 rounded-xl" />
          <AdminShimmer className="h-16 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <AdminShimmer className="h-20 rounded-2xl" />
          <AdminShimmer className="h-20 rounded-2xl" />
        </div>
      </div>

      {/* Timeline Section */}
      <div className="space-y-3">
        <AdminShimmer className="h-5 w-40 rounded" />
        <div className="space-y-3">
          <AdminShimmer className="h-28 rounded-2xl" />
          <AdminShimmer className="h-28 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
