import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import imageCompression from 'browser-image-compression'

import { 
  getCatalogue, 
  saveCategory, 
  reorderCategories, 
  deleteCategory, 
  saveItem, 
  toggleItemAvailability, 
  deleteItem,
  DEFAULT_DISH_IMAGE,
  getDefaultEmoji
} from '@/api'
import type { Category, MenuItem } from '@/data/mockData'

const DISH_TAG_MAP: Record<string, string> = {
  'item-1': 'Temple Signature',
  'item-2': 'Pure Ghee Special',
  'item-3': 'Heritage Sweet',
  'item-4': 'Temple Heritage',
  'item-5': 'Mysuru Classic',
  'item-6': 'Temple Prasada Style',
  'item-7': 'Cooling Finish',
  'item-8': 'Chikmagalur Blend',
  'item-9': 'Traditional Sweet'
}

export const AdminMenuPage: React.FC = () => {
  const navigate = useNavigate()

  // Data State
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Active Category Selection
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')

  // Search & Availability Filters
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all')

  // Designer Showcase View Mode ('default' | 'empty')
  const [previewState, setPreviewState] = useState<'default' | 'empty'>('default')

  // Drawer (Add / Edit Dish) State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [drawerName, setDrawerName] = useState<string>('')
  const [drawerPrice, setDrawerPrice] = useState<string>('65')
  const [drawerCategory, setDrawerCategory] = useState<string>('')
  const [drawerImage, setDrawerImage] = useState<string>(DEFAULT_DISH_IMAGE)
  const [drawerDescription, setDrawerDescription] = useState<string>('')
  const [drawerAvailable, setDrawerAvailable] = useState<boolean>(true)
  const [isCompressingImage, setIsCompressingImage] = useState<boolean>(false)
  const [isSavingItem, setIsSavingItem] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Modals State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryNameInput, setCategoryNameInput] = useState<string>('')

  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  // Active Kebab Menu Dropdown ID
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  // Close kebab dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown-container]')) {
        setActiveDropdownId(null)
      }
    }
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [])

  // Load Menu Catalogue
  const loadMenuData = async () => {
    setIsLoading(true)
    try {
      const res = await getCatalogue()
      setCategories(res.categories)
      setItems(res.items)
      if (res.categories.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(res.categories[0].id)
      }
    } catch (err) {
      console.error('Failed to load menu catalogue:', err)
      toast.error('Failed to load menu catalogue')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMenuData()
  }, [])

  // Active Category Object
  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId) || categories[0] || null
  }, [categories, selectedCategoryId])

  // Count items per category
  const categoryItemCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    categories.forEach((cat) => {
      counts[cat.name] = items.filter((i) => i.category === cat.name).length
    })
    return counts
  }, [categories, items])

  // Items for active category
  const activeCategoryItems = useMemo(() => {
    if (!activeCategory) return []
    return items.filter((item) => item.category === activeCategory.name)
  }, [items, activeCategory])

  // Filtered Items (by Search & Availability Chip)
  const displayedItems = useMemo(() => {
    if (previewState === 'empty') return []
    let list = activeCategoryItems

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((i) => i.name.toLowerCase().includes(q))
    }

    // Availability Filter
    if (availabilityFilter === 'available') {
      list = list.filter((i) => i.available)
    } else if (availabilityFilter === 'unavailable') {
      list = list.filter((i) => !i.available)
    }

    return list
  }, [activeCategoryItems, searchQuery, availabilityFilter, previewState])

  // Available & Unavailable counts for current category
  const currentCategoryAvailableCount = useMemo(() => {
    return activeCategoryItems.filter((i) => i.available).length
  }, [activeCategoryItems])

  const currentCategoryUnavailableCount = useMemo(() => {
    return activeCategoryItems.filter((i) => !i.available).length
  }, [activeCategoryItems])

  // ==========================================================
  // DISH ACTIONS
  // ==========================================================

  // Open Add Item Drawer
  const handleOpenAddItem = () => {
    setEditingItem(null)
    setDrawerName('')
    setDrawerPrice('65')
    setDrawerCategory(activeCategory ? activeCategory.name : categories[0]?.name || '')
    setDrawerImage(DEFAULT_DISH_IMAGE)
    setDrawerDescription('')
    setDrawerAvailable(true)
    setIsDrawerOpen(true)
  }

  // Open Edit Item Drawer
  const handleOpenEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setDrawerName(item.name)
    setDrawerPrice(String(item.pricePerPlate))
    setDrawerCategory(item.category)
    setDrawerImage(item.image || DEFAULT_DISH_IMAGE)
    setDrawerDescription(
      item.portionLabel ||
        `Authentic satvik preparation prepared with pure cow ghee and traditional temple spices.`
    )
    setDrawerAvailable(item.available)
    setIsDrawerOpen(true)
    setActiveDropdownId(null)
  }

  // Toggle Dish Availability (Optimistic update with real API sync)
  const handleToggleItemAvailability = async (item: MenuItem, newStatus: boolean) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, available: newStatus } : i))
    )

    try {
      await toggleItemAvailability(item.id, newStatus)
      if (newStatus) {
        toast.success(`${item.name} is now Available in customer catalogue`)
      } else {
        toast.info(`${item.name} marked as Unavailable / Kitchen Paused`)
      }
    } catch (err) {
      console.error('Failed to toggle availability:', err)
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, available: !newStatus } : i))
      )
      toast.error('Failed to update availability')
    }
  }

  // Image Upload with Browser Compression
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsCompressingImage(true)
    const toastId = toast.loading('Compressing dish photo in browser...')
    try {
      const options = {
        maxSizeMB: 0.35,
        maxWidthOrHeight: 700,
        useWebWorker: true
      }
      const compressed = await imageCompression(file, options)
      const dataUrl = await imageCompression.getDataUrlFromFile(compressed)
      setDrawerImage(dataUrl)
      toast.success('Food photo compressed and attached', { id: toastId })
    } catch (err) {
      console.error('Image compression error:', err)
      toast.error('Could not process photo. Please choose another image.', { id: toastId })
    } finally {
      setIsCompressingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Save Dish (Add or Edit)
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanName = drawerName.trim()
    const numericPrice = parseFloat(drawerPrice)

    if (!cleanName) {
      toast.error('Please enter a dish name')
      return
    }
    if (isNaN(numericPrice) || numericPrice < 0) {
      toast.error('Please enter a valid price per plate')
      return
    }
    if (!drawerCategory) {
      toast.error('Please select a menu category')
      return
    }

    setIsSavingItem(true)
    try {
      const updated = await saveItem({
        id: editingItem ? editingItem.id : undefined,
        name: cleanName,
        pricePerPlate: numericPrice,
        category: drawerCategory,
        image: drawerImage || DEFAULT_DISH_IMAGE,
        emoji: getDefaultEmoji(drawerCategory),
        available: drawerAvailable
      })

      setItems(updated)

      toast.success(editingItem ? 'Dish updated successfully' : 'New dish added to menu')
      setIsDrawerOpen(false)
    } catch (err) {
      console.error('Error saving dish:', err)
      toast.error('Failed to save dish')
    } finally {
      setIsSavingItem(false)
    }
  }

  // Delete Dish Confirmation
  const handleConfirmDeleteItem = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id
    const name = itemToDelete.name
    setItemToDelete(null)

    try {
      await deleteItem(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success(`'${name}' deleted from catalogue`)
    } catch (err) {
      console.error('Failed to delete item:', err)
      toast.error('Could not delete dish')
    }
  }

  // ==========================================================
  // CATEGORY ACTIONS
  // ==========================================================

  // Open Category Create/Rename Modal
  const handleOpenAddCategory = () => {
    setEditingCategory(null)
    setCategoryNameInput('')
    setIsCategoryModalOpen(true)
  }

  const handleOpenRenameCategory = (cat: Category) => {
    setEditingCategory(cat)
    setCategoryNameInput(cat.name)
    setIsCategoryModalOpen(true)
  }

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = categoryNameInput.trim()
    if (!clean) {
      toast.error('Please enter a category name')
      return
    }

    try {
      const oldName = editingCategory?.name
      const updated = await saveCategory({
        id: editingCategory ? editingCategory.id : undefined,
        name: clean
      })
      setCategories(updated)

      if (oldName && oldName !== clean) {
        setItems((prev) =>
          prev.map((i) => (i.category === oldName ? { ...i, category: clean } : i))
        )
      }

      toast.success(editingCategory ? 'Category renamed' : 'Category created')
      setIsCategoryModalOpen(false)
    } catch (err) {
      console.error('Failed to save category:', err)
      toast.error('Failed to save category')
    }
  }

  // Delete Category Confirmation
  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return
    const id = categoryToDelete.id
    const name = categoryToDelete.name
    setCategoryToDelete(null)

    try {
      const res = await deleteCategory(id, { deleteItems: false })
      setCategories(res.categories)
      setItems(res.items)
      if (selectedCategoryId === id && res.categories.length > 0) {
        setSelectedCategoryId(res.categories[0].id)
      }
      toast.success(`Category '${name}' removed`)
    } catch (err) {
      console.error('Failed to delete category:', err)
      toast.error('Failed to delete category')
    }
  }

  // Move Category Up / Down
  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= categories.length) return

    const newOrder = [...categories]
    const [moved] = newOrder.splice(index, 1)
    newOrder.splice(targetIndex, 0, moved)

    setCategories(newOrder)
    try {
      const saved = await reorderCategories(newOrder.map((c) => c.id))
      setCategories(saved)
      toast.success('Category reordered')
    } catch {
      loadMenuData()
    }
  }

  // Sign out
  const handleSignOut = () => {
    localStorage.removeItem('tks_admin_auth')
    toast.success('Signed out successfully')
    navigate('/admin/login')
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed">
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(251, 219, 214, 0.3);
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(144, 111, 106, 0.4);
          border-radius: 9999px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(136, 0, 0, 0.5);
        }
        .kannada-sub {
          font-feature-settings: "kern" 1;
        }
      `}</style>

      {/* ============================================================== */}
      {/* DESIGNER SHOWCASE STATE CONTROL BAR                            */}
      {/* ============================================================== */}
      <div className="bg-surface-container-high border-b border-outline-variant/60 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-on-surface-variant z-40">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span className="text-on-surface font-bold text-xs">Catering Admin Preview States:</span>
          <span className="text-outline hidden sm:inline">Toggle views to inspect layout states</span>
        </div>
        <div className="flex items-center gap-2 mt-1 sm:mt-0 flex-wrap">
          <button
            id="btn-view-default"
            type="button"
            onClick={() => setPreviewState('default')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer ${
              previewState === 'default'
                ? 'bg-primary-container text-on-primary font-bold'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-outline-variant'
            }`}
          >
            Default View ({activeCategoryItems.length} Items)
          </button>

          <button
            id="btn-view-drawer"
            type="button"
            onClick={handleOpenAddItem}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-all border border-outline-variant cursor-pointer"
          >
            Add/Edit Item Drawer
          </button>

          <button
            id="btn-view-delete"
            type="button"
            onClick={() => {
              if (displayedItems[0]) {
                setItemToDelete(displayedItems[0])
              } else if (items[0]) {
                setItemToDelete(items[0])
              } else {
                toast.info('No dishes available to delete in preview')
              }
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-all border border-outline-variant cursor-pointer"
          >
            Delete Modal
          </button>

          <button
            id="btn-view-empty"
            type="button"
            onClick={() => setPreviewState('empty')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border border-outline-variant cursor-pointer ${
              previewState === 'empty'
                ? 'bg-primary-container text-on-primary font-bold'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
            }`}
          >
            Empty State
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* ============================================================== */}
        {/* ADMIN SHELL: LEFT SIDEBAR                                      */}
        {/* ============================================================== */}
        <aside className="w-64 lg:w-72 bg-surface-container-low border-r border-outline-variant/50 flex flex-col justify-between shrink-0 select-none shadow-[2px_0_12px_rgba(40,23,20,0.03)] z-30 hidden md:flex">
          
          {/* Top Branding Section */}
          <div className="p-5 border-b border-outline-variant/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-surface-container-lowest p-1.5 shadow-sm border border-outline-variant/40 flex items-center justify-center shrink-0">
                <img
                  alt="TKS Iyengar Catering Emblem"
                  className="w-full h-full object-contain"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZrCYW6rlcBBo_dnQDXD91wH4PMqakS0jb1jKESNv0WUd1R45iYSYanVZiGzS-xfivczivxcdsTZJNOCz8oTzSii295NQQ4rZ9wcC17zlHuStkFB-Lvpmwrcva3wyomtgLl9j79af4re4SXQQOmD6cgMzXo-NV8vn854abSf2S5fna0uv1_EoemhhCWmo3F4HHQqd42p0xVWvry8nXZDDEAt1owU0-tRt_8Oj2wx46rPkOG3m1lj1F"
                />
              </div>
              <div className="min-w-0">
                <h1 className="font-serif text-lg text-primary font-bold leading-tight truncate">
                  TKS Iyengar&apos;s
                </h1>
                <p className="text-xs text-on-surface-variant flex items-center gap-1 font-medium truncate">
                  <span className="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
                  <span>Admin Desk · Mysuru</span>
                </p>
              </div>
            </div>

            {/* Sacred Tradition Ribbon */}
            <div className="mt-4 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant text-xs flex items-center gap-1.5 border border-outline-variant/50">
              <span className="material-symbols-outlined text-secondary text-base">
                temple_hindu
              </span>
              <span className="font-semibold tracking-wide">Pure Vegetarian Tradition</span>
            </div>
          </div>

          {/* Main Navigation Menu */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scroll">
            <Link
              to="/admin"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors group text-sm font-semibold"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
                  dashboard
                </span>
                <span>Dashboard</span>
              </div>
            </Link>

            <Link
              to="/admin/orders"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors group text-sm font-semibold"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
                  receipt_long
                </span>
                <span>All Orders</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-on-secondary font-bold">
                14
              </span>
            </Link>

            {/* ACTIVE ITEM: Catering Menu */}
            <Link
              to="/admin/menu"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-primary-container text-on-primary font-bold shadow-sm text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">
                  restaurant_menu
                </span>
                <span>Catering Menu</span>
              </div>
              <span className="w-1.5 h-4 rounded-full bg-secondary-fixed"></span>
            </Link>

            <Link
              to="/admin/customers"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors group text-sm font-semibold"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
                  groups
                </span>
                <span>Customers</span>
              </div>
            </Link>

            <div className="pt-4 pb-2 px-3 text-[11px] font-bold text-outline uppercase tracking-wider">
              BANQUET CONFIG
            </div>

            <Link
              to="/admin"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors group text-sm font-semibold"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
                  auto_awesome
                </span>
                <span>Feast Packages</span>
              </div>
            </Link>

            <Link
              to="/admin"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors group text-sm font-semibold"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
                  kitchen
                </span>
                <span>Kitchen Live Sync</span>
              </div>
            </Link>
          </nav>

          {/* Bottom Profile & Sign Out */}
          <div className="p-3 border-t border-outline-variant/40 bg-surface-container-low/70">
            <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-outline-variant/60">
                  KS
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-on-surface truncate">K. Seshadri</p>
                  <p className="text-[11px] text-on-surface-variant flex items-center gap-1 truncate font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 shrink-0"></span>
                    <span>Mysuru Main Kitchen</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                aria-label="Sign Out"
                className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-surface-container-high transition-colors cursor-pointer"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* RIGHT WORKSPACE: TOP BAR + DUAL-PANEL CONTENT                   */}
        {/* ============================================================== */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-bright min-w-0">
          
          {/* TOP BAR */}
          <header className="h-20 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/40 px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 z-20">
            {/* Left Greeting & Thithi */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-serif text-xl md:text-2xl text-on-surface font-bold tracking-tight">
                    Namaskara 🙏
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-tertiary-fixed text-on-tertiary-fixed font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse"></span>
                    <span>Kitchen Live &amp; Menu Synced</span>
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant flex items-center gap-2 mt-0.5 font-medium truncate">
                  <span className="material-symbols-outlined text-sm text-secondary">
                    calendar_month
                  </span>
                  <span>Tuesday, 18 Nov 2025 · Karthika Somavara · Mysuru Central Matha Unit</span>
                </p>
              </div>
            </div>

            {/* Right Action Cluster */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={handleOpenAddCategory}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-secondary">
                  create_new_folder
                </span>
                <span>+ Add Category</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddItem}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary text-xs font-bold shadow-[0_8px_20px_-4px_rgba(179,10,5,0.35)] hover:brightness-105 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>+ Add Food Item</span>
              </button>
            </div>
          </header>

          {/* TWO-COLUMN WORKSPACE CANVAS */}
          <main className="flex-1 flex flex-col md:flex-row overflow-hidden min-w-0">
            
            {/* 1. LEFT PANEL: Categories Management (~320px) */}
            <section className="w-full md:w-80 border-b md:border-b-0 md:border-r border-outline-variant/40 bg-surface-container-lowest flex flex-col shrink-0 custom-scroll overflow-y-auto max-h-56 md:max-h-full">
              <div className="p-4 md:p-5 border-b border-outline-variant/40 bg-surface-container-low/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-on-surface">
                      Menu Categories
                    </h3>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Organize items for Muhurtham trays
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-secondary-fixed text-on-secondary-fixed font-bold border border-secondary/20">
                    {categories.length} Categories
                  </span>
                </div>

                {/* Explanatory note */}
                <div className="mt-3 p-2.5 rounded-lg bg-surface-container text-xs text-on-surface-variant flex items-start gap-2 border border-outline-variant/40 leading-relaxed">
                  <span className="material-symbols-outlined text-secondary text-sm shrink-0 mt-0.5">
                    info
                  </span>
                  <span>
                    Initial categories are a starting point — add, rename, or reorder anytime for banquet printing.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddCategory}
                  className="w-full mt-3 py-2 px-3 rounded-lg border border-dashed border-outline hover:border-primary bg-surface-container-low hover:bg-surface-container text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>+ Add Category</span>
                </button>
              </div>

              {/* Reorderable Category List */}
              <div className="p-3 space-y-1.5 flex-1 overflow-y-auto custom-scroll">
                {categories.map((cat, idx) => {
                  const isActive = activeCategory?.id === cat.id
                  const count = categoryItemCounts[cat.name] || 0

                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id)
                        setPreviewState('default')
                      }}
                      className={`group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-surface-container text-on-surface border-2 border-primary shadow-xs'
                          : 'hover:bg-surface-container-low text-on-surface border border-outline-variant/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Up/Down Reorder Arrows */}
                        <div className="flex flex-col text-outline/60 group-hover:text-outline shrink-0">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMoveCategory(idx, 'up')
                              }}
                              className="hover:text-primary p-0.5 cursor-pointer leading-none"
                              title="Move category up"
                            >
                              <span className="material-symbols-outlined text-[13px]">expand_less</span>
                            </button>
                          )}
                          {idx < categories.length - 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMoveCategory(idx, 'down')
                              }}
                              className="hover:text-primary p-0.5 cursor-pointer leading-none"
                              title="Move category down"
                            >
                              <span className="material-symbols-outlined text-[13px]">expand_more</span>
                            </button>
                          )}
                        </div>

                        <div className="truncate">
                          <p
                            className={`text-xs font-bold truncate ${
                              isActive ? 'text-primary' : 'text-on-surface'
                            }`}
                          >
                            {idx + 1}. {cat.name}
                          </p>
                          <p className="text-[10px] text-on-surface-variant font-medium">
                            {isActive ? 'Selected Active Menu' : `${count} delicacies`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isActive
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {count} items
                        </span>

                        <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity ml-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenRenameCategory(cat)
                            }}
                            className="p-1 hover:text-primary transition-colors cursor-pointer"
                            title="Rename Category"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          {categories.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setCategoryToDelete(cat)
                              }}
                              className="p-1 hover:text-error transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bottom Summary Indicator */}
              <div className="p-4 border-t border-outline-variant/40 bg-surface-container-low/30 text-xs text-on-surface-variant flex items-center justify-between font-medium">
                <span>Total Menu Offerings:</span>
                <span className="font-bold text-on-surface text-xs">
                  {items.length} Preparations
                </span>
              </div>
            </section>

            {/* 2. MAIN WORKSPACE AREA: FOOD ITEM CARDS */}
            <section className="flex-1 flex flex-col overflow-y-auto custom-scroll bg-surface-bright p-4 md:p-6 lg:p-8 min-w-0">
              
              {/* Category Header & Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-outline-variant/40">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-fixed text-on-primary-fixed">
                      Active Category
                    </span>
                    <span className="text-xs text-outline font-semibold">
                      Order Rank #{categories.findIndex((c) => c.id === activeCategory?.id) + 1}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl md:text-3xl text-primary mt-1 font-bold">
                    {activeCategory ? activeCategory.name : 'All Preparations'}
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Showing {displayedItems.length} authentic dishes curated for Banana Leaf Muhurtham Feasts
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={handleOpenAddItem}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all shadow-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>+ Add Item to Category</span>
                  </button>
                </div>
              </div>

              {/* Filter, Search and Availability Strip */}
              <div className="py-4 flex flex-wrap items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative w-full max-w-md">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes in this category..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-background placeholder:text-outline text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>

                {/* Quick Filter Chips */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAvailabilityFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      availabilityFilter === 'all'
                        ? 'bg-secondary text-on-secondary shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/60'
                    }`}
                  >
                    All ({activeCategoryItems.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvailabilityFilter('available')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      availabilityFilter === 'available'
                        ? 'bg-secondary text-on-secondary shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/60'
                    }`}
                  >
                    Available ({currentCategoryAvailableCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvailabilityFilter('unavailable')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      availabilityFilter === 'unavailable'
                        ? 'bg-secondary text-on-secondary shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/60'
                    }`}
                  >
                    Unavailable ({currentCategoryUnavailableCount})
                  </button>
                </div>
              </div>

              {/* GRID VIEW: Dishes */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-3">
                  <span className="material-symbols-outlined animate-spin text-3xl text-primary">
                    progress_activity
                  </span>
                  <p className="text-sm font-medium">Loading sacred menu catalogue...</p>
                </div>
              ) : displayedItems.length > 0 ? (
                <div
                  id="grid-container"
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2 pb-12"
                >
                  {displayedItems.map((item) => {
                    const dishTag = DISH_TAG_MAP[item.id] || 'Temple Heritage'

                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-5 shadow-[0_4px_20px_-2px_rgba(107,8,0,0.06)] hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between group ${
                          item.available
                            ? 'bg-surface-container-lowest border-outline-variant/60'
                            : 'bg-surface-container-lowest/70 border-outline-variant/60 opacity-80'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            {/* Veg Marker + Titles */}
                            <div className="flex items-start gap-2.5">
                              <div
                                className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 mt-1 ${
                                  item.available ? 'border-[#00753A]' : 'border-outline'
                                }`}
                                title="100% Pure Vegetarian"
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    item.available ? 'bg-[#00753A]' : 'bg-outline'
                                  }`}
                                ></div>
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-on-surface leading-snug">
                                  {item.name}
                                </h4>
                              </div>
                            </div>

                            {/* Kebab Action Menu */}
                            <div className="relative" data-dropdown-container>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActiveDropdownId(
                                    activeDropdownId === item.id ? null : item.id
                                  )
                                }}
                                className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-lg">more_vert</span>
                              </button>

                              {activeDropdownId === item.id && (
                                <div className="absolute right-0 mt-1 w-36 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-lg py-1 z-20 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditItem(item)}
                                    className="w-full px-3 py-1.5 text-left text-on-surface hover:bg-surface-container flex items-center gap-2 cursor-pointer font-medium"
                                  >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                    <span>Edit dish</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDropdownId(null)
                                      setItemToDelete(item)
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-error hover:bg-error-container flex items-center gap-2 cursor-pointer font-medium"
                                  >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                    <span>Delete dish</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Food Image Frame */}
                          <div className="my-3.5 h-36 rounded-xl overflow-hidden border border-outline-variant/40 bg-surface-container-low relative">
                            <img
                              src={item.image || DEFAULT_DISH_IMAGE}
                              alt={item.name}
                              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                                !item.available ? 'grayscale-[35%]' : ''
                              }`}
                              onError={(e) => {
                                ;(e.currentTarget as HTMLImageElement).src = DEFAULT_DISH_IMAGE
                              }}
                            />

                            {item.available ? (
                              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-lowest/90 text-on-surface border border-outline-variant/60 backdrop-blur-sm">
                                {dishTag}
                              </span>
                            ) : (
                              <div className="absolute inset-0 bg-inverse-surface/35 backdrop-blur-[1px] flex items-center justify-center p-2 text-center">
                                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-error-container text-on-error-container border border-error/20 shadow-xs">
                                  Kitchen Paused · Out of Season
                                </span>
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed font-normal">
                            {item.portionLabel ||
                              `Rich authentic preparation prepared with slow-roasted temple spices, pure ghee, and fresh Kaveri ingredients.`}
                          </p>
                        </div>

                        {/* Card Footer: Price & Availability Toggle */}
                        <div className="pt-4 mt-3 border-t border-outline-variant/40 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] text-outline font-medium">
                              Rate / Muhurtham Leaf
                            </span>
                            <p className="text-lg font-bold text-primary">
                              ₹{item.pricePerPlate}{' '}
                              <span className="text-xs text-on-surface-variant font-normal">
                                / plate
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold ${
                                item.available ? 'text-emerald-800' : 'text-outline'
                              }`}
                            >
                              {item.available ? 'Available' : 'Unavailable'}
                            </span>

                            {/* Accessible Role="Switch" Component matching Playwright test expectation */}
                            <button
                              type="button"
                              role="switch"
                              aria-checked={item.available ? 'true' : 'false'}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleItemAvailability(item, !item.available)
                              }}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                item.available ? 'bg-emerald-800' : 'bg-outline-variant'
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                  item.available ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* EMPTY STATE VIEW */
                <div
                  id="empty-state-container"
                  className="flex-1 py-16 flex flex-col items-center justify-center text-center max-w-md mx-auto"
                >
                  <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-primary-container mb-4 border border-outline-variant/50">
                    <span className="material-symbols-outlined text-4xl">soup_kitchen</span>
                  </div>
                  <h3 className="font-serif text-xl text-on-surface font-bold">
                    No dishes in this category yet
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-2 mb-6 leading-relaxed">
                    Click &apos;+ Add Item&apos; to introduce traditional preparations, set price per muhurtham leaf, and configure live kitchen availability.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddItem}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary-container transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span>+ Add First Food Item</span>
                  </button>
                </div>
              )}

            </section>
          </main>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. ADD / EDIT ITEM SHEET (Interactive Drawer Overlay)           */}
      {/* ============================================================== */}
      {isDrawerOpen && (
        <div
          id="item-drawer"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-hidden flex"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-10">
            <div className="w-screen max-w-xl bg-surface-container-lowest border-l border-outline-variant/60 shadow-2xl flex flex-col justify-between overflow-hidden">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-outline-variant/40 bg-surface-container-low/40 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-secondary font-bold tracking-wider uppercase block">
                    CATERING ITEM CONFIGURATOR
                  </span>
                  <h3 className="font-serif text-xl font-bold text-primary">
                    {editingItem ? 'Edit Food Item' : 'Add Food Item'}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {editingItem ? `${editingItem.name} (#${editingItem.id})` : 'New dish for banquet menus'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>

              {/* Drawer Form Body */}
              <form
                onSubmit={handleSaveDish}
                className="flex-1 overflow-y-auto custom-scroll p-6 space-y-5"
              >
                {/* Dish Title & Kannada Subtitle */}
                <div>
                  <label htmlFor="dish-name-input" className="block text-xs font-bold text-on-surface mb-1">
                    Food Item Name <span className="text-error">*</span>
                  </label>
                  <input
                    id="dish-name-input"
                    type="text"
                    required
                    value={drawerName}
                    onChange={(e) => setDrawerName(e.target.value)}
                    placeholder="e.g. Mysuru Puliyogare"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-background text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <p className="text-[11px] text-outline mt-1">Official dish name printed on wedding quotes.</p>
                </div>

                {/* Price & Category Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dish-price-input" className="block text-xs font-bold text-on-surface mb-1">
                      Price per Plate (₹) <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-primary text-xs">
                        ₹
                      </span>
                      <input
                        id="dish-price-input"
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={drawerPrice}
                        onChange={(e) => setDrawerPrice(e.target.value)}
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-background text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="dish-category-select" className="block text-xs font-bold text-on-surface mb-1">
                      Menu Category <span className="text-error">*</span>
                    </label>
                    <select
                      id="dish-category-select"
                      value={drawerCategory}
                      onChange={(e) => setDrawerCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-background text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                    >
                      {categories.map((cat, i) => (
                        <option key={cat.id} value={cat.name}>
                          {i + 1}. {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pure Veg Guarantee Badge */}
                <div className="p-3 rounded-xl bg-surface-container flex items-center justify-between border border-outline-variant/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-sm border-2 border-[#00753A] flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#00753A]"></div>
                    </div>
                    <span className="text-xs font-bold text-on-surface">
                      100% Pure Iyengar Tradition Marker
                    </span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container-lowest text-emerald-800 font-bold border border-emerald-800/20">
                    Always Enforced
                  </span>
                </div>

                {/* Image Upload Zone */}
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Food Photography
                  </label>
                  <div className="border-2 border-dashed border-outline-variant rounded-2xl p-4 bg-surface-container-low/40 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-outline-variant shadow-xs mb-3">
                      <img
                        src={drawerImage || DEFAULT_DISH_IMAGE}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          ;(e.currentTarget as HTMLImageElement).src = DEFAULT_DISH_IMAGE
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileChange}
                      />
                      <button
                        type="button"
                        disabled={isCompressingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg text-xs bg-surface-container-lowest border border-outline-variant text-on-surface font-semibold hover:bg-surface-container transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-base">photo_camera</span>
                        <span>{isCompressingImage ? 'Compressing...' : 'Replace image'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerImage(DEFAULT_DISH_IMAGE)}
                        className="px-3 py-1.5 rounded-lg text-xs text-error hover:bg-error-container transition-all cursor-pointer font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-[11px] text-outline mt-2 font-medium">
                      Upload food photo with automatic browser compression (JPG/PNG).
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="dish-description-input" className="block text-xs font-bold text-on-surface mb-1">
                    Culinary Description
                  </label>
                  <textarea
                    id="dish-description-input"
                    rows={3}
                    value={drawerDescription}
                    onChange={(e) => setDrawerDescription(e.target.value)}
                    placeholder="Rich tamarind rice prepared with slow-roasted copra, sesame, crunchy peanuts, and authentic temple spices."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-background text-xs leading-relaxed focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                {/* Availability Switch Box */}
                <div className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-on-surface">Available for Customer Orders</p>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      When turned off, item appears dimmed and cannot be booked in Muhurtham packages.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={drawerAvailable}
                      onChange={(e) => setDrawerAvailable(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-800"></div>
                  </label>
                </div>

                {/* Drawer Footer Actions */}
                <div className="p-5 border-t border-outline-variant/40 bg-surface-container-low flex items-center justify-end gap-3 -mx-6 -mb-6 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-on-surface-variant text-xs font-bold hover:bg-surface-container transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingItem}
                    className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary-container active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSavingItem ? 'Saving...' : 'Save Dish'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. DELETE CONFIRMATION MODAL                                    */}
      {/* ============================================================== */}
      {itemToDelete && (
        <div
          id="delete-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-sm"
            onClick={() => setItemToDelete(null)}
          />

          <div className="relative bg-surface-container-lowest rounded-2xl max-w-md w-full border border-outline-variant/60 shadow-2xl p-6 z-10">
            <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
            </div>

            <h3 className="font-serif text-xl font-bold text-on-surface">
              Delete &apos;{itemToDelete.name}&apos;?
            </h3>
            <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
              This will remove the dish from the customer catalogue, printed banquet sheets, and manual booking picker for Mysuru kitchens.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-surface-container text-xs text-on-surface-variant flex items-center gap-2 border border-outline-variant/50">
              <span className="material-symbols-outlined text-sm text-error">warning</span>
              <span>Existing confirmed Muhurtham orders containing this dish will retain historical receipts.</span>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl text-on-surface-variant text-xs font-bold hover:bg-surface-container transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteItem}
                className="px-5 py-2 rounded-xl bg-error text-white text-xs font-bold hover:brightness-110 shadow-sm transition-all cursor-pointer"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. ADD / RENAME CATEGORY MODAL                                 */}
      {/* ============================================================== */}
      {isCategoryModalOpen && (
        <div
          id="add-category-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm"
            onClick={() => setIsCategoryModalOpen(false)}
          />

          <div className="relative bg-surface-container-lowest rounded-2xl max-w-sm w-full border border-outline-variant/60 shadow-2xl p-6 z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary font-bold">
                <span className="material-symbols-outlined">library_add</span>
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-on-surface">
                  {editingCategory ? 'Rename Category' : 'New Category'}
                </h4>
                <p className="text-[11px] text-on-surface-variant">e.g., &apos;Special Muhurtham Sweets&apos;</p>
              </div>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div>
                <label htmlFor="modal-category-name" className="block text-xs font-bold text-on-surface mb-1">
                  Category Name
                </label>
                <input
                  id="modal-category-name"
                  type="text"
                  required
                  value={categoryNameInput}
                  onChange={(e) => setCategoryNameInput(e.target.value)}
                  placeholder="e.g. Special Muhurtham Sweets"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-background text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-on-surface-variant text-xs font-bold hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-xs cursor-pointer"
                >
                  {editingCategory ? 'Save Name' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. DELETE CATEGORY MODAL                                       */}
      {/* ============================================================== */}
      {categoryToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm"
            onClick={() => setCategoryToDelete(null)}
          />

          <div className="relative bg-surface-container-lowest rounded-2xl max-w-sm w-full border border-outline-variant/60 shadow-2xl p-6 z-10">
            <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center mb-3">
              <span className="material-symbols-outlined">delete_sweep</span>
            </div>
            <h4 className="font-serif text-lg font-bold text-on-surface">
              Delete &apos;{categoryToDelete.name}&apos;?
            </h4>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              Are you sure you want to remove this category? Items will remain in the catalogue.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-on-surface-variant text-xs font-bold hover:bg-surface-container cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="px-4 py-2 rounded-xl bg-error text-white text-xs font-bold hover:brightness-110 shadow-xs cursor-pointer"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminMenuPage
