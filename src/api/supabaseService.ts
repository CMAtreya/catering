import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { 
  Category, 
  MenuItem, 
  Order, 
  OrderStatus, 
  OrderSource, 
  CustomerRecord, 
  BusinessInfo 
} from '@/data/mockData'
import type { Feast } from '@/api/feastApi'

/**
 * Maps Supabase status enum to Frontend display format
 */
export function mapDbStatusToFrontend(dbStatus: string): OrderStatus {
  switch (dbStatus) {
    case 'NEW_REQUEST': return 'New Request'
    case 'UNDER_DISCUSSION': return 'Under Discussion'
    case 'CONFIRMED': return 'Confirmed'
    case 'COMPLETED': return 'Completed'
    case 'CANCELLED': return 'Cancelled'
    default: return 'New Request'
  }
}

/**
 * Maps Frontend status format to Supabase status enum
 */
export function mapFrontendStatusToDb(feStatus: OrderStatus): 'NEW_REQUEST' | 'UNDER_DISCUSSION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' {
  switch (feStatus) {
    case 'New Request': return 'NEW_REQUEST'
    case 'Under Discussion': return 'UNDER_DISCUSSION'
    case 'Confirmed': return 'CONFIRMED'
    case 'Completed': return 'COMPLETED'
    case 'Cancelled': return 'CANCELLED'
    default: return 'NEW_REQUEST'
  }
}

// ============================================================================
// 1. CATALOGUE & MENU API (Optimized Parallel & Cached)
// ============================================================================

let catalogueCache: { categories: Category[]; items: MenuItem[]; timestamp: number } | null = null
const CATALOGUE_CACHE_TTL_MS = 60000 // 60 seconds memory cache

export function invalidateCatalogueCache() {
  catalogueCache = null
}

export async function getCatalogueFromSupabase(forceRefresh = false): Promise<{ categories: Category[]; items: MenuItem[] }> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')

  // Return fast in-memory cache if still warm (instant 0ms response)
  const now = Date.now()
  if (!forceRefresh && catalogueCache && (now - catalogueCache.timestamp < CATALOGUE_CACHE_TTL_MS)) {
    return {
      categories: [...catalogueCache.categories],
      items: [...catalogueCache.items]
    }
  }

  // Parallel database execution via Promise.all (cuts network wait in half, zero nested joins)
  const [categoriesResult, itemsResult] = await Promise.all([
    supabase
      .from('menu_categories')
      .select('id, name, display_order')
      .order('display_order', { ascending: true }),
    supabase
      .from('menu_items')
      .select('id, name, price_per_plate, availability, image_path, category_id')
      .order('name', { ascending: true })
  ])

  if (categoriesResult.error) throw categoriesResult.error
  if (itemsResult.error) throw itemsResult.error

  const categoryMap = new Map<string, string>()
  const categories: Category[] = (categoriesResult.data || []).map((c) => {
    categoryMap.set(c.id, c.name)
    return {
      id: c.id,
      name: c.name,
      displayOrder: c.display_order
    }
  })

  const items: MenuItem[] = (itemsResult.data || []).map((i: any) => ({
    id: i.id,
    name: i.name,
    pricePerPlate: Number(i.price_per_plate),
    category: categoryMap.get(i.category_id) || 'General',
    image: i.image_path || '/default-dish.svg',
    gradient: 'from-amber-100 to-orange-200',
    emoji: '🍲',
    available: i.availability === 'AVAILABLE',
    portionLabel: 'Portion / Plate'
  })).sort((a, b) => a.name.localeCompare(b.name))

  catalogueCache = { categories, items, timestamp: now }
  return { categories, items }
}

export async function saveCategoryToSupabase(category: { id?: string; name: string; displayOrder?: number }): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')

  invalidateCatalogueCache()

  if (category.id && !category.id.startsWith('cat-')) {
    const { error } = await supabase
      .from('menu_categories')
      .update({ name: category.name, display_order: category.displayOrder ?? 0 })
      .eq('id', category.id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('menu_categories')
      .insert({ name: category.name, display_order: category.displayOrder ?? 0 })
    if (error) throw error
  }
}

export async function deleteCategoryFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')

  invalidateCatalogueCache()

  const { error } = await supabase
    .from('menu_categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function saveMenuItemToSupabase(item: Partial<MenuItem> & { name: string; pricePerPlate: number; category: string }): Promise<MenuItem> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')

  invalidateCatalogueCache()

  // Find category ID matching item.category
  const { data: catData } = await supabase
    .from('menu_categories')
    .select('id')
    .ilike('name', item.category.trim())
    .limit(1)
    .maybeSingle()

  let categoryId = catData?.id
  if (!categoryId) {
    // Create category if missing
    const { data: newCat, error: createCatErr } = await supabase
      .from('menu_categories')
      .insert({ name: item.category.trim(), display_order: 99 })
      .select('id')
      .maybeSingle()
    if (createCatErr) {
      // In case another concurrent call inserted it, fetch existing
      const { data: retryCat } = await supabase
        .from('menu_categories')
        .select('id')
        .ilike('name', item.category.trim())
        .limit(1)
        .maybeSingle()
      categoryId = retryCat?.id
    } else {
      categoryId = newCat?.id
    }
  }

  const payload = {
    category_id: categoryId,
    name: item.name.trim(),
    price_per_plate: item.pricePerPlate,
    image_path: item.image || '/default-dish.svg',
    availability: item.available !== false ? 'AVAILABLE' : 'UNAVAILABLE' as const
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const isUuid = !!item.id && uuidRegex.test(item.id)

  if (isUuid) {
    const { data: updated, error } = await supabase
      .from('menu_items')
      .update(payload)
      .eq('id', item.id)
      .select('*, menu_categories(name)')
      .single()
    if (error) throw error

    const result: MenuItem = {
      id: updated.id,
      name: updated.name,
      pricePerPlate: Number(updated.price_per_plate),
      category: updated.menu_categories?.name || item.category,
      image: updated.image_path || '/default-dish.svg',
      gradient: item.gradient || 'from-amber-100 to-orange-200',
      emoji: item.emoji || '🍲',
      available: updated.availability === 'AVAILABLE',
      portionLabel: item.portionLabel || 'Portion / Plate'
    }
    notifyMenuChange({ table: 'menu_items', eventType: 'UPDATE', new: updated })
    return result
  } else {
    const { data: created, error } = await supabase
      .from('menu_items')
      .insert(payload)
      .select('*, menu_categories(name)')
      .single()
    if (error) throw error

    const result: MenuItem = {
      id: created.id,
      name: created.name,
      pricePerPlate: Number(created.price_per_plate),
      category: created.menu_categories?.name || item.category,
      image: created.image_path || '/default-dish.svg',
      gradient: item.gradient || 'from-amber-100 to-orange-200',
      emoji: item.emoji || '🍲',
      available: created.availability === 'AVAILABLE',
      portionLabel: item.portionLabel || 'Portion / Plate'
    }
    notifyMenuChange({ table: 'menu_items', eventType: 'INSERT', new: created })
    return result
  }
}

export async function toggleItemAvailabilityInSupabase(id: string, available: boolean): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')

  invalidateCatalogueCache()

  const { error } = await supabase
    .from('menu_items')
    .update({ availability: available ? 'AVAILABLE' : 'UNAVAILABLE' })
    .eq('id', id)

  if (error) throw error

  notifyMenuChange({
    table: 'menu_items',
    eventType: 'UPDATE',
    new: { id, availability: available ? 'AVAILABLE' : 'UNAVAILABLE' }
  })
}

export async function deleteMenuItemFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')

  invalidateCatalogueCache()

  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id)

  if (error) throw error

  notifyMenuChange({
    table: 'menu_items',
    eventType: 'DELETE',
    old: { id }
  })
}

// ============================================================================
// 2. PREDEFINED FEASTS API
// ============================================================================

export async function getFeastsFromSupabase(): Promise<Feast[]> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')

  // 1. Direct query on feasts table (flat, zero nested join dependencies)
  const { data: dbFeasts, error: feastsErr } = await supabase
    .from('feasts')
    .select('id, name, description, tag, created_at')
    .order('created_at', { ascending: true })

  if (feastsErr) {
    console.error('[Feasts][ERROR] Supabase feasts query failed:', feastsErr)
    throw feastsErr
  }

  // 2. Separate resilient query for feast_items
  const itemsByFeast = new Map<string, string[]>()
  try {
    const { data: dbItems, error: itemsErr } = await supabase
      .from('feast_items')
      .select('feast_id, menu_item_id')

    if (itemsErr) {
      console.warn('[Feasts][WARN] feast_items query warning:', itemsErr)
    } else if (dbItems) {
      dbItems.forEach((row: any) => {
        const existing = itemsByFeast.get(row.feast_id) || []
        existing.push(row.menu_item_id)
        itemsByFeast.set(row.feast_id, existing)
      })
    }
  } catch (err) {
    console.warn('[Feasts][WARN] Could not fetch feast_items relation:', err)
  }

  return (dbFeasts || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    description: f.description || '',
    tag: f.tag || 'Most Popular',
    itemIds: itemsByFeast.get(f.id) || []
  }))
}

export async function saveFeastToSupabase(feast: Feast): Promise<Feast> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')

  let feastId = feast.id
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const isUuid = !!feast.id && uuidRegex.test(feast.id)

  if (isUuid) {
    const { error: updateErr } = await supabase
      .from('feasts')
      .update({ name: feast.name, description: feast.description, tag: feast.tag })
      .eq('id', feast.id)
    if (updateErr) throw updateErr
  } else {
    const { data: newFeast, error: createErr } = await supabase
      .from('feasts')
      .insert({ name: feast.name, description: feast.description, tag: feast.tag })
      .select('id')
      .single()
    if (createErr) throw createErr
    feastId = newFeast.id
  }

  // Synchronize feast items
  await supabase.from('feast_items').delete().eq('feast_id', feastId)
  if (feast.itemIds && feast.itemIds.length > 0) {
    const validUuids = feast.itemIds.filter((itemId) => uuidRegex.test(itemId))
    if (validUuids.length > 0) {
      const inserts = validUuids.map((itemId) => ({
        feast_id: feastId,
        menu_item_id: itemId
      }))
      const { error: itemsErr } = await supabase.from('feast_items').insert(inserts)
      if (itemsErr) console.warn('[Feasts][WARN] Could not insert feast items:', itemsErr)
    }
  }

  return { ...feast, id: feastId }
}

export async function deleteFeastFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')

  const { error } = await supabase.from('feasts').delete().eq('id', id)
  if (error) throw error
}

// ============================================================================
// 3. ORDERS & ENQUIRIES API
// ============================================================================

export async function submitOnlineEnquiryToSupabase(payload: {
  customerName: string
  customerPhone: string
  deliveryAddress: string
  occasionType: string
  occasionDate: string
  serviceTime?: string
  plateCount: number
  specialInstructions?: string
  selectedItemIds: string[]
}): Promise<{ success: boolean; order_number: string; record_id: string; final_amount: number }> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')

  // Validate and resolve item UUIDs for PostgreSQL RPC
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  let itemUuids = (payload.selectedItemIds || []).filter((id) => uuidRegex.test(id))

  // If local dummy IDs like 'item-1' were submitted, resolve actual UUIDs from Supabase menu_items
  if (itemUuids.length === 0) {
    const { data: dbItems, error: itemsFetchErr } = await supabase
      .from('menu_items')
      .select('id')
      .eq('availability', 'AVAILABLE')
      .limit(Math.max(1, payload.selectedItemIds.length))

    if (!itemsFetchErr && dbItems && dbItems.length > 0) {
      itemUuids = dbItems.map((i) => i.id)
    }
  }

  if (itemUuids.length === 0) {
    throw new Error('No available dishes found in database. Please ensure your remote Supabase database has been seeded with supabase/seed.sql.')
  }

  // Execute the secure atomic PostgreSQL RPC
  const { data, error } = await supabase.rpc('submit_online_enquiry', {
    p_customer_name: payload.customerName,
    p_customer_phone: payload.customerPhone,
    p_delivery_address: payload.deliveryAddress,
    p_occasion_type: payload.occasionType,
    p_occasion_date: payload.occasionDate,
    p_service_time: payload.serviceTime || 'Morning',
    p_plate_count: payload.plateCount,
    p_special_instructions: payload.specialInstructions || '',
    p_selected_item_ids: itemUuids
  })

  if (error) {
    console.error('[Supabase RPC Error]:', error)
    throw error
  }
  return data as any
}

export async function getOrdersFromSupabase(filters?: {
  status?: string
  date?: string
  search?: string
  source?: string
}): Promise<Order[]> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')

  let query = supabase
    .from('catering_records')
    .select(`
      *,
      customers (name, mobile_number, address),
      catering_record_items (
        id,
        menu_item_id,
        item_name_snapshot,
        price_per_plate_snapshot,
        plate_count,
        line_amount
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'All') {
    const dbStatus = mapFrontendStatusToDb(filters.status as OrderStatus)
    query = query.eq('status', dbStatus)
  }

  if (filters?.date) {
    query = query.eq('occasion_date', filters.date)
  }

  if (filters?.source && filters.source !== 'All') {
    query = query.eq('source', filters.source.toUpperCase())
  }

  query = query.limit(150)

  const { data, error } = await query
  if (error) throw error

  let result: Order[] = (data || []).map((row: any) => ({
    id: row.order_number || row.id,
    source: (row.source === 'ONLINE' ? 'Online' : 'Manual') as OrderSource,
    status: mapDbStatusToFrontend(row.status),
    customerName: row.customers?.name || 'Valued Customer',
    customerPhone: row.customers?.mobile_number || '',
    eventDate: row.occasion_date || '',
    eventTime: (row.service_time?.includes('Eve') ? 'Evening' : row.service_time?.includes('Aft') ? 'Afternoon' : 'Morning') as any,
    specificTime: row.service_time,
    eventType: row.occasion_type || 'Traditional Feast',
    guestCount: row.plate_count || 0,
    venueAddress: row.delivery_address || row.customers?.address || '',
    notes: row.specialInstructions || row.special_instructions || '',
    specialInstructions: row.special_instructions,
    enquiryNotes: row.enquiry_notes,
    finalInstructions: row.final_instructions,
    items: (row.catering_record_items || []).map((item: any) => ({
      id: item.menu_item_id || item.id,
      name: item.item_name_snapshot,
      pricePerPlate: Number(item.price_per_plate_snapshot),
      quantity: item.plate_count
    })),
    perPlateTotal: Number(row.food_subtotal) / (Number(row.plate_count) || 1),
    deliveryCharges: Number(row.delivery_charges) || 0,
    customizationCharges: Number(row.customization_charges) || 0,
    gstAmount: Number(row.gst_amount) || 0,
    totalAmount: Number(row.final_amount) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }))

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.eventType.toLowerCase().includes(q)
    )
  }

  return result
}

export async function setOrderStatusInSupabase(
  orderNumber: string,
  newStatus: OrderStatus,
  reason?: string,
  changeDiff?: any
): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')

  const dbStatus = mapFrontendStatusToDb(newStatus)
  
  const updates: any = {
    status: dbStatus,
    updated_at: new Date().toISOString()
  }

  if (dbStatus === 'CONFIRMED') updates.confirmed_at = new Date().toISOString()
  if (dbStatus === 'COMPLETED') updates.completed_at = new Date().toISOString()
  if (dbStatus === 'CANCELLED') updates.cancelled_at = new Date().toISOString()

  // Single round-trip update returning record id
  const { data: rec, error: updateErr } = await supabase
    .from('catering_records')
    .update(updates)
    .eq('order_number', orderNumber)
    .select('id')
    .single()

  if (updateErr) throw updateErr

  // Record audit reason if provided or required
  if (reason && reason.trim().length > 0 && rec?.id) {
    const reasonType = dbStatus === 'CANCELLED' ? 'CONFIRMED_ORDER_CANCELLATION' : 'CONFIRMED_ORDER_EDIT'
    await supabase.from('record_change_reasons').insert({
      catering_record_id: rec.id,
      reason_type: reasonType,
      reason: reason.trim(),
      change_diff: changeDiff || null
    })
  }
}

export async function createManualOrderInSupabase(orderData: Partial<Order> & { customerPhone: string }): Promise<Order> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  const { data, error } = await supabase.rpc('admin_create_manual_order', {
    p_customer_name: orderData.customerName || 'Customer',
    p_customer_phone: orderData.customerPhone,
    p_delivery_address: orderData.venueAddress || '',
    p_occasion_type: orderData.eventType || 'Catering Function',
    p_occasion_date: orderData.eventDate || new Date().toISOString().split('T')[0],
    p_service_time: orderData.specificTime || orderData.eventTime || 'Morning',
    p_plate_count: orderData.guestCount || 50,
    p_delivery_charges: orderData.deliveryCharges ?? 1500,
    p_customization_charges: orderData.customizationCharges ?? 1000,
    p_special_instructions: orderData.notes || '',
    p_enquiry_notes: orderData.enquiryNotes || orderData.notes || '',
    p_selected_items: (orderData.items || []).map((i) => ({
      id: uuidRegex.test(i.id) ? i.id : null,
      name: i.name,
      price_per_plate: i.pricePerPlate,
      plate_count: i.quantity || orderData.guestCount || 50
    }))
  })

  if (error) throw error

  const orderNumber = (data as any).order_number
  const initialStatus = orderData.status || 'Under Discussion'

  if (initialStatus !== 'Under Discussion') {
    try {
      await setOrderStatusInSupabase(orderNumber, initialStatus)
    } catch (statusErr) {
      console.warn('[Orders][WARN] Failed to advance manual order status:', statusErr)
    }
  }

  return {
    id: orderNumber,
    source: 'Manual',
    status: initialStatus,
    customerName: orderData.customerName || 'Customer',
    customerPhone: orderData.customerPhone,
    eventDate: orderData.eventDate || new Date().toISOString().split('T')[0],
    eventTime: orderData.eventTime || 'Morning',
    specificTime: orderData.specificTime,
    eventType: orderData.eventType || 'Catering Function',
    guestCount: orderData.guestCount || 50,
    venueAddress: orderData.venueAddress,
    notes: orderData.notes,
    items: orderData.items || [],
    deliveryCharges: orderData.deliveryCharges ?? 1500,
    customizationCharges: orderData.customizationCharges ?? 1000,
    perPlateTotal: orderData.perPlateTotal || 0,
    totalAmount: (data as any).final_amount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export async function updateOrderInSupabase(
  orderId: string,
  orderData: Partial<Order>
): Promise<Order> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')

  const updates: any = {
    updated_at: new Date().toISOString()
  }

  if (orderData.status) {
    updates.status = mapFrontendStatusToDb(orderData.status)
    if (updates.status === 'CONFIRMED') updates.confirmed_at = new Date().toISOString()
    if (updates.status === 'COMPLETED') updates.completed_at = new Date().toISOString()
    if (updates.status === 'CANCELLED') updates.cancelled_at = new Date().toISOString()
  }
  if (orderData.eventType) updates.occasion_type = orderData.eventType
  if (orderData.eventDate) updates.occasion_date = orderData.eventDate
  if (orderData.eventTime || orderData.specificTime) updates.service_time = orderData.specificTime || orderData.eventTime
  if (orderData.guestCount !== undefined) updates.plate_count = orderData.guestCount
  if (orderData.venueAddress !== undefined) updates.delivery_address = orderData.venueAddress
  if (orderData.notes !== undefined) updates.special_instructions = orderData.notes
  if (orderData.deliveryCharges !== undefined) updates.delivery_charges = orderData.deliveryCharges
  if (orderData.customizationCharges !== undefined) updates.customization_charges = orderData.customizationCharges
  if (orderData.totalAmount !== undefined) updates.final_amount = orderData.totalAmount

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const isUuid = uuidRegex.test(orderId)
  let query = supabase.from('catering_records').update(updates)
  if (isUuid) {
    query = query.or(`id.eq.${orderId},order_number.eq.${orderId}`)
  } else {
    query = query.eq('order_number', orderId)
  }

  const { data, error } = await query.select('*, customers(*)').maybeSingle()
  if (error) {
    console.warn('[Supabase][WARN] Failed to update order in Supabase:', error)
  }

  if (orderData.customerName && data?.customer_id) {
    await supabase.from('customers').update({ name: orderData.customerName }).eq('id', data.customer_id)
  }

  return {
    ...orderData,
    id: orderId,
    customerName: orderData.customerName || data?.customers?.name || 'Customer',
    customerPhone: orderData.customerPhone || data?.customers?.mobile_number || '',
    eventDate: orderData.eventDate || data?.occasion_date || '',
    eventTime: orderData.eventTime || data?.service_time || 'Morning',
    eventType: orderData.eventType || data?.occasion_type || 'Catering Function',
    guestCount: orderData.guestCount ?? data?.plate_count ?? 50,
    status: orderData.status || (data?.status ? mapDbStatusToFrontend(data.status) : 'Under Discussion'),
    source: (data?.source === 'ONLINE' ? 'Online' : 'Manual') as OrderSource,
    items: orderData.items || [],
    deliveryCharges: orderData.deliveryCharges ?? data?.delivery_charges ?? 1500,
    customizationCharges: orderData.customizationCharges ?? data?.customization_charges ?? 1000,
    perPlateTotal: orderData.perPlateTotal || 0,
    totalAmount: orderData.totalAmount ?? Number(data?.final_amount || 0),
    updatedAt: new Date().toISOString()
  } as Order
}


// ============================================================================
// 4. CUSTOMER CRM API
// ============================================================================

export async function getCustomersFromSupabase(filters?: { search?: string }): Promise<CustomerRecord[]> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')

  let query = supabase
    .from('customers')
    .select(`
      *,
      catering_records (id, status, occasion_date)
    `)
    .order('last_contacted_at', { ascending: false })

  if (filters?.search) {
    const q = filters.search.trim()
    query = query.or(`name.ilike.%${q}%,mobile_number.ilike.%${q}%,notes.ilike.%${q}%`)
  }

  const { data, error } = await query
  if (error) throw error

  return (data || []).map((c: any) => {
    const records = c.catering_records || []
    const enquiryCount = records.length
    const confirmedCount = records.filter((r: any) => r.status === 'CONFIRMED' || r.status === 'COMPLETED').length

    return {
      phone: c.mobile_number,
      name: c.name,
      address: c.address || '',
      firstContacted: c.first_contacted_at ? c.first_contacted_at.split('T')[0] : '',
      lastContacted: c.last_contacted_at ? c.last_contacted_at.split('T')[0] : '',
      enquiryCount,
      confirmedCount,
      notes: c.notes || ''
    }
  })
}

// ============================================================================
// 5. BUSINESS SETTINGS API
// ============================================================================

let businessSettingsCache: { settings: BusinessInfo | null; timestamp: number } | null = null

export function invalidateBusinessSettingsCache(): void {
  businessSettingsCache = null
}

export async function getBusinessSettingsFromSupabase(): Promise<BusinessInfo | null> {
  if (!isSupabaseConfigured) return null

  const now = Date.now()
  if (businessSettingsCache && now - businessSettingsCache.timestamp < 60_000) {
    return businessSettingsCache.settings
  }

  const { data, error } = await supabase
    .from('business_settings')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null

  const settings: BusinessInfo = {
    name: data.business_name,
    legalName: data.business_name,
    tagline: 'Authentic Traditional Mysuru Banquet & Catering Heritage',
    phone: data.phone_number,
    email: 'orders@tksiyengarscatering.com',
    address: data.address,
    city: 'Mysuru, Karnataka',
    pincode: '570002',
    fssaiNumber: '11223344556677',
    gstNumber: data.gstin
  }

  businessSettingsCache = { settings, timestamp: now }
  return settings
}

export async function saveBusinessSettingsToSupabase(settings: BusinessInfo): Promise<void> {
  if (!isSupabaseConfigured) return

  invalidateBusinessSettingsCache()

  const payload = {
    business_name: settings.name,
    address: settings.address,
    phone_number: settings.phone,
    gstin: settings.gstNumber
  }

  const { data: existing } = await supabase
    .from('business_settings')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (existing?.id) {
    await supabase.from('business_settings').update(payload).eq('id', existing.id)
  } else {
    await supabase.from('business_settings').insert(payload)
  }
}

// ============================================================================
// 6. INVOICES API
// ============================================================================

export async function generateInvoiceInSupabase(orderNumber: string): Promise<{ success: boolean; invoice_number: string; invoice_id: string }> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')

  // Find record UUID from order number
  const { data: rec, error: findErr } = await supabase
    .from('catering_records')
    .select('id')
    .eq('order_number', orderNumber)
    .single()

  if (findErr) throw findErr

  // Call the atomic database RPC
  const { data, error } = await supabase.rpc('generate_invoice_for_order', {
    p_record_id: rec.id
  })

  if (error) throw error
  return data as any
}

// ============================================================================
// 7. REALTIME SUBSCRIPTION
// ============================================================================

export function subscribeToSupabaseOrders(callback: () => void): () => void {
  if (!isSupabaseConfigured) return () => {}

  // Generate unique channel topic per subscription instance to prevent collisions during React StrictMode / multi-mounts
  const channelTopic = `catering_records_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const channel = supabase
    .channel(channelTopic)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'catering_records' },
      () => {
        callback()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

const menuBroadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('tks_menu_sync_channel')
  : null

export function notifyMenuChange(event: { table: string; eventType: string; new?: any; old?: any }) {
  invalidateCatalogueCache()
  if (menuBroadcastChannel) {
    try {
      menuBroadcastChannel.postMessage(event)
    } catch {
      // ignore
    }
  }
}

export function subscribeToSupabaseMenu(
  callback: (event: { table: string; eventType: string; new: any; old: any }) => void
): () => void {
  const handleBroadcast = (ev: MessageEvent) => {
    if (ev.data && (ev.data.table === 'menu_items' || ev.data.table === 'menu_categories')) {
      invalidateCatalogueCache()
      callback(ev.data)
    }
  }

  if (menuBroadcastChannel) {
    menuBroadcastChannel.addEventListener('message', handleBroadcast)
  }

  if (!isSupabaseConfigured) {
    return () => {
      if (menuBroadcastChannel) {
        menuBroadcastChannel.removeEventListener('message', handleBroadcast)
      }
    }
  }

  const channelTopic = `menu_realtime_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const channel = supabase
    .channel(channelTopic)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'menu_items' },
      (payload) => {
        invalidateCatalogueCache()
        callback({
          table: 'menu_items',
          eventType: payload.eventType,
          new: payload.new,
          old: payload.old
        })
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'menu_categories' },
      (payload) => {
        invalidateCatalogueCache()
        callback({
          table: 'menu_categories',
          eventType: payload.eventType,
          new: payload.new,
          old: payload.old
        })
      }
    )
    .subscribe()

  return () => {
    if (menuBroadcastChannel) {
      menuBroadcastChannel.removeEventListener('message', handleBroadcast)
    }
    supabase.removeChannel(channel)
  }
}
