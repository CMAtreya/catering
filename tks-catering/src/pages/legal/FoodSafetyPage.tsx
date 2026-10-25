import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Droplets, Thermometer, Award, Sparkles, CheckCircle2 } from 'lucide-react'
import { CustomerDesktopShell } from '@/components/customer/CustomerDesktopShell'

export const FoodSafetyPage: React.FC = () => {
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
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                FSSAI Certified Safety
              </span>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-8">
          
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-emerald-50/80 via-white to-stone-50/80 border border-emerald-200/70 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
              <Award className="w-3.5 h-3.5 text-emerald-700" />
              <span>FSSAI License No: 11223344556677</span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-[var(--brand-900)] tracking-tight">
              Hygiene & Food Safety Standards
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium leading-relaxed">
              FSSAI Schedule 4 Compliance • Quality Control Protocols • <strong className="text-slate-800">TKS Catering Services Private Limited</strong> • Operating <strong className="text-slate-800">TKS Iyengars Mysore Catering</strong>
            </p>
          </div>

          {/* Section 1: Statutory Certification & Regulatory Licensing */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="font-heading font-bold text-base sm:text-lg">
                1. Statutory FSSAI License & Schedule 4 Compliance
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              TKS Catering Services Private Limited is officially registered and licensed under the <strong>Food Safety and Standards Authority of India (FSSAI)</strong> under License Number: <strong>11223344556677</strong>.
            </p>
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Certified Pure Vegetarian Central Kitchen & Banquet Operations</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                All preparation facilities, dry spice storehouses, cold holding rooms, and transport vehicles are inspected and maintained strictly compliant with Schedule 4 general sanitary and hygienic practices for food business operators.
              </p>
            </div>
          </section>

          {/* Section 2: Pure Water Infrastructure */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5 text-[var(--brand-900)]">
              <Droplets className="w-5 h-5 text-blue-600" />
              <h2 className="font-heading font-bold text-base sm:text-lg">
                2. Commercial Multi-Stage RO & UV Purified Water
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Water is the lifeblood of authentic South Indian rasam, sambar, and filter coffee. We enforce zero compromise on purity:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc list-inside pl-2">
              <li><strong>100% Commercial RO + UV Purification:</strong> Every liter of water utilized for boiling rice, simmering curries, making dough, and banquet drinking water undergoes 5-stage Reverse Osmosis filtration with UV disinfection.</li>
              <li><strong>Vegetable & Produce Sanitization:</strong> Farm-fresh greens, plantains, beans, and coriander are washed in food-grade ozonized water baths to eliminate surface soils and agricultural residues.</li>
              <li><strong>Steam Cauldron Sterilization:</strong> All large stainless steel boiling cauldrons and brass urulis are steam-sanitized before and after every cooking cycle.</li>
            </ul>
          </section>

          {/* Section 3: Kitchen Staff Health & Personal Hygiene */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5 text-[var(--brand-900)]">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h2 className="font-heading font-bold text-base sm:text-lg">
                3. Staff Health, Attire & Sanitization Protocols
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our culinary team and banquet serving personnel adhere to stringent daily hygiene measures:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-[var(--brand-900)] block">Daily Health Screening</span>
                Daily temperature checks and health logging prior to entering food preparation zones.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-[var(--brand-900)] block">Mandatory Clean Attire</span>
                Sanitized white chef uniforms, surgical hairnets, and beard nets worn at all times.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-[var(--brand-900)] block">Nitrile Glove Plating</span>
                Disposable food-grade powder-free nitrile gloves worn during sweet shaping, packing, and live service.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-[var(--brand-900)] block">Medical Certification</span>
                Annual comprehensive medical fitness examinations conducted by certified medical practitioners.
              </div>
            </div>
          </section>

          {/* Section 4: Hot & Cold Temperature Chain Control */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5 text-[var(--brand-900)]">
              <Thermometer className="w-5 h-5 text-red-600" />
              <h2 className="font-heading font-bold text-base sm:text-lg">
                4. Thermal Chain & Insulated Transport Safety
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Food safety requires keeping hot food hot and cold food cold during transit across kalyana mantapas in Mysuru:
            </p>
            <div className="space-y-2.5 pt-1">
              <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200/70 text-xs text-red-950">
                <strong className="block mb-1 text-red-900 font-bold">Hot Holding Chain (&gt;65°C):</strong>
                Cooked food is transferred directly into heavy-gauge 304 food-grade insulated stainless steel vacuum urns at 75°C+. This ensures meals arrive piping hot at the banquet hall without the need for reheating or nutrient loss.
              </div>
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/70 text-xs text-blue-950">
                <strong className="block mb-1 text-blue-900 font-bold">Cold Preservation Chain (&lt;5°C):</strong>
                Perishable items such as curd, raita, fresh milk sweets, and cut fruit varieties are chilled and transported in temperature-controlled cooler boxes to prevent microbial growth.
              </div>
            </div>
          </section>

          {/* Section 5: Traditional Banana Leaf Sanitation & Zero Artificial Additives */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-3.5">
            <h2 className="font-heading font-bold text-base sm:text-lg text-[var(--brand-900)]">
              5. Authentic Banana Leaf Protocols & Pure Ingredients
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc list-inside pl-2">
              <li><strong>Banana Leaf Protocol:</strong> Fresh, tender plantation plantain leaves are trimmed, steam-washed with purified water, and surface-wiped dry immediately before banquet table layout.</li>
              <li><strong>Zero Synthetic Preservatives:</strong> We strictly prohibit artificial food coloring (including tartrazine or sunset yellow), artificial flavor enhancers (zero MSG / ajinomoto), and chemical shelf-life extenders.</li>
              <li><strong>Pure A2 Ghee & Cold-Pressed Oils:</strong> 100% genuine Agmark cow ghee and cold-pressed groundnut/sesame oils sourced from certified local mills.</li>
            </ul>
          </section>

          {/* Section 6: Inquiries & Verification */}
          <section className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-2 text-xs sm:text-sm text-slate-600">
            <p className="font-bold text-[var(--brand-900)]">
              Quality Assurance & Food Safety Department
            </p>
            <p>
              TKS Catering Services Private Limited • FSSAI Lic. No: <strong>11223344556677</strong>
            </p>
            <p>
              Central Kitchen: 142/A, Krishnamurthy Puram, Mysuru, Karnataka 570004
            </p>
            <p className="text-slate-500 pt-1">
              For kitchen inspection appointments or banquet food safety inquiries, call <a href="tel:+919000000000" className="font-semibold text-slate-800 hover:underline">+91 90000 00000</a> or email <a href="mailto:orders@tksiyengarscatering.com" className="font-semibold text-[var(--brand)] hover:underline">orders@tksiyengarscatering.com</a>.
            </p>
          </section>

        </main>
      </div>
    </CustomerDesktopShell>
  )
}

export default FoodSafetyPage
