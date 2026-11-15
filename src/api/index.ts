import { 
  type Category, 
  type MenuItem, 
  type Order, 
  type OrderStatus, 
  type CustomerRecord, 
  type BusinessInfo, 
  INITIAL_BUSINESS_INFO, 
  INITIAL_CATEGORIES, 
  INITIAL_ITEMS 
} from '@/data/mockData'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  getCatalogueFromSupabase,
  submitOnlineEnquiryToSupabase,
  getOrdersFromSupabase,
  setOrderStatusInSupabase,
  createManualOrderInSupabase,
  updateOrderInSupabase,
  getCustomersFromSupabase,
  invalidateCustomersCache,
  saveCategoryToSupabase,
  deleteCategoryFromSupabase,
  saveMenuItemToSupabase,
  toggleItemAvailabilityInSupabase,
  deleteMenuItemFromSupabase,
  subscribeToSupabaseOrders,
  subscribeToSupabaseMenu,
  notifyMenuChange
} from './supabaseService'

// In-memory data store initialized from seed data or localStorage
function loadStoredOrders(): Order[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('tks_catering_orders')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('Failed to load stored orders:', e)
  }
  return []
}

function loadStoredCustomers(): Record<string, CustomerRecord> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem('tks_catering_customers')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === 'object') return parsed
    }
  } catch (e) {
    console.warn('Failed to load stored customers:', e)
  }
  return {}
}

function loadStoredItems(): MenuItem[] {
  if (typeof window === 'undefined') return [...INITIAL_ITEMS]
  try {
    const stored = localStorage.getItem('tks_catering_menu_items')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return INITIAL_ITEMS.map((initial) => {
          const storedItem = parsed.find((p: MenuItem) => p.id === initial.id)
          if (!storedItem) return initial
          return {
            ...initial,
            pricePerPlate: storedItem.pricePerPlate ?? initial.pricePerPlate,
            available: storedItem.available ?? initial.available,
            heritageTag: initial.heritageTag || storedItem.heritageTag,
            portionLabel: initial.portionLabel || storedItem.portionLabel
          }
        })
      }
    }
  } catch (e) {
    console.warn('Failed to load stored menu items:', e)
  }
  return [...INITIAL_ITEMS]
}

function persistMenuItems(updatedItems: MenuItem[] = itemsStore) {
  itemsStore = updatedItems
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('tks_catering_menu_items', JSON.stringify(itemsStore))
    } catch (e) {
      console.warn('Failed to save menu items to localStorage', e)
    }

    try {
      window.dispatchEvent(
        new CustomEvent('tks-menu-updated', {
          detail: { items: [...itemsStore] }
        })
      )
    } catch {}

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('tks_catering_menu_channel')
        bc.postMessage({ type: 'MENU_UPDATED' })
        bc.close()
      }
    } catch {}
  }
}

let categoriesStore: Category[] = [...INITIAL_CATEGORIES]
let itemsStore: MenuItem[] = loadStoredItems()
let ordersStore: Order[] = loadStoredOrders()
let customersStore: Record<string, CustomerRecord> = loadStoredCustomers()
let businessInfoStore: BusinessInfo = { ...INITIAL_BUSINESS_INFO }

export function getStoredOrdersCount(): number {
  return ordersStore.length
}

/**
 * Persist orders to localStorage and notify all real-time listeners across tabs/components
 */
function persistAndBroadcast(updatedOrders: Order[], eventType: string, affectedOrder?: Order) {
  ordersStore = updatedOrders
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('tks_catering_orders', JSON.stringify(ordersStore))
    } catch (e) {
      console.warn('Failed to save orders to localStorage', e)
    }

    // 1. Dispatch custom event for current window
    try {
      window.dispatchEvent(
        new CustomEvent('tks-orders-updated', {
          detail: { orders: [...ordersStore], eventType, order: affectedOrder }
        })
      )
    } catch {}

    // 2. BroadcastChannel for other open tabs
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('tks_catering_channel')
        bc.postMessage({ type: 'ORDERS_UPDATED', eventType, order: affectedOrder })
        bc.close()
      }
    } catch {}
  }
}

/**
 * Real-time subscription to orders updates
 */
export function subscribeToOrders(
  callback: (orders: Order[], event?: { eventType: string; order?: Order }) => void
): () => void {
  if (typeof window === 'undefined') return () => {}

  // 1. Supabase Realtime Subscription (when configured)
  let unsubSupabase = () => {}
  if (isSupabaseConfigured) {
    unsubSupabase = subscribeToSupabaseOrders(async () => {
      try {
        const freshOrders = await getOrdersFromSupabase()
        callback(freshOrders, { eventType: 'SUPABASE_REALTIME' })
      } catch (e) {
        console.warn('Realtime refresh failed:', e)
      }
    })
  }

  // 2. Local Window & BroadcastChannel Listeners
  const handleCustom = (e: Event) => {
    const ce = e as CustomEvent
    callback([...ordersStore], ce.detail)
  }
  window.addEventListener('tks-orders-updated', handleCustom)

  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'tks_catering_orders' && e.newValue) {
      try {
        ordersStore = JSON.parse(e.newValue)
        callback([...ordersStore], { eventType: 'STORAGE_SYNC' })
      } catch {}
    }
  }
  window.addEventListener('storage', handleStorage)

  let bc: BroadcastChannel | null = null
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('tks_catering_channel')
      bc.onmessage = (msg) => {
        if (msg.data?.type === 'ORDERS_UPDATED') {
          ordersStore = loadStoredOrders()
          callback([...ordersStore], msg.data)
        }
      }
    }
  } catch {}

  return () => {
    unsubSupabase()
    window.removeEventListener('tks-orders-updated', handleCustom)
    window.removeEventListener('storage', handleStorage)
    if (bc) bc.close()
  }
}

// Artificial network latency helper
// Fast non-blocking helper for local responsiveness
const delay = (ms: number = 0) => ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve()

export interface CatalogueResponse {
  categories: Category[]
  items: MenuItem[]
  businessInfo: BusinessInfo
}

export interface CustomerDetailResponse {
  customer: CustomerRecord | null
  orders: Order[]
}

/**
 * 1. Fetch complete catering catalogue
 */
export async function getCatalogue(): Promise<CatalogueResponse> {
  if (isSupabaseConfigured) {
    const { categories, items } = await getCatalogueFromSupabase()
    return {
      categories,
      items,
      businessInfo: { ...businessInfoStore }
    }
  }

  await delay()
  return {
    categories: [...categoriesStore].sort((a, b) => a.displayOrder - b.displayOrder),
    items: [...itemsStore].sort((a, b) => a.name.localeCompare(b.name)),
    businessInfo: { ...businessInfoStore }
  }
}

/**
 * 2. Submit customer catering enquiry
 * Note: If URL contains ?fail=1 or forceFail is passed, it rejects to demonstrate error state
 */
export async function submitEnquiry(data: {
  customerName: string
  customerPhone: string
  eventDate: string
  eventTime: 'Morning' | 'Afternoon' | 'Evening'
  specificTime?: string
  eventType: string
  guestCount: number
  venueAddress?: string
  notes?: string
  items: { id: string; name: string; pricePerPlate: number; quantity: number }[]
  perPlateTotal: number
  totalAmount: number
  forceFail?: boolean
}): Promise<Order> {
  // Fail simulation check per specification (?fail=1)
  const isUrlFail = typeof window !== 'undefined' && window.location.search.includes('fail=1')
  if (isUrlFail || data.forceFail) {
    throw new Error('Catering enquiry submission failed due to simulated network timeout (?fail=1). Please retry.')
  }

  if (isSupabaseConfigured) {
    const res = await submitOnlineEnquiryToSupabase({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      deliveryAddress: data.venueAddress || '',
      occasionType: data.eventType,
      occasionDate: data.eventDate,
      serviceTime: data.specificTime || data.eventTime,
      plateCount: data.guestCount,
      specialInstructions: data.notes,
      selectedItemIds: data.items.map((i) => i.id)
    })

    const newOrder: Order = {
      id: res.order_number,
      source: 'Online',
      status: 'New Request',
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      eventDate: data.eventDate,
      eventTime: data.eventTime,
      specificTime: data.specificTime,
      eventType: data.eventType,
      guestCount: data.guestCount,
      venueAddress: data.venueAddress,
      notes: data.notes,
      items: data.items,
      perPlateTotal: data.perPlateTotal,
      totalAmount: res.final_amount || data.totalAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    ordersStore.unshift(newOrder)
    persistAndBroadcast(ordersStore, 'ENQUIRY_CREATED', newOrder)
    return { ...newOrder }
  }

  await delay(350)
  const newId = `TKS-ORD-${Math.floor(100 + Math.random() * 900)}`
  const nowIso = new Date().toISOString()

  const newOrder: Order = {
    id: newId,
    source: 'Online',
    status: 'New Request',
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    eventDate: data.eventDate,
    eventTime: data.eventTime,
    specificTime: data.specificTime,
    eventType: data.eventType,
    guestCount: data.guestCount,
    venueAddress: data.venueAddress,
    notes: data.notes,
    items: data.items,
    perPlateTotal: data.perPlateTotal,
    totalAmount: data.totalAmount,
    createdAt: nowIso,
    updatedAt: nowIso
  }

  ordersStore.unshift(newOrder)
  persistAndBroadcast(ordersStore, 'ENQUIRY_CREATED', newOrder)

  // Record customer interaction in CRM
  await recordEnquiry({
    name: data.customerName,
    phone: data.customerPhone,
    eventDate: data.eventDate,
    notes: data.notes
  })

  return { ...newOrder }
}

/**
 * 3. Admin login verification
 * Mock credentials admin / admin123 live only in the mock API
 */
export async function adminLogin(credentials: { 
  username: string 
  password?: string 
  pin?: string 
}): Promise<{
  success: boolean
  token: string
  user: { name: string; role: string; phone: string }
}> {
  await delay(250)

  const passwordVal = credentials.password || credentials.pin || ''
  const isValid = 
    credentials.username.trim().toLowerCase() === 'admin' && 
    (passwordVal === 'admin123' || passwordVal === 'mysore1965')

  if (!isValid) {
    throw new Error('Incorrect ID or password')
  }

  return {
    success: true,
    token: `tks-admin-token-${Date.now()}`,
    user: {
      name: 'Admin Manager',
      role: 'Operations & Banquet Director',
      phone: '+91 90000 00000'
    }
  }
}

/**
 * 4. Get list of orders with optional status or search filters
 */
export async function getOrders(filters?: {
  status?: OrderStatus | 'All'
  date?: string
  search?: string
}): Promise<Order[]> {
  if (isSupabaseConfigured) {
    try {
      const remoteOrders = await getOrdersFromSupabase({
        status: filters?.status,
        date: filters?.date,
        search: filters?.search
      })
      ordersStore = remoteOrders
      return remoteOrders
    } catch (err) {
      console.warn('[Orders][WARN] Failed to load orders from Supabase:', err)
    }
  }

  await delay()
  let result = [...ordersStore]

  if (filters?.status && filters.status !== 'All') {
    result = result.filter((o) => o.status === filters.status)
  }

  if (filters?.date) {
    result = result.filter((o) => o.eventDate === filters.date)
  }

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

/**
 * 5. Get single order by ID
 */
export async function getOrder(id: string): Promise<Order | null> {
  if (isSupabaseConfigured) {
    const orders = await getOrdersFromSupabase({ search: id })
    const found = orders.find((o) => o.id === id)
    return found || null
  }

  await delay()
  const found = ordersStore.find((o) => o.id === id)
  return found ? { ...found } : null
}

/**
 * 6. Save or update order (Manual or Online)
 */
export async function saveOrder(orderData: Partial<Order> & { customerPhone: string }): Promise<Order> {
  if (isSupabaseConfigured) {
    if (!orderData.id) {
      const created = await createManualOrderInSupabase(orderData)
      ordersStore.unshift(created)
      persistAndBroadcast(ordersStore, 'ORDER_CREATED', created)
      return created
    } else {
      const updated = await updateOrderInSupabase(orderData.id, orderData)
      const idx = ordersStore.findIndex((o) => o.id === orderData.id)
      if (idx !== -1) {
        ordersStore[idx] = updated
      } else {
        ordersStore.unshift(updated)
      }
      persistAndBroadcast(ordersStore, 'ORDER_UPDATED', updated)
      return updated
    }
  }

  await delay(250)
  const nowIso = new Date().toISOString()

  if (orderData.id) {
    const idx = ordersStore.findIndex((o) => o.id === orderData.id)
    if (idx !== -1) {
      ordersStore[idx] = {
        ...ordersStore[idx],
        ...orderData,
        updatedAt: nowIso
      } as Order
      const updated = { ...ordersStore[idx] }
      persistAndBroadcast(ordersStore, 'ORDER_UPDATED', updated)
      return updated
    }
  }

  // Create new manual order
  const calculatedGuestCount = orderData.guestCount || 0
  const calculatedPerPlate = orderData.perPlateTotal || 0
  const calculatedTotal = orderData.totalAmount !== undefined 
    ? orderData.totalAmount 
    : calculatedPerPlate * calculatedGuestCount

  const newOrder: Order = {
    id: `TKS-MAN-${Math.floor(200 + Math.random() * 800)}`,
    source: 'Manual',
    status: orderData.status || 'Under Discussion',
    customerName: orderData.customerName?.trim() || `Customer (${orderData.customerPhone})`,
    customerPhone: orderData.customerPhone,
    eventDate: orderData.eventDate || '',
    eventTime: orderData.eventTime || 'Morning',
    eventType: orderData.eventType || 'Catering Function',
    guestCount: calculatedGuestCount,
    venueAddress: orderData.venueAddress || '',
    notes: orderData.notes || '',
    items: orderData.items || [],
    deliveryCharges: orderData.deliveryCharges ?? 1500,
    customizationCharges: orderData.customizationCharges ?? 1000,
    perPlateTotal: calculatedPerPlate,
    totalAmount: calculatedTotal,
    createdAt: nowIso,
    updatedAt: nowIso
  }

  ordersStore.unshift(newOrder)
  persistAndBroadcast(ordersStore, 'ORDER_CREATED', newOrder)

  await recordEnquiry({
    name: newOrder.customerName,
    phone: newOrder.customerPhone,
    eventDate: newOrder.eventDate,
    notes: newOrder.notes
  })

  return { ...newOrder }
}

/**
 * 7. Confirm order
 */
export async function confirmOrder(id: string): Promise<Order> {
  return setStatus(id, 'Confirmed', 'Manager confirmed booking in Catering Desk')
}

/**
 * 8. Set status on order (with mandatory audit trail reason for confirmed orders)
 */
export async function setStatus(
  id: string,
  status: OrderStatus,
  reason?: string,
  changeDiff?: any
): Promise<Order> {
  if (isSupabaseConfigured) {
    await setOrderStatusInSupabase(id, status, reason, changeDiff)
    const updatedOrders = await getOrdersFromSupabase({ search: id })
    const found = updatedOrders.find((o) => o.id === id)
    if (!found) {
      throw new Error(`Order ${id} not found in Supabase database after status update.`)
    }
    const idx = ordersStore.findIndex((o) => o.id === id)
    if (idx !== -1) ordersStore[idx] = found
    persistAndBroadcast(ordersStore, 'ORDER_STATUS_CHANGED', found)
    return found
  }

  await delay(180)
  const order = ordersStore.find((o) => o.id === id)
  if (!order) {
    const fallbackOrder: Order = {
      id,
      source: 'Online',
      status,
      customerName: 'Valued Customer',
      customerPhone: '',
      eventDate: '',
      eventTime: 'Morning',
      eventType: 'Catering',
      guestCount: 50,
      items: [],
      perPlateTotal: 0,
      totalAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    return fallbackOrder
  }

  order.status = status
  order.updatedAt = new Date().toISOString()
  persistAndBroadcast(ordersStore, 'ORDER_STATUS_CHANGED', { ...order })
  return { ...order }
}

/**
 * 9. Get all customers
 */
export async function getCustomers(filters?: { search?: string }): Promise<CustomerRecord[]> {
  if (isSupabaseConfigured) {
    return await getCustomersFromSupabase(filters)
  }

  await delay()
  let list = Object.values(customersStore)

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    list = list.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.notes.toLowerCase().includes(q))
  }

  return list.sort((a, b) => b.lastContacted.localeCompare(a.lastContacted))
}

/**
 * 10. Get customer and associated orders
 */
export async function getCustomer(phone: string): Promise<CustomerDetailResponse> {
  const cleanPhone = phone.replace(/^\+91/, '').replace(/\s+/g, '').trim()

  if (isSupabaseConfigured) {
    const [customers, orders] = await Promise.all([
      getCustomersFromSupabase({ search: cleanPhone }),
      getOrdersFromSupabase({ search: cleanPhone })
    ])
    const customer = customers.find((c) => c.phone.replace(/^\+91/, '').replace(/\s+/g, '').trim() === cleanPhone) || customers[0] || null
    return {
      customer,
      orders
    }
  }

  await delay(120)
  const customer = customersStore[cleanPhone] || null
  const orders = ordersStore.filter((o) => o.customerPhone.replace(/^\+91/, '').replace(/\s+/g, '').trim() === cleanPhone)
  return {
    customer: customer ? { ...customer } : null,
    orders: [...orders]
  }
}

/**
 * 11. Record customer enquiry in CRM
 */
export async function recordEnquiry(enquiry: {
  name: string
  phone: string
  eventDate: string
  notes?: string
}): Promise<CustomerRecord> {
  invalidateCustomersCache()
  const existing = customersStore[enquiry.phone]
  const today = new Date().toISOString().split('T')[0]

  if (existing) {
    existing.name = enquiry.name || existing.name
    existing.lastContacted = today
    existing.enquiryCount += 1
    if (enquiry.notes) {
      existing.notes = existing.notes ? `${existing.notes}; ${enquiry.notes}` : enquiry.notes
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('tks_catering_customers', JSON.stringify(customersStore))
      } catch {}
    }
    return { ...existing }
  }

  const newCust: CustomerRecord = {
    phone: enquiry.phone,
    name: enquiry.name,
    firstContacted: today,
    lastContacted: today,
    enquiryCount: 1,
    confirmedCount: 0,
    notes: enquiry.notes || 'Inquired via customer web application.'
  }

  customersStore[enquiry.phone] = newCust
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('tks_catering_customers', JSON.stringify(customersStore))
    } catch {}
  }
  return { ...newCust }
}

/**
 * 12. Save Category (Add or Rename)
 */
export async function saveCategory(category: { id?: string; name: string; displayOrder?: number }): Promise<Category[]> {
  if (isSupabaseConfigured) {
    await saveCategoryToSupabase(category)
    const cat = await getCatalogueFromSupabase()
    categoriesStore = [...cat.categories]
    return [...categoriesStore]
  }

  await delay(200)
  const cleanName = category.name.trim()
  if (category.id) {
    const idx = categoriesStore.findIndex((c) => c.id === category.id)
    if (idx !== -1) {
      const oldName = categoriesStore[idx].name
      categoriesStore[idx].name = cleanName
      if (category.displayOrder !== undefined) categoriesStore[idx].displayOrder = category.displayOrder

      // If category name changed, update items matching oldName
      if (oldName !== cleanName) {
        itemsStore.forEach((item) => {
          if (item.category === oldName) {
            item.category = cleanName
          }
        })
      }
    }
  } else {
    categoriesStore.push({
      id: `cat-${Date.now()}`,
      name: cleanName,
      displayOrder: category.displayOrder || categoriesStore.length + 1
    })
  }
  return [...categoriesStore].sort((a, b) => a.displayOrder - b.displayOrder)
}

/**
 * 13. Reorder Categories
 */
export async function reorderCategories(ids: string[]): Promise<Category[]> {
  await delay(150)
  ids.forEach((id, idx) => {
    const found = categoriesStore.find((c) => c.id === id)
    if (found) found.displayOrder = idx + 1
  })
  return [...categoriesStore].sort((a, b) => a.displayOrder - b.displayOrder)
}

/**
 * 14. Delete Category (with items handling)
 */
export async function deleteCategory(
  id: string,
  options?: {
    moveItemsToCategory?: string
    deleteItems?: boolean
  }
): Promise<{ categories: Category[]; items: MenuItem[] }> {
  if (isSupabaseConfigured && !id.startsWith('cat-')) {
    await deleteCategoryFromSupabase(id)
    const cat = await getCatalogueFromSupabase()
    categoriesStore = [...cat.categories]
    itemsStore = [...cat.items]
    return { categories: [...categoriesStore], items: [...itemsStore] }
  }

  await delay(200)
  const cat = categoriesStore.find((c) => c.id === id)
  if (cat) {
    if (options?.moveItemsToCategory) {
      itemsStore.forEach((item) => {
        if (item.category === cat.name) {
          item.category = options.moveItemsToCategory!
        }
      })
    } else if (options?.deleteItems) {
      itemsStore = itemsStore.filter((item) => item.category !== cat.name)
    }
    categoriesStore = categoriesStore.filter((c) => c.id !== id)
  }
  return {
    categories: [...categoriesStore].sort((a, b) => a.displayOrder - b.displayOrder),
    items: [...itemsStore]
  }
}

export const DEFAULT_DISH_IMAGE = '/default-dish.svg'

export const CATEGORY_DEFAULT_EMOJIS: Record<string, string> = {
  'Rice & Rice Dishes': '🍚',
  'Curries & Gravies': '🥘',
  'Sweets & Desserts': '🍯',
  'Tiffins & Breakfast': '🥞',
  'Beverages': '☕',
  'Rasam & Soups': '🫖',
  'Savouries & Snacks': '🥟',
  'Accompaniments': '🥗',
  'Special Items': '✨'
}

export function getDefaultEmoji(category?: string): string {
  if (!category) return '🍲'
  return CATEGORY_DEFAULT_EMOJIS[category] || '🍲'
}

/**
 * 15. Save or Edit Menu Item
 */
export async function saveItem(
  itemData: Partial<MenuItem> & { name: string; pricePerPlate: number; category: string }
): Promise<MenuItem[]> {
  if (isSupabaseConfigured) {
    const saved = await saveMenuItemToSupabase(itemData)
    const idx = itemsStore.findIndex((i) => i.id === saved.id)
    if (idx !== -1) {
      itemsStore[idx] = saved
    } else {
      itemsStore.push(saved)
    }
    persistMenuItems()
    return [...itemsStore]
  }

  await delay(200)
  const defaultImg = DEFAULT_DISH_IMAGE
  const defaultEmo = getDefaultEmoji(itemData.category)

  if (itemData.id) {
    const idx = itemsStore.findIndex((i) => i.id === itemData.id)
    if (idx !== -1) {
      const existing = itemsStore[idx]
      itemsStore[idx] = {
        ...existing,
        ...itemData,
        name: itemData.name.trim(),
        pricePerPlate: Number(itemData.pricePerPlate),
        image: itemData.image && itemData.image.trim() !== '' ? itemData.image : existing.image || defaultImg,
        emoji: itemData.emoji || existing.emoji || defaultEmo
      } as MenuItem
      persistMenuItems()
      return [...itemsStore]
    }
  }

  const newItem: MenuItem = {
    id: `item-${Date.now()}`,
    name: itemData.name.trim(),
    pricePerPlate: Number(itemData.pricePerPlate),
    category: itemData.category,
    image: itemData.image && itemData.image.trim() !== '' ? itemData.image : defaultImg,
    gradient: itemData.gradient || 'from-amber-100 to-yellow-200',
    emoji: itemData.emoji || defaultEmo,
    available: itemData.available !== undefined ? itemData.available : true,
    description: itemData.description,
    portionLabel: itemData.portionLabel,
    heritageTag: itemData.heritageTag
  }

  itemsStore.push(newItem)
  persistMenuItems()
  return [...itemsStore]
}

/**
 * 16. Toggle Item Availability
 */
export async function toggleItemAvailability(id: string, available: boolean): Promise<MenuItem> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (isSupabaseConfigured && uuidRegex.test(id)) {
    await toggleItemAvailabilityInSupabase(id, available)
    const local = itemsStore.find((i) => i.id === id)
    if (local) {
      local.available = available
      persistMenuItems()
      return { ...local }
    }
    return {
      id,
      name: '',
      pricePerPlate: 0,
      category: '',
      image: '/default-dish.svg',
      gradient: '',
      emoji: '',
      available,
      portionLabel: ''
    }
  }

  const item = itemsStore.find((i) => i.id === id)
  if (!item) throw new Error(`Item ${id} not found`)
  item.available = available
  persistMenuItems()
  notifyMenuChange({ table: 'menu_items', eventType: 'UPDATE', new: { ...item } })
  return { ...item }
}

/**
 * 17. Move Menu Item to Target Category
 */
export async function moveItem(itemId: string, targetCategory: string): Promise<MenuItem[]> {
  const item = itemsStore.find((i) => i.id === itemId)
  if (item) {
    item.category = targetCategory
    persistMenuItems()
    notifyMenuChange({ table: 'menu_items', eventType: 'UPDATE', new: { ...item } })
  }
  return [...itemsStore]
}

/**
 * 18. Delete Menu Item
 */
export async function deleteItem(id: string): Promise<MenuItem[]> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (isSupabaseConfigured && uuidRegex.test(id)) {
    await deleteMenuItemFromSupabase(id)
    itemsStore = itemsStore.filter((i) => i.id !== id)
    persistMenuItems()
    notifyMenuChange({ table: 'menu_items', eventType: 'DELETE', old: { id } })
    return [...itemsStore]
  }

  itemsStore = itemsStore.filter((i) => i.id !== id)
  persistMenuItems()
  notifyMenuChange({ table: 'menu_items', eventType: 'DELETE', old: { id } })
  return [...itemsStore]
}

/**
 * 19. Realtime Menu Subscription
 */
export function subscribeToMenu(callback: (event: { table: string; eventType: string; new: any; old: any }) => void): () => void {
  if (isSupabaseConfigured) {
    return subscribeToSupabaseMenu(callback)
  }
  return () => {}
}


// Feast related utilities
export { loadFeasts, saveFeasts, addFeast, updateFeast, deleteFeast, seedDefaultFeasts } from '@/api/feastApi';
