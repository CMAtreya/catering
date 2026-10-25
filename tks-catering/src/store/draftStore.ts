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

  // Requirements actions
  setRequirements: (req: Partial<EventRequirements>) => void
  setContact: (contact: Partial<ContactDetails>) => void
  resetDraft: () => void

  // Computed getters
  getTotalItemsCount: () => number
  getPerPlateTotal: () => number
  getFoodSubtotal: () => number
}

const DEFAULT_REQUIREMENTS: EventRequirements = {
  guestCount: 100,
  eventDate: '',
  eventTime: 'Morning',
  eventType: 'Traditional Feast',
  venueAddress: '',
  notes: ''
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

      getFoodSubtotal: () => {
        const perPlate = get().getPerPlateTotal()
        const guests = Math.max(1, get().requirements.guestCount || 1)
        return perPlate * guests
      }
    }),
    {
      name: 'tks-catering-draft-selection'
    }
  )
)
