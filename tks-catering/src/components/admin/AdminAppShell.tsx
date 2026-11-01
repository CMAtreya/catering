import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import { useAdminAuthStore } from '@/store/adminAuthStore'
import { getOrders, subscribeToOrders } from '@/api'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

interface AdminAppShellProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  hideBottomNav?: boolean
}

/**
 * Flagship Top-Navigation Layout for Admin Workspace (Mysuru Heritage)
 * Left sidebar navigation is seamlessly integrated as a high-visibility,
 * responsive top navigation bar across all screen sizes.
 */
export const AdminAppShell: React.FC<AdminAppShellProps> = ({
  children,
  title,
  subtitle,
  actions,
  hideBottomNav = false
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAdminAuthStore((state) => state.user)
  const logout = useAdminAuthStore((state) => state.logout)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState<boolean>(false)
  const [ordersCount, setOrdersCount] = useState<number>(14)

  useEffect(() => {
    let isMounted = true
    getOrders().then((data) => {
      if (isMounted && data) setOrdersCount(data.length)
    }).catch(() => {})

    const unsubscribe = subscribeToOrders((latest) => {
      if (isMounted && latest) setOrdersCount(latest.length)
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const handleLogout = () => {
    logout()
    setIsLogoutDialogOpen(false)
    toast.success('Logged out successfully')
    navigate('/admin/login')
  }

  const isNavActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen kolam-pattern text-[#2D1810] font-sans flex flex-col w-full selection:bg-[#8B0A00] selection:text-white">
      <Toaster position="bottom-center" richColors />

      {/* ========================================================
           1. TOP NAVIGATION BAR (Consolidated from Left Sidebar)
           ======================================================== */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#EADBC8] shadow-xs select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Left: Brand Identity Logo */}
          <Link to="/admin" className="flex items-center gap-3 group transition-transform active:scale-95 duration-150 shrink-0">
            <div className="flex items-center gap-3 p-1.5 bg-white/90 rounded-2xl border border-[#EADBC8]/80 shadow-xs group-hover:scale-102 transition-transform">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHI-38makq7bnnjwZw4_F3jmltSVXDQ2oXZ8jHOVCzaq0G4CEdRBmqBaAp2zrgorYU6J0YoaPQ7k0m8JZb0WDXwyY24a3fFEgM9omfANc9dxVK53HZWe4Rb3ekwUKTCflKH849zSpYcHuiywxhM2oirDzUCxcsPpGsOzZ64rCleYiQu6gUfimYmCuzGRSzZC5a_0he16R1SvkdtJWDyCtPCCiGEv3zUF8XW9ILiRHuL25ZcQ9IP18h" 
                alt="TKS Iyengar's Logo" 
                className="h-10 sm:h-11 w-auto object-contain shrink-0" 
              />
              <div className="leading-tight pr-1">
                <div className="font-serif font-bold text-base sm:text-lg text-[#8B0A00] tracking-tight">
                  TKS Iyengar's
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-[#785A48]">
                  Catering Desk
                </div>
              </div>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3" aria-label="Admin Navigation">
            {/* Dashboard */}
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                isNavActive('/admin')
                  ? 'bg-[#8B0A00] text-white shadow-md shadow-[#8B0A00]/25 font-bold'
                  : 'text-[#2D1810] hover:bg-white hover:text-[#8B0A00] border border-transparent hover:border-[#EADBC8]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
              <span>Dashboard</span>
            </Link>

            {/* All Orders */}
            <Link
              to="/admin/orders"
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                isNavActive('/admin/orders') && location.pathname !== '/admin/orders/new'
                  ? 'bg-[#8B0A00] text-white shadow-md shadow-[#8B0A00]/25 font-bold'
                  : 'text-[#2D1810] hover:bg-white hover:text-[#8B0A00] border border-transparent hover:border-[#EADBC8]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">restaurant</span>
              <span>All Orders</span>
              <span className="bg-amber-100 text-amber-800 text-[11px] px-2 py-0.5 rounded-full font-bold">
                {ordersCount}
              </span>
            </Link>

            {/* Catering Menu */}
            <Link
              to="/admin/menu"
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                isNavActive('/admin/menu')
                  ? 'bg-[#8B0A00] text-white shadow-md shadow-[#8B0A00]/25 font-bold'
                  : 'text-[#2D1810] hover:bg-white hover:text-[#8B0A00] border border-transparent hover:border-[#EADBC8]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
              <span>Catering Menu</span>
            </Link>

            {/* Customers */}
            <Link
              to="/admin/customers"
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                isNavActive('/admin/customers')
                  ? 'bg-[#8B0A00] text-white shadow-md shadow-[#8B0A00]/25 font-bold'
                  : 'text-[#2D1810] hover:bg-white hover:text-[#8B0A00] border border-transparent hover:border-[#EADBC8]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">group</span>
              <span>Customers</span>
            </Link>
          </nav>

          {/* Right: Phone Hotline, Manager Info & Sign Out */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Low-Tech Owner Support Box */}
            <div className="hidden xl:flex items-center gap-2 p-2 px-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900">
              <span className="material-symbols-outlined text-sm text-[#8B0A00]">help</span>
              <div className="leading-none">
                <span className="text-[10px] text-amber-800/80 block">Need Help Booking?</span>
                <span className="font-bold text-amber-950">0821-2448920</span>
              </div>
            </div>

            {/* Manager Profile Pill */}
            <div className="hidden sm:flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white/80 border border-[#EADBC8]">
              <div className="w-8 h-8 rounded-full bg-[#8B0A00]/10 text-[#8B0A00] flex items-center justify-center font-bold text-sm">
                RK
              </div>
              <div className="leading-tight text-left">
                <p className="text-xs font-bold text-[#2D1810] truncate max-w-[120px]">
                  {user?.name || 'Raghavan (Manager)'}
                </p>
                <p className="text-[10px] text-green-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> Main Mysuru Branch
                </p>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={() => setIsLogoutDialogOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-[#8B0A00] hover:bg-red-50 border border-red-200 font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Sub-nav Strip */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-2 border-t border-[#EADBC8]/70 bg-[#FFF9F0]/90">
          <Link
            to="/admin"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              isNavActive('/admin')
                ? 'bg-[#8B0A00] text-white shadow-xs'
                : 'text-[#2D1810] bg-white border border-[#EADBC8]/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">grid_view</span>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/orders"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              isNavActive('/admin/orders') && location.pathname !== '/admin/orders/new'
                ? 'bg-[#8B0A00] text-white shadow-xs'
                : 'text-[#2D1810] bg-white border border-[#EADBC8]/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">restaurant</span>
            <span>Orders ({ordersCount})</span>
          </Link>

          <Link
            to="/admin/menu"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              isNavActive('/admin/menu')
                ? 'bg-[#8B0A00] text-white shadow-xs'
                : 'text-[#2D1810] bg-white border border-[#EADBC8]/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">menu_book</span>
            <span>Menu</span>
          </Link>

          <Link
            to="/admin/customers"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              isNavActive('/admin/customers')
                ? 'bg-[#8B0A00] text-white shadow-xs'
                : 'text-[#2D1810] bg-white border border-[#EADBC8]/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">group</span>
            <span>Customers</span>
          </Link>
        </div>
      </header>

      {/* ========================================================
           2. CONTEXTUAL SUB-HEADER (For secondary pages)
           ======================================================== */}
      {(title || actions) && (
        <section className="w-full bg-white/80 backdrop-blur-sm border-b border-[#EADBC8] px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 shrink-0 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2D1810] leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-[#785A48] font-medium pt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {actions}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================
           3. MAIN VIEWPORT
           ======================================================== */}
      <main className="flex-1 w-full pb-20 md:pb-12">
        {children}
      </main>

      {/* ========================================================
           4. MOBILE BOTTOM BAR
           ======================================================== */}
      {!hideBottomNav && (
        <nav 
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EADBC8] py-2 px-3 flex items-center justify-around shadow-lg" 
          aria-label="Mobile Bottom Navigation"
        >
          <Link 
            to="/admin" 
            className={`flex flex-col items-center text-xs font-bold gap-0.5 ${
              isNavActive('/admin') ? 'text-[#8B0A00]' : 'text-[#785A48]'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">grid_view</span>
            <span>Dashboard</span>
          </Link>

          <Link 
            to="/admin/orders" 
            className={`flex flex-col items-center text-xs font-medium gap-0.5 relative ${
              isNavActive('/admin/orders') && location.pathname !== '/admin/orders/new'
                ? 'text-[#8B0A00] font-bold'
                : 'text-[#785A48]'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">restaurant</span>
            <span>Orders</span>
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-[#8B0A00]"></span>
          </Link>

          {/* Central Prominent Manual Order Trigger */}
          <Link 
            to="/admin/orders/new" 
            className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-r from-[#8B0A00] to-[#B30A05] text-white flex items-center justify-center shadow-lg shadow-[#8B0A00]/40 active:scale-95"
            title="Create Manual Order"
          >
            <span className="material-symbols-outlined text-3xl font-black">add</span>
          </Link>

          <Link 
            to="/admin/menu" 
            className={`flex flex-col items-center text-xs font-medium gap-0.5 ${
              isNavActive('/admin/menu') ? 'text-[#8B0A00] font-bold' : 'text-[#785A48]'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">menu_book</span>
            <span>Menu</span>
          </Link>

          <Link 
            to="/admin/customers" 
            className={`flex flex-col items-center text-xs font-medium gap-0.5 ${
              isNavActive('/admin/customers') ? 'text-[#8B0A00] font-bold' : 'text-[#785A48]'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">group</span>
            <span>Clients</span>
          </Link>
        </nav>
      )}

      {/* ========================================================
           5. LOG OUT CONFIRMATION MODAL
           ======================================================== */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent className="rounded-2xl max-w-sm bg-white border border-[#EADBC8]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif font-bold text-lg text-[#8B0A00]">
              Sign Out
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#785A48] leading-relaxed">
              Namaskara! Do you want to sign out from the Catering Management Desk?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2 flex items-center gap-2">
            <AlertDialogCancel className="rounded-xl h-10 text-xs font-semibold border-[#EADBC8]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="rounded-xl h-10 text-xs font-bold bg-[#DC2626] text-white hover:bg-[#B91C1C]"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

export default AdminAppShell
