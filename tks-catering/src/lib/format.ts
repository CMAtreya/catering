import { format, parseISO, isValid } from 'date-fns'

/**
 * Format number into Indian Rupee currency grouping (e.g., ₹1,45,000)
 */
export function formatRupees(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format number into Indian digit grouping string without currency symbol
 */
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(num)
}

/**
 * Format event date into standard specification: 'Sat, 14 Nov 2026'
 */
export function formatEventDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'Date not specified'
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput
    if (!isValid(d)) return String(dateInput)
    return format(d, 'EEE, dd MMM yyyy')
  } catch {
    return String(dateInput)
  }
}

/**
 * Format contact date into clean format: '12 Oct 2026'
 */
export function formatContactDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'Not contacted'
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput
    if (!isValid(d)) return String(dateInput)
    return format(d, 'dd MMM yyyy')
  } catch {
    return String(dateInput)
  }
}

/**
 * Validate standard 10-digit Indian mobile number starting with 6, 7, 8, or 9
 */
export function isValidIndianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  // Accepts 10 digits starting with 6-9, or 12 digits starting with 91
  if (digits.length === 12 && digits.startsWith('91')) {
    return /^[6-9]\d{9}$/.test(digits.slice(2))
  }
  return /^[6-9]\d{9}$/.test(digits)
}

/**
 * Clean phone number into standard 10-digit format
 */
export function cleanIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2)
  }
  return digits
}
