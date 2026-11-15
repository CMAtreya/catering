import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import {
  LayoutDashboard,
  UtensilsCrossed,
  BookOpen,
  PartyPopper,
  Users,
  LogOut,
} from 'lucide-react'
import { useAdminAuthStore } from '@/store/adminAuthStore'
import { useBusinessSettingsStore } from '@/store/businessSettingsStore'
import { getOrders, subscribeToOrders, getStoredOrdersCount } from '@/api'
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
  title: _title,
  subtitle: _subtitle,
  actions: _actions,
  hideBottomNav: _hideBottomNav = false,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAdminAuthStore((state) => state.user)
  const logout = useAdminAuthStore((state) => state.logout)
  const settings = useBusinessSettingsStore((state) => state.settings)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState<boolean>(false)
  const [ordersCount, setOrdersCount] = useState<number>(() => getStoredOrdersCount())

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
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#EADBC8] shadow-xs select-none print:hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 h-20 flex items-center justify-between gap-4">

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
                  {settings.businessName}
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
              <LayoutDashboard className="w-5 h-5 shrink-0" />
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
              <UtensilsCrossed className="w-5 h-5 shrink-0" />
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
              <BookOpen className="w-5 h-5 shrink-0" />
              <span>Catering Menu</span>
            </Link>

            {/* Feasts */}
            <Link
              to="/admin/feasts"
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                isNavActive('/admin/feasts')
                  ? 'bg-[#8B0A00] text-white shadow-md shadow-[#8B0A00]/25 font-bold'
                  : 'text-[#2D1810] hover:bg-white hover:text-[#8B0A00] border border-transparent hover:border-[#EADBC8]'
              }`}
            >
              <PartyPopper className="w-5 h-5 shrink-0" />
              <span>Feasts</span>
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
              <Users className="w-5 h-5 shrink-0" />
              <span>Customers</span>
            </Link>
          </nav>

          {/* Right: Admin Profile (Opens Settings) & Sign Out */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Admin Profile Pill -> Opens Settings */}
            <Link
              to="/admin/settings"
              title="Open Admin Settings"
              className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition-all cursor-pointer group ${
                isNavActive('/admin/settings')
                  ? 'bg-white border-[#8B0A00] shadow-sm ring-2 ring-[#8B0A00]/20'
                  : 'bg-white/80 border-[#EADBC8] hover:border-[#8B0A00]/50 hover:bg-white shadow-2xs hover:shadow-xs'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#8B0A00]/10 text-[#8B0A00] group-hover:bg-[#8B0A00] group-hover:text-white transition-colors flex items-center justify-center font-bold text-xs">
                AD
              </div>
              <div className="leading-tight text-left">
                <p className="text-xs font-bold text-[#2D1810] group-hover:text-[#8B0A00] transition-colors">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-[10px] text-green-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> Main Mysuru Branch
                </p>
              </div>
            </Link>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={() => setIsLogoutDialogOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-[#8B0A00] hover:bg-red-50 border border-red-200 font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Sub-nav Strip */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-2 border-t border-[#EADBC8]/70 bg-[#FFF9F0]/90">
          <Link to="/admin" className={`flex items-center gap-2 px-2 py-1 rounded ${isNavActive('/admin') ? 'bg-[#8B0A00] text-white' : 'text-[#2D1810]'}`}>Dashboard</Link>
          <Link to="/admin/orders" className={`flex items-center gap-2 px-2 py-1 rounded ${isNavActive('/admin/orders') ? 'bg-[#8B0A00] text-white' : 'text-[#2D1810]'}`}>Orders</Link>
          <Link to="/admin/menu" className={`flex items-center gap-2 px-2 py-1 rounded ${isNavActive('/admin/menu') ? 'bg-[#8B0A00] text-white' : 'text-[#2D1810]'}`}>Menu</Link>
          <Link to="/admin/feasts" className={`flex items-center gap-2 px-2 py-1 rounded ${isNavActive('/admin/feasts') ? 'bg-[#8B0A00] text-white' : 'text-[#2D1810]'}`}>Feasts</Link>
          <Link to="/admin/customers" className={`flex items-center gap-2 px-2 py-1 rounded ${isNavActive('/admin/customers') ? 'bg-[#8B0A00] text-white' : 'text-[#2D1810]'}`}>Customers</Link>
          <Link to="/admin/settings" className={`flex items-center gap-2 px-2 py-1 rounded ${isNavActive('/admin/settings') ? 'bg-[#8B0A00] text-white' : 'text-[#2D1810]'}`}>Settings</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? Any unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsLogoutDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
