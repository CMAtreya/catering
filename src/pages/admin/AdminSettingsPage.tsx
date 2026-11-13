import React, { useState } from 'react'
import {
  Building2,
  Phone,
  MapPin,
  Receipt,
  Save,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { AdminAppShell } from '@/components/admin/AdminAppShell'
import {
  useBusinessSettingsStore,
  type BusinessSettings,
  DEFAULT_BUSINESS_SETTINGS
} from '@/store/businessSettingsStore'

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToDefaults, syncFromBackend } = useBusinessSettingsStore()

  // Local form state
  const [formData, setFormData] = useState<BusinessSettings>({ ...settings })
  const [isSaved, setIsSaved] = useState(false)

  // Sync latest business settings from backend on mount
  React.useEffect(() => {
    syncFromBackend().then(() => {
      setFormData(useBusinessSettingsStore.getState().settings)
    })
  }, [syncFromBackend])

  const handleChange = (field: keyof BusinessSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsSaved(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings(formData)
    setIsSaved(true)
    toast.success('Business settings updated successfully!', {
      description: 'Changes are now live across all customer pages, invoices, and footers.'
    })
  }

  const handleReset = () => {
    if (window.confirm('Reset all business and tax credentials to default Mysuru Heritage settings?')) {
      resetToDefaults()
      setFormData({ ...DEFAULT_BUSINESS_SETTINGS })
      setIsSaved(true)
      toast.success('Settings restored to defaults!')
    }
  }

  return (
    <AdminAppShell>
      <div className="w-full px-3 sm:px-6 lg:px-8 2xl:px-12 py-5 space-y-6">

        {/* ========================================================
             1. TOP SHELL BAR (Namaskara, Live Pulse, Date)
             ======================================================== */}
        <header className="w-full bg-white/90 backdrop-blur-md rounded-2xl border border-outline-variant/60 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                  Namaskara
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Website &amp; Invoice Synchronization Active
                </span>
              </div>
              <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>{format(new Date(), 'EEEE, d MMMM yyyy')} • Administrative Settings Console</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end lg:self-auto">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#785A48] bg-white border border-[#EADBC8] hover:bg-[#F7EFE2] transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Restore Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
              style={{ background: 'linear-gradient(90deg, #8B0A00 0%, #E0000F 50%, #8B0A00 100%)' }}
            >
              <Save className="w-4 h-4 shrink-0" />
              <span>Save &amp; Apply Changes</span>
            </button>
          </div>
        </header>

        {/* ========================================================
             2. TITLE & OVERVIEW
             ======================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
              <Building2 className="w-7 h-7 text-primary" />
              <span>Organization &amp; Brand Settings</span>
            </h2>
            <p className="text-sm text-on-surface-variant font-medium mt-0.5">
              Update the official business name, addresses, telephone hotlines, and GSTIN. Changes update customer navigation, tax invoices, and contact footers instantly.
            </p>
          </div>
          {isSaved && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All updates live on website</span>
            </div>
          )}
        </div>

        {/* ========================================================
             3. SETTINGS FORM (Two-Column Layout)
             ======================================================== */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2 Columns: Editable Form Cards */}
          <div className="lg:col-span-2 space-y-6">

            {/* SECTION 1: Brand & Organization Identity */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-outline-variant/60 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/40">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2D1810]">
                    Brand &amp; Legal Identity
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Appears across website headers, customer navigation, and quotation slips
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#2D1810] mb-1">
                    Catering Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    placeholder="e.g. TKS Iyengar's Catering"
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/70 rounded-xl font-semibold text-sm text-[#2D1810] focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">Displayed in website header &amp; customer catalogue</p>
                </div>

                <div>
                  <label className="block font-bold text-[#2D1810] mb-1">
                    Registered Company Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyLegalName}
                    onChange={(e) => handleChange('companyLegalName', e.target.value)}
                    placeholder="e.g. TKS Catering Services Pvt. Ltd."
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/70 rounded-xl font-semibold text-sm text-[#2D1810] focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">Appears on official GST tax invoices &amp; legal terms</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1810] mb-1">
                  Brand Tagline / Specialty Description
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  placeholder="e.g. Authentic Mysuru Brahmin Heritage Catering"
                  className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/70 rounded-xl text-xs text-[#2D1810] focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
              </div>
            </div>

            {/* SECTION 2: Official Contact Numbers & Channels */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-outline-variant/60 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/40">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2D1810]">
                    Telephone Numbers &amp; Channels
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Used for one-click calling, WhatsApp coordination, and customer enquiries
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#2D1810] mb-1">
                    Booking Desk / Landline Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="e.g. 0821-2448920"
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/70 rounded-xl font-semibold text-sm text-[#2D1810] focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">Displayed in website header &amp; admin hotline bar</p>
                </div>

                <div>
                  <label className="block font-bold text-[#2D1810] mb-1">
                    Mobile &amp; WhatsApp Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    placeholder="e.g. +91 98450 12345"
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/70 rounded-xl font-semibold text-sm text-[#2D1810] focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">Used for 1-tap WhatsApp banquet estimation inquiries</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1810] mb-1">
                  Official Business Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="e.g. orders@tksiyengarscatering.com"
                  className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/70 rounded-xl text-xs text-[#2D1810] focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
              </div>
            </div>

            {/* SECTION 3: Operating Addresses */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-outline-variant/60 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/40">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2D1810]">
                    Registered &amp; Kitchen Addresses
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Printed on invoice letterheads and website footer contact blocks
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#2D1810] mb-1">
                    Primary Office / Registered Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="e.g. Shop 14, 5th Main Road, Vani Vilas Mohalla, Mysuru, Karnataka 570002"
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/70 rounded-xl font-medium text-xs sm:text-sm text-[#2D1810] focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2D1810] mb-1">
                    Central Kitchen &amp; Tasting Studio Address
                  </label>
                  <textarea
                    rows={2}
                    value={formData.kitchenAddress}
                    onChange={(e) => handleChange('kitchenAddress', e.target.value)}
                    placeholder="e.g. 142/A, Krishnamurthy Puram, Mysuru, Karnataka 570004"
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/70 rounded-xl font-medium text-xs sm:text-sm text-[#2D1810] focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: Tax & Regulatory Credentials */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-outline-variant/60 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/40">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2D1810]">
                    GSTIN &amp; Regulatory Credentials
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Crucial for automated GST banquet tax calculations and official compliant billing
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#2D1810] mb-1">
                    GSTIN (15-digit GST Identification Number) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={formData.gstin}
                    onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                    placeholder="e.g. 29ABCDE1234F1Z5"
                    className="w-full px-3.5 py-2.5 font-mono uppercase bg-surface-container-lowest border border-outline-variant/70 rounded-xl font-bold text-sm text-[#2D1810] tracking-wider focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">Printed on tax invoices, bill slips &amp; legal privacy notice</p>
                </div>

                <div>
                  <label className="block font-bold text-[#2D1810] mb-1">
                    FSSAI Food Safety License Number
                  </label>
                  <input
                    type="text"
                    value={formData.fssaiNumber}
                    onChange={(e) => handleChange('fssaiNumber', e.target.value)}
                    placeholder="e.g. 11223344556677"
                    className="w-full px-3.5 py-2.5 font-mono bg-surface-container-lowest border border-outline-variant/70 rounded-xl font-bold text-sm text-[#2D1810] tracking-wider focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">Ensures Sattvic food hygiene certification compliance</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-[#EADBC8] text-[#2D1810] font-bold text-xs hover:bg-[#F7EFE2] transition-colors cursor-pointer"
              >
                Reset to Defaults
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md shadow-primary/20 hover:brightness-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                style={{ background: 'linear-gradient(90deg, #8B0A00 0%, #b30a05 100%)' }}
              >
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </button>
            </div>

          </div>

          {/* Right 1 Column: Live Synchronized Preview Cards */}
          <div className="space-y-6">

            {/* Preview 1: Official Invoice Letterhead Header */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-outline-variant/60 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Live Invoice Preview
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-[11px] space-y-2">
                <div className="border-b border-outline-variant/30 pb-2">
                  <h4 className="font-serif font-bold text-base text-primary leading-tight">
                    {formData.businessName || 'TKS Iyengar’s Catering'}
                  </h4>
                  <p className="text-[10px] text-on-surface-variant font-medium">
                    {formData.companyLegalName}
                  </p>
                </div>
                <div className="space-y-1 text-on-surface-variant text-[11px]">
                  <p className="flex items-start gap-1">
                    <MapPin className="w-3 h-3 text-secondary shrink-0 mt-0.5" />
                    <span>{formData.address}</span>
                  </p>
                  <p className="flex items-center gap-1 font-semibold text-on-surface">
                    <Phone className="w-3 h-3 text-primary shrink-0" />
                    <span>{formData.phone} / {formData.mobile}</span>
                  </p>
                  <p className="flex items-center gap-1 font-mono font-bold text-primary text-[10.5px]">
                    <Receipt className="w-3 h-3 shrink-0" />
                    <span>GSTIN: {formData.gstin || '29ABCDE1234F1Z5'}</span>
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                This letterhead header appears automatically on all generated banquet PDFs, pro-forma invoices, and customer estimation slips.
              </p>
            </div>

            {/* Preview 2: Website Footer Contact Block */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-outline-variant/60 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Footer Preview
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>

              <div className="p-4 rounded-xl bg-[#2D1810] text-white/90 text-[11px] space-y-2">
                <p className="font-bold text-amber-300 text-xs">
                  {formData.businessName}
                </p>
                <p className="text-white/70 text-[10.5px] leading-tight">
                  {formData.address}
                </p>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <span className="text-amber-200 font-mono font-bold">
                    GSTIN: {formData.gstin}
                  </span>
                  <span className="text-white/60">
                    Ph: {formData.phone}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Directly updates the customer-facing footer across all pages of the catering catalogue.
              </p>
            </div>

          </div>

        </form>

      </div>
    </AdminAppShell>
  )
}

export default AdminSettingsPage

