import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UtensilsCrossed,
  Sparkles,
  PhoneCall,
  CalendarCheck,
  ArrowLeft,
  ChevronRight,
  Compass
} from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#FEFBF6] kolam-pattern text-[#2D1810] font-sans flex flex-col justify-between selection:bg-[#8B0A00] selection:text-white">
      {/* Top Auspicious Announcement Bar */}
      <div className="bg-[#8B0A00] text-amber-100 text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-3">
        <span>Mysuru Traditional Catering Heritage · Prepared Strictly Without Onion &amp; Garlic</span>
        <span className="hidden md:inline opacity-60">·</span>
        <span className="hidden md:inline flex items-center gap-1">
          <PhoneCall className="w-3 h-3 text-amber-300" /> Kitchen Hotline: 0821-2448920
        </span>
      </div>

      {/* Main Header / Brand Navigation */}
      <header className="sticky top-0 z-30 bg-[#FEFBF6]/90 backdrop-blur-md border-b border-[#EADBC8]/60 px-4 sm:px-8 lg:px-12 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group active:scale-95 transition-transform">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHI-38makq7bnnjwZw4_F3jmltSVXDQ2oXZ8jHOVCzaq0G4CEdRBmqBaAp2zrgorYU6J0YoaPQ7k0m8JZb0WDXwyY24a3fFEgM9omfANc9dxVK53HZWe4Rb3ekwUKTCflKH849zSpYcHuiywxhM2oirDzUCxcsPpGsOzZ64rCleYiQu6gUfimYmCuzGRSzZC5a_0he16R1SvkdtJWDyCtPCCiGEv3zUF8XW9ILiRHuL25ZcQ9IP18h"
            alt="TKS Iyengar's Catering Desk"
            className="h-10 sm:h-11 w-auto object-contain shrink-0"
          />
          <div>
            <p className="font-serif font-bold text-base sm:text-lg text-[#8B0A00] leading-none">
              TKS Iyengar&apos;s
            </p>
            <p className="text-[10px] tracking-widest uppercase font-semibold text-[#785A48] mt-0.5">
              Catering Desk · Mysuru
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-white border border-[#EADBC8] text-[#2D1810] text-xs font-bold hover:bg-[#F7EFE2] transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Go Back</span>
        </button>
      </header>

      {/* Hero 404 Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center max-w-4xl mx-auto w-full">
        {/* Decorative Heritage Emblem */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300/80 shadow-md flex items-center justify-center text-[#8B0A00] mx-auto">
            <Compass className="w-12 h-12 stroke-[1.5] animate-pulse" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-black bg-[#8B0A00] text-white shadow-md border border-amber-200">
            404
          </span>
        </div>

        {/* Heading & Respectful Subtexts */}
        <div className="space-y-2 mb-8">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
            Auspicious Path Not Found
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-[#2D1810] tracking-tight">
            This Delicacy Page is Not on the Leaf
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#785A48] max-w-xl mx-auto leading-relaxed mt-2">
            The sacred menu link or banquet record you are seeking has either moved or returned to the central kitchen archives. Please return to our main catering catalogue to continue exploring.
          </p>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left mb-8">
          <Link
            to="/"
            className="p-5 rounded-2xl bg-white border border-[#EADBC8] hover:border-[#8B0A00]/50 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#8B0A00] flex items-center justify-center border border-amber-200 mb-3 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#2D1810] group-hover:text-[#8B0A00] transition-colors">
                Catering Menus
              </h3>
              <p className="text-xs text-[#785A48] mt-1 leading-relaxed">
                Handcrafted sacred dishes for grand muhurthams, upanayanas, and household poojas.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#8B0A00]">
              <span>Explore Menus</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/"
            onClick={() => {
              setTimeout(() => {
                const el = document.getElementById('muhurtham')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            }}
            className="p-5 rounded-2xl bg-white border border-[#EADBC8] hover:border-[#8B0A00]/50 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#8B0A00] flex items-center justify-center border border-amber-200 mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#2D1810] group-hover:text-[#8B0A00] transition-colors">
                Feast Packages
              </h3>
              <p className="text-xs text-[#785A48] mt-1 leading-relaxed">
                Curated royal Mysore Kalyana, Muhurtham breakfast, and Satvik Ayushya spreads.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#8B0A00]">
              <span>View Packages</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/enquiries"
            className="p-5 rounded-2xl bg-white border border-[#EADBC8] hover:border-[#8B0A00]/50 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#8B0A00] flex items-center justify-center border border-amber-200 mb-3 group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#2D1810] group-hover:text-[#8B0A00] transition-colors">
                Banquet Enquiry
              </h3>
              <p className="text-xs text-[#785A48] mt-1 leading-relaxed">
                Check auspicious dates, plate estimation, and request a personalized booking consultation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#8B0A00]">
              <span>Plan an Event</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Kitchen Hotline Support Callout */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-medium text-[#785A48]">
          <PhoneCall className="w-4 h-4 text-[#8B0A00] shrink-0" />
          <span>Need immediate assistance? Speak with our Mysuru Kitchen Desk at</span>
          <a
            href="tel:+918212448920"
            className="font-bold text-[#8B0A00] hover:underline"
          >
            +91 821 244 8920
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EADBC8]/60 py-6 px-4 text-center text-xs text-[#785A48] font-medium">
        <p>TKS Iyengar&apos;s Catering Services · Mysuru Heritage Central Matha Unit · Est. 1965</p>
      </footer>
    </div>
  )
}

export default NotFoundPage
