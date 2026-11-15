import React from 'react'
import { Link } from 'react-router-dom'
import {
  FileQuestion,
  LayoutDashboard,
  UtensilsCrossed,
  BookOpen,
  PartyPopper,
  ChevronRight,
  ArrowLeft
} from 'lucide-react'
import { AdminAppShell } from '@/components/admin/AdminAppShell'

export const AdminNotFoundPage: React.FC = () => {
  return (
    <AdminAppShell title="Page Not Found" subtitle="Unrecognized administrative route">
      <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-10 flex items-center justify-center min-h-[70vh]">
        <div className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-[#EADBC8] text-center space-y-6">
          {/* 404 Badge */}
          <div className="relative inline-block mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 text-[#8B0A00] flex items-center justify-center shadow-xs">
              <FileQuestion className="w-10 h-10 stroke-[1.75]" />
            </div>
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-[#8B0A00] text-white shadow-sm border border-amber-200">
              404
            </span>
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100/70 text-amber-900 border border-amber-200/80">
              Admin Route Unresolved
            </span>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#2D1810] tracking-tight">
              Administrative Screen Not Found
            </h1>
            <p className="text-xs sm:text-sm text-[#785A48] max-w-md mx-auto leading-relaxed font-medium">
              The administrative screen, menu configuration, or booking record ID you requested does not exist or may have been archived.
            </p>
          </div>

          {/* Quick Admin Navigation Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
            <Link
              to="/admin"
              className="p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 text-[#8B0A00] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2D1810]">Admin Dashboard</p>
                  <p className="text-[11px] text-[#785A48]">Today&apos;s summary and schedule</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/orders"
              className="p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 text-[#8B0A00] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2D1810]">All Orders</p>
                  <p className="text-[11px] text-[#785A48]">Enquiries &amp; confirmed bookings</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/menu"
              className="p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 text-[#8B0A00] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2D1810]">Catering Menu</p>
                  <p className="text-[11px] text-[#785A48]">Manage dishes and pricing</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/feasts"
              className="p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 text-[#8B0A00] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <PartyPopper className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2D1810]">Feasts Management</p>
                  <p className="text-[11px] text-[#785A48]">Curated banquet packages</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-center">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8B0A00] hover:bg-[#6D0800] text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Operations Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminAppShell>
  )
}

export default AdminNotFoundPage
