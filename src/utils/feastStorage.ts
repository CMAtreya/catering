import defaultFeastsData from '@/data/feasts.json';

export interface Feast {
  id: string;
  name: string;
  description: string;
  tag: string;
  itemIds: string[]; // references MenuItem.id
}

const STORAGE_KEY = 'tks_catering_feasts';

export const DEFAULT_FEASTS_LIST: Feast[] = defaultFeastsData as Feast[];

/** Load feasts from localStorage. Automatically seeds default feasts if none found. */
export const loadFeasts = (): Feast[] => {
  if (typeof window === 'undefined') return DEFAULT_FEASTS_LIST;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveFeasts(DEFAULT_FEASTS_LIST);
      return DEFAULT_FEASTS_LIST;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveFeasts(DEFAULT_FEASTS_LIST);
    return DEFAULT_FEASTS_LIST;
  } catch {
    return DEFAULT_FEASTS_LIST;
  }
};

/** Persist feasts array to localStorage. */
export const saveFeasts = (feasts: Feast[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(feasts));
};

/** Add a new feast. */
export const addFeast = (feast: Feast) => {
  const feasts = loadFeasts();
  feasts.push(feast);
  saveFeasts(feasts);
};

/** Update an existing feast by id. */
export const updateFeast = (updated: Feast) => {
  const feasts = loadFeasts().map((f) => (f.id === updated.id ? updated : f));
  saveFeasts(feasts);
};

/** Delete a feast by id. */
export const deleteFeast = (id: string) => {
  const feasts = loadFeasts().filter((f) => f.id !== id);
  saveFeasts(feasts);
};

/** Seed default feasts if storage empty. */
export const seedDefaultFeasts = (defaults: Feast[]) => {
  const existing = loadFeasts();
  if (existing.length === 0) {
    saveFeasts(defaults);
  }
};

/** Explicitly restore predefined default feasts. */
export const resetToDefaultFeasts = (): Feast[] => {
  saveFeasts(DEFAULT_FEASTS_LIST);
  return DEFAULT_FEASTS_LIST;
};
