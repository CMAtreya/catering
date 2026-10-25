import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OrderStatus } from '@/data/mockData'

export interface LocalEnquiryItem {
  id: string
  name: string
  pricePerPlate: number
  quantity: number
}

export interface LocalEnquiryRecord {
  orderId: string
  createdAt: string
  eventDate: string
  eventTime: 'Morning' | 'Afternoon' | 'Evening'
  eventType: string
  guestCount: number
  totalAmount: number
  status: OrderStatus
  customerName: string
  customerPhone: string
  itemsCount: number
  itemsSummary: string
  itemsList?: LocalEnquiryItem[]
  perPlateTotal?: number
  venueAddress?: string
  notes?: string
}

interface EnquiryHistoryState {
  enquiries: LocalEnquiryRecord[]
  addEnquiry: (enquiry: LocalEnquiryRecord) => void
  getEnquiryById: (orderId: string) => LocalEnquiryRecord | undefined
  clearHistory: () => void
}

export const useEnquiryStore = create<EnquiryHistoryState>()(
  persist(
    (set, get) => ({
      enquiries: [],

      addEnquiry: (newRecord) => {
        set((state) => ({
          enquiries: [
            newRecord,
            ...state.enquiries.filter((e) => e.orderId !== newRecord.orderId)
          ]
        }))
      },

      getEnquiryById: (orderId) => {
        return get().enquiries.find((e) => e.orderId === orderId)
      },

      clearHistory: () => set({ enquiries: [] })
    }),
    {
      name: 'tks-catering-local-enquiries'
    }
  )
)
