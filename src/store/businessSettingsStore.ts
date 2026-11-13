import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isSupabaseConfigured } from '@/lib/supabase'
import { getBusinessSettingsFromSupabase, saveBusinessSettingsToSupabase } from '@/api/supabaseService'

export interface BusinessSettings {
  businessName: string
  companyLegalName: string
  tagline: string
  phone: string
  mobile: string
  email: string
  address: string
  kitchenAddress: string
  gstin: string
  fssaiNumber: string
}

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: "TKS Iyengar's Catering",
  companyLegalName: "TKS Catering Services Pvt. Ltd.",
  tagline: "Authentic Mysuru Brahmin Heritage Catering",
  phone: "0821-2448920",
  mobile: "+91 98450 12345",
  email: "orders@tksiyengarscatering.com",
  address: "Shop 14, 5th Main Road, Vani Vilas Mohalla, Mysuru, Karnataka 570002",
  kitchenAddress: "142/A, Krishnamurthy Puram, Mysuru, Karnataka 570004",
  gstin: "29ABCDE1234F1Z5",
  fssaiNumber: "11223344556677"
}

interface BusinessSettingsState {
  settings: BusinessSettings
  updateSettings: (newSettings: Partial<BusinessSettings>) => void
  resetToDefaults: () => void
  syncFromBackend: () => Promise<void>
}

export const useBusinessSettingsStore = create<BusinessSettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_BUSINESS_SETTINGS,
      updateSettings: (newSettings) => {
        const updated = { ...get().settings, ...newSettings }
        set({ settings: updated })
        if (isSupabaseConfigured) {
          saveBusinessSettingsToSupabase({
            name: updated.businessName,
            legalName: updated.companyLegalName,
            tagline: updated.tagline,
            phone: updated.phone || updated.mobile,
            email: updated.email,
            address: updated.address,
            city: 'Mysuru, Karnataka',
            pincode: '570002',
            fssaiNumber: updated.fssaiNumber,
            gstNumber: updated.gstin
          }).catch((err) => console.warn('[BusinessSettings] Sync to Supabase failed:', err))
        }
      },
      resetToDefaults: () => {
        set({ settings: DEFAULT_BUSINESS_SETTINGS })
        if (isSupabaseConfigured) {
          saveBusinessSettingsToSupabase({
            name: DEFAULT_BUSINESS_SETTINGS.businessName,
            legalName: DEFAULT_BUSINESS_SETTINGS.companyLegalName,
            tagline: DEFAULT_BUSINESS_SETTINGS.tagline,
            phone: DEFAULT_BUSINESS_SETTINGS.phone,
            email: DEFAULT_BUSINESS_SETTINGS.email,
            address: DEFAULT_BUSINESS_SETTINGS.address,
            city: 'Mysuru, Karnataka',
            pincode: '570002',
            fssaiNumber: DEFAULT_BUSINESS_SETTINGS.fssaiNumber,
            gstNumber: DEFAULT_BUSINESS_SETTINGS.gstin
          }).catch((err) => console.warn('[BusinessSettings] Sync to Supabase failed:', err))
        }
      },
      syncFromBackend: async () => {
        if (!isSupabaseConfigured) return
        try {
          const remote = await getBusinessSettingsFromSupabase()
          if (remote) {
            set((state) => ({
              settings: {
                ...state.settings,
                businessName: remote.name || state.settings.businessName,
                companyLegalName: remote.legalName || state.settings.companyLegalName,
                address: remote.address || state.settings.address,
                phone: remote.phone || state.settings.phone,
                gstin: remote.gstNumber || state.settings.gstin
              }
            }))
          }
        } catch (e) {
          console.warn('[BusinessSettings] Failed to fetch settings from Supabase:', e)
        }
      }
    }),
    {
      name: 'tks_business_settings'
    }
  )
)
