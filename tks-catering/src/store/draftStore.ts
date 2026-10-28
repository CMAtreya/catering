import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MenuItem } from '@/data/mockData'

export interface SelectedItem {
  id: string
  name: string
  pricePerPlate: number
  quantity: number
  category: string
}

export interface EventRequirements {
  guestCount: number
  eventDate: string
  eventTime: 'Morning' | 'Afternoon' | 'Evening'
  eventType: string
  venueAddress: string
  notes: string
  includeBuffer?: boolean // 10% Kitchen safety buffer
  tastingRequested?: boolean // Private tasting box request
}

export interface ContactDetails {
  name: string
  phone: string
}

interface DraftState {
  // Item selections: map of itemId -> SelectedItem
  items: Record<string, SelectedItem>
  requirements: EventRequirements
  contact: ContactDetails

  // Item actions
  addItem: (item: MenuItem) => void
  removeItem: (itemId: string) => void
  toggleItem: (item: MenuItem) => void
  incrementItem: (itemId: string) => void
  decrementItem: (itemId: string) => void
  setItemQuantity: (itemId: string, quantity: number) => void
  clearItems: () => void
  loadPresetFeast: (itemsList: MenuItem[], eventTypeName?: string) => void

  // Requirements actions
  setRequirements: (req: Partial<EventRequirements>) => void
  setContact: (contact: Partial<ContactDetails>) => void
  resetDraft: () => void

  // Computed getters
  getTotalItemsCount: () => number
  getPerPlateTotal: () => number
  getFoodSubtotal: () => number
  getTierDiscountPercent: () => number
  getDiscountedPerPlateTotal: () => number
  getSafetyBufferPlates: () => number
  getTotalPlatesWithBuffer: () => number
  getFinalEstimatedTotal: () => number
}

const DEFAULT_REQUIREMENTS: EventRequirements = {
  guestCount: 100,
  eventDate: '',
  eventTime: 'Morning',
  eventType: 'Traditional Feast',
  venueAddress: '',
  notes: '',
  includeBuffer: false,
  tastingRequested: false
}

const DEFAULT_CONTACT: ContactDetails = {
  name: '',
  phone: ''
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      items: {},
      requirements: { ...DEFAULT_REQUIREMENTS },
      contact: { ...DEFAULT_CONTACT },

      addItem: (item: MenuItem) => {
        set((state) => {
          const current = state.items[item.id]
          if (current) {
            return {
              items: {
                ...state.items,
                [item.id]: { ...current, quantity: current.quantity + 1 }
              }
            }
          }
          return {
            items: {
              ...state.items,
              [item.id]: {
                id: item.id,
                name: item.name,
                pricePerPlate: item.pricePerPlate,
                quantity: 1,
                category: item.category
              }
            }
          }
        })
      },

      removeItem: (itemId: string) => {
        set((state) => {
          const next = { ...state.items }
          delete next[itemId]
          return { items: next }
        })
      },

      toggleItem: (item: MenuItem) => {
        set((state) => {
          if (state.items[item.id]) {
            const next = { ...state.items }
            delete next[item.id]
            return { items: next }
          }
          return {
            items: {
              ...state.items,
              [item.id]: {
                id: item.id,
                name: item.name,
                pricePerPlate: item.pricePerPlate,
                quantity: 1,
                category: item.category
              }
            }
          }
        })
      },

      incrementItem: (itemId: string) => {
        set((state) => {
          const current = state.items[itemId]
          if (!current) return state
          return {
            items: {
              ...state.items,
              [itemId]: { ...current, quantity: current.quantity + 1 }
            }
          }
        })
      },

      decrementItem: (itemId: string) => {
        set((state) => {
          const current = state.items[itemId]
          if (!current) return state
          if (current.quantity <= 1) {
            const next = { ...state.items }
            delete next[itemId]
            return { items: next }
          }
          return {
            items: {
              ...state.items,
              [itemId]: { ...current, quantity: current.quantity - 1 }
            }
          }
        })
      },

      setItemQuantity: (itemId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            const next = { ...state.items }
            delete next[itemId]
            return { items: next }
          }
          const current = state.items[itemId]
          if (!current) return state
          return {
            items: {
              ...state.items,
              [itemId]: { ...current, quantity }
            }
          }
        })
      },

      clearItems: () => set({ items: {} }),

      loadPresetFeast: (itemsList: MenuItem[], eventTypeName?: string) => {
        const newMap: Record<string, SelectedItem> = {}
        for (const item of itemsList) {
          newMap[item.id] = {
            id: item.id,
            name: item.name,
            pricePerPlate: item.pricePerPlate,
            quantity: 1,
            category: item.category
          }
        }
        set((state) => ({
          items: newMap,
          requirements: {
            ...state.requirements,
            ...(eventTypeName ? { eventType: eventTypeName } : {})
          }
        }))
      },

      setRequirements: (req) =>
        set((state) => ({
          requirements: { ...state.requirements, ...req }
        })),

      setContact: (contact) =>
        set((state) => ({
          contact: { ...state.contact, ...contact }
        })),

      resetDraft: () =>
        set({
          items: {},
          requirements: { ...DEFAULT_REQUIREMENTS },
          contact: { ...DEFAULT_CONTACT }
        }),

      getTotalItemsCount: () => {
        const items = Object.values(get().items)
        return items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getPerPlateTotal: () => {
        const items = Object.values(get().items)
        return items.reduce((sum, item) => sum + item.pricePerPlate * item.quantity, 0)
      },

      getTierDiscountPercent: () => {
        const guests = get().requirements.guestCount || 0
        if (guests >= 500) return 12 // 12% bulk banquet discount
        if (guests >= 250) return 8  // 8% wedding feast discount
        if (guests >= 100) return 5  // 5% standard banquet discount
        return 0
      },

      getDiscountedPerPlateTotal: () => {
        const raw = get().getPerPlateTotal()
        const disc = get().getTierDiscountPercent()
        if (disc <= 0) return raw
        return Math.round(raw * (1 - disc / 100))
      },

      getSafetyBufferPlates: () => {
        const req = get().requirements
        if (!req.includeBuffer) return 0
        const guests = req.guestCount || 0
        return Math.max(5, Math.ceil(guests * 0.10)) // 10% safety buffer (min 5 plates)
      },

      getTotalPlatesWithBuffer: () => {
        const guests = get().requirements.guestCount || 0
        return guests + get().getSafetyBufferPlates()
      },

      getFoodSubtotal: () => {
        const perPlate = get().getDiscountedPerPlateTotal()
        const guests = Math.max(1, get().requirements.guestCount || 1)
        return perPlate * guests
      },

      getFinalEstimatedTotal: () => {
        const perPlate = get().getDiscountedPerPlateTotal()
        const totalPlates = Math.max(1, get().getTotalPlatesWithBuffer())
        return perPlate * totalPlates
      }
    }),
    {
      name: 'tks-catering-draft-selection'
    }
  )
)
