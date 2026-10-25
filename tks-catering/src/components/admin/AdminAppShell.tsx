import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ClipboardList, 
  UtensilsCrossed, 
  Users, 
  LogOut, 
  Plus, 
  PlusCircle, 
  ChevronDown
} from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { motion } from 'motion/react'
import { useAdminAuthStore } from '@/store/adminAuthStore'
import { useVisualViewport } from '@/hooks/useVisualViewport'
import { PageTransition } from '@/components/motion/PageTransition'
import { MOTION_SPRINGS } from '@/motion/tokens'
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
}

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
  const { isKeyboardOpen } = useVisualViewport()

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
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans flex flex-col lg:flex-row">
      <Toaster position="bottom-center" richColors />

      {/* 1. Desktop Left Sidebar (from 1024px per spec: "From 1024px the bottom bar becomes a left sidebar with the same items") */}
      <aside className="hidden lg:flex lg:w-64 flex-col bg-white border-r border-slate-200/80 sticky top-0 h-screen select-none z-10 shrink-0">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-xs p-1.5 flex items-center justify-center border border-slate-100">
            <img src="/logo-128.webp" alt="TKS Logo" width="40" height="40" decoding="async" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="font-heading font-black text-sm text-[var(--brand-900)] leading-tight">
              TKS Catering
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] font-medium">Admin Workspace</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {/* Home */}
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-xs transition-all tap-target-48 ${
              isNavActive('/admin')
                ? 'bg-[var(--brand)] text-[var(--on-brand)] shadow-sm'
                : 'text-[var(--text-primary)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-900)]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 stroke-[2.2]" />
            <span>Home</span>
          </Link>

          {/* Orders */}
          <Link
            to="/admin/orders"
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-xs transition-all tap-target-48 ${
              isNavActive('/admin/orders') && location.pathname !== '/admin/orders/new'
                ? 'bg-[var(--brand)] text-[var(--on-brand)] shadow-sm'
                : 'text-[var(--text-primary)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-900)]'
            }`}
          >
            <ClipboardList className="w-4 h-4 shrink-0 stroke-[2.2]" />
            <span>Orders</span>
          </Link>

          {/* New Order prominent button */}
          <div className="py-2">
            <Link
              to="/admin/orders/new"
              className={`w-full py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                location.pathname === '/admin/orders/new'
                  ? 'bg-[var(--brand-900)] text-white'
                  : 'bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[var(--on-brand)]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Order</span>
            </Link>
          </div>

          {/* Menu */}
          <Link
            to="/admin/menu"
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-xs transition-all tap-target-48 ${
              isNavActive('/admin/menu')
                ? 'bg-[var(--brand)] text-[var(--on-brand)] shadow-sm'
                : 'text-[var(--text-primary)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-900)]'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 shrink-0 stroke-[2.2]" />
            <span>Menu</span>
          </Link>

          {/* Customers */}
          <Link
            to="/admin/customers"
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-xs transition-all tap-target-48 ${
              isNavActive('/admin/customers')
                ? 'bg-[var(--brand)] text-[var(--on-brand)] shadow-sm'
                : 'text-[var(--text-primary)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-900)]'
            }`}
          >
            <Users className="w-4 h-4 shrink-0 stroke-[2.2]" />
            <span>Customers</span>
          </Link>
        </nav>

        {/* Staff Profile & Logout */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Avatar className="w-8 h-8 rounded-full border border-slate-200">
              <AvatarFallback className="bg-[var(--brand-soft)] text-[var(--brand-900)] font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                {user?.name || 'Admin Manager'}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">
                {user?.role || 'Operations'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLogoutDialogOpen(true)}
            title="Log out"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors tap-target-48"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </aside>

      {/* 2. Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-8">
        
        {/* Mobile Top Bar (per spec: "on mobile, a glass top bar (logo, 'Admin', avatar menu with Log out)") */}
        <header className="lg:hidden sticky top-0 z-10 glass-top-bar px-4 py-2.5 flex items-center justify-between border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white shadow-xs p-1 flex items-center justify-center border border-slate-100">
              <img src="/logo-128.webp" alt="TKS Logo" width="36" height="36" decoding="async" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-heading font-black text-base text-[var(--brand-900)] leading-none">
                Admin
              </h1>
              <p className="text-[11px] text-[var(--text-muted)] font-medium leading-tight pt-0.5">
                TKS Iyengars Catering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actions}

            {/* Avatar Menu with Log out */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100/80 transition-colors tap-target-48 outline-none"
                  aria-label="Admin Profile Menu"
                >
                  <Avatar className="w-8 h-8 rounded-full border border-[var(--brand-200)] shadow-xs">
                    <AvatarFallback className="bg-[var(--brand-soft)] text-[var(--brand-900)] font-bold text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl">
                <DropdownMenuLabel className="p-2">
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    {user?.name || 'Admin Manager'}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] font-medium">
                    {user?.role || 'Operations & Banquet Director'}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsLogoutDialogOpen(true)}
                  className="text-xs font-bold text-red-600 focus:text-red-700 focus:bg-red-50 p-2 cursor-pointer flex items-center gap-2 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Desktop Top Header (shows title and actions when on desktop) */}
        <header className="hidden lg:flex sticky top-0 z-10 glass-top-bar px-8 py-4 items-center justify-between border-b border-slate-200/80">
          <div>
            <h1 className="font-heading font-black text-xl text-[var(--brand-900)] leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-[var(--text-muted)] font-medium pt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {actions}
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
          <PageTransition direction="admin">
            {children}
          </PageTransition>
        </main>

      </div>

      {/* 3. Mobile Bottom Tab Bar (per spec: "a glass bottom tab bar with Home, Orders, a raised round centre button 'New order', Menu, Customers") */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-20 glass-bottom-bar flex items-center justify-around px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] border-t border-slate-200/80 transition-all duration-200 ${
        isKeyboardOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}>
        
        {/* 1. Home */}
        <Link
          to="/admin"
          className={`relative flex-1 flex flex-col items-center justify-center py-1 transition-all tap-target-48 z-10 ${
            isNavActive('/admin')
              ? 'text-[var(--brand)] font-bold'
              : 'text-slate-500 font-medium hover:text-slate-800'
          }`}
        >
          {isNavActive('/admin') && (
            <motion.div
              layoutId="admin-tab-pill"
              transition={MOTION_SPRINGS.soft}
              className="absolute inset-x-2 inset-y-0.5 rounded-xl bg-[var(--brand-soft)] border border-[var(--brand-200)] -z-10 shadow-xs"
            />
          )}
          <LayoutDashboard className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] pt-1">Home</span>
        </Link>

        {/* 2. Orders */}
        <Link
          to="/admin/orders"
          className={`relative flex-1 flex flex-col items-center justify-center py-1 transition-all tap-target-48 z-10 ${
            isNavActive('/admin/orders') && location.pathname !== '/admin/orders/new'
              ? 'text-[var(--brand)] font-bold'
              : 'text-slate-500 font-medium hover:text-slate-800'
          }`}
        >
          {isNavActive('/admin/orders') && location.pathname !== '/admin/orders/new' && (
            <motion.div
              layoutId="admin-tab-pill"
              transition={MOTION_SPRINGS.soft}
              className="absolute inset-x-2 inset-y-0.5 rounded-xl bg-[var(--brand-soft)] border border-[var(--brand-200)] -z-10 shadow-xs"
            />
          )}
          <ClipboardList className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] pt-1">Orders</span>
        </Link>

        {/* 3. Raised Round Centre Button 'New order' */}
        <div className="flex-1 flex justify-center -mt-7 z-20">
          <Link
            to="/admin/orders/new"
            className="flex flex-col items-center group tap-target-48"
            aria-label="Create New Order"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[var(--on-brand)] shadow-lg shadow-red-900/30 flex items-center justify-center border-4 border-white active:scale-95 transition-transform">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <span className="text-[10px] font-bold text-[var(--brand-900)] mt-0.5">
              New order
            </span>
          </Link>
        </div>

        {/* 4. Menu */}
        <Link
          to="/admin/menu"
          className={`relative flex-1 flex flex-col items-center justify-center py-1 transition-all tap-target-48 z-10 ${
            isNavActive('/admin/menu')
              ? 'text-[var(--brand)] font-bold'
              : 'text-slate-500 font-medium hover:text-slate-800'
          }`}
        >
          {isNavActive('/admin/menu') && (
            <motion.div
              layoutId="admin-tab-pill"
              transition={MOTION_SPRINGS.soft}
              className="absolute inset-x-2 inset-y-0.5 rounded-xl bg-[var(--brand-soft)] border border-[var(--brand-200)] -z-10 shadow-xs"
            />
          )}
          <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] pt-1">Menu</span>
        </Link>

        {/* 5. Customers */}
        <Link
          to="/admin/customers"
          className={`relative flex-1 flex flex-col items-center justify-center py-1 transition-all tap-target-48 z-10 ${
            isNavActive('/admin/customers')
              ? 'text-[var(--brand)] font-bold'
              : 'text-slate-500 font-medium hover:text-slate-800'
          }`}
        >
          {isNavActive('/admin/customers') && (
            <motion.div
              layoutId="admin-tab-pill"
              transition={MOTION_SPRINGS.soft}
              className="absolute inset-x-2 inset-y-0.5 rounded-xl bg-[var(--brand-soft)] border border-[var(--brand-200)] -z-10 shadow-xs"
            />
          )}
          <Users className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] pt-1">Customers</span>
        </Link>

      </nav>

      {/* Log out confirmation dialog per specification */}
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
