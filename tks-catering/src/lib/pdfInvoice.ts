import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Order } from '@/data/mockData'
import type { OrderPricingResult } from '@/lib/pricing'

/**
 * Builds the official A4 PDF document for TKS Iyengars Catering Invoice
 * using jsPDF and jspdf-autotable.
 * 
 * Rules:
 * - Clean A4 proportion
 * - Brand colour [139, 0, 0] ONLY in header band and total row
 * - Table: Item, Price per plate, Plates, Amount
 * - Totals: Food subtotal, Delivery, Customization, GST, Final amount (bold)
 * - Footer: Final instructions and thank-you line
 * - No payment QR or payment details
 */
export function buildInvoicePdf(order: Order, pricing: OrderPricingResult): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth() // 210mm
  const margin = 14
  const contentWidth = pageWidth - margin * 2

  // Derive Brand RGB dynamically from theme.css --brand CSS variable
  let brandColor: [number, number, number] = [182, 10, 6]
  let brandDark: [number, number, number] = [127, 7, 4]
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const rawBrand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim()
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(rawBrand)
    if (match) {
      const r = parseInt(match[1], 16)
      const g = parseInt(match[2], 16)
      const b = parseInt(match[3], 16)
      brandColor = [r, g, b]
      brandDark = [Math.max(0, Math.round(r * 0.7)), Math.max(0, Math.round(g * 0.7)), Math.max(0, Math.round(b * 0.7))]
    }
  }

  // 1. Header Band in Brand Colour
  const headerHeight = 36
  doc.setFillColor(...brandColor)
  doc.rect(0, 0, pageWidth, headerHeight, 'F')

  // Top Accent Strip
  doc.setFillColor(...brandDark)
  doc.rect(0, 0, pageWidth, 2.5, 'F')

  // Header Content
  // Logo Tile
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(margin, 7, 18, 18, 3, 3, 'F')
  doc.setTextColor(...brandColor)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('TKS', margin + 9, 18, { align: 'center' })

  // Business Name & Subtitle
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('TKS Iyengars Catering', margin + 22, 14)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(245, 230, 230)
  doc.text('142/A, Krishnamurthy Puram, Mysuru, Karnataka 570004 | Phone: +91 90000 00000', margin + 22, 20)
  doc.text('GSTIN: 29AAAAA0000A1Z5 | FSSAI Lic. No: 11223344556677', margin + 22, 25)

  // Invoice Title & Metadata on the Right
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('INVOICE', pageWidth - margin, 14, { align: 'right' })

  const cleanId = order.id.replace(/^TKS-/, '')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(245, 230, 230)
  doc.text(`Invoice No: TKS-${cleanId}`, pageWidth - margin, 20, { align: 'right' })

  const invoiceDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  doc.text(`Date: ${invoiceDate}`, pageWidth - margin, 25, { align: 'right' })

  // 2. Info Cards (Billed To & Event Details)
  let y = headerHeight + 8

  // Billed To Box
  const colWidth = (contentWidth - 6) / 2
  doc.setDrawColor(226, 232, 240) // slate-200
  doc.setFillColor(248, 250, 252) // slate-50
  doc.roundedRect(margin, y, colWidth, 32, 2, 2, 'FD')

  doc.setTextColor(100, 116, 139) // slate-500
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text('BILLED TO', margin + 4, y + 6)

  doc.setTextColor(15, 23, 42) // slate-900
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(order.customerName || 'Valued Customer', margin + 4, y + 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(51, 65, 85) // slate-700
  doc.text(`Mobile: +91 ${order.customerPhone.replace(/^\+91/, '')}`, margin + 4, y + 18)

  const addressLines = doc.splitTextToSize(order.venueAddress || 'Mysuru Banquet Hall / Residence', colWidth - 8)
  doc.text(addressLines.slice(0, 2), margin + 4, y + 23)

  // Event Details Box
  const col2X = margin + colWidth + 6
  doc.roundedRect(col2X, y, colWidth, 32, 2, 2, 'FD')

  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text('EVENT DETAILS', col2X + 4, y + 6)

  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(order.eventType || 'Catering Function', col2X + 4, y + 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(51, 65, 85)
  doc.text(`Occasion Date: ${order.eventDate || 'Date Confirmed'}`, col2X + 4, y + 18)
  doc.text(`Timing & Plates: ${order.eventTime || 'Morning'} Service (${order.guestCount} Plates)`, col2X + 4, y + 23)

  // 3. Table of Selected Items
  y += 37

  const guestPlates = order.guestCount || 1

  const tableBody = order.items.map((item) => {
    const itemTotal = item.pricePerPlate * guestPlates
    return [
      item.name,
      `Rs. ${item.pricePerPlate}`,
      `${guestPlates}`,
      `Rs. ${itemTotal.toLocaleString('en-IN')}`
    ]
  })

  // Format currency helpers for totals without Unicode symbol issues in jsPDF
  const formatInr = (amt: number) => `Rs. ${amt.toLocaleString('en-IN')}`

  autoTable(doc, {
    startY: y,
    head: [['Item', 'Price per plate', 'Plates', 'Amount']],
    body: tableBody,
    theme: 'plain',
    headStyles: {
      fillColor: [241, 245, 249], // slate-100
      textColor: [30, 41, 59], // slate-800
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      cellPadding: 3
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      textColor: [51, 65, 85],
      cellPadding: 2.8,
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 'auto', fontStyle: 'bold' },
      1: { cellWidth: 32, halign: 'right' },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 34, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  })

  // 4. Totals Block
  const finalY = (doc as any).lastAutoTable.finalY + 4
  const totalsWidth = 90
  const totalsX = pageWidth - margin - totalsWidth

  let currY = finalY
  const rowHeight = 5.2

  const drawTotalLine = (label: string, value: string, isBold: boolean = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(71, 85, 105)
    doc.text(label, totalsX, currY)
    doc.setTextColor(15, 23, 42)
    doc.text(value, pageWidth - margin, currY, { align: 'right' })
    currY += rowHeight
  }

  drawTotalLine('Food subtotal:', formatInr(pricing.foodSubtotal))

  if (pricing.deliveryCharges > 0) {
    drawTotalLine('Delivery charges:', formatInr(pricing.deliveryCharges))
  }
  if (pricing.customizationCharges > 0) {
    drawTotalLine('Customization charges:', formatInr(pricing.customizationCharges))
  }

  const gstLabel = pricing.gstMode === 'percent' ? `GST (${pricing.gstValue}%):` : 'GST:'
  drawTotalLine(gstLabel, formatInr(pricing.gstAmount))

  // Final Amount in Brand Colour Row
  currY += 1.5
  doc.setFillColor(...brandColor)
  doc.roundedRect(totalsX - 3, currY - 4, totalsWidth + 3, 9, 1.5, 1.5, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.text('Final Amount:', totalsX, currY + 1.8)
  doc.setFontSize(11)
  doc.text(formatInr(pricing.finalTotal), pageWidth - margin, currY + 1.8, { align: 'right' })

  // 5. Footer: Final instructions and thank-you line
  let footerY = Math.max(currY + 18, 240)

  // Divider
  doc.setDrawColor(226, 232, 240)
  doc.line(margin, footerY, pageWidth - margin, footerY)
  footerY += 5

  if (order.finalInstructions || order.specialInstructions || order.notes) {
    const instructions = order.finalInstructions || order.specialInstructions || order.notes || ''
    doc.setTextColor(100, 116, 139)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.text('FINAL INSTRUCTIONS & NOTES:', margin, footerY)

    doc.setTextColor(51, 65, 85)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    const noteLines = doc.splitTextToSize(instructions, contentWidth)
    doc.text(noteLines.slice(0, 3), margin, footerY + 4)
    footerY += 4 + Math.min(noteLines.length, 3) * 4 + 3
  }

  // Thank you line
  doc.setTextColor(...brandColor)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(
    'Thank you for choosing TKS Iyengars Catering. We are honored to serve your auspicious celebration!',
    pageWidth / 2,
    footerY + 3,
    { align: 'center' }
  )

  doc.setTextColor(148, 163, 184) // slate-400
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text(
    'This is a computer-generated catering invoice. Payment is handled separately outside this system.',
    pageWidth / 2,
    footerY + 8,
    { align: 'center' }
  )

  return doc
}
