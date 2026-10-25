import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Building2, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  FileText, 
  HeartPulse, 
  Sparkles, 
  MapPin, 
  Award,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export const AppFooter: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'allergies' | 'hygiene' | null>(null)

  return (
    <footer 
      role="contentinfo" 
      aria-label="TKS Catering corporate and legal footer"
      className="w-full bg-white border-t border-slate-200/80 pt-10 sm:pt-12 pb-36 lg:pb-16 px-4 sm:px-6 lg:px-8 mt-auto relative z-10 selection:bg-[var(--brand)] selection:text-white"
    >
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ========================================================== */}
        {/* TOP ROW: BRAND IDENTITY & FSSAI CERTIFICATION BADGE        */}
        {/* ========================================================== */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-slate-100">
          
          {/* 1. BRAND NAME & 2. LEGAL NAME */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm p-1.5 flex items-center justify-center border border-slate-200/90 shrink-0">
              <img 
                src="/logo-128.webp" 
                alt="TKS Iyengars Mysore Catering Logo" 
                width="48" 
                height="48" 
                decoding="async" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="space-y-1">
              {/* Item 1: Brand Name */}
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-heading font-black text-lg sm:text-xl text-[var(--brand-900)] tracking-tight">
                  TKS Iyengars Mysore Catering
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-900 text-[10px] font-bold tracking-wide uppercase">
                  Est. 1998
                </span>
              </div>

              {/* Item 2: Legal Name */}
              <p className="text-xs text-slate-700 font-semibold">
                Legal Entity: <span className="text-[var(--brand-900)]">TKS Catering Services Private Limited</span>
              </p>
              
              <p className="text-[11px] text-[var(--text-muted)] font-medium">
                Authentic South Indian Pure Vegetarian Banquet Heritage • Mysuru & Bengaluru
              </p>
            </div>
          </div>

          {/* 7. FSSAI LICENSE / REGISTRATION NUMBER BADGE */}
          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/70 border border-emerald-200/90 shadow-2xs max-w-md w-full lg:w-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Award className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="space-y-0.5 text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-1.5 py-0.2 rounded">
                  FSSAI Certified
                </span>
                <span className="text-[11px] font-bold text-emerald-950">
                  Food Safety Lic. No:
                </span>
              </div>
              <p className="font-heading font-black text-sm text-emerald-900 tracking-wider">
                11223344556677
              </p>
              <p className="text-[10px] text-emerald-700 font-medium">
                100% Pure Vegetarian Certified Facility (Schedule 4 Compliant)
              </p>
            </div>
          </div>

        </div>

        {/* ========================================================== */}
        {/* MIDDLE GRID: 4 COLUMNS OF DETAILED INFORMATION              */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
          
          {/* COLUMN 1: 3. REGISTERED OFFICE ADDRESS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[var(--brand-900)]">
              <Building2 className="w-4 h-4 text-[var(--brand)] shrink-0" />
              <h3 className="font-heading font-bold text-sm tracking-tight">
                Registered Office Address
              </h3>
            </div>
            <div className="space-y-2 text-slate-600 leading-relaxed text-[11.5px]">
              <p className="font-medium text-slate-800">
                <strong>TKS Catering Services Pvt. Ltd.</strong>
              </p>
              <p>
                Shop 14, 5th Main Road,<br />
                Vani Vilas Mohalla, Mysuru,<br />
                Karnataka 570002, India
              </p>
              <div className="pt-1.5 text-slate-500 border-t border-slate-100 space-y-1">
                <p className="font-bold text-[11px] text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Central Kitchen & Tasting Studio:</span>
                </p>
                <p>142/A, Krishnamurthy Puram, Mysuru, Karnataka 570004</p>
              </div>
            </div>
          </div>

          {/* COLUMN 2: 4. CONTACT NUMBER & 5. BUSINESS EMAIL */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[var(--brand-900)]">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="font-heading font-bold text-sm tracking-tight">
                Contact & Inquiries
              </h3>
            </div>
            
            <div className="space-y-3 text-[11.5px]">
              {/* Contact Number */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                  Direct Reservations Desk
                </span>
                <a 
                  href="tel:+919000000000"
                  className="font-heading font-bold text-sm text-[var(--brand-900)] hover:text-[var(--brand)] transition-colors flex items-center gap-1.5"
                >
                  <span>+91 90000 00000</span>
                </a>
                <p className="text-[11px] text-slate-500">
                  Instant call & WhatsApp coordination
                </p>
              </div>

              {/* Business Email */}
              <div className="space-y-1 pt-1 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                  Official Business Email
                </span>
                <a 
                  href="mailto:orders@tksiyengarscatering.com"
                  className="font-semibold text-slate-800 hover:text-[var(--brand)] transition-colors flex items-center gap-1.5 truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">orders@tksiyengarscatering.com</span>
                </a>
                <p className="text-[10px] text-slate-500">
                  Catering proposals, invoices & banquets
                </p>
              </div>
            </div>
          </div>

          {/* COLUMN 3: 6. BUSINESS HOURS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[var(--brand-900)]">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <h3 className="font-heading font-bold text-sm tracking-tight">
                Business Hours
              </h3>
            </div>
            
            <div className="space-y-2 text-[11.5px] text-slate-600 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800 block text-xs">
                  Consultation & Booking Desk:
                </span>
                <p className="text-[var(--brand-900)] font-bold">
                  Monday – Sunday: 8:00 AM – 9:00 PM IST
                </p>
                <p className="text-[10px] text-slate-500">
                  Open 365 days a year for wedding consultations
                </p>
              </div>

              <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                <p className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>24/7 Banquet Event Dispatch</span>
                </p>
                <p>
                  Kitchen active at auspicious early morning muhurthams for confirmed bookings.
                </p>
              </div>
            </div>
          </div>

          {/* COLUMN 4: 8, 9, 10. LEGAL, DIETARY & FOOD SAFETY PAGES */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[var(--brand-900)]">
              <ShieldCheck className="w-4 h-4 text-[var(--brand)] shrink-0" />
              <h3 className="font-heading font-bold text-sm tracking-tight">
                Policy & Food Governance
              </h3>
            </div>
            
            <nav aria-label="Legal and safety links" className="space-y-2 text-[12px]">
              
              {/* Item 8: Privacy Policy */}
              <div className="group flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                <Link
                  to="/privacy-policy"
                  className="font-bold text-slate-800 hover:text-[var(--brand)] flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-[var(--brand)]" />
                  <span>Privacy Policy</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="text-[10px] text-slate-400 hover:text-slate-700 underline font-medium px-1.5 py-0.5 cursor-pointer"
                  title="Quick preview without leaving page"
                >
                  Quick view
                </button>
              </div>

              {/* Item 9: Food Allergies and Dietary Information */}
              <div className="group flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                <Link
                  to="/allergy-dietary-info"
                  className="font-bold text-slate-800 hover:text-[var(--brand)] flex items-center gap-2 transition-colors"
                >
                  <HeartPulse className="w-3.5 h-3.5 text-amber-600 group-hover:text-[var(--brand)]" />
                  <span className="leading-snug">Food Allergies & Dietary Info</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveModal('allergies')}
                  className="text-[10px] text-slate-400 hover:text-slate-700 underline font-medium px-1.5 py-0.5 cursor-pointer"
                  title="Quick preview without leaving page"
                >
                  Quick view
                </button>
              </div>

              {/* Item 10: Hygiene and Food Safety Information */}
              <div className="group flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                <Link
                  to="/food-safety"
                  className="font-bold text-slate-800 hover:text-[var(--brand)] flex items-center gap-2 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 group-hover:text-[var(--brand)]" />
                  <span className="leading-snug">Hygiene & Food Safety</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveModal('hygiene')}
                  className="text-[10px] text-slate-400 hover:text-slate-700 underline font-medium px-1.5 py-0.5 cursor-pointer"
                  title="Quick preview without leaving page"
                >
                  Quick view
                </button>
              </div>

            </nav>
          </div>

        </div>

        {/* ========================================================== */}
        {/* BOTTOM COPYRIGHT & STATUTORY SUMMARY BAR                   */}
        {/* ========================================================== */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[var(--text-muted)] font-medium text-center md:text-left">
          
          <div className="space-y-0.5">
            <p>
              © {new Date().getFullYear()} <strong>TKS Catering Services Private Limited</strong>. All rights reserved.
            </p>
            <p className="text-[10px] text-slate-400">
              GSTIN: 29ABCDE1234F1Z5 • FSSAI Lic. No: 11223344556677 • Registered in Mysuru, Karnataka, India
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>100% Pure South Indian Vegetarian</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">
              Satvik & No Onion/Garlic Traditional Specialists
            </span>
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* QUICK VIEW MODALS (Lets user read without losing cart state)  */}
      {/* ============================================================ */}
      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-7">
          
          {/* Modal Content: Privacy Policy */}
          {activeModal === 'privacy' && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold w-fit mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>TKS Catering Services Pvt. Ltd.</span>
                </div>
                <DialogTitle className="font-heading font-black text-xl text-[var(--brand-900)]">
                  Privacy Policy Overview
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Summary of our customer confidentiality and non-disclosure standards.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong>Entity:</strong> TKS Catering Services Private Limited (Shop 14, 5th Main Road, Vani Vilas Mohalla, Mysuru 570002).
                </p>
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs">
                  <strong>Zero Third-Party Advertising:</strong> We never sell, rent, or distribute your mobile number or event dates to external telemarketers, banquet brokers, or advertising networks.
                </div>
                <p>
                  <strong>Data Utilization:</strong> We collect customer names, phone numbers, and banquet venues strictly to generate quotations, prepare kitchen capacity, dispatch catering staff, and produce GST tax invoices.
                </p>
                <p>
                  <strong>Inquiries:</strong> Email <a href="mailto:orders@tksiyengarscatering.com" className="text-[var(--brand)] font-bold hover:underline">orders@tksiyengarscatering.com</a> or phone <a href="tel:+919000000000" className="font-bold text-slate-800 hover:underline">+91 90000 00000</a>.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link 
                  to="/privacy-policy" 
                  onClick={() => setActiveModal(null)}
                  className="text-xs font-bold text-[var(--brand)] hover:underline inline-flex items-center gap-1"
                >
                  <span>Open full policy page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Modal Content: Food Allergies and Dietary Information */}
          {activeModal === 'allergies' && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold w-fit mb-1">
                  <HeartPulse className="w-3.5 h-3.5 text-amber-700" />
                  <span>Consumer Health & Allergen Notice</span>
                </div>
                <DialogTitle className="font-heading font-black text-xl text-[var(--brand-900)]">
                  Food Allergies & Dietary Advisory
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Semi-legal advisory on kitchen practices, allergens, and guest safety.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 text-xs">
                  <strong>100% Pure Vegetarian & Satvik:</strong> Strictly zero meat, seafood, poultry, eggs, or gelatin. By default, all banquet items are cooked without onion and garlic.
                </div>
                <div className="space-y-1.5">
                  <p className="font-bold text-slate-800">Key Allergen Considerations:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                    <li><strong>Dairy:</strong> Pure cow ghee, milk, curd, and paneer are widely used.</li>
                    <li><strong>Nuts:</strong> Cashews, almonds, and peanuts are present in sweets (Mysore Pak, Halwa) and festive rice.</li>
                    <li><strong>Gluten:</strong> Wheat/Maida present in Poori, Chiroti, Rava Kesari.</li>
                    <li><strong>Mustard & Sesame:</strong> Present in traditional South Indian tempering.</li>
                  </ul>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 inline mr-1" />
                  <strong>Host Responsibility:</strong> The client is requested to notify us in writing at least 48 hours prior to the muhurtham regarding any acute allergies among guests.
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link 
                  to="/allergy-dietary-info" 
                  onClick={() => setActiveModal(null)}
                  className="text-xs font-bold text-[var(--brand)] hover:underline inline-flex items-center gap-1"
                >
                  <span>Open full dietary page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Modal Content: Hygiene and Food Safety */}
          {activeModal === 'hygiene' && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold w-fit mb-1">
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  <span>FSSAI Lic. No: 11223344556677</span>
                </div>
                <DialogTitle className="font-heading font-black text-xl text-[var(--brand-900)]">
                  Hygiene & Food Safety Standards
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Schedule 4 sanitation, temperature control, and water purity assurance.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <strong className="block text-[var(--brand-900)]">RO + UV Water</strong>
                    100% commercial reverse osmosis & UV sterilization for all cooking.
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <strong className="block text-[var(--brand-900)]">Thermal Chain</strong>
                    Hot foods maintained &gt;65°C in insulated stainless steel vessels.
                  </div>
                </div>
                <div className="space-y-1">
                  <p><strong>Staff Hygiene:</strong> Mandatory chef coats, hairnets, disposable nitrile gloves for plating, and routine medical health certificates.</p>
                  <p><strong>Banana Leaf Sanitization:</strong> Fresh plantain dining leaves are steam-washed and inspected prior to table service.</p>
                  <p><strong>Zero Additives:</strong> Zero artificial coloring, zero MSG (ajinomoto), zero chemical preservatives.</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link 
                  to="/food-safety" 
                  onClick={() => setActiveModal(null)}
                  className="text-xs font-bold text-[var(--brand)] hover:underline inline-flex items-center gap-1"
                >
                  <span>Open full safety page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </footer>
  )
}

export default AppFooter
