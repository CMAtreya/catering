export interface Category {
  id: string
  name: string
  displayOrder: number
}

export interface MenuItem {
  id: string
  name: string
  pricePerPlate: number
  category: string
  image: string
  gradient: string
  emoji: string
  available: boolean
}

export type OrderStatus = 'New Request' | 'Under Discussion' | 'Confirmed' | 'Completed' | 'Cancelled'
export type OrderSource = 'Online' | 'Manual'

export interface OrderItem {
  id: string
  name: string
  pricePerPlate: number
  quantity: number
}

export interface Order {
  id: string
  source: OrderSource
  status: OrderStatus
  customerName: string
  customerPhone: string
  eventDate: string // YYYY-MM-DD
  eventTime: 'Morning' | 'Afternoon' | 'Evening'
  eventType: string
  guestCount: number
  venueAddress?: string
  notes?: string
  specialInstructions?: string
  enquiryNotes?: string
  finalInstructions?: string
  items: OrderItem[]
  perPlateTotal: number
  deliveryCharges?: number
  customizationCharges?: number
  gstMode?: 'percent' | 'fixed'
  gstValue?: number
  gstAmount?: number
  totalAmount: number
  createdAt: string
  updatedAt: string
}

export interface CustomerRecord {
  phone: string
  name: string
  address?: string
  firstContacted: string // YYYY-MM-DD
  lastContacted: string // YYYY-MM-DD
  enquiryCount: number
  confirmedCount: number
  notes: string
}

export interface BusinessInfo {
  name: string
  legalName?: string
  tagline: string
  phone: string
  email: string
  address: string
  registeredOffice?: string
  city: string
  pincode: string
  fssaiNumber: string
  gstNumber: string
  businessHours?: string
}

export const INITIAL_BUSINESS_INFO: BusinessInfo = {
  name: 'TKS Iyengars Mysore Catering',
  legalName: 'TKS Catering Services Private Limited',
  tagline: 'Authentic Traditional Mysuru Banquet & Catering Heritage',
  phone: '+91 90000 00000',
  email: 'orders@tksiyengarscatering.com',
  address: '142/A, Krishnamurthy Puram',
  registeredOffice: 'Shop 14, 5th Main Road, Vani Vilas Mohalla',
  city: 'Mysuru, Karnataka',
  pincode: '570002',
  fssaiNumber: '11223344556677',
  gstNumber: '29ABCDE1234F1Z5',
  businessHours: 'Monday – Sunday: 8:00 AM – 9:00 PM IST'
}

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-rice', name: 'Rice & Rice Dishes', displayOrder: 1 },
  { id: 'cat-curries', name: 'Curries & Gravies', displayOrder: 2 },
  { id: 'cat-sweets', name: 'Sweets & Desserts', displayOrder: 3 },
  { id: 'cat-tiffins', name: 'Tiffins & Breakfast', displayOrder: 4 },
  { id: 'cat-beverages', name: 'Beverages', displayOrder: 5 }
]

export const INITIAL_ITEMS: MenuItem[] = [
  // 1. Rice & Rice Dishes (5 items)
  {
    id: 'item-1',
    name: 'Bisi Bele Bath',
    pricePerPlate: 65,
    category: 'Rice & Rice Dishes',
    image: '',
    gradient: 'from-amber-100 to-orange-200',
    emoji: '🍲',
    available: true
  },
  {
    id: 'item-2',
    name: 'Puliyogare',
    pricePerPlate: 55,
    category: 'Rice & Rice Dishes',
    image: '',
    gradient: 'from-yellow-100 to-amber-200',
    emoji: '🍚',
    available: true
  },
  {
    id: 'item-3',
    name: 'Lemon Rice',
    pricePerPlate: 50,
    category: 'Rice & Rice Dishes',
    image: '',
    gradient: 'from-yellow-50 to-lime-100',
    emoji: '🍋',
    available: true
  },
  {
    id: 'item-4',
    name: 'Curd Rice',
    pricePerPlate: 45,
    category: 'Rice & Rice Dishes',
    image: '',
    gradient: 'from-slate-50 to-emerald-50',
    emoji: '🥣',
    available: true
  },
  {
    id: 'item-5',
    name: 'Pongal',
    pricePerPlate: 60,
    category: 'Rice & Rice Dishes',
    image: '',
    gradient: 'from-amber-50 to-yellow-100',
    emoji: '🥘',
    available: true
  },

  // 2. Curries & Gravies (4 items)
  {
    id: 'item-6',
    name: 'Sambar',
    pricePerPlate: 35,
    category: 'Curries & Gravies',
    image: '',
    gradient: 'from-orange-100 to-red-100',
    emoji: '🍲',
    available: true
  },
  {
    id: 'item-7',
    name: 'Rasam',
    pricePerPlate: 30,
    category: 'Curries & Gravies',
    image: '',
    gradient: 'from-red-50 to-orange-100',
    emoji: '🍵',
    available: true
  },
  {
    id: 'item-8',
    name: 'Palya',
    pricePerPlate: 35,
    category: 'Curries & Gravies',
    image: '',
    gradient: 'from-emerald-50 to-green-100',
    emoji: '🥗',
    available: true
  },
  {
    id: 'item-9',
    name: 'Majjige Huli',
    pricePerPlate: 40,
    category: 'Curries & Gravies',
    image: '',
    gradient: 'from-lime-50 to-amber-50',
    emoji: '🥣',
    available: true
  },

  // 3. Sweets & Desserts (4 items - 1 unavailable)
  {
    id: 'item-10',
    name: 'Mysore Pak',
    pricePerPlate: 45,
    category: 'Sweets & Desserts',
    image: '',
    gradient: 'from-amber-200 to-yellow-300',
    emoji: '🧈',
    available: true
  },
  {
    id: 'item-11',
    name: 'Kesari Bath',
    pricePerPlate: 40,
    category: 'Sweets & Desserts',
    image: '',
    gradient: 'from-orange-200 to-amber-300',
    emoji: '🍯',
    available: true
  },
  {
    id: 'item-12',
    name: 'Payasa',
    pricePerPlate: 45,
    category: 'Sweets & Desserts',
    image: '',
    gradient: 'from-rose-50 to-amber-100',
    emoji: '🍧',
    available: true
  },
  {
    id: 'item-13',
    name: 'Holige',
    pricePerPlate: 50,
    category: 'Sweets & Desserts',
    image: '',
    gradient: 'from-amber-100 to-orange-100',
    emoji: '🥞',
    available: false // 1st unavailable item per spec
  },

  // 4. Tiffins & Breakfast (5 items - 1 unavailable)
  {
    id: 'item-14',
    name: 'Idli',
    pricePerPlate: 40,
    category: 'Tiffins & Breakfast',
    image: '',
    gradient: 'from-slate-100 to-stone-200',
    emoji: '⚪',
    available: true
  },
  {
    id: 'item-15',
    name: 'Medu Vada',
    pricePerPlate: 45,
    category: 'Tiffins & Breakfast',
    image: '',
    gradient: 'from-amber-100 to-amber-300',
    emoji: '🍩',
    available: true
  },
  {
    id: 'item-16',
    name: 'Khara Bath',
    pricePerPlate: 40,
    category: 'Tiffins & Breakfast',
    image: '',
    gradient: 'from-orange-100 to-yellow-200',
    emoji: '🍛',
    available: true
  },
  {
    id: 'item-17',
    name: 'Dosa',
    pricePerPlate: 50,
    category: 'Tiffins & Breakfast',
    image: '',
    gradient: 'from-amber-200 to-orange-300',
    emoji: '🌯',
    available: true
  },
  {
    id: 'item-18',
    name: 'Akki Roti',
    pricePerPlate: 55,
    category: 'Tiffins & Breakfast',
    image: '',
    gradient: 'from-stone-100 to-amber-100',
    emoji: '🫓',
    available: false // 2nd unavailable item per spec
  },

  // 5. Beverages (2 items)
  {
    id: 'item-19',
    name: 'Filter Coffee',
    pricePerPlate: 25,
    category: 'Beverages',
    image: '',
    gradient: 'from-amber-800/20 to-stone-800/30',
    emoji: '☕',
    available: true
  },
  {
    id: 'item-20',
    name: 'Buttermilk',
    pricePerPlate: 20,
    category: 'Beverages',
    image: '',
    gradient: 'from-emerald-50 to-teal-100',
    emoji: '🥛',
    available: true
  }
]

export const INITIAL_ORDERS: Order[] = [
  // 0. Confirmed upcoming in October (current month)
  {
    id: 'TKS-ORD-100',
    source: 'Online',
    status: 'Confirmed',
    customerName: 'Sowmya Raghavan',
    customerPhone: '9845198765',
    eventDate: '2026-10-28',
    eventTime: 'Morning',
    eventType: 'Ayushya Homam',
    guestCount: 150,
    venueAddress: 'Kuvempunagar 2nd Stage, Mysuru',
    notes: 'Morning pooja tiffin followed by traditional feast.',
    items: [
      { id: 'item-14', name: 'Idli', pricePerPlate: 40, quantity: 1 },
      { id: 'item-15', name: 'Medu Vada', pricePerPlate: 45, quantity: 1 },
      { id: 'item-11', name: 'Kesari Bath', pricePerPlate: 40, quantity: 1 },
      { id: 'item-19', name: 'Filter Coffee', pricePerPlate: 25, quantity: 1 }
    ],
    perPlateTotal: 150,
    totalAmount: 22500,
    createdAt: '2026-10-20T09:00:00Z',
    updatedAt: '2026-10-22T10:30:00Z'
  },
  // 1. Confirmed upcoming on Sat, 14 Nov 2026 (Multiple confirmed on same date per spec)
  {
    id: 'TKS-ORD-101',
    source: 'Online',
    status: 'Confirmed',
    customerName: 'Kalyan Ramanathan',
    customerPhone: '9845012345',
    eventDate: '2026-11-14',
    eventTime: 'Morning',
    eventType: 'Traditional Muhurtham',
    guestCount: 450,
    venueAddress: 'Sri Chamundeshwari Kalyana Mantapa, Saraswathipuram, Mysuru',
    notes: 'Require silver-glove banana leaf servers and hot coffee round after muhurtham.',
    items: [
      { id: 'item-1', name: 'Bisi Bele Bath', pricePerPlate: 65, quantity: 1 },
      { id: 'item-4', name: 'Curd Rice', pricePerPlate: 45, quantity: 1 },
      { id: 'item-6', name: 'Sambar', pricePerPlate: 35, quantity: 1 },
      { id: 'item-7', name: 'Rasam', pricePerPlate: 30, quantity: 1 },
      { id: 'item-8', name: 'Palya', pricePerPlate: 35, quantity: 1 },
      { id: 'item-10', name: 'Mysore Pak', pricePerPlate: 45, quantity: 1 },
      { id: 'item-19', name: 'Filter Coffee', pricePerPlate: 25, quantity: 1 }
    ],
    perPlateTotal: 280,
    totalAmount: 126000,
    createdAt: '2026-10-18T10:30:00Z',
    updatedAt: '2026-10-19T14:20:00Z'
  },
  // 2. Another Confirmed on Sat, 14 Nov 2026
  {
    id: 'TKS-ORD-102',
    source: 'Manual',
    status: 'Confirmed',
    customerName: 'Anantha Padmanabha',
    customerPhone: '9448067890',
    eventDate: '2026-11-14',
    eventTime: 'Afternoon',
    eventType: 'Upanayana Feast',
    guestCount: 200,
    venueAddress: 'Vani Vilas Club Convention Hall, Mysuru',
    notes: 'Strict Satvik preparation, strictly no onion/garlic.',
    items: [
      { id: 'item-2', name: 'Puliyogare', pricePerPlate: 55, quantity: 1 },
      { id: 'item-4', name: 'Curd Rice', pricePerPlate: 45, quantity: 1 },
      { id: 'item-8', name: 'Palya', pricePerPlate: 35, quantity: 1 },
      { id: 'item-12', name: 'Payasa', pricePerPlate: 45, quantity: 1 }
    ],
    perPlateTotal: 180,
    totalAmount: 36000,
    createdAt: '2026-10-15T11:00:00Z',
    updatedAt: '2026-10-17T09:15:00Z'
  },
  // 3. Third Confirmed on Sat, 14 Nov 2026
  {
    id: 'TKS-ORD-103',
    source: 'Online',
    status: 'Confirmed',
    customerName: 'Sunil Kumar V',
    customerPhone: '9900123456',
    eventDate: '2026-11-14',
    eventTime: 'Evening',
    eventType: 'Engagement Reception',
    guestCount: 300,
    venueAddress: 'Silent Shores Resort Banquet Lawns, BEML Road, Mysuru',
    notes: 'Live tiffin counter with dosas and filter coffee.',
    items: [
      { id: 'item-14', name: 'Idli', pricePerPlate: 40, quantity: 1 },
      { id: 'item-15', name: 'Medu Vada', pricePerPlate: 45, quantity: 1 },
      { id: 'item-17', name: 'Dosa', pricePerPlate: 50, quantity: 1 },
      { id: 'item-19', name: 'Filter Coffee', pricePerPlate: 25, quantity: 1 }
    ],
    perPlateTotal: 160,
    totalAmount: 48000,
    createdAt: '2026-10-19T16:00:00Z',
    updatedAt: '2026-10-20T12:00:00Z'
  },
  // 4. Confirmed on Fri, 04 Dec 2026 (Second date with multiple confirmed orders per spec)
  {
    id: 'TKS-ORD-104',
    source: 'Online',
    status: 'Confirmed',
    customerName: 'Vidya Shankaran',
    customerPhone: '9740112233',
    eventDate: '2026-12-04',
    eventTime: 'Morning',
    eventType: 'Shastiabdapoorthi (60th Bday)',
    guestCount: 250,
    venueAddress: 'Chamarajapuram Community Center, Mysuru',
    items: [
      { id: 'item-1', name: 'Bisi Bele Bath', pricePerPlate: 65, quantity: 1 },
      { id: 'item-5', name: 'Pongal', pricePerPlate: 60, quantity: 1 },
      { id: 'item-10', name: 'Mysore Pak', pricePerPlate: 45, quantity: 1 }
    ],
    perPlateTotal: 170,
    totalAmount: 42500,
    createdAt: '2026-10-16T12:00:00Z',
    updatedAt: '2026-10-18T10:00:00Z'
  },
  // 5. Another Confirmed on Fri, 04 Dec 2026
  {
    id: 'TKS-ORD-105',
    source: 'Manual',
    status: 'Confirmed',
    customerName: 'Raghavendra Rao',
    customerPhone: '9880223344',
    eventDate: '2026-12-04',
    eventTime: 'Afternoon',
    eventType: 'Gruhapravesha',
    guestCount: 180,
    // Note: missing optional venueAddress & notes per spec
    items: [
      { id: 'item-3', name: 'Lemon Rice', pricePerPlate: 50, quantity: 1 },
      { id: 'item-4', name: 'Curd Rice', pricePerPlate: 45, quantity: 1 },
      { id: 'item-11', name: 'Kesari Bath', pricePerPlate: 40, quantity: 1 }
    ],
    perPlateTotal: 135,
    totalAmount: 24300,
    createdAt: '2026-10-17T15:30:00Z',
    updatedAt: '2026-10-21T09:00:00Z'
  },
  // 6. New Request - Online (upcoming)
  {
    id: 'TKS-ORD-106',
    source: 'Online',
    status: 'New Request',
    customerName: 'Deepa Narayan',
    customerPhone: '9611334455',
    eventDate: '2026-12-18',
    eventTime: 'Morning',
    eventType: 'Wedding Breakfast',
    guestCount: 350,
    venueAddress: 'Gokulam 3rd Stage, Mysuru',
    notes: 'Require traditional banana leaf service.',
    items: [
      { id: 'item-14', name: 'Idli', pricePerPlate: 40, quantity: 1 },
      { id: 'item-15', name: 'Medu Vada', pricePerPlate: 45, quantity: 1 },
      { id: 'item-16', name: 'Khara Bath', pricePerPlate: 40, quantity: 1 },
      { id: 'item-11', name: 'Kesari Bath', pricePerPlate: 40, quantity: 1 },
      { id: 'item-19', name: 'Filter Coffee', pricePerPlate: 25, quantity: 1 }
    ],
    perPlateTotal: 190,
    totalAmount: 66500,
    createdAt: '2026-10-22T08:15:00Z',
    updatedAt: '2026-10-22T08:15:00Z'
  },
  // 7. New Request - Manual (upcoming)
  {
    id: 'TKS-ORD-107',
    source: 'Manual',
    status: 'New Request',
    customerName: 'Harish Belavadi',
    customerPhone: '9844556677',
    eventDate: '2026-12-25',
    eventTime: 'Evening',
    eventType: 'Family Get-Together',
    guestCount: 120,
    // Missing venueAddress
    notes: 'Need tasting session first.',
    items: [
      { id: 'item-1', name: 'Bisi Bele Bath', pricePerPlate: 65, quantity: 1 },
      { id: 'item-10', name: 'Mysore Pak', pricePerPlate: 45, quantity: 1 }
    ],
    perPlateTotal: 110,
    totalAmount: 13200,
    createdAt: '2026-10-21T18:00:00Z',
    updatedAt: '2026-10-21T18:00:00Z'
  },
  // 8. Under Discussion - Online
  {
    id: 'TKS-ORD-108',
    source: 'Online',
    status: 'Under Discussion',
    customerName: 'Kalyan Ramanathan',
    customerPhone: '9845012345',
    eventDate: '2027-01-15',
    eventTime: 'Afternoon',
    eventType: 'Makar Sankranti Special Feast',
    guestCount: 500,
    venueAddress: 'Hebbal Industrial Area Banquet Hall, Mysuru',
    notes: 'Discussing dessert menu options and sugarcane juice counter.',
    items: [
      { id: 'item-5', name: 'Pongal', pricePerPlate: 60, quantity: 1 },
      { id: 'item-2', name: 'Puliyogare', pricePerPlate: 55, quantity: 1 },
      { id: 'item-12', name: 'Payasa', pricePerPlate: 45, quantity: 1 }
    ],
    perPlateTotal: 160,
    totalAmount: 80000,
    createdAt: '2026-10-20T09:30:00Z',
    updatedAt: '2026-10-22T11:45:00Z'
  },
  // 9. Under Discussion - Manual
  {
    id: 'TKS-ORD-109',
    source: 'Manual',
    status: 'Under Discussion',
    customerName: 'Anantha Padmanabha',
    customerPhone: '9448067890',
    eventDate: '2026-12-10',
    eventTime: 'Morning',
    eventType: 'Corporate Annual Meeting',
    guestCount: 150,
    items: [
      { id: 'item-14', name: 'Idli', pricePerPlate: 40, quantity: 1 },
      { id: 'item-19', name: 'Filter Coffee', pricePerPlate: 25, quantity: 1 }
    ],
    perPlateTotal: 65,
    totalAmount: 9750,
    createdAt: '2026-10-19T14:10:00Z',
    updatedAt: '2026-10-21T16:20:00Z'
  },
  // 10. Completed - Past Order
  {
    id: 'TKS-ORD-110',
    source: 'Online',
    status: 'Completed',
    customerName: 'Vidya Shankaran',
    customerPhone: '9740112233',
    eventDate: '2026-09-20',
    eventTime: 'Afternoon',
    eventType: 'Navaratri Gombe Habba',
    guestCount: 220,
    venueAddress: 'Jayalakshmipuram, Mysuru',
    notes: 'Completed successfully with 5 star feedback.',
    items: [
      { id: 'item-1', name: 'Bisi Bele Bath', pricePerPlate: 65, quantity: 1 },
      { id: 'item-2', name: 'Puliyogare', pricePerPlate: 55, quantity: 1 },
      { id: 'item-4', name: 'Curd Rice', pricePerPlate: 45, quantity: 1 },
      { id: 'item-10', name: 'Mysore Pak', pricePerPlate: 45, quantity: 1 }
    ],
    perPlateTotal: 210,
    totalAmount: 46200,
    createdAt: '2026-08-25T10:00:00Z',
    updatedAt: '2026-09-21T10:00:00Z'
  },
  // 11. Completed - Past Order (Manual)
  {
    id: 'TKS-ORD-111',
    source: 'Manual',
    status: 'Completed',
    customerName: 'Raghavendra Rao',
    customerPhone: '9880223344',
    eventDate: '2026-08-15',
    eventTime: 'Morning',
    eventType: 'Independence Day Community Breakfast',
    guestCount: 400,
    venueAddress: 'K.G. Koppal Ground, Mysuru',
    items: [
      { id: 'item-14', name: 'Idli', pricePerPlate: 40, quantity: 1 },
      { id: 'item-15', name: 'Medu Vada', pricePerPlate: 45, quantity: 1 },
      { id: 'item-19', name: 'Filter Coffee', pricePerPlate: 25, quantity: 1 }
    ],
    perPlateTotal: 110,
    totalAmount: 44000,
    createdAt: '2026-07-28T14:00:00Z',
    updatedAt: '2026-08-16T09:00:00Z'
  },
  // 12. Cancelled Order
  {
    id: 'TKS-ORD-112',
    source: 'Online',
    status: 'Cancelled',
    customerName: 'Harish Belavadi',
    customerPhone: '9844556677',
    eventDate: '2026-10-10',
    eventTime: 'Afternoon',
    eventType: 'Private Reception',
    guestCount: 200,
    venueAddress: 'Lalitha Mahal Palace Lawns, Mysuru',
    notes: 'Cancelled due to date postponement by bride family.',
    items: [
      { id: 'item-1', name: 'Bisi Bele Bath', pricePerPlate: 65, quantity: 1 },
      { id: 'item-10', name: 'Mysore Pak', pricePerPlate: 45, quantity: 1 },
      { id: 'item-19', name: 'Filter Coffee', pricePerPlate: 25, quantity: 1 }
    ],
    perPlateTotal: 135,
    totalAmount: 27000,
    createdAt: '2026-09-12T11:20:00Z',
    updatedAt: '2026-09-28T16:00:00Z'
  }
]

export const INITIAL_CUSTOMERS: Record<string, CustomerRecord> = {
  '9845012345': {
    phone: '9845012345',
    name: 'Kalyan Ramanathan',
    firstContacted: '2026-06-12',
    lastContacted: '2026-10-20',
    enquiryCount: 4,
    confirmedCount: 2,
    notes: 'Prominent family in Saraswathipuram. Prefers authentic Iyengar Puliyogare and pure cow ghee.'
  },
  '9448067890': {
    phone: '9448067890',
    name: 'Anantha Padmanabha',
    firstContacted: '2026-07-04',
    lastContacted: '2026-10-19',
    enquiryCount: 3,
    confirmedCount: 1,
    notes: 'Strict Satvik requirement for all domestic pooja ceremonies. Prompt payments.'
  },
  '9900123456': {
    phone: '9900123456',
    name: 'Sunil Kumar V',
    firstContacted: '2026-09-01',
    lastContacted: '2026-10-19',
    enquiryCount: 2,
    confirmedCount: 1,
    notes: 'Software executive organizing engagement. Very particular about live tiffin counters.'
  },
  '9740112233': {
    phone: '9740112233',
    name: 'Vidya Shankaran',
    firstContacted: '2026-05-18',
    lastContacted: '2026-10-18',
    enquiryCount: 3,
    confirmedCount: 2,
    notes: 'Regular customer for festive catering and anniversary celebrations.'
  },
  '9880223344': {
    phone: '9880223344',
    name: 'Raghavendra Rao',
    firstContacted: '2026-04-10',
    lastContacted: '2026-10-21',
    enquiryCount: 3,
    confirmedCount: 2,
    notes: 'Trustee at local community hall. Direct phone bookings without complex item customization.'
  },
  '9611334455': {
    phone: '9611334455',
    name: 'Deepa Narayan',
    firstContacted: '2026-10-22',
    lastContacted: '2026-10-22',
    enquiryCount: 1,
    confirmedCount: 0,
    notes: 'New enquiry for upcoming wedding breakfast in Gokulam.'
  },
  '9844556677': {
    phone: '9844556677',
    name: 'Harish Belavadi',
    firstContacted: '2026-08-11',
    lastContacted: '2026-10-21',
    enquiryCount: 2,
    confirmedCount: 0,
    notes: 'Had one cancelled event due to bride schedule change; currently inquiring for family feast.'
  }
}
