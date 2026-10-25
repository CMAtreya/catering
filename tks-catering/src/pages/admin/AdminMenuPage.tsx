import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Plus, 
  GripVertical, 
  ChevronUp, 
  ChevronDown, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  FolderInput, 
  Camera, 
  X, 
  Check, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { MOTION_SPRINGS } from '@/motion/tokens'
import imageCompression from 'browser-image-compression'
import { toast } from 'sonner'

import { 
  getCatalogue, 
  saveCategory, 
  reorderCategories, 
  deleteCategory, 
  saveItem, 
  toggleItemAvailability, 
  moveItem, 
  deleteItem 
} from '@/api'
import type { Category, MenuItem } from '@/data/mockData'
import { AdminAppShell } from '@/components/admin/AdminAppShell'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetClose 
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatRupees } from '@/lib/format'

export const AdminMenuPage: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Network online state for offline rules
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  })

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Mobile collapsed category blocks
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({})

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId]
    }))
  }

  // Category Sheet State (Add / Rename)
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState<boolean>(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryNameInput, setCategoryNameInput] = useState<string>('')
  const [isSavingCategory, setIsSavingCategory] = useState<boolean>(false)

  // Category Delete Dialog State (with items choice)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [deleteCategoryOption, setDeleteCategoryOption] = useState<'move' | 'delete'>('move')
  const [targetMoveCategoryId, setTargetMoveCategoryId] = useState<string>('')
  const [isDeletingCategory, setIsDeletingCategory] = useState<boolean>(false)

  // Item Sheet State (Add / Edit)
  const [isItemSheetOpen, setIsItemSheetOpen] = useState<boolean>(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [itemName, setItemName] = useState<string>('')
  const [itemPrice, setItemPrice] = useState<string>('')
  const [itemCategory, setItemCategory] = useState<string>('')
  const [itemImage, setItemImage] = useState<string>('')
  const [itemAvailable, setItemAvailable] = useState<boolean>(true)
  const [isCompressingImage, setIsCompressingImage] = useState<boolean>(false)
  const [isSavingItem, setIsSavingItem] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Move Item Sheet State
  const [itemToMove, setItemToMove] = useState<MenuItem | null>(null)
  const [isMoveSheetOpen, setIsMoveSheetOpen] = useState<boolean>(false)

  // Item Delete Dialog State
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)

  // Drag-and-drop state between categories on desktop
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [dragOverCategoryName, setDragOverCategoryName] = useState<string | null>(null)

  // Load menu data
  const loadMenuData = async () => {
    setIsLoading(true)
    try {
      const res = await getCatalogue()
      setCategories(res.categories)
      setItems(res.items)
    } catch (err) {
      console.error('Failed to load menu data:', err)
      toast.error('Failed to load menu catalogue')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMenuData()
  }, [])

  // Map items by category name
  const itemsByCategory = useMemo(() => {
    const map: Record<string, MenuItem[]> = {}
    categories.forEach((cat) => {
      map[cat.name] = []
    })
    items.forEach((item) => {
      if (map[item.category]) {
        map[item.category].push(item)
      } else {
        // If orphaned or unmapped category, group under its category name
        if (!map[item.category]) map[item.category] = []
        map[item.category].push(item)
      }
    })
    return map
  }, [categories, items])

  // Other categories for move dropdowns
  const availableTargetCategories = useMemo(() => {
    if (!categoryToDelete) return categories
    return categories.filter((c) => c.id !== categoryToDelete.id)
  }, [categories, categoryToDelete])

  // ==========================================================
  // CATEGORY ACTIONS
  // ==========================================================
  const handleOpenAddCategory = () => {
    setEditingCategory(null)
    setCategoryNameInput('')
    setIsCategorySheetOpen(true)
  }

  const handleOpenRenameCategory = (cat: Category) => {
    setEditingCategory(cat)
    setCategoryNameInput(cat.name)
    setIsCategorySheetOpen(true)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanName = categoryNameInput.trim()
    if (!cleanName) {
      toast.error('Please enter a category name')
      return
    }

    setIsSavingCategory(true)
    try {
      const oldCatName = editingCategory?.name
      const updatedCats = await saveCategory({
        id: editingCategory ? editingCategory.id : undefined,
        name: cleanName
      })
      
      // Optimistic update of local state
      setCategories(updatedCats)
      if (oldCatName && oldCatName !== cleanName) {
        setItems((prev) =>
          prev.map((i) => (i.category === oldCatName ? { ...i, category: cleanName } : i))
        )
      }

      toast.success(editingCategory ? 'Category renamed' : 'Category created')
      setIsCategorySheetOpen(false)
    } catch (err) {
      console.error('Error saving category:', err)
      toast.error('Failed to save category')
    } finally {
      setIsSavingCategory(false)
    }
  }

  // Category Up/Down Reorder
  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= categories.length) return

    const newOrder = [...categories]
    const [movedCat] = newOrder.splice(index, 1)
    newOrder.splice(targetIndex, 0, movedCat)

    // Optimistically update display order
    const orderedIds = newOrder.map((c) => c.id)
    setCategories(newOrder)

    try {
      const savedCats = await reorderCategories(orderedIds)
      setCategories(savedCats)
      toast.success('Category order updated')
    } catch (err) {
      console.error('Reorder failed:', err)
      toast.error('Failed to update category order')
      loadMenuData()
    }
  }

  // Category Delete Request
  const handleRequestDeleteCategory = (cat: Category) => {
    const catItems = itemsByCategory[cat.name] || []
    setCategoryToDelete(cat)
    if (catItems.length > 0) {
      setDeleteCategoryOption('move')
      const otherCat = categories.find((c) => c.id !== cat.id)
      setTargetMoveCategoryId(otherCat ? otherCat.name : '')
    }
  }

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return
    const catItems = itemsByCategory[categoryToDelete.name] || []
    setIsDeletingCategory(true)

    try {
      if (catItems.length > 0) {
        if (deleteCategoryOption === 'move') {
          if (!targetMoveCategoryId) {
            toast.error('Please select a target category to move items to')
            setIsDeletingCategory(false)
            return
          }
          const res = await deleteCategory(categoryToDelete.id, {
            moveItemsToCategory: targetMoveCategoryId
          })
          setCategories(res.categories)
          setItems(res.items)
          toast.success(`Deleted ${categoryToDelete.name} and moved ${catItems.length} items to ${targetMoveCategoryId}`)
        } else {
          const res = await deleteCategory(categoryToDelete.id, {
            deleteItems: true
          })
          setCategories(res.categories)
          setItems(res.items)
          toast.success(`Deleted ${categoryToDelete.name} and removed ${catItems.length} items`)
        }
      } else {
        const res = await deleteCategory(categoryToDelete.id)
        setCategories(res.categories)
        setItems(res.items)
        toast.success(`Category ${categoryToDelete.name} deleted`)
      }

      setCategoryToDelete(null)
    } catch (err) {
      console.error('Delete category failed:', err)
      toast.error('Failed to delete category')
    } finally {
      setIsDeletingCategory(false)
    }
  }

  // ==========================================================
  // ITEM ACTIONS (Add / Edit / Delete / Toggle / Move)
  // ==========================================================
  const handleOpenAddItem = (defaultCatName?: string) => {
    setEditingItem(null)
    setItemName('')
    setItemPrice('')
    setItemCategory(defaultCatName || (categories[0] ? categories[0].name : ''))
    setItemImage('')
    setItemAvailable(true)
    setIsItemSheetOpen(true)
  }

  const handleOpenEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setItemName(item.name)
    setItemPrice(String(item.pricePerPlate))
    setItemCategory(item.category)
    setItemImage(item.image || '')
    setItemAvailable(item.available)
    setIsItemSheetOpen(true)
  }

  // Image Upload & Browser Compression
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsCompressingImage(true)
    const toastId = toast.loading('Compressing image in browser...')
    try {
      const options = {
        maxSizeMB: 0.35,
        maxWidthOrHeight: 700,
        useWebWorker: true
      }
      const compressedFile = await imageCompression(file, options)
      const dataUrl = await imageCompression.getDataUrlFromFile(compressedFile)
      setItemImage(dataUrl)
      toast.success('Image compressed and attached', { id: toastId })
    } catch (err) {
      console.error('Image compression error:', err)
      toast.error('Could not process image. Please try a different photo.', { id: toastId })
    } finally {
      setIsCompressingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = () => {
    setItemImage('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    toast.info('Image removed. Reverted to dish emblem.')
  }

  // Save Item Handler
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanName = itemName.trim()
    const numericPrice = parseFloat(itemPrice)

    if (!cleanName) {
      toast.error('Please enter a dish name')
      return
    }
    if (isNaN(numericPrice) || numericPrice < 0) {
      toast.error('Please enter a valid price per plate')
      return
    }
    if (!itemCategory) {
      toast.error('Please select a category')
      return
    }

    setIsSavingItem(true)
    try {
      const updatedItems = await saveItem({
        id: editingItem ? editingItem.id : undefined,
        name: cleanName,
        pricePerPlate: numericPrice,
        category: itemCategory,
        image: itemImage,
        available: itemAvailable
      })

      setItems(updatedItems)
      toast.success('Saved')
      setIsItemSheetOpen(false)
    } catch (err) {
      console.error('Failed to save item:', err)
      toast.error('Failed to save dish')
    } finally {
      setIsSavingItem(false)
    }
  }

  // Toggle Item Availability (Optimistic update)
  const handleToggleItemAvailability = async (item: MenuItem, newStatus: boolean) => {
    // Optimistic state update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, available: newStatus } : i))
    )

    try {
      await toggleItemAvailability(item.id, newStatus)
      if (newStatus) {
        toast.success(`${item.name} is now available in customer catalogue`)
      } else {
        toast.info(`${item.name} marked as unavailable`)
      }
    } catch (err) {
      console.error('Toggle availability failed:', err)
      // Rollback
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, available: !newStatus } : i))
      )
      toast.error('Failed to update availability')
    }
  }

  // Move Item to Category
  const handleOpenMoveItem = (item: MenuItem) => {
    setItemToMove(item)
    setIsMoveSheetOpen(true)
  }

  const handleConfirmMoveItem = async (targetCategoryName: string) => {
    if (!itemToMove) return
    if (itemToMove.category === targetCategoryName) {
      setIsMoveSheetOpen(false)
      return
    }

    const previousCategory = itemToMove.category
    const targetItem = itemToMove

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === targetItem.id ? { ...i, category: targetCategoryName } : i))
    )
    setIsMoveSheetOpen(false)
    toast.success(`Moved to ${targetCategoryName}`)

    try {
      await moveItem(targetItem.id, targetCategoryName)
    } catch (err) {
      console.error('Move item failed:', err)
      // Rollback
      setItems((prev) =>
        prev.map((i) => (i.id === targetItem.id ? { ...i, category: previousCategory } : i))
      )
      toast.error('Failed to move item')
    }
  }

  // Delete Item
  const handleConfirmDeleteItem = async () => {
    if (!itemToDelete) return
    const idToDelete = itemToDelete.id
    const deletedName = itemToDelete.name

    // Optimistic delete
    setItems((prev) => prev.filter((i) => i.id !== idToDelete))
    setItemToDelete(null)

    try {
      await deleteItem(idToDelete)
      toast.success(`${deletedName} deleted from menu`)
    } catch (err) {
      console.error('Delete item failed:', err)
      toast.error('Failed to delete item')
      loadMenuData()
    }
  }

  // Desktop Drag-and-drop between categories
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('text/plain', itemId)
    setDraggedItemId(itemId)
  }

  const handleDragOverCategory = (e: React.DragEvent, categoryName: string) => {
    e.preventDefault()
    setDragOverCategoryName(categoryName)
  }

  const handleDragLeaveCategory = (categoryName: string) => {
    if (dragOverCategoryName === categoryName) {
      setDragOverCategoryName(null)
    }
  }

  const handleDropOnCategory = async (e: React.DragEvent, targetCategoryName: string) => {
    e.preventDefault()
    setDragOverCategoryName(null)
    const itemId = e.dataTransfer.getData('text/plain') || draggedItemId
    if (!itemId) return

    const item = items.find((i) => i.id === itemId)
    if (!item || item.category === targetCategoryName) return

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, category: targetCategoryName } : i))
    )
    toast.success(`Moved to ${targetCategoryName}`)

    try {
      await moveItem(itemId, targetCategoryName)
    } catch {
      toast.error('Failed to move dish')
      loadMenuData()
    } finally {
      setDraggedItemId(null)
    }
  }

  // Adaptive item form for Mobile Bottom Sheet & Desktop Centered Dialog
  const renderItemForm = () => (
    <form onSubmit={handleSaveItem} className="flex-1 overflow-y-auto p-5 space-y-4.5">
      {/* Dish Name */}
      <div className="space-y-1.5">
        <label htmlFor="item-name" className="text-xs font-bold text-slate-700">
          Dish Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="item-name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="e.g. Mysore Pak, Pineapple Kesari"
          className="bg-slate-50"
          required
        />
      </div>

      {/* Price per plate */}
      <div className="space-y-1.5">
        <label htmlFor="item-price" className="text-xs font-bold text-slate-700">
          Price per plate (₹) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold select-none">₹</span>
          <input
            id="item-price"
            type="number"
            min={0}
            step={5}
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            placeholder="60"
            className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[var(--brand-300)]"
            required
          />
        </div>
      </div>

      {/* Category Select */}
      <div className="space-y-1.5">
        <label htmlFor="item-category" className="text-xs font-bold text-slate-700">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="item-category"
          value={itemCategory}
          onChange={(e) => setItemCategory(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[var(--brand-300)]"
          required
        >
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Image (choose or photo, preview, compress, replace and remove) */}
      <div className="space-y-2 pt-1">
        <label className="text-xs font-bold text-slate-700 block">
          Dish Photo
        </label>

        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center gap-4">
          {/* Image Preview Box */}
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
            {itemImage ? (
              <img
                src={itemImage}
                alt="Dish preview"
                width="80"
                height="80"
                decoding="async"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl select-none">
                {editingItem?.emoji || '🍽️'}
              </span>
            )}
            {isCompressingImage && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-[var(--brand)] animate-spin" />
              </div>
            )}
          </div>

          {/* Upload & Actions */}
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <p className="text-xs text-slate-600 font-medium">
              Upload or snap a photo. Compressed automatically in browser for speed.
            </p>

            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
                id="dish-photo-file"
              />

              {itemImage ? (
                <>
                  <label
                    htmlFor="dish-photo-file"
                    className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Replace</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 inline-flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </>
              ) : (
                <label
                  htmlFor="dish-photo-file"
                  className="px-4 py-2 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Choose photo / Take snapshot</span>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Availability switch */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-800">
            Available in Catalogue
          </p>
          <p className="text-[11px] text-slate-500">
            When enabled, customers can view and select this dish
          </p>
        </div>
        <Switch
          checked={itemAvailable}
          onCheckedChange={setItemAvailable}
          disabled={!isOnline}
          className="data-checked:bg-emerald-600"
        />
      </div>

      {/* Sticky Bottom Action */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsItemSheetOpen(false)}
          className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSavingItem || isCompressingImage || !itemName.trim() || !isOnline}
          className="px-7 py-2.5 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white text-xs font-bold shadow-md active:scale-95 transition-all disabled:opacity-50"
        >
          {isSavingItem ? 'Saving...' : 'Save Dish'}
        </button>
      </div>
    </form>
  )

  return (
    <AdminAppShell 
      title="Menu" 
      subtitle="Manage categories, dishes, prices and live catering catalogue"
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-36">

        {/* ======================================================== */}
        {/* HEADER: Title with '+ Category' and '+ Item' buttons     */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="font-heading font-black text-xl sm:text-2xl text-[var(--brand-900)] tracking-tight">
              Banquet Menu Management
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-medium">
              {categories.length} categories • {items.length} total dishes • All changes update customer catalogue in real-time
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* + Category Button */}
            <button
              type="button"
              onClick={handleOpenAddCategory}
              disabled={!isOnline}
              className="h-10 px-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-heading font-bold text-xs sm:text-sm border border-slate-300 shadow-xs active:scale-95 transition-all flex items-center gap-1.5 tap-target-48 sm:tap-target-auto cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 text-slate-600" />
              <span>+ Category</span>
            </button>

            {/* + Item Button (Brand) */}
            <button
              type="button"
              onClick={() => handleOpenAddItem()}
              disabled={!isOnline}
              className="h-10 px-5 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white font-heading font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-1.5 tap-target-48 sm:tap-target-auto cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ Item</span>
            </button>
          </div>
        </div>

        {/* Loading state skeleton */}
        {isLoading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-slate-200/70 rounded-2xl" />
            <div className="h-32 bg-slate-200/70 rounded-2xl" />
            <div className="h-32 bg-slate-200/70 rounded-2xl" />
          </div>
        )}

        {/* ======================================================== */}
        {/* CATEGORIES LIST WITH ACCORDION / EXPANDED CARDS          */}
        {/* ======================================================== */}
        {!isLoading && (
          <div className="space-y-6">
            {categories.map((cat, index) => {
              const catItems = itemsByCategory[cat.name] || []
              const isDragTarget = dragOverCategoryName === cat.name

              return (
                <motion.div
                  layout
                  transition={MOTION_SPRINGS.soft}
                  key={cat.id}
                  onDragOver={(e) => handleDragOverCategory(e, cat.name)}
                  onDragLeave={() => handleDragLeaveCategory(cat.name)}
                  onDrop={(e) => handleDropOnCategory(e, cat.name)}
                  className={`content-card rounded-[22px] bg-white border transition-all duration-200 shadow-xs overflow-hidden ${
                    isDragTarget
                      ? 'border-[var(--brand)] ring-2 ring-[var(--brand)]/20 bg-amber-50/20'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {/* Category Header: Drag handle, small up/down buttons, name, count, kebab */}
                  <div className="p-3.5 sm:p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      
                      {/* Drag Handle Icon */}
                      <span 
                        className="text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing p-1"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </span>

                      {/* Small up/down arrow buttons (so it works without dragging) */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveCategory(index, 'up')}
                          disabled={index === 0}
                          aria-label={`Move category ${cat.name} up`}
                          className="w-5 h-4.5 rounded bg-white hover:bg-slate-200 text-slate-600 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center border border-slate-200/80 shadow-xs transition-colors"
                          title="Move category up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveCategory(index, 'down')}
                          disabled={index === categories.length - 1}
                          aria-label={`Move category ${cat.name} down`}
                          className="w-5 h-4.5 rounded bg-white hover:bg-slate-200 text-slate-600 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center border border-slate-200/80 shadow-xs transition-colors"
                          title="Move category down"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Category Name & Count */}
                      <div className="min-w-0 flex items-center gap-2.5">
                        <h2 className="font-heading font-black text-base sm:text-lg text-[var(--brand-900)] tracking-tight truncate">
                          {cat.name}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-slate-600 border border-slate-200/90 shadow-2xs shrink-0">
                          {catItems.length} {catItems.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </div>

                    {/* Kebab Menu (Rename, Delete), Quick Add & Mobile Collapse */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Mobile Collapse Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleCategoryCollapse(cat.id)}
                        aria-expanded={!collapsedCategories[cat.id]}
                        aria-label={collapsedCategories[cat.id] ? `Expand ${cat.name}` : `Collapse ${cat.name}`}
                        className="w-8 h-8 rounded-full hover:bg-slate-200/80 flex items-center justify-center text-slate-500 transition-colors tap-target-48 sm:hidden"
                        title={collapsedCategories[cat.id] ? 'Expand category' : 'Collapse category'}
                      >
                        {collapsedCategories[cat.id] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenAddItem(cat.name)}
                        className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-[var(--brand)] hover:bg-amber-50/80 transition-colors"
                        title="Add dish to this category"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add item</span>
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label={`Category options for ${cat.name}`}
                            className="w-8 h-8 rounded-full hover:bg-slate-200/80 flex items-center justify-center text-slate-600 transition-colors tap-target-48 sm:tap-target-auto"
                            title="Category options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 bg-white shadow-xl rounded-xl p-1 border border-slate-200 z-50">
                          <DropdownMenuItem
                            onClick={() => handleOpenRenameCategory(cat)}
                            className="cursor-pointer text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg p-2 flex items-center gap-2"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Rename Category</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="my-1 bg-slate-100" />

                          <DropdownMenuItem
                            onClick={() => handleRequestDeleteCategory(cat)}
                            className="cursor-pointer text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg p-2 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>Delete Category</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* ITEMS LIST UNDER CATEGORY (collapsible on phones) */}
                  {!collapsedCategories[cat.id] && (
                    <div className="divide-y divide-slate-100">
                    {catItems.length > 0 ? (
                      <AnimatePresence initial={false}>
                        {catItems.map((item) => {
                          const isUnavailable = !item.available
                          const isBeingDragged = draggedItemId === item.id

                          return (
                            <motion.div
                              key={item.id}
                              layout
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                              transition={MOTION_SPRINGS.soft}
                              draggable
                              onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, item.id)}
                              onDragEnd={() => setDraggedItemId(null)}
                              className={`p-3 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                                isBeingDragged
                                  ? 'shadow-2xl ring-2 ring-[var(--brand)]/40 rounded-xl bg-white z-20 scale-[1.01]'
                                  : ''
                              } ${
                                isUnavailable 
                                  ? 'bg-slate-50/80 opacity-60 grayscale' 
                                  : 'hover:bg-slate-50/50'
                              }`}
                            >
                              {/* Left: Thumbnail & Details */}
                              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                
                                {/* 56px Image Thumbnail */}
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border border-slate-200 shrink-0 flex items-center justify-center">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      width="56"
                                      height="56"
                                      decoding="async"
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <span className="text-2xl select-none">
                                      {item.emoji || '🍛'}
                                    </span>
                                  )}
                                </div>

                                {/* Item Name & Price */}
                                <div className="min-w-0 space-y-0.5">
                                  <p className={`font-bold text-xs sm:text-sm tracking-tight truncate ${
                                    isUnavailable ? 'text-slate-500 line-through' : 'text-slate-900'
                                  }`}>
                                    {item.name}
                                  </p>
                                  <p className="font-heading font-black text-xs sm:text-sm text-[var(--brand)]">
                                    {formatRupees(item.pricePerPlate)} <span className="text-[11px] font-normal text-slate-500">/ plate</span>
                                  </p>
                                  {!item.available && (
                                    <span className="inline-block text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                      Unavailable in menu
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Right: Available switch and Kebab menu */}
                              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                                
                                {/* Available Switch (off greys the row) */}
                                <div className="flex items-center gap-2">
                                  <label 
                                    htmlFor={`switch-${item.id}`}
                                    className="hidden md:inline-block text-[11px] font-bold text-slate-500 cursor-pointer"
                                  >
                                    {item.available ? 'Available' : 'Hidden'}
                                  </label>
                                  <Switch
                                    id={`switch-${item.id}`}
                                    checked={item.available}
                                    onCheckedChange={(checked) => handleToggleItemAvailability(item, checked)}
                                    className="data-checked:bg-emerald-600 transition-colors"
                                    aria-label={`Toggle availability for ${item.name}`}
                                    title={item.available ? 'Available in catalogue' : 'Hidden from catalogue'}
                                  />
                                </div>

                                {/* Item Kebab Menu (Edit, Move to category, Delete) */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      aria-label={`Item options for ${item.name}`}
                                      className="w-8 h-8 rounded-full hover:bg-slate-200/70 flex items-center justify-center text-slate-600 transition-colors tap-target-48 sm:tap-target-auto"
                                      title="Item options"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48 bg-white shadow-xl rounded-xl p-1 border border-slate-200 z-50">
                                    <DropdownMenuItem
                                      onClick={() => handleOpenEditItem(item)}
                                      className="cursor-pointer text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg p-2 flex items-center gap-2"
                                    >
                                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                      <span>Edit Dish</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() => handleOpenMoveItem(item)}
                                      className="cursor-pointer text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg p-2 flex items-center gap-2"
                                    >
                                      <FolderInput className="w-3.5 h-3.5 text-slate-500" />
                                      <span>Move to Category</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator className="my-1 bg-slate-100" />

                                    <DropdownMenuItem
                                      onClick={() => setItemToDelete(item)}
                                      className="cursor-pointer text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg p-2 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                      <span>Delete Dish</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>

                              </div>
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                    ) : (
                      /* Empty Category State: 'No items yet. Add one.' */
                      <div className="p-6 text-center space-y-2">
                        <p className="text-xs text-slate-500 font-medium">
                          No items yet. Add one.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenAddItem(cat.name)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[var(--brand-900)] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* (1) CATEGORY BOTTOM SHEET (Add or Rename)                */}
      {/* ======================================================== */}
      <Sheet open={isCategorySheetOpen} onOpenChange={setIsCategorySheetOpen}>
        <SheetContent side="bottom" className="max-w-lg mx-auto rounded-t-[24px] p-0 bg-white">
          <SheetHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <SheetTitle className="font-heading font-black text-base sm:text-lg text-[var(--brand-900)]">
                {editingCategory ? 'Rename Category' : 'Add New Category'}
              </SheetTitle>
              <p className="text-xs text-slate-500">
                {editingCategory ? 'Change the category name in the catalogue' : 'Create a new catering menu category'}
              </p>
            </div>
            <SheetClose asChild>
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </SheetClose>
          </SheetHeader>

          <form onSubmit={handleSaveCategory} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="cat-name-input" className="text-xs font-bold text-slate-700">
                Category Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="cat-name-input"
                autoFocus
                value={categoryNameInput}
                onChange={(e) => setCategoryNameInput(e.target.value)}
                placeholder="e.g. Traditional Payasam & Sweets"
                className="bg-slate-50"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCategorySheetOpen(false)}
                className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingCategory || !categoryNameInput.trim()}
                className="px-6 py-2.5 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white text-xs font-bold shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                {isSavingCategory ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* (2) ADD / EDIT ITEM: BOTTOM SHEET ON PHONES, DIALOG ON DESKTOP */}
      {/* ======================================================== */}
      {isDesktop ? (
        <Dialog open={isItemSheetOpen} onOpenChange={setIsItemSheetOpen}>
          <DialogContent className="max-w-xl max-h-[85vh] p-0 rounded-[24px] overflow-hidden bg-white flex flex-col">
            <DialogHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between shrink-0">
              <div>
                <DialogTitle className="font-heading font-black text-base sm:text-lg text-[var(--brand-900)]">
                  {editingItem ? 'Edit Dish' : 'Add New Dish'}
                </DialogTitle>
                <p className="text-xs text-slate-500">
                  Configure dish details, price per plate and photo
                </p>
              </div>
              <DialogClose asChild>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </DialogClose>
            </DialogHeader>
            {renderItemForm()}
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={isItemSheetOpen} onOpenChange={setIsItemSheetOpen}>
          <SheetContent side="bottom" className="max-h-[90vh] h-[90vh] max-w-xl mx-auto rounded-t-[24px] p-0 flex flex-col bg-white">
            <SheetHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between shrink-0">
              <div>
                <SheetTitle className="font-heading font-black text-base sm:text-lg text-[var(--brand-900)]">
                  {editingItem ? 'Edit Dish' : 'Add New Dish'}
                </SheetTitle>
                <p className="text-xs text-slate-500">
                  Configure dish details, price per plate and photo
                </p>
              </div>
              <SheetClose asChild>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </SheetClose>
            </SheetHeader>
            {renderItemForm()}
          </SheetContent>
        </Sheet>
      )}

      {/* ======================================================== */}
      {/* (3) MOVE ITEM TO CATEGORY SHEET                          */}
      {/* ======================================================== */}
      <Sheet open={isMoveSheetOpen} onOpenChange={setIsMoveSheetOpen}>
        <SheetContent side="bottom" className="max-w-md mx-auto rounded-t-[24px] p-0 bg-white">
          <SheetHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <SheetTitle className="font-heading font-black text-base sm:text-lg text-[var(--brand-900)]">
                Move Dish
              </SheetTitle>
              <p className="text-xs text-slate-500">
                Move <span className="font-bold text-slate-800">"{itemToMove?.name}"</span> to another category
              </p>
            </div>
            <SheetClose asChild>
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </SheetClose>
          </SheetHeader>

          <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {categories.map((cat) => {
              const isCurrent = itemToMove?.category === cat.name
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleConfirmMoveItem(cat.name)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    isCurrent
                      ? 'bg-amber-50/60 border-amber-300 text-[var(--brand-900)] font-bold'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-semibold'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{cat.name}</span>
                  {isCurrent ? (
                    <span className="text-[11px] font-bold text-[var(--brand)] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Current</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Move here</span>
                  )}
                </button>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* ======================================================== */}
      {/* (4) CATEGORY DELETE CONFIRMATION DIALOG                  */}
      {/* Forces choice if category has items                     */}
      {/* ======================================================== */}
      <AlertDialog 
        open={Boolean(categoryToDelete)} 
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <AlertDialogContent className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-black text-lg text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Delete Category '{categoryToDelete?.name}'?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm text-slate-600 space-y-2">
              {categoryToDelete && (itemsByCategory[categoryToDelete.name]?.length || 0) > 0 ? (
                <>
                  <p>
                    This category contains <span className="font-bold text-slate-900">{itemsByCategory[categoryToDelete.name]?.length} dishes</span>.
                    Please choose how to handle these items:
                  </p>
                  
                  {/* Choice 1: Move items */}
                  <div className="pt-2 space-y-2">
                    <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                      deleteCategoryOption === 'move' ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <input
                        type="radio"
                        name="delete-cat-option"
                        checked={deleteCategoryOption === 'move'}
                        onChange={() => setDeleteCategoryOption('move')}
                        className="mt-0.5"
                      />
                      <div className="flex-1 space-y-1">
                        <span className="font-bold text-xs text-slate-900 block">
                          Move dishes to another category
                        </span>
                        {deleteCategoryOption === 'move' && (
                          <select
                            value={targetMoveCategoryId}
                            onChange={(e) => setTargetMoveCategoryId(e.target.value)}
                            className="w-full mt-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none"
                          >
                            {availableTargetCategories.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </label>

                    {/* Choice 2: Delete items too */}
                    <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                      deleteCategoryOption === 'delete' ? 'bg-rose-50/70 border-rose-300' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <input
                        type="radio"
                        name="delete-cat-option"
                        checked={deleteCategoryOption === 'delete'}
                        onChange={() => setDeleteCategoryOption('delete')}
                        className="mt-0.5"
                      />
                      <div>
                        <span className="font-bold text-xs text-rose-900 block">
                          Delete items too
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Permanently delete both the category and all its {itemsByCategory[categoryToDelete.name]?.length} dishes.
                        </span>
                      </div>
                    </label>
                  </div>
                </>
              ) : (
                <p>
                  Are you sure you want to delete this empty category? This action cannot be undone.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 flex gap-2">
            <AlertDialogCancel className="rounded-full text-xs font-bold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteCategory}
              disabled={isDeletingCategory}
              className="rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              {isDeletingCategory ? 'Deleting...' : 'Confirm & Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ======================================================== */}
      {/* (5) ITEM DELETE CONFIRMATION DIALOG                      */}
      {/* ======================================================== */}
      <AlertDialog 
        open={Boolean(itemToDelete)} 
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-black text-lg text-rose-900">
              Delete '{itemToDelete?.name}'?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm text-slate-600">
              This will remove this dish from the menu catalogue and customers will no longer be able to select it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex gap-2">
            <AlertDialogCancel className="rounded-full text-xs font-bold">
              Keep dish
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteItem}
              className="rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              Delete dish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </AdminAppShell>
  )
}

export default AdminMenuPage
