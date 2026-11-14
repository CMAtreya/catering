import { isSupabaseConfigured } from '@/lib/supabase'
import {
  getFeastsFromSupabase,
  saveFeastToSupabase,
  deleteFeastFromSupabase
} from './supabaseService'

export interface Feast {
  id: string;
  name: string;
  description: string;
  tag: string;
  itemIds: string[]; // references MenuItem.id
}

const STORAGE_KEY = 'tks_catering_feasts';

export const DEFAULT_FEASTS_LIST: Feast[] = [];

/** Load feasts from storage. Returns empty array if none found. */
export const loadFeasts = (): Feast[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
};

/** Persist feasts array to storage. */
export const saveFeasts = (feasts: Feast[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(feasts));
};

/** Async fetch from Supabase with local cache sync */
export const fetchFeastsAsync = async (): Promise<Feast[]> => {
  if (isSupabaseConfigured) {
    try {
      const dbFeasts = await getFeastsFromSupabase();
      if (dbFeasts) {
        saveFeasts(dbFeasts);
        return dbFeasts;
      }
    } catch (err) {
      console.warn('[Feasts][WARN] Failed to load feasts from Supabase, using local cache:', err);
    }
  }
  return loadFeasts();
};

/** Add a new feast. */
export const addFeast = (feast: Feast) => {
  const feasts = loadFeasts();
  feasts.push(feast);
  saveFeasts(feasts);

  if (isSupabaseConfigured) {
    saveFeastToSupabase(feast).catch((err) => {
      console.warn('[Feasts][WARN] Failed to save feast to Supabase:', err);
    });
  }
};

/** Update an existing feast by id. */
export const updateFeast = (updated: Feast) => {
  const feasts = loadFeasts().map((f) => (f.id === updated.id ? updated : f));
  saveFeasts(feasts);

  if (isSupabaseConfigured) {
    saveFeastToSupabase(updated).catch((err) => {
      console.warn('[Feasts][WARN] Failed to update feast in Supabase:', err);
    });
  }
};

/** Delete a feast by id. */
export const deleteFeast = (id: string) => {
  const feasts = loadFeasts().filter((f) => f.id !== id);
  saveFeasts(feasts);

  if (isSupabaseConfigured) {
    deleteFeastFromSupabase(id).catch((err) => {
      console.warn('[Feasts][WARN] Failed to delete feast in Supabase:', err);
    });
  }
};

/** Seed default feasts if storage empty. */
export const seedDefaultFeasts = (defaults: Feast[]) => {
  const existing = loadFeasts();
  if (existing.length === 0) {
    saveFeasts(defaults);
  }
};


