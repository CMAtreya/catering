import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Check, Send } from 'lucide-react'
import { toast } from 'sonner'
import type { MenuItem } from '@/data/mockData'

interface TastingSessionModalProps {
  isOpen: boolean
  onClose: () => void
  availableItems: MenuItem[]
}

export const TastingSessionModal: React.FC<TastingSessionModalProps> = ({
  isOpen,
  onClose,
  availableItems
}) => {
  const [tastingType, setTastingType] = useState<'center' | 'doorstep'>('center')
  const [selectedDishes, setSelectedDishes] = useState<string[]>([
    'item-1',  // Bisi Bele Bath
    'item-10', // Mysore Pak
    'item-11', // Kesari Bath
    'item-15'  // Medu Vada
  ])
  const [hostName, setHostName] = useState('')
  const [phone, setPhone] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [address, setAddress] = useState('')

  const toggleDish = (id: string) => {
    if (selectedDishes.includes(id)) {
      if (selectedDishes.length <= 1) {
        toast.error('Please keep at least 1 dish for tasting')
        return
      }
      setSelectedDishes(selectedDishes.filter((d) => d !== id))
    } else {
      if (selectedDishes.length >= 4) {
        toast.info('Maximum 4 sample dishes allowed for tasting box')
        return
      }
      setSelectedDishes([...selectedDishes, id])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hostName.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    const dishNames = selectedDishes
      .map((id) => availableItems.find((it) => it.id === id)?.name)
      .filter(Boolean)
      .join(', ')

    // Direct WhatsApp booking message
    const cleanPhone = phone.replace(/\D/g, '')
    const msg = `Namaskara TKS Catering! I would like to book a *Private Tasting Session* for my upcoming banquet.%0A%0A*Name:* ${encodeURIComponent(hostName)}%0A*Phone:* ${cleanPhone}%0A*Format:* ${tastingType === 'center' ? 'In-Person at Mysuru Banquet Center' : 'Doorstep Sample Box'}%0A*Tentative Event Date:* ${eventDate || 'To be decided'}%0A${address ? `*Delivery Address:* ${encodeURIComponent(address)}%0A` : ''}*Sample Dishes Selected (4):* ${encodeURIComponent(dishNames)}`

    toast.success('Tasting appointment requested!', {
      description: 'Redirecting to WhatsApp for instant coordinator confirmation...'
    })

    window.open(`https://wa.me/919000000000?text=${msg}`, '_blank')
    onClose()
  }

  if (!isOpen) return null

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
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-[var(--brand-900)] via-[var(--brand)] to-[var(--brand-800)] text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl shadow-xs">
                ✨
              </div>
              <div>
                <h3 className="font-heading font-black text-base sm:text-lg">
                  Book a Private Feast Tasting Session
                </h3>
                <p className="text-xs text-white/80 font-medium">
                  Experience authentic flavors before finalizing your grand wedding or banquet.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close tasting modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
            
            {/* 1. Format Selection: In-Person Center vs Doorstep Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                Tasting Format <span className="text-[var(--brand)]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTastingType('center')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    tastingType === 'center'
                      ? 'border-[var(--brand)] bg-amber-50/70 ring-2 ring-[var(--brand)]/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg block mb-1">🏛️</span>
                  <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 block">
                    Mysuru Center Tasting
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Complimentary • Meet our Head Chef
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTastingType('doorstep')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    tastingType === 'doorstep'
                      ? 'border-[var(--brand)] bg-amber-50/70 ring-2 ring-[var(--brand)]/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg block mb-1">📦</span>
                  <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 block">
                    Doorstep Tasting Box
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Delivered hot in Mysore city
                  </span>
                </button>
              </div>
            </div>

            {/* 2. Choose 4 Sample Dishes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800">
                  Select up to 4 Signature Dishes to Taste:
                </label>
                <span className="font-bold text-[var(--brand)]">
                  {selectedDishes.length} / 4 Selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-200 rounded-2xl bg-slate-50/50">
                {availableItems.map((item) => {
                  const isChecked = selectedDishes.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleDish(item.id)}
                      className={`p-2 rounded-xl text-left border text-xs font-semibold flex items-center justify-between gap-1 transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[var(--brand)] text-white border-[var(--brand)] shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="truncate">{item.name}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3. Host Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Host Name *</label>
                <input
                  type="text"
                  required
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="e.g. Srinivas Raghavan"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[var(--brand)] font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 98450 12345"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[var(--brand)] font-medium"
                />
              </div>
            </div>

            {/* 4. Event Date & Venue (optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Planned Function Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[var(--brand)] font-medium"
                />
              </div>

              {tastingType === 'doorstep' && (
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block">Delivery Address in Mysuru *</label>
                  <input
                    type="text"
                    required={tastingType === 'doorstep'}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 45, Saraswathipuram, Mysore"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[var(--brand)] font-medium"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request Tasting via WhatsApp</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
export default TastingSessionModal

