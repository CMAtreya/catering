import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  AlertTriangle,
  MessageSquare
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export interface AppFooterProps {
  className?: string
  hasFloatingBar?: boolean
  onTastingModalOpen?: () => void
}

export const AppFooter: React.FC<AppFooterProps> = ({
  className = '',
  hasFloatingBar = false,
  onTastingModalOpen
}) => {
  const navigate = useNavigate()
  const [activeModal, setActiveModal] = useState<'privacy' | 'allergies' | 'hygiene' | null>(null)

  const handleScrollTo = (id: string) => {
    if (window.location.pathname === '/') {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    navigate(`/#${id}`)
  }

  return (
    <footer 
      role="contentinfo" 
      aria-label="TKS Iyengar's Catering corporate and legal footer"
      className={`w-full bg-surface-container-low border-t border-outline-variant/40 pt-12 text-on-surface-variant relative z-0 selection:bg-primary selection:text-white ${
        hasFloatingBar ? 'pb-44 sm:pb-40 lg:pb-20' : 'pb-16'
      } px-4 sm:px-6 lg:px-12 xl:px-16 mt-auto ${className}`}
    >
      <div className="max-w-7xl mx-auto space-y-12">

        {/* ========================================================== */}
        {/* TOP ROW: BRAND IDENTITY & FSSAI CERTIFICATION BADGE        */}
        {/* ========================================================== */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-10 border-b border-outline-variant/30">
          
          {/* 1. BRAND NAME & 2. LEGAL NAME */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface shadow-xs p-2 flex items-center justify-center border border-outline-variant/50 shrink-0">
              <img 
                src="/logo-128.webp" 
                alt="TKS Iyengar's Catering Emblem" 
                width="48" 
                height="48" 
                decoding="async" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="space-y-1">
              {/* Item 1: Brand Name */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-primary tracking-tight">
                  TKS Iyengar's Catering
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-fixed border border-secondary/30 text-[10px] font-bold tracking-wide uppercase">
                  Mysuru Heritage • Estd. 1984
                </span>
              </div>

              {/* Item 2: Legal Name */}
              <p className="text-xs text-on-surface font-semibold flex items-center gap-1.5 flex-wrap">
                <span className="text-outline">Legal Entity:</span> 
                <span className="text-primary font-bold">TKS Catering Services Private Limited</span>
                <span className="text-outline/60 hidden sm:inline">•</span>
                <span className="text-[11px] text-outline font-normal">CIN: U55101KA2020PTC138920</span>
              </p>
              
              <p className="text-[11.5px] text-on-surface-variant font-medium">
                Authentic South Indian Pure Vegetarian Banquet Heritage • Mysuru &amp; Bengaluru
              </p>
            </div>
          </div>

          {/* 7. FSSAI LICENSE OR REGISTRATION NUMBER BADGE */}
          <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-surface border border-secondary/30 shadow-xs max-w-md w-full lg:w-auto">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Award className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="space-y-0.5 text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary-container/40 px-2 py-0.5 rounded">
                  FSSAI Certified
                </span>
                <span className="text-[11px] font-semibold text-on-surface">
                  Food Safety Lic. No:
                </span>
              </div>
              <p className="font-mono font-bold text-sm text-primary tracking-wider">
                11223344556677
              </p>
              <p className="text-[10.5px] text-on-surface-variant font-medium">
                Schedule 4 Compliant • 100% Pure Satvik Vegetarian Facility
              </p>
            </div>
          </div>

        </div>

        {/* ========================================================== */}
        {/* MIDDLE GRID: 4 COLUMNS OF DETAILED INFORMATION              */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 text-xs">
          
          {/* COLUMN 1: 3. REGISTERED OFFICE ADDRESS */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-primary">
              <Building2 className="w-4 h-4 shrink-0 text-primary" />
              <h3 className="font-serif font-bold text-sm sm:text-base tracking-tight text-on-surface">
                Registered Office Address
              </h3>
            </div>
            <div className="space-y-2.5 text-on-surface-variant leading-relaxed text-[11.5px]">
              <div>
                <p className="font-bold text-on-surface">
                  TKS Catering Services Pvt. Ltd.
                </p>
                <p className="text-on-surface-variant">
                  Shop 14, 5th Main Road,<br />
                  Vani Vilas Mohalla, Mysuru,<br />
                  Karnataka 570002, India
                </p>
              </div>

              <div className="pt-2 text-on-surface-variant border-t border-outline-variant/30 space-y-1">
                <p className="font-bold text-[11px] text-on-surface flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span>Central Kitchen &amp; Tasting Studio:</span>
                </p>
                <p className="text-[11px]">
                  142/A, Krishnamurthy Puram, Mysuru, Karnataka 570004
                </p>
              </div>

              <p className="text-[10px] text-outline">
                GSTIN: <span className="font-mono font-semibold text-on-surface">29ABCDE1234F1Z5</span>
              </p>
            </div>
          </div>

          {/* COLUMN 2: 4. CONTACT NUMBER & 5. BUSINESS EMAIL */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-primary">
              <Phone className="w-4 h-4 shrink-0 text-primary" />
              <h3 className="font-serif font-bold text-sm sm:text-base tracking-tight text-on-surface">
                Direct Contact &amp; Desk
              </h3>
            </div>
            
            <div className="space-y-3.5 text-[11.5px]">
              {/* Item 4: Contact Number */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">
                  Kitchen &amp; Banquet Reservations Desk
                </span>
                <div className="space-y-1">
                  <a 
                    href="tel:+918212448920"
                    className="font-semibold text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
                  >
                    <span>+91 821 244 8920</span>
                    <span className="text-[10px] text-outline font-normal">(Desk)</span>
                  </a>
                  <a 
                    href="tel:+919845012345"
                    className="font-semibold text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
                  >
                    <span>+91 98450 12345</span>
                    <span className="text-[10px] text-outline font-normal">(Mobile &amp; WhatsApp)</span>
                  </a>
                </div>
                <a 
                  href="https://wa.me/919845012345" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-secondary font-bold hover:underline pt-0.5"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>WhatsApp Banquet Coordinator</span>
                </a>
              </div>

              {/* Item 5: Business Email */}
              <div className="space-y-1 pt-2 border-t border-outline-variant/30">
                <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">
                  Official Business Email
                </span>
                <a 
                  href="mailto:orders@tksiyengarscatering.com"
                  className="font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1.5 truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span className="truncate">orders@tksiyengarscatering.com</span>
                </a>
                <p className="text-[10.5px] text-outline">
                  Banquet proposals, pro-forma invoicing &amp; quotations
                </p>
              </div>
            </div>
          </div>

          {/* COLUMN 3: 6. BUSINESS HOURS */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="w-4 h-4 shrink-0 text-primary" />
              <h3 className="font-serif font-bold text-sm sm:text-base tracking-tight text-on-surface">
                Business Hours
              </h3>
            </div>
            
            <div className="space-y-2.5 text-[11.5px] text-on-surface-variant leading-relaxed">
              <div className="p-3 rounded-xl bg-surface border border-outline-variant/40 space-y-1">
                <span className="font-bold text-on-surface block text-xs">
                  Consultation &amp; Booking Desk:
                </span>
                <p className="text-primary font-bold text-xs">
                  Monday – Sunday: 8:00 AM – 9:00 PM IST
                </p>
                <p className="text-[10.5px] text-outline">
                  Open 365 days a year for wedding &amp; event consultations
                </p>
              </div>

              <div className="text-[11px] text-on-surface-variant space-y-0.5 pt-1">
                <p className="font-bold text-secondary flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                  <span>24/7 Early Morning Muhurtham Dispatch</span>
                </p>
                <p className="text-outline text-[10.5px]">
                  Kitchen operational starting 3:30 AM for sacred muhurthams and kalyana mantapa banana leaf service.
                </p>
              </div>
            </div>
          </div>

          {/* COLUMN 4: 8, 9, 10. LEGAL, DIETARY & FOOD SAFETY PAGES */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="w-4 h-4 shrink-0 text-primary" />
              <h3 className="font-serif font-bold text-sm sm:text-base tracking-tight text-on-surface">
                Policy &amp; Food Governance
              </h3>
            </div>
            
            <nav aria-label="Legal, dietary and food safety disclosures" className="space-y-2.5 text-[12px]">
              
              {/* Item 8: Privacy Policy */}
              <div className="group flex items-center justify-between p-2.5 rounded-xl bg-surface/80 hover:bg-surface border border-outline-variant/40 transition-colors">
                <Link
                  to="/privacy-policy"
                  className="font-semibold text-on-surface hover:text-primary flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-secondary group-hover:text-primary shrink-0" />
                  <span>Privacy Policy</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="text-[10.5px] text-primary hover:underline font-bold px-1.5 py-0.5 cursor-pointer"
                  title="Quick preview without leaving page"
                >
                  Quick view
                </button>
              </div>

              {/* Item 9: Food Allergies and Dietary Information */}
              <div className="group flex items-center justify-between p-2.5 rounded-xl bg-surface/80 hover:bg-surface border border-outline-variant/40 transition-colors">
                <Link
                  to="/allergy-dietary-info"
                  className="font-semibold text-on-surface hover:text-primary flex items-center gap-2 transition-colors"
                >
                  <HeartPulse className="w-3.5 h-3.5 text-primary group-hover:text-primary shrink-0" />
                  <span className="leading-snug">Food Allergies &amp; Dietary</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveModal('allergies')}
                  className="text-[10.5px] text-primary hover:underline font-bold px-1.5 py-0.5 cursor-pointer"
                  title="Quick preview without leaving page"
                >
                  Quick view
                </button>
              </div>

              {/* Item 10: Hygiene and Food Safety Information */}
              <div className="group flex items-center justify-between p-2.5 rounded-xl bg-surface/80 hover:bg-surface border border-outline-variant/40 transition-colors">
                <Link
                  to="/food-safety"
                  className="font-semibold text-on-surface hover:text-primary flex items-center gap-2 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-secondary group-hover:text-primary shrink-0" />
                  <span className="leading-snug">Hygiene &amp; Food Safety</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveModal('hygiene')}
                  className="text-[10.5px] text-primary hover:underline font-bold px-1.5 py-0.5 cursor-pointer"
                  title="Quick preview without leaving page"
                >
                  Quick view
                </button>
              </div>

            </nav>
          </div>

        </div>

        {/* ========================================================== */}
        {/* QUICK NAVIGATION BAR                                       */}
        {/* ========================================================== */}
        <div className="pt-6 pb-2 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-outline font-semibold">
            <button 
              type="button" 
              onClick={() => handleScrollTo('tradition')} 
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Sacred Menu Heritage
            </button>
            <button 
              type="button" 
              onClick={() => handleScrollTo('muhurtham')} 
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Muhurtham Packages
            </button>
            <button 
              type="button" 
              onClick={() => handleScrollTo('tradition')} 
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Purity Guarantee
            </button>
            {onTastingModalOpen ? (
              <button 
                type="button" 
                onClick={onTastingModalOpen} 
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Tasting Box Session
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => navigate('/contact')} 
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Tasting Box Session
              </button>
            )}
            <Link 
              to="/enquiries" 
              className="text-secondary hover:text-primary transition-colors font-bold"
            >
              Enquire for Banquets
            </Link>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-outline font-medium">
            <Link to="/admin" className="hover:text-primary hover:underline transition-colors flex items-center gap-1">
              <span>Admin Management Desk</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* ========================================================== */}
        {/* BOTTOM COPYRIGHT & STATUTORY SUMMARY BAR                   */}
        {/* ========================================================== */}
        <div className="pt-6 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-outline font-medium text-center md:text-left">
          
          <div className="space-y-0.5">
            <p>
              © {new Date().getFullYear()} <strong className="text-on-surface">TKS Catering Services Private Limited</strong>. All rights reserved.
            </p>
            <p className="text-[10px] text-outline/80">
              CIN: U55101KA2020PTC138920 • GSTIN: 29ABCDE1234F1Z5 • FSSAI Lic. No: 11223344556677 • Registered in Mysuru, Karnataka, India
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1 text-on-surface font-semibold">
              <Sparkles className="w-3 h-3 text-secondary" />
              <span>100% Pure South Indian Vegetarian</span>
            </span>
            <span className="text-outline/40">•</span>
            <span className="text-on-surface-variant">
              Satvik &amp; Zero Onion/Garlic Traditional Specialists
            </span>
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* QUICK VIEW MODALS (Lets user read without losing page state) */}
      {/* ============================================================ */}
      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-7 bg-surface border border-outline-variant/50">
          
          {/* Modal Content: 8. Privacy Policy */}
          {activeModal === 'privacy' && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/40 text-on-secondary-fixed text-[10px] font-bold w-fit mb-1 border border-secondary/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                  <span>TKS Catering Services Pvt. Ltd. • Legal Desk</span>
                </div>
                <DialogTitle className="font-serif font-bold text-xl text-primary">
                  Privacy Policy &amp; Client Confidentiality
                </DialogTitle>
                <DialogDescription className="text-xs text-outline">
                  Summary of our customer privacy protection, data handling, and confidentiality commitments.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-xs text-on-surface-variant leading-relaxed">
                <p>
                  <strong>Legal Entity:</strong> TKS Catering Services Private Limited (Shop 14, 5th Main Road, Vani Vilas Mohalla, Mysuru 570002, Karnataka, India).
                </p>
                <div className="p-3 rounded-xl bg-secondary-container/20 border border-secondary/30 text-on-surface text-xs">
                  <strong>Strict Non-Disclosure Policy:</strong> We never sell, lease, or share your mobile number, event dates, guest lists, or venue coordinates with banquet brokers, photographers, or third-party telemarketers.
                </div>
                <p>
                  <strong>Data Utilization:</strong> We collect customer phone numbers and occasion preferences solely to prepare kitchen quantities, coordinate venue timings, dispatch catering crew, and generate statutory GST invoices.
                </p>
                <p>
                  <strong>Direct Inquiries:</strong> Email <a href="mailto:orders@tksiyengarscatering.com" className="text-primary font-bold hover:underline">orders@tksiyengarscatering.com</a> or call our desk at <a href="tel:+918212448920" className="font-bold text-on-surface hover:underline">+91 821 244 8920</a>.
                </p>
              </div>

              <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                <Link 
                  to="/privacy-policy" 
                  onClick={() => setActiveModal(null)}
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>Open full privacy policy page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Modal Content: 9. Food Allergies and Dietary Information */}
          {activeModal === 'allergies' && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/40 text-on-secondary-fixed text-[10px] font-bold w-fit mb-1 border border-secondary/30">
                  <HeartPulse className="w-3.5 h-3.5 text-primary" />
                  <span>Consumer Health &amp; Allergen Advisory</span>
                </div>
                <DialogTitle className="font-serif font-bold text-xl text-primary">
                  Food Allergies &amp; Dietary Information
                </DialogTitle>
                <DialogDescription className="text-xs text-outline">
                  Semi-legal advisory regarding ingredients, kitchen allergens, and guest dining safety.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-xs text-on-surface-variant leading-relaxed">
                <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-xs">
                  <strong>100% Pure Satvik Vegetarian:</strong> Strictly zero meat, poultry, seafood, eggs, or animal gelatin on any kitchen premises. Prepared according to sacred Melkote Iyengar traditions with zero onion and zero garlic.
                </div>
                <div className="space-y-1.5">
                  <p className="font-bold text-on-surface">Common Kitchen Ingredients &amp; Allergens:</p>
                  <ul className="list-disc list-inside space-y-1 text-on-surface-variant pl-1">
                    <li><strong>Dairy / Lactose:</strong> High usage of pure cow ghee, fresh cultured curds, cow milk, and dairy butter.</li>
                    <li><strong>Tree Nuts &amp; Peanuts:</strong> Cashews, almonds, and peanuts in festive rice (Puliyogare, Bisi Bele Bath) and traditional sweets (Royal Mysuru Pak, Akki Payasa).</li>
                    <li><strong>Gluten / Wheat:</strong> Present in Poori, Chiroti, Semiya, and Rava preparations.</li>
                    <li><strong>Mustard &amp; Sesame:</strong> Authentic South Indian tadka seasoning includes whole black mustard seeds and til.</li>
                  </ul>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/50 text-on-surface text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-primary inline mr-1.5" />
                  <strong>Host Intimation Notice:</strong> Kindly notify our head desk in writing at least 48 hours prior to your muhurtham regarding any acute guest allergies or customized diabetic meal requirements.
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                <Link 
                  to="/allergy-dietary-info" 
                  onClick={() => setActiveModal(null)}
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>Open full dietary page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Modal Content: 10. Hygiene and Food Safety Information */}
          {activeModal === 'hygiene' && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/40 text-on-secondary-fixed text-[10px] font-bold w-fit mb-1 border border-secondary/30">
                  <Award className="w-3.5 h-3.5 text-secondary" />
                  <span>FSSAI Lic. No: 11223344556677</span>
                </div>
                <DialogTitle className="font-serif font-bold text-xl text-primary">
                  Hygiene &amp; Food Safety Standards
                </DialogTitle>
                <DialogDescription className="text-xs text-outline">
                  Schedule 4 sanitation, water purity certification, and thermal banquet chain protocols.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-xs text-on-surface-variant leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/40">
                    <strong className="block text-primary">5-Stage RO + UV Water</strong>
                    100% purified water used across boiling, sambar prep, and brass davarah filter coffee.
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/40">
                    <strong className="block text-primary">Insulated Thermal Chain</strong>
                    Cooked delicacies transported in sealed thermal stainless steel vessels maintaining &gt;65°C.
                  </div>
                </div>
                <div className="space-y-1 text-on-surface-variant">
                  <p><strong>Catering Staff Sanitation:</strong> Mandatory chef uniforms, hairnets, beard guards, and sanitary nitrile gloves for all leaf-serving staff.</p>
                  <p><strong>Plantain Leaf Sterilization:</strong> Fresh banana dining leaves are washed and steam-treated prior to banquet service.</p>
                  <p><strong>Zero Artificial Additives:</strong> Zero artificial colors, zero synthetic flavor enhancers, and zero MSG (Ajinomoto).</p>
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                <Link 
                  to="/food-safety" 
                  onClick={() => setActiveModal(null)}
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>Open full food safety page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs cursor-pointer"
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
