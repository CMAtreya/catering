import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Flame, PhoneCall, Leaf, Phone, Calendar, ShoppingBag, UtensilsCrossed } from 'lucide-react'
import { useDraftStore } from '@/store/draftStore'
import { useEnquiryStore } from '@/store/enquiryStore'
import { useBusinessSettingsStore } from '@/store/businessSettingsStore'

export interface CustomerTopNavProps {
  activeNavTab?: 'tradition' | 'menus' | 'muhurtham' | 'enquiry'
  onNavClick?: (tab: 'tradition' | 'menus' | 'muhurtham' | 'enquiry') => void
  onOpenLeafModal?: () => void
  onPlanEvent?: () => void
  showAnnouncement?: boolean
}

export const CustomerTopNav: React.FC<CustomerTopNavProps> = ({
  activeNavTab,
  onNavClick,
  onOpenLeafModal,
  onPlanEvent,
  showAnnouncement = true
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const draftItems = useDraftStore((state) => state.items)
  const selectedCount = Object.keys(draftItems).length
  const enquiriesCount = useEnquiryStore((state) => state.enquiries.length)
  const settings = useBusinessSettingsStore((state) => state.settings)

  // Determine active tab if not explicitly controlled
  const currentTab = React.useMemo(() => {
    if (activeNavTab) return activeNavTab
    if (location.pathname === '/enquiries') return 'enquiry'
    if (location.pathname === '/request') return 'menus'
    if (location.pathname === '/contact' || location.pathname === '/submitted') return 'enquiry'
    if (location.hash === '#tradition') return 'tradition'
    if (location.hash === '#muhurtham') return 'muhurtham'
    return 'menus'
  }, [activeNavTab, location.pathname, location.hash])

  const handleNav = (tab: 'tradition' | 'menus' | 'muhurtham' | 'enquiry') => {
    if (onNavClick) {
      onNavClick(tab)
      return
    }

    if (tab === 'enquiry') {
      navigate('/enquiries')
      return
    }

    if (location.pathname === '/') {
      const element = document.getElementById(tab)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(`/#${tab}`)
    }
  }

  const handlePlanEventBanquet = () => {
    if (onPlanEvent) {
      onPlanEvent()
      return
    }
    navigate('/request')
  }

  const handleBagClick = () => {
    if (selectedCount > 0) {
      navigate('/request')
    } else if (onOpenLeafModal) {
      onOpenLeafModal()
    } else {
      navigate('/#menus')
    }
  }

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT BANNER (Full Page Edge-to-Edge) */}
      {showAnnouncement && (
        <header className="bg-primary text-on-primary py-2 px-3 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 text-xs font-medium tracking-wide border-b border-primary-container/40 w-full overflow-hidden">
          <div className="w-full flex justify-between items-center gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <Flame className="w-4 h-4 text-secondary-container shrink-0" />
              <span className="truncate text-[10px] sm:text-xs">
                Mysuru&apos;s Revered Iyengar Traditional Feasts • Prepared Strictly Without Onion &amp; Garlic
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] text-primary-fixed shrink-0">
              <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="hover:underline flex items-center gap-1 whitespace-nowrap">
                <PhoneCall className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kitchen Hotline:</span>
                <span>{settings.phone}</span>
              </a>
            </div>
          </div>
        </header>
      )}

      {/* 2. STICKY TOP NAVIGATION BAR (Full Page Edge-to-Edge) */}
      <nav className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/15 py-2.5 sm:py-3 px-3 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 w-full shadow-2xs">
        <div className="w-full flex items-center justify-between gap-2">
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0 group cursor-pointer">
            <img 
              alt="TKS Iyengar's Logo" 
              className="h-9 sm:h-10 w-auto object-contain rounded-md shrink-0 transition-transform group-hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6occrKYgf2RCe6-ZpsHHNSwBTZw3OIJCIu6JOOkQR-MmVOIiKZ7bUBYzMU1l09v4a7bX1aa5bfz0MQN5Gh1wPHBVRO7LGbM1E9Bko7oNR5cwbenpCKvUqkdjPSjrtKo9Dv1OlVn0VLfzhNsNmnyXZsER8N1zZKYj1hy1Z5QQB-5nt5D6OCeHk91zan3n3flKIP17cg5vuWoRorqja0dU2rPYG_7kXSD98DR2K5GVG8F_91Jgo9rr6"
            />
            <div className="min-w-0">
              <h1 className="font-headline font-bold text-base sm:text-lg leading-tight text-primary truncate">
                TKS Iyengar&apos;s<br className="hidden xs:inline" />
                <span className="text-[10px] sm:text-xs uppercase font-sans tracking-widest text-on-surface-variant font-semibold ml-1 xs:ml-0">
                  Catering
                </span>
              </h1>
            </div>
          </Link>

          {/* 4 Working Middle Nav Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold">
            {/* 1. Tradition */}
            <button
              type="button"
              onClick={() => handleNav('tradition')}
              className={`pb-1 transition-all cursor-pointer select-none ${
                currentTab === 'tradition'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Tradition
            </button>

            {/* 2. Catering Menus */}
            <button
              type="button"
              onClick={() => handleNav('menus')}
              className={`pb-1 transition-all cursor-pointer select-none ${
                currentTab === 'menus'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Catering Menus
            </button>

            {/* 3. Feast Packages */}
            <button
              type="button"
              onClick={() => handleNav('muhurtham')}
              className={`pb-1 transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                currentTab === 'muhurtham'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Leaf className="w-4 h-4 text-tertiary-container" />
              <span>Feast Packages</span>
            </button>

            {/* 4. Enquiry */}
            <button
              type="button"
              onClick={() => handleNav('enquiry')}
              className={`pb-1 transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                currentTab === 'enquiry'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span>Enquiry</span>
              {enquiriesCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                  {enquiriesCount}
                </span>
              )}
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <a 
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-primary bg-primary-fixed/30 hover:bg-primary-fixed/50 px-3.5 py-1.5 rounded-full transition-colors border border-primary/10" 
              href="tel:+918212448920"
            >
              <Phone className="w-3.5 h-3.5" />
              +91 821 244 8920
            </a>

            {/* Enquiries Button */}
            <button 
              type="button"
              onClick={() => navigate('/enquiries')}
              className="relative p-1.5 sm:p-2 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer" 
              title="My Enquiries"
              aria-label="View previous banquet enquiries"
            >
              <Calendar className="w-5 h-5 text-on-surface" />
              {enquiriesCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>

            {/* Shopping Bag Button */}
            <button 
              type="button"
              onClick={handleBagClick}
              className="relative p-1.5 sm:p-2 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer" 
              title="Selected Items"
              aria-label={`Selected delicacies: ${selectedCount}`}
            >
              <ShoppingBag className="w-5 h-5 text-on-surface" />
              {selectedCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-on-primary rounded-full text-[10px] flex items-center justify-center font-bold">
                  {selectedCount}
                </span>
              )}
            </button>

            {/* Plan Event Banquet Button */}
            <button 
              type="button"
              onClick={handlePlanEventBanquet}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-primary to-[#b30a05] text-on-primary text-xs font-bold px-3.5 sm:px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Plan Event Banquet</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar for 4 Options */}
        <div className="flex md:hidden items-center justify-around border-t border-outline-variant/10 pt-2.5 mt-2.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleNav('tradition')}
            className={`px-2 py-1 ${currentTab === 'tradition' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}
          >
            Tradition
          </button>
          <button
            type="button"
            onClick={() => handleNav('menus')}
            className={`px-2 py-1 ${currentTab === 'menus' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}
          >
            Menus
          </button>
          <button
            type="button"
            onClick={() => handleNav('muhurtham')}
            className={`px-2 py-1 ${currentTab === 'muhurtham' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}
          >
            Packages
          </button>
          <button
            type="button"
            onClick={() => handleNav('enquiry')}
            className={`px-2 py-1 ${currentTab === 'enquiry' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}
          >
            Enquiry {enquiriesCount > 0 ? `(${enquiriesCount})` : ''}
          </button>
        </div>
      </nav>
    </>
  )
}

export default CustomerTopNav
