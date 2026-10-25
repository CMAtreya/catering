import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, ShieldCheck, HeartPulse, Sparkles, Check, Info } from 'lucide-react'
import { CustomerDesktopShell } from '@/components/customer/CustomerDesktopShell'

export const AllergyDietaryPage: React.FC = () => {
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
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                Consumer Health & Advisory
              </span>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-8">
          
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-stone-50/80 border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              <HeartPulse className="w-3.5 h-3.5 text-amber-700" />
              <span>Semi-Legal Consumer Health & Dietary Notice</span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-[var(--brand-900)] tracking-tight">
              Food Allergies & Dietary Information
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium leading-relaxed">
              Culinary Standards & Allergen Transparency • <strong className="text-slate-800">TKS Catering Services Private Limited</strong> • Brand: <strong className="text-slate-800">TKS Iyengars Mysore Catering</strong>
            </p>
          </div>

          {/* Section 1: 100% Pure Vegetarian Assurance */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-800">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h2 className="font-heading font-bold text-base sm:text-lg">
                1. 100% Pure Vegetarian & Satvik Brahmin Heritage
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              TKS Iyengars operates a strictly <strong>100% Pure Vegetarian</strong> facility. Our culinary repertoire adheres strictly to traditional South Indian Iyengar / Vaishnava principles.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-xs text-emerald-950 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Zero Meat, Seafood or Eggs:</strong> No poultry, fish, gelatin, animal lard, or animal-derived rennet are ever permitted within our kitchens.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-xs text-emerald-950 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Satvik (No Onion & No Garlic):</strong> By default, all banquet offerings are formulated entirely without onion and without garlic, suitable for temple rituals and orthodox functions.</span>
              </div>
            </div>
          </section>

          {/* Section 2: Primary Allergen Disclosures Matrix */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-[var(--brand-900)]">
              <Info className="w-5 h-5 text-[var(--brand)]" />
              <h2 className="font-heading font-bold text-base sm:text-lg">
                2. Allergen Disclosures & Culinary Usage Matrix
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Please review the following common allergens utilized in our traditional preparations:
            </p>

            <div className="space-y-3 pt-1">
              {/* Dairy */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                    🥛 Milk & Dairy Products
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Widely Present
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pure A2 cow ghee, fresh unadulterated cow milk, homemade curd/yogurt, butter, and artisanal paneer are foundational to traditional Mysore banquet recipes (including Bisibelebath, Kesari Bath, Rasam, Sambar, and Payasam). <em>Not suitable for strict dairy-allergic or vegan diets without custom arrangement.</em>
                </p>
              </div>

              {/* Tree Nuts & Peanuts */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                    🥜 Tree Nuts & Peanuts (Cashews, Almonds, Pistachios)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Present in Sweets & Garnishes
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ghee-roasted cashew nuts, almond slivers, and peanuts are utilized in sweets (Mysore Pak, Badam Halwa, Dumrot Halwa, Akki Payasam), rice varieties (Puliyogare, Lemon Rice), and banquet kormas.
                </p>
              </div>

              {/* Gluten */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                    🌾 Gluten & Cereals (Wheat, Maida, Rava/Semolina)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold">
                    Dish Specific
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Present in Poori, Chiroti, Rava Kesari Bath, Obbattu / Holige, and savories. Traditional rice-based items (Idli, Akki Roti, Plain Steamed Rice, Kosambari) are naturally wheat-free.
                </p>
              </div>

              {/* Mustard & Sesame */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                    🌱 Mustard Seeds, Sesame & Asafoetida (Hing)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold">
                    Standard Tempering
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Traditional South Indian tadka/tempering incorporates black mustard seeds, curry leaves, and asafoetida (which may contain trace edible starch). Sesame seeds are used in select festive dishes (Ellu Sadam).
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Semi-Legal Cross-Contact Disclaimer */}
          <section className="bg-amber-50/70 rounded-2xl border border-amber-200/90 p-6 sm:p-7 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 text-amber-950">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              <h2 className="font-heading font-bold text-base sm:text-lg">
                3. Semi-Legal Cross-Contact & Liability Advisory
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
              While TKS Catering enforces meticulous kitchen hygiene, separate preparation vessels, and clean food-grade handling equipment, all menu items are produced in a central culinary production environment where dairy, tree nuts, peanuts, sesame, and gluten-containing ingredients are processed.
            </p>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              <strong>Important Notice:</strong> We cannot guarantee an environment 100% free from airborne trace allergens or cross-contact. Individuals suffering from acute or life-threatening anaphylactic food allergies must exercise their own discretion and medical judgment before consuming banquet food.
            </p>
          </section>

          {/* Section 4: Banquet Host Notification Obligation */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5 text-[var(--brand-900)]">
              <ShieldCheck className="w-5 h-5 text-[var(--brand)]" />
              <h2 className="font-heading font-bold text-base sm:text-lg">
                4. Banquet Host & Patron Notification Responsibility
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To ensure the well-being of all attending guests, the booking client (Host) undertakes to:
            </p>
            <ol className="space-y-2 text-xs sm:text-sm text-slate-600 list-decimal list-inside pl-2">
              <li>Inquire with attending family members and guests regarding any severe food allergies prior to the event date.</li>
              <li>Provide written dietary and allergen requests to TKS Catering at least <strong>48 hours prior</strong> to the scheduled muhurtham or banquet meal service.</li>
              <li>Coordinate with our on-site banquet captain to designate segregated plating for guests with certified dietary requirements.</li>
            </ol>
            <div className="pt-2 text-xs text-slate-500">
              For specific dietary inquiries, contact our Master Chef & Diet Desk at <a href="mailto:orders@tksiyengarscatering.com" className="font-semibold text-[var(--brand)] hover:underline">orders@tksiyengarscatering.com</a> or call <a href="tel:+919000000000" className="font-semibold text-slate-700 hover:underline">+91 90000 00000</a>.
            </div>
          </section>

        </main>
      </div>
    </CustomerDesktopShell>
  )
}

export default AllergyDietaryPage
