import React, { useEffect, useState } from "react";
import { Sparkles, Check, ChevronRight, Leaf } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/data/mockData";
import { useDraftStore } from "@/store/draftStore";
import { 
  fetchFeastsAsync, 
  seedDefaultFeasts, 
  type Feast 
} from "@/api/feastApi";
import { DEFAULT_FEASTS } from "@/components/customer/DefaultFeasts";
import type { PresetFeast } from "@/types/feast";

/** Map a stored Feast (has `description`) to a PresetFeast (has `subtitle`) */
function toPresetFeast(f: Feast): PresetFeast {
  return {
    id: f.id,
    name: f.name,
    subtitle: f.description,
    tag: f.tag,
    accentColor: "from-amber-600 to-[var(--brand)]",
    itemIds: f.itemIds,
  };
}

const PresetFeastBar: React.FC<{
  availableItems: MenuItem[];
  onOpenLeafVisualizer?: () => void;
}> = ({ availableItems, onOpenLeafVisualizer }) => {
  const selectedItems = useDraftStore((state) => state.items);
  const loadPresetFeast = useDraftStore((state) => state.loadPresetFeast);

  const [feasts, setFeasts] = useState<PresetFeast[]>([]);

  // Seed defaults on first load, then populate state with latest async fetch
  useEffect(() => {
    fetchFeastsAsync().then((stored) => {
      if (stored.length === 0) {
        const feastsToSeed = DEFAULT_FEASTS.map((f) => ({
          id: f.id,
          name: f.name,
          description: f.subtitle,
          tag: f.tag,
          itemIds: f.itemIds,
        }));
        seedDefaultFeasts(feastsToSeed);
        setFeasts(DEFAULT_FEASTS);
      } else {
        setFeasts(stored.map(toPresetFeast));
      }
    });
  }, []);

  const itemsMap = React.useMemo(() => {
    const map = new Map<string, MenuItem>();
    for (const item of availableItems) {
      map.set(item.id, item);
    }
    return map;
  }, [availableItems]);

  const handleApplyPreset = (preset: PresetFeast) => {
    const matchedItems: MenuItem[] = [];
    for (const id of preset.itemIds) {
      const it = itemsMap.get(id);
      if (it && it.available) matchedItems.push(it);
    }
    if (matchedItems.length === 0) {
      toast.error("Preset dishes currently unavailable");
      return;
    }
    loadPresetFeast(matchedItems, preset.name);
    const totalRate = matchedItems.reduce(
      (acc, cur) => acc + cur.pricePerPlate,
      0,
    );
    toast.success(`Loaded "${preset.name}"`, {
      description: `${matchedItems.length} curated dishes selected • ₹${totalRate}/plate base price`,
    });
  };

  const isPresetActive = (preset: PresetFeast) =>
    preset.itemIds.length > 0 &&
    preset.itemIds.every((id) => Boolean(selectedItems[id]));

  return (
    <section aria-label="Curated banquet packages" className="space-y-[13px]">
      <div className="flex items-center justify-between gap-[8px]">
        <div className="flex items-center gap-[8px]">
          <div className="w-[34px] h-[34px] rounded-[13px] bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="font-heading font-black text-golden-base sm:text-golden-md text-slate-800 tracking-tight">
              Curated Banquet Feasts
            </h3>
            <p className="text-golden-xs text-slate-500 font-medium hidden sm:block">
              1-tap authentic South Indian meal packages hand-crafted by our
              master chefs
            </p>
          </div>
        </div>
        {onOpenLeafVisualizer && (
          <button
            type="button"
            onClick={onOpenLeafVisualizer}
            className="px-[13px] py-[8px] rounded-full text-golden-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all flex items-center gap-[5px] shadow-2xs cursor-pointer shrink-0"
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>View on Banana Leaf</span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        )}
      </div>

      <div className="flex gap-[13px] overflow-x-auto no-scrollbar pb-[5px] -mx-3 px-3 sm:mx-0 sm:px-0">
        {feasts.map((preset) => {
          const active = isPresetActive(preset);
          const matchedItems = preset.itemIds
            .map((id) => itemsMap.get(id))
            .filter((it): it is MenuItem => Boolean(it));
          const feastRate = matchedItems.reduce(
            (acc, cur) => acc + cur.pricePerPlate,
            0,
          );
          return (
            <div
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className={`w-[270px] sm:w-[290px] aspect-[1.618/1] rounded-[13px] sm:rounded-[21px] p-[13px] sm:p-[16px] border transition-all cursor-pointer relative flex flex-col justify-between group shadow-2xs hover:shadow-md select-none shrink-0 ${
                active
                  ? "bg-gradient-to-br from-amber-50 to-orange-50/70 border-[var(--brand)] ring-2 ring-[var(--brand)]/20 shadow-xs"
                  : "bg-white border-slate-200/90 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-[5px] mb-[5px]">
                  <span className="text-[10px] font-black uppercase tracking-wider px-[8px] py-[2px] rounded-full bg-slate-100 text-slate-700">
                    {preset.tag}
                  </span>
                  {active && (
                    <span className="flex items-center gap-[3px] text-[10px] font-bold text-[var(--brand)] bg-amber-100/80 px-[8px] py-[2px] rounded-full border border-amber-200">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Applied</span>
                    </span>
                  )}
                </div>
                <h4 className="font-heading font-black text-golden-sm sm:text-golden-base text-slate-900 group-hover:text-[var(--brand)] transition-colors leading-snug">
                  {preset.name}
                </h4>
                <p className="text-golden-xs text-slate-500 font-medium line-clamp-2 mt-[3px] leading-normal">
                  {preset.subtitle}
                </p>
              </div>
              <div className="pt-[8px] border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-heading font-black text-golden-base sm:text-golden-md text-[var(--brand)]">
                    ₹{feastRate}
                  </span>
                  <span className="text-golden-xs text-slate-400 font-medium">
                    {" "}
                    / plate
                  </span>
                </div>
                <button
                  type="button"
                  className={`px-[10px] py-[5px] rounded-full text-golden-xs font-bold transition-all flex items-center gap-[3px] cursor-pointer ${
                    active
                      ? "bg-[var(--brand)] text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <span>{active ? "Selected" : "Load Menu"}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PresetFeastBar;
