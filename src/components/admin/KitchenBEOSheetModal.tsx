import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Printer, Share2, ChefHat } from 'lucide-react'
import { toast } from 'sonner'
import type { Order } from '@/data/mockData'
import { formatRupees, formatEventDate } from '@/lib/format'

interface KitchenBEOSheetModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
}

export const KitchenBEOSheetModal: React.FC<KitchenBEOSheetModalProps> = ({
  order,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null

  const guests = order.guestCount
  const bufferGuests = Math.ceil(guests * 1.10) // 10% buffer for kitchen safety

  // Standard South Indian banquet raw-material scaling formulas
  const riceKg = Math.round(guests * 0.12)
  const gheeLiters = (guests * 0.035).toFixed(1)
  const dalKg = Math.round(guests * 0.045)
  const bananaLeaves = bufferGuests
  const serversNeeded = Math.max(2, Math.ceil(guests / 25))

  const handlePrint = () => {
    window.print()
  }

  const handleShareChefWhatsApp = () => {
    const dishList = order.items.map((it, idx) => `${idx + 1}. ${it.name}`).join('%0A')
    const text = `👨‍🍳 *TKS CATERING — KITCHEN BEO DISPATCH SHEET*%0A%0A*Order ID:* ${order.id}%0A*Occasion:* ${order.eventType}%0A*Date:* ${formatEventDate(order.eventDate)} (${order.eventTime || 'Morning'})%0A*Target Plates:* ${guests} Plates (Prepare for ${bufferGuests} with buffer)%0A*Venue:* ${order.venueAddress || 'Self-Pickup'}%0A%0A*RAW MATERIAL ALLOCATION:*%0A• Sona Masoori Rice: ${riceKg} kg%0A• Pure Cow Ghee: ${gheeLiters} Liters%0A• Toor Dal / Pulses: ${dalKg} kg%0A• Fresh Plantain Leaves: ${bananaLeaves} leaves%0A• Leaf Servers Required: ${serversNeeded} staff%0A%0A*CONFIRMED MENU:*%0A${dishList}%0A%0A*Special Instructions:* ${order.notes || order.specialInstructions || 'Strict Satvik preparation, pristine hygiene standards.'}`

    window.open(`https://wa.me/?text=${text}`, '_blank')
    toast.success('BEO formatted for WhatsApp!')
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-base sm:text-lg">
                    Kitchen BEO (Banquet Event Order) Sheet
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    Live Scaling
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Procurement quantities, cooking batches & leaf server allocation for {order.id}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Printable BEO Sheet Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-900 bg-white" id="printable-beo-sheet">
            
            {/* Event Overview Grid */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Customer</span>
                <span className="font-bold text-slate-800">{order.customerName}</span>
                <span className="text-slate-500 block">{order.customerPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Event Date & Time</span>
                <span className="font-bold text-slate-800">{formatEventDate(order.eventDate)}</span>
                <span className="text-amber-700 font-semibold block">{order.eventTime || 'Morning'} Service</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Plates & Target Buffer</span>
                <span className="font-heading font-black text-sm text-[var(--brand)]">{guests} Plates</span>
                <span className="text-emerald-700 font-semibold block">Prep for {bufferGuests} (+10%)</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Function Type</span>
                <span className="font-bold text-slate-800">{order.eventType}</span>
                <span className="text-slate-500 truncate block">{order.venueAddress || 'Mysuru'}</span>
              </div>
            </div>

            {/* Raw Material Procurement Estimation */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Kitchen Raw Material Procurement Allocation
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-center">
                  <span className="text-xs text-amber-800 font-bold block">Sona Masoori Rice</span>
                  <span className="font-heading font-black text-lg text-amber-950 block">{riceKg} kg</span>
                  <span className="text-[10px] text-amber-700">Cooking batch</span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-center">
                  <span className="text-xs text-amber-800 font-bold block">Pure Cow Ghee</span>
                  <span className="font-heading font-black text-lg text-amber-950 block">{gheeLiters} L</span>
                  <span className="text-[10px] text-amber-700">Royal aroma</span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-center">
                  <span className="text-xs text-amber-800 font-bold block">Toor Dal & Pulses</span>
                  <span className="font-heading font-black text-lg text-amber-950 block">{dalKg} kg</span>
                  <span className="text-[10px] text-amber-700">Sambar & Rasam</span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center">
                  <span className="text-xs text-emerald-800 font-bold block">Banana Leaves</span>
                  <span className="font-heading font-black text-lg text-emerald-950 block">{bananaLeaves}</span>
                  <span className="text-[10px] text-emerald-700">Fresh cut + buffer</span>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 text-center col-span-2 sm:col-span-1">
                  <span className="text-xs text-blue-800 font-bold block">Leaf Servers</span>
                  <span className="font-heading font-black text-lg text-blue-950 block">{serversNeeded}</span>
                  <span className="text-[10px] text-blue-700">Uniformed staff</span>
                </div>
              </div>
            </div>

            {/* Menu Execution Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Menu Preparation Breakdown ({order.items.length} items)
              </span>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {order.items.map((item, idx) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs bg-white hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-900">{item.name}</span>
                    </div>
                    <span className="text-slate-500 font-medium">{formatRupees(item.pricePerPlate)} / plate</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Preparation Instructions */}
            {(order.notes || order.specialInstructions) && (
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-1">Kitchen Preparation Notes:</span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {order.notes || order.specialInstructions}
                </p>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-slate-500 font-medium">
              Official TKS Catering Kitchen Document
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print BEO</span>
              </button>

              <button
                type="button"
                onClick={handleShareChefWhatsApp}
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-98"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Send to Head Chef (WhatsApp)</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
export default KitchenBEOSheetModal

