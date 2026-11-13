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
  description?: string
  bestseller?: boolean
  mustTry?: boolean
  pureGhee?: boolean
  satvik?: boolean
  leafZone?: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  leafContainer?: 'katori' | 'mound' | 'delicacy' | 'tumbler'
  heritageTag?: string
  portionLabel?: string
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
  specificTime?: string
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
  { id: 'cat-all', name: 'All Dishes', displayOrder: 0 },
  { id: 'cat-rice', name: 'Traditional Rice Specials', displayOrder: 1 },
  { id: 'cat-tiffins', name: 'Tiffin & Breakfast', displayOrder: 2 },
  { id: 'cat-sambar', name: 'Sambar, Rasam & Kootu', displayOrder: 3 },
  { id: 'cat-sweets', name: 'Traditional Sweets & Payasam', displayOrder: 4 },
  { id: 'cat-palya', name: 'Palya & Accompaniments', displayOrder: 5 },
  { id: 'cat-beverages', name: 'Beverages & Buttermilk', displayOrder: 6 }
]

export const INITIAL_ITEMS: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Mysuru Puliyogare',
    pricePerPlate: 65,
    category: 'Traditional Rice Specials',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAh39QH-GHD_ZTEnvFLBg5-6Rgzpjuzk2JIXJokqAt6UAqcy4YNc5Lojha451rHvqhtw9pN6qSfqH8bki1QDJFJjarlV_-z1gbmJt4DvBgsP85PnKtnsFoe5XksvC75ai2Ae2CpTPd_3WTU7ZjYalzqUqFLbucDas3W3flTlrNUXRlhQfz8-HH194PPOHMGMxXtjkNxeKbct7jvUq57wJjGyz9LEQQSty2yOUEkMn4',
    gradient: 'from-amber-100 to-orange-200',
    emoji: '🍚',
    available: true,
    description: 'Sacred temple-style spiced tamarind rice simmered with roasted peanuts, curry leaves, and sundried chillies.',
    bestseller: true,
    pureGhee: true,
    satvik: true,
    heritageTag: 'Melkote Recipe',
    portionLabel: 'Portion / Plate',
    leafZone: 'center',
    leafContainer: 'mound'
  },
  {
    id: 'item-2',
    name: 'Bisi Bele Bath',
    pricePerPlate: 85,
    category: 'Traditional Rice Specials',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAR5UzjAfQdWoZ2-gp9XNsyipzp2uY7T_ubMjW8u_Mli9JLjO9piRBapqU20j16-hy0Fq2OgQXEE-8auNGul_f8t0uHDgLjgK8raeJBqNrlScGpshWX3ri-e_V61e826sOh8eixYvPrQJxwcXT4ODHclAt2DYgz_0V9u5g0rut89gd9HmqeX9Gw3FeHAkWFHDv5XFvT-aCH-SjpsmUdhIDyCs8WOlo57TQcgh4tJM',
    gradient: 'from-amber-100 to-orange-200',
    emoji: '🍲',
    available: true,
    description: 'Slow-cooked rice, lentils, and assorted heritage country vegetables bathed in stone-ground spice blend.',
    bestseller: true,
    pureGhee: true,
    satvik: true,
    heritageTag: 'Desi Ghee + Boondi',
    portionLabel: 'Portion / Plate',
    leafZone: 'center',
    leafContainer: 'mound'
  },
  {
    id: 'item-3',
    name: 'Classic Mysuru Pak',
    pricePerPlate: 50,
    category: 'Traditional Sweets & Payasam',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwwOc9GrOm-sIXhnEzEPQ02VX9DNHZ1Cl9jWQfoDYIFgNEe5dj79MpuTScTXuMG4FLJBi-v5FshPbN_0vLfWVeAnRFMXEdehXcZCInvg5ewmB_GYPxwKSGRu2UFqX4fB8Ck4D2y7rcf-NWvAdzlaMr0Tqu_N9MX81_upZZOmY1bWIdsgWg-njRQFS-_LFcEahPsycRZuTpcZy9_DkOxtbcqlldDSrAc4rP4q_AJSs',
    gradient: 'from-amber-200 to-yellow-300',
    emoji: '🧈',
    available: true,
    description: 'The legendary melt-in-mouth royal sweet perfected with gram flour and slow-churned aromatic cow ghee.',
    bestseller: true,
    mustTry: true,
    pureGhee: true,
    satvik: true,
    heritageTag: 'Nandini Pure Ghee',
    portionLabel: 'Per Portion',
    leafZone: 'bottom-center',
    leafContainer: 'delicacy'
  },
  {
    id: 'item-4',
    name: 'Melkote Gojju Set',
    pricePerPlate: 90,
    category: 'Palya & Accompaniments',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzPZ3tlLxej-P1m1LHjUe3T1DDFF_5BtHd3n6mc0TRzCuGNJ9Bp72KD_937nhqKVZFr_JdAEEbT2yvcRzX6rvznFeyHuaYuALcgty8IdHVov_lg4VAZno4-iCadxatjn1XWVgrBCy81kLKpBYuJ9BKY-PWtfnG4VSMyQ21sYOaJjY2FTclJ3jNJpMse7-DqoqAZ3GKAf6xyw9Hd-8bucHTS1H2eEIiwGR3j_ATJDA',
    gradient: 'from-amber-100 to-orange-100',
    emoji: '🍛',
    available: true,
    description: 'Signature temple delicacy served alongside slow-reduced spicy and tangy ginger-fenugreek essence.',
    bestseller: false,
    pureGhee: true,
    satvik: true,
    heritageTag: 'Temple Recipe',
    portionLabel: 'Per Plate',
    leafZone: 'top-left',
    leafContainer: 'delicacy'
  },
  {
    id: 'item-5',
    name: 'Akki Rotti & Yennegai',
    pricePerPlate: 95,
    category: 'Tiffin & Breakfast',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOgsyQGzbNFJ6ZKSUnWpnIWy-fDArzz0RYxiIhM6mdn4RNlbqTPgg2KGTJnI7SAE9KHENbAXAND4IFAeTLGOUKD_4MfBJNbZiJJH73Yzg_CQVs0L_fu8GPy3jckZGxKnvolR07ZP8rDjYB8pg8MaxPFHfJdImWY_ZfG1G-89s1SB4nJn9cKVtV4PQwBDfdgcu08h8nWHuoXh1vMxRDQ9KNvpPWdUwxbVYPZLReaKw',
    gradient: 'from-stone-100 to-amber-100',
    emoji: '🫓',
    available: true,
    description: 'Hand-flattened rice rotis studded with dill leaves and cumin, accompanied by fiery stuffed brinjal gravy.',
    bestseller: true,
    pureGhee: true,
    satvik: true,
    heritageTag: 'Live Tawa Counter',
    portionLabel: 'Per Plate',
    leafZone: 'bottom-left',
    leafContainer: 'delicacy'
  },
  {
    id: 'item-6',
    name: 'Ven Pongal Ghee Roast',
    pricePerPlate: 75,
    category: 'Tiffin & Breakfast',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD3Ne-oNU43RTBGa_3VZLfPr1EDWksZJb7-cTVR85kwiFFSucoJB1OTFpIj9f3Gooub7-TEpMRmd3p5cFt1NRkOKyafVCpetSrk6lR8G7vKssHnkNREfReKAKycjrm_XcaP0LnLzJJ1dNInqyHhyzJYvGJmfVgivYgEv_0QFtGcxogzu6sJx_fbAFxiFrIvNdl7v-iONBIEtjo3B7zBW5JWjMI2dxRaPgSwMYYYi0',
    gradient: 'from-amber-50 to-yellow-100',
    emoji: '🥘',
    available: true,
    description: 'Velvety rice and moong dal tempered with whole roasted cashews, black pepper, and fresh grated ginger.',
    bestseller: true,
    pureGhee: true,
    satvik: true,
    heritageTag: 'Pure Desi Ghee',
    portionLabel: 'Per Plate',
    leafZone: 'center',
    leafContainer: 'mound'
  },
  {
    id: 'item-7',
    name: 'Mysuru Saaru (Rasam)',
    pricePerPlate: 40,
    category: 'Sambar, Rasam & Kootu',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkIPngoIPSdAfa64ro1Z4y0o-JobJdRGOdVmo8BwTcuD0_s4vijkZeekUgTaYXRWujYKe3ACzKGKyxbJmFtQiR8qcfnr0b70glKcnrcYViz2r3gtC1BBNiuNmIOXyApc3iLdbJ2yc1blegyazzJKHP1F0wJ-6bdJ1AOc-kSHcnW8xmARSFvdCS8qr2tBZVohOGndgdiYJR8QFN59cO2x5csTJAgQR4lBPJxTG_s74',
    gradient: 'from-red-50 to-orange-100',
    emoji: '🍵',
    available: true,
    description: 'The soul of Mysuru banquets. Slow-simmered in tin vessels with fresh country tomatoes, coriander, and asafoetida.',
    bestseller: true,
    pureGhee: true,
    satvik: true,
    heritageTag: 'Eeya Chombu Cooked',
    portionLabel: 'Per Serving',
    leafZone: 'top-right',
    leafContainer: 'katori'
  },
  {
    id: 'item-8',
    name: 'Obbattu (Bele Holige)',
    pricePerPlate: 55,
    category: 'Traditional Sweets & Payasam',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxeORBpxjELSWhCD2BSoG_r-KXonXhVAwPKrRTUWd8aYBIcwKYLD--dosT7M1SLPEUFPFZpllpUpvaeUmmwD7pPvIlX1pAqwia3gkcPzrmqT4O5YB6jGzDFtD5b37j0Dj07HAcbwqO0gixWiAIEWJ9Mjkfua_ymvnyJ5MsgmdcTGm9yIt3adEZtPLc9G0xnyq4v9UAUbkQj0v_4GXifbje_JDtZOuyHzsP7_U42lQ',
    gradient: 'from-amber-100 to-orange-100',
    emoji: '🥞',
    available: true,
    description: 'Festive sweet flatbread stuffed with golden jaggery and lentils, served warm with molten ghee dollop.',
    bestseller: true,
    pureGhee: true,
    satvik: true,
    heritageTag: 'Served With Hot Milk',
    portionLabel: 'Per Piece',
    leafZone: 'bottom-left',
    leafContainer: 'delicacy'
  },
  {
    id: 'item-9',
    name: 'Semiya Payasam',
    pricePerPlate: 50,
    category: 'Traditional Sweets & Payasam',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeUWuToHzz7jKUt85IeNM4XL5qo0Uij_iQWq5JWAsh1iMXXNDBDNyX5PzOZqxSBPzUdcl0nXV6sTI1dMDnRly4pA8pnTeAEX5vFJi7kayDo819fCHbNIuhV6RKZH-Q9gyln7zCO6g1VTU2FpNsh3hSJXQPhQ6iF4Y2MvjNy9Y_o8KFEDZZaKkqMnvZk4rj7x1KskV575dzSlNFc_6kF1MyHiD1LeEePNpeKveufEk',
    gradient: 'from-rose-50 to-amber-100',
    emoji: '🍧',
    available: true,
    description: 'Delicate roasted vermicelli slow-simmered in rich cow milk, Kashmiri saffron strands, and golden raisins.',
    bestseller: false,
    pureGhee: true,
    satvik: true,
    heritageTag: 'Saffron Infused',
    portionLabel: 'Per Bowl',
    leafZone: 'bottom-center',
    leafContainer: 'katori'
  },
  {
    id: 'item-10',
    name: 'Urad Dal Medu Vada',
    pricePerPlate: 45,
    category: 'Tiffin & Breakfast',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCB6uKUsHquxqelDdUPwEKwDft6oPALnT4OKw77EHzQ8C9sYKLYdBJ9CxCXZYMjKQGtLy8dvCaPyeRRSqSYVdDWfwNAXMlJ06Eq9EHZ55fin4Yq63Ma54My-zspBjIsUmupB7cNilZm8aloEW1NePXLqroPlZ0PHqaWIgIfAp2_CVJPHxkKezdQf6_o6XM43vJWBIeTrQryIQ4ZbB2bXgGirKzs-K21cKvSxW4izf4',
    gradient: 'from-amber-100 to-amber-300',
    emoji: '🍩',
    available: true,
    description: 'Ultra-crispy outside, fluffy inside lentil doughnuts accented with crushed peppercorns and fresh curry leaf.',
    bestseller: true,
    pureGhee: false,
    satvik: true,
    heritageTag: 'Crispy Gold',
    portionLabel: 'Per Pair',
    leafZone: 'bottom-left',
    leafContainer: 'delicacy'
  },
  {
    id: 'item-11',
    name: 'Spiced Temple Majjige',
    pricePerPlate: 25,
    category: 'Beverages & Buttermilk',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUSScvjD_f2Nm13RcR31PUaRwLSYkCWUbCRYQoxEedC2qBNGRDy40kDqkglyR2jijI1KMD9KZGUmbZnbajxRB_Jn-LymTAaoJQHN5HmcMcNXqrnJCUR5Hf8IQwDXWqhNX6inDMBNVzk0c23_nRpCmxqx-oBy0kpniBTKLTeBN9ys3iJAZ66Z_Cp9t7-MvTlUM40dvbdYwBX5TrqNAZiQlyZujBDlnacB4aA_nEsBc',
    gradient: 'from-emerald-50 to-teal-100',
    emoji: '🥛',
    available: true,
    description: 'Cooling churned curd beverage seasoned with crushed ginger, fragrant curry leaves, hing, and sea salt.',
    bestseller: false,
    pureGhee: false,
    satvik: true,
    heritageTag: 'Chilled Chaas',
    portionLabel: 'Per Glass',
    leafZone: 'bottom-right',
    leafContainer: 'tumbler'
  },
  {
    id: 'item-12',
    name: 'Mysuru Filter Coffee',
    pricePerPlate: 35,
    category: 'Beverages & Buttermilk',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw4nR8hwT8DqkTrqslMnuSeptTNOZ4AH_ToQCDlAh9IXY-a3M7OhfHAo1444cqJdi-jN3vvOuhiPYBRv18KkfTe5m9LRIDr-7yPAW55vrHz4rWTcyXTshflM4y8uUEtffNYsh4WweeJAjsmjG5pyU8J6L3OCY_Y5EE9kUrXYmv1ndm3DFx3WeNo5FihdqsqEc8acQo4ulUogHjOePJosO5apydsaP8OQNfMHG6Fz0',
    gradient: 'from-amber-800/20 to-stone-800/30',
    emoji: '☕',
    available: true,
    description: 'Freshly brewed plantation peaberry decoction with frothy boiled dairy milk served in traditional brass davarah.',
    bestseller: true,
    mustTry: true,
    pureGhee: false,
    satvik: true,
    heritageTag: 'Live Filter Coffee Stall',
    portionLabel: 'Per Cup',
    leafZone: 'bottom-right',
    leafContainer: 'tumbler'
  },
  // Legacy / Additional items preserved for existing orders
  {
    id: 'item-13',
    name: 'Lemon Rice',
    pricePerPlate: 50,
    category: 'Traditional Rice Specials',
    image: '/dishes/lemon-rice.webp',
    gradient: 'from-yellow-50 to-lime-100',
    emoji: '🍋',
    available: true,
    description: 'Fragrant turmeric-infused rice with fresh lemon juice, crackled mustard seeds, and roasted urad dal.',
    bestseller: false,
    pureGhee: false,
    satvik: true,
    leafZone: 'center',
    leafContainer: 'mound'
  },
  {
    id: 'item-14',
    name: 'Idli Set',
    pricePerPlate: 40,
    category: 'Tiffin & Breakfast',
    image: '/dishes/idli.webp',
    gradient: 'from-slate-100 to-stone-200',
    emoji: '⚪',
    available: true,
    description: 'Steaming soft fermented rice & urad dal cakes with traditional coconut chutney and sambar.',
    bestseller: true,
    pureGhee: false,
    satvik: true,
    leafZone: 'bottom-left',
    leafContainer: 'delicacy'
  },
  {
    id: 'item-15',
    name: 'Curd Rice',
    pricePerPlate: 45,
    category: 'Traditional Rice Specials',
    image: '/dishes/curd-rice.webp',
    gradient: 'from-slate-50 to-emerald-50',
    emoji: '🥣',
    available: true,
    description: 'Velvety homemade curd rice garnished with ruby pomegranate pearls, ginger, and mild tempering.',
    bestseller: true,
    pureGhee: false,
    satvik: true,
    leafZone: 'center',
    leafContainer: 'mound'
  },
  {
    id: 'item-16',
    name: 'Kesari Bath',
    pricePerPlate: 40,
    category: 'Traditional Sweets & Payasam',
    image: '/dishes/kesari-bath.webp',
    gradient: 'from-orange-200 to-amber-300',
    emoji: '🍯',
    available: true,
    description: 'Aromatic semolina halwa infused with royal Kashmiri saffron, green cardamom, and pure cow ghee.',
    bestseller: true,
    pureGhee: true,
    satvik: true,
    leafZone: 'bottom-center',
    leafContainer: 'mound'
  }
]

export const INITIAL_ORDERS: Order[] = []

export const INITIAL_CUSTOMERS: Record<string, CustomerRecord> = {}
