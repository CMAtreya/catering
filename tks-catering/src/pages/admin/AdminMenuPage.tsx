import React, { useState, useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import imageCompression from 'browser-image-compression'
import { AdminAppShell } from '@/components/admin/AdminAppShell'

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
  // Data State
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Active Category Selection ('cat-all' for All Dishes)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat-all')

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
  const [drawerHeritageTag, setDrawerHeritageTag] = useState<string>('Temple Heritage')
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
      if (!selectedCategoryId) {
        setSelectedCategoryId('cat-all')
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

  // Real Food Categories (excluding root 'All Dishes' pseudo-category)
  const realCategories = useMemo(() => {
    return categories.filter(
      (c) => c.id !== 'cat-all' && c.name.toLowerCase() !== 'all dishes'
    )
  }, [categories])

  // Is "All Dishes" view selected?
  const isAllDishes = useMemo(() => {
    if (!selectedCategoryId || selectedCategoryId === 'cat-all' || selectedCategoryId === 'all') return true
    const found = categories.find((c) => c.id === selectedCategoryId)
    return found ? found.name.toLowerCase() === 'all dishes' || found.id === 'cat-all' : false
  }, [categories, selectedCategoryId])

  // Active Category Object (null if viewing all dishes)
  const activeCategory = useMemo(() => {
    if (isAllDishes) return null
    return realCategories.find((c) => c.id === selectedCategoryId) || realCategories[0] || null
  }, [realCategories, selectedCategoryId, isAllDishes])

  // Count items per category
  const categoryItemCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    realCategories.forEach((cat) => {
      counts[cat.name] = items.filter((i) => i.category === cat.name).length
    })
    return counts
  }, [realCategories, items])

  // Items for active category (or all items if in All Dishes mode)
  const activeCategoryItems = useMemo(() => {
    if (isAllDishes || !activeCategory) return items
    return items.filter((item) => item.category === activeCategory.name)
  }, [items, activeCategory, isAllDishes])

  // Filtered Items (by Search & Availability Chip)
  const displayedItems = useMemo(() => {
    if (previewState === 'empty') return []
    let list = activeCategoryItems

    // Search query matches name, category, description, portion label, or tags
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((i) => 
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        (i.portionLabel && i.portionLabel.toLowerCase().includes(q)) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (DISH_TAG_MAP[i.id] && DISH_TAG_MAP[i.id].toLowerCase().includes(q)) ||
        (i.heritageTag && i.heritageTag.toLowerCase().includes(q))
      )
    }

    // Availability Filter
    if (availabilityFilter === 'available') {
      list = list.filter((i) => i.available)
    } else if (availabilityFilter === 'unavailable') {
      list = list.filter((i) => !i.available)
    }

    return list
  }, [activeCategoryItems, searchQuery, availabilityFilter, previewState])

  // Available & Unavailable counts for current category / all dishes
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
    setDrawerCategory(activeCategory ? activeCategory.name : realCategories[0]?.name || '')
    setDrawerImage(DEFAULT_DISH_IMAGE)
    setDrawerDescription('')
    setDrawerHeritageTag('Temple Heritage')
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
        item.description ||
        `Authentic satvik preparation prepared with pure cow ghee and traditional temple spices.`
    )
    setDrawerHeritageTag(item.heritageTag || DISH_TAG_MAP[item.id] || 'Temple Heritage')
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
    if (!drawerCategory || drawerCategory === 'All Dishes') {
      toast.error('Please select a valid menu category')
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
        available: drawerAvailable,
        description: drawerDescription,
        portionLabel: drawerDescription,
        heritageTag: drawerHeritageTag
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

  // Duplicate Dish Option
  const handleDuplicateDish = async (item: MenuItem) => {
    setActiveDropdownId(null)
    try {
      const copyName = `${item.name} (Copy)`
      const updated = await saveItem({
        name: copyName,
        pricePerPlate: item.pricePerPlate,
        category: item.category,
        image: item.image || DEFAULT_DISH_IMAGE,
        emoji: item.emoji || getDefaultEmoji(item.category),
        available: item.available,
        portionLabel: item.portionLabel,
        description: item.description,
        heritageTag: item.heritageTag || DISH_TAG_MAP[item.id] || 'Temple Heritage'
      })
      setItems(updated)
      toast.success(`Duplicated '${item.name}'`)
    } catch (err) {
      console.error('Error duplicating dish:', err)
      toast.error('Failed to duplicate dish')
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
      if (selectedCategoryId === id) {
        setSelectedCategoryId('cat-all')
      }
      toast.success(`Category '${name}' removed`)
    } catch (err) {
      console.error('Failed to delete category:', err)
      toast.error('Failed to delete category')
    }
  }

  // Move Category Up / Down
  const handleMoveCategory = async (realIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? realIndex - 1 : realIndex + 1
    if (targetIndex < 0 || targetIndex >= realCategories.length) return

    const newReal = [...realCategories]
    const [moved] = newReal.splice(realIndex, 1)
    newReal.splice(targetIndex, 0, moved)

    const allCat = categories.find(
      (c) => c.id === 'cat-all' || c.name.toLowerCase() === 'all dishes'
    )
    const finalOrder = allCat ? [allCat, ...newReal] : newReal

    setCategories(finalOrder)
    try {
      const saved = await reorderCategories(finalOrder.map((c) => c.id))
      setCategories(saved)
      toast.success('Category reordered')
    } catch {
      loadMenuData()
    }
  }

  return (
    <AdminAppShell>
      <div className="w-full min-h-[calc(100vh-80px)] flex flex-col bg-background text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed">
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
        {/* WORKSPACE: TOP BAR + DUAL-PANEL CONTENT                         */}
        {/* ============================================================== */}
        <div className="flex-1 flex flex-col h-full bg-surface-bright min-w-0">
          
          {/* TOP BAR */}
          <header className="h-20 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/40 px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 z-20">
            {/* Left Greeting & Thithi */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-serif text-xl md:text-2xl text-on-surface font-bold tracking-tight">
                    Namaskara
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
                  <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })} · Mysuru Central Matha Unit</span>
                </p>
              </div>
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
                    {realCategories.length} Categories
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddCategory}
                  className="w-full mt-3 py-2 px-3 rounded-lg border border-dashed border-outline hover:border-primary bg-surface-container-low hover:bg-surface-container text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Add Category</span>
                </button>
              </div>

              {/* Category List */}
              <div className="p-3 space-y-1.5 flex-1 overflow-y-auto custom-scroll">
                {/* 1. All Dishes Master Option Button */}
                <div
                  id="category-all-dishes-btn"
                  onClick={() => {
                    setSelectedCategoryId('cat-all')
                    setPreviewState('default')
                  }}
                  className={`group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer mb-2 ${
                    isAllDishes
                      ? 'bg-surface-container text-on-surface border-2 border-primary shadow-xs'
                      : 'hover:bg-surface-container-low text-on-surface border border-outline-variant/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isAllDishes
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-high text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">restaurant_menu</span>
                    </div>
                    <div className="truncate">
                      <p
                        className={`text-xs font-bold truncate ${
                          isAllDishes ? 'text-primary' : 'text-on-surface'
                        }`}
                      >
                        All Dishes
                      </p>
                      <p className="text-[10px] text-on-surface-variant font-medium">
                        {isAllDishes ? 'Viewing full menu catalogue' : 'Browse all preparations'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isAllDishes
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {items.length} items
                  </span>
                </div>

                {/* Section Divider */}
                <div className="flex items-center gap-2 px-1 py-1 text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider">
                  <span>Categories</span>
                  <div className="flex-1 h-px bg-outline-variant/40"></div>
                </div>

                {/* 2. Real Food Categories List */}
                {realCategories.map((cat, idx) => {
                  const isActive = !isAllDishes && activeCategory?.id === cat.id
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
                          {idx < realCategories.length - 1 && (
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
                          {realCategories.length > 1 && (
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
                      {isAllDishes ? 'Full Catalogue' : 'Active Category'}
                    </span>
                    <span className="text-xs text-outline font-semibold">
                      {isAllDishes
                        ? `All Categories (${realCategories.length})`
                        : `Order Rank #${realCategories.findIndex((c) => c.id === activeCategory?.id) + 1}`}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl md:text-3xl text-primary mt-1 font-bold">
                    {isAllDishes ? 'All Dishes & Delicacies' : (activeCategory ? activeCategory.name : 'All Preparations')}
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {isAllDishes
                      ? `Showing ${displayedItems.length} authentic dishes curated across all banquet categories`
                      : `Showing ${displayedItems.length} authentic dishes curated for Banana Leaf Muhurtham Feasts`}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={handleOpenAddItem}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all shadow-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>{isAllDishes ? 'Add Food Item' : 'Add Item to Category'}</span>
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
                    placeholder={
                      isAllDishes
                        ? 'Search all dishes by name, category, or tag...'
                        : 'Search dishes in this category...'
                    }
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
                    const dishTag = item.heritageTag || DISH_TAG_MAP[item.id] || 'Temple Heritage'

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
                            <div className="flex items-start gap-2.5 min-w-0">
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
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-on-surface leading-snug truncate">
                                  {item.name}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] font-semibold text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded-md border border-secondary/20 truncate">
                                    {item.category}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Direct Edit + Kebab Action Menu */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditItem(item)}
                                className="p-1 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                                title="Edit dish"
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>

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
                                  title="More options"
                                >
                                  <span className="material-symbols-outlined text-lg">more_vert</span>
                                </button>

                                {activeDropdownId === item.id && (
                                  <div className="absolute right-0 mt-1 w-44 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-lg py-1 z-30 text-xs">
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
                                        handleToggleItemAvailability(item, !item.available)
                                      }}
                                      className="w-full px-3 py-1.5 text-left text-on-surface hover:bg-surface-container flex items-center gap-2 cursor-pointer font-medium"
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        {item.available ? 'pause_circle' : 'play_circle'}
                                      </span>
                                      <span>{item.available ? 'Pause dish' : 'Make available'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDuplicateDish(item)}
                                      className="w-full px-3 py-1.5 text-left text-on-surface hover:bg-surface-container flex items-center gap-2 cursor-pointer font-medium"
                                    >
                                      <span className="material-symbols-outlined text-sm">content_copy</span>
                                      <span>Duplicate dish</span>
                                    </button>
                                    <div className="h-px bg-outline-variant/50 my-1"></div>
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
                    {isAllDishes ? 'No dishes found in menu catalogue' : 'No dishes in this category yet'}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-2 mb-6 leading-relaxed">
                    {searchQuery || availabilityFilter !== 'all'
                      ? 'No dishes match your active search or availability filter. Try adjusting your search keywords or resetting filters.'
                      : "Click 'Add Food Item' to introduce traditional preparations, set price per muhurtham leaf, and configure live kitchen availability."}
                  </p>
                  {searchQuery || availabilityFilter !== 'all' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setAvailabilityFilter('all')
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-bold hover:bg-surface-container transition-all cursor-pointer border border-outline-variant"
                    >
                      <span className="material-symbols-outlined text-base">restart_alt</span>
                      <span>Clear Search &amp; Filters</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenAddItem}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary-container transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                      <span>Add First Food Item</span>
                    </button>
                  )}
                </div>
              )}

            </section>
          </main>
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
                      {realCategories.map((cat, i) => (
                        <option key={cat.id} value={cat.name}>
                          {i + 1}. {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dish Tag / Speciality Badge */}
                <div>
                  <label htmlFor="dish-tag-input" className="block text-xs font-bold text-on-surface mb-1">
                    Dish Tag / Speciality Badge
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="dish-tag-input"
                      type="text"
                      value={drawerHeritageTag}
                      onChange={(e) => setDrawerHeritageTag(e.target.value)}
                      placeholder="e.g. Temple Signature"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-background text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                    <select
                      value={drawerHeritageTag}
                      onChange={(e) => setDrawerHeritageTag(e.target.value)}
                      className="px-2.5 py-2 rounded-xl border border-outline-variant bg-surface-container text-xs font-medium focus:border-primary outline-none cursor-pointer text-on-surface"
                    >
                      <option value="Temple Heritage">Temple Heritage</option>
                      <option value="Temple Signature">Temple Signature</option>
                      <option value="Pure Ghee Special">Pure Ghee Special</option>
                      <option value="Mysuru Classic">Mysuru Classic</option>
                      <option value="Heritage Sweet">Heritage Sweet</option>
                      <option value="Cooling Finish">Cooling Finish</option>
                      <option value="Traditional Snack">Traditional Snack</option>
                      <option value="Melkote Recipe">Melkote Recipe</option>
                      <option value="Chef Special">Chef Special</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-outline mt-1">Highlighted badge displayed on the food photograph.</p>
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
    </AdminAppShell>
  )
}

export default AdminMenuPage
