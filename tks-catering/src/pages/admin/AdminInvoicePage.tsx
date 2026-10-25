import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Printer, 
  AlertCircle, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Users 
} from 'lucide-react'
import { toast } from 'sonner'
import { getOrder } from '@/api'
import type { Order } from '@/data/mockData'
import { formatRupees } from '@/lib/format'
import { calculateOrderPricing } from '@/lib/pricing'
import { buildInvoicePdf } from '@/lib/pdfInvoice'
import { StatusChip } from '@/components/admin/StatusChip'

export const AdminInvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [isSharing, setIsSharing] = useState<boolean>(false)

  // Fetch Order
  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    getOrder(id)
      .then((res) => {
        if (!res) {
          toast.error(`Order ${id} not found`)
          navigate('/admin/orders')
          return
        }
        setOrder(res)
      })
      .catch(() => {
        toast.error('Failed to load order')
        navigate('/admin/orders')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [id, navigate])

  // Calculation breakdown
  const perPlatePrice = useMemo(() => {
    if (!order) return 0
    return order.items.reduce((sum, item) => sum + (item.pricePerPlate * (item.quantity || 1)), 0)
  }, [order])

  const pricing = useMemo(() => {
    if (!order) {
      return {
        perPlatePrice: 0,
        guestCount: 0,
        foodSubtotal: 0,
        deliveryCharges: 0,
        customizationCharges: 0,
        gstMode: 'percent' as const,
        gstValue: 5,
        gstAmount: 0,
        finalTotal: 0,
        formulaText: ''
      }
    }
    return calculateOrderPricing({
      perPlatePrice,
      guestCount: order.guestCount,
      deliveryCharges: order.deliveryCharges || 0,
      customizationCharges: order.customizationCharges || 0,
      gstMode: order.gstMode || 'percent',
      gstValue: order.gstValue !== undefined ? order.gstValue : 5
    })
  }, [order, perPlatePrice])

  // Clean filename: TKS-<id>-Invoice.pdf
  const pdfFileName = useMemo(() => {
    if (!order) return 'TKS-Invoice.pdf'
    const cleanId = order.id.replace(/^TKS-/, '')
    return `TKS-${cleanId}-Invoice.pdf`
  }, [order])

  // Format occasion date
  const formattedEventDate = useMemo(() => {
    if (!order?.eventDate) return 'Date to be finalized'
    try {
      const [y, m, d] = order.eventDate.split('-').map(Number)
      return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return order.eventDate
    }
  }, [order])

  // Download PDF Action
  const handleDownloadPdf = () => {
    if (!order) return
    setIsDownloading(true)
    try {
      const doc = buildInvoicePdf(order, pricing)
      doc.save(pdfFileName)
      toast.success(`Downloaded ${pdfFileName}`)
    } catch (err) {
      console.error('PDF generation error:', err)
      toast.error('Failed to generate PDF document')
    } finally {
      setIsDownloading(false)
    }
  }

  // Share Action: navigator.share where supported, otherwise download + toast
  const handleShare = async () => {
    if (!order) return
    setIsSharing(true)
    try {
      const doc = buildInvoicePdf(order, pricing)
      const pdfBlob = doc.output('blob')
      const pdfFile = new File([pdfBlob], pdfFileName, { type: 'application/pdf' })

      // Check if navigator.share and canShare with files is supported
      if (
        typeof navigator !== 'undefined' &&
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [pdfFile] })
      ) {
        try {
          await navigator.share({
            title: `Invoice ${order.id}`,
            text: `TKS Iyengars Catering Invoice for ${order.customerName}`,
            files: [pdfFile]
          })
          toast.success('Invoice shared successfully')
          return
        } catch (err: unknown) {
          // If user simply closed/cancelled the native share sheet
          if (err instanceof Error && err.name === 'AbortError') {
            return
          }
          console.warn('Navigator share error, falling back to download:', err)
        }
      }

      // Fallback: download file plus exact prompt message: 'Saved. Share it from your downloads'
      doc.save(pdfFileName)
      toast.info('Saved. Share it from your downloads')
    } catch (err) {
      console.error('Share action failed:', err)
      toast.error('Failed to prepare share file')
    } finally {
      setIsSharing(false)
    }
  }

  // Native print support
  const handlePrint = () => {
    window.print()
  }

  if (isLoading || !order) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[var(--brand)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Loading invoice preview...</p>
        </div>
      </div>
    )
  }

  // Access Control: available ONLY once the order is Confirmed or later
  const isConfirmedOrLater = order.status === 'Confirmed' || order.status === 'Completed'

  if (!isConfirmedOrLater) {
    return (
      <div className="min-h-screen bg-slate-100 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-2xl">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-heading font-black text-xl text-slate-900">
              Invoice Available After Confirmation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Official tax invoices and formal banquet function sheets can only be generated once the order is <span className="font-bold text-slate-700">Confirmed</span> or completed.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Current Status:</span>
            <StatusChip status={order.status} size="sm" />
          </div>

          <div className="pt-2">
            <Link
              to={`/admin/orders/${order.id}`}
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white font-heading font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Order #{order.id}</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const cleanId = order.id.replace(/^TKS-/, '')
  const guestPlates = order.guestCount || 1

  return (
    <div className="min-h-screen bg-slate-100/90 py-6 px-4 pb-36 print:p-0 print:bg-white text-slate-800">
      
      {/* Top action strip (Screen only) */}
      <div className="max-w-3xl mx-auto mb-5 flex items-center justify-between gap-3 print:hidden">
        <Link
          to={`/admin/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[var(--brand)] bg-white px-3.5 py-2 rounded-full border border-slate-200 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order #{order.id}</span>
        </Link>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white px-3.5 py-2 rounded-full border border-slate-200 shadow-xs transition-colors"
          title="Print using browser dialog"
        >
          <Printer className="w-4 h-4" />
          <span>Print</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* CLEAN A4-PROPORTION WHITE DOCUMENT PREVIEW (Overflow-x contained on small phones) */}
      {/* Brand colour ONLY in header band and total row           */}
      {/* ======================================================== */}
      <div className="w-full overflow-x-auto touch-pan-x pb-2">
        <div className="min-w-[300px] max-w-3xl mx-auto bg-white rounded-2xl shadow-xl print:shadow-none border border-slate-200/90 print:border-none overflow-hidden">
        
        {/* 1. HEADER BAND (in Brand Colour) */}
        <div className="bg-[var(--brand)] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 print:bg-[var(--brand)] print:text-white">
          <div className="flex items-center gap-3.5">
            {/* Logo Tile with Official Logo */}
            <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-xs shrink-0 select-none">
              <img src="/logo-128.webp" alt="TKS Iyengars Logo" width="48" height="48" decoding="async" className="w-full h-full object-contain" />
            </div>
            <div className="space-y-0.5">
              <h1 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight">
                TKS Iyengars Catering
              </h1>
              <p className="text-[11px] sm:text-xs text-amber-100 font-medium leading-tight">
                142/A, Krishnamurthy Puram, Mysuru, Karnataka 570004
              </p>
              <p className="text-[11px] sm:text-xs text-amber-200/90 font-medium">
                Phone: +91 90000 00000 • GSTIN: 29AAAAA0000A1Z5
              </p>
            </div>
          </div>

          {/* Title 'Invoice' with invoice number and date */}
          <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-white/20">
            <span className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wider block">
              INVOICE
            </span>
            <p className="text-xs font-bold text-amber-100">
              Invoice #{cleanId}
            </p>
            <p className="text-[11px] text-amber-200/80 font-medium">
              Date: {new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* 2. BODY CONTENT (Clean, print-safe, monochrome/slate) */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* Customer & Event Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 'Billed to' block (customer name, mobile, delivery address) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Billed To
              </span>
              <p className="font-heading font-black text-base text-slate-900">
                {order.customerName}
              </p>
              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>+91 {order.customerPhone.replace(/^\+91/, '')}</span>
              </p>
              <p className="text-xs text-slate-600 flex items-start gap-1.5 pt-0.5 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{order.venueAddress || 'Delivery Address specified at booking'}</span>
              </p>
            </div>

            {/* Event block (occasion, occasion date) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Event Booking
              </span>
              <p className="font-heading font-black text-base text-slate-900">
                {order.eventType || 'Catering Function'}
              </p>
              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{formattedEventDate}</span>
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-600 pt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.eventTime || 'Morning'} Service</span>
                </span>
                <span className="flex items-center gap-1 font-bold text-slate-800">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{guestPlates} Plates</span>
                </span>
              </div>
            </div>
          </div>

          {/* 3. TABLE OF SELECTED ITEMS: Item, Price per plate, Plates and Amount */}
          <div className="space-y-2">
            <div className="border border-slate-200 rounded-xl overflow-x-auto touch-pan-x">
              <table className="w-full min-w-[340px] text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-right">Price per plate</th>
                    <th className="py-2.5 px-3 text-center">Plates</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {order.items.map((item) => {
                    const rowAmount = item.pricePerPlate * guestPlates
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {item.name}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium">
                          {formatRupees(item.pricePerPlate)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 font-medium">
                          {guestPlates}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatRupees(rowAmount)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. TOTALS BLOCK */}
          <div className="flex flex-col sm:flex-row justify-end pt-2">
            <div className="sm:w-80 space-y-2 text-xs sm:text-sm">
              {/* Food subtotal */}
              <div className="flex items-center justify-between text-slate-600 py-1">
                <span className="font-medium">Food subtotal:</span>
                <span className="font-bold text-slate-900">
                  {formatRupees(pricing.foodSubtotal)}
                </span>
              </div>

              {/* Delivery charges */}
              <div className="flex items-center justify-between text-slate-600 py-1">
                <span className="font-medium">Delivery charges:</span>
                <span className="font-bold text-slate-900">
                  {formatRupees(pricing.deliveryCharges)}
                </span>
              </div>

              {/* Customization charges */}
              <div className="flex items-center justify-between text-slate-600 py-1">
                <span className="font-medium">Customization charges:</span>
                <span className="font-bold text-slate-900">
                  {formatRupees(pricing.customizationCharges)}
                </span>
              </div>

              {/* GST */}
              <div className="flex items-center justify-between text-slate-600 py-1">
                <span className="font-medium">
                  {pricing.gstMode === 'percent' ? `GST (${pricing.gstValue}%):` : 'GST:'}
                </span>
                <span className="font-bold text-slate-900">
                  {formatRupees(pricing.gstAmount)}
                </span>
              </div>

              {/* Final amount (bold, brand colour only in the total row) */}
              <div className="bg-[var(--brand)] text-white p-3 rounded-xl flex items-center justify-between print:bg-[var(--brand)] print:text-white shadow-xs mt-2">
                <span className="font-heading font-black text-sm uppercase tracking-wide">
                  Final Amount:
                </span>
                <span className="font-heading font-black text-lg sm:text-xl text-white">
                  {formatRupees(pricing.finalTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* 5. FOOTER with Final instructions and thank-you line */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            {/* Final instructions */}
            {(order.finalInstructions || order.specialInstructions || order.notes) && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                <span className="font-bold text-slate-700 block">
                  Final Instructions:
                </span>
                <p className="text-slate-600 italic leading-relaxed">
                  {order.finalInstructions || order.specialInstructions || order.notes}
                </p>
              </div>
            )}

            {/* Thank you line */}
            <div className="text-center space-y-1 pt-2">
              <p className="font-heading font-bold text-xs sm:text-sm text-slate-800">
                Thank you for choosing TKS Iyengars Catering. We are honored to cater your auspicious celebration!
              </p>
              <p className="text-[11px] text-slate-400">
                Payment is handled separately outside this system.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>

      {/* ======================================================== */}
      {/* GLASS BOTTOM BAR with 'Download PDF' and 'Share' buttons */}
      {/* ======================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-20 glass-bottom-bar p-3.5 sm:p-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] border-t border-slate-200/90 shadow-lg print:hidden">
        <div className="max-w-md mx-auto flex items-center justify-center gap-3">
          
          {/* Download PDF button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex-1 h-12 px-5 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] active:scale-95 text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer tap-target-48"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
          </button>

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1 h-12 px-5 rounded-full bg-white hover:bg-slate-100 active:scale-95 text-slate-800 font-heading font-bold text-xs sm:text-sm border border-slate-300 flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer tap-target-48"
          >
            <Share2 className="w-4 h-4 text-slate-600" />
            <span>{isSharing ? 'Sharing...' : 'Share'}</span>
          </button>

        </div>
      </div>

    </div>
  )
}

export default AdminInvoicePage
