import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ClipboardList, 
  UtensilsCrossed, 
  Users, 
  LogOut, 
  Plus, 
  ChevronDown,
  ExternalLink
} from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { useAdminAuthStore } from '@/store/adminAuthStore'
import { PageTransition } from '@/components/motion/PageTransition'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  title: string
  subtitle?: string
  actions?: React.ReactNode
  hideBottomNav?: boolean
}

/**
 * Flagship Top-Navigation Layout for Admin Workspace
 * Completely eliminates side navbar in favor of a full-width, 
 * clean, responsive top navigation bar across all screen sizes.
 */
export const AdminAppShell: React.FC<AdminAppShellProps> = ({
  children,
  title,
  subtitle,
  actions
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAdminAuthStore((state) => state.user)
  const logout = useAdminAuthStore((state) => state.logout)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState<boolean>(false)

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

  // Initials for avatar
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AM'

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans flex flex-col w-full selection:bg-[var(--brand)] selection:text-white">
      <Toaster position="bottom-center" richColors />

      {/* ======================================================== */}
      {/* 1. TOP NAVIGATION BAR (NO SIDE NAVBAR AT ALL)            */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs select-none">
        
        {/* Top Main Navigation Row */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs p-1 flex items-center justify-center border border-slate-200/80 group-hover:scale-105 transition-transform">
                <img src="/logo-128.webp" alt="TKS Logo" width="40" height="40" decoding="async" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-black text-sm sm:text-base text-[var(--brand-900)] leading-none">
                    TKS Catering
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[var(--brand)] text-white font-sans">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-tight pt-0.5 hidden sm:block">
                  Mysuru Banquet Management
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links (Top Navbar) */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isNavActive('/admin')
                  ? 'bg-[var(--brand)] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 stroke-[2.2]" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/admin/orders"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isNavActive('/admin/orders') && location.pathname !== '/admin/orders/new'
                  ? 'bg-[var(--brand)] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4 stroke-[2.2]" />
              <span>Orders</span>
            </Link>

            <Link
              to="/admin/menu"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isNavActive('/admin/menu')
                  ? 'bg-[var(--brand)] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 stroke-[2.2]" />
              <span>Menu Dishes</span>
            </Link>

            <Link
              to="/admin/customers"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isNavActive('/admin/customers')
                  ? 'bg-[var(--brand)] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 stroke-[2.2]" />
              <span>Customers CRM</span>
            </Link>
          </nav>

          {/* Right: Actions, New Order Button, User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* '+ New Order' CTA button */}
            <Link
              to="/admin/orders/new"
              className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-[var(--brand)] to-[var(--brand-700)] hover:brightness-110 active:scale-95 text-white font-heading font-black text-xs flex items-center gap-1.5 shadow-xs transition-all select-none"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New Order</span>
            </Link>

            {/* User Profile Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 p-1 pl-1.5 rounded-xl border border-slate-200/90 hover:bg-slate-100/80 transition-colors tap-target-48 outline-none cursor-pointer"
                  aria-label="Admin Profile Menu"
                >
                  <Avatar className="w-7 h-7 rounded-lg border border-[var(--brand-200)] shadow-2xs">
                    <AvatarFallback className="bg-[var(--brand-soft)] text-[var(--brand-900)] font-black text-[11px]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-bold text-slate-700 hidden lg:inline max-w-[120px] truncate">
                    {user?.name || 'Admin'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 p-1.5 rounded-2xl shadow-xl border border-slate-200">
                <DropdownMenuLabel className="p-2">
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    {user?.name || 'Admin Manager'}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] font-medium">
                    {user?.role || 'Operations & Banquet Director'}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/"
                    target="_blank"
                    className="text-xs font-medium text-slate-700 hover:text-[var(--brand)] p-2 cursor-pointer flex items-center justify-between rounded-xl"
                  >
                    <span>Customer Storefront</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsLogoutDialogOpen(true)}
                  className="text-xs font-bold text-red-600 focus:text-red-700 focus:bg-red-50 p-2 cursor-pointer flex items-center gap-2 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile/Tablet Horizontal Sub-nav Strip */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-1.5 border-t border-slate-100 bg-slate-50/80">
          <Link
            to="/admin"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              isNavActive('/admin')
                ? 'bg-[var(--brand)] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/60'
          }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/orders"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              isNavActive('/admin/orders') && location.pathname !== '/admin/orders/new'
                ? 'bg-[var(--brand)] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/60'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Orders</span>
          </Link>

          <Link
            to="/admin/menu"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              isNavActive('/admin/menu')
                ? 'bg-[var(--brand)] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/60'
          }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Menu</span>
          </Link>

          <Link
            to="/admin/customers"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              isNavActive('/admin/customers')
                ? 'bg-[var(--brand)] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customers</span>
          </Link>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. CONTEXTUAL PAGE HEADER (Title, Subtitle & Actions)    */}
      {/* ======================================================== */}
      {(title || actions) && (
        <section className="w-full bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 shrink-0 shadow-2xs">
          <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="font-heading font-black text-lg sm:text-xl text-[var(--brand-900)] leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-[var(--text-muted)] font-medium pt-0.5">
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

      {/* ======================================================== */}
      {/* 3. MAIN FULL-WIDTH CONTENT VIEWPORT                      */}
      {/* ======================================================== */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        <PageTransition direction="admin">
          {children}
        </PageTransition>
      </main>

      {/* ======================================================== */}
      {/* 4. LOG OUT CONFIRMATION MODAL                            */}
      {/* ======================================================== */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent className="rounded-[20px] max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-black text-base text-[var(--brand-900)]">
              Log out
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[var(--text-muted)] leading-relaxed">
              Are you sure you want to log out of the admin workspace?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2 flex items-center gap-2">
            <AlertDialogCancel className="rounded-full h-10 text-xs font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="rounded-full h-10 text-xs font-bold bg-[var(--status-cancelled-text)] text-white hover:bg-[var(--status-cancelled-text)]/90"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

export default AdminAppShell
