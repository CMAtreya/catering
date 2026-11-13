import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { addFeast, updateFeast, type Feast } from "@/api/feastApi";
import type { MenuItem } from "@/data/mockData";
import { X, Search, Check, Sparkles } from "lucide-react";

interface FeastFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFeast?: Feast | null;
  allItems: MenuItem[];
}

const PRESET_TAG_OPTIONS = [
  "Most Popular",
  "Morning Feasts",
  "100% Satvik",
  "Housewarming",
  "Royal Banquet",
  "Traditional Homam",
  "Evening Reception",
  "Special Celebration",
];

export const FeastForm: React.FC<FeastFormProps> = ({
  open,
  onOpenChange,
  editingFeast,
  allItems,
}) => {
  const [name, setName] = useState("");
  const [tag, setTag] = useState(PRESET_TAG_OPTIONS[0]);
  const [customTag, setCustomTag] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dishSearch, setDishSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when modal opens or editingFeast changes
  useEffect(() => {
    if (editingFeast) {
      setName(editingFeast.name || "");
      if (PRESET_TAG_OPTIONS.includes(editingFeast.tag)) {
        setTag(editingFeast.tag);
        setCustomTag("");
      } else {
        setTag("Custom");
        setCustomTag(editingFeast.tag || "");
      }
      setSelectedIds(editingFeast.itemIds || []);
    } else {
      setName("");
      setTag(PRESET_TAG_OPTIONS[0]);
      setCustomTag("");
      setSelectedIds([]);
    }
    setDishSearch("");
    setSelectedCategory("all");
  }, [editingFeast, open]);

  // Extract unique categories from menu items
  const categories = useMemo(() => {
    const set = new Set<string>();
    allItems.forEach((it) => {
      if (it.category) set.add(it.category);
    });
    return Array.from(set);
  }, [allItems]);

  // Filtered dishes for selection
  const filteredDishes = useMemo(() => {
    return allItems.filter((it) => {
      const matchesCategory =
        selectedCategory === "all" || it.category === selectedCategory;
      const matchesSearch =
        !dishSearch ||
        it.name.toLowerCase().includes(dishSearch.toLowerCase()) ||
        (it.category &&
          it.category.toLowerCase().includes(dishSearch.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [allItems, selectedCategory, dishSearch]);

  // Live calculated total price per plate
  const totalPrice = useMemo(() => {
    return allItems
      .filter((it) => selectedIds.includes(it.id))
      .reduce((sum, it) => sum + (it.pricePerPlate || 0), 0);
  }, [allItems, selectedIds]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSelectAllFiltered = () => {
    const idsToAdd = filteredDishes.map((d) => d.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const handleClearAllSelected = () => {
    setSelectedIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a feast package name");
      return;
    }
    const finalTag = tag === "Custom" ? customTag.trim() : tag;
    if (!finalTag) {
      toast.error("Please specify a tag or occasion badge");
      return;
    }
    if (selectedIds.length === 0) {
      toast.error("Please select at least one delicacy for this feast");
      return;
    }

    const feastPayload: Feast = {
      id: editingFeast?.id || `feast-${Date.now()}`,
      name: name.trim(),
      description: editingFeast?.description || "",
      tag: finalTag,
      itemIds: selectedIds,
    };

    setIsSaving(true);
    try {
      if (editingFeast) {
        updateFeast(feastPayload);
        toast.success(`Updated "${feastPayload.name}" successfully`);
      } else {
        addFeast(feastPayload);
        toast.success(`Created "${feastPayload.name}" feast package`);
      }
      onOpenChange(false);
    } catch {
      toast.error("Failed to save feast");
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/40 bg-surface-container-low/40 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10.5px] text-secondary font-bold tracking-wider uppercase block">
              CATERING PACKAGE CONFIGURATOR
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-primary">
              {editingFeast
                ? "Edit Predefined Feast"
                : "Create New Predefined Feast"}
            </h3>
            <p className="text-[11px] text-on-surface-variant">
              {editingFeast
                ? `${editingFeast.name} (Curated Banquet Package)`
                : "Configure traditional feast spread for 1-tap booking"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col justify-between overflow-hidden"
        >
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Top Row: Name and Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="feast-name-input"
                  className="block text-xs font-bold text-on-surface mb-1"
                >
                  Feast Package Name <span className="text-error">*</span>
                </label>
                <input
                  id="feast-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Mysore Kalyana Feast"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-background text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="feast-tag-select"
                  className="block text-xs font-bold text-on-surface mb-1"
                >
                  Tag / Occasion Badge <span className="text-error">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    id="feast-tag-select"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-xs font-semibold focus:border-primary outline-none cursor-pointer text-on-surface"
                  >
                    {PRESET_TAG_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    <option value="Custom">Custom Badge...</option>
                  </select>
                  {tag === "Custom" && (
                    <input
                      type="text"
                      required
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="e.g. Special Puja"
                      className="flex-1 px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-background text-xs font-semibold focus:border-primary outline-none"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Dishes Selection Section */}
            <div className="space-y-2.5 pt-1">
              {/* Clean Section Label & Quick Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Select Curated Dishes
                  </label>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    {selectedIds.length} Selected
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Select All in Category
                  </button>
                  <span className="text-outline-variant">•</span>
                  <button
                    type="button"
                    onClick={handleClearAllSelected}
                    className="text-[11px] font-bold text-outline hover:text-error cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Clean Full-Width Search & Category Dropdown */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
                  <input
                    type="text"
                    value={dishSearch}
                    onChange={(e) => setDishSearch(e.target.value)}
                    placeholder="Search dishes by name (e.g. Puliyogare, Mysore Pak, Saaru)..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-medium focus:border-primary outline-none placeholder:text-outline"
                  />
                  {dishSearch && (
                    <button
                      type="button"
                      onClick={() => setDishSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-outline-variant bg-surface-container text-xs font-semibold focus:border-primary outline-none cursor-pointer text-on-surface shrink-0"
                >
                  <option value="all">
                    All Categories ({allItems.length})
                  </option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dishes Grid List */}
              <div className="border border-outline-variant/60 rounded-2xl p-2 bg-surface-container-low/20 max-h-64 overflow-y-auto">
                {filteredDishes.length === 0 ? (
                  <div className="py-10 text-center text-xs text-outline">
                    No dishes found matching &quot;{dishSearch}&quot;.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredDishes.map((dish) => {
                      const isSelected = selectedIds.includes(dish.id);
                      return (
                        <div
                          key={dish.id}
                          onClick={() => toggleItem(dish.id)}
                          className={`p-2.5 px-3 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between gap-2.5 ${
                            isSelected
                              ? "bg-amber-50/90 border-[#8B0A00] ring-1 ring-[#8B0A00]/20 shadow-2xs"
                              : "bg-white border-outline-variant/40 hover:border-outline-variant hover:bg-surface-container-lowest"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Veg indicator dot */}
                            <span className="w-3.5 h-3.5 border border-emerald-700 p-0.5 flex items-center justify-center rounded-xs shrink-0 bg-white">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
                            </span>
                            <span
                              className={`text-xs font-bold truncate ${isSelected ? "text-[#8B0A00]" : "text-on-surface"}`}
                            >
                              {dish.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-xs text-on-surface">
                              ₹{dish.pricePerPlate}
                            </span>
                            <span
                              className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border transition-all ${
                                isSelected
                                  ? "bg-[#8B0A00] border-[#8B0A00] text-white"
                                  : "border-outline-variant bg-white text-transparent"
                              }`}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clean Footer Bar */}
          <div className="px-6 py-3.5 border-t border-outline-variant/40 bg-surface-container-low/40 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-xl text-on-surface-variant text-xs font-bold hover:bg-surface-container transition-all cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-on-surface-variant">Rate: </span>
                <span className="font-serif text-base sm:text-lg font-bold text-primary">
                  ₹{totalPrice}
                </span>
                <span className="text-[11px] text-outline ml-1 font-medium">
                  / plate
                </span>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary-container active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isSaving
                    ? "Saving..."
                    : editingFeast
                      ? "Update Feast"
                      : "Save Feast"}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
