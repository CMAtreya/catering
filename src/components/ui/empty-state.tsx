import React from "react";
import { Link } from "react-router-dom";
import {
  UtensilsCrossed,
  Search,
  FilterX,
  CalendarX,
  Sparkles,
} from "lucide-react";

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  to?: string;
  variant?: "primary" | "secondary" | "outline";
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  badge?: string;
  title: string;
  description: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  badge,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = "",
  compact = false,
}) => {
  return (
    <div
      role="region"
      aria-label={title}
      className={`flex flex-col items-center justify-center text-center rounded-3xl border border-stone-200/80 bg-stone-50/60 ${
        compact ? "p-6 sm:p-8" : "p-8 sm:p-12"
      } ${className}`}
    >
      {/* Icon Badge */}
      <div className="relative mb-3.5">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-50 border border-amber-200/80 text-[#8B0A00] flex items-center justify-center shadow-xs">
          {icon || <UtensilsCrossed className="w-7 h-7 stroke-[1.75]" />}
        </div>
      </div>

      {badge && (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-amber-100/70 text-amber-900 border border-amber-200/80 mb-2">
          {badge}
        </span>
      )}

      <h3 className="font-serif font-bold text-lg sm:text-xl text-[#2D1810] tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#785A48] mt-1.5 max-w-sm leading-relaxed">
        {description}
      </p>

      {/* Action buttons */}
      {(primaryAction || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {primaryAction &&
            (primaryAction.to ? (
              <Link
                to={primaryAction.to}
                className="px-5 py-2.5 rounded-xl bg-[#8B0A00] hover:bg-[#6D0800] text-white font-bold text-xs shadow-xs active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                {primaryAction.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="px-5 py-2.5 rounded-xl bg-[#8B0A00] hover:bg-[#6D0800] text-white font-bold text-xs shadow-xs active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                {primaryAction.label}
              </button>
            ))}

          {secondaryAction &&
            (secondaryAction.to ? (
              <Link
                to={secondaryAction.to}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-[#2D1810] border border-stone-200/80 font-bold text-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-[#2D1810] border border-stone-200/80 font-bold text-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                {secondaryAction.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

/**
 * Empty Search Results Preset
 */
export const EmptySearchState: React.FC<{
  query: string;
  onClear: () => void;
  className?: string;
}> = ({ query, onClear, className = "" }) => (
  <EmptyState
    icon={<Search className="w-7 h-7 stroke-[1.75]" />}
    badge="No Search Results"
    title="No Delicacies Found"
    description={`We could not find any traditional dishes matching "${query}". Check spelling or explore our complete banquet categories.`}
    primaryAction={{
      label: "Clear Search Query",
      onClick: onClear,
    }}
    className={className}
  />
);

/**
 * Empty Category Filter Preset
 */
export const EmptyFilterState: React.FC<{
  categoryName?: string;
  onReset: () => void;
  className?: string;
}> = ({ categoryName = "this category", onReset, className = "" }) => (
  <EmptyState
    icon={<FilterX className="w-7 h-7 stroke-[1.75]" />}
    badge="Empty Category"
    title="No Dishes In Category"
    description={`There are currently no active dishes available under ${categoryName}. You can view all categories or reset filters.`}
    primaryAction={{
      label: "Show All Dishes",
      onClick: onReset,
    }}
    className={className}
  />
);

/**
 * Empty Bookings / Orders Preset
 */
export const EmptyOrdersState: React.FC<{
  onCreate?: () => void;
  className?: string;
}> = ({ onCreate, className = "" }) => (
  <EmptyState
    icon={<CalendarX className="w-7 h-7 stroke-[1.75]" />}
    badge="Orders Desk"
    title="No Catering Orders Found"
    description="There are no catering enquiries or confirmed bookings matching your active filters."
    primaryAction={
      onCreate
        ? {
            label: "Create Manual Order",
            onClick: onCreate,
          }
        : undefined
    }
    className={className}
  />
);

/**
 * Empty Feasts Packages Preset
 */
export const EmptyFeastsState: React.FC<{
  onCreate?: () => void;
  onResetFilters?: () => void;
  hasFilters?: boolean;
  className?: string;
}> = ({ onCreate, onResetFilters, hasFilters, className = "" }) => (
  <EmptyState
    icon={<Sparkles className="w-7 h-7 stroke-[1.75]" />}
    badge="Feast Packages"
    title="No Feast Packages Found"
    description={
      hasFilters
        ? "No feasts match your active search keywords or occasion filter. Try resetting filters."
        : "Create your first predefined feast spread to display in the customer banquet menu."
    }
    primaryAction={
      hasFilters && onResetFilters
        ? {
            label: "Clear Filters",
            onClick: onResetFilters,
          }
        : onCreate
          ? {
              label: "Create Feast Package",
              onClick: onCreate,
            }
          : undefined
    }
    secondaryAction={
      hasFilters && onCreate
        ? {
            label: "Create Feast",
            onClick: onCreate,
          }
        : undefined
    }
    className={className}
  />
);
