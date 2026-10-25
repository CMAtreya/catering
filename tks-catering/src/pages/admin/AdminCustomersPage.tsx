import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronRight, Clock, Users, Phone, Calendar, ExternalLink, MapPin } from 'lucide-react'
import { getCustomers, getOrders } from '@/api'
import type { CustomerRecord, Order } from '@/data/mockData'
import { AdminAppShell } from '@/components/admin/AdminAppShell'
import { CustomerListSkeleton } from '@/components/admin/AdminSkeletons'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'
import { StatusChip } from '@/components/admin/StatusChip'
import { SourceChip } from '@/components/admin/SourceChip'
import { formatContactDate, formatEventDate, formatRupees } from '@/lib/format'

export const AdminCustomersPage: React.FC = () => {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    Promise.all([getCustomers(), getOrders()]).then(([custList, ordList]) => {
      if (isMounted) {
        // Sorted by last contacted, newest first per spec
        const sorted = [...custList].sort((a, b) => b.lastContacted.localeCompare(a.lastContacted))
        setCustomers(sorted)
        setOrders(ordList)
        setIsLoading(false)
      }
    }).catch((err) => {
      console.error('Failed to load customers data:', err)
      if (isMounted) setIsLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [])

  // Helper to get 2 initials from name
  const getInitials = (name: string): string => {
    if (!name) return 'C'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // Selected customer for right pane on 1024px+
  const selectedCustomer = useMemo(() => {
    if (selectedPhone) {
      const found = customers.find((c) => c.phone.replace(/\D/g, '') === selectedPhone.replace(/\D/g, ''))
      if (found) return found
    }
    return customers[0] || null
  }, [customers, selectedPhone])

  // Orders for selected customer
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return []
    const clean = selectedCustomer.phone.replace(/\D/g, '').slice(-10)
    return orders.filter((o) => o.customerPhone.replace(/\D/g, '').includes(clean))
  }, [orders, selectedCustomer])

  return (
    <AdminAppShell 
      title="Customers" 
      subtitle="Lightweight customer relationship directory"
    >
      <div className="space-y-6 pb-28">

        {/* ======================================================== */}
        {/* GLASS LARGE-TITLE HEADER 'Customers'                     */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-[var(--brand-900)] tracking-tight">
              Customers
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-medium pt-0.5">
              {customers.length} contacts • Keyed by mobile number
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200/70 text-[var(--brand)] flex items-center justify-center font-bold">
            <Users className="w-5 h-5 text-[var(--brand)]" />
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && <CustomerListSkeleton count={5} />}

        {/* ======================================================== */}
        {/* TWO-PANE LAYOUT FROM 1024px: Customer List + Inspector   */}
        {/* ======================================================== */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Pane: Customer List (Cards on mobile, dense table-like list on desktop) */}
            <div className="col-span-12 lg:col-span-5 space-y-3 min-w-0">
              
              {/* Mobile View (< 1024px): Cards */}
              <div className="lg:hidden space-y-3">
                {customers.map((c) => {
                  const initials = getInitials(c.name)
                  const cleanMobile = c.phone.replace(/^\+91/, '').replace(/\D/g, '')

                  return (
                    <div
                      key={c.phone}
                      onClick={() => navigate(`/admin/customers/${cleanMobile}`)}
                      className="group content-card p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between gap-3.5 tap-target-48 active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Initials Avatar */}
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200/80 border border-amber-300/50 text-[var(--brand-900)] font-heading font-black text-sm flex items-center justify-center shrink-0 shadow-2xs select-none">
                          {initials}
                        </div>

                        {/* Customer Info */}
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-heading font-black text-sm text-slate-900 group-hover:text-[var(--brand)] transition-colors truncate">
                              {c.name}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                              +91 {cleanMobile}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                              {c.enquiryCount} enq
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                              {c.confirmedCount} ord
                            </span>
                          </div>

                          <p className="text-xs text-[var(--text-muted)] font-medium flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Last contacted {formatContactDate(c.lastContacted)}</span>
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[var(--brand)] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  )
                })}
              </div>

              {/* Desktop View (>= 1024px): Dense table-like list */}
              <div className="hidden lg:block bg-white rounded-[20px] border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-3.5 py-2.5 bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  <div className="col-span-5 truncate">Customer</div>
                  <div className="col-span-3 text-center truncate">Mobile</div>
                  <div className="col-span-4 text-right truncate">History / Contact</div>
                </div>

                <div className="divide-y divide-slate-100 max-h-[calc(100vh-220px)] overflow-y-auto">
                  {customers.map((c) => {
                    const initials = getInitials(c.name)
                    const cleanMobile = c.phone.replace(/^\+91/, '').replace(/\D/g, '')
                    const isSelected = selectedCustomer?.phone === c.phone

                    return (
                      <button
                        key={c.phone}
                        type="button"
                        onClick={() => setSelectedPhone(cleanMobile)}
                        className={`w-full text-left grid grid-cols-12 gap-2 px-3.5 py-3 items-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/70 border-l-4 border-l-[var(--brand)] text-slate-900'
                            : 'hover:bg-slate-50/80 text-slate-700'
                        }`}
                      >
                        <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-[var(--brand-900)] font-heading font-black text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-heading font-bold text-xs text-[var(--brand-900)] truncate">
                              {c.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {c.enquiryCount} enq • {c.confirmedCount} ord
                            </p>
                          </div>
                        </div>

                        <div className="col-span-3 text-center min-w-0">
                          <span className="text-xs font-semibold text-slate-600 truncate block">
                            +91 {cleanMobile}
                          </span>
                        </div>

                        <div className="col-span-4 text-right min-w-0">
                          <span className="text-[11px] font-bold text-slate-800 truncate block">
                            {formatContactDate(c.lastContacted)}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            {c.confirmedCount > 0 ? `${c.confirmedCount} confirmed` : 'Prospect'}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {customers.length === 0 && (
                <AdminEmptyState variant="customers" />
              )}
            </div>

            {/* Right Pane: Selected Customer Profile Inspector (hidden lg:block lg:col-span-7 sticky top-24) */}
            {selectedCustomer && (
              <div className="hidden lg:block lg:col-span-7 sticky top-24 min-w-0">
                <div className="content-card p-6 rounded-[24px] bg-white border border-slate-200/90 shadow-md space-y-5">
                  
                  {/* Customer Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200/80 border border-amber-300/50 text-[var(--brand-900)] font-heading font-black text-xl flex items-center justify-center shrink-0 shadow-2xs select-none">
                        {getInitials(selectedCustomer.name)}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <h2 className="font-heading font-black text-xl text-[var(--brand-900)] truncate">
                          {selectedCustomer.name}
                        </h2>
                        <p className="text-xs font-semibold text-slate-500">
                          Mobile: <strong className="text-slate-800">{selectedCustomer.phone}</strong>
                        </p>
                        {selectedCustomer.address && (
                          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 pt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
                            <span className="truncate">{selectedCustomer.address}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="h-10 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0"
                      title={`Call ${selectedCustomer.phone}`}
                    >
                      <Phone className="w-3.5 h-3.5 fill-white" />
                      <span>Call</span>
                    </a>
                  </div>

                  {/* Two Stats Tiles: Total Enquiries & Confirmed Orders */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-left">
                      <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                        Total Enquiries
                      </span>
                      <span className="font-heading font-black text-2xl text-amber-950 mt-1 block">
                        {selectedCustomer.enquiryCount}
                      </span>
                      <span className="text-[10px] font-medium text-amber-700">Phone & online inquiries</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-left">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                        Confirmed Orders
                      </span>
                      <span className="font-heading font-black text-2xl text-emerald-950 mt-1 block">
                        {selectedCustomer.confirmedCount}
                      </span>
                      <span className="text-[10px] font-medium text-emerald-700">Banquets contracted</span>
                    </div>
                  </div>

                  {/* Customer Timeline Header */}
                  <div>
                    <div className="flex items-center justify-between pb-2">
                      <h3 className="font-heading font-black text-sm text-[var(--brand-900)]">
                        Enquiries & Banquets History
                      </h3>
                      <span className="text-xs text-[var(--text-muted)] font-medium">
                        {customerOrders.length} events
                      </span>
                    </div>

                    {/* Timeline List */}
                    <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1">
                      {customerOrders.length > 0 ? (
                        customerOrders.map((ord) => (
                          <Link
                            key={ord.id}
                            to={`/admin/orders/${ord.id}`}
                            className="block p-3 rounded-xl border border-slate-100 hover:border-[var(--brand-300)] hover:bg-slate-50/50 transition-all text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{ord.eventType}</span>
                                <SourceChip source={ord.source} size="sm" />
                              </div>
                              <StatusChip status={ord.status} size="sm" />
                            </div>

                            <div className="flex items-center justify-between text-slate-500 text-[11px]">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[var(--brand)]" />
                                <span>{formatEventDate(ord.eventDate)}</span>
                              </span>
                              <span className="font-bold text-[var(--brand-900)]">
                                {formatRupees(ord.totalAmount)}
                              </span>
                            </div>

                            {ord.enquiryNotes && (
                              <p className="text-[11px] text-slate-600 bg-slate-100/70 p-1.5 rounded-lg italic">
                                "{ord.enquiryNotes}"
                              </p>
                            )}
                          </Link>
                        ))
                      ) : (
                        <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                          No order history linked to this number yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                      to={`/admin/customers/${selectedCustomer.phone.replace(/^\+91/, '').replace(/\D/g, '')}`}
                      className="flex-1 h-11 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[var(--on-brand)] font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
                    >
                      <span>Open Customer CRM Profile</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </AdminAppShell>
  )
}

export default AdminCustomersPage
