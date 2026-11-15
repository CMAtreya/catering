import React, { useEffect, useState, useMemo } from 'react';
import { AdminAppShell } from '@/components/admin/AdminAppShell';
import { fetchFeastsAsync, deleteFeast, loadFeasts, type Feast } from '@/api/feastApi';
import { getCatalogue } from '@/api';
import { type MenuItem } from '@/data/mockData';
import { FeastForm } from '@/components/admin/FeastForm';
import { toast } from 'sonner';
import { FeastGridSkeleton } from '@/components/ui/loading-state';
import { EmptyFeastsState } from '@/components/ui/empty-state';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  PartyPopper,
  Sparkles,
  ChefHat,
} from 'lucide-react';

export const AdminFeastsPage: React.FC = () => {
  const [feasts, setFeasts] = useState<Feast[]>(() => loadFeasts());
  const [isLoading, setIsLoading] = useState<boolean>(() => loadFeasts().length === 0);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Feast | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  // Load menu items once – needed for dish lookup & live price calculation
  useEffect(() => {
    getCatalogue()
      .then((cat) => setItems(cat.items))
      .catch(() => toast.error('Failed to load menu items'));
  }, []);

  const refreshFeasts = (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    fetchFeastsAsync()
      .then((data) => {
        setFeasts(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    refreshFeasts(loadFeasts().length === 0);
  }, []);

  /** Sum pricePerPlate for all selected item IDs */
  const computePrice = (feast: Feast): number =>
    feast.itemIds
      .map((id) => items.find((i) => i.id === id))
      .filter((i): i is MenuItem => Boolean(i))
      .reduce((sum, cur) => sum + cur.pricePerPlate, 0);

  /** Resolve MenuItem objects for preview */
  const getDishesForFeast = (feast: Feast): MenuItem[] =>
    feast.itemIds
      .map((id) => items.find((i) => i.id === id))
      .filter((i): i is MenuItem => Boolean(i));

  const handleDelete = (feast: Feast) => {
    if (window.confirm(`Are you sure you want to remove "${feast.name}"?`)) {
      deleteFeast(feast.id);
      toast.success(`Removed "${feast.name}"`);
      refreshFeasts();
    }
  };

  const openEdit = (feast: Feast) => {
    setEditing(feast);
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  // Distinct tags for sidebar filter
  const tagsList = useMemo(() => {
    const set = new Set<string>();
    feasts.forEach((f) => {
      if (f.tag) set.add(f.tag);
    });
    return Array.from(set);
  }, [feasts]);

  // Filtered feasts
  const filteredFeasts = useMemo(() => {
    return feasts.filter((f) => {
      const matchesTag = selectedTag === 'all' || f.tag === selectedTag;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q)) ||
        (f.tag && f.tag.toLowerCase().includes(q)) ||
        f.itemIds.some((id) => {
          const item = items.find((i) => i.id === id);
          return item && item.name.toLowerCase().includes(q);
        });
      return matchesTag && matchesSearch;
    });
  }, [feasts, selectedTag, searchQuery, items]);

  return (
    <AdminAppShell title="Feasts Management">
      <div className="flex-1 flex flex-col h-full bg-surface-bright min-w-0">
        
        {/* ============================================================== */}
        {/* DUAL-PANEL WORKSPACE (Occasions on Left, Feasts on Right)       */}
        {/* ============================================================== */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden min-w-0">
          
          {/* 1. LEFT PANEL: Feast Occasions & Collections (~320px) */}
          <section className="w-full md:w-80 border-b md:border-b-0 md:border-r border-outline-variant/40 bg-surface-container-lowest flex flex-col shrink-0 overflow-y-auto max-h-56 md:max-h-full">
            <div className="p-4 md:p-5 border-b border-outline-variant/40 bg-surface-container-low/40">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-on-surface">
                    Feast Collections
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Curated banquet styles &amp; occasions
                  </p>
                </div>
                {isLoading && feasts.length === 0 ? (
                  <span className="w-16 h-6 rounded-full bg-amber-100/70 animate-pulse" />
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold">
                    {feasts.length} Feasts
                  </span>
                )}
              </div>
            </div>

            {/* Collection Categories List */}
            <div className="p-3 space-y-1.5 flex-1">
              {/* All Feasts Button */}
              <button
                type="button"
                onClick={() => setSelectedTag('all')}
                className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                  selectedTag === 'all'
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'text-on-surface hover:bg-surface-container border border-transparent hover:border-outline-variant/30 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedTag === 'all'
                        ? 'bg-white/20 text-white'
                        : 'bg-surface-container-high text-primary'
                    }`}
                  >
                    <PartyPopper className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">All Feasts &amp; Banquets</p>
                    <p className={`text-[10px] ${selectedTag === 'all' ? 'text-white/80' : 'text-on-surface-variant'}`}>
                      Complete banquet portfolio
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    selectedTag === 'all'
                      ? 'bg-white/20 text-white'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {feasts.length}
                </span>
              </button>

              {/* Tag Categories */}
              {tagsList.map((tag) => {
                const count = feasts.filter((f) => f.tag === tag).length;
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`w-full p-2.5 px-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-on-primary font-bold shadow-xs'
                        : 'text-on-surface hover:bg-surface-container border border-transparent hover:border-outline-variant/30 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-surface-container-high text-secondary'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs truncate">{tag}</span>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. RIGHT PANEL: Feasts Workspace Canvas */}
          <section className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto min-w-0 space-y-4">
            
            {/* Header Strip with Title & Primary Create Button */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-outline-variant/40">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-tertiary-container/30 text-secondary mb-1">
                  Curated Banquet Packages
                </span>
                <h1 className="font-serif text-xl sm:text-2xl text-primary font-bold">
                  {selectedTag === 'all' ? 'All Predefined Feasts & Thalis' : `${selectedTag} Packages`}
                </h1>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Showing {filteredFeasts.length} authentic South Indian meal packages loaded by patrons with 1 tap.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary-container active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Feast</span>
                </button>
              </div>
            </div>

            {/* Filter, Search Strip */}
            <div className="py-2 flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-full max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search feasts by name, tag, or included dish..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-background placeholder:text-outline text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              {/* Tag quick count */}
              <div className="text-xs text-on-surface-variant font-medium">
                <strong>{filteredFeasts.length}</strong> {filteredFeasts.length === 1 ? 'feast package' : 'feast packages'} listed
              </div>
            </div>

            {/* Feasts Grid View */}
            {isLoading && feasts.length === 0 ? (
              <FeastGridSkeleton count={3} className="pb-6" />
            ) : filteredFeasts.length === 0 ? (
              <div className="py-4">
                <EmptyFeastsState
                  hasFilters={Boolean(searchQuery || selectedTag !== 'all')}
                  onResetFilters={() => {
                    setSearchQuery('');
                    setSelectedTag('all');
                  }}
                  onCreate={openCreate}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-6">
                {filteredFeasts.map((feast) => {
                  const feastDishes = getDishesForFeast(feast);
                  const feastPrice = computePrice(feast);
                  return (
                    <div
                      key={feast.id}
                      className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group border-t-4 border-t-primary"
                    >
                      <div className="space-y-3">
                        {/* Top Tag & Actions */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                            {feast.tag}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEdit(feast)}
                              title="Edit feast"
                              className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(feast)}
                              title="Delete feast"
                              className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className="font-serif text-lg font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                            {feast.name}
                          </h3>
                        </div>

                        {/* Included Dishes Preview */}
                        <div className="pt-2 border-t border-outline-variant/30 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-outline font-semibold">
                            <span className="flex items-center gap-1 text-on-surface font-bold">
                              <ChefHat className="w-3.5 h-3.5 text-primary" />
                              <span>Included Delicacies ({feast.itemIds.length})</span>
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 max-h-24 overflow-hidden">
                            {feastDishes.slice(0, 5).map((dish) => (
                              <span
                                key={dish.id}
                                className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant border border-outline-variant/30"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 shrink-0"></span>
                                <span className="truncate max-w-[130px]">{dish.name}</span>
                              </span>
                            ))}
                            {feastDishes.length > 5 && (
                              <span className="inline-flex items-center text-[10.5px] px-2 py-0.5 rounded-md bg-surface-container-high text-primary font-bold">
                                +{feastDishes.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Price & Quick Edit Strip */}
                      <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-outline uppercase tracking-wider block font-bold">
                            Base Rate
                          </span>
                          <span className="font-serif text-xl font-bold text-primary">
                            ₹{feastPrice}
                          </span>
                          <span className="text-[10.5px] text-outline ml-1 font-medium">/ plate</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => openEdit(feast)}
                          className="px-3.5 py-1.5 rounded-xl border border-outline-variant bg-surface-container text-xs font-bold text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary transition-all cursor-pointer shadow-2xs"
                        >
                          Edit Package
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        {/* Create / Edit Modal */}
        <FeastForm
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) refreshFeasts();
          }}
          editingFeast={editing}
          allItems={items}
        />
      </div>
    </AdminAppShell>
  );
};

export default AdminFeastsPage;
