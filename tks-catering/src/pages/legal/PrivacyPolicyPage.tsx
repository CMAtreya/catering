import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Lock, FileText, CheckCircle2, Mail, Phone, Building2 } from 'lucide-react'
import { CustomerDesktopShell } from '@/components/customer/CustomerDesktopShell'

export const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <CustomerDesktopShell maxWidth="w-full">
      <div className="w-full min-h-screen bg-transparent pb-16">
        
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-20 glass-top-bar px-4 sm:px-6 lg:px-8 py-3.5 border-b border-slate-200/80">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--brand-900)] hover:text-[var(--brand-600)] transition-colors tap-target-48 -ml-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-red-600 stroke-[2.5]" />
              <span>Back</span>
            </button>
            <div className="text-right">
              <span className="text-[11px] font-bold text-[var(--brand)] uppercase tracking-wider">
                Legal & Compliance
              </span>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-8">
          
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-amber-50/80 via-white to-stone-50/80 border border-amber-200/60 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data Protection & Privacy Commitment</span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-[var(--brand-900)] tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium leading-relaxed">
              Effective Date: October 2026 • Legal Entity: <strong className="text-slate-800">TKS Catering Services Private Limited</strong> • Operating as <strong className="text-slate-800">TKS Iyengars Mysore Catering</strong>
            </p>
          </div>

          {/* Section 1: Introduction & Corporate Identity */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5 text-[var(--brand-900)]">
              <Building2 className="w-5 h-5 text-[var(--brand)]" />
              <h2 className="font-heading font-bold text-base sm:text-lg">
                1. Entity & Scope of Policy
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              This Privacy Policy applies to all services provided by <strong>TKS Catering Services Private Limited</strong> (herein referred to as <em>"TKS Catering"</em>, <em>"we"</em>, <em>"us"</em>, or <em>"our"</em>), operating the brand <strong>TKS Iyengars Mysore Catering</strong>. We are committed to safeguarding the privacy and confidential booking information of our banquet patrons, wedding families, and institutional catering clients.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our registered office is located at: <strong>Shop 14, 5th Main Road, Vani Vilas Mohalla, Mysuru, Karnataka 570002, India</strong>, with central kitchen operations at <strong>142/A, Krishnamurthy Puram, Mysuru, Karnataka 570004</strong>.
            </p>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5 text-[var(--brand-900)]">
              <FileText className="w-5 h-5 text-[var(--brand)]" />
              <h2 className="font-heading font-bold text-base sm:text-lg">
                2. Information We Collect
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To prepare banquet quotations, reserve muhurtham kitchen capacity, and dispatch catering teams to wedding halls across Mysuru and Bengaluru, we collect:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc list-inside pl-2">
              <li><strong>Contact Information:</strong> Customer full name, 10-digit mobile number, alternate contact details, and optional email address.</li>
              <li><strong>Event Specifications:</strong> Auspicious event date, meal timing (Morning / Afternoon / Evening), occasion type (e.g., Wedding, Upanayana, Housewarming), and estimated number of dining plates.</li>
              <li><strong>Venue & Delivery Logistics:</strong> Kalyana mantapa, community hall, or private residential address in Mysuru, along with landmark and dispatch timeframes.</li>
              <li><strong>Culinary Customizations & Instructions:</strong> Selected menu dishes, Satvik / strictly no onion-garlic dietary preferences, banana leaf requirements, and specific family recipes.</li>
            </ul>
          </section>

          {/* Section 3: How We Use Your Data */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5 text-[var(--brand-900)]">
              <Lock className="w-5 h-5 text-[var(--brand)]" />
              <h2 className="font-heading font-bold text-base sm:text-lg">
                3. Purpose of Processing & Use of Information
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We process personal information solely for legitimate banquet fulfillment and business operations:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-[var(--brand-900)] block">Banquet Quotations</span>
                Calculating precise per-plate rates, food totals, and sending itemized WhatsApp or PDF estimates.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-[var(--brand-900)] block">Kitchen Procurement</span>
                Procuring authentic fresh ingredients (A2 ghee, vegetables, dairy) scaled precisely for your guest count.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-[var(--brand-900)] block">On-Time Dispatch</span>
                Coordinating hot insulated transport urns and dining hall service supervisors to your banquet mantapa.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-[var(--brand-900)] block">Statutory Compliance</span>
                Generating GST invoices (GSTIN: 29ABCDE1234F1Z5) and fulfilling FSSAI food safety trace records.
              </div>
            </div>
          </section>

          {/* Section 4: Strict Zero Third-Party Advertising Guarantee */}
          <section className="bg-amber-50/70 rounded-2xl border border-amber-200/90 p-6 sm:p-7 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-950">
              <CheckCircle2 className="w-5 h-5 text-amber-700" />
              <h2 className="font-heading font-bold text-base sm:text-lg">
                4. Absolute Non-Disclosure & Advertising Protection
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
              <strong>We never sell, rent, lease, or share your mobile number or event information with external marketing agencies, advertising aggregators, or third-party vendors.</strong> Your personal phone number is strictly used for order confirmation, catering coordination, and invoice delivery by TKS Catering's authorized operations desk.
            </p>
          </section>

          {/* Section 5: Data Security & Retention */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-3.5">
            <h2 className="font-heading font-bold text-base sm:text-lg text-[var(--brand-900)]">
              5. Data Security & Storage
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We employ strict technical and administrative safeguards. Internal admin access to customer phone records and venue addresses is protected with encrypted authentication, session timeouts, and role-based access restrictions. Offline catering records are securely stored on private company servers complying with Indian Information Technology regulations.
            </p>
          </section>

          {/* Section 6: Client Rights & Contact */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
            <h2 className="font-heading font-bold text-base sm:text-lg text-[var(--brand-900)]">
              6. Grievance Officer & Contact Information
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              If you have any questions regarding your data privacy, wish to review past banquet records, or request deletion of your contact history, please reach out to our Privacy & Compliance Officer:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs sm:text-sm">
              <p className="font-bold text-[var(--brand-900)]">Compliance & Legal Desk</p>
              <p className="text-slate-600">TKS Catering Services Private Limited</p>
              <p className="flex items-center gap-2 text-slate-700">
                <Mail className="w-3.5 h-3.5 text-[var(--brand)]" />
                <a href="mailto:orders@tksiyengarscatering.com" className="hover:underline font-semibold">
                  orders@tksiyengarscatering.com
                </a>
              </p>
              <p className="flex items-center gap-2 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <a href="tel:+919000000000" className="hover:underline font-semibold">
                  +91 90000 00000 (Mon–Sun: 8:00 AM – 9:00 PM IST)
                </a>
              </p>
              <p className="text-slate-500 pt-1 text-[11px]">
                Registered Office: Shop 14, 5th Main Road, Vani Vilas Mohalla, Mysuru, Karnataka 570002
              </p>
            </div>
          </section>

        </main>
      </div>
    </CustomerDesktopShell>
  )
}

export default PrivacyPolicyPage
