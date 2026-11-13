import type { Order } from '@/data/mockData'

/**
 * Format local date & meal time into ISO string without dashes/colons for Google/iCal
 * Example: 20261028T070000Z
 */
function getEventTiming(dateStr: string, mealTime?: string): { start: string; end: string } {
  const cleanDate = dateStr.replace(/-/g, '')
  
  let startHour = '080000'
  let endHour = '120000'

  if (mealTime === 'Morning') {
    startHour = '070000'
    endHour = '113000'
  } else if (mealTime === 'Afternoon') {
    startHour = '113000'
    endHour = '160000'
  } else if (mealTime === 'Evening') {
    startHour = '173000'
    endHour = '220000'
  }

  return {
    start: `${cleanDate}T${startHour}`,
    end: `${cleanDate}T${endHour}`
  }
}

/**
 * Push an order directly to Google Calendar via deep link
 */
export function pushToGoogleCalendar(order: Order): void {
  const { start, end } = getEventTiming(order.eventDate, order.eventTime)
  const title = `TKS Catering: ${order.eventType} - ${order.customerName} (${order.guestCount} plates)`
  
  const dishList = order.items && order.items.length > 0
    ? order.items.map((i) => i.name).join(', ')
    : 'Custom Banquet Menu'

  const details = [
    `CATERING BOOKING: ${order.id}`,
    `Customer: ${order.customerName} (+91 ${order.customerPhone})`,
    `Event: ${order.eventType} (${order.eventTime || 'Full Day'})`,
    `Plates: ${order.guestCount} plates (₹${order.totalAmount?.toLocaleString('en-IN') || 0})`,
    `Venue: ${order.venueAddress || 'Mysuru Banquet Mantapa'}`,
    `Special Notes: ${order.notes || 'None'}`,
    `Selected Menu: ${dishList}`,
    `\nTKS Iyengars Mysore Catering Heritage`
  ].join('\n')

  const location = order.venueAddress || 'Mysuru, Karnataka'

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`

  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

/**
 * Generate standard iCal (.ics) file and trigger browser download
 * Compatible with Apple Calendar, iOS, Android, Microsoft Outlook, Windows Calendar
 */
export function downloadIcsCalendar(ordersInput: Order | Order[], filenamePrefix = 'tks-catering-event'): void {
  const orders = Array.isArray(ordersInput) ? ordersInput : [ordersInput]
  if (orders.length === 0) return

  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const eventsIcs = orders.map((order) => {
    const { start, end } = getEventTiming(order.eventDate, order.eventTime)
    const summary = `TKS Catering: ${order.eventType} - ${order.customerName}`
    const location = (order.venueAddress || 'Mysuru, Karnataka').replace(/,/g, '\\,')
    const description = [
      `Order: ${order.id}`,
      `Customer: ${order.customerName} (Phone: ${order.customerPhone})`,
      `Guests: ${order.guestCount} plates`,
      `Total: INR ${order.totalAmount || 0}`,
      `Address: ${order.venueAddress || 'Mysuru'}`,
      `Notes: ${order.notes || 'Standard satvik service'}`
    ].join('\\n')

    return [
      'BEGIN:VEVENT',
      `UID:${order.id}-${start}@tksiyengarscatering.com`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    ].join('\r\n')
  }).join('\r\n')

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TKS Catering//Mysore Banquets Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    eventsIcs,
    'END:VCALENDAR'
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const downloadUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = `${filenamePrefix}-${orders[0]?.eventDate || 'booking'}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(downloadUrl)
}

/**
 * Auto-Push Browser Desktop Notification
 */
export async function autoPushBrowserNotification(title: string, body: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'default') {
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') return false
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/logo-192.png',
        badge: '/logo-192.png',
        tag: 'tks-catering-live-notification'
      })
      return true
    } catch (e) {
      console.warn('Browser notification error:', e)
    }
  }

  return false
}

