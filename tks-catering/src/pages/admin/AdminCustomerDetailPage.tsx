import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  Plus, 
  ChevronRight, 
  FileText, 
  MessageSquare,
  X,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { getCustomer, saveOrder } from '@/api'
import type { CustomerRecord, Order } from '@/data/mockData'
import { AdminAppShell } from '@/components/admin/AdminAppShell'
import { StatusChip } from '@/components/admin/StatusChip'
import { SourceChip } from '@/components/admin/SourceChip'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetClose 
} from '@/components/ui/sheet'
import { formatContactDate, formatEventDate } from '@/lib/format'

const OCCASION_PRESETS = [
  'Wedding',
  'Pooja',
  'Housewarming',
  'Birthday',
  'Naming ceremony',
  'Corporate',
  'Other'
]

export const AdminCustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState<CustomerRecord | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Record Enquiry Sheet State
  const [isRecordSheetOpen, setIsRecordSheetOpen] = useState<boolean>(false)
  const [enquiryOccasion, setEnquiryOccasion] = useState<string>('')
  const [enquiryNotes, setEnquiryNotes] = useState<string>('')
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState<boolean>(false)

  // Network online status for offline rules (disable saving while offline)
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  })

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load Customer & Orders
  const loadCustomerData = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const res = await getCustomer(id)
      if (!res.customer && res.orders.length === 0) {
        toast.error(`Customer record not found for ${id}`)
        navigate('/admin/customers')
        return
      }

      setCustomer(res.customer)
      // Sort orders newest first
      const sortedOrders = [...res.orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setOrders(sortedOrders)
    } catch (err) {
      console.error('Failed to load customer details:', err)
      toast.error('Failed to load customer profile')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCustomerData()
  }, [id])

  // Derive preferred address from orders or notes
  const preferredAddress = useMemo(() => {
    const orderWithAddress = orders.find((o) => o.venueAddress && o.venueAddress.trim().length > 0)
    return orderWithAddress?.venueAddress || 'Address to be confirmed upon order'
  }, [orders])

  // Get Initials for Avatar
  const customerInitials = useMemo(() => {
    if (!customer?.name) return 'C'
    const parts = customer.name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }, [customer?.name])

  // Record Enquiry Handler
  const handleRecordEnquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enquiryNotes.trim()) {
      toast.error('Please enter enquiry notes')
      return
    }

    if (!customer && !id) return
    setIsSubmittingEnquiry(true)

    try {
      const cleanPhone = (customer?.phone || id || '').replace(/^\+91/, '').replace(/\D/g, '')
      const todayStr = new Date().toISOString().split('T')[0]

      // Save as manual enquiry record which updates lastContacted and enquiryCount
      const newEnquiryOrder = await saveOrder({
        source: 'Manual',
        status: 'Under Discussion',
        customerPhone: cleanPhone,
        customerName: customer?.name || `Customer (${cleanPhone})`,
        eventType: enquiryOccasion.trim() || 'General Enquiry',
        eventDate: todayStr,
        eventTime: 'Morning',
        guestCount: 0,
        notes: enquiryNotes.trim(),
        enquiryNotes: enquiryNotes.trim(),
        venueAddress: preferredAddress !== 'Address to be confirmed upon order' ? preferredAddress : ''
      })

      // Optimistically update local customer state
      setCustomer((prev) => {
        if (!prev) return null
        return {
          ...prev,
          lastContacted: todayStr,
          enquiryCount: prev.enquiryCount + 1,
          notes: prev.notes ? `${prev.notes}\n[${todayStr}]: ${enquiryNotes.trim()}` : enquiryNotes.trim()
        }
      })

      // Add to orders timeline
      setOrders((prev) => [newEnquiryOrder, ...prev])

      toast.success('Enquiry recorded successfully')
      setIsRecordSheetOpen(false)
      setEnquiryNotes('')
      setEnquiryOccasion('')
    } catch (err) {
      console.error('Failed to record enquiry:', err)
      toast.error('Failed to log enquiry')
    } finally {
      setIsSubmittingEnquiry(false)
    }
  }

  if (isLoading || (!customer && orders.length === 0)) {
    return (
      <AdminAppShell title="Customer Profile" subtitle="Loading details...">
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse p-4">
          <div className="h-10 bg-slate-200/70 rounded-xl w-48" />
          <div className="h-44 bg-slate-100 rounded-2xl" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
      </AdminAppShell>
    )
  }

  const cleanPhone = (customer?.phone || id || '').replace(/^\+91/, '').replace(/\D/g, '')
  const telHref = `tel:+91${cleanPhone}`

  return (
    <AdminAppShell 
      title={customer?.name || `Customer (${cleanPhone})`} 
      subtitle="Customer history, enquiries and confirmed banquet bookings"
    >
      <div className="max-w-3xl mx-auto space-y-6 pb-28">

        {/* Top Navigation & Action Strip */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
          <Link
            to="/admin/customers"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand)] hover:underline tap-target-48 sm:tap-target-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Customers</span>
          </Link>

          {/* '+ Record enquiry' Button */}
          <button
            type="button"
            onClick={() => setIsRecordSheetOpen(true)}
            disabled={!isOnline}
            className="h-9 px-4 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] active:scale-95 text-white font-heading font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 tap-target-48 sm:tap-target-auto cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Record enquiry</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TOP CARD: Customer Name, Mobile (with Call button),      */}
        {/* Address, First/Last Contacted, Two Stat Tiles            */}
        {/* ======================================================== */}
        <div className="content-card p-5 sm:p-6 rounded-[24px] bg-white border border-slate-200/80 shadow-xs space-y-5">
          
          {/* Header Row: Initials Avatar, Name, Mobile with Green Call Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200/80 border border-amber-300/50 text-[var(--brand-900)] font-heading font-black text-lg flex items-center justify-center shrink-0 shadow-2xs select-none">
                {customerInitials}
              </div>

              <div className="min-w-0 space-y-1">
                <h1 className="font-heading font-black text-xl sm:text-2xl text-[var(--brand-900)] tracking-tight truncate">
                  {customer?.name || `Customer (${cleanPhone})`}
                </h1>
                <p className="text-xs font-semibold text-slate-500">
                  Keyed by mobile: <span className="font-bold text-slate-800">+91 {cleanPhone}</span>
                </p>
              </div>
            </div>

            {/* Green Call Button */}
            <a
              href={telHref}
              className="h-11 px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all tap-target-48 sm:tap-target-auto self-start sm:self-auto cursor-pointer"
              title={`Call +91 ${cleanPhone}`}
            >
              <Phone className="w-4 h-4 fill-white" />
              <span>Call +91 {cleanPhone}</span>
            </a>
          </div>

          {/* Details Row: Address, First contacted, Last contacted */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 text-xs sm:text-sm">
            {/* Address */}
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Delivery / Residence Address
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {preferredAddress}
                </p>
              </div>
            </div>

            {/* Contact Dates */}
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Relationship Timeline
                </span>
                <div className="text-xs text-slate-700 space-y-0.5">
                  <p>
                    <span className="text-slate-500">First contacted:</span>{' '}
                    <span className="font-bold">{formatContactDate(customer?.firstContacted)}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Last contacted:</span>{' '}
                    <span className="font-bold text-[var(--brand)]">{formatContactDate(customer?.lastContacted)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Two Stat Tiles for Total Enquiries and Confirmed Orders */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Total Enquiries */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-center space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                Total Enquiries
              </span>
              <p className="font-heading font-black text-2xl sm:text-3xl text-[var(--brand-900)]">
                {customer?.enquiryCount || orders.length}
              </p>
              <span className="text-[10px] text-amber-800/80 font-medium block">
                Discussions & inquiries
              </span>
            </div>

            {/* Confirmed Orders */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-center space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block">
                Confirmed Orders
              </span>
              <p className="font-heading font-black text-2xl sm:text-3xl text-emerald-800">
                {customer?.confirmedCount ?? orders.filter((o) => o.status === 'Confirmed' || o.status === 'Completed').length}
              </p>
              <span className="text-[10px] text-emerald-700/80 font-medium block">
                Banquets executed
              </span>
            </div>
          </div>

          {/* Customer General Preferences / Notes */}
          {customer?.notes && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Customer Preferences & CRM Notes:</span>
              </div>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line pl-5">
                {customer.notes}
              </p>
            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* 'ENQUIRIES AND ORDERS': Vertical timeline                */}
        {/* (Swiggy order-history style)                             */}
        {/* Tapping opens /admin/orders/:id                          */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-black text-base sm:text-lg text-[var(--brand-900)] tracking-tight">
                Enquiries and orders
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-medium">
                Complete vertical timeline of interactions and banquet bookings
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {orders.length} {orders.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          {orders.length > 0 ? (
            /* Vertical Timeline Container */
            <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {orders.map((ord) => {
                const isConfirmed = ord.status === 'Confirmed' || ord.status === 'Completed'

                return (
                  <div key={ord.id} className="relative group">
                    {/* Timeline Dot Marker */}
                    <div className={`absolute -left-6 sm:-left-8 top-5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-transform group-hover:scale-125 ${
                      isConfirmed
                        ? 'border-[var(--brand)] text-[var(--brand)]'
                        : 'border-amber-400 text-amber-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isConfirmed ? 'bg-[var(--brand)]' : 'bg-amber-400'}`} />
                    </div>

                    {/* Timeline Order Card (Tapping opens /admin/orders/:id) */}
                    <div
                      onClick={() => navigate(`/admin/orders/${ord.id}`)}
                      className="content-card p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer space-y-3"
                    >
                      {/* Top Row: Ref ID, Created Date, Chips, Chevron */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-black text-sm text-[var(--brand-900)]">
                            {ord.id}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            • {formatContactDate(ord.createdAt)}
                          </span>
                          <SourceChip source={ord.source} size="sm" />
                          <StatusChip status={ord.status} size="sm" />
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-[var(--brand)] transition-colors">
                          <span>View order</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>

                      {/* Event Details: Occasion, Date, Plates */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900">
                            {ord.eventType || 'Catering Function'}
                          </span>
                          <p className="text-slate-500 font-medium flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Occasion Date: {formatEventDate(ord.eventDate)}</span>
                          </p>
                        </div>

                        <div className="space-y-0.5 sm:text-right">
                          <p className="font-bold text-slate-800 flex items-center sm:justify-end gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>{ord.guestCount || 0} Plates</span>
                          </p>
                          <p className="text-slate-500 font-medium">
                            {ord.items?.length || 0} dishes selected
                          </p>
                        </div>
                      </div>

                      {/* Special Instructions (if any) */}
                      {(ord.specialInstructions || ord.notes) && (
                        <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 border border-slate-100 flex items-start gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            <strong className="text-slate-700">Special Instructions:</strong>{' '}
                            {ord.specialInstructions || ord.notes}
                          </span>
                        </div>
                      )}

                      {/* Enquiry Notes (if any) */}
                      {ord.enquiryNotes && (
                        <div className="p-2.5 rounded-xl bg-amber-50/60 text-[11px] text-amber-900 border border-amber-200/70 flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            <strong className="text-amber-950">Enquiry Notes:</strong> {ord.enquiryNotes}
                          </span>
                        </div>
                      )}

                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-white space-y-2">
              <p className="text-xs text-slate-500 font-medium">
                No enquiries or confirmed orders recorded yet for this customer.
              </p>
              <button
                type="button"
                onClick={() => setIsRecordSheetOpen(true)}
                className="text-xs font-bold text-[var(--brand)] hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record first enquiry note</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ======================================================== */}
      {/* '+ RECORD ENQUIRY' BOTTOM SHEET                          */}
      {/* Enquiry notes textarea, optional occasion type           */}
      {/* Updates Last contacted and Total enquiries               */}
      {/* ======================================================== */}
      <Sheet open={isRecordSheetOpen} onOpenChange={setIsRecordSheetOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="max-w-lg mx-auto rounded-t-[24px] p-0 bg-white">
          <SheetHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <SheetTitle className="font-heading font-black text-base sm:text-lg text-[var(--brand-900)]">
                Record Customer Enquiry
              </SheetTitle>
              <p className="text-xs text-slate-500">
                Log a phone conversation or enquiry note for <span className="font-bold text-slate-700">{customer?.name}</span>
              </p>
            </div>
            <SheetClose asChild>
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </SheetClose>
          </SheetHeader>

          <form onSubmit={handleRecordEnquiry} className="p-5 space-y-4">
            
            {/* Optional Occasion Type */}
            <div className="space-y-1.5">
              <label htmlFor="enquiry-occasion" className="text-xs font-bold text-slate-700">
                Occasion Type <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              
              {/* Preset suggestion chips */}
              <div className="flex flex-wrap gap-1.5 pb-1">
                {OCCASION_PRESETS.map((occ) => (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => setEnquiryOccasion(occ)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                      enquiryOccasion.toLowerCase() === occ.toLowerCase()
                        ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>

              <Input
                id="enquiry-occasion"
                value={enquiryOccasion}
                onChange={(e) => setEnquiryOccasion(e.target.value)}
                placeholder="e.g. Wedding Reception, Gruhapravesha"
                className="bg-slate-50"
              />
            </div>

            {/* Enquiry Notes Textarea (Required) */}
            <div className="space-y-1.5">
              <label htmlFor="enquiry-notes" className="text-xs font-bold text-slate-700">
                Enquiry Notes <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="enquiry-notes"
                autoFocus
                rows={3}
                value={enquiryNotes}
                onChange={(e) => setEnquiryNotes(e.target.value)}
                placeholder="e.g. Spoke to customer regarding muhurtham on 14th Dec. They require traditional banana leaf meal service for 250 guests. Follow up on Monday."
                className="bg-slate-50"
                required
              />
              <p className="text-[10px] text-slate-400">
                Logging this enquiry will update the customer's Last Contacted date to today and increment Total Enquiries.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRecordSheetOpen(false)}
                className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingEnquiry || !enquiryNotes.trim() || !isOnline}
                className="px-6 py-2.5 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white text-xs font-bold shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmittingEnquiry ? (
                  <span>Saving enquiry...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Enquiry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

    </AdminAppShell>
  )
}

export default AdminCustomerDetailPage
