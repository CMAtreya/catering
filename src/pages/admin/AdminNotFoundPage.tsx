import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, Home, ShoppingBag } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/AdminAppShell'

export const AdminNotFoundPage: React.FC = () => {
  return (
    <AdminAppShell title="Page Not Found" subtitle="Unrecognized administrative route">
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 text-center space-y-5">
          {/* 404 Badge */}
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 text-[var(--brand)] flex items-center justify-center mx-auto shadow-xs select-none">
            <FileQuestion className="w-8 h-8 text-[var(--brand)]" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[var(--brand)]">
              Error 404
            </span>
            <h1 className="font-heading font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
              Admin Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              The administrative screen, menu section, or booking record you requested does not exist or may have been moved.
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              to="/admin"
              className="w-full sm:w-auto h-11 px-5 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white font-heading font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all inline-flex items-center justify-center gap-2 tap-target-48 sm:tap-target-auto"
            >
              <Home className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>

            <Link
              to="/admin/orders"
              className="w-full sm:w-auto h-11 px-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors tap-target-48 sm:tap-target-auto"
            >
              <ShoppingBag className="w-4 h-4 text-slate-500" />
              <span>All Orders</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminAppShell>
  )
}

export default AdminNotFoundPage
