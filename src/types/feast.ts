/** Shared type for customer-facing preset feast cards */
export interface PresetFeast {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  accentColor: string;
  itemIds: string[];
}

