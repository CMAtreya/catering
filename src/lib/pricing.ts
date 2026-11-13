export interface SelectedItemSummary {
  id: string
  name: string
  pricePerPlate: number
  quantity: number
}

export interface BillCalculation {
  perPlateBase: number
  guestCount: number
  foodSubtotal: number
  gstAmount: number
  grandTotal: number
}

export type GstMode = 'percent' | 'fixed'

export interface OrderPricingInput {
  perPlatePrice: number
  guestCount: number
  deliveryCharges?: number
  customizationCharges?: number
  gstMode?: GstMode
  gstValue?: number
}

export interface OrderPricingResult {
  perPlatePrice: number
  guestCount: number
  foodSubtotal: number
  deliveryCharges: number
  customizationCharges: number
  gstMode: GstMode
  gstValue: number
  gstAmount: number
  finalTotal: number
  formulaText: string
}

/**
 * Calculates catering pricing based on selected items and guest count
 * (Used across customer pages and default estimates)
 */
export function calculateBill(
  items: SelectedItemSummary[],
  guestCount: number,
  gstRate: number = 0.05 // Standard 5% GST for catering in India without ITC
): BillCalculation {
  const safeGuests = Math.max(0, guestCount || 0)
  
  // Base sum of selected items per plate
  const perPlateBase = items.reduce((sum, item) => sum + (item.pricePerPlate * (item.quantity || 1)), 0)
  
  const foodSubtotal = perPlateBase * safeGuests
  const gstAmount = Math.round(foodSubtotal * gstRate)
  const grandTotal = foodSubtotal + gstAmount

  return {
    perPlateBase,
    guestCount: safeGuests,
    foodSubtotal,
    gstAmount,
    grandTotal
  }
}

/**
 * Complete Order Management Pricing Engine (A5 / Admin Orders)
 * 
 * ASSUMPTION: The GST base is not strictly defined in the spec.
 * All math is centralized here for easy configuration.
 * 
 * TODO: Client Rule Check:
 * By default in catering operations, 5% GST is applied on food service subtotal.
 * If the client specifies that GST should also apply on Delivery and Customization charges,
 * change `gstBase` calculation below to: `const gstBase = foodSubtotal + delivery + customization;`
 */
export function calculateOrderPricing(input: OrderPricingInput): OrderPricingResult {
  const perPlatePrice = Math.max(0, input.perPlatePrice || 0)
  const guestCount = Math.max(0, input.guestCount || 0)
  const deliveryCharges = Math.max(0, input.deliveryCharges || 0)
  const customizationCharges = Math.max(0, input.customizationCharges || 0)
  const gstMode = input.gstMode || 'percent'
  const gstValue = Math.max(0, input.gstValue !== undefined ? input.gstValue : 5)

  // 1. Food subtotal = price per plate × plates (read-only)
  const foodSubtotal = perPlatePrice * guestCount

  // 2. GST Calculation
  // TODO: Verify client rule on whether GST base includes delivery/customization
  const gstBase = foodSubtotal

  let gstAmount = 0
  if (gstMode === 'percent') {
    gstAmount = Math.round(gstBase * (gstValue / 100))
  } else {
    gstAmount = Math.round(gstValue)
  }

  // 3. Final total = food subtotal + delivery + customization + GST
  const finalTotal = foodSubtotal + deliveryCharges + customizationCharges + gstAmount

  // Formula display text
  const gstLabel = gstMode === 'percent' ? `GST (${gstValue}%)` : 'GST (₹)'
  const formulaText = `Food Subtotal (₹${perPlatePrice} × ${guestCount} = ₹${foodSubtotal}) + Delivery (₹${deliveryCharges}) + Customization (₹${customizationCharges}) + ${gstLabel} (₹${gstAmount}) = Final Total (₹${finalTotal})`

  return {
    perPlatePrice,
    guestCount,
    foodSubtotal,
    deliveryCharges,
    customizationCharges,
    gstMode,
    gstValue,
    gstAmount,
    finalTotal,
    formulaText
  }
}
