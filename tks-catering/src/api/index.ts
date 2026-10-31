import { 
  type Category, 
  type MenuItem, 
  type Order, 
  type OrderStatus, 
  type CustomerRecord, 
  type BusinessInfo, 
  INITIAL_BUSINESS_INFO, 
  INITIAL_CATEGORIES, 
  INITIAL_ITEMS, 
  INITIAL_ORDERS, 
  INITIAL_CUSTOMERS 
} from '@/data/mockData'

// In-memory data store initialized from seed data or localStorage
function loadStoredOrders(): Order[] {
  if (typeof window === 'undefined') return [...INITIAL_ORDERS]
  try {
    const stored = localStorage.getItem('tks_catering_orders')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.warn('Failed to load stored orders:', e)
  }
  return [...INITIAL_ORDERS]
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
let customersStore: Record<string, CustomerRecord> = { ...INITIAL_CUSTOMERS }
let businessInfoStore: BusinessInfo = { ...INITIAL_BUSINESS_INFO }

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
    window.removeEventListener('tks-orders-updated', handleCustom)
    window.removeEventListener('storage', handleStorage)
    if (bc) bc.close()
  }
}

// Artificial network latency helper
const delay = (ms: number = 220) => new Promise((resolve) => setTimeout(resolve, ms))

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
  await delay()
  return {
    categories: [...categoriesStore].sort((a, b) => a.displayOrder - b.displayOrder),
    items: [...itemsStore],
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
  eventType: string
  guestCount: number
  venueAddress?: string
  notes?: string
  items: { id: string; name: string; pricePerPlate: number; quantity: number }[]
  perPlateTotal: number
  totalAmount: number
  forceFail?: boolean
}): Promise<Order> {
  await delay(350)

  // Fail simulation check per specification (?fail=1)
  const isUrlFail = typeof window !== 'undefined' && window.location.search.includes('fail=1')
  if (isUrlFail || data.forceFail) {
    throw new Error('Catering enquiry submission failed due to simulated network timeout (?fail=1). Please retry.')
  }

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
  await delay()
  const found = ordersStore.find((o) => o.id === id)
  return found ? { ...found } : null
}

/**
 * 6. Save or update order (Manual or Online)
 */
export async function saveOrder(orderData: Partial<Order> & { customerPhone: string }): Promise<Order> {
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
  await delay(200)
  const order = ordersStore.find((o) => o.id === id)
  if (!order) throw new Error(`Order ${id} not found`)

  order.status = 'Confirmed'
  order.updatedAt = new Date().toISOString()

  if (customersStore[order.customerPhone]) {
    customersStore[order.customerPhone].confirmedCount += 1
    customersStore[order.customerPhone].lastContacted = order.eventDate
  }

  persistAndBroadcast(ordersStore, 'ORDER_CONFIRMED', { ...order })
  return { ...order }
}

/**
 * 8. Set status on order
 */
export async function setStatus(id: string, status: OrderStatus): Promise<Order> {
  await delay(180)
  const order = ordersStore.find((o) => o.id === id)
  if (!order) throw new Error(`Order ${id} not found`)

  order.status = status
  order.updatedAt = new Date().toISOString()
  persistAndBroadcast(ordersStore, 'ORDER_STATUS_CHANGED', { ...order })
  return { ...order }
}

/**
 * 9. Get all customers
 */
export async function getCustomers(filters?: { search?: string }): Promise<CustomerRecord[]> {
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
  await delay(120)
  const cleanPhone = phone.replace(/^\+91/, '').replace(/\s+/g, '').trim()
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
  const existing = customersStore[enquiry.phone]
  const today = new Date().toISOString().split('T')[0]

  if (existing) {
    existing.name = enquiry.name || existing.name
    existing.lastContacted = today
    existing.enquiryCount += 1
    if (enquiry.notes) {
      existing.notes = existing.notes ? `${existing.notes}; ${enquiry.notes}` : enquiry.notes
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
  return { ...newCust }
}

/**
 * 12. Save Category (Add or Rename)
 */
export async function saveCategory(category: { id?: string; name: string; displayOrder?: number }): Promise<Category[]> {
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
    available: itemData.available !== undefined ? itemData.available : true
  }

  itemsStore.push(newItem)
  persistMenuItems()
  return [...itemsStore]
}

/**
 * 16. Toggle Item Availability
 */
export async function toggleItemAvailability(id: string, available: boolean): Promise<MenuItem> {
  await delay(60)
  const item = itemsStore.find((i) => i.id === id)
  if (!item) throw new Error(`Item ${id} not found`)
  item.available = available
  persistMenuItems()
  return { ...item }
}

/**
 * 17. Move Menu Item to Target Category
 */
export async function moveItem(itemId: string, targetCategory: string): Promise<MenuItem[]> {
  await delay(150)
  const item = itemsStore.find((i) => i.id === itemId)
  if (item) {
    item.category = targetCategory
    persistMenuItems()
  }
  return [...itemsStore]
}

/**
 * 18. Delete Menu Item
 */
export async function deleteItem(id: string): Promise<MenuItem[]> {
  await delay(180)
  itemsStore = itemsStore.filter((i) => i.id !== id)
  persistMenuItems()
  return [...itemsStore]
}

